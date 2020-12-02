import React from 'react';
import { Link, Route, RouteComponentProps, withRouter } from 'react-router-dom';
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
                <h1 className="slim">{this.state.mapData.Name}</h1>
                <h4>{this.state.mapData.Description}</h4>
                {this.getMetadata()}
                {this.getContents()}
                {this.getAbout()}
            </section>
        );
    }

    getContents() {
        return (
            <nav className="tableOfContents">
                <ol>
                    <li><Link to="#aboutSection">About</Link></li>
                    <li><Link to="#dialogSection">Dialog</Link></li>
                    <li><Link to="#triviaSection">Trivia</Link></li>
                </ol>
            </nav>
        )
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

    getAbout() {
        return (
            <section>
                <h1 id="aboutSection">About</h1>
            </section>
        );
    }

    getDialog() {
        return (
            <section>
                <h1 id="dialogSection">Dialog</h1>
            </section>
        );
    }

    getTrivia() {
        return (
            <section>
                <h1 id="triviaSection">Trivia</h1>
                <em>nothing to see here</em>
            </section>
        );
    }

    render() {
        if(this.state.mapData == undefined)
            return (<span>Loading</span>);

        return (
            <div className="mapDetails">
                {this.getMainSection()}
                {this.getDialog()}
                {this.getTrivia()}
            </div>
        );
    }
}

export default withRouter(MapDetails);