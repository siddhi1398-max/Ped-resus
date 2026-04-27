import { useState } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  maintenanceFluid,
  maintenanceDaily,
  parklandBurns,
  DKA_PROTOCOL,
  FLUID_TYPES,
  estimatedBloodVolume,
  ebvPerKgForWeight,
  allowableBloodLoss,
  npoDeficit,
  LOCAL_ANAESTHETICS,
  TRANSFUSION_NOTES,
  EBV_TABLE,
} from "../../data/fluids";
import { Input } from "../ui/input";
import DoseCard from "../DoseCard";

export default function FluidsTab() {
  const { weight } = useWeight();
  const [bsa, setBsa] = useState(10);
  const [hgbStart, setHgbStart] = useState(12);
  const [hgbMin, setHgbMin] = useState(7);
  const [hoursNPO, setHoursNPO] = useState(6);

  const parkland = parklandBurns(weight, bsa);
  const ebv = estimatedBloodVolume(weight);
  const abl = allowableBloodLoss(weight, hgbStart, hgbMin);
  const deficit = npoDeficit(weight, hoursNPO);

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

      {/* ─── Peri-op / ED calculations ─────────────────────────────── */}
      <div className="pt-2 border-t-2 border-slate-900 dark:border-white">
        <div className="flex items-baseline justify-between mb-4 mt-6">
          <h3 className="font-sans font-bold text-xl tracking-tight">Peri-operative / ED Calculations</h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">PASNA-inspired</span>
        </div>

        {/* EBV card + table */}
        <div>
          <h4 className="font-sans font-bold text-base mb-2">Estimated Blood Volume (EBV)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DoseCard testid="ebv-card" category="resuscitation" title={`EBV · ${weight} kg`} value={ebv.toFixed(0)} unit={`mL (${ebvPerKgForWeight(weight)} mL/kg)`} note="Age-adjusted per peri-op reference" />
            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                    <th className="p-2 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Age band</th>
                    <th className="p-2 text-left font-mono text-[10px] uppercase tracking-[0.15em]">mL/kg</th>
                  </tr>
                </thead>
                <tbody>
                  {EBV_TABLE.map((e) => (
                    <tr key={e.group} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                      <td className="p-2">{e.group}</td>
                      <td className="p-2 font-mono font-bold">{e.mlPerKg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Allowable Blood Loss */}
        <div className="mt-5">
          <h4 className="font-sans font-bold text-base mb-2">Allowable Blood Loss (ABL)</h4>
          <div className="flex flex-wrap gap-3 items-end mb-3">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Starting Hgb (g/dL)</span>
              <Input
                data-testid="hgb-start"
                type="number"
                step="0.1"
                min="4"
                max="22"
                value={hgbStart}
                onChange={(e) => setHgbStart(Math.max(4, Math.min(22, +e.target.value || 4)))}
                className="w-28 font-mono text-right"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Minimum acceptable Hgb</span>
              <Input
                data-testid="hgb-min"
                type="number"
                step="0.1"
                min="4"
                max="20"
                value={hgbMin}
                onChange={(e) => setHgbMin(Math.max(4, Math.min(20, +e.target.value || 4)))}
                className="w-28 font-mono text-right"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DoseCard testid="abl-card" category="resuscitation" title="Allowable Blood Loss" value={abl.toFixed(0)} unit="mL (before transfusion)" />
            <DoseCard testid="abl-formula" category="other" title="Formula" value="EBV × ΔHgb / Hgb̄" unit={`${ebv.toFixed(0)} × ${(hgbStart - hgbMin).toFixed(1)} / ${((hgbStart + hgbMin) / 2).toFixed(1)}`} />
            <DoseCard testid="transfuse-thresh" category="resuscitation" title="pRBC transfuse" value="Hb < 7" unit="g/dL (stable child)" note="< 8–9 if cardiac / critical" />
          </div>
        </div>

        {/* NPO deficit */}
        <div className="mt-5">
          <h4 className="font-sans font-bold text-base mb-2">NPO Fluid Deficit</h4>
          <div className="flex flex-wrap gap-3 items-end mb-3">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Hours NPO</span>
              <Input
                data-testid="hours-npo"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={hoursNPO}
                onChange={(e) => setHoursNPO(Math.max(0, Math.min(24, +e.target.value || 0)))}
                className="w-28 font-mono text-right"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DoseCard testid="npo-deficit" category="fluid" title="Total NPO deficit" value={deficit.toFixed(0)} unit="mL (hours × 4-2-1)" />
            <DoseCard testid="npo-replace-1" category="fluid" title="1st hour replace" value={(deficit / 2).toFixed(0)} unit="mL + maintenance" note="Holliday-Segar replacement: 50% in 1st hr" />
            <DoseCard testid="npo-replace-2" category="fluid" title="Hours 2–3 replace" value={(deficit / 4).toFixed(0)} unit="mL/hr + maintenance" note="25% per hour × 2 hours" />
          </div>
        </div>

        {/* Local anaesthetic maxes */}
        <div className="mt-5">
          <h4 className="font-sans font-bold text-base mb-2">Local Anaesthetic — Max Safe Dose</h4>
          <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Agent</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">mg/kg</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Max mg</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Max for {weight} kg</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Concentration</th>
                </tr>
              </thead>
              <tbody>
                {LOCAL_ANAESTHETICS.map((la) => {
                  const maxMg = Math.min(weight * la.mgPerKg, la.max);
                  return (
                    <tr key={la.name} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                      <td className="p-3 font-bold">{la.name}</td>
                      <td className="p-3 font-mono">{la.mgPerKg}</td>
                      <td className="p-3 font-mono">{la.max}</td>
                      <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">{maxMg.toFixed(1)} mg</td>
                      <td className="p-3 font-mono text-xs text-slate-500 dark:text-slate-400">{la.concentration}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Total dose includes any infiltrated during the case. Bupivacaine cardiotoxicity — have 20% intralipid
            available (1.5 mL/kg bolus, then 0.25 mL/kg/min).
          </p>
        </div>

        {/* Transfusion quick-ref */}
        <div className="mt-5">
          <h4 className="font-sans font-bold text-base mb-2">Transfusion Quick Reference</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TRANSFUSION_NOTES.map((t) => (
              <div key={t.label} className="rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/50 flex items-baseline gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 min-w-[40%]">
                  {t.label}
                </span>
                <span className="font-mono text-sm font-bold text-red-600 dark:text-red-400">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
