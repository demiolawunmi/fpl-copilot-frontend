import { useTeamId } from '../context/TeamIdContext';

const HomePage = () => {
  const { teamId } = useTeamId();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold text-white">Welcome to FPL Copilot</h1>
      <p className="text-slate-400">You are logged in with Team ID:</p>
      <span className="rounded-xl bg-emerald-500/10 px-6 py-3 text-2xl font-mono font-bold text-emerald-400 border border-emerald-500/20">
        {teamId}
      </span>
    </div>
  );
};

export default HomePage;

