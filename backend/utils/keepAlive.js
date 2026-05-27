const startKeepAlive = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = process.env.SELF_PING_URL || process.env.RENDER_EXTERNAL_URL;

  if (!isProduction || !baseUrl) {
    return;
  }

  const interval = setInterval(async () => {
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/health`);
      if (!response.ok) {
        console.warn(`[KeepAlive] Ping failed with status ${response.status}`);
      }
    } catch (error) {
      console.warn(`[KeepAlive] Ping error: ${error.message}`);
    }
  }, 120000);

  if (typeof interval.unref === 'function') {
    interval.unref();
  }

  console.log('[KeepAlive] Self ping enabled every 120 seconds.');
};

module.exports = {
  startKeepAlive
};
