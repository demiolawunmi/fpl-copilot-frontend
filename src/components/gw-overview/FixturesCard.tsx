import { FiChevronRight } from 'react-icons/fi';
import type { Fixture } from '../../data/gwOverviewMocks';

interface Props {
  fixtures: Fixture[];
}

/* ── team badge (colored circle + abbreviation) ── */
const Badge = ({ abbr, color }: { abbr: string; color: string }) => (
  <div
    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
    style={{ backgroundColor: color }}
  >
    {abbr}
  </div>
);

const FixturesCard = ({ fixtures }: Props) => {
  // group by date
  const grouped = fixtures.reduce<Record<string, Fixture[]>>((acc, f) => {
    (acc[f.date] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <h2 className="px-5 py-4 text-sm font-semibold text-white uppercase tracking-wide border-b border-slate-800">
        Fixtures
      </h2>

      {Object.entries(grouped).map(([date, matches]) => (
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
              <Badge abbr={m.homeAbbr} color={m.homeColor} />
              <span className="w-20 truncate text-sm text-slate-300 text-right">{m.homeTeam}</span>

              {/* score */}
              <div className="mx-2 rounded-lg bg-slate-800 px-3 py-1 text-center min-w-[56px]">
                <span className="text-sm font-bold text-white">
                  {m.homeScore} – {m.awayScore}
                </span>
              </div>

              {/* away */}
              <span className="w-20 truncate text-sm text-slate-300">{m.awayTeam}</span>
              <Badge abbr={m.awayAbbr} color={m.awayColor} />

              {/* chevron */}
              <FiChevronRight className="ml-auto text-slate-600" size={16} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FixturesCard;

