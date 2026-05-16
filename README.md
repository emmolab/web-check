# Web-Check (Emmolab Fork)

This repository is Emmolab's fork of [Lissy93/web-check](https://github.com/Lissy93/web-check), adapted for self-hosted branded deployments and bundled threat-intel workflows.

## What's different in this fork

- **Whitelabel branding support** via environment variables
- **GUI branding editor** on `/account` for browser-local overrides
- **Bundled Cyberbro integration** with extra threat-intel cards
- **Docker / GHCR-first deployment path** for pull-based installs
- **Removed unused repo automation** for external mirrors and release flows we aren't using

## Container images

- `ghcr.io/emmolab/web-check:latest`
- `ghcr.io/emmolab/web-check-cyberbro:latest`

## Quick start with Docker Compose

```bash
git clone https://github.com/emmolab/web-check.git
cd web-check

export WEB_CHECK_IMAGE=ghcr.io/emmolab/web-check:latest
export CYBERBRO_IMAGE=ghcr.io/emmolab/web-check-cyberbro:latest

docker compose pull
docker compose up -d
```

If you want to build locally instead, leave those variables unset and Compose will use the included build definitions.

## Key docs

- [`docs/whitelabel.md`](docs/whitelabel.md) - branding and fork customisation
- [`docs/cyberbro.md`](docs/cyberbro.md) - Cyberbro setup and configuration
- [`.env.sample`](.env.sample) - environment variables
- [`docker-compose.yml`](docker-compose.yml) - local build or GHCR pull deployment

## Branding

This fork supports environment-driven branding, including values such as:

- `PUBLIC_BRAND_NAME`
- `PUBLIC_BRAND_TAGLINE`
- `PUBLIC_BRAND_DESCRIPTION`
- `PUBLIC_BRAND_LOGO_URL`
- `PUBLIC_BRAND_REPO_URL`

There is also a local browser-side branding editor at `/account` for fast previews and demos.

## Cyberbro integration

Cyberbro is shipped alongside Web-Check and exposed through additional result cards. Runtime settings can be controlled through environment variables or the `/account` settings UI.

## Development

```bash
corepack yarn install
corepack yarn dev
```

Useful checks:

```bash
corepack yarn typecheck
corepack yarn build
```

## Upstream credit

This project is based on the excellent upstream work at [Lissy93/web-check](https://github.com/Lissy93/web-check). This fork keeps that foundation while tailoring deployment, branding, and threat-intel behaviour for Emmolab.
