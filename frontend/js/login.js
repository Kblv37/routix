import { apiRequest } from './api.js';
import { setToken, redirectIfAuthenticated } from './auth.js';
import { ENDPOINTS, ROUTES } from './config.js';
import { setButtonLoading, showToast } from './ui.js';

redirectIfAuthenticated();

const form = document.querySelector('#login-form');
const submitButton = document.querySelector('#login-submit');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();

  try {
    setButtonLoading(submitButton, true);

    const response = await apiRequest(ENDPOINTS.login, {
      method: 'POST',
      auth: false,
      data: { email, password }
    });

    setToken(response.token);
    showToast('Welcome back');

    setTimeout(() => {
      window.location.href = ROUTES.dashboard;
    }, 300);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setButtonLoading(submitButton, false, 'Login');
  }
});
