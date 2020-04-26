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

async function getRangeSupervisors(token) {
   try {
      let response = await fetch("/api/user", {
         method: "GET",
         headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
      });
      return await response.json();
   } catch (err) {
      console.error("GETTING USER FAILED", err);
      return false;
   }
}

/*
 ** Main function
 */
class UserManagementView extends Component {
   constructor(props) {
      super(props);
      this.state = {
         userList: {},
         haha: "asd",
         rows: [],
      };
   }

   componentDidMount() {
      console.log("MOUNTED", localStorage.getItem("token"));
      this.setState(
         {
            token: localStorage.getItem("token"),
         },
         function () {
            if (this.state.token === "SECRET-TOKEN") {
               this.props.history.push("/");
            } else {
               try {
                  const request = async () => {
                     const response = await getRangeSupervisors(this.state.token);
                     if (response !== false) {
                        this.setState({
                           userList: response,
                        });
                        this.update();
                        console.log("getRangeSupervisors response", this.state.userList);
                        /* this.setState({
                           state: "loading",
                        }); */
                     } else {
                        console.error("getting user failed, most likely sign in token invalid -> kicking to root");
                        this.props.history.push("/");
                     }
                  };
                  request();
               } catch (error) {
                  console.error("init failed", error);
               }
            }
         }
      );
   }
   update() {
      this.populateUserList();
   }
   populateUserList() {
      for (var i in this.state.userList) {
         var row = this.createData(this.state.userList[i].name, this.returnPassButton(), this.returnRemoveButton());
         var tempRows = this.state.rows;
         tempRows.push(row);
         this.setState({
            Rows: tempRows,
         });
      }
   }
   createData(name, ButtonToChangePassword, ButtonToRemoveUser) {
      return { name, ButtonToChangePassword, ButtonToRemoveUser };
   }
   returnPassButton(props) {
      return (
         <Button color="primary" variant="contained">
            vaihda salasana
         </Button>
      );
   }
   returnRemoveButton(props) {
      return (
         <Button id={1} type="submit" color="secondary" variant="contained" onClick={this.onRemoveClick}>
            Poista Käyttäjä
         </Button>
      );
   }
   onRemoveClick(e) {
      console.log(e.target.id);
      console.log(e.target);
   }
   render() {
      const rows = [];

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
                        {this.state.rows.map((row) => (
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
