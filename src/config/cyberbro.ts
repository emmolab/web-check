import {
  ALL_CYBERBRO_ENGINES,
  formatCyberbroEngineCsv,
  resolveCyberbroEngines,
} from '@/config/cyberbro-engines.js';
const env = import.meta.env as Record<string, string | undefined>;

export const CYBERBRO_SETTINGS_STORAGE_KEY = 'web-check.cyberbro-settings';

const read = (key: string, fallback: string) => {
  const value = env[key]?.trim();
  return value ? value : fallback;
};

const readBool = (key: string, fallback: boolean) => {
  const value = env[key]?.trim().toLowerCase();
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value);
};

export const defaultCyberbroSettings = {
  enabled: readBool('CYBERBRO_ENABLED', true),
  baseUrl: read('CYBERBRO_BASE_URL', 'http://cyberbro:5000/api'),
  timeoutMs: read('CYBERBRO_TIMEOUT_MS', '30000'),
  engineMode: read('CYBERBRO_ENGINE_MODE', 'all'),
  engines: read('CYBERBRO_THREAT_ENGINES', formatCyberbroEngineCsv(ALL_CYBERBRO_ENGINES)),
};

export const getCyberbroSettings = () => {
  if (typeof window === 'undefined') return defaultCyberbroSettings;
  try {
    const raw = window.localStorage.getItem(CYBERBRO_SETTINGS_STORAGE_KEY);
    if (!raw) return defaultCyberbroSettings;
    const merged = { ...defaultCyberbroSettings, ...JSON.parse(raw) };
    return {
      ...merged,
      engines: formatCyberbroEngineCsv(resolveCyberbroEngines(merged)),
    };
  } catch {
    return defaultCyberbroSettings;
  }
};
