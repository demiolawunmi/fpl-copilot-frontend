import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertDescription,
  Container,
  Heading,
  Skeleton,
  SkeletonText,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchJson } from '../api/fpl/client';
import { fplEndpoints } from '../api/fpl/endpoints';
import { getBootstrap } from '../api/fpl/fpl';
import PlayerLeaderboardCards, {
  buildPlayerLeaderboardCardsData,
} from '../components/player-statistics/PlayerLeaderboardCards';
import PlayerStatsFilters, {
  PLAYER_STATS_DEFAULT_FILTERS,
  type PlayerStatsFiltersState,
  usePersistedPlayerStatsColumns,
} from '../components/player-statistics/PlayerStatsFilters';
import PlayerStatsTable from '../components/player-statistics/PlayerStatsTable';
import { DashboardCard, DashboardHeader } from '../components/ui/dashboard';
import { usePredictionsData } from '../hooks/usePredictionsData';
import { createTeamAbbreviationMap } from '../utils/playerStatsFormat';
import {
  mapBootstrapElementsToPlayerStatsRows,
  type FplFixtureLite,
  type PlayerStatsRowModel,
  type TeamLite,
} from '../utils/playerStatsModel';

const PlayersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<PlayerStatsRowModel[]>([]);
  const [nextGwId, setNextGwId] = useState<number | null>(null);
  const [teamOptions, setTeamOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [filters, setFilters] = useState<PlayerStatsFiltersState>(PLAYER_STATS_DEFAULT_FILTERS);
  const [leaderboardCards, setLeaderboardCards] = useState<
    ReturnType<typeof buildPlayerLeaderboardCardsData>
  >([]);
  const { visibleColumns, setVisibleColumns } = usePersistedPlayerStatsColumns();
  const predictions = usePredictionsData(nextGwId);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [bootstrap, fixtures] = await Promise.all([
          getBootstrap(),
          fetchJson<FplFixtureLite[]>(fplEndpoints.fixtures()),
        ]);

        if (!active) {
          return;
        }

        const teams: TeamLite[] = bootstrap.teams.map((team) => ({
          id: team.id,
          short_name: team.short_name,
        }));

        const mappedRows = mapBootstrapElementsToPlayerStatsRows({
          elements: bootstrap.elements,
          teams,
          fixtures,
          nextFixturesLimit: 5,
        });

        const bootstrapEvents = (bootstrap as { events?: Array<{ id: number; is_next?: boolean }> }).events;
        const nextEv = bootstrapEvents?.find((e) => e.is_next);
        setNextGwId(nextEv?.id ?? null);

        const teamMap = createTeamAbbreviationMap(teams);
        const cards = buildPlayerLeaderboardCardsData({
          elements: bootstrap.elements,
          teamMap,
          topN: 3,
        });

        const nextTeamOptions = bootstrap.teams
          .slice()
          .sort((a, b) => a.short_name.localeCompare(b.short_name))
          .map((team) => ({ value: team.short_name, label: team.short_name }));

        setRows(mappedRows);
        setLeaderboardCards(cards);
        setTeamOptions(nextTeamOptions);
      } catch (loadError) {
        if (!active) {
          return;
        }

        const message =
          loadError instanceof Error ? loadError.message : 'Could not load player statistics.';
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const rowsWithPredictions = useMemo(() => {
    return rows.map((row) => {
      const pred = predictions.lookupPrediction(row.name, row.teamAbbr);
      const xp = pred?.xp;
      if (pred != null && xp != null && Number.isFinite(xp)) {
        return { ...row, xPts: xp };
      }
      return row;
    });
  }, [rows, predictions]);

  const filteredRows = useMemo(() => {
    const searchQuery = filters.search.trim().toLowerCase();

    return rowsWithPredictions.filter((row) => {
      if (searchQuery && !row.name.toLowerCase().includes(searchQuery)) {
        return false;
      }

      if (filters.team !== 'all' && row.teamAbbr !== filters.team) {
        return false;
      }

      if (filters.position !== 'all' && row.position !== filters.position) {
        return false;
      }

      if (filters.preset === 'forwards-xg90') {
        return row.position === 'FWD' && row.xgPer90 > 0;
      }

      if (filters.preset === 'midfield-creativity') {
        return row.position === 'MID' && row.xA >= 1;
      }

      if (filters.preset === 'budget-differentials') {
        return parseNumberFromText(row.price) <= 6.5 && parseNumberFromText(row.ownership) < 10;
      }

      return true;
    });
  }, [filters, rowsWithPredictions]);

  const handleRowSelect = (id: number) => {
    navigate(`/players/${id}`, { state: { from: location.pathname } });
  };

  const handleViewClick = (id: number) => {
    navigate(`/players/${id}`, { state: { from: location.pathname } });
  };

  return (
    <Container maxW="8xl" flex="1" px={{ base: 4, md: 6, xl: 10 }} py={{ base: 6, xl: 8 }}>
      <Stack spacing={6}>
        <Stack spacing={1.5}>
          <Heading size="lg" color="white">
            Player Statistics
          </Heading>
          <Text color="slate.400" fontSize="sm">
            Season to date from official FPL bootstrap and fixtures data.
          </Text>
        </Stack>

        {error && !loading ? (
          <Alert
            status="warning"
            borderRadius="xl"
            bg="rgba(234, 179, 8, 0.08)"
            borderWidth="1px"
            borderColor="rgba(234, 179, 8, 0.2)"
          >
            <AlertDescription color="yellow.300" fontSize="sm">
              Couldn&apos;t load player statistics. {error}
            </AlertDescription>
          </Alert>
        ) : null}

        {loading ? (
          <Stack spacing={6}>
            <Stack direction={{ base: 'column', lg: 'row' }} spacing={4}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`leader-skeleton-${index}`} height="220px" borderRadius="2xl" flex="1" />
              ))}
            </Stack>
            <DashboardCard>
              <DashboardHeader title="Filters" description="Search, narrow, and customize columns" />
              <Stack px={5} py={4} spacing={4}>
                <Skeleton height="42px" borderRadius="md" />
                <Skeleton height="42px" borderRadius="md" />
                <Skeleton height="42px" borderRadius="md" />
              </Stack>
            </DashboardCard>
            <DashboardCard>
              <DashboardHeader title="Statistics table" description="All players" />
              <Stack px={5} py={4} spacing={4}>
                <SkeletonText noOfLines={8} spacing={3} skeletonHeight="4" />
              </Stack>
            </DashboardCard>
          </Stack>
        ) : (
          <>
            <PlayerLeaderboardCards cards={leaderboardCards} />

            <DashboardCard>
              <DashboardHeader
                title="Filters"
                description="Search by player, filter by team and position, and customize visible columns."
              />
              <Stack px={5} py={4} spacing={4}>
                <PlayerStatsFilters
                  value={filters}
                  onChange={setFilters}
                  teamOptions={teamOptions}
                  visibleColumns={visibleColumns}
                  onVisibleColumnsChange={setVisibleColumns}
                />
              </Stack>
            </DashboardCard>

            <DashboardCard>
              <DashboardHeader
                title="Statistics table"
                description="Sortable season metrics for all players in the game."
              />
              <Stack px={5} py={4} spacing={4}>
                <PlayerStatsTable
                  rows={filteredRows}
                  visibleColumns={visibleColumns}
                  onRowSelect={handleRowSelect}
                  onViewClick={handleViewClick}
                  emptyText="No players match your filters right now."
                />
              </Stack>
            </DashboardCard>
          </>
        )}
      </Stack>
    </Container>
  );
};

function parseNumberFromText(value: string): number {
  const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default PlayersPage;
