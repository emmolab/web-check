# Whitelabeling

Web Check now supports a simple env-driven whitelabel layer for branding and theming.

## How it works

Set `PUBLIC_BRAND_*` variables in your `.env` file before building or starting the app.
These values are safe for the frontend and are exposed to the browser.

Core settings:

```env
PUBLIC_BRAND_NAME='Your Product Name'
PUBLIC_BRAND_TITLE_LONG='Your Product - Website Intelligence'
PUBLIC_BRAND_DESCRIPTION='Your branded description'
PUBLIC_BRAND_HERO_TITLE='Your hero headline'
PUBLIC_BRAND_HERO_SUBTITLE='Your hero subheading'
PUBLIC_BRAND_HERO_INPUT_LABEL='Enter a URL to start'
PUBLIC_BRAND_REPO_URL='https://github.com/your-org/your-repo'
PUBLIC_BRAND_API_SOURCE_URL='https://github.com/your-org/your-api-repo'
PUBLIC_BRAND_DOCKER_IMAGE='your-org/your-image'
PUBLIC_BRAND_COMPANY_NAME='Your Company'
PUBLIC_BRAND_COMPANY_URL='https://your-company.example'
PUBLIC_BRAND_LOGO_PATH='/your-logo.svg'
PUBLIC_BRAND_APP_ICON_PATH='/your-icon.png'
PUBLIC_BRAND_OG_IMAGE_PATH='/your-banner.png'
PUBLIC_BRAND_SHOW_SPONSOR='false'
```

Theme settings:

```env
PUBLIC_BRAND_PRIMARY_COLOR='#4f46e5'
PUBLIC_BRAND_PRIMARY_LIGHTER_COLOR='#818cf8'
PUBLIC_BRAND_TEXT_COLOR='#ffffff'
PUBLIC_BRAND_BACKGROUND_COLOR='#0b1020'
PUBLIC_BRAND_BACKGROUND_LIGHTER_COLOR='#182033'
PUBLIC_BRAND_PRIMARY_TRANSPARENT_COLOR='#4f46e530'
```

## Docker example

```bash
docker run -p 3000:3000 \
  -e PUBLIC_BRAND_NAME='PortalWatch' \
  -e PUBLIC_BRAND_COMPANY_NAME='Example Co' \
  -e PUBLIC_BRAND_SHOW_SPONSOR='false' \
  -e PUBLIC_BRAND_PRIMARY_COLOR='#4f46e5' \
  your-image
```

## GUI editing

There is now a browser-side branding editor at `/account` ("Branding Studio").

It lets you edit the main whitelabel values from the GUI and stores overrides in `localStorage` for the current browser.
That makes it useful for:

- quick demos
- local previews
- iterating on brand direction before locking env vars

Notes:

- GUI edits are local to the current browser/device.
- Production/shared branding should still be set via `PUBLIC_BRAND_*` env vars.
- The GUI editor applies changes immediately by triggering the runtime branding layer.
- The same `/account` page also includes Cyberbro GUI overrides for local testing.

## Current coverage

The whitelabel config currently drives:

- SEO/meta tags
- favicon / logo / OG image paths
- top nav branding
- homepage hero copy
- homepage CTA links
- footer attribution links
- self-hosted setup page copy and Docker image reference
- API page branding
- runtime theme colors in Astro + React UI

## Notes

- Asset paths should point to files served by the app, usually from `public/`.
- Rebuild after changing branding values for production deployments.
- This is a branding layer, not a tenant isolation layer.
