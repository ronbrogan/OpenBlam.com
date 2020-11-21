import React from 'react';
import { NavLink, withRouter, Switch, Route, RouteComponentProps } from 'react-router-dom';
import MapDetails from './MapDetails/MapDetails';
import { MapManifest } from './MapData';
import MapListEntry from './MapListEntry/MapListEntry';
import './MapList.scss';

interface MapListProps
{
    gameIdentifier: string;
}

interface MapListState
{
    manifest: MapManifest;
}

export class MapList extends React.Component<RouteComponentProps<MapListProps>, MapListState, any> {
    static manifest: MapManifest;

    constructor(props: RouteComponentProps<MapListProps>) {
        super(props);
        this.state = {} as MapListState;
    }

    async componentDidMount() {
        if(MapList.manifest == undefined)
        {
            const resp = await fetch(`/data/maps/h2v/maps.json`);
            MapList.manifest = (await resp.json()) as MapManifest;
            this.setState({"manifest": MapList.manifest});
        }
        else
        {
            this.setState({"manifest": MapList.manifest});
        }
    }

    getMapListing() {
        return (
            <section className="map-list">
                {this.state.manifest.maps.map(m => {
                    return (<MapListEntry key={m.name} gameIdentifier={this.props.match.params.gameIdentifier} mapManifest={m}></MapListEntry>)
                })}
            </section>
        )
    }

    render() {
        let path = this.props.match.path;
        return (
            <Switch>
                <Route exact path={`/maps/:gameIdentifier`}>
                    <h1>Maps</h1>
                        {(this.state.manifest == undefined
                            ? (<span>Loading</span>)
                            : this.getMapListing()
                        )}
                </Route>
                <Route path={`/maps/:gameIdentifier/:mapName`}>
                    <MapDetails></MapDetails>
                </Route>
            </Switch>
        );
    }
}

export default withRouter(MapList);