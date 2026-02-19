// FPL API response types

export interface FPLTeam {
  id: number;
  code: number;
  name: string;
  short_name: string;
  strength: number;
  position: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  points: number;
}

export interface FPLElement {
  id: number;
  code: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  team_code: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  now_cost: number; // price in tenths (e.g., 105 = £10.5m)
  total_points: number;
  points_per_game: string;
  form: string;
  status: string; // "a" = available, "d" = doubtful, "i" = injured, "s" = suspended, "u" = unavailable
  news: string;
  news_added: string | null;
  chance_of_playing_next_round: number | null;
  chance_of_playing_this_round: number | null;
}

export interface FPLElementType {
  id: number;
  plural_name: string;
  plural_name_short: string;
  singular_name: string;
  singular_name_short: string;
  squad_select: number;
  squad_min_play: number;
  squad_max_play: number;
}

export interface FPLEvent {
  id: number;
  name: string;
  deadline_time: string;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
  chip_plays: Array<{ chip_name: string; num_played: number }>;
  most_selected: number | null;
  most_transferred_in: number | null;
  top_element: number | null;
  top_element_info: {
    id: number;
    points: number;
  } | null;
  transfers_made: number;
  average_entry_score: number;
  highest_score: number | null;
}

export interface BootstrapStatic {
  events: FPLEvent[];
  teams: FPLTeam[];
  elements: FPLElement[];
  element_types: FPLElementType[];
  total_players: number;
}

export interface EntryInfo {
  id: number;
  player_first_name: string;
  player_last_name: string;
  player_region_name: string;
  player_region_short_iso: string;
  name: string; // team name
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
  current_event: number;
  last_deadline_bank: number;
  last_deadline_value: number;
  last_deadline_total_transfers: number;
}

export interface EntryHistoryPast {
  season_name: string;
  total_points: number;
  rank: number;
}

export interface EntryHistoryCurrent {
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

export interface EntryHistoryChip {
  name: string;
  time: string;
  event: number;
}

export interface EntryHistory {
  current: EntryHistoryCurrent[];
  past: EntryHistoryPast[];
  chips: EntryHistoryChip[];
}

export interface Pick {
  element: number; // player ID
  position: number; // 1-15 (1-11 starting, 12-15 bench)
  multiplier: number; // 0, 1, 2, or 3 (0=bench, 1=playing, 2=captain, 3=triple captain)
  is_captain: boolean;
  is_vice_captain: boolean;
}

export interface EntryPicks {
  active_chip: string | null; // "bboost", "freehit", "wildcard", "3xc", null
  automatic_subs: Array<{
    entry: number;
    element_in: number;
    element_out: number;
    event: number;
  }>;
  entry_history: {
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
  };
  picks: Pick[];
}

export interface LiveElementStats {
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
  starts: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  total_points: number;
  in_dreamteam: boolean;
}

export interface LiveElement {
  id: number;
  stats: LiveElementStats;
  explain: Array<{
    fixture: number;
    stats: Array<{
      identifier: string;
      points: number;
      value: number;
    }>;
  }>;
}

export interface LiveGameweek {
  elements: LiveElement[];
}

export interface Fixture {
  id: number;
  code: number;
  event: number | null; // gameweek number
  finished: boolean;
  finished_provisional: boolean;
  kickoff_time: string | null;
  minutes: number;
  provisional_start_time: boolean;
  started: boolean;
  team_a: number;
  team_a_score: number | null;
  team_h: number;
  team_h_score: number | null;
  team_h_difficulty: number;
  team_a_difficulty: number;
  pulse_id: number;
}
