import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { GWInfo } from '../../data/gwOverviewMocks';

interface Props {
  info: GWInfo;
  onPrev?: () => void;
  onNext?: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
}

const GWHeader = ({ info, onPrev, onNext, disablePrev, disableNext }: Props) => (
  <div className="flex items-center justify-between">
    <button
      disabled={disablePrev}
      onClick={onPrev}
      className={`rounded-lg p-2 ${disablePrev ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700 transition'}`}
      aria-label="Previous gameweek"
    >
      <FiChevronLeft size={20} />
    </button>

    <div className="text-center">
      <h1 className="text-2xl font-bold text-white">Gameweek {info.gameweek}</h1>
      <p className="mt-1 text-sm text-slate-400">
        {info.teamName} &middot; {info.manager} &middot; ID {info.teamId}
      </p>
    </div>

    <button
      disabled={disableNext}
      onClick={onNext}
      className={`rounded-lg p-2 ${disableNext ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700 transition'}`}
      aria-label="Next gameweek"
    >
      <FiChevronRight size={20} />
    </button>
  </div>
);

export default GWHeader;

