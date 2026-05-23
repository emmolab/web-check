if (import.meta.env.SSR) {
  const { loadExternalBrandingEnv } = await import('./branding-env.js');
  await loadExternalBrandingEnv();
}

const env = import.meta.env as Record<string, string | undefined>;
const processEnv =
  typeof process !== 'undefined'
    ? (process.env as Record<string, string | undefined>)
    : ({} as Record<string, string | undefined>);

const getEnvValue = (key: string) => env[key] ?? processEnv[key];

const read = (key: string, fallback: string) => {
  const value = getEnvValue(key)?.trim();
  return value ? value : fallback;
};

const readBool = (key: string, fallback: boolean) => {
  const value = getEnvValue(key)?.trim().toLowerCase();
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value);
};

export const defaultBranding = {
  name: read('PUBLIC_BRAND_NAME', 'Web Check'),
  titleLong: read('PUBLIC_BRAND_TITLE_LONG', 'Web Check - X-Ray Vision for any Website'),
  description: read(
    'PUBLIC_BRAND_DESCRIPTION',
    'Web Check is the all-in-one OSINT and security tool, for revealing the inner workings of any website',
  ),
  heroTitle: read('PUBLIC_BRAND_HERO_TITLE', 'We give you X-Ray Vision for your Website'),
  heroSubtitle: read(
    'PUBLIC_BRAND_HERO_SUBTITLE',
    'In just 20 seconds, you can see what attackers already know',
  ),
  heroInputLabel: read('PUBLIC_BRAND_HERO_INPUT_LABEL', 'Enter a URL to start 👇'),
  sourceLabel: read('PUBLIC_BRAND_SOURCE_LABEL', 'View on GitHub'),
  deployLabel: read('PUBLIC_BRAND_DEPLOY_LABEL', 'Deploy your Own'),
  apiLabel: read('PUBLIC_BRAND_API_LABEL', 'Use the API'),
  sponsorLabel: read('PUBLIC_BRAND_SPONSOR_LABEL', 'Sponsored by'),
  repoUrl: read('PUBLIC_BRAND_REPO_URL', 'https://github.com/emmolab/web-check'),
  apiSourceUrl: read('PUBLIC_BRAND_API_SOURCE_URL', 'https://github.com/xray-web/web-check-api'),
  dockerImage: read('PUBLIC_BRAND_DOCKER_IMAGE', 'ghcr.io/emmolab/web-check'),
  companyName: read('PUBLIC_BRAND_COMPANY_NAME', 'Web Check'),
  companyUrl: read('PUBLIC_BRAND_COMPANY_URL', 'https://github.com/emmolab/web-check'),
  copyrightLabel: read('PUBLIC_BRAND_COPYRIGHT_LABEL', 'MIT'),
  logoPath: read('PUBLIC_BRAND_LOGO_PATH', '/favicon.svg'),
  appIconPath: read('PUBLIC_BRAND_APP_ICON_PATH', '/web-check.png'),
  ogImagePath: read('PUBLIC_BRAND_OG_IMAGE_PATH', '/banner.png'),
  appleTouchIconPath: read('PUBLIC_BRAND_APPLE_TOUCH_ICON_PATH', '/apple-touch-icon.png'),
  faviconSvgPath: read('PUBLIC_BRAND_FAVICON_SVG_PATH', '/favicon.svg'),
  faviconPngPath: read('PUBLIC_BRAND_FAVICON_PNG_PATH', '/web-check.png'),
  showSponsor: readBool('PUBLIC_BRAND_SHOW_SPONSOR', true),
  theme: {
    primary: read('PUBLIC_BRAND_PRIMARY_COLOR', '#d6fb41'),
    primaryLighter: read('PUBLIC_BRAND_PRIMARY_LIGHTER_COLOR', '#cff97a'),
    textColor: read('PUBLIC_BRAND_TEXT_COLOR', '#ffffff'),
    textColorSecondary: read('PUBLIC_BRAND_TEXT_COLOR_SECONDARY', '#ffffffb6'),
    textColorThirdly: read('PUBLIC_BRAND_TEXT_COLOR_THIRDLY', '#ffffff5b'),
    background: read('PUBLIC_BRAND_BACKGROUND_COLOR', '#111211'),
    backgroundDarker: read('PUBLIC_BRAND_BACKGROUND_DARKER_COLOR', '#111927'),
    backgroundLighter: read('PUBLIC_BRAND_BACKGROUND_LIGHTER_COLOR', '#3a3b3a'),
    background50: read('PUBLIC_BRAND_BACKGROUND_50_COLOR', '#11121180'),
    surface: read('PUBLIC_BRAND_SURFACE_COLOR', '#171b18'),
    surfaceElevated: read('PUBLIC_BRAND_SURFACE_ELEVATED_COLOR', '#202623'),
    surfaceAccent: read('PUBLIC_BRAND_SURFACE_ACCENT_COLOR', '#0f1412'),
    bgShadowColor: read('PUBLIC_BRAND_BG_SHADOW_COLOR', '#0f1620'),
    fgShadowColor: read('PUBLIC_BRAND_FG_SHADOW_COLOR', '#456602'),
    primaryTransparent: read('PUBLIC_BRAND_PRIMARY_TRANSPARENT_COLOR', '#d6fb4130'),
    info: read('PUBLIC_BRAND_INFO_COLOR', '#04e4f4'),
    success: read('PUBLIC_BRAND_SUCCESS_COLOR', '#20e253'),
    warning: read('PUBLIC_BRAND_WARNING_COLOR', '#f6f000'),
    error: read('PUBLIC_BRAND_ERROR_COLOR', '#fca016'),
    danger: read('PUBLIC_BRAND_DANGER_COLOR', '#f80363'),
    neutral: read('PUBLIC_BRAND_NEUTRAL_COLOR', '#272f4d'),
  },
};

