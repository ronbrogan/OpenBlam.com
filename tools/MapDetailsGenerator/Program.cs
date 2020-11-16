using OpenBlam.SiteGenerator.MapInfo;
using OpenH2.Core.Factories;
using OpenH2.Core.Tags;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Numerics;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace MapDetailsGenerator
{
    class Program
    {
        const int ThumbnailSize = 100;

        static JsonSerializerOptions SerializerOptions = new JsonSerializerOptions()
        {
            WriteIndented = true
        };

        static void Main(string[] args)
        {
            SetupSerializer();

            var mapRoot = @"D:\H2vMaps";
            var artifactOut = @"D:\openblam\maps";

            if(args.Length == 2 && Directory.Exists(args[0]))
            {
                mapRoot = args[0];
                artifactOut = args[1];
            }

            Directory.CreateDirectory(artifactOut);
            var entries = new List<MapManifestEntry>();

            var mapPaths = Directory.EnumerateFiles(mapRoot, "*.map");
            var factory = new MapFactory(mapRoot, NullMaterialFactory.Instance);

            foreach (var mapPath in mapPaths)
            {
                var mapName = Path.GetFileNameWithoutExtension(mapPath);
                Console.WriteLine($"Processing {mapName}");
                var map = factory.FromFile(File.OpenRead(mapPath));
                var mapOutRoot = Path.Combine(artifactOut, mapName);
                Directory.CreateDirectory(mapOutRoot);

                var weapons = new List<WeaponInfo>();
                foreach(var weapPlacement in map.Scenario.WeaponPlacements)
                {
                    if (weapPlacement.Index == ushort.MaxValue)
                        continue; 

                    var weapDef = map.Scenario.WeaponDefinitions[weapPlacement.Index];
                    var weap = map.GetTag(weapDef.Weapon);
                    weapons.Add(new WeaponInfo(
                        weap.Name, 
                        weapPlacement.Position, 
                        !weapPlacement.PlacementFlags.HasFlag(OpenH2.Core.Enums.PlacementFlags.NotAutomatically)));
                }

                var deets = new MapSummary(
                    mapName, 
                    null, 
                    map.Header.ScenarioPath, 
                    map.IndexHeader.TagIndexCount, 
                    weapons);

                var info = map.Scenario.LevelInfos[0];

                if (info.CampaignInfos.Length > 0)
                {
                    var mapImage = map.GetTag(info.CampaignInfos[0].BitmapRef);
                    WriteImages(mapImage, mapOutRoot);
                    deets = deets with
                    {
                        Name = info.CampaignInfos[0].EnglishName,
                        Description = info.CampaignInfos[0].EnglishDescription
                    };
                }
                else if (info.MultiplayerInfos.Length > 0)
                {
                    var mapImage = map.GetTag(info.MultiplayerInfos[0].BitmapRef);
                    WriteImages(mapImage, mapOutRoot);
                    deets = deets with
                    {
                        Name = info.MultiplayerInfos[0].EnglishName,
                        Description = info.MultiplayerInfos[0].EnglishDescription
                    };
                }
                else
                {
                    // todo
                }

                File.WriteAllText(Path.Combine(mapOutRoot, "details.json"), 
                    JsonSerializer.Serialize(deets, SerializerOptions));

                entries.Add(new MapManifestEntry(mapName, deets.Name));
            }

            File.WriteAllText(Path.Combine(artifactOut, "maps.json"),
                JsonSerializer.Serialize(new MapManifest(entries), SerializerOptions));
        }

        static void WriteImages(BitmapTag bitmap, string outPath)
        {
            var ms = new MemoryStream();

            for (var i = 0; i < bitmap.TextureInfos[0].LevelsOfDetail.Length; i++)
            {
                var lod = bitmap.TextureInfos[0].LevelsOfDetail[i];

                if (lod.Data.IsEmpty)
                    continue;

                var ddsHeader = new DdsHeader(
                    bitmap.TextureInfos[0].Format,
                    bitmap.TextureType,
                    bitmap.TextureInfos[0].Width,
                    bitmap.TextureInfos[0].Height,
                    bitmap.TextureInfos[0].Depth,
                    bitmap.MipMapCount,
                    null,
                    null);

                ddsHeader.HeaderData.CopyTo(ms);

                ms.Write(lod.Data.ToArray(), 0, lod.Data.Length);
            }

            ms.Position = 0;
            using var image = Pfim.Dds.Create(ms, new Pfim.PfimConfig());

            using Image imsImage = image.Format switch
            {
                Pfim.ImageFormat.Rgb24 => Image.LoadPixelData<Bgr24>(image.Data, image.Width, image.Height),
                Pfim.ImageFormat.Rgba32 => Image.LoadPixelData<Bgra32>(image.Data, image.Width, image.Height),
                _ => throw new NotSupportedException()
            };

            // UI images aren't fully opaque, making it so
            imsImage.Mutate(x => x.ProcessPixelRowsAsVector4((Span<Vector4> span) =>
            {
                for(var i = 0; i < span.Length; i++)
                {
                    if(span[i].W > 0f)
                    {
                        span[i].W = 1f;
                    }
                }
            }));
            imsImage.SaveAsPng(Path.Combine(outPath, "full.png"));

            imsImage.Mutate(x => x.Resize(ThumbnailSize, ThumbnailSize));
            imsImage.SaveAsPng(Path.Combine(outPath, "thumbnail.png"));
        }

        static void SetupSerializer()
        {
            SerializerOptions.Converters.Add(new Vector3Converter());
        }
    }

    public class Vector3Converter : JsonConverter<Vector3>
    {
        public override bool CanConvert(Type typeToConvert) => typeToConvert == typeof(Vector3);

        public override Vector3 Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) => throw new NotImplementedException();

        public override void Write(Utf8JsonWriter writer, Vector3 value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(string.Format("[{0}, {1}, {2}]", value.X, value.Y, value.Z));
        }
    }
}
