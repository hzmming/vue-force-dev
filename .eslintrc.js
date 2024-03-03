module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  globals: {
    chrome: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "no-unused-vars": ["warn"],
  },
};
