import styled from '@emotion/styled';
import { type ChangeEvent, type SyntheticEvent, useEffect, useMemo, useState } from 'react';
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
import { jobs as scanJobs } from 'client/jobs/registry';
import {
  CYBERBRO_SETTINGS_STORAGE_KEY,
  defaultCyberbroSettings,
  getCyberbroSettings,
} from '@/config/cyberbro';
import { formatCyberbroEngineCsv, resolveCyberbroSelection } from '@/config/cyberbro-engines.js';
import { defaultScanSettings, getScanSettings, saveScanSettings } from '@/config/scan-settings';
import { WEB_CHECK_SCAN_PRESETS, getScanPreset } from '@/config/scan-presets';

const HomeContainer = styled.section`
  position: relative;
  min-height: 100%;
  padding: 1.5rem 1rem 3rem;
  font-family: var(--font-mono);
`;

const Shell = styled.div`
  position: relative;
  z-index: 1;
  width: min(1120px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.82fr);
  gap: 1rem;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const HeroCard = styled(StyledCard)`
  padding: 1.3rem;
  gap: 1rem;
`;

const BrandRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  a {
    text-decoration: none;
  }
`;

const BrandBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
  img {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 16px;
    border: 1px solid ${colors.borderSubtle};
    background: ${colors.surfaceAccent};
  }
`;

const BrandKicker = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  width: fit-content;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: ${colors.primary};
  background: color-mix(in srgb, ${colors.surfaceAccent} 78%, ${colors.primaryTransparent});
  border: 1px solid ${colors.borderStrong};
`;

const HeroTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  h1 {
    margin: 0;
  }
  a {
    color: ${colors.textColor};
  }
`;

const Headline = styled.p`
  margin: 0;
  max-width: 44rem;
  font-size: 1rem;
  line-height: 1.65;
  color: ${colors.textColorSecondary};
`;

const CompactMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  font-size: 0.82rem;
  color: ${colors.textColorSecondary};
  background: ${colors.surfaceAccent};
  border: 1px solid ${colors.borderSubtle};
`;

const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const LaunchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: center;
  justify-content: space-between;
`;

const LaunchGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
`;

const SummaryLine = styled.p`
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  color: ${colors.textColorSecondary};
`;

const ErrorMessage = styled.p`
  margin: 0;
  color: ${colors.danger};
`;

const PanelCard = styled(StyledCard)`
  padding: 1.1rem;
  gap: 0.9rem;
`;

const SectionLabel = styled.span`
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${colors.primary};
`;

const PresetList = styled.div`
  display: grid;
  gap: 0.65rem;
`;

const PresetButton = styled.button<{ active: boolean }>`
  width: 100%;
  text-align: left;
  cursor: pointer;
  border-radius: 16px;
  padding: 0.95rem 1rem;
  border: 1px solid ${(props) => (props.active ? colors.borderStrong : colors.borderSubtle)};
  background: ${(props) =>
    props.active
      ? 'color-mix(in srgb, var(--surface-accent) 76%, var(--primary-transparent))'
      : 'var(--surface-accent)'};
  color: ${colors.textColor};
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    background 0.18s ease;
  &:hover {
    transform: translateY(-1px);
    border-color: ${colors.borderStrong};
  }
`;

const PresetTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.3rem;
  strong {
    font-size: 0.98rem;
  }
  span {
    font-size: 0.8rem;
    color: ${colors.primary};
  }
`;

const PresetDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${colors.textColorSecondary};
`;

const CustomBuilder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  border-radius: 16px;
  background: ${colors.surfaceAccent};
  border: 1px solid ${colors.borderSubtle};
