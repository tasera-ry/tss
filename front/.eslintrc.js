module.exports = {
  env: {
    'jest/globals': true,
    browser: true,
  },
  extends: [
    'airbnb',
  ],
  plugins: [
    'react',
    'jest',
  ],
  parser: 'babel-eslint',
  rules: {
    'react/jsx-filename-extension': [0],
    'jsx-a11y/alt-text': [0],
    'jsx-a11y/click-events-have-key-events': [0],
    'jsx-a11y/no-static-element-interactions': [0],
    'react/destructuring-assignment': [0],
    'no-console': [0],
    'func-names': [0],
    'import/no-extraneous-dependencies': [0],
    'react/jsx-props-no-spreading': [0],
    'react/prop-types': [0],
    'react/no-access-state-in-setstate': [0],
    radix: [0],
    'no-await-in-loop': [0],
    'no-loop-func': [0],
    'class-methods-use-this': [0],
    'no-restricted-syntax': [0],
    'guard-for-in': [0],
    'linebreak-style': [0],
  },
};
