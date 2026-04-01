import { useState } from 'react';
import {
  Badge,
  Box,
  Flex,
  HStack,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import {
  elementTypeToPosition,
  type FplBootstrapElement,
} from '../../api/fpl/fpl';
import { fplEndpoints } from '../../api/fpl/endpoints';
import PlayerHeadshot from './PlayerHeadshot';
import {
  formatOwnershipPercent,
  formatPriceFromNowCost,
  parseStatNumber,
} from '../../utils/playerStatsFormat';
import type { PlayerDetailFixture } from '../../hooks/usePlayerDetail';
import { DashboardCard } from '../ui/dashboard';

/** Matches `PlayerHeadshot` hero size so photo and team crest read as a pair. */
const HERO_VISUAL_SIZE = '96px';

type PlayerHeroElement = Pick<
  FplBootstrapElement,
  | 'id'
  | 'code'
  | 'web_name'
  | 'element_type'
  | 'status'
  | 'now_cost'
  | 'selected_by_percent'
  | 'total_points'
  | 'chance_of_playing_this_round'
  | 'chance_of_playing_next_round'
  | 'form'
  | 'minutes'
  | 'goals_scored'
  | 'assists'
  | 'expected_goal_involvements'
  | 'bonus'
  | 'ep_this'
  | 'ep_next'
  | 'expected_goals'
  | 'clean_sheets'
  | 'saves'
  | 'threat'
> & {
  teamName: string;
  teamShortName: string;
  teamCode?: number | null;
};

export type PlayerHeroCardProps = {
  element: PlayerHeroElement;
  teamBadgeLabel?: string;
  expectedPoints?: number | null;
  fixtures?: PlayerDetailFixture[];
};

function TeamBadgeSquare({ teamCode, abbr }: { teamCode: number | null | undefined; abbr: string }) {
  const [failed, setFailed] = useState(false);
  const url = teamCode != null ? fplEndpoints.teamBadge(teamCode) : undefined;

  return (
    <Flex
      boxSize={HERO_VISUAL_SIZE}
      flexShrink={0}
      align="center"
      justify="center"
      borderRadius="xl"
      bg="white"
      p={2}
      overflow="hidden"
    >
      {url && !failed ? (
        <Image
          src={url}
          alt={`${abbr} badge`}
          maxW="full"
          maxH="full"
          w="auto"
          h="auto"
          objectFit="contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text fontSize="sm" fontWeight="bold" color="slate.700" textTransform="uppercase">
          {abbr.slice(0, 3)}
        </Text>
      )}
    </Flex>
  );
}

const PlayerHeroCard = ({ element, teamBadgeLabel, expectedPoints, fixtures = [] }: PlayerHeroCardProps) => {
  const ownership = parseStatNumber(element.selected_by_percent);
  const formValue = parseStatNumber(element.form);
  const availability = resolveAvailability(element);
  const ruleTags = getRuleTags(ownership, formValue);

  const epBootstrap = parseStatNumber(element.ep_next ?? element.ep_this);
  const xPtsDisplay =
    expectedPoints != null && Number.isFinite(expectedPoints) ? expectedPoints : epBootstrap;

  const overviewStats = [
    { label: 'Total points', value: String(element.total_points ?? 0) },
    { label: 'xPts', value: xPtsDisplay.toFixed(1) },
    { label: 'Minutes', value: String(element.minutes ?? 0) },
    { label: 'Goals', value: String(element.goals_scored ?? 0) },
    { label: 'Assists', value: String(element.assists ?? 0) },
    {
      label: 'xGI',
      value: parseStatNumber(element.expected_goal_involvements).toFixed(2),
    },
    { label: 'Bonus', value: String(element.bonus ?? 0) },
  ];

  const position = elementTypeToPosition(element.element_type);
  const positionStats = buildPositionInsightStats(position, element);
  const insightText = buildInsightText(formValue, fixtures);

  return (
    <Stack spacing={4}>
      <DashboardCard px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }} overflow="hidden">
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          gap={{ base: 6, lg: 8 }}
          align={{ base: 'stretch', lg: 'flex-start' }}
        >
          {/* Left: photo + team crest + identity */}
          <Stack
            direction={{ base: 'column', sm: 'row' }}
            spacing={{ base: 4, sm: 5 }}
            flex={{ lg: '1.15' }}
            minW={0}
            align={{ base: 'stretch', sm: 'flex-start' }}
          >
            <Stack spacing={3} align="center" flexShrink={0}>
              <Box pl={1} pr={0.5} transform="translateX(4px)">
                <PlayerHeadshot code={element.code} name={element.web_name} size="hero" />
              </Box>
              <TeamBadgeSquare teamCode={element.teamCode} abbr={teamBadgeLabel ?? element.teamShortName} />
            </Stack>

            <Stack spacing={3} flex="1" minW={0}>
              <Stack spacing={1.5}>
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="white" noOfLines={1}>
                  {element.web_name}
                </Text>

                <HStack spacing={2} flexWrap="wrap">
                  <Badge px={2.5} py={1} borderRadius="md" bg="whiteAlpha.200" color="slate.100" textTransform="none">
                    {teamBadgeLabel ?? element.teamShortName}
                  </Badge>
                  <Badge px={2.5} py={1} borderRadius="md" bg="whiteAlpha.100" color="slate.200" textTransform="none">
                    {element.teamName}
                  </Badge>
                  <Badge px={2.5} py={1} borderRadius="md" bg="brand.500" color="slate.950" textTransform="none">
                    {position}
                  </Badge>
                </HStack>
              </Stack>

              <HStack spacing={5} flexWrap="wrap">
                <MetricText label="Price" value={formatPriceFromNowCost(element.now_cost)} />
                <MetricText label="Ownership" value={formatOwnershipPercent(element.selected_by_percent)} />
                <MetricText label="Total points" value={String(element.total_points ?? 0)} />
              </HStack>

              <HStack spacing={2} flexWrap="wrap">
                <Badge
                  px={2.5}
                  py={1}
                  borderRadius="md"
                  textTransform="none"
                  borderWidth="1px"
                  bg={availability.bg}
                  color={availability.color}
                  borderColor={availability.borderColor}
                >
                  {availability.label}
                </Badge>
                {availability.chanceText ? (
                  <Text fontSize="sm" color="slate.300">
                    {availability.chanceText}
                  </Text>
                ) : null}
              </HStack>

              {ruleTags.length > 0 ? (
                <Stack spacing={2} pt={1}>
                  {ruleTags.map((tag) => (
                    <HStack key={tag.label} spacing={3} flexWrap="wrap">
                      <Badge
                        px={2.5}
                        py={1}
                        borderRadius="md"
                        textTransform="none"
                        borderWidth="1px"
                        bg={tag.bg}
                        color={tag.color}
                        borderColor={tag.borderColor}
                        flexShrink={0}
                      >
                        {tag.label}
                      </Badge>
                      <Text fontSize="sm" color="slate.400" lineHeight="short">
                        {tag.helperText}
                      </Text>
                    </HStack>
                  ))}
                </Stack>
              ) : null}
            </Stack>
          </Stack>

          {/* Right: narrative insight + position stat tiles */}
          <Stack
            spacing={4}
            flex={{ lg: '1' }}
            minW={0}
            pt={{ base: 4, lg: 0 }}
            borderTopWidth={{ base: '1px', lg: '0' }}
            borderLeftWidth={{ base: '0', lg: '1px' }}
            borderColor="whiteAlpha.100"
            pl={{ base: 0, lg: 2 }}
          >
            <Stack spacing={2}>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="slate.500" fontWeight="semibold">
                Insight
              </Text>
              <Text fontSize="sm" color="slate.200" lineHeight="tall">
                {insightText}
              </Text>
            </Stack>

            <Stack spacing={2}>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="slate.500" fontWeight="semibold">
                {position} insights
              </Text>
              <SimpleGrid columns={{ base: 2, md: 2 }} spacing={3}>
                {positionStats.map((stat) => (
                  <Stack
                    key={stat.label}
                    spacing={0.5}
                    px={3}
                    py={2.5}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="whiteAlpha.100"
                    bg="rgba(15, 23, 42, 0.65)"
                  >
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="slate.500">
                      {stat.label}
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      {stat.value}
                    </Text>
                  </Stack>
                ))}
              </SimpleGrid>
            </Stack>
          </Stack>
        </Flex>
      </DashboardCard>

      <SimpleGrid columns={{ base: 2, md: 3, xl: 7 }} spacing={3}>
        {overviewStats.map((stat) => (
          <DashboardCard key={stat.label} px={4} py={3}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="slate.500">
              {stat.label}
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="bold" color="white">
              {stat.value}
            </Text>
          </DashboardCard>
        ))}
      </SimpleGrid>
    </Stack>
  );
};

