const localIpRegex = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|::1|fc00:|fe80:)/;

const getGeo = async (ip) => {
  if (!ip || localIpRegex.test(ip)) {
    return { country: 'Local', city: 'Local' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { country: 'Unknown', city: 'Unknown' };
    }

    const data = await response.json();

    if (data.status !== 'success') {
      return { country: 'Unknown', city: 'Unknown' };
    }

    return {
      country: data.country || 'Unknown',
      city: data.city || 'Unknown'
    };
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
};

module.exports = {
  getGeo
};
