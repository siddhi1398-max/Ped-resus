import { useState } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  maintenanceFluid, maintenanceDaily,
  parklandBurns, DKA_PROTOCOL, FLUID_TYPES,
  estimatedBloodVolume, ebvPerKgForWeight, allowableBloodLoss, npoDeficit, TRANSFUSION_NOTES, EBV_TABLE,
  DEHYDRATION_ASSESSMENT, DEHYDRATION_PLAN,
  orsVolumePlanB, orsRatePerHour, orsAfterStool, ORS_COMPOSITION,
  DIARRHOEA_DANGER_SIGNS, ANTIBIOTIC_INDICATIONS,
  SHOCK_TYPES, SHOCK_IDENTIFICATION, SHOCK_VITALS_THRESHOLDS, SHOCK_MANAGEMENT, SHOCK_ENDPOINTS,
} from "../../data/fluids";
import { Input } from "../ui/input";
import DoseCard from "../DoseCard";
import {
  Warning, CheckCircle, ArrowRight, CaretDown, Info,
  Drop, Toilet, Pill, Fire, Lightning, Hospital,
  MagnifyingGlass, PintGlass, Syringe, ChartBar,
  Ruler, Target, Heartbeat, Gauge, FirstAid,
} from "@phosphor-icons/react";

// ─── COLOUR MAPS ──────────────────────────────────────────────────────────────
const CMAP = {
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-300 dark:border-emerald-700", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-300 dark:border-amber-700",     text: "text-amber-700 dark:text-amber-300",   badge: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" },
  red:     { bg: "bg-red-50 dark:bg-red-950/30",         border: "border-red-300 dark:border-red-700",         text: "text-red-700 dark:text-red-300",       badge: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" },
  orange:  { bg: "bg-orange-50 dark:bg-orange-950/30",   border: "border-orange-300 dark:border-orange-700",   text: "text-orange-700 dark:text-orange-300", badge: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300" },
  violet:  { bg: "bg-violet-50 dark:bg-violet-950/30",   border: "border-violet-300 dark:border-violet-700",   text: "text-violet-700 dark:text-violet-300", badge: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300" },
  sky:     { bg: "bg-sky-50 dark:bg-sky-950/30",         border: "border-sky-300 dark:border-sky-700",         text: "text-sky-700 dark:text-sky-300",       badge: "bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300" },
};

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
function SectionToggle({ title, IconComp, children, defaultOpen = false, accent }) {
  const [open, setOpen] = useState(defaultOpen);
  const c = CMAP[accent] || {};
  return (
    <div className={`border rounded-xl overflow-hidden ${accent ? c.border : "border-slate-200 dark:border-slate-700"}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${accent ? c.bg : "bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
      >
        <div className="flex items-center gap-2">
          {IconComp && <IconComp size={15} weight="bold" className={`flex-shrink-0 ${accent ? c.text : "text-slate-400"}`} />}
          <span className={`font-bold text-sm ${accent ? c.text : "text-slate-900 dark:text-white"}`}
                style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{title}</span>
        </div>
        <CaretDown size={13} weight="bold"
          className={`transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""} ${accent ? c.text : "text-slate-400"}`} />
      </button>
      {open && <div className="px-4 py-4 bg-white dark:bg-slate-900/50">{children}</div>}
    </div>
  );
}

function BulletList({ items, color = "slate" }) {
  const dot = color === "emerald" ? "text-emerald-500" : color === "red" ? "text-red-400" : color === "amber" ? "text-amber-500" : "text-slate-400";
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
          <ArrowRight size={11} weight="bold" className={`${dot} flex-shrink-0 mt-0.5`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DataRow({ label, value, highlight }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${highlight ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"}`}>
      <span className="font-mono uppercase tracking-wider text-[10px] opacity-70">{label}</span>
      <span className="font-bold text-sm">{value}</span>
    </div>
  );
}

// ─── SUB-TAB: MAINTENANCE ─────────────────────────────────────────────────────
function MaintenanceSection({ weight }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-base mb-3" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Maintenance & Bolus</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <DoseCard testid="mf-hr"    category="fluid" title="Maintenance (4-2-1)"          value={maintenanceFluid(weight)} unit="mL/hr" />
          <DoseCard testid="mf-day"   category="fluid" title="Daily (Holliday-Segar)"       value={maintenanceDaily(weight)} unit="mL / 24 hr" />
          <DoseCard testid="bolus-20" category="fluid" title="Resuscitation bolus"          value={weight * 20}              unit="mL (20 mL/kg NS/LR)" />
          <DoseCard testid="bolus-10" category="fluid" title="Cautious bolus (DKA/cardiac)" value={weight * 10}              unit="mL (10 mL/kg)" />
        </div>
      </div>
      <div>
        <h3 className="font-bold text-base mb-3" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Fluid Types Reference</h3>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="p-3 text-left font-mono text-[9px] uppercase tracking-[0.15em]">Fluid</th>
                <th className="p-3 text-left font-mono text-[9px] uppercase tracking-[0.15em]">Na⁺</th>
                <th className="p-3 text-left font-mono text-[9px] uppercase tracking-[0.15em]">Cl⁻</th>
                <th className="p-3 text-left font-mono text-[9px] uppercase tracking-[0.15em]">Use</th>
              </tr>
            </thead>
            <tbody>
              {FLUID_TYPES.map((f) => (
                <tr key={f.name} className="border-t border-slate-100 dark:border-slate-800 odd:bg-white dark:odd:bg-slate-900/30">
                  <td className="p-3 font-semibold">{f.name}</td>
                  <td className="p-3 font-mono">{f.na}</td>
                  <td className="p-3 font-mono">{f.cl}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{f.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── SUB-TAB: DIARRHOEA ───────────────────────────────────────────────────────
function DiarrhoeaSection({ weight }) {
  const [plan, setPlan] = useState("some");
  const p = DEHYDRATION_PLAN[plan];
  const c = CMAP[p.color];

  return (
    <div className="space-y-5">
      <SectionToggle title="Dehydration Assessment (WHO / IAP)" IconComp={MagnifyingGlass} defaultOpen={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800">Feature</th>
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">No dehydration</th>
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-950/40">Some (5–9%)</th>
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-950/40">Severe (≥ 10%)</th>
              </tr>
            </thead>
            <tbody>
              {DEHYDRATION_ASSESSMENT.map((row, i) => (
                <tr key={row.feature} className={`border-t border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? "bg-white dark:bg-slate-900/20" : "bg-slate-50/50 dark:bg-slate-900/40"}`}>
                  <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-200">{row.feature}</td>
                  <td className="p-2.5 text-emerald-700 dark:text-emerald-300">{row.none}</td>
                  <td className="p-2.5 text-amber-700 dark:text-amber-300">{row.some}</td>
                  <td className="p-2.5 text-red-700 dark:text-red-300 font-semibold">{row.severe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-slate-400 font-mono mt-2">
          Diagnose dehydration if ≥ 2 features of a column are present. Severe dehydration if any ONE severe feature. — IAP 2016 / WHO IMCI
        </p>
      </SectionToggle>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">Select Treatment Plan</div>
        <div className="flex gap-2">
          {[
            { id: "none",   label: "Plan A — No dehydration",  color: "emerald" },
            { id: "some",   label: "Plan B — Some dehydration", color: "amber" },
            { id: "severe", label: "Plan C — Severe / IV",      color: "red" },
          ].map(pl => {
            const cm = CMAP[pl.color];
            return (
              <button key={pl.id} onClick={() => setPlan(pl.id)}
                className={`flex-1 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-center ${plan === pl.id ? `${cm.badge} border-transparent shadow-sm` : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"}`}
                style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                {pl.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`rounded-xl border-2 p-4 space-y-4 ${c.border} ${c.bg}`}>
        <div className={`font-bold text-lg ${c.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          {p.label} — {p.plan}
        </div>

        {plan === "some" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <DataRow label="Total ORS (Plan B)" value={`${orsVolumePlanB(weight)} mL`} highlight />
            <DataRow label="Over 4 hours"       value={`${orsRatePerHour(weight)} mL/hr`} />
            <DataRow label="Per stool (top-up)" value={`${orsAfterStool(weight)} mL`} />
            <DataRow label="Weight"             value={`${weight} kg`} />
          </div>
        )}

        {plan === "severe" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <DataRow label="Shock bolus"   value={`${weight * 20} mL`} highlight />
            <DataRow label="(20 mL/kg NS)" value="over 15–30 min" />
            <DataRow label="Repeat up to"  value={`${weight * 60} mL total`} />
          </div>
        )}

        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">Management Steps</div>
          <div className="space-y-1.5">
            {p.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5 ${c.badge}`}>{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-lg border p-3 ${c.border}`} style={{ background: "rgba(0,0,0,0.03)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Hospital size={12} weight="bold" className="text-slate-400" />
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400">Discharge / Home Care Instructions</span>
          </div>
          <div className="space-y-1">
            {p.discharge.map((d, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                <CheckCircle size={12} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionToggle title="ORS Composition (WHO Low-Osmolarity)" IconComp={PintGlass}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">WHO 2003 (recommended)</div>
            {[
              { label: "Na⁺",        value: "75 mmol/L"  },
              { label: "K⁺",         value: "20 mmol/L"  },
              { label: "Cl⁻",        value: "65 mmol/L"  },
              { label: "Citrate",    value: "10 mmol/L"  },
              { label: "Glucose",    value: "75 mmol/L"  },
              { label: "Osmolarity", value: "245 mOsm/L" },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs px-3 py-1.5 rounded bg-slate-50 dark:bg-slate-800">
                <span className="font-mono text-slate-500">{r.label}</span>
                <span className="font-bold">{r.value}</span>
              </div>
            ))}
            <div className="text-[10px] text-slate-400 mt-1">{ORS_COMPOSITION.who.note}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">Home-made ORS (when sachets unavailable)</div>
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200">
              <div className="font-bold mb-2">Recipe per 1 litre clean water:</div>
              <div>· 6 level teaspoons of sugar</div>
              <div>· ½ level teaspoon of salt</div>
              <div className="mt-2 text-[10px] opacity-70">Boil water, cool before use. Discard after 24 hours.</div>
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">Danger signs — return immediately</div>
              <div className="space-y-1">
                {DIARRHOEA_DANGER_SIGNS.map((d, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-700 dark:text-red-300">
                    <Warning size={10} weight="fill" className="flex-shrink-0 mt-0.5 text-red-500" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionToggle>

      <SectionToggle title="Antibiotic Indications" IconComp={Pill}>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="p-3 text-left font-mono text-[9px] uppercase tracking-widest">Condition</th>
                <th className="p-3 text-left font-mono text-[9px] uppercase tracking-widest">Drug / Dose</th>
                <th className="p-3 text-left font-mono text-[9px] uppercase tracking-widest">Note</th>
              </tr>
            </thead>
            <tbody>
              {ANTIBIOTIC_INDICATIONS.map((a, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 odd:bg-white dark:odd:bg-slate-900/30">
                  <td className="p-3 font-semibold">{a.condition}</td>
                  <td className="p-3 font-mono text-amber-700 dark:text-amber-300">{a.drug}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{a.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-500">
          <Info size={12} className="flex-shrink-0 mt-0.5 text-slate-400" />
          Antibiotics are NOT recommended for routine watery diarrhoea. ORS + Zinc is the cornerstone of treatment. — IAP 2016, WHO IMCI
        </div>
      </SectionToggle>
    </div>
  );
}

// ─── SUB-TAB: DKA ─────────────────────────────────────────────────────────────
function DkaSection({ weight }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-xs text-red-800 dark:text-red-200">
        <Warning size={13} weight="fill" className="flex-shrink-0 mt-0.5 text-red-500" />
        <span>DKA carries a 0.5–1% risk of cerebral oedema — most common cause of DKA mortality in children. Avoid rapid fluid shifts. Do not give insulin bolus.</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DoseCard testid="dka-bolus" category="fluid" title="Initial bolus (if shocked)"  value={weight * 10}  unit="mL 0.9% NaCl" />
        <DoseCard testid="dka-def5"  category="fluid" title="5% deficit"                 value={weight * 50}  unit="mL total" />
        <DoseCard testid="dka-def7"  category="fluid" title="7% deficit (moderate)"      value={weight * 70}  unit="mL total" />
        <DoseCard testid="dka-def10" category="fluid" title="10% deficit (severe)"       value={weight * 100} unit="mL total" />
      </div>
      <p className="text-[10px] font-mono text-slate-400">All deficits replaced over 48 hours. Subtract any resuscitation boluses already given.</p>
      <div className="space-y-2">
        {DKA_PROTOCOL.map((s, i) => (
          <div key={s.title} className={`rounded-xl border p-4 ${s.title.includes("RED") ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50"}`}>
            <div className="flex gap-3">
              <div className={`font-mono text-[10px] uppercase tracking-widest w-6 pt-0.5 ${s.title.includes("RED") ? "text-red-500" : "text-cyan-600 dark:text-cyan-400"}`}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1">
                <div className={`font-bold text-sm ${s.title.includes("RED") ? "text-red-700 dark:text-red-300" : ""}`}
                     style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{s.title}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{s.body}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SUB-TAB: BURNS ───────────────────────────────────────────────────────────
function BurnsSection({ weight }) {
  const [bsa, setBsa] = useState(10);
  const parkland = parklandBurns(weight, bsa);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">% BSA burned</label>
        <Input type="number" min="1" max="100" value={bsa}
          onChange={(e) => setBsa(Math.min(100, Math.max(1, +e.target.value || 1)))}
          className="w-24 font-mono text-right" />
        <span className="font-mono text-sm text-slate-500">%</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DoseCard testid="park-total"  category="fluid" title="Total 24-hr fluid"       value={parkland.total24.toFixed(0)} unit="mL (3 mL/kg/%BSA)" />
        <DoseCard testid="park-first8" category="fluid" title="First 8 hr (from burn)"  value={parkland.first8.toFixed(0)}  unit="mL" />
        <DoseCard testid="park-next16" category="fluid" title="Next 16 hr"              value={parkland.next16.toFixed(0)}  unit="mL" />
      </div>
      <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs text-amber-800 dark:text-amber-200 space-y-1.5">
        <div className="font-bold text-sm mb-2" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Important notes</div>
        {[
          "Use Lactated Ringer's (preferred) or 0.9% NaCl",
          "Add MAINTENANCE fluids for children < 30 kg (above and beyond Parkland volume)",
          "Time from burn injury, not from hospital presentation",
          "Reassess hourly: target urine output 0.5–1 mL/kg/hr (infants 1–2 mL/kg/hr)",
          "Do NOT give colloid in first 8 hours (capillary leak phase)",
          "Albumin 5% (0.5 mL/kg/%BSA) may be added from 8–24 hr if oedema worsening",
          "Burns > 15% BSA: IV access mandatory. Consider urinary catheter for output monitoring.",
        ].map((note, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <ArrowRight size={11} weight="bold" className="text-amber-600 flex-shrink-0 mt-0.5" />
            <span>{note}</span>
          </div>
        ))}
      </div>
      <SectionToggle title="Lund-Browder Chart (paediatric BSA estimation)" IconComp={Ruler}>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest">Area</th>
                {["<1 yr","1 yr","5 yr","10 yr","Adult"].map(h => <th key={h} className="p-2.5 text-center font-mono text-[9px] uppercase tracking-widest">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["Head",          "19%","17%","13%","11%","7%"    ],
                ["Neck",           "2%", "2%", "2%", "2%","2%"    ],
                ["Trunk (ant)",   "13%","13%","13%","13%","13%"   ],
                ["Trunk (post)",  "13%","13%","13%","13%","13%"   ],
                ["Each arm",       "4%", "4%", "4%", "4%","4%"    ],
                ["Each thigh",     "3%", "4%", "4%", "4%","4%"    ],
                ["Each lower leg", "2%", "3%", "3%", "3%","3%"    ],
                ["Each foot",      "3%", "3%","3.5%","3.5%","3.5%"],
              ].map(([area, ...vals], i) => (
                <tr key={area} className={`border-t border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? "bg-white dark:bg-slate-900/20" : "bg-slate-50/50 dark:bg-slate-900/40"}`}>
                  <td className="p-2.5 font-semibold">{area}</td>
                  {vals.map((v, j) => <td key={j} className="p-2.5 text-center font-mono">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionToggle>
    </div>
  );
}

// ─── SUB-TAB: SHOCK ───────────────────────────────────────────────────────────
function ShockSection({ weight }) {
  const [shockType, setShockType] = useState("hypovolaemic");
  const [shockView, setShockView] = useState("identify");
  const st = SHOCK_TYPES.find(s => s.id === shockType);
  const c  = CMAP[st.color];
  const fluidDose = SHOCK_MANAGEMENT.fluids[
    shockType === "distributive" ? "septic"     :
    shockType === "cardiogenic"  ? "cardiogenic" :
    shockType === "obstructive"  ? "obstructive" : "hypovolaemic"
  ];

  const shockViews = [
    { id: "identify",   label: "1. Identification",      Icon: MagnifyingGlass },
    { id: "initial",    label: "2. Initial Management",  Icon: Lightning       },
    { id: "definitive", label: "3. Definitive Treatment",Icon: Target          },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {shockViews.map(v => (
          <button key={v.id} onClick={() => setShockView(v.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
              shockView === v.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>
            <v.Icon size={13} weight="bold" />
            {v.label}
          </button>
        ))}
      </div>

      {shockView === "identify" && (
        <div className="space-y-4">
          <SectionToggle title="Age-Specific Vital Sign Thresholds" IconComp={ChartBar} defaultOpen={true}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                    <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest">Age</th>
                    <th className="p-2.5 text-center font-mono text-[9px] uppercase tracking-widest text-red-400">HR High</th>
                    <th className="p-2.5 text-center font-mono text-[9px] uppercase tracking-widest text-blue-400">HR Low</th>
                    <th className="p-2.5 text-center font-mono text-[9px] uppercase tracking-widest text-amber-400">SBP Low</th>
                    <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {SHOCK_VITALS_THRESHOLDS.map((r, i) => (
                    <tr key={r.age} className={`border-t border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? "bg-white dark:bg-slate-900/20" : "bg-slate-50/50 dark:bg-slate-900/40"}`}>
                      <td className="p-2.5 font-bold">{r.age}</td>
                      <td className="p-2.5 text-center font-mono text-red-600 dark:text-red-400">&gt;{r.hrHigh}</td>
                      <td className="p-2.5 text-center font-mono text-blue-600 dark:text-blue-400">&lt;{r.hrLow}</td>
                      <td className="p-2.5 text-center font-mono text-amber-600 dark:text-amber-400">&lt;{r.sbpLow}</td>
                      <td className="p-2.5 text-slate-500 dark:text-slate-400">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-2">
              PALS 2020: SBP threshold = 70 + (2 × age in years) mmHg. Tachycardia is the most sensitive early sign.
            </p>
          </SectionToggle>

          <div className="grid sm:grid-cols-2 gap-4">
            {Object.values(SHOCK_IDENTIFICATION).map(si => {
              const sc = CMAP[si.color];
              return (
                <div key={si.label} className={`rounded-xl border-2 p-4 ${sc.border} ${sc.bg}`}>
                  <div className={`font-bold text-sm mb-1 ${sc.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{si.label}</div>
                  <div className={`text-[10px] font-mono mb-3 ${sc.text} opacity-80`}>{si.definition}</div>
                  <div className="space-y-1">
                    {si.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-200">
                        <ArrowRight size={11} weight="bold" className={`${sc.text} flex-shrink-0 mt-0.5`} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">Shock Type — Causes</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {SHOCK_TYPES.map(s => {
                const cm = CMAP[s.color];
                return (
                  <button key={s.id} onClick={() => setShockType(s.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${shockType === s.id ? `${cm.badge} border-transparent` : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"}`}>
                    {s.label}
                  </button>
                );
              })}
            </div>
            <div className={`rounded-xl border p-3 ${c.border} ${c.bg}`}>
              <div className="flex flex-wrap gap-2">
                {st.causes.map((cause, i) => (
                  <span key={i} className={`text-[11px] px-2.5 py-1 rounded-lg ${c.badge}`}>{cause}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {shockView === "initial" && (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">Shock Type</div>
            <div className="flex flex-wrap gap-2">
              {SHOCK_TYPES.map(s => {
                const cm = CMAP[s.color];
                return (
                  <button key={s.id} onClick={() => setShockType(s.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${shockType === s.id ? `${cm.badge} border-transparent` : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"}`}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <SectionToggle title="Immediate Simultaneous Actions" IconComp={Lightning} defaultOpen={true} accent="red">
            <div className="space-y-1.5">
              {SHOCK_MANAGEMENT.initial.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </SectionToggle>

          <div className={`rounded-xl border-2 p-4 ${c.border} ${c.bg}`}>
            <div className={`font-bold text-sm mb-1 ${c.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Fluid Strategy — {st.label} Shock
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <DataRow label="Bolus"      value={`${weight * 20} mL`} highlight />
              <DataRow label="20 mL/kg"   value={shockType === "cardiogenic" ? "5–10 mL/kg cautious" : "over 5–15 min"} />
              <DataRow label="Max 1st hr" value={shockType === "cardiogenic" || shockType === "obstructive" ? "Treat cause first" : `${weight * 60} mL`} />
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed border-l-2 border-current pl-3">{fluidDose}</p>
          </div>

          {shockType === "distributive" && (
            <SectionToggle title="Empiric Antibiotics (Septic Shock)" IconComp={Syringe} defaultOpen={true} accent="orange">
              <BulletList items={SHOCK_MANAGEMENT.antibiotics} />
            </SectionToggle>
          )}
        </div>
      )}

      {shockView === "definitive" && (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-3">Vasoactive / Inotropic Drugs</div>
            <div className="space-y-2">
              {SHOCK_MANAGEMENT.vasoactives.map((v, i) => (
                <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <div className="font-bold text-sm text-slate-900 dark:text-white"
                         style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{v.drug}</div>
                    <span className="font-mono text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 px-2 py-0.5 rounded">{v.dose}</span>
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300 mb-1">{v.indication}</div>
                  <div className="text-[10px] text-slate-400">{v.note}</div>
                </div>
              ))}
            </div>
          </div>

          <SectionToggle title="Definitive / Cause-Specific Treatment" IconComp={Target} defaultOpen={true}>
            <BulletList items={SHOCK_MANAGEMENT.definitive} />
          </SectionToggle>

          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gauge size={13} weight="bold" className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
                Resuscitation Endpoints — Goals of Treatment
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {SHOCK_ENDPOINTS.map((ep, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                  <CheckCircle size={12} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  {ep}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SUB-TAB: PERI-OP ─────────────────────────────────────────────────────────
function PeriOpSection({ weight }) {
  const [hgbStart, setHgbStart] = useState(12);
  const [hgbMin,   setHgbMin]   = useState(7);
  const [hoursNPO, setHoursNPO] = useState(6);
  const ebv     = estimatedBloodVolume(weight);
  const abl     = allowableBloodLoss(weight, hgbStart, hgbMin);
  const deficit = npoDeficit(weight, hoursNPO);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-base mb-2" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Estimated Blood Volume (EBV)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DoseCard testid="ebv-card" category="resuscitation" title={`EBV · ${weight} kg`}
            value={ebv.toFixed(0)} unit={`mL (${ebvPerKgForWeight(weight)} mL/kg)`}
            note="Age-adjusted per PASNA peri-op reference" />
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                  <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest">Age band</th>
                  <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest">mL/kg</th>
                </tr>
              </thead>
              <tbody>
                {EBV_TABLE.map((e) => (
                  <tr key={e.group} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                    <td className="p-2.5">{e.group}</td>
                    <td className="p-2.5 font-mono font-bold">{e.mlPerKg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-base mb-2" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Allowable Blood Loss (ABL)</h3>
        <div className="flex flex-wrap gap-3 items-end mb-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Starting Hgb (g/dL)</span>
            <Input type="number" step="0.1" min="4" max="22" value={hgbStart}
              onChange={(e) => setHgbStart(Math.max(4, Math.min(22, +e.target.value || 4)))}
              className="w-28 font-mono text-right" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Minimum acceptable Hgb</span>
            <Input type="number" step="0.1" min="4" max="20" value={hgbMin}
              onChange={(e) => setHgbMin(Math.max(4, Math.min(20, +e.target.value || 4)))}
              className="w-28 font-mono text-right" />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <DoseCard testid="abl-card"         category="resuscitation" title="Allowable Blood Loss" value={abl.toFixed(0)} unit="mL (before transfusion)" />
          <DoseCard testid="abl-formula"      category="other"         title="Formula"              value="EBV × ΔHgb / Hgb̄" unit={`${ebv.toFixed(0)} × ${(hgbStart - hgbMin).toFixed(1)} / ${((hgbStart + hgbMin) / 2).toFixed(1)}`} />
          <DoseCard testid="transfuse-thresh" category="resuscitation" title="pRBC transfuse"       value="Hb < 7" unit="g/dL (stable child)" note="< 8–9 if cardiac / critical" />
        </div>
      </div>

      <div>
        <h3 className="font-bold text-base mb-2" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>NPO Fluid Deficit</h3>
        <div className="flex flex-wrap gap-3 items-end mb-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Hours NPO</span>
            <Input type="number" step="0.5" min="0" max="24" value={hoursNPO}
              onChange={(e) => setHoursNPO(Math.max(0, Math.min(24, +e.target.value || 0)))}
              className="w-28 font-mono text-right" />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <DoseCard testid="npo-deficit"   category="fluid" title="Total NPO deficit"  value={deficit.toFixed(0)}       unit="mL (hours × 4-2-1)" />
          <DoseCard testid="npo-replace-1" category="fluid" title="1st hour replace"   value={(deficit / 2).toFixed(0)} unit="mL + maintenance"    note="50% in 1st hour" />
          <DoseCard testid="npo-replace-2" category="fluid" title="Hours 2–3 replace"  value={(deficit / 4).toFixed(0)} unit="mL/hr + maintenance"  note="25% per hour × 2 hours" />
        </div>
      </div>

      <div>
        <h3 className="font-bold text-base mb-2" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Transfusion Quick Reference</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TRANSFUSION_NOTES.map((t) => (
            <div key={t.label} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900/50 flex items-baseline gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400 min-w-[45%]">{t.label}</span>
              <span className="font-mono text-sm font-bold text-red-600 dark:text-red-400">{t.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "maintenance", label: "Maintenance",          Icon: Drop      },
  { id: "diarrhoea",   label: "Dehydration/Diarrhea", Icon: Toilet    },
  { id: "dka",         label: "DKA",                  Icon: Syringe   },
  { id: "burns",       label: "Burns",                Icon: Fire      },
  { id: "shock",       label: "Shock",                Icon: Lightning },
  { id: "periop",      label: "Peri-op",              Icon: Hospital  },
];

export default function FluidsTab() {
  const { weight } = useWeight();
  const [sec, setSec] = useState("maintenance");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl sm:text-3xl tracking-tight mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Fluid &amp; Resuscitation
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Live calculations for{" "}
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{weight} kg</span>.
          IAP · WHO · PALS 2020 · Fleischer &amp; Ludwig 7th · Nelson 21st
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setSec(s.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-mono text-[11px] uppercase tracking-widest transition-all ${
              sec === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}>
            <s.Icon size={13} weight="bold" />
            {s.label}
          </button>
        ))}
      </div>

      {sec === "maintenance" && <MaintenanceSection weight={weight} />}
      {sec === "diarrhoea"   && <DiarrhoeaSection   weight={weight} />}
      {sec === "dka"         && <DkaSection          weight={weight} />}
      {sec === "burns"       && <BurnsSection        weight={weight} />}
      {sec === "shock"       && <ShockSection        weight={weight} />}
      {sec === "periop"      && <PeriOpSection       weight={weight} />}
    </div>
  );
}
