import { useState, useEffect, useMemo } from 'react';
import { useTeamId } from '../context/TeamIdContext';
import {
  mockTeamStatus,
  mockCommandCenterAISummary,
  mockInjuriesSuspensions,
  mockFixturesSnapshot,
  mockRecommendedTransfers,
  mockModelSources,
  mockVideoInsights,
  mockEnhancedSquad,
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

// Command Center hook – targets the NEXT GW and uses /api/fpl/my-team picks
import { useCommandCenterData } from '../hooks/useCommandCenterData';
import { usePredictionsData } from '../hooks/usePredictionsData';
import type { Player as UiPlayer } from '../data/gwOverviewMocks';
import InFormCard from '../components/command-center/InFormCard';
import BandwagonsCard from '../components/command-center/BandwagonsCard';
import { getOpponentDifficulty } from '../utils/difficulty';

type Tab = 'pick-team' | 'sandbox';

const mapUiPlayerToEnhanced = (p: UiPlayer, predMap: Map<number, any>, fixtureMap: Map<number, any>): EnhancedPlayer => {
  const pred = p.id ? predMap.get(p.id) : undefined;
  const fixture = p.id ? fixtureMap.get(p.id) : undefined;
  
  return {
    id: p.id ?? 0,
    name: p.name,
    position: p.position,
    team: '',
    teamAbbr: p.teamAbbr ?? '',
    price: p.sellingPrice ? p.sellingPrice / 10 : 0,
    xPts: pred?.xp ?? p.points ?? 0,
    points: p.points ?? 0,
    minutesRisk: 'Unknown',
    injuryStatus: 'Available',
    isCaptain: p.isCaptain,
    isViceCaptain: p.isViceCaptain,
    isBench: p.isBench,
    photoUrl: p.photoUrl,
    opponents: fixture?.fixtures?.map((f: any) => 
      `${f.is_home ? 'H' : 'A'} ${f.opponent_short}`
    ) ?? p.opponents,
  };
};

const CommandCenterPage = () => {
  const { teamId } = useTeamId();
  const [activeTab, setActiveTab] = useState<Tab>('pick-team');

  // Dedicated Command Center hook – always targets next GW, uses backend picks
  const cc = useCommandCenterData(teamId);
  
  // AIrsenal predictions & fixtures hook
  const predictions = usePredictionsData(cc.nextGW || 27);

  // State for sandbox
  const [realSquad, setRealSquad] = useState<EnhancedPlayer[]>(mockEnhancedSquad);
  const [sandboxSquad, setSandboxSquad] = useState<EnhancedPlayer[]>(mockEnhancedSquad);
  const [sandboxActions, setSandboxActions] = useState<SandboxAction[]>([]);
  const [sandboxMode, setSandboxMode] = useState(false);

  // When backend squad arrives, replace mock data
  useEffect(() => {
    if (!cc.loading && cc.error == null && cc.squad.length > 0 && !predictions.loading) {
      const enhanced = cc.squad.map((p) => 
        mapUiPlayerToEnhanced(p as UiPlayer, predictions.predictions, predictions.fixturesByPlayer)
      );
      setRealSquad(enhanced);
      setSandboxSquad(enhanced.map((e) => ({ ...e })));
    }
  }, [cc.loading, cc.error, cc.squad, predictions.loading, predictions.predictions, predictions.fixturesByPlayer]);

  const teamStatus: TeamStatus = useMemo(() => {
    const mt = cc.myTeam;
    if (!mt) return mockTeamStatus;

    // Map chip names from backend ("3xc" → "tcaptain") and build chip status
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

    // Next event deadline
    const nextEvent = cc.bootstrap?.events.find((e) => e.is_next);
    const deadline = nextEvent?.deadline_time ?? mockTeamStatus.deadline;

    // Free transfers = limit - made (minimum 0)
    const freeTransfers = Math.max(0, mt.transfers.limit - mt.transfers.made);

    return {
      freeTransfers,
      bank: mt.transfers.bank / 10,       // tenths → millions
      teamValue: mt.transfers.value / 10,  // tenths → millions
      chips,
      deadline,
    };
  }, [cc.myTeam, cc.bootstrap]);

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
    setSandboxSquad([...realSquad]);
    setSandboxActions([]);
  };

  const handleApplyToTeam = () => {
    // This would normally apply to UI state only (not real FPL submission)
    alert('Applied to team (UI only)');
  };

  const handleTransfer = (playerInId: number, playerOutId: number) => {
    // Implement transfer logic
    const action: SandboxAction = {
      type: 'transfer',
      payload: { playerInId, playerOutId },
      timestamp: new Date(),
    };
    setSandboxActions([...sandboxActions, action]);
    // Update sandboxSquad: replace playerOut with playerIn if present in realSquad
    setSandboxSquad((prev) => {
      const outIdx = prev.findIndex((p) => p.id === playerOutId);
      const inPlayer = realSquad.find((p) => p.id === playerInId);
      if (outIdx === -1 || !inPlayer) return prev;
      const next = prev.slice();
      next[outIdx] = { ...inPlayer };
      return next;
    });
  };

  const handleSetCaptain = (playerId: number) => {
    const newSquad = sandboxSquad.map((p) => {
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
    // Find player with highest xPts
    const starters = sandboxSquad.filter((p) => !p.isBench);
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

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 flex-1">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Command Center</h1>
        <p className="text-sm text-slate-400">
          Gameweek {nextGW || '…'} • Team: {teamName} • ID: {teamId}
        </p>
      </div>

      {/* Status Strip */}
      <StatusStrip status={teamStatus} />

      {/* Tabs */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="flex border-b border-slate-800">
          {(['pick-team', 'sandbox'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 text-sm font-semibold capitalize transition cursor-pointer
                ${
                  activeTab === tab
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-white'
                }`}
            >
              {tab === 'pick-team' ? `Pick Team (GW ${nextGW || '…'})` : 'AI Sandbox'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'pick-team' ? (
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
              {/* Left column - Pitch */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {cc.loading ? (
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-center text-slate-400">Loading squad...</div>
                ) : cc.error ? (
                  <div className="rounded-2xl bg-rose-900/10 border border-rose-800 p-6 text-center text-rose-400">{cc.error}</div>
                ) : (
                  <PitchCard
                    squad={sandboxSquad.map((p) => {
                      // Get fixture data for opponent difficulty coloring
                      const fixture = predictions.fixturesByPlayer.get(p.id);
                      const firstFixture = fixture?.fixtures?.[0];
                      
                      let chipLabel = undefined;
                      let chipDifficulty = undefined;
                      
                      if (firstFixture) {
                        const difficulty = getOpponentDifficulty(
                          firstFixture.opponent_short,
                          firstFixture.difficulty
                        );
                        chipDifficulty = difficulty;
                        
                        // Format opponent display
                        const opponentStr = `${firstFixture.is_home ? 'H' : 'A'} ${firstFixture.opponent_short}`;
                        chipLabel = opponentStr;
                      } else if (p.opponents && p.opponents.length > 0) {
                        chipLabel = p.opponents.join(', ');
                      } else {
                        chipLabel = p.teamAbbr || undefined;
                      }
                      
                      // Show xP instead of points for next GW
                      const pred = predictions.predictions.get(p.id);
                      const displayPoints = pred?.xp ?? p.xPts ?? p.points;
                      
                      return {
                        name: p.name,
                        position: p.position,
                        points: displayPoints,
                        isCaptain: p.isCaptain,
                        isViceCaptain: p.isViceCaptain,
                        isBench: p.isBench,
                        photoUrl: p.photoUrl,
                        chipLabel,
                        chipDifficulty,
                      };
                    })}
                  />
                )}

                <AICommandSummary summary={mockCommandCenterAISummary} />
              </div>

              {/* Right column - Decision cards */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <QuickActions
                  onAutoCaptain={handleAutoCaptain}
                  onAutoBench={handleAutoBench}
                  onRollTransfer={handleRollTransfer}
                />
                <InFormCard />
                <BandwagonsCard />
                <InjuriesSuspensionsCard injuries={mockInjuriesSuspensions} />
                <FixturesSnapshot fixtures={mockFixturesSnapshot} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Sandbox Controls */}
              <SandboxControls
                sandboxMode={sandboxMode}
                onToggleSandboxMode={() => setSandboxMode(!sandboxMode)}
                onUndo={handleUndo}
                onReset={handleReset}
                onApply={handleApplyToTeam}
                canUndo={sandboxActions.length > 0}
              />

              {/* Delta Strip */}
              <DeltaStrip
                realSquad={realSquad}
                sandboxSquad={sandboxSquad}
              />

              {/* Main content in 2 columns */}
              <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
                {/* Left - Transfer tools + Pitch */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <RecommendedTransfersList
                    transfers={mockRecommendedTransfers}
                    onApplyTransfer={handleTransfer}
                  />
                  <CustomTransferBuilder onTransfer={handleTransfer} />
                  {cc.loading ? (
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-center text-slate-400">Loading squad...</div>
                  ) : cc.error ? (
                    <div className="rounded-2xl bg-rose-900/10 border border-rose-800 p-6 text-center text-rose-400">{cc.error}</div>
                  ) : (
                    <PitchCard
                      squad={sandboxSquad.map((p) => ({
                        name: p.name,
                        position: p.position,
                        points: p.points,
                        isCaptain: p.isCaptain,
                        isViceCaptain: p.isViceCaptain,
                        isBench: p.isBench,
                        photoUrl: p.photoUrl,
                      }))}
                    />
                  )}
                  <SandboxCharts squad={sandboxSquad} />
                </div>

                {/* Right - Models, Chat */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <ModelComparisonPanel models={mockModelSources} />
                  <AskCopilotChat />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gameweek Videos - Bottom Strip */}
      <VideoInsightsStrip videos={mockVideoInsights} />
    </div>
  );
};

export default CommandCenterPage;
