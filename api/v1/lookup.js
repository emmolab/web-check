import { getEnabledLookupSections } from '../_common/lookup-registry.js';
import {
  buildErrors,
  buildSummary,
  normalizeSectionResult,
  normalizeTarget,
} from '../_common/normalize-response.js';

const DEFAULT_SECTION_TIMEOUT_MS = 10000;

const parseRequestedSections = (value) => {
  if (!value) return null;
  return new Set(
    String(value)
      .split(',')
      .map((section) => section.trim())
      .filter(Boolean),
  );
};

const executeWithTimeout = (promise, timeoutMs, sectionId) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Section ${sectionId} timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);

const executeLegacyHandler = async (section, target, req, timeoutMs) => {
  const module = await import(`../${section.routeName}.js`);
  const handler = module.default || module.handler;

  return executeWithTimeout(
    new Promise(async (resolve, reject) => {
      const mockRes = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(body) {
          if (this.statusCode >= 400) reject(new Error(body?.error || body?.message || 'Request failed'));
          else resolve(body);
        },
      };

      try {
        await handler({ ...req, query: { ...(req.query || {}), url: target.normalizedUrl } }, mockRes);
      } catch (error) {
        reject(error);
      }
    }),
    timeoutMs,
    section.id,
  );
};

export default async function lookupHandler(req, res) {
  const input = req.query?.target || req.query?.url;
  if (!input) {
    return res.status(400).json({
      error: 'Missing target',
      message: 'Provide a target query parameter, for example /api/v1/lookup?target=example.com.',
    });
  }

  let target;
  try {
    target = normalizeTarget(String(input));
  } catch (error) {
    return res.status(400).json({ error: 'Invalid target', message: error.message });
  }

  const requestedSections = parseRequestedSections(req.query?.sections);
  const timeoutMs = parseInt(
    req.query?.sectionTimeoutMs || process.env.WEB_CHECK_API_SECTION_TIMEOUT_MS || DEFAULT_SECTION_TIMEOUT_MS,
    10,
  );

  const selectedSections = getEnabledLookupSections().filter(
    (section) => !requestedSections || requestedSections.has(section.id) || requestedSections.has(section.routeName),
  );

  const sections = {};
  await Promise.all(
    selectedSections.map(async (section) => {
      try {
        const result = await executeLegacyHandler(section, target, req, timeoutMs);
        sections[section.id] = normalizeSectionResult(section, result);
      } catch (error) {
        sections[section.id] = normalizeSectionResult(section, { error: error.message });
      }
    }),
  );

  res.json({
    target,
    summary: buildSummary(target, sections),
    sections,
    errors: buildErrors(sections),
    generatedAt: new Date().toISOString(),
  });
}
