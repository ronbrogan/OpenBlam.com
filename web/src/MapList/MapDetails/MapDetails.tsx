import React from 'react';
import {Route, RouteComponentProps, withRouter} from 'react-router-dom';

interface MapListParams
{
    mapName: string;
}

export class MapDetails extends React.Component<RouteComponentProps<MapListParams>, any, any>{

    constructor(props: any) {
        super(props);
    }

    render() {
        return (<h1>{this.props.match.params.mapName}</h1>);
    }
}

export default withRouter(MapDetails);