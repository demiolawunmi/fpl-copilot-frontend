import type { ModelSource } from '../../data/commandCenterMocks';

interface Props {
  models: ModelSource[];
}

const ModelComparisonPanel = ({ models }: Props) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Model Sources
        </h2>
        <p className="text-xs text-slate-400 mt-1">Data blending & predictions</p>
      </div>
      <div className="px-5 py-4">
        <div className="space-y-3">
          {models.map((model) => (
            <div key={model.id} className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-200">{model.name}</span>
              {model.weight !== undefined && (
                <span className="px-2 py-1 text-xs font-semibold rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  {model.weight}%
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="block text-xs text-slate-400 mb-2">Blend Ratio (Coming Soon)</label>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="70"
            disabled
            className="w-full cursor-not-allowed opacity-50"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>100% AIrsenal</span>
            <span>100% ELO</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelComparisonPanel;
