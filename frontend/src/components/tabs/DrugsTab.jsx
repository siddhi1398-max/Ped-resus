import { useState, useMemo } from "react";
import { useWeight } from "../../context/WeightContext";
import { DRUGS, DRUG_CATEGORIES, computeDrugDose } from "../../data/drugs";
import { Input } from "../ui/input";
import { MagnifyingGlass } from "@phosphor-icons/react";

const CAT_COLORS = {
  resuscitation: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-300 dark:border-red-900",
  sedation: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 border-purple-300 dark:border-purple-900",
  antibiotic: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-300 dark:border-blue-900",
  fluid: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200 border-cyan-300 dark:border-cyan-900",
  airway: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-900",
  analgesia: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-900",
  anticonvulsant: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200 border-fuchsia-300 dark:border-fuchsia-900",
  other: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
};

export default function DrugsTab() {
  const { weight } = useWeight();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const filtered = useMemo(() => {
    return DRUGS.filter((d) => {
      const matchCat = cat === "all" || d.category === cat;
      const matchQ =
        !q ||
        d.name.toLowerCase().includes(q.toLowerCase()) ||
        d.indication.toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQ;
    });
  }, [q, cat]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">Drug Doses Reference</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Filter by category or search. Doses auto-calculated for{" "}
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{weight} kg</span>.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            data-testid="drug-search"
            placeholder="Search drug or indication…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {DRUG_CATEGORIES.map((c) => (
            <button
              key={c.id}
              data-testid={`drug-cat-${c.id}`}
              onClick={() => setCat(c.id)}
              className={`px-3 py-1.5 rounded-full border font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${
                cat === c.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                  : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 dark:bg-slate-950 text-white">
              <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Drug</th>
              <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Indication</th>
              <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Category</th>
              <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Dose / kg</th>
              <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Calc ({weight} kg)</th>
              <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Route</th>
              <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40 align-top">
                <td className="p-3 font-bold">{d.name}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{d.indication}</td>
                <td className="p-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${CAT_COLORS[d.category]}`}>
                    {d.category}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs">
                  {(() => {
                    if (d.fixedDose) return d.fixedDose;
                    if (d.dosePerKg == null) return "—";
                    const maxSuffix = d.max ? ` (max ${d.max})` : "";
                    return `${d.dosePerKg} ${d.unit}/kg${maxSuffix}`;
                  })()}
                </td>
                <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">{computeDrugDose(d, weight)}</td>
                <td className="p-3 font-mono text-xs">{d.route}</td>
                <td className="p-3 text-xs text-slate-500 dark:text-slate-400 max-w-xs">{d.notes}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No drugs match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
