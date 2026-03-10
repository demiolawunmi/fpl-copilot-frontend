import { backendFetch, extractArrayPayload } from './client';

export interface InjuryNewsPlayer {
  player_id?: number;
  id?: number;
  element?: number;
  name?: string;
  player_name?: string;
  web_name?: string;
  team?: string;
  team_short_name?: string;
  team_name?: string;
  chance_next_round?: number | null;
  chance_of_playing_next_round?: number | null;
  chance_this_round?: number | null;
  news?: string;
  status?: string;
}

export type InjuryNewsResponse = InjuryNewsPlayer[];

export async function getInjuryNews(): Promise<InjuryNewsResponse> {
  const payload = await backendFetch<unknown>('/api/files/injury_news');
  return extractArrayPayload<InjuryNewsPlayer>(payload, [
    'data',
    'items',
    'results',
    'players',
    'injury_news',
    'injuries',
    'news',
  ]);
}

