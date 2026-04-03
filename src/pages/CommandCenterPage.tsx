import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTeamId } from '../context/TeamIdContext';
import {
  mockCommandCenterAISummary,
  mockFixturesSnapshot,
  mockRecommendedTransfers,
  mockModelSources,
  mockVideoInsights,
} from '../data/commandCenterMocks';
import type {
  CommandCenterAISummary,
  EnhancedPlayer,
  ModelSource,
  RecommendedTransferItem,
  SandboxAction,
  TeamStatus,
} from '../data/commandCenterMocks';

// Import components
import StatusStrip from '../components/command-center/StatusStrip';
import PitchCard from '../components/gw-overview/PitchCard';
import AICommandSummary from '../components/command-center/AICommandSummary';
import InjuriesSuspensionsCard from '../components/command-center/InjuriesSuspensionsCard';
import FixturesSnapshot from '../components/command-center/FixturesSnapshot';
import QuickActions from '../components/command-center/QuickActions';
import SandboxControls from '../components/command-center/SandboxControls';
import DeltaStrip from '../components/command-center/DeltaStrip';
import RecommendedTransfersList from '../components/command-center/RecommendedTransfersList';
import CustomTransferBuilder from '../components/command-center/CustomTransferBuilder';
import ModelComparisonPanel from '../components/command-center/ModelComparisonPanel';
import SandboxCharts from '../components/command-center/SandboxCharts';
import AskCopilotChat from '../components/command-center/AskCopilotChat';
import VideoInsightsStrip from '../components/command-center/VideoInsightsStrip';
import { DashboardCard } from '../components/ui/dashboard';

// Command Center hook – targets the NEXT GW and uses /api/fpl/my-team picks
import { useCommandCenterData } from '../hooks/useCommandCenterData';
import { usePredictionsData } from '../hooks/usePredictionsData';
import type { Player as UiPlayer } from '../data/gwOverviewMocks';
import InFormCard from '../components/command-center/InFormCard';
import BandwagonsCard from '../components/command-center/BandwagonsCard';
import { getOpponentDifficulty } from '../utils/difficulty';
import { runAirsenal } from '../api/backend';
import {
  submitCopilotBlendJob,
  pollCopilotBlendJob,
  isApiError,
  type CopilotSourceWeights,
  type CopilotBlendJobStatusResponse,
  type CopilotErrorResponse,
  type CopilotHybridResultPayload,
} from '../api/backend';
import { elementTypeToPosition } from '../api/fpl/fpl';

type Tab = 'pick-team' | 'sandbox';

type BlendApplyPhase = 'idle' | 'submitting' | 'queued' | 'running' | 'completed' | 'failed';

type BlendApplyUiState = {
  phase: BlendApplyPhase;
  jobId?: string;
  message?: string;
  retryable?: boolean;
  error?: CopilotErrorResponse | null;
};

const BLEND_SCHEMA_VERSION = '1.0';
const BLEND_POLL_INTERVAL_MS = 1500;
const BLEND_POLL_TIMEOUT_MS = 90_000;
const DEFAULT_BLEND_TAB: Tab = 'pick-team';

const parseInitialTab = (rawSearch: string): Tab => {
  const tab = new URLSearchParams(rawSearch).get('tab');
  return tab === 'sandbox' || tab === 'pick-team' ? tab : DEFAULT_BLEND_TAB;
};

const parseBlendWeightsFromSearch = (rawSearch: string, sources: ModelSource[]): Map<string, number> => {
  const raw = new URLSearchParams(rawSearch).get('blend');
  if (!raw) return new Map();

  const values = raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [id, valueText] = entry.split(':').map((part) => part.trim());
      const weight = Number.parseInt(valueText ?? '', 10);
      return {
        id,
        weight,
      };
    })
    .filter((entry) => entry.id && Number.isFinite(entry.weight));

  if (values.length === 0) return new Map();

  const validIds = new Set(sources.map((source) => source.id));
  const map = new Map<string, number>();
  for (const entry of values) {
    if (!validIds.has(entry.id)) continue;
    map.set(entry.id, Math.max(0, Math.min(100, entry.weight)));
  }
  return map;
};

const clampWeeksAhead = (n: number) => Math.min(38, Math.max(1, Math.round(n)));

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const confidenceToTone = (confidence: number): 'good' | 'info' | 'warn' => {
  if (confidence >= 0.67) return 'good';
  if (confidence >= 0.4) return 'info';
  return 'warn';
};

const sleep = (ms: number) => new Promise<void>((resolve) => {
  window.setTimeout(resolve, ms);
});

