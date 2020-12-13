import React from "react";

export type ManifestProps<TManifest = {}, Props = {}> = ManifestHolder<TManifest> & Props;

export interface ManifestHolder<TManifest> {
    manifest?: TManifest;
}

export const withManifest = <P extends ManifestProps>(Component: React.ComponentType<P>, manifestPath: string) =>
    class WithManifest extends React.Component<P, ManifestHolder<any>> {
        static manifests : {[typeName: string]: ManifestProps<P>} = {};

        constructor(props: P) {
            super(props);
            this.state = {};
        }

        async componentDidMount() {
            if(WithManifest.manifests[typeof(this)] === undefined)
            {
                const resp = await fetch(manifestPath);
                WithManifest.manifests[typeof(this)] = (await resp.json()) as ManifestProps<P>;
                this.setState({"manifest": WithManifest.manifests[typeof(this)]});
            }
            else
            {
                this.setState({"manifest": WithManifest.manifests[typeof(this)]});
            }
        }

        render() {
            const {...props} = this.props;
            return this.state.manifest == undefined
                ? (<span>Loading</span>)
                : (<Component {...props} manifest={this.state.manifest} />);
        }
    };
