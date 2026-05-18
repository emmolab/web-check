import styled from '@emotion/styled';
import type { ReactNode } from 'react';

interface Props {
  minColWidth: number;
  gap?: number;
  className?: string;
  children: ReactNode;
}

const Grid = styled.div<{ gap: number; minColWidth: number }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, ${(props) => props.minColWidth}px), 1fr));
  gap: ${(props) => props.gap}px;
  align-items: start;
`;

const ResultsMasonryGrid = ({
  minColWidth,
  gap = 16,
  className,
  children,
}: Props): JSX.Element => {
  return (
    <Grid className={className} gap={gap} minColWidth={minColWidth}>
      {children}
    </Grid>
  );
};

export default ResultsMasonryGrid;
