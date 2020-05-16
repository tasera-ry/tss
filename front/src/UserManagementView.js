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
import * as data from './texts/texts.json';

const fin = localStorage.getItem("language");
const {manage} = data;

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
         rows: [],
         openPassWarning: false,
         openRemoveWarning: false,
         changeOwnPassDialogOpen: false,
         openAddNewUserDialog: false,
         changePassDialogOpen: false,
         changeOwnPassFailed: false,
         mokat: false,
         mokatPoistossa: false,
         selectedROWID: 1,
         newUserName: "",
         newUserPass: "",
         newUserRole: "supervisor",
         newUserPhone: "",
         password: "",
         oldPassword: "",
         newPassword: "",
         selectedUserName: "",
         myStorage: window.localStorage,
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
           var row = this.createData(this.state.userList[i].name,
                                     this.state.userList[i].role,
                                     this.returnPassButton(this.state.userList[i].id, manage, fin),
                                     this.returnRemoveButton(this.state.userList[i].id, manage, fin));
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

  createData(name, role, ButtonToChangePassword, ButtonToRemoveUser) {
    let roleToPrint = role==="superuser" ? manage.Superuser[fin] : manage.Supervisor[fin];
    return { name, roleToPrint, ButtonToChangePassword, ButtonToRemoveUser };
   }
  returnPassButton(id, manage, fin) {
      return (
         <Button id={id} size="small" style={{backgroundColor:'#5f77a1'}} variant="contained" onClick={this.onChangePassClick}>
          {manage.ChangePass[fin]}
         </Button>
      );
   }
  returnRemoveButton(id, manage, fin) {
      return (
         <Button id={id} size="small" style={{backgroundColor:'#c97b7b'}} variant="contained" onClick={this.onRemoveClick}>
            {manage.RemoveUser[fin]}
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
      return "Username not found";
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
   async onRemoveClick(e) {
      await this.setState({
         selectedROWID: e.currentTarget.id,
      });
      var name = this.findUserName();
      this.setState({
         selectedUserName: name,
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
          <DialogTitle id="dialog-add-user-title">{manage.New[fin]}</DialogTitle>
          <DialogContent>
            <TextField value={this.state.newUserName} margin="dense" id="name" label={manage.Username[fin]} onChange={this.handleNewuserNameChange} fullWidth />
            <TextField value={this.state.newUserPass} margin="dense" id="password" label={manage.Password[fin]} onChange={this.handleNewuserPassChange} fullWidth />
            <FormControl>
              <InputLabel>{manage.Role[fin]}</InputLabel>
              <Select style={{ marginTop: 15 }} native value={this.state.newUserRole} onChange={this.handleChangeNewUserRole} id="role">
                <option aria-label={manage.Supervisor[fin]} value={"supervisor"}>
                  {manage.Supervisor[fin]}
                </option>
                <option value={"superuser"}>{manage.Superuser[fin]}</option>
              </Select>
            </FormControl>
            {this.state.mokat ? (
              <p style={{ fontSize: 20, color: "red", textAlign: "center" }}>
                {manage.Error[fin]}{" "}
              </p>
            ) : (
              <p></p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleAddNewUserDialogClose} style={{color:'#c97b7b'}}>
              {manage.Cancel[fin]}
            </Button>
            <Button onClick={this.handleAddNewUserDialogCloseConfirmed} style={{color:'#5f77a1'}}>
              {manage.Confirm[fin]}
            </Button>
          </DialogActions>
        </Dialog>
        {/*Dialog to remove user*/}
        <Dialog open={this.state.openRemoveWarning} keepMounted onClose={this.handleRemoveWarningClose}>
          <DialogTitle id="dialog-remove-user-title">{manage.Ask[fin]}</DialogTitle>
          <DialogContent id="dialog-remove-user-contet">
            <DialogContentText id="dialog-remove-user-text">{manage.AskDelete[fin]} {this.state.selectedUserName}</DialogContentText>
            {this.state.mokatPoistossa ? <p style={{ fontSize: 20, color: "red", textAlign: "center" }}>{manage.ErrorSmall[fin]} </p> : <p></p>}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleRemoveWarningClose} style={{color:'#c97b7b'}}>
              {manage.Cancel[fin]}
            </Button>
            <Button onClick={this.handleRemoveWarningCloseAgree} style={{color:'#5f77a1'}}>
              {manage.ConfirmDelete[fin]}
            </Button>
          </DialogActions>
        </Dialog>
        {/*Dialog to change password of own user*/}
        <Dialog open={this.state.changeOwnPassDialogOpen} onClose={this.handleChangeOwnPassDialogClose}>
          <DialogTitle id="dialog-change-own-pass-title">{manage.ChangePass[fin]}</DialogTitle>
          <DialogContent>
            <DialogContentText>{manage.Helper[fin]}</DialogContentText>
            <TextField
              type="password"
              value={this.state.oldpassword}
              margin="dense"
              id="oldpassword"
              label={manage.OldPass[fin]}
              onChange={this.handleOldpassStringChange}
              fullWidth
            />
            <TextField
              type="password"
              value={this.state.newpassword}
              margin="dense"
              id="newpassword"
              label={manage.NewPass[fin]}
              onChange={this.handleNewpassStringChange}
              fullWidth
            />
            {this.state.changeOwnPassFailed ? (
              <p style={{ fontSize: 20, color: "red", textAlign: "center" }}>
                {manage.Error[fin]}{" "}
              </p>
            ) : (
              <p></p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleChangeOwnPassDialogClose} style={{color:'#c97b7b'}}>
              {manage.Cancel[fin]}
            </Button>
            <Button onClick={this.handleChangeOwnPassDialogCloseAgree} style={{color:'#5f77a1'}}>
              {manage.Confirm[fin]}
            </Button>
          </DialogActions>
        </Dialog>
        {/*Dialog to change password of other users*/}
        <Dialog open={this.state.changePassDialogOpen} onClose={this.handleChangePassClose}>
          <DialogTitle id="dialog-change-pass-title">{manage.ChangeFor[fin]} {this.state.selectedUserName}</DialogTitle>
          <DialogContent>
            <TextField
              type="text"
              value={this.state.password}
              margin="dense"
              id="name"
              label={manage.NewPass[fin]}
              onChange={(e) => {
                this.setState({ password: e.target.value });
              }}
              fullWidth
            />
            {this.state.mokatVaihdossa ? (
              <p style={{ fontSize: 20, color: "red", textAlign: "center" }}>{manage.Error[fin]} </p>
            ) : (
              <p></p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleChangePassClose} style={{color:'#c97b7b'}}>
              {manage.Cancel[fin]}
            </Button>
            <Button onClick={this.handleChangePassCloseConfirm} style={{color:'#5f77a1'}}>
              {manage.Confirm[fin]}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/*THE ACTUAL PAGE*/}
        
        <h1 style={{ textAlign:"center" }}>{manage.UserManage[fin]}</h1>
        <Divider></Divider>
        <Box style={{justifyContent: "center", display:"flex", flexWrap:"wrap"}}>
          <h3 style={{ textAlign:"center" }}>{manage.ChangePass[fin]}:</h3>
        <Button onClick={this.handleOpenOwnPassChangeDialog}  variant="contained" style={{ backgroundColor:'#5f77a1', margin: 15, textAlign: "center" }}>
            {manage.ChangePass[fin]}
          </Button>
        </Box>
        <Divider></Divider>
        <Box style={{justifyContent: "center", display:"flex", flexWrap:"wrap"}}>
          <h3 style={{ textAlign:"center" }}>{manage.CreateUser[fin]}:</h3>
          <Button onClick={this.handleAddUserOpenDialog} variant="contained" style={{ backgroundColor:'#5f77a1', margin: 15, textAlign: "center" }}>
            {manage.CreateUser[fin]}
          </Button>
        </Box>
        <Divider></Divider>

        {/*USER PROFILES TABLE*/}

	<h3 style={{ textAlign:"center" }}>{manage.Users[fin]}:</h3>
        <Box style={{justifyContent: "center", display:"flex", flexWrap:"wrap"}}>
             
        <TableContainer component={Paper} style={{ maxWidth:500, tableLayout: "auto" }}>
        <Table aria-label="table of users" style={{ backgroundColor:"#F2F0EB" }}>
                 <TableHead>
                   <TableRow>
                     <TableCell align="justify">{manage.Username[fin]}</TableCell>
                     <TableCell align="justify">{manage.ChangePass[fin]}</TableCell>
                     <TableCell align="justify">{manage.RemoveUser[fin]}</TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   
                   {this.state.rows.map((row) => (
                     <TableRow key={row.name} hover>
                       <TableCell align="justify" component="th" scope="row">{row.name} <br/>{row.roleToPrint}</TableCell>
                       <TableCell align="justify">{row.ButtonToChangePassword}</TableCell>
                       <TableCell align="justify">{row.ButtonToRemoveUser}</TableCell>
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
