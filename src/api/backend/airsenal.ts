/**
 * AIrsenal API endpoints - predictions, form data, and fixtures
 */
import { backendFetch } from "./client";

// ── Form Last 4 Types ──

export interface FormLast4Player {
  player_id: number;
  player_name: string;
  team: string;
  last4_points: number;
  last4_minutes: number;
  xG?: number;
  xA?: number;
}

export type FormLast4Response = FormLast4Player[];

// ── Predictions Types ──

export interface PredictionPlayer {
  player_id: number;
  player_name: string;
  team: string;
  position: string;
  xp: number; // expected points
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
  return backendFetch<FormLast4Response>("/api/airsenal/form_last4");
}

/**
 * Get AIrsenal predictions for a specific gameweek
 */
export async function getPredictions(gw: number): Promise<PredictionsResponse> {
  return backendFetch<PredictionsResponse>(`/api/airsenal/gw/${gw}/predictions`);
}

/**
 * Get fixtures by player for a specific gameweek
 */
export async function getFixturesByPlayer(gw: number): Promise<FixturesByPlayerResponse> {
  return backendFetch<FixturesByPlayerResponse>(`/api/airsenal/gw/${gw}/fixtures_by_player`);
}
