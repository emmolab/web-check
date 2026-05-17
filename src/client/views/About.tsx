import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import colors from 'client/styles/colors';
import Heading from 'client/components/Form/Heading';
import Footer from 'client/components/misc/Footer';
import Nav from 'client/components/Form/Nav';
import Button from 'client/components/Form/Button';
import AdditionalResources from 'client/components/misc/AdditionalResources';
import { StyledCard } from 'client/components/Form/Card';
import docs, { about, featureIntro, license, fairUse } from 'client/utils/docs';
import { branding } from '@/config/branding';

const AboutContainer = styled.div`
width: 95vw;
max-width: 1000px;
margin: 2rem auto;
padding-bottom: 1rem;
header {
  margin 1rem 0;
  width: auto;
}
section {
  width: auto;
  .inner-heading { display: none; }
}
`;

const HeaderLinkContainer = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  a {
    text-decoration: none;
  }
`;

const Section = styled(StyledCard)`
  margin-bottom: 2rem;
  overflow: clip;
  max-height: 100%;
  section {
    clear: both;
  }
  h3 {
    font-size: 1.5rem;
  }
  hr {
    border: none;
    border-top: 1px dashed ${colors.primary};
    margin: 1.5rem auto;
  }
  ul {
    padding: 0 0 0 1rem;
    list-style: circle;
  }
  a {
    color: ${colors.primary};
    &:visited {
      opacity: 0.8;
    }
  }
  pre {
    background: ${colors.background};
    border-radius: 4px;
    padding: 0.5rem;
    width: fit-content;
  }
  small {
    opacity: 0.7;
  }
  .contents {
    ul {
      list-style: none;
      li {
        a {
          // color: ${colors.textColor};
          &:visited {
            opacity: 0.8;
          }
        }
        b {
          opacity: 0.75;
          display: inline-block;
          width: 1.5rem;
        }
      }
    }
  }
  .example-screenshot {
    float: right;
    display: inline-flex;
    flex-direction: column;
    clear: both;
    max-width: 300px;
    img {
      float: right;
      break-inside: avoid;
      max-width: 300px;
      // max-height: 30rem;
      border-radius: 6px;
      clear: both;
    }
    figcaption {
      font-size: 0.8rem;
      text-align: center;
      opacity: 0.7;
    }
  }
`;

const SponsorshipContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  line-height: 1.5rem;
  img {
    border-radius: 4px;
  }
`;

const makeAnchor = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, '-');

const licenseUrl = `${branding.repoUrl}/blob/master/LICENSE`;

