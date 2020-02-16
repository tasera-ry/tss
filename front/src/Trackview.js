import React from 'react';
import './App.css';
import {Link} from 'react-router-dom';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';


function Trackview() {
    return (
        <div>
            <Grid container spacing={1}>
                <Grid item xs={1} sm={2}>
                    <Box bgcolor="white" color="black" p={2} fontSize={36}>
                        Rata 1
                    </Box>
                </Grid>
                <Grid item xs={1} sm={2}>
                    <Box bgcolor="white" color="black" p={2}>
                        Kivääri 200m
                    </Box>
                </Grid>
            </Grid>
            <h1>PVM TÄHÄ</h1>
            <Grid container spacing={1}>
                <Grid item xs={1} sm={2}>
                    <Box bgcolor="green" color="black" p={2}>
                        Päävalvoja Paikalla
                    </Box>
                </Grid>
                <Grid item xs={1} sm={2}>
                    <Box bgcolor="green" color="black" p={2}>
                        Ratavalvoja Paikalla
                    </Box>
                </Grid>
            </Grid>
            <p>Lisätietoja</p>
            <Box component="span" bgcolor="white" color="black" border={1} sizeWidth={1} p={1} m={1}>
                Päävalvoja Paikalla
            </Box>
            <Link style={{color: 'black'}} to='/dayview'>
                <p>Päivänäkymään</p>
            </Link>
        </div>
    );
}

export default Trackview;