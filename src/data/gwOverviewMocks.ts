// TypeScript interfaces for GW Overview components

export interface GWInfo {
  gameweek: number;
  deadline: string;
  isFinished: boolean;
}

export interface GWStats {
  points: number;
  rank: number;
  overallRank: number;
  pointsOnBench: number;
  transfersMade: number;
  transfersCost: number;
  teamValue: number;
  bank: number;
}

export interface Player {
  id: number;
  name: string;
  team: string;
  teamCode: number;
  position: string; // "GK", "DEF", "MID", "FWD"
  points: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  multiplier: number;
}

export interface Fixture {
  id: number;
  date: string;
  homeTeam: string;
  homeTeamCode: number;
  awayTeam: string;
  awayTeamCode: number;
  homeScore: number | null;
  awayScore: number | null;
  kickoffTime: string;
  finished: boolean;
  started: boolean;
}

export interface Injury {
  player: string;
  team: string;
  teamCode: number;
  status: string; // "Injured", "Doubtful", "Suspended"
  news: string;
  chance: number | null; // chance of playing next round (0-100)
}

export interface Transfer {
  id: number;
  playerIn: string;
  playerInTeam: string;
  playerInTeamCode: number;
  playerOut: string;
  playerOutTeam: string;
  playerOutTeamCode: number;
  cost: number;
  time: string;
}

export interface RecommendedTransferPlayer {
  name: string;
  team: string;
  teamCode: number;
  position: string;
  price: number;
  points: number;
  form: string;
}

export interface RecommendedTransfer {
  playerOut: RecommendedTransferPlayer;
  playerIn: RecommendedTransferPlayer;
  reason: string;
}

// Mock data for testing and fallback

export const mockGWInfo: GWInfo = {
  gameweek: 26,
  deadline: "2026-02-22T11:00:00Z",
  isFinished: false,
};

export const mockStats: GWStats = {
  points: 67,
  rank: 1234567,
  overallRank: 987654,
  pointsOnBench: 12,
  transfersMade: 1,
  transfersCost: 4,
  teamValue: 1032, // in tenths (£103.2m)
  bank: 15, // in tenths (£1.5m)
};

export const mockSquad: Player[] = [
  // Starting XI
  { id: 1, name: "Raya", team: "Arsenal", teamCode: 3, position: "GK", points: 6, isCaptain: false, isViceCaptain: false, multiplier: 1 },
  { id: 2, name: "Gabriel", team: "Arsenal", teamCode: 3, position: "DEF", points: 8, isCaptain: false, isViceCaptain: false, multiplier: 1 },
  { id: 3, name: "Saliba", team: "Arsenal", teamCode: 3, position: "DEF", points: 6, isCaptain: false, isViceCaptain: false, multiplier: 1 },
  { id: 4, name: "Alexander-Arnold", team: "Liverpool", teamCode: 14, position: "DEF", points: 9, isCaptain: false, isViceCaptain: false, multiplier: 1 },
  { id: 5, name: "Cancelo", team: "Man City", teamCode: 43, position: "DEF", points: 2, isCaptain: false, isViceCaptain: false, multiplier: 1 },
  { id: 6, name: "Salah", team: "Liverpool", teamCode: 14, position: "MID", points: 14, isCaptain: true, isViceCaptain: false, multiplier: 2 },
  { id: 7, name: "De Bruyne", team: "Man City", teamCode: 43, position: "MID", points: 7, isCaptain: false, isViceCaptain: false, multiplier: 1 },
  { id: 8, name: "Saka", team: "Arsenal", teamCode: 3, position: "MID", points: 5, isCaptain: false, isViceCaptain: true, multiplier: 1 },
  { id: 9, name: "Haaland", team: "Man City", teamCode: 43, position: "FWD", points: 10, isCaptain: false, isViceCaptain: false, multiplier: 1 },
  { id: 10, name: "Kane", team: "Tottenham", teamCode: 6, position: "FWD", points: 8, isCaptain: false, isViceCaptain: false, multiplier: 1 },
  { id: 11, name: "Jesus", team: "Arsenal", teamCode: 3, position: "FWD", points: 2, isCaptain: false, isViceCaptain: false, multiplier: 1 },
  // Bench
  { id: 12, name: "Pope", team: "Newcastle", teamCode: 4, position: "GK", points: 3, isCaptain: false, isViceCaptain: false, multiplier: 0 },
  { id: 13, name: "Trippier", team: "Newcastle", teamCode: 4, position: "DEF", points: 6, isCaptain: false, isViceCaptain: false, multiplier: 0 },
  { id: 14, name: "Rashford", team: "Man Utd", teamCode: 1, position: "MID", points: 2, isCaptain: false, isViceCaptain: false, multiplier: 0 },
  { id: 15, name: "Toney", team: "Brentford", teamCode: 94, position: "FWD", points: 1, isCaptain: false, isViceCaptain: false, multiplier: 0 },
];

