using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace Microsoft.SourceBrowser.HtmlGenerator
{
    public partial class ProjectGenerator
    {
        /// <summary>
        /// Since the only requirement on the ID strings we use in the A.html file
        /// is that there are no collisions (and even if there are, the failure
        /// would be rare and impact would be limited), we don't really need 16
        /// bytes per ID. Let's just store the first 8 bytes (I've actually calculated
        /// using MinimalUniquenessPreservingPrefixLength that 7 bytes are sufficient
        /// but let's add another byte to reduce the probability of future collisions)
        /// </summary>
        public static int SignificantIdBytes = 8;

        public static void GenerateRedirectFile(
            string solutionDestinationFolder,
            string projectDestinationFolder,
            Dictionary<string, IEnumerable<string>> symbolIDToListOfLocationsMap,
            string prefix = "")
        {
            var fileName = Path.Combine(projectDestinationFolder, Constants.IDResolvingFileName + prefix + ".html");

            using (var writer = new StreamWriter(fileName, append: true, encoding: Encoding.UTF8))
            {
                

                if (prefix?.Length == 0)
                {
                    Markup.WriteMetadataToSourceRedirectPrefix(writer);
                    writer.WriteLine("redirectToNextLevelRedirectFile();");

                    var maps = SplitByFirstLetter(symbolIDToListOfLocationsMap);
                    foreach (var map in maps)
                    {
                        GenerateRedirectFile(
                            solutionDestinationFolder,
                            projectDestinationFolder,
                            map.Value,
                            map.Key.ToString());
                    }
                    Markup.WriteMetadataToSourceRedirectSuffix(writer);
                }
                else
                {
                    WriteMapping(
                        writer,
                        solutionDestinationFolder,
                        projectDestinationFolder,
                        symbolIDToListOfLocationsMap);
                }

                
            }
        }

        public static Dictionary<char, Dictionary<string, IEnumerable<string>>> SplitByFirstLetter(
            Dictionary<string, IEnumerable<string>> symbolIDToListOfLocationsMap)
        {
            var result = new Dictionary<char, Dictionary<string, IEnumerable<string>>>();

            foreach (var kvp in symbolIDToListOfLocationsMap)
            {
                var key = kvp.Key;
                var values = kvp.Value;

                if (!result.TryGetValue(key[0], out Dictionary<string, IEnumerable<string>> bucket))
                {
                    bucket = new Dictionary<string, IEnumerable<string>>();
                    result.Add(key[0], bucket);
                }

                bucket.Add(key, values);
            }

            return result;
        }

        private static void WriteMapping(
            StreamWriter writer,
            string solutionDestinationFolder,
            string projectDestinationFolder,
            Dictionary<string, IEnumerable<string>> symbolIDToListOfLocationsMap)
        {
            var files = ExtractFilePaths(symbolIDToListOfLocationsMap);
            var fileIndexLookup = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            writer.WriteLine("(function(){");

            writer.WriteLine("var f = [");
            for (int i = 0; i < files.Length; i++)
            {
                fileIndexLookup.Add(files[i], i);
                writer.WriteLine($@"""{Path.GetFileName(projectDestinationFolder)}/{files[i]}"",");
            }

            writer.WriteLine("];");

            writer.WriteLine("var m = new Object();");

            foreach (var kvp in symbolIDToListOfLocationsMap.OrderBy(kvp => kvp.Key))
            {
                string shortenedKey = GetShortenedKey(kvp.Key);
                var filePaths = kvp.Value;

                if (filePaths.Count() == 1)
                {
                    var value = filePaths.First();
                    writer.WriteLine("m[\"" + shortenedKey + "\"]=f[" + fileIndexLookup[value].ToString() + "];");
                }
                else
                {
                    writer.WriteLine("m[\"" + shortenedKey + "\"]=\"" + Constants.PartialResolvingFileName + "/" + kvp.Key + "\";");
                    Markup.GeneratePartialTypeDisambiguationFile(
                        solutionDestinationFolder,
                        projectDestinationFolder,
                        kvp.Key,
                        filePaths);
                }
            }

            writer.WriteLine("return {{map: m, bytes: {0} }};", SignificantIdBytes);
            writer.WriteLine("})();");
        }

        private static string GetShortenedKey(string key)
        {
            var shortenedKey = key;
            if (shortenedKey.Length > SignificantIdBytes)
            {
                shortenedKey = shortenedKey.Substring(0, SignificantIdBytes);
            }

            // all the keys in this file start with the same prefix, no need to include it
            shortenedKey = shortenedKey.Substring(1);
            return shortenedKey;
        }

        private static string[] ExtractFilePaths(Dictionary<string, IEnumerable<string>> symbolIDToListOfLocationsMap)
        {
            var files = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var kvp in symbolIDToListOfLocationsMap)
            {
                files.UnionWith(kvp.Value);
            }

            var array = files.ToArray();
            Array.Sort(array);

            return array;
        }
    }
}
