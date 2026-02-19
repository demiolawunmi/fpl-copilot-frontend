// GW Header component

import type { GWInfo } from '../../types/fpl';

interface GWHeaderProps {
  gwInfo: GWInfo;
}

export default function GWHeader({ gwInfo }: GWHeaderProps) {
  const deadline = new Date(gwInfo.deadline);
  const formattedDeadline = deadline.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Gameweek {gwInfo.gameweek}
          </h1>
          <p className="text-slate-400 text-sm">
            Deadline: {formattedDeadline}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
              gwInfo.isFinished
                ? 'bg-slate-700 text-slate-300'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {gwInfo.isFinished ? 'Finished' : 'In Progress'}
          </span>
        </div>
      </div>
    </div>
  );
}
