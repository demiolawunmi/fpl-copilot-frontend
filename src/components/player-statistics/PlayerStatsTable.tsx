import {
  Badge,
  Box,
  Button,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import type { PlayerStatsColumnKey } from './PlayerStatsFilters';
import type { PlayerStatsFixturePill, PlayerStatsRowModel } from '../../utils/playerStatsModel';
import { cardScrollSx } from '../ui/dashboard';

type SortDirection = 'asc' | 'desc';

type SortableColumnKey = Exclude<PlayerStatsColumnKey, 'nextFixtures'>;

type SortState = {
  key: SortableColumnKey;
  direction: SortDirection;
};

type PlayerStatsTableProps = {
  rows: PlayerStatsRowModel[];
  visibleColumns: PlayerStatsColumnKey[];
  onRowSelect?: (id: number) => void;
  onViewClick?: (id: number) => void;
  selectedRowId?: number;
  isLoading?: boolean;
  pageSize?: number;
  emptyText?: string;
};

const COLUMN_LABELS: Record<PlayerStatsColumnKey, string> = {
  name: 'Name',
  team: 'Team',
  pos: 'Position',
  price: 'Price',
  ownership: 'Ownership',
  minutes: 'Minutes',
  points: 'Points',
  xPts: 'xPts',
  goals: 'Goals',
  assists: 'Assists',
  xG: 'xG',
  xA: 'xA',
  xGI: 'xGI',
  goalsPer90: 'Goals/90',
  xGPer90: 'xG/90',
  nextFixtures: 'Next fixtures',
};

const SORTABLE_COLUMNS: Set<SortableColumnKey> = new Set([
  'name',
  'team',
  'pos',
  'price',
  'ownership',
  'minutes',
  'points',
  'xPts',
  'goals',
  'assists',
  'xG',
  'xA',
  'xGI',
  'goalsPer90',
  'xGPer90',
]);

const DEFAULT_PAGE_SIZE = 25;

const PlayerStatsTable = ({
  rows,
  visibleColumns,
  onRowSelect,
  onViewClick,
  selectedRowId,
  isLoading = false,
  pageSize = DEFAULT_PAGE_SIZE,
  emptyText = 'No players match the selected filters.',
}: PlayerStatsTableProps) => {
  const [sort, setSort] = useState<SortState>({ key: 'points', direction: 'desc' });
  const [page, setPage] = useState(1);

  const normalizedPageSize = Math.max(1, pageSize);

  const normalizedVisibleColumns = useMemo(
    () => visibleColumns.filter((column): column is PlayerStatsColumnKey => column in COLUMN_LABELS),
    [visibleColumns]
  );

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => compareRows(a, b, sort));
    return copy;
  }, [rows, sort]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / normalizedPageSize));
  const normalizedPage = Math.min(page, pageCount);

  const pageRows = useMemo(() => {
    const start = (normalizedPage - 1) * normalizedPageSize;
    return sortedRows.slice(start, start + normalizedPageSize);
  }, [normalizedPage, normalizedPageSize, sortedRows]);

  const startIndex = sortedRows.length === 0 ? 0 : (normalizedPage - 1) * normalizedPageSize + 1;
  const endIndex = sortedRows.length === 0 ? 0 : Math.min(normalizedPage * normalizedPageSize, sortedRows.length);

  return (
    <Box>
      <TableContainer overflowX="auto" sx={cardScrollSx}>
        <Table variant="simple" size="sm" minW="max-content" sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <Thead>
            <Tr>
              {normalizedVisibleColumns.map((column) => {
                const sortable = SORTABLE_COLUMNS.has(column as SortableColumnKey);
                const isSorted = sortable && sort.key === column;

                return (
                  <Th
                    key={column}
                    position="sticky"
                    top={0}
                    zIndex={1}
                    bg="slate.900"
                    whiteSpace="nowrap"
                    aria-sort={
                      sortable
                        ? isSorted
                          ? sort.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                        : undefined
                    }
                  >
                    {sortable ? (
                      <Button
                        variant="ghost"
                        size="xs"
                        p={0}
                        minW="auto"
                        h="auto"
                        color="slate.300"
                        _hover={{ bg: 'whiteAlpha.200' }}
                        onClick={() => setSort((current) => nextSortState(current, column as SortableColumnKey))}
                        aria-label={`Sort by ${COLUMN_LABELS[column]}`}
                      >
                        <HStack spacing={1}>
                          <Text as="span" fontSize="xs" textTransform="uppercase" letterSpacing="wider">
                            {COLUMN_LABELS[column]}
                          </Text>
                          <Text as="span" fontSize="xs" color={isSorted ? 'brand.300' : 'slate.500'}>
                            {isSorted ? (sort.direction === 'asc' ? '▲' : '▼') : '↕'}
                          </Text>
                        </HStack>
                      </Button>
                    ) : (
                      <Text as="span" fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="slate.300">
                        {COLUMN_LABELS[column]}
                      </Text>
                    )}
                  </Th>
                );
              })}
              {onViewClick ? (
                <Th
                  position="sticky"
                  top={0}
                  zIndex={1}
                  bg="slate.900"
                  textAlign="right"
                  whiteSpace="nowrap"
                >
                  <Text as="span" fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="slate.300">
                    Action
                  </Text>
                </Th>
              ) : null}
            </Tr>
          </Thead>

          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={normalizedVisibleColumns.length + (onViewClick ? 1 : 0)} py={6}>
                  <Text color="slate.400" textAlign="center">
                    Loading player statistics...
                  </Text>
                </Td>
              </Tr>
            ) : null}

            {!isLoading && pageRows.length === 0 ? (
              <Tr>
                <Td colSpan={normalizedVisibleColumns.length + (onViewClick ? 1 : 0)} py={6}>
                  <Text color="slate.400" textAlign="center">
                    {emptyText}
                  </Text>
                </Td>
              </Tr>
            ) : null}

            {!isLoading
              ? pageRows.map((row) => {
                  const isClickable = Boolean(onRowSelect);
                  const isSelected = selectedRowId != null && selectedRowId === row.id;

                  return (
                    <Tr
                      key={row.id}
                      tabIndex={isClickable ? 0 : -1}
                      role={isClickable ? 'button' : undefined}
                      cursor={isClickable ? 'pointer' : undefined}
                      bg={isSelected ? 'rgba(56, 189, 248, 0.12)' : undefined}
                      _hover={{ bg: 'whiteAlpha.100' }}
                      _focusVisible={{ outline: '2px solid', outlineColor: 'brand.300', outlineOffset: '-2px' }}
                      onClick={() => onRowSelect?.(row.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          onRowSelect?.(row.id);
                        }
                      }}
                    >
                      {normalizedVisibleColumns.map((column) => (
                        <Td key={`${row.id}-${column}`} whiteSpace="nowrap">
                          {renderCell(row, column)}
                        </Td>
                      ))}
                      {onViewClick ? (
                        <Td textAlign="right" whiteSpace="nowrap">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={(event) => {
                              event.stopPropagation();
                              onViewClick(row.id);
                            }}
                            aria-label={`View ${row.name}`}
                          >
                            View
                          </Button>
                        </Td>
                      ) : null}
                    </Tr>
                  );
                })
              : null}
          </Tbody>
        </Table>
      </TableContainer>

      <HStack justify="space-between" mt={4} spacing={4} flexWrap="wrap">
        <Text fontSize="sm" color="slate.400">
          Showing {startIndex}-{endIndex} of {sortedRows.length}
        </Text>
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((current) => Math.max(1, Math.min(current, pageCount) - 1))}
            isDisabled={normalizedPage <= 1}
          >
            Previous
          </Button>
          <Text fontSize="sm" color="slate.300">
            Page {normalizedPage} of {pageCount}
          </Text>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((current) => Math.min(pageCount, Math.min(current, pageCount) + 1))}
            isDisabled={normalizedPage >= pageCount}
          >
            Next
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

