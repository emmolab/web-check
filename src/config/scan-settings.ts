import { getScanPreset } from '@/config/scan-presets';

export const SCAN_SETTINGS_STORAGE_KEY = 'web-check.scan-settings';
const fallbackCustomJobIds = getScanPreset('web').jobIds;

export const defaultScanSettings = {
  preset: 'web',
  customJobIds: fallbackCustomJobIds,
  customCyberbroPreset: 'web',
};

const resolveScanSettings = (settings: typeof defaultScanSettings & Record<string, any>) => {
  const preset = getScanPreset(settings.preset);
  const customJobIds =
    Array.isArray(settings.customJobIds) && settings.customJobIds.length > 0
      ? settings.customJobIds
      : fallbackCustomJobIds;
  const customCyberbroPreset =
    settings.customCyberbroPreset === 'cyber_intel' ? 'cyber_intel' : 'web';
  return {
    ...settings,
    preset: preset.id,
    customJobIds,
    customCyberbroPreset,
    jobIds: preset.id === 'custom' ? customJobIds : preset.jobIds,
    cyberbroPreset: preset.id === 'custom' ? customCyberbroPreset : preset.cyberbroPreset,
  };
};

export const getScanSettings = () => {
  if (typeof window === 'undefined') return resolveScanSettings(defaultScanSettings);
  try {
    const raw = window.localStorage.getItem(SCAN_SETTINGS_STORAGE_KEY);
    const merged = raw ? { ...defaultScanSettings, ...JSON.parse(raw) } : defaultScanSettings;
    return resolveScanSettings(merged);
  } catch {
    return resolveScanSettings(defaultScanSettings);
  }
};

export const saveScanSettings = (
  settings:
    | {
        preset?: string;
        customJobIds?: string[];
        customCyberbroPreset?: string;
      }
    | undefined,
) => {
  if (typeof window === 'undefined') return undefined;
  const preset = getScanPreset(settings?.preset);
  const payload = {
    preset: preset.id,
    customJobIds:
      Array.isArray(settings?.customJobIds) && settings.customJobIds.length > 0
        ? settings.customJobIds
        : fallbackCustomJobIds,
    customCyberbroPreset: settings?.customCyberbroPreset === 'cyber_intel' ? 'cyber_intel' : 'web',
  };
  window.localStorage.setItem(SCAN_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
  return resolveScanSettings(payload);
};
