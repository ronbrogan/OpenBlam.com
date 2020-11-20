import React from 'react';
import { Route, RouteComponentProps, withRouter } from 'react-router-dom';
import { MapSummary } from '../MapData';
import './MapDetails.scss';

interface MapDetailProps {
    gameIdentifier: string;
    mapName: string;
}

interface MapDetailState {
    mapData: MapSummary;
}

export class MapDetails extends React.Component<RouteComponentProps<MapDetailProps>, MapDetailState, any>{
    static detailCache: { [key: string]: MapSummary } = {};

    mapName: string = "";
    gameIdentifier: string = "";

    constructor(props: any) {
        super(props);
        this.state = {} as MapDetailState;
    }

    async componentDidMount() {
        this.gameIdentifier = this.props.match.params.gameIdentifier;
        this.mapName = this.props.match.params.mapName;
        if (MapDetails.detailCache[this.mapName] == undefined) {
            const resp = await fetch(`/data/maps/${this.gameIdentifier}/${this.mapName}/details.json`);
            MapDetails.detailCache[this.mapName] = (await resp.json()) as MapSummary;
            this.setState({ mapData: MapDetails.detailCache[this.mapName] });
        }
        else {
            this.setState({ mapData: MapDetails.detailCache[this.mapName] });
        }
    }

    getMainSection() {
        return (
            <section className="main">
                <h1>{this.state.mapData.Name}</h1>
                <h4>{this.state.mapData.Description}</h4>
            </section>
        );
    }

    getMetadata() {
        return (
            <div className="metadata">
                <a href={`/data/maps/${this.gameIdentifier}/${this.mapName}/full.png`}><img className="ui-image" src={`/data/maps/${this.gameIdentifier}/${this.mapName}/full.png`} /></a>
                <div><strong>Name: </strong>{this.state.mapData.Name}</div>
                <div><strong>Description: </strong>{this.state.mapData.Description}</div>
                <div><strong>Scenario: </strong>{this.state.mapData.Scenario}</div>
                <div><strong>Tags: </strong>{this.state.mapData.TagCount}</div>
            </div>
        );
    }

    getWeapons() {
        return (
            <section className="weaponList">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Fusce ut placerat orci nulla pellentesque dignissim. Eros in cursus turpis massa tincidunt dui ut ornare. Nullam non nisi est sit. Cras semper auctor neque vitae tempus quam pellentesque nec nam. Diam sit amet nisl suscipit adipiscing bibendum est ultricies integer. Vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi. Imperdiet massa tincidunt nunc pulvinar sapien et. Adipiscing commodo elit at imperdiet dui. Mauris nunc congue nisi vitae suscipit tellus mauris a diam. Metus vulputate eu scelerisque felis imperdiet. Mi in nulla posuere sollicitudin aliquam ultrices sagittis.

Iaculis at erat pellentesque adipiscing. At in tellus integer feugiat scelerisque varius morbi enim nunc. Proin fermentum leo vel orci porta. In egestas erat imperdiet sed euismod nisi porta lorem. Semper eget duis at tellus. Sit amet massa vitae tortor condimentum lacinia quis vel eros. Penatibus et magnis dis parturient montes nascetur ridiculus mus mauris. Ut diam quam nulla porttitor massa id neque aliquam. Tortor posuere ac ut consequat semper viverra nam libero. Faucibus interdum posuere lorem ipsum dolor sit. Nascetur ridiculus mus mauris vitae.

Nullam vehicula ipsum a arcu cursus vitae congue. Et netus et malesuada fames. Ornare arcu odio ut sem nulla pharetra diam sit. Eget duis at tellus at urna condimentum mattis. Sit amet porttitor eget dolor morbi non arcu risus. Fermentum et sollicitudin ac orci phasellus egestas tellus rutrum. Integer feugiat scelerisque varius morbi enim. Vestibulum sed arcu non odio euismod. In aliquam sem fringilla ut morbi tincidunt augue. Urna nec tincidunt praesent semper feugiat nibh. Aliquam sem fringilla ut morbi tincidunt augue interdum velit. Ultrices dui sapien eget mi proin sed libero enim sed. Donec adipiscing tristique risus nec. Ac tortor vitae purus faucibus ornare suspendisse sed nisi. Egestas pretium aenean pharetra magna ac. Morbi enim nunc faucibus a pellentesque sit amet porttitor eget. Nam aliquam sem et tortor consequat id porta nibh venenatis. Fermentum iaculis eu non diam phasellus vestibulum lorem. Pellentesque eu tincidunt tortor aliquam nulla facilisi.
            </section>
        );
    }

    render() {
        if(this.state.mapData == undefined)
            return (<span>Loading</span>);

        return (
            <div className="mapDetails">
                {this.getMainSection()}
                {this.getMetadata()}
                {this.getWeapons()}
            </div>
        );
    }
}

export default withRouter(MapDetails);