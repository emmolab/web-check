# Web Check API v1

Web Check API v1 exposes a stable, automation-friendly JSON surface for MSP and PSA workflows. It keeps the legacy `/api/<check>` endpoints available while adding versioned routes under `/api/v1`.

## Authentication

Set `WEB_CHECK_API_KEY` in the deployment environment to protect v1 routes.

Supported request headers:

```bash
X-API-Key: your-key
```

or:

```bash
Authorization: Bearer your-key
```

If `WEB_CHECK_API_KEY` is not set, v1 routes remain open. This keeps local development and private self-hosted deployments simple while allowing public deployments to enforce auth.

## Response envelope

`GET /api/v1/lookup` returns the same top-level fields on every successful request:

- `target`: normalized target details.
- `summary`: compact PSA-friendly fields for low-code automations.
- `sections`: normalized per-check results. Each section has `id`, `routeName`, `status`, and `data`; skipped sections include `reason`; failed sections include `error`.
- `errors`: non-fatal section failures. A failed section does not fail the whole lookup.
- `generatedAt`: ISO timestamp.

Section names use stable camelCase IDs such as `getIp`, `mailConfig`, `httpSecurity`, and `tlsConnection`. The original legacy route name is preserved as `routeName`.

## Endpoints

### `GET /api/v1/health`

Health endpoint for uptime checks and integration monitoring.

```bash
curl http://localhost:3000/api/v1/health
```

Example response:

```json
{
  "ok": true,
  "service": "web-check-api",
  "version": "v1",
  "auth": { "configured": true },
  "generatedAt": "2026-06-06T00:00:00.000Z"
}
```

### `GET /api/v1/capabilities`

Lists supported enrichment sections and whether optional dependencies are configured.

```bash
curl -H 'X-API-Key: your-key' http://localhost:3000/api/v1/capabilities
```

### `GET /api/v1/lookup?target=<url-or-domain>`

Main enrichment endpoint for HaloPSA, ConnectWise, n8n, and internal tooling.

```bash
curl -H 'X-API-Key: your-key' 'http://localhost:3000/api/v1/lookup?target=example.com'
```

Optional query parameters:

- `sections=getIp,status,dns,mailConfig`: run only selected sections. Values may use v1 section IDs or legacy route names.
- `sectionTimeoutMs=8000`: override the per-section timeout for this request.

Example compact payload:

```json
{
  "target": {
    "input": "example.com",
    "normalizedUrl": "https://example.com/",
    "hostname": "example.com",
    "port": null,
    "protocol": "https"
  },
  "summary": {
    "hostname": "example.com",
    "normalizedUrl": "https://example.com/",
    "status": 200,
    "responseTimeMs": 232,
    "primaryIp": "93.184.216.34",
    "primaryIpFamily": 4,
    "dns": {
      "aRecords": ["93.184.216.34"],
      "aaaaRecords": [],
      "mxRecords": [],
      "nsRecords": [],
      "hasDnsRecords": true
    },
    "tls": {
      "protocol": "TLSv1.3",
      "authorized": true,
      "authError": null,
      "ocspStapled": false,
      "forwardSecrecy": true,
      "certificateValid": true,
      "certificateValidTo": "Jan 15 23:59:59 2027 GMT"
    },
    "mailSecurity": {
      "mxCount": 0,
      "providers": [],
      "spf": false,
      "dmarc": false,
      "dkimDetected": false
    },
    "httpSecurity": {
      "present": 6,
      "total": 10,
      "score": 60,
      "posture": "fair"
    },
    "threat": {
      "level": "low",
      "unsafe": false,
      "skippedSources": [],
      "errorSources": []
    }
  },
  "sections": {},
  "errors": [],
  "generatedAt": "2026-06-06T00:00:00.000Z"
}
```

## PSA usage patterns

API v1 is designed to sit behind PSA workflows rather than replace them. For production MSP/MSSP use, keep the Web Check API key in middleware, an automation platform, or a server-side integration — not in browser-side PSA scripts.

### HaloPSA: customer or ticket enrichment

Common flow:

1. A HaloPSA automation rule, scheduled job, or webhook middleware receives a customer, site, asset, or ticket update.
2. Middleware extracts the best target value, usually the customer website, primary domain, affected URL, or sender domain.
3. Middleware calls Web Check:

```text
GET /api/v1/lookup?target={{customer.website}}&sections=status,getIp,dns,mailConfig,httpSecurity,tlsConnection
```

4. Middleware writes selected fields back to HaloPSA as custom fields, ticket notes, or company/site context.

Suggested HaloPSA field mapping:

- Company or site custom field: `WebCheck Hostname` → `summary.hostname`
- Company or site custom field: `Primary IP` → `summary.primaryIp`
- Company or site custom field: `HTTP Status` → `summary.status`
- Company or site custom field: `TLS Certificate Valid` → `summary.tls.certificateValid`
- Company or site custom field: `TLS Valid Until` → `summary.tls.certificateValidTo`
- Company or site custom field: `SPF Present` → `summary.mailSecurity.spf`
- Company or site custom field: `DMARC Present` → `summary.mailSecurity.dmarc`
- Company or site custom field: `HTTP Security Posture` → `summary.httpSecurity.posture`
- Ticket note: `errors[]` and any `sections.<id>.status === "error"` details

