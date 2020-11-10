using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenBlam.SiteGenerator.MapInfo
{
    public record MapSummary
    (
        string Name,
        string Scenario,
        int TagCount,
        WeaponInfo[] Weapons
    );

    public record WeaponInfo(string tag);
}
