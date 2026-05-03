import { EQUIPMENT_ROWS } from "../../data/equipment";

export default function EquipmentTab() {
  const cols = [
    { k: "age", label: "Age" },
    { k: "weight", label: "Weight (kg)" },
    { k: "ett", label: "ETT (mm ID)" },
    { k: "depth", label: "Depth (cm)" },
    { k: "suction", label: "Suction (Fr)" },
    { k: "blade", label: "Laryngoscope" },
    { k: "lma", label: "LMA" },
    { k: "ngt", label: "NGT (Fr)" },
    { k: "iv", label: "IV" },
    { k: "defib", label: "Defib" },
  ];

  return (
    <div className="space-y-6">
      <BroselowTape />
      <div>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">Airway Equipment & Tubes</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Use Broselow tape or weight to select equipment. Cuffed tubes preferred in most patients &gt;1 year.
          Sizes are internal diameter (mm).
        </p>
      </div>

      <div data-testid="equipment-table-wrap" className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 dark:bg-slate-950 text-white">
              {cols.map((c) => (
                <th key={c.k} className="font-mono text-[10px] uppercase tracking-[0.15em] text-left p-3 font-bold whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EQUIPMENT_ROWS.map((r) => (
              <tr key={r.age} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                {cols.map((c) => {
                  const isNumeric = ["ett", "depth", "suction", "lma", "ngt", "iv", "defib"].includes(c.k);
                  let colorClass = "";
                  if (c.k === "ett") colorClass = "text-emerald-700 dark:text-emerald-400 font-bold";
                  else if (c.k === "defib") colorClass = "text-red-600 dark:text-red-400 font-bold";
                  return (
                    <td
                      key={c.k}
                      className={`p-3 whitespace-nowrap ${isNumeric ? "font-mono" : ""} ${colorClass}`}
                    >
                      {r[c.k]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">Formulas</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-sm">
          <div><span className="text-slate-500 dark:text-slate-400">ETT (uncuffed)</span> = (age/4) + 4</div>
          <div><span className="text-slate-500 dark:text-slate-400">ETT (cuffed)</span> = (age/4) + 3.5</div>
          <div><span className="text-slate-500 dark:text-slate-400">Depth (oral)</span> = (age/2) + 12</div>
          <div><span className="text-slate-500 dark:text-slate-400">Depth (nasal)</span> = (age/2) + 15</div>
          <div><span className="text-slate-500 dark:text-slate-400">Defibrillation</span> = 4 J/kg (mono/biphasic, up to 10 J/kg)</div>
          <div><span className="text-slate-500 dark:text-slate-400">Cardioversion</span> = 0.5–1 J/kg → 2 J/kg</div>
        </div>
      </div>
    </div>
  );
}
