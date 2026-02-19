import { fetchJson } from "./client";
import { fplEndpoints } from "./endpoints";

// -------------------------
// Minimal FPL response types
// -------------------------

export type FplEntry = {
    name: string; // team name
    player_first_name: string;
    player_last_name: string;
};

export type FplBootstrap = {
    elements: Array<{
        id: number;          // season-specific FPL player id (use for element-summary)
        code: number;        // universal player code (use for photo URL)
        web_name: string;
        element_type: number; // 1 GK, 2 DEF, 3 MID, 4 FWD
        team: number;         // team id
    }>;
    teams: Array<{
        id: number;
        name: string;
        short_name: string;
    }>;
    element_types: Array<{
        id: number; // 1..4
        singular_name_short: "GKP" | "DEF" | "MID" | "FWD";
    }>;
};

export type FplPicks = {
    picks: Array<{
        element: number;       // player id (matches bootstrap.elements.id)
        position: number;      // 1..15 (bench included)
        multiplier: number;    // captain = 2, triple captain = 3
        is_captain: boolean;
        is_vice_captain: boolean;
    }>;
};

// -------------------------
// API calls
// -------------------------

export async function getEntry(teamId: string) {
    return fetchJson<FplEntry>(fplEndpoints.entry(teamId));
}

export async function getBootstrap() {
    return fetchJson<FplBootstrap>(fplEndpoints.bootstrap());
}

export async function getPicks(teamId: string, gw: number) {
    return fetchJson<FplPicks>(fplEndpoints.entryPicks(teamId, gw));
}

// -------------------------
// Helpers
// -------------------------

export function elementTypeToPosition(t: number): "GK" | "DEF" | "MID" | "FWD" {
    if (t === 1) return "GK";
    if (t === 2) return "DEF";
    if (t === 3) return "MID";
    return "FWD";
}

/**
 * Build a Premier League headshot URL.
 * IMPORTANT: uses `code` (Opta/player code), not `id`.
 */
export function getPlayerPhotoUrl(code: number | string, size: "110x140" | "250x250" | "60x60" = "110x140") {
    return fplEndpoints.playerPhoto(code, size);
}

// -------------------------
// Optional convenience: build squad for your UI
// -------------------------

export type UiPlayer = {
    id: number;
    code: number;
    name: string;
    position: "GK" | "DEF" | "MID" | "FWD";
    isCaptain?: boolean;
    isViceCaptain?: boolean;
    isBench?: boolean;
    multiplier?: number;
    photoUrl?: string; // add this if you want to show headshots now
};

/**
 * Join picks with bootstrap directory.
 * This does NOT compute points yet (Phase 1). It just builds a playable squad list.
 */
export function buildUiSquadFromPicks(
    picks: FplPicks,
    bootstrap: FplBootstrap
): UiPlayer[] {
    const byId = new Map(bootstrap.elements.map((e) => [e.id, e]));

    return picks.picks
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((p) => {
            const el = byId.get(p.element);

            const id = el?.id ?? p.element;
            const code = el?.code ?? 0;

            return {
                id,
                code,
                name: el?.web_name ?? `#${p.element}`,
                position: el ? elementTypeToPosition(el.element_type) : "MID",
                isCaptain: p.is_captain,
                isViceCaptain: p.is_vice_captain,
                isBench: p.position > 11,
                multiplier: p.multiplier,
                photoUrl: code ? getPlayerPhotoUrl(code, "110x140") : undefined,
            };
        });
}
