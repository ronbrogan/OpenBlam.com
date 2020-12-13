import React from 'react';
import { NavLink } from 'react-router-dom';
import './AppHeader.scss';

export default class AppHeader extends React.Component {
    render() {
        return (
            <header>
                <div className="logo">
                    <img src="/assets/logo_48.png" width="48" height="48" />
                    <div className="text">
                        <p className="maintext"><span>Open</span><span className="blam">Blam</span></p>
                        <p className="subtext">The home of technical Halo info</p>
                    </div>
                </div>
                <nav>
                    <li><NavLink exact to="/" activeClassName="active">Home</NavLink></li>
                    <li><NavLink to="/tools" activeClassName="active">Tools</NavLink></li>
                    <li><NavLink to="/articles" activeClassName="active">Articles</NavLink></li>
                    <li><NavLink to="/maps" activeClassName="active">Map Info</NavLink></li>
                </nav>
            </header>
    
        )
    }
}