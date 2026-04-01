import {
  Avatar,
  Badge,
  Box,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import {
  elementTypeToPosition,
  getPlayerPhotoUrl,
  type FplBootstrapElement,
} from '../../api/fpl/fpl';
import {
  formatOwnershipPercent,
  formatPriceFromNowCost,
  parseStatNumber,
} from '../../utils/playerStatsFormat';
import { DashboardCard } from '../ui/dashboard';

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
> & {
  teamName: string;
  teamShortName: string;
};

export type PlayerHeroCardProps = {
  element: PlayerHeroElement;
  teamBadgeLabel?: string;
};

const PlayerHeroCard = ({ element, teamBadgeLabel }: PlayerHeroCardProps) => {
  const ownership = parseStatNumber(element.selected_by_percent);
  const formValue = parseStatNumber(element.form);
  const availability = resolveAvailability(element);
  const ruleTags = getRuleTags(ownership, formValue);

  const overviewStats = [
    { label: 'Total points', value: String(element.total_points ?? 0) },
    { label: 'Minutes', value: String(element.minutes ?? 0) },
    { label: 'Goals', value: String(element.goals_scored ?? 0) },
    { label: 'Assists', value: String(element.assists ?? 0) },
    {
      label: 'xGI',
      value: parseStatNumber(element.expected_goal_involvements).toFixed(2),
    },
    { label: 'Bonus', value: String(element.bonus ?? 0) },
  ];

  return (
    <Stack spacing={4}>
      <DashboardCard px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}>
        <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 4, md: 5 }} align={{ base: 'flex-start', md: 'center' }}>
          <Avatar
            size="2xl"
            name={element.web_name}
            src={getPlayerPhotoUrl(element.code, '250x250')}
            bg="slate.700"
          />

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
                  {elementTypeToPosition(element.element_type)}
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
      </DashboardCard>

      <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} spacing={3}>
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

type MetricTextProps = {
  label: string;
  value: string;
};

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

export default PlayerHeroCard;
