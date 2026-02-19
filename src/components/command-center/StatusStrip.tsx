import type { TeamStatus } from '../../data/commandCenterMocks';

interface Props {
  status: TeamStatus;
}

const StatusStrip = ({ status }: Props) => {
  const chipNames = {
    wildcard: 'WC',
    freehit: 'FH',
    bboost: 'BB',
    tcaptain: 'TC',
  };

  const deadline = new Date(status.deadline);
  const now = new Date();
  const hoursRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)));
  const daysRemaining = Math.floor(hoursRemaining / 24);
  const deadlinePassed = deadline < now;

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
              return (
                <span
                  key={chipKey}
                  className={`px-2 py-1 text-[10px] font-bold rounded border ${
                    chip.available
                      ? 'border-emerald-600 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-700 bg-slate-800/40 text-slate-500'
                  }`}
                  title={chip.used ? `Used in ${chip.used}` : chip.available ? 'Available' : 'Not available'}
                >
                  {chipNames[chipKey]}
                </span>
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
