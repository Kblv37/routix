export const API_URL = (window.__ROUTIX_CONFIG__ && window.__ROUTIX_CONFIG__.API_URL) || localStorage.getItem('ROUTIX_API_URL') || 'http://localhost:5000';

export const ENDPOINTS = {
  register: '/api/auth/register',
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  me: '/api/auth/me',
  links: '/api/links',
  recent: '/api/links/activity/recent',
  analytics: '/api/analytics/overview'
};

export const ROUTES = {
  home: '/index.html',
  login: '/login.html',
  register: '/register.html',
  dashboard: '/dashboard.html'
};
