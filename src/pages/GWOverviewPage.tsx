import { useTeamId } from '../context/TeamIdContext';
import { useFplData } from '../hooks/useFplData';
import GWHeader from '../components/gw-overview/GWHeader';
import StatsStrip from '../components/gw-overview/StatsStrip';
import PitchCard from '../components/gw-overview/PitchCard';
import {
  mockGWInfo,
  mockGWStats,
  mockPlayers,
} from '../data/gwOverviewMocks';

const GWOverviewPage = () => {
  const { teamId } = useTeamId();
  const { loading, error, gwInfo, gwStats, players } = useFplData(
    teamId ? parseInt(teamId) : null
  );

  // Use mock data if API fails or is loading
  const useMockData = loading || error || !gwInfo || !gwStats;
  const displayGWInfo = useMockData ? mockGWInfo : gwInfo;
  const displayGWStats = useMockData ? mockGWStats : gwStats;
  const displayPlayers = useMockData ? mockPlayers : players;

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-lg">Loading gameweek data...</div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-slate-300 text-sm">{error}</p>
          <p className="text-slate-400 text-sm mt-2">Showing mock data instead.</p>
        </div>
      )}

      {/* Main Content */}
      {displayGWInfo && displayGWStats && (
        <div className="space-y-6">
          {/* GW Header */}
          <GWHeader gwInfo={displayGWInfo} />

          {/* Stats Strip with Manual Points Calculation */}
          <StatsStrip stats={displayGWStats} />

          {/* Pitch Card */}
          <PitchCard players={displayPlayers} />
        </div>
      )}
    </div>
  );
};

export default GWOverviewPage;

