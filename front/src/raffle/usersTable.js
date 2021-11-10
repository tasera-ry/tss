import React, { useState } from "react";
import classNames from "classnames";
import Table from "@material-ui/core/Table";
import TableContainer from "@material-ui/core/TableContainer";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import EditSharpIcon from "@material-ui/icons/EditSharp";
import CloseSharpIcon from "@material-ui/icons/CloseSharp";
import CheckSharpIcon from "@material-ui/icons/CheckSharp";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import translations from "../texts/texts.json";
import css from "./usersTable.module.scss";
const classes = classNames.bind(css);

const lang = localStorage.getItem("language");
const { raffle } = translations;

const EditField = (props) => (
  <TextField
    required
    size="small"
    variant="outlined"
    type="number"
    className={classes(css.textField)}
    InputProps={{ inputProps: { min: 0 } }}
    {...props}
  />
);

export const UsersTable = ({ supervisors, onSubmitUser, isLoading }) => {
  const [hoveredRow, setHoveredRow] = useState(undefined);
  const [editOpen, setEditOpen] = useState(undefined);
  const [editFields, setEditFields] = useState({ members: 0, supervisors: 0 });

  return (
    <TableContainer component={Paper} className={classes(css.tableContainer)}>
      <Table className={classes(css.table)} aria-label="members table">
        <TableHead>
          <TableRow>
            <TableCell align="center" className={classes(css.mediumCell)}>
              {raffle.raffled[lang]}
            </TableCell>
            <TableCell>{raffle.user[lang]}</TableCell>
            <TableCell align="center">{raffle.members[lang]}</TableCell>
            <TableCell align="center">{raffle.supervisors[lang]}</TableCell>
            <TableCell className={classes(css.smallCell)} />
          </TableRow>
        </TableHead>
        <TableBody>
          {supervisors.map(
            ({ user_id, name, members, supervisors, raffle }) => {
              const isEdited = editOpen === user_id;
              return (
                <TableRow
                  key={user_id}
                  hover
                  onMouseEnter={() => setHoveredRow(user_id)}
                  onMouseLeave={() => setHoveredRow(undefined)}
                  className={classes({ [css.loading]: isLoading })}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    align="center"
                    className={classes(css.mediumCell)}
                  >
                    <Checkbox
                      checked={raffle}
                      className={classes(css.checkbox)}
                      disabled={isLoading}
                      onChange={() =>
                        onSubmitUser(user_id, { raffle: !raffle })
                      }
                    />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {name}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={classes({ [css.editedCell]: isEdited })}
                  >
                    {isEdited ? (
                      <EditField
                        autoFocus
                        name="members"
                        value={editFields.members}
                        onChange={(e) =>
                          setEditFields({
                            ...editFields,
                            members: e.target.value,
                          })
                        }
                      />
                    ) : (
                      members
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={classes({ [css.editedCell]: isEdited })}
                  >
                    {isEdited ? (
                      <EditField
                        name="supervisors"
                        value={editFields.supervisors}
                        onChange={(e) =>
                          setEditFields({
                            ...editFields,
                            supervisors: e.target.value,
                          })
                        }
                      />
                    ) : (
                      supervisors
                    )}
                  </TableCell>
                  <TableCell align="left" className={classes(css.smallCell)}>
                    {isEdited ? (
                      <div className={classes(css.buttons)}>
                        <IconButton
                          size="small"
                          padding="none"
                          onClick={() => setEditOpen(undefined)}
                          className={classes(css.cancelButton)}
                        >
                          <CloseSharpIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          size="small"
                          padding="none"
                          onClick={() => {
                            setEditOpen(undefined);
                            onSubmitUser(user_id, editFields);
                          }}
                          className={classes(css.acceptButton)}
                        >
                          <CheckSharpIcon fontSize="inherit" />
                        </IconButton>
                      </div>
                    ) : (
                      <IconButton
                        size="small"
                        padding="none"
                        disabled={isLoading}
                        onClick={() => {
                          setEditOpen(user_id);
                          setEditFields({ members, supervisors });
                        }}
                        className={classes(css.editButton, {
                          [css.hover]: hoveredRow === user_id,
                        })}
                      >
                        <EditSharpIcon fontSize="inherit" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            }
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
