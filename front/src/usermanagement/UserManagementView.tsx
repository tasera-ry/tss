import classNames from 'classnames';
import { useEffect, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
// Material UI components
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import NiceInputPassword from 'react-nice-input-password';
import 'react-nice-input-password/dist/react-nice-input-password.css';

// axios for calls to backend
import axios from 'axios';

import { useLingui } from '@lingui/react/macro';
// Token validation
import { withCookies } from 'react-cookie';
import { validateLogin } from '../utils/Utils';
import css from './UserManagementView.module.scss';

import { useHistory } from 'react-router-dom';
import api from '../api/api';

const classes = classNames.bind(css);

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
async function changeRoleAndAssociationForRangeofficer(
  id,
  newRole,
  newAssociationId,
) {
  if (
    !Number.isNaN(Number.parseInt(newAssociationId)) &&
    Number.parseInt(newAssociationId) !== 0 &&
    Number.parseInt(newAssociationId) !== id
  ) {
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
async function addUserRangeofficer(
  namen,
  rolen,
  passwordn,
  emailn,
  newAssociationId,
) {
  if (
    !Number.isNaN(Number.parseInt(newAssociationId)) &&
    Number.parseInt(newAssociationId) !== 0
  ) {
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

function UserManagementView(props) {
  const { t } = useLingui();
  const history = useHistory();

  const [state, setState] = useState({
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
    rangeOfficers: [],
  });

  // is ran when component mounts
  useEffect(() => {
    validateLogin().then((logInSuccess) => {
      if (!logInSuccess) {
        history.push('/');
      } else {
        getUsers()
          .then((res) => {
            if (res !== false) {
              res.sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
              });
              setState({ ...state, userList: res });
            }
          })
          .catch((err) => {
            console.error('init failed', err);
          });
      }
    });
  }, [state, history]);

  // run update and fetchAssociation after fetched user data from back-end
  useEffect(() => {
    update();

    const rangeofficerIds = state.userList
      .filter((user) => user.role === 'rangeofficer')
      .map((user) => user.id);

    if (rangeofficerIds.length > 0) {
      fetchAssociation(rangeofficerIds);
    }
  }, [state.userList]);

  // run if changes to users
  useEffect(() => {
    if (state.refresh) {
      makeDataFreshAgain();
    }
  }, [state.refresh]);

  /**
   **  HANDLE DIALOGS
   **  opening and closings
   */

  // handles changing own password
  const handleChangeOwnPassDialogCloseAgree = async () => {
    const secure = window.location.protocol === 'https:';
    setState({ ...state, changeOwnPassFailed: false });
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
        setState({ ...state, changeOwnPassFailed: true });
      }
    } else {
      setState({ ...state, changeOwnPassFailed: true });
    }
  };

  // handles changing own email address
  const handleChangeOwnEmailDialogCloseAgree = async () => {
    setState({ ...state, changeOwnEmailFailed: false });
    const response = await changeEmail(findOwnID(), state.email);
    if (response) {
      setState({
        ...state,
        changeOwnEmailFailed: false,
        changeOwnEmailDialogOpen: false,
        refresh: true,
      });
    } else {
      setState({ ...state, changeOwnEmailFailed: true, refresh: true });
    }
  };

  // Handles adding new users
  const handleAddNewUserDialogCloseConfirmed = async () => {
    setState({ ...state, requestErrors: false });
    let req;
    if (state.role === 'rangeofficer') {
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
      setState({ ...state, requestErrors: true });
    } else {
      setState({
        ...state,
        requestErrors: false,
        newUserName: '',
        newUserPass: '',
        role: 'association',
        associationId: 0,
        openAddNewUserDialog: false,
        refresh: true,
      });
    }
  };

  // Removes the user
  const handleRemoveWarningCloseAgree = async () => {
    setState({ ...state, deleteErrors: false });
    const response = await deleteUser(findUserId());
    if (response?.errors !== undefined) {
      setState({ ...state, deleteErrors: true });
    } else {
      setState({
        ...state,
        openRemoveWarning: false,
        deleteErrors: false,
        refresh: true,
      });
    }
  };

  // Closes dialog for changing password for some1 else
  const handleChangePassClose = (e) => {
    setState({
      ...state,
      password: '',
      changePassDialogOpen: false,
      changeErrors: false,
    });
  };

  // Changes password for some1 else by their ID
  const handleChangePassCloseConfirm = async () => {
    setState({ ...state, changeErrors: false });
    const response = await changePassword(findUserId(), state.password);
    if (!response) {
      setState({ ...state, changeErrors: true });
    } else {
      setState({
        ...state,
        password: '',
        changePassDialogOpen: false,
        changeErrors: false,
      });
    }
  };

  // Closes dialog for adding email for some1 else
  const handleaddEmailClose = (e) => {
    setState({
      ...state,
      email: '',
      addEmailDialogOpen: false,
      changeErrors: false,
    });
  };

  // Adds email for some1 else by their ID
  const handleaddEmailCloseConfirm = async () => {
    setState({ ...state, changeErrors: false });
    const response = await addEmail(findUserId(), state.email);
    if (!response) {
      setState({ ...state, changeErrors: true });
    } else {
      setState({
        ...state,
        email: '',
        addEmailDialogOpen: false,
        refresh: true,
        changeErrors: false,
      });
    }
  };

  // Closes dialog for adding role for some1 else
  const handleChangeRoleClose = (e) => {
    setState({
      ...state,
      role: 'association',
      associationId: 0,
      changeRoleDialogOpen: false,
      changeErrors: false,
    });
  };

  // Adds role for some1 else by their ID
  const handleChangeRoleCloseConfirm = async () => {
    setState({ ...state, changeErrors: false });
    let response;
    if (state.role === 'rangeofficer') {
      response = await changeRoleAndAssociationForRangeofficer(
        findUserId(),
        state.role,
        state.associationId,
      );
    } else {
      response = await changeRoleNotRangeofficer(findUserId(), state.role);
    }
    if (!response) {
      setState({ ...state, changeErrors: true });
    } else {
      setState({
        ...state,
        role: 'association',
        associationId: 0,
        changeRoleDialogOpen: false,
        refresh: true,
        changeErrors: false,
      });
    }
  };

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
        },
      };
    });
  };

  const returnRemoveButton = (id) => {
    return (
      <Button
        data-testid={`del-${id}`}
        id={id}
        size="small"
        className={classes(css.removeButton)}
        variant="contained"
        onClick={onRemoveClick}
      >
        {t`Delete profile`}
      </Button>
    );
  };

  const returnPassButton = (id) => {
    return (
      <Button
        data-testid={`pw-${id}`}
        id={id}
        size="small"
        className={classes(css.turquoiseButton)}
        variant="contained"
        onClick={onChangePassClick}
      >
        {t`Change password`}
      </Button>
    );
  };

  const createData = (name, role, email, id) => {
    const roleToPrint =
      role === 'superuser'
        ? t`Superuser`
        : role === 'association'
          ? t`Association`
          : role === 'rangeofficer'
            ? t`Range officer`
            : role === 'rangemaster'
              ? t`Range master`
              : null;

    return {
      name,
      roleToPrint,
      email,
      id,
    };
  };

  const printAssociationName = (id) => {
    const rangeofficer = state.rangeOfficers.find(
      (officer) => officer.id === id,
    );

    if (rangeofficer) {
      return rangeofficer.association_name || 'No association';
    }
    return null;
  };

  const makeDataFreshAgain = async () => {
    try {
      const response = await getUsers();
      if (response !== false) {
        response.sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        });
        setState({ ...state, userList: response, refresh: false });
      } else {
        console.error(
          'getting users failed, most likely sign in token invalid -> kicking to root',
        );
        props.history.push('/');
      }
    } catch (error) {
      console.error('init failed', error);
    }
  };

  // Close dialog for changing password
  const handlePassWarningClose = () => {
    setState({ ...state, openPassWarning: false });
  };

  // Close dialog for removing user
  const handleRemoveWarningClose = () => {
    setState({ ...state, openRemoveWarning: false, deleteErrors: false });
  };

  // Open dialog for adding new users
  const handleAddUserOpenDialog = () => {
    setState({ ...state, openAddNewUserDialog: true });
  };

  // closes dialog for adding users
  const handleAddNewUserDialogClose = () => {
    setState({
      ...state,
      requestErrors: false,
      newUserName: '',
      newUserPass: '',
      role: 'association',
      openAddNewUserDialog: false,
    });
  };

  // opens dialog for changing logged in users password
  const handleOpenOwnPassChangeDialog = () => {
    setState({ ...state, changeOwnPassDialogOpen: true });
  };

  // opens dialog for changing logged in users email
  const handleOpenOwnEmailChangeDialog = () => {
    setState({ ...state, changeOwnEmailDialogOpen: true });
  };

  // opens dialog for adding email
  const handleaddEmailDialog = () => {
    setState({ ...state, addEmailDialogOpen: true });
  };

  // Closes dialog for adding email
  const handleaddEmailDialogClose = () => {
    setState({ ...state, addEmailDialogOpen: false });
  };

  // closes dialog for changing own password
  const handleChangeOwnPassDialogClose = () => {
    setState({
      ...state,
      changeOwnPassFailed: false,
      changeOwnPassDialogOpen: false,
    });
  };

  // closes dialog for changing own email
  const handleChangeOwnEmailDialogClose = () => {
    setState({
      ...state,
      changeOwnEmailFailed: false,
      changeOwnEmailDialogOpen: false,
    });
  };

  /**
   **  HANDLE STATE CHANGES
   */

  // handles state change for oldpassword
  const handleOldpassStringChange = (e) => {
    setState({ ...state, oldPassword: e.target.value });
  };

  // handles state change for newpassword
  const handleNewpassStringChange = (e) => {
    setState({ ...state, newPassword: e.target.value });
  };

  // handles state change for newpassword securely
  const handleNewSecurePassStringChange = (data) => {
    console.log('Password:', data.value);
    setState({ ...state, newPassword: data.value });
  };

  // handle state email change
  const handleNewEmailChange = (e) => {
    setState({ ...state, email: e.target.value });
  };

  // handles state change for new users name
  const handleNewuserNameChange = (e) => {
    setState({ ...state, newUserName: e.target.value });
  };

  // handles state change for new users role
  const handleChangeUserRole = (e) => {
    setState({ ...state, role: e.target.value });
  };

  // handles state change for rangeofficer association
  const handleChangeAssociation = (e) => {
    setState({ ...state, associationId: e.target.value });
  };

  // handles state change for new users password
  const handleNewuserPassChange = (e) => {
    setState({ ...state, newUserPass: e.target.value });
  };

  // handles state change for new users password securely
  const handleNewuserSecurePassChange = (data) => {
    //console.log('Password:', data.value);
    setState({ ...state, newUserPass: data.value });
  };

  /**
   **  FUNCTIONS
   */

  // changes selectedUserName after selectedROWID changes
  useEffect(() => {
    const name = findUserName();
    setState({ ...state, selectedUserName: name });
  }, [state]);

  // Opens warning for removing user
  const onRemoveClick = (e) => {
    setState({
      ...state,
      selectedROWID: e.currentTarget.id,
      openRemoveWarning: true,
    });
  };

  // Opens dialog for changing password for some1 else
  const onChangePassClick = (e) => {
    setState({
      ...state,
      selectedROWID: e.currentTarget.id,
      changePassDialogOpen: true,
    });
  };

  // Opens dialog for adding or changing email for someone else
  const onaddEmailClick = (e) => {
    setState({
      ...state,
      selectedROWID: e.currentTarget.id,
      addEmailDialogOpen: true,
    });
  };

  // Opens dialog for changing user role for someone else
  const onRoleClick = (e) => {
    setState({
      ...state,
      selectedROWID: e.currentTarget.id,
      changeRoleDialogOpen: true,
    });
  };

  /**
   **ALGORITHMS
   */

  const findUserName = () => {
    for (const i in state.userList) {
      if (state.userList[i].id === Number.parseInt(state.selectedROWID)) {
        return state.userList[i].name;
      }
    }
    return 'Username not found';
  };

  const findUserId = () => {
    for (const i in state.userList) {
      if (state.userList[i].id === Number.parseInt(state.selectedROWID)) {
        return state.userList[i].id;
      }
    }
    return undefined;
  };

  const findOwnID = () => {
    for (const i in state.userList) {
      if (state.username === state.userList[i].name) {
        return state.userList[i].id;
      }
    }
    return null;
  };

  const findOwnEmail = () => {
    for (const i in state.userList) {
      if (state.username === state.userList[i].name) {
        return state.userList[i].email;
      }
    }
    return null;
  };

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
    setState({ ...state, rows: tempRows });
  };

  // Fetch the id of the association which range officer
  // is associated with and update the state
  const fetchAssociation = async (rangeofficerIds) => {
    const rangeofficers = [];
    for (const id of rangeofficerIds) {
      try {
        const rangeOfficer = state.userList.find((user) => user.id === id);
        const response = await api.getAssociation(id);
        const associationId = response[0].association_id;

        // Find the association in the userList
        const association = state.userList.find(
          (user) => user.id === associationId,
        );

        // Add data into an array
        rangeofficers.push({
          id,
          name: rangeOfficer.name, // range officer's name
          association_name: association.name || null, // association's name
        });
      } catch (error) {
        console.log(
          `Failed to fetch association for range officer ${id}`,
          error,
        );
      }
    }
    // Update the state for range officers when associations are fetched
    setState((prevState) => ({ ...prevState, rangeOfficers: rangeofficers }));
  };

  const roleSelect = () => (
    <div className="roleSelect">
      <FormControl className={classes(css.selectRole)}>
        <InputLabel id="role-select-label">{t`Select role`}</InputLabel>
        <Select
          labelId="role-select-label"
          label={t`Select role`}
          value={state.role || ''}
          onChange={handleChangeUserRole}
          id="role"
        >
          <MenuItem value="rangeofficer">{t`Range officer`}</MenuItem>
          <MenuItem value="association">{t`Association`}</MenuItem>
          <MenuItem value="superuser">{t`Superuser`}</MenuItem>
        </Select>
      </FormControl>
      <br />
      <br />
      {associationSelect()}
    </div>
  );

  // handles selecting association for range officer
  const associationSelect = () => (
    <div>
      <FormControl className={classes(css.selectAssociation)}>
        {/** Only shown when selected role is range officer */}
        {state.role === 'rangeofficer' && (
          <>
            <InputLabel id="association-select-label">{t`Select association`}</InputLabel>
            <Select
              labelId="association-select-label"
              id="associationSelect"
              className={classes(css.select)}
              label={t`Select association`}
              value={state.associationId || ''}
              onChange={handleChangeAssociation}
            >
              {state.userList.map((user) => {
                if (user.role === 'association') {
                  return (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  );
                }
              })}
            </Select>
          </>
        )}
      </FormControl>
    </div>
  );

  /**
   **  ACTUAL PAGE RENDERING
   */
  const fin = localStorage.getItem('language');
  return (
    <div>
      {/* Dialog to add new user */}
      <Dialog
        id="dialog-add-user"
        open={state.openAddNewUserDialog}
        keepMounted
      >
        <DialogTitle
          id="dialog-add-user-title"
          className={classes(css.dialogStyle)}
        >
          {t`Create new user`}
        </DialogTitle>
        <DialogContent className={classes(css.dialogStyle)}>
          <TextField
            value={state.newUserName}
            margin="dense"
            id="name"
            label={t`Username`}
            onChange={handleNewuserNameChange}
            fullWidth
          />

          <br />
          <br />

          <NiceInputPassword
            LabelComponent={InputLabel}
            InputComponent={TextField}
            className={classes(css.dialogStyle)}
            value={state.newUserPass}
            margin="dense"
            label={t`Password`}
            name="passwordField"
            fullWidth
            securityLevels={[
              {
                descriptionLabel: t`Minimum ${1} number`,
                validator: /.*[0-9].*/,
              },
              {
                descriptionLabel: t`Minimum ${1} lowercase letter`,
                validator: /.*[a-z].*/,
              },
              {
                descriptionLabel: t`Minimum ${1} uppercase letter`,
                validator: /.*[A-Z].*/,
              },
              {
                descriptionLabel: t`Minimum length of password is 6 characters`,
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
            label={t`Email`}
            onChange={handleNewEmailChange}
            fullWidth
          />

          {roleSelect()}

          {state.requestErrors ? (
            <p className={classes(css.errorText)}>
              {t`Something went wrong, remember that the password has to meet the listed requirements and the name needs to be unique`}
            </p>
          ) : (
            <p />
          )}
        </DialogContent>
        <DialogActions className={classes(css.dialogStyle)}>
          <Button
            onClick={handleAddNewUserDialogClose}
            className={classes(css.removeButton)}
          >
            {t`Cancel`}
          </Button>
          <Button
            onClick={handleAddNewUserDialogCloseConfirmed}
            className={classes(css.acceptButton)}
          >
            {t`Save changes`}
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
          {t`Are you sure?`}
        </DialogTitle>
        <DialogContent
          id="dialog-remove-user-contet"
          className={classes(css.dialogStyle)}
        >
          <DialogContentText id="dialog-remove-user-text">
            {t`This action will permanently remove user`}{' '}
            {state.selectedUserName}
          </DialogContentText>

          {state.deleteErrors ? (
            <p className={classes(css.errorText)}>{t`Something went wrong`} </p>
          ) : (
            <p />
          )}
        </DialogContent>
        <DialogActions className={classes(css.dialogStyle)}>
          <Button
            onClick={handleRemoveWarningClose}
            className={classes(css.removeButton)}
          >
            {t`Cancel`}
          </Button>
          <Button
            onClick={handleRemoveWarningCloseAgree}
            className={classes(css.acceptButton)}
          >
            {t`Confirm`}
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
          {t`Change password`}
        </DialogTitle>
        <DialogContent className={classes(css.dialogStyle)}>
          <DialogContentText>
            {t`Give your current and new password`}
          </DialogContentText>

          <TextField
            type="password"
            value={state.oldPassword}
            margin="dense"
            id="oldpassword"
            label={t`Current password`}
            onChange={handleOldpassStringChange}
            fullWidth
          />

          <br />
          <br />

          <NiceInputPassword
            type="password"
            LabelComponent={InputLabel}
            InputComponent={TextField}
            className={classes(css.dialogStyle)}
            value={state.newPassword}
            margin="dense"
            label={t`New password`}
            name="passwordField"
            fullWidth
            securityLevels={[
              {
                descriptionLabel: t`Minimum ${1} number`,
                validator: /.*[0-9].*/,
              },
              {
                descriptionLabel: t`Minimum ${1} lowercase letter`,
                validator: /.*[a-z].*/,
              },
              {
                descriptionLabel: t`Minimum ${1} uppercase letter`,
                validator: /.*[A-Z].*/,
              },
              {
                descriptionLabel: t`Minimum length of password is 6 characters`,
                validator: /^.{6,}$/,
              },
            ]}
            showSecurityLevelBar
            showSecurityLevelDescription
            onChange={handleNewSecurePassStringChange}
          />

          {state.changeOwnPassFailed ? (
            <p className={classes(css.errorText)}>
              {t`Something went wrong, remember that the password has to meet the listed requirements`}{' '}
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
            {t`Cancel`}
          </Button>
          <Button
            onClick={handleChangeOwnPassDialogCloseAgree}
            className={classes(css.acceptButton)}
          >
            {t`Save changes`}
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
          {t`Change email address`}
        </DialogTitle>
        <DialogContent className={classes(css.dialogStyle)}>
          <DialogContentText>
            {t`Please give your new email address`}
          </DialogContentText>

          <div>{`${t`Current email address`}: ${findOwnEmail()}`}</div>
          <TextField
            type="text"
            value={state.newemail}
            margin="dense"
            id="newemail"
            label={t`Change email address`}
            onChange={handleNewEmailChange}
            fullWidth
          />

          {state.changeOwnEmailFailed ? (
            <p className={classes(css.errorText)}>
              {t`Something went wrong, remember that the password has to meet the listed requirements and the name needs to be unique`}
            </p>
          ) : (
            <p />
          )}
        </DialogContent>
        <DialogActions className={classes(css.dialogStyle)}>
          <Button
            onClick={handleChangeOwnEmailDialogClose}
            className={classes(css.removeButton)}
          >
            {t`Cancel`}
          </Button>
          <Button
            onClick={handleChangeOwnEmailDialogCloseAgree}
            className={classes(css.accceptButton)}
          >
            {t`Save changes`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to change password of other users */}
      <Dialog open={state.changePassDialogOpen} onClose={handleChangePassClose}>
        <DialogTitle
          id="dialog-change-pass-title"
          className={classes(css.dialogStyle)}
        >
          {t`Change password for`} {state.selectedUserName}
        </DialogTitle>
        <DialogContent className={classes(css.dialogStyle)}>
          <NiceInputPassword
            type="text"
            LabelComponent={InputLabel}
            InputComponent={TextField}
            className={classes(css.dialogStyle)}
            value={state.password}
            margin="dense"
            label={t`New password`}
            name="passwordField"
            fullWidth
            securityLevels={[
              {
                descriptionLabel: t`Minimum ${1} number`,
                validator: /.*[0-9].*/,
              },
              {
                descriptionLabel: t`Minimum ${1} lowercase letter`,
                validator: /.*[a-z].*/,
              },
              {
                descriptionLabel: t`Minimum ${1} uppercase letter`,
                validator: /.*[A-Z].*/,
              },
              {
                descriptionLabel: t`Minimum length of password is 6 characters`,
                validator: /^.{6,}$/,
              },
            ]}
            showSecurityLevelBar
            showSecurityLevelDescription
            onChange={(e) => {
              setState({ ...state, password: e.value });
            }}
          />

          {state.changeErrors ? (
            <p className={classes(css.errorText)}>
              {t`Something went wrong, remember that the password has to meet the listed requirements`}{' '}
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
            {t`Cancel`}
          </Button>
          <Button
            onClick={handleChangePassCloseConfirm}
            className={classes(css.acceptButton)}
          >
            {t`Save changes`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to Add Email for users */}
      <Dialog open={state.addEmailDialogOpen} onClose={handleaddEmailClose}>
        <DialogTitle
          id="dialog-add-email-title"
          className={classes(css.dialogStyle)}
        >
          {t`Change Email for user:`} {state.selectedUserName}
        </DialogTitle>
        <DialogContent className={classes(css.dialogStyle)}>
          <TextField
            type="text"
            value={state.email}
            margin="dense"
            id="name"
            label={t`Change email address`}
            onChange={(e) => {
              setState({ ...state, email: e.target.value });
            }}
            fullWidth
          />
          {state.changeErrors ? (
            <p className={classes(css.errorText)}>
              {t`Something went wrong, email not saved`}{' '}
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
            {t`Cancel`}
          </Button>
          <Button
            onClick={handleaddEmailCloseConfirm}
            className={classes(css.acceptButton)}
          >
            {t`Save changes`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to change role for users */}
      <Dialog open={state.changeRoleDialogOpen} onClose={handleChangeRoleClose}>
        <DialogTitle
          id="dialog-change-role-title"
          className={classes(css.dialogStyle)}
        >
          {t`Change role for user:`} {state.selectedUserName}
        </DialogTitle>
        <DialogContent className={classes(css.dialogStyle)}>
          {roleSelect()}
          {state.changeErrors ? (
            <p className={classes(css.errorText)}>
              {t`Something went wrong, role not saved`}{' '}
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
            {t`Cancel`}
          </Button>
          <Button
            onClick={handleChangeRoleCloseConfirm}
            className={classes(css.acceptButton)}
          >
            {t`Save changes`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* THE ACTUAL PAGE */}
      <h1 className={classes(css.header)}>{t`User management`}</h1>
      <Box className={classes(css.LoggedIn)}>
        <div>
          {t`You are logged in as`}:
          <br />
          <span style={{ fontWeight: 'bold' }}>{state.username}</span>
        </div>
        <div className={classes(css.buttonContainer)}>
          <Button
            onClick={handleOpenOwnEmailChangeDialog}
            variant="contained"
            className={classes(css.sandButton)}
          >
            {t`Change email address`}
          </Button>
          <Button
            onClick={handleOpenOwnPassChangeDialog}
            variant="contained"
            className={classes(css.turquoiseButton)}
          >
            {t`Change password`}
          </Button>
        </div>
      </Box>

      {/* USER PROFILES TABLE */}

      {/* for larger devices only*/}
      <div className={classes(css.usersHeaderDesk)}>
        <h2 className={classes(css.header)}>{t`User profiles`}</h2>
      </div>
      {/* for smaller devices only */}
      <div className={classes(css.usersHeaderMobile)}>
        <h3 className={classes(css.header)}>{t`User profiles`}</h3>
        <Button
          onClick={handleAddUserOpenDialog}
          variant="contained"
          className={css.lightgreenButton}
        >
          {t`Create new user`}
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
                <TableCell
                  align="left"
                  style={{ fontWeight: 'bold', width: '300px' }}
                >
                  {t`User`}
                </TableCell>
                <TableCell
                  align="left"
                  style={{ fontWeight: 'bold', width: '200px' }}
                  className={classes(css.tableCellDesk)}
                >
                  {t`Role`}
                </TableCell>
                <TableCell
                  align="left"
                  style={{ fontWeight: 'bold', width: '100px' }}
                  className={classes(css.tableCellDesk)}
                >
                  {t`Association`}
                </TableCell>
                <TableCell
                  align="right"
                  className={classes(css.tableCellDesk)}
                  style={{ color: '#f2f2f2' }}
                >
                  {t`Edit`}
                </TableCell>
                <TableCell align="right" style={{ width: '100px' }}>
                  <Button
                    onClick={handleAddUserOpenDialog}
                    variant="contained"
                    className={classes(
                      css.addUserButtonDesk,
                      css.lightgreenButton,
                    )}
                  >
                    {t`Create new user`}
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.rows.map((row) => (
                <TableRow key={row.name} hover>
                  <TableCell align="justify" component="th" scope="row">
                    {row.name}
                    <br />
                    {row.email}
                    {state.editingRows[row.id] && (
                      <Tooltip title={t`Edit email address`}>
                        <IconButton
                          id={row.id}
                          onClick={onaddEmailClick}
                          aria-label="Edit email"
                        >
                          <EditIcon style={{ fontSize: 'large' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* only for small devices */}
                    <div className={classes(css.tableCellMobile)}>
                      <br />
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{t`Role`}: </span>{' '}
                        {row.roleToPrint}
                        {state.editingRows[row.id] && (
                          <Tooltip title={t`Edit role`}>
                            <IconButton
                              id={row.id}
                              onClick={onRoleClick}
                              aria-label="Edit role"
                            >
                              <EditIcon style={{ fontSize: 'large' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                      {/* print association if the role is range officer */}
                      {(row.roleToPrint === 'Valvoja' ||
                        row.roleToPrint === 'Range officer' ||
                        row.roleToPrint === 'Banofficer') && (
                        <div>
                          <span style={{ fontWeight: 'bold' }}>
                            {t`Association`}:{' '}
                          </span>
                          {printAssociationName(row.id)}
                        </div>
                      )}
                      <br />
                      <div className={classes(css.buttonsMobile)}>
                        {state.editingRows[row.id] && returnPassButton(row.id)}
                        {state.editingRows[row.id] &&
                          returnRemoveButton(row.id)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    align="justify"
                    className={classes(css.tableCellDesk)}
                  >
                    {row.roleToPrint}
                    {state.editingRows[row.id] && (
                      <Tooltip title={t`Edit role`}>
                        <IconButton
                          id={row.id}
                          onClick={onRoleClick}
                          aria-label="Edit role"
                        >
                          <EditIcon style={{ fontSize: 'large' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell className={classes(css.tableCellDesk)}>
                    {printAssociationName(row.id)}
                  </TableCell>
                  <TableCell
                    align="right"
                    className={classes(css.tableCellDesk)}
                  >
                    <div className={classes(css.buttonCell)}>
                      {state.editingRows[row.id] && returnPassButton(row.id)}
                      {state.editingRows[row.id] && returnRemoveButton(row.id)}
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEditClick(row.id)}
                      aria-label="Edit"
                    >
                      {!state.editingRows[row.id] ? (
                        <Tooltip title={t`Edit`}>
                          <EditIcon />
                        </Tooltip>
                      ) : (
                        <Tooltip title={t`Close editing mode`}>
                          <EditOffIcon />
                        </Tooltip>
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
}

export default withCookies(UserManagementView);
