// ── Types ──────────────────────────────────────────────

export type MinutesRisk = 'Safe' | 'Risk' | 'Unknown';
export type InjuryStatus = 'Available' | 'Injured' | 'Doubtful' | 'Suspended';
export type ChipType = 'wildcard' | 'freehit' | 'bboost' | 'tcaptain';

export interface EnhancedPlayer {
  id: number;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  team: string;
  teamAbbr: string;
  price: number;
  xPts: number;
  points: number;
  minutesRisk: MinutesRisk;
  injuryStatus: InjuryStatus;
  injuryNews?: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isBench?: boolean;
  ownership?: number;
  photoUrl?: string; // optional headshot URL for shared pitch components
  opponents?: string[]; // opponent abbreviations for this GW (e.g. ['ARS'] or ['ARS','BRE'])
}

export interface TeamStatus {
  freeTransfers: number;
  bank: number;
  teamValue: number;
  chips: {
    wildcard: { available: boolean; used?: string };
    freehit: { available: boolean; used?: string };
    bboost: { available: boolean; used?: string };
    tcaptain: { available: boolean; used?: string };
  };
  deadline: string;
}

export interface AISummaryBullet {
  text: string;
  why: string;
  tone: 'good' | 'info' | 'warn';
}

export interface CommandCenterAISummary {
  title: string;
  gameweek: number;
  bullets: AISummaryBullet[];
}

export interface InjurySuspension {
  player: string;
  team: string;
  status: 'Injured' | 'Suspended' | 'Doubtful';
  expectedReturn: string;
  details: string;
}

export interface FixtureItem {
  opponent: string;
  opponentAbbr: string;
  home: boolean;
  difficulty: 1 | 2 | 3 | 4 | 5;
  gameweek: number;
}

export interface RecommendedTransferItem {
  playerIn: EnhancedPlayer;
  playerOut: EnhancedPlayer;
  xPtsDelta: number;
  why: string;
}

