import {
  Alert,
  AlertDescription,
  Button,
  Container,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import PlayerFixturesPanel from '../components/player-statistics/PlayerFixturesPanel';
import PlayerFormTrend from '../components/player-statistics/PlayerFormTrend';
import PlayerHeroCard from '../components/player-statistics/PlayerHeroCard';
import PlayerInsightCallout from '../components/player-statistics/PlayerInsightCallout';
import PlayerPositionInsights from '../components/player-statistics/PlayerPositionInsights';
import { DashboardCard } from '../components/ui/dashboard';
import { usePlayerDetail } from '../hooks/usePlayerDetail';

const PlayerDetailPage = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const safePlayerId = playerId ?? '';
  const { loading, error, element, summary, historySorted } = usePlayerDetail(safePlayerId);

  return (
    <Container maxW="8xl" flex="1" px={{ base: 4, md: 6, xl: 10 }} py={{ base: 6, xl: 8 }}>
      <Stack spacing={6}>
        <Button
          as={RouterLink}
          to="/players"
          alignSelf="flex-start"
          size="sm"
          variant="ghost"
          color="slate.200"
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
        >
          Back to players
        </Button>

        {loading ? (
          <Stack spacing={4}>
            <Skeleton height="220px" borderRadius="2xl" />
            <Stack direction={{ base: 'column', lg: 'row' }} spacing={4}>
              <Skeleton height="280px" borderRadius="2xl" flex="1" />
              <Skeleton height="280px" borderRadius="2xl" flex="1" />
            </Stack>
            <Skeleton height="180px" borderRadius="2xl" />
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
          <Stack spacing={4}>
            <PlayerHeroCard element={element} />

            <Stack direction={{ base: 'column', xl: 'row' }} spacing={4} align="stretch">
              <Stack spacing={4} flex="1.2">
                <PlayerFormTrend history={historySorted} />
                <PlayerPositionInsights element={element} />
              </Stack>
              <Stack spacing={4} flex="1">
                <PlayerFixturesPanel fixtures={summary.fixtures} />
                <PlayerInsightCallout form={element.form} fixtures={summary.fixtures} />
              </Stack>
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </Container>
  );
};

export default PlayerDetailPage;
