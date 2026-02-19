// FPL API Client

import { ENDPOINTS } from './endpoints';
import type {
  BootstrapResponse,
  EntryResponse,
  PicksResponse,
  HistoryResponse,
  LiveResponse,
  Fixture,
} from '../../types/fpl';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchFPL<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FPL API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('FPL API fetch error:', error);
    throw error;
  }
}

/**
 * Fetch bootstrap static data (players, teams, gameweeks, etc.)
 */
export async function getBootstrap(): Promise<BootstrapResponse> {
  return fetchFPL<BootstrapResponse>(ENDPOINTS.bootstrap());
}

/**
 * Fetch entry (team) data
 */
export async function getEntry(teamId: number): Promise<EntryResponse> {
  return fetchFPL<EntryResponse>(ENDPOINTS.entry(teamId));
}

/**
 * Fetch entry history (past gameweeks, chips, etc.)
 */
export async function getEntryHistory(teamId: number): Promise<HistoryResponse> {
  return fetchFPL<HistoryResponse>(ENDPOINTS.entryHistory(teamId));
}

/**
 * Fetch team picks for a specific gameweek
 */
export async function getPicks(teamId: number, gameweek: number): Promise<PicksResponse> {
  return fetchFPL<PicksResponse>(ENDPOINTS.picks(teamId, gameweek));
}

/**
 * Fetch live gameweek data (player points, etc.)
 */
export async function getLive(gameweek: number): Promise<LiveResponse> {
  return fetchFPL<LiveResponse>(ENDPOINTS.live(gameweek));
}

/**
 * Fetch all fixtures
 */
export async function getFixtures(): Promise<Fixture[]> {
  return fetchFPL<Fixture[]>(ENDPOINTS.fixtures());
}
