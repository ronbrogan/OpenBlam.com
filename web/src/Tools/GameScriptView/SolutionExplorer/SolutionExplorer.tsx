import React from 'react';
import { NavLink, withRouter, Switch, Route, RouteComponentProps, Redirect, useHistory } from 'react-router-dom';
import { createLocation } from 'history';
import SourceBrowserFixup from '../SourceBrowserFixup';
import { ChildPaneRouteProps } from '../GameScriptView';
import '../SourceBrowser.scss';
import './SolutionExplorer.scss';

interface SolutionExplorerState {
  slnExpHtml: string;
}

export class SolutionExplorer extends React.Component<RouteComponentProps<ChildPaneRouteProps>, SolutionExplorerState, any>
{
  contentRoot = React.createRef<HTMLDivElement>();
  contentPath: string = "overview.html";
  contentReady = false;
  fixup: SourceBrowserFixup;
  done = false;
  selectedFile: HTMLAnchorElement | null = null;

  constructor(props: any) {
    super(props);

    this.fixup = new SourceBrowserFixup(this.props.history, this.props.location);
    this.state = { slnExpHtml: "Loading" };
  }

  shouldComponentUpdate(nextProps:  RouteComponentProps<ChildPaneRouteProps>, nextState: SolutionExplorerState) {
    return !this.done || this.props.match.params.contentPath !== nextProps.match.params.contentPath;
  }

  async componentDidUpdate() {
    if (!this.contentReady) return;

    var updatedContentPath = this.props.match.params.contentPath;

    if (updatedContentPath == null) {
      updatedContentPath = this.contentPath;
    }

    if (updatedContentPath.endsWith(".html") === false) {
      updatedContentPath += ".html";
    }

    this.contentPath = updatedContentPath;

    if(!this.done) {
      this.loadSolutionExplorer();
      this.fixup = new SourceBrowserFixup(this.props.history, this.props.location);
      this.fixup.fixupLinks(this.contentRoot.current!, this.contentPath, this.props.match.path, this.props.match.url);
      this.done = true;
    }

    this.syncSolutionExplorer();
  }

  syncSolutionExplorer() {
    var parts = this.contentPath.split("/");

    let currentElement :HTMLElement | null = this.contentRoot.current;

    for(var i = 0; i < parts.length; i++)
    {
      if(currentElement === null)
        return;

      let folder :HTMLElement | null = currentElement.querySelector(`div[data-assembly="${parts[i]}"]`);

      if(folder !== null) {
        if(folder.style.display === "none") {
          folder.previousSibling?.dispatchEvent(new Event("click"));
        }
        currentElement = folder;
      } else {
        let anchors = currentElement.querySelectorAll("a");
        var anchor = Array.from(anchors).find(a => a.getAttribute("href")?.endsWith(parts[i]));

        if(anchor != null) {
          this.selectFile(anchor);
        }
      }
    }
  }

  selectFile(a: HTMLAnchorElement) {
    if (this.selectedFile === a) {
        return;
    }

    if (this.selectedFile && this.selectedFile.classList) {
      this.selectedFile.classList.remove("selectedFilename");
    }

    this.selectedFile = a;
    if (a) {
        if (a.classList) {
            a.classList.add("selectedFilename");
        }

        var bounds = a.getBoundingClientRect();
        let isVisible = bounds.top < window.innerHeight && bounds.bottom >= 0
        
        if(!isVisible) {
          a.scrollIntoView({behavior: "smooth", inline: "nearest"});
        }
    }
}

  async componentDidMount() {
    let slnExpHtml = await (await fetch("/game-scripts/index/SolutionExplorer.html")).text();

    this.contentReady = true;
    this.setState({ slnExpHtml: slnExpHtml });
  }

  render() {
    return (
      <div ref={this.contentRoot} id="s" className="solutionExplorer" dangerouslySetInnerHTML={{ __html: this.state.slnExpHtml }} />
    );
  }


  loadSolutionExplorer() {
    this.makeFoldersCollapsible(/* closed folder */"202.png", "201.png", "/game-scripts/wwwroot/content/icons/", this.initializeSolutionExplorerFolder.bind(this));
  }

  initializeSolutionExplorerFolder(folder: any) {
    for (var i = 0; i < folder.children.length; i++) {
      var child = folder.children[i];
      if (this.isLink(child)) {
        this.rewriteSolutionExplorerLink(child);
      }
    }
  }

  rewriteSolutionExplorerLink(link: any) {
    var url = link.href;
    var fileName = this.trimFromEnd(url, ".html");
    var extension = this.getExtension(fileName);
    var pathname = link.pathname;

    var setClassName = null;
    if (this.isSupportedExtension(extension) && !link.className) {
      setClassName = extension;
    } else {
      //this.rewriteExternalLink(link);
    }

    if (setClassName) {
      link.className = setClassName;
      link.textContent = this.getFileName(url);
    }
  }

  getFileName(url: any) {
    var lastSlash = url.lastIndexOf('/');
    if (lastSlash != -1) {
      url = url.slice(lastSlash + 1);
    }

    url = url.slice(0, url.length - 5);
    url = unescape(url);
    return url;
  }

