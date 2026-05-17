import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { branding } from '@/config/branding';
import colors from 'client/styles/colors';

const StyledFooter = styled.footer`
  bottom: 0;
  width: 100%;
  text-align: center;
  padding: 0.5rem 0;
  background: ${colors.backgroundDarker};
  display: flex;
  justify-content: space-around;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
  opacity: 0.75;
  transition: all 0.2s ease-in-out;
  @media (min-width: 1024px) {
    justify-content: space-between;
  }
  &:hover {
    opacity: 1;
  }
  span {
    margin: 0 0.5rem;
    text-align: center;
  }
`;

const ALink = styled.a`
  color: ${colors.primary};
  font-weight: bold;
  border-radius: 4px;
  padding: 0.1rem;
  transition: all 0.2s ease-in-out;
  &:hover {
    background: ${colors.primary};
    color: ${colors.backgroundDarker};
    text-decoration: none;
  }
`;

const Footer = (props: { isFixed?: boolean }): JSX.Element => {
  const licenseUrl = `${branding.repoUrl}/blob/master/LICENSE`;
  const authorUrl = branding.companyUrl;
  const githubUrl = branding.repoUrl;
  const githubLabel = githubUrl.replace(/^https?:\/\//, '');
  return (
    <StyledFooter style={props.isFixed ? { position: 'fixed' } : {}}>
      <span>
        View source at <ALink href={githubUrl}>{githubLabel}</ALink>
      </span>
      <span>
        <Link to="/about">{branding.name}</Link> is licensed under{' '}
        <ALink href={licenseUrl}>{branding.copyrightLabel}</ALink> - ©{' '}
        <ALink href={authorUrl}>{branding.companyName}</ALink> {new Date().getFullYear()}
      </span>
    </StyledFooter>
  );
};

export default Footer;