`;

const CustomToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ToolbarButton = styled.button<{ active?: boolean }>`
  cursor: pointer;
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  border: 1px solid ${(props) => (props.active ? colors.borderStrong : colors.borderSubtle)};
  background: ${(props) =>
    props.active
      ? 'color-mix(in srgb, var(--surface) 68%, var(--primary-transparent))'
      : 'var(--surface)'};
  color: ${props => props.active ? colors.primary : colors.textColor};
  font-family: var(--font-mono);
  font-size: 0.83rem;
  &:hover {
    border-color: ${colors.borderStrong};
    color: ${colors.primary};
  }
`;

const BuilderNote = styled.p`
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: ${colors.textColorSecondary};
`;

const CustomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const CustomOption = styled.label<{ active: boolean }>`
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  padding: 0.75rem 0.8rem;
  border-radius: 14px;
  border: 1px solid ${(props) => (props.active ? colors.borderStrong : colors.borderSubtle)};
  background: ${(props) =>
    props.active
      ? 'color-mix(in srgb, var(--surface) 70%, var(--primary-transparent))'
      : 'var(--surface)'};
  cursor: pointer;
  input {
    margin-top: 0.15rem;
    accent-color: ${colors.primary};
  }
`;

const OptionMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  min-width: 0;
  strong {
    font-size: 0.92rem;
  }
  span {
    font-size: 0.8rem;
    line-height: 1.45;
    color: ${colors.textColorSecondary};
    overflow-wrap: anywhere;
  }
`;

const ToggleRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  font-size: 0.92rem;
  line-height: 1.5;
  color: ${colors.textColorSecondary};
  cursor: pointer;
  input {
    margin-top: 0.2rem;
    accent-color: ${colors.primary};
  }
`;

const LowerGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
  gap: 1rem;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const CheckList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

const CheckChip = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  text-decoration: none;
  color: ${colors.textColorSecondary};
  background: ${colors.surfaceAccent};
  border: 1px solid ${colors.borderSubtle};
  font-size: 0.83rem;
  transition:
    color 0.18s ease,
    border-color 0.18s ease;
  &:hover {
    color: ${colors.primary};
    border-color: ${colors.borderStrong};
  }
`;

const LinkStack = styled.div`
  display: grid;
  gap: 0.65rem;
  a {
    text-decoration: none;
  }
`;

const SupportNote = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: ${colors.textColorSecondary};
  a {
    color: ${colors.primary};
  }
