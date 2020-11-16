import React from 'react';
import { NavLink, withRouter, Switch, Route, RouteComponentProps } from 'react-router-dom';
import MapDetails from './MapDetails/MapDetails';
import { MapManifest } from './MapData';
import MapListEntry from './MapListEntry/MapListEntry'

interface MapListState
{
    manifest: MapManifest;
}

export class MapList extends React.Component<RouteComponentProps, MapListState, any> {
    static manifest: MapManifest;
    
    constructor(props: any) {
        super(props);
        this.state = {} as MapListState;
    }

    async componentDidMount() {
        if(MapList.manifest == undefined)
        {
            const resp = await fetch("/data/maps/maps.json");
            MapList.manifest = (await resp.json()) as MapManifest;
            this.setState({manifest: MapList.manifest});
        }
        else
        {
            this.setState({manifest: MapList.manifest});
        }
    }

    getMapListing() {
        return (
            <section>
                {this.state.manifest.maps.map(m => {
                    return (<MapListEntry key={m.name} mapManifest={m}></MapListEntry>)
                })}
            </section>
        )
    }

    render() {
        let path = this.props.match.path;
        return (
            <Switch>
                <Route exact path={path}>
                <h1>Maps</h1>
                    {(this.state.manifest == undefined
                        ? (<span>Loading</span>)
                        : this.getMapListing()
                    )}
                </Route>
                <Route path={`${path}/:mapName`}>
                    <MapDetails></MapDetails>
                </Route>
            </Switch>
        );
    }
}

export default withRouter(MapList);