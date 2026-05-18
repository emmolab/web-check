import styled from '@emotion/styled';
import type { ReactNode } from 'react';

import { branding } from '@/config/branding';
import { StyledCard } from 'client/components/Form/Card';
import Heading from 'client/components/Form/Heading';
import colors from 'client/styles/colors';

const Header = styled(StyledCard)`
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  width: 100%;
`;

const Nav = (props: { children?: ReactNode }) => {
  return (
    <Header as="header">
      <Heading color={colors.primary} size="large">
        <img
          width="64"
          src={branding.appIconPath}
          alt={`${branding.name} icon`}
          data-brand-src="appIconPath"
          data-brand-alt="name"
        />
        <a href="/check" target="_self" data-brand-text="name">
          {branding.name}
        </a>
      </Heading>
      {props.children && props.children}
    </Header>
  );
};

export default Nav;