export interface ModelSource {
  id: 'airsenal' | 'elo' | 'blend';
  name: string;
  weight?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface VideoInsight {
  id: string;
  title: string;
  source: string;
  duration: string;
  tags: string[];
  thumbnail?: string;
}

export interface SandboxAction {
  type: 'transfer' | 'captain' | 'bench_order';
  payload: any;
  timestamp: Date;
}

// ── Mock Data ──────────────────────────────────────────

export const mockTeamStatus: TeamStatus = {
  freeTransfers: 1,
  bank: 0.5,
  teamValue: 102.3,
  chips: {
    wildcard: { available: false, used: 'GW 8' },
    freehit: { available: true },
    bboost: { available: true },
    tcaptain: { available: true },
  },
  deadline: '2026-02-22T11:30:00Z',
};

export const mockEnhancedSquad: EnhancedPlayer[] = [
  // Starting XI
  {
    id: 1,
    name: 'Raya',
    position: 'GK',
    team: 'Arsenal',
    teamAbbr: 'ARS',
    price: 5.5,
    xPts: 4.2,
    points: 6,
    minutesRisk: 'Safe',
    injuryStatus: 'Available',
  },
  {
    id: 2,
    name: 'Alexander-Arnold',
    position: 'DEF',
    team: 'Liverpool',
    teamAbbr: 'LIV',
    price: 7.0,
    xPts: 5.8,
    points: 9,
    minutesRisk: 'Safe',
    injuryStatus: 'Available',
    ownership: 42.3,
  },
  {
    id: 3,
    name: 'Saliba',
    position: 'DEF',
    team: 'Arsenal',
    teamAbbr: 'ARS',
    price: 6.0,
    xPts: 5.2,
    points: 2,
    minutesRisk: 'Safe',
    injuryStatus: 'Available',
  },
  {
    id: 4,
    name: 'Gabriel',
    position: 'DEF',
    team: 'Arsenal',
    teamAbbr: 'ARS',
    price: 6.0,
    xPts: 5.0,
    points: 6,
    minutesRisk: 'Safe',
    injuryStatus: 'Available',
  },
  {
    id: 5,
    name: 'Saka',
    position: 'MID',
    team: 'Arsenal',
    teamAbbr: 'ARS',
    price: 10.2,
    xPts: 0.0,
    points: 3,
    minutesRisk: 'Risk',
    injuryStatus: 'Injured',
    injuryNews: 'Hamstring injury - Expected return March 2026',
  },
  {
    id: 6,
    name: 'Palmer',
    position: 'MID',
    team: 'Chelsea',
    teamAbbr: 'CHE',
    price: 11.0,
    xPts: 7.8,
    points: 12,
    minutesRisk: 'Safe',
    injuryStatus: 'Available',
    isCaptain: true,
    ownership: 65.2,
  },
  {
    id: 7,
    name: 'Salah',
    position: 'MID',
    team: 'Liverpool',
    teamAbbr: 'LIV',
    price: 13.5,
    xPts: 6.9,
    points: 8,
    minutesRisk: 'Safe',
    injuryStatus: 'Available',
    ownership: 58.7,
  },
  {
    id: 8,
    name: 'Mbeumo',
    position: 'MID',
    team: 'Brentford',
    teamAbbr: 'BRE',
    price: 7.5,
    xPts: 5.4,
    points: 5,
    minutesRisk: 'Safe',
    injuryStatus: 'Available',
  },
  {
    id: 9,
    name: 'Haaland',
    position: 'FWD',
    team: 'Man City',
    teamAbbr: 'MCI',
    price: 15.0,
    xPts: 7.2,
    points: 10,
    minutesRisk: 'Safe',
    injuryStatus: 'Available',
    isViceCaptain: true,
    ownership: 71.5,
  },
  {
    id: 10,
    name: 'Isak',
    position: 'FWD',
    team: 'Newcastle',
    teamAbbr: 'NEW',
    price: 9.0,
    xPts: 5.8,
    points: 2,
    minutesRisk: 'Safe',
    injuryStatus: 'Available',
  },
  {
    id: 11,
    name: 'Watkins',
    position: 'FWD',
    team: 'Aston Villa',
    teamAbbr: 'AVL',
    price: 9.0,
    xPts: 5.2,
    points: 5,
    minutesRisk: 'Safe',
    injuryStatus: 'Available',
  },
  // Bench
  {
    id: 12,
    name: 'Henderson',
    position: 'GK',
    team: 'Crystal Palace',
    teamAbbr: 'CRY',
    price: 4.5,
    xPts: 3.0,
    points: 3,
    minutesRisk: 'Safe',
    injuryStatus: 'Available',
    isBench: true,
  },
  {
    id: 13,
    name: 'Lewis',
    position: 'DEF',
    team: 'Man City',
    teamAbbr: 'MCI',
    price: 4.5,
    xPts: 2.5,
    points: 1,
    minutesRisk: 'Risk',
    injuryStatus: 'Available',
    isBench: true,
  },
  {
    id: 14,
    name: 'Wharton',
    position: 'MID',
    team: 'Crystal Palace',
    teamAbbr: 'CRY',
    price: 5.0,
    xPts: 3.2,
    points: 2,
    minutesRisk: 'Unknown',
    injuryStatus: 'Available',
    isBench: true,
  },
  {
    id: 15,
    name: 'João Pedro',
    position: 'FWD',
    team: 'Brighton',
    teamAbbr: 'BHA',
    price: 5.5,
    xPts: 3.8,
    points: 1,
    minutesRisk: 'Risk',
    injuryStatus: 'Available',
    isBench: true,
  },
];

export const mockCommandCenterAISummary: CommandCenterAISummary = {
  title: 'AI Summary (GW 27)',
  gameweek: 27,
  bullets: [
    {
      text: 'Captain Palmer — high upside, reliable minutes vs Sheffield United (home).',
      why: 'Palmer has the highest xPts (7.8) in your squad, faces a weak defense at home, and has 90+ minutes nailed on. Salah is a close second (6.9 xPts) but Liverpool play away at tough opposition.',
      tone: 'good',
    },
    {
      text: 'Consider benching Saka due to injury — replace with Trossard if you have a transfer.',
      why: 'Saka is flagged with a hamstring injury and unlikely to play. His xPts is 0.0 for this week. Trossard offers better form and fixtures.',
      tone: 'warn',
    },
    {
      text: 'Recommended transfer: Bowen → Trossard (+1.4 xPts, favorable fixtures ahead).',
      why: "West Ham have difficult fixtures and Bowen's form has dipped. Arsenal have a great run coming up and Trossard is in good form with 5+ xPts expected.",
      tone: 'info',
    },
    {
      text: 'Bench order: Lewis (DEF) → Wharton (MID) → João Pedro (FWD).',
      why: 'Lewis has minutes risk (rotation with Walker). Wharton and João Pedro both have limited upside but Wharton is slightly safer for auto-subs.',
      tone: 'info',
    },
    {
      text: 'Chips: Consider saving Triple Captain for a DGW or premium asset double gameweek.',
      why: 'No ideal Triple Captain target this week. Haaland and Salah both have singles. Wait for a confirmed DGW announcement.',
      tone: 'info',
    },
  ],
};

export const mockInjuriesSuspensions: InjurySuspension[] = [
  {
    player: 'Bukayo Saka',
    team: 'Arsenal',
    status: 'Injured',
    expectedReturn: 'Mar 2026',
    details: 'Hamstring injury sustained in training. Out for 3-4 weeks.',
  },
  {
    player: 'Diogo Jota',
    team: 'Liverpool',
    status: 'Doubtful',
    expectedReturn: 'GW 27',
    details: 'Minor knock, 50% chance to play this weekend.',
  },
  {
    player: 'Reece James',
    team: 'Chelsea',
    status: 'Injured',
    expectedReturn: 'Unknown',
    details: 'Long-term injury, no clear return date yet.',
  },
  {
    player: 'Bruno Guimarães',
    team: 'Newcastle',
    status: 'Suspended',
    expectedReturn: 'GW 28',
    details: 'One-match ban for yellow card accumulation.',
  },
];

export const mockFixturesSnapshot: FixtureItem[] = [
  { opponent: 'Sheffield Utd', opponentAbbr: 'SHU', home: true, difficulty: 2, gameweek: 27 },
  { opponent: 'Wolves', opponentAbbr: 'WOL', home: false, difficulty: 3, gameweek: 27 },
  { opponent: 'Fulham', opponentAbbr: 'FUL', home: true, difficulty: 3, gameweek: 27 },
  { opponent: 'Brentford', opponentAbbr: 'BRE', home: true, difficulty: 3, gameweek: 27 },
  { opponent: 'Nottm Forest', opponentAbbr: 'NFO', home: false, difficulty: 3, gameweek: 27 },
  { opponent: 'Everton', opponentAbbr: 'EVE', home: true, difficulty: 2, gameweek: 28 },
  { opponent: 'Man City', opponentAbbr: 'MCI', home: false, difficulty: 5, gameweek: 28 },
  { opponent: 'Bournemouth', opponentAbbr: 'BOU', home: true, difficulty: 2, gameweek: 28 },
];

export const mockRecommendedTransfers: RecommendedTransferItem[] = [
  {
    playerIn: {
      id: 101,
      name: 'Trossard',
      position: 'MID',
      team: 'Arsenal',
      teamAbbr: 'ARS',
      price: 6.8,
      xPts: 5.2,
      points: 0,
      minutesRisk: 'Safe',
      injuryStatus: 'Available',
    },
    playerOut: {
      id: 5,
      name: 'Saka',
      position: 'MID',
      team: 'Arsenal',
      teamAbbr: 'ARS',
      price: 10.2,
      xPts: 0.0,
      points: 3,
      minutesRisk: 'Risk',
      injuryStatus: 'Injured',
      injuryNews: 'Hamstring injury',
    },
    xPtsDelta: 5.2,
    why: 'Saka is injured and expected out for 3-4 weeks. Trossard is in great form, has favorable fixtures, and is £3.4m cheaper, freeing up funds for future upgrades.',
  },
  {
    playerIn: {
      id: 102,
      name: 'Evan Ferguson',
      position: 'FWD',
      team: 'Brighton',
      teamAbbr: 'BHA',
      price: 5.5,
      xPts: 4.5,
      points: 0,
      minutesRisk: 'Safe',
      injuryStatus: 'Available',
    },
    playerOut: {
      id: 15,
      name: 'João Pedro',
      position: 'FWD',
      team: 'Brighton',
      teamAbbr: 'BHA',
      price: 5.5,
      xPts: 3.8,
      points: 1,
      minutesRisk: 'Risk',
      injuryStatus: 'Available',
    },
    xPtsDelta: 0.7,
    why: 'Ferguson is getting more minutes and has better expected points. João Pedro is at rotation risk with other forwards.',
  },
];

export const mockModelSources: ModelSource[] = [
  { id: 'airsenal', name: 'AIrsenal', weight: 70 },
  { id: 'elo', name: 'ELO Plugin', weight: 30 },
  { id: 'blend', name: 'Blended (70/30)' },
];

export const mockVideoInsights: VideoInsight[] = [
  {
    id: 'v1',
    title: 'GW 27 Captain Picks: Palmer vs Salah vs Haaland',
    source: 'FPL Wire',
    duration: '12:35',
    tags: ['Captaincy', 'Premium'],
  },
  {
    id: 'v2',
    title: 'Best Differentials for GW 27-30',
    source: 'Let\'s Talk FPL',
    duration: '18:42',
    tags: ['Differentials', 'Strategy'],
  },
  {
    id: 'v3',
    title: 'Injuries & Suspensions Update',
    source: 'FPL Focal',
    duration: '08:15',
    tags: ['Injuries', 'News'],
  },
  {
    id: 'v4',
    title: 'When to Use Your Wildcard?',
    source: 'FPL Mate',
    duration: '15:20',
    tags: ['Wildcard', 'Chips'],
  },
];
