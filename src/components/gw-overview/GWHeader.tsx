import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { GWInfo } from '../../data/gwOverviewMocks';

interface Props {
  info: GWInfo;
}

const GWHeader = ({ info }: Props) => (
  <div className="flex items-center justify-between">
    <button
      disabled
      className="rounded-lg bg-slate-800 p-2 text-slate-500 cursor-not-allowed"
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
      disabled
      className="rounded-lg bg-slate-800 p-2 text-slate-500 cursor-not-allowed"
    >
      <FiChevronRight size={20} />
    </button>
  </div>
);

export default GWHeader;

