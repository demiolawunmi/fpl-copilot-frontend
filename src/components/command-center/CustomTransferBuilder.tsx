import { useState, useMemo } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  Stack,
  Tag,
  Text,
} from '@chakra-ui/react';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';
import { getDifficultyColor } from '../../utils/difficulty';
import type { EnhancedPlayer } from '../../data/commandCenterMocks';
import type { PredictionPlayer, PlayerFixture } from '../../api/backend';

type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

interface BootstrapElement {
  id: number;
  code: number;
  web_name: string;
  element_type: number;
  team: number;
  now_cost?: number;
  total_points?: number;
  form?: string;
  selected_by_percent?: string;
}

interface BootstrapTeam {
  id: number;
  short_name: string;
  name: string;
}

export interface CustomTransferBuilderProps {
  squad: EnhancedPlayer[];
  bootstrapElements: BootstrapElement[];
  bootstrapTeams: BootstrapTeam[];
  lookupPrediction: (name: string, teamAbbr?: string) => PredictionPlayer | undefined;
  fixturesByName: Map<string, PlayerFixture>;
  onTransfer: (playerInId: number, playerOutId: number) => void;
}

// ── helpers ──

const ELEM_POS: Record<number, Position> = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
const ALL_POSITIONS: Position[] = ['GK', 'DEF', 'MID', 'FWD'];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const mkPhoto = (code: number) =>
  `https://resources.premierleague.com/premierleague25/photos/players/110x140/${code}.png`;

function avgDiff5(fixtures: PlayerFixture['fixtures'] | undefined): number | null {
  if (!fixtures || fixtures.length === 0) return null;
  const n = Math.min(fixtures.length, 5);
  return fixtures.slice(0, n).reduce((s, f) => s + (f.difficulty ?? 3), 0) / n;
}

function nextFixtureLabel(fixtures: PlayerFixture['fixtures'] | undefined): string | null {
  if (!fixtures || fixtures.length === 0) return null;
  const f = fixtures[0];
  return `${f.is_home ? 'H' : 'A'} ${f.opponent_short}`;
}

interface RowData {
  id: number;
  name: string;
  position: Position;
  teamAbbr: string;
  xPts: number;
  avgDiff: number | null;
  photoUrl: string | undefined;
  price: number;
  form: number;
  ownership: number;
  nextFixture: string | null;
  isBench?: boolean;
}

type SortKey = 'xPts' | 'price' | 'avgDiff' | 'form' | 'ownership';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'xPts', label: 'xP' },
  { key: 'price', label: 'Price' },
  { key: 'avgDiff', label: 'FDR' },
  { key: 'form', label: 'Form' },
  { key: 'ownership', label: 'Sel%' },
];

function sortRows(rows: RowData[], key: SortKey, dir: SortDir): RowData[] {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    const va = a[key] ?? (dir === 'asc' ? Infinity : -Infinity);
    const vb = b[key] ?? (dir === 'asc' ? Infinity : -Infinity);
    return dir === 'desc' ? (vb as number) - (va as number) : (va as number) - (vb as number);
  });
  return sorted;
}

// ── sub-components ──

function DiffBadge({ value }: { value: number | null }) {
  if (value == null) {
    return <Text fontSize="10px" color="slate.600" minW="30px" textAlign="center">–</Text>;
  }
  const colorName = getDifficultyColor(Math.round(value));
  const styles: Record<string, { bg: string; color: string }> = {
    emerald: { bg: 'rgba(16, 185, 129, 0.2)', color: 'green.300' },
    yellow: { bg: 'rgba(250, 204, 21, 0.2)', color: 'yellow.300' },
    rose: { bg: 'rgba(244, 63, 94, 0.2)', color: 'red.300' },
  };
  const s = styles[colorName] ?? styles.yellow;
  return (
    <Tag
      size="sm"
      bg={s.bg}
      color={s.color}
      borderRadius="full"
      fontWeight="bold"
      fontSize="10px"
      minW="30px"
      justifyContent="center"
    >
      {value.toFixed(1)}
    </Tag>
  );
}

const POS_COLORS: Record<Position, string> = {
  GK: 'yellow',
  DEF: 'green',
  MID: 'blue',
  FWD: 'red',
};

