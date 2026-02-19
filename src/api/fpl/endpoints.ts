const FPL_BASE = "https://fantasy.premierleague.com/api";
const PL_BADGES = "https://resources.premierleague.com/premierleague/badges";

export const fplEndpoints = {
  // Core FPL endpoints
  bootstrapStatic: () => `${FPL_BASE}/bootstrap-static/`,
  
  // Team/Entry endpoints
  entry: (teamId: number | string) => `${FPL_BASE}/entry/${teamId}/`,
  entryHistory: (teamId: number | string) => `${FPL_BASE}/entry/${teamId}/history/`,
  entryPicks: (teamId: number | string, gameweek: number) => 
    `${FPL_BASE}/entry/${teamId}/event/${gameweek}/picks/`,
  
  // Live gameweek data
  liveGameweek: (gameweek: number) => `${FPL_BASE}/event/${gameweek}/live/`,
  
  // Fixtures
  fixtures: () => `${FPL_BASE}/fixtures/`,
  
  // Team badges (use team.code from bootstrap-static)
  teamBadge: (teamCode: number | string, size: "t40" | "t80" | "t110" = "t80") =>
    `${PL_BADGES}/${size}/t${teamCode}.png`,
};
