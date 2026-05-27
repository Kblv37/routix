import { apiRequest } from './api.js';
import { clearToken, requireAuth } from './auth.js';
import { API_URL, ENDPOINTS, ROUTES } from './config.js';
import {
  showToast,
  copyToClipboard,
  formatDateTime,
  escapeHtml,
  setButtonLoading
} from './ui.js';

if (!requireAuth()) {
  throw new Error('Unauthorized');
}

let currentPage = 1;
let currentSearch = '';
let charts = [];

const linksTableBody = document.querySelector('#links-table-body');
const paginationLabel = document.querySelector('#pagination-label');
const prevPageBtn = document.querySelector('#prev-page');
const nextPageBtn = document.querySelector('#next-page');
const searchInput = document.querySelector('#search-links');
const logoutButtons = document.querySelectorAll('[data-logout-btn]');
const createLinkBtn = document.querySelector('#create-link-btn');
const createLinkForm = document.querySelector('#create-link-form');
const createLinkSubmit = document.querySelector('#create-link-submit');
const modalBackdrop = document.querySelector('#create-link-modal');
const modalCloseButtons = document.querySelectorAll('[data-modal-close]');
const emptyState = document.querySelector('#empty-state');
const activityList = document.querySelector('#recent-activity');

const statsNodes = {
  totalClicks: document.querySelector('#stat-total-clicks'),
  uniqueClicks: document.querySelector('#stat-unique-clicks'),
  clicksToday: document.querySelector('#stat-clicks-today'),
  totalLinks: document.querySelector('#stat-total-links')
};

const showModal = () => modalBackdrop?.classList.add('open');
const closeModal = () => modalBackdrop?.classList.remove('open');

const redirectBase = API_URL.replace(/\/$/, '');
const redirectFront = 'https://rtx.jahongirdev.uz';

const setStats = ({ total_clicks, unique_clicks, clicks_today }, totalLinks) => {
  statsNodes.totalClicks.textContent = total_clicks || 0;
  statsNodes.uniqueClicks.textContent = unique_clicks || 0;
  statsNodes.clicksToday.textContent = clicks_today || 0;
  statsNodes.totalLinks.textContent = totalLinks || 0;
};

const destroyCharts = () => {
  charts.forEach((chart) => chart.destroy());
  charts = [];
};

const renderCharts = (analytics) => {
  destroyCharts();

  const lineCtx = document.querySelector('#clicks-line-chart');
  const browsersCtx = document.querySelector('#browsers-chart');
  const countriesCtx = document.querySelector('#countries-chart');

  const lineChart = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: analytics.clicksOverTime.map((item) => item.day),
      datasets: [{
        label: 'Clicks',
        data: analytics.clicksOverTime.map((item) => item.value),
        borderColor: '#45f0df',
        backgroundColor: 'rgba(69, 240, 223, 0.16)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#d8dbff' }
        }
      },
      scales: {
        x: { ticks: { color: '#9ea4ca' }, grid: { color: 'rgba(158, 164, 202, 0.1)' } },
        y: { ticks: { color: '#9ea4ca', precision: 0 }, grid: { color: 'rgba(158, 164, 202, 0.1)' } }
      }
    }
  });

  const buildDoughnut = (ctx, list, palette) => new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: list.map((item) => item.label),
      datasets: [{
        data: list.map((item) => item.value),
        backgroundColor: palette,
        borderWidth: 1,
        borderColor: '#111325'
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: '#d8dbff' }
        }
      }
    }
  });

  const browsersChart = buildDoughnut(browsersCtx, analytics.topBrowsers, ['#45f0df', '#ff8a65', '#7aa2ff', '#f6d365', '#6dd5ed']);
  const countriesChart = buildDoughnut(countriesCtx, analytics.topCountries, ['#84fab0', '#8fd3f4', '#fccb90', '#f6a6ff', '#89f7fe']);

  charts = [lineChart, browsersChart, countriesChart];

  const topOsNode = document.querySelector('#top-os-list');
  topOsNode.innerHTML = analytics.topOs.length
    ? analytics.topOs.map((item) => `<li><span>${escapeHtml(item.label)}</span><strong>${item.value}</strong></li>`).join('')
    : '<li>No OS data yet</li>';
};

