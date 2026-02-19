// Stats Strip component - displays GW statistics including manual points calculation

import type { GWStats } from '../../types/fpl';

interface StatsStripProps {
  stats: GWStats;
}

export default function StatsStrip({ stats }: StatsStripProps) {
  const hasDiscrepancy = stats.pointsDiscrepancy !== 0;

  return (
    <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-800">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* API GW Points */}
        <StatItem
          label="API GW Points"
          value={stats.gwPoints}
          className={hasDiscrepancy ? 'text-orange-400' : 'text-emerald-400'}
        />

        {/* Manual GW Points */}
        <StatItem
          label="Manual GW Points"
          value={stats.manualPoints}
          className={hasDiscrepancy ? 'text-emerald-400' : 'text-white'}
          highlight={hasDiscrepancy}
        />

        {/* Points Discrepancy - only show if there is a difference */}
        {hasDiscrepancy && (
          <StatItem
            label="Discrepancy"
            value={stats.pointsDiscrepancy > 0 ? `+${stats.pointsDiscrepancy}` : stats.pointsDiscrepancy}
            className="text-yellow-400"
            highlight={true}
          />
        )}

        {/* Total Points */}
        <StatItem label="Total Points" value={stats.totalPoints.toLocaleString()} />

        {/* GW Rank */}
        <StatItem label="GW Rank" value={stats.gwRank.toLocaleString()} />

        {/* Overall Rank */}
        <StatItem label="Overall Rank" value={stats.overallRank.toLocaleString()} />

        {/* Team Value */}
        <StatItem label="Team Value" value={`£${stats.teamValue.toFixed(1)}m`} />

        {/* Bank */}
        <StatItem label="Bank" value={`£${stats.bank.toFixed(1)}m`} />

        {/* Transfers */}
        <StatItem
          label="Transfers"
          value={stats.transfers}
          subtitle={stats.transferCost > 0 ? `-${stats.transferCost} pts` : undefined}
        />

        {/* Bench Points */}
        <StatItem label="Bench Points" value={stats.benchPoints} />
      </div>

      {/* Discrepancy Alert */}
      {hasDiscrepancy && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-yellow-400 text-xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-yellow-400 font-semibold mb-1">Points Discrepancy Detected</h3>
              <p className="text-slate-300 text-sm">
                The manually calculated points ({stats.manualPoints}) differ from the API-reported points ({stats.gwPoints}) by {' '}
                <span className="font-semibold text-yellow-400">
                  {stats.pointsDiscrepancy > 0 ? '+' : ''}{stats.pointsDiscrepancy} points
                </span>.
                This may be due to delayed API updates or bonus points not yet finalized.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  highlight?: boolean;
}

function StatItem({ label, value, subtitle, className, highlight }: StatItemProps) {
  return (
    <div
      className={`text-center ${
        highlight ? 'bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3' : ''
      }`}
    >
      <div className="text-slate-400 text-xs mb-1">{label}</div>
      <div className={`text-2xl font-bold ${className || 'text-white'}`}>{value}</div>
      {subtitle && <div className="text-slate-500 text-xs mt-1">{subtitle}</div>}
    </div>
  );
}
