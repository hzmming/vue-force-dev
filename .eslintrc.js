module.exports = {
  env: {
    browser: true,
    node: true,
  },
  globals: {
    chrome: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 13,
  },
  rules: {
    "no-unused-vars": ["warn"],
  },
};