type MetricTextProps = { label: string; value: string };

function MetricText({ label, value }: MetricTextProps) {
  return (
    <Box>
      <Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="slate.500">
        {label}
      </Text>
      <Text fontSize="md" fontWeight="semibold" color="white">
        {value}
      </Text>
    </Box>
  );
}

type AvailabilityState = {
  label: string;
  chanceText: string | null;
  bg: string;
  color: string;
  borderColor: string;
};

function resolveAvailability(element: PlayerHeroElement): AvailabilityState {
  const status = element.status ?? 'u';
  const chance =
    element.chance_of_playing_this_round ??
    element.chance_of_playing_next_round ??
    null;

  if (status === 'a' && (chance == null || chance >= 100)) {
    return {
      label: 'Available',
      chanceText: chance != null ? `${chance}% chance this GW` : null,
      bg: 'rgba(16, 185, 129, 0.12)',
      color: 'green.300',
      borderColor: 'rgba(16, 185, 129, 0.22)',
    };
  }

  if (status === 's') {
    return {
      label: 'Suspended',
      chanceText: chance != null ? `${chance}% chance next GW` : null,
      bg: 'rgba(251, 146, 60, 0.12)',
      color: 'orange.300',
      borderColor: 'rgba(251, 146, 60, 0.22)',
    };
  }

  if (status === 'd' || (chance != null && chance > 0 && chance < 100)) {
    return {
      label: 'Doubtful',
      chanceText: chance != null ? `${chance}% chance this GW` : null,
      bg: 'rgba(250, 204, 21, 0.12)',
      color: 'yellow.300',
      borderColor: 'rgba(250, 204, 21, 0.22)',
    };
  }

  if (status === 'i' || status === 'u' || status === 'n') {
    return {
      label: 'Unavailable',
      chanceText: chance != null ? `${chance}% chance this GW` : null,
      bg: 'rgba(248, 113, 113, 0.12)',
      color: 'red.300',
      borderColor: 'rgba(248, 113, 113, 0.22)',
    };
  }

  return {
    label: 'Status unknown',
    chanceText: chance != null ? `${chance}% chance this GW` : null,
    bg: 'rgba(148, 163, 184, 0.15)',
    color: 'slate.200',
    borderColor: 'rgba(148, 163, 184, 0.2)',
  };
}

