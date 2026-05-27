const sanitizeString = (value, maxLength = 500) => {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
};

const sanitizeNullableString = (value, maxLength = 500) => {
  const sanitized = sanitizeString(value, maxLength);
  return sanitized || null;
};

const sanitizeUrl = (value) => {
  const clean = sanitizeString(value, 2000);
  try {
    const parsed = new URL(clean);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
};

module.exports = {
  sanitizeString,
  sanitizeNullableString,
  sanitizeUrl
};
