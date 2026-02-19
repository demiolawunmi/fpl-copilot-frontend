import { useState } from 'react';
import type { RecommendedTransferItem } from '../../data/commandCenterMocks';

interface Props {
  transfers: RecommendedTransferItem[];
  onApplyTransfer: (playerInId: number, playerOutId: number) => void;
}

const RecommendedTransfersList = ({ transfers, onApplyTransfer }: Props) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Recommended Transfers
        </h2>
        <p className="text-xs text-slate-400 mt-1">AI-suggested moves for this gameweek</p>
      </div>
      <div className="px-5 py-4 max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {transfers.map((transfer, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2 pb-3 border-b border-slate-800 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-400">{transfer.playerOut.name}</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-sm font-semibold text-emerald-400">{transfer.playerIn.name}</span>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-600">
                    +{transfer.xPtsDelta.toFixed(1)} xPts
                  </span>
                </div>
                <button
                  onClick={() => onApplyTransfer(transfer.playerIn.id, transfer.playerOut.id)}
                  className="shrink-0 px-3 py-1 rounded-lg border border-emerald-700 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition cursor-pointer"
                >
                  Apply
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>OUT: £{transfer.playerOut.price}m • {transfer.playerOut.team}</span>
                <span>IN: £{transfer.playerIn.price}m • {transfer.playerIn.team}</span>
              </div>

              <button
                onClick={() => toggleExpand(idx)}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition text-left cursor-pointer"
              >
                {expandedIndex === idx ? '▼ Hide rationale' : '▶ Why this?'}
              </button>

              {expandedIndex === idx && (
                <div className="pl-4 border-l-2 border-slate-700">
                  <p className="text-xs text-slate-300 leading-relaxed">{transfer.why}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedTransfersList;
