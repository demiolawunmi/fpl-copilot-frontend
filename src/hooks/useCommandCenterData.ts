/**
 * useCommandCenterData – fetches all data needed for the Command Center page.
 *
 * Key difference from useFplData:
 *   • The Command Center is a **planning** tool — it always targets the NEXT
 *     gameweek (the one you're setting your team up for).
 *   • The squad comes from `/api/fpl/my-team` (your current draft) rather than
 *     `/entry/{id}/event/{gw}/picks/` (which is historical).
 *   • Fixtures and opponents are loaded for the next GW so the pitch chips
 *     show who each player is facing.
 */
import { useState, useEffect } from 'react';
import {
  getBootstrap,
  getEntry,
  elementTypeToPosition,
  getPlayerPhotoUrl,
  type FplBootstrap,
} from '../api/fpl/fpl';
import { fetchJson } from '../api/fpl/client';
import { fplEndpoints } from '../api/fpl/endpoints';
import { getMyTeam, type MyTeamResponse } from '../api/backend';
import type { GWInfo, Player, Fixture } from '../data/gwOverviewMocks';

// ── Bootstrap event with deadline ──
type FplBootstrapEvent = {
  id: number;
  average_entry_score: number;
  highest_score: number;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
  deadline_time?: string;
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

// ── Team color map ──
const TEAM_COLORS: Record<string, string> = {
  ARS: '#EF0107', AVL: '#670E36', BOU: '#DA291C', BRE: '#e30613',
  BHA: '#0057B8', CHE: '#034694', CRY: '#1B458F', EVE: '#003399',
  FUL: '#000000', IPS: '#0044AA', LEI: '#003090', LIV: '#C8102E',
  MCI: '#6CABDD', MUN: '#DA291C', NEW: '#241F20', NFO: '#DD0000',
  SOU: '#D71920', TOT: '#132257', WHU: '#7A263A', WOL: '#FDB913',
};

// ── Hook state ──
export interface CommandCenterData {
  loading: boolean;
  error: string | null;
  /** The next gameweek number (the one the manager is picking for). */
  nextGW: number;
  gwInfo: GWInfo | null;
  squad: Player[];
  fixtures: Fixture[];
  bootstrap: FplBootstrapFull | null;
  myTeam: MyTeamResponse | null;
}

export function useCommandCenterData(teamId: string | null): CommandCenterData {
  const [state, setState] = useState<CommandCenterData>({
    loading: true,
    error: null,
    nextGW: 0,
    gwInfo: null,
    squad: [],
    fixtures: [],
    bootstrap: null,
    myTeam: null,
  });

  useEffect(() => {
    if (!teamId) {
      setState((s) => ({ ...s, loading: false, error: 'No team ID' }));
      return;
    }

    let cancelled = false;
    const id = teamId;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        // ��─ 1. Bootstrap (players, teams, events) ──
        const bootstrap = (await getBootstrap()) as FplBootstrapFull;

        // ── 2. My-team from our backend ──
        let myTeam: MyTeamResponse | null = null;
        try {
          myTeam = await getMyTeam();
        } catch {
          // backend may not be running
        }

        // ── 3. Determine the NEXT gameweek ──
        // `is_next` = the upcoming GW whose deadline hasn't passed yet.
        // If all GWs are finished or the season hasn't started, fall back.
        const nextEvent = bootstrap.events.find((e) => e.is_next);
        const currentEvent = bootstrap.events.find((e) => e.is_current)
          ?? bootstrap.events.filter((e) => e.finished).pop();

        // The GW we plan for is always the next one. If there is no next
        // (end of season), fall back to the current.
        const nextGW = nextEvent?.id ?? ((currentEvent?.id ?? 0) + 1);

        // ── 4. Entry info ──
        const entry = await getEntry(id);

        // ── 5. Build squad from my-team (draft picks), NOT from historical picks ──
        const byId = new Map(bootstrap.elements.map((e) => [e.id, e]));
        const teamsById = new Map(bootstrap.teams.map((t) => [t.id, t]));
        const teamAbbrById = new Map(bootstrap.teams.map((t) => [t.id, t.short_name]));

        // ── 6. Fixtures for the NEXT gameweek ──
        let rawFixtures: FplFixture[] = [];
        try {
          rawFixtures = await fetchJson<FplFixture[]>(fplEndpoints.fixtures(nextGW));
        } catch {
          // fixtures may fail
        }

        // Build opponent lookup: team id → opponent abbreviations
        const opponentsByTeam = new Map<number, string[]>();
        for (const f of rawFixtures) {
          const homeOpp = teamAbbrById.get(f.team_a) ?? '???';
          opponentsByTeam.set(f.team_h, (opponentsByTeam.get(f.team_h) ?? []).concat(homeOpp));
          const awayOpp = teamAbbrById.get(f.team_h) ?? '???';
          opponentsByTeam.set(f.team_a, (opponentsByTeam.get(f.team_a) ?? []).concat(awayOpp));
        }

        if (cancelled) return;

        // ── Build squad ──
        let squad: Player[] = [];

        if (myTeam && myTeam.picks.length > 0) {
          // Use the real draft from the backend
          squad = myTeam.picks
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((pick) => {
              const el = byId.get(pick.element);
              const code = el?.code ?? 0;
              const playerTeamId = el?.team;
              const team = playerTeamId ? teamsById.get(playerTeamId) : undefined;

              return {
                id: el?.id ?? pick.element,
                name: el?.web_name ?? `#${pick.element}`,
                position: el
                  ? elementTypeToPosition(el.element_type)
                  : elementTypeToPosition(pick.element_type),
                points: 0, // next GW hasn't happened yet – no points
                isCaptain: pick.is_captain,
                isViceCaptain: pick.is_vice_captain,
                isBench: pick.position > 11,
                photoUrl: code ? getPlayerPhotoUrl(code, '110x140') : undefined,
                teamAbbr: team?.short_name,
                opponents: playerTeamId
                  ? opponentsByTeam.get(playerTeamId) ?? []
                  : [],
                sellingPrice: pick.selling_price,
                purchasePrice: pick.purchase_price,
                elementType: pick.element_type,
              };
            });
        }

        // ── GW info ──
        const gwInfo: GWInfo = {
          gameweek: nextGW,
          teamName: entry.name,
          manager: `${entry.player_first_name} ${entry.player_last_name}`,
          teamId: id,
        };

        // ── Fixtures ──
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
            homeBadge: home?.code
              ? fplEndpoints.teamBadge(home.code, 't40')
              : undefined,
            awayTeam: away?.name ?? 'Unknown',
            awayAbbr,
            awayColor: TEAM_COLORS[awayAbbr] ?? '#666',
            awayBadge: away?.code
              ? fplEndpoints.teamBadge(away.code, 't40')
              : undefined,
            homeScore: f.team_h_score ?? 0,
            awayScore: f.team_a_score ?? 0,
          };
        });

        setState({
          loading: false,
          error: null,
          nextGW,
          gwInfo,
          squad,
          fixtures,
          bootstrap,
          myTeam,
        });
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load data';
          setState((s) => ({ ...s, loading: false, error: message }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  return state;
}

