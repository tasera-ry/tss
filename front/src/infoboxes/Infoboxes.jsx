import React from 'react';

import InfoImg from '@/assets/Info.png';

import texts from '../texts/texts.json';

import classNames from 'classnames';
import css from './Infoboxes.module.scss';

const classes = classNames.bind(css);

const Infoboxes = () => {
  const fin = localStorage.getItem('language');
  const { week } = texts;
  return (
    <div>
      <br />
      <hr />
      <div className={classes(css.infoFlex)}>
        <div className={classes(css.infoItem)}>
          <p id={css.openInfo} className={classes(css.box)} />
          {/* Open */}{' '}
          <p className={classes(css.infoText)}>{week.Green[fin]}</p>
        </div>

        <div className={classes(css.infoItem)}>
          <p id={css.closedInfo2} className={classes(css.box)} />
          {/* Closed */}{' '}
          <p className={classes(css.infoText)}>{week.Blue[fin]}</p>
        </div>

        <div className={classes(css.infoItem)}>
          <p id={css.rangeOfficerInfo} className={classes(css.box)} />
          {/* Range officer confirmed */}{' '}
          <p className={classes(css.infoText)}>{week.Lightgreen[fin]}</p>
        </div>

        <div className={classes(css.infoItem)}>
          <p id={css.onwayInfo} className={classes(css.box)} />
          {/* Range officer on the way */}{' '}
          <p className={classes(css.infoText)}>{week.Orange[fin]}</p>
        </div>

        <div className={classes(css.infoItem)}>
          <p id={css.closedInfo} className={classes(css.box)} />
          {/* Range closed */}{' '}
          <p className={classes(css.infoText)}>{week.Red[fin]}</p>
        </div>

        <div className={classes(css.infoItem)}>
          <p id={css.noInfo} className={classes(css.box)} />
          {/* Range officer undefined */}{' '}
          <p className={classes(css.infoText)}>{week.White[fin]}</p>
        </div>

        <div className={classes(css.infoItemImg)}>
          <p className={classes(css.noFlex)}>
            <img
              className={classes(css.exclamation, css.noFlex)}
              src={InfoImg}
              alt={week.Notice[fin]}
            />
          </p>
          {/* Track has additional information */}{' '}
          <p className={classes(css.infoText, css.relativeText)}>
            {week.Notice[fin]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Infoboxes;
