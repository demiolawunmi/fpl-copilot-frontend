// ── Types ──────────────────────────────────────────────

export interface GWInfo {
  gameweek: number;
  teamName: string;
  manager: string;
  teamId: string;
}

export interface GWStats {
  average: number;
  highest: number;
  gwPoints: number;
  gwRank: number;
  overallRank: number;
}

export interface Player {
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  points: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isBench?: boolean;
  photoUrl?: string;
  teamAbbr?: string;   // player's club short name (e.g. 'ARS')
  opponents?: string[]; // opponent abbreviations for the selected GW (e.g. ['ARS'] or ['ARS','BRE'])
  chipLabel?: string;   // optional label to show on the chip instead of points
  id?: number;              // FPL element id
  sellingPrice?: number;    // in tenths (e.g. 50 = £5.0m)
  purchasePrice?: number;   // in tenths
  elementType?: number;     // 1-4
}

export interface Fixture {
  date: string;
  dateISO?: string;
  homeTeam: string;
  homeAbbr: string;
  homeColor: string;
  homeBadge?: string;
  awayTeam: string;
  awayAbbr: string;
  awayColor: string;
  awayBadge?: string;
  homeScore: number;
  awayScore: number;
}

export interface Injury {
  player: string;
  team: string;
  status: 'Injured' | 'Suspended' | 'Doubtful';
  returnDate: string;
}

export interface Transfer {
  playerIn: string;
  playerOut: string;
  cost: string;
}

export interface RecommendedTransferPlayer {
  name: string;
  team: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  price: string;
}

export interface RecommendedTransfer {
  playerIn: RecommendedTransferPlayer;
  playerOut: RecommendedTransferPlayer;
  xPointsIn: number;
  xPointsOut: number;
  xPointsDiff: number;
  rationale: string;
}

export type AISummaryTone = "good" | "info" | "warn";

export interface AISummaryItem {
  tone: AISummaryTone;
  text: string;
}

export interface AISummary {
  heading: string;        // short headline
  intro: string;          // 1–2 sentence summary
  items: AISummaryItem[]; // bullet points
  footerHint?: string;    // optional small hint line
}


// ── Mock Data ──────────────────────────────────────────

export const mockGWInfo: GWInfo = {
  gameweek: 26,
  teamName: 'Haaland FC',
  manager: 'Demi Olawunmi',
  teamId: '123456',
};

export const mockStats: GWStats = {
  average: 52,
  highest: 114,
  gwPoints: 68,
  gwRank: 412_301,
  overallRank: 89_120,
};

export const mockSquad: Player[] = [
  // Starting XI
  { name: 'Raya', position: 'GK', points: 6 },
  { name: 'Alexander-Arnold', position: 'DEF', points: 9 },
  { name: 'Saliba', position: 'DEF', points: 2 },
  { name: 'Gabriel', position: 'DEF', points: 6 },
  { name: 'Saka', position: 'MID', points: 3 },
  { name: 'Palmer', position: 'MID', points: 12, isCaptain: true },
  { name: 'Salah', position: 'MID', points: 8 },
  { name: 'Mbeumo', position: 'MID', points: 5 },
  { name: 'Haaland', position: 'FWD', points: 10, isViceCaptain: true },
  { name: 'Isak', position: 'FWD', points: 2 },
  { name: 'Watkins', position: 'FWD', points: 5 },
  // Bench
  { name: 'Henderson', position: 'GK', points: 3, isBench: true },
  { name: 'Lewis', position: 'DEF', points: 1, isBench: true },
  { name: 'Wharton', position: 'MID', points: 2, isBench: true },
  { name: 'João Pedro', position: 'FWD', points: 1, isBench: true },
];

