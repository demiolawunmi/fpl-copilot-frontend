import { useTeamId } from '../context/TeamIdContext';
import { useFplData } from '../hooks/useFplData';
import GWHeader from '../components/GWOverview/GWHeader';
import StatsStrip from '../components/GWOverview/StatsStrip';
import PitchCard from '../components/GWOverview/PitchCard';
import FixturesCard from '../components/GWOverview/FixturesCard';
import InjuriesTable from '../components/GWOverview/InjuriesTable';
import TransfersTable from '../components/GWOverview/TransfersTable';
import RecommendedTransfersCard from '../components/GWOverview/RecommendedTransfersCard';
import {
  mockGWInfo,
  mockStats,
  mockSquad,
  mockFixtures,
  mockInjuries,
  mockTransfers,
  mockRecommendedTransfers,
} from '../data/gwOverviewMocks';

const GWOverviewPage = () => {
  const { teamId } = useTeamId();
  const {
    loading,
    error,
    gwInfo,
    stats,
    squad,
    fixtures,
    injuries,
    transfers,
    manualPoints,
    pointsDifferent,
  } = useFplData(teamId);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading gameweek data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="bg-red-900/20 border border-red-400 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Data</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <p className="text-sm text-slate-400">Falling back to mock data for display.</p>
        </div>
      </div>
    );
  }

  // Use live data if available, otherwise fall back to mocks
  const displayGWInfo = gwInfo || mockGWInfo;
  const displayStats = stats || mockStats;
  const displaySquad = squad || mockSquad;
  const displayFixtures = fixtures || mockFixtures;
  const displayInjuries = injuries || mockInjuries;
  const displayTransfers = transfers || mockTransfers;
  const displayRecommendedTransfers = mockRecommendedTransfers; // Always use mock for recommendations

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <GWHeader info={displayGWInfo} />
      
      <StatsStrip
        stats={displayStats}
        manualPoints={manualPoints}
        showManualPoints={pointsDifferent}
      />
      
      <PitchCard squad={displaySquad} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FixturesCard fixtures={displayFixtures} />
        <RecommendedTransfersCard transfers={displayRecommendedTransfers} />
      </div>
      
      <InjuriesTable injuries={displayInjuries} />
      
      <TransfersTable transfers={displayTransfers} />
    </div>
  );
};

export default GWOverviewPage;

