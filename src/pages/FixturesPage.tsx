import { useMemo, useState } from 'react';
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
import FixturesCard from '../components/gw-overview/FixturesCard';
import FdrMatrixTable from '../components/fixtures-page/FdrMatrixTable';
import TeamEloTable from '../components/fixtures-page/TeamEloTable';
import { mockFixtures } from '../data/gwOverviewMocks';
import { useTeamId } from '../context/TeamIdContext';
import { useFplData } from '../hooks/useFplData';
import { useFixturesRatings } from '../hooks/useFixturesRatings';

const FixturesPage = () => {
  const { teamId } = useTeamId();
  const [selectedGW, setSelectedGW] = useState<number | null>(null);
  const fpl = useFplData(teamId, selectedGW ?? undefined);

  const gwInfo = fpl.gwInfo;
  const fixtures =
    fpl.fixtures.length > 0 ? fpl.fixtures : mockFixtures;

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

  const ratings = useFixturesRatings(fpl.bootstrap, currentSelected);

  return (
    <Stack flex="1" spacing={6} px={{ base: 4, md: 6, xl: 10 }} py={{ base: 6, xl: 8 }}>
      {fpl.loading ? (
        <Stack align="center" justify="center" py={24} spacing={3}>
          <Spinner size="lg" color="brand.400" thickness="3px" />
          <Text fontSize="sm" color="slate.400">
            Loading your FPL data…
          </Text>
        </Stack>
      ) : (
        <>
          {fpl.error ? (
            <Alert
              status="warning"
              borderRadius="xl"
              bg="rgba(234, 179, 8, 0.08)"
              borderWidth="1px"
              borderColor="rgba(234, 179, 8, 0.2)"
            >
              <AlertDescription color="yellow.300" fontSize="sm">
                ⚠ Couldn&apos;t load live data — showing mock fixtures where needed. ({fpl.error})
              </AlertDescription>
            </Alert>
          ) : null}

          {ratings.error && !ratings.loading ? (
            <Alert
              status="info"
              borderRadius="xl"
              bg="rgba(59, 130, 246, 0.08)"
              borderWidth="1px"
              borderColor="rgba(59, 130, 246, 0.2)"
            >
              <AlertDescription color="blue.200" fontSize="sm">
                {ratings.error}
              </AlertDescription>
            </Alert>
          ) : null}

          {gwInfo ? (
            <GWHeader
              info={gwInfo}
              onPrev={handlePrev}
              onNext={handleNext}
              disablePrev={disablePrev}
              disableNext={disableNext}
            />
          ) : null}

          <Grid
            templateColumns={{ base: '1fr', xl: 'minmax(0, 1.2fr) minmax(0, 0.8fr)' }}
            gap={6}
            alignItems="start"
          >
            <GridItem>
              <FixturesCard
                fixtures={fixtures}
                isCurrentGw={currentSelected === fpl.currentGW}
              />
            </GridItem>
            <GridItem>
              <Stack spacing={3}>
                {ratings.loading ? (
                  <Stack direction="row" align="center" spacing={2} color="slate.500">
                    <Spinner size="sm" color="brand.400" thickness="2px" />
                    <Text fontSize="xs">Loading Elo / FDR from API…</Text>
                  </Stack>
                ) : null}
                {ratings.data ? (
                  <TeamEloTable teams={ratings.data.teams} />
                ) : (
                  <Box
                    borderWidth="1px"
                    borderColor="whiteAlpha.200"
                    borderRadius="2xl"
                    bg="slate.900"
                    px={6}
                    py={8}
                  >
                    <Text fontSize="sm" color="slate.500">
                      Team ratings will appear here once bootstrap data is available.
                    </Text>
                  </Box>
                )}
              </Stack>
            </GridItem>
          </Grid>

          {ratings.data ? (
            <Stack spacing={6}>
              <FdrMatrixTable
                title="Official FPL FDR"
                description="Integer difficulty (1–5) from fantasy.premierleague.com via your API /api/fdr/team (official_fpl_fdr)."
                gameweekIds={ratings.data.gameweekIds}
                teams={ratings.data.teams}
                mode="official"
              />
              <FdrMatrixTable
                title="Copilot Elo FDR"
                description="Custom overall FDR (1–5 scale) from ClubElo + injuries + squad changes — overall_fdr from /api/fdr/team."
                gameweekIds={ratings.data.gameweekIds}
                teams={ratings.data.teams}
                mode="elo"
              />
            </Stack>
          ) : null}
        </>
      )}
    </Stack>
  );
};

export default FixturesPage;
