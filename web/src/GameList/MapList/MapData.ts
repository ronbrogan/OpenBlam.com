export interface GamesManifest 
{
    games: GameManifestEntry[];
}

export interface GameManifestEntry
{
    title: string;
    gameIdentifier: string;
}

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

export interface MapContent 
{
    mechanics: MapMechanic[];
}

export interface MapMechanic
{
    title: string,
    stub: string,
    contentPath: string,
    content: string
}