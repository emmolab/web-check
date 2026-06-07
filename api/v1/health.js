import { isApiAuthConfigured } from '../_common/api-auth.js';

export default async function healthHandler(req, res) {
  res.json({
    ok: true,
    service: 'web-check-api',
    version: 'v1',
    auth: {
      configured: isApiAuthConfigured(),
    },
    generatedAt: new Date().toISOString(),
  });
}
