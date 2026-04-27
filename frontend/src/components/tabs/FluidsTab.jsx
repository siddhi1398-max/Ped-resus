import { useState } from "react";
import { useWeight } from "../../context/WeightContext";
import { maintenanceFluid, maintenanceDaily, parklandBurns, DKA_PROTOCOL, FLUID_TYPES } from "../../data/fluids";
import { Input } from "../ui/input";
import DoseCard from "../DoseCard";

export default function FluidsTab() {
  const { weight } = useWeight();
  const [bsa, setBsa] = useState(10);

  const parkland = parklandBurns(weight, bsa);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">Fluid & Resuscitation</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Live calculations for <span className="font-mono font-bold">{weight} kg</span>. Maintenance, burns, DKA.
        </p>
      </div>

      <div>
        <h3 className="font-sans font-bold text-lg mb-3">Maintenance & Bolus</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <DoseCard testid="mf-hr" category="fluid" title="Maintenance (4-2-1)" value={maintenanceFluid(weight)} unit="mL/hr" />
          <DoseCard testid="mf-day" category="fluid" title="Daily (Holliday-Segar)" value={maintenanceDaily(weight)} unit="mL / 24 hr" />
          <DoseCard testid="bolus-20" category="fluid" title="Resuscitation bolus" value={weight * 20} unit="mL (20 mL/kg NS/LR)" />
          <DoseCard testid="bolus-10" category="fluid" title="Cautious bolus (DKA/cardiac)" value={weight * 10} unit="mL (10 mL/kg)" />
        </div>
      </div>

      <div>
        <h3 className="font-sans font-bold text-lg mb-3">Burns — Modified Parkland</h3>
        <div className="flex items-center gap-3 mb-3">
          <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            % BSA burned
          </label>
          <Input
            data-testid="bsa-input"
            type="number"
            min="1"
            max="100"
            value={bsa}
            onChange={(e) => setBsa(Math.min(100, Math.max(1, +e.target.value || 1)))}
            className="w-24 font-mono text-right"
          />
          <span className="font-mono text-sm text-slate-500 dark:text-slate-400">%</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <DoseCard testid="park-total" category="fluid" title="Total 24-hr fluid" value={parkland.total24.toFixed(0)} unit="mL (3 mL/kg/%BSA)" />
          <DoseCard testid="park-first8" category="fluid" title="First 8 hr (from burn)" value={parkland.first8.toFixed(0)} unit="mL" />
          <DoseCard testid="park-next16" category="fluid" title="Next 16 hr" value={parkland.next16.toFixed(0)} unit="mL" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Use Lactated Ringer's. Add maintenance fluids for children &lt; 30 kg. Time from burn, not from presentation.
        </p>
      </div>

      <div>
        <h3 className="font-sans font-bold text-lg mb-3">DKA Management Protocol</h3>
        <div className="space-y-2">
          {DKA_PROTOCOL.map((s, i) => (
            <div key={s.title} className="rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/50">
              <div className="flex gap-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-cyan-600 dark:text-cyan-400 w-6 pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{s.title}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{s.body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-sans font-bold text-lg mb-3">Fluid Types Reference</h3>
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Fluid</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Na⁺ (mmol/L)</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Cl⁻ (mmol/L)</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Use</th>
              </tr>
            </thead>
            <tbody>
              {FLUID_TYPES.map((f) => (
                <tr key={f.name} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                  <td className="p-3 font-bold">{f.name}</td>
                  <td className="p-3 font-mono">{f.na}</td>
                  <td className="p-3 font-mono">{f.cl}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{f.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
