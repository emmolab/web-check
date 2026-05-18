import { getScanPreset } from '@/config/scan-presets';

export const SCAN_SETTINGS_STORAGE_KEY = 'web-check.scan-settings';

export const defaultScanSettings = {
  preset: 'web',
};

export const getScanSettings = () => {
  const fallbackPreset = getScanPreset(defaultScanSettings.preset);
  if (typeof window === 'undefined') {
    return {
      ...defaultScanSettings,
      preset: fallbackPreset.id,
      jobIds: fallbackPreset.jobIds,
      cyberbroPreset: fallbackPreset.cyberbroPreset,
    };
  }
  try {
    const raw = window.localStorage.getItem(SCAN_SETTINGS_STORAGE_KEY);
    const merged = raw ? { ...defaultScanSettings, ...JSON.parse(raw) } : defaultScanSettings;
    const preset = getScanPreset(merged.preset);
    return {
      ...merged,
      preset: preset.id,
      jobIds: preset.jobIds,
      cyberbroPreset: preset.cyberbroPreset,
    };
  } catch {
    return {
      ...defaultScanSettings,
      preset: fallbackPreset.id,
      jobIds: fallbackPreset.jobIds,
      cyberbroPreset: fallbackPreset.cyberbroPreset,
    };
  }
};

export const saveScanSettings = (settings: { preset?: string } | undefined) => {
  if (typeof window === 'undefined') return undefined;
  const preset = getScanPreset(settings?.preset);
  const payload = { preset: preset.id };
  window.localStorage.setItem(SCAN_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
  return {
    ...payload,
    jobIds: preset.jobIds,
    cyberbroPreset: preset.cyberbroPreset,
  };
};
