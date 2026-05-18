import styled from '@emotion/styled';

import { type ReactNode } from 'react';
import ErrorBoundary from 'client/components/misc/ErrorBoundary';
import Heading from 'client/components/Form/Heading';
import colors from 'client/styles/colors';

export const StyledCard = styled.section<{ styles?: string }>`
  background:
    linear-gradient(180deg, color-mix(in srgb, ${colors.surfaceElevated} 92%, transparent), ${colors.surface});
  color: ${colors.textColor};
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.22);
  border: 1px solid ${colors.borderSubtle};
  border-radius: 18px;
  padding: 1rem 1rem 1.1rem 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  overflow: hidden;
  ${(props) => props.styles}
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.75rem;
  .inner-heading {
    margin: 0;
    flex: 1 1 14rem;
    min-width: 0;
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
