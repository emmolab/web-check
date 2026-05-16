import styled from '@emotion/styled';

import colors from 'client/styles/colors';
import { Card } from 'client/components/Form/Card';
import Row, { ExpandableRow } from 'client/components/Form/Row';

const Note = styled.small`
  opacity: 0.7;
  display: block;
  margin-top: 0.75rem;
  a {
    color: ${colors.primary};
  }
`;

const Badge = styled.span<{ tone: 'hit' | 'intel' | 'clear' | 'no-data' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 6.5rem;
  border-radius: 999px;
  padding: 0.2rem 0.65rem;
  font-size: 0.85rem;
  font-weight: 700;
  background:
    ${(props) =>
      props.tone === 'hit'
        ? 'rgba(255, 80, 80, 0.16)'
        : props.tone === 'intel'
          ? 'rgba(52, 152, 219, 0.16)'
          : props.tone === 'clear'
            ? 'rgba(46, 204, 113, 0.16)'
            : colors.primaryTransparent};
  border: 1px solid
    ${(props) =>
      props.tone === 'hit'
        ? '#ff8f8f66'
        : props.tone === 'intel'
          ? '#7cc8ff66'
          : props.tone === 'clear'
            ? '#7dffb266'
            : colors.primaryTransparent};
`;

const LinkAnchor = styled.a`
  color: ${colors.primary};
  word-break: break-all;
`;

const EngineSummary = styled.div`
  margin: 0.2rem 0 0.6rem 0;
  opacity: 0.82;
  font-size: 0.95rem;
`;

const getStatusMeta = (engine: any) => {
  switch (engine.status) {
    case 'hit':
      return { label: '⚠️ Match', tone: 'hit' as const };
    case 'intel':
      return { label: 'ℹ️ Intel', tone: 'intel' as const };
    case 'clear':
      return { label: '✅ Clear', tone: 'clear' as const };
    default:
      return { label: '— No data', tone: 'no-data' as const };
  }
};

const CyberbroSourcesCard = (props: { data: any; title: string; actionButtons: any }): JSX.Element => {
  const engines = props.data.engines || [];
  const analysisId = props.data.analysisId;
  const settings = props.data.settings || {};

  return (
    <Card heading={props.title} actionButtons={props.actionButtons}>
      {engines.map((engine: any) => {
        const status = getStatusMeta(engine);
        const rows = [] as any[];
        if (engine.summary) rows.push({ lbl: 'Summary', val: engine.summary });
        if (engine.link) rows.push({ lbl: 'Link', val: engine.link });
        if (engine.raw) {
          rows.push({ lbl: 'Raw JSON', val: 'expand to inspect', plaintext: JSON.stringify(engine.raw, null, 2) });
        }

        return rows.length > 0 ? (
          <div key={engine.id}>
            <ExpandableRow lbl={engine.label} val={status.label} rowList={rows} />
            <EngineSummary>
              <Badge tone={status.tone}>{status.label}</Badge>
              {engine.summary ? ` ${engine.summary}` : ''}
              {engine.link ? (
                <>
                  {' '}
                  <LinkAnchor href={engine.link} target="_blank" rel="noreferrer">
                    Open source
                  </LinkAnchor>
                </>
              ) : null}
            </EngineSummary>
          </div>
        ) : (
          <Row key={engine.id} lbl={engine.label} val={status.label} />
        );
      })}
      {settings.baseUrl && <Row lbl="Cyberbro API" val={settings.baseUrl} />}
      {analysisId && <Note>Cyberbro analysis id: {analysisId}</Note>}
    </Card>
  );
};

export default CyberbroSourcesCard;
