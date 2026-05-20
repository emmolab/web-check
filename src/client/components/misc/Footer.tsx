import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { branding } from '@/config/branding';
import colors from 'client/styles/colors';

const StyledFooter = styled.footer`
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  padding: 1rem 1.1rem;
  background: color-mix(in srgb, ${colors.surfaceAccent} 84%, transparent);
  border: 1px solid ${colors.borderSubtle};
  border-radius: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.85rem 1.25rem;
  margin-top: auto;
  opacity: 0.88;
  transition: all 0.2s ease-in-out;
  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  &:hover {
    opacity: 1;
  }
  span {
    margin: 0;
    text-align: inherit;
    min-width: 0;
    line-height: 1.5;
    color: ${colors.textColorSecondary};
    overflow-wrap: anywhere;
  }
`;

const ALink = styled.a`
  color: ${colors.primary};
  font-weight: bold;
  border-radius: 4px;
  padding: 0.1rem;
  transition: all 0.2s ease-in-out;
  &:hover {
    background: ${colors.primaryTransparent};
    color: ${colors.textColor};
    text-decoration: none;
  }
`;

const Footer = (props: { isFixed?: boolean }): JSX.Element => {
  const licenseUrl = `${branding.repoUrl}/blob/master/LICENSE`;
  const authorUrl = branding.companyUrl;
  const githubUrl = branding.repoUrl;
  const githubLabel = githubUrl.replace(/^https?:\/\//, '');
  return (
    <StyledFooter style={props.isFixed ? { position: 'sticky', bottom: '1rem' } : {}}>
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
