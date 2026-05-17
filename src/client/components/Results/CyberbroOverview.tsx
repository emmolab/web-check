import styled from '@emotion/styled';

import { Card } from 'client/components/Form/Card';
import Row, { ListRow } from 'client/components/Form/Row';
import colors from 'client/styles/colors';

const Verdict = styled.div<{ tone: 'danger' | 'success' | 'neutral' }>`
  margin: 0.75rem 0 1rem 0;
  padding: 0.9rem 1rem;
  border-radius: 8px;
  border: 1px solid
    ${(props) =>
      props.tone === 'danger'
        ? 'var(--danger-border)'
        : props.tone === 'success'
          ? 'var(--success-border)'
          : colors.primaryTransparent};
  background:
    ${(props) =>
      props.tone === 'danger'
        ? 'var(--danger-soft)'
        : props.tone === 'success'
          ? 'var(--success-soft)'
          : colors.primaryTransparent};
`;

const VerdictTitle = styled.div`
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.75rem 0 1rem 0;
`;

const Badge = styled.span<{ tone: 'danger' | 'info' | 'success' | 'muted' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.9rem;
  font-weight: 700;
  background:
    ${(props) =>
      props.tone === 'danger'
        ? 'var(--danger-soft)'
        : props.tone === 'info'
          ? 'var(--info-soft)'
          : props.tone === 'success'
            ? 'var(--success-soft)'
            : colors.primaryTransparent};
  border: 1px solid
    ${(props) =>
      props.tone === 'danger'
        ? 'var(--danger-border)'
        : props.tone === 'info'
          ? 'var(--info-border)'
          : props.tone === 'success'
            ? 'var(--success-border)'
            : colors.primaryTransparent};
`;

const Subtle = styled.p`
  margin: 0.25rem 0 0 0;
  opacity: 0.82;
`;

const CyberbroOverviewCard = (props: {
  data: any;
  title: string;
  actionButtons: any;
}): JSX.Element => {
  const { summary, observable, highlights } = props.data;
  const tone = summary.hitCount > 0 ? 'danger' : summary.intelCount > 0 ? 'neutral' : 'success';

  return (
    <Card heading={props.title} actionButtons={props.actionButtons}>
      <Verdict tone={tone}>
        <VerdictTitle>{summary.verdict}</VerdictTitle>
        <Subtle>
          {summary.hitCount > 0
            ? `${summary.hitCount} threat source${summary.hitCount === 1 ? '' : 's'} flagged this observable.`
            : summary.intelCount > 0
              ? 'No direct threat match, but historical or contextual intelligence was found.'
              : 'No selected Cyberbro sources reported a threat match for this observable.'}
        </Subtle>
      </Verdict>

      <BadgeRow>
        <Badge tone="danger">Matches {summary.hitCount}</Badge>
        <Badge tone="info">Intel {summary.intelCount}</Badge>
        <Badge tone="success">Clear {summary.clearCount}</Badge>
        <Badge tone="muted">No data {summary.noDataCount}</Badge>
      </BadgeRow>

      <Row lbl="Observable" val={observable?.value || 'Unknown'} />
      <Row lbl="Observable Type" val={observable?.type || 'Unknown'} />

      {summary.selectedEngines?.length > 0 && (
        <ListRow title="Selected Engines" list={summary.selectedEngines} />
      )}
      {summary.matchedEngines?.length > 0 && (
        <ListRow title="Matched Engines" list={summary.matchedEngines} />
      )}
      {highlights?.threatTypes?.length > 0 && (
        <ListRow title="Threat Types" list={highlights.threatTypes} />
      )}
      {highlights?.malwareFamilies?.length > 0 && (
        <ListRow title="Malware Families" list={highlights.malwareFamilies} />
      )}
      {highlights?.adversaries?.length > 0 && (
        <ListRow title="Adversaries" list={highlights.adversaries} />
      )}
    </Card>
  );
};

export default CyberbroOverviewCard;