  makeFoldersCollapsible(folderIcon: any, openFolderIcon: any, pathToIcons: any, initializeHandler: any) {
    var elements = this.contentRoot.current?.querySelectorAll(".folder");

    if (elements == null) return;

    var length = elements.length;
    for (var i = 0; i < length; i++) {
      var folder = elements[i] as any;
      folder.style.display = 'none';
      folder.initialize = initializeHandler;
      if (folder.parentNode.id === 'rootFolder'
        || folder.parentNode.previousSibling.id === 'rootFolder'
        || folder.parentNode.className === 'namespaceExplorerBody') {
        this.addImagesToFolder(folder, folderIcon, openFolderIcon, pathToIcons);
      }
    }
  }

  addImagesToFolder(folder: any, folderIcon: any, openFolderIcon: any, pathToIcons: any) {
    var div = folder.previousSibling;
    var firstChild = div.firstChild;

    var imagePlusMinus = document.createElement("img");
    imagePlusMinus.src = pathToIcons + "plus.png";
    imagePlusMinus.className = "imagePlusMinus";

    var imageFolder = document.createElement("img");
    imageFolder.src = pathToIcons + folderIcon;
    imageFolder.className = "imageFolder";
    this.setFolderImage(imageFolder, div, firstChild, pathToIcons, folderIcon);

    var handler = this.expandCollapseFolder(folder, imagePlusMinus, imageFolder, div, firstChild, pathToIcons, folderIcon, openFolderIcon);

    var skipImage = this.isLink(firstChild);
    if (skipImage) {
      div.insertBefore(imagePlusMinus, firstChild);
      imagePlusMinus.onclick = handler;
    } else {
      div.insertBefore(imageFolder, firstChild);
      div.insertBefore(imagePlusMinus, imageFolder);
      div.onclick = handler;
    }
  }

  isLink(element: any) {
    return element && element.tagName && element.tagName == "A";
  }

  expandCollapseFolder(capturedFolder: any, capturedPlusMinus: any, capturedFolderImage: any, capturedDiv: any, capturedFirstChild: any, pathToIcons: any, folderIcon: any, openFolderIcon: any) {
    return () => {
      if (capturedFolder.style.display == 'none') {
        capturedPlusMinus.src = pathToIcons + "minus.png";
        if (capturedDiv.className != "projectCSInSolution" && capturedDiv.className != "projectVBInSolution") {
          capturedFolderImage.src = pathToIcons + openFolderIcon;
        }

        if (capturedFolder.initialize) {
          capturedFolder.initialize(capturedFolder);
          capturedFolder.initialize = null;
        }

        if (!capturedFolder.everExpanded) {
          for (var i = 0; i < capturedFolder.children.length; i++) {
            if (capturedFolder.children[i].className === 'folder') {
              this.addImagesToFolder(capturedFolder.children[i], folderIcon, openFolderIcon, pathToIcons);
            }
          }
        }

        capturedFolder.everExpanded = true;
        capturedFolder.style.display = 'block';
      }
      else {
        capturedPlusMinus.src = pathToIcons + "plus.png";
        this.setFolderImage(capturedFolderImage, capturedDiv, capturedFirstChild, pathToIcons, folderIcon);
        capturedFolder.style.display = 'none';
      }
    }
  }

  setFolderImage(folder: any, div: any, firstChild: any, pathToIcons: any, folderIcon: any) {
    var text = firstChild.textContent;
    if (text === 'References' || text === "Used By") {
      folder.src = pathToIcons + "192.png";
    } else if (text === 'Properties') {
      folder.src = pathToIcons + "102.png";
    } else if (div.className == "projectCSInSolution") {
      folder.src = pathToIcons + "196.png";
    } else if (div.className == "projectVBInSolution") {
      folder.src = pathToIcons + "195.png";
    }
    else {
      folder.src = pathToIcons + folderIcon;
    }
  }

  trimFromEnd(text: string, suffixToTrim: string) {
    if (!text || !suffixToTrim) {
      return text;
    }

    if (this.endsWithIgnoreCase(text, suffixToTrim)) {
      text = text.slice(0, text.length - suffixToTrim.length);
    }

    return text;
  }

  getExtension(filePath: string) {
    if (!filePath) {
      return "";
    }

    var dot = filePath.lastIndexOf(".");
    if (dot == filePath.length - 1) {
      return "";
    }

    return filePath.slice(dot + 1).toLowerCase();
  }

  endsWith(text: string, suffix: string) {
    if (!text || !suffix) {
      return false;
    }

    if (suffix.length > text.length) {
      return false;
    }

    var slice = text.slice(text.length - suffix.length, text.length);
    return slice == suffix;
  }

  isSupportedExtension(extension: string) {
    return this.supportedFileExtensions.indexOf(extension) != -1;
  }

  endsWithIgnoreCase(text: string, suffix: string) {
    if (!text || !suffix) {
      return false;
    }

    if (suffix.length > text.length) {
      return false;
    }

    var slice = text.slice(text.length - suffix.length, text.length);
    return slice && (slice.toLowerCase() == suffix.toLowerCase());
  }

  supportedFileExtensions = [
    "cs",
    "vb",
    "ts",
    "csproj",
    "vbproj",
    "targets",
    "props",
    "xaml",
    "xml",
    "resx"
  ];
}
export default withRouter(SolutionExplorer);