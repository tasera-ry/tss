import React, { useState } from 'react';
import classNames from 'classnames';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import EditSharpIcon from '@material-ui/icons/EditSharp';
import CloseSharpIcon from '@material-ui/icons/CloseSharp';
import CheckSharpIcon from '@material-ui/icons/CheckSharp';
import IconButton from '@material-ui/core/IconButton';
import translations from '../texts/texts.json';
import { FixedSizeList as List } from 'react-window';
import css from './table.module.scss';
const classes = classNames.bind(css);

const lang = localStorage.getItem('language');
const { raffle } = translations;

const ResultsRow = ({
  result,
  associations,
  hoveredRow,
  setHoveredRow,
  isEdited,
  setEditOpen,
  editUser,
  setEditUser,
  style,
  editResults,
}) => {
  const { date, name } = result;
  return (
    <TableRow
      key={date}
      hover
      onMouseEnter={() => setHoveredRow(date)}
      onMouseLeave={() => setHoveredRow(undefined)}
      className={classes(css.flexRow)}
      style={{ ...style }}
      component="div"
    >
      <TableCell component="div" className={classes(css.flexCell)}>
        {new Date(date).toLocaleDateString('fi-FI')}
      </TableCell>
      <TableCell component="div" className={classes(css.flexCell)}>
        {isEdited ? (
          <select
            value={editUser}
            onChange={(e) => setEditUser(e.target.value)}
          >
            {associations.map(({ name, user_id }) => (
              <option value={name} key={user_id}>
                {name}
              </option>
            ))}
          </select>
        ) : (
          name
        )}
      </TableCell>
      <TableCell component="div">
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
              onClick={() => editResults(date)}
              className={classes(css.acceptButton)}
            >
              <CheckSharpIcon fontSize="inherit" />
            </IconButton>
          </div>
        ) : (
          <IconButton
            size="small"
            padding="none"
            onClick={() => {
              setEditOpen(date);
              setEditUser(name);
            }}
            className={classes(css.editButton, {
              [css.hover]: hoveredRow === date,
            })}
          >
            <EditSharpIcon fontSize="inherit" />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
};

export default function SupervisionResultsTable({
  results,
  setResults,
  associations,
}) {
  const [hoveredRow, setHoveredRow] = useState(undefined);
  const [editOpen, setEditOpen] = useState(undefined);
  const [editUser, setEditUser] = useState(undefined);

  const editResults = (date) => {
    const { name, user_id } = associations.find(
      ({ name }) => name === editUser,
    );
    const editedResults = results.map((result) => {
      if (result.date !== date) return result;
      return { ...result, name, user_id };
    });
    setEditOpen(undefined);
    setResults(editedResults);
  };

  return (
    <TableContainer
      component={Paper}
      className={classes(css.tableContainer, css.medium)}
    >
      <Table
        className={classes(css.table)}
        component="div"
        aria-label="raffle results table"
      >
        <TableHead component="div">
          <div className={classes(css.flexRow)}>
            <TableCell component="div" className={classes(css.flexCell)}>
              {raffle.date[lang]}
            </TableCell>
            <TableCell component="div" className={classes(css.flexCell)}>
              {raffle.user[lang]}
            </TableCell>
            <TableCell component="div" className={classes(css.smallCell)} />
          </div>
        </TableHead>
        <TableBody component="div">
          <List
            itemSize={72.5}
            itemCount={results.length}
            height={Math.min(700, results.length * 72.5)}
            width="100%"
          >
            {({ index, style }) => (
              <ResultsRow
                style={style}
                key={results[index].date}
                result={results[index]}
                associations={associations}
                isEdited={editOpen === results[index].date}
                setEditOpen={setEditOpen}
                hoveredRow={hoveredRow}
                setHoveredRow={setHoveredRow}
                editUser={editUser}
                setEditUser={setEditUser}
                editResults={editResults}
              />
            )}
          </List>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
