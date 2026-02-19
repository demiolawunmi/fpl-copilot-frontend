import type { FixtureItem } from '../../data/commandCenterMocks';

interface Props {
  fixtures: FixtureItem[];
}

const FixturesSnapshot = ({ fixtures }: Props) => {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 1) return 'bg-emerald-500/10 text-emerald-400 border-emerald-600';
    if (difficulty === 2) return 'bg-green-500/10 text-green-400 border-green-600';
    if (difficulty === 3) return 'bg-slate-500/10 text-slate-300 border-slate-600';
    if (difficulty === 4) return 'bg-orange-500/10 text-orange-400 border-orange-600';
    return 'bg-red-500/10 text-red-400 border-red-600';
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Fixtures Snapshot</h2>
        <p className="text-xs text-slate-400 mt-1">Upcoming fixtures for your squad</p>
      </div>
      <div className="px-5 py-4 max-h-80 overflow-y-auto">
        <div className="space-y-2">
          {fixtures.map((fixture, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className={`px-2 py-1 text-[10px] font-bold rounded border ${getDifficultyColor(fixture.difficulty)}`}>
                  {fixture.difficulty}
                </span>
                <span className="text-xs text-slate-400">GW{fixture.gameweek}</span>
                <span className="text-sm font-medium text-white truncate">
                  {fixture.home ? 'vs' : '@'} {fixture.opponentAbbr}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FixturesSnapshot;