const renderLinks = (data) => {
  const rows = data.rows || [];

  if (!rows.length) {
    linksTableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    linksTableBody.innerHTML = rows
      .map((link) => {
        const shortUrl = `${redirectFront}/c/${link.code}`;

        return `
          <tr>
            <td><code>${escapeHtml(link.code)}</code></td>
            <td><a class="table-link" href="${escapeHtml(link.target_url)}" target="_blank" rel="noreferrer">${escapeHtml(link.target_url)}</a></td>
            <td>${link.total_clicks}</td>
            <td>${link.unique_clicks}</td>
            <td>${link.today_clicks}</td>
            <td>${formatDateTime(link.created_at)}</td>
            <td>
              <div class="row-actions">
                <button class="btn-ghost" data-copy="${escapeHtml(shortUrl)}">Copy</button>
                <button class="btn-ghost" data-qr="${escapeHtml(shortUrl)}">QR</button>
                <button class="btn-danger" data-delete="${link.id}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  const { page, totalPages, total } = data.pagination;
  paginationLabel.textContent = `Page ${page} / ${totalPages} - ${total} links`;
  prevPageBtn.disabled = page <= 1;
  nextPageBtn.disabled = page >= totalPages;
};

const renderActivity = (items) => {
  if (!items.length) {
    activityList.innerHTML = '<li class="activity-empty">No recent activity yet.</li>';
    return;
  }

  activityList.innerHTML = items
    .map((item) => `
      <li>
        <div>
          <strong>${escapeHtml(item.code)}</strong>
          <span>${escapeHtml(item.country)} / ${escapeHtml(item.city)} - ${escapeHtml(item.browser)} on ${escapeHtml(item.os)}</span>
        </div>
        <time>${formatDateTime(item.created_at)}</time>
      </li>
    `)
    .join('');
};

const renderSkeleton = () => {
  linksTableBody.innerHTML = Array.from({ length: 5 }).map(() => `
    <tr>
      <td colspan="7"><div class="skeleton-row"></div></td>
    </tr>
  `).join('');
};

const loadAnalytics = async () => {
  const analytics = await apiRequest(ENDPOINTS.analytics);
  renderCharts(analytics);
  return analytics.summary;
};

const loadLinks = async () => {
  renderSkeleton();

  const params = new URLSearchParams({
    page: String(currentPage),
    limit: '10',
    search: currentSearch
  });

  const data = await apiRequest(`${ENDPOINTS.links}?${params.toString()}`);
  renderLinks(data);
  return data.pagination.total;
};

const loadRecentActivity = async () => {
  const data = await apiRequest(ENDPOINTS.recent);
  renderActivity(data.activity || []);
};

const openQrPreview = async (url) => {
  const qrContainer = document.querySelector('#qr-preview');
  qrContainer.innerHTML = '<p>Generating...</p>';
  showModal();

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 220,
      margin: 1,
      color: {
        dark: '#f5f8ff',
        light: '#101329'
      }
    });

    qrContainer.innerHTML = `
      <div class="qr-wrap">
        <img src="${dataUrl}" alt="QR" width="220" height="220" />
        <a class="btn-primary" href="${dataUrl}" download="routix-qr.png">Download QR</a>
      </div>
    `;
  } catch (error) {
    qrContainer.innerHTML = `<p class="error-text">${escapeHtml(error.message)}</p>`;
  }
};

const bootstrap = async () => {
  try {
    const me = await apiRequest(ENDPOINTS.me);
    document.querySelector('#user-email').textContent = me.user.email;

    const [analyticsSummary, totalLinks] = await Promise.all([loadAnalytics(), loadLinks(), loadRecentActivity()]);
    setStats(analyticsSummary, totalLinks);
  } catch (error) {
    showToast(error.message, 'error');
    clearToken();
    setTimeout(() => {
      window.location.href = ROUTES.login;
    }, 500);
  }
};

linksTableBody.addEventListener('click', async (event) => {
  const copyValue = event.target.getAttribute('data-copy');
  const deleteId = event.target.getAttribute('data-delete');
  const qrValue = event.target.getAttribute('data-qr');

  try {
    if (copyValue) {
      await copyToClipboard(copyValue);
      showToast('Link copied');
      return;
    }

    if (qrValue) {
      await openQrPreview(qrValue);
      return;
    }

    if (deleteId) {
      if (!window.confirm('Delete this link?')) return;

      await apiRequest(`${ENDPOINTS.links}/${deleteId}`, {
        method: 'DELETE'
      });

      showToast('Link deleted');
      const [analyticsSummary, totalLinks] = await Promise.all([loadAnalytics(), loadLinks(), loadRecentActivity()]);
      setStats(analyticsSummary, totalLinks);
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
});

createLinkBtn?.addEventListener('click', showModal);
modalCloseButtons.forEach((button) => button.addEventListener('click', closeModal));

modalBackdrop?.addEventListener('click', (event) => {
  if (event.target.classList.contains('modal-backdrop')) {
    closeModal();
  }
});

createLinkForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(createLinkForm);
  const targetUrl = String(formData.get('targetUrl') || '').trim();
  const customCode = String(formData.get('customCode') || '').trim();

  try {
    setButtonLoading(createLinkSubmit, true);

    await apiRequest(ENDPOINTS.links, {
      method: 'POST',
      data: {
        targetUrl,
        customCode
      }
    });

    showToast('Tracking link created');
    createLinkForm.reset();
    closeModal();

    const [analyticsSummary, totalLinks] = await Promise.all([loadAnalytics(), loadLinks(), loadRecentActivity()]);
    setStats(analyticsSummary, totalLinks);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setButtonLoading(createLinkSubmit, false, 'Create Link');
  }
});

let searchTimer = null;
searchInput?.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    currentSearch = searchInput.value.trim();
    currentPage = 1;

    try {
      const totalLinks = await loadLinks();
      const analyticsSummary = await loadAnalytics();
      setStats(analyticsSummary, totalLinks);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }, 300);
});

prevPageBtn?.addEventListener('click', async () => {
  if (currentPage <= 1) return;
  currentPage -= 1;

  try {
    const totalLinks = await loadLinks();
    const analyticsSummary = await loadAnalytics();
    setStats(analyticsSummary, totalLinks);
  } catch (error) {
    showToast(error.message, 'error');
  }
});

nextPageBtn?.addEventListener('click', async () => {
  currentPage += 1;

  try {
    const totalLinks = await loadLinks();
    const analyticsSummary = await loadAnalytics();
    setStats(analyticsSummary, totalLinks);
  } catch (error) {
    currentPage -= 1;
    showToast(error.message, 'error');
  }
});

logoutButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      await apiRequest(ENDPOINTS.logout, { method: 'POST' });
    } catch {
      // no-op for stateless logout
    } finally {
      clearToken();
      window.location.href = ROUTES.login;
    }
  });
});

bootstrap();