const createCorrelationId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `cc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

/** FPL formation rules: exactly 1 GK, 3-5 DEF, 2-5 MID, 1-3 FWD, 11 starters total. */
function validateFormation(squad: EnhancedPlayer[]): string | null {
  const starters = squad.filter((p) => !p.isBench);
  const gk = starters.filter((p) => p.position === 'GK').length;
  const def = starters.filter((p) => p.position === 'DEF').length;
  const mid = starters.filter((p) => p.position === 'MID').length;
  const fwd = starters.filter((p) => p.position === 'FWD').length;
  if (gk !== 1) return `Must have exactly 1 starting GK (would have ${gk})`;
  if (def < 3) return `Need at least 3 starting DEF (would have ${def})`;
  if (def > 5) return `Max 5 starting DEF (would have ${def})`;
  if (mid < 2) return `Need at least 2 starting MID (would have ${mid})`;
  if (mid > 5) return `Max 5 starting MID (would have ${mid})`;
  if (fwd < 1) return `Need at least 1 starting FWD (would have ${fwd})`;
  if (fwd > 3) return `Max 3 starting FWD (would have ${fwd})`;
  if (starters.length !== 11) return `Must have 11 starters (would have ${starters.length})`;
  return null;
}

const mapUiPlayerToEnhanced = (
  p: UiPlayer,
  lookupPrediction: (name: string, teamAbbr?: string) => import('../api/backend').PredictionPlayer | undefined,
  fixturesByName: Map<string, import('../api/backend').PlayerFixture>,
): EnhancedPlayer => {
  const pred = lookupPrediction(p.name, p.teamAbbr);
  const fixture = fixturesByName.get(norm(p.name));

  return {
    id: p.id ?? 0,
    name: p.name,
    position: p.position,
    team: '',
    teamAbbr: p.teamAbbr ?? '',
    price: p.sellingPrice ? p.sellingPrice / 10 : 0,
    xPts: pred?.xp ?? 0,
    points: p.points ?? 0,
    minutesRisk: 'Unknown',
    injuryStatus: 'Available',
    isCaptain: p.isCaptain,
    isViceCaptain: p.isViceCaptain,
    isBench: p.isBench,
    photoUrl: p.photoUrl,
    opponents: fixture?.fixtures?.map((f) =>
      `${f.is_home ? 'H' : 'A'} ${f.opponent_short}`
    ) ?? p.opponents,
  };
};

const CommandCenterPage = () => {
  const { teamId } = useTeamId();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(() => parseInitialTab(location.search));
  const toast = useToast();

  // Dedicated Command Center hook – always targets next GW, uses backend picks
  const cc = useCommandCenterData(teamId);
  
  // AIrsenal predictions & fixtures hook
  const predictions = usePredictionsData(cc.nextGW > 0 ? cc.nextGW : null);

  // Bootstrap elements list for photo resolution in side-cards
  const bootstrapElements = useMemo(() => cc.bootstrap?.elements ?? [], [cc.bootstrap]);

  // State for sandbox
  const [sandboxSquad, setSandboxSquad] = useState<EnhancedPlayer[]>([]);
  const [sandboxActions, setSandboxActions] = useState<SandboxAction[]>([]);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  const [optimizationDialogOpen, setOptimizationDialogOpen] = useState(false);
  const [weeksAhead, setWeeksAhead] = useState(3);
  const [swapSelection, setSwapSelection] = useState<number | null>(null);
  const [sandboxBankDelta, setSandboxBankDelta] = useState(0);
  const [blendApplyState, setBlendApplyState] = useState<BlendApplyUiState>({ phase: 'idle' });
  const [completedBlendPayload, setCompletedBlendPayload] = useState<CopilotHybridResultPayload | null>(null);
  const [modelSources, setModelSources] = useState<ModelSource[]>(() => {
    const defaults = mockModelSources.map((source) => ({ ...source }));
    const seeded = parseBlendWeightsFromSearch(location.search, defaults);
    if (seeded.size === 0) return defaults;
    return defaults.map((source) => (
      seeded.has(source.id)
        ? { ...source, weight: seeded.get(source.id) ?? source.weight }
        : source
    ));
  });
  const activeBlendPollRunRef = useRef(0);

  const blendTotal = useMemo(
    () => modelSources.reduce((sum, source) => sum + source.weight, 0),
    [modelSources],
  );
  const blendRemaining = 100 - blendTotal;
  const isBlendInvalid = blendTotal > 100;

  const blendStatusMessage = useMemo(() => {
    if (blendApplyState.phase === 'completed' && completedBlendPayload) {
      const transferCount = completedBlendPayload.recommended_transfers.length;
      const confidencePct = Math.round(completedBlendPayload.core.confidence * 100);
      const degradedSuffix = completedBlendPayload.degraded_mode.is_degraded
        ? ` (${completedBlendPayload.degraded_mode.code ?? 'FALLBACK'})`
        : '';
      return `Blend ready: ${transferCount} transfer suggestion(s), ${confidencePct}% confidence${degradedSuffix}.`;
    }

    if (blendApplyState.phase === 'failed' && blendApplyState.error?.error.code) {
      return `${blendApplyState.message ?? 'Blend job failed.'} [${blendApplyState.error.error.code}]`;
    }

    return blendApplyState.message;
  }, [blendApplyState, completedBlendPayload]);

  const realSquad = useMemo(() => {
    if (cc.loading || cc.error != null || cc.squad.length === 0 || predictions.loading) {
      return [] as EnhancedPlayer[];
    }

    return cc.squad.map((p) =>
      mapUiPlayerToEnhanced(
        p as UiPlayer,
        predictions.lookupPrediction,
        predictions.fixturesByName,
      ),
    );
  }, [cc.loading, cc.error, cc.squad, predictions.loading, predictions.lookupPrediction, predictions.fixturesByName]);

  const currentSandboxSquad = sandboxActions.length > 0 ? sandboxSquad : realSquad;
  const hasLiveMyTeam = cc.myTeam != null && realSquad.length > 0;

  const teamStatus: TeamStatus = useMemo(() => {
    const mt = cc.myTeam;
    if (!mt) {
      return {
        freeTransfers: 0,
        bank: 0,
        teamValue: Number(realSquad.reduce((sum, player) => sum + (player.price || 0), 0).toFixed(1)),
        chips: {
          wildcard: { available: false },
          freehit: { available: false },
          bboost: { available: false },
          tcaptain: { available: false },
        },
        deadline: cc.bootstrap?.events.find((e) => e.is_next)?.deadline_time ?? new Date().toISOString(),
      };
    }

    const chipMap: Record<string, keyof TeamStatus['chips']> = {
      wildcard: 'wildcard',
      freehit: 'freehit',
      bboost: 'bboost',
      '3xc': 'tcaptain',
    };

    const chips: TeamStatus['chips'] = {
      wildcard: { available: false },
      freehit: { available: false },
      bboost: { available: false },
      tcaptain: { available: false },
    };

    for (const c of mt.chips) {
      const key = chipMap[c.name];
      if (!key) continue;
      const isAvailable = c.status_for_entry === 'available' && !c.is_pending;
      const usedGW = c.played_by_entry.length > 0 ? `GW ${c.played_by_entry[0]}` : undefined;
      chips[key] = { available: isAvailable, used: usedGW };
    }

    const nextEvent = cc.bootstrap?.events.find((e) => e.is_next);
    const deadline = nextEvent?.deadline_time ?? new Date().toISOString();

    const transferLimit = Number(mt.transfers.limit ?? 0);
    const transfersMade = Number(mt.transfers.made ?? 0);
    const bankTenths = Number(mt.transfers.bank ?? 0);
    const backendValueTenths = Number(mt.transfers.value ?? 0);
    const derivedSquadValue = realSquad.reduce((sum, player) => sum + (player.price || 0), 0);

    return {
      freeTransfers: Math.max(0, transferLimit - transfersMade),
      bank: Number((bankTenths / 10).toFixed(1)),
      teamValue: Number(((backendValueTenths > 0 ? backendValueTenths / 10 : derivedSquadValue)).toFixed(1)),
      chips,
      deadline,
    };
  }, [cc.myTeam, cc.bootstrap, realSquad]);

  const nextGW = cc.nextGW;
  const teamName = cc.gwInfo?.teamName ?? 'My Team';

  const hybridSummary = useMemo<CommandCenterAISummary>(() => {
    if (!completedBlendPayload) {
      return mockCommandCenterAISummary;
    }

    const ask = completedBlendPayload.ask_copilot;
    const bulletTone = confidenceToTone(ask.confidence);
    const rationaleText = ask.rationale.filter((item) => item.trim().length > 0);

    const bullets = [
      {
        text: ask.answer,
        why: rationaleText.join(' ') || completedBlendPayload.core.summary,
        tone: bulletTone,
      },
      ...rationaleText.slice(0, 4).map((item) => ({
        text: item,
        why: completedBlendPayload.core.summary,
        tone: bulletTone,
      })),
    ];

    return {
      title: `AI Summary (GW ${nextGW || mockCommandCenterAISummary.gameweek})`,
      gameweek: nextGW || mockCommandCenterAISummary.gameweek,
      bullets: bullets.length > 0 ? bullets : mockCommandCenterAISummary.bullets,
    };
  }, [completedBlendPayload, nextGW]);

  const hybridRecommendedTransfers = useMemo<RecommendedTransferItem[]>(() => {
    if (!completedBlendPayload) {
      return mockRecommendedTransfers;
    }

    const teamById = new Map((cc.bootstrap?.teams ?? []).map((team) => [team.id, team]));

    const resolveFromCurrentData = (playerId: number, playerName: string): EnhancedPlayer => {
      const fromSquad = currentSandboxSquad.find((player) => player.id === playerId)
        ?? realSquad.find((player) => player.id === playerId)
        ?? currentSandboxSquad.find((player) => norm(player.name) === norm(playerName))
        ?? realSquad.find((player) => norm(player.name) === norm(playerName));

      if (fromSquad) {
        return {
          ...fromSquad,
          id: playerId,
          name: playerName,
        };
      }

      const fromBootstrap = (cc.bootstrap?.elements ?? []).find((element) => element.id === playerId)
        ?? (cc.bootstrap?.elements ?? []).find((element) => norm(element.web_name) === norm(playerName));

      const bootstrapTeam = fromBootstrap ? teamById.get(fromBootstrap.team) : undefined;
      const resolvedName = fromBootstrap?.web_name ?? playerName;
      const teamAbbr = bootstrapTeam?.short_name ?? '';
      const predictedXp = predictions.lookupPrediction(resolvedName, teamAbbr)?.xp ?? 0;

      return {
        id: playerId,
        name: resolvedName,
        position: fromBootstrap ? elementTypeToPosition(fromBootstrap.element_type) : 'MID',
        team: bootstrapTeam?.name ?? '',
        teamAbbr,
        price: fromBootstrap ? Number(((fromBootstrap.now_cost ?? 0) / 10).toFixed(1)) : 0,
        xPts: predictedXp,
        points: 0,
        minutesRisk: 'Unknown',
        injuryStatus: 'Available',
        opponents: [],
      };
    };

    return completedBlendPayload.recommended_transfers.map((transfer) => ({
      playerIn: resolveFromCurrentData(transfer.in.player_id, transfer.in.player_name),
      playerOut: resolveFromCurrentData(transfer.out.player_id, transfer.out.player_name),
      xPtsDelta: transfer.projected_points_delta,
      why: transfer.reason,
    }));
  }, [cc.bootstrap, completedBlendPayload, currentSandboxSquad, predictions, realSquad]);

  // Sandbox handlers
  const handleUndo = () => {
    if (sandboxActions.length === 0) return;
    const newActions = [...sandboxActions];
    newActions.pop();
    setSandboxActions(newActions);
    // Recompute squad from actions
    // TODO: implement proper undo logic
  };

  const handleReset = () => {
    setSandboxSquad(realSquad.map((player) => ({ ...player })));
    setSandboxActions([]);
    setSandboxBankDelta(0);
  };

  const handleApplyToTeam = () => {
    alert('Applied to team (UI only)');
  };

  const getBlendFailureState = useCallback((params: {
    message: string;
    retryable?: boolean;
    error?: CopilotErrorResponse | null;
    jobId?: string;
  }): BlendApplyUiState => ({
    phase: 'failed',
    message: params.message,
    retryable: params.retryable ?? true,
    error: params.error ?? null,
    jobId: params.jobId,
  }), []);

  const handleModelWeightChange = useCallback((modelId: string, nextWeight: number) => {
    const boundedWeight = Math.max(0, Math.min(100, Math.round(nextWeight)));
    setModelSources((prev) => prev.map((source) => (
      source.id === modelId ? { ...source, weight: boundedWeight } : source
    )));
  }, []);

  const applyModelBlend = useCallback(async () => {
    if (isBlendInvalid) {
      setBlendApplyState(getBlendFailureState({
        message: 'Blend total exceeds 100%. Reduce source weights before applying.',
        retryable: false,
      }));
      return;
    }

    const sourceWeights: Record<string, number> = {};
    for (const source of modelSources) {
      if (!source.backendField) continue;
      sourceWeights[source.backendField] = source.weight / 100;
    }

    const runId = Date.now();
    activeBlendPollRunRef.current = runId;
    const isCurrentRun = () => activeBlendPollRunRef.current === runId;

    setCompletedBlendPayload(null);
    setBlendApplyState({ phase: 'submitting', message: 'Submitting blend request...' });

    try {
      const correlationId = createCorrelationId();
      const accepted = await submitCopilotBlendJob({
        schema_version: BLEND_SCHEMA_VERSION,
        correlation_id: correlationId,
        source_weights: sourceWeights as unknown as CopilotSourceWeights,
        task: 'hybrid',
        force_refresh: true,
      });

      if (!isCurrentRun()) {
        return;
      }

      setBlendApplyState({
        phase: 'queued',
        jobId: accepted.job_id,
        message: 'Blend job queued...',
      });

      const startedAt = Date.now();
      let latestStatus: CopilotBlendJobStatusResponse | null = null;

      while (isCurrentRun()) {
        latestStatus = await pollCopilotBlendJob(accepted.job_id);
        if (!isCurrentRun()) {
          return;
        }

        if (latestStatus.status === 'queued') {
          setBlendApplyState({
            phase: 'queued',
            jobId: accepted.job_id,
            message: 'Blend job queued...',
          });
        }

        if (latestStatus.status === 'running') {
          setBlendApplyState({
            phase: 'running',
            jobId: accepted.job_id,
            message: 'Generating hybrid model output...',
          });
        }

        if (latestStatus.status === 'completed') {
          const resultPayload = latestStatus.result;
          if (!resultPayload) {
            setBlendApplyState(getBlendFailureState({
              message: 'Blend job completed without result payload.',
              retryable: true,
              jobId: accepted.job_id,
            }));
            return;
          }

          setCompletedBlendPayload(resultPayload);
          setBlendApplyState({
            phase: 'completed',
            jobId: accepted.job_id,
            message: resultPayload.degraded_mode.is_degraded
              ? 'Blend applied with degraded fallback output.'
              : 'Blend applied successfully.',
          });
          return;
        }

        if (latestStatus.status === 'failed') {
          const backendError = latestStatus.error;
          const message = backendError?.error.message ?? 'Blend job failed on backend.';
          setBlendApplyState(getBlendFailureState({
            message,
            retryable: backendError?.error.retryable ?? true,
            error: backendError,
            jobId: accepted.job_id,
          }));
          return;
        }

        if (Date.now() - startedAt > BLEND_POLL_TIMEOUT_MS) {
          setBlendApplyState(getBlendFailureState({
            message: 'Blend job timed out while polling. Retry to continue.',
            retryable: true,
            jobId: accepted.job_id,
          }));
          return;
        }

        await sleep(BLEND_POLL_INTERVAL_MS);
      }
    } catch (error) {
      if (!isCurrentRun()) {
        return;
      }

      if (isApiError(error)) {
        setBlendApplyState(getBlendFailureState({
          message: error.message,
          retryable: error.status === 0 || error.status >= 500,
        }));
        return;
      }

      setBlendApplyState(getBlendFailureState({
        message: error instanceof Error ? error.message : 'Blend apply failed unexpectedly.',
        retryable: true,
      }));
    }
  }, [getBlendFailureState, isBlendInvalid, modelSources]);

  useEffect(() => () => {
    activeBlendPollRunRef.current = 0;
  }, []);

  const handleTransfer = (playerInId: number, playerOutId: number) => {
    const sourceSquad = currentSandboxSquad;
    const action: SandboxAction = {
      type: 'transfer',
      payload: { playerInId, playerOutId },
      timestamp: new Date(),
    };

    let inPlayer: EnhancedPlayer | undefined = realSquad.find((p) => p.id === playerInId);

    if (!inPlayer) {
      const el = bootstrapElements.find((e) => e.id === playerInId);
      if (el) {
        const team = cc.bootstrap?.teams.find((t) => t.id === el.team);
        const pred = predictions.lookupPrediction(el.web_name, team?.short_name);
        const fixture = predictions.fixturesByName.get(norm(el.web_name));
        inPlayer = {
          id: el.id,
          name: el.web_name,
          position: elementTypeToPosition(el.element_type),
          team: team?.name ?? '',
          teamAbbr: team?.short_name ?? '',
          price: el.now_cost ? el.now_cost / 10 : 0,
          xPts: pred?.xp ?? 0,
          points: 0,
          minutesRisk: 'Unknown',
          injuryStatus: 'Available',
          photoUrl: `https://resources.premierleague.com/premierleague25/photos/players/110x140/${el.code}.png`,
          opponents: fixture?.fixtures?.map((f) => `${f.is_home ? 'H' : 'A'} ${f.opponent_short}`) ?? [],
        };
      }
    }

    if (!inPlayer) return;

    const outPlayer = sourceSquad.find((p) => p.id === playerOutId);
    const outPrice = outPlayer?.price ?? 0;
    const inPrice = inPlayer.price ?? 0;
    const priceDelta = outPrice - inPrice;

    const newActions = [...sandboxActions, action];
    const transfersMade = newActions.filter((a) => a.type === 'transfer').length;
    const freeTransfers = teamStatus.freeTransfers;
    const newBank = teamStatus.bank + sandboxBankDelta + priceDelta;

    if (newBank < 0) {
      toast({
        title: 'Insufficient funds',
        description: `This transfer would leave you with £${newBank.toFixed(1)}m. You need more bank.`,
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setSandboxBankDelta((prev) => Number((prev + priceDelta).toFixed(1)));
    setSandboxActions(newActions);
    setSandboxSquad(() => {
      const outIdx = sourceSquad.findIndex((p) => p.id === playerOutId);
      if (outIdx === -1) return sourceSquad;
      const out = sourceSquad[outIdx];
      const next = sourceSquad.slice();
      next[outIdx] = { ...inPlayer, isBench: out.isBench, isCaptain: false, isViceCaptain: false };
      return next;
    });

    const hitMsg = transfersMade > freeTransfers
      ? ` (−${(transfersMade - freeTransfers) * 4} pts hit)`
      : '';

    toast({
      title: 'Transfer applied',
      description: `${outPlayer?.name ?? 'Player'} out → ${inPlayer.name} in${hitMsg}`,
      status: transfersMade > freeTransfers ? 'warning' : 'success',
      duration: 4000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handleSetCaptain = (playerId: number) => {
    const newSquad = currentSandboxSquad.map((p) => {
      if (p.id === playerId) {
        return { ...p, isCaptain: true, isViceCaptain: false };
      } else if (p.isCaptain) {
        return { ...p, isCaptain: false, isViceCaptain: true };
      } else {
        return { ...p, isViceCaptain: false };
      }
    });
    setSandboxSquad(newSquad);
    setSandboxActions((prev) => [...prev, { type: 'captain', payload: { playerId }, timestamp: new Date() }]);
  };

  const handleSetViceCaptain = (playerId: number) => {
    const player = currentSandboxSquad.find((p) => p.id === playerId);
    if (!player || player.isBench) return;
    if (player.isCaptain) {
      toast({ title: 'Cannot assign', description: 'The captain cannot also be vice-captain.', status: 'info', duration: 3000, isClosable: true, position: 'top-right' });
      return;
    }
    const newSquad = currentSandboxSquad.map((p) => {
      if (p.id === playerId) return { ...p, isViceCaptain: true, isCaptain: false };
      return { ...p, isViceCaptain: false };
    });
    setSandboxSquad(newSquad);
    setSandboxActions((prev) => [...prev, { type: 'vice_captain', payload: { playerId }, timestamp: new Date() }]);
  };

  const handleAutoCaptain = () => {
    const starters = currentSandboxSquad.filter((p) => !p.isBench);
    if (starters.length === 0) return;
    const best = starters.reduce((a, b) => (a.xPts > b.xPts ? a : b));
    handleSetCaptain(best.id);
  };

  const handleAutoBench = () => {
    // Simple heuristic: sort by xPts, put lowest on bench
    // TODO: implement proper bench logic
    alert('Auto-bench feature coming soon');
  };

  const handleRollTransfer = () => {
    setActiveTab('sandbox');
  };

  const handleSandboxPlayerClick = useCallback(
    (player: import('../data/gwOverviewMocks').Player) => {
      const clickedId = player.id;
      if (clickedId == null) return;

      if (swapSelection == null) {
        setSwapSelection(clickedId);
        return;
      }

      if (swapSelection === clickedId) {
        setSwapSelection(null);
        return;
      }

      const squad = [...currentSandboxSquad];
      const idxA = squad.findIndex((p) => p.id === swapSelection);
      const idxB = squad.findIndex((p) => p.id === clickedId);
      if (idxA === -1 || idxB === -1) {
        setSwapSelection(null);
        return;
      }

      const a = { ...squad[idxA] };
      const b = { ...squad[idxB] };

      if (a.isBench === b.isBench) {
        toast({
          title: 'Invalid swap',
          description: 'Select one starter and one bench player to swap.',
          status: 'info',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
        setSwapSelection(null);
        return;
      }

      // Simulate the swap and validate the resulting formation
      const tmpBench = a.isBench;
      a.isBench = b.isBench;
      b.isBench = tmpBench;
      if (a.isBench) { a.isCaptain = false; a.isViceCaptain = false; }
      if (b.isBench) { b.isCaptain = false; b.isViceCaptain = false; }

      const simulated = squad.slice();
      simulated[idxA] = a;
      simulated[idxB] = b;

      const err = validateFormation(simulated);
      if (err) {
        toast({
          title: 'Invalid formation',
          description: err,
          status: 'warning',
          duration: 4000,
          isClosable: true,
          position: 'top-right',
        });
        setSwapSelection(null);
        return;
      }

      setSandboxSquad(simulated);
      setSandboxActions((prev) => [
        ...prev,
        { type: 'bench_order', payload: { playerA: swapSelection, playerB: clickedId }, timestamp: new Date() },
      ]);
      setSwapSelection(null);
    },
    [swapSelection, currentSandboxSquad, toast],
  );

  const handleOpenOptimizationDialog = useCallback(() => {
    setWeeksAhead(3);
    setOptimizationDialogOpen(true);
  }, []);

  const handleConfirmOptimization = useCallback(async () => {
    const idStr = teamId?.trim();
    const fplTeamId = idStr ? Number.parseInt(idStr, 10) : Number.NaN;
    if (idStr == null || idStr === "" || !Number.isFinite(fplTeamId) || fplTeamId <= 0) {
      toast({
        title: 'FPL team ID required',
        description: 'Set your team ID in the app (navbar) so the optimizer knows which squad to run for.',
        status: 'warning',
        duration: 6000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    const w = clampWeeksAhead(weeksAhead);
    setOptimizationLoading(true);
    try {
      const res = await runAirsenal({
        action: 'optimize',
        fpl_team_id: fplTeamId,
        gameweek: 'auto',
        weeks_ahead: w,
      });
      setOptimizationDialogOpen(false);
      toast({
        title: 'AIrsenal optimization finished',
        description: res.ok
          ? `Action “${res.action}” completed (${res.steps?.length ?? 0} step(s)).`
          : `Completed with ok: false for “${res.action}”.`,
        status: res.ok ? 'success' : 'warning',
        duration: 8000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Request failed';
      toast({
        title: 'AIrsenal optimization failed',
        description: message,
        status: 'error',
        duration: 12000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setOptimizationLoading(false);
    }
  }, [teamId, toast, weeksAhead]);

  const mappedPickTeamSquad = currentSandboxSquad.map((p) => {
    const fixture = predictions.fixturesByName.get(norm(p.name));
    const firstFixture = fixture?.fixtures?.[0];

    let chipLabel: string | undefined;
    let chipDifficulty: number | undefined;

    if (firstFixture) {
      chipDifficulty = getOpponentDifficulty(firstFixture.opponent_short, firstFixture.difficulty);
      chipLabel = `${firstFixture.is_home ? 'H' : 'A'} ${firstFixture.opponent_short}`;
    } else if (p.opponents && p.opponents.length > 0) {
      chipLabel = p.opponents.join(', ');
      const firstOpponent = p.opponents[0] ?? '';
      const opponentShort = firstOpponent.replace(/^H\s+|^A\s+/i, '').trim();
      if (opponentShort) {
        chipDifficulty = getOpponentDifficulty(opponentShort);
      }
    } else {
      chipLabel = p.teamAbbr || undefined;
    }

    const pred = predictions.lookupPrediction(p.name, p.teamAbbr);
    const displayPoints = pred?.xp ?? p.xPts ?? 0;
    const roundedPoints = Number(displayPoints.toFixed(2));

    return {
      id: p.id,
      name: p.name,
      position: p.position,
      points: roundedPoints,
      isCaptain: p.isCaptain,
      isViceCaptain: p.isViceCaptain,
      isBench: p.isBench,
      photoUrl: p.photoUrl,
      teamAbbr: p.teamAbbr,
      chipLabel,
      chipDifficulty,
    };
  });

  const mappedSandboxSquad = currentSandboxSquad.map((p) => {
    const fixture = predictions.fixturesByName.get(norm(p.name));
    const firstFixture = fixture?.fixtures?.[0];

    let chipLabel: string | undefined;
    let chipDifficulty: number | undefined;

    if (firstFixture) {
      chipDifficulty = getOpponentDifficulty(firstFixture.opponent_short, firstFixture.difficulty);
      chipLabel = `${firstFixture.is_home ? 'H' : 'A'} ${firstFixture.opponent_short}`;
    } else if (p.opponents && p.opponents.length > 0) {
      chipLabel = p.opponents.join(', ');
      const opponentShort = (p.opponents[0] ?? '').replace(/^[HA]\s+/i, '').trim();
      if (opponentShort) chipDifficulty = getOpponentDifficulty(opponentShort);
    } else {
      chipLabel = p.teamAbbr || undefined;
    }

    const pred = predictions.lookupPrediction(p.name, p.teamAbbr);
    const displayPoints = pred?.xp ?? p.xPts ?? 0;

    return {
      id: p.id,
      name: p.name,
      position: p.position,
      points: Number(displayPoints.toFixed(2)),
      isCaptain: p.isCaptain,
      isViceCaptain: p.isViceCaptain,
      isBench: p.isBench,
      photoUrl: p.photoUrl,
      teamAbbr: p.teamAbbr,
      chipLabel,
      chipDifficulty,
    };
  });

  const loadingCard = (
    <DashboardCard p={6}>
      <Text textAlign="center" color="slate.400">Loading squad...</Text>
    </DashboardCard>
  );

  const errorCard = (
    <DashboardCard p={6} bg="rgba(127, 29, 29, 0.18)" borderColor="rgba(248, 113, 113, 0.22)">
      <Text textAlign="center" color="red.300">{cc.error}</Text>
    </DashboardCard>
  );

  const emptyMyTeamCard = (
    <DashboardCard p={6}>
      <Stack spacing={2} align="center">
        <Text textAlign="center" color="slate.300" fontWeight="semibold">No backend my_team.json squad loaded</Text>
        <Text textAlign="center" color="slate.500" fontSize="sm">
          Command Center is waiting for `/api/files/my_team` so it can render your real draft, bank, transfers, and chips.
        </Text>
      </Stack>
    </DashboardCard>
  );

  return (
    <Stack flex="1" spacing={6} px={{ base: 4, md: 6, xl: 10 }} py={{ base: 6, xl: 8 }}>
      <Stack spacing={2}>
        <Heading size="lg">Command Center</Heading>
        <Text fontSize="sm" color="slate.400">
          Gameweek {nextGW || '…'} • Team: {teamName} • ID: {teamId}
        </Text>
      </Stack>

      <StatusStrip status={teamStatus} />

      <DashboardCard overflow="hidden">
        <Box borderBottomWidth="1px" borderColor="whiteAlpha.100" display="flex">
          {(['pick-team', 'sandbox'] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              flex="1"
              borderRadius="0"
              variant="ghost"
              py={3}
              px={4}
              fontSize="sm"
              fontWeight="semibold"
              textTransform="capitalize"
              color={activeTab === tab ? 'brand.400' : 'slate.400'}
              borderBottomWidth="2px"
              borderBottomColor={activeTab === tab ? 'brand.400' : 'transparent'}
              _hover={{ color: 'white', bg: 'transparent' }}
            >
              {tab === 'pick-team' ? `Pick Team (GW ${nextGW || '…'})` : 'AI Sandbox'}
            </Button>
          ))}
        </Box>

        <Box p={{ base: 4, md: 6 }}>
          {activeTab === 'pick-team' ? (
            <Grid templateColumns={{ base: '1fr', xl: 'repeat(3, minmax(0, 1fr))' }} gap={6}>
              <GridItem colSpan={{ base: 1, xl: 2 }}>
                <Stack spacing={6}>
                  {cc.loading ? loadingCard : !hasLiveMyTeam ? (cc.error ? errorCard : emptyMyTeamCard) : (
                    <PitchCard
                      squad={mappedPickTeamSquad}
                      onPlayerClick={(player) => {
                        const id = player?.id;
                        if (id == null || typeof id !== 'number' || Number.isNaN(id) || id <= 0) return;
                        navigate(`/players/${id}`, { state: { from: location.pathname } });
                      }}
                    />
                  )}
                  <AICommandSummary summary={hybridSummary} />
                </Stack>
              </GridItem>

              <GridItem colSpan={1}>
                <Stack spacing={6}>
                  <QuickActions
                    onAutoCaptain={handleAutoCaptain}
                    onAutoBench={handleAutoBench}
                    onOpenOptimization={handleOpenOptimizationDialog}
                    onRollTransfer={handleRollTransfer}
                    isOptimizationLoading={optimizationLoading}
                  />
                  <InFormCard bootstrapElements={bootstrapElements} />
                  <BandwagonsCard bootstrapElements={bootstrapElements} />
                  <InjuriesSuspensionsCard />
                  <FixturesSnapshot fixtures={mockFixturesSnapshot} />
                </Stack>
              </GridItem>
            </Grid>
          ) : (
            <Stack spacing={6}>
              <SandboxControls
                sandboxMode={sandboxMode}
                onToggleSandboxMode={() => setSandboxMode(!sandboxMode)}
                onUndo={handleUndo}
                onReset={handleReset}
                onApply={handleApplyToTeam}
                canUndo={sandboxActions.length > 0}
              />

              <DeltaStrip
                realSquad={realSquad}
                sandboxSquad={currentSandboxSquad}
                bank={teamStatus.bank}
                bankDelta={sandboxBankDelta}
                freeTransfers={teamStatus.freeTransfers}
                sandboxTransfersMade={sandboxActions.filter((a) => a.type === 'transfer').length}
              />

              <Grid templateColumns={{ base: '1fr', xl: 'repeat(3, minmax(0, 1fr))' }} gap={6}>
                <GridItem colSpan={{ base: 1, xl: 2 }}>
                  <Stack spacing={6}>
                    <RecommendedTransfersList
                      transfers={hybridRecommendedTransfers}
                      onApplyTransfer={handleTransfer}
                    />
                    <CustomTransferBuilder
                      squad={currentSandboxSquad}
                      bootstrapElements={bootstrapElements}
                      bootstrapTeams={cc.bootstrap?.teams ?? []}
                      lookupPrediction={predictions.lookupPrediction}
                      fixturesByName={predictions.fixturesByName}
                      onTransfer={handleTransfer}
                    />
                    {cc.loading ? loadingCard : !hasLiveMyTeam ? (cc.error ? errorCard : emptyMyTeamCard) : (
                      <PitchCard
                        squad={mappedSandboxSquad}
                        onPlayerClick={handleSandboxPlayerClick}
                        selectedPlayerId={swapSelection}
                        swapHint="Tap another player to swap (bench ↔ starting XI)"
                        onSetCaptain={(p) => {
                          if (p.id == null) return;
                          handleSetCaptain(p.id);
                        }}
                        onSetViceCaptain={(p) => {
                          if (p.id == null) return;
                          handleSetViceCaptain(p.id);
                        }}
                      />
                    )}
                    <SandboxCharts squad={currentSandboxSquad} />
                  </Stack>
                </GridItem>

                <GridItem colSpan={1}>
                  <Stack spacing={6}>
                    <ModelComparisonPanel
                      models={modelSources}
                      blendTotal={blendTotal}
                      blendRemaining={blendRemaining}
                      isBlendInvalid={isBlendInvalid}
                      onModelWeightChange={handleModelWeightChange}
                      applyStatus={blendApplyState.phase}
                      statusMessage={blendStatusMessage}
                      canRetry={blendApplyState.retryable}
                      onApply={() => {
                        void applyModelBlend();
                      }}
                    />
                    <AskCopilotChat hybridPayload={completedBlendPayload} />
                  </Stack>
                </GridItem>
              </Grid>
            </Stack>
          )}
        </Box>
      </DashboardCard>

      <VideoInsightsStrip videos={mockVideoInsights} />

      <Modal
        isOpen={optimizationDialogOpen}
        onClose={() => {
          if (!optimizationLoading) setOptimizationDialogOpen(false);
        }}
        isCentered
        closeOnOverlayClick={!optimizationLoading}
        closeOnEsc={!optimizationLoading}
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="slate.900" borderWidth="1px" borderColor="whiteAlpha.200" mx={4}>
          <ModalHeader color="white" fontSize="md" pr={10}>
            Run AIrsenal optimization
          </ModalHeader>
          <ModalCloseButton isDisabled={optimizationLoading} color="slate.400" />
          <ModalBody pb={2}>
            <FormControl>
              <FormLabel color="slate.300" fontSize="sm">
                Weeks ahead
              </FormLabel>
              <NumberInput
                min={1}
                max={38}
                value={weeksAhead}
                onChange={(_, valueAsNumber) => {
                  if (Number.isNaN(valueAsNumber)) return;
                  setWeeksAhead(clampWeeksAhead(valueAsNumber));
                }}
                clampValueOnBlur
                isDisabled={optimizationLoading}
                size="sm"
                maxW="140px"
              >
                <NumberInputField
                  bg="whiteAlpha.50"
                  borderColor="whiteAlpha.200"
                  color="white"
                  rounded="md"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper borderColor="whiteAlpha.200" color="slate.300" />
                  <NumberDecrementStepper borderColor="whiteAlpha.200" color="slate.300" />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText color="slate.500" fontSize="xs">
                Planning horizon for the run (1–38). Default is 3.
              </FormHelperText>
            </FormControl>
          </ModalBody>
          <ModalFooter gap={2} pt={2}>
            <Button
              variant="ghost"
              color="slate.400"
              size="sm"
              onClick={() => setOptimizationDialogOpen(false)}
              isDisabled={optimizationLoading}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => void handleConfirmOptimization()}
              isLoading={optimizationLoading}
              loadingText="Running…"
            >
              Run optimization
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

export default CommandCenterPage;
