import { useRef, useState, useEffect, useMemo } from 'react';
import {
  Alert,
  AlertDescription,
  Box,
  Grid,
  GridItem,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
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
import { useNavigate } from 'react-router-dom';

const GWOverviewPage = () => {
  const { teamId } = useTeamId();
  const navigate = useNavigate();
  const [selectedGW, setSelectedGW] = useState<number | null>(null);
  const fpl = useFplData(teamId, selectedGW ?? undefined);

  const gwInfo = fpl.gwInfo ?? mockGWInfo;
  const stats = fpl.stats ?? mockStats;
  const squad = fpl.squad.length > 0 ? fpl.squad : mockSquad;
  const fixtures = fpl.fixtures.length > 0 ? fpl.fixtures : mockFixtures;

  const { minGW, maxGW } = useMemo(() => {
    const ids = fpl.bootstrap?.events?.map((e) => e.id) ?? [];
    if (!ids.length) {
      return { minGW: 1, maxGW: fpl.currentGW || 1 };
    }
    const min = Math.min(...ids);
    const max = fpl.currentGW || Math.max(...ids);
    return { minGW: min, maxGW: max };
  }, [fpl.bootstrap, fpl.currentGW]);

  const currentSelected = selectedGW ?? (fpl.currentGW || minGW);
  const disablePrev = currentSelected <= minGW;
  const disableNext = currentSelected >= maxGW;

  const handlePrev = () => {
    if (disablePrev) return;
    setSelectedGW(currentSelected - 1);
  };

  const handleNext = () => {
    if (disableNext) return;
    setSelectedGW(currentSelected + 1);
  };

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
    <Stack flex="1" spacing={6} px={{ base: 4, md: 6, xl: 10 }} py={{ base: 6, xl: 8 }}>
      {fpl.loading ? (
        <Stack align="center" justify="center" py={12} spacing={3}>
          <Spinner size="lg" color="brand.400" thickness="3px" />
          <Text fontSize="sm" color="slate.400">
            Loading your FPL data…
          </Text>
        </Stack>
      ) : null}

      {fpl.error && !fpl.loading ? (
        <Alert status="warning" borderRadius="xl" bg="rgba(234, 179, 8, 0.08)" borderWidth="1px" borderColor="rgba(234, 179, 8, 0.2)">
          <AlertDescription color="yellow.300" fontSize="sm">
            ⚠ Couldn't load live data — showing mock data. ({fpl.error})
          </AlertDescription>
        </Alert>
      ) : null}

      <GWHeader
        info={gwInfo}
        onPrev={handlePrev}
        onNext={handleNext}
        disablePrev={disablePrev}
        disableNext={disableNext}
      />

      <Grid templateColumns={{ base: '1fr', xl: 'repeat(3, minmax(0, 1fr))' }} gap={6}>
        <GridItem colSpan={{ base: 1, xl: 2 }}>
          <Stack spacing={6}>
            <StatsStrip stats={stats} />
            <Box ref={pitchRef}>
              <PitchCard
                squad={squad}
                onPlayerClick={(player) => {
                  // Guard: only navigate when a valid numeric id is present
                  const id = player?.id;
                  if (id == null || typeof id !== 'number' || Number.isNaN(id)) return;
                  navigate(`/players/${id}`);
                }}
              />
            </Box>
            <Box ref={aiSummaryRef}>
              <AISummaryCard gwInfo={gwInfo} summary={mockAISummary} />
            </Box>
          </Stack>
        </GridItem>

        <GridItem colSpan={1}>
          <Stack spacing={6}>
            <Box ref={fixturesTopRef}>
              <FixturesCard
                fixtures={fixtures}
                heightPx={fixturesHeight}
                isCurrentGw={currentSelected === fpl.currentGW}
              />
            </Box>
            <RecommendedTransfersCard
              transfers={mockRecommendedTransfers}
              heightPx={recommendedHeight}
            />
          </Stack>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: '1fr', xl: 'repeat(2, minmax(0, 1fr))' }} gap={6}>
        <InjuriesTable injuries={mockInjuries} />
        <TransfersTable transfers={mockTransfers} />
      </Grid>
    </Stack>
  );
};

export default GWOverviewPage;
