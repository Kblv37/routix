const { registerUser, loginUser, getUserById } = require('../services/authService');
const { sanitizeString } = require('../utils/sanitize');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateAuthInput = (email, password) => {
  if (!emailRegex.test(email)) {
    const error = new Error('Please provide a valid email');
    error.statusCode = 400;
    throw error;
  }

  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    const error = new Error('Password must be between 8 and 128 characters');
    error.statusCode = 400;
    throw error;
  }
};

const register = async (req, res) => {
  const email = sanitizeString(req.body.email, 120).toLowerCase();
  const password = sanitizeString(req.body.password, 128);

  validateAuthInput(email, password);

  const result = await registerUser({ email, password });
  res.status(201).json(result);
};

const login = async (req, res) => {
  const email = sanitizeString(req.body.email, 120).toLowerCase();
  const password = sanitizeString(req.body.password, 128);

  validateAuthInput(email, password);

  const result = await loginUser({ email, password });
  res.json(result);
};

const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

const me = async (req, res) => {
  const user = await getUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user });
};

module.exports = {
  register,
  login,
  logout,
  me
};
