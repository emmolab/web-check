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
CYBERBRO_THREAT_ENGINES='google_safe_browsing,virustotal,phishtank,threatfox,alienvault,urlscan'
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

### Local build path

From the `web-check` repo:

```bash
docker compose up --build
```

This starts:

- `web-check` on port `3000`
- `cyberbro` on port `5000` by default

### Future GHCR pull path

Once images are published, the same compose file can pull them instead of building locally.
Set these in `.env` or your shell:

```env
WEB_CHECK_IMAGE='ghcr.io/<owner>/web-check:latest'
CYBERBRO_IMAGE='ghcr.io/<owner>/web-check-cyberbro:latest'
```

Then run:

```bash
docker compose pull
docker compose up -d
```

## GitHub Container Registry release path

The Docker workflow now prepares both images for GHCR publishing:

- `ghcr.io/<owner>/web-check`
- `ghcr.io/<owner>/web-check-cyberbro`

On `master`, the workflow publishes `:latest` tags.
On git tags, it publishes matching version tags.

That means once the product pass is finished, publishing the images to GitHub can be a clean release step instead of a manual one-off.

## Recommended release order

1. Confirm repo state and env defaults
2. Publish GHCR images from GitHub Actions
3. Test `docker compose pull && docker compose up -d` on a clean host
4. Only then treat the tags as the deployment baseline

## GUI overrides

The `/account` page now includes a Cyberbro section where you can override:

- enabled/disabled state
- Cyberbro base URL
- timeout
- selected engines

These GUI overrides:

- are stored in `localStorage`
- only affect the current browser
- are meant for testing / previewing
- do not replace production env config

## Current card behavior

The Cyberbro integration currently shows:

- an overview verdict card
- per-source breakdowns and summaries
- selected engine list
- matched engine list
- extracted highlights like threat types / malware families / adversaries when present

## Notes

- Web Check build/typecheck are verified in this repo.
- Docker compose syntax/runtime should still be validated on a Docker-capable host before release.
- This first pass focuses on URL/domain-friendly threat sources rather than every Cyberbro engine.
