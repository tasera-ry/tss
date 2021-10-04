import React from 'react';
import './Infoboxes.css';
import InfoImg from '../logo/Info.png';
import texts from '../texts/texts.json';

const Infoboxes = () => {
  const fin = localStorage.getItem('language');
  const { week } = texts;
  return (
    <div>
      <br />
      <hr />
      <div className="info-flex">
        <div className="info-item">
          <p id="open-info" className="box no-flex" />
          {/* Open */} <p className="info-text no-flex">{week.Green[fin]}</p>
        </div>

        <div className="info-item">
          <p id="closed-info2" className="box no-flex" />
          {/* Closed */} <p className="info-text no-flex">{week.Blue[fin]}</p>
        </div>

        <div className="info-item">
          <p id="range-officer-info" className="box no-flex" />
          {/* Range officer confirmed */}{' '}
          <p className="info-text no-flex">{week.Lightgreen[fin]}</p>
        </div>

        <div className="info-item">
          <p id="onway-info" className="box no-flex" />
          {/* Range officer on the way */}{' '}
          <p className="info-text no-flex">{week.Orange[fin]}</p>
        </div>

        <div className="info-item">
          <p id="closed-info" className="box no-flex" />
          {/* Range closed */}{' '}
          <p className="info-text no-flex">{week.Red[fin]}</p>
        </div>

        <div className="info-item">
          <p id="no-info" className="box no-flex" />
          {/* Range officer undefined */}{' '}
          <p className="info-text no-flex">{week.White[fin]}</p>
        </div>

        <div className="info-item-img">
          <p className="empty-box no-flex">
            <img
              className="exclamation no-flex"
              src={InfoImg}
              alt={week.Notice[fin]}
            />
          </p>
          {/* Track has additional information */}{' '}
          <p className="info-text relative-text no-flex">{week.Notice[fin]}</p>
        </div>
      </div>
    </div>
  );
};

export default Infoboxes;
