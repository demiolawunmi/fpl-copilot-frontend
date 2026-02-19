import type {
  BootstrapStatic,
  EntryInfo,
  EntryHistory,
  EntryPicks,
  LiveGameweek,
  Fixture,
} from './fpl';
import { fplEndpoints } from './endpoints';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * FPL API client
 */
export const fplClient = {
  /**
   * Fetch bootstrap-static data (teams, players, gameweeks)
   */
  getBootstrapStatic: (): Promise<BootstrapStatic> => {
    return fetchJson<BootstrapStatic>(fplEndpoints.bootstrapStatic());
  },

  /**
   * Fetch entry (team) info
   */
  getEntryInfo: (teamId: number | string): Promise<EntryInfo> => {
    return fetchJson<EntryInfo>(fplEndpoints.entry(teamId));
  },

  /**
   * Fetch entry history (current season + past seasons + chips)
   */
  getEntryHistory: (teamId: number | string): Promise<EntryHistory> => {
    return fetchJson<EntryHistory>(fplEndpoints.entryHistory(teamId));
  },

  /**
   * Fetch entry picks for a specific gameweek
   */
  getEntryPicks: (teamId: number | string, gameweek: number): Promise<EntryPicks> => {
    return fetchJson<EntryPicks>(fplEndpoints.entryPicks(teamId, gameweek));
  },

  /**
   * Fetch live gameweek data (player points)
   */
  getLiveGameweek: (gameweek: number): Promise<LiveGameweek> => {
    return fetchJson<LiveGameweek>(fplEndpoints.liveGameweek(gameweek));
  },

  /**
   * Fetch all fixtures
   */
  getFixtures: (): Promise<Fixture[]> => {
    return fetchJson<Fixture[]>(fplEndpoints.fixtures());
  },
};
