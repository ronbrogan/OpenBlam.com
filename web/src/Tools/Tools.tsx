import React from 'react';
import {  Switch, Route } from 'react-router-dom';
import GameScriptView from './GameScriptView/GameScriptView';
import { ManifestProps, withManifest } from '../Core/withManifest';
import ToolEntry from './ToolEntry/ToolEntry';
import { ToolsManifest } from './ToolData';
import './Tools.scss';

export class Tools extends React.Component<ManifestProps<ToolsManifest>, any, any> {
    getToolsListing() {
        return (<section className="tools">
            <h1>
                Tools
            </h1>
            <div className="tools-list">
                {this.props.manifest?.tools.map(t => {
                    return (<ToolEntry {...t} key={t.location} />)
                })}
            </div>
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

export default withManifest(Tools, "/data/tools/tools.json");
