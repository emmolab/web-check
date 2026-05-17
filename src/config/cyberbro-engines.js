export const cyberbroEngineCatalog = [
  { name: 'abuseipdb', label: 'AbuseIPDB', supports: 'risk', description: 'IP reputation & abuse reports' },
  { name: 'abusix', label: 'Abusix', supports: 'abuse free_no_key', description: 'Abuse contact lookup (free)' },
  { name: 'alienvault', label: 'Alienvault', supports: 'hash ip domain url', description: 'Threat intelligence platform' },
  { name: 'bad_asn', label: 'Bad ASN Check', supports: 'ip risk free_no_key', description: 'Malicious ASN detection (free)' },
  { name: 'criminalip', label: 'Criminal IP', supports: 'ip', description: 'Attack surface & threat hunting' },
  { name: 'crowdstrike', label: 'CrowdStrike', supports: 'hash ip domain url', description: 'Advanced threat detection' },
  { name: 'crtsh', label: 'crt.sh', supports: 'domain url free_no_key', description: 'Certificate transparency logs' },
  { name: 'dfir_iris', label: 'DFIR-IRIS', supports: 'domain url ip hash extension', description: 'Incident response platform' },
  { name: 'github', label: 'Github', supports: 'domain url ip hash extension free_no_key scraping', description: 'Code search via grep.app' },
  { name: 'google', label: 'Google', supports: 'domain url ip hash extension', description: 'Google Custom Search results' },
  { name: 'google_dns', label: 'Google DNS', supports: 'domain url ip free_no_key', description: 'Common DNS records lookup' },
  { name: 'google_safe_browsing', label: 'Safe Browsing', supports: 'risk domain ip', description: "Google's threat detection" },
  { name: 'hister', label: 'Hister', supports: 'domain url email ip hash extension', description: 'Personal search engine' },
  { name: 'hudsonrock', label: 'Hudson Rock', supports: 'domain url email free_no_key', description: 'Infostealer leak database' },
  { name: 'ioc_one_html', label: 'Ioc.One (HTML)', supports: 'domain url ip hash extension scraping', description: 'HTML threat reports search' },
  { name: 'ioc_one_pdf', label: 'Ioc.One (PDF)', supports: 'domain url ip hash extension scraping', description: 'PDF threat reports search' },
  { name: 'ipapi', label: 'IPapi', supports: 'default ip vpn proxy risk free_no_key', description: 'IP geolocation & proxy detection' },
  { name: 'ipinfo', label: 'IPinfo', supports: 'ip', description: 'IP address information' },
  { name: 'ipquery', label: 'IPquery', supports: 'ip risk vpn proxy free_no_key', description: 'IP intelligence (default, free)' },
  { name: 'mde', label: 'Microsoft Defender', supports: 'hash ip domain url', description: 'Enterprise endpoint security' },
  { name: 'misp', label: 'MISP', supports: 'domain url ip hash extension', description: 'Threat sharing platform' },
  { name: 'misp_feedback', label: 'MISP-feedback', supports: 'hash ip domain free_no_key', description: 'Warninglist false-positive detector' },
  { name: 'opencti', label: 'OpenCTI', supports: 'domain url ip hash extension', description: 'Cyber threat intelligence' },
  { name: 'phishtank', label: 'Phishtank', supports: 'risk domain url free_no_key', description: 'Phishing site verification' },
  { name: 'ransomware_live', label: 'Ransomware.Live', supports: 'domain url', description: 'Ransomware victim lookup' },
  { name: 'reverse_dns', label: 'Reverse DNS', supports: 'default domain ip abuse free_no_key', description: 'DNS lookup (default, free)' },
  { name: 'rdap_whois', label: 'RDAP / Whois', supports: 'default abuse domain free_no_key', description: 'Domain registration data (RDAP + Whois)' },
  { name: 'rl_analyze', label: 'ReversingLabs', supports: 'domain url ip hash extension', description: 'File & threat analysis' },
  { name: 'rosti', label: 'Rosti', supports: 'domain url ip email hash', description: 'IOC search and enrichment' },
  { name: 'shodan', label: 'Shodan', supports: 'ports ip', description: 'Internet-connected device search' },
  { name: 'spur', label: 'Spur.us', supports: 'vpn proxy ip', description: 'Anonymous proxy detection' },
  { name: 'threatfox', label: 'ThreatFox', supports: 'ip domain url', description: 'Malware IOC database' },
  { name: 'urlscan', label: 'URLscan', supports: 'domain url ip hash free_no_key', description: 'Website scanner & analyzer' },
  { name: 'virustotal', label: 'VirusTotal', supports: 'hash risk ip domain url', description: 'Multi-engine malware scanner' },
  { name: 'webscout', label: 'WebScout', supports: 'ip vpn proxy risk', description: 'IP reputation & risk scoring' },
];

export const cyberbroEngineMap = Object.fromEntries(
  cyberbroEngineCatalog.map((engine) => [engine.name, engine]),
);

export const ALL_CYBERBRO_ENGINES = cyberbroEngineCatalog.map((engine) => engine.name);
export const FREE_CYBERBRO_ENGINES = cyberbroEngineCatalog
  .filter((engine) => engine.supports.includes('free_no_key'))
  .map((engine) => engine.name);

export const parseCyberbroEngines = (value) =>
  String(value || '')
    .split(',')
    .map((engine) => engine.trim())
    .filter(Boolean);

export const resolveCyberbroEngines = ({ engineMode, engines }) => {
  const mode = String(engineMode || 'free').toLowerCase();
  if (mode === 'all') return ALL_CYBERBRO_ENGINES;
  if (mode === 'custom') return parseCyberbroEngines(engines);
  return FREE_CYBERBRO_ENGINES;
};

export const formatCyberbroEngineCsv = (engines) => engines.join(',');
