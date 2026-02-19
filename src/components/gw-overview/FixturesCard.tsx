import { useMemo, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import type { Fixture } from "../../data/gwOverviewMocks";

interface Props {
  fixtures: Fixture[];
  isCurrentGw?: boolean; // true => newest→oldest by default
  heightPx?: number; // computed height to match pitch card bottom
}

type Order = "newest" | "oldest";

/* ── team badge (real image or fallback colored circle) ── */
const Badge = ({ abbr, color, badge }: { abbr: string; color: string; badge?: string }) =>
  badge ? (
    <img
      src={badge}
      alt={abbr}
      className="h-8 w-8 shrink-0 object-contain"
      loading="lazy"
    />
  ) : (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {abbr}
    </div>
  );

function toTime(f: Fixture) {
  // Prefer dateISO if you add it; fallback to Date.parse(date) if not.
  // (But Date.parse("Sat 15 Feb") is not reliable across browsers — add dateISO!)
  return f.dateISO ? Date.parse(f.dateISO) : Date.parse(f.date);
}

export default function FixturesCard({ fixtures, isCurrentGw = true, heightPx }: Props) {
  // Default behavior:
  // - current GW: newest → oldest
  // - old GW: oldest → newest
  const defaultOrder: Order = isCurrentGw ? "newest" : "oldest";
  const [order, setOrder] = useState<Order>(defaultOrder);

  // If isCurrentGw changes (user switches GW), reset to the new default
  // (Optional) If you DON'T want it to reset, remove this memo/logic.
  useMemo(() => {
    setOrder(defaultOrder);
  }, [defaultOrder]);

  const { groupKeys, grouped } = useMemo(() => {
    // group by display date
    const grouped = fixtures.reduce<Record<string, Fixture[]>>((acc, f) => {
      (acc[f.date] ??= []).push(f);
      return acc;
    }, {});

    // compute a representative timestamp per date group (min or max)
    const keyToTime = new Map<string, number>();
    for (const [date, arr] of Object.entries(grouped)) {
      const times = arr.map(toTime).filter((t) => Number.isFinite(t));
      // pick earliest time in group as group anchor
      keyToTime.set(date, times.length ? Math.min(...times) : 0);
    }

    const groupKeys = Object.keys(grouped).sort((a, b) => {
      const ta = keyToTime.get(a) ?? 0;
      const tb = keyToTime.get(b) ?? 0;
      return order === "newest" ? tb - ta : ta - tb;
    });

    // Also sort matches inside each date by kickoff time
    for (const k of Object.keys(grouped)) {
      grouped[k].sort((a, b) => {
        const ta = toTime(a);
        const tb = toTime(b);
        return order === "newest" ? tb - ta : ta - tb;
      });
    }

    return { groupKeys, grouped };
  }, [fixtures, order]);

  return (
    // Match pitch bottom: fixed card height and column layout. Header is sticky; body scrolls.
    <div
      className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden h-[520px] flex flex-col"
      style={heightPx ? { height: `${heightPx}px` } : undefined}
    >
      {/* Header row with toggle on same line (locked) */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-10 bg-slate-900">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Fixtures</h2>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Order</span>
          <button
            type="button"
            onClick={() => setOrder((o) => (o === "newest" ? "oldest" : "newest"))}
            className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            title="Toggle fixture order"
          >
            {order === "newest" ? "Newest → Oldest" : "Oldest → Newest"}
          </button>
        </div>
      </div>

      {/* Scrollable body: groups + matches */}
      <div className="flex-1 overflow-auto">
        {groupKeys.map((date) => {
          const matches = grouped[date];
          return (
            <div key={date}>
              {/* date header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-2">
                <span className="text-xs font-semibold text-slate-400">{date}</span>
              </div>

              {matches.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 border-b border-slate-800/60 last:border-b-0 hover:bg-slate-800/40 transition"
                >
                  {/* home */}
                  <Badge abbr={m.homeAbbr} color={m.homeColor} badge={m.homeBadge} />
                  <span className="w-20 truncate text-sm text-slate-300 text-right">{m.homeTeam}</span>

                  {/* score */}
                  <div className="mx-2 rounded-lg bg-slate-800 px-3 py-1 text-center min-w-[56px]">
                    <span className="text-sm font-bold text-white">{m.homeScore} – {m.awayScore}</span>
                  </div>

                  {/* away */}
                  <span className="w-20 truncate text-sm text-slate-300">{m.awayTeam}</span>
                  <Badge abbr={m.awayAbbr} color={m.awayColor} badge={m.awayBadge} />

                  {/* chevron */}
                  <FiChevronRight className="ml-auto text-slate-600" size={16} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
