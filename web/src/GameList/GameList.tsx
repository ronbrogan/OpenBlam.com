import React from 'react';
import { NavLink, withRouter, Switch, Route, RouteComponentProps, Redirect } from 'react-router-dom';
import { GamesManifest } from './MapList/MapData';
import MapList from './MapList/MapList';

interface MapListProps
{
    gameIdentifier: string;
}

interface MapListState
{
    gameManifest: GamesManifest;
}

export class GameList extends React.Component<RouteComponentProps<MapListProps>, MapListState, any> {
    static gameManifest: GamesManifest;

    constructor(props: RouteComponentProps<MapListProps>) {
        super(props);
        this.state = {} as MapListState;
    }

    async componentDidMount() {
        if(GameList.gameManifest == undefined)
        {
            const resp = await fetch(`/data/maps/games.json`);
            GameList.gameManifest = (await resp.json()) as GamesManifest;
            this.setState({"gameManifest": GameList.gameManifest});
        }
        else
        {
            this.setState({"gameManifest": GameList.gameManifest});
        }
    }

    getGameListing() {
        if(this.state.gameManifest.games.length === 1) {
            return (<Redirect to={`/maps/${this.state.gameManifest.games[0].gameIdentifier}`} />)
        }

        return (
            <section className="game-list">
                {this.state.gameManifest.games.map(g => {
                    return (<NavLink key={g.gameIdentifier} to={`/maps/${g.gameIdentifier}`}>{g.title}</NavLink>)
                })}
            </section>
        )
    }

    render() {
        let path = this.props.match.path;
        return (
            <Switch>
                <Route exact path={path}>
                    <h1>Games</h1>
                        {(this.state.gameManifest == undefined
                            ? (<span>Loading</span>)
                            : this.getGameListing()
                        )}
                </Route>
                <Route path={`${path}/:gameIdentifier`}>
                    <MapList></MapList>
                </Route>
            </Switch>
        );
    }
}

export default withRouter(GameList);