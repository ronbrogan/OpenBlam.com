import React from 'react';
import './GameScriptView.scss';
import SolutionExplorer from './SolutionExplorer/SolutionExplorer'
import SourceViz from './SourceViz/SourceViz'
import { withRouter, RouteComponentProps } from 'react-router-dom';

export interface ChildPaneRouteProps {
  contentPath: string;
}

export class GameScriptView extends React.Component<RouteComponentProps<any>, any, any>
{
  constructor(props: any) {
    super(props);

  }

  render() {
    return (
      <div className="gameScriptView">
        <div className="gameScriptGrid">
          <SolutionExplorer></SolutionExplorer>
          <SourceViz></SourceViz>
        </div>
      </div>
    );
  }
}

export default withRouter(GameScriptView);