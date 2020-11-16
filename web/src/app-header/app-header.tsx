import React from 'react';
import { NavLink } from 'react-router-dom';
import './app-header.scss';

export default class AppHeader extends React.Component {
    render() {
        return (
            <header>
                <div className="logo">
                    <img src="/assets/logo.png" width="48" height="48" />
                    <span>Open</span><span className="blam">Blam</span>
                </div>
                <nav>
                    <li><NavLink exact to="/" activeClassName="active">Home</NavLink></li>
                    <li><NavLink to="/articles" activeClassName="active">Articles</NavLink></li>
                    <li><NavLink to="/maps" activeClassName="active">Map Info</NavLink></li>
                </nav>
            </header>
    
        )
    }
}