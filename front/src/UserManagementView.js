import React, { Component } from "react";
import "./App.css";
import { Divider, Button, ListItemSecondaryAction } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";

/* WHERE AT:
removing user works but it doesnt refresh the table?? how to do that
adding user doesnt work it gives "POST http://localhost:3000/api/user/ 400 (Bad Request)"
changing passwords dialog needs functionality

idea millä sais taulukon ehkä päivittyyn ois poistaa vaan siitä se yks rivi hakematta mitään backendistä
käy läpi rivit ja jos eri ku poistettava nii lisää temp ja lopuks lista=temp

TEE MUUTOKSET KANTAAN "PUT"ILLA
*/

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
async function changePassword(token, id) {
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
async function deleteUser(token, id) {
   try {
      let response = await fetch("/api/user/" + id, {
         method: "DELETE",
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
async function addUser(token, namen, rolen, passwordn) {
   try {
      let response = await fetch("/api/user/", {
         method: "POST",
         body: JSON.stringify({
            name: namen,
            password: passwordn,
            role: rolen,
         }),
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
async function getLoggedUser(token) {
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
         openPassWarning: false,
         openRemoveWarning: false,
         selectedROWID: 1,
         changeOwnPassDialogOpen: false,
         newUserName: "",
         newUserPass: "",
         newUserRole: "",
         newUserPhone: "",
         openAddNewUserDialog: false,
         mokat: false,
         mokatPoistossa: false,
         myStorage: window.localStorage,
      };
      this.onRemoveClick = this.onRemoveClick.bind(this);
      this.handlePassWarningClose = this.handlePassWarningClose.bind(this);
      this.handleRemoveWarningClose = this.handleRemoveWarningClose.bind(this);
      this.onChangePassClick = this.onChangePassClick.bind(this);
      this.handleRemoveWarningCloseAgree = this.handleRemoveWarningCloseAgree.bind(this);
      this.handleAddUser = this.handleAddUser.bind(this);
      this.handleOpenOwnPassChangeDialog = this.handleOpenOwnPassChangeDialog.bind(this);
      this.handleChangeOwnPassDialogClose = this.handleChangeOwnPassDialogClose.bind(this);
      this.handleChangeOwnPassDialogCloseAgree = this.handleChangeOwnPassDialogCloseAgree.bind(this);
      this.handleNewuserNameChange = this.handleNewuserNameChange.bind(this);
      this.handleNewuserPassChange = this.handleNewuserPassChange.bind(this);
      this.handleNewuserRoleChange = this.handleNewuserRoleChange.bind(this);
      this.handleNewuserPhoneChange = this.handleNewuserPhoneChange.bind(this);
      this.handleAddNewUserDialogClose = this.handleAddNewUserDialogClose.bind(this);
      this.handleAddNewUserDialogCloseConfirmed = this.handleAddNewUserDialogCloseConfirmed.bind(this);
   }

   componentDidMount() {
      console.log("mounting");
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
                        console.log("getRangeSupervisors response", this.state.userList);
                        this.update();
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
      console.log("updating");
      console.log("STORAGHE:");
      console.log(this.state.myStorage);
      this.populateUserList();
   }
   async makeDataFreshAgain() {
      console.log("make it fresh");
      try {
         const response = await getRangeSupervisors(this.state.token);
         if (response !== false) {
            this.setState({
               userList: response,
            });
            console.log("getRangeSupervisors response", this.state.userList);
            this.update();
         } else {
            console.error("getting users failed, most likely sign in token invalid -> kicking to root");
            this.props.history.push("/");
         }
      } catch (error) {
         console.error("init failed", error);
      }
   }
   populateUserList() {
      console.log("populating with following data");
      console.log(this.state.userList);
      var tempRows = [];
      for (var i in this.state.userList) {
         var row = this.createData(this.state.userList[i].name, this.returnPassButton(this.state.userList[i].id), this.returnRemoveButton(this.state.userList[i].id));
         tempRows.push(row);
      }
      this.setState({
         rows: tempRows,
      });
   }
   createData(name, ButtonToChangePassword, ButtonToRemoveUser) {
      return { name, ButtonToChangePassword, ButtonToRemoveUser };
   }
   returnPassButton(id) {
      return (
         <Button id={id} color="primary" variant="contained" onClick={this.onChangePassClick}>
            vaihda salasana
         </Button>
      );
   }
   returnRemoveButton(id) {
      return (
         <Button id={id} color="secondary" variant="contained" onClick={this.onRemoveClick}>
            Poista Käyttäjä
         </Button>
      );
   }
   onChangePassClick(e) {
      this.setState({
         selectedROWID: e.currentTarget.id,
      });
   }
   onRemoveClick(e) {
      this.setState({
         selectedROWID: e.currentTarget.id,
         openRemoveWarning: true,
      });
   }
   handlePassWarningClose() {
      this.setState({
         openPassWarning: false,
      });
   }
   handleRemoveWarningClose() {
      this.setState({
         openRemoveWarning: false,
         mokatPoistossa: false,
      });
   }
   async handleRemoveWarningCloseAgree() {
      console.log("REMOVING USER " + this.findUserName() + " WITH ID " + this.findUserId() + " FROM DATABASE");
      var response = await deleteUser(this.state.token, this.findUserId());
      if (response.errors != undefined) {
         this.setState({
            mokatPoistossa: true,
         });
      } else {
         this.setState({
            openRemoveWarning: false,
         });
         this.handleRemoveWarningClose();
         this.makeDataFreshAgain();
      }
   }
   findUserName() {
      for (var i in this.state.userList) {
         if (this.state.userList[i].id == this.state.selectedROWID) {
            //console.log("name " + this.state.userList[i].name);
            return this.state.userList[i].name;
         }
      }
      return "";
   }
   findUserId() {
      for (var i in this.state.userList) {
         if (this.state.userList[i].id == this.state.selectedROWID) {
            //console.log("rowid " + this.state.selectedROWID + " has id of " + this.state.userList[i].id);
            return this.state.userList[i].id;
         }
      }
      return undefined;
   }
   //TODO handle adding new users
   handleAddUser() {
      this.setState({
         newUserName: "",
         newUserPass: "",
         newUserRole: "",
         openAddNewUserDialog: true,
      });
   }
   async handleAddNewUserDialogCloseConfirmed() {
      this.setState({
         mokat: false,
      });
      const req = await addUser(this.state.token, this.state.newUserName, "supervisor", this.state.newUserPass);
      console.log(req);
      if (req.errors != undefined) {
         this.setState({
            mokat: true,
         });
      } else {
         this.handleAddNewUserDialogClose();
         this.makeDataFreshAgain();
      }
   }
   handleAddNewUserDialogClose() {
      this.setState({
         mokat: false,
         newUserName: "",
         newUserPass: "",
         newUserRole: "",
         openAddNewUserDialog: false,
      });
   }
   handleOldpassStringChange(e) {
      console.log(e.target.value);
   }
   handleNewpassStringChange(e) {
      console.log(e.target.value);
   }
   //TODO change own password
   handleChangeOwnPassDialogCloseAgree() {
      this.setState({
         changeOwnPassDialogOpen: false,
      });
   }
   handleChangeOwnPassDialogClose() {
      this.setState({
         changeOwnPassDialogOpen: false,
      });
   }
   handleOpenOwnPassChangeDialog() {
      this.setState({
         changeOwnPassDialogOpen: true,
      });
   }
   handleNewuserNameChange(e) {
      this.setState({
         newUserName: e.target.value,
      });
   }
   handleNewuserPassChange(e) {
      this.setState({
         newUserPass: e.target.value,
      });
   }
   handleNewuserRoleChange(e) {
      this.setState({
         newUserRole: e.target.value,
      });
   }
   handleNewuserPhoneChange() {}
   render() {
      return (
         <div>
            {/*Dialog to add new user*/}
            <Dialog open={this.state.openAddNewUserDialog} keepMounted onClose={this.handleAddNewUserDialogClose}>
               <DialogTitle>{"Create new user"}</DialogTitle>
               <DialogContent>
                  <TextField value={this.state.newUserName} margin="dense" id="name" label="Käyttäjänimi*" onChange={this.handleNewuserNameChange} fullWidth />
                  <TextField value={this.state.newUserPass} margin="dense" id="password" label="Salasana*" onChange={this.handleNewuserPassChange} fullWidth />
                  <TextField value={this.state.newUserRole} margin="dense" id="phone" label="Role" onChange={this.handleNewuserRoleChange} fullWidth />
                  {this.state.mokat ? (
                     <p style={{ fontSize: 20, color: "red", textAlign: "center" }}>
                        Jokin meni pieleen, huomaathan että salasanan täytyy olla vähintään 6 merkkiä pitkä ja nimen uniikki{" "}
                     </p>
                  ) : (
                     <p></p>
                  )}
               </DialogContent>
               <DialogActions>
                  <Button onClick={this.handleAddNewUserDialogClose} color="primary">
                     Cancel
                  </Button>
                  <Button onClick={this.handleAddNewUserDialogCloseConfirmed} color="primary">
                     Confirm
                  </Button>
               </DialogActions>
            </Dialog>
            {/*Dialog to remove user*/}
            <Dialog
               open={this.state.openRemoveWarning}
               keepMounted
               onClose={this.handleRemoveWarningClose}
               aria-labelledby="alert-dialog-slide-title"
               aria-describedby="alert-dialog-slide-description"
            >
               <DialogTitle id="alert-dialog-slide-title">{"Are you really sure?"}</DialogTitle>
               <DialogContent>
                  <DialogContentText id="alert-dialog-slide-description">This action will permanently remove the user {this.findUserName}</DialogContentText>
                  {this.state.mokatPoistossa ? <p style={{ fontSize: 20, color: "red", textAlign: "center" }}>Jokin meni pieleen </p> : <p></p>}
               </DialogContent>
               <DialogActions>
                  <Button onClick={this.handleRemoveWarningClose} color="primary">
                     Cancel
                  </Button>
                  <Button onClick={this.handleRemoveWarningCloseAgree} color="primary">
                     Continue
                  </Button>
               </DialogActions>
            </Dialog>
            {/*Dialog to change password of own user*/}
            <Dialog open={this.state.changeOwnPassDialogOpen} onClose={this.handleChangeOwnPassDialogClose} aria-labelledby="form-dialog-title">
               <DialogTitle id="form-dialog-title">Change Password</DialogTitle>
               <DialogContent>
                  <DialogContentText>To change password you have to give your old password and new one to change to</DialogContentText>
                  <TextField
                     type="password"
                     value={this.state.oldpassword}
                     margin="dense"
                     id="name"
                     label="Vanha salasana"
                     onChange={this.handleOldpassStringChange}
                     fullWidth
                  />
                  <TextField
                     type="password"
                     value={this.state.newpassword}
                     margin="dense"
                     id="password"
                     label="Uusi salasana"
                     onChange={this.handleNewpassStringChange}
                     fullWidth
                  />
               </DialogContent>
               <DialogActions>
                  <Button onClick={this.handleChangeOwnPassDialogClose} color="primary">
                     Cancel
                  </Button>
                  <Button onClick={this.handleChangeOwnPassDialogCloseAgree} color="primary">
                     Confirm
                  </Button>
               </DialogActions>
            </Dialog>
            {/*THE ACTUAL PAGE*/}
            <h1 style={{ marginLeft: 100 }}>Käyttäjien hallinta</h1>
            <Divider></Divider>
            <Box display="flex">
               <h3 style={{ marginLeft: 40 }}>Vaihda salasana:</h3>
               <Button onClick={this.handleOpenOwnPassChangeDialog} color="primary" variant="contained" style={{ margin: 15, marginLeft: 40 }}>
                  vaihda salasana
               </Button>
            </Box>
            <Divider></Divider>
            <Box display="flex">
               <h3 style={{ marginLeft: 40 }}>Lisää käyttäjä:</h3>
               <Button onClick={this.handleAddUser} color="primary" variant="contained" style={{ margin: 15, marginLeft: 58 }}>
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
