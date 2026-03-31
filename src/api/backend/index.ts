export { backendFetch } from "./client";
export { getMyTeam } from "./myTeam";
export type {
  MyTeamResponse,
  MyTeamPick,
  MyTeamChip,
  MyTeamTransfers,
} from "./myTeam";

// AIrsenal endpoints
export {
  getFormLast4,
  getPredictions,
  getFixturesByPlayer,
  runAirsenal,
} from "./airsenal";
export type {
  FormLast4Player,
  FormLast4Response,
  PredictionPlayer,
  PredictionsResponse,
  PlayerFixture,
  FixturesByPlayerResponse,
  AirsenalRunAction,
  AirsenalRunRequest,
  AirsenalRunResponse,
} from "./airsenal";

// Bandwagons endpoint
export { getBandwagons } from "./bandwagons";
export type { BandwagonPlayer, BandwagonsResponse } from "./bandwagons";

// Injury News endpoint
export { getInjuryNews } from "./injuryNews";
export type { InjuryNewsPlayer, InjuryNewsResponse } from "./injuryNews";

// FDR + ClubElo (copilot backend)
export { getFdrEloSnapshot, getTeamFdrFixtures } from "./fdr";
export type {
  FdrEloSnapshot,
  FdrEloRatingRow,
  TeamFdrFixtureItem,
  FdrFixtureSaturated,
  FdrFixtureMetrics,
} from "./fdr";

