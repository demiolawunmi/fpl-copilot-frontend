import { useTeamId } from '../context/TeamIdContext';
import { useFplData } from '../hooks/useFplData';

const HomePage = () => {
  const { teamId } = useTeamId();
  const fpl = useFplData(teamId);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold text-white">Welcome to FPL Copilot</h1>

      {fpl.loading && (
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
          <p className="text-sm text-slate-400">Loading team info…</p>
        </div>
      )}

      {!fpl.loading && fpl.gwInfo && (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-900 border border-slate-800 px-10 py-8">
          <p className="text-lg font-semibold text-white">{fpl.gwInfo.teamName}</p>
          <p className="text-sm text-slate-400">{fpl.gwInfo.manager}</p>
          <span className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-mono font-bold text-emerald-400 border border-emerald-500/20">
            Team ID: {fpl.gwInfo.teamId}
          </span>
          <p className="text-xs text-slate-500 mt-2">
            Current Gameweek: {fpl.gwInfo.gameweek}
          </p>
        </div>
      )}

      {!fpl.loading && fpl.error && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-slate-400">Team ID:</p>
          <span className="rounded-xl bg-emerald-500/10 px-6 py-3 text-2xl font-mono font-bold text-emerald-400 border border-emerald-500/20">
            {teamId}
          </span>
          <p className="text-xs text-yellow-400 mt-2">
            ⚠ Couldn't reach FPL API — {fpl.error}
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
