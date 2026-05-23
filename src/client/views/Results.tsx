import { startTransition, useState, useEffect, useMemo, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { ToastContainer } from 'react-toastify';

import colors from 'client/styles/colors';
import Heading from 'client/components/Form/Heading';
import Button from 'client/components/Form/Button';
import Modal from 'client/components/Form/Modal';
import { StyledCard } from 'client/components/Form/Card';
import Footer from 'client/components/misc/Footer';
import Nav from 'client/components/Form/Nav';
import Loader from 'client/components/misc/Loader';
import ErrorBoundary from 'client/components/misc/ErrorBoundary';
import ProgressBar, {
  type LoadingJob,
  type LoadingState,
} from 'client/components/misc/ProgressBar';
import ActionButtons from 'client/components/misc/ActionButtons';
import AdvisoryPanel from 'client/components/misc/AdvisoryPanel';
import NoResults from 'client/components/misc/NoResults';
import ResultsMasonryGrid from 'client/components/misc/ResultsMasonryGrid';
import ViewRaw from 'client/components/misc/ViewRaw';

import { determineAddressType, type AddressType } from 'client/utils/address-type-checker';
import { hasData } from 'client/utils/result-processor';
import keys from 'client/utils/get-keys';
import useJobs from 'client/hooks/useJobs';
import { jobs, filterJobsByIds, getCardIdsForJobs, getCardsForJobs } from 'client/jobs/registry';
import { runAnalysis } from 'client/analysis/registry';
import { getScanSettings } from '@/config/scan-settings';
import { getScanPreset } from '@/config/scan-presets';

const ResultsOuter = styled.div`
  min-height: 100vh;
  padding: 1.5rem 1.25rem 2rem;
  box-sizing: border-box;
  display: flex;
`;

const ResultsFrame = styled.div`
  flex: 1;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Masthead = styled(StyledCard)`
  gap: 1rem;
  padding: 1.15rem 1.2rem;
`;

const MastheadTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.9rem;
  align-items: flex-start;
`;

const TargetBlock = styled.div`
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  min-width: 0;
  img {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    border: 1px solid ${colors.borderSubtle};
    background: ${colors.surfaceAccent};
    flex-shrink: 0;
  }
`;

const TargetMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
  h1, h2 {
    margin: 0;
    min-width: 0;
  }
  a {
    color: ${colors.textColor};
  }
`;

const Eyebrow = styled.span`
  display: inline-flex;
  width: fit-content;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: color-mix(in srgb, ${colors.surfaceAccent} 78%, ${colors.primaryTransparent});
  border: 1px solid ${colors.borderStrong};
  color: ${colors.primary};
  font-size: 0.76rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
`;

const SubtleText = styled.p`
  margin: 0;
  color: ${colors.textColorSecondary};
  line-height: 1.55;
  font-size: 0.93rem;
`;

const AddressCode = styled.code`
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  padding: 0.45rem 0.7rem;
  border-radius: 10px;
  background: ${colors.surfaceAccent};
  border: 1px solid ${colors.borderSubtle};
  color: ${colors.textColorSecondary};
  overflow-wrap: anywhere;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.7rem;
`;

const MetaCard = styled.div`
  padding: 0.9rem 0.95rem;
  border-radius: 16px;
  background: ${colors.surfaceAccent};
  border: 1px solid ${colors.borderSubtle};
  strong {
    display: block;
    color: ${colors.primary};
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.2rem;
  }
  span {
    color: ${colors.textColor};
    font-size: 0.92rem;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) repeat(2, minmax(220px, 0.9fr));
  gap: 0.85rem;
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const OverviewCard = styled(StyledCard)`
  padding: 1rem 1.05rem;
  gap: 0.75rem;
`;

const OverviewLabel = styled.span`
  display: inline-flex;
  width: fit-content;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: color-mix(in srgb, ${colors.surfaceAccent} 78%, ${colors.primaryTransparent});
  border: 1px solid ${colors.borderSubtle};
  color: ${colors.primary};
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const OverviewMetric = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.55rem;
  strong {
    font-size: 1.3rem;
    line-height: 1.05;
    color: ${colors.textColor};
  }
  span {
    font-size: 0.9rem;
    color: ${colors.textColorSecondary};
  }
`;

const FindingsPreview = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.5rem;
  li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.55rem;
    align-items: start;
    font-size: 0.88rem;
    line-height: 1.45;
    color: ${colors.textColorSecondary};
  }
  strong {
    color: ${colors.textColor};
  }
