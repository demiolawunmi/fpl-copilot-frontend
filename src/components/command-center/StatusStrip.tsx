import type { TeamStatus } from '../../data/commandCenterMocks';

interface StatusStripConfig {
  // Tooltip vertical offset in pixels (how far above the bar the tooltip appears)
  tooltipOffsetPx?: number;
  // Wildcard season split cutoff in ISO format. Default points to Dec 30 13:00 (year can be changed by config)
  wildcardCutoffIso?: string;
  // If true, show the special note about first/second wildcard timing in the tooltip
  showWildcardSeasonSplit?: boolean;
}

interface Props {
  status: TeamStatus;
  config?: StatusStripConfig;
}

const StatusStrip = ({ status, config }: Props) => {
  const chipNames = {
    wildcard: 'WC',
    freehit: 'FH',
    bboost: 'BB',
    tcaptain: 'TC',
  };

  const chipFull = {
    wildcard: 'Wildcard',
    freehit: 'Free Hit',
    bboost: 'Bench Boost',
    tcaptain: 'Triple Captain',
  } as const;

  const chipDesc: Record<string, string> = {
    wildcard: 'Replace your entire squad for this GW. Useful for fixture swings or large changes.',
    freehit: 'Temporarily replace your squad for one GW; your original squad returns after the GW.',
    bboost: 'Score points from your entire bench for a single GW (useful in double gameweeks).',
    tcaptain: 'Triple Captain: captain scores triple points for one GW (use on a premium double-gameweek).',
  };

  // Default configuration
  const defaultConfig: Required<StatusStripConfig> = {
    tooltipOffsetPx: 130, // how far above the bar the tooltip sits (px)
    wildcardCutoffIso: '2025-12-30T13:00:00', // default cutoff (changeable via config)
    showWildcardSeasonSplit: true,
  };

  const cfg = { ...defaultConfig, ...(config ?? {}) };

  const deadline = new Date(status.deadline);
  const now = new Date();
  const hoursRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)));
  const daysRemaining = Math.floor(hoursRemaining / 24);
  const deadlinePassed = deadline < now;

  // Wildcard cutoff handling — parse the configured cutoff
  let wildcardCutoffDate: Date | null = null;
  try {
    wildcardCutoffDate = cfg.wildcardCutoffIso ? new Date(cfg.wildcardCutoffIso) : null;
    if (wildcardCutoffDate && isNaN(wildcardCutoffDate.getTime())) wildcardCutoffDate = null;
  } catch {
    wildcardCutoffDate = null;
  }

  const isAfterWildcardCutoff = wildcardCutoffDate ? now >= wildcardCutoffDate : false;
  const wildcardCutoffLabel = wildcardCutoffDate
    ? wildcardCutoffDate.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : cfg.wildcardCutoffIso;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 px-5 py-4">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Free Transfers */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Free Transfers</span>
          <span className="text-base font-bold text-white">{status.freeTransfers}</span>
        </div>

        {/* Bank */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Bank</span>
          <span className="text-base font-bold text-emerald-400">£{status.bank.toFixed(1)}m</span>
        </div>

        {/* Team Value */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Team Value</span>
          <span className="text-base font-bold text-white">£{status.teamValue.toFixed(1)}m</span>
        </div>

        {/* Chips */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Chips</span>
          <div className="flex gap-1.5">
            {(Object.keys(chipNames) as Array<keyof typeof chipNames>).map((chipKey) => {
              const chip = status.chips[chipKey];
              const usedText = chip.used ? `Used in ${chip.used}` : chip.available ? 'Available' : 'Not available';

              // Extra wildcard note when requested
              const wildcardNote = cfg.showWildcardSeasonSplit && chipKey === 'wildcard'
                ? isAfterWildcardCutoff
                  ? `After ${wildcardCutoffLabel}: first Wildcard is lost; second Wildcard is available.`
                  : `Second Wildcard becomes available after ${wildcardCutoffLabel}.`
                : null;

              return (
                <div
                  key={chipKey}
                  className="relative group"
                  tabIndex={0}
                  aria-describedby={`chip-${chipKey}`}
                  title={usedText}
                >
                  <span
                    className={`px-2 py-1 text-[10px] font-bold rounded border select-none ${
                      chip.available
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-700 bg-slate-800/40 text-slate-500'
                    }`}
                    role="img"
                    aria-hidden="true"
                  >
                    {chipNames[chipKey]}
                  </span>

                  {/* Tooltip box shown on hover/focus of the wrapper; offset is configurable */}
                  <div
                    id={`chip-${chipKey}`}
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-150 z-50"
                    style={{ top: `-${cfg.tooltipOffsetPx}px`, transformOrigin: 'center bottom' }}
                  >
                    <div className="bg-slate-800/95 text-sm text-slate-200 rounded-md p-3 shadow-lg border border-slate-700 w-56">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold">{chipFull[chipKey]}</div>
                        <div className={`text-xs font-medium ${chip.available ? 'text-emerald-400' : 'text-slate-400'}`}>{chip.available ? 'Available' : 'Used'}</div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2 leading-tight">
                        {chipDesc[chipKey]}
                      </div>
                      <div className="mt-2 text-[11px] text-slate-400">
                        {chip.used ? `Used: ${chip.used}` : chip.available ? 'Can be used this GW' : 'Not available'}
                      </div>
                      {wildcardNote && (
                        <div className="mt-2 text-[11px] text-slate-300 font-medium">
                          {wildcardNote}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deadline Countdown */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Deadline</span>
          <span className={`text-base font-bold ${deadlinePassed ? 'text-red-400' : 'text-yellow-400'}`}>
            {deadlinePassed
              ? 'Passed'
              : daysRemaining > 0
              ? `${daysRemaining}d ${hoursRemaining % 24}h`
              : `${hoursRemaining}h`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusStrip;
