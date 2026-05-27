const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { signToken } = require('../utils/jwt');

const findUserByEmail = async (email) => {
  const result = await query('SELECT id, email, password, created_at FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

const createUser = async (email, password) => {
  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, hashedPassword]
  );

  return result.rows[0];
};

const registerUser = async ({ email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = await createUser(email, password);
  const token = signToken({ id: user.id, email: user.email });

  return { user, token };
};

const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken({ id: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    },
    token
  };
};

const getUserById = async (id) => {
  const result = await query('SELECT id, email, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById
};
