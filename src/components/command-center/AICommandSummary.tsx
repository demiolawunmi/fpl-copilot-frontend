import { useState } from 'react';
import type { CommandCenterAISummary } from '../../data/commandCenterMocks';

interface Props {
  summary: CommandCenterAISummary;
}

const AICommandSummary = ({ summary }: Props) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">{summary.title}</h2>
          <p className="text-xs text-slate-400 mt-1">AI-powered insights for GW {summary.gameweek}</p>
        </div>
        <button
          disabled
          className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-500 cursor-not-allowed text-xs"
          title="Coming soon"
        >
          Refresh
        </button>
      </div>

      <div className="px-5 py-4">
        <ul className="space-y-4">
          {summary.bullets.map((bullet, idx) => (
            <li key={idx} className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <Dot tone={bullet.tone} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 leading-snug">{bullet.text}</p>
                  <button
                    onClick={() => toggleExpand(idx)}
                    className="mt-1 text-xs text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                  >
                    {expandedIndex === idx ? '▼ Hide details' : '▶ Why?'}
                  </button>
                </div>
              </div>

              {expandedIndex === idx && (
                <div className="ml-8 pl-4 border-l-2 border-slate-700">
                  <p className="text-xs text-slate-400 leading-relaxed">{bullet.why}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

function Dot({ tone }: { tone: 'good' | 'info' | 'warn' }) {
  const cls =
    tone === 'good' ? 'bg-emerald-400' : tone === 'warn' ? 'bg-yellow-400' : 'bg-sky-400';

  return <span className={`mt-2 h-2 w-2 rounded-full ${cls} shrink-0`} />;
}

export default AICommandSummary;