type RuleTag = {
  label: string;
  helperText: string;
  bg: string;
  color: string;
  borderColor: string;
};

function getRuleTags(ownership: number, formValue: number): RuleTag[] {
  const tags: RuleTag[] = [];

  if (ownership > 30) {
    tags.push({
      label: 'Template',
      helperText: 'High ownership across active managers.',
      bg: 'rgba(56, 189, 248, 0.12)',
      color: 'cyan.300',
      borderColor: 'rgba(56, 189, 248, 0.24)',
    });
  }

  if (ownership < 5) {
    tags.push({
      label: 'Differential',
      helperText: 'Low ownership provides an edge to climb ranks.',
      bg: 'rgba(20, 184, 166, 0.12)',
      color: 'teal.300',
      borderColor: 'rgba(20, 184, 166, 0.24)',
    });
  }

  if (formValue > 6) {
    tags.push({
      label: 'Hot form',
      helperText: 'Averaging high points in recent matches.',
      bg: 'rgba(251, 146, 60, 0.12)',
      color: 'orange.300',
      borderColor: 'rgba(251, 146, 60, 0.24)',
    });
  }

  return tags;
}

type InsightStat = { label: string; value: string };

function buildPositionInsightStats(position: 'GK' | 'DEF' | 'MID' | 'FWD', element: PlayerHeroElement): InsightStat[] {
  const minutes = parseStatNumber(element.minutes);
  const goals = parseStatNumber(element.goals_scored);
  const cleanSheets = parseStatNumber(element.clean_sheets);
  const saves = parseStatNumber(element.saves);
  const bonus = parseStatNumber(element.bonus);
  const xg = parseStatNumber(element.expected_goals);
  const xgi = parseStatNumber(element.expected_goal_involvements);
  const threat = parseStatNumber(element.threat);
  const form = parseStatNumber(element.form);

  const per90 = (stat: number) => (minutes > 0 ? `${((stat / minutes) * 90).toFixed(2)} / 90` : '0.00 / 90');

  if (position === 'GK') {
    return [
      { label: 'Saves', value: String(saves) },
      { label: 'Clean sheets', value: String(cleanSheets) },
      { label: 'Save rate', value: per90(saves) },
      { label: 'Minutes', value: String(minutes) },
    ];
  }

  if (position === 'DEF') {
    return [
      { label: 'Clean sheets', value: String(cleanSheets) },
      { label: 'Bonus', value: String(bonus) },
      { label: 'xGI', value: xgi.toFixed(2) },
      { label: 'Attacking xGI/90', value: per90(xgi) },
    ];
  }

  return [
    { label: 'Goals', value: String(goals) },
    { label: 'xG', value: xg.toFixed(2) },
    { label: 'Threat', value: threat.toFixed(0) },
    { label: 'Form', value: form.toFixed(1) },
  ];
}

function buildInsightText(formValue: number, fixtures: PlayerDetailFixture[]): string {
  const formCue =
    formValue >= 6
      ? 'Recent form is strong.'
      : formValue >= 4
        ? 'Recent form is steady.'
        : 'Recent form is cooling off.';

  const nextFixture = fixtures[0] ?? null;
  if (!nextFixture) {
    return `${formCue} No confirmed next fixture is available yet, so reassess once the schedule updates.`;
  }

  const difficulty = Math.min(5, Math.max(1, nextFixture.difficulty));
  const venue = nextFixture.is_home ? 'at home' : 'away';
  const opponent = nextFixture.opponentTeamShortName || `Team ${nextFixture.opponent_team}`;

  const fixtureCue =
    difficulty <= 2
      ? 'The matchup rates favorable for attacking returns.'
      : difficulty === 3
        ? 'The matchup looks balanced, so expect a moderate ceiling.'
        : 'The matchup is difficult, so expectations should be tempered.';

  return `${formCue} Next up is ${opponent} ${venue} (FDR ${difficulty}). ${fixtureCue}`;
}

export default PlayerHeroCard;
