module.exports = {
  env: {
    'jest/globals': true,
  },
  extends: [
    'airbnb',
  ],
  plugins: [
    'react', 'jest',
  ],
  rules: {
    'react/jsx-filename-extension': [0],
  },
};
