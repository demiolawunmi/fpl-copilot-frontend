import {
  type FplBootstrapElement,
  elementTypeToPosition,
} from "../api/fpl/fpl";
import {
  formatOwnershipPercent,
  formatPriceFromNowCost,
  parseExpectedMetrics,
  parseStatNumber,
  statPer90,
} from "./playerStatsFormat";
import { getOpponentDifficulty } from "./difficulty";

export type PlayerStatsFixturePill = {
  opponentAbbr: string;
  home: boolean;
  fdr: number;
};

export type PlayerStatsRowModel = {
  id: number;
  name: string;
  teamAbbr: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  price: string;
  ownership: string;
  minutes: number;
  points: number;
  goals: number;
  assists: number;
  xG: number;
  xA: number;
  xGI: number;
  goalsPer90: number;
  xgPer90: number;
  /** Expected points (FPL ep_next / ep_this; may be overridden by predictions in UI). */
  xPts: number;
  nextFixtures: PlayerStatsFixturePill[];
};

export type TeamLite = {
  id: number;
  short_name: string;
};

export type FplFixtureLite = {
  id?: number;
  event: number | null;
  finished?: boolean;
  kickoff_time?: string | null;
  team_h: number;
  team_a: number;
  team_h_difficulty?: number | null;
  team_a_difficulty?: number | null;
};

export function mapBootstrapElementsToPlayerStatsRows(input: {
  elements: FplBootstrapElement[];
  teams: TeamLite[];
  fixtures: FplFixtureLite[];
  nextFixturesLimit?: number;
}): PlayerStatsRowModel[] {
  const teamAbbrById = new Map(input.teams.map((team) => [team.id, team.short_name]));
  const nextFixturesByTeam = buildNextFixturesByTeam({
    fixtures: input.fixtures,
    teamAbbrById,
    nextFixturesLimit: input.nextFixturesLimit ?? 5,
  });

  return input.elements.map((element) => {
    const expected = parseExpectedMetrics({
      xg: element.expected_goals,
      xa: element.expected_assists,
      xgi: element.expected_goal_involvements,
    });

    return {
      id: element.id,
      name: element.web_name,
      teamAbbr: teamAbbrById.get(element.team) ?? "-",
      position: elementTypeToPosition(element.element_type),
      price: formatPriceFromNowCost(element.now_cost),
      ownership: formatOwnershipPercent(element.selected_by_percent),
      minutes: parseStatNumber(element.minutes),
      points: parseStatNumber(element.total_points),
      goals: parseStatNumber(element.goals_scored),
      assists: parseStatNumber(element.assists),
      xG: expected.xg,
      xA: expected.xa,
      xGI: expected.xgi,
      goalsPer90: statPer90({
        explicitPer90: element.goals_scored_per_90,
        stat: element.goals_scored,
        minutes: element.minutes,
      }),
      xgPer90: statPer90({
        explicitPer90: element.expected_goals_per_90,
        stat: element.expected_goals,
        minutes: element.minutes,
      }),
      xPts: parseStatNumber(element.ep_next ?? element.ep_this),
      nextFixtures: nextFixturesByTeam.get(element.team) ?? [],
    };
  });
}

export function buildNextFixturesByTeam(input: {
  fixtures: FplFixtureLite[];
  teamAbbrById: Map<number, string>;
  nextFixturesLimit: number;
}): Map<number, PlayerStatsFixturePill[]> {
  const schedule = new Map<number, PlayerStatsFixturePill[]>();
  const upcomingFixtures = getUpcomingFixtures(input.fixtures);

  for (const fixture of upcomingFixtures) {
    const homeTeamAbbr = input.teamAbbrById.get(fixture.team_h) ?? "-";
    const awayTeamAbbr = input.teamAbbrById.get(fixture.team_a) ?? "-";

    appendFixture(schedule, fixture.team_h, {
      opponentAbbr: awayTeamAbbr,
      home: true,
      fdr: resolveFdr(awayTeamAbbr, fixture.team_h_difficulty),
    }, input.nextFixturesLimit);

    appendFixture(schedule, fixture.team_a, {
      opponentAbbr: homeTeamAbbr,
      home: false,
      fdr: resolveFdr(homeTeamAbbr, fixture.team_a_difficulty),
    }, input.nextFixturesLimit);
  }

  return schedule;
}

function getUpcomingFixtures(fixtures: FplFixtureLite[]): FplFixtureLite[] {
  return fixtures
    .filter((fixture) => fixture.finished !== true)
    .slice()
    .sort((a, b) => {
      const eventA = a.event ?? Number.MAX_SAFE_INTEGER;
      const eventB = b.event ?? Number.MAX_SAFE_INTEGER;
      if (eventA !== eventB) {
        return eventA - eventB;
      }

      const kickoffA = parseKickoffTime(a.kickoff_time);
      const kickoffB = parseKickoffTime(b.kickoff_time);
      if (kickoffA !== kickoffB) {
        return kickoffA - kickoffB;
      }

      return (a.id ?? Number.MAX_SAFE_INTEGER) - (b.id ?? Number.MAX_SAFE_INTEGER);
    });
}

function parseKickoffTime(kickoffTime: string | null | undefined): number {
  if (!kickoffTime) {
    return Number.MAX_SAFE_INTEGER;
  }

  const parsed = Date.parse(kickoffTime);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

function appendFixture(
  target: Map<number, PlayerStatsFixturePill[]>,
  teamId: number,
  fixture: PlayerStatsFixturePill,
  limit: number
) {
  const current = target.get(teamId) ?? [];
  if (current.length >= limit) {
    return;
  }
  current.push(fixture);
  target.set(teamId, current);
}

function resolveFdr(opponentAbbr: string, explicitDifficulty?: number | null): number {
  const value = getOpponentDifficulty(
    opponentAbbr,
    explicitDifficulty === null ? undefined : explicitDifficulty
  );
  return Math.min(5, Math.max(1, Math.round(value)));
}
