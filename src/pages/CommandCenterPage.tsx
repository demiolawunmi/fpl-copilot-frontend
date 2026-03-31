import { useState, useMemo, useCallback } from 'react';
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
import { useTeamId } from '../context/TeamIdContext';
import {
  mockCommandCenterAISummary,
  mockFixturesSnapshot,
  mockRecommendedTransfers,
  mockModelSources,
  mockVideoInsights,
} from '../data/commandCenterMocks';
import type { EnhancedPlayer, SandboxAction, TeamStatus } from '../data/commandCenterMocks';

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
import { elementTypeToPosition } from '../api/fpl/fpl';

type Tab = 'pick-team' | 'sandbox';

const clampWeeksAhead = (n: number) => Math.min(38, Math.max(1, Math.round(n)));

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

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
  const [activeTab, setActiveTab] = useState<Tab>('pick-team');
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
    // This would normally apply to UI state only (not real FPL submission)
    alert('Applied to team (UI only)');
  };

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
                  {cc.loading ? loadingCard : !hasLiveMyTeam ? (cc.error ? errorCard : emptyMyTeamCard) : <PitchCard squad={mappedPickTeamSquad} />}
                  <AICommandSummary summary={mockCommandCenterAISummary} />
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
                      transfers={mockRecommendedTransfers}
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
                        onSetCaptain={(p) => handleSetCaptain(p.id)}
                        onSetViceCaptain={(p) => handleSetViceCaptain(p.id)}
                      />
                    )}
                    <SandboxCharts squad={currentSandboxSquad} />
                  </Stack>
                </GridItem>

                <GridItem colSpan={1}>
                  <Stack spacing={6}>
                    <ModelComparisonPanel models={mockModelSources} />
                    <AskCopilotChat />
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
