import type { GWInfo } from '../../data/gwOverviewMocks';

interface GWHeaderProps {
  info: GWInfo;
}

const GWHeader = ({ info }: GWHeaderProps) => {
  const deadlineDate = new Date(info.deadline);
  const isDeadlinePassed = info.isFinished || deadlineDate < new Date();

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Gameweek {info.gameweek}
          </h1>
          <p className="text-slate-400 mt-1">
            {info.isFinished ? (
              <span className="text-emerald-400 font-medium">Finished</span>
            ) : (
              <>
                Deadline: {deadlineDate.toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {isDeadlinePassed && (
                  <span className="ml-2 text-red-400 font-medium">(Passed)</span>
                )}
              </>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Status</p>
          <p className="text-lg font-semibold text-white">
            {info.isFinished ? (
              <span className="text-emerald-400">Complete</span>
            ) : isDeadlinePassed ? (
              <span className="text-yellow-400">In Progress</span>
            ) : (
              <span className="text-blue-400">Upcoming</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GWHeader;
