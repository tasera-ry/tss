import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

export function TrackStatistics() {
  const [userCount, setUserCount] = useState(0);
  return (
    <div>
      <Button id="miinus" variant="primary" onClick={() => setUserCount(userCount - 1)}>-</Button>
      <TextField variant="outlined" value={userCount} />
      <Button id="plussa" variant="primary" onClick={() => setUserCount(userCount + 1)}>+</Button>
    </div>
  );
}

// Ei saa mennä alle nollan - tee ensimmäisenä!

export default TrackStatistics;
