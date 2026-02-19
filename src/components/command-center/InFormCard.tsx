import { useEffect, useState } from 'react';
import { getFormLast4, type FormLast4Player } from '../../api/backend';

const InFormCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<FormLast4Player[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getFormLast4();
        // Sort by last4_points desc, tie-breaker last4_minutes desc
        const sorted = data
          .slice()
          .sort((a, b) => {
            if (b.last4_points !== a.last4_points) {
              return b.last4_points - a.last4_points;
            }
            return b.last4_minutes - a.last4_minutes;
          });
        setPlayers(sorted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load form data');
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
          In Form (Last 4)
        </h2>
        <p className="text-xs text-slate-400 mt-1">Players performing well recently</p>
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
                    <p className="text-sm font-bold text-emerald-400">{player.last4_points}</p>
                    <p className="text-[10px] text-slate-500">pts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-7 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Minutes:</span>
                    <span className="text-slate-300 font-medium">{player.last4_minutes}</span>
                  </div>
                  {player.xG !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">xG:</span>
                      <span className="text-slate-300 font-medium">{player.xG.toFixed(2)}</span>
                    </div>
                  )}
                  {player.xA !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">xA:</span>
                      <span className="text-slate-300 font-medium">{player.xA.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InFormCard;
