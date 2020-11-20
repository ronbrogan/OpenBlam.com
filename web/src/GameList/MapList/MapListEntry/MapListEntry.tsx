import React from 'react';
import { NavLink } from 'react-router-dom';
import { MapManifestEntry } from '../MapData';
import './MapListEntry.scss';

interface MapListEntryProps
{
    mapManifest: MapManifestEntry;
    gameIdentifier: string;
}

export default class MapListEntry extends React.Component<MapListEntryProps, any, any>{

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
        <div className="mapListEntry">
            <NavLink to={`/maps/${this.props.gameIdentifier}/${this.props.mapManifest.name}`} className="thumbnail">
                <img alt={`${this.props.mapManifest.name} menu image`} src={`/data/maps/${this.props.gameIdentifier}/${this.props.mapManifest.name}/thumbnail.png`} />
            </NavLink>
            <div className="title">
                <NavLink to={`/maps/${this.props.gameIdentifier}/${this.props.mapManifest.name}`}>{this.props.mapManifest.displayName}</NavLink>
            </div>
            
        </div>);
    }
}