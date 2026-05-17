import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const BRANDING_ENV_KEYS = new Set(['PUBLIC_SITE_URL', 'SITE_URL', 'ENABLE_ANALYTICS']);
const BRANDING_PREFIX = 'PUBLIC_BRAND_';
let loaded = false;

const isBrandingKey = (key) => key.startsWith(BRANDING_PREFIX) || BRANDING_ENV_KEYS.has(key);

const applyBrandingEnv = (values) => {
  Object.entries(values).forEach(([key, value]) => {
    if (!isBrandingKey(key)) return;
    process.env[key] = value;
  });
};

const parseEnvText = (raw, sourceLabel) => {
  try {
    return dotenv.parse(raw);
  } catch (error) {
    throw new Error(`Unable to parse branding env from ${sourceLabel}: ${error.message}`);
  }
};

const loadFromFile = (filePath) => {
  const resolvedPath = path.resolve(filePath);
  let raw;
  try {
    raw = fs.readFileSync(resolvedPath, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read branding env file at ${resolvedPath}: ${error.message}`);
  }
  applyBrandingEnv(parseEnvText(raw, resolvedPath));
  return resolvedPath;
};

const loadFromUrl = async (url) => {
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  } catch (error) {
    throw new Error(`Unable to fetch branding env URL ${url}: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`Unable to fetch branding env URL ${url}: HTTP ${response.status}`);
  }

  applyBrandingEnv(parseEnvText(await response.text(), url));
  return url;
};

export const loadExternalBrandingEnv = async () => {
  if (loaded) return [];

  const sources = [];
  const brandingEnvUrl = process.env.BRANDING_ENV_URL?.trim();
  const brandingEnvFile = process.env.BRANDING_ENV_FILE?.trim();

  if (brandingEnvUrl) {
    sources.push(`url:${await loadFromUrl(brandingEnvUrl)}`);
  }

  if (brandingEnvFile) {
    sources.push(`file:${loadFromFile(brandingEnvFile)}`);
  }

  loaded = true;
  return sources;
};
