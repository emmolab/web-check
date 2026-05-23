import { type ReactNode, type MouseEventHandler } from 'react';

import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import colors from 'client/styles/colors';
import { type InputSize, applySize } from 'client/styles/dimensions';

type LoadState = 'loading' | 'success' | 'error';

interface ButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  size?: InputSize;
  bgColor?: string;
  fgColor?: string;
  styles?: string;
  title?: string;
  type?: 'button' | 'submit' | 'reset' | undefined;
  loadState?: LoadState;
}

const StyledButton = styled.button<ButtonProps>`
  cursor: pointer;
  border: 1px solid color-mix(in srgb, ${colors.primary} 22%, transparent);
  border-radius: 14px;
  font-family: var(--font-mono);
  font-weight: 600;
  letter-spacing: 0.01em;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.65rem;
  box-shadow:
    0 14px 30px color-mix(in srgb, ${colors.fgShadowColor} 18%, transparent),
    inset 0 1px 0 color-mix(in srgb, ${colors.textColor} 14%, transparent);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    filter 0.18s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow:
      0 18px 36px color-mix(in srgb, ${colors.fgShadowColor} 26%, transparent),
      inset 0 1px 0 color-mix(in srgb, ${colors.textColor} 18%, transparent);
    filter: brightness(1.03);
  }
  &:active {
    transform: translateY(0);
    box-shadow:
      0 10px 20px color-mix(in srgb, ${colors.fgShadowColor} 20%, transparent),
      inset 0 1px 0 color-mix(in srgb, ${colors.textColor} 10%, transparent);
  }
  &:focus-visible {
    outline: 2px solid color-mix(in srgb, ${colors.primary} 60%, white);
    outline-offset: 2px;
  }
  ${(props) => applySize(props.size)};
  ${(props) =>
    props.bgColor
      ? `background: ${props.bgColor};`
      : `background: linear-gradient(135deg, color-mix(in srgb, ${colors.primaryLighter} 70%, white), ${colors.primary});`}
  ${(props) => (props.fgColor ? `color: ${props.fgColor};` : `color: ${colors.background};`)}
  ${(props) => props.styles}
`;

const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const SimpleLoader = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid ${colors.background};
  width: 1rem;
  height: 1rem;
  animation: ${spinAnimation} 1s linear infinite;
`;

const Loader = (props: { loadState: LoadState }) => {
  if (props.loadState === 'loading') return <SimpleLoader />;
  if (props.loadState === 'success') return <span>✔</span>;
  if (props.loadState === 'error') return <span>✗</span>;
  return <span></span>;
};

const Button = (props: ButtonProps): JSX.Element => {
  const { children, size, bgColor, fgColor, onClick, styles, title, loadState, type } = props;
  return (
    <StyledButton
      onClick={onClick || (() => null)}
      size={size}
      bgColor={bgColor}
      fgColor={fgColor}
      styles={styles}
      title={title?.toString()}
      type={type || 'button'}
    >
      {loadState && <Loader loadState={loadState} />}
      {children}
    </StyledButton>
  );
};

export default Button;
