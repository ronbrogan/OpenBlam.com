using OpenBlam.SiteGenerator.MapInfo;
using OpenH2.Core.Factories;
using OpenH2.Core.Tags;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace MapDetailsGenerator
{
    class Program
    {
        static void Main(string[] args)
        {
            var mapRoot = @"D:\H2vMaps";
            var artifactOut = @"D:\openblam\maps";

            Directory.CreateDirectory(artifactOut);

            var mapPaths = Directory.EnumerateFiles(mapRoot, "*.map");
            var factory = new MapFactory(mapRoot, NullMaterialFactory.Instance);

            foreach (var mapPath in mapPaths)
            {
                var mapName = Path.GetFileNameWithoutExtension(mapPath);
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

                var outPath = Path.Combine(mapOutRoot, "details.json");
                File.WriteAllText(outPath, JsonSerializer.Serialize(deets));

                
            }

        }

        static void WriteImages(BitmapTag bitmap, string outPath)
        {
            
            var writePath = Path.Combine(outPath);
            var writeName = "full.dds";

            if (Directory.Exists(writePath) == false)
            {
                Directory.CreateDirectory(writePath);
            }

            Console.WriteLine($"Writing {writeName} to {writePath}");

            // Decompress and synthesize texture headers
            for (var i = 0; i < bitmap.TextureInfos[0].LevelsOfDetail.Length; i++)
            {
                var lod = bitmap.TextureInfos[0].LevelsOfDetail[i];

                if (lod.Data.IsEmpty)
                    continue;

                var ms = File.OpenWrite(Path.Combine(writePath, writeName));

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
        }
    }
}