export const mockFixtures: Fixture[] = [
  { date: 'Sat 15 Feb', dateISO: '2026-02-15T15:00:00Z', homeTeam: 'Arsenal', homeAbbr: 'ARS', homeColor: '#EF0107', awayTeam: 'Man City', awayAbbr: 'MCI', awayColor: '#6CABDD', homeScore: 2, awayScore: 1 },
  { date: 'Sat 15 Feb', homeTeam: 'Chelsea', homeAbbr: 'CHE', homeColor: '#034694', awayTeam: 'Liverpool', awayAbbr: 'LIV', awayColor: '#C8102E', homeScore: 1, awayScore: 3 },
  { date: 'Sat 15 Feb', homeTeam: 'Brentford', homeAbbr: 'BRE', homeColor: '#e30613', awayTeam: 'Aston Villa', awayAbbr: 'AVL', awayColor: '#670E36', homeScore: 0, awayScore: 0 },
  { date: 'Sun 16 Feb', homeTeam: 'Newcastle', homeAbbr: 'NEW', homeColor: '#241F20', awayTeam: 'Tottenham', awayAbbr: 'TOT', awayColor: '#132257', homeScore: 3, awayScore: 2 },
  { date: 'Sun 16 Feb', homeTeam: 'Brighton', homeAbbr: 'BHA', homeColor: '#0057B8', awayTeam: 'Wolves', awayAbbr: 'WOL', awayColor: '#FDB913', homeScore: 1, awayScore: 1 },
  { date: 'Mon 17 Feb', homeTeam: 'Man Utd', homeAbbr: 'MUN', homeColor: '#DA291C', awayTeam: 'Everton', awayAbbr: 'EVE', awayColor: '#003399', homeScore: 2, awayScore: 0 },
];

export const mockInjuries: Injury[] = [
  { player: 'Bukayo Saka', team: 'Arsenal', status: 'Injured', returnDate: 'Mar 2026' },
  { player: 'Diogo Jota', team: 'Liverpool', status: 'Doubtful', returnDate: 'Feb 22' },
  { player: 'Reece James', team: 'Chelsea', status: 'Injured', returnDate: 'Unknown' },
  { player: 'Bruno Guimarães', team: 'Newcastle', status: 'Suspended', returnDate: 'GW 27' },
];

export const mockTransfers: Transfer[] = [
  { playerIn: 'Cole Palmer', playerOut: 'Bruno Fernandes', cost: '£0.2m' },
  { playerIn: 'Alexander Isak', playerOut: 'Darwin Núñez', cost: '£0.4m' },
  { playerIn: 'Leandro Trossard', playerOut: 'Jarrod Bowen', cost: '£0.1m' },
];

export const mockRecommendedTransfers: RecommendedTransfer[] = [
  {
    playerIn:  { name: 'Leandro Trossard', team: 'Arsenal', position: 'MID', price: '£6.8m' },
    playerOut: { name: 'Jarrod Bowen',     team: 'West Ham', position: 'MID', price: '£7.0m' },
    xPointsIn: 5.2,
    xPointsOut: 3.8,
    xPointsDiff: 1.4,
    rationale: 'Trossard has a favorable fixture run and is in better form than Bowen.',
  },
  {
    playerIn:  { name: 'Evan Ferguson', team: 'Brighton', position: 'FWD', price: '£5.5m' },
    playerOut: { name: 'João Pedro',    team: 'Brighton', position: 'FWD', price: '£5.5m' },
    xPointsIn: 4.5,
    xPointsOut: 2.0,
    xPointsDiff: 2.5,
    rationale: 'Ferguson is getting more minutes and has a higher expected points per match.',
  },
  {
    playerIn:  { name: 'Pablo Fornals',  team: 'West Ham', position: 'MID', price: '£5.3m' },
    playerOut: { name: 'Bukayo Saka',    team: 'Arsenal',  position: 'MID', price: '£10.2m' },
    xPointsIn: 4.0,
    xPointsOut: 3.0,
    xPointsDiff: 1.0,
    rationale: 'Saka is injured. Fornals has a more favorable fixture schedule.',
  },
];

export const mockAISummary: AISummary = {
  heading: "AI Summary",
  intro:
      "Your squad looks stable this week. Prioritize minutes safety and consider one upside transfer if you’re not rolling.",
  items: [
    { tone: "good", text: "Captain: Palmer looks strongest — keep him (high upside + reliable minutes)." },
    { tone: "info", text: "Transfer idea: Bowen → Trossard for fixture/form upside (+1.4 xPts)." },
    { tone: "warn", text: "Watchlist: Saka flagged/injured — make sure you have a playable bench cover." },
  ],
  footerHint: "More detail coming (rationale + expand cards).",
};
