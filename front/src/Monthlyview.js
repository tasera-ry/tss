import React from 'react';
import './App.css';
import {Link} from 'react-router-dom';

function Dayview() {
    return (
        <div>
            <h1>Monthlyview</h1>
            <p>
                Kuukauden kalenteri !!
            </p>
            <Link style={{color: 'black'}} to='/'>
                <p>Etusivulle</p>
            </Link>
        </div>
    );
}

export default Dayview;