import React, { Component } from 'react';

import '../App.css';

// Material UI components
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
} from '@material-ui/core';

// axios for calls to backend
import axios from 'axios';

// Token validation
import { withCookies } from 'react-cookie';
import { validateLogin } from '../utils/Utils';

// Translations
import data from '../texts/texts.json';

const fin = localStorage.getItem('language');
const { manage } = data;

// Styles
const dialogStyle = {
  backgroundColor: '#f2f0eb',
};

// Finds all users from database
async function getUsers() {
  try {
    const response = await fetch('/api/user', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (err) {
    console.error('GETTING USER FAILED', err);
    return false;
  }
}

// Changes password to database
async function changePassword(id, passwordn) {
  try {
    const response = await fetch(`/api/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        password: passwordn,
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (err) {
    console.error('GETTING USER FAILED', err);
    return false;
  }
}

// Deletes user from database
async function deleteUser(id) {
  try {
    const response = await fetch(`/api/user/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (err) {
    console.error('GETTING USER FAILED', err);
    return false;
  }
}

// Add user to database
async function addUser(namen, rolen, passwordn) {
  try {
    const response = await fetch('/api/user/', {
      method: 'POST',
      body: JSON.stringify({
        name: namen,
        password: passwordn,
        role: rolen,
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (err) {
    console.error('GETTING USER FAILED', err);
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
      openPassWarning: false, // eslint-disable-line
      openRemoveWarning: false,
      changeOwnPassDialogOpen: false,
      openAddNewUserDialog: false,
      changePassDialogOpen: false,
      changeOwnPassFailed: false,
      mokat: false,
      mokatPoistossa: false,
      selectedROWID: 1,
      newUserName: '',
      newUserPass: '',
      newUserRole: 'supervisor',
      newUserPhone: '', // eslint-disable-line
      password: '',
      oldPassword: '',
      newPassword: '',
      username: props.cookies.cookies.username,
      selectedUserName: '',
      myStorage: window.localStorage, // eslint-disable-line
    };

    // need to bind these functions so they get access to the state
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
    this.handleAddNewUserDialogCloseConfirmed = this.handleAddNewUserDialogCloseConfirmed.bind(this);  // eslint-disable-line
    this.handleChangePassCloseConfirm = this.handleChangePassCloseConfirm.bind(this);
    this.handleChangePassClose = this.handleChangePassClose.bind(this);
    this.handleChangeNewUserRole = this.handleChangeNewUserRole.bind(this);
    this.handleOldpassStringChange = this.handleOldpassStringChange.bind(this);
    this.handleNewpassStringChange = this.handleNewpassStringChange.bind(this);
  }

  componentDidMount() {
    this.setState(
      function () {
        validateLogin()
          .then((logInSuccess) => {
            if (!logInSuccess) {
              this.props.history.push('/');
            } else {
              getUsers()
                .then((response) => {
                  if (response !== false) {
                    this.setState({
                      userList: response,
                    }, () => {
                      this.update();
                    });
                  }
                })
                .catch((error) => {
                  console.error('init failed', error);
                });
            }
          });
      },
    );
  }

  /**
    **  HANDLE DIALOGS
    **  opening and closings
    */

  // handles changing own password
  async handleChangeOwnPassDialogCloseAgree() {
    const secure = window.location.protocol === 'https:';
    this.setState({
      changeOwnPassFailed: false,
    });
    let success = true;
    let response = await axios
      .post('api/sign', {
        name: this.state.username,
        password: this.state.oldPassword,
        secure,
      })
      .catch(() => {
        success = false;
      });
    if (success) {
      response = await changePassword(this.findOwnID(), this.state.newPassword);
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

  // Handles adding new users
  async handleAddNewUserDialogCloseConfirmed() {
    this.setState({
      mokat: false,
    });
    const req = await addUser(
      this.state.newUserName,
      this.state.newUserRole,
      this.state.newUserPass,
    );
    if (req.errors !== undefined) {
      this.setState({
        mokat: true,
      });
    } else {
      this.handleAddNewUserDialogClose();
      this.makeDataFreshAgain();
    }
  }

  // Removes the user
  async handleRemoveWarningCloseAgree() {
    const response = await deleteUser(this.findUserId());
    if (response?.errors !== undefined) {
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

  // Closes dialog for changing password for some1 else
  handleChangePassClose(e) { // eslint-disable-line
    this.setState({
      password: '',
      changePassDialogOpen: false,
    });
  }

  // Changes password for some1 else by their ID
  async handleChangePassCloseConfirm() {
    const response = await changePassword(this.findUserId(), this.state.password);
    if (!response) {
      this.setState({
        mokatVaihdossa: true,
      });
    } else {
      this.handleChangePassClose();
    }
  }

  returnRemoveButton(id, manage, fin) { // eslint-disable-line
    return (
      <Button data-testid={`del-${id}`} id={id} size="small" style={{ backgroundColor: '#c97b7b' }} variant="contained" onClick={this.onRemoveClick}>
        {manage.RemoveUser[fin]}
      </Button>
    );
  }

  returnPassButton(id, manage, fin) { // eslint-disable-line
    return (
      <Button data-testid={`pw-${id}`} id={id} size="small" style={{ backgroundColor: '#5f77a1' }} variant="contained" onClick={this.onChangePassClick}>
        {manage.ChangePass[fin]}
      </Button>
    );
  }

  createData(name, role, ButtonToChangePassword, ButtonToRemoveUser) {
    const roleToPrint = role === 'superuser' ? manage.Superuser[fin] : manage.Supervisor[fin];
    return {
      name, roleToPrint, ButtonToChangePassword, ButtonToRemoveUser,
    };
  }

  async makeDataFreshAgain() {
    try {
      const response = await getUsers();
      if (response !== false) {
        this.setState({
          userList: response,
        });
        this.update();
      } else {
        console.error('getting users failed, most likely sign in token invalid -> kicking to root');
        this.props.history.push('/');
      }
    } catch (error) {
      console.error('init failed', error);
    }
  }

  // Close dialog for changing password
  handlePassWarningClose() {
    this.setState({
      openPassWarning: false, // eslint-disable-line
    });
  }

  // Close dialog for removing user
  handleRemoveWarningClose() {
    this.setState({
      openRemoveWarning: false,
      mokatPoistossa: false,
    });
  }

  // Open dialog for adding new users
  handleAddUserOpenDialog() {
    this.setState({
      openAddNewUserDialog: true,
    });
  }

  // closes dialog for adding users
  handleAddNewUserDialogClose() {
    this.setState({
      mokat: false,
      newUserName: '',
      newUserPass: '',
      newUserRole: 'supervisor',
      openAddNewUserDialog: false,
    });
  }

  // opens dialog for changing logged in users password
  handleOpenOwnPassChangeDialog() {
    this.setState({
      changeOwnPassDialogOpen: true,
    });
  }

  // closes dialog for changing own password
  handleChangeOwnPassDialogClose() {
    this.setState({
      changeOwnPassFailed: false,
      changeOwnPassDialogOpen: false,
    });
  }

  /**
    **  HANDLE STATE CHANGES
    */

  // handles state change for oldpassword
  handleOldpassStringChange(e) {
    this.setState({
      oldPassword: e.target.value,
    });
  }

  // handles state change for newpassword
  handleNewpassStringChange(e) {
    this.setState({
      newPassword: e.target.value,
    });
  }

  // handles state change for new users name
  handleNewuserNameChange(e) {
    this.setState({
      newUserName: e.target.value,
    });
  }

  // handles state change for new users role
  handleChangeNewUserRole(e) {
    this.setState({
      newUserRole: e.target.value,
    });
  }

  // handles state change for new users password
  handleNewuserPassChange(e) {
    this.setState({
      newUserPass: e.target.value,
    });
  }

  /**
    **  FUNCTIONS
    */

  // Opens warning for removing user
  async onRemoveClick(e) {
    await this.setState({
      selectedROWID: e.currentTarget.id,
    });
    const name = this.findUserName();
    this.setState({
      selectedUserName: name,
      openRemoveWarning: true,
    });
  }

  // Opens dialog for changing password for some1 else
  async onChangePassClick(e) {
    await this.setState({
      selectedROWID: e.currentTarget.id,
    });
    const name = this.findUserName();
    this.setState({
      selectedUserName: name,
      changePassDialogOpen: true,
    });
  }

  /**
    **ALGORITHMS
    */

  // Finds username for selectedROWID in state
  findUserName() {
    for (const i in this.state.userList) {
      if (this.state.userList[i].id === this.state.selectedROWID) {
        return this.state.userList[i].name;
      }
    }
    return 'Username not found';
  }

  // Finds users id by selectedROWID in state
  findUserId() {
    for (const i in this.state.userList) {
      if (this.state.userList[i].id.toString() === this.state.selectedROWID) {
        return this.state.userList[i].id;
      }
    }
    return undefined;
  }

  // finds logged in users id
  findOwnID() {
    for (const i in this.state.userList) {
      if (localStorage.taseraUserName === this.state.userList[i].name) {
        return this.state.userList[i].id;
      }
    }
    return null;
  }

  update() {
    const tempRows = [];
    this.state.userList.forEach((user) => {
      if (this.state.username !== user.name) {
        const row = this.createData(user.name,
          user.role,
          this.returnPassButton(user.id, manage, fin),
          this.returnRemoveButton(user.id, manage, fin));
        tempRows.push(row);
      }
    });
    this.setState({
      rows: tempRows,
    });
  }

  /**
    **  ACTUAL PAGE RENDERING
    */
  render() {
    const fin = localStorage.getItem('language'); // eslint-disable-line
    return (
      <div>
        {/* Dialog to add new user */}
        <Dialog
          open={this.state.openAddNewUserDialog}
          keepMounted
          onClose={this.handleAddNewUserDialogClose}
        >
          <DialogTitle
            id="dialog-add-user-title"
            style={dialogStyle}
          >
            {manage.New[fin]}
          </DialogTitle>
          <DialogContent
            style={dialogStyle}
          >

            <TextField
              value={this.state.newUserName}
              margin="dense"
              id="name"
              label={manage.Username[fin]}
              onChange={this.handleNewuserNameChange}
              fullWidth
            />
            <TextField
              value={this.state.newUserPass}
              margin="dense"
              id="password"
              label={manage.Password[fin]}
              onChange={this.handleNewuserPassChange}
              fullWidth
            />

            <FormControl>
              <InputLabel>{manage.Role[fin]}</InputLabel>
              <Select
                style={{ marginTop: 15 }}
                native
                value={this.state.newUserRole}
                onChange={this.handleChangeNewUserRole}
                id="role"
              >
                <option aria-label={manage.Supervisor[fin]} value="supervisor">
                  {manage.Supervisor[fin]}
                </option>
                <option value="superuser">
                  {manage.Superuser[fin]}
                </option>
              </Select>
            </FormControl>

            {this.state.mokat ? (
              <p style={{ fontSize: 20, color: 'red', textAlign: 'center' }}>
                {manage.Error[fin]}
                {' '}
              </p>
            ) : (
              <p />
            )}

          </DialogContent>
          <DialogActions
            style={dialogStyle}
          >
            <Button onClick={this.handleAddNewUserDialogClose} style={{ color: '#c97b7b' }}>
              {manage.Cancel[fin]}
            </Button>
            <Button onClick={this.handleAddNewUserDialogCloseConfirmed} style={{ color: '#5f77a1' }}>
              {manage.Confirm[fin]}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog to remove user */}
        <Dialog
          open={this.state.openRemoveWarning}
          keepMounted
          onClose={this.handleRemoveWarningClose}
        >
          <DialogTitle
            id="dialog-remove-user-title"
            style={dialogStyle}
          >
            {manage.Ask[fin]}
          </DialogTitle>
          <DialogContent
            id="dialog-remove-user-contet"
            style={dialogStyle}
          >
            <DialogContentText
              id="dialog-remove-user-text"
            >
              {manage.AskDelete[fin]}
              {' '}
              {this.state.selectedUserName}
            </DialogContentText>

            {this.state.mokatPoistossa
              ? (
                <p style={{ fontSize: 20, color: 'red', textAlign: 'center' }}>
                  {manage.ErrorSmall[fin]}
                  {' '}

                </p>
              )
              : <p />}

          </DialogContent>
          <DialogActions
            style={dialogStyle}
          >
            <Button onClick={this.handleRemoveWarningClose} style={{ color: '#c97b7b' }}>
              {manage.Cancel[fin]}
            </Button>
            <Button onClick={this.handleRemoveWarningCloseAgree} style={{ color: '#5f77a1' }}>
              {manage.ConfirmDelete[fin]}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog to change password of own user */}
        <Dialog
          open={this.state.changeOwnPassDialogOpen}
          onClose={this.handleChangeOwnPassDialogClose}
        >
          <DialogTitle
            id="dialog-change-own-pass-title"
            style={dialogStyle}
          >
            {manage.ChangePass[fin]}
          </DialogTitle>
          <DialogContent
            style={dialogStyle}
          >
            <DialogContentText>
              {manage.Helper[fin]}
            </DialogContentText>

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
              <p style={{ fontSize: 20, color: 'red', textAlign: 'center' }}>
                {manage.Error[fin]}
                {' '}
              </p>
            ) : (
              <p />
            )}

          </DialogContent>
          <DialogActions
            style={dialogStyle}
          >
            <Button onClick={this.handleChangeOwnPassDialogClose} style={{ color: '#c97b7b' }}>
              {manage.Cancel[fin]}
            </Button>
            <Button onClick={this.handleChangeOwnPassDialogCloseAgree} style={{ color: '#5f77a1' }}>
              {manage.Confirm[fin]}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog to change password of other users */}
        <Dialog
          open={this.state.changePassDialogOpen}
          onClose={this.handleChangePassClose}
        >
          <DialogTitle
            id="dialog-change-pass-title"
            style={dialogStyle}
          >
            {manage.ChangeFor[fin]}
            {' '}
            {this.state.selectedUserName}
          </DialogTitle>
          <DialogContent
            style={dialogStyle}
          >
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
              <p style={{ fontSize: 20, color: 'red', textAlign: 'center' }}>
                {manage.Error[fin]}
                {' '}
              </p>
            ) : (
              <p />
            )}
          </DialogContent>
          <DialogActions
            style={dialogStyle}
          >
            <Button onClick={this.handleChangePassClose} style={{ color: '#c97b7b' }}>
              {manage.Cancel[fin]}
            </Button>
            <Button onClick={this.handleChangePassCloseConfirm} style={{ color: '#5f77a1' }}>
              {manage.Confirm[fin]}
            </Button>
          </DialogActions>
        </Dialog>

        {/* THE ACTUAL PAGE */}

        <h1 style={{ textAlign: 'center' }}>{manage.UserManage[fin]}</h1>
        <Divider />
        <Box style={{ justifyContent: 'center', display: 'flex', flexWrap: 'wrap' }}>
          <h3 style={{ textAlign: 'center' }}>
            {manage.ChangePass[fin]}
            :
          </h3>
          <Button onClick={this.handleOpenOwnPassChangeDialog} variant="contained" style={{ backgroundColor: '#5f77a1', margin: 15, textAlign: 'center' }}>
            {manage.ChangePass[fin]}
          </Button>
        </Box>
        <Divider />
        <Box style={{ justifyContent: 'center', display: 'flex', flexWrap: 'wrap' }}>
          <h3 style={{ textAlign: 'center' }}>
            {manage.CreateUser[fin]}
            :
          </h3>
          <Button onClick={this.handleAddUserOpenDialog} variant="contained" style={{ backgroundColor: '#5f77a1', margin: 15, textAlign: 'center' }}>
            {manage.CreateUser[fin]}
          </Button>
        </Box>
        <Divider />

        {/* USER PROFILES TABLE */}

        <h3 style={{ textAlign: 'center' }}>{`${manage.Users[fin]}:`}</h3>
        <Box style={{ justifyContent: 'center', display: 'flex', flexWrap: 'wrap' }}>

          <TableContainer component={Paper} style={{ maxWidth: 500, tableLayout: 'auto' }}>
            <Table aria-label="table of users" style={{ backgroundColor: '#F2F0EB' }}>
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
                    <TableCell align="justify" component="th" scope="row">
                      {row.name}
                      {' '}
                      <br />
                      {row.roleToPrint}
                    </TableCell>
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

export default withCookies(UserManagementView);
