import type { GWStats } from '../../data/gwOverviewMocks';

interface StatsStripProps {
  stats: GWStats;
  manualPoints?: number | null;
  showManualPoints?: boolean;
}

const StatsStrip = ({ stats, manualPoints, showManualPoints }: StatsStripProps) => {
  const formatValue = (value: number, decimals: number = 1): string => {
    return (value / 10).toFixed(decimals);
  };

  const formatRank = (rank: number): string => {
    return rank.toLocaleString();
  };

  const statItems = [
    {
      label: 'GW Points',
      value: stats.points.toString(),
      color: 'text-emerald-400',
    },
    ...(showManualPoints && manualPoints != null && manualPoints !== stats.points
      ? [
          {
            label: 'Manual Points',
            value: manualPoints.toString(),
            color: 'text-yellow-400',
          },
        ]
      : []),
    {
      label: 'GW Rank',
      value: formatRank(stats.rank),
      color: 'text-blue-400',
    },
    {
      label: 'Overall Rank',
      value: formatRank(stats.overallRank),
      color: 'text-purple-400',
    },
    {
      label: 'Bench Points',
      value: stats.pointsOnBench.toString(),
      color: 'text-slate-400',
    },
    {
      label: 'Transfers',
      value: `${stats.transfersMade} (${stats.transfersCost > 0 ? `-${stats.transfersCost}` : '0'})`,
      color: stats.transfersCost > 0 ? 'text-red-400' : 'text-slate-400',
    },
    {
      label: 'Team Value',
      value: `£${formatValue(stats.teamValue)}m`,
      color: 'text-slate-300',
    },
    {
      label: 'Bank',
      value: `£${formatValue(stats.bank)}m`,
      color: 'text-slate-300',
    },
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {statItems.map((item, index) => (
          <div key={index} className="text-center">
            <p className="text-xs text-slate-400 mb-1">{item.label}</p>
            <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
      {showManualPoints && manualPoints !== null && manualPoints !== stats.points && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-sm text-yellow-400">
            ⚠️ Manual calculation ({manualPoints} pts) differs from API ({stats.points} pts).
            This may be due to bench boost or automatic substitutions.
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsStrip;
