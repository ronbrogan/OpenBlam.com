import History, { createLocation } from 'history';

export default class SourceBrowserFixup {
    history: History.History;
    location: History.Location;
    root: string = "";
    relativeRoot:string = "";
    url: string = "";

    constructor(history: History.History, location: History.Location) {
        this.history = history;
        this.location = location;
    }

    fixupLinks(contentRoot: HTMLElement, contentPath: string, pathPattern: string, url: string) {
        var anchors = Array.from(contentRoot.getElementsByTagName("a"));
        this.url = url;
        this.root = pathPattern.replace(":contentPath*", "");
        this.relativeRoot = this.root + contentPath.substr(0, contentPath.lastIndexOf("/")+1);

        for(var a of anchors)
        {
            a.onclick = this.linkOnClick.bind(this);
            a.onmouseover = this.linkMouseOver.bind(this);
        }
    }

    linkOnClick(ev: MouseEvent) {
        if (
            !ev.defaultPrevented && // onClick prevented default
            ev.button === 0 && // ignore everything but left clicks
            !SourceBrowserFixup.isModifiedEvent(ev) // ignore clicks with modifier keys
          ) {
            ev.preventDefault();
            var elem = ev.target as HTMLElement;

            var aElem = elem.closest("a") as HTMLAnchorElement;

            let loc = this.location;

            let href = aElem.getAttribute("href");

            if(href != null) {
                loc = createLocation(href, null, undefined, this.location);
            }
            
            this.history.push(loc);
          }
    }

    linkMouseOver(ev: MouseEvent) {
        var elem = ev.target as HTMLElement;

        var a = elem.closest("a") as HTMLAnchorElement;

        var href = a.getAttribute("href");

        if(href?.startsWith("/"))
        {
            a.setAttribute("href", this.root + href.substr(1));
        }
        else if(href?.startsWith("#"))
        {
            a.setAttribute("href", this.url + href);
        }
        else
        {
            a.setAttribute("href", this.relativeRoot + href);
        }

        a.onmouseover = null;
    }

    static isModifiedEvent(event: MouseEvent) {
        return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
    }
}