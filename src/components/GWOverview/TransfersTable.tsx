import type { Transfer } from '../../data/gwOverviewMocks';
import { fplEndpoints } from '../../api/fpl/endpoints';

interface TransfersTableProps {
  transfers: Transfer[];
}

const TransfersTable = ({ transfers }: TransfersTableProps) => {
  if (transfers.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Transfers</h2>
        <p className="text-slate-400 text-center py-8">No transfers made yet</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Transfers</h2>
      
      <div className="space-y-3">
        {transfers.map((transfer) => (
          <TransferRow key={transfer.id} transfer={transfer} />
        ))}
      </div>
    </div>
  );
};

const TransferRow = ({ transfer }: { transfer: Transfer }) => {
  const playerOutBadge = fplEndpoints.teamBadge(transfer.playerOutTeamCode, 't40');
  const playerInBadge = fplEndpoints.teamBadge(transfer.playerInTeamCode, 't40');
  
  const transferDate = new Date(transfer.time);
  const formattedDate = transferDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = transferDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between bg-slate-900 rounded-lg p-4">
      {/* Player Out */}
      <div className="flex items-center gap-3 flex-1">
        <img
          src={playerOutBadge}
          alt={transfer.playerOutTeam}
          className="w-6 h-6"
          loading="lazy"
        />
        <div>
          <p className="text-sm font-medium text-red-400">{transfer.playerOut}</p>
          <p className="text-xs text-slate-400">{transfer.playerOutTeam}</p>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center gap-2 px-4">
        <svg
          className="w-5 h-5 text-slate-400"
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
      <div className="flex items-center gap-3 flex-1">
        <img
          src={playerInBadge}
          alt={transfer.playerInTeam}
          className="w-6 h-6"
          loading="lazy"
        />
        <div>
          <p className="text-sm font-medium text-emerald-400">{transfer.playerIn}</p>
          <p className="text-xs text-slate-400">{transfer.playerInTeam}</p>
        </div>
      </div>

      {/* Cost & Time */}
      <div className="text-right ml-4">
        {transfer.cost > 0 && (
          <p className="text-sm font-semibold text-red-400">-{transfer.cost} pts</p>
        )}
        <p className="text-xs text-slate-400">
          {formattedDate} {formattedTime}
        </p>
      </div>
    </div>
  );
};

export default TransfersTable;
