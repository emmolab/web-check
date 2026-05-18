import { formatCyberbroEngineCsv, resolveCyberbroSelection } from '@/config/cyberbro-engines.js';
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

const defaultCyberbroBaseSettings = {
  enabled: readBool('CYBERBRO_ENABLED', true),
  baseUrl: read('CYBERBRO_BASE_URL', 'http://cyberbro:5000/api'),
  timeoutMs: read('CYBERBRO_TIMEOUT_MS', '30000'),
  preset: read('CYBERBRO_LOOKUP_PRESET', 'cyber_intel'),
  freeOnly: readBool('CYBERBRO_FREE_ONLY', false),
  engineMode: read('CYBERBRO_ENGINE_MODE', 'all'),
  engines: read('CYBERBRO_THREAT_ENGINES', ''),
};

export const defaultCyberbroSettings = {
  ...defaultCyberbroBaseSettings,
  engines: formatCyberbroEngineCsv(resolveCyberbroSelection(defaultCyberbroBaseSettings)),
};

export const getCyberbroSettings = () => {
  if (typeof window === 'undefined') return defaultCyberbroSettings;
  try {
    const raw = window.localStorage.getItem(CYBERBRO_SETTINGS_STORAGE_KEY);
    if (!raw) return defaultCyberbroSettings;
    const merged = { ...defaultCyberbroSettings, ...JSON.parse(raw) };
    return {
      ...merged,
      engines: formatCyberbroEngineCsv(resolveCyberbroSelection(merged)),
    };
  } catch {
    return defaultCyberbroSettings;
  }
};
