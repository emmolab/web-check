import { isApiAuthConfigured } from '../_common/api-auth.js';
import { getCapabilities } from '../_common/lookup-registry.js';

export default async function capabilitiesHandler(req, res) {
  res.json({
    service: 'web-check-api',
    version: 'v1',
    auth: {
      configured: isApiAuthConfigured(),
      supportedHeaders: ['X-API-Key', 'Authorization: Bearer ***'],
    },
    sections: getCapabilities(),
    generatedAt: new Date().toISOString(),
  });
}
