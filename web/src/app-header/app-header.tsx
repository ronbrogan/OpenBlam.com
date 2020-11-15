import React from 'react';
import './app-header.scss';

export default class AppHeader extends React.Component {
    render() {
        return (
            <header>
                <div className="logo">
                    <img src="assets/logo.png" width="48" height="48" />
                    <span>Open</span><span className="blam">Blam</span>
                </div>
                <nav>
                    <li><a href="/">Home</a></li>
                    <li><a href="#">Articles</a></li>
                    <li><a href="#">Map Info</a></li>
                </nav>
            </header>
    
        )
    }
}