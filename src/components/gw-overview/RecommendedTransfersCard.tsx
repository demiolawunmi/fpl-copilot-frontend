import { FiChevronRight, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import type { RecommendedTransfer, RecommendedTransferPlayer } from '../../data/gwOverviewMocks';

interface Props {
  transfers: RecommendedTransfer[];
  heightPx?: number; // match AI summary card height
}

const PlayerInfo = ({
  player,
  direction,
}: {
  player: RecommendedTransferPlayer;
  direction: 'in' | 'out';
}) => (
  <div className="flex items-center gap-2.5">
    <div
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white
        ${direction === 'in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
    >
      {direction === 'in' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
    </div>
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-white">{player.name}</p>
      <p className="text-[11px] text-slate-500">
        {player.team} · {player.position} · {player.price}
      </p>
    </div>
  </div>
);

const RecommendedTransfersCard = ({ transfers, heightPx }: Props) => (
  <div
    className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col"
    style={heightPx ? { height: `${heightPx}px` } : undefined}
  >
    <h2 className="px-5 py-4 text-sm font-semibold text-white uppercase tracking-wide border-b border-slate-800">
      Recommended Transfers
    </h2>

    <div className="divide-y divide-slate-800/60 flex-1 overflow-auto">
      {transfers.map((t, i) => (
        <div
          key={i}
          className="px-5 py-4 hover:bg-slate-800/40 transition"
        >
          {/* Players row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2.5 min-w-0 flex-1">
              <PlayerInfo player={t.playerIn} direction="in" />
              <PlayerInfo player={t.playerOut} direction="out" />
            </div>

            {/* xPts diff badge */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-[10px] uppercase text-slate-500">xPts</span>
              <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-sm font-bold text-emerald-400">
                +{t.xPointsDiff.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Bottom row: rationale + actions */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500 leading-snug flex-1 truncate">
              {t.rationale}
            </p>

            <div className="flex items-center gap-2 shrink-0">
              <button className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer">
                Apply
              </button>
              <button disabled className="text-slate-600 cursor-not-allowed">
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RecommendedTransfersCard;

