import styled from '@emotion/styled';
import { type ChangeEvent, type SyntheticEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, type NavigateOptions } from 'react-router-dom';

import Heading from 'client/components/Form/Heading';
import Input from 'client/components/Form/Input';
import Button from 'client/components/Form/Button';
import { StyledCard } from 'client/components/Form/Card';
import Footer from 'client/components/misc/Footer';
import FancyBackground from 'client/components/misc/FancyBackground';

import docs from 'client/utils/docs';
import colors from 'client/styles/colors';
import { determineAddressType, normalizeAddress } from 'client/utils/address-type-checker';
import { branding } from '@/config/branding';
import {
  CYBERBRO_SETTINGS_STORAGE_KEY,
  defaultCyberbroSettings,
  getCyberbroSettings,
} from '@/config/cyberbro';
import {
  CYBERBRO_LOOKUP_PRESETS,
  formatCyberbroEngineCsv,
  resolveCyberbroSelection,
} from '@/config/cyberbro-engines.js';

const HomeContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  font-family: var(--font-mono);
  padding: 1.5rem 1rem 4rem 1rem;
  footer {
    z-index: 1;
  }
`;

const HeroCard = styled.form`
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(214, 251, 65, 0.18), transparent 32%),
    linear-gradient(160deg, rgba(17, 18, 17, 0.96), rgba(32, 36, 30, 0.94));
  box-shadow:
    0 22px 60px rgba(0, 0, 0, 0.32),
    6px 6px 0px ${colors.bgShadowColor};
  border: 1px solid ${colors.primaryTransparent};
  border-radius: 18px;
  padding: 1.4rem;
  margin: 1rem;
  width: calc(100% - 2rem);
  max-width: 68rem;
  z-index: 2;
  &:before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(120deg, rgba(214, 251, 65, 0.08), transparent 28%),
      linear-gradient(0deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.02));
    pointer-events: none;
  }
`;

const HeroTop = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(18rem, 0.9fr);
  gap: 1.25rem;
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const SearchColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  a {
    text-decoration: none;
  }
`;

const Headline = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
  max-width: 42rem;
  color: ${colors.textColor};
  opacity: 0.92;
`;

const HelperRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.2rem;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const HelperCard = styled.div`
  border-radius: 14px;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${colors.primaryTransparent};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
`;

const HelperTitle = styled.div`
  color: ${colors.primary};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.35rem;
`;

const HelperBody = styled.p`
  margin: 0;
  opacity: 0.86;
  line-height: 1.5;
  font-size: 0.95rem;
`;

const ModePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(10, 12, 10, 0.58);
  border: 1px solid rgba(214, 251, 65, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
`;

const ModeLabel = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${colors.primary};
`;

const ModeButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const ModeButton = styled.button<{ active: boolean }>`
  text-align: left;
  cursor: pointer;
  border-radius: 14px;
  padding: 0.9rem 1rem;
  border: 1px solid ${(props) => (props.active ? colors.primary : colors.primaryTransparent)};
  background: ${(props) =>
    props.active ? 'rgba(214, 251, 65, 0.14)' : 'rgba(255, 255, 255, 0.025)'};
  color: ${colors.textColor};
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
  &:hover {
    transform: translateY(-1px);
    border-color: ${colors.primary};
  }
`;

const ModeTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
`;

const ModeDescription = styled.div`
  font-size: 0.92rem;
  line-height: 1.5;
  opacity: 0.82;
`;

const ToggleRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.95rem;
  cursor: pointer;
  opacity: 0.9;
  input {
    accent-color: ${colors.primary};
  }
`;

const SearchActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
`;

const StatusNote = styled.p`
  margin: 0;
  opacity: 0.76;
  font-size: 0.92rem;
  line-height: 1.55;
`;

const ErrorMessage = styled.p`
  color: ${colors.danger};
  margin: 0.1rem 0 0 0;
`;

const SponsorCard = styled.div`
  background: ${colors.backgroundLighter};
  box-shadow: 4px 4px 0px ${colors.bgShadowColor};
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem;
  width: calc(100% - 2rem);
  max-width: 68rem;
  z-index: 2;
  p {
    margin: 0.25rem 0;
  }
  a {
    color: ${colors.primary};
  }
`;

