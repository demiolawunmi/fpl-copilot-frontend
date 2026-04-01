/**
 * FPL JSON API base path.
 * - Dev: `/fpl-api` is proxied by Vite → `https://fantasy.premierleague.com/api` (avoids CORS during local dev).
 * - Prod / preview: use the real origin so `/fpl-api/...` is not requested from your static host (which 404s).
 * Override with `VITE_FPL_API_BASE` if you front the API with your own proxy.
 */
const FPL_API_BASE = (() => {
  const env = import.meta.env.VITE_FPL_API_BASE as string | undefined;
  if (env != null && env.trim() !== "") {
    return env.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "/fpl-api";
  }
  return "https://fantasy.premierleague.com/api";
})();

const BASE = FPL_API_BASE;
const PL_RESOURCES = "https://resources.premierleague.com/premierleague25/photos/players";
const PL_BADGES = "https://resources.premierleague.com/premierleague25/badges";

export const fplEndpoints = {
    // Core API
    bootstrap: () => `${BASE}/bootstrap-static/`,
    entry: (teamId: string | number) => `${BASE}/entry/${teamId}/`,
    entryHistory: (teamId: string | number) => `${BASE}/entry/${teamId}/history/`,
    entryPicks: (teamId: string | number, gw: number) => `${BASE}/entry/${teamId}/event/${gw}/picks/`,
    fixtures: (gw?: number) => (gw ? `${BASE}/fixtures/?event=${gw}` : `${BASE}/fixtures/`),
    elementSummary: (playerId: string | number) => `${BASE}/element-summary/${playerId}/`,
    liveEvent: (gw: number) => `${BASE}/event/${gw}/live/`,

    // Player photos (use `code`, NOT `id`)
    playerPhoto: (code: number | string, size: "110x140" | "250x250" | "60x60" = "110x140") =>
        `${PL_RESOURCES}/${size}/${code}.png`,

    // Team badges (use team `code`, NOT `id`) — include size segment to use the `size` param
    teamBadge: (teamCode: number | string, size: "t40" | "t80" | "t110" = "t80") =>
        `${PL_BADGES}/${size}/${teamCode}.svg`,
};
