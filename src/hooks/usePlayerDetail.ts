import { useEffect, useState } from 'react';
import {
  getBootstrap,
  getElementSummary,
  type ElementSummaryFixture,
  type ElementSummaryHistory,
  type ElementSummaryResponse,
  type FplBootstrapElement,
} from '../api/fpl/fpl';

type TeamNameById = Map<number, string>;
type TeamShortNameById = Map<number, string>;

export type PlayerDetailElement = FplBootstrapElement & {
  teamName: string;
  teamShortName: string;
};

export type PlayerDetailFixture = ElementSummaryFixture & {
  opponentTeamName: string;
  opponentTeamShortName: string;
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
};

const INITIAL_STATE: UsePlayerDetailState = {
  loading: true,
  error: null,
  element: null,
  summary: null,
  historySorted: [],
};

const INVALID_PLAYER_STATE: UsePlayerDetailState = {
  loading: false,
  error: 'Invalid player id. Expected a positive integer.',
  element: null,
  summary: null,
  historySorted: [],
};

function parsePlayerId(playerId: string): number | null {
  const parsedId = Number(playerId);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }
  return parsedId;
}

function buildTeamMaps(teams: Array<{ id: number; name: string; short_name: string }>): {
  teamNameById: TeamNameById;
  teamShortNameById: TeamShortNameById;
} {
  return {
    teamNameById: new Map(teams.map((team) => [team.id, team.name])),
    teamShortNameById: new Map(teams.map((team) => [team.id, team.short_name])),
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
        if (!element) {
          setState({
            loading: false,
            error: `Player ${parsedPlayerId} was not found in bootstrap data.`,
            element: null,
            summary: null,
            historySorted: [],
          });
          return;
        }

        const { teamNameById, teamShortNameById } = buildTeamMaps(bootstrap.teams);

        const elementWithTeam: PlayerDetailElement = {
          ...element,
          teamName: getTeamName(element.team, teamNameById),
          teamShortName: getTeamShortName(element.team, teamShortNameById),
        };

        const fixturesWithNames: PlayerDetailFixture[] = summaryResponse.fixtures.map((fixture) => ({
          ...fixture,
          opponentTeamName: getTeamName(fixture.opponent_team, teamNameById),
          opponentTeamShortName: getTeamShortName(fixture.opponent_team, teamShortNameById),
        }));

        const historyWithNames: PlayerDetailHistory[] = summaryResponse.history.map((historyItem) => ({
          ...historyItem,
          opponentTeamName: getTeamName(historyItem.opponent_team, teamNameById),
          opponentTeamShortName: getTeamShortName(historyItem.opponent_team, teamShortNameById),
        }));

        const historySorted = sortHistory(historyWithNames);
        const summary: PlayerDetailSummary = {
          ...summaryResponse,
          fixtures: fixturesWithNames,
          history: historyWithNames,
        };

        setState({
          loading: false,
          error: null,
          element: elementWithTeam,
          summary,
          historySorted,
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
