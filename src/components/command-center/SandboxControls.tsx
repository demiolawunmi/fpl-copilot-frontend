interface Props {
  sandboxMode: boolean;
  onToggleSandboxMode: () => void;
  onUndo: () => void;
  onReset: () => void;
  onApply: () => void;
  canUndo: boolean;
}

const SandboxControls = ({
  sandboxMode,
  onToggleSandboxMode,
  onUndo,
  onReset,
  onApply,
  canUndo,
}: Props) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 px-5 py-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Sandbox Mode Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Sandbox Mode</span>
          <button
            onClick={onToggleSandboxMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
              sandboxMode ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                sandboxMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-700" />

        {/* Action Buttons */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
            canUndo
              ? 'border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer'
              : 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed'
          }`}
        >
          ↶ Undo
        </button>

        <button
          onClick={onReset}
          className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 hover:text-white transition text-sm font-medium cursor-pointer"
        >
          ⟲ Reset
        </button>

        <button
          onClick={onApply}
          className="px-3 py-2 rounded-lg border border-emerald-700 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition text-sm font-medium cursor-pointer"
        >
          ✓ Apply to Team
        </button>
      </div>
    </div>
  );
};

export default SandboxControls;
