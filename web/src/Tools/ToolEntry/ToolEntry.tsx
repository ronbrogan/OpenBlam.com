import React from "react";
import { Link } from "react-router-dom";
import UserAvatar from "../../Core/UserAvatar";
import { ToolsManifestEntry } from '../ToolData';
import './ToolEntry.scss';

export default class ToolWidget extends React.Component<ToolsManifestEntry, any, any>
{
    render() {
        return (
            <div className="tool-widget">
                <div className="tool-content">
                    <span className="source-link"><a href={this.props.sourceLocation} title="Source Code">{"{ }"}</a></span>
                    <a href={this.props.location}>
                        <img src={this.props.thumb} />
                        <h3>{this.props.name}</h3>
                    </a>
                    <p>{this.props.description}</p>
                </div>
                <div className="contributor-list">
                    {this.props.contributors.map(c => (<UserAvatar {...c} key={c.alias}></UserAvatar>))}
                </div>
            </div>
        );
    }
}