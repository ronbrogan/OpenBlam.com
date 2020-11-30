import React from 'react';
import { NavLink, withRouter, Switch, Route, RouteComponentProps, Redirect } from 'react-router-dom';
import GameScriptView from './GameScriptView/GameScriptView';

export default class Tools extends React.Component {
    getToolsListing() {
        return (<section>
            <h1>
                Tools
            </h1>
            <ul>
                <li><a href="/tools/game-scripts">Game Script Explorer</a></li>
                <li><a href="https://www.nuget.org/packages/OpenBlam.Serialization/">OpenBlam.Serialization</a><sup><a href="https://github.com/ronbrogan/OpenBlam/tree/master/src/OpenBlam.Serialization">[source]</a></sup></li>
                <li><a href="https://github.com/ronbrogan/openh2">OpenH2</a></li>
            </ul>
        </section>);
    }

    render() {
        return (
            <Switch>
                <Route exact path={`/tools`}>
                    {this.getToolsListing()}
                </Route>
                <Route path={`/tools/game-scripts/:contentPath*`}>
                    <GameScriptView></GameScriptView>
                </Route>
            </Switch>
        )
    }
}