import React from 'react';

// creates context of [state, setState]
const LoginContext = React.createContext([{}, () => {}]);

export default LoginContext;