export const mockFixtures: Fixture[] = [
  {
    id: 1,
    date: "2026-02-22",
    homeTeam: "Arsenal",
    homeTeamCode: 3,
    awayTeam: "Liverpool",
    awayTeamCode: 14,
    homeScore: null,
    awayScore: null,
    kickoffTime: "12:30:00",
    finished: false,
    started: false,
  },
  {
    id: 2,
    date: "2026-02-22",
    homeTeam: "Man City",
    homeTeamCode: 43,
    awayTeam: "Chelsea",
    awayTeamCode: 8,
    homeScore: null,
    awayScore: null,
    kickoffTime: "15:00:00",
    finished: false,
    started: false,
  },
  {
    id: 3,
    date: "2026-02-22",
    homeTeam: "Newcastle",
    homeTeamCode: 4,
    awayTeam: "Tottenham",
    awayTeamCode: 6,
    homeScore: null,
    awayScore: null,
    kickoffTime: "17:30:00",
    finished: false,
    started: false,
  },
  {
    id: 4,
    date: "2026-02-23",
    homeTeam: "Man Utd",
    homeTeamCode: 1,
    awayTeam: "Brighton",
    awayTeamCode: 36,
    homeScore: null,
    awayScore: null,
    kickoffTime: "14:00:00",
    finished: false,
    started: false,
  },
  {
    id: 5,
    date: "2026-02-23",
    homeTeam: "Brentford",
    homeTeamCode: 94,
    awayTeam: "Aston Villa",
    awayTeamCode: 7,
    homeScore: null,
    awayScore: null,
    kickoffTime: "16:30:00",
    finished: false,
    started: false,
  },
];

export const mockInjuries: Injury[] = [
  {
    player: "Rashford",
    team: "Man Utd",
    teamCode: 1,
    status: "Doubtful",
    news: "Knock - 50% chance of playing",
    chance: 50,
  },
  {
    player: "Toney",
    team: "Brentford",
    teamCode: 94,
    status: "Injured",
    news: "Hamstring injury",
    chance: 0,
  },
];

export const mockTransfers: Transfer[] = [
  {
    id: 1,
    playerIn: "Jesus",
    playerInTeam: "Arsenal",
    playerInTeamCode: 3,
    playerOut: "Watkins",
    playerOutTeam: "Aston Villa",
    playerOutTeamCode: 7,
    cost: 4,
    time: "2026-02-15T10:30:00Z",
  },
];

export const mockRecommendedTransfers: RecommendedTransfer[] = [
  {
    playerOut: {
      name: "Rashford",
      team: "Man Utd",
      teamCode: 1,
      position: "MID",
      price: 95, // £9.5m
      points: 89,
      form: "2.5",
    },
    playerIn: {
      name: "Palmer",
      team: "Chelsea",
      teamCode: 8,
      position: "MID",
      price: 105, // £10.5m
      points: 142,
      form: "8.2",
    },
    reason: "Palmer has better form and more points. Consider transferring for better returns.",
  },
  {
    playerOut: {
      name: "Toney",
      team: "Brentford",
      teamCode: 94,
      position: "FWD",
      price: 82, // £8.2m
      points: 67,
      form: "3.1",
    },
    playerIn: {
      name: "Watkins",
      team: "Aston Villa",
      teamCode: 7,
      position: "FWD",
      price: 90, // £9.0m
      points: 128,
      form: "6.8",
    },
    reason: "Watkins has better fixtures and is in great form. Good transfer option.",
  },
];
