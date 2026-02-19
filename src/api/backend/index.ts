export { backendFetch } from "./client";
export { getMyTeam } from "./myTeam";
export type {
  MyTeamResponse,
  MyTeamPick,
  MyTeamChip,
  MyTeamTransfers,
} from "./myTeam";

// AIrsenal endpoints
export { getFormLast4, getPredictions, getFixturesByPlayer } from "./airsenal";
export type {
  FormLast4Player,
  FormLast4Response,
  PredictionPlayer,
  PredictionsResponse,
  PlayerFixture,
  FixturesByPlayerResponse,
} from "./airsenal";

// Bandwagons endpoint
export { getBandwagons } from "./bandwagons";
export type { BandwagonPlayer, BandwagonsResponse } from "./bandwagons";

