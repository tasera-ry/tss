module.exports = {
  env: {
    'jest/globals': true,
  },
  extends: [
    'airbnb',
  ],
  plugins: [
    'react',
    'jest',
  ],
  rules: {
    'react/jsx-filename-extension': [0],
    'jsx-a11y/alt-text': [0],
    'jsx-a11y/click-events-have-key-events': [0],
    'jsx-a11y/no-static-element-interactions': [0],
    'react/destructuring-assignment': [0],
    'no-console': [0],
    'func-names': [0],
    'import/no-extraneous-dependencies': [0],
  },
};
