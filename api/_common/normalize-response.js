import { parseTarget } from './parse-target.js';

const toBoolean = (value) => (typeof value === 'boolean' ? value : null);

export const normalizeTarget = (input) => {
  const parsed = parseTarget(input);
  return {
    input,
    normalizedUrl: parsed.href,
    hostname: parsed.hostname,
    port: parsed.port,
    protocol: parsed.protocol.replace(/:$/, ''),
  };
};

export const normalizeSectionResult = (section, result) => {
  if (result?.error) {
    return {
      id: section.id,
      routeName: section.routeName,
      status: 'error',
      error: String(result.error),
      data: result,
    };
  }

  if (result?.skipped) {
    return {
      id: section.id,
      routeName: section.routeName,
      status: 'skipped',
      reason: String(result.skipped),
      data: result,
    };
  }

  return {
    id: section.id,
    routeName: section.routeName,
    status: 'ok',
    data: result,
  };
};

const summarizeIp = (data) => ({
  primaryIp: data?.ip || null,
  primaryIpFamily: data?.family || null,
});

const summarizeDns = (data) => ({
  aRecords: Array.isArray(data?.A) ? data.A : [],
  aaaaRecords: Array.isArray(data?.AAAA) ? data.AAAA : [],
  mxRecords: Array.isArray(data?.MX) ? data.MX : [],
  nsRecords: Array.isArray(data?.NS) ? data.NS : [],
  hasDnsRecords: Boolean(data?.A?.length || data?.AAAA?.length || data?.MX?.length || data?.NS?.length),
});

const txtToString = (record) => (Array.isArray(record) ? record.join('') : String(record || ''));

const summarizeMail = (data) => {
  const txtRecords = Array.isArray(data?.txtRecords) ? data.txtRecords.map(txtToString) : [];
  const dmarcRecord = txtRecords.find((record) => record.toLowerCase().startsWith('v=dmarc1')) || null;
  const spfRecord = txtRecords.find((record) => record.toLowerCase().startsWith('v=spf1')) || null;
  const dkimRecords = txtRecords.filter((record) => /\bv=dkim1\b/i.test(record));

  return {
    mxCount: Array.isArray(data?.mxRecords) ? data.mxRecords.length : 0,
    providers: Array.isArray(data?.mailServices) ? data.mailServices.map((entry) => entry.provider) : [],
    spf: Boolean(spfRecord),
    dmarc: Boolean(dmarcRecord),
    dkimDetected: dkimRecords.length > 0,
  };
};

const summarizeHttpSecurity = (data) => {
  const values = Object.values(data || {}).filter((value) => typeof value === 'boolean');
  const present = values.filter(Boolean).length;
  const total = values.length;
  return {
    present,
    total,
    score: total ? Math.round((present / total) * 100) : null,
    posture: total && present / total >= 0.75 ? 'good' : total && present / total >= 0.45 ? 'fair' : 'needs-review',
  };
};

const summarizeThreats = (data) => {
  const sources = Object.entries(data || {});
  const unsafe = sources.some(([, value]) => value?.unsafe === true || value?.valid === true);
  const skipped = sources.filter(([, value]) => value?.skipped).map(([name]) => name);
  const errors = sources.filter(([, value]) => value?.error).map(([name]) => name);
  return {
    level: unsafe ? 'elevated' : 'low',
    unsafe,
    skippedSources: skipped,
    errorSources: errors,
  };
};

export const buildSummary = (target, sections) => {
  const okData = (id) => (sections[id]?.status === 'ok' ? sections[id].data : null);
  const getIp = okData('getIp');
  const dns = okData('dns');
  const status = okData('status');
  const mail = okData('mailConfig');
  const httpSecurity = okData('httpSecurity');
  const tls = okData('tlsConnection');
  const ssl = okData('ssl');
  const threats = okData('threats');

  return {
    hostname: target.hostname,
    normalizedUrl: target.normalizedUrl,
    status: status?.responseCode ?? null,
    responseTimeMs: status?.responseTime ? Math.round(status.responseTime) : null,
    ...summarizeIp(getIp),
    dns: summarizeDns(dns),
    tls: {
      protocol: tls?.protocol || null,
      authorized: toBoolean(tls?.authorized),
      authError: tls?.authError || ssl?.authError || null,
      ocspStapled: toBoolean(tls?.ocspStapled),
      forwardSecrecy: toBoolean(tls?.forwardSecrecy),
      certificateValid: toBoolean(ssl?.isValid),
      certificateValidTo: ssl?.valid_to || null,
    },
    mailSecurity: summarizeMail(mail),
    httpSecurity: summarizeHttpSecurity(httpSecurity),
    threat: summarizeThreats(threats),
  };
};

export const buildErrors = (sections) =>
  Object.values(sections)
    .filter((section) => section.status === 'error')
    .map((section) => ({ section: section.id, message: section.error }));
