import GWHeader from '../components/gw-overview/GWHeader';
import StatsStrip from '../components/gw-overview/StatsStrip';
import PitchCard from '../components/gw-overview/PitchCard';
import FixturesCard from '../components/gw-overview/FixturesCard';
import InjuriesTable from '../components/gw-overview/InjuriesTable';
import TransfersTable from '../components/gw-overview/TransfersTable';
import RecommendedTransfersCard from '../components/gw-overview/RecommendedTransfersCard';
import AISummaryCard from '../components/gw-overview/AISummaryCard';
import {
  mockGWInfo,
  mockStats,
  mockSquad,
  mockFixtures,
  mockInjuries,
  mockTransfers,
  mockRecommendedTransfers,
  mockAISummary
} from '../data/gwOverviewMocks';

const GWOverviewPage = () => {
  return (
    <div className="flex flex-col gap-6 px-10 py-8 flex-1">
      {/* Header */}
      <GWHeader info={mockGWInfo} />

      {/* Main 2-column layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left column — stats + pitch */}
        <div className="col-span-2 flex flex-col gap-6">
          <StatsStrip stats={mockStats} />
          <PitchCard squad={mockSquad} />
          <AISummaryCard gwInfo={mockGWInfo} summary={mockAISummary} />
        </div>

        {/* Right column — fixtures + recommended transfers */}
        <div className="col-span-1 flex flex-col gap-6">
          <FixturesCard fixtures={mockFixtures} />
          <RecommendedTransfersCard transfers={mockRecommendedTransfers} />
        </div>
      </div>

      {/* Bottom section — 2 cards side-by-side */}
      <div className="grid grid-cols-2 gap-6">
        <InjuriesTable injuries={mockInjuries} />
        <TransfersTable transfers={mockTransfers} />
      </div>
    </div>
  );
};

export default GWOverviewPage;
