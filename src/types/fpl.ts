// FPL API Response Types

export interface BootstrapElement {
  id: number;
  web_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  // Add more fields as needed
}

export interface BootstrapTeam {
  id: number;
  name: string;
  short_name: string;
  // Add more fields as needed
}

export interface BootstrapElementType {
  id: number;
  singular_name: string;
  singular_name_short: string;
  plural_name: string;
  plural_name_short: string;
}

export interface BootstrapResponse {
  elements: BootstrapElement[];
  teams: BootstrapTeam[];
  element_types: BootstrapElementType[];
  events: GameweekEvent[];
}

export interface GameweekEvent {
  id: number;
  name: string;
  deadline_time: string;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
  chip_plays: ChipPlay[];
}

export interface ChipPlay {
  chip_name: string;
  num_played: number;
}

export interface EntryResponse {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  current_event: number;
  // Add more fields as needed
}

export interface Pick {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

export interface ActiveChip {
  name: string;
  time: string;
}

export interface PicksResponse {
  active_chip: string | null;
  automatic_subs: AutomaticSub[];
  entry_history: EntryHistory;
  picks: Pick[];
}

export interface AutomaticSub {
  entry: number;
  element_in: number;
  element_out: number;
  event: number;
}

export interface EntryHistory {
  event: number;
  points: number;
  total_points: number;
  rank: number;
  rank_sort: number;
  overall_rank: number;
  bank: number;
  value: number;
  event_transfers: number;
  event_transfers_cost: number;
  points_on_bench: number;
}

export interface HistoryResponse {
  current: EntryHistory[];
  past: PastSeason[];
  chips: ChipUsage[];
}

export interface PastSeason {
  season_name: string;
  total_points: number;
  rank: number;
}

export interface ChipUsage {
  name: string;
  time: string;
  event: number;
}

export interface LiveElement {
  id: number;
  stats: {
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    goals_conceded: number;
    own_goals: number;
    penalties_saved: number;
    penalties_missed: number;
    yellow_cards: number;
    red_cards: number;
    saves: number;
    bonus: number;
    bps: number;
    influence: string;
    creativity: string;
    threat: string;
    ict_index: string;
    total_points: number;
    in_dreamteam: boolean;
  };
  explain: ExplainItem[];
}

export interface ExplainItem {
  fixture: number;
  stats: StatDetail[];
}

export interface StatDetail {
  identifier: string;
  points: number;
  value: number;
}

export interface LiveResponse {
  elements: LiveElement[];
}

// Application-specific types

export interface Player {
  id: number;
  name: string;
  position: string;
  team: string;
  points: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  multiplier: number;
  isBench: boolean;
  actualPoints: number; // Points from live data
}

export interface GWInfo {
  gameweek: number;
  deadline: string;
  isFinished: boolean;
}

export interface GWStats {
  gwPoints: number; // API-reported GW points
  manualPoints: number; // Manually calculated points
  totalPoints: number;
  gwRank: number;
  overallRank: number;
  teamValue: number;
  bank: number;
  transfers: number;
  transferCost: number;
  benchPoints: number;
  pointsDiscrepancy: number; // Difference between manual and API
}

export interface Fixture {
  id: number;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  finished: boolean;
  started: boolean;
  kickoff_time: string;
}

export interface Injury {
  playerId: number;
  playerName: string;
  news: string;
  chance: number;
}

export interface Transfer {
  elementIn: number;
  elementInName: string;
  elementOut: number;
  elementOutName: string;
  cost: number;
  time: string;
}

export interface RecommendedTransfer {
  playerOut: {
    id: number;
    name: string;
    position: string;
  };
  playerIn: {
    id: number;
    name: string;
    position: string;
  };
  reason: string;
  priority: 'high' | 'medium' | 'low';
}
