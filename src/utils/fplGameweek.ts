/**
 * Resolve which bootstrap "event" drives picks, fixtures (?event=gw), and live data.
 *
 * FPL does not always set `is_current` immediately when the round moves forward.
 * If we only fall back to "last finished" GW, we stay one week behind (e.g. stuck on
 * GW30 while GW31 fixtures already exist at /fixtures/?event=31).
 */

export type FplBootstrapEventLike = {
  id: number;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
};

function lastFinishedEvent<T extends FplBootstrapEventLike>(events: T[]): T | undefined {
  const finished = events.filter((e) => e.finished);
  if (!finished.length) return undefined;
  return finished.reduce((a, b) => (a.id >= b.id ? a : b));
}

/**
 * Prefer the live round, then the upcoming deadline week, then the most recently finished round.
 *
 * If FPL still has `is_current` on a gameweek that is already `finished` while `is_next`
 * points at a later GW (e.g. stuck on GW30 with GW31 fixtures live), prefer `is_next`
 * so `/fixtures/?event=` matches the round that actually has upcoming fixtures.
 */
export function resolvePrimaryGameweekEvent<T extends FplBootstrapEventLike>(
  events: T[],
): T | undefined {
  const byCurrent = events.find((e) => e.is_current);
  const byNext = events.find((e) => e.is_next);
  const byLastFinished = lastFinishedEvent(events);

  if (byCurrent?.finished && byNext && byNext.id > byCurrent.id) {
    return byNext;
  }

  return byCurrent ?? byNext ?? byLastFinished;
}
