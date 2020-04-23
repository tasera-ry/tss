import React, { Component } from "react";
import "./App.css";
import { Divider, Button } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

/*
 ** Main function
 */
class UserManagementView extends Component {
   constructor(props) {
      super(props);
      this.state = {};
   }

   render() {
      function createData(name, ButtonToChangePassword, ButtonToRemoveUser) {
         return { name, ButtonToChangePassword, ButtonToRemoveUser };
      }

      const rows = [
         createData("Frozen yoghurt", returnPassButton(), returnRemoveButton()),
         createData("Ice cream sandwich", returnPassButton(), returnRemoveButton()),
         createData("Eclair", returnPassButton(), returnRemoveButton()),
         createData("Cupcake", returnPassButton(), returnRemoveButton()),
         createData("Gingerbread", returnPassButton(), returnRemoveButton()),
      ];

      function returnPassButton(props) {
         return (
            <Button color="primary" variant="contained">
               vaihda salasana
            </Button>
         );
      }

      function returnRemoveButton(props) {
         return (
            <Button color="secondary" variant="contained">
               Poista Käyttäjä
            </Button>
         );
      }

      return (
         <div>
            <h1 style={{ marginLeft: 100 }}>Käyttäjien hallinta</h1>
            <Divider></Divider>
            <Box display="flex">
               <h3 style={{ marginLeft: 40 }}>Vaihda salasana:</h3>
               <Button color="primary" variant="contained" style={{ margin: 15, marginLeft: 40 }}>
                  vaihda salasana
               </Button>
            </Box>
            <Divider></Divider>
            <Box display="flex">
               <h3 style={{ marginLeft: 40 }}>Lisää käyttäjä:</h3>
               <Button color="primary" variant="contained" style={{ margin: 15, marginLeft: 58 }}>
                  Lisää käyttäjä
               </Button>
            </Box>
            <Divider></Divider>
            <Box display="flex">
               <h3 style={{ marginLeft: 40 }}>Käyttäjät:</h3>
               <TableContainer component={Paper} style={{ minWidth: 600, maxWidth: 800, marginLeft: 96, marginTop: 15 }}>
                  <Table style={{ minWidth: 600 }} aria-label="table of users">
                     <TableHead>
                        <TableRow>
                           <TableCell>Käyttäjänimi</TableCell>
                           <TableCell align="right">Vaihda salasana</TableCell>
                           <TableCell align="right">Poista käyttäjä</TableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {rows.map((row) => (
                           <TableRow key={row.name}>
                              <TableCell component="th" scope="row">
                                 {row.name}
                              </TableCell>
                              <TableCell align="right">{row.ButtonToChangePassword}</TableCell>
                              <TableCell align="right">{row.ButtonToRemoveUser}</TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </TableContainer>
            </Box>
         </div>
      );
   }
}

export default UserManagementView;
