import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { ToastContainer } from 'react-toastify';

import colors from 'client/styles/colors';
import Heading from 'client/components/Form/Heading';
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
`;

const ResultsFrame = styled.div`
  width: min(96vw, 1600px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ResultsContent = styled.section`
  width: 100%;
  margin: 0;
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
    border-radius: 8px;
  }
`;

const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(22rem, 0.85fr);
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
  gap: 0.75rem;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Metric = styled.div`
  padding: 0.85rem 0.9rem;
  border-radius: 12px;
  background: ${colors.background};
  border: 1px solid ${colors.primaryTransparent};
  strong {
    display: block;
    color: ${colors.primary};
    font-size: 1.35rem;
  }
  span {
    opacity: 0.74;
    font-size: 0.88rem;
  }
`;

const PresetBadge = styled.span`
  display: inline-flex;
  width: fit-content;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: ${colors.primaryTransparent};
  border: 1px solid ${colors.primaryTransparent};
  color: ${colors.primary};
  font-size: 0.9rem;
  font-weight: 700;
`;

const SoftText = styled.p`
  margin: 0;
  opacity: 0.8;
  line-height: 1.55;
`;

const makeSiteName = (address: string): string => {
  try {
    const withScheme = /^https?:\/\//i.test(address) ? address : `https://${address}`;
    return new URL(withScheme).hostname.replace(/^www\./, '');
  } catch {
    return address;
  }
};

const makeActionButtons = (title: string, refresh: () => void, showInfo: () => void): ReactNode => (
  <ActionButtons
    actions={[
      { label: `Info about ${title}`, onClick: showInfo, icon: 'ⓘ' },
      { label: `Re-fetch ${title} data`, onClick: refresh, icon: '↻' },
    ]}
  />
);

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

  // Shape useJobs state for the existing ProgressBar contract
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

  // Expose successful job results on window.webCheck for debugging,
  // resetting on new input so prior scans cannot accumulate
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

  // Resolve each card's data, applying picker and falling back when needed
  const renderable = activeCards.map(({ jobId, card }) => {
    const entry = jobsState[card.id];
    const raw = entry?.raw;
    let data = raw && card.pick ? card.pick(raw) : raw;
    if (!hasData(data) && card.fallback) data = card.fallback(jobsState);
    return { jobId, card, data, entry };
  });

  const cardsToShow = renderable.filter(({ data, entry }) => hasData(data) && !entry?.error);

  const findings = useMemo(() => runAnalysis(jobsState, activeCards), [activeCards, jobsState]);

  // Detect a catastrophic API outage when the bulk of settled jobs error or time out
  const apiUnreachable = useMemo(() => {
    const entries = Object.values(jobsState);
    const settled = entries.filter((e) => e?.state !== 'loading');
    const dead = settled.filter((e) => e?.state === 'error' || e?.state === 'timed-out');
    return settled.length >= entries.length / 2 && dead.length / settled.length >= 0.9;
  }, [jobsState]);

  // Pick the highest-priority error state, if any
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

  return (
    <ResultsOuter>
      <ResultsFrame>
        <Nav>
          {address && (
            <Heading color={colors.textColor} size="medium">
              {addressType === 'url' && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={/^https?:\/\//i.test(address) ? address : `https://${address}`}
                >
                  <img
                    width="32px"
                    alt=""
                    src={`https://icon.horse/icon/${makeSiteName(address)}`}
                  />
                </a>
              )}
              {makeSiteName(address)}
            </Heading>
          )}
        </Nav>
        <SummaryGrid>
          <SummaryCard>
            <PresetBadge>{presetMeta.label}</PresetBadge>
            <Heading as="h2" align="left" color={colors.primary}>
              Scan Summary
            </Heading>
            <SoftText>{presetMeta.description}</SoftText>
            <MetricGrid>
              <Metric>
                <strong>{activeJobs.length}</strong>
                <span>Web Check jobs selected</span>
              </Metric>
              <Metric>
                <strong>{cardsToShow.length}</strong>
                <span>Cards with usable data</span>
              </Metric>
              <Metric>
                <strong>{scanSettings.cyberbroPreset || 'web'}</strong>
                <span>Cyberbro profile</span>
              </Metric>
            </MetricGrid>
          </SummaryCard>
          <SummaryCard>
            <Heading as="h2" align="left" color={colors.primary}>
              What This Run Does
            </Heading>
            <SoftText>
              The selected preset decides which checks fire before any requests go out. That keeps
              lighter runs genuinely light instead of hiding unwanted cards after the fact.
            </SoftText>
            <SoftText>
              If a card still looks noisy, switch presets or use the custom builder on the home page
              to narrow the run further.
            </SoftText>
          </SummaryCard>
        </SummaryGrid>
        {errorKind && <NoResults kind={errorKind} address={address} error={ipLookupError} />}
        <ProgressBar loadStatus={loadingJobs} showModal={showErrorModal} showJobDocs={showInfo} />
        <Loader show={loadingJobs.filter((j) => j.state !== 'loading').length < 5} />
        <AdvisoryPanel findings={findings} onJumpTo={jumpToCard} />
        <ResultsContent>
          <ResultsMasonryGrid minColWidth={380} gap={20}>
            {cardsToShow.map(({ card, data }) => (
              <div id={`card-${card.id}`} key={`eb-${card.id}`}>
                <ErrorBoundary title={card.title}>
                  <card.Component
                    key={card.id}
                    data={data}
                    title={card.title}
                    actionButtons={makeActionButtons(
                      card.title,
                      () => retry(card.id),
                      () => showInfo(card.id),
                    )}
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
