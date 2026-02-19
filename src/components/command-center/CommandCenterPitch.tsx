import type { EnhancedPlayer } from '../../data/commandCenterMocks';

interface Props {
  squad: EnhancedPlayer[];
  onSetCaptain: (playerId: number) => void;
}

const CommandCenterPitch = ({ squad, onSetCaptain }: Props) => {
  const starters = squad.filter((p) => !p.isBench);
  const bench = squad.filter((p) => p.isBench);

  const gk = starters.filter((p) => p.position === 'GK');
  const def = starters.filter((p) => p.position === 'DEF');
  const mid = starters.filter((p) => p.position === 'MID');
  const fwd = starters.filter((p) => p.position === 'FWD');

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="flex border-b border-slate-800">
        <div className="flex-1 py-3 text-sm font-semibold text-emerald-400 border-b-2 border-emerald-400 text-center">
          Pitch View
        </div>
      </div>

      <div
        className="relative flex flex-col items-center gap-5 px-3 py-4 sm:px-6 sm:py-6 lg:px-8"
        style={{
          background:
            'repeating-linear-gradient(180deg, #1a3d1a 0px, #1a3d1a 60px, #1f4a1f 60px, #1f4a1f 120px)',
        }}
      >
        <PitchLines />

        {/* Pitch markings overlay */}
        <div className="pointer-events-none absolute inset-3 sm:inset-4 rounded-lg border border-white/10" />
        <div className="pointer-events-none absolute inset-x-3 sm:inset-x-4 top-1/2 h-px bg-white/10" />

        {/* Formation rows */}
        <PitchRow players={gk} onSetCaptain={onSetCaptain} />
        <PitchRow players={def} onSetCaptain={onSetCaptain} />
        <PitchRow players={mid} onSetCaptain={onSetCaptain} />
        <PitchRow players={fwd} onSetCaptain={onSetCaptain} />

        {/* Bench */}
        <div className="mt-2 w-full rounded-xl bg-slate-900/80 px-4 py-3">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Bench
          </p>
          <BenchRow players={bench} />
        </div>
      </div>
    </div>
  );
};

const PitchRow = ({ players, onSetCaptain }: { players: EnhancedPlayer[]; onSetCaptain: (id: number) => void }) => (
  <div
    className="w-full grid place-items-center gap-x-3 gap-y-3 sm:gap-x-6 sm:gap-y-4"
    style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}
  >
    {players.map((p) => (
      <PlayerChip key={p.id} player={p} onSetCaptain={onSetCaptain} />
    ))}
  </div>
);

const BenchRow = ({ players }: { players: EnhancedPlayer[] }) => (
  <div
    className="w-full grid place-items-center gap-x-3 gap-y-3 sm:gap-x-6 sm:gap-y-4"
    style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}
  >
    {players.map((p) => (
      <PlayerChip key={p.id} player={p} />
    ))}
  </div>
);

const PlayerChip = ({ player, onSetCaptain }: { player: EnhancedPlayer; onSetCaptain?: (id: number) => void }) => {
  const minutesColor =
    player.minutesRisk === 'Safe'
      ? 'text-emerald-400'
      : player.minutesRisk === 'Risk'
      ? 'text-orange-400'
      : 'text-slate-400';

  const injuryBadge = player.injuryStatus !== 'Available';

  return (
    <div className="w-[84px] sm:w-[96px] flex flex-col items-center gap-1">
      <div className="relative">
        <div
          className={`h-10 w-10 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white uppercase ${
            player.injuryStatus === 'Injured'
              ? 'bg-red-800 border-red-600'
              : player.injuryStatus === 'Doubtful'
              ? 'bg-orange-800 border-orange-600'
              : player.injuryStatus === 'Suspended'
              ? 'bg-yellow-800 border-yellow-600'
              : 'bg-slate-700 border-slate-600'
          }`}
          onClick={() => onSetCaptain?.(player.id)}
          style={{ cursor: onSetCaptain ? 'pointer' : 'default' }}
        >
          {player.name.slice(0, 3)}
        </div>
        {player.isCaptain && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[8px] font-bold text-black">
            C
          </span>
        )}
        {player.isViceCaptain && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-[8px] font-bold text-black">
            V
          </span>
        )}
        {injuryBadge && (
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white">
            !
          </span>
        )}
      </div>
      <span className="w-full truncate text-[11px] text-white font-medium leading-tight text-center">
        {player.name}
      </span>
      <div className="flex items-center gap-1">
        <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
          {player.xPts.toFixed(1)}
        </span>
        <span className={`text-[9px] font-medium ${minutesColor}`} title={`Minutes risk: ${player.minutesRisk}`}>
          {player.minutesRisk === 'Safe' ? '✓' : player.minutesRisk === 'Risk' ? '⚠' : '?'}
        </span>
      </div>
    </div>
  );
};

function PitchLines() {
  return (
    <div className="pointer-events-none absolute inset-3 sm:inset-4">
      {/* Outer border */}
      <div className="absolute inset-0 rounded-lg border border-white/15" />

      {/* Halfway line */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />

      {/* Center circle + spot */}
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15" />

      {/* Top penalty box */}
      <div className="absolute left-1/2 top-0 h-[22%] w-[44%] -translate-x-1/2 border-x border-b border-white/10" />
      {/* Top 6-yard box */}
      <div className="absolute left-1/2 top-0 h-[12%] w-[24%] -translate-x-1/2 border-x border-b border-white/10" />
      {/* Top penalty spot */}
      <div className="absolute left-1/2 top-[16%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/15" />

      {/* Bottom penalty box */}
      <div className="absolute left-1/2 bottom-0 h-[22%] w-[44%] -translate-x-1/2 border-x border-t border-white/10" />
      {/* Bottom 6-yard box */}
      <div className="absolute left-1/2 bottom-0 h-[12%] w-[24%] -translate-x-1/2 border-x border-t border-white/10" />
      {/* Bottom penalty spot */}
      <div className="absolute left-1/2 bottom-[16%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/15" />
    </div>
  );
}

export default CommandCenterPitch;
