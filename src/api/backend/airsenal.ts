/**
 * AIrsenal API endpoints - predictions, form data, and fixtures
 */
import { backendFetch, extractArrayPayload } from "./client";

// ── Form Last 4 Types ──

export interface FormLast4Player {
  player_id?: number;
  element?: number;
  code?: number;
  player_name?: string;
  name?: string;
  web_name?: string;
  team?: string;
  team_short_name?: string;
  team_name?: string;
  last4_points?: number;
  last_4_points?: number;
  points_last4?: number;
  last4_minutes?: number;
  last_4_minutes?: number;
  minutes_last4?: number;
  xG?: number;
  xg?: number;
  expected_goals?: number;
  xA?: number;
  xa?: number;
  expected_assists?: number;
  photo_url?: string;
}

export type FormLast4Response = FormLast4Player[];

// ── Predictions Types ──

export interface PredictionPlayer {
  player_id?: number;
  id?: number;
  element?: number;
  player_name?: string;
  name?: string;
  web_name?: string;
  team?: string;
  team_short_name?: string;
  team_name?: string;
  position?: string;
  xp?: number; // expected points
  expected_points?: number;
}

export type PredictionsResponse = PredictionPlayer[];

// ── Fixtures by Player Types ──

export interface PlayerFixture {
  player_id: number;
  player_name: string;
  team: string;
  fixtures: Array<{
    opponent: string;
    opponent_short: string;
    is_home: boolean;
    difficulty?: number; // 1-5 scale (if available)
    kickoff_time?: string;
  }>;
}

export type FixturesByPlayerResponse = PlayerFixture[];

// ── API Calls ──

/**
 * Get form data for last 4 gameweeks
 */
export async function getFormLast4(): Promise<FormLast4Response> {
  const payload = await backendFetch<unknown>("/api/airsenal/form_last4");
  return extractArrayPayload<FormLast4Player>(payload, ["data", "items", "results", "players", "form_last4"]);
}

/**
 * Get AIrsenal predictions for a specific gameweek
 */
export async function getPredictions(gw: number): Promise<PredictionsResponse> {
  const payload = await backendFetch<unknown>(`/api/airsenal/gw/${gw}/predictions`);
  return extractArrayPayload<PredictionPlayer>(payload, ["data", "items", "results", "predictions", "players"]);
}

/**
 * Get fixtures by player for a specific gameweek
 */
export async function getFixturesByPlayer(gw: number): Promise<FixturesByPlayerResponse> {
  const payload = await backendFetch<unknown>(`/api/airsenal/gw/${gw}/fixtures_by_player`);
  return extractArrayPayload<PlayerFixture>(payload, ["data", "items", "results", "fixtures_by_player", "players"]);
}
