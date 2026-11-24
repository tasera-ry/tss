let sections = [];

const model = {
  read: async function readSection(key) {
    return sections.filter(section =>
      Object.keys(key).every(field => section[field] === key[field])
    );
  },

  seed: async function seed(rows) {
    sections = [...rows];
  },

  clear: async function clear() {
    sections = [];
  }
};

module.exports = model;
