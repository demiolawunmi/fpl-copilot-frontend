import { useState, useEffect } from 'react';
import {
  getBootstrap,
  getEntry,
  getPicks,
  buildUiSquadFromPicks,
  type FplBootstrap,
} from '../api/fpl/fpl';
import { fetchJson } from '../api/fpl/client';
import { fplEndpoints } from '../api/fpl/endpoints';
import type { GWInfo, GWStats, Player, Fixture } from '../data/gwOverviewMocks';

// ── Live event type (points per player) ──
type FplLiveEvent = {
  elements: Array<{
    id: number;
    stats: { total_points: number };
  }>;
};

// ── Entry history (for ranks) ──
type FplEntryHistory = {
  current: Array<{
    event: number;
    points: number;
    rank: number;
    overall_rank: number;
  }>;
};

// ── Bootstrap event (for averages) ──
type FplBootstrapEvent = {
  id: number;
  average_entry_score: number;
  highest_score: number;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
};

type FplBootstrapFull = FplBootstrap & {
  events: FplBootstrapEvent[];
};

// ── FPL fixtures response ──
type FplFixture = {
  event: number;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  kickoff_time: string;
  finished: boolean;
};

// ── Team color map (for badge circles) ──
const TEAM_COLORS: Record<string, string> = {
  ARS: '#EF0107', AVL: '#670E36', BOU: '#DA291C', BRE: '#e30613',
  BHA: '#0057B8', CHE: '#034694', CRY: '#1B458F', EVE: '#003399',
  FUL: '#000000', IPS: '#0044AA', LEI: '#003090', LIV: '#C8102E',
  MCI: '#6CABDD', MUN: '#DA291C', NEW: '#241F20', NFO: '#DD0000',
  SOU: '#D71920', TOT: '#132257', WHU: '#7A263A', WOL: '#FDB913',
};

// ── Hook state ──
export interface FplData {
  loading: boolean;
  error: string | null;
  gwInfo: GWInfo | null;
  stats: GWStats | null;
  squad: Player[];
  fixtures: Fixture[];
  currentGW: number;
  bootstrap: FplBootstrapFull | null;
}

