import { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, HStack, Stack, Text } from '@chakra-ui/react';
import { getFormLast4 } from '../../api/backend';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

type NormalizedFormPlayer = {
  id: number;
  name: string;
  team: string;
  last4Points: number;
  last4Minutes: number;
  xG?: number;
  xA?: number;
  photoUrl?: string;
};

interface BootstrapElement {
  id: number;
  code: number;
  web_name: string;
  team: number;
}

interface Props {
  bootstrapElements?: BootstrapElement[];
}

const resolvePhotoUrl = (code: number | undefined): string | undefined => {
  if (!code) return undefined;
  return `https://resources.premierleague.com/premierleague25/photos/players/110x140/${code}.png`;
};

type CachedFormPlayer = Omit<NormalizedFormPlayer, 'photoUrl'>;

const IN_FORM_LIMIT = 20;

let cachedFormPlayers: CachedFormPlayer[] | null = null;

const InFormCard = ({ bootstrapElements }: Props) => {
  const [loading, setLoading] = useState(cachedFormPlayers == null);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<NormalizedFormPlayer[]>([]);

  const nameToCode = useMemo(() => {
    const map = new Map<string, number>();
    for (const el of bootstrapElements ?? []) {
      map.set(el.web_name.toLowerCase(), el.code);
    }
    return map;
  }, [bootstrapElements]);

  useEffect(() => {
    if (cachedFormPlayers) {
      setPlayers(cachedFormPlayers.map((player) => ({
        ...player,
        photoUrl: resolvePhotoUrl(nameToCode.get(player.name.toLowerCase())),
      })));
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getFormLast4();

        const normalized: CachedFormPlayer[] = data.map((player, idx) => {
          const id = player.player_id ?? player.element ?? idx;
          const name = player.player_name ?? player.name ?? player.web_name ?? `#${id}`;
          const team = player.team ?? player.team_short_name ?? player.team_name ?? '';
          const last4Points = Number(player.last4_points ?? player.last_4_points ?? player.points_last4 ?? 0);
          const last4Minutes = Number(player.last4_minutes ?? player.last_4_minutes ?? player.minutes_last4 ?? 0);

          return {
            id,
            name,
            team,
            last4Points,
            last4Minutes,
            xG: Number(player.xG ?? player.xg ?? player.expected_goals ?? 0) || undefined,
            xA: Number(player.xA ?? player.xa ?? player.expected_assists ?? 0) || undefined,
          };
        });

        const sorted = normalized.slice().sort((a, b) => {
          if (b.last4Points !== a.last4Points) return b.last4Points - a.last4Points;
          return b.last4Minutes - a.last4Minutes;
        }).slice(0, IN_FORM_LIMIT);

        cachedFormPlayers = sorted;

        if (!cancelled) {
          setPlayers(sorted.map((player) => ({
            ...player,
            photoUrl: resolvePhotoUrl(nameToCode.get(player.name.toLowerCase())),
          })));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load form data');
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
  }, [nameToCode]);

  return (
    <DashboardCard>
      <DashboardHeader title="In Form (Last 4)" description="Players performing well recently" />
      <Box px={5} py={4} maxH="24rem" overflowY="auto" sx={cardScrollSx}>
        {loading ? (
          <Text py={4} textAlign="center" fontSize="sm" color="slate.400">Loading...</Text>
        ) : error ? (
          <Text py={4} textAlign="center" fontSize="sm" color="red.300">{error}</Text>
        ) : players.length === 0 ? (
          <Text py={4} textAlign="center" fontSize="sm" color="slate.400">No data available</Text>
        ) : (
          <Stack spacing={3}>
            {players.map((player, idx) => (
              <Box key={player.id} pb={3} borderBottomWidth={idx === players.length - 1 ? '0' : '1px'} borderColor="whiteAlpha.100">
                <HStack align="flex-start" justify="space-between" gap={2}>
                  <HStack align="center" spacing={2} flex="1" minW={0}>
                    <Text w={5} flexShrink={0} fontSize="xs" fontWeight="bold" color="slate.500">{idx + 1}</Text>
                    <Avatar size="xs" name={player.name} src={player.photoUrl} bg="slate.700" color="slate.300" />
                    <Box minW={0}>
                      <Text noOfLines={1} fontSize="sm" fontWeight="semibold" color="white">{player.name}</Text>
                      <Text fontSize="xs" color="slate.400">{player.team}</Text>
                    </Box>
                  </HStack>
                  <Box textAlign="right" flexShrink={0}>
                    <Text fontSize="sm" fontWeight="bold" color="brand.400">{player.last4Points}</Text>
                    <Text fontSize="10px" color="slate.500">pts</Text>
                  </Box>
                </HStack>
                <HStack mt={1.5} ml={10} spacing={3} fontSize="xs" wrap="wrap">
                  <HStack spacing={1}><Text color="slate.500">Min:</Text><Text color="slate.300" fontWeight="medium">{player.last4Minutes}</Text></HStack>
                  {player.xG !== undefined ? <HStack spacing={1}><Text color="slate.500">xG:</Text><Text color="slate.300" fontWeight="medium">{Number(player.xG).toFixed(2)}</Text></HStack> : null}
                  {player.xA !== undefined ? <HStack spacing={1}><Text color="slate.500">xA:</Text><Text color="slate.300" fontWeight="medium">{Number(player.xA).toFixed(2)}</Text></HStack> : null}
                </HStack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </DashboardCard>
  );
};

export default InFormCard;
