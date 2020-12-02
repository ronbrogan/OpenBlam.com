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
        return !this.done 
            || this.props.match.params.contentPath !== nextProps.match.params.contentPath;
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
        if(await this.redirectToNextLevelRedirectFileIfNecessary()) {
            return;
        }

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
    static anchorSplitChar = ",";

    // multi-staged redirect A.html -> A0.html -> filePath.html (to reduce size of a.html)
    async redirectToNextLevelRedirectFileIfNecessary() {
        let contentPath = this.props.match.params.contentPath;
        if(!contentPath) {
            return false;
        }

        if(contentPath.endsWith("/A.html") === false) {
            return false;
        }

        var anchor = this.props.location.hash;
        if (anchor) {
            anchor = anchor.slice(1);
            var hashParts = anchor.split(SourceViz.anchorSplitChar);
            var anchorHasReferencesSuffix = false;
            if (hashParts.length > 1 && hashParts[hashParts.length - 1] == "references") {
                anchorHasReferencesSuffix = true;
                hashParts.pop();
            }
            var id = hashParts.join(SourceViz.anchorSplitChar);

            var destinationHash = "#" + this.createSafeLineNumber(id);
            if (anchorHasReferencesSuffix) {
                destinationHash = destinationHash + SourceViz.anchorSplitChar + "references";
            }

            let redirectMapIife = await (await fetch(`/game-scripts/index/${contentPath.replace("A.html", "A" + id.slice(0, 1) + ".html")}`)).text();

            var redirectMap = eval(redirectMapIife);

            await this.redirect(redirectMap.map, redirectMap.bytes, destinationHash);
            return true;
        }

        return false;
    }

    async redirect(map: any, prefixLength: number, anchor: string) {
        if (!prefixLength) {
            prefixLength = 16;
        }
    
        if (anchor) {
            anchor = anchor.slice(1);
            var hashParts = anchor.split(SourceViz.anchorSplitChar);
            var anchorHasReferencesSuffix = false;
            if (hashParts.length > 1 && hashParts[hashParts.length - 1] == "references") {
                anchorHasReferencesSuffix = true;
                hashParts.pop();
            }
            var id = hashParts.join(SourceViz.anchorSplitChar);
            var shortId = id;
            if (prefixLength < shortId.length) {
                shortId = shortId.slice(0, prefixLength);
            }
    
            // all the keys have their first character trimmed since it's a bucket file aX.html
            // and X is the same for all ids
            shortId = shortId.slice(1);
    
            var redirectTo = map[shortId];
            if (redirectTo) {
                var destination = redirectTo + ".html" + "#" + this.createSafeLineNumber(id);
                if (anchorHasReferencesSuffix) {
                    destination = destination + SourceViz.anchorSplitChar + "references";
                }
                
                this.props.history.replace(`/tools/game-scripts/${destination}`);
            }
        }
    }
    

    createSafeLineNumber(text: string) {
        if (this.isNumber(text) && text.length != 16) {
            text = "l" + text;
        }
    
        return text;
    }
    
    isNumber(s: string) {
        let n = parseFloat(s);
        return !isNaN(n) && isFinite(n);
    }

    render() {
        return (
            <div ref={this.contentRoot} id="s" className="sourceViz" dangerouslySetInnerHTML={{ __html: this.state.codeVizHtml }} />
        );
    }

    
}

export default withRouter(SourceViz);