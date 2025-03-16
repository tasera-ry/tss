import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

export function Notifications({ notification, setNotification }) {
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={() => setNotification({ ...notification, open: false })}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <MuiAlert
        elevation={6}
        variant="filled"
        onClose={() => setNotification({ ...notification, open: false })}
        severity={notification.type}
      >
        {notification.message}
      </MuiAlert>
    </Snackbar>
  );
}
