# Whitelabel Branding

Branding is env-driven only.
There is no GUI editor for production branding.

## Supported sources

Web Check can load branding from either of these sources:

1. **Uploaded / mounted env file** via `BRANDING_ENV_FILE`
2. **Remote env URL** via `BRANDING_ENV_URL`

Load order is:

1. local `.env`
2. `BRANDING_ENV_URL`
3. `BRANDING_ENV_FILE`

That means a mounted file can override a remote shared baseline when both are present.

## Example env contents

### Minimal

```env
PUBLIC_BRAND_NAME='PortalWatch'
PUBLIC_BRAND_REPO_URL='https://github.com/your-org/portalwatch'
PUBLIC_BRAND_COMPANY_NAME='Example Co'
PUBLIC_BRAND_COMPANY_URL='https://example.com'
PUBLIC_BRAND_SHOW_SPONSOR='false'
```

### Full

```env
PUBLIC_BRAND_NAME='PortalWatch'
PUBLIC_BRAND_TITLE_LONG='PortalWatch - Website Intelligence'
PUBLIC_BRAND_DESCRIPTION='Your branded description'
PUBLIC_BRAND_HERO_TITLE='Investigate websites with confidence'
PUBLIC_BRAND_HERO_SUBTITLE='Threat intel and OSINT in one place'
PUBLIC_BRAND_HERO_INPUT_LABEL='Enter a URL to start'
PUBLIC_BRAND_SOURCE_LABEL='View Source'
PUBLIC_BRAND_DEPLOY_LABEL='Deploy Your Own'
PUBLIC_BRAND_API_LABEL='Use the API'
PUBLIC_BRAND_SPONSOR_LABEL='Sponsored by'
PUBLIC_BRAND_REPO_URL='https://github.com/your-org/portalwatch'
PUBLIC_BRAND_API_SOURCE_URL='https://github.com/your-org/your-api-repo'
PUBLIC_BRAND_DOCKER_IMAGE='ghcr.io/your-org/portalwatch'
PUBLIC_BRAND_COMPANY_NAME='Example Co'
PUBLIC_BRAND_COMPANY_URL='https://example.com'
PUBLIC_BRAND_COPYRIGHT_LABEL='MIT'
PUBLIC_BRAND_LOGO_PATH='/your-logo.svg'
PUBLIC_BRAND_APP_ICON_PATH='/your-icon.png'
PUBLIC_BRAND_OG_IMAGE_PATH='/your-banner.png'
PUBLIC_BRAND_APPLE_TOUCH_ICON_PATH='/apple-touch-icon.png'
PUBLIC_BRAND_FAVICON_SVG_PATH='/your-favicon.svg'
PUBLIC_BRAND_FAVICON_PNG_PATH='/your-favicon.png'
PUBLIC_BRAND_SHOW_SPONSOR='false'
PUBLIC_BRAND_PRIMARY_COLOR='#4f46e5'
PUBLIC_BRAND_PRIMARY_LIGHTER_COLOR='#818cf8'
PUBLIC_BRAND_TEXT_COLOR='#ffffff'
PUBLIC_BRAND_TEXT_COLOR_SECONDARY='#cbd5e1'
PUBLIC_BRAND_TEXT_COLOR_THIRDLY='#94a3b8'
PUBLIC_BRAND_BACKGROUND_COLOR='#0b1020'
PUBLIC_BRAND_BACKGROUND_DARKER_COLOR='#050814'
PUBLIC_BRAND_BACKGROUND_LIGHTER_COLOR='#182033'
PUBLIC_BRAND_BACKGROUND_50_COLOR='#0b102080'
PUBLIC_BRAND_BG_SHADOW_COLOR='#0b1020'
PUBLIC_BRAND_FG_SHADOW_COLOR='#4f46e5'
PUBLIC_BRAND_PRIMARY_TRANSPARENT_COLOR='#4f46e530'
PUBLIC_BRAND_INFO_COLOR='#38bdf8'
PUBLIC_BRAND_SUCCESS_COLOR='#22c55e'
PUBLIC_BRAND_WARNING_COLOR='#eab308'
PUBLIC_BRAND_ERROR_COLOR='#fb923c'
PUBLIC_BRAND_DANGER_COLOR='#f43f5e'
PUBLIC_BRAND_NEUTRAL_COLOR='#334155'
```

## How to use an uploaded / mounted file

Place a file on disk or mount it into the container, then set:

```env
BRANDING_ENV_FILE='/branding/branding.full.env'
```

For Docker Compose, that usually means mounting a folder containing the file and exporting `BRANDING_ENV_FILE`.

## How to use a remote URL

Host a plain-text env file somewhere reachable over HTTP or HTTPS, then set:

```env
BRANDING_ENV_URL='https://example.com/branding/full.env'
```

This works well when multiple deployments should share a single centrally managed branding source.

## Example template files

The repo ships with example branding env files at:

- `public/branding/branding.minimal.env`
- `public/branding/branding.full.env`

These are also available through the GUI at `/branding/branding.minimal.env` and `/branding/branding.full.env` for download.

## Notes

- Only branding-related keys are loaded from `BRANDING_ENV_FILE` and `BRANDING_ENV_URL`.
- Cyberbro browser-local overrides remain available on `/account` because they do not rebrand the app or affect other users.
- Production/shared branding should come from env vars or these external env files, not browser storage.
- After changing branding inputs, rebuild and restart the app so the generated frontend and metadata stay in sync.
