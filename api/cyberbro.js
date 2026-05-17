import middleware from './_common/middleware.js';
import { httpGet, httpPost } from './_common/http.js';
import { parseTarget } from './_common/parse-target.js';
import { upstreamError } from './_common/upstream.js';
import {
  cyberbroEngineMap,
  formatCyberbroEngineCsv,
  FREE_CYBERBRO_ENGINES,
  resolveCyberbroEngines,
} from '../src/config/cyberbro-engines.js';

const CYBERBRO_ENABLED = process.env.CYBERBRO_ENABLED !== 'false';
const CYBERBRO_BASE_URL_DEFAULT = (
  process.env.CYBERBRO_BASE_URL || 'http://cyberbro:5000/api'
).replace(/\/$/, '');
const CYBERBRO_POLL_INTERVAL_MS = parseInt(process.env.CYBERBRO_POLL_INTERVAL_MS || '1000', 10);
const CYBERBRO_TIMEOUT_MS_DEFAULT = parseInt(
  process.env.CYBERBRO_TIMEOUT_MS || process.env.PUBLIC_API_TIMEOUT_LIMIT || '30000',
  10,
);
const CYBERBRO_ENGINE_MODE_DEFAULT = (process.env.CYBERBRO_ENGINE_MODE || 'free').toLowerCase();
const CYBERBRO_THREAT_ENGINES_DEFAULT = resolveCyberbroEngines({
  engineMode: CYBERBRO_ENGINE_MODE_DEFAULT,
  engines: process.env.CYBERBRO_THREAT_ENGINES || formatCyberbroEngineCsv(FREE_CYBERBRO_ENGINES),
});

