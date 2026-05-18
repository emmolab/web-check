import styled from '@emotion/styled';

import { type ReactNode } from 'react';
import ErrorBoundary from 'client/components/misc/ErrorBoundary';
import Heading from 'client/components/Form/Heading';
import colors from 'client/styles/colors';

export const StyledCard = styled.section<{ styles?: string }>`
  background: ${colors.backgroundLighter};
  color: ${colors.textColor};
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.24);
  border: 1px solid ${colors.primaryTransparent};
  border-radius: 14px;
  padding: 1rem 1rem 1.1rem 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  ${(props) => props.styles}
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  .inner-heading {
    margin: 0;
    flex: 1;
  }
`;

interface CardProps {
  children: ReactNode;
  heading?: string;
  styles?: string;
  actionButtons?: ReactNode | undefined;
}

export const Card = (props: CardProps): JSX.Element => {
  const { children, heading, styles, actionButtons } = props;
  return (
    <ErrorBoundary title={heading}>
      <StyledCard styles={styles}>
        {(heading || actionButtons) && (
          <CardHeader>
            {heading && (
              <Heading className="inner-heading" as="h3" align="left" color={colors.primary}>
                {heading}
              </Heading>
            )}
            {actionButtons}
          </CardHeader>
        )}
        {children}
      </StyledCard>
    </ErrorBoundary>
  );
};

export default StyledCard;
