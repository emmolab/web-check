import type { Analyzer } from '../types';

const cyberbroOverview: Analyzer = (d) => {
  const summary = d?.summary;
  if (!summary || typeof summary !== 'object') return [];

  const out: ReturnType<Analyzer> = [];
  const matchedEngines = Array.isArray(summary.matchedEngines) ? summary.matchedEngines : [];
  const threatTypes = Array.isArray(d?.highlights?.threatTypes) ? d.highlights.threatTypes : [];

  if (Number(summary.hitCount) > 0) {
    out.push({
      severity: 'critical',
      title: `Cyberbro flagged ${summary.hitCount} threat source${summary.hitCount === 1 ? '' : 's'}`,
      detail:
        matchedEngines.length > 0
          ? `Matches: ${matchedEngines.join(', ')}`
          : threatTypes.length > 0
            ? `Threat types: ${threatTypes.join(', ')}`
            : 'Threat intelligence sources reported a positive match for this observable',
    });
  } else if (Number(summary.intelCount) > 0) {
    out.push({
      severity: 'info',
      title: `Cyberbro found contextual intel from ${summary.intelCount} source${summary.intelCount === 1 ? '' : 's'}`,
      detail:
        threatTypes.length > 0
          ? `Threat types: ${threatTypes.join(', ')}`
          : 'Historical or contextual intelligence exists without a direct threat match',
    });
  } else {
    out.push({
      severity: 'pass',
      title: 'Cyberbro found no threat intelligence matches',
    });
  }

  return out;
};

export default cyberbroOverview;
