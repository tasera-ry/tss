import React from 'react';
import classNames from 'classnames';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import translations from '../texts/texts.json';
import { FixedSizeList as List } from 'react-window';
import css from './table.module.scss';
const classes = classNames.bind(css);

const lang = localStorage.getItem('language');
const { raffle } = translations;

const AmountRow = ({ style, amount }) => (
  <TableRow
    key={amount.name}
    hover
    className={classes(css.flexRow)}
    style={{ ...style }}
    component="div"
  >
    <TableCell component="div" className={classes(css.flexCell)}>
      {amount.name}
    </TableCell>
    <TableCell component="div">{amount.amount}</TableCell>
  </TableRow>
);

export default function SupervisionAmountsTable({ amounts }) {
  return (
    <TableContainer
      component={Paper}
      className={classes(css.tableContainer, css.small)}
    >
      <Table
        className={classes(css.table)}
        component="div"
        aria-label="supervision amounts table"
      >
        <TableHead component="div">
          <div className={classes(css.flexRow)}>
            <TableCell component="div" className={classes(css.flexCell)}>
              {raffle.user[lang]}
            </TableCell>
            <TableCell component="div">{raffle.amount[lang]}</TableCell>
          </div>
        </TableHead>
        <TableBody component="div">
          <List
            itemSize={72.5}
            itemCount={amounts.length}
            height={Math.min(700, amounts.length * 72.5)}
            width="100%"
          >
            {({ index, style }) => (
              <AmountRow
                style={style}
                key={amounts[index].name}
                amount={amounts[index]}
              />
            )}
          </List>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
