import { useWeight } from "../../context/WeightContext";
import {
  APGAR_CRITERIA,
  APGAR_INTERPRETATION,
  NEONATAL_VITALS,
  SPO2_TARGETS_NRP,
  NRP_EQUIPMENT,
  NRP_PEARLS,
  nrpETTDepth,
  uvcDepth,
} from "../../data/neonatal";
import DoseCard from "../DoseCard";
import { Baby, Warning } from "@phosphor-icons/react";

const TONE_MAP = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900",
  amber: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900",
  red: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-900",
};

export default function NeonatalTab() {
  const { weight } = useWeight();
  const isNeonatal = weight <= 5;

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <Baby size={36} weight="fill" className="text-red-600 dark:text-red-400 flex-shrink-0" />
        <div>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight">Neonatal Resuscitation</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            NRP 2020 / Harriet Lane reference. Delivery-room flow in{" "}
            <span className="font-mono font-bold">Algorithms → Neonatal Resuscitation</span>.
          </p>
        </div>
      </div>

      {!isNeonatal && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-3">
          <Warning size={18} weight="fill" className="text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-800 dark:text-amber-200">
            Current weight <span className="font-mono font-bold">{weight} kg</span> is outside typical neonatal
            range (≤ 5 kg). Calculations below still use it.
          </span>
        </div>
      )}

      {/* Neonate-specific live doses */}
      <section>
        <h3 className="font-sans font-bold text-lg mb-3">Neonate-specific calculations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <DoseCard testid="neo-adren-iv" category="resuscitation" title="Adrenaline IV (NRP)" value={(weight * 0.02).toFixed(2)} unit="mg (0.01–0.03 mg/kg)" note="1:10,000 · 0.1–0.3 mL/kg" />
          <DoseCard testid="neo-adren-ett" category="resuscitation" title="Adrenaline ETT (NRP)" value={(weight * 0.075).toFixed(2)} unit="mg (0.05–0.1 mg/kg)" note="Only if no IV. 1:10,000 0.5–1 mL/kg" />
          <DoseCard testid="neo-volume" category="fluid" title="Volume expander" value={(weight * 10).toFixed(0)} unit="mL (10 mL/kg NS)" note="Over 5–10 min IV/UVC" />
          <DoseCard testid="neo-d10" category="fluid" title="D10W hypoglycaemia" value={(weight * 2).toFixed(0)} unit="mL (2 mL/kg)" note="Treat if glucose < 40 mg/dL" />
          <DoseCard testid="neo-ett" category="airway" title="ETT size" value={weight < 1 ? "2.5" : weight < 2 ? "3.0" : weight < 3 ? "3.0–3.5" : "3.5"} unit="mm ID (uncuffed)" />
          <DoseCard testid="neo-ett-depth" category="airway" title="ETT depth (6 + wt)" value={nrpETTDepth(weight)} unit="cm from upper lip" />
          <DoseCard testid="neo-uvc" category="airway" title="UVC depth" value={uvcDepth(weight)} unit="cm (1.5×wt + 5.5)" note="Emergency low placement: 3–5 cm" />
          <DoseCard testid="neo-phenobarb" category="anticonvulsant" title="Phenobarbital load" value={(weight * 20).toFixed(0)} unit="mg IV (20 mg/kg)" note="Neonatal seizure 1st line" />
          <DoseCard testid="neo-caffeine" category="other" title="Caffeine citrate load" value={(weight * 20).toFixed(0)} unit="mg IV/PO (20 mg/kg)" note="Apnoea of prematurity" />
          <DoseCard testid="neo-vitk" category="other" title="Vitamin K IM" value={weight < 1.5 ? "0.5" : "1.0"} unit="mg IM at birth" note="VKDB prophylaxis" />
        </div>
      </section>

      {/* APGAR */}
      <section>
        <h3 className="font-sans font-bold text-lg mb-3">APGAR Score</h3>
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Criterion</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">0 points</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">1 point</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">2 points</th>
              </tr>
            </thead>
            <tbody>
              {APGAR_CRITERIA.map((r) => (
                <tr key={r.criterion} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                  <td className="p-3 font-bold">{r.criterion}</td>
                  <td className="p-3">{r.s0}</td>
                  <td className="p-3">{r.s1}</td>
                  <td className="p-3">{r.s2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
          {APGAR_INTERPRETATION.map((i) => (
            <div key={i.score} className={`rounded-md border px-3 py-2 ${TONE_MAP[i.tone]}`}>
              <div className="font-mono text-xs uppercase tracking-widest">Score {i.score}</div>
              <div className="font-bold text-sm mt-0.5">{i.label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Assess at 1 and 5 min. If 5-min score &lt; 7, reassess every 5 min up to 20 min. APGAR does NOT guide
          resuscitation decisions — those are based on HR, tone, respiration in real time.
        </p>
      </section>

      {/* Neonatal vitals */}
      <section>
        <h3 className="font-sans font-bold text-lg mb-3">Neonatal Normal Vitals</h3>
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Parameter</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Normal</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Red flags</th>
              </tr>
            </thead>
            <tbody>
              {NEONATAL_VITALS.map((r) => (
                <tr key={r.param} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                  <td className="p-3 font-bold">{r.param}</td>
                  <td className="p-3 font-mono">{r.awake}</td>
                  <td className="p-3 text-red-600 dark:text-red-400 text-xs">{r.alert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SpO2 NRP targets + Equipment */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-sans font-bold text-lg mb-3">Preductal SpO₂ Targets (NRP)</h3>
          <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Time after birth</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Target SpO₂</th>
                </tr>
              </thead>
              <tbody>
                {SPO2_TARGETS_NRP.map((s) => (
                  <tr key={s.time} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                    <td className="p-3 font-mono">{s.time}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{s.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Right-hand pulse oximetry. Titrate FiO₂ to target.
          </p>
        </div>
        <div>
          <h3 className="font-sans font-bold text-lg mb-3">NRP Equipment by Weight</h3>
          <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Weight</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">ETT</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Depth</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Mask</th>
                </tr>
              </thead>
              <tbody>
                {NRP_EQUIPMENT.map((e) => (
                  <tr key={e.weight} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                    <td className="p-3 font-bold">{e.weight}</td>
                    <td className="p-3 font-mono text-emerald-700 dark:text-emerald-400">{e.ett}</td>
                    <td className="p-3 font-mono">{e.depth}</td>
                    <td className="p-3">{e.mask}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pearls */}
      <section>
        <h3 className="font-sans font-bold text-lg mb-3">Key NRP Pearls</h3>
        <ul className="space-y-2">
          {NRP_PEARLS.map((p) => (
            <li key={p} className="flex gap-3 rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/50">
              <span className="font-mono text-red-600 dark:text-red-400 text-sm font-bold">·</span>
              <span className="text-sm text-slate-700 dark:text-slate-200">{p}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="text-xs text-slate-500 dark:text-slate-400 italic">
        Source: NRP 2020 guidelines · Harriet Lane Handbook 23rd ed. · Reference only; verify with local protocols.
      </div>
    </div>
  );
}
