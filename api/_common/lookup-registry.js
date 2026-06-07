export const lookupSections = [
  {
    id: 'getIp',
    routeName: 'get-ip',
    label: 'Resolved IP addresses',
    description: 'Public IPv4/IPv6 addresses resolved from the target.',
    requiresEnv: [],
    enabled: true,
  },
  {
    id: 'status',
    routeName: 'status',
    label: 'HTTP status',
    description: 'HTTP reachability, status code, and response timing.',
    requiresEnv: [],
    enabled: true,
  },
  {
    id: 'dns',
    routeName: 'dns',
    label: 'DNS records',
    description: 'A, AAAA, MX, TXT, NS, CNAME, SOA, SRV, and PTR records.',
    requiresEnv: [],
    enabled: true,
  },
  {
    id: 'txtRecords',
    routeName: 'txt-records',
    label: 'TXT records',
    description: 'Domain TXT records for policy and verification checks.',
    requiresEnv: [],
    enabled: true,
  },
  {
    id: 'mailConfig',
    routeName: 'mail-config',
    label: 'Mail configuration',
    description: 'MX records, mail provider hints, SPF, DMARC, BIMI, and common DKIM selectors.',
    requiresEnv: [],
    enabled: true,
  },
  {
    id: 'headers',
    routeName: 'headers',
    label: 'HTTP headers',
    description: 'Raw response headers from the target.',
    requiresEnv: [],
    enabled: true,
  },
  {
    id: 'httpSecurity',
    routeName: 'http-security',
    label: 'HTTP security',
    description: 'Security header posture and related HTTP control checks.',
    requiresEnv: [],
    enabled: true,
  },
  {
    id: 'tlsConnection',
    routeName: 'tls-connection',
    label: 'TLS connection',
    description: 'Negotiated TLS protocol, cipher, ALPN, forward secrecy, and OCSP stapling.',
    requiresEnv: [],
    enabled: true,
  },
  {
    id: 'ssl',
    routeName: 'ssl',
    label: 'TLS certificate',
    description: 'Certificate identity, trust, issuer, validity, and expiry data.',
    requiresEnv: [],
    enabled: true,
  },
  {
    id: 'whois',
    routeName: 'whois',
    label: 'WHOIS',
    description: 'Registrar and registration metadata where available.',
    requiresEnv: [],
    enabled: true,
  },
  {
    id: 'threats',
    routeName: 'threats',
    label: 'Threat intelligence',
    description: 'Reputation and threat indicators from configured providers.',
    requiresEnv: ['GOOGLE_SAFE_BROWSING', 'VIRUSTOTAL', 'THREATFOX', 'ALIENVAULT'],
    enabled: true,
  },
  {
    id: 'cyberbro',
    routeName: 'cyberbro',
    label: 'Cyberbro threat enrichment',
    description: 'Optional Cyberbro-driven enrichment when enabled in the deployment.',
    requiresEnv: ['CYBERBRO_ENABLED'],
    enabled: () => process.env.CYBERBRO_ENABLED === 'true',
    optional: true,
  },
];

export const isSectionEnabled = (section) =>
  typeof section.enabled === 'function' ? Boolean(section.enabled()) : section.enabled !== false;

export const getEnabledLookupSections = () => lookupSections.filter(isSectionEnabled);

export const getCapabilities = () =>
  lookupSections.map((section) => ({
    id: section.id,
    routeName: section.routeName,
    label: section.label,
    description: section.description,
    optional: Boolean(section.optional),
    enabled: isSectionEnabled(section),
    requiresEnv: section.requiresEnv,
    configured: section.requiresEnv.every((key) => Boolean(process.env[key])),
  }));
