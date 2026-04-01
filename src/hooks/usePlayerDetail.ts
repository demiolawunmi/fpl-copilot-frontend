import { useEffect, useState } from 'react';
import {
  getBootstrap,
  getElementSummary,
  type ElementSummaryFixture,
  type ElementSummaryHistory,
  type ElementSummaryResponse,
  type FplBootstrapElement,
} from '../api/fpl/fpl';
import { fetchJson } from '../api/fpl/client';
import { fplEndpoints } from '../api/fpl/endpoints';
import type { FplFixtureLite } from '../utils/playerStatsModel';

type TeamNameById = Map<number, string>;
type TeamShortNameById = Map<number, string>;

export type PlayerDetailElement = FplBootstrapElement & {
  teamName: string;
  teamShortName: string;
  /** FPL team `code` (for badge CDN URLs), not the internal team id. */
  teamCode: number | null;
};

export type PlayerDetailFixture = Omit<ElementSummaryFixture, 'opponent_team'> & {
  opponent_team: number;
  opponentTeamName: string;
  opponentTeamShortName: string;
  opponentBadgeUrl?: string;
};

export type PlayerDetailHistory = ElementSummaryHistory & {
  opponentTeamName: string;
  opponentTeamShortName: string;
};

export type PlayerDetailSummary = Omit<ElementSummaryResponse, 'fixtures' | 'history'> & {
  fixtures: PlayerDetailFixture[];
  history: PlayerDetailHistory[];
};

export type UsePlayerDetailState = {
  loading: boolean;
  error: string | null;
  element: PlayerDetailElement | null;
  summary: PlayerDetailSummary | null;
  historySorted: PlayerDetailHistory[];
  /** Next FPL gameweek id (`is_next`), for prediction lookups. */
  nextGameweekId: number | null;
};

const INITIAL_STATE: UsePlayerDetailState = {
  loading: true,
  error: null,
  element: null,
  summary: null,
  historySorted: [],
  nextGameweekId: null,
};

const INVALID_PLAYER_STATE: UsePlayerDetailState = {
  loading: false,
  error: 'Invalid player id. Expected a positive integer.',
  element: null,
  summary: null,
  historySorted: [],
  nextGameweekId: null,
};

function parsePlayerId(playerId: string): number | null {
  const parsedId = Number(playerId);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }
  return parsedId;
}

type TeamCodeById = Map<number, number>;

function buildTeamMaps(teams: Array<{ id: number; code: number; name: string; short_name: string }>): {
  teamNameById: TeamNameById;
  teamShortNameById: TeamShortNameById;
  teamCodeById: TeamCodeById;
} {
  return {
    teamNameById: new Map(teams.map((team) => [team.id, team.name])),
    teamShortNameById: new Map(teams.map((team) => [team.id, team.short_name])),
    teamCodeById: new Map(teams.map((team) => [team.id, team.code])),
  };
}

const TEAM_FALLBACK_LABEL = 'TBD';

function isValidTeamId(teamId: number | null | undefined): teamId is number {
  return typeof teamId === 'number' && Number.isFinite(teamId) && teamId > 0;
}

function getTeamName(
  teamId: number | null | undefined,
  teamNameById: TeamNameById,
): string {
  if (!isValidTeamId(teamId)) {
    return TEAM_FALLBACK_LABEL;
  }

  return teamNameById.get(teamId) ?? TEAM_FALLBACK_LABEL;
}

function getTeamShortName(
  teamId: number | null | undefined,
  teamShortNameById: TeamShortNameById,
): string {
  if (!isValidTeamId(teamId)) {
    return TEAM_FALLBACK_LABEL;
  }

  return teamShortNameById.get(teamId) ?? TEAM_FALLBACK_LABEL;
}

function parseKickoffMs(kickoff: string | null | undefined): number {
  if (!kickoff) return Number.MAX_SAFE_INTEGER;
  const t = Date.parse(kickoff);
  return Number.isFinite(t) ? t : Number.MAX_SAFE_INTEGER;
}

/** FPL element-summary `fixtures` often omit `opponent_team`; derive from the player’s club id. */
function opponentTeamIdFromFixture(
  fixture: Pick<ElementSummaryFixture, 'team_h' | 'team_a'>,
  playerTeamId: number,
): number {
  return playerTeamId === fixture.team_h ? fixture.team_a : fixture.team_h;
}

function sortUpcomingPlayerFixtures(fixtures: PlayerDetailFixture[]): PlayerDetailFixture[] {
  return fixtures
    .filter((f) => f.finished !== true)
    .slice()
    .sort((a, b) => {
      const ka = parseKickoffMs(a.kickoff_time);
      const kb = parseKickoffMs(b.kickoff_time);
      if (ka !== kb) return ka - kb;
      const ea = a.event ?? 9999;
      const eb = b.event ?? 9999;
      return ea - eb;
    });
}

