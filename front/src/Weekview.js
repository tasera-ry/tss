import React from 'react';
import './App.css';
import {Link} from 'react-router-dom';

function Weekview() {
    return (
        <div>
            <h1 class="week-header">Viikko 5, 2020</h1>

            <div>
            <div class="flex-container2">
                <div>Ma 2.1</div>
                <div>Ti 3.1</div>
                <div>Ke 4.1</div>  
                <div>To 5.1</div>
                <div>Pe 6.1</div>
                <div>La 7.1</div>  
                <div>Su 8.1</div>
            </div>
            </div>

            <div>
            <div class="flex-container">
                <div>&nbsp;</div>
                <div></div>
                <div></div>  
                <div></div>
                <div></div>
                <div></div>  
                <div></div>
            </div>
            </div>

            <div class="info-flex">
            <div class='box green'></div>
            &nbsp;Avoinna
            <div>
            <div class='box orange info-flex2'></div>
            &nbsp;Päävalvoja tulossa
            </div>
            </div>

            <div class="info-flex">
            <div>
            <div class='box red'></div>
            &nbsp;Suljettu&nbsp;
            </div>
            <div>
            <div class='box white info-flex2'></div>
            &nbsp;Ei tietoa 
            </div>
            </div>


            <Link style={{color: 'black'}} to='/monthlyview'>
                <p>Kuukausinäkymään</p>
            </Link>
        </div>
    );
}

export default Weekview;