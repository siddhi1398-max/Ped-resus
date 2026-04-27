import { useState, useMemo, useEffect } from "react";

const TONE = {
  emerald: "bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700",
  amber: "bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700",
  red: "bg-red-100 text-red-900 border-red-400 dark:bg-red-950 dark:text-red-200 dark:border-red-700",
  mild: "bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700",
  moderate: "bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700",
  severe: "bg-red-100 text-red-900 border-red-400 dark:bg-red-950 dark:text-red-200 dark:border-red-700",
};

/**
 * Generic interactive scorer. Each item has keyed options; user picks one.
 * Props: definition = { id, name, source, items[], interpret(total) }
 * Optional onResult callback fires with { total, interpretation } when all picks complete.
 * Optional extraFooter: ReactNode rendered below result when complete.
 */
export default function Scorer({ definition, onResult, extraFooter }) {
  const [picks, setPicks] = useState({});

  const { total, allPicked, pickedLabels } = useMemo(() => {
    let sum = 0;
    let all = true;
    const labels = {};
    for (const item of definition.items) {
      const v = picks[item.key];
      if (v == null) {
        all = false;
      } else {
        sum += v;
        const opt = item.options.find((o) => o.v === v);
        labels[item.key] = { label: item.label, value: v, text: opt?.l || "" };
      }
    }
    return { total: sum, allPicked: all, pickedLabels: labels };
  }, [picks, definition.items]);

  const interpretation = allPicked
    ? { ...definition.interpret(total), picks: pickedLabels }
    : null;

  useEffect(() => {
    if (onResult) onResult(interpretation);
  }, [interpretation?.band, interpretation?.total]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => setPicks({});

  return (
    <div data-testid={`scorer-${definition.id}`} className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h4 className="font-sans font-bold text-base">{definition.name}</h4>
          {definition.fullName && (
            <div className="text-xs text-slate-500 dark:text-slate-400">{definition.fullName}</div>
          )}
          {definition.source && (
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mt-1">
              {definition.source}
            </div>
          )}
        </div>
        <button
          data-testid={`reset-${definition.id}`}
          onClick={reset}
          className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Reset
        </button>
      </div>

      <div className="space-y-3">
        {definition.items.map((item) => (
          <div key={item.key}>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-1.5">
              {item.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.options.map((opt) => {
                const selected = picks[item.key] === opt.v;
                return (
                  <button
                    key={`${item.key}-${opt.v}-${opt.l}`}
                    data-testid={`opt-${definition.id}-${item.key}-${opt.v}`}
                    onClick={() => setPicks({ ...picks, [item.key]: opt.v })}
                    className={`text-left rounded-md border px-3 py-2 text-sm transition-all ${
                      selected
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                        : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="font-mono font-bold mr-2">{opt.v}</span>
                    <span>{opt.l}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Total</span>
          <span className="font-mono font-black text-3xl">{total}</span>
        </div>
        {interpretation ? (
          <div
            data-testid={`result-${definition.id}`}
            className={`rounded-md border px-3 py-2 font-mono text-sm font-bold ${TONE[interpretation.band] || "bg-slate-100 dark:bg-slate-800"}`}
          >
            {interpretation.label}
          </div>
        ) : (
          <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Select all items to interpret
          </div>
        )}
      </div>

      {extraFooter && allPicked && <div className="mt-4">{extraFooter}</div>}
    </div>
  );
}

export { TONE };
