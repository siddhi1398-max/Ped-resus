import { useState, useMemo } from "react";
import { useWeight } from "../context/WeightContext";
import { INFUSIONS, calcMlPerHr } from "../data/infusions";
import { Input } from "./ui/input";

const CAT_COLOR = {
  vasoactive: "border-l-red-500 dark:border-l-red-400 text-red-600 dark:text-red-400",
  sedation: "border-l-purple-500 dark:border-l-purple-400 text-purple-600 dark:text-purple-400",
  neonatal: "border-l-pink-500 dark:border-l-pink-400 text-pink-600 dark:text-pink-400",
};

export default function InfusionCalculator() {
  const { weight } = useWeight();
  const [selectedId, setSelectedId] = useState(INFUSIONS[0].id);
  // Per-drug overrides (rate + conc)
  const [overrides, setOverrides] = useState({});

  const selected = INFUSIONS.find((i) => i.id === selectedId);
  const ov = overrides[selectedId] || {};
  const rate = ov.rate ?? selected.rateTypical;
  const conc = ov.conc ?? selected.defaultConcPerMl;

  const mlPerHr = useMemo(() => {
    const tmp = { ...selected, defaultConcPerMl: conc };
    return calcMlPerHr(tmp, rate, weight);
  }, [selected, rate, conc, weight]);

  const setRate = (v) => setOverrides({ ...overrides, [selectedId]: { ...ov, rate: v } });
  const setConc = (v) => setOverrides({ ...overrides, [selectedId]: { ...ov, conc: v } });

  // All drugs rate table (current weight, each at typical rate)
  const rateTable = INFUSIONS.map((d) => ({
    ...d,
    mlPerHr: calcMlPerHr(d, d.rateTypical, weight),
  }));

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">
          Select infusion
        </div>
        <div className="flex flex-wrap gap-1.5">
          {INFUSIONS.map((d) => (
            <button
              key={d.id}
              data-testid={`inf-pick-${d.id}`}
              onClick={() => setSelectedId(d.id)}
              className={`px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-widest border transition-all ${
                selectedId === d.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                  : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      <div className={`rounded-md border-l-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-5 ${CAT_COLOR[selected.category]?.split(" ").filter((c) => c.startsWith("border")).join(" ")}`}>
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div>
            <h4 className="font-sans font-bold text-xl">{selected.name}</h4>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mt-1">
              {selected.recipe}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Rate ({selected.rateUnit})
            </span>
            <Input
              data-testid="inf-rate"
              type="number"
              step="0.01"
              min={selected.rateMin}
              max={selected.rateMax}
              value={rate}
              onChange={(e) => setRate(Math.max(0, +e.target.value || 0))}
              className="font-mono text-right"
            />
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
              Typical {selected.rateTypical} · Range {selected.rateMin} – {selected.rateMax}
            </span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Concentration ({selected.baseUnit}/mL)
            </span>
            <Input
              data-testid="inf-conc"
              type="number"
              step="0.01"
              min="0.001"
              value={conc}
              onChange={(e) => setConc(Math.max(0.001, +e.target.value || selected.defaultConcPerMl))}
              className="font-mono text-right"
            />
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
              Default {selected.defaultConcPerMl}
            </span>
          </label>
          <div className="flex flex-col justify-end">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Infusion rate for {weight} kg
            </div>
            <div data-testid="inf-result" className={`font-mono font-black text-3xl sm:text-4xl leading-none mt-1 ${CAT_COLOR[selected.category]?.split(" ").filter((c) => c.startsWith("text")).join(" ")}`}>
              {mlPerHr.toFixed(2)}
            </div>
            <div className="font-mono text-xs text-slate-600 dark:text-slate-300 mt-1">mL / hr</div>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          {selected.notes}
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">
          All infusions at typical rate · {weight} kg
        </div>
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Drug</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Typical rate</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Conc</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">mL / hr</th>
              </tr>
            </thead>
            <tbody>
              {rateTable.map((d) => (
                <tr key={d.id} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                  <td className="p-3 font-bold">{d.name}</td>
                  <td className="p-3 font-mono text-xs">{d.rateTypical} {d.rateUnit}</td>
                  <td className="p-3 font-mono text-xs text-slate-500 dark:text-slate-400">{d.defaultConcPerMl} {d.baseUnit}/mL</td>
                  <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">{d.mlPerHr.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
