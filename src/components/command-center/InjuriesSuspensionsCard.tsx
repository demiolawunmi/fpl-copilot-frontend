import { useEffect, useState } from 'react';
import { Badge, Box, HStack, Stack, Text } from '@chakra-ui/react';
import { getInjuryNews, type InjuryNewsPlayer } from '../../api/backend';
import type { InjurySuspension } from '../../data/commandCenterMocks';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

interface Props {
  fallbackInjuries?: InjurySuspension[];
}

const EMPTY_INJURIES: InjurySuspension[] = [];

const statusStyle = (status: InjurySuspension['status']) => {
  if (status === 'Injured') return { bg: 'rgba(248, 113, 113, 0.12)', color: 'red.300', borderColor: 'rgba(248, 113, 113, 0.22)' };
  if (status === 'Suspended') return { bg: 'rgba(250, 204, 21, 0.12)', color: 'yellow.300', borderColor: 'rgba(250, 204, 21, 0.22)' };
  return { bg: 'rgba(251, 146, 60, 0.12)', color: 'orange.300', borderColor: 'rgba(251, 146, 60, 0.22)' };
};

const suspensionKeywords = /(suspend|suspension|ban|banned|red card|accumulation)/i;
const injuryKeywords = /(injur|knock|illness|fit|fitness|hamstring|groin|ankle|knee|calf|thigh|foot|back|hip|shoulder|muscle|virus|concussion)/i;
const transferKeywords = /(joined|loan|permanently|transfer|contract|released|left the club|has joined)/i;

const toChance = (item: InjuryNewsPlayer) => {
  const directChance = item.chance_next_round ?? item.chance_of_playing_next_round ?? item.chance_this_round;
  if (directChance != null) return directChance;
  if (item.prob_available == null) return null;
  return Math.round(item.prob_available * 100);
};

const isRelevantInjury = (item: InjuryNewsPlayer) => {
  const news = item.source_news?.trim() ?? item.news?.trim() ?? '';
  if (!news && toChance(item) == null) return false;
  if (suspensionKeywords.test(news) || injuryKeywords.test(news)) return true;
  if (transferKeywords.test(news)) return false;
  const chance = toChance(item);
  return chance != null && chance < 100;
};

const normalizeInjury = (item: InjuryNewsPlayer): InjurySuspension | null => {
  if (!isRelevantInjury(item)) return null;

  const news = item.source_news?.trim() ?? item.news?.trim() ?? 'Status update pending';
  const chance = toChance(item);
  const rawStatus = item.status?.toLowerCase() ?? '';

  let status: InjurySuspension['status'];
  if (suspensionKeywords.test(news) || rawStatus.includes('suspend')) {
    status = 'Suspended';
  } else if ((chance ?? 0) >= 50 || rawStatus.includes('doubt') || /75%|50%|25% chance/i.test(news)) {
    status = 'Doubtful';
  } else {
    status = 'Injured';
  }

  const expectedReturn = chance == null
    ? 'Unknown'
    : chance >= 100
      ? 'Available'
      : `${chance}% chance next GW`;

  return {
    player: item.name ?? item.player_name ?? item.web_name ?? `#${item.player_id ?? item.id ?? item.element ?? 'Unknown'}`,
    team: item.team ?? item.team_code ?? item.team_short_name ?? item.team_name ?? '',
    status,
    expectedReturn,
    details: news,
  };
};

let cachedInjuryNews: InjurySuspension[] | null = null;

const InjuriesSuspensionsCard = ({ fallbackInjuries = EMPTY_INJURIES }: Props) => {
  const [loading, setLoading] = useState(cachedInjuryNews == null);
  const [error, setError] = useState<string | null>(null);
  const [injuries, setInjuries] = useState<InjurySuspension[]>(cachedInjuryNews ?? fallbackInjuries);

  useEffect(() => {
    if (cachedInjuryNews) {
      setInjuries(cachedInjuryNews);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getInjuryNews();
        const normalized = data
          .map(normalizeInjury)
          .filter((item): item is InjurySuspension => item != null);

        cachedInjuryNews = normalized;

        if (!cancelled) {
          setInjuries(normalized);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load injury news');
          setInjuries(fallbackInjuries);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [fallbackInjuries]);

  return (
    <DashboardCard>
      <DashboardHeader title="Injuries & Suspensions" />
      <Stack px={5} py={4} spacing={3} maxH="20rem" overflowY="auto" sx={cardScrollSx}>
        {loading ? (
          <Text py={4} textAlign="center" fontSize="sm" color="slate.400">Loading...</Text>
        ) : error ? (
          <Text py={4} textAlign="center" fontSize="sm" color="red.300">{error}</Text>
        ) : injuries.length === 0 ? (
          <Text py={4} textAlign="center" fontSize="sm" color="slate.400">No injury or suspension news found</Text>
        ) : (
          injuries.map((injury, idx) => {
            const palette = statusStyle(injury.status);
            return (
              <Box key={`${injury.player}-${idx}`} pb={3} borderBottomWidth={idx === injuries.length - 1 ? '0' : '1px'} borderColor="whiteAlpha.100">
                <HStack align="flex-start" justify="space-between" gap={2}>
                  <Box flex="1" minW={0}>
                    <Text noOfLines={1} fontSize="sm" fontWeight="semibold" color="white">
                      {injury.player}
                    </Text>
                    <Text fontSize="xs" color="slate.400">
                      {injury.team}
                    </Text>
                  </Box>
                  <Badge
                    flexShrink={0}
                    px={2}
                    py={1}
                    fontSize="10px"
                    textTransform="none"
                    borderRadius="md"
                    bg={palette.bg}
                    color={palette.color}
                    borderWidth="1px"
                    borderColor={palette.borderColor}
                  >
                    {injury.status}
                  </Badge>
                </HStack>
                <Text mt={2} fontSize="xs" color="slate.300">
                  {injury.details}
                </Text>
                <HStack mt={2} spacing={2}>
                  <Text fontSize="xs" color="slate.500">Return:</Text>
                  <Text fontSize="xs" fontWeight="medium" color="brand.400">{injury.expectedReturn}</Text>
                </HStack>
              </Box>
            );
          })
        )}
      </Stack>
    </DashboardCard>
  );
};

export default InjuriesSuspensionsCard;
