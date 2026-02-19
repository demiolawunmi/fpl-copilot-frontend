// Mock data for GW Overview

import type { GWInfo, GWStats, Player, Fixture, Injury, Transfer, RecommendedTransfer } from '../types/fpl';

export const mockGWInfo: GWInfo = {
  gameweek: 25,
  deadline: '2024-02-24T11:30:00Z',
  isFinished: false,
};

export const mockGWStats: GWStats = {
  gwPoints: 58,
  manualPoints: 62,
  totalPoints: 1456,
  gwRank: 2456789,
  overallRank: 1234567,
  teamValue: 102.3,
  bank: 0.5,
  transfers: 1,
  transferCost: 4,
  benchPoints: 8,
  pointsDiscrepancy: 4,
};

export const mockPlayers: Player[] = [
  // Starters
  { id: 1, name: 'Raya', position: 'GKP', team: 'ARS', points: 6, isCaptain: false, isViceCaptain: false, multiplier: 1, isBench: false, actualPoints: 6 },
  { id: 2, name: 'Alexander-Arnold', position: 'DEF', team: 'LIV', points: 12, isCaptain: false, isViceCaptain: true, multiplier: 1, isBench: false, actualPoints: 12 },
  { id: 3, name: 'Gabriel', position: 'DEF', team: 'ARS', points: 8, isCaptain: false, isViceCaptain: false, multiplier: 1, isBench: false, actualPoints: 8 },
  { id: 4, name: 'Dalot', position: 'DEF', team: 'MUN', points: 2, isCaptain: false, isViceCaptain: false, multiplier: 1, isBench: false, actualPoints: 2 },
  { id: 5, name: 'Saka', position: 'MID', team: 'ARS', points: 3, isCaptain: false, isViceCaptain: false, multiplier: 1, isBench: false, actualPoints: 3 },
  { id: 6, name: 'Salah', position: 'MID', team: 'LIV', points: 18, isCaptain: true, isViceCaptain: false, multiplier: 2, isBench: false, actualPoints: 9 },
  { id: 7, name: 'Palmer', position: 'MID', team: 'CHE', points: 7, isCaptain: false, isViceCaptain: false, multiplier: 1, isBench: false, actualPoints: 7 },
  { id: 8, name: 'Bowen', position: 'MID', team: 'WHU', points: 5, isCaptain: false, isViceCaptain: false, multiplier: 1, isBench: false, actualPoints: 5 },
  { id: 9, name: 'Haaland', position: 'FWD', team: 'MCI', points: 4, isCaptain: false, isViceCaptain: false, multiplier: 1, isBench: false, actualPoints: 4 },
  { id: 10, name: 'Watkins', position: 'FWD', team: 'AVL', points: 2, isCaptain: false, isViceCaptain: false, multiplier: 1, isBench: false, actualPoints: 2 },
  { id: 11, name: 'Solanke', position: 'FWD', team: 'TOT', points: 6, isCaptain: false, isViceCaptain: false, multiplier: 1, isBench: false, actualPoints: 6 },
  // Bench
  { id: 12, name: 'Fabianski', position: 'GKP', team: 'WHU', points: 2, isCaptain: false, isViceCaptain: false, multiplier: 1, isBench: true, actualPoints: 2 },
  { id: 13, name: 'Branthwaite', position: 'DEF', team: 'EVE', points: 6, isCaptain: false, isViceCaptain: false, multiplier: 1, isBench: true, actualPoints: 6 },
  { id: 14, name: 'Gordon', position: 'MID', team: 'NEW', points: 3, isCaptain: false, isViceCaptain: false, multiplier: 1, isBench: true, actualPoints: 3 },
  { id: 15, name: 'Wood', position: 'FWD', team: 'NFO', points: 2, isCaptain: false, isViceCaptain: false, multiplier: 1, isBench: true, actualPoints: 2 },
];

export const mockFixtures: Fixture[] = [
  {
    id: 1,
    team_h: 1,
    team_a: 2,
    team_h_score: 2,
    team_a_score: 1,
    finished: true,
    started: true,
    kickoff_time: '2024-02-24T15:00:00Z',
  },
  {
    id: 2,
    team_h: 3,
    team_a: 4,
    team_h_score: null,
    team_a_score: null,
    finished: false,
    started: false,
    kickoff_time: '2024-02-24T17:30:00Z',
  },
];

export const mockInjuries: Injury[] = [
  {
    playerId: 123,
    playerName: 'Alexander-Arnold',
    news: 'Knee injury',
    chance: 50,
  },
  {
    playerId: 456,
    playerName: 'Haaland',
    news: 'Ankle knock',
    chance: 75,
  },
];

export const mockTransfers: Transfer[] = [
  {
    elementIn: 789,
    elementInName: 'Palmer',
    elementOut: 101,
    elementOutName: 'Foden',
    cost: 4,
    time: '2024-02-23T10:30:00Z',
  },
];

export const mockRecommendedTransfers: RecommendedTransfer[] = [
  {
    playerOut: {
      id: 4,
      name: 'Dalot',
      position: 'DEF',
    },
    playerIn: {
      id: 100,
      name: 'Robertson',
      position: 'DEF',
    },
    reason: 'Better fixtures and form',
    priority: 'high',
  },
  {
    playerOut: {
      id: 9,
      name: 'Haaland',
      position: 'FWD',
    },
    playerIn: {
      id: 200,
      name: 'Isak',
      position: 'FWD',
    },
    reason: 'Injury concern, Isak on fire',
    priority: 'medium',
  },
];
