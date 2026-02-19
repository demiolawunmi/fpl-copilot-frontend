import type { EnhancedPlayer } from '../../data/commandCenterMocks';

interface Props {
  squad: EnhancedPlayer[];
}

const SandboxCharts = ({ squad }: Props) => {
  // Mock chart data
  const starters = squad.filter((p) => !p.isBench);
  const byPosition = {
    DEF: starters.filter((p) => p.position === 'DEF').reduce((sum, p) => sum + p.xPts, 0),
    MID: starters.filter((p) => p.position === 'MID').reduce((sum, p) => sum + p.xPts, 0),
    FWD: starters.filter((p) => p.position === 'FWD').reduce((sum, p) => sum + p.xPts, 0),
  };

  const totalXPts = Object.values(byPosition).reduce((sum, val) => sum + val, 0);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Charts & Analytics
        </h2>
      </div>
      <div className="px-5 py-4 space-y-4">
        {/* xPts by Position */}
        <div>
          <h3 className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Team xPts by Position</h3>
          <div className="space-y-2">
            {(Object.entries(byPosition) as [string, number][]).map(([pos, xPts]) => {
              const pct = totalXPts > 0 ? (xPts / totalXPts) * 100 : 0;
              return (
                <div key={pos} className="flex items-center gap-3">
                  <span className="text-xs text-slate-300 w-8">{pos}</span>
                  <div className="flex-1 h-6 bg-slate-800 rounded overflow-hidden relative">
                    <div
                      className="h-full bg-emerald-500/30 border-r-2 border-emerald-400"
                      style={{ width: `${pct}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                      {xPts.toFixed(1)} xPts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Placeholder for more charts */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center italic">
            More charts coming soon: xPts trends, fixture difficulty, transfer impact
          </p>
        </div>
      </div>
    </div>
  );
};

export default SandboxCharts;
