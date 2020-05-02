import React, { Component } from "react";
import "./App.css";
import {
   Divider,
   Button,
   FormControl,
   InputLabel,
   Select,
   Box,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Paper,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   TextField,
} from "@material-ui/core";
import axios from "axios";

//Finds all users from database
async function getUsers(token) {
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

//Changes password to database
async function changePassword(token, id, passwordn) {
   try {
      let response = await fetch("/api/user/" + id, {
         method: "PUT",
         body: JSON.stringify({
            password: passwordn,
         }),
         headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
      });
      return response.ok;
   } catch (err) {
      console.error("GETTING USER FAILED", err);
      return false;
   }
}

//Deletes user from database
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
      return response.ok;
   } catch (err) {
      console.error("GETTING USER FAILED", err);
      return false;
   }
}

//Add user to database
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

/**
 ** THE CLASS
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
         newUserRole: "supervisor",
         newUserPhone: "",
         openAddNewUserDialog: false,
         mokat: false,
         mokatPoistossa: false,
         myStorage: window.localStorage,
         password: "",
         changePassDialogOpen: false,
         oldPassword: "",
         newPassword: "",
         changeOwnPassFailed: false,
         selectedUserName: "",
      };

      //need to bind these functions so they get access to the state
      this.onRemoveClick = this.onRemoveClick.bind(this);
      this.handlePassWarningClose = this.handlePassWarningClose.bind(this);
      this.handleRemoveWarningClose = this.handleRemoveWarningClose.bind(this);
      this.onChangePassClick = this.onChangePassClick.bind(this);
      this.handleRemoveWarningCloseAgree = this.handleRemoveWarningCloseAgree.bind(this);
      this.handleAddUserOpenDialog = this.handleAddUserOpenDialog.bind(this);
      this.handleOpenOwnPassChangeDialog = this.handleOpenOwnPassChangeDialog.bind(this);
      this.handleChangeOwnPassDialogClose = this.handleChangeOwnPassDialogClose.bind(this);
      this.handleChangeOwnPassDialogCloseAgree = this.handleChangeOwnPassDialogCloseAgree.bind(this);
      this.handleNewuserNameChange = this.handleNewuserNameChange.bind(this);
      this.handleNewuserPassChange = this.handleNewuserPassChange.bind(this);
      this.handleAddNewUserDialogClose = this.handleAddNewUserDialogClose.bind(this);
      this.handleAddNewUserDialogCloseConfirmed = this.handleAddNewUserDialogCloseConfirmed.bind(this);
      this.handleChangePassCloseConfirm = this.handleChangePassCloseConfirm.bind(this);
      this.handleChangePassClose = this.handleChangePassClose.bind(this);
      this.handleChangeNewUserRole = this.handleChangeNewUserRole.bind(this);
      this.handleOldpassStringChange = this.handleOldpassStringChange.bind(this);
      this.handleNewpassStringChange = this.handleNewpassStringChange.bind(this);
   }

   componentDidMount() {
      this.setState(
         {
            token: localStorage.getItem("token"),
         },
         function () {
            if (this.state.token === "SECRET-TOKEN" || localStorage.role != "superuser") {
               this.props.history.push("/");
            } else {
               try {
                  const request = async () => {
                     const response = await getUsers(this.state.token);
                     if (response !== false) {
                        this.setState({
                           userList: response,
                        });
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
      var tempRows = [];
      for (var i in this.state.userList) {
         if (localStorage.taseraUserName !== this.state.userList[i].name) {
            var row = this.createData(this.state.userList[i].name, this.returnPassButton(this.state.userList[i].id), this.returnRemoveButton(this.state.userList[i].id));
            tempRows.push(row);
         }
      }
      this.setState({
         rows: tempRows,
      });
   }

   async makeDataFreshAgain() {
      try {
         const response = await getUsers(this.state.token);
         if (response !== false) {
            this.setState({
               userList: response,
            });
            this.update();
         } else {
            console.error("getting users failed, most likely sign in token invalid -> kicking to root");
            this.props.history.push("/");
         }
      } catch (error) {
         console.error("init failed", error);
      }
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

   /**
    **  FUNCTIONS
    */

   //Changes password for some1 else by their ID
   async handleChangePassCloseConfirm() {
      var response = await changePassword(this.state.token, this.findUserId(), this.state.password);
      if (!response) {
         this.setState({
            mokatVaihdossa: true,
         });
      } else {
         this.handleChangePassClose();
      }
   }

   //Removes the user
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

   //Handles adding new users
   async handleAddNewUserDialogCloseConfirmed() {
      this.setState({
         mokat: false,
      });
      const req = await addUser(this.state.token, this.state.newUserName, this.state.newUserRole, this.state.newUserPass);
      if (req.errors != undefined) {
         this.setState({
            mokat: true,
         });
      } else {
         this.handleAddNewUserDialogClose();
         this.makeDataFreshAgain();
      }
   }

   //handles changing own password
   async handleChangeOwnPassDialogCloseAgree() {
      this.setState({
         changeOwnPassFailed: false,
      });
      let success = true;
      let response = await axios
         .post("api/sign", {
            name: localStorage.taseraUserName,
            password: this.state.oldPassword,
         })
         .catch(() => {
            success = false;
         });
      if (success) {
         response = await changePassword(this.state.token, this.findOwnID(), this.state.newPassword);
         if (response) {
            this.handleChangeOwnPassDialogClose();
         } else {
            this.setState({
               changeOwnPassFailed: true,
            });
         }
      } else {
         this.setState({
            changeOwnPassFailed: true,
         });
      }
   }

   /**
    **ALGORITHMS
    */

   //Finds username for selectedROWID in state
   findUserName() {
      for (var i in this.state.userList) {
         if (this.state.userList[i].id == this.state.selectedROWID) {
            return this.state.userList[i].name;
         }
      }
      return "";
   }

   //Finds users id by selectedROWID in state
   findUserId() {
      for (var i in this.state.userList) {
         if (this.state.userList[i].id == this.state.selectedROWID) {
            return this.state.userList[i].id;
         }
      }
      return undefined;
   }

   //finds logged in users id
   findOwnID() {
      for (var i in this.state.userList) {
         if (localStorage.taseraUserName == this.state.userList[i].name) {
            return this.state.userList[i].id;
         }
      }
   }

   /**
    **  HANDLE DIALOGS
    **  opening and closings
    */

   //Opens dialog for changing password for some1 else
   async onChangePassClick(e) {
      await this.setState({
         selectedROWID: e.currentTarget.id,
      });
      var name = this.findUserName();
      this.setState({
         selectedUserName: name,
         changePassDialogOpen: true,
      });
   }

   //Closes dialog for changing password for some1 else
   handleChangePassClose(e) {
      this.setState({
         password: "",
         changePassDialogOpen: false,
      });
   }

   //Opens warning for removing user
   onRemoveClick(e) {
      this.setState({
         selectedROWID: e.currentTarget.id,
         openRemoveWarning: true,
      });
   }

   //Close dialog for changing password
   handlePassWarningClose() {
      this.setState({
         openPassWarning: false,
      });
   }

   //Close dialog for removing user
   handleRemoveWarningClose() {
      this.setState({
         openRemoveWarning: false,
         mokatPoistossa: false,
      });
   }

   //Open dialog for adding new users
   handleAddUserOpenDialog() {
      this.setState({
         openAddNewUserDialog: true,
      });
   }

   //closes dialog for adding users
   handleAddNewUserDialogClose() {
      this.setState({
         mokat: false,
         newUserName: "",
         newUserPass: "",
         newUserRole: "supervisor",
         openAddNewUserDialog: false,
      });
   }

   //opens dialog for changing logged in users password
   handleOpenOwnPassChangeDialog() {
      this.setState({
         changeOwnPassDialogOpen: true,
      });
   }

   //closes dialog for changing own password
   handleChangeOwnPassDialogClose() {
      this.setState({
         changeOwnPassFailed: false,
         changeOwnPassDialogOpen: false,
      });
   }

   /**
    **  HANDLE STATE CHANGES
    */

   //handles state change for oldpassword
   handleOldpassStringChange(e) {
      this.setState({
         oldPassword: e.target.value,
      });
   }
   //handles state change for newpassword
   handleNewpassStringChange(e) {
      this.setState({
         newPassword: e.target.value,
      });
   }

   //handles state change for new users name
   handleNewuserNameChange(e) {
      this.setState({
         newUserName: e.target.value,
      });
   }

   //handles state change for new users role
   handleChangeNewUserRole(e) {
      this.setState({
         newUserRole: e.target.value,
      });
   }

   //handles state change for new users password
   handleNewuserPassChange(e) {
      this.setState({
         newUserPass: e.target.value,
      });
   }

   /**
    **  ACTUAL PAGE RENDERING
    */
   render() {
      return (
         <div>
            {/*Dialog to add new user*/}
            <Dialog open={this.state.openAddNewUserDialog} keepMounted onClose={this.handleAddNewUserDialogClose}>
               <DialogTitle id="dialog-add-user-title">{"Luo uusi käyttäjä"}</DialogTitle>
               <DialogContent>
                  <TextField value={this.state.newUserName} margin="dense" id="name" label="Käyttäjänimi*" onChange={this.handleNewuserNameChange} fullWidth />
                  <TextField value={this.state.newUserPass} margin="dense" id="password" label="Salasana*" onChange={this.handleNewuserPassChange} fullWidth />
                  <FormControl>
                     <InputLabel>Rooli</InputLabel>
                     <Select style={{ marginTop: 15 }} native value={this.state.newUserRole} onChange={this.handleChangeNewUserRole} id="role">
                        <option aria-label="supervisor" value={"supervisor"}>
                           supervisor
                        </option>
                        <option value={"superuser"}>superuser</option>
                     </Select>
                  </FormControl>
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
                     Peruuta
                  </Button>
                  <Button onClick={this.handleAddNewUserDialogCloseConfirmed} color="primary">
                     Vahvista
                  </Button>
               </DialogActions>
            </Dialog>
            {/*Dialog to remove user*/}
            <Dialog open={this.state.openRemoveWarning} keepMounted onClose={this.handleRemoveWarningClose}>
               <DialogTitle id="dialog-remove-user-title">{"Haluatko varmasti jatkaa"}</DialogTitle>
               <DialogContent id="dialog-remove-user-contet">
                  <DialogContentText id="dialog-remove-user-text">Tämä poistaa pysyvästi käyttäjän {this.state.selectedUserName}</DialogContentText>
                  {this.state.mokatPoistossa ? <p style={{ fontSize: 20, color: "red", textAlign: "center" }}>Jokin meni pieleen </p> : <p></p>}
               </DialogContent>
               <DialogActions>
                  <Button onClick={this.handleRemoveWarningClose} color="primary">
                     Peruuta
                  </Button>
                  <Button onClick={this.handleRemoveWarningCloseAgree} color="primary">
                     Vahvista
                  </Button>
               </DialogActions>
            </Dialog>
            {/*Dialog to change password of own user*/}
            <Dialog open={this.state.changeOwnPassDialogOpen} onClose={this.handleChangeOwnPassDialogClose}>
               <DialogTitle id="dialog-change-own-pass-title">Vaihda Salasana</DialogTitle>
               <DialogContent>
                  <DialogContentText>Vaihtaaksesi salasanasi sinun tulee antaa vanha salasanasi sekä uusi joksi haluat sen vaihtaa</DialogContentText>
                  <TextField
                     type="password"
                     value={this.state.oldpassword}
                     margin="dense"
                     id="oldpassword"
                     label="Vanha salasana"
                     onChange={this.handleOldpassStringChange}
                     fullWidth
                  />
                  <TextField
                     type="password"
                     value={this.state.newpassword}
                     margin="dense"
                     id="newpassword"
                     label="Uusi salasana"
                     onChange={this.handleNewpassStringChange}
                     fullWidth
                  />
                  {this.state.changeOwnPassFailed ? (
                     <p style={{ fontSize: 20, color: "red", textAlign: "center" }}>
                        Jokin meni pieleen, onhan vanha salasana oikein ja uusi salasana vähintään 6 merkkiä pitkä{" "}
                     </p>
                  ) : (
                     <p></p>
                  )}
               </DialogContent>
               <DialogActions>
                  <Button onClick={this.handleChangeOwnPassDialogClose} color="primary">
                     Peruuta
                  </Button>
                  <Button onClick={this.handleChangeOwnPassDialogCloseAgree} color="primary">
                     Vahvista
                  </Button>
               </DialogActions>
            </Dialog>
            {/*Dialog to change password of other users*/}
            <Dialog open={this.state.changePassDialogOpen} onClose={this.handleChangePassClose}>
               <DialogTitle id="dialog-change-pass-title">Vaihda salasana käyttäjälle {this.state.selectedUserName}</DialogTitle>
               <DialogContent>
                  <TextField
                     type="text"
                     value={this.state.password}
                     margin="dense"
                     id="name"
                     label="Uusi salasana"
                     onChange={(e) => {
                        this.setState({ password: e.target.value });
                     }}
                     fullWidth
                  />
                  {this.state.mokatVaihdossa ? (
                     <p style={{ fontSize: 20, color: "red", textAlign: "center" }}>Jokin meni pieleen, muistathan että salasanan tulee olla 6 merkkiä pitkä </p>
                  ) : (
                     <p></p>
                  )}
               </DialogContent>
               <DialogActions>
                  <Button onClick={this.handleChangePassClose} color="primary">
                     Peruuta
                  </Button>
                  <Button onClick={this.handleChangePassCloseConfirm} color="primary">
                     Vahvista
                  </Button>
               </DialogActions>
            </Dialog>
            {/*THE ACTUAL PAGE*/}
            <h1 style={{ marginLeft: 100 }}>Käyttäjien hallinta</h1>
            <Divider></Divider>
            <Box display="flex">
               <h3 style={{ marginLeft: 40 }}>Vaihda salasana:</h3>
               <Button onClick={this.handleOpenOwnPassChangeDialog} color="primary" variant="contained" style={{ margin: 15, marginLeft: 40 }}>
                  Vaihda salasana
               </Button>
            </Box>
            <Divider></Divider>
            <Box display="flex">
               <h3 style={{ marginLeft: 40 }}>Lisää käyttäjä:</h3>
               <Button onClick={this.handleAddUserOpenDialog} color="primary" variant="contained" style={{ margin: 15, marginLeft: 58 }}>
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