const SiteFeaturesWrapper = styled(StyledCard)`
  margin: 1rem;
  width: calc(100% - 2rem);
  max-width: 68rem;
  z-index: 2;
  .links {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    a {
      width: 100%;
      button {
        width: calc(100% - 2rem);
      }
    }
    @media (max-width: 600px) {
      flex-wrap: wrap;
    }
  }
  ul {
    -webkit-column-width: 180px;
    -moz-column-width: 180px;
    column-width: 180px;
    list-style: none;
    padding: 0 1rem;
    font-size: 0.95rem;
    color: ${colors.textColor};
    li {
      position: relative;
      margin: 0.18rem 0;
      padding-left: 1.2rem;
      break-inside: avoid-column;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    li:before {
      content: '✓';
      color: ${colors.primary};
      position: absolute;
      left: 0;
    }
    li:not(:last-child) a {
      color: inherit;
      text-decoration: none;
    }
  }
  a {
    color: ${colors.primary};
  }
`;

const makeAnchor = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, '-');

const persistCyberbroProfile = (preset: string, freeOnly: boolean) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(CYBERBRO_SETTINGS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    const merged = {
      ...defaultCyberbroSettings,
      ...existing,
      preset,
      freeOnly,
    };
    window.localStorage.setItem(
      CYBERBRO_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        ...merged,
        engines: formatCyberbroEngineCsv(resolveCyberbroSelection(merged)),
      }),
    );
  } catch {
    window.localStorage.setItem(
      CYBERBRO_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        ...defaultCyberbroSettings,
        preset,
        freeOnly,
        engines: formatCyberbroEngineCsv(
          resolveCyberbroSelection({
            ...defaultCyberbroSettings,
            preset,
            freeOnly,
          }),
        ),
      }),
    );
  }
};