export const branding = defaultBranding;

export const brandThemeCss = `:root {
  --primary: ${branding.theme.primary};
  --primary-lighter: ${branding.theme.primaryLighter};
  --primary-light: color-mix(in srgb, ${branding.theme.primaryLighter} 60%, transparent);
  --primary-dark: color-mix(in srgb, ${branding.theme.primary} 45%, ${branding.theme.background});
  --text-color: ${branding.theme.textColor};
  --text-color-secondary: ${branding.theme.textColorSecondary};
  --text-color-thirdly: ${branding.theme.textColorThirdly};
  --background: ${branding.theme.background};
  --background-darker: ${branding.theme.backgroundDarker};
  --background-lighter: ${branding.theme.backgroundLighter};
  --background-50: ${branding.theme.background50};
  --surface: ${branding.theme.surface};
  --surface-elevated: ${branding.theme.surfaceElevated};
  --surface-accent: ${branding.theme.surfaceAccent};
  --bg-shadow-color: ${branding.theme.bgShadowColor};
  --fg-shadow-color: ${branding.theme.fgShadowColor};
  --primary-transparent: ${branding.theme.primaryTransparent};
  --info: ${branding.theme.info};
  --success: ${branding.theme.success};
  --warning: ${branding.theme.warning};
  --error: ${branding.theme.error};
  --danger: ${branding.theme.danger};
  --neutral: ${branding.theme.neutral};
  --pattern-dot: color-mix(in srgb, ${branding.theme.textColor} 24%, transparent);
  --meteor-color: ${branding.theme.primary};
  --surface-contrast: ${branding.theme.textColor};
  --surface-contrast-strong: color-mix(in srgb, ${branding.theme.textColor} 92%, ${branding.theme.background});
  --danger-soft: color-mix(in srgb, ${branding.theme.danger} 16%, transparent);
  --danger-border: color-mix(in srgb, ${branding.theme.danger} 36%, transparent);
  --info-soft: color-mix(in srgb, ${branding.theme.info} 16%, transparent);
  --info-border: color-mix(in srgb, ${branding.theme.info} 36%, transparent);
  --success-soft: color-mix(in srgb, ${branding.theme.success} 16%, transparent);
  --success-border: color-mix(in srgb, ${branding.theme.success} 36%, transparent);
  --brand-gradient-0: color-mix(in srgb, ${branding.theme.primaryLighter} 45%, white);
  --brand-gradient-1: ${branding.theme.primaryLighter};
  --brand-gradient-2: ${branding.theme.primary};
  --brand-gradient-3: color-mix(in srgb, ${branding.theme.primary} 72%, ${branding.theme.background});
  --brand-gradient-4: color-mix(in srgb, ${branding.theme.primary} 40%, ${branding.theme.backgroundDarker});
  --border-subtle: color-mix(in srgb, ${branding.theme.textColor} 10%, transparent);
  --border-strong: color-mix(in srgb, ${branding.theme.primary} 28%, transparent);
}`;
