import { useState, useMemo, useEffect } from "react";
import { useWeight } from "../../context/WeightContext";
import { ORAL_DRUGS, ORAL_CATEGORIES, computeSyrupDose } from "../../data/oralFormulations";
import { MagnifyingGlass, Drop, Pill, Info, Warning, ArrowRight } from "@phosphor-icons/react";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const FREQ_LABEL = {
  OD: "Once daily",
  BD: "Twice daily",
  TDS: "Three times daily",
  QID: "Four times daily",
  single: "Single dose",
  "ad lib": "As needed",
};

const CATEGORY_COLORS = {
  analgesia:      "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800",
  anticonvulsant: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
  sedation:       "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
  other:          "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700",
  fluid:          "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800",
};

const BORDER_ACCENT = {
  analgesia:      "border-l-orange-500 dark:border-l-orange-400",
  anticonvulsant: "border-l-purple-500 dark:border-l-purple-400",
  sedation:       "border-l-indigo-500 dark:border-l-indigo-400",
  other:          "border-l-slate-400 dark:border-l-slate-600",
  fluid:          "border-l-cyan-500 dark:border-l-cyan-400",
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SyrupCalculatorTab({ searchEntry }) {
  const { weight } = useWeight();
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("all");
  const [expandedDrugId, setExpandedDrugId] = useState(null);
  const [expanded, setExpanded] = useState(null); 
  
  useEffect(() => {
  if (!searchEntry?.drugId) return;
  
  // Find the drug first
  const matchedDrug = ORAL_DRUGS.find(d => d.id === searchEntry.drugId);
  if (!matchedDrug) return;

  // Find which category tab it belongs to
  const matchingCat = ORAL_CATEGORIES.find(c =>
    c.matches?.includes(matchedDrug.category)
  );

  setSearch("");
  setCategory(matchingCat?.id ?? "all");
  setExpanded(searchEntry.drugId);
  setTimeout(() => {
    document.getElementById(`syrup-drug-${searchEntry.drugId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 150);
}, [searchEntry]);

useEffect(() => {
  if (expandedDrugId) {
    const t = setTimeout(() => setExpandedDrugId(null), 3000);
    return () => clearTimeout(t);
  }
}, [expandedDrugId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ORAL_DRUGS.filter(d => {
      const matchCat = category === "all"
        || (ORAL_CATEGORIES.find(c => c.id === category)?.matches?.includes(d.category));
      const matchQ = !q
        || d.name.toLowerCase().includes(q)
        || d.indication.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [search, category]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">
          Syrup / Oral Dose Calculator
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Weight-based oral doses with Indian formulation volumes for{" "}
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{weight} kg</span>.{" "}
          Includes syrup concentrations &amp; brand names available in India.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
        <Warning size={14} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>
          <strong>References:</strong> IAP Guidelines 2024 · Piyush Gupta Pediatric Drug Doses 18th Ed · Harriet Lane 22nd Ed.
          Always verify doses against current institutional protocols before prescribing.
        </span>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search drug or indication..."
            className="w-full pl-8 pr-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ORAL_CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-md border font-mono text-[10px] uppercase tracking-widest transition-all ${
                category === c.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                  : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-400 font-mono">
        {filtered.length} drug{filtered.length !== 1 ? "s" : ""} shown
      </p>

      {/* Drug cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            No drugs found for "{search}"
          </div>
        )}

        {filtered.map(drug => {
          const result  = computeSyrupDose(drug, weight);
          const isOpen = expanded === drug.id || expandedDrugId === drug.id;
          const catColor = CATEGORY_COLORS[drug.category] || CATEGORY_COLORS.other;
          const accent   = BORDER_ACCENT[drug.category] || BORDER_ACCENT.other;

          return (
  <div
    key={drug.id}
    id={`syrup-drug-${drug.id}`}
    className={`rounded-md border border-l-4 ${accent} border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden transition-all ${
      expandedDrugId === drug.id ? "ring-2 ring-blue-400 dark:ring-blue-500" : ""
    }`}
  >
    {/* Card header */}
    <button
      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      onClick={() => setExpanded(isOpen ? null : drug.id)}
    >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans font-bold text-base text-slate-900 dark:text-white">
                        {drug.name}
                      </span>
                      <span className={`font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border ${catColor}`}>
                        {drug.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {drug.indication}
                    </div>
                  </div>

                  {/* Dose badge */}
                  <div className="flex-shrink-0 text-right">
                    {result.fixedDose ? (
                      <div className="font-mono text-xs text-slate-500 dark:text-slate-400 max-w-[140px] text-right leading-snug">
                        Fixed dose
                      </div>
                    ) : (
                      <div>
                        <div className="font-mono font-black text-lg text-red-600 dark:text-red-400">
                          {result.mgDose} <span className="text-xs font-normal text-slate-400">mg</span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {FREQ_LABEL[drug.frequency] || drug.frequency}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Syrup volumes row — always visible for key formulations */}
                {!result.fixedDose && result.mlDoses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.mlDoses.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1"
                      >
                        <Drop size={10} className="text-blue-500 flex-shrink-0" />
                        <span className="font-mono text-xs">
                          <span className="font-bold text-blue-600 dark:text-blue-400">{m.ml} mL</span>
                          <span className="text-slate-400"> ({m.conc})</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {result.fixedDose && (
                  <div className="mt-2 font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded px-2 py-1">
                    {result.fixedDose}
                  </div>
                )}
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/80">

                  {/* Dose calculation breakdown */}
                  {!result.fixedDose && (
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-1.5">
                        Dose Calculation
                      </div>
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {drug.dosePerKg} mg/kg
                        </span>
                        <ArrowRight size={12} className="text-slate-400" />
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          × {weight} kg
                        </span>
                        <ArrowRight size={12} className="text-slate-400" />
                        <span className="font-mono font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                          {result.mgDose} mg / dose
                        </span>
                        {drug.max && (
                          <span className="text-xs text-slate-400">
                            (max {drug.max} mg)
                          </span>
                        )}
                      </div>
                      {drug.maxDaily && (
                        <div className="text-xs text-slate-400 mt-1">
                          Max daily: {drug.maxDaily} mg/day
                        </div>
                      )}
                    </div>
                  )}

                  {/* Formulations table */}
                  {drug.formulations && drug.formulations.length > 0 && (
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-1.5">
                        Available Indian Formulations
                      </div>
                      <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800">
                              <th className="text-left px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">Concentration</th>
                              {!result.fixedDose && <th className="text-left px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-blue-500">Volume / dose</th>}
                              <th className="text-left px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">Brands</th>
                            </tr>
                          </thead>
                          <tbody>
                            {drug.formulations.map((f, i) => {
                              const ml = f.mgPerMl && result.mgDose != null
                                ? +(result.mgDose / f.mgPerMl).toFixed(1)
                                : null;
                              return (
                                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 odd:bg-white dark:odd:bg-slate-900/30">
                                  <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-300">{f.conc}</td>
                                  {!result.fixedDose && (
                                    <td className="px-3 py-2">
                                      {ml != null ? (
                                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                          {ml} mL
                                        </span>
                                      ) : (
                                        <span className="text-slate-400">—</span>
                                      )}
                                    </td>
                                  )}
                                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                                    {f.brands.join(" · ")}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Frequency & route */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded px-2 py-1.5">
                      <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Frequency</div>
                      <div className="font-semibold">{FREQ_LABEL[drug.frequency] || drug.frequency}
                        {drug.frequencyHours && <span className="text-slate-400 font-normal"> (q{drug.frequencyHours}h)</span>}
                      </div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded px-2 py-1.5">
                      <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Route</div>
                      <div className="font-semibold">{drug.route}</div>
                    </div>
                    {drug.ageMin != null && (
                      <div className="bg-slate-100 dark:bg-slate-800 rounded px-2 py-1.5">
                        <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Min Age</div>
                        <div className="font-semibold">
                          {drug.ageMin === 0 ? "Neonate" : drug.ageMin < 12 ? `${drug.ageMin} months` : `${drug.ageMin / 12} years`}
                        </div>
                      </div>
                    )}
                    {drug.withFood !== undefined && (
                      <div className="bg-slate-100 dark:bg-slate-800 rounded px-2 py-1.5">
                        <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">With food?</div>
                        <div className={`font-semibold ${drug.withFood ? "text-emerald-600" : "text-slate-600 dark:text-slate-300"}`}>
                          {drug.withFood ? "Yes — give with food" : "No — empty stomach"}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clinical notes */}
                  {drug.notes && (
                    <div className="flex items-start gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <Info size={13} className="flex-shrink-0 mt-0.5 text-slate-400" />
                      <span>{drug.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer reference */}
      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        IAP Guidelines 2024 · Piyush Gupta Pediatric Drug Doses 18th Ed · Harriet Lane 22nd Ed · WHO AWaRe 2022
      </div>
    </div>
  );
}