function nextSortState(current: SortState, key: SortableColumnKey): SortState {
  if (current.key !== key) {
    return {
      key,
      direction: isNumericSortColumn(key) ? 'desc' : 'asc',
    };
  }

  return {
    key,
    direction: current.direction === 'asc' ? 'desc' : 'asc',
  };
}

function compareRows(a: PlayerStatsRowModel, b: PlayerStatsRowModel, sort: SortState): number {
  const directionMultiplier = sort.direction === 'asc' ? 1 : -1;

  if (sort.key === 'name') {
    return a.name.localeCompare(b.name) * directionMultiplier;
  }

  if (sort.key === 'team') {
    const teamCompare = a.teamAbbr.localeCompare(b.teamAbbr);
    if (teamCompare !== 0) {
      return teamCompare * directionMultiplier;
    }
    return a.name.localeCompare(b.name) * directionMultiplier;
  }

  if (sort.key === 'pos') {
    const posCompare = a.position.localeCompare(b.position);
    if (posCompare !== 0) {
      return posCompare * directionMultiplier;
    }
    return a.name.localeCompare(b.name) * directionMultiplier;
  }

  const numericDiff = getNumericValue(a, sort.key) - getNumericValue(b, sort.key);
  if (numericDiff !== 0) {
    return numericDiff * directionMultiplier;
  }

  return a.name.localeCompare(b.name) * directionMultiplier;
}

