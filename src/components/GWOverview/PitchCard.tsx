import { useState } from 'react';
import type { Player } from '../../data/gwOverviewMocks';
import { fplEndpoints } from '../../api/fpl/endpoints';

interface PitchCardProps {
  squad: Player[];
}

const PitchCard = ({ squad }: PitchCardProps) => {
  const [activeTab, setActiveTab] = useState<'pitch' | 'list'>('pitch');

  // Split squad into starting XI and bench
  const startingXI = squad.filter((p) => p.multiplier > 0);
  const bench = squad.filter((p) => p.multiplier === 0);

  // Group starting XI by position for pitch view
  const byPosition = {
    GK: startingXI.filter((p) => p.position === 'GK'),
    DEF: startingXI.filter((p) => p.position === 'DEF'),
    MID: startingXI.filter((p) => p.position === 'MID'),
    FWD: startingXI.filter((p) => p.position === 'FWD'),
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('pitch')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'pitch'
              ? 'bg-slate-700 text-white border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-750'
          }`}
        >
          Pitch View
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'bg-slate-700 text-white border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-750'
          }`}
        >
          List View
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'pitch' ? (
          <PitchView byPosition={byPosition} bench={bench} />
        ) : (
          <ListView startingXI={startingXI} bench={bench} />
        )}
      </div>
    </div>
  );
};

// Pitch View Component
const PitchView = ({
  byPosition,
  bench,
}: {
  byPosition: Record<string, Player[]>;
  bench: Player[];
}) => {
  return (
    <div className="space-y-6">
      {/* Pitch */}
      <div
        className="relative rounded-lg p-6 min-h-[500px]"
        style={{
          background: 'linear-gradient(180deg, #0f4c3a 0%, #1a5c47 100%)',
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.05) 0px,
              rgba(255,255,255,0.05) 1px,
              transparent 1px,
              transparent 50px
            )
          `,
        }}
      >
        {/* Formation rows */}
        <div className="flex flex-col justify-around h-full gap-4">
          {/* Forwards */}
          <div className="flex justify-center gap-4">
            {byPosition.FWD.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>

          {/* Midfielders */}
          <div className="flex justify-center gap-4">
            {byPosition.MID.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>

          {/* Defenders */}
          <div className="flex justify-center gap-4">
            {byPosition.DEF.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>

          {/* Goalkeeper */}
          <div className="flex justify-center gap-4">
            {byPosition.GK.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>
      </div>

      {/* Bench */}
      <div className="bg-slate-900 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Bench</h3>
        <div className="flex gap-4 overflow-x-auto">
          {bench.map((player) => (
            <PlayerCard key={player.id} player={player} small />
          ))}
        </div>
      </div>
    </div>
  );
};

// List View Component
const ListView = ({
  startingXI,
  bench,
}: {
  startingXI: Player[];
  bench: Player[];
}) => {
  return (
    <div className="space-y-6">
      {/* Starting XI */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Starting XI</h3>
        <div className="space-y-2">
          {startingXI.map((player) => (
            <PlayerRow key={player.id} player={player} />
          ))}
        </div>
      </div>

      {/* Bench */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Bench</h3>
        <div className="space-y-2">
          {bench.map((player) => (
            <PlayerRow key={player.id} player={player} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Player Card for Pitch View
const PlayerCard = ({ player, small = false }: { player: Player; small?: boolean }) => {
  const badgeUrl = fplEndpoints.teamBadge(player.teamCode, 't40');

  return (
    <div
      className={`relative flex flex-col items-center ${
        small ? 'w-16' : 'w-20'
      }`}
    >
      {/* Captain/Vice badge */}
      {player.isCaptain && (
        <span className="absolute -top-2 -left-2 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-10">
          C
        </span>
      )}
      {player.isViceCaptain && (
        <span className="absolute -top-2 -left-2 bg-slate-400 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-10">
          V
        </span>
      )}

      {/* Player jersey/circle */}
      <div
        className={`relative rounded-full bg-white shadow-lg flex items-center justify-center ${
          small ? 'w-14 h-14' : 'w-16 h-16'
        }`}
      >
        <img
          src={badgeUrl}
          alt={player.team}
          className={small ? 'w-8 h-8' : 'w-10 h-10'}
          loading="lazy"
        />
      </div>

      {/* Player info */}
      <div className="mt-1 text-center">
        <p
          className={`font-semibold text-white truncate max-w-full ${
            small ? 'text-xs' : 'text-sm'
          }`}
        >
          {player.name}
        </p>
        <p
          className={`text-emerald-400 font-bold ${
            small ? 'text-xs' : 'text-sm'
          }`}
        >
          {player.points}
          {player.multiplier > 1 && (
            <span className="ml-1 text-yellow-400">×{player.multiplier}</span>
          )}
        </p>
      </div>
    </div>
  );
};

// Player Row for List View
const PlayerRow = ({ player }: { player: Player }) => {
  const badgeUrl = fplEndpoints.teamBadge(player.teamCode, 't40');

  return (
    <div className="flex items-center justify-between bg-slate-900 rounded-lg p-3">
      <div className="flex items-center gap-3">
        <img
          src={badgeUrl}
          alt={player.team}
          className="w-6 h-6"
          loading="lazy"
        />
        <div>
          <p className="text-sm font-semibold text-white">
            {player.name}
            {player.isCaptain && (
              <span className="ml-2 text-xs bg-yellow-400 text-slate-900 font-bold px-2 py-0.5 rounded">
                C
              </span>
            )}
            {player.isViceCaptain && (
              <span className="ml-2 text-xs bg-slate-400 text-slate-900 font-bold px-2 py-0.5 rounded">
                V
              </span>
            )}
          </p>
          <p className="text-xs text-slate-400">
            {player.team} • {player.position}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-emerald-400">
          {player.points}
          {player.multiplier > 1 && (
            <span className="ml-1 text-yellow-400">×{player.multiplier}</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default PitchCard;
