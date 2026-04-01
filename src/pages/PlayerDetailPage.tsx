import { useMemo } from 'react';
import {
  Alert,
  AlertDescription,
  Button,
  Container,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import PlayerFixturesPanel from '../components/player-statistics/PlayerFixturesPanel';
import PlayerFormTrend from '../components/player-statistics/PlayerFormTrend';
import PlayerHeroCard from '../components/player-statistics/PlayerHeroCard';
import { DashboardCard } from '../components/ui/dashboard';
import { usePlayerDetail } from '../hooks/usePlayerDetail';
import { usePredictionsData } from '../hooks/usePredictionsData';

const PlayerDetailPage = () => {
  const location = useLocation();
  const { playerId } = useParams<{ playerId: string }>();
  const safePlayerId = playerId ?? '';
  const { loading, error, element, summary, historySorted, nextGameweekId } = usePlayerDetail(safePlayerId);
  const predictions = usePredictionsData(nextGameweekId);

  const back = useMemo(() => {
    const from = (location.state as { from?: string } | null)?.from;
    if (from === '/gw-overview') return { to: '/gw-overview', label: 'Back to GW overview' };
    if (from === '/command-center') return { to: '/command-center', label: 'Back to command center' };
    if (from === '/players') return { to: '/players', label: 'Back to players' };
    return { to: '/players', label: 'Back to players' };
  }, [location.state]);

  const predictionXp = useMemo(() => {
    if (!element) return null;
    const pred = predictions.lookupPrediction(element.web_name, element.teamShortName);
    if (pred != null && Number.isFinite(pred.xp)) return pred.xp;
    return null;
  }, [element, predictions]);

  return (
    <Container maxW="8xl" flex="1" px={{ base: 4, md: 6, xl: 10 }} py={{ base: 6, xl: 8 }}>
      <Stack spacing={6}>
        <Button
          as={RouterLink}
          to={back.to}
          alignSelf="flex-start"
          size="sm"
          variant="ghost"
          color="slate.200"
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
        >
          {back.label}
        </Button>

        {loading ? (
          <Stack spacing={4} w="full">
            <Skeleton height="220px" borderRadius="2xl" w="full" />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
              <Skeleton height="280px" borderRadius="2xl" w="full" />
              <Skeleton height="280px" borderRadius="2xl" w="full" />
            </SimpleGrid>
          </Stack>
        ) : null}

        {!loading && error ? (
          <Alert
            status="warning"
            borderRadius="xl"
            bg="rgba(234, 179, 8, 0.08)"
            borderWidth="1px"
            borderColor="rgba(234, 179, 8, 0.2)"
          >
            <AlertDescription color="yellow.300" fontSize="sm">
              Couldn&apos;t load player detail. {error}
            </AlertDescription>
          </Alert>
        ) : null}

        {!loading && !error && (!element || !summary) ? (
          <DashboardCard px={5} py={4}>
            <Text color="slate.300" fontSize="sm">
              Player detail is unavailable right now.
            </Text>
          </DashboardCard>
        ) : null}

        {!loading && !error && element && summary ? (
          <Stack spacing={4} w="full">
            <PlayerHeroCard
              key={element.id}
              element={element}
              expectedPoints={predictionXp}
              fixtures={summary.fixtures}
            />

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full" alignItems="stretch">
              <PlayerFormTrend history={historySorted} />
              <PlayerFixturesPanel fixtures={summary.fixtures} />
            </SimpleGrid>
          </Stack>
        ) : null}
      </Stack>
    </Container>
  );
};

export default PlayerDetailPage;
