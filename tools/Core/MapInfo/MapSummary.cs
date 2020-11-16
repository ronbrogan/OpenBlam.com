using System.Collections.Generic;
using System.Numerics;

namespace OpenBlam.SiteGenerator.MapInfo
{
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
