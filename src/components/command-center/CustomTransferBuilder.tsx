interface Props {
  onTransfer: (playerInId: number, playerOutId: number) => void;
}

const CustomTransferBuilder = (_props: Props) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Custom Transfer Builder
        </h2>
      </div>
      <div className="px-5 py-4">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2">Player Out</label>
            <input
              type="text"
              placeholder="Search your squad..."
              disabled
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-sm placeholder:text-slate-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Player In</label>
            <input
              type="text"
              placeholder="Search all players..."
              disabled
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-sm placeholder:text-slate-600 cursor-not-allowed"
            />
          </div>
          <button
            disabled
            className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-500 text-sm font-medium cursor-not-allowed"
          >
            Make Transfer (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomTransferBuilder;
