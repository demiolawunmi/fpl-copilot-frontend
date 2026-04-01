import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Switch,
  Text,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';

export const PLAYER_STATS_COLUMNS_STORAGE_KEY = 'fpl-copilot:player-stats-columns-v1';

export type PlayerStatsColumnKey =
  | 'name'
  | 'team'
  | 'pos'
  | 'price'
  | 'ownership'
  | 'minutes'
  | 'points'
  | 'goals'
  | 'assists'
  | 'xG'
  | 'xA'
  | 'xGI'
  | 'goalsPer90'
  | 'xGPer90'
  | 'nextFixtures';

export type PlayerStatsPresetKey =
  | 'all'
  | 'forwards-xg90'
  | 'midfield-creativity'
  | 'budget-differentials';

export type PlayerStatsPositionFilter = 'all' | 'GK' | 'DEF' | 'MID' | 'FWD';

export type PlayerStatsFiltersState = {
  search: string;
  team: string;
  position: PlayerStatsPositionFilter;
  preset: PlayerStatsPresetKey;
};

export type PlayerStatsSelectOption = {
  value: string;
  label: string;
};

export type PlayerStatsPresetOption = {
  key: PlayerStatsPresetKey;
  label: string;
};

export type PlayerStatsColumnDefinition = {
  key: PlayerStatsColumnKey;
  label: string;
};

export const PLAYER_STATS_DEFAULT_VISIBLE_COLUMNS: PlayerStatsColumnKey[] = [
  'name',
  'team',
  'pos',
  'price',
  'ownership',
  'minutes',
  'points',
  'goals',
  'assists',
  'xG',
  'xGI',
  'goalsPer90',
  'xGPer90',
  'nextFixtures',
];

export const PLAYER_STATS_COLUMN_DEFINITIONS: PlayerStatsColumnDefinition[] = [
  { key: 'name', label: 'Name' },
  { key: 'team', label: 'Team' },
  { key: 'pos', label: 'Position' },
  { key: 'price', label: 'Price' },
  { key: 'ownership', label: 'Ownership' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'points', label: 'Points' },
  { key: 'goals', label: 'Goals' },
  { key: 'assists', label: 'Assists' },
  { key: 'xG', label: 'xG' },
  { key: 'xA', label: 'xA' },
  { key: 'xGI', label: 'xGI' },
  { key: 'goalsPer90', label: 'Goals/90' },
  { key: 'xGPer90', label: 'xG/90' },
  { key: 'nextFixtures', label: 'Next fixtures' },
];

export const PLAYER_STATS_POSITION_OPTIONS: PlayerStatsSelectOption[] = [
  { value: 'all', label: 'All positions' },
  { value: 'GK', label: 'Goalkeepers' },
  { value: 'DEF', label: 'Defenders' },
  { value: 'MID', label: 'Midfielders' },
  { value: 'FWD', label: 'Forwards' },
];

export const PLAYER_STATS_PRESET_OPTIONS: PlayerStatsPresetOption[] = [
  { key: 'all', label: 'All players' },
  { key: 'forwards-xg90', label: 'Forwards: xG/90' },
  { key: 'midfield-creativity', label: 'Midfield creators' },
  { key: 'budget-differentials', label: 'Budget differentials' },
];

export const PLAYER_STATS_DEFAULT_FILTERS: PlayerStatsFiltersState = {
  search: '',
  team: 'all',
  position: 'all',
  preset: 'all',
};

type PlayerStatsFiltersProps = {
  value: PlayerStatsFiltersState;
  onChange: (next: PlayerStatsFiltersState) => void;
  teamOptions: PlayerStatsSelectOption[];
  visibleColumns: PlayerStatsColumnKey[];
  onVisibleColumnsChange: (next: PlayerStatsColumnKey[]) => void;
  availableColumns?: PlayerStatsColumnDefinition[];
  positionOptions?: PlayerStatsSelectOption[];
  presetOptions?: PlayerStatsPresetOption[];
};