function PlayerRow({
  player,
  actionLabel,
  actionColor = 'blue',
  onAction,
  onRowClick,
}: {
  player: RowData;
  actionLabel?: string;
  actionColor?: string;
  onAction?: () => void;
  onRowClick?: () => void;
}) {
  return (
    <Flex
      align="center"
      gap={2}
      py={2}
      px={3}
      cursor={onRowClick ? 'pointer' : undefined}
      onClick={onRowClick}
      bg="transparent"
      borderRadius="md"
      _hover={onRowClick ? { bg: 'whiteAlpha.50' } : undefined}
      transition="background 0.15s"
    >
      <Avatar
        size="sm"
        name={player.name}
        src={player.photoUrl}
        bg="slate.700"
        color="slate.300"
      />

      {/* Name + meta subtitle */}
      <Box flex="1" minW={0}>
        <HStack spacing={1.5} mb={0.5}>
          <Text noOfLines={1} fontSize="sm" fontWeight="semibold" color="white">
            {player.name}
          </Text>
          <Badge
            fontSize="9px"
            px={1}
            borderRadius="sm"
            colorScheme={POS_COLORS[player.position]}
            variant="subtle"
          >
            {player.position}
          </Badge>
          {player.isBench && (
            <Badge fontSize="9px" px={1} borderRadius="sm" colorScheme="gray" variant="outline">
              BENCH
            </Badge>
          )}
        </HStack>
        <HStack spacing={1} divider={<Text color="slate.700" fontSize="9px">·</Text>}>
          <Text fontSize="xs" color="slate.400">{player.teamAbbr}</Text>
          {player.price > 0 && (
            <Text fontSize="xs" color="slate.400">£{player.price.toFixed(1)}m</Text>
          )}
          {player.nextFixture && (
            <Text fontSize="xs" color="slate.500">{player.nextFixture}</Text>
          )}
        </HStack>
      </Box>

      {/* Form — color-coded: green ≥ 6, orange 3–5.9, red < 3 */}
      <Text
        fontSize="xs"
        fontWeight="bold"
        color={
          player.form <= 0 ? 'slate.600'
            : player.form >= 6 ? 'green.300'
            : player.form >= 3 ? 'orange.300'
            : 'red.300'
        }
        minW="28px"
        textAlign="right"
        flexShrink={0}
      >
        {player.form > 0 ? player.form.toFixed(1) : '–'}
      </Text>

      {/* xP */}
      <Text fontSize="sm" fontWeight="bold" color="blue.300" minW="32px" textAlign="right" flexShrink={0}>
        {player.xPts > 0 ? player.xPts.toFixed(1) : '–'}
      </Text>

      {/* Sel% */}
      <Text fontSize="xs" fontWeight="medium" color="slate.400" minW="34px" textAlign="right" flexShrink={0}>
        {player.ownership > 0 ? `${player.ownership.toFixed(1)}%` : '–'}
      </Text>

      {/* FDR */}
      <DiffBadge value={player.avgDiff} />

      {/* Action */}
      {actionLabel && onAction ? (
        <Button
          size="xs"
          variant={actionLabel === 'In' ? 'solid' : 'outline'}
          colorScheme={actionColor}
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          fontSize="10px"
          h="24px"
          px={2.5}
          minW="40px"
        >
          {actionLabel}
        </Button>
      ) : (
        <Box w="40px" />
      )}
    </Flex>
  );
}

// ── sort header chip ──

function SortChip({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <IconButton
      aria-label={`Sort by ${label}`}
      size="xs"
      variant={active ? 'solid' : 'ghost'}
      colorScheme={active ? 'blue' : 'gray'}
      color={active ? undefined : 'slate.500'}
      onClick={onClick}
      h="22px"
      px={2}
      minW="auto"
      fontSize="10px"
      fontWeight={active ? 'bold' : 'medium'}
      icon={
        <Text as="span" fontSize="10px">
          {label} {active ? (dir === 'desc' ? '↓' : '↑') : ''}
        </Text>
      }
    />
  );
}

// ── main component ──

