import { Global, css } from '@emotion/react';

const GlobalStyles = () => (
  <Global
    styles={css`
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      body,
      div,
      a,
      p,
      span,
      ul,
      li,
      small,
      h1,
      h2,
      h3,
      h4,
      section,
      label {
        font-family: var(--font-sans);
        color: var(--text-color);
      }

      code,
      pre,
      button,
      input,
      textarea,
      kbd {
        font-family: var(--font-mono);
      }

      #fancy-background p span {
        color: transparent;
      }
    `}
  />
);

export default GlobalStyles;
