import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import classes from './devices.module.scss'; // Tuo CSS-moduuli

const Devices = () => {
  // Laitteiden nimet ja alkuvärit
  const initialDevices = [
    { name: 'Labradar', status: 'Vapaa', color: '#5FA052' },
    { name: 'Timer 1', status: 'Vapaa', color: '#5FA052' },
    { name: 'Timer 2', status: 'Vapaa', color: '#5FA052' },
    
  ];

  // Tilamuuttuja napin värin ja nimen seuraamiseksi
  const [devices, setDevices] = useState(initialDevices);

  // Funktio napin painalluksen käsittelyyn
  const handleClick = (index) => {
    // Kopioidaan laitelistaa
    const updatedDevices = [...devices];
    // Vaihdetaan napin väri
    updatedDevices[index].color = updatedDevices[index].color === '#5FA052' ? '#FF7F7F' : '#5FA052';
    // Päivitetään napin tila
    updatedDevices[index].status = updatedDevices[index].color === '#5FA052' ? 'Vapaa' : 'Lainassa';
    // Päivitetään tila
    setDevices(updatedDevices);
  };

  return (
    <div className={classes.devicesContainer}>
      {devices.map((device, index) => (
        <div key={index} className={classes.device}>
          <h3>{device.name}</h3>
          <Button
            variant="contained"
            style={{ backgroundColor: device.color }}
            onClick={() => handleClick(index)}
            className={classes.button}
          >
            {device.status}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default Devices;