`;

const FindingDot = styled.span<{ tone: string }>`
  width: 0.62rem;
  height: 0.62rem;
  border-radius: 999px;
  margin-top: 0.42rem;
  background: ${(props) => props.tone};
  box-shadow: 0 0 0 5px color-mix(in srgb, ${(props) => props.tone} 18%, transparent);
`;

const ResultsContent = styled.section`
  flex: 1;
  width: 100%;
  @keyframes cardFlash {
    0%,
    30% {
      outline: 2px solid ${colors.primary};
      outline-offset: 4px;
    }
    100% {
      outline: 2px solid transparent;
      outline-offset: 4px;
    }
  }
  .flash > section {
    animation: cardFlash 1.2s ease-out;
    border-radius: 18px;
  }

  > div {
    width: 100%;
  }
`;

const EmptyStateActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  a {
    text-decoration: none;
  }
`;

const makeSiteName = (address: string): string => {
  try {
    const withScheme = /^https?:\/\//i.test(address) ? address : `https://${address}`;
    return new URL(withScheme).hostname.replace(/^www\./, '');
  } catch {
    return address;
  }
};

const makeSiteHref = (address: string): string => {
  if (/^https?:\/\//i.test(address)) return address;
  if (determineAddressType(address) === 'url') {
    return `https://${address}`;
  }
  return `https://${address}`;
};

const Results = (props: { address?: string }): JSX.Element => {
  const address = props.address || useParams().urlToScan || '';
  const navigate = useNavigate();
  const [addressType, setAddressType] = useState<AddressType>('empt');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(<></>);

  useEffect(() => {
    if (addressType === 'empt') setAddressType(determineAddressType(address));
  }, [address, addressType]);

  const scanSettings = getScanSettings();
  const presetMeta =
    scanSettings.preset === 'custom'
      ? {
          label: 'Custom',
          description: 'Only the selected Web Check jobs and chosen Cyberbro profile run.',
        }
      : getScanPreset(scanSettings.preset);
  const activeJobs = useMemo(
    () => filterJobsByIds(jobs, scanSettings.jobIds || []),
    [scanSettings.preset, (scanSettings.jobIds || []).join(',')],
  );
  const activeCardIds = useMemo(() => getCardIdsForJobs(activeJobs), [activeJobs]);
  const activeCards = useMemo(() => getCardsForJobs(activeJobs), [activeJobs]);

  const { state: jobsState, retry, ipLookupError } = useJobs(address, addressType, activeJobs);

  const loadingJobs: LoadingJob[] = useMemo(
    () =>
      activeCardIds.map((id) => {
        const e = jobsState[id] || { state: 'loading' as LoadingState };
        return {
          name: id,
          state: e.state,
          error: e.error,
          timeTaken: e.timeTaken,
          retry: () => retry(id),
        };
      }),
    [activeCardIds, jobsState, retry],
  );

  useEffect(() => {
    (window as any).webCheck = {};
  }, [address]);

  useEffect(() => {
    const w = (window as any).webCheck;
    if (!w) return;
    Object.entries(jobsState).forEach(([id, entry]) => {
      if (entry?.state === 'success' && entry.raw !== undefined) {
        w[id] = entry.raw;
      }
    });
  }, [jobsState]);

  const showInfo = async (id: string) => {
    setModalContent(<SubtleText>Loading documentation…</SubtleText>);
    setModalOpen(true);
    const { default: DocContent } = await import('client/components/misc/DocContent');
    startTransition(() => {
      setModalContent(DocContent(id));
    });
  };

  const showErrorModal = (content: ReactNode) => {
    setModalContent(content);
    setModalOpen(true);
  };

  const renderable = activeCards.map(({ jobId, card }) => {
    const entry = jobsState[card.id];
    const raw = entry?.raw;
    let data = raw && card.pick ? card.pick(raw) : raw;
    if (!hasData(data) && card.fallback) data = card.fallback(jobsState);
    return { jobId, card, data, entry };
  });

  const cardsToShow = renderable.filter(({ data, entry }) => hasData(data) && !entry?.error);

  const findings = useMemo(() => runAnalysis(jobsState, activeCards), [activeCards, jobsState]);
  const severityCounts = useMemo(
    () =>
      findings.reduce(
        (acc, finding) => {
          acc[finding.severity] += 1;
          return acc;
        },
        { critical: 0, issue: 0, warning: 0, info: 0, pass: 0 },
      ),
    [findings],
  );
  const postureSummary = useMemo(() => {
    if (severityCounts.critical) {
      return {
        label: 'Critical attention required',
        tone: colors.danger,
        detail: `${severityCounts.critical} critical finding${severityCounts.critical === 1 ? '' : 's'} surfaced immediately.`,
      };
    }
    if (severityCounts.issue) {
      return {
        label: 'Hardening gaps detected',
        tone: colors.error,
        detail: `${severityCounts.issue} issue${severityCounts.issue === 1 ? '' : 's'} should be reviewed before sharing externally.`,
      };
    }
    if (severityCounts.warning) {
      return {
        label: 'Review recommended',
        tone: colors.warning,
        detail: `${severityCounts.warning} warning${severityCounts.warning === 1 ? '' : 's'} could affect trust signals or resilience.`,
      };
    }
    return {
      label: 'Healthy first pass',
      tone: colors.success,
      detail: 'No critical findings are currently blocking this scan summary.',
    };
  }, [severityCounts]);
  const topFindings = useMemo(
    () => findings.filter((finding) => finding.severity !== 'pass').slice(0, 3),
    [findings],
  );

  const apiUnreachable = useMemo(() => {
    const entries = Object.values(jobsState);
    const settled = entries.filter((e) => e?.state !== 'loading');
    const dead = settled.filter((e) => e?.state === 'error' || e?.state === 'timed-out');
    return settled.length >= entries.length / 2 && dead.length / settled.length >= 0.9;
  }, [jobsState]);

  let errorKind: 'invalid' | 'unreachable' | 'api-down' | 'disabled' | null = null;
  if (keys.disableEverything) {
    errorKind = 'disabled';
  } else if (addressType === 'err') {
    errorKind = 'invalid';
  } else if (ipLookupError) {
    errorKind = 'unreachable';
  } else if (apiUnreachable) {
    errorKind = 'api-down';
  }

  const jumpToCard = (id: string) => {
    const el = document.getElementById(`card-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
    window.setTimeout(() => el.classList.remove('flash'), 1300);
  };

  const failedJobs = loadingJobs.filter((job) => job.state === 'error' || job.state === 'timed-out');

  const rerunFailed = () => {
    failedJobs.forEach((job) => job.retry?.());
  };

  return (
    <ResultsOuter>
      <ResultsFrame>
        <Nav />

        <Masthead>
          <MastheadTop>
            <TargetBlock>
              {addressType === 'url' && (
                <a target="_blank" rel="noreferrer" href={makeSiteHref(address)}>
                  <img width="52" alt="" src={`https://icon.horse/icon/${makeSiteName(address)}`} />
                </a>
              )}
              <TargetMeta>
                <Eyebrow>{presetMeta.label}</Eyebrow>
                <Heading as="h1" align="left" color={colors.textColor}>
                  {makeSiteName(address)}
                </Heading>
                <SubtleText>{presetMeta.description}</SubtleText>
                <AddressCode>{address}</AddressCode>
              </TargetMeta>
            </TargetBlock>

            <ActionButtons
              actions={[
                { label: 'New Scan', shortLabel: 'New Scan', icon: '←', onClick: () => navigate('/') },
                ...(failedJobs.length
                  ? [{ label: 'Retry Failed Checks', shortLabel: 'Retry Failed', icon: '↻', onClick: rerunFailed }]
                  : []),
                ...(address
                  ? [{ label: 'Open Target', shortLabel: 'Open Target', icon: '↗', onClick: () => window.open(makeSiteHref(address), '_blank', 'noopener,noreferrer') }]
                  : []),
              ]}
            />
          </MastheadTop>

          <MetaGrid>
            <MetaCard>
              <strong>Preset</strong>
              <span>{presetMeta.label}</span>
            </MetaCard>
            <MetaCard>
              <strong>Checks</strong>
              <span>{activeJobs.length} selected</span>
            </MetaCard>
            <MetaCard>
              <strong>Failures</strong>
              <span>{failedJobs.length ? failedJobs.length + ' need attention' : 'None currently'}</span>
            </MetaCard>
            <MetaCard>
              <strong>Cyberbro</strong>
              <span>{scanSettings.cyberbroPreset || 'web'}</span>
            </MetaCard>
          </MetaGrid>
        </Masthead>

        <OverviewGrid>
          <OverviewCard>
            <OverviewLabel>Overall posture</OverviewLabel>
            <OverviewMetric>
              <strong style={{ color: postureSummary.tone }}>{postureSummary.label}</strong>
              <span>{severityCounts.pass} passes logged</span>
            </OverviewMetric>
            <SubtleText>{postureSummary.detail}</SubtleText>
            <FindingsPreview>
              {topFindings.length ? (
                topFindings.map((finding, index) => {
                  const tone =
                    finding.severity === 'critical'
                      ? colors.danger
                      : finding.severity === 'issue'
                        ? colors.error
                        : finding.severity === 'warning'
                          ? colors.warning
                          : colors.info;
                  return (
                    <li key={`${finding.cardId}-${index}`}>
                      <FindingDot tone={tone} />
                      <span>
                        <strong>{finding.title}</strong>
                        {finding.detail ? ` — ${finding.detail}` : ''}
                      </span>
                    </li>
                  );
                })
              ) : (
                <li>
                  <FindingDot tone={colors.success} />
                  <span>
                    <strong>No urgent issues surfaced yet.</strong> As more jobs settle, this panel stays focused on the highest-signal findings.
                  </span>
                </li>
              )}
            </FindingsPreview>
          </OverviewCard>

          <OverviewCard>
            <OverviewLabel>Advisory mix</OverviewLabel>
            <OverviewMetric>
              <strong>{severityCounts.critical + severityCounts.issue + severityCounts.warning}</strong>
              <span>items worth review</span>
            </OverviewMetric>
            <SubtleText>
              {severityCounts.critical} critical · {severityCounts.issue} issues · {severityCounts.warning} warnings · {severityCounts.info} informational
            </SubtleText>
          </OverviewCard>

          <OverviewCard>
            <OverviewLabel>Scan progress</OverviewLabel>
            <OverviewMetric>
              <strong>{loadingJobs.filter((job) => job.state !== 'loading').length} / {loadingJobs.length}</strong>
              <span>jobs settled</span>
            </OverviewMetric>
            <SubtleText>
              {failedJobs.length
                ? `${failedJobs.length} failed job${failedJobs.length === 1 ? '' : 's'} still ${failedJobs.length === 1 ? 'deserves' : 'deserve'} a retry or explanation review.`
                : 'No failed jobs are currently blocking the analyst-facing summary.'}
            </SubtleText>
          </OverviewCard>
        </OverviewGrid>

        {errorKind && (
          <>
            <NoResults kind={errorKind} address={address} error={ipLookupError} />
            <EmptyStateActions>
              <Link to="/">
                <Button styles="width: auto; padding-inline: 1rem;">Start Another Scan</Button>
              </Link>
              {!!failedJobs.length && (
                <Button styles="width: auto; padding-inline: 1rem;" onClick={rerunFailed}>
                  Retry Failed Checks
                </Button>
              )}
            </EmptyStateActions>
          </>
        )}

        <ProgressBar loadStatus={loadingJobs} showModal={showErrorModal} showJobDocs={showInfo} />
        <Loader show={loadingJobs.filter((j) => j.state !== 'loading').length < 5} />
        <AdvisoryPanel findings={findings} onJumpTo={jumpToCard} />

        <ResultsContent>
          <ResultsMasonryGrid minColWidth={320} gap={18}>
            {cardsToShow.map(({ card, data }) => (
              <div id={`card-${card.id}`} key={`eb-${card.id}`}>
                <ErrorBoundary title={card.title}>
                  <card.Component
                    key={card.id}
                    data={data}
                    title={card.title}
                    actionButtons={
                      <ActionButtons
                        actions={[
                          {
                            label: `About ${card.title}`,
                            shortLabel: 'Docs',
                            icon: 'ⓘ',
                            onClick: () => showInfo(card.id),
                          },
                          {
                            label: `Retry ${card.title}`,
                            shortLabel: 'Retry',
                            icon: '↻',
                            onClick: () => retry(card.id),
                          },
                        ]}
                      />
                    }
                  />
                </ErrorBoundary>
              </div>
            ))}
          </ResultsMasonryGrid>
        </ResultsContent>

        <ViewRaw
          everything={renderable.map((r) => ({
            id: r.card.id,
            title: r.card.title,
            result: r.data,
          }))}
        />

        <Modal isOpen={modalOpen} closeModal={() => setModalOpen(false)}>
          {modalContent}
        </Modal>
        <ToastContainer
          limit={3}
          draggablePercent={60}
          autoClose={2500}
          theme="dark"
          position="bottom-right"
        />
        <Footer />
      </ResultsFrame>
    </ResultsOuter>
  );
};

export default Results;
