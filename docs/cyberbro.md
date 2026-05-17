# Bundled Cyberbro Integration

Web Check can now run with a bundled Cyberbro sidecar and surface the results as additional threat-intel cards.

## What was added

- `api/cyberbro.js` — Web Check backend bridge to Cyberbro
- `vendor/cyberbro/` — vendored Cyberbro source
- `docker-compose.yml` — bundled `web-check` + `cyberbro` stack
- `Cyberbro Threat Intel` card
- `Cyberbro Sources` card
- GUI overrides for Cyberbro settings at `/account`

## Default flow

1. Web Check calls its own `/api/cyberbro` endpoint.
2. That endpoint submits a job to Cyberbro `/api/analyze`.
3. Web Check polls Cyberbro until the analysis completes.
4. Results are normalized into card-friendly summaries.

## Environment variables

```env
CYBERBRO_ENABLED='true'
CYBERBRO_BASE_URL='http://cyberbro:5000/api'
CYBERBRO_ENGINE_MODE='free'
CYBERBRO_THREAT_ENGINES='ipapi,reverse_dns,rdap_whois,google_dns,github,urlscan,phishtank,hudsonrock,crtsh,bad_asn,misp_feedback,abusix,ipquery'
CYBERBRO_TIMEOUT_MS='30000'
CYBERBRO_HOST_PORT='5000'
```

Useful Cyberbro API keys for the current threat cards:

```env
GOOGLE_SAFE_BROWSING=''
VIRUSTOTAL=''
THREATFOX=''
ALIENVAULT=''
```

## Docker

### GHCR pull path

The bundled compose file now pulls the published GHCR images by default.
Optional overrides can still be set in `.env` or your shell:

```env
WEB_CHECK_IMAGE='ghcr.io/emmolab/web-check:latest'
CYBERBRO_IMAGE='ghcr.io/emmolab/web-check-cyberbro:latest'
```

Then run:

```bash
docker compose pull
docker compose up -d
```

## GitHub Container Registry release path

The Docker workflow publishes both images to GHCR:

- `ghcr.io/emmolab/web-check`
- `ghcr.io/emmolab/web-check-cyberbro`

On `master`, the workflow publishes `:latest` tags.
On git tags, it publishes matching version tags.

That keeps deployments pull-based and avoids any AWS/ECR publishing dependency in this repo.

## Recommended release order

1. Confirm repo state and env defaults
2. Publish GHCR images from GitHub Actions
3. Test `docker compose pull && docker compose up -d` on a clean host
4. Only then treat the tags as the deployment baseline

## GUI overrides

The `/account` page now includes a Cyberbro settings section where you can override:

- enabled/disabled state
- Cyberbro base URL
- timeout
- selected engines
- engine preset (`free`, `all`, or `custom`)

In the main navigation, this page is exposed as **Settings**.

These GUI overrides:

- are stored in `localStorage`
- only affect the current browser
- are meant for testing / previewing
- do not replace production env config

## Current card behavior

The Cyberbro integration currently shows:

- an overview verdict card
- per-source breakdowns and summaries
- same-origin links into proxied Cyberbro graph/results pages
- selected engine list
- matched engine list
- extracted highlights like threat types / malware families / adversaries when present

## Notes

- Web Check build/typecheck are verified in this repo.
- Docker compose syntax/runtime should still be validated on a Docker-capable host before release.
- This first pass focuses on URL/domain-friendly threat sources rather than every Cyberbro engine.
