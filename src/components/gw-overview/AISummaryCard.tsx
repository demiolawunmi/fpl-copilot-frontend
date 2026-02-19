import type { AISummary, AISummaryTone } from "../../data/gwOverviewMocks";
import type { GWInfo } from "../../data/gwOverviewMocks";

type Props = {
    gwInfo: GWInfo;
    summary: AISummary;
};

export default function AiSummaryCard({ gwInfo, summary }: Props) {
    return (
        <section className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
                        {summary.heading}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400 truncate">
                        GW {gwInfo.gameweek} • {gwInfo.teamName} • {gwInfo.manager} • {gwInfo.teamId}
                    </p>
                </div>

                <span className="shrink-0 text-[11px] px-2 py-1 rounded-full border border-slate-700 text-slate-300 bg-slate-800/40">
          MVP
        </span>
            </div>

            <div className="px-5 py-4">
                <p className="text-sm text-slate-300 leading-relaxed">{summary.intro}</p>

                <ul className="mt-4 space-y-3">
                    {summary.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <Dot tone={item.tone} />
                            <span className="text-sm text-slate-200 leading-snug">
                {item.text}
              </span>
                        </li>
                    ))}
                </ul>

                <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {summary.footerHint ?? "More detail coming soon."}
          </span>

                    {/* disabled for now */}
                    <button
                        disabled
                        className="shrink-0 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-500 cursor-not-allowed text-sm"
                        title="Coming soon"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        </section>
    );
}

function Dot({ tone }: { tone: AISummaryTone }) {
    const cls =
        tone === "good"
            ? "bg-emerald-400"
            : tone === "warn"
                ? "bg-yellow-400"
                : "bg-sky-400";

    return <span className={`mt-2 h-2 w-2 rounded-full ${cls}`} />;
}