const CustomTransferBuilder = ({
  squad,
  bootstrapElements,
  bootstrapTeams,
  lookupPrediction,
  fixturesByName,
  onTransfer,
}: CustomTransferBuilderProps) => {
  const [selectedOutId, setSelectedOutId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState<Position | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('xPts');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const teamMap = useMemo(
    () => new Map(bootstrapTeams.map((t) => [t.id, t])),
    [bootstrapTeams],
  );

  const squadIds = useMemo(() => new Set(squad.map((p) => p.id)), [squad]);

  const selectedOut = useMemo(
    () => (selectedOutId != null ? squad.find((p) => p.id === selectedOutId) ?? null : null),
    [squad, selectedOutId],
  );

  const bootstrapById = useMemo(
    () => new Map(bootstrapElements.map((el) => [el.id, el])),
    [bootstrapElements],
  );

  const squadRows = useMemo<RowData[]>(
    () =>
      squad.map((p) => {
        const fixture = fixturesByName.get(norm(p.name));
        const bel = bootstrapById.get(p.id);
        return {
          id: p.id,
          name: p.name,
          position: p.position,
          teamAbbr: p.teamAbbr,
          xPts: p.xPts,
          avgDiff: avgDiff5(fixture?.fixtures),
          photoUrl: p.photoUrl,
          price: bel?.now_cost ? bel.now_cost / 10 : p.price,
          form: Number(bel?.form ?? 0),
          ownership: Number(bel?.selected_by_percent ?? p.ownership ?? 0),
          nextFixture: nextFixtureLabel(fixture?.fixtures),
          isBench: p.isBench,
        };
      }),
    [squad, fixturesByName, bootstrapById],
  );

  const availableRows = useMemo<RowData[]>(() => {
    return bootstrapElements
      .filter((el) => !squadIds.has(el.id))
      .map((el) => {
        const pos = ELEM_POS[el.element_type];
        if (!pos) return null;
        const team = teamMap.get(el.team);
        const abbr = team?.short_name ?? '';
        const pred = lookupPrediction(el.web_name, abbr);
        const fixture = fixturesByName.get(norm(el.web_name));
        return {
          id: el.id,
          name: el.web_name,
          position: pos,
          teamAbbr: abbr,
          xPts: pred?.xp ?? 0,
          avgDiff: avgDiff5(fixture?.fixtures),
          photoUrl: mkPhoto(el.code),
          price: el.now_cost ? el.now_cost / 10 : 0,
          form: Number(el.form ?? 0),
          ownership: Number(el.selected_by_percent ?? 0),
          nextFixture: nextFixtureLabel(fixture?.fixtures),
        } as RowData;
      })
      .filter((r): r is RowData => r != null);
  }, [bootstrapElements, squadIds, teamMap, lookupPrediction, fixturesByName]);

  const effectivePos = selectedOut ? selectedOut.position : posFilter;
  const q = norm(search);

  const matchesFilter = (p: RowData) => {
    if (effectivePos && p.position !== effectivePos) return false;
    if (q && !norm(p.name).includes(q) && !norm(p.teamAbbr).includes(q)) return false;
    return true;
  };

  const filteredSquad = useMemo(
    () => sortRows(squadRows.filter(matchesFilter), sortKey, sortDir),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [squadRows, effectivePos, q, sortKey, sortDir],
  );

  const filteredAvailable = useMemo(
    () => sortRows(availableRows.filter(matchesFilter), sortKey, sortDir).slice(0, 100),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [availableRows, effectivePos, q, sortKey, sortDir],
  );

  const handleSortToggle = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'avgDiff' ? 'asc' : 'desc');
    }
  };

  const handleSelectOut = (id: number) => {
    setSelectedOutId(id);
    setSearch('');
  };

  const handleTransferIn = (playerInId: number) => {
    if (selectedOutId == null) return;
    onTransfer(playerInId, selectedOutId);
    setSelectedOutId(null);
    setSearch('');
  };

  const handleCancel = () => {
    setSelectedOutId(null);
    setSearch('');
  };

  if (bootstrapElements.length === 0) {
    return (
      <DashboardCard>
        <DashboardHeader title="Custom Transfer Builder" />
        <Box px={5} py={6}>
          <Text textAlign="center" color="slate.500" fontSize="sm">
            Loading player data…
          </Text>
        </Box>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <DashboardHeader
        title="Custom Transfer Builder"
        description="Make transfers in your sandbox squad — changes are applied instantly to the pitch below"
      />

      {/* ─── Step indicator ─── */}
      {!selectedOut ? (
        <Box px={4} py={2} bg="rgba(59, 130, 246, 0.06)" borderBottomWidth="1px" borderColor="whiteAlpha.100">
          <Text fontSize="xs" color="blue.300" fontWeight="semibold">
            Step 1 of 2 — Pick a player from your squad to transfer out
          </Text>
          <Text fontSize="11px" color="slate.500">
            Tap a player row or press the red "Out" button
          </Text>
        </Box>
      ) : (
        <Stack spacing={0}>
          <Flex
            align="center"
            gap={2}
            px={4}
            py={2}
            bg="rgba(244, 63, 94, 0.08)"
            borderBottomWidth="1px"
            borderColor="whiteAlpha.100"
          >
            <Avatar size="sm" name={selectedOut.name} src={selectedOut.photoUrl} bg="slate.700" />
            <Box flex="1" minW={0}>
              <Text fontSize="10px" color="slate.500">Removing from squad</Text>
              <Text fontSize="sm" fontWeight="bold" color="red.300" noOfLines={1}>
                {selectedOut.name}
                <Text as="span" fontSize="xs" fontWeight="normal" color="slate.500">
                  {' '}({selectedOut.position} · {selectedOut.teamAbbr})
                </Text>
              </Text>
            </Box>
            <Button size="xs" variant="outline" colorScheme="gray" onClick={handleCancel}>
              Cancel
            </Button>
          </Flex>

          <Box px={4} py={2} bg="rgba(16, 185, 129, 0.06)" borderBottomWidth="1px" borderColor="whiteAlpha.100">
            <Text fontSize="xs" color="green.300" fontWeight="semibold">
              Step 2 of 2 — Pick a replacement ({selectedOut.position})
            </Text>
            <Text fontSize="11px" color="slate.500">
              Tap a player or press the green "In" button — the transfer updates your sandbox pitch
            </Text>
          </Box>
        </Stack>
      )}

      <Stack spacing={0}>
        {/* Position filter + search */}
        <Stack spacing={2} px={4} py={3}>
          <HStack spacing={1} flexWrap="wrap">
            <Button
              size="xs"
              variant={effectivePos == null ? 'solid' : 'ghost'}
              colorScheme={effectivePos == null ? 'blue' : 'gray'}
              color={effectivePos == null ? undefined : 'slate.400'}
              onClick={() => setPosFilter(null)}
              isDisabled={selectedOut != null}
              fontSize="10px"
              h="24px"
            >
              ALL
            </Button>
            {ALL_POSITIONS.map((pos) => (
              <Button
                key={pos}
                size="xs"
                variant={effectivePos === pos ? 'solid' : 'ghost'}
                colorScheme={effectivePos === pos ? 'blue' : 'gray'}
                color={effectivePos === pos ? undefined : 'slate.400'}
                onClick={() => setPosFilter(pos)}
                isDisabled={selectedOut != null}
                fontSize="10px"
                h="24px"
              >
                {pos}
              </Button>
            ))}
          </HStack>

          <Input
            placeholder="Search by name or team…"
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="whiteAlpha.50"
            borderColor="whiteAlpha.200"
            color="white"
            _placeholder={{ color: 'slate.500' }}
          />
        </Stack>

        {/* Sort controls */}
        <Flex px={4} pb={2} gap={1} align="center" flexWrap="wrap">
          <Text fontSize="9px" color="slate.600" textTransform="uppercase" mr={1}>
            Sort
          </Text>
          {SORT_OPTIONS.map((opt) => (
            <SortChip
              key={opt.key}
              label={opt.label}
              active={sortKey === opt.key}
              dir={sortDir}
              onClick={() => handleSortToggle(opt.key)}
            />
          ))}
        </Flex>

        {/* Column headers */}
        <Flex px={4} py={1} gap={2} align="center">
          <Box w="32px" />
          <Text flex="1" fontSize="9px" color="slate.600" textTransform="uppercase" letterSpacing="wider">
            Player
          </Text>
          <Text fontSize="9px" color="slate.600" textTransform="uppercase" minW="28px" textAlign="right">
            Form
          </Text>
          <Text fontSize="9px" color="slate.600" textTransform="uppercase" minW="32px" textAlign="right">
            xP
          </Text>
          <Text fontSize="9px" color="slate.600" textTransform="uppercase" minW="34px" textAlign="right">
            Sel%
          </Text>
          <Text fontSize="9px" color="slate.600" textTransform="uppercase" minW="30px" textAlign="center">
            FDR
          </Text>
          <Box w="40px" />
        </Flex>

        {/* Scrollable list */}
        <Box maxH="520px" overflowY="auto" sx={cardScrollSx} pb={2}>
          {/* Your Squad (shown in step 1) */}
          {!selectedOut && filteredSquad.length > 0 && (
            <>
              <Text
                px={4}
                pt={2}
                pb={1}
                fontSize="10px"
                fontWeight="bold"
                color="slate.500"
                textTransform="uppercase"
                letterSpacing="widest"
              >
                Your Squad ({filteredSquad.length})
              </Text>
              {filteredSquad.map((p) => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  actionLabel="Out"
                  actionColor="red"
                  onAction={() => handleSelectOut(p.id)}
                  onRowClick={() => handleSelectOut(p.id)}
                />
              ))}
            </>
          )}

          {/* Available Players */}
          <Text
            px={4}
            pt={3}
            pb={1}
            fontSize="10px"
            fontWeight="bold"
            color="slate.500"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            {selectedOut
              ? `Available ${selectedOut.position}s (${filteredAvailable.length})`
              : `All Players (${filteredAvailable.length})`}
          </Text>
          {filteredAvailable.length > 0 ? (
            filteredAvailable.map((p) => (
              <PlayerRow
                key={p.id}
                player={p}
                actionLabel={selectedOut ? 'In' : undefined}
                actionColor="green"
                onAction={selectedOut ? () => handleTransferIn(p.id) : undefined}
                onRowClick={selectedOut ? () => handleTransferIn(p.id) : undefined}
              />
            ))
          ) : (
            <Text px={4} py={4} fontSize="sm" color="slate.600" textAlign="center">
              No players match your filters
            </Text>
          )}
        </Box>
      </Stack>
    </DashboardCard>
  );
};

export default CustomTransferBuilder;
