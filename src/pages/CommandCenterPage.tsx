import { useState, useMemo } from 'react';
import { Box, Button, Grid, GridItem, Heading, Stack, Text, useToast } from '@chakra-ui/react';
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

type Tab = 'pick-team' | 'sandbox';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

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
    setSandboxActions([...sandboxActions, action]);
    setSandboxSquad(() => {
      const outIdx = sourceSquad.findIndex((p) => p.id === playerOutId);
      const inPlayer = realSquad.find((p) => p.id === playerInId);
      if (outIdx === -1 || !inPlayer) return sourceSquad;
      const next = sourceSquad.slice();
      next[outIdx] = { ...inPlayer };
      return next;
    });
  };

  const handleSetCaptain = (playerId: number) => {
    const newSquad = currentSandboxSquad.map((p) => {
      if (p.id === playerId) {
        // New captain
        return { ...p, isCaptain: true, isViceCaptain: false };
      } else if (p.isCaptain) {
        // Old captain becomes vice-captain
        return { ...p, isCaptain: false, isViceCaptain: true };
      } else {
        // Everyone else loses vice-captain status
        return { ...p, isViceCaptain: false };
      }
    });
    setSandboxSquad(newSquad);
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

  const handleRunOptimization = () => {
    setActiveTab('sandbox');
    toast({
      title: 'AIrsenal optimization',
      description: 'Optimization action is ready in the UI, but no verified backend optimize endpoint is exposed in this frontend yet. You can still use the sandbox and recommendations now.',
      status: 'info',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  };

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
      name: p.name,
      position: p.position,
      points: roundedPoints,
      isCaptain: p.isCaptain,
      isViceCaptain: p.isViceCaptain,
      isBench: p.isBench,
      photoUrl: p.photoUrl,
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
    }

    const pred = predictions.lookupPrediction(p.name, p.teamAbbr);
    const displayPoints = pred?.xp ?? p.xPts ?? 0;

    return {
      name: p.name,
      position: p.position,
      points: Number(displayPoints.toFixed(2)),
      isCaptain: p.isCaptain,
      isViceCaptain: p.isViceCaptain,
      isBench: p.isBench,
      photoUrl: p.photoUrl,
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
                    onRunOptimization={handleRunOptimization}
                    onRollTransfer={handleRollTransfer}
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

              <DeltaStrip realSquad={realSquad} sandboxSquad={sandboxSquad} />

              <Grid templateColumns={{ base: '1fr', xl: 'repeat(3, minmax(0, 1fr))' }} gap={6}>
                <GridItem colSpan={{ base: 1, xl: 2 }}>
                  <Stack spacing={6}>
                    <RecommendedTransfersList
                      transfers={mockRecommendedTransfers}
                      onApplyTransfer={handleTransfer}
                    />
                    <CustomTransferBuilder onTransfer={handleTransfer} />
                    {cc.loading ? loadingCard : !hasLiveMyTeam ? (cc.error ? errorCard : emptyMyTeamCard) : <PitchCard squad={mappedSandboxSquad} />}
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
    </Stack>
  );
};

export default CommandCenterPage;
