// FPL API Endpoints

export const FPL_BASE_URL = 'https://fantasy.premierleague.com/api';

// Use Vite proxy in development
export const API_BASE = import.meta.env.DEV ? '/fpl-api' : FPL_BASE_URL;

export const ENDPOINTS = {
  // Bootstrap static data (players, teams, gameweeks)
  bootstrap: () => `${API_BASE}/bootstrap-static/`,
  
  // Entry (team) data
  entry: (teamId: number) => `${API_BASE}/entry/${teamId}/`,
  
  // Entry history
  entryHistory: (teamId: number) => `${API_BASE}/entry/${teamId}/history/`,
  
  // Team picks for a specific gameweek
  picks: (teamId: number, gameweek: number) => 
    `${API_BASE}/entry/${teamId}/event/${gameweek}/picks/`,
  
  // Live gameweek data
  live: (gameweek: number) => `${API_BASE}/event/${gameweek}/live/`,
  
  // Fixtures
  fixtures: () => `${API_BASE}/fixtures/`,
};
