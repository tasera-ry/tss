/* eslint-env jest */
const users = [
  
]; 

// Mock user model
const model = {
  read: async (params) => users.filter((user) => {
    const searchKeys = Object.keys(params);
    let match = true;
    searchKeys.forEach(key => {
      if (params[key] !== user[key]) {
        match = false;
      }
    });
    return match;
  }),
  create: async (user) => { 
    users.push(user);
    return [user];
  },
  update: async (current, update) => {
    const i = users.findIndex(user => user.id == current.id);
    users[i] = {...users[i], ...update};
  },
  clear: () => users.length = 0
};

module.exports = model;
