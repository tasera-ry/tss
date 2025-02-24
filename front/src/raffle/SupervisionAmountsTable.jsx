import React from 'react';
import classNames from 'classnames';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { FixedSizeList as List } from 'react-window';
import css from './table.module.scss';
import { t } from '@lingui/core/macro';

const classes = classNames.bind(css);

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
              {t`Association`}
            </TableCell>
            <TableCell component="div">{t`Amount of supervisions`}</TableCell>
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
