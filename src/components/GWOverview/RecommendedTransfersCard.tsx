import type { RecommendedTransfer } from '../../data/gwOverviewMocks';
import { fplEndpoints } from '../../api/fpl/endpoints';

interface RecommendedTransfersCardProps {
  transfers: RecommendedTransfer[];
}

const RecommendedTransfersCard = ({ transfers }: RecommendedTransfersCardProps) => {
  if (transfers.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Recommended Transfers</h2>
        <p className="text-slate-400 text-center py-8">
          No transfer recommendations at this time
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Recommended Transfers</h2>
      
      <div className="space-y-4">
        {transfers.map((transfer, index) => (
          <RecommendedTransferCard key={index} transfer={transfer} />
        ))}
      </div>
    </div>
  );
};

const RecommendedTransferCard = ({ transfer }: { transfer: RecommendedTransfer }) => {
  const playerOutBadge = fplEndpoints.teamBadge(transfer.playerOut.teamCode, 't40');
  const playerInBadge = fplEndpoints.teamBadge(transfer.playerIn.teamCode, 't40');
  
  const formatPrice = (price: number) => `£${(price / 10).toFixed(1)}m`;

  return (
    <div className="bg-slate-900 rounded-lg p-4">
      <div className="flex items-start gap-4">
        {/* Player Out */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={playerOutBadge}
              alt={transfer.playerOut.team}
              className="w-8 h-8"
              loading="lazy"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                {transfer.playerOut.name}
              </p>
              <p className="text-xs text-slate-400">
                {transfer.playerOut.team} • {transfer.playerOut.position}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-slate-400">Price</p>
              <p className="font-semibold text-white">
                {formatPrice(transfer.playerOut.price)}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Points</p>
              <p className="font-semibold text-white">{transfer.playerOut.points}</p>
            </div>
            <div>
              <p className="text-slate-400">Form</p>
              <p className="font-semibold text-white">{transfer.playerOut.form}</p>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center pt-4">
          <svg
            className="w-6 h-6 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </div>

        {/* Player In */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={playerInBadge}
              alt={transfer.playerIn.team}
              className="w-8 h-8"
              loading="lazy"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                {transfer.playerIn.name}
              </p>
              <p className="text-xs text-slate-400">
                {transfer.playerIn.team} • {transfer.playerIn.position}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-slate-400">Price</p>
              <p className="font-semibold text-emerald-400">
                {formatPrice(transfer.playerIn.price)}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Points</p>
              <p className="font-semibold text-emerald-400">{transfer.playerIn.points}</p>
            </div>
            <div>
              <p className="text-slate-400">Form</p>
              <p className="font-semibold text-emerald-400">{transfer.playerIn.form}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-sm text-slate-300">{transfer.reason}</p>
      </div>
    </div>
  );
};

export default RecommendedTransfersCard;
