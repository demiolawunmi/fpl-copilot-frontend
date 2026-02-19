import type { Injury } from '../../data/gwOverviewMocks';
import { fplEndpoints } from '../../api/fpl/endpoints';

interface InjuriesTableProps {
  injuries: Injury[];
}

const InjuriesTable = ({ injuries }: InjuriesTableProps) => {
  if (injuries.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Injuries & Suspensions</h2>
        <p className="text-slate-400 text-center py-8">
          No injuries or suspensions in your squad 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Injuries & Suspensions</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-2 text-sm font-semibold text-slate-400">
                Player
              </th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-slate-400">
                Team
              </th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-slate-400">
                Status
              </th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-slate-400">
                News
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-slate-400">
                Chance
              </th>
            </tr>
          </thead>
          <tbody>
            {injuries.map((injury, index) => (
              <InjuryRow key={index} injury={injury} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InjuryRow = ({ injury }: { injury: Injury }) => {
  const badgeUrl = fplEndpoints.teamBadge(injury.teamCode, 't40');
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'injured':
        return 'text-red-400 bg-red-400/10';
      case 'doubtful':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'suspended':
        return 'text-orange-400 bg-orange-400/10';
      default:
        return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getChanceColor = (chance: number | null) => {
    if (chance === null || chance === 0) return 'text-red-400';
    if (chance < 50) return 'text-orange-400';
    if (chance < 75) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  return (
    <tr className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
      <td className="py-3 px-2">
        <span className="text-sm font-medium text-white">{injury.player}</span>
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-2">
          <img
            src={badgeUrl}
            alt={injury.team}
            className="w-5 h-5"
            loading="lazy"
          />
          <span className="text-sm text-slate-300">{injury.team}</span>
        </div>
      </td>
      <td className="py-3 px-2">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(
            injury.status
          )}`}
        >
          {injury.status}
        </span>
      </td>
      <td className="py-3 px-2">
        <span className="text-sm text-slate-400">{injury.news}</span>
      </td>
      <td className="py-3 px-2 text-center">
        <span className={`text-sm font-semibold ${getChanceColor(injury.chance)}`}>
          {injury.chance !== null ? `${injury.chance}%` : 'N/A'}
        </span>
      </td>
    </tr>
  );
};

export default InjuriesTable;
