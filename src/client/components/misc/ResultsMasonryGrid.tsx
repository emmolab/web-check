import styled from '@emotion/styled';
import { Children, useEffect, useRef, type ReactNode } from 'react';

interface Props {
  minColWidth: number;
  gap?: number;
  className?: string;
  children: ReactNode;
}

const MASONRY_ROW_HEIGHT = 8;

const Grid = styled.div<{ gap: number; minColWidth: number }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, ${(props) => props.minColWidth}px), 1fr));
  gap: ${(props) => props.gap}px;
  align-items: start;
  grid-auto-flow: dense;
  grid-auto-rows: ${MASONRY_ROW_HEIGHT}px;

  > * {
    min-width: 0;
  }
`;

const GridItem = styled.div`
  min-width: 0;
  grid-row-end: span var(--masonry-span, 1);
`;

const ResultsMasonryGrid = ({
  minColWidth,
  gap = 16,
  className,
  children,
}: Props): JSX.Element => {
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof window === 'undefined') return;

    const measure = () => {
      const items = Array.from(grid.children) as HTMLElement[];
      const rowSpan = MASONRY_ROW_HEIGHT + gap;

      items.forEach((item) => {
        const height = item.getBoundingClientRect().height;
        const span = Math.max(1, Math.ceil((height + gap) / rowSpan));
        item.style.setProperty('--masonry-span', String(span));
      });
    };

    const resizeObserver = new ResizeObserver(() => measure());
    const items = Array.from(grid.children) as HTMLElement[];
    items.forEach((item) => resizeObserver.observe(item));
    resizeObserver.observe(grid);

    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);

    measure();
    const frame = window.requestAnimationFrame(measure);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      resizeObserver.disconnect();
    };
  }, [children, gap, minColWidth]);

  return (
    <Grid ref={gridRef} className={className} gap={gap} minColWidth={minColWidth}>
      {Children.toArray(children).map((child, index) => (
        <GridItem key={index}>{child}</GridItem>
      ))}
    </Grid>
  );
};

export default ResultsMasonryGrid;
