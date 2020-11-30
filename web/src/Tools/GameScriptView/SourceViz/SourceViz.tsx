import React from 'react';
import { NavLink, withRouter, Switch, Route, RouteComponentProps, Redirect, useHistory } from 'react-router-dom';
import SourceBrowserFixup from '../SourceBrowserFixup';
import { ChildPaneRouteProps } from '../GameScriptView';
import '../SourceBrowser.scss';
import './SourceViz.scss';


interface SourceVizState {
    codeVizHtml: string;
}

export class SourceViz extends React.Component<RouteComponentProps<ChildPaneRouteProps>, SourceVizState, any>
{
    done: boolean = false;
    contentReady: boolean = false;
    contentRoot = React.createRef<HTMLDivElement>();
    contentPath: string = "overview.html";
    fixup: SourceBrowserFixup;

    constructor(props: RouteComponentProps<ChildPaneRouteProps>) {
        super(props);

        this.fixup = new SourceBrowserFixup(this.props.history, this.props.location);
        this.state = { codeVizHtml: "Loading" };
    }

    shouldComponentUpdate(nextProps:  RouteComponentProps<ChildPaneRouteProps>, nextState: SourceVizState) { 
        return !this.done || this.props.match.params.contentPath !== nextProps.match.params.contentPath;
     }

    async componentDidUpdate(prevProps: RouteComponentProps<ChildPaneRouteProps>) {
        if(this.props.match.params.contentPath !== prevProps.match.params.contentPath)
        {
            this.done = false;
            this.contentReady = false;
            this.setState({ codeVizHtml: "Loading" });
            await this.fetchData();
            return;
        }

        if(this.props.location.hash != null && this.props.location.hash !== prevProps.location.hash) {
            const id = this.props.location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) element.scrollIntoView();
        }

        // If we're here, this is an update after a new contentPath
        if(this.contentReady === false)
        {
            return;
        }

        // This is after the data is done fetching, we can fixup the DOM and suppress updates
        this.fixup = new SourceBrowserFixup(this.props.history, this.props.location);
        this.fixup.fixupLinks(this.contentRoot.current!, this.contentPath, this.props.match.path, this.props.match.url);
        this.done = true;
    }

    async componentDidMount() {
        await this.fetchData();
    }

    async fetchData() {
        var updatedContentPath = this.props.match.params.contentPath;

        if(updatedContentPath == null){
            updatedContentPath = this.contentPath;
        }

        if(updatedContentPath.endsWith(".html") === false)
        {
            updatedContentPath += ".html";
        }

        this.contentPath = updatedContentPath;

        let codeVizHtml = await (await fetch(`/game-scripts/index/${this.contentPath}`)).text();

        this.contentReady = true;
        this.setState({ codeVizHtml: codeVizHtml });
    }

    render() {
        return (
            <div ref={this.contentRoot} id="s" className="sourceViz" dangerouslySetInnerHTML={{ __html: this.state.codeVizHtml }} />
        );
    }

    
}

export default withRouter(SourceViz);