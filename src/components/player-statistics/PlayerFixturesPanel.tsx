import { useState } from 'react';
import { Badge, Flex, HStack, Image, Stack, Text } from '@chakra-ui/react';
import type { PlayerDetailFixture } from '../../hooks/usePlayerDetail';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

type PlayerFixturesPanelProps = {
  fixtures: PlayerDetailFixture[];
  maxItems?: number;
};

const DEFAULT_MAX_ITEMS = 8;

const PlayerFixturesPanel = ({ fixtures, maxItems = DEFAULT_MAX_ITEMS }: PlayerFixturesPanelProps) => {
  const visibleFixtures = fixtures.slice(0, Math.max(1, maxItems));
  const nextFive = fixtures.slice(0, 5);
  const averageDifficulty =
    nextFive.length > 0
      ? nextFive.reduce((total, fixture) => total + normalizeDifficulty(fixture.difficulty), 0) / nextFive.length
      : null;

  return (
    <DashboardCard>
      <DashboardHeader
        title="Upcoming Fixtures"
        description="Next opponents, venue, and fixture difficulty."
      />

      <Stack px={5} py={4} spacing={3} maxH="24rem" overflowY="auto" sx={cardScrollSx}>
        {averageDifficulty != null ? (
          <Text fontSize="sm" color="slate.300">
            Next 5 outlook: {averageDifficulty.toFixed(1)} average FDR ({difficultyOutlookLabel(averageDifficulty)})
          </Text>
        ) : null}

        {visibleFixtures.length === 0 ? (
          <Text fontSize="sm" color="slate.400">
            No upcoming fixtures are available yet.
          </Text>
        ) : (
          visibleFixtures.map((fixture) => {
            const style = getDifficultyStyle(normalizeDifficulty(fixture.difficulty));
            const opponentLabel = fixture.opponentTeamShortName || fixture.opponentTeamName || `Team ${fixture.opponent_team}`;
            const kickoffLabel = formatKickoffTime(fixture.kickoff_time);

            return (
              <HStack
                key={`${fixture.id}-${fixture.event ?? 'e'}-${fixture.kickoff_time ?? ''}`}
                justify="space-between"
                align="center"
                spacing={3}
                px={3}
                py={2.5}
                borderRadius="lg"
                bg="rgba(30, 41, 59, 0.3)"
                _hover={{ bg: 'rgba(30, 41, 59, 0.6)' }}
              >
                <HStack minW={0} spacing={2}>
                  <OpponentBadge
                    abbr={opponentLabel}
                    badgeUrl={fixture.opponentBadgeUrl}
                  />
                  <Text fontSize="sm" fontWeight="semibold" color="white" noOfLines={1}>
                    {opponentLabel}
                  </Text>
                  <Badge
                    px={2}
                    py={0.5}
                    fontSize="10px"
                    textTransform="uppercase"
                    bg="whiteAlpha.200"
                    color="slate.100"
                    borderRadius="md"
                  >
                    {fixture.is_home ? 'H' : 'A'}
                  </Badge>
                </HStack>

                <HStack spacing={2} flexShrink={0}>
                  {fixture.event != null ? (
                    <Text fontSize="xs" color="slate.500" whiteSpace="nowrap">
                      GW {fixture.event}
                    </Text>
                  ) : null}
                  {kickoffLabel ? (
                    <Text fontSize="xs" color="slate.400" whiteSpace="nowrap">
                      {kickoffLabel}
                    </Text>
                  ) : null}
                  <Badge
                    px={2}
                    py={1}
                    fontSize="10px"
                    textTransform="none"
                    bg={style.bg}
                    color={style.color}
                    borderWidth="1px"
                    borderColor={style.borderColor}
                    borderRadius="md"
                  >
                    FDR {normalizeDifficulty(fixture.difficulty)}
                  </Badge>
                </HStack>
              </HStack>
            );
          })
        )}
      </Stack>
    </DashboardCard>
  );
};

function normalizeDifficulty(difficulty: number): number {
  if (difficulty < 1) return 1;
  if (difficulty > 5) return 5;
  return difficulty;
}

function difficultyOutlookLabel(averageDifficulty: number): string {
  if (averageDifficulty <= 2) return 'favorable';
  if (averageDifficulty <= 3) return 'balanced';
  if (averageDifficulty <= 4) return 'challenging';
  return 'very tough';
}

function formatKickoffTime(kickoffTime: string | null): string | null {
  if (!kickoffTime) {
    return null;
  }

  const parsed = new Date(kickoffTime);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

function getDifficultyStyle(difficulty: number) {
  if (difficulty === 1) {
    return {
      bg: 'rgba(16, 185, 129, 0.12)',
      color: 'brand.400',
      borderColor: 'rgba(16, 185, 129, 0.22)',
    };
  }
  if (difficulty === 2) {
    return {
      bg: 'rgba(34, 197, 94, 0.12)',
      color: 'green.300',
      borderColor: 'rgba(34, 197, 94, 0.22)',
    };
  }
  if (difficulty === 3) {
    return {
      bg: 'rgba(100, 116, 139, 0.12)',
      color: 'slate.300',
      borderColor: 'rgba(100, 116, 139, 0.22)',
    };
  }
  if (difficulty === 4) {
    return {
      bg: 'rgba(251, 146, 60, 0.12)',
      color: 'orange.300',
      borderColor: 'rgba(251, 146, 60, 0.22)',
    };
  }
  return {
    bg: 'rgba(248, 113, 113, 0.12)',
    color: 'red.300',
    borderColor: 'rgba(248, 113, 113, 0.22)',
  };
}

function OpponentBadge({ abbr, badgeUrl }: { abbr: string; badgeUrl?: string }) {
  const [failed, setFailed] = useState(false);
  if (badgeUrl && !failed) {
    return (
      <Image
        src={badgeUrl}
        alt={abbr}
        boxSize={6}
        borderRadius="full"
        objectFit="contain"
        bg="whiteAlpha.50"
        loading="lazy"
        flexShrink={0}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <Flex
      boxSize={6}
      flexShrink={0}
      align="center"
      justify="center"
      borderRadius="full"
      fontSize="7px"
      fontWeight="bold"
      color="white"
      bg="slate.600"
    >
      {abbr.slice(0, 3)}
    </Flex>
  );
}

export default PlayerFixturesPanel;
