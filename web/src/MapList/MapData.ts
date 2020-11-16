export interface MapManifest
{
    maps: MapManifestEntry[];
}

export interface MapManifestEntry
{
    name: string;
    displayName: string;
}

export interface MapSummary
{
    Name: string;
    Description: string;
    Scenario: string;
    TagCount: number;
    Weapons: WeaponInfo[];
}

export interface WeaponInfo
{
    tag: string;
    position: number[];
    byDefault: boolean;
}