// Pitch Card component - displays team formation

import type { Player } from '../../types/fpl';

interface PitchCardProps {
  players: Player[];
}

export default function PitchCard({ players }: PitchCardProps) {
  const starters = players.filter(p => !p.isBench);
  const bench = players.filter(p => p.isBench);

  // Group starters by position
  const goalkeeper = starters.filter(p => p.position === 'GKP');
  const defenders = starters.filter(p => p.position === 'DEF');
  const midfielders = starters.filter(p => p.position === 'MID');
  const forwards = starters.filter(p => p.position === 'FWD');

  return (
    <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-800">
      <h2 className="text-xl font-bold text-white mb-4">Team</h2>

      {/* Pitch */}
      <div className="bg-gradient-to-b from-green-900/40 to-green-800/40 rounded-lg p-6 mb-4 border border-green-700/30">
        <div className="space-y-8">
          {/* Forwards */}
          <PlayerRow players={forwards} />

          {/* Midfielders */}
          <PlayerRow players={midfielders} />

          {/* Defenders */}
          <PlayerRow players={defenders} />

          {/* Goalkeeper */}
          <PlayerRow players={goalkeeper} />
        </div>
      </div>

      {/* Bench */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Bench</h3>
        <div className="flex gap-2 flex-wrap">
          {bench.map(player => (
            <PlayerCard key={player.id} player={player} isBench={true} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PlayerRowProps {
  players: Player[];
}

function PlayerRow({ players }: PlayerRowProps) {
  if (players.length === 0) return null;

  return (
    <div className="flex justify-center gap-4">
      {players.map(player => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}

interface PlayerCardProps {
  player: Player;
  isBench?: boolean;
}

function PlayerCard({ player, isBench }: PlayerCardProps) {
  return (
    <div
      className={`relative flex flex-col items-center ${
        isBench ? 'opacity-60' : ''
      }`}
    >
      {/* Captain badge */}
      {player.isCaptain && (
        <div className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-10">
          C
        </div>
      )}

      {/* Vice-captain badge */}
      {player.isViceCaptain && (
        <div className="absolute -top-1 -right-1 bg-slate-400 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-10">
          V
        </div>
      )}

      {/* Player shirt/badge */}
      <div className="bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center border-2 border-slate-700 mb-2">
        <div className="text-center">
          <div className="text-xs text-slate-400">{player.position}</div>
        </div>
      </div>

      {/* Player info */}
      <div className="text-center">
        <div className="text-sm font-semibold text-white">{player.name}</div>
        <div className="text-xs text-slate-400">{player.team}</div>
        <div className="text-lg font-bold text-emerald-400 mt-1">
          {player.points}
          {player.multiplier > 1 && <span className="text-xs ml-1">×{player.multiplier}</span>}
        </div>
      </div>
    </div>
  );
}
