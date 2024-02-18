import React from "react";
import classNames from "classnames";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import translations from "../texts/texts.json";
import { FixedSizeList as List } from "react-window";
import css from "./table.module.scss";
const classes = classNames.bind(css);

const lang = localStorage.getItem("language");
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

export const SupervisionAmountsTable = ({ amounts }) => (
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
