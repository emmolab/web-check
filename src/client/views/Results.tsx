import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
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
import DocContent from 'client/components/misc/DocContent';
import ProgressBar, {
  type LoadingJob,
  type LoadingState,
} from 'client/components/misc/ProgressBar';
import ActionButtons from 'client/components/misc/ActionButtons';
import AdditionalResources from 'client/components/misc/AdditionalResources';
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
  padding: 1rem 1rem 3rem;
`;

const ResultsFrame = styled.div`
  width: min(1180px, 100%);
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

const StatusStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  font-size: 0.82rem;
  color: ${colors.textColorSecondary};
  background: ${colors.surfaceAccent};
  border: 1px solid ${colors.borderSubtle};
`;

const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.95fr);
  gap: 1rem;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled(StyledCard)`
  min-height: 100%;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Metric = styled.div`
  padding: 0.9rem;
  border-radius: 14px;
  background: ${colors.surfaceAccent};
  border: 1px solid ${colors.borderSubtle};
  strong {
    display: block;
    color: ${colors.textColor};
    font-size: 1.25rem;
    margin-bottom: 0.2rem;
  }
  span {
    color: ${colors.textColorSecondary};
    font-size: 0.84rem;
    line-height: 1.45;
  }
`;

const SectionLabel = styled.span`
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${colors.primary};
`;

const NotesList = styled.div`
  display: grid;
  gap: 0.65rem;
`;

const Note = styled.div`
  padding: 0.85rem 0.9rem;
  border-radius: 14px;
  border: 1px solid ${colors.borderSubtle};
  background: ${colors.surfaceAccent};
  strong {
    display: block;
    margin-bottom: 0.2rem;
  }
  span {
    color: ${colors.textColorSecondary};
    line-height: 1.5;
    font-size: 0.9rem;
  }
`;

const ResultsContent = styled.section`
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

  const showInfo = (id: string) => {
    setModalContent(DocContent(id));
    setModalOpen(true);
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
  const settledJobs = loadingJobs.filter((job) => job.state !== 'loading');

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
              </TargetMeta>
            </TargetBlock>

            <ActionButtons
              actions={[
                { label: 'New Scan', shortLabel: 'New Scan', icon: '←', onClick: () => (window.location.href = '/check') },
                ...(failedJobs.length
                  ? [{ label: 'Retry Failed Checks', shortLabel: 'Retry Failed', icon: '↻', onClick: rerunFailed }]
                  : []),
                ...(address
                  ? [{ label: 'Open Target', shortLabel: 'Open Target', icon: '↗', onClick: () => window.open(makeSiteHref(address), '_blank', 'noopener,noreferrer') }]
                  : []),
              ]}
            />
          </MastheadTop>

          <StatusStrip>
            <StatusPill>{activeJobs.length} jobs selected</StatusPill>
            <StatusPill>{cardsToShow.length} cards rendered</StatusPill>
            <StatusPill>{settledJobs.length} jobs settled</StatusPill>
            <StatusPill>Cyberbro: {scanSettings.cyberbroPreset || 'web'}</StatusPill>
          </StatusStrip>
        </Masthead>

        <SummaryGrid>
          <SummaryCard>
            <SectionLabel>Run Summary</SectionLabel>
            <Heading as="h2" align="left" color={colors.textColor}>
              Cleaner scan state and easier recovery
            </Heading>
            <SubtleText>
              The selected preset controls the actual jobs that run, not just which cards stay
              visible afterwards. Failed checks can be retried from here or from each card.
            </SubtleText>
            <MetricGrid>
              <Metric>
                <strong>{activeJobs.length}</strong>
                <span>Configured jobs in this run</span>
              </Metric>
              <Metric>
                <strong>{failedJobs.length}</strong>
                <span>Checks currently failed or timed out</span>
              </Metric>
              <Metric>
                <strong>{findings.length}</strong>
                <span>Analysis findings surfaced</span>
              </Metric>
            </MetricGrid>
          </SummaryCard>

          <SummaryCard>
            <SectionLabel>Operator Notes</SectionLabel>
            <Heading as="h2" align="left" color={colors.textColor}>
              Control the noise without losing the work
            </Heading>
            <NotesList>
              <Note>
                <strong>Retry path</strong>
                <span>Failed checks stay reachable through the top action bar and each card header.</span>
              </Note>
              <Note>
                <strong>Preset logic</strong>
                <span>Switch back to a lighter preset or use custom mode if a full sweep is overkill.</span>
              </Note>
              <Note>
                <strong>Raw access</strong>
                <span>Debug output and raw results are still available below when deeper review is needed.</span>
              </Note>
            </NotesList>
          </SummaryCard>
        </SummaryGrid>

        {errorKind && (
          <>
            <NoResults kind={errorKind} address={address} error={ipLookupError} />
            <EmptyStateActions>
              <Link to="/check">
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
        <AdditionalResources url={address} />

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