function getNumericValue(row: PlayerStatsRowModel, key: Exclude<SortableColumnKey, 'name' | 'team' | 'pos'>): number {
  if (key === 'price') {
    return parseDisplayNumber(row.price);
  }

  if (key === 'ownership') {
    return parseDisplayNumber(row.ownership);
  }

  if (key === 'minutes') return row.minutes;
  if (key === 'points') return row.points;
  if (key === 'xPts') return row.xPts;
  if (key === 'goals') return row.goals;
  if (key === 'assists') return row.assists;
  if (key === 'xG') return row.xG;
  if (key === 'xA') return row.xA;
  if (key === 'xGI') return row.xGI;
  if (key === 'goalsPer90') return row.goalsPer90;
  return row.xgPer90;
}

function parseDisplayNumber(value: string): number {
  const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function renderCell(row: PlayerStatsRowModel, column: PlayerStatsColumnKey) {
  if (column === 'name') {
    return (
      <Text color="white" fontWeight="semibold">
        {row.name}
      </Text>
    );
  }

  if (column === 'team') return row.teamAbbr;
  if (column === 'pos') return row.position;
  if (column === 'price') return row.price;
  if (column === 'ownership') return row.ownership;
  if (column === 'minutes') return row.minutes;
  if (column === 'points') return row.points;
  if (column === 'xPts') return row.xPts.toFixed(1);
  if (column === 'goals') return row.goals;
  if (column === 'assists') return row.assists;
  if (column === 'xG') return row.xG.toFixed(2);
  if (column === 'xA') return row.xA.toFixed(2);
  if (column === 'xGI') return row.xGI.toFixed(2);
  if (column === 'goalsPer90') return row.goalsPer90.toFixed(2);
  if (column === 'xGPer90') return row.xgPer90.toFixed(2);

  return <FixturesPills fixtures={row.nextFixtures} />;
}

function FixturesPills({ fixtures }: { fixtures: PlayerStatsFixturePill[] }) {
  if (fixtures.length === 0) {
    return <Text color="slate.500">-</Text>;
  }

  return (
    <HStack spacing={1}>
      {fixtures.map((fixture, index) => {
        const style = getDifficultyStyle(fixture.fdr);
        return (
          <Badge
            key={`${fixture.opponentAbbr}-${fixture.home ? 'H' : 'A'}-${index}`}
            px={2}
            py={1}
            fontSize="10px"
            textTransform="none"
            borderRadius="md"
            borderWidth="1px"
            bg={style.bg}
            color={style.color}
            borderColor={style.borderColor}
          >
            {fixture.home ? 'vs' : '@'} {fixture.opponentAbbr}
          </Badge>
        );
      })}
    </HStack>
  );
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

function isNumericSortColumn(key: SortableColumnKey): boolean {
  return key !== 'name' && key !== 'team' && key !== 'pos';
}

export default PlayerStatsTable;
