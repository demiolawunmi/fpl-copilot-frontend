import type { Injury } from '../../data/gwOverviewMocks';

interface Props {
  injuries: Injury[];
}

const statusColor: Record<Injury['status'], string> = {
  Injured: 'text-red-400 bg-red-400/10',
  Suspended: 'text-orange-400 bg-orange-400/10',
  Doubtful: 'text-yellow-400 bg-yellow-400/10',
};

const InjuriesTable = ({ injuries }: Props) => (
  <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
    <h2 className="px-5 py-4 text-sm font-semibold text-white uppercase tracking-wide border-b border-slate-800">
      Injuries &amp; Suspensions
    </h2>

    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
          <th className="px-5 py-3 font-medium">Player</th>
          <th className="px-5 py-3 font-medium">Team</th>
          <th className="px-5 py-3 font-medium">Status</th>
          <th className="px-5 py-3 font-medium">Return</th>
        </tr>
      </thead>
      <tbody>
        {injuries.map((inj, i) => (
          <tr
            key={i}
            className="border-b border-slate-800/60 last:border-b-0 hover:bg-slate-800/40 transition"
          >
            <td className="px-5 py-3 text-white font-medium">{inj.player}</td>
            <td className="px-5 py-3 text-slate-400">{inj.team}</td>
            <td className="px-5 py-3">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[inj.status]}`}>
                {inj.status}
              </span>
            </td>
            <td className="px-5 py-3 text-slate-400">{inj.returnDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default InjuriesTable;

