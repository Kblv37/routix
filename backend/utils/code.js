const { customAlphabet } = require('nanoid');

const codeAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const generateNanoCode = customAlphabet(codeAlphabet, 8);

const normalizeCustomCode = (value) => {
  if (!value) return '';
  return String(value).trim();
};

const isValidCustomCode = (value) => /^[a-zA-Z0-9_-]{4,32}$/.test(value);

module.exports = {
  generateNanoCode,
  normalizeCustomCode,
  isValidCustomCode
};