Example ticket-note template:

```text
Web Check enrichment for {{summary.hostname}}
Status: {{summary.status}}
Primary IP: {{summary.primaryIp}}
TLS: {{summary.tls.certificateValid}} until {{summary.tls.certificateValidTo}}
Mail security: SPF={{summary.mailSecurity.spf}}, DMARC={{summary.mailSecurity.dmarc}}
HTTP security posture: {{summary.httpSecurity.posture}} ({{summary.httpSecurity.score}}/100)
Non-fatal lookup errors: {{errors.length}}
```

Operational guidance:

- Use `sections=` to keep the lookup fast for ticket creation workflows.
- Use the full lookup in scheduled customer posture refreshes where runtime is less critical.
- Store the latest lookup timestamp from `generatedAt` so engineers can tell whether the PSA data is fresh.

### ConnectWise PSA: middleware service pattern

ConnectWise integrations should usually call Web Check from a small middleware service or automation worker. The middleware holds `WEB_CHECK_API_KEY`, performs the lookup, then updates ConnectWise company, configuration, or ticket records.

Common flow:

1. ConnectWise workflow rule or scheduled automation identifies a company domain, configuration URL, or ticket URL.
2. Middleware calls:

```text
GET /api/v1/lookup?target={{domain}}&sections=status,getIp,dns,mailConfig,httpSecurity,tlsConnection
```

3. Middleware maps the response into ConnectWise custom fields or an internal note.

Suggested ConnectWise mapping:

- Company custom field: `WebCheck Domain` → `summary.hostname`
- Company custom field: `WebCheck Last Seen IP` → `summary.primaryIp`
- Company custom field: `WebCheck HTTP Status` → `summary.status`
- Configuration custom field: `TLS Authorized` → `summary.tls.authorized`
- Configuration custom field: `TLS Protocol` → `summary.tls.protocol`
- Configuration custom field: `Certificate Valid To` → `summary.tls.certificateValidTo`
- Company custom field: `DMARC Enabled` → `summary.mailSecurity.dmarc`
- Company custom field: `SPF Enabled` → `summary.mailSecurity.spf`
- Ticket priority/routing signal: escalate if `summary.tls.certificateValid === false`, `summary.status >= 500`, or `summary.mailSecurity.dmarc === false` for mail-security work

Example middleware response handling:

```js
const risky =
  lookup.summary?.status >= 500 ||
  lookup.summary?.tls?.certificateValid === false ||
  lookup.summary?.threat?.unsafe === true;

const note = [
  `Web Check: ${lookup.summary.hostname}`,
  `HTTP: ${lookup.summary.status ?? 'unknown'}`,
  `IP: ${lookup.summary.primaryIp ?? 'unknown'}`,
  `TLS valid: ${lookup.summary.tls?.certificateValid ?? 'unknown'}`,
  `DMARC: ${lookup.summary.mailSecurity?.dmarc ?? 'unknown'}`,
  `HTTP security: ${lookup.summary.httpSecurity?.posture ?? 'unknown'}`,
  `Lookup errors: ${lookup.errors?.length ?? 0}`,
].join('\n');
```

### n8n: low-code enrichment and branching

Recommended n8n node sequence:

1. Trigger node: webhook, schedule, PSA event, or manual workflow.
2. Set node: normalize the input domain into `domain`.
3. HTTP Request node:
   - Method: `GET`
   - URL: `https://your-web-check.example/api/v1/lookup`
   - Query parameter: `target={{ $json.domain }}`
   - Optional query parameter: `sections=status,getIp,dns,mailConfig,httpSecurity,tlsConnection`
   - Header: `X-API-Key={{ $env.WEB_CHECK_API_KEY }}`
   - Response format: JSON
4. IF node examples:
   - `{{ $json.summary.tls.certificateValid === false }}` → create certificate remediation ticket
   - `{{ $json.summary.status >= 500 }}` → create outage ticket
   - `{{ $json.summary.mailSecurity.dmarc === false }}` → create mail-security improvement opportunity
   - `{{ $json.errors.length > 0 }}` → append a diagnostic note rather than failing the whole workflow
5. PSA update node: write selected summary fields to HaloPSA, ConnectWise, Autotask, a spreadsheet, or a reporting database.

Example n8n expression values:

```text
Hostname: {{ $json.summary.hostname }}
Primary IP: {{ $json.summary.primaryIp || 'unknown' }}
TLS valid: {{ $json.summary.tls.certificateValid }}
DMARC enabled: {{ $json.summary.mailSecurity.dmarc }}
HTTP security posture: {{ $json.summary.httpSecurity.posture }}
Generated at: {{ $json.generatedAt }}
```

Error-handling recommendation:

- Treat HTTP `400` as an input hygiene issue and route it back to data cleanup.
- Treat HTTP `401` as an integration secret/configuration issue.
- Treat non-empty `errors[]` inside a `200` response as partial enrichment, not a failed workflow.

## Partial failure behavior

Lookup requests are intentionally resilient. If DNS succeeds but TLS or an external threat feed times out, the response still returns available data. Failed sections appear under `errors` and under their corresponding `sections.<id>` entry with `status: "error"`.
