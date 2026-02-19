import type { EnhancedPlayer } from '../../data/commandCenterMocks';

interface Props {
  realSquad: EnhancedPlayer[];
  sandboxSquad: EnhancedPlayer[];
}

const DeltaStrip = ({ realSquad, sandboxSquad }: Props) => {
  const realXPts = realSquad.filter((p) => !p.isBench).reduce((sum, p) => sum + p.xPts, 0);
  const sandboxXPts = sandboxSquad.filter((p) => !p.isBench).reduce((sum, p) => sum + p.xPts, 0);
  const xPtsDelta = sandboxXPts - realXPts;

  // Mock next 3-5 GWs (just double for demo)
  const realNext5 = realXPts * 5;
  const sandboxNext5 = sandboxXPts * 5;
  const next5Delta = sandboxNext5 - realNext5;

  // Mock bank/value changes
  const bankDelta: number = 0; // Would be computed from transfers

  const hasChanges = Math.abs(xPtsDelta) > 0.01 || Math.abs(next5Delta) > 0.01;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 px-5 py-4">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide">GW xPts</span>
          <span className="text-sm text-slate-400">{realXPts.toFixed(1)}</span>
          <span className="text-slate-600">→</span>
          <span className="text-sm font-bold text-white">{sandboxXPts.toFixed(1)}</span>
          {hasChanges && (
            <span
              className={`text-xs font-bold ${
                xPtsDelta > 0 ? 'text-emerald-400' : xPtsDelta < 0 ? 'text-red-400' : 'text-slate-400'
              }`}
            >
              {xPtsDelta > 0 ? '+' : ''}
              {xPtsDelta.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Next 5 GWs</span>
          <span className="text-sm text-slate-400">{realNext5.toFixed(1)}</span>
          <span className="text-slate-600">→</span>
          <span className="text-sm font-bold text-white">{sandboxNext5.toFixed(1)}</span>
          {hasChanges && (
            <span
              className={`text-xs font-bold ${
                next5Delta > 0 ? 'text-emerald-400' : next5Delta < 0 ? 'text-red-400' : 'text-slate-400'
              }`}
            >
              {next5Delta > 0 ? '+' : ''}
              {next5Delta.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Bank</span>
          <span className="text-sm font-bold text-emerald-400">
            £0.5m
            {bankDelta !== 0 && (
              <span className="text-xs ml-1">
                ({bankDelta > 0 ? '+' : ''}
                {bankDelta.toFixed(1)}m)
              </span>
            )}
          </span>
        </div>

        {!hasChanges && (
          <span className="ml-auto text-xs text-slate-500 italic">No changes yet</span>
        )}
      </div>
    </div>
  );
};

export default DeltaStrip;
