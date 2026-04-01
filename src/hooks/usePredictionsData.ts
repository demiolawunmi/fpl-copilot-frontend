/**
 * Hook to fetch AIrsenal predictions and fixtures-by-player data.
 *
 * Matching strategy: AIrsenal player_id ≠ FPL element id, so we match
 * primarily by normalised (name + team) and fall back to name-only.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getPredictions,
  getFixturesByPlayer,
  type PredictionPlayer,
  type PlayerFixture,
} from '../api/backend';

export interface PredictionsData {
  loading: boolean;
  error: string | null;
  /** Lookup a prediction by player web_name and team abbreviation */
  lookupPrediction: (name: string, teamAbbr?: string) => PredictionPlayer | undefined;
  /** Raw name-only map (for less precise fallback) */
  predictionsByName: Map<string, PredictionPlayer>;
  /** All normalised predictions */
  allPredictions: PredictionPlayer[];
  fixturesByPlayer: Map<number, PlayerFixture>;
  /** Fixture lookup by normalised player name */
  fixturesByName: Map<string, PlayerFixture>;
}

const EMPTY_PREDICTIONS: PredictionPlayer[] = [];
const EMPTY_PREDICTION_MAP = new Map<string, PredictionPlayer>();
const EMPTY_FIXTURE_BY_PLAYER = new Map<number, PlayerFixture>();
const EMPTY_FIXTURE_BY_NAME = new Map<string, PlayerFixture>();

// ── helpers ──

const norm = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const normalizePrediction = (p: PredictionPlayer, idx: number): PredictionPlayer => {
  const player_name = p.player_name ?? p.name ?? p.web_name ?? '';
  const team = p.team ?? p.team_short_name ?? p.team_name ?? '';
  const xp = Number(p.xp ?? p.expected_points ?? 0);
  return {
    player_id: Number(p.player_id ?? p.id ?? p.element ?? 0) || idx,
    player_name,
    team,
    position: p.position ?? '',
    xp,
  };
};

// ── hook ──

export function usePredictionsData(gw: number | null): PredictionsData {
  const [allPredictions, setAllPredictions] = useState<PredictionPlayer[]>([]);
  const [byNameTeam, setByNameTeam]       = useState<Map<string, PredictionPlayer>>(new Map());
  const [byName, setByName]               = useState<Map<string, PredictionPlayer>>(new Map());
  const [fixturesByPlayer, setFixturesByPlayer] = useState<Map<number, PlayerFixture>>(new Map());
  const [fixturesByName, setFixturesByName]     = useState<Map<string, PlayerFixture>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const applyLoadedData = useCallback((
    normalized: PredictionPlayer[],
    ntMap: Map<string, PredictionPlayer>,
    nMap: Map<string, PredictionPlayer>,
    fByPlayer: Map<number, PlayerFixture>,
    fByName: Map<string, PlayerFixture>,
  ) => {
    setAllPredictions(normalized);
    setByNameTeam(ntMap);
    setByName(nMap);
    setFixturesByPlayer(fByPlayer);
    setFixturesByName(fByName);
    setLoading(false);
  }, []);

  const applyError = useCallback((message: string) => {
    setError(message);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!gw || gw <= 0) {
      return;
    }

    let cancelled = false;

    async function load() {
      startLoading();

      try {
        const [rawPreds, rawFixtures] = await Promise.all([
          getPredictions(gw as number).catch(() => [] as PredictionPlayer[]),
          getFixturesByPlayer(gw as number).catch(() => [] as PlayerFixture[]),
        ]);

        if (cancelled) return;

        const normalized = rawPreds.map(normalizePrediction);

        // ── name+team keyed map (primary) ──
        const ntMap = new Map<string, PredictionPlayer>();
        // ── name-only keyed map (fallback) ──
        const nMap  = new Map<string, PredictionPlayer>();

        for (const p of normalized) {
          const nameKey = norm(p.player_name ?? '');
          if (!nameKey) continue;

          // name-only (last write wins – acceptable for fallback)
          nMap.set(nameKey, p);

          // name + every team variant the payload carries
          const teamVariants: string[] = [];
          if (p.team)            teamVariants.push(norm(p.team));
          if (p.team_short_name) teamVariants.push(norm(p.team_short_name));
          if (p.team_name)       teamVariants.push(norm(p.team_name));
          // dedupe
          const seen = new Set<string>();
          for (const tv of teamVariants) {
            if (!tv || seen.has(tv)) continue;
            seen.add(tv);
            ntMap.set(`${nameKey}|${tv}`, p);
          }
          // Also store under name+name (e.g. "guehi|guehi" won't collide)
          // so that if the caller passes the same value for both it still works.
        }

        // Fixtures
        const fByPlayer = new Map(rawFixtures.map((f) => [f.player_id, f]));
        const fByName   = new Map<string, PlayerFixture>();
        for (const f of rawFixtures) {
          const key = norm(f.player_name ?? '');
          if (key) fByName.set(key, f);
        }

        applyLoadedData(normalized, ntMap, nMap, fByPlayer, fByName);
      } catch (err: unknown) {
        if (!cancelled) {
          applyError(err instanceof Error ? err.message : 'Failed to load predictions');
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [gw, startLoading, applyLoadedData, applyError]);

  /**
   * Best-effort lookup: try name+team first, then name-only.
   * `teamAbbr` can be the FPL short_name ("CRY") or the full name ("Crystal Palace").
   */
  const lookupPrediction = useCallback(
    (name: string, teamAbbr?: string): PredictionPlayer | undefined => {
      const nameKey = norm(name);
      if (!nameKey) return undefined;

      // 1. Try name + team
      if (teamAbbr) {
        const teamKey = norm(teamAbbr);
        const match = byNameTeam.get(`${nameKey}|${teamKey}`);
        if (match) return match;
      }

      // 2. Fallback: name only
      return byName.get(nameKey);
    },
    [byNameTeam, byName],
  );

  if (!gw || gw <= 0) {
    return {
      loading: false,
      error: null,
      lookupPrediction,
      predictionsByName: EMPTY_PREDICTION_MAP,
      allPredictions: EMPTY_PREDICTIONS,
      fixturesByPlayer: EMPTY_FIXTURE_BY_PLAYER,
      fixturesByName: EMPTY_FIXTURE_BY_NAME,
    };
  }

  return {
    loading,
    error,
    lookupPrediction,
    predictionsByName: byName,
    allPredictions,
    fixturesByPlayer,
    fixturesByName,
  };
}