const PlayerStatsFilters = ({
  value,
  onChange,
  teamOptions,
  visibleColumns,
  onVisibleColumnsChange,
  availableColumns = PLAYER_STATS_COLUMN_DEFINITIONS,
  positionOptions = PLAYER_STATS_POSITION_OPTIONS,
  presetOptions = PLAYER_STATS_PRESET_OPTIONS,
}: PlayerStatsFiltersProps) => {
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const availableColumnKeys = useMemo(
    () => new Set(availableColumns.map((column) => column.key)),
    [availableColumns]
  );

  const normalizedVisibleColumns = useMemo(
    () => sanitizeVisibleColumns(visibleColumns, availableColumns),
    [availableColumns, visibleColumns]
  );

  return (
    <Stack spacing={4}>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4} align="end">
        <FormControl>
          <FormLabel htmlFor="player-stats-search">Search players</FormLabel>
          <Input
            id="player-stats-search"
            value={value.search}
            onChange={(event) => onChange({ ...value, search: event.target.value })}
            placeholder="Search by player name"
            aria-label="Search players"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="player-stats-team">Team</FormLabel>
          <Select
            id="player-stats-team"
            value={value.team}
            onChange={(event) => onChange({ ...value, team: event.target.value })}
            aria-label="Filter by team"
          >
            <option value="all">All teams</option>
            {teamOptions.map((team) => (
              <option key={team.value} value={team.value}>
                {team.label}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="player-stats-position">Position</FormLabel>
          <Select
            id="player-stats-position"
            value={value.position}
            onChange={(event) =>
              onChange({
                ...value,
                position: isPositionFilter(event.target.value) ? event.target.value : 'all',
              })
            }
            aria-label="Filter by position"
          >
            {positionOptions.map((position) => (
              <option key={position.value} value={position.value}>
                {position.label}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="player-stats-preset">Preset</FormLabel>
          <Select
            id="player-stats-preset"
            value={value.preset}
            onChange={(event) =>
              onChange({
                ...value,
                preset: isPresetKey(event.target.value) ? event.target.value : 'all',
              })
            }
            aria-label="Filter preset"
          >
            {presetOptions.map((preset) => (
              <option key={preset.key} value={preset.key}>
                {preset.label}
              </option>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <HStack justify="space-between" align="center">
        <Text fontSize="sm" color="slate.400">
          {normalizedVisibleColumns.length} of {availableColumns.length} columns visible
        </Text>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsColumnPickerOpen(true)}
          aria-haspopup="dialog"
          aria-controls="player-stats-column-picker"
        >
          Customize columns
        </Button>
      </HStack>

      <Modal isOpen={isColumnPickerOpen} onClose={() => setIsColumnPickerOpen(false)}>
        <ModalOverlay />
        <ModalContent id="player-stats-column-picker">
          <ModalHeader>Visible columns</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              {availableColumns.map((column) => {
                const controlId = `player-stats-column-${column.key}`;
                const isChecked = normalizedVisibleColumns.includes(column.key);

                return (
                  <FormControl
                    key={column.key}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <FormLabel htmlFor={controlId} mb="0">
                      {column.label}
                    </FormLabel>
                    <Switch
                      id={controlId}
                      isChecked={isChecked}
                      onChange={() => {
                        if (!availableColumnKeys.has(column.key)) {
                          return;
                        }

                        const next = isChecked
                          ? normalizedVisibleColumns.filter((key) => key !== column.key)
                          : [...normalizedVisibleColumns, column.key];
                        onVisibleColumnsChange(sanitizeVisibleColumns(next, availableColumns));
                      }}
                      aria-label={`Toggle ${column.label} column`}
                    />
                  </FormControl>
                );
              })}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  onVisibleColumnsChange(
                    sanitizeVisibleColumns(PLAYER_STATS_DEFAULT_VISIBLE_COLUMNS, availableColumns)
                  )
                }
              >
                Reset defaults
              </Button>
              <Button type="button" onClick={() => setIsColumnPickerOpen(false)}>
                Done
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

export function usePersistedPlayerStatsColumns(options?: {
  storageKey?: string;
  availableColumns?: PlayerStatsColumnDefinition[];
  initialColumns?: PlayerStatsColumnKey[];
}) {
  const storageKey = options?.storageKey ?? PLAYER_STATS_COLUMNS_STORAGE_KEY;
  const availableColumns = options?.availableColumns ?? PLAYER_STATS_COLUMN_DEFINITIONS;
  const initialColumns =
    options?.initialColumns ??
    sanitizeVisibleColumns(PLAYER_STATS_DEFAULT_VISIBLE_COLUMNS, availableColumns);

  const [visibleColumns, setVisibleColumns] = useState<PlayerStatsColumnKey[]>(() =>
    readPlayerStatsColumnsFromStorage({ storageKey, availableColumns, fallbackColumns: initialColumns })
  );

  useEffect(() => {
    const sanitized = sanitizeVisibleColumns(visibleColumns, availableColumns);
    writePlayerStatsColumnsToStorage(sanitized, storageKey);
  }, [availableColumns, storageKey, visibleColumns]);

  return {
    visibleColumns,
    setVisibleColumns,
    resetVisibleColumns: () =>
      setVisibleColumns(sanitizeVisibleColumns(PLAYER_STATS_DEFAULT_VISIBLE_COLUMNS, availableColumns)),
  };
}

export function readPlayerStatsColumnsFromStorage(input?: {
  storageKey?: string;
  availableColumns?: PlayerStatsColumnDefinition[];
  fallbackColumns?: PlayerStatsColumnKey[];
}): PlayerStatsColumnKey[] {
  const storageKey = input?.storageKey ?? PLAYER_STATS_COLUMNS_STORAGE_KEY;
  const availableColumns = input?.availableColumns ?? PLAYER_STATS_COLUMN_DEFINITIONS;
  const fallbackColumns =
    input?.fallbackColumns ??
    sanitizeVisibleColumns(PLAYER_STATS_DEFAULT_VISIBLE_COLUMNS, availableColumns);

  if (typeof window === 'undefined') {
    return fallbackColumns;
  }

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return fallbackColumns;
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return fallbackColumns;
    }

    const parsedColumns = parsed.filter(isPlayerStatsColumnKey);
    return sanitizeVisibleColumns(parsedColumns, availableColumns);
  } catch {
    return fallbackColumns;
  }
}

export function writePlayerStatsColumnsToStorage(
  columns: PlayerStatsColumnKey[],
  storageKey = PLAYER_STATS_COLUMNS_STORAGE_KEY
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(columns));
}

export function sanitizeVisibleColumns(
  columns: PlayerStatsColumnKey[],
  availableColumns: PlayerStatsColumnDefinition[] = PLAYER_STATS_COLUMN_DEFINITIONS
): PlayerStatsColumnKey[] {
  const available = new Set(availableColumns.map((column) => column.key));
  const deduped = Array.from(new Set(columns.filter((column) => available.has(column))));

  if (deduped.length > 0) {
    return deduped;
  }

  const defaultColumns = PLAYER_STATS_DEFAULT_VISIBLE_COLUMNS.filter((column) => available.has(column));
  if (defaultColumns.length > 0) {
    return defaultColumns;
  }

  return availableColumns.slice(0, 1).map((column) => column.key);
}

function isPositionFilter(value: string): value is PlayerStatsPositionFilter {
  return value === 'all' || value === 'GK' || value === 'DEF' || value === 'MID' || value === 'FWD';
}

function isPresetKey(value: string): value is PlayerStatsPresetKey {
  return (
    value === 'all' ||
    value === 'forwards-xg90' ||
    value === 'midfield-creativity' ||
    value === 'budget-differentials'
  );
}

function isPlayerStatsColumnKey(value: unknown): value is PlayerStatsColumnKey {
  return typeof value === 'string' && PLAYER_STATS_COLUMN_DEFINITIONS.some((column) => column.key === value);
}

export default PlayerStatsFilters;
