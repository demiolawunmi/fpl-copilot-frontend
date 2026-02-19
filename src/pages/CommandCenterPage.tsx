import { useState, useEffect } from 'react';
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
import type { EnhancedPlayer, SandboxAction } from '../data/commandCenterMocks';

// Import components (to be created)
import StatusStrip from '../components/command-center/StatusStrip';
// Use shared PitchCard from gw-overview (more feature-rich)
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
import VideoInsightsCard from '../components/command-center/VideoInsightsCard';

// FPL data hook
import { useFplData } from '../hooks/useFplData';
import type { Player as UiPlayer } from '../data/gwOverviewMocks';

type Tab = 'pick-team' | 'sandbox';

const mapUiPlayerToEnhanced = (p: UiPlayer): EnhancedPlayer => ({
  id: (p as any).id ?? 0,
  name: p.name,
  position: p.position,
  team: '',
  teamAbbr: p.teamAbbr ?? '',
  price: 0,
  xPts: (p as any).xPts ?? (p.points ?? 0),
  points: p.points ?? 0,
  minutesRisk: 'Unknown',
  injuryStatus: 'Available',
  isCaptain: p.isCaptain,
  isViceCaptain: p.isViceCaptain,
  isBench: p.isBench,
  photoUrl: p.photoUrl,
  opponents: p.opponents,
});

const CommandCenterPage = () => {
  const { teamId } = useTeamId();
  const [activeTab, setActiveTab] = useState<Tab>('pick-team');

  // FPL hook
  const fpl = useFplData(teamId);

  // State for sandbox
  const [realSquad, setRealSquad] = useState<EnhancedPlayer[]>(mockEnhancedSquad);
  const [sandboxSquad, setSandboxSquad] = useState<EnhancedPlayer[]>(mockEnhancedSquad);
  const [sandboxActions, setSandboxActions] = useState<SandboxAction[]>([]);
  const [sandboxMode, setSandboxMode] = useState(false);

  useEffect(() => {
    // When FPL data arrives, initialize squads from it
    if (!fpl.loading && fpl.error == null && fpl.squad.length > 0) {
      const enhanced = fpl.squad.map((p) => mapUiPlayerToEnhanced(p as UiPlayer));
      setRealSquad(enhanced);
      setSandboxSquad(enhanced.map((e) => ({ ...e })));
    }
  }, [fpl.loading, fpl.error, fpl.squad]);

  const teamStatus = mockTeamStatus;
  const teamName = fpl.gwInfo?.teamName ?? 'Haaland FC';

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
          Gameweek {fpl.gwInfo?.gameweek ?? mockCommandCenterAISummary.gameweek} • Team: {teamName} • ID: {teamId}
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
              {tab === 'pick-team' ? `Pick Team (GW ${fpl.gwInfo?.gameweek ?? mockCommandCenterAISummary.gameweek})` : 'AI Sandbox'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'pick-team' ? (
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
              {/* Left column - Pitch */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {fpl.loading ? (
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-center text-slate-400">Loading squad...</div>
                ) : fpl.error ? (
                  <div className="rounded-2xl bg-rose-900/10 border border-rose-800 p-6 text-center text-rose-400">{fpl.error}</div>
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
                      chipLabel: p.opponents && p.opponents.length > 0 ? p.opponents.join(', ') : p.teamAbbr || undefined,
                    }))}
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
                  {fpl.loading ? (
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-center text-slate-400">Loading squad...</div>
                  ) : fpl.error ? (
                    <div className="rounded-2xl bg-rose-900/10 border border-rose-800 p-6 text-center text-rose-400">{fpl.error}</div>
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

                {/* Right - Models, Chat, Videos */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <ModelComparisonPanel models={mockModelSources} />
                  <AskCopilotChat />
                  <VideoInsightsCard videos={mockVideoInsights} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandCenterPage;
