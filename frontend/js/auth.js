import { ROUTES } from './config.js';

const TOKEN_KEY = 'ROUTIX_TOKEN';

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const requireAuth = () => {
  const token = getToken();
  if (!token) {
    window.location.href = ROUTES.login;
    return false;
  }

  return true;
};

export const redirectIfAuthenticated = () => {
  if (getToken()) {
    window.location.href = ROUTES.dashboard;
  }
};
