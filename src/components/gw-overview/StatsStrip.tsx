import type { GWStats } from '../../data/gwOverviewMocks';

interface Props {
  stats: GWStats;
}

const format = (n: number) => n.toLocaleString();

const StatsStrip = ({ stats }: Props) => {
  const items = [
    { label: 'Average', value: format(stats.average) },
    { label: 'Highest', value: format(stats.highest) },
    { label: 'GW Points', value: format(stats.gwPoints), highlight: true },
    { label: 'GW Rank', value: format(stats.gwRank) },
    { label: 'Overall Rank', value: format(stats.overallRank) },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-center"
        >
          <p className="text-xs text-slate-400 uppercase tracking-wide">{item.label}</p>
          <p className={`mt-1 text-lg font-bold ${item.highlight ? 'text-emerald-400' : 'text-white'}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsStrip;

