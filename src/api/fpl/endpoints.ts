const BASE = "/fpl-api";
const PL_RESOURCES = "https://resources.premierleague.com/premierleague/photos/players";

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
        `${PL_RESOURCES}/${size}/p${code}.png`,
};
