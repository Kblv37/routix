let toastTimer = null;

export const showToast = (message, type = 'success') => {
  const root = document.querySelector('#toast-root');
  if (!root) return;

  root.innerHTML = `<div class="toast ${type}">${message}</div>`;
  root.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    root.classList.remove('show');
  }, 2400);
};

export const setButtonLoading = (button, isLoading, idleText = 'Submit') => {
  if (!button) return;

  if (isLoading) {
    button.dataset.prevText = button.textContent;
    button.disabled = true;
    button.textContent = 'Loading...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.prevText || idleText;
  }
};

export const copyToClipboard = async (value) => {
  await navigator.clipboard.writeText(value);
};

export const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString();
};

export const escapeHtml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
