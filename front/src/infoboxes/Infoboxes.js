import React from 'react';

import InfoImg from '../logo/Info.png';

import texts from '../texts/texts.json';

import classNames from 'classnames';
import css from './Infoboxes.module.scss'

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
          <p id={css.openInfo} className={classes(css.box, css.noFlex)} />
          {/* Open */}
          {' '}
          <p className={classes(css.infoText, css.noFlex)}>{week.Green[fin]}</p>
        </div>

        <div className={classes(css.infoItem)}>
          <p id={css.closedInfo2} className={classes(css.box, css.noFlex)} />
          {/* Closed */}
          {' '}
          <p className={classes(css.infoText, css.noFlex)}>{week.Blue[fin]}</p>
        </div>

        <div className={classes(css.infoItem)}>
          <p id={css.rangeOfficerInfo} className={classes(css.box, css.noFlex)} />
          {/* Range officer confirmed */}
          {' '}
          <p className={classes(css.infoText, css.noFlex)}>{week.Lightgreen[fin]}</p>
        </div>

        <div className={classes(css.infoItem)}>
          <p id={css.onwayInfo} className={classes(css.box, css.noFlex)} />
          {/* Range officer on the way */}
          {' '}
          <p className={classes(css.infoText, css.noFlex)}>{week.Orange[fin]}</p>
        </div>

        <div className={classes(css.infoItem)}>
          <p id={css.closedInfo} className={classes(css.box, css.noFlex)} />
          {/* Range closed */}
          {' '}
          <p className={classes(css.infoText, css.noFlex)}>{week.Red[fin]}</p>
        </div>

        <div className={classes(css.infoItem)}>
          <p id={css.noInfo} className={classes(css.box, css.noFlex)} />
          {/* Range officer undefined */}
          {' '}
          <p className={classes(css.infoText, css.noFlex)}>{week.White[fin]}</p>
        </div>

        <div className={classes(css.infoItemImg)}>
          <p className={classes(css.noFlex)}>
            <img className={classes(css.exclamation, css.noFlex)} src={InfoImg} alt={week.Notice[fin]} />
          </p>
          {/* Track has additional information */}
          {' '}
          <p className={classes(css.infoText, css.relativeText, css.noFlex)}>{week.Notice[fin]}</p>
        </div>

      </div>
    </div>
  );
};

export default Infoboxes;
