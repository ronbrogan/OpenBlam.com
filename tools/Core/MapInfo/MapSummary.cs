using System.Collections.Generic;
using System.Numerics;

namespace OpenBlam.SiteGenerator.MapInfo
{
    public record MapManifest(IEnumerable<MapManifestEntry> maps);
    public record MapManifestEntry(string name, string displayName);

    public record MapSummary
    (
        string Name,
        string Description,
        string Scenario,
        int TagCount,
        IEnumerable<WeaponInfo> Weapons
    );

    public record WeaponInfo(string tag, Vector3 position, bool byDefault);
}
