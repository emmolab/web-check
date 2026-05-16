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
  engines: read(
    'CYBERBRO_THREAT_ENGINES',
    'google_safe_browsing,virustotal,phishtank,threatfox,alienvault,urlscan',
  ),
};

export const getCyberbroSettings = () => {
  if (typeof window === 'undefined') return defaultCyberbroSettings;
  try {
    const raw = window.localStorage.getItem(CYBERBRO_SETTINGS_STORAGE_KEY);
    if (!raw) return defaultCyberbroSettings;
    return { ...defaultCyberbroSettings, ...JSON.parse(raw) };
  } catch {
    return defaultCyberbroSettings;
  }
};
