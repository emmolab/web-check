# Web Check

Web Check is a self-hosted website intelligence and security inspection tool. Give it a URL, domain, IPv4, or IPv6 target and it runs a broad set of OSINT, web, DNS, TLS, and infrastructure checks, then presents the results in a single operator-friendly interface.

This version focuses on self-hosted deployments, environment-driven branding, and bundled threat-intelligence workflows.

## Key Additions

- Environment-driven whitelabel branding for self-hosted deployments
- External branding env loading from a mounted file or remote URL
- Bundled Cyberbro integration with extra threat-intel result cards
- GHCR-first Docker deployment flow
- A simplified self-hosted UI flow

## Core Features

- Website and domain inspection
- IPv4 and IPv6 target support
- DNS, WHOIS, headers, cookies, redirects, robots.txt, security.txt, and TLS checks
- Infrastructure discovery such as hostnames, server info, ports, and geolocation
- Threat-intelligence aggregation through Cyberbro
- Preset-based and custom scan selection
- Self-hosted branding without editing frontend code

## Project Structure

- `src/client/` - React client app, result cards, styles, routing, and analysis logic
- `src/pages/` - Astro entry pages and server-rendered routes
- `api/` - backend handlers for scan jobs and integrations
- `vendor/cyberbro/` - bundled Cyberbro source and data volumes
- `docs/` - focused docs for branding and Cyberbro setup
- `.env.sample` - optional environment variables
- `docker-compose.yml` - default pull-based deployment stack

## Quick Start

### Docker Compose

This is the easiest path for a self-hosted deployment.

```bash
git clone https://github.com/emmolab/web-check.git
cd web-check
cp .env.sample .env
docker compose pull
docker compose up -d
```

Default ports:

- Web Check: `http://localhost:3000`
- Cyberbro: `http://localhost:5000`

The compose stack pulls:

- `ghcr.io/emmolab/web-check:latest`
- `ghcr.io/emmolab/web-check-cyberbro:latest`

### Local Development

Requirements:

- Node.js `>= 22`
- Yarn `1.x` via Corepack

Install and run:

```bash
corepack enable
yarn install
yarn dev
```

Useful commands:

```bash
yarn build
yarn typecheck
yarn lint
yarn hold-my-beer
```

`yarn dev` runs the backend API and Astro frontend together.

## Configuration

Everything is optional, but many checks depend on external APIs and keys.

Start with:

```bash
cp .env.sample .env
```

Common categories in `.env.sample`:

- External API keys for scan providers
- Cyberbro integration settings
- Branding and whitelabel values
- Runtime settings like `PORT`, `DISABLE_GUI`, and `PUBLIC_API_TIMEOUT_LIMIT`

## Branding / Whitelabel

Branding is environment-driven. There is no production GUI editor for branding.

Supported sources:

1. Local `.env`
2. `BRANDING_ENV_URL`
3. `BRANDING_ENV_FILE`

Useful variables include:

- `PUBLIC_BRAND_NAME`
- `PUBLIC_BRAND_TITLE_LONG`
- `PUBLIC_BRAND_DESCRIPTION`
- `PUBLIC_BRAND_REPO_URL`
- `PUBLIC_BRAND_COMPANY_NAME`
- `PUBLIC_BRAND_COMPANY_URL`
- `PUBLIC_BRAND_PRIMARY_COLOR`
- `PUBLIC_BRAND_APP_ICON_PATH`

See:

- [docs/whitelabel.md](docs/whitelabel.md)
- [.env.sample](.env.sample)

## Cyberbro Integration

This project includes bundled Cyberbro support for additional threat-intelligence workflows.

What it adds:

- `Cyberbro Threat Intel` result card
- `Cyberbro Sources` result card
- `Cyberbro Graph` result card
- Preset-aware Cyberbro engine selection
- Browser-local Cyberbro overrides on `/account`

Common Cyberbro settings:

- `CYBERBRO_ENABLED`
- `CYBERBRO_BASE_URL`
- `CYBERBRO_ENGINE_MODE`
- `CYBERBRO_THREAT_ENGINES`
- `CYBERBRO_TIMEOUT_MS`

Useful related API keys:

- `GOOGLE_SAFE_BROWSING`
- `VIRUSTOTAL`
- `THREATFOX`
- `ALIENVAULT`
- `CRIMINALIP_API_KEY`
- `RANSOMWARE_LIVE_API_KEY`

See:

- [docs/cyberbro.md](docs/cyberbro.md)

## App Routes

Main self-hosted routes:

- `/` - home / scan launcher
- `/check/<target>` - results page for a scanned target
- `/about` - about page
- `/account` - browser-local Cyberbro settings
- `/web-check-api/` - API docs landing page

## Deployment Notes

- `docker-compose.yml` is set up for pull-based deployments from GHCR
- The web container reads `.env` and optional branding sources at startup
- Branding changes should be followed by a container restart so the frontend rebuild picks them up
- Cyberbro is expected to be reachable at `http://cyberbro:5000/api` inside Docker by default

For Docker-based updates:

```bash
docker compose pull
docker compose up -d
```

## Documentation

- [docs/whitelabel.md](docs/whitelabel.md) - branding and customization
- [docs/cyberbro.md](docs/cyberbro.md) - Cyberbro setup and runtime behavior
- [.env.sample](.env.sample) - environment variables and examples
- [docker-compose.yml](docker-compose.yml) - default deployment stack

## Upstream Credit

This project is based on [Lissy93/web-check](https://github.com/Lissy93/web-check) and extends that foundation for self-hosted, branded, and threat-intel-focused deployments.
