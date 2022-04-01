const path = require('path');
const root = path.join(__dirname, '..');

const model = require(path.join(root, 'models/infoMessage'));

module.exports = {
  create: async (obj) => {
    const trx = await model.create(obj);
    console.log(trx);
    return obj;
  },
  read: async (obj) => {
    const trx = await model.read(obj);
    return trx;
  },
  update: async (obj) => {
    const trx = await model.update(obj);
    if(!trx.length)
      return {error: `id ${obj.id} not found`};
    return trx;
  },
  delete: async (obj) => {
    const trx = await model.delete(obj);
    if(!trx.length)
      return {error: `id ${obj.id} not found`};
    return trx;
  }
};  