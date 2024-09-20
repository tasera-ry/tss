const devices = [];

const model = {
  create: async (device) => {
    devices.push(device);
    return [device];
  },
  read: async (key) => {
    return devices.filter((device) => {
      const searchKeys = Object.keys(key);
      let match = true;
      searchKeys.forEach((key) => {
        if (key in device && key[key] !== device[key]) {
          match = false;
        }
      });
      return match;
    });
  },
  update: async (current, update) => {
    const i = devices.findIndex((device) => device.id == current.id);
    devices[i] = { ...devices[i], ...update };
  },
  clear: () => (devices.length = 0),
};

module.exports = model;
