import styled from '@emotion/styled';

import { type ReactNode } from 'react';
import ErrorBoundary from 'client/components/misc/ErrorBoundary';
import Heading from 'client/components/Form/Heading';
import colors from 'client/styles/colors';

export const StyledCard = styled.section<{ styles?: string }>`
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, ${colors.surfaceElevated} 94%, transparent),
      color-mix(in srgb, ${colors.surface} 96%, ${colors.background})
    );
  color: ${colors.textColor};
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 color-mix(in srgb, ${colors.textColor} 10%, transparent);
  border: 1px solid ${colors.borderSubtle};
  border-radius: 24px;
  padding: 1.1rem 1.1rem 1.2rem 1.1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  overflow: hidden;
  backdrop-filter: blur(18px);
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
