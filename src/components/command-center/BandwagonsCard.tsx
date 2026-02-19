import { useEffect, useState } from 'react';
import { getBandwagons, type BandwagonPlayer } from '../../api/backend';

const BandwagonsCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<BandwagonPlayer[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getBandwagons();
        // Sort by transfers_balance desc (or transfers_in desc if balance missing)
        const sorted = data
          .slice()
          .sort((a, b) => {
            const balanceA = a.transfers_balance ?? a.transfers_in;
            const balanceB = b.transfers_balance ?? b.transfers_in;
            return balanceB - balanceA;
          });
        setPlayers(sorted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bandwagons data');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Bandwagons
        </h2>
        <p className="text-xs text-slate-400 mt-1">Most transferred players</p>
      </div>
      <div className="px-5 py-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center text-slate-400 text-sm py-4">Loading...</div>
        ) : error ? (
          <div className="text-center text-rose-400 text-sm py-4">{error}</div>
        ) : players.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-4">No data available</div>
        ) : (
          <div className="space-y-3">
            {players.map((player, idx) => (
              <div
                key={player.player_id}
                className="flex flex-col gap-1.5 pb-3 border-b border-slate-800 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 w-5">{idx + 1}</span>
                      <p className="text-sm font-semibold text-white truncate">{player.player_name}</p>
                    </div>
                    <p className="text-xs text-slate-400 ml-7">{player.team}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-400">
                      {player.transfers_balance > 0 ? '+' : ''}{player.transfers_balance}
                    </p>
                    <p className="text-[10px] text-slate-500">net</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-7 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">In:</span>
                    <span className="text-emerald-400 font-medium">
                      {player.transfers_in.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Out:</span>
                    <span className="text-rose-400 font-medium">
                      {player.transfers_out.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BandwagonsCard;
