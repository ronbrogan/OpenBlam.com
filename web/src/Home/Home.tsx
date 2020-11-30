import React from 'react';


export default class Home extends React.Component {
    render() {
        return (
            <article>
                <h1>Welcome!</h1>
                <p>
                    This site aims to be the de-facto repository of technical information about the Halo games and related communities (modding, speedrunning, tricking, etc). 
                </p>
                <p>
                    Content ranging from articles detailing the underlying mechanics of glitches, to convenient ways to browse the game scripts is welcome here.
                </p>
                <p>
                    The initial set of content is primarily centered around Halo 2, as the OpenH2 sibling-project is the main source of data and motivation.
                    As time goes on, more games' data will be added and more articles will be written/added.
                </p>
                <p>
                    If you'd like to contribute or spot an inaccuracy, this site is on <a href="https://github.com/ronbrogan/OpenBlam">Github</a> - pull requests and issues are welcome.
                </p>
                <aside>
                    - Ron
                </aside>
            </article>
        )
    }
}