import { useRef, useState, useEffect } from 'react';
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
  mockAISummary,
} from '../data/gwOverviewMocks';
import { useTeamId } from '../context/TeamIdContext';
import { useFplData } from '../hooks/useFplData';

const GWOverviewPage = () => {
  const { teamId } = useTeamId();
  const fpl = useFplData(teamId);

  // Use live data when available, fall back to mocks
  const gwInfo = fpl.gwInfo ?? mockGWInfo;
  const stats = fpl.stats ?? mockStats;
  const squad = fpl.squad.length > 0 ? fpl.squad : mockSquad;
  const fixtures = fpl.fixtures.length > 0 ? fpl.fixtures : mockFixtures;

  // Measure GWHeader height and pass to right-column cards so their bottoms align with pitch
  const headerRef = useRef<HTMLDivElement | null>(null);
  const pitchRef = useRef<HTMLDivElement | null>(null);
  const fixturesTopRef = useRef<HTMLDivElement | null>(null);
  const aiSummaryRef = useRef<HTMLDivElement | null>(null);
  const [fixturesHeight, setFixturesHeight] = useState<number | undefined>(undefined);
  const [recommendedHeight, setRecommendedHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const update = () => {
      if (!pitchRef.current || !fixturesTopRef.current) return;
      const pitchRect = pitchRef.current.getBoundingClientRect();
      const fixturesRect = fixturesTopRef.current.getBoundingClientRect();
      const height = Math.max(0, Math.round(pitchRect.bottom - fixturesRect.top));
      setFixturesHeight(height || undefined);
    };

    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
    };
  }, [gwInfo.gameweek, stats?.gwPoints, squad.length, fixtures.length]);

  useEffect(() => {
    const update = () => {
      if (!aiSummaryRef.current) return;
      const rect = aiSummaryRef.current.getBoundingClientRect();
      setRecommendedHeight(Math.round(rect.height) || undefined);
    };

    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
    };
  }, [gwInfo.gameweek, stats?.gwPoints, squad.length]);

  return (
    <div className="flex flex-col gap-6 px-10 py-8 flex-1">
      {/* Loading state */}
      {fpl.loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
            <p className="text-sm text-slate-400">Loading your FPL data…</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {fpl.error && !fpl.loading && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-3">
          <p className="text-sm text-yellow-400">
            ⚠ Couldn't load live data — showing mock data. ({fpl.error})
          </p>
        </div>
      )}

      {/* Header: measure this wrapper */}
      <div ref={headerRef}>
        <GWHeader info={gwInfo} />
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left column — stats + pitch */}
        <div className="col-span-2 flex flex-col gap-6">
          <StatsStrip stats={stats} />
          <div ref={pitchRef}>
            <PitchCard squad={squad} />
          </div>
          <div ref={aiSummaryRef}>
            <AISummaryCard gwInfo={gwInfo} summary={mockAISummary} />
          </div>
        </div>

        {/* Right column — fixtures + recommended transfers */}
        <div className="col-span-1 flex flex-col gap-6">
          <div ref={fixturesTopRef}>
            <FixturesCard fixtures={fixtures} heightPx={fixturesHeight} />
          </div>
          <RecommendedTransfersCard
            transfers={mockRecommendedTransfers}
            heightPx={recommendedHeight}
          />
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
