import { useState } from 'react';
import type { Player } from '../../data/gwOverviewMocks';

interface Props {
  squad: Player[];
}

/* ── small player chip ── */
const PlayerChip = ({ player }: { player: Player }) => (
  <div className="w-[84px] sm:w-[96px] flex flex-col items-center gap-1">
    <div className="relative">
      <div className="h-10 w-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
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
    </div>
      <span className="w-full truncate text-[11px] text-white font-medium leading-tight text-center">
      {player.name}
    </span>
    <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
      {player.isCaptain ? player.points * 2 : player.points}
    </span>
  </div>
);

/* ── pitch row helper ── */
const PitchRow = ({ players }: { players: Player[] }) => (
    <div
        className="
      w-full
      grid
      place-items-center
      gap-x-3 gap-y-3
      sm:gap-x-6 sm:gap-y-4
    "
        style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}
    >
        {players.map((p) => (
            <PlayerChip key={p.name} player={p} />
        ))}
    </div>
);

/* ── bench row helper ── */
const BenchRow = ({ players }: { players: Player[] }) => (
    <div
        className="
      w-full
      grid
      place-items-center
      gap-x-3 gap-y-3
      sm:gap-x-6 sm:gap-y-4
    "
        style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}
    >
        {players.map((p) => (
            <PlayerChip key={p.name} player={p} />
        ))}
    </div>
);



const PitchCard = ({ squad }: Props) => {
  const [tab, setTab] = useState<'pitch' | 'table'>('pitch');

  const starters = squad.filter((p) => !p.isBench);
  const bench = squad.filter((p) => p.isBench);

  const gk = starters.filter((p) => p.position === 'GK');
  const def = starters.filter((p) => p.position === 'DEF');
  const mid = starters.filter((p) => p.position === 'MID');
  const fwd = starters.filter((p) => p.position === 'FWD');

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {(['pitch', 'table'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition cursor-pointer
              ${tab === t ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'pitch' ? (
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
          <PitchRow players={gk} />
          <PitchRow players={def} />
          <PitchRow players={mid} />
          <PitchRow players={fwd} />

          {/* Bench */}
          <div className="mt-2 w-full rounded-xl bg-slate-900/80 px-4 py-3">
            <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Bench
            </p>
            <BenchRow players={bench} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
          Table view coming soon
        </div>
      )}
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


export default PitchCard;

