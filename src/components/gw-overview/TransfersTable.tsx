import type { Transfer } from '../../data/gwOverviewMocks';

interface Props {
  transfers: Transfer[];
}

const TransfersTable = ({ transfers }: Props) => (
  <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
    <h2 className="px-5 py-4 text-sm font-semibold text-white uppercase tracking-wide border-b border-slate-800">
      Transfers
    </h2>

    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
          <th className="px-5 py-3 font-medium">In</th>
          <th className="px-5 py-3 font-medium">Out</th>
          <th className="px-5 py-3 font-medium">Cost</th>
        </tr>
      </thead>
      <tbody>
        {transfers.map((t, i) => (
          <tr
            key={i}
            className="border-b border-slate-800/60 last:border-b-0 hover:bg-slate-800/40 transition"
          >
            <td className="px-5 py-3">
              <span className="text-emerald-400 font-medium">{t.playerIn}</span>
            </td>
            <td className="px-5 py-3">
              <span className="text-red-400 font-medium">{t.playerOut}</span>
            </td>
            <td className="px-5 py-3 text-slate-400">{t.cost}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TransfersTable;

