using OpenH2.Core.Scripting;
using System.Collections.Generic;

namespace OpenBlam.SiteGenerator.MapInfo
{
    public class ScriptingInfo
    {
        public List<ScriptMethod> Methods { get; set; }
    }

    public record ScriptMethod(string Name, Lifecycle Lifecycle);
}
