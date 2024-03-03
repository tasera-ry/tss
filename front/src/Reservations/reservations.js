import React from 'react';
import classNames from 'classnames';
import css from './Reservations.scss';

const classes = classNames.bind(css);

const Reservations = () => {
  const hee = 'hee';
  console.log(hee);

  return (
    <div className={classes(css.reservation)}>
      <h1>Reservations</h1>
      <p>placeholder</p>
    </div>
  );
};

export default Reservations;
