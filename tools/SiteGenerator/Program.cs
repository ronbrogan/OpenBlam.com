using DeepSpeechClient.Interfaces;
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using NAudio.Wave;
using OpenH2.Core.ExternalFormats;
using OpenH2.Core.Factories;
using OpenH2.Core.Maps;
using OpenH2.Core.Tags;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;
using System.Threading.Tasks;

namespace OpenBlam.SiteGenerator
{
    public class LineInfo
    {
        public string LineName { get; set; }
        public string TagName { get; set; }
        public string Text { get; set; }
        public int ClipIndex { get; set; }
    }

    class Program
    {
        private static IDeepSpeech model/* = new DeepSpeechClient.DeepSpeech("deepspeech-0.9.1-models.pbmm")*/;
        private static ConcurrentDictionary<long, string> resolved = new ConcurrentDictionary<long, string>();

        static async Task Main(string[] args)
        {
            //model.EnableExternalScorer("deepspeech-0.9.1-models.scorer");
            //model.SetScorerAlphaBeta(0.931289039105002f, 1.1834137581510284f);

            var factory = new MapFactory(@"D:\H2vMaps", NullMaterialFactory.Instance);

            var mapPaths = Directory.EnumerateFiles(@"D:\H2vMaps", "*.map");

            foreach(var mapPath in mapPaths)
            {
                if (mapPath.Contains("00a") || mapPath.Contains("01a"))
                {
                    continue;
                }

                var map = factory.FromFile(File.OpenRead(mapPath));
                var soundMapping = map.GetTag(map.Globals.SoundInfos[0].SoundMap);
                var lines = new List<LineInfo>();

                if (map.Scenario.MissionDialogMapping.Length > 0)
                {
                    var dialog = map.GetTag(map.Scenario.MissionDialogMapping[0].MdlgRef);
                    foreach (var line in dialog.DiaglogLines)
                    {
                        foreach (var soundInfo in line.SoundTags)
                        {
                            var snd = map.GetTag(soundInfo.Sound);
                            foreach (var (index, text) in ProcessSoundTag(map, soundMapping, snd))
                            {
                                lines.Add(new LineInfo()
                                {
                                    TagName = snd.Name,
                                    LineName = $"{line.Name}/{soundInfo.Name}",
                                    ClipIndex = index,
                                    Text = text
                                });
                            }
                        }
                    }
                }

                var snds = map.GetLocalTagsOfType<SoundTag>();
                foreach (var snd in snds)
                {
                    if (snd.Name.Contains("dialog") == false)
                    {
                        continue;
                    }

                    foreach (var (index, text) in ProcessSoundTag(map, soundMapping, snd))
                    {
                        lines.Add(new LineInfo()
                        {
                            TagName = snd.Name,
                            LineName = "N/A",
                            ClipIndex = index,
                            Text = text
                        });
                    }
                }

                File.WriteAllText(@$"D:\maptts\{Path.GetFileNameWithoutExtension(mapPath)}.json",
                    JsonSerializer.Serialize(new { Lines = lines }, new JsonSerializerOptions()
                    {
                        WriteIndented = true
                    }));
            }

            Console.ReadLine();
        }

        public static IEnumerable<(int, string)> ProcessSoundTag(H2vMap map, SoundMappingTag soundMapping, SoundTag snd)
        {
            var clips = GetClips(map, soundMapping, snd);
            var results = new ConcurrentBag<(int, string)>();
            Parallel.ForEach(clips, clip =>
            {
                if (clip.Encoding != AudioEncoding.MonoImaAdpcm && clip.Encoding == AudioEncoding.StereoImaAdpcm)
                {
                    // not usable
                    return;
                }

                var text = DoAzureSpeechRecog(clip);
                Console.WriteLine($"{snd.Name}/{clip.Index}: {text}");
                results.Add((clip.Index, text));
            });

            return results;
        }

        public static string DoDeepSpeechRecog(byte[] raw, bool stereo)
        {
            var pcm = ImaAdpcmAudio.Decode(stereo, raw);
            var bytes = MemoryMarshal.Cast<short, byte>(pcm.AsSpan());
            var src = new RawSourceWaveStream(new MemoryStream(bytes.ToArray()), new WaveFormat(44100, 16, stereo ? 2 : 1));

            var outFormat = new WaveFormat(16000, 16, 1);
            using (var pcmStream = new MemoryStream())
            using (var resampler = new MediaFoundationResampler(src, outFormat))
            {
                resampler.ResamplerQuality = 60;
                var buf = new byte[4096];
                var read = 0;

                do
                {
                    read = resampler.Read(buf, 0, buf.Length);
                    pcmStream.Write(buf, 0, read);
                }
                while (read != 0);

                pcmStream.Position = 0;

                var samples = MemoryMarshal.Cast<byte, short>(pcmStream.ToArray().AsSpan());

                var text = model.SpeechToText(samples.ToArray(), (uint)samples.Length);
                return text;
            }
        }

