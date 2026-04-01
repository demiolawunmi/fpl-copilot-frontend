import { Avatar, Badge, Box, HStack, Stack, Text } from '@chakra-ui/react';
import { type FplBootstrapElement, getPlayerPhotoUrl } from '../../api/fpl/fpl';
import {
  getTopPlayersByMetric,
  parseStatNumber,
  type PlayerLeaderboardRow,
  type TeamAbbreviationMap,
} from '../../utils/playerStatsFormat';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

export type LeaderboardCardKey = 'goals' | 'assists' | 'xg' | 'xgi' | 'cleanSheets';

export type PlayerLeaderboardCardEntry = PlayerLeaderboardRow & {
  valueLabel: string;
};

export type PlayerLeaderboardCardData = {
  key: LeaderboardCardKey;
  title: string;
  metricLabel: string;
  leaders: PlayerLeaderboardCardEntry[];
  contextText?: string;
};

export type PlayerLeaderboardCardsProps = {
  cards: PlayerLeaderboardCardData[];
};

export function buildPlayerLeaderboardCardsData(input: {
  elements: FplBootstrapElement[];
  teamMap?: TeamAbbreviationMap;
  topN?: number;
}): PlayerLeaderboardCardData[] {
  const topN = input.topN ?? 3;
  const outfieldElements = input.elements.filter((element) => element.element_type !== 1);
  const gkElements = input.elements.filter((element) => element.element_type === 1);

  const goalsLeaders = toCardEntries(
    getTopPlayersByMetric(input.elements, {
      metric: (element) => element.goals_scored,
      teamMap: input.teamMap,
      topN,
    }),
    (value) => formatIntegerMetric(value)
  );

  const assistsLeaders = toCardEntries(
    getTopPlayersByMetric(input.elements, {
      metric: (element) => element.assists,
      teamMap: input.teamMap,
      topN,
    }),
    (value) => formatIntegerMetric(value)
  );

  const xgLeaders = toCardEntries(
    getTopPlayersByMetric(input.elements, {
      metric: (element) => element.expected_goals,
      teamMap: input.teamMap,
      topN,
    }),
    (value) => value.toFixed(2)
  );

  const xgiLeaders = toCardEntries(
    getTopPlayersByMetric(input.elements, {
      metric: (element) => element.expected_goal_involvements,
      teamMap: input.teamMap,
      topN,
    }),
    (value) => value.toFixed(2)
  );

  const cleanSheetLeaders = toCardEntries(
    getTopPlayersByMetric(outfieldElements, {
      metric: (element) => element.clean_sheets,
      teamMap: input.teamMap,
      topN,
    }),
    (value) => formatIntegerMetric(value)
  );

  const topGkBySaves = getTopPlayersByMetric(gkElements, {
    metric: (element) => element.saves,
    teamMap: input.teamMap,
    topN: 1,
  })[0];

  const gkSavesContext = topGkBySaves
    ? `GK saves leader: ${topGkBySaves.name} (${topGkBySaves.teamAbbr}) ${formatIntegerMetric(topGkBySaves.metric)}`
    : 'GK saves leader unavailable';

  return [
    {
      key: 'goals',
      title: 'Goals',
      metricLabel: 'Season goals',
      leaders: goalsLeaders,
    },
    {
      key: 'assists',
      title: 'Assists',
      metricLabel: 'Season assists',
      leaders: assistsLeaders,
    },
    {
      key: 'xg',
      title: 'xG',
      metricLabel: 'Expected goals',
      leaders: xgLeaders,
    },
    {
      key: 'xgi',
      title: 'xGI',
      metricLabel: 'Expected goal involvement',
      leaders: xgiLeaders,
    },
    {
      key: 'cleanSheets',
      title: 'Clean sheets',
      metricLabel: 'Outfield clean sheets',
      leaders: cleanSheetLeaders,
      contextText: gkSavesContext,
    },
  ];
}

const PlayerLeaderboardCards = ({ cards }: PlayerLeaderboardCardsProps) => {
  return (
    <Box overflowX="auto" pb={2} sx={cardScrollSx}>
      <HStack spacing={4} align="stretch" minW="max-content">
        {cards.map((card) => (
          <DashboardCard key={card.key} w={{ base: '260px', md: '280px' }} flexShrink={0}>
            <DashboardHeader title={card.title} description={card.metricLabel} />
            <Stack px={5} py={4} spacing={2.5}>
              {card.leaders.map((leader, index) => {
                const rank = index + 1;
                const isTopRank = rank === 1;

                return (
                  <HStack
                    key={`${card.key}-${leader.id}-${rank}`}
                    justify="space-between"
                    gap={3}
                    px={3}
                    py={2.5}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={isTopRank ? 'brand.400' : 'whiteAlpha.200'}
                    bg={isTopRank ? 'rgba(56, 189, 248, 0.09)' : 'rgba(30, 41, 59, 0.36)'}
                  >
                    <HStack spacing={2.5} minW={0}>
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="md"
                        fontSize="10px"
                        bg={isTopRank ? 'brand.500' : 'whiteAlpha.300'}
                        color={isTopRank ? 'slate.950' : 'slate.200'}
                      >
                        #{rank}
                      </Badge>
                      <Avatar
                        size={isTopRank ? 'sm' : 'xs'}
                        src={getPlayerPhotoUrl(leader.photoCode, '60x60')}
                        name={leader.name}
                        bg="slate.700"
                        color="white"
                        ignoreFallback={false}
                      />
                      <Box minW={0}>
                        <Text
                          noOfLines={1}
                          fontSize={isTopRank ? 'sm' : 'xs'}
                          fontWeight={isTopRank ? 'bold' : 'semibold'}
                          color="white"
                        >
                          {leader.name}
                        </Text>
                        <Text fontSize="xs" color="slate.400">
                          {leader.teamAbbr}
                        </Text>
                      </Box>
                    </HStack>
                    <Text
                      fontSize={isTopRank ? 'md' : 'sm'}
                      fontWeight={isTopRank ? 'extrabold' : 'bold'}
                      color={isTopRank ? 'brand.300' : 'slate.200'}
                    >
                      {leader.valueLabel}
                    </Text>
                  </HStack>
                );
              })}
              {card.contextText ? (
                <Text pt={1} fontSize="xs" color="slate.400">
                  {card.contextText}
                </Text>
              ) : null}
            </Stack>
          </DashboardCard>
        ))}
      </HStack>
    </Box>
  );
};

function toCardEntries(
  rows: PlayerLeaderboardRow[],
  valueFormatter: (value: number) => string
): PlayerLeaderboardCardEntry[] {
  return rows.map((row) => {
    const metric = parseStatNumber(row.metric);
    return {
      ...row,
      metric,
      valueLabel: valueFormatter(metric),
    };
  });
}

function formatIntegerMetric(value: number): string {
  return String(Math.round(value));
}

export default PlayerLeaderboardCards;
