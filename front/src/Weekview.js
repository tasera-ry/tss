import React from 'react';
import './App.css';
import {Link} from 'react-router-dom';

function Weekview() {
    return (
        <div>
            <h1>Weekview</h1>
            <p>
                Tähän ne 7 rataa jne
            </p>
            <Link style={{color: 'black'}} to='/monthlyview'>
                <p>Kuukausinäkymään</p>
            </Link>
        </div>
    );
}

export default Weekview;