        private static SpeechConfig speechConfig = SpeechConfig.FromSubscription(Environment.GetEnvironmentVariable("azSpeechKey", EnvironmentVariableTarget.Process), "eastus");

        public static string DoAzureSpeechRecog(ClipData clip)
        {
            var sr = clip.SampleRate switch
            {
                SampleRate.hz44k1 => 44100,
                SampleRate.hz22k05 => 22050,
                _ => 44100
            };

            var stereo = clip.Encoding == AudioEncoding.StereoImaAdpcm;
            var pcm = ImaAdpcmAudio.Decode(stereo, clip.Data);
            var bytes = MemoryMarshal.Cast<short, byte>(pcm.AsSpan()).ToArray();

            var hash = BytesHash(bytes);
            if(resolved.TryGetValue(hash, out var str))
            {
                return str;
            }

            using var stream = AudioInputStream.CreatePushStream(AudioStreamFormat.GetWaveFormatPCM((uint)sr, 16, stereo ? 2 : 1));
            //stream.SetProperty(PropertyId.SpeechServiceResponse_ProfanityOption, "raw");
            using var audioConfig = AudioConfig.FromStreamInput(stream);
            audioConfig.SetProperty(PropertyId.SpeechServiceResponse_ProfanityOption, "raw");
            using var recognizer = new SpeechRecognizer(speechConfig, audioConfig);
            recognizer.Properties.SetProperty(PropertyId.SpeechServiceResponse_ProfanityOption, "raw");

            stream.Write(bytes);
            stream.Write(Array.Empty<byte>());

            var result = recognizer.RecognizeOnceAsync().Result;

            if (result.Reason == ResultReason.RecognizedSpeech)
            {
                resolved[hash] = result.Text;
                return result.Text;
            }

            return null;
        }

        private static List<ClipData> GetClips(H2vMap scene, SoundMappingTag soundMapping, SoundTag snd)
        {
            var soundEntry = soundMapping.SoundEntries[snd.SoundEntryIndex];

            var clips = new List<ClipData>();
            for (var i = 0; i < soundEntry.NamedSoundClipCount; i++)
            {
                var clipInfo = soundMapping.NamedSoundClips[soundEntry.NamedSoundClipIndex + i];

                var result = new ClipData();
                result.Index = i;

                result.Encoding = snd.Encoding switch
                {
                    EncodingType.ImaAdpcmMono => AudioEncoding.MonoImaAdpcm,
                    EncodingType.ImaAdpcmStereo => AudioEncoding.StereoImaAdpcm,
                    _ => AudioEncoding.Mono16,
                };

                result.SampleRate = snd.SampleRate;

                var clipSize = 0;

                for (var c = 0; c < clipInfo.SoundDataChunkCount; c++)
                {
                    var chunk = soundMapping.SoundDataChunks[clipInfo.SoundDataChunkIndex + c];
                    clipSize += (int)(chunk.Length & 0x3FFFFFFF);
                }

                Span<byte> clipData = new byte[clipSize];
                var clipDataCurrent = 0;

                for (var c = 0; c < clipInfo.SoundDataChunkCount; c++)
                {
                    var chunk = soundMapping.SoundDataChunks[clipInfo.SoundDataChunkIndex + c];

                    var len = (int)(chunk.Length & 0x3FFFFFFF);
                    var chunkData = scene.ReadData(chunk.Offset.Location, chunk.Offset, len);

                    chunkData.Span.CopyTo(clipData.Slice(clipDataCurrent));
                    clipDataCurrent += len;
                }

                result.Data = clipData.ToArray();
                clips.Add(result);
            }

            return clips;
        }

        private static long BytesHash(byte[] bytes)
        {
            long hash = 0;
            var i = 0;

            for (; i < bytes.Length % 8; i += 8)
            {
                hash ^= BitConverter.ToInt64(bytes, i);
            }

            for (; i < bytes.Length; i++)
            {
                hash ^= bytes[i];
            }

            return hash;
        }
    }

    public struct ClipData
    {
        public int Index;
        public AudioEncoding Encoding;
        public SampleRate SampleRate;
        public byte[] Data;
    }

    public enum AudioEncoding
    {
        Mono16,
        MonoImaAdpcm,
        StereoImaAdpcm,
    }
}
