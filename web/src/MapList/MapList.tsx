import React from 'react';
import { NavLink, withRouter, Switch, Route, RouteComponentProps } from 'react-router-dom';
import MapDetails from './MapDetails/MapDetails';
import { MapManifest } from './MapData';

interface MapListState
{
    manifest: MapManifest;
}

export class MapList extends React.Component<any, MapListState, any> {
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
            <table>
                <tbody>
                    {this.state.manifest.maps.map(m => {
                        return (<tr key={m.name}><td><NavLink to={`/maps/${m.name}`}>{m.displayName}</NavLink></td></tr>)
                    })}
                </tbody>
            </table>
        )
    }

    getMapDetails() {
        let name = this.props.match.params.mapName;
        console.log(name);
        return (<h1>{name} info</h1>)
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