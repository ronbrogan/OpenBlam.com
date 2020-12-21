import React from 'react';
import { Link, Route, RouteComponentProps, withRouter } from 'react-router-dom';
import { MapContent, MapSummary } from '../MapData';
import './MapDetails.scss';

interface MapDetailProps {
    gameIdentifier: string;
    mapName: string;
}

interface MapDetailState {
    mapData: MapSummary;
    mapContent: MapContent;
}

export class MapDetails extends React.Component<RouteComponentProps<MapDetailProps>, MapDetailState, any>{
    static detailCache: { [key: string]: MapSummary } = {};
    static contentCache: { [key: string]: MapContent } = {};

    mapName: string = "";
    gameIdentifier: string = "";

    constructor(props: any) {
        super(props);
        this.state = {} as MapDetailState;
    }

    async componentDidMount() {
        this.gameIdentifier = this.props.match.params.gameIdentifier;
        this.mapName = this.props.match.params.mapName;

        if(MapDetails.contentCache[this.mapName] === undefined) {
            fetch(`/data/maps/${this.gameIdentifier}/${this.mapName}/content.json`)
                .then(r => r.json())
                .then(j => {
                    MapDetails.contentCache[this.mapName] = j as MapContent;
                    this.populateContent();
                    this.setState({mapContent: MapDetails.contentCache[this.mapName]});        
                });
        }
        else {
            this.setState({mapContent: MapDetails.contentCache[this.mapName]});
        }

        if (MapDetails.detailCache[this.mapName] == undefined) {
            fetch(`/data/maps/${this.gameIdentifier}/${this.mapName}/details.json`)
                .then(r => r.json())
                .then(j => {
                    MapDetails.detailCache[this.mapName] = j as MapSummary;
                    this.setState({ mapData: MapDetails.detailCache[this.mapName] });
                });
        }
        else {
            this.setState({ mapData: MapDetails.detailCache[this.mapName] });
        }
    }

    async populateContent() {
        
        const tasks = MapDetails.contentCache[this.mapName].mechanics
            .map(m => fetch(`/data/maps/${this.gameIdentifier}/${this.mapName}/${m.contentPath}`)
            .then(r => r.text())
            .then(t =>{
                // @ts-ignore
                m.content = marked(t);
            }));

        await Promise.all(tasks);

        this.setState({mapContent: MapDetails.contentCache[this.mapName]});    
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
                    <li><Link to="#mechanicsSection">Mechanics</Link>
                        {this.state?.mapContent?.mechanics ?
                        (<ol>
                            {
                                this.state.mapContent?.mechanics.map(m => 
                                    (<li><Link to={"#mechanicsSection_" + m.stub}>{m.title}</Link></li>))
                            }
                        </ol>)
                        : null}
                    </li>
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

    getMechanics() {
        return (
            <section>
                <h1 id="mechanicsSection">Mechanics</h1>
                {this.state.mapContent?.mechanics?.length ? null : (<em>nothing to see here</em>)}
                {
                    this.state.mapContent?.mechanics?.map(m => 
                        (
                            <article>
                                <h3 id={"mechanicsSection_" + m.stub}>{m.title}</h3>
                                <p dangerouslySetInnerHTML={{__html: m.content}}></p>
                            </article>
                        )
                    )
                }
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
                {this.getMechanics()}
            </div>
        );
    }
}

export default withRouter(MapDetails);