const Home = (): JSX.Element => {
  const defaultPlaceholder =
    'e.g. https://evilginx.bad, suspicious-domain.tld, 8.8.8.8, 2606:4700:4700::1111';
  const [userInput, setUserInput] = useState('');
  const [errorMsg, setErrMsg] = useState('');
  const [placeholder] = useState(defaultPlaceholder);
  const [inputDisabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(
    defaultCyberbroSettings.preset || 'cyber_intel',
  );
  const [freeOnly, setFreeOnly] = useState(Boolean(defaultCyberbroSettings.freeOnly));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const urlFromQuery = query.get('url');
    if (urlFromQuery) {
      const target = normalizeAddress(urlFromQuery);
      if (target) navigate(`/check/${target}`, { replace: true });
    }
  }, [navigate, location.search]);

  useEffect(() => {
    const settings = getCyberbroSettings();
    setSelectedPreset(settings.preset || 'cyber_intel');
    setFreeOnly(Boolean(settings.freeOnly));
  }, []);

  const submit = () => {
    const address = normalizeAddress(userInput);
    const addressType = determineAddressType(address);

    if (addressType === 'empt') {
      setErrMsg('Field must not be empty');
    } else if (addressType === 'err') {
      setErrMsg('Must be a valid URL, domain, IPv4, or IPv6 address');
    } else {
      persistCyberbroProfile(selectedPreset, freeOnly);
      const resultRouteParams: NavigateOptions = { state: { address, addressType } };
      navigate(`/check/${address}`, resultRouteParams);
    }
  };

  const inputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
    const isError = ['err', 'empt'].includes(determineAddressType(event.target.value));
    if (!isError) setErrMsg('');
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    }
  };

  const formSubmitEvent = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const resolvedEngines = resolveCyberbroSelection({
    ...defaultCyberbroSettings,
    preset: selectedPreset,
    freeOnly,
  });

  return (
    <HomeContainer>
      <FancyBackground />
      <HeroCard onSubmit={formSubmitEvent}>
        <HeroTop>
          <SearchColumn>
            <a href="/">
              <Heading as="h1" size="xLarge" color={colors.primary}>
                <img width="64" src={branding.appIconPath} alt={branding.name + ' icon'} />
                {branding.name}
              </Heading>
            </a>
            <Headline>
              Run fast website triage or deeper threat-intel lookups from the same entry point. URL,
              domain, IPv4, and IPv6 targets all work here now.
            </Headline>
            <Input
              id="user-input"
              value={userInput}
              label="Target URL, domain, IPv4, or IPv6"
              size="large"
              orientation="vertical"
              name="url"
              placeholder={placeholder}
              disabled={inputDisabled}
              handleChange={inputChange}
              handleKeyDown={handleKeyPress}
            />
            {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
            <SearchActions>
              <Button type="submit" styles="width: min(22rem, 100%);" size="large" onClick={submit}>
                Launch Analysis
              </Button>
              <StatusNote>
                Current Cyberbro mode:{' '}
                {selectedPreset === 'web' ? 'Web Preset' : 'Cyber Intel Preset'} with{' '}
                {resolvedEngines.length} engine{resolvedEngines.length === 1 ? '' : 's'}
                {freeOnly ? ' using free/no-key sources only.' : '.'}
              </StatusNote>
            </SearchActions>
            <HelperRow>
              <HelperCard>
                <HelperTitle>Web Preset</HelperTitle>
                <HelperBody>
                  Cleaner website triage with reputation, DNS, certificate, and scan-history checks.
                </HelperBody>
              </HelperCard>
              <HelperCard>
                <HelperTitle>Cyber Intel</HelperTitle>
                <HelperBody>
                  Broader maliciousness coverage for suspicious domains, URLs, IPv4, and IPv6
                  observables.
                </HelperBody>
              </HelperCard>
              <HelperCard>
                <HelperTitle>Less Noise</HelperTitle>
                <HelperBody>
                  Use the free-only switch when you want signal fast without calling every paid or
                  keyed backend.
                </HelperBody>
              </HelperCard>
            </HelperRow>
          </SearchColumn>

          <ModePanel>
            <ModeLabel>Lookup Mode</ModeLabel>
            <ModeButtons>
              {CYBERBRO_LOOKUP_PRESETS.map((preset) => (
                <ModeButton
                  key={preset.id}
                  type="button"
                  active={selectedPreset === preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                >
                  <ModeTitle>{preset.label}</ModeTitle>
                  <ModeDescription>{preset.description}</ModeDescription>
                </ModeButton>
              ))}
            </ModeButtons>
            <ToggleRow>
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(event) => setFreeOnly(event.target.checked)}
              />
              Use only free / no-key Cyberbro engines
            </ToggleRow>
            <StatusNote>
              Need to override the backend or hand-pick engines? Use the account settings page for
              the advanced controls.
            </StatusNote>
          </ModePanel>
        </HeroTop>
      </HeroCard>

      {branding.showSponsor && (
        <SponsorCard>
          <Heading as="h2" size="small" color={colors.primary}>
            Enjoying {branding.name}?
          </Heading>
          <p>
            The project is free and open source. If it has been useful, you can support the
            maintainers, review the code, or self-host your own deployment from{' '}
            <a target="_blank" rel="noreferrer" href={branding.repoUrl}>
              the GitHub repository
            </a>
            .
          </p>
        </SponsorCard>
      )}

      <SiteFeaturesWrapper>
        <div className="features">
          <Heading as="h2" size="small" color={colors.primary}>
            Supported Checks
          </Heading>
          <ul>
            {docs.map((doc, index) => (
              <li key={index}>
                <Link to={`/check/about#${makeAnchor(doc.title)}`} title={doc.title}>
                  {doc.title}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/check/about">+ more!</Link>
            </li>
          </ul>
        </div>
        <div className="links">
          <a
            target="_blank"
            rel="noreferrer"
            href={branding.repoUrl}
            title="Check out the source code and documentation on GitHub, and get support or contribute"
          >
            <Button>{branding.sourceLabel}</Button>
          </a>
          <Link
            to="/self-hosted-setup"
            title="See self-hosting instructions for Docker and source deployments"
          >
            <Button>Self-host</Button>
          </Link>
          <Link to="/check/about#api-documentation" title="View the API documentation">
            <Button>API Docs</Button>
          </Link>
        </div>
      </SiteFeaturesWrapper>
      <Footer isFixed={true} />
    </HomeContainer>
  );
};

export default Home;
