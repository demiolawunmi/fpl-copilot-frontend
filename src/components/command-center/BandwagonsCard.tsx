import { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, HStack, Stack, Text } from '@chakra-ui/react';
import { getBandwagons } from '../../api/backend';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

type NormalizedBandwagonPlayer = {
  id: number;
  name: string;
  team: string;
  transfersIn: number;
  transfersOut: number;
  balance: number;
  photoUrl?: string;
};

interface BootstrapElement {
  id: number;
  code: number;
  web_name: string;
  team: number;
}

interface Props {
  /** FPL bootstrap elements list – used to resolve player photos */
  bootstrapElements?: BootstrapElement[];
}

const resolvePhotoUrl = (
  code: number | undefined,
): string | undefined => {
  if (!code) return undefined;
  return `https://resources.premierleague.com/premierleague25/photos/players/110x140/${code}.png`;
};

const compactNumber = new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
});

const formatCompact = (value: number) => compactNumber.format(value);

const BANDWAGONS_LIMIT = 10;

let cachedBandwagons: NormalizedBandwagonPlayer[] | null = null;

const BandwagonsCard = ({ bootstrapElements }: Props) => {
  const [loading, setLoading] = useState(cachedBandwagons == null);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<NormalizedBandwagonPlayer[]>(cachedBandwagons ?? []);

  const nameToCode = useMemo(() => {
    const map = new Map<string, number>();
    for (const el of bootstrapElements ?? []) {
      map.set(el.web_name.toLowerCase(), el.code);
    }
    return map;
  }, [bootstrapElements]);

  useEffect(() => {
    if (cachedBandwagons) {
      setPlayers(cachedBandwagons.map((player) => {
        if (player.photoUrl) return player;
        const code = nameToCode.get(player.name.toLowerCase());
        return { ...player, photoUrl: resolvePhotoUrl(code) };
      }));
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getBandwagons();

        const normalized: NormalizedBandwagonPlayer[] = data.map((player, idx) => {
          const id = player.player_id ?? player.element ?? idx;
          const name = player.player_name ?? player.name ?? player.web_name ?? `#${id}`;
          const team = player.team ?? player.team_short_name ?? player.team_name ?? '';
          const transfersIn = Number(player.transfers_in ?? 0);
          const transfersOut = Number(player.transfers_out ?? 0);
          const balance = Number(player.transfers_balance ?? (transfersIn - transfersOut));

          let photoUrl = player.photo_url;
          if (!photoUrl) {
            const code = player.code ?? nameToCode.get(name.toLowerCase());
            photoUrl = resolvePhotoUrl(code);
          }

          return { id, name, team, transfersIn, transfersOut, balance, photoUrl };
        });

        const sorted = normalized.slice().sort((a, b) => {
          const magnitudeDelta = Math.abs(b.balance) - Math.abs(a.balance);
          if (magnitudeDelta !== 0) return magnitudeDelta;
          return b.balance - a.balance;
        }).slice(0, BANDWAGONS_LIMIT);
        cachedBandwagons = sorted;

        if (!cancelled) {
          setPlayers(sorted);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load bandwagons data');
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
      <DashboardHeader title="Bandwagons" description="Most transferred players" />
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
                    <Text fontSize="sm" fontWeight="bold" color={player.balance < 0 ? 'red.300' : player.balance > 0 ? 'brand.400' : 'slate.300'}>
                      {player.balance > 0 ? '+' : ''}{formatCompact(player.balance)}
                    </Text>
                    <Text fontSize="10px" color="slate.500">net</Text>
                  </Box>
                </HStack>
                <HStack mt={1.5} ml={10} spacing={3} fontSize="xs" wrap="wrap">
                  <HStack spacing={1}><Text color="slate.500">In:</Text><Text color="brand.400" fontWeight="medium">{formatCompact(player.transfersIn)}</Text></HStack>
                  <HStack spacing={1}><Text color="slate.500">Out:</Text><Text color="red.300" fontWeight="medium">{formatCompact(player.transfersOut)}</Text></HStack>
                </HStack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </DashboardCard>
  );
};

export default BandwagonsCard;
