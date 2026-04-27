import { useState } from "react";
import { useWeight } from "../../context/WeightContext";
import { PATHWAYS } from "../../data/pathways";
import { exportCarePlanPDF } from "../../lib/exportCarePlan";
import { ArrowLeft, FilePdf, CaretRight, Diamond } from "@phosphor-icons/react";
import { toast } from "sonner";

const TONE = {
  red: "bg-red-100 text-red-900 border-red-400 dark:bg-red-950 dark:text-red-200 dark:border-red-700",
  amber: "bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700",
  emerald: "bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700",
};

export default function PathwaysTab({ embedded = false }) {
  const { weight } = useWeight();
  const [activeId, setActiveId] = useState(null);

  if (!activeId) {
    return (
      <div className="space-y-5">
        {!embedded && (
          <div>
            <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">Clinical Pathways</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Interactive decision-tree pathways for acute medical &amp; surgical emergencies. References:{" "}
              <strong>Tintinalli · Fleischer &amp; Ludwig · Harriet Lane · IAP</strong>.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PATHWAYS.map((p) => (
            <button
              key={p.id}
              data-testid={`pathway-${p.id}`}
              onClick={() => setActiveId(p.id)}
              className="text-left rounded-md border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/50 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
              <div className={`font-mono text-[10px] uppercase tracking-[0.2em] mb-1.5 ${p.category === "surgical" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
                {p.category}
              </div>
              <div className="font-sans font-bold text-base">{p.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{p.source}</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                <span>Start pathway</span>
                <CaretRight size={12} weight="bold" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const pathway = PATHWAYS.find((p) => p.id === activeId);
  return (
    <PathwayRunner
      pathway={pathway}
      weight={weight}
      onExit={() => setActiveId(null)}
    />
  );
}

function PathwayRunner({ pathway, weight, onExit }) {
  const [history, setHistory] = useState([pathway.start]);
  const currentId = history[history.length - 1];
  const node = pathway.nodes[currentId];

  const goBack = () => {
    if (history.length > 1) setHistory(history.slice(0, -1));
    else onExit();
  };

  const goto = (next) => setHistory([...history, next]);
  const restart = () => setHistory([pathway.start]);

  const exportPDF = () => {
    const bundle = {
      title: `${pathway.title} · Care Plan`,
      source: pathway.source,
      weight,
      total: "—",
      interpretation: node.title,
      band: node.severity,
      findings: history
        .filter((id) => pathway.nodes[id].kind === "question")
        .map((id) => {
          const n = pathway.nodes[id];
          const nextId = history[history.indexOf(id) + 1];
          const chosen = n.options.find((o) => o.next === nextId);
          return [n.prompt, chosen?.label || ""];
        }),
      nonPharm: node.actions || [],
      drugs: (node.drugs || []).map((d) => ({ name: d.name, dose: d.dose, route: d.route, note: "" })),
      additionalNotes: [node.summary, `Pathway reference: ${pathway.source}`],
    };
    exportCarePlanPDF(bundle);
    toast.success("Care plan PDF exported");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          data-testid="pathway-back"
          onClick={goBack}
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={14} weight="bold" /> Back
        </button>
        <button
          onClick={restart}
          className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Restart
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 ml-auto">
          Step {history.length}
        </span>
      </div>

      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {pathway.category} · pathway
        </div>
        <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight mt-1">{pathway.title}</h2>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pathway.source}</div>
      </div>

      {node.kind === "question" ? (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5">
          <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400">
            <Diamond size={18} weight="bold" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Decision</span>
          </div>
          <h3 className="font-sans font-bold text-lg leading-snug">{node.prompt}</h3>
          <div className="mt-5 space-y-2">
            {node.options.map((opt) => (
              <button
                key={opt.label}
                data-testid={`pathway-opt-${opt.label.slice(0, 20)}`}
                onClick={() => goto(opt.next)}
                className="w-full text-left rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 flex items-center justify-between gap-3 transition-colors"
              >
                <span className="text-sm font-medium">{opt.label}</span>
                <CaretRight size={16} weight="bold" className="text-slate-400 dark:text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div data-testid="pathway-result" className={`rounded-md border-2 p-5 ${TONE[node.severity]}`}>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-75 mb-1">Result</div>
          <h3 className="font-sans font-bold text-xl tracking-tight">{node.title}</h3>
          {node.summary && <p className="text-sm mt-2 leading-relaxed">{node.summary}</p>}

          {node.actions?.length > 0 && (
            <div className="mt-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-75 mb-2">Actions</div>
              <ul className="space-y-1.5 text-sm">
                {node.actions.map((a) => (
                  <li key={a} className="flex gap-2 leading-snug">
                    <span className="opacity-60">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {node.drugs?.length > 0 && (
            <div className="mt-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-75 mb-2">
                Drug recommendations · calculated for {weight} kg
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {node.drugs.map((d) => (
                  <div key={d.name} className="rounded-md bg-white/70 dark:bg-black/30 border border-current/30 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-sm">{d.name}</div>
                      <div className="font-mono font-bold text-sm whitespace-nowrap">{d.dose}</div>
                    </div>
                    <div className="font-mono text-[10px] opacity-70 mt-0.5">{d.route}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              data-testid="pathway-export-pdf"
              onClick={exportPDF}
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold"
            >
              {isUnlocked() ? <FilePdf size={14} weight="bold" /> : <Lock size={14} weight="bold" />}
              Download Care Plan PDF
            </button>
            <button
              onClick={restart}
              className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-md border border-current/40"
            >
              Restart pathway
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
