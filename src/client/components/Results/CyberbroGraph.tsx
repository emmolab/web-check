import styled from '@emotion/styled';
import colors from 'client/styles/colors';
import { Card } from 'client/components/Form/Card';

const Summary = styled.p`
  opacity: 0.84;
  margin: 0 0 1rem 0;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${colors.primaryTransparent};
  background: ${colors.backgroundLighter};
  color: ${colors.textColor};
  text-decoration: none;

  &:hover {
    background: ${colors.primaryTransparent};
    text-decoration: none;
  }
`;

const Meta = styled.small`
  display: block;
  margin-top: 0.9rem;
  opacity: 0.72;
`;

const CyberbroGraphCard = (props: { data: any; title: string; actionButtons: any }): JSX.Element => {
  const { graphPath, resultsPath, analysisId } = props.data;

  return (
    <Card heading={props.title} actionButtons={props.actionButtons}>
      <Summary>
        Open the Cyberbro relationship graph for this analysis inside the Web Check deployment.
      </Summary>
      <ButtonRow>
        {graphPath && (
          <ActionLink href={graphPath} target="_blank" rel="noreferrer">
            View graph
          </ActionLink>
        )}
        {resultsPath && (
          <ActionLink href={resultsPath} target="_blank" rel="noreferrer">
            View Cyberbro results
          </ActionLink>
        )}
      </ButtonRow>
      {analysisId && <Meta>Analysis id: {analysisId}</Meta>}
    </Card>
  );
};

export default CyberbroGraphCard;
