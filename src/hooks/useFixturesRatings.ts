import { useEffect, useMemo, useState } from 'react';
import type { FplBootstrap } from '../api/fpl/fpl';
import type { TeamFdrFixtureItem } from '../api/backend/fdr';
import { getFdrEloSnapshot, getTeamFdrFixtures } from '../api/backend/fdr';
import { fetchJson } from '../api/fpl/client';
import { fplEndpoints } from '../api/fpl/endpoints';
import type { FixturesRatingsResponse, TeamFixtureRatingsRow } from '../types/fixturesRatings';

const MATRIX_WEEKS = 5;
const TEAM_FIXTURES_LOOKAHEAD = 38;
const TEAM_FETCH_CONCURRENCY = 5;

function maxEventId(bootstrap: FplBootstrap & { events?: { id: number }[] }): number {
  const ids = bootstrap.events?.map((e) => e.id) ?? [];
  return ids.length ? Math.max(...ids) : 38;
}

function buildSkeleton(
  bootstrap: FplBootstrap | null,
  fromGw: number,
): FixturesRatingsResponse | null {
  if (!bootstrap?.teams?.length) return null;

  const maxGw = maxEventId(bootstrap as FplBootstrap & { events?: { id: number }[] });
  const gameweekIds: number[] = [];
  for (let i = 0; i < MATRIX_WEEKS; i++) {
    const id = fromGw + i;
    if (id <= maxGw) gameweekIds.push(id);
  }

  const teams = [...bootstrap.teams]
    .sort((a, b) => a.short_name.localeCompare(b.short_name))
    .map((t) => {
      const empty = Array(gameweekIds.length).fill(null) as (number | null)[];
      return {
        shortName: t.short_name,
        elo: null as number | null,
        eloFdrSummary: null,
        officialFdr: [...empty],
        eloBasedFdr: [...empty],
      } satisfies TeamFixtureRatingsRow;
    });

  return { gameweekIds, teams };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function parseOptionalInt(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number.parseInt(value, 10);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function extractSaturatedRecord(item: TeamFdrFixtureItem): Record<string, unknown> {
  const nested = item.saturated;
  if (nested && typeof nested === 'object') {
    return nested as Record<string, unknown>;
  }
  return {};
}

function extractGameweek(sat: Record<string, unknown>): number | null {
  return (
    parseOptionalInt(sat.gameweek) ??
    parseOptionalInt(sat.official_fpl_event) ??
    parseOptionalInt(sat.event) ??
    parseOptionalInt(sat.round)
  );
}

function extractOfficialFplFdr(sat: Record<string, unknown>): number | null {
  return (
    parseOptionalInt(sat.official_fpl_fdr) ??
    parseOptionalInt(sat.official_fdr) ??
    parseOptionalInt(sat.fpl_fdr)
  );
}

function parseOverallFdr(overall: unknown): number | null {
  if (typeof overall === 'number' && Number.isFinite(overall)) return overall;
  if (typeof overall === 'string' && overall.trim() !== '') {
    const n = Number.parseFloat(overall);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function fillRowFromTeamApi(
  gwIds: number[],
  fixtures: TeamFdrFixtureItem[],
): { officialFdr: (number | null)[]; eloBasedFdr: (number | null)[] } {
  const officialFdr = gwIds.map(() => null as number | null);
  const eloBasedFdr = gwIds.map(() => null as number | null);

  for (const item of fixtures) {
    const sat = extractSaturatedRecord(item);
    const gw = extractGameweek(sat);
    if (gw == null || !gwIds.includes(gw)) continue;

    const idx = gwIds.indexOf(gw);
    const o = extractOfficialFplFdr(sat);
    officialFdr[idx] = o != null ? Math.round(o) : null;

    const overall = parseOverallFdr(item.fdr?.overall_fdr);
    eloBasedFdr[idx] = overall != null ? round1(overall) : null;
  }

  return { officialFdr, eloBasedFdr };
}

interface FplFixtureRaw {
  id?: number;
  event: number | null;
  team_h: number;
  team_a: number;
  team_h_difficulty?: number | null;
  team_a_difficulty?: number | null;
}

function buildFplOfficialMap(
  fplFixtures: FplFixtureRaw[],
  gwIds: number[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const f of fplFixtures) {
    if (f.event == null || !gwIds.includes(f.event)) continue;
    const hd = f.team_h_difficulty;
    if (hd != null && Number.isFinite(hd)) {
      map.set(`${f.team_h}-${f.event}`, Math.round(hd));
    }
    const ad = f.team_a_difficulty;
    if (ad != null && Number.isFinite(ad)) {
      map.set(`${f.team_a}-${f.event}`, Math.round(ad));
    }
  }
  return map;
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    const part = await Promise.all(chunk.map(fn));
    out.push(...part);
  }
  return out;
}

export function useFixturesRatings(
  bootstrap: FplBootstrap | null,
  fromGameweek: number,
) {
  const [data, setData] = useState<FixturesRatingsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skeleton = useMemo(
    () => buildSkeleton(bootstrap, fromGameweek),
    [bootstrap, fromGameweek],
  );

  useEffect(() => {
    if (!skeleton || !bootstrap?.teams?.length) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const gwIds = skeleton.gameweekIds;
        const teamsSorted = [...bootstrap.teams].sort((a, b) =>
          a.short_name.localeCompare(b.short_name),
        );

        let eloById = new Map<number, number>();
        try {
          const eloSnap = await getFdrEloSnapshot();
          eloById = new Map(eloSnap.ratings.map((r) => [r.team_id, r.elo]));
        } catch {
          /* Elo optional */
        }

        let fplOfficialMap = new Map<string, number>();
        try {
          const fplFixtures = await fetchJson<FplFixtureRaw[]>(fplEndpoints.fixtures());
          fplOfficialMap = buildFplOfficialMap(fplFixtures, gwIds);
        } catch {
          /* FPL fixtures optional — backend data alone may suffice */
        }

        const perTeam = await mapPool(teamsSorted, TEAM_FETCH_CONCURRENCY, async (t) => {
          try {
            const fixtures = await getTeamFdrFixtures(t.id, TEAM_FIXTURES_LOOKAHEAD);
            return { id: t.id, short_name: t.short_name, fixtures };
          } catch {
            return { id: t.id, short_name: t.short_name, fixtures: [] as TeamFdrFixtureItem[] };
          }
        });

        if (cancelled) return;

        const rows: TeamFixtureRatingsRow[] = perTeam.map((pt) => {
          const { officialFdr, eloBasedFdr } = fillRowFromTeamApi(gwIds, pt.fixtures);

          // Merge FPL bootstrap difficulties into official column when backend cell is null
          const mergedOfficialFdr = officialFdr.map((backendVal, i) => {
            if (backendVal != null) return backendVal;
            return fplOfficialMap.get(`${pt.id}-${gwIds[i]}`) ?? null;
          });

          const vals = eloBasedFdr.filter((x): x is number => x != null);
          const eloFdrSummary =
            vals.length > 0 ? round1(vals.reduce((a, b) => a + b, 0) / vals.length) : null;

          return {
            shortName: pt.short_name,
            elo: eloById.get(pt.id) ?? null,
            eloFdrSummary,
            officialFdr: mergedOfficialFdr,
            eloBasedFdr,
          };
        });

        setData({ gameweekIds: gwIds, teams: rows });

        const anyData = rows.some(
          (r) =>
            r.elo != null ||
            r.officialFdr.some((x) => x != null) ||
            r.eloBasedFdr.some((x) => x != null),
        );
        if (!anyData && eloById.size === 0) {
          setError('Backend FDR data unavailable — is the API running on port 8000?');
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load FDR data');
          setData(skeleton);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bootstrap, skeleton, fromGameweek]);

  return { data, loading, skeleton, error };
}
