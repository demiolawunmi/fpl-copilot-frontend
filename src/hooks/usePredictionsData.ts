/**
 * Hook to fetch AIrsenal predictions and fixtures-by-player data
 */
import { useState, useEffect } from 'react';
import {
  getPredictions,
  getFixturesByPlayer,
  type PredictionPlayer,
  type PlayerFixture,
} from '../api/backend';

export interface PredictionsData {
  loading: boolean;
  error: string | null;
  predictions: Map<number, PredictionPlayer>;
  fixturesByPlayer: Map<number, PlayerFixture>;
}

export function usePredictionsData(gw: number | null): PredictionsData {
  const [state, setState] = useState<PredictionsData>({
    loading: true,
    error: null,
    predictions: new Map(),
    fixturesByPlayer: new Map(),
  });

  useEffect(() => {
    if (!gw || gw <= 0) {
      setState({
        loading: false,
        error: null,
        predictions: new Map(),
        fixturesByPlayer: new Map(),
      });
      return;
    }

    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        // Fetch predictions and fixtures in parallel
        const [predictionsData, fixturesData] = await Promise.all([
          getPredictions(gw as number).catch(() => [] as PredictionPlayer[]),
          getFixturesByPlayer(gw as number).catch(() => [] as PlayerFixture[]),
        ]);

        if (cancelled) return;

        // Build lookup maps
        const predictions = new Map(
          predictionsData.map((p) => [p.player_id, p])
        );
        const fixturesByPlayer = new Map(
          fixturesData.map((f) => [f.player_id, f])
        );

        setState({
          loading: false,
          error: null,
          predictions,
          fixturesByPlayer,
        });
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load predictions';
          setState((s) => ({ ...s, loading: false, error: message }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [gw]);

  return state;
}