const About = (): JSX.Element => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to hash fragment if present
    if (location.hash) {
      // Add a small delay to ensure the page has fully rendered
      setTimeout(() => {
        const element = document.getElementById(location.hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div>
      <AboutContainer>
        <Nav>
          <HeaderLinkContainer>
            <a target="_blank" rel="noreferrer" href={branding.repoUrl}>
              <Button>{branding.sourceLabel}</Button>
            </a>
          </HeaderLinkContainer>
        </Nav>

        <Heading as="h2" size="medium" color={colors.primary}>
          Intro
        </Heading>
        <Section>
          {about.map((para, index: number) => (
            <p key={index}>{para}</p>
          ))}
          <hr />
          {branding.showSponsor && (
            <SponsorshipContainer>
              <p>
                {branding.name} is open source and designed for self-hosted deployments.
                <br />
                <small>
                  Review the code, deploy your own instance, or adapt it to your environment from{' '}
                  <a target="_blank" rel="noreferrer" href={branding.repoUrl}>
                    {branding.repoUrl.replace(/^https?:\/\//, '')}
                  </a>
                  .
                </small>
              </p>
              <a target="_blank" rel="noreferrer" href={branding.repoUrl}>
                <Button>{branding.sourceLabel}</Button>
              </a>
            </SponsorshipContainer>
          )}
          <hr />
          <p>
            {branding.name} is developed and maintained by{' '}
            <a target="_blank" rel="noreferrer" href={branding.companyUrl}>
              {branding.companyName}
            </a>
            . It's licensed under the{' '}
            <a target="_blank" rel="noreferrer" href={licenseUrl}>
              {branding.copyrightLabel} license
            </a>
            , and is completely free to use, modify and distribute in both personal and commercial
            settings.
            <br />
            Source code and self-hosting docs are available on{' '}
            <a target="_blank" rel="noreferrer" href={branding.repoUrl}>
              GitHub
            </a>
            .
          </p>
        </Section>

        <Heading as="h2" size="medium" color={colors.primary}>
          Features
        </Heading>
        <Section>
          {featureIntro.map((fi: string, i: number) => (
            <p key={i}>{fi}</p>
          ))}
          <div className="contents">
            <Heading as="h3" size="small" id="#feature-contents" color={colors.primary}>
              Contents
            </Heading>
            <ul>
              {docs.map((section, index: number) => (
                <li key={index}>
                  <b>{index + 1}</b>
                  <a href={`#${makeAnchor(section.title)}`}>{section.title}</a>
                </li>
              ))}
            </ul>
            <hr />
          </div>
          {docs.map((section, sectionIndex: number) => (
            <section key={section.title}>
              {sectionIndex > 0 && <hr />}
              <Heading as="h3" size="small" id={makeAnchor(section.title)} color={colors.primary}>
                {section.title}
              </Heading>
              {section.screenshot && (
                <figure className="example-screenshot">
                  <img
                    className="screenshot"
                    src={section.screenshot}
                    alt={`Example Screenshot ${section.title}`}
                  />
                  <figcaption>
                    Fig.{sectionIndex + 1} - Example of {section.title}
                  </figcaption>
                </figure>
              )}
              {section.description && (
                <>
                  <Heading as="h4" size="small">
                    Description
                  </Heading>
                  <p>{section.description}</p>
                </>
              )}
              {section.use && (
                <>
                  <Heading as="h4" size="small">
                    Use Cases
                  </Heading>
                  <p>{section.use}</p>
                </>
              )}
              {section.resources && section.resources.length > 0 && (
                <>
                  <Heading as="h4" size="small">
                    Useful Links
                  </Heading>
                  <ul>
                    {section.resources.map(
                      (link: string | { title: string; link: string }, linkIndx: number) =>
                        typeof link === 'string' ? (
                          <li key={`link-${linkIndx}`} id={`link-${linkIndx}`}>
                            <a target="_blank" rel="noreferrer" href={link}>
                              {link}
                            </a>
                          </li>
                        ) : (
                          <li key={`link-${linkIndx}`} id={`link-${linkIndx}`}>
                            <a target="_blank" rel="noreferrer" href={link.link}>
                              {link.title}
                            </a>
                          </li>
                        ),
                    )}
                  </ul>
                </>
              )}
            </section>
          ))}
        </Section>

        <Heading as="h2" size="medium" color={colors.primary}>
          Deploy your own Instance
        </Heading>
        <Section>
          <p>{branding.name} is designed to be easily self-hosted.</p>
          <Heading as="h3" size="small" color={colors.primary}>
            Option #1 - Docker / GHCR
          </Heading>
          <p>
            Pull the published images from GitHub Container Registry, then open{' '}
            <code>localhost:3000</code>.
          </p>
          <pre>
            WEB_CHECK_IMAGE=ghcr.io/emmolab/web-check:latest
            <br />
            CYBERBRO_IMAGE=ghcr.io/emmolab/web-check-cyberbro:latest
            <br />
            docker compose pull
            <br />
            docker compose up -d
          </pre>

          <Heading as="h3" size="small" color={colors.primary}>
            Option #2 - Manual
          </Heading>
          <pre>
            git clone https://github.com/emmolab/web-check.git
            <br />
            cd web-check
            <br />
            corepack yarn install
            <br />
            corepack yarn build
            <br />
            corepack yarn start
            <br />
          </pre>

          <Heading as="h3" size="small" color={colors.primary}>
            Further Docs
          </Heading>
          <p>
            More detailed installation and setup instructions can be found in the GitHub repository
            -{' '}
            <a target="_blank" rel="noreferrer" href="https://github.com/emmolab/web-check#readme">
              github.com/emmolab/web-check
            </a>
          </p>

          <Heading as="h3" size="small" color={colors.primary}>
            Configuring
          </Heading>
          <p>
            There are some optional environmental variables you can specify to give you access to
            some additional {branding.name} capabilities. See the README for the full list of
            options.
          </p>

          <ul>
            <li>
              <code>GOOGLE_CLOUD_API_KEY</code>:{' '}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://cloud.google.com/api-gateway/docs/authenticate-api-keys"
              >
                A Google API key
              </a>
              <i> Used to return quality metrics for a site</i>
            </li>
            <li>
              <code>REACT_APP_SHODAN_API_KEY</code>:{' '}
              <a target="_blank" rel="noreferrer" href="https://account.shodan.io/">
                A Shodan API key
              </a>
              <i> To show associated hosts for a domain</i>
            </li>
            <li>
              <code>REACT_APP_WHO_API_KEY</code>:{' '}
              <a target="_blank" rel="noreferrer" href="https://whoapi.com/">
                A WhoAPI key
              </a>
              <i> Allows for more comprehensive WhoIs records</i>
            </li>
          </ul>
        </Section>

        <Heading as="h2" size="medium" color={colors.primary}>
          API Documentation
        </Heading>
        <Section>
          <p>// Coming soon...</p>
        </Section>

        <Heading as="h2" size="medium" color={colors.primary}>
          Additional Resources
        </Heading>
        <AdditionalResources />

        <Heading as="h2" size="medium" color={colors.primary}>
          Support Us
        </Heading>
        <Section>
          <p>{branding.name} is free to use without restriction.</p>
          <p>
            All the code is open source, so you are also free to deploy your own instance, fork
            it, and adapt it for private or commercial use.
          </p>
          <p>
            If you find it useful, the best place to start is the repository:{' '}
            <a target="_blank" rel="noreferrer" href={branding.repoUrl}>
              {branding.repoUrl.replace(/^https?:\/\//, '')}
            </a>
            .
          </p>
        </Section>

        <Heading as="h2" size="medium" color={colors.primary}>
          Terms & Info
        </Heading>
        <Section>
          <Heading as="h3" size="small" color={colors.primary}>
            License
          </Heading>
          <b>
            <a target="_blank" rel="noreferrer" href={branding.repoUrl}>
              {branding.name}
            </a>{' '}
            is distributed under the {branding.copyrightLabel} license, ©{' '}
            <a target="_blank" rel="noreferrer" href={branding.companyUrl}>
              {branding.companyName}
            </a>{' '}
            {new Date().getFullYear()}
          </b>
          <br />
          <small>
            For more info, see{' '}
            <a target="_blank" rel="noreferrer" href="https://tldrlegal.com/license/mit-license">
              TLDR Legal → MIT
            </a>
          </small>
          <pre>{license}</pre>
          <hr />
          <Heading as="h3" size="small" color={colors.primary}>
            Fair Use
          </Heading>
          <ul>
            {fairUse.map((para) => (
              <li>{para}</li>
            ))}
          </ul>
          <hr />
          <Heading as="h3" size="small" color={colors.primary}>
            Privacy
          </Heading>
          <p>
            Analytics are only enabled when configured for this deployment. If enabled, they should
            record service usage rather than personal data. Basic error logging may also be enabled
            by the operator to help diagnose bugs.
            <br />
            <br />
            Neither your IP address, browser/OS/hardware info, nor any other data will ever be
            collected or logged. (You may verify this yourself, either by inspecting the source code
            or the using developer tools)
          </p>
        </Section>
      </AboutContainer>
      <Footer />
    </div>
  );
};

export default About;
