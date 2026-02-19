import type { InjurySuspension } from '../../data/commandCenterMocks';

interface Props {
  injuries: InjurySuspension[];
}

const InjuriesSuspensionsCard = ({ injuries }: Props) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Injuries & Suspensions
        </h2>
      </div>
      <div className="px-5 py-4 max-h-80 overflow-y-auto">
        <div className="space-y-3">
          {injuries.map((injury, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2 pb-3 border-b border-slate-800 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{injury.player}</p>
                  <p className="text-xs text-slate-400">{injury.team}</p>
                </div>
                <span
                  className={`shrink-0 px-2 py-1 text-[10px] font-bold rounded ${
                    injury.status === 'Injured'
                      ? 'bg-red-500/10 text-red-400 border border-red-600'
                      : injury.status === 'Suspended'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-600'
                      : 'bg-orange-500/10 text-orange-400 border border-orange-600'
                  }`}
                >
                  {injury.status}
                </span>
              </div>
              <p className="text-xs text-slate-300">{injury.details}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Return:</span>
                <span className="text-xs font-medium text-emerald-400">{injury.expectedReturn}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InjuriesSuspensionsCard;
