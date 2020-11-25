import React from 'react';

const LoginContext = React.createContext({
  token: null,
  username: null,
  role: null,
  updateLoginInfo: () => {},
  updateRole: () => {}
});

export default LoginContext;
