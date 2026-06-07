const getHeader = (req, name) => {
  const headers = req?.headers || {};
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return Array.isArray(value) ? value[0] : value;
  }
  return undefined;
};

const extractBearerToken = (authorization) => {
  if (!authorization) return null;
  const match = String(authorization).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
};

export const getExpectedApiKey = () => process.env.WEB_CHECK_API_KEY || '';

export const isApiAuthConfigured = () => Boolean(getExpectedApiKey());

export const getProvidedApiKey = (req) =>
  getHeader(req, 'x-api-key') || extractBearerToken(getHeader(req, 'authorization')) || '';

export const isAuthorizedApiRequest = (req) => {
  const expected = getExpectedApiKey();
  if (!expected) return true;
  return getProvidedApiKey(req) === expected;
};

export const requireApiKey = (req, res, next) => {
  if (isAuthorizedApiRequest(req)) return next();

  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Provide a valid API key using the X-API-Key header.',
  });
};

export default requireApiKey;
