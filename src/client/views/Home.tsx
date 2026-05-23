import styled from '@emotion/styled';
import { type ChangeEvent, type SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, type NavigateOptions } from 'react-router-dom';

import Heading from 'client/components/Form/Heading';
import Input from 'client/components/Form/Input';
import Button from 'client/components/Form/Button';
import { StyledCard } from 'client/components/Form/Card';
import Footer from 'client/components/misc/Footer';

import colors from 'client/styles/colors';
import {
  determineAddressType,
  normalizeAddress,
  type AddressType,
} from 'client/utils/address-type-checker';
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
  min-height: 100vh;
  padding: 1.5rem 1.25rem 2rem;
  font-family: var(--font-sans);
  box-sizing: border-box;
  display: flex;
`;

const Shell = styled.div`
  flex: 1;
  width: 100%;
  max-width: min(1680px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  min-width: 0;
`;

const HeroGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
  gap: 1.2rem;
  align-items: start;
  min-width: 0;

  @media (max-width: 1120px) {
    grid-template-columns: 1fr;
  }

  > * {
    min-width: 0;
  }
`;

const HeroCard = styled(StyledCard)`
  padding: 1.5rem;
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
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${colors.primary};
  background: color-mix(in srgb, ${colors.surfaceAccent} 72%, ${colors.primaryTransparent});
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
  max-width: 42rem;
  font-size: 1.05rem;
  line-height: 1.7;
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
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  font-size: 0.82rem;
  color: ${colors.textColorSecondary};
  background: color-mix(in srgb, ${colors.surfaceAccent} 92%, transparent);
  border: 1px solid ${colors.borderSubtle};
`;

const FlowList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const FlowStep = styled.div`
  padding: 0.8rem 0.9rem;
  border-radius: 16px;
  border: 1px solid ${colors.borderSubtle};
  background: color-mix(in srgb, ${colors.surfaceAccent} 82%, transparent);
  strong {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.76rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${colors.primary};
  }
  span {
    display: block;
    font-size: 0.88rem;
    line-height: 1.45;
    color: ${colors.textColorSecondary};
  }
`;

const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LaunchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem 1rem;
  align-items: center;
  justify-content: flex-start;
`;

const SummaryLine = styled.p`
  margin: 0;
  font-size: 0.94rem;
  line-height: 1.6;
  color: ${colors.textColorSecondary};
  max-width: 42rem;
`;

const InputHint = styled.p`
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: ${colors.textColorSecondary};
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  padding: 0.95rem 1rem;
  border-radius: 18px;
  border: 1px solid ${colors.borderSubtle};
  background: color-mix(in srgb, ${colors.surfaceAccent} 88%, transparent);
  strong {
    display: block;
    margin-bottom: 0.28rem;
    font-size: 0.76rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${colors.primary};
  }
  span {
    font-size: 0.95rem;
    line-height: 1.35;
    color: ${colors.textColor};
  }
`;

const ErrorMessage = styled.p`
  margin: 0;
  color: ${colors.danger};
`;

const PanelCard = styled(StyledCard)`
  padding: 1.4rem;
  gap: 1rem;
  min-width: 0;
`;

const SectionLabel = styled.span`
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${colors.primary};
`;

const PresetList = styled.div`
  display: grid;
  gap: 0.55rem;
`;

const PresetButton = styled.button<{ active: boolean }>`
  width: 100%;
  text-align: left;
  cursor: pointer;
  border-radius: 18px;
  padding: 0.95rem 1rem;
  border: 1px solid ${(props) => (props.active ? colors.borderStrong : colors.borderSubtle)};
  background: ${(props) =>
    props.active
      ? 'linear-gradient(180deg, color-mix(in srgb, var(--surface-accent) 86%, var(--primary-transparent)), color-mix(in srgb, var(--surface) 92%, var(--primary-transparent)))'
      : 'var(--surface-accent)'};
  color: ${colors.textColor};
  box-shadow: ${(props) =>
    props.active
      ? `0 18px 34px color-mix(in srgb, ${colors.bgShadowColor} 22%, transparent)`
      : 'none'};
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
  &:hover {
    transform: translateY(-1px);
    border-color: ${colors.borderStrong};
    box-shadow: 0 16px 32px color-mix(in srgb, ${colors.bgShadowColor} 16%, transparent);
  }
`;

const PresetStatus = styled.span<{ active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${(props) => (props.active ? colors.background : colors.primary)};
  background: ${(props) =>
    props.active
      ? `linear-gradient(135deg, ${colors.primaryLighter}, ${colors.primary})`
      : `color-mix(in srgb, ${colors.surface} 92%, transparent)`};
  border: 1px solid ${(props) => (props.active ? 'transparent' : colors.borderSubtle)};
`;

const PresetTitle = styled.div`
  display: flex;
  flex-wrap: wrap;
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
  font-size: 0.86rem;
  line-height: 1.45;
  color: ${colors.textColorSecondary};
`;

const CustomBuilder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 18px;
  background: color-mix(in srgb, ${colors.surfaceAccent} 88%, transparent);
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
  padding: 0.52rem 0.9rem;
  border: 1px solid ${(props) => (props.active ? colors.borderStrong : colors.borderSubtle)};
  background: ${(props) =>
    props.active
      ? 'color-mix(in srgb, var(--surface) 68%, var(--primary-transparent))'
      : 'var(--surface)'};
  color: ${props => props.active ? colors.primary : colors.textColor};
  font-family: var(--font-mono);
  font-size: 0.82rem;
  transition:
    border-color 0.18s ease,
    color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
  &:hover {
    border-color: ${colors.borderStrong};
    color: ${colors.primary};
    transform: translateY(-1px);
  }
`;

const BuilderNote = styled.p`
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.45;
  color: ${colors.textColorSecondary};
`;

const BuilderCounts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
`;

const CountPill = styled.span<{ tone?: 'neutral' | 'warning' }>`
  display: inline-flex;
  align-items: center;
  padding: 0.38rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  color: ${(props) => (props.tone === 'warning' ? colors.warning : colors.textColorSecondary)};
  background: color-mix(in srgb, ${colors.surface} 88%, transparent);
  border: 1px solid
    ${(props) => (props.tone === 'warning' ? colors.warning : colors.borderSubtle)};
`;

const CustomGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  max-height: 24rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.2rem;
  @media (min-width: 1720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  &::-webkit-scrollbar {
    width: 0.55rem;
  }
  &::-webkit-scrollbar-thumb {
    background: ${colors.borderStrong};
    border-radius: 999px;
  }
`;

const CustomOption = styled.label<{ active: boolean; disabled?: boolean }>`
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  padding: 0.75rem 0.8rem;
  border-radius: 16px;
  border: 1px solid ${(props) => (props.active ? colors.borderStrong : colors.borderSubtle)};
  background: ${(props) =>
    props.active
      ? 'color-mix(in srgb, var(--surface) 70%, var(--primary-transparent))'
      : 'var(--surface)'};
  cursor: pointer;
  opacity: ${(props) => (props.disabled ? 0.58 : 1)};
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    background 0.18s ease;
  &:hover {
    transform: ${(props) => (props.disabled ? 'none' : 'translateY(-1px)')};
    border-color: ${(props) => (props.disabled ? colors.borderSubtle : colors.borderStrong)};
  }
  input {
    margin-top: 0.2rem;
    accent-color: ${colors.primary};
    flex-shrink: 0;
  }
`;

const OptionMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  min-width: 0;
  strong {
    font-size: 0.92rem;
    line-height: 1.2;
  }
  span {
    font-size: 0.8rem;
    line-height: 1.45;
    color: ${colors.textColorSecondary};
    overflow-wrap: anywhere;
  }
`;

const EmptyBuilderState = styled.div`
  padding: 0.9rem;
  border-radius: 12px;
  border: 1px dashed ${colors.borderSubtle};
  color: ${colors.textColorSecondary};
  font-size: 0.84rem;
  line-height: 1.45;
`;

const ToggleRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${colors.textColorSecondary};
  cursor: pointer;
  padding: 0.85rem 0.95rem;
  border-radius: 16px;
  border: 1px solid ${colors.borderSubtle};
  background: color-mix(in srgb, ${colors.surfaceAccent} 90%, transparent);
  input {
    margin-top: 0.2rem;
    accent-color: ${colors.primary};
  }
`;

const SetupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 0.8rem;
  align-items: start;
  min-width: 0;

  > * {
    min-width: 0;
  }
`;

const PresetColumn = styled.div`
  display: grid;
  gap: 0.7rem;
  min-width: 0;
`;

const CustomColumn = styled.div`
  display: grid;
  gap: 0.7rem;
  min-width: 0;
`;

const cyberbroModeOptions = [
  { id: 'web', label: 'Web Cyberbro' },
  { id: 'cyber_intel', label: 'Intel Cyberbro' },
];

const scanJobOptions = scanJobs.map((job) => ({
  id: job.id,
  title: job.cards[0]?.title || job.id,
  tags: job.cards[0]?.tags || [],
}));

const isJobApplicable = (job: (typeof scanJobs)[number], addressType: AddressType) => {
  if (addressType === 'empt' || addressType === 'err') return true;
  if (job.needsIp) return addressType === 'url' || addressType === 'ipV4' || addressType === 'ipV6';
  if (!job.expectedAddressTypes) return true;
  return job.expectedAddressTypes.includes(addressType);
};

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
  const draftAddressType = determineAddressType(userInput);
  const applicableActiveJobs = activePreset.jobIds.filter((jobId) => {
    const job = scanJobs.find((entry) => entry.id === jobId);
    return job ? isJobApplicable(job, draftAddressType) : false;
  });
  const compatibleCustomJobs = scanJobOptions.filter((job) => {
    const full = scanJobs.find((entry) => entry.id === job.id);
    return full ? isJobApplicable(full, draftAddressType) : true;
  });
  const incompatibleCustomJobs = scanJobOptions.filter((job) => {
    const full = scanJobs.find((entry) => entry.id === job.id);
    return full ? !isJobApplicable(full, draftAddressType) : false;
  });

  return (
    <HomeContainer>
      <Shell>
        <HeroGrid>
          <HeroCard>
            <BrandRow>
              <BrandBlock>
                <img width="56" src={branding.appIconPath} alt={branding.name + ' icon'} />
                <HeroTitleBlock>
                  <BrandKicker>Investigation Workspace</BrandKicker>
                  <Heading as="h1" size="xLarge" color={colors.textColor}>
                    <Link to="/">{branding.name}</Link>
                  </Heading>
                </HeroTitleBlock>
              </BrandBlock>
            </BrandRow>

            <Headline>{branding.heroSubtitle}</Headline>
            <CompactMeta>
              <MetaPill>Preset-driven scans</MetaPill>
              <MetaPill>IPv4, IPv6, domain, and URL</MetaPill>
              <MetaPill>Faster triage, less filler</MetaPill>
            </CompactMeta>

            <FlowList>
              <FlowStep>
                <strong>1 · Select</strong>
                <span>Choose the scan profile that matches the investigation depth you need.</span>
              </FlowStep>
              <FlowStep>
                <strong>2 · Target</strong>
                <span>Paste a URL, domain, IPv4, or IPv6 and let Web Check trim incompatible jobs.</span>
              </FlowStep>
              <FlowStep>
                <strong>3 · Launch</strong>
                <span>Start the scan and review the advisory-first results workspace as jobs settle.</span>
              </FlowStep>
            </FlowList>

            <SearchForm onSubmit={formSubmitEvent}>
              <Input
                id="user-input"
                value={userInput}
                label="Target URL, domain, IPv4, or IPv6"
                size="medium"
                orientation="vertical"
                name="url"
                placeholder={placeholder}
                disabled={inputDisabled}
                handleChange={inputChange}
                handleKeyDown={handleKeyPress}
              />
              {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
              <LaunchRow>
                <Button
                  type="submit"
                  size="large"
                  onClick={submit}
                  styles="width: auto; min-width: 15rem; padding-inline: 1.2rem;"
                >
                  Launch Analysis
                </Button>
                <SummaryLine>
                  <strong>{activePreset.label}</strong> is set to {activePreset.jobIds.length} Web
                  Check job{activePreset.jobIds.length === 1 ? '' : 's'}. For this target,{' '}
                  <strong>{applicableActiveJobs.length}</strong> can actually run, plus{' '}
                  {resolvedEngines.length} Cyberbro engine{resolvedEngines.length === 1 ? '' : 's'}
                  {freeOnly ? ' with free/no-key sources only.' : '.'}
                </SummaryLine>
              </LaunchRow>
              <StatRow>
                <StatCard>
                  <strong>Preset</strong>
                  <span>{activePreset.label}</span>
                </StatCard>
                <StatCard>
                  <strong>Configured</strong>
                  <span>{activePreset.jobIds.length} jobs</span>
                </StatCard>
                <StatCard>
                  <strong>Applicable</strong>
                  <span>{applicableActiveJobs.length} for this target</span>
                </StatCard>
              </StatRow>
              {(draftAddressType === 'ipV4' || draftAddressType === 'ipV6') && (
                <InputHint>
                  IPv4 and IPv6 targets only run the IP-aware checks. Domain-only checks stay
                  configured in the preset but are skipped on purpose.
                </InputHint>
              )}
            </SearchForm>
          </HeroCard>

          <PanelCard>
            <SectionLabel>Scan Setup</SectionLabel>
            <SetupGrid>
              <PresetColumn>
                <Heading as="h2" size="small" align="left" color={colors.textColor}>
                  Choose the scan profile
                </Heading>
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
                        <PresetStatus active={selectedPreset === preset.id}>
                          {selectedPreset === preset.id ? 'Active' : 'Available'}
                        </PresetStatus>
                      </PresetTitle>
                      <PresetDescription>
                        {preset.description}{' '}
                        <strong>
                          {preset.id === 'custom'
                            ? compatibleCustomJobs.filter((job) => customJobIds.includes(job.id)).length
                            : preset.jobIds.filter((jobId) => {
                                const full = scanJobs.find((entry) => entry.id === jobId);
                                return full ? isJobApplicable(full, draftAddressType) : false;
                              }).length}{' '}
                          live checks
                        </strong>
                      </PresetDescription>
                    </PresetButton>
                  ))}
                </PresetList>
                <ToggleRow>
                  <input
                    type="checkbox"
                    checked={freeOnly}
                    onChange={(event) => setFreeOnly(event.target.checked)}
                  />
                  <span>Prefer free or no-key Cyberbro sources for a lighter branded default.</span>
                </ToggleRow>
              </PresetColumn>

              {selectedPreset === 'custom' ? (
                <CustomColumn>
                  <CustomBuilder>
                    <SectionLabel>Custom Builder</SectionLabel>
                    <BuilderNote>
                      Pick the exact Web Check jobs to run. Incompatible jobs are dimmed so it is
                      obvious why an IPv4 target may only execute a small subset.
                    </BuilderNote>
                    <BuilderCounts>
                      <CountPill>{customJobIds.length} selected</CountPill>
                      <CountPill>
                        {
                          compatibleCustomJobs.filter((job) => customJobIds.includes(job.id)).length
                        } applicable
                      </CountPill>
                      {!!incompatibleCustomJobs.length &&
                        (draftAddressType === 'ipV4' || draftAddressType === 'ipV6') && (
                          <CountPill tone="warning">
                            {incompatibleCustomJobs.length} domain-only
                          </CountPill>
                        )}
                    </BuilderCounts>
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
                    <CustomGrid>
                      {compatibleCustomJobs.map((job) => (
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
                      {incompatibleCustomJobs.map((job) => (
                        <CustomOption key={job.id} active={customJobSet.has(job.id)} disabled>
                          <input
                            type="checkbox"
                            checked={customJobSet.has(job.id)}
                            onChange={() => toggleCustomJob(job.id)}
                          />
                          <OptionMeta>
                            <strong>{job.title}</strong>
                            <span>
                              {job.id}
                              {job.tags.length ? ` • ${job.tags.join(', ')}` : ''} • domain-only
                            </span>
                          </OptionMeta>
                        </CustomOption>
                      ))}
                      {!compatibleCustomJobs.length && (
                        <EmptyBuilderState>
                          No jobs are compatible with the current target type yet. Enter a domain or
                          URL to unlock the broader website checks.
                        </EmptyBuilderState>
                      )}
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
                </CustomColumn>
              ) : (
                <CustomColumn>
                  <CustomBuilder>
                    <SectionLabel>Why this preset</SectionLabel>
                    <Heading as="h2" size="small" align="left" color={colors.textColor}>
                      {presetConfig.label}
                    </Heading>
                    <BuilderNote>{presetConfig.description}</BuilderNote>
                    <BuilderNote>
                      {draftAddressType === 'ipV4' || draftAddressType === 'ipV6'
                        ? 'On an IP target, only the IP-aware subset will run even if the preset contains more website-specific checks.'
                        : 'Need tighter control? Switch to Custom and choose the exact checks without leaving the top of the page.'}
                    </BuilderNote>
                    <BuilderNote>
                      Cyberbro still follows the preset profile unless you switch to Custom and override it.
                    </BuilderNote>
                  </CustomBuilder>
                </CustomColumn>
              )}
            </SetupGrid>
          </PanelCard>
        </HeroGrid>

        <Footer />
      </Shell>
    </HomeContainer>
  );
};

export default Home;
