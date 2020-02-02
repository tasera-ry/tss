import React from 'react';
import './App.css';
import {Link} from 'react-router-dom';

function Dayview() {
    return (
        <div>
            <h1>Dayview</h1>
            <p>HIRVIRATA 200m JA SILLEE JNE</p>
            <Link style={{color: 'black'}} to='/weekview'>
                <p>Viikkonäkymään</p>
            </Link>
        </div>
    );
}

export default Dayview;