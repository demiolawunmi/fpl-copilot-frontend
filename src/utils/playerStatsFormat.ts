import type { FplBootstrapElement } from "../api/fpl/fpl";

export type NumericLike = number | string | null | undefined;

export type TeamAbbreviationMap = Map<number, string> | Record<number, string>;

export type PlayerLeaderboardRow = {
  id: number;
  name: string;
  teamAbbr: string;
  metric: number;
  photoCode: number;
};

export function formatPriceFromNowCost(nowCost: NumericLike): string {
  const tenths = parseStatNumber(nowCost);
  return `\u00a3${(tenths / 10).toFixed(1)}m`;
}

export function formatOwnershipPercent(selectedByPercent: NumericLike): string {
  const ownership = parseStatNumber(selectedByPercent);
  return `${ownership.toFixed(1)}%`;
}

export function parseStatNumber(value: NumericLike): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace("%", "");
    if (!normalized) return 0;

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function parseExpectedMetrics(input: {
  xg?: NumericLike;
  xa?: NumericLike;
  xgi?: NumericLike;
}): { xg: number; xa: number; xgi: number } {
  return {
    xg: parseStatNumber(input.xg),
    xa: parseStatNumber(input.xa),
    xgi: parseStatNumber(input.xgi),
  };
}

export function statPer90(options: {
  explicitPer90?: NumericLike;
  stat?: NumericLike;
  minutes?: NumericLike;
}): number {
  if (options.explicitPer90 !== null && options.explicitPer90 !== undefined) {
    return parseStatNumber(options.explicitPer90);
  }

  const minutes = parseStatNumber(options.minutes);
  if (minutes <= 0) {
    return 0;
  }

  const stat = parseStatNumber(options.stat);
  return stat / (minutes / 90);
}

export function createTeamAbbreviationMap(
  teams: Array<{ id: number; short_name: string }>
): Map<number, string> {
  return new Map(teams.map((team) => [team.id, team.short_name]));
}

export function getTopPlayersByMetric(
  elements: FplBootstrapElement[],
  options: {
    metric: (element: FplBootstrapElement) => NumericLike;
    teamMap?: TeamAbbreviationMap;
    topN?: number;
  }
): PlayerLeaderboardRow[] {
  const topN = options.topN ?? 3;

  return elements
    .map((element) => ({
      id: element.id,
      name: element.web_name,
      teamAbbr: resolveTeamAbbreviation(element.team, options.teamMap),
      metric: parseStatNumber(options.metric(element)),
      photoCode: element.code,
    }))
    .sort((a, b) => {
      if (b.metric !== a.metric) {
        return b.metric - a.metric;
      }

      const nameCompare = a.name.localeCompare(b.name);
      if (nameCompare !== 0) {
        return nameCompare;
      }

      return a.id - b.id;
    })
    .slice(0, Math.max(0, topN));
}

function resolveTeamAbbreviation(teamId: number, teamMap?: TeamAbbreviationMap): string {
  if (!teamMap) return "-";

  if (teamMap instanceof Map) {
    return teamMap.get(teamId) ?? "-";
  }

  return teamMap[teamId] ?? "-";
}
