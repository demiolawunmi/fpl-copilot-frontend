interface Props {
  onAutoCaptain: () => void;
  onAutoBench: () => void;
  onRollTransfer: () => void;
}

const QuickActions = ({ onAutoCaptain, onAutoBench, onRollTransfer }: Props) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Quick Actions</h2>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <button
          onClick={onAutoCaptain}
          className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 hover:text-white transition text-sm font-medium text-left cursor-pointer"
        >
          ⚡ Auto-pick Captain (Highest xPts)
        </button>
        <button
          onClick={onAutoBench}
          className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 hover:text-white transition text-sm font-medium text-left cursor-pointer"
        >
          🔄 Auto-pick Bench Order
        </button>
        <button
          onClick={onRollTransfer}
          className="w-full px-4 py-3 rounded-lg border border-emerald-700 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition text-sm font-medium text-left cursor-pointer"
        >
          💡 Explore Transfers (Go to Sandbox)
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
