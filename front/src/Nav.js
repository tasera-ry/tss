import React from 'react';
import './App.css';
import {Link} from 'react-router-dom';

function Nav() {
    const navStyle = {
        color: 'black'
    };
    const logoStyle = {
        color: 'black',
        textDecoration: 'none'
    };

    return (
        <nav>
            <Link style={logoStyle} to='/'>
                <h3>Tasera</h3>
            </Link>
            <Link style={navStyle} to='/signin'>
                <p>Kirjaudu sisään</p>
            </Link>
        </nav>
    );
}

export default Nav;