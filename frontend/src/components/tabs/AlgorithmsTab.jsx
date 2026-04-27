import { useState } from "react";
import { ALGORITHMS } from "../../data/algorithms";
import { ArrowDown, Diamond, CaretRight } from "@phosphor-icons/react";

const COLORS = {
  resuscitation: {
    bar: "bg-red-500 dark:bg-red-400",
    accent: "text-red-600 dark:text-red-400",
    border: "border-red-500/40",
    chip: "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900",
  },
  fluid: {
    bar: "bg-cyan-500 dark:bg-cyan-400",
    accent: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/40",
    chip: "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-900",
  },
  anticonvulsant: {
    bar: "bg-fuchsia-500 dark:bg-fuchsia-400",
    accent: "text-fuchsia-600 dark:text-fuchsia-400",
    border: "border-fuchsia-500/40",
    chip: "bg-fuchsia-50 dark:bg-fuchsia-950/60 border-fuchsia-200 dark:border-fuchsia-900",
  },
};

export default function AlgorithmsTab() {
  const [activeId, setActiveId] = useState(ALGORITHMS[0].id);
  const active = ALGORITHMS.find((a) => a.id === activeId);
  const c = COLORS[active.color] || COLORS.resuscitation;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">PALS Algorithms</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select an algorithm. Step-by-step flow with decision and action nodes.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {ALGORITHMS.map((a) => (
          <button
            key={a.id}
            data-testid={`algo-${a.id}`}
            onClick={() => setActiveId(a.id)}
            className={`px-3 py-2 rounded-md border font-mono text-[11px] uppercase tracking-widest transition-all ${
              activeId === a.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            {a.title}
          </button>
        ))}
      </div>

      <div className={`rounded-md border ${c.border} p-5 sm:p-6 bg-white dark:bg-slate-900/40`}>
        <div className={`flex items-center gap-2 ${c.accent} mb-1`}>
          <div className={`h-1 w-8 rounded-full ${c.bar}`} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Algorithm</span>
        </div>
        <h3 className="font-sans font-bold text-xl sm:text-2xl tracking-tight">{active.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{active.subtitle}</p>

        <div className="mt-6 space-y-3">
          {active.steps.map((step, i) => (
            <div key={step.title}>
              <div
                className={`rounded-md border p-4 flex gap-4 ${
                  step.type === "decision"
                    ? `${c.chip} border-dashed`
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex-shrink-0 flex flex-col items-center gap-1 w-14">
                  {step.type === "decision" ? (
                    <Diamond size={22} weight="bold" className={c.accent} />
                  ) : (
                    <CaretRight size={22} weight="bold" className={c.accent} />
                  )}
                  <span className={`font-mono text-[9px] uppercase tracking-widest ${c.accent}`}>
                    {step.type === "decision" ? "Decide" : `Step ${i + 1}`}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-sans font-bold text-base leading-tight">{step.title}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                    {step.body}
                  </div>
                </div>
              </div>
              {i < active.steps.length - 1 && (
                <div className="flex justify-start pl-5 py-1">
                  <ArrowDown size={18} weight="bold" className="text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