export function useFplData(teamId: string | null, gwOverride?: number): FplData {
  const [state, setState] = useState<FplData>({
    loading: true,
    error: null,
    gwInfo: null,
    stats: null,
    squad: [],
    fixtures: [],
    currentGW: 0,
    bootstrap: null,
  });

  useEffect(() => {
    if (!teamId) {
      setState((s) => ({ ...s, loading: false, error: 'No team ID' }));
      return;
    }

    let cancelled = false;
    const id = teamId; // non-null after guard above

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        // 1. Bootstrap (contains players, teams, events)
        const bootstrap = (await getBootstrap()) as FplBootstrapFull;

        // 2. Find current GW
        const currentEvent = bootstrap.events.find((e) => e.is_current) ??
          bootstrap.events.filter((e) => e.finished).pop();
        const currentGW = currentEvent?.id ?? 1;
        const selectedGW = gwOverride ?? currentGW;
        const selectedEvent = bootstrap.events.find((e) => e.id === selectedGW) ?? currentEvent;

        // 3. Entry info
        const entry = await getEntry(id);

        // 4. Picks for selected GW
        const picks = await getPicks(id, selectedGW);

        // 5. Live event (points)
        let liveData: FplLiveEvent | null = null;
        try {
          liveData = await fetchJson<FplLiveEvent>(fplEndpoints.liveEvent(selectedGW));
        } catch {
          // live data may not be available yet
        }

        // 6. Entry history (for ranks)
        let historyData: FplEntryHistory | null = null;
        try {
          historyData = await fetchJson<FplEntryHistory>(fplEndpoints.entryHistory(id));
        } catch {
          // history may fail
        }

        // 7. Fixtures for selected GW
        let rawFixtures: FplFixture[] = [];
        try {
          rawFixtures = await fetchJson<FplFixture[]>(fplEndpoints.fixtures(selectedGW));
        } catch {
          // fixtures may fail
        }

        if (cancelled) return;

        // ── Build UI data ──

        // Points lookup
        const pointsById = new Map<number, number>();
        if (liveData) {
          for (const el of liveData.elements) {
            pointsById.set(el.id, el.stats.total_points);
          }
        }

        // Build squad from picks + bootstrap
        const uiSquad = buildUiSquadFromPicks(picks, bootstrap);

        // Build team lookups
        const teamsById = new Map(bootstrap.teams.map((t) => [t.id, t]));
        const teamAbbrById = new Map(bootstrap.teams.map((t) => [t.id, t.short_name]));

        // Cross-reference fixtures for this GW: map each team id -> opponent abbreviations
        // Handles double gameweeks (a team can appear in multiple fixtures)
        const opponentsByTeam = new Map<number, string[]>();
        for (const f of rawFixtures) {
          // Home team's opponent is the away team
          const homeOpp = teamAbbrById.get(f.team_a) ?? '???';
          opponentsByTeam.set(f.team_h, (opponentsByTeam.get(f.team_h) ?? []).concat(homeOpp));
          // Away team's opponent is the home team
          const awayOpp = teamAbbrById.get(f.team_h) ?? '???';
          opponentsByTeam.set(f.team_a, (opponentsByTeam.get(f.team_a) ?? []).concat(awayOpp));
        }

        const squad: Player[] = uiSquad.map((p) => ({
          name: p.name,
          position: p.position,
          points: pointsById.get(p.id) ?? 0,
          isCaptain: p.isCaptain,
          isViceCaptain: p.isViceCaptain,
          isBench: p.isBench,
          photoUrl: p.photoUrl,
          teamAbbr: p.teamAbbr ?? (p.teamId ? teamAbbrById.get(p.teamId) : undefined),
          opponents: p.teamId ? opponentsByTeam.get(p.teamId) ?? [] : [],
        }));

        // GW info
        const gwInfo: GWInfo = {
          gameweek: selectedGW,
          teamName: entry.name,
          manager: `${entry.player_first_name} ${entry.player_last_name}`,
          teamId: id,
        };

        // Stats
        const gwHistory = historyData?.current.find((h) => h.event === selectedGW);
        const stats: GWStats = {
          average: selectedEvent?.average_entry_score ?? 0,
          highest: selectedEvent?.highest_score ?? 0,
          gwPoints: gwHistory?.points ?? squad.reduce((sum, p) => {
            const pts = p.isCaptain ? p.points * 2 : p.points;
            return p.isBench ? sum : sum + pts;
          }, 0),
          gwRank: gwHistory?.rank ?? 0,
          overallRank: gwHistory?.overall_rank ?? 0,
        };


        // Fixtures
        const fixtures: Fixture[] = rawFixtures.map((f) => {
          const home = teamsById.get(f.team_h);
          const away = teamsById.get(f.team_a);
          const homeAbbr = home?.short_name ?? '???';
          const awayAbbr = away?.short_name ?? '???';

          const kickoff = new Date(f.kickoff_time);
          const dateStr = kickoff.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          });

          return {
            date: dateStr,
            dateISO: f.kickoff_time ?? undefined,
            homeTeam: home?.name ?? 'Unknown',
            homeAbbr,
            homeColor: TEAM_COLORS[homeAbbr] ?? '#666',
            homeBadge: home?.code ? fplEndpoints.teamBadge(home.code, 't40') : undefined,
            awayTeam: away?.name ?? 'Unknown',
            awayAbbr,
            awayColor: TEAM_COLORS[awayAbbr] ?? '#666',
            awayBadge: away?.code ? fplEndpoints.teamBadge(away.code, 't40') : undefined,
            homeScore: f.team_h_score ?? 0,
            awayScore: f.team_a_score ?? 0,
          };
        });

        setState({
          loading: false,
          error: null,
          gwInfo,
          stats,
          squad,
          fixtures,
          currentGW,
          bootstrap,
        });
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load FPL data';
          setState((s) => ({
            ...s,
            loading: false,
            error: message,
          }));
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [teamId, gwOverride]);

  return state;
}
