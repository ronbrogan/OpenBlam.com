import History, { createLocation } from 'history';

export default class SourceBrowserFixup {
    history: History.History;
    location: History.Location;

    constructor(history: History.History, location: History.Location) {
        this.history = history;
        this.location = location;
    }

    fixupLinks(contentRoot: HTMLElement, contentPath: string, pathPattern: string, url: string) {
        var anchors = Array.from(contentRoot.getElementsByTagName("a"));

        var root = pathPattern.replace(":contentPath*", "");
        var relativeRoot = root + contentPath.substr(0, contentPath.lastIndexOf("/")+1);

        for(var a of anchors)
        {
            var href = a.getAttribute("href");

            if(href?.startsWith("/"))
            {
                a.setAttribute("href", root + href.substr(1));
            }
            else if(href?.startsWith("#"))
            {
                a.setAttribute("href", url + href);
            }
            else
            {
                a.setAttribute("href", relativeRoot + href);
            }

            a.onclick = this.linkOnClick.bind(this);
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

            console.log("Navigating: ");
            console.log(loc);
            this.history.push(loc);
          }
    }

    static isModifiedEvent(event: MouseEvent) {
        return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
    }
}