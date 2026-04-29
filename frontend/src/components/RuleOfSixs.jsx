import { useState } from "react";
import { useWeight } from "../context/WeightContext";
import { RULE_OF_SIXS_DRUGS, ruleOf6Mg, mlHrToMcgKgMin, mcgKgMinToMlHr } from "../data/ruleOfSixs";
import { Input } from "./ui/input";

export default function RuleOfSixs() {
  const { weight } = useWeight();
  const [selected, setSelected] = useState(RULE_OF_SIXS_DRUGS[0]);
  const [targetRate, setTargetRate] = useState(5);

  const mgIn100mL = ruleOf6Mg(weight, selected.rule);
  const mlHr = mcgKgMinToMlHr(selected.rule, targetRate);

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
          <div>
            <h4 className="font-sans font-bold text-base">Rule of 6s</h4>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mt-0.5">
              Paediatric infusion shortcut · mL/hr ≡ mcg/kg/min
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm">
          <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900/70">
            <div className="font-mono font-bold text-red-600 dark:text-red-400 mb-1">Rule of 6</div>
            <div className="font-mono text-xs leading-relaxed">
              6 × weight(kg) = <strong>mg drug in 100 mL</strong>
              <br />
              Then <strong>1 mL/hr ≡ 1 mcg/kg/min</strong>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Drugs: Dopamine, Dobutamine, Nitroprusside, Milrinone
            </div>
          </div>
          <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900/70">
            <div className="font-mono font-bold text-red-600 dark:text-red-400 mb-1">Rule of 0.6</div>
            <div className="font-mono text-xs leading-relaxed">
              0.6 × weight(kg) = <strong>mg drug in 100 mL</strong>
              <br />
              Then <strong>1 mL/hr ≡ 0.1 mcg/kg/min</strong>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Drugs: Adrenaline, Noradrenaline, Isoproterenol, Phenylephrine
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">
          Select drug
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {RULE_OF_SIXS_DRUGS.map((d) => (
            <button
              key={d.name}
              data-testid={`r6-pick-${d.name}`}
              onClick={() => setSelected(d)}
              className={`px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-widest border ${
                selected.name === d.name
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                  : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-md border border-slate-200 dark:border-slate-800 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Mixture for {weight} kg</div>
            <div className="font-mono font-black text-2xl mt-1">{mgIn100mL} mg</div>
            <div className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">in 100 mL diluent (rule of {selected.rule})</div>
          </div>
          <div className="rounded-md border border-slate-200 dark:border-slate-800 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Target rate (mcg/kg/min)</div>
            <Input
              data-testid="r6-target"
              type="number"
              step="0.1"
              min="0"
              value={targetRate}
              onChange={(e) => setTargetRate(Math.max(0, +e.target.value || 0))}
              className="font-mono text-right mt-1"
            />
            <div className="font-mono text-[10px] text-slate-400 mt-1">Usual: {selected.usualRange}</div>
          </div>
          <div className="rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-700 dark:text-red-300">Pump rate</div>
            <div className="font-mono font-black text-3xl text-red-700 dark:text-red-300 mt-1">{mlHr.toFixed(2)}</div>
            <div className="font-mono text-xs text-red-700 dark:text-red-300 mt-0.5">mL / hr</div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 italic">{selected.note}</div>
      </div>
    </div>
  );
}
