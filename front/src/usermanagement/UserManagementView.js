import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import NiceInputPassword from 'react-nice-input-password';
import 'react-nice-input-password/dist/react-nice-input-password.css';

// axios for calls to backend
import axios from 'axios';

// Token validation
import { withCookies } from 'react-cookie';
import { validateLogin } from '../utils/Utils';
import translations from '../texts/texts.json';
import css from './UserManagementView.module.scss';

const classes = classNames.bind(css);

const fin = localStorage.getItem('language');
const { manage } = translations;

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

// Changes email to database
async function changeEmail(id, newEmail) {
  try {
    const response = await fetch(`/api/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        email: newEmail,
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

// Changes email to database
async function addEmail(id, emailn) {
  try {
    const response = await fetch(`/api/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        email: emailn,
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

// Changes role for user that is not a rangeofficer to database
async function changeRoleNotRangeofficer(id, newRole) {
  try {
    const response = await fetch(`/api/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        role: newRole,
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

// Changes role to rangeofficer and links an association to user in database
async function changeRoleAndAssociationForRangeofficer(id, newRole, newAssociationId) {
  if (!isNaN(parseInt(newAssociationId)) && 
      parseInt(newAssociationId) !== 0 && 
      parseInt(newAssociationId) !== id) {
    try {
      const response = await fetch(`/api/user/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          role: newRole,
          associationId: newAssociationId,
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (err) {
      console.error('UPDATING USER FAILED', err);
      return false;
    }
  } else {
    console.error('ASSOCIATION UNSPECIFIED');
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

// Add user that is not a rangeofficer to database
async function addUserNotRangeofficer(namen, rolen, passwordn, emailn) {
  try {
    const response = await fetch('/api/user/', {
      method: 'POST',
      body: JSON.stringify({
        name: namen,
        password: passwordn,
        role: rolen,
        email: emailn,
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

// Add rangeofficer to database
async function addUserRangeofficer(namen, rolen, passwordn, emailn, newAssociationId) {
  if (!isNaN(parseInt(newAssociationId)) && parseInt(newAssociationId) !== 0) {
    try {
      const response = await fetch('/api/user/', {
        method: 'POST',
        body: JSON.stringify({
          name: namen,
          password: passwordn,
          role: rolen,
          email: emailn,
          associationId: newAssociationId,
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (err) {
      console.error('CREATING RANGE OFFICER FAILED', err);
      return false;
    }
  } else {
    console.error('ASSOCIATION NOT SPECIFIED');
    return false;
  }
}

function UserManagementView(props)  {

  const[state, setState] = useState({
    userList: [],
    rows: [],
    openPassWarning: false, 
    openRemoveWarning: false,
    changeOwnPassDialogOpen: false,
    changeOwnEmailDialogOpen: false,
    openAddNewUserDialog: false,
    changePassDialogOpen: false,
    changeRoleDialogOpen: false,
    changeOwnPassFailed: false,
    changeOwnEmailFailed: false,
    requestErrors: false,
    deleteErrors: false,
    selectedROWID: 1,
    newUserName: '',
    newUserPass: '',
    role: 'association',
    associationId: 0,
    newUserPhone: '',
    password: '',
    oldPassword: '',
    newPassword: '',
    username: props.cookies.cookies.username,
    selectedUserName: '',
    email: '',
    myStorage: window.localStorage,
    addEmailDialogOpen: false,
    refresh: false,
    editingRows: {},
  });
  

  // is ran when component mounts
  useEffect(() => {
    validateLogin().then((logInSuccess) => {
      if(!logInSuccess){
        props.history.push('/');
      }
      else{
        getUsers().then((res) => {
          if(res !== false){
            res.sort((a, b) => {
              if(a.name < b.name) return -1;
              if(a.name > b.name) return 1;
              return 0;
            });
            setState({...state, userList: res});
          }
        }).catch((err) => {
          console.error('init failed', err);
        });
      }
    });
  }, []);

  // run update after fetched user data from back-end
  useEffect(() => {
    update();
  }, [state.userList]);

  // run if changes to users
  useEffect(() => {
    if(state.refresh){
      makeDataFreshAgain();
    }
  }, [state.refresh]);

  /**
   **  HANDLE DIALOGS
   **  opening and closings
   */

  // handles changing own password
  const handleChangeOwnPassDialogCloseAgree = async() => {
    const secure = window.location.protocol === 'https:';
    setState({...state, changeOwnPassFailed: false});
    let success = true;
    let response = await axios
      .post('api/sign', {
        name: state.username,
        password: state.oldPassword,
        secure: secure,
      })
      .catch(() => {
        success = false;
      });
    if (success) {
      response = await changePassword(findOwnID(), state.newPassword);
      if (response) {
        handleChangeOwnPassDialogClose();
      } else {
        setState({...state, changeOwnPassFailed: true});
      }
    } else {
      setState({...state, changeOwnPassFailed: true});
    }
  }

  // handles changing own email address
  const handleChangeOwnEmailDialogCloseAgree = async() => {
    setState({...state, changeOwnEmailFailed: false});
    const response = await changeEmail(findOwnID(), state.email);
    if (response) {
      setState({...state, 
        changeOwnEmailFailed: false,
        changeOwnEmailDialogOpen: false,
        refresh: true,
      });
    } else {
      setState({...state, changeOwnEmailFailed: true, refresh: true});
    }
  }

  // Handles adding new users
  const handleAddNewUserDialogCloseConfirmed = async() => {
    setState({...state, requestErrors: false});
    let req;
    if (state.role === "rangeofficer") {
      req = await addUserRangeofficer(
        state.newUserName,
        state.role,
        state.newUserPass,
        state.email,
        state.associationId,
      );
    } else {
      req = await addUserNotRangeofficer(
        state.newUserName,
        state.role,
        state.newUserPass,
        state.email,
      );
    }
    if (!req || req.errors !== undefined) {
      setState({...state, requestErrors: true});
    } else {
      setState({...state, 
        requestErrors: false,
        newUserName: '',
        newUserPass: '',
        role: 'association',
        associationId: 0,
        openAddNewUserDialog: false,
        refresh: true,
      });
    }
  }

  // Removes the user
  const handleRemoveWarningCloseAgree = async() => {
    setState({...state, deleteErrors: false});
    const response = await deleteUser(findUserId());
    if (response?.errors !== undefined) {
      setState({...state, deleteErrors: true});
    } else {
      setState({...state, 
        openRemoveWarning: false, 
        deleteErrors: false,
        refresh: true});
    }
  }

  // Closes dialog for changing password for some1 else
  const handleChangePassClose = (e) => {
    setState({...state,
      password: '',
      changePassDialogOpen: false,
      changeErrors: false});
  }

  // Changes password for some1 else by their ID
  const handleChangePassCloseConfirm = async() => {
    setState({...state, changeErrors: false});
    const response = await changePassword(
      findUserId(),
      state.password,
    );
    if (!response) {
      setState({...state, changeErrors: true});
    } else {
      setState({...state, 
        password: '', 
        changePassDialogOpen: false, 
        changeErrors: false});
    }
  }

  // Closes dialog for adding email for some1 else
  const handleaddEmailClose = (e) => {
    setState({...state,
      email: '',
      addEmailDialogOpen: false,
      changeErrors: false});
  }

  // Adds email for some1 else by their ID
  const handleaddEmailCloseConfirm = async() => {
    setState({...state, changeErrors: false});
    const response = await addEmail(findUserId(), state.email);
    if (!response) {
      setState({...state, changeErrors: true});
    } else {
      setState({...state, 
        email: '', 
        addEmailDialogOpen: false, 
        refresh: true,
        changeErrors: false});
    }
  }

  // Closes dialog for adding role for some1 else
  const handleChangeRoleClose = (e) => {
    setState({...state, 
      role: 'association',
      associationId: 0,
      changeRoleDialogOpen: false,
      changeErrors: false});
  }

  // Adds role for some1 else by their ID
  const handleChangeRoleCloseConfirm = async() => {
    setState({...state, changeErrors: false});
    let response;
    if (state.role === "rangeofficer") {
      response = await changeRoleAndAssociationForRangeofficer(findUserId(), state.role, state.associationId);
    } else {
      response = await changeRoleNotRangeofficer(findUserId(), state.role);
    }
    if (!response) {
      setState({...state, changeErrors: true});
    } else {
      setState({...state, 
        role: 'association', 
        associationId: 0,
        changeRoleDialogOpen: false, 
        refresh: true,
        changeErrors: false});
    }
  }

  // Handles the edit mode of the rows in the table of users
  // when edit button is clicked
  const handleEditClick = (rowId) => {

    // Checks the edit state of the selected row
    setState((prevState) => {
      const editState = !!prevState.editingRows[rowId];

      // Updates the edit state for the selected row in the editingRows object
      // If the row is in edit mode, the state will be set to false, if not
      // it will be set to true
      return {
        ...prevState,
        editingRows: {
          ...prevState.editingRows,
          [rowId]: !editState,
        }
      };
    });
  };

  const returnRemoveButton = (id, manage, fin) => {
    return (
      <Button
        data-testid={`del-${id}`}
        id={id}
        size="small"
        className={classes(css.removeButton)}
        variant="contained"
        onClick={onRemoveClick}
      >
        {manage.RemoveUser[fin]}
      </Button>
    );
  }

  const returnPassButton = (id, manage, fin) => {
    return (
      <Button
        data-testid={`pw-${id}`}
        id={id}
        size="small"
        className={classes(css.turquoiseButton)}
        variant="contained"
        onClick={onChangePassClick}
      >
        {manage.ChangePass[fin]}
      </Button>
    );
  }
  const returnaddEmailButton = (id, manage, fin) => {
    return (
      <Button
        id={id}
        size="small"
        className={classes(css.sandButton)}
        variant="contained"
        onClick={onaddEmailClick}
      >
        {manage.ChangeEmail[fin]}
      </Button>
    );
  }

  const returnRoleButton = (id, manage, fin) => {
    return (
      <Button
        id={id}
        size="small"
        className={classes(css.lightgreenButton)}
        variant="contained"
        onClick={onRoleClick}
      >
        {manage.ChangeRole[fin]}
      </Button>
    );
  }

  const createData = (
    name,
    role,
    email,
    id,
  ) => {
    const roleToPrint =
      role === 'superuser'
        ? manage.Superuser[fin]
        : role === 'association'
        ? manage.Association[fin]
        : role === 'rangeofficer'
        ? manage.Rangeofficer[fin]
        : role === 'rangemaster'
        ? manage.Rangemaster[fin]
        : null;

    return {
      name,
      roleToPrint,
      email,
      id,
    };
  }

  const makeDataFreshAgain = async() => {
    try {
      const response = await getUsers();
      if (response !== false) {
        response.sort((a, b) => {
          if(a.name < b.name) return -1;
          if(a.name > b.name) return 1;
          return 0;
        });
        setState({...state, userList: response, refresh: false});
      } else {
        console.error(
          'getting users failed, most likely sign in token invalid -> kicking to root',
        );
        props.history.push('/');
      }
    } catch (error) {
      console.error('init failed', error);
    }
  }

  // Close dialog for changing password
  const handlePassWarningClose = () => {
    setState({...state, openPassWarning: false});
  }

  // Close dialog for removing user
  const handleRemoveWarningClose = () => {
    setState({...state, openRemoveWarning: false, deleteErrors: false});
  }

  // Open dialog for adding new users
  const handleAddUserOpenDialog = () => {
    setState({...state, openAddNewUserDialog: true});
  }

  // closes dialog for adding users
  const handleAddNewUserDialogClose = () => {
    setState({...state, 
      requestErrors: false,
      newUserName: '',
      newUserPass: '',
      role: 'association',
      openAddNewUserDialog: false,
    });
  }

  // opens dialog for changing logged in users password
  const handleOpenOwnPassChangeDialog = () => {
    setState({...state, changeOwnPassDialogOpen: true});
  }

  // opens dialog for changing logged in users email
  const handleOpenOwnEmailChangeDialog = () => {
    setState({...state, changeOwnEmailDialogOpen: true});
  }

  // opens dialog for adding email
  const handleaddEmailDialog = () => {
    setState({...state, addEmailDialogOpen: true});
  }

  // Closes dialog for adding email
  const handleaddEmailDialogClose = () => {
    setState({...state, addEmailDialogOpen: false});
  }

  // closes dialog for changing own password
  const handleChangeOwnPassDialogClose = () => {
    setState({...state,
      changeOwnPassFailed: false, 
      changeOwnPassDialogOpen: false,
    });
  }

  // closes dialog for changing own email
  const handleChangeOwnEmailDialogClose = () => {
    setState({...state, 
      changeOwnEmailFailed: false,
      changeOwnEmailDialogOpen: false,
    });
  }

  /**
   **  HANDLE STATE CHANGES
   */

  // handles state change for oldpassword
  const handleOldpassStringChange = (e) => {
    setState({...state, oldPassword: e.target.value});
  }

  // handles state change for newpassword
  const handleNewpassStringChange = (e) => {
    setState({...state, newPassword: e.target.value});
  }

  // handles state change for newpassword securely
  const handleNewSecurePassStringChange = (data) => {
    console.log('Password:', data.value);
    setState({...state, newPassword: data.value});
  }

  // handle state email change
  const handleNewEmailChange = (e) => {
    setState({...state, email: e.target.value});
  }

  // handles state change for new users name
  const handleNewuserNameChange = (e) => {
    setState({...state, newUserName: e.target.value});
  }

  // handles state change for new users role
  const handleChangeUserRole = (e) => {
    setState({...state, role: e.target.value});
  }

  // handles state change for rangeofficer association
  const handleChangeAssociation = (e) => {
    setState({...state, associationId: e.target.value});
  }

  // handles state change for new users password
  const handleNewuserPassChange = (e) => {
    setState({...state, newUserPass: e.target.value});
  }

  // handles state change for new users password securely
  const handleNewuserSecurePassChange = (data) => {
    //console.log('Password:', data.value);
    setState({...state, newUserPass: data.value});
  }

  /**
   **  FUNCTIONS
   */

  // changes selectedUserName after selectedROWID changes
  useEffect(() => {
    const name = findUserName();
    setState({...state, selectedUserName: name});
  }, [state.selectedROWID]);

  // Opens warning for removing user
  const onRemoveClick = (e) => {
    setState({...state, selectedROWID: e.currentTarget.id, openRemoveWarning: true});
  }

  // Opens dialog for changing password for some1 else
  const onChangePassClick = (e) => {
    setState({...state, selectedROWID: e.currentTarget.id, changePassDialogOpen: true});
  }

  // Opens dialog for adding or changing email for someone else
  const onaddEmailClick = (e) => {
    setState({...state, selectedROWID: e.currentTarget.id, addEmailDialogOpen: true});
  }

  // Opens dialog for changing user role for someone else
  const onRoleClick = (e) => {
    setState({...state, selectedROWID: e.currentTarget.id, changeRoleDialogOpen: true});
  }

  /**
   **ALGORITHMS
   */

  const findUserName = () => {
    for (const i in state.userList) {
      if (state.userList[i].id === parseInt(state.selectedROWID)) {
        return state.userList[i].name;
      }
    }
    return 'Username not found';
  }

  const findUserId = () => {
    for (const i in state.userList) {
      if (state.userList[i].id === parseInt(state.selectedROWID)) {
        return state.userList[i].id;
      }
    }
    return undefined;
  }

  const findOwnID = () => {
    for (const i in state.userList) {
      if (state.username === state.userList[i].name) {
        return state.userList[i].id;
      }
    }
    return null;
  }

  const findOwnEmail = () => {
    for (const i in state.userList) {
      if (state.username === state.userList[i].name) {
        return state.userList[i].email;
      }
    }
    return null;
  }

  const update = () => {
    const tempRows = [];
    for (const i in state.userList) {
      if (state.username !== state.userList[i].name) {
        const row = createData(
          state.userList[i].name,
          state.userList[i].role,
          state.userList[i].email,
          state.userList[i].id,
        );
        tempRows.push(row);
      }
    }
    setState({...state, rows: tempRows});
  }

  const roleSelect = () => (
    <div className="roleSelect">
      <FormControl>
        <InputLabel id="role-select-label">{manage.Role[fin]}</InputLabel>
        <Select
          labelId="role-select-label"
          className={classes(css.select)}
          native
          value={state.role}
          onChange={handleChangeUserRole}
          id="role"
        >
          <option value="rangeofficer">{manage.Rangeofficer[fin]}</option>
          <option value="association">{manage.Association[fin]}</option>
          <option value="superuser">{manage.Superuser[fin]}</option>
        </Select>
      </FormControl>
        <br />
        <br />
        {associationSelect()}    
    </div>
  )

  // handles selecting association for range officer
  const associationSelect = () => (
    <div>
      <FormControl>
        {/** Only shown when selected role is range officer */}
        {state.role === "rangeofficer" && (
          <>
            <InputLabel id="association-select-label">{manage.Association[fin]}</InputLabel>
            <Select
              labelId="association-select-label"
              className={classes(css.select)}
              native
              value={state.associationId}
              onChange={handleChangeAssociation}
            >
              <option key="0" value="0">  
                --{manage.SelectAssociation[fin]}--
              </option>
              {state.userList.map(user => {
                if (user.role === "association") {
                  return (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  )
                }
              })}
            </Select>
          </>
        )}
      </FormControl>
    </div>
  )

  /**
   **  ACTUAL PAGE RENDERING
   */
  const fin = localStorage.getItem('language');
  return (
    <div>
      {/* Dialog to add new user */}
      <Dialog
        open={state.openAddNewUserDialog}
        keepMounted
        onClose={handleAddNewUserDialogClose}
      >
        <DialogTitle
          id="dialog-add-user-title"
          className={classes(css.dialogStyle)}
        >
          {manage.New[fin]}
        </DialogTitle>
        <DialogContent className={classes(css.dialogStyle)}>
          <TextField
            value={state.newUserName}
            margin="dense"
            id="name"
            label={manage.Username[fin]}
            onChange={handleNewuserNameChange}
            fullWidth
          />

          <br></br>
          <br></br>

          <NiceInputPassword
            LabelComponent={InputLabel}
            InputComponent={TextField}
            className={classes(css.dialogStyle)}
            value={state.newUserPass}
            margin="dense"
            label={manage.Password[fin]}
            name="passwordField"
            fullWidth
            securityLevels={[
              {
                descriptionLabel:
                  manage.Minimum[fin] + ' 1 ' + manage.PasswordNumber[fin],
                validator: /.*[0-9].*/,
              },
              {
                descriptionLabel:
                  manage.Minimum[fin] + ' 1 ' + manage.PasswordLowercase[fin],
                validator: /.*[a-z].*/,
              },
              {
                descriptionLabel:
                  manage.Minimum[fin] + ' 1 ' + manage.PasswordUppercase[fin],
                validator: /.*[A-Z].*/,
              },
              {
                descriptionLabel: manage.MinimumLength[fin],
                validator: /^.{6,}$/,
              },
            ]}
            showSecurityLevelBar
            showSecurityLevelDescription
            onChange={handleNewuserSecurePassChange}
          />

          <TextField
            value={state.email}
            margin="dense"
            id="sposti"
            label={manage.Email[fin]}
            onChange={handleNewEmailChange}
            fullWidth
          />

          {roleSelect()}

          {state.requestErrors ? (
            <p className={classes(css.errorText)}>{manage.Error[fin]} </p>
          ) : (
            <p />
          )}
        </DialogContent>
        <DialogActions className={classes(css.dialogStyle)}>
          <Button
            onClick={handleAddNewUserDialogClose}
            className={classes(css.removeButton)}
          >
            {manage.Cancel[fin]}
          </Button>
          <Button
            onClick={handleAddNewUserDialogCloseConfirmed}
            className={classes(css.acceptButton)}
          >
            {manage.Confirm[fin]}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to remove user */}
      <Dialog
        open={state.openRemoveWarning}
        keepMounted
        onClose={handleRemoveWarningClose}
      >
        <DialogTitle
          id="dialog-remove-user-title"
          className={classes(css.dialogStyle)}
        >
          {manage.Ask[fin]}
        </DialogTitle>
        <DialogContent
          id="dialog-remove-user-contet"
          className={classes(css.dialogStyle)}
        >
          <DialogContentText id="dialog-remove-user-text">
            {manage.AskDelete[fin]} {state.selectedUserName}
          </DialogContentText>

          {state.deleteErrors ? (
            <p className={classes(css.errorText)}>
              {manage.ErrorSmall[fin]}{' '}
            </p>
          ) : (
            <p />
          )}
        </DialogContent>
        <DialogActions className={classes(css.dialogStyle)}>
          <Button
            onClick={handleRemoveWarningClose}
            className={classes(css.removeButton)}
          >
            {manage.Cancel[fin]}
          </Button>
          <Button
            onClick={handleRemoveWarningCloseAgree}
            className={classes(css.acceptButton)}
          >
            {manage.ConfirmDelete[fin]}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to change password of own user */}
      <Dialog
        open={state.changeOwnPassDialogOpen}
        onClose={handleChangeOwnPassDialogClose}
      >
        <DialogTitle
          id="dialog-change-own-pass-title"
          className={classes(css.dialogStyle)}
        >
          {manage.ChangePass[fin]}
        </DialogTitle>
        <DialogContent className={classes(css.dialogStyle)}>
          <DialogContentText>{manage.Helper[fin]}</DialogContentText>

          <TextField
            type="password"
            value={state.oldPassword}
            margin="dense"
            id="oldpassword"
            label={manage.OldPass[fin]}
            onChange={handleOldpassStringChange}
            fullWidth
          />

          <br></br>
          <br></br>

          <NiceInputPassword
            type="password"
            LabelComponent={InputLabel}
            InputComponent={TextField}
            className={classes(css.dialogStyle)}
            value={state.newPassword}
            margin="dense"
            label={manage.NewPass[fin]}
            name="passwordField"
            fullWidth
            securityLevels={[
              {
                descriptionLabel:
                  manage.Minimum[fin] + ' 1 ' + manage.PasswordNumber[fin],
                validator: /.*[0-9].*/,
              },
              {
                descriptionLabel:
                  manage.Minimum[fin] + ' 1 ' + manage.PasswordLowercase[fin],
                validator: /.*[a-z].*/,
              },
              {
                descriptionLabel:
                  manage.Minimum[fin] + ' 1 ' + manage.PasswordUppercase[fin],
                validator: /.*[A-Z].*/,
              },
              {
                descriptionLabel: manage.MinimumLength[fin],
                validator: /^.{6,}$/,
              },
            ]}
            showSecurityLevelBar
            showSecurityLevelDescription
            onChange={handleNewSecurePassStringChange}
          />

          {state.changeOwnPassFailed ? (
            <p className={classes(css.errorText)}>
              {manage.ErrorPassword[fin]}{' '}
            </p>
          ) : (
            <p />
          )}
        </DialogContent>
        <DialogActions className={classes(css.dialogStyle)}>
          <Button
            onClick={handleChangeOwnPassDialogClose}
            className={classes(css.removeButton)}
          >
            {manage.Cancel[fin]}
          </Button>
          <Button
            onClick={handleChangeOwnPassDialogCloseAgree}
            className={classes(css.acceptButton)}
          >
            {manage.Confirm[fin]}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to change email of own user */}
      <Dialog
        open={state.changeOwnEmailDialogOpen}
        onClose={handleChangeOwnEmailDialogClose}
      >
        <DialogTitle
          id="dialog-change-own-email-title"
          className={classes(css.dialogStyle)}
        >
          {manage.ChangeEmail[fin]}
        </DialogTitle>
        <DialogContent className={classes(css.dialogStyle)}>
          <DialogContentText>{manage.EmailHelper[fin]}</DialogContentText>

          <div>{`${manage.OldEmail[fin]}: ${findOwnEmail()}`}</div>
          <TextField
            type="text"
            value={state.newemail}
            margin="dense"
            id="newemail"
            label={manage.ChangeEmail[fin]}
            onChange={handleNewEmailChange}
            fullWidth
          />

          {state.changeOwnEmailFailed ? (
            <p className={classes(css.errorText)}>{manage.Error[fin]} </p>
          ) : (
            <p />
          )}
        </DialogContent>
        <DialogActions className={classes(css.dialogStyle)}>
          <Button
            onClick={handleChangeOwnEmailDialogClose}
            className={classes(css.removeButton)}
          >
            {manage.Cancel[fin]}
          </Button>
          <Button
            onClick={handleChangeOwnEmailDialogCloseAgree}
            className={classes(css.accceptButton)}
          >
            {manage.Confirm[fin]}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to change password of other users */}
      <Dialog
        open={state.changePassDialogOpen}
        onClose={handleChangePassClose}
      >
        <DialogTitle
          id="dialog-change-pass-title"
          className={classes(css.dialogStyle)}
        >
          {manage.ChangeFor[fin]} {state.selectedUserName}
        </DialogTitle>
        <DialogContent className={classes(css.dialogStyle)}>
          <NiceInputPassword
            type="text"
            LabelComponent={InputLabel}
            InputComponent={TextField}
            className={classes(css.dialogStyle)}
            value={state.password}
            margin="dense"
            label={manage.NewPass[fin]}
            name="passwordField"
            fullWidth
            securityLevels={[
              {
                descriptionLabel:
                  manage.Minimum[fin] + ' 1 ' + manage.PasswordNumber[fin],
                validator: /.*[0-9].*/,
              },
              {
                descriptionLabel:
                  manage.Minimum[fin] + ' 1 ' + manage.PasswordLowercase[fin],
                validator: /.*[a-z].*/,
              },
              {
                descriptionLabel:
                  manage.Minimum[fin] + ' 1 ' + manage.PasswordUppercase[fin],
                validator: /.*[A-Z].*/,
              },
              {
                descriptionLabel: manage.MinimumLength[fin],
                validator: /^.{6,}$/,
              },
            ]}
            showSecurityLevelBar
            showSecurityLevelDescription
            onChange={(e) => {
              console.log('password: ' + e.value);
              setState({...state, password: e.value });
            }}
          />

          {state.changeErrors ? (
            <p className={classes(css.errorText)}>
              {manage.ErrorPassword[fin]}{' '}
            </p>
          ) : (
            <p />
          )}
        </DialogContent>
        <DialogActions className={classes(css.dialogStyle)}>
          <Button
            onClick={handleChangePassClose}
            className={classes(css.removeButton)}
          >
            {manage.Cancel[fin]}
          </Button>
          <Button
            onClick={handleChangePassCloseConfirm}
            className={classes(css.acceptButton)}
          >
            {manage.Confirm[fin]}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to Add Email for users */}
      <Dialog
        open={state.addEmailDialogOpen}
        onClose={handleaddEmailClose}
      >
        <DialogTitle
          id="dialog-add-email-title"
          className={classes(css.dialogStyle)}
        >
          {manage.EmailForUser[fin]} {state.selectedUserName}
        </DialogTitle>
        <DialogContent className={classes(css.dialogStyle)}>
          <TextField
            type="text"
            value={state.email}
            margin="dense"
            id="name"
            label={manage.ChangeEmail[fin]}
            onChange={(e) => {
              setState({...state, email: e.target.value });
            }}
            fullWidth
          />
          {state.changeErrors ? (
            <p className={classes(css.errorText)}>
              {manage.ErrorEmail[fin]}{' '}
            </p>
          ) : (
            <p />
          )}
        </DialogContent>
        <DialogActions className={classes(css.dialogStyle)}>
          <Button
            onClick={handleaddEmailClose}
            className={classes(css.removeButton)}
          >
            {manage.Cancel[fin]}
          </Button>
          <Button
            onClick={handleaddEmailCloseConfirm}
            className={classes(css.acceptButton)}
          >
            {manage.Confirm[fin]}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to change role for users */}
      <Dialog
        open={state.changeRoleDialogOpen}
        onClose={handleChangeRoleClose}
      >
        <DialogTitle
          id="dialog-change-role-title"
          className={classes(css.dialogStyle)}
        >
          {manage.RoleForUser[fin]} {state.selectedUserName}
        </DialogTitle>
        <DialogContent className={classes(css.dialogStyle)}>
          {roleSelect()}
          {state.changeErrors ? (
            <p className={classes(css.errorText)}>
              {manage.ErrorRole[fin]}{' '}
            </p>
          ) : (
            <p />
          )}
        </DialogContent>
        <DialogActions className={classes(css.dialogStyle)}>
          <Button
            onClick={handleChangeRoleClose}
            className={classes(css.removeButton)}
          >
            {manage.Cancel[fin]}
          </Button>
          <Button
            onClick={handleChangeRoleCloseConfirm}
            className={classes(css.acceptButton)}
          >
            {manage.Confirm[fin]}
          </Button>
        </DialogActions>
      </Dialog>

      {/* THE ACTUAL PAGE */}
      <h1 className={classes(css.header)}>{manage.UserManage[fin]}</h1>
      <Box className={classes(css.LoggedIn)}>
        <div>{manage.LoggedIn[fin]}: <span style={{fontWeight:"bold"}}>{state.username}</span></div>
        <div className={classes(css.buttonContainer)}>
          <Button
            onClick={handleOpenOwnEmailChangeDialog}
            variant="contained"
            className={classes(css.sandButton)}
          >
            {manage.ChangeEmail[fin]}
          </Button>
          <Button
            onClick={handleOpenOwnPassChangeDialog}
            variant="contained"
            className={classes(css.turquoiseButton)}
          >
            {manage.ChangePass[fin]}
          </Button>
        </div>
      </Box>

      {/* USER PROFILES TABLE */}

      {/* for larger devices only*/}
      <div className={classes(css.usersHeaderDesk)}>
        <h2 className={classes(css.header)}>{manage.Users[fin]}</h2>
      </div>
      {/* for smaller devices only */}
      <div className={classes(css.usersHeaderMobile)}>
        <h3 className={classes(css.header)}>{manage.Users[fin]}</h3>
        <Button
          onClick={handleAddUserOpenDialog}
          variant="contained"
          className={css.lightgreenButton}
        >
          {manage.CreateUser[fin]}
        </Button>
      </div>
      <Box className={classes(css.userbox)}>
        <TableContainer
          component={Paper}
          className={classes(css.tableContainer)}
        >
          <Table aria-label="table of users" className={classes(css.table)}>
            <TableHead className={classes(css.tableHead)}>
              <TableRow>
                <TableCell align="left" style={{fontWeight: 'bold', width: '300px'}}>
                  {manage.User[fin]}
                </TableCell>
                <TableCell 
                  align="left" 
                  style={{fontWeight: 'bold', width: '200px'}} 
                  className={classes(css.tableCellDesk)}
                >
                  {manage.Role[fin]}
                </TableCell>
                <TableCell 
                  align="left" 
                  style={{fontWeight: 'bold', width: '100px'}} 
                  className={classes(css.tableCellDesk)}
                >
                  {manage.Association[fin]}
                </TableCell>
                <TableCell align="right"></TableCell>
                <TableCell 
                  align="right" 
                  style={{width: '100px'}}
                  className={classes(css.tableCellDesk)}
                >
                  <Button
                    onClick={handleAddUserOpenDialog}
                    variant="contained"
                    className={css.lightgreenButton}
                  >
                    {manage.CreateUser[fin]}
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.rows.map((row) => 
                <TableRow key={row.name} hover>
                  <TableCell align="justify" component="th" scope="row">
                    {row.name}
                    <br /> 
                    {row.email} 
                    {state.editingRows[row.id] && (
                      <Button onClick={onaddEmailClick}> 
                        <EditIcon style={{fontSize: 'large'}}/>
                      </Button>
                    )}
                    {/* only for small devices */}
                    <div className={classes(css.tableCellMobile)}>
                      <br />
                      <div>
                        <span style={{fontWeight:'bold'}}>{manage.Role[fin]}: </span> {row.roleToPrint}
                        {state.editingRows[row.id] && (
                          <Button onClick={onRoleClick}> 
                            <EditIcon style={{fontSize: 'large'}}/>
                          </Button>
                        )}
                      </div>
                      <div>
                        <span style={{fontWeight:'bold'}}>{manage.Association[fin]}: </span> 
                        {/* Need to add printing of association name */}
                      </div>
                      <br />  
                      <div className={classes(css.buttonsMobile)}>
                        {state.editingRows[row.id] && (
                          returnPassButton(row.id, manage, fin)
                        )}
                        {state.editingRows[row.id] && (
                          returnRemoveButton(row.id, manage, fin)
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell align="justify" className={classes(css.tableCellDesk)}>
                    {row.roleToPrint}
                    {state.editingRows[row.id] && (
                      <Button onClick={onRoleClick}> 
                        <EditIcon style={{fontSize: 'large'}}/>
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className={classes(css.tableCellDesk)}>
                    {/* Need to add printing of association name */}
                    {row.associationId}
                  </TableCell>
                  <TableCell align="right" className={classes(css.tableCellDesk)}>
                    <div className={classes(css.buttonCell)}>
                      {state.editingRows[row.id] && (
                        returnPassButton(row.id, manage, fin)
                      )}
                      {state.editingRows[row.id] && (
                        returnRemoveButton(row.id, manage, fin)
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    {manage.Edit[fin]}
                    <Button onClick={() => handleEditClick(row.id)}>
                      {!state.editingRows[row.id] 
                        ? <EditIcon style={{fontSize: 'large'}}/> 
                        : <EditOffIcon style={{fontSize: 'large'}}/>
                      }
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
}

export default withCookies(UserManagementView);
