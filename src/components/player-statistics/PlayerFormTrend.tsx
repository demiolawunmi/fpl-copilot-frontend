import { Box, HStack, Stack, Text } from '@chakra-ui/react';
import type { PlayerDetailHistory } from '../../hooks/usePlayerDetail';
import { DashboardCard, DashboardHeader } from '../ui/dashboard';

type PlayerFormTrendProps = {
  history: PlayerDetailHistory[];
  maxItems?: number;
};

type TrendRow = {
  id: string;
  roundLabel: string;
  points: number;
};

const DEFAULT_MAX_ITEMS = 5;

const PlayerFormTrend = ({ history, maxItems = DEFAULT_MAX_ITEMS }: PlayerFormTrendProps) => {
  const boundedCount = Math.max(1, maxItems);
  const latestSlice = history.slice(-Math.min(boundedCount, history.length));
  const trendRows: TrendRow[] = latestSlice.map((entry) => ({
    id: `${entry.fixture}-${entry.round}`,
    roundLabel: `GW ${entry.round}`,
    points: entry.total_points,
  }));

  const maxAbsolutePoints = trendRows.reduce(
    (max, row) => Math.max(max, Math.abs(row.points)),
    0,
  );
  const scaleBase = maxAbsolutePoints > 0 ? maxAbsolutePoints : 1;

  return (
    <DashboardCard>
      <DashboardHeader
        title="Form Trend"
        description="Last up to 5 gameweeks by points (ordered oldest to latest)."
      />

      <Stack spacing={3} px={5} py={4}>
        {trendRows.length === 0 ? (
          <Text fontSize="sm" color="slate.400">
            No recent gameweek history is available for this player yet.
          </Text>
        ) : (
          trendRows.map((row) => {
            const widthPercent = Math.max((Math.abs(row.points) / scaleBase) * 100, 6);
            const isPositive = row.points >= 0;

            return (
              <Stack key={row.id} spacing={1.5}>
                <HStack justify="space-between" align="center">
                  <Text fontSize="sm" color="slate.300" fontWeight="semibold">
                    {row.roundLabel}
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={isPositive ? 'green.300' : 'red.300'}
                  >
                    {row.points} pts
                  </Text>
                </HStack>
                <Box
                  h="2.25rem"
                  borderRadius="lg"
                  bg="rgba(15, 23, 42, 0.72)"
                  borderWidth="1px"
                  borderColor="whiteAlpha.100"
                  overflow="hidden"
                >
                  <Box
                    h="100%"
                    w={`${widthPercent}%`}
                    bg={isPositive ? 'rgba(16, 185, 129, 0.42)' : 'rgba(248, 113, 113, 0.38)'}
                    borderRightWidth="1px"
                    borderRightColor={isPositive ? 'green.300' : 'red.300'}
                    transition="width 0.2s ease"
                  />
                </Box>
              </Stack>
            );
          })
        )}
      </Stack>
    </DashboardCard>
  );
};

export default PlayerFormTrend;
