const parseUserAgent = (uaRaw = '') => {
  const ua = uaRaw.toLowerCase();

  const browserMatchers = [
    { regex: /edg\//, value: 'Edge' },
    { regex: /opr\//, value: 'Opera' },
    { regex: /chrome\//, value: 'Chrome' },
    { regex: /safari\//, value: 'Safari' },
    { regex: /firefox\//, value: 'Firefox' }
  ];

  const osMatchers = [
    { regex: /windows nt/, value: 'Windows' },
    { regex: /android/, value: 'Android' },
    { regex: /iphone|ipad|ipod/, value: 'iOS' },
    { regex: /mac os x/, value: 'macOS' },
    { regex: /linux/, value: 'Linux' }
  ];

  const browser = browserMatchers.find((item) => item.regex.test(ua))?.value || 'Unknown';
  const os = osMatchers.find((item) => item.regex.test(ua))?.value || 'Unknown';

  let device = 'Desktop';
  if (/mobile|iphone|android/.test(ua)) device = 'Mobile';
  if (/ipad|tablet/.test(ua)) device = 'Tablet';

  return { browser, os, device };
};

module.exports = {
  parseUserAgent
};
