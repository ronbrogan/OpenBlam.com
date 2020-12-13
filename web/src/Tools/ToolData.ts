import { UserAvatarProperties } from '../Core/UserAvatar'

export interface ToolsManifest {
    tools: ToolsManifestEntry[];
}

export interface ToolsManifestEntry {
    name: string,
    thumb: string,
    location: string,
    description: string,
    sourceLocation: string,
    contributors: UserAvatarProperties[]
}