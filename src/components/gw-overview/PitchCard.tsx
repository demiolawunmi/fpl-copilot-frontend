import { useState } from 'react';
import type { Player } from '../../data/gwOverviewMocks';
import { getDifficultyColor } from '../../utils/difficulty';

interface Props {
  squad: Player[];
}

/* ─────────────────────────────────────────────────────────
 *  🎛️  PLAYER CHIP CONFIG — tweak these to adjust sizing
 * ───────────────────────────────────────────────────────── */
const CHIP = {
  /** Outer chip width (mobile / sm+) */
  width:       'w-[60px] sm:w-[81px]',

  /** Image box aspect ratio  (width / height) — FPL photos are ~11:14 */
  imgAspect:   '11 / 8',
  /** How much of the container height the photo may occupy (percent) — lower = more head room */
  imgScale:    140,
  /** Anchor for image positioning inside the box: 'bottom' | 'center' | 'top' */
  imgAnchor:   'bottom',
  /** Vertical nudge for the image (percent). Positive moves image DOWN, negative moves it UP. */
  imgYOffset:  35,
  /** How the image should fill the box: 'contain' (show whole image) or 'cover' (crop to fill) */
  imgFit:      'contain',
  /** Image border-radius class for top corners */
  imgRadius:   'rounded-t-lg',

  /** Name row vertical padding */
  namePy:      'py-0.5',
  /** Name font-size class */
  nameFontSize:'text-[10px]',

  /** Points row vertical padding */
  ptsPy:       'py-0.5',
  /** Points horizontal padding */
  ptsPx:       'px-3',
  /** Points font-size class */
  ptsFontSize: 'text-[9px]',
  /** Points row bottom-radius */
  ptsRadius:   'rounded-b-md',

  /** Gap between rows on the pitch grid */
  rowGapX:     'gap-x-2 sm:gap-x-4',
  rowGapY:     'gap-y-2 sm:gap-y-3',
};

/* ── small player chip ── */
const PlayerChip = ({ player }: { player: Player }) => (
  <div className={`${CHIP.width} flex flex-col items-center`}>
    <div className="w-full">
      {/* Image box */}
      <div
        className={`relative w-full overflow-hidden border border-slate-600 ${CHIP.imgRadius} rounded-b-none bg-slate-700/40`}
        style={{ aspectRatio: CHIP.imgAspect }}
      >
        {player.photoUrl ? (
          (() => {
            // anchor -> object-position or flex alignment
            const objectPos = CHIP.imgAnchor === 'top' ? 'object-top' : CHIP.imgAnchor === 'center' ? 'object-center' : 'object-bottom';

            if (CHIP.imgFit === 'cover') {
              // cover: fill the box and allow cropping; position via transform
              const transformOrigin = CHIP.imgAnchor === 'top' ? 'top center' : CHIP.imgAnchor === 'center' ? 'center center' : 'bottom center';
              return (
                <img
                  src={player.photoUrl}
                  alt={player.name}
                  className={`absolute inset-0 w-full h-full object-cover ${objectPos}`}
                  style={{ transform: `translateY(${CHIP.imgYOffset}%)`, transformOrigin }}
                  loading="lazy"
                />
              );
            }

            // default: contain (no cropping) — bottom-anchored by wrapper
            const wrapperAlign = CHIP.imgAnchor === 'top' ? 'items-start' : CHIP.imgAnchor === 'center' ? 'items-center' : 'items-end';
            return (
              <div className={`w-full h-full flex ${wrapperAlign} justify-center`}>
                <img
                  src={player.photoUrl}
                  alt={player.name}
                  className={`w-auto object-contain ${objectPos}`}
                  style={{ maxHeight: `${CHIP.imgScale}%`, transform: `translateY(${CHIP.imgYOffset}%)` }}
                  loading="lazy"
                />
              </div>
            );
          })()
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-white uppercase">
            {player.name.slice(0, 3)}
          </div>
        )}

        {/* Captain / vice-captain markers */}
        {player.isCaptain && (
          <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[8px] font-bold text-black z-10">
            C
          </span>
        )}
        {player.isViceCaptain && (
          <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-[8px] font-bold text-black z-10">
            V
          </span>
        )}
      </div>

      {/* Name box */}
      <div className={`w-full bg-slate-900/80 px-1 ${CHIP.namePy} border-x border-slate-600`}>
        <span className={`block w-full truncate ${CHIP.nameFontSize} text-white font-medium leading-tight text-center`}>
          {player.name}
        </span>
      </div>

      {/* Points / label box */}
      <div 
        className={`w-full ${CHIP.ptsPx} ${CHIP.ptsPy} border ${CHIP.ptsRadius} rounded-t-none ${
          player.chipDifficulty !== undefined 
            ? (() => {
                // Use difficulty-based coloring
                const color = getDifficultyColor(player.chipDifficulty);
                if (color === 'emerald') {
                  return 'bg-emerald-500/20 border-emerald-500/25 text-emerald-400';
                } else if (color === 'yellow') {
                  return 'bg-yellow-500/20 border-yellow-500/25 text-yellow-400';
                } else {
                  return 'bg-rose-500/20 border-rose-500/25 text-rose-400';
                }
              })()
            : 'bg-emerald-500/20 border-emerald-500/25 text-emerald-400'
        }`}
      >
        <span className={`block text-center ${CHIP.ptsFontSize} font-bold`}>
          {player.chipLabel ?? (player.isCaptain ? player.points * 2 : player.points)}
        </span>
      </div>
    </div>
  </div>
);

/* ── pitch row helper ── */
const PitchRow = ({ players }: { players: Player[] }) => (
    <div
        className={`w-full grid place-items-center ${CHIP.rowGapX} ${CHIP.rowGapY}`}
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
        className={`w-full grid place-items-center ${CHIP.rowGapX} ${CHIP.rowGapY}`}
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

            {/* Top semicircle (arc) - positioned so it starts just outside the outer penalty box */}
            {/* semicircle dimensions chosen so the arcs start just outside the outer penalty box
                - top/bottom are set to 22% which matches the height of the outer penalty box (h-[22%])
                - h-[8%] controls the arc thickness/diameter; adjust as needed */}
            <div className="absolute left-1/2 top-[22%] w-[24%] h-[8%] -translate-x-1/2 rounded-b-full border border-white/10 border-t-0" />

            {/* Bottom semicircle (mirrored) - starts just outside the bottom outer penalty box */}
            <div className="absolute left-1/2 bottom-[22%] w-[24%] h-[8%] -translate-x-1/2 rounded-t-full border border-white/10 border-b-0" />

            {/* Top penalty box */}
            <div className="absolute left-1/2 top-0 h-[22%] w-[44%] -translate-x-1/2 border-x border-b border-white/10" />
            {/* Top 6-yard box */}
            <div className="absolute left-1/2 top-0 h-[12%] w-[24%] -translate-x-1/2 border-x border-b border-white/10" />
            {/* Top penalty spot */}
            <div className="absolute left-1/2 top-[16%] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15" />

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