const engineCatalog = {
  google_safe_browsing: {
    label: 'Google Safe Browsing',
    classify: (data) => {
      const hit = !!data && data.threat_found !== 'No threat found';
      return {
        status: hit ? 'hit' : data ? 'clear' : 'no-data',
        hit,
        summary: hit
          ? `${(data.threat_types || []).join(', ') || 'Threat match'} detected`
          : 'No threat found',
        link: null,
      };
    },
  },
  virustotal: {
    label: 'VirusTotal',
    classify: (data) => {
      const malicious = Number(data?.total_malicious || 0);
      return {
        status: malicious > 0 ? 'hit' : data ? 'clear' : 'no-data',
        hit: malicious > 0,
        summary: data?.detection_ratio ? `Detections: ${data.detection_ratio}` : 'No detections',
        link: data?.link || null,
      };
    },
  },
  phishtank: {
    label: 'PhishTank',
    classify: (data) => {
      const hit = data?.verified === 'true' || data?.valid === 'true';
      return {
        status: hit ? 'hit' : data ? 'clear' : 'no-data',
        hit,
        summary: hit ? 'Known phishing match' : 'No phishing match',
        link: data?.phish_detail_page || null,
      };
    },
  },
  threatfox: {
    label: 'ThreatFox',
    classify: (data) => {
      const count = Number(data?.count || 0);
      return {
        status: count > 0 ? 'hit' : data ? 'clear' : 'no-data',
        hit: count > 0,
        summary:
          count > 0
            ? `${count} IOC match${count === 1 ? '' : 'es'}${
                data?.malware_printable?.length
                  ? ` • ${data.malware_printable.slice(0, 3).join(', ')}`
                  : ''
              }`
            : 'No IOC match',
        link: data?.link || null,
      };
    },
  },
  alienvault: {
    label: 'AlienVault OTX',
    classify: (data) => {
      const count = Number(data?.count || 0);
      return {
        status: count > 0 ? 'hit' : data ? 'clear' : 'no-data',
        hit: count > 0,
        summary:
          count > 0
            ? `${count} pulse${count === 1 ? '' : 's'}${
                data?.malware_families?.length
                  ? ` • ${data.malware_families.slice(0, 3).join(', ')}`
                  : ''
              }`
            : 'No OTX pulses',
        link: data?.link || null,
      };
    },
  },
  urlscan: {
    label: 'urlscan.io',
    classify: (data) => {
      const count = Number(data?.scan_count || 0);
      return {
        status: count > 0 ? 'intel' : data ? 'clear' : 'no-data',
        hit: false,
        summary: count > 0 ? `${count} historical scan${count === 1 ? '' : 's'}` : 'No scans found',
        link: data?.link || null,
      };
    },
  },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getQueryValue = (request, key) => request?.query?.[key] || request?.queryStringParameters?.[key];

const getRuntimeSettings = (request) => {
  const enabledRaw = getQueryValue(request, 'enabled');
  const baseUrl = (getQueryValue(request, 'baseUrl') || CYBERBRO_BASE_URL_DEFAULT).replace(/\/$/, '');
  const timeoutRaw = getQueryValue(request, 'timeoutMs');
  const engineModeRaw = getQueryValue(request, 'engineMode');
  const enginesRaw = getQueryValue(request, 'engines');
  const engineMode = engineModeRaw ? String(engineModeRaw).toLowerCase() : CYBERBRO_ENGINE_MODE_DEFAULT;
  const engines = resolveCyberbroEngines({
    engineMode,
    engines: enginesRaw || formatCyberbroEngineCsv(CYBERBRO_THREAT_ENGINES_DEFAULT),
  });

  return {
    enabled:
      enabledRaw === undefined ? CYBERBRO_ENABLED : !['false', '0', 'off'].includes(String(enabledRaw).toLowerCase()),
    baseUrl,
    timeoutMs: timeoutRaw ? parseInt(String(timeoutRaw), 10) : CYBERBRO_TIMEOUT_MS_DEFAULT,
    engineMode,
    engines,
  };
};

const pickPrimaryResult = (results, hostname) => {
  if (!Array.isArray(results) || results.length === 0) return null;
  return (
    results.find((item) => String(item?.observable || '').includes(hostname)) ||
    results.find((item) => item?.type === 'URL') ||
    results[0]
  );
};

const buildEngineRows = (result, selectedEngines) => {
  const rows = [];
  for (const engineName of selectedEngines) {
    const config = engineCatalog[engineName];
    const raw = result?.[engineName] ?? null;
    const genericClassified =
      raw === null || raw === undefined
        ? { status: 'no-data', hit: false, summary: 'No data returned', link: null }
        : raw?.error
          ? { status: 'no-data', hit: false, summary: String(raw.error), link: null }
          : Array.isArray(raw)
            ? {
                status: raw.length > 0 ? 'intel' : 'clear',
                hit: false,
                summary: raw.length > 0 ? `${raw.length} result${raw.length === 1 ? '' : 's'} returned` : 'No results',
                link: null,
              }
            : {
                status: 'intel',
                hit: false,
                summary:
                  raw?.detection_ratio ||
                  raw?.summary ||
                  `${Object.keys(raw || {}).length} field${Object.keys(raw || {}).length === 1 ? '' : 's'} returned`,
                link: raw?.link || raw?.url || raw?.result_url || raw?.permalink || raw?.phish_detail_page || null,
              };
    const classified = config?.classify ? config.classify(raw) : genericClassified;
    rows.push({
      id: engineName,
      label: config?.label || cyberbroEngineMap[engineName]?.label || engineName,
      ...classified,
      raw,
    });
  }
  return rows.sort((a, b) => {
    const order = { hit: 0, intel: 1, clear: 2, 'no-data': 3 };
    return (order[a.status] ?? 9) - (order[b.status] ?? 9) || a.label.localeCompare(b.label);
  });
};

const buildHighlights = (result) => {
  const threatTypes = result?.google_safe_browsing?.threat_types || [];
  const malwareFamilies = [
    ...(result?.threatfox?.malware_printable || []),
    ...(result?.alienvault?.malware_families || []),
  ].filter(Boolean);
  const adversaries = result?.alienvault?.adversary || [];
  return {
    threatTypes: [...new Set(threatTypes)],
    malwareFamilies: [...new Set(malwareFamilies)],
    adversaries: [...new Set(adversaries)],
  };
};

const cyberbroHandler = async (url, request) => {
  const settings = getRuntimeSettings(request);
  if (!settings.enabled) return { skipped: 'Cyberbro integration is disabled' };

  const { hostname, href } = parseTarget(url);

  try {
    const analyzeRes = await httpPost(
      `${settings.baseUrl}/analyze`,
      {
        text: href,
        engines: settings.engines,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: Math.min(settings.timeoutMs, 10000),
      },
    );

    const analysisId = analyzeRes.data?.analysis_id;
    if (!analysisId) return { skipped: 'Cyberbro returned no analysis id' };
    const cyberbroConsoleBase = settings.baseUrl.replace(/\/api\/?$/, '');

    const startedAt = Date.now();
    let complete = false;

    while (!complete && Date.now() - startedAt < settings.timeoutMs) {
      const statusRes = await httpGet(`${settings.baseUrl}/is_analysis_complete/${analysisId}`, {
        timeout: Math.min(settings.timeoutMs, 10000),
      });
      complete = !!statusRes.data?.complete;
      if (!complete) await sleep(CYBERBRO_POLL_INTERVAL_MS);
    }

    if (!complete) {
      return { error: `Cyberbro timed out after ${settings.timeoutMs} ms` };
    }

    const resultsRes = await httpGet(`${settings.baseUrl}/results/${analysisId}`, {
      timeout: Math.min(settings.timeoutMs, 10000),
    });

    const primaryResult = pickPrimaryResult(resultsRes.data, hostname);
    if (!primaryResult) return { skipped: 'Cyberbro returned no observable results' };

    const engines = buildEngineRows(primaryResult, settings.engines);
    const hits = engines.filter((engine) => engine.hit);
    const intel = engines.filter((engine) => engine.status === 'intel');
    const clear = engines.filter((engine) => engine.status === 'clear');
    const noData = engines.filter((engine) => engine.status === 'no-data');
    const highlights = buildHighlights(primaryResult);

    return {
      observable: {
        value: primaryResult.observable,
        type: primaryResult.type,
      },
      summary: {
        verdict: hits.length > 0 ? '⚠️ Threat intel matches found' : '✅ No threat matches found',
        hitCount: hits.length,
        intelCount: intel.length,
        clearCount: clear.length,
        noDataCount: noData.length,
        matchedEngines: hits.map((engine) => engine.label),
        selectedEngines: settings.engines,
      },
      settings,
      engines,
      highlights,
      analysisId,
      graphPath: '/cyberbro/graph/' + analysisId + '?baseUrl=' + encodeURIComponent(settings.baseUrl),
      resultsPath: '/cyberbro/results/' + analysisId + '?baseUrl=' + encodeURIComponent(settings.baseUrl),
      cyberbroConsoleBase,
      raw: primaryResult,
    };
  } catch (error) {
    return upstreamError(error, 'Cyberbro');
  }
};

export const handler = middleware(cyberbroHandler);
export default handler;