function buildFixturesFromFplSchedule(
  globalFixtures: FplFixtureLite[],
  playerTeamId: number,
  teamNameById: TeamNameById,
  teamShortNameById: TeamShortNameById,
  teamCodeById: TeamCodeById,
): PlayerDetailFixture[] {
  const out: PlayerDetailFixture[] = [];
  for (const f of globalFixtures) {
    if (f.finished === true) continue;
    if (f.team_h !== playerTeamId && f.team_a !== playerTeamId) continue;
    const isHome = f.team_h === playerTeamId;
    const opp = isHome ? f.team_a : f.team_h;
    const rawDiff = isHome ? f.team_h_difficulty : f.team_a_difficulty;
    const difficulty =
      rawDiff != null && Number.isFinite(Number(rawDiff))
        ? Math.min(5, Math.max(1, Math.round(Number(rawDiff))))
        : 3;
    const oppCode = teamCodeById.get(opp);
    const id = f.id ?? 0;
    out.push({
      id,
      code: id,
      team_h: f.team_h,
      team_a: f.team_a,
      event: f.event,
      finished: Boolean(f.finished),
      minutes: 0,
      provisional_start_time: false,
      kickoff_time: f.kickoff_time ?? null,
      event_name: null,
      is_home: isHome,
      difficulty,
      opponent_team: opp,
      opponentTeamName: getTeamName(opp, teamNameById),
      opponentTeamShortName: getTeamShortName(opp, teamShortNameById),
      opponentBadgeUrl: oppCode != null ? fplEndpoints.teamBadge(oppCode) : undefined,
    });
  }
  return sortUpcomingPlayerFixtures(out);
}

function sortHistory(history: PlayerDetailHistory[]): PlayerDetailHistory[] {
  return history.slice().sort((a, b) => {
    const byRound = a.round - b.round;
    if (byRound !== 0) {
      return byRound;
    }

    const kickoffA = a.kickoff_time ?? '';
    const kickoffB = b.kickoff_time ?? '';
    const byKickoff = kickoffA.localeCompare(kickoffB);
    if (byKickoff !== 0) {
      return byKickoff;
    }

    return a.fixture - b.fixture;
  });
}

export function usePlayerDetail(playerId: string): UsePlayerDetailState {
  const [state, setState] = useState<UsePlayerDetailState>(INITIAL_STATE);
  const parsedPlayerId = parsePlayerId(playerId);

  useEffect(() => {
    let active = true;

    if (parsedPlayerId === null) {
      return () => {
        active = false;
      };
    }

    const loadPlayerDetail = async () => {
      setState((previous) => ({
        ...previous,
        loading: true,
        error: null,
      }));

      try {
        const [bootstrap, summaryResponse] = await Promise.all([
          getBootstrap(),
          getElementSummary(parsedPlayerId),
        ]);

        if (!active) {
          return;
        }

        const element = bootstrap.elements.find((candidate) => candidate.id === parsedPlayerId);
        const bootstrapEvents = (bootstrap as { events?: Array<{ id: number; is_next?: boolean }> }).events;
        const nextGameweekId = bootstrapEvents?.find((e) => e.is_next)?.id ?? null;

        if (!element) {
          setState({
            loading: false,
            error: `Player ${parsedPlayerId} was not found in bootstrap data.`,
            element: null,
            summary: null,
            historySorted: [],
            nextGameweekId,
          });
          return;
        }

        const { teamNameById, teamShortNameById, teamCodeById } = buildTeamMaps(bootstrap.teams);

        const elementWithTeam: PlayerDetailElement = {
          ...element,
          teamName: getTeamName(element.team, teamNameById),
          teamShortName: getTeamShortName(element.team, teamShortNameById),
          teamCode: teamCodeById.get(element.team) ?? null,
        };

        const fixturesWithNames: PlayerDetailFixture[] = summaryResponse.fixtures.map((fixture) => {
          const opponentTeamId =
            fixture.opponent_team ?? opponentTeamIdFromFixture(fixture, element.team);
          const oppCode = teamCodeById.get(opponentTeamId);
          return {
            ...fixture,
            opponent_team: opponentTeamId,
            opponentTeamName: getTeamName(opponentTeamId, teamNameById),
            opponentTeamShortName: getTeamShortName(opponentTeamId, teamShortNameById),
            opponentBadgeUrl: oppCode != null ? fplEndpoints.teamBadge(oppCode) : undefined,
          };
        });

        const fixturesScheduled = fixturesWithNames.filter(
          (f) => !(f.event == null && f.kickoff_time == null),
        );

        let upcomingFixtures = sortUpcomingPlayerFixtures(fixturesScheduled);
        if (upcomingFixtures.length === 0) {
          try {
            const globalFixtures = await fetchJson<FplFixtureLite[]>(fplEndpoints.fixtures());
            upcomingFixtures = buildFixturesFromFplSchedule(
              globalFixtures,
              element.team,
              teamNameById,
              teamShortNameById,
              teamCodeById,
            );
          } catch {
            /* keep empty */
          }
        }

        const historyWithNames: PlayerDetailHistory[] = summaryResponse.history.map((historyItem) => ({
          ...historyItem,
          opponentTeamName: getTeamName(historyItem.opponent_team, teamNameById),
          opponentTeamShortName: getTeamShortName(historyItem.opponent_team, teamShortNameById),
        }));

        const historySorted = sortHistory(historyWithNames);
        const summary: PlayerDetailSummary = {
          ...summaryResponse,
          fixtures: upcomingFixtures,
          history: historyWithNames,
        };

        setState({
          loading: false,
          error: null,
          element: elementWithTeam,
          summary,
          historySorted,
          nextGameweekId,
        });
      } catch (error: unknown) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Failed to load player detail data.';

        setState({
          loading: false,
          error: message,
          element: null,
          summary: null,
          historySorted: [],
          nextGameweekId: null,
        });
      }
    };

    void loadPlayerDetail();

    return () => {
      active = false;
    };
  }, [parsedPlayerId]);

  if (parsedPlayerId === null) {
    return {
      ...INVALID_PLAYER_STATE,
      error: `Invalid player id "${playerId}". Expected a positive integer.`,
    };
  }

  return state;
}
