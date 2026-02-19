/**
 * Bandwagons API - most transferred players
 */
import { backendFetch } from "./client";

// ── Bandwagons Types ──

export interface BandwagonPlayer {
  player_id: number;
  player_name: string;
  team: string;
  transfers_in: number;
  transfers_out: number;
  transfers_balance: number;
}

export type BandwagonsResponse = BandwagonPlayer[];

// ── API Call ──

/**
 * Get most transferred players (bandwagons)
 */
export async function getBandwagons(): Promise<BandwagonsResponse> {
  return backendFetch<BandwagonsResponse>("/api/files/bandwagons");
}