`;

const makeAnchor = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, '-');

const cyberbroModeOptions = [
  { id: 'web', label: 'Web Cyberbro' },
  { id: 'cyber_intel', label: 'Intel Cyberbro' },
];

const scanJobOptions = scanJobs.map((job) => ({
  id: job.id,
  title: job.cards[0]?.title || job.id,
  tags: job.cards[0]?.tags || [],
}));

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
    'e.g. suspicious-domain.tld, https://example.test, 8.8.8.8, 2606:4700:4700::1111';
  const [userInput, setUserInput] = useState('');
  const [errorMsg, setErrMsg] = useState('');
  const [placeholder] = useState(defaultPlaceholder);
  const [inputDisabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(defaultScanSettings.preset || 'web');
  const [freeOnly, setFreeOnly] = useState(Boolean(defaultCyberbroSettings.freeOnly));
  const [customJobIds, setCustomJobIds] = useState<string[]>(
    defaultScanSettings.customJobIds || [],
  );
  const [customCyberbroPreset, setCustomCyberbroPreset] = useState(
    defaultScanSettings.customCyberbroPreset || 'web',
  );
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
    const scanSettings = getScanSettings();
    const cyberbroSettings = getCyberbroSettings();
    setSelectedPreset(scanSettings.preset || 'web');
    setCustomJobIds(scanSettings.customJobIds || []);
    setCustomCyberbroPreset(scanSettings.customCyberbroPreset || 'web');
    setFreeOnly(Boolean(cyberbroSettings.freeOnly));
  }, []);

  const customJobSet = useMemo(() => new Set(customJobIds), [customJobIds]);

  const toggleCustomJob = (jobId: string) => {
    setCustomJobIds((current) =>
      current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId],
    );
  };

  const applyCustomPreset = (presetId: string) => {
    const preset = getScanPreset(presetId);
    setCustomJobIds(preset.jobIds);
    setCustomCyberbroPreset(preset.cyberbroPreset);
  };

  const submit = () => {
    const address = normalizeAddress(userInput);
    const addressType = determineAddressType(address);

    if (addressType === 'empt') {
      setErrMsg('Field must not be empty');
    } else if (addressType === 'err') {
      setErrMsg('Must be a valid URL, domain, IPv4, or IPv6 address');
    } else if (selectedPreset === 'custom' && customJobIds.length === 0) {
      setErrMsg('Select at least one check for a custom run');
    } else {
      const scanSettings = saveScanSettings({
        preset: selectedPreset,
        customJobIds,
        customCyberbroPreset,
      });
      persistCyberbroProfile(scanSettings?.cyberbroPreset || selectedPreset, freeOnly);
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

  const presetConfig = getScanPreset(selectedPreset);
  const activePreset =
    selectedPreset === 'custom'
      ? {
          ...presetConfig,
          label: 'Custom',
          jobIds: customJobIds,
          cyberbroPreset: customCyberbroPreset,
        }
      : presetConfig;
  const resolvedEngines = resolveCyberbroSelection({
    ...defaultCyberbroSettings,
    preset: activePreset.cyberbroPreset,
    freeOnly,
  });

  return (
    <HomeContainer>
      <FancyBackground />
      <Shell>
        <HeroGrid>
          <HeroCard>
            <BrandRow>
              <BrandBlock>
                <img width="56" src={branding.appIconPath} alt={branding.name + ' icon'} />
                <HeroTitleBlock>
                  <BrandKicker>Investigation Workspace</BrandKicker>
                  <Heading as="h1" size="xLarge" color={colors.textColor}>
                    <a href="/check">{branding.name}</a>
                  </Heading>
                </HeroTitleBlock>
              </BrandBlock>
            </BrandRow>

            <Headline>{branding.heroSubtitle}</Headline>
            <CompactMeta>
              <MetaPill>Preset-driven scans</MetaPill>
              <MetaPill>URL, domain, IPv4, and IPv6</MetaPill>
              <MetaPill>Whitelabel-ready theme</MetaPill>
            </CompactMeta>

            <SearchForm onSubmit={formSubmitEvent}>
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
              <LaunchRow>
                <LaunchGroup>
                  <Button
                    type="submit"
                    size="large"
                    onClick={submit}
                    styles="width: auto; min-width: 15rem; padding-inline: 1.1rem;"
                  >
                    Launch Analysis
                  </Button>
                </LaunchGroup>
                <SummaryLine>
                  <strong>{activePreset.label}</strong> runs {activePreset.jobIds.length} Web Check
                  job{activePreset.jobIds.length === 1 ? '' : 's'} and {resolvedEngines.length}{' '}
                  Cyberbro engine{resolvedEngines.length === 1 ? '' : 's'}
                  {freeOnly ? ' with free/no-key sources only.' : '.'}
                </SummaryLine>
              </LaunchRow>
            </SearchForm>
          </HeroCard>

          <PanelCard>
            <SectionLabel>Lookup Mode</SectionLabel>
            <PresetList>
              {WEB_CHECK_SCAN_PRESETS.map((preset) => (
                <PresetButton
                  key={preset.id}
                  type="button"
                  active={selectedPreset === preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                >
                  <PresetTitle>
                    <strong>{preset.label}</strong>
                    <span>{preset.jobIds.length} jobs</span>
                  </PresetTitle>
                  <PresetDescription>{preset.description}</PresetDescription>
                </PresetButton>
              ))}
            </PresetList>

            {selectedPreset === 'custom' && (
              <CustomBuilder>
                <SectionLabel>Custom Builder</SectionLabel>
                <CustomToolbar>
                  <ToolbarButton type="button" onClick={() => applyCustomPreset('web')}>
                    Load Web
                  </ToolbarButton>
                  <ToolbarButton type="button" onClick={() => applyCustomPreset('cyber_intel')}>
                    Load Intel
                  </ToolbarButton>
                  <ToolbarButton type="button" onClick={() => applyCustomPreset('full_surface')}>
                    Load Full
                  </ToolbarButton>
                  <ToolbarButton type="button" onClick={() => setCustomJobIds([])}>
                    Clear
                  </ToolbarButton>
                </CustomToolbar>
                <BuilderNote>
                  Pick the exact Web Check jobs to run. If Cyberbro stays enabled below, you can
                  still choose which Cyberbro profile backs the custom run.
                </BuilderNote>
                <CustomGrid>
                  {scanJobOptions.map((job) => (
                    <CustomOption key={job.id} active={customJobSet.has(job.id)}>
                      <input
                        type="checkbox"
                        checked={customJobSet.has(job.id)}
                        onChange={() => toggleCustomJob(job.id)}
                      />
                      <OptionMeta>
                        <strong>{job.title}</strong>
                        <span>
                          {job.id}
                          {job.tags.length ? ` • ${job.tags.join(', ')}` : ''}
                        </span>
                      </OptionMeta>
                    </CustomOption>
                  ))}
                </CustomGrid>
                {customJobSet.has('cyberbro') && (
                  <>
                    <SectionLabel>Cyberbro Profile</SectionLabel>
                    <CustomToolbar>
                      {cyberbroModeOptions.map((option) => (
                        <ToolbarButton
                          key={option.id}
                          type="button"
                          active={customCyberbroPreset === option.id}
                          onClick={() => setCustomCyberbroPreset(option.id)}
                        >
                          {option.label}
                        </ToolbarButton>
                      ))}
                    </CustomToolbar>
                  </>
                )}
              </CustomBuilder>
            )}

            <ToggleRow>
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(event) => setFreeOnly(event.target.checked)}
              />
              <span>Use only free or no-key Cyberbro engines where possible.</span>
            </ToggleRow>
            <BuilderNote>
              Need to override the backend or hand-pick engines? Use the account settings page for
              the advanced controls.
            </BuilderNote>
          </PanelCard>
        </HeroGrid>

        <LowerGrid>
          <PanelCard>
            <SectionLabel>Supported Checks</SectionLabel>
            <Heading as="h2" size="small" align="left" color={colors.textColor}>
              Keep the scan set tight, not noisy
            </Heading>
            <CheckList>
              {docs.map((doc, index) => (
                <CheckChip key={index} to={`/check/about#${makeAnchor(doc.title)}`} title={doc.title}>
                  {doc.title}
                </CheckChip>
              ))}
              <CheckChip to="/check/about">Full documentation</CheckChip>
            </CheckList>
          </PanelCard>

          <PanelCard>
            <SectionLabel>Platform</SectionLabel>
            <Heading as="h2" size="small" align="left" color={colors.textColor}>
              Source, API, and self-hosting
            </Heading>
            <LinkStack>
              <a target="_blank" rel="noreferrer" href={branding.repoUrl}>
                <Button styles="width: 100%;">{branding.sourceLabel}</Button>
              </a>
              <Link to="/self-hosted-setup">
                <Button styles="width: 100%;">Self-host</Button>
              </Link>
              <Link to="/check/about#api-documentation">
                <Button styles="width: 100%;">API Docs</Button>
              </Link>
            </LinkStack>
            {branding.showSponsor && (
              <SupportNote>
                If this deployment is useful, support the maintainers or adapt it from{' '}
                <a target="_blank" rel="noreferrer" href={branding.repoUrl}>
                  the source repository
                </a>
                .
              </SupportNote>
            )}
          </PanelCard>
        </LowerGrid>

        <Footer />
      </Shell>
    </HomeContainer>
  );
};

export default Home;
