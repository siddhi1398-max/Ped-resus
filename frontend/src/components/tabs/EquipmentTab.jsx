// EquipmentTab.jsx — Interactive Airway Equipment & Tubes
// Features: weight/age input → live equipment sizes · formula calculator ·
//           visual ETT selector · RSI drug doses · equipment checklist
// Sources: Harriet Lane 23e · Fleischer & Ludwig 7e · APLS · Paed Anaesthesia guidelines

import { useState, useMemo } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Warning, Lightbulb, ArrowRight, CheckCircle, Circle,
  Syringe, Wind, Drop, Heartbeat, FirstAid, ClipboardText,
  ArrowsOut, Pulse, Stethoscope,
} from "@phosphor-icons/react";
import { EQUIPMENT_ROWS } from "../../data/equipment";

// ─── COLOUR HELPERS ────────────────────────────────────────────────────────────
const TONE = {
  red:     { text: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-950/30",     border: "border-red-200 dark:border-red-800"     },
  emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  amber:   { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800"  },
  blue:    { text: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/30",   border: "border-blue-200 dark:border-blue-800"    },
  violet:  { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800" },
  slate:   { text: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-900/50",  border: "border-slate-200 dark:border-slate-700"  },
};

// ─── FORMULA ENGINE ────────────────────────────────────────────────────────────
function calcEquipment(weight, ageYears) {
  const age = ageYears ?? 0;

  // ETT
  const ettUncuffed = age > 0 ? +(age / 4 + 4).toFixed(1) : weight < 1 ? 2.5 : weight < 2 ? 3.0 : weight < 3 ? 3.0 : 3.5;
  const ettCuffed   = age > 0 ? +(age / 4 + 3.5).toFixed(1) : ettUncuffed - 0.5;
  const ettDepthOral  = age > 0 ? Math.round(age / 2 + 12) : Math.round(weight + 6);
  const ettDepthNasal = age > 0 ? Math.round(age / 2 + 15) : Math.round(weight + 9);

  // LMA
  let lma = "1";
  if (weight >= 5  && weight < 10)  lma = "1.5";
  if (weight >= 10 && weight < 20)  lma = "2";
  if (weight >= 20 && weight < 30)  lma = "2.5";
  if (weight >= 30 && weight < 50)  lma = "3";
  if (weight >= 50 && weight < 70)  lma = "4";
  if (weight >= 70)                  lma = "5";

  // Suction catheter (Fr) ≈ 3 × ETT
  const suction = Math.round(ettUncuffed * 3);

  // Laryngoscope blade
  let blade = "0 straight";
  if (weight >= 3  && weight < 10) blade = "1 straight";
  if (weight >= 10 && weight < 20) blade = "2 straight or curved";
  if (weight >= 20)                 blade = "3 Macintosh (curved)";

  // NGT / OGT
  let ngt = "5 Fr";
  if (weight >= 3  && weight < 7)  ngt = "5–8 Fr";
  if (weight >= 7  && weight < 15) ngt = "8–10 Fr";
  if (weight >= 15 && weight < 30) ngt = "10–12 Fr";
  if (weight >= 30)                 ngt = "12–14 Fr";

  // IV cannula
  let iv = "24G";
  if (weight >= 10 && weight < 25) iv = "22G";
  if (weight >= 25 && weight < 50) iv = "20G";
  if (weight >= 50)                 iv = "18G";

  // IO
  let io = "15mm pink";
  if (weight >= 40) io = "25mm blue";

  // Chest drain (Fr)
  const chestDrain = weight < 10 ? "10–14 Fr" : weight < 20 ? "16–20 Fr" : weight < 40 ? "20–28 Fr" : "28–32 Fr";

  // Urinary catheter
  const ucath = weight < 5 ? "5 Fr" : weight < 10 ? "6 Fr" : weight < 20 ? "8 Fr" : weight < 40 ? "10 Fr" : "12 Fr";

  // Defibrillation
  const defib      = Math.round(weight * 4);
  const defibMax   = Math.min(weight * 10, 360);
  const cardiovert = Math.round(weight * 1);

  // BVM mask size
  let maskSize = "Neonatal";
  if (weight >= 4  && weight < 10) maskSize = "Infant";
  if (weight >= 10 && weight < 25) maskSize = "Child";
  if (weight >= 25)                 maskSize = "Adult";

  // Cuffed preferred flag
  const preferCuffed = weight >= 8 || age >= 2;

  return {
    ettUncuffed, ettCuffed, ettDepthOral, ettDepthNasal,
    lma, suction, blade, ngt, iv, io,
    chestDrain, ucath, defib, defibMax, cardiovert,
    maskSize, preferCuffed,
  };
}

// RSI drug doses
function calcRSI(weight) {
  return [
    { drug: "Ketamine",     dose: `${(weight * 2).toFixed(0)}–${(weight * 2.5).toFixed(0)} mg`,  route: "IV",   note: "2–2.5 mg/kg · haemodynamically stable or unstable" },
    { drug: "Propofol",     dose: `${(weight * 2).toFixed(0)} mg`,                                route: "IV",   note: "2 mg/kg · avoid if shocked · painful injection" },
    { drug: "Thiopentone",  dose: `${(weight * 5).toFixed(0)} mg`,                                route: "IV",   note: "5 mg/kg · raised ICP; causes hypotension" },
    { drug: "Etomidate",    dose: `${(weight * 0.3).toFixed(1)} mg`,                               route: "IV",   note: "0.3 mg/kg · haemodynamically unstable; single dose only" },
    { drug: "Rocuronium",   dose: `${(weight * 1.2).toFixed(0)} mg`,                               route: "IV",   note: "1.2 mg/kg RSI dose · reverse with sugammadex 16 mg/kg" },
    { drug: "Suxamethonium",dose: `${(weight * 2).toFixed(0)} mg (infant) / ${(weight * 1.5).toFixed(0)} mg (child)`, route: "IV", note: "2 mg/kg infant · 1.5 mg/kg child · cautions: K+, burns, myopathies" },
    { drug: "Atropine (pre-intubation)", dose: `${Math.max(0.1, +(weight * 0.02).toFixed(2))} mg`, route: "IV",  note: "0.02 mg/kg (min 0.1 mg) · use for infants <1yr or sux-induced bradycardia" },
    { drug: "Fentanyl",     dose: `${(weight * 2).toFixed(0)}–${(weight * 3).toFixed(0)} mcg`,    route: "IV",   note: "2–3 mcg/kg slow IV over 3–5 min · blunts intubation response" },
    { drug: "Lidocaine",    dose: `${(weight * 1.5).toFixed(0)} mg`,                               route: "IV",   note: "1.5 mg/kg · given 3 min pre-intubation for raised ICP" },
    { drug: "Sugammadex",   dose: `${(weight * 16).toFixed(0)} mg`,                                route: "IV",   note: "16 mg/kg · reversal of rocuronium in cannot intubate/ventilate" },
  ];
}

// ─── EQUIPMENT CARD ────────────────────────────────────────────────────────────
function EquipCard({ label, value, sub, tone = "slate", Icon, highlighted }) {
  const t = TONE[tone];
  return (
    <div className={`rounded-xl border p-3 bg-white dark:bg-slate-900 transition-all ${highlighted ? `${t.border} ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-950 ${t.border.replace("border-", "ring-")}` : "border-slate-200 dark:border-slate-700"}`}>
      {Icon && <Icon size={13} weight="fill" className={`${t.text} mb-1.5`} />}
      <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      <div className={`font-black text-lg leading-none mb-0.5 ${highlighted ? t.text : "text-slate-900 dark:text-white"}`}
           style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{value}</div>
      {sub && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── NUMERIC INPUT ─────────────────────────────────────────────────────────────
function NumInput({ label, value, onChange, unit, min = 0, max = 999, step = 1 }) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{label}</label>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(1))))}
          className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-base">−</button>
        <input type="number" value={value} min={min} max={max} step={step}
          onChange={e => onChange(Math.max(min, Math.min(max, parseFloat(e.target.value) || min)))}
          className="w-20 text-center font-mono font-bold text-lg border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-400 py-1" />
        <button onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(1))))}
          className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-base">+</button>
        <span className="text-xs text-slate-400 font-mono ml-1">{unit}</span>
      </div>
    </div>
  );
}

// ─── SUB-TAB 1: LIVE EQUIPMENT CALCULATOR ─────────────────────────────────────
function LiveEquipmentCalculator() {
  const { weight: ctxWeight } = useWeight();
  const [weight, setWeight] = useState(ctxWeight || 10);
  const [ageYears, setAgeYears] = useState(2);
  const [useAge, setUseAge] = useState(true);
  const [cuffed, setCuffed] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});

  const eq = useMemo(() => calcEquipment(weight, useAge ? ageYears : null), [weight, ageYears, useAge]);

  const ettSize = cuffed ? eq.ettCuffed : eq.ettUncuffed;

  // Checklist items
  const checklistItems = [
    { id: "suction", label: "Suction working + Yankauer attached" },
    { id: "bvm",     label: `BVM + correct mask (${eq.maskSize})` },
    { id: "o2",      label: "O₂ flow confirmed + reservoir bag" },
    { id: "ett",     label: `ETT ${ettSize} mm ${cuffed ? "(cuffed)" : "(uncuffed)"} ready + one size above/below` },
    { id: "syringe", label: `10 mL syringe for cuff inflation` },
    { id: "stylet",  label: "Stylet shaped + lubricated inside ETT" },
    { id: "laryngo", label: `Laryngoscope ${eq.blade} — light working` },
    { id: "capno",   label: "Colorimetric ETCO₂ or capnography attached" },
    { id: "tape",    label: `ETT tape/holder prepared for ${eq.ettDepthOral} cm at lip` },
    { id: "iv",      label: `IV/IO access confirmed (${eq.iv} or IO)` },
    { id: "drugs",   label: "RSI drugs drawn up and labelled" },
    { id: "desat",   label: "Monitoring: SpO₂, ECG, ETCO₂ in place" },
    { id: "backup",  label: "Difficult airway backup: LMA, scalpel kit" },
  ];

  const toggleCheck = (id) => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  const allChecked = checklistItems.every(item => checkedItems[item.id]);
  const checkedCount = checklistItems.filter(item => checkedItems[item.id]).length;

  return (
    <div className="space-y-5">

      {/* Input controls */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-4">Patient Parameters</div>
        <div className="flex flex-wrap gap-6 items-end">
          <NumInput label="Weight" value={weight} onChange={setWeight} unit="kg" min={0.5} max={120} step={0.5} />
          <NumInput label="Age" value={ageYears} onChange={setAgeYears} unit="yr" min={0} max={18} step={0.5} />
          <div className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Size by</div>
            <div className="flex gap-2">
              <button onClick={() => setUseAge(false)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${!useAge ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"}`}>
                Weight
              </button>
              <button onClick={() => setUseAge(true)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${useAge ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"}`}>
                Age
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">ETT Type</div>
            <div className="flex gap-2">
              <button onClick={() => setCuffed(false)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${!cuffed ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"}`}>
                Uncuffed
              </button>
              <button onClick={() => setCuffed(true)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${cuffed ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"}`}>
                Cuffed
              </button>
            </div>
          </div>
        </div>
        {eq.preferCuffed && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle size={12} weight="fill" className="text-emerald-500" />
            <span>Cuffed ETT preferred for this patient (≥2 yr or ≥8 kg) — reduces need for reintubation, allows PEEP</span>
          </div>
        )}
      </div>

      {/* Hero ETT display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
            ETT Size — {cuffed ? "Cuffed" : "Uncuffed"}
          </div>
          <div className="font-black text-5xl text-emerald-700 dark:text-emerald-300 leading-none mb-1"
               style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            {ettSize}
            <span className="text-lg font-normal ml-1">mm ID</span>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-2 space-y-0.5">
            <div>Also prepare: {+(ettSize - 0.5).toFixed(1)} mm and {+(ettSize + 0.5).toFixed(1)} mm</div>
            <div>{cuffed ? `Uncuffed equivalent: ${eq.ettUncuffed} mm` : `Cuffed equivalent: ${eq.ettCuffed} mm`}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">Depth — Oral</div>
            <div className="font-black text-3xl text-blue-600 dark:text-blue-400"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              {eq.ettDepthOral}<span className="text-sm font-normal ml-1">cm</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">at lips</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">Depth — Nasal</div>
            <div className="font-black text-3xl text-violet-600 dark:text-violet-400"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              {eq.ettDepthNasal}<span className="text-sm font-normal ml-1">cm</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">at nares</div>
          </div>
        </div>
      </div>

      {/* All equipment grid */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3">All Equipment — {weight} kg, {ageYears} yr</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <EquipCard label="LMA Size"         value={eq.lma}           sub="Laryngeal mask airway" tone="blue"   Icon={Wind}         highlighted />
          <EquipCard label="Suction Catheter" value={`${eq.suction} Fr`} sub="≈ 3 × ETT size"      tone="slate"  Icon={ArrowsOut}               />
          <EquipCard label="Laryngoscope"     value={eq.blade}         sub="Blade size/type"       tone="amber"  Icon={Stethoscope}             />
          <EquipCard label="BVM Mask"         value={eq.maskSize}      sub="Bag-valve-mask size"   tone="sky"    Icon={Wind}                    />
          <EquipCard label="NGT / OGT"        value={eq.ngt}           sub="Nasogastric tube"      tone="slate"                                 />
          <EquipCard label="IV Cannula"        value={eq.iv}            sub="Peripheral IV"         tone="blue"   Icon={Drop}         highlighted />
          <EquipCard label="IO Access"         value={eq.io}            sub="Intraosseous needle"   tone="red"    Icon={Syringe}                 />
          <EquipCard label="Urinary Catheter" value={eq.ucath}          sub="Foley catheter"        tone="slate"                                 />
          <EquipCard label="Chest Drain"      value={eq.chestDrain}    sub="Intercostal drain"     tone="violet" Icon={Wind}                    />
          <EquipCard label="Defibrillation"   value={`${eq.defib} J`}  sub={`4 J/kg · max ${eq.defibMax} J`} tone="red" Icon={Heartbeat} highlighted />
          <EquipCard label="Cardioversion"    value={`${eq.cardiovert} J`} sub="0.5–1 J/kg sync" tone="amber" Icon={Pulse}                   />
          <EquipCard label="Maintenance IV"   value={`${weight < 10 ? weight * 100 : weight < 20 ? 1000 + (weight - 10) * 50 : 1500 + (weight - 20) * 20} mL/24hr`} sub="Holliday-Segar" tone="slate" Icon={Drop} />
        </div>
      </div>

      {/* Intubation checklist */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className={`flex items-center justify-between px-4 py-3 ${allChecked ? "bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800" : "bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"}`}>
          <div className="flex items-center gap-2">
            <ClipboardText size={14} weight="fill" className={allChecked ? "text-emerald-500" : "text-slate-400"} />
            <span className="font-bold text-sm text-slate-900 dark:text-white"
                  style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Pre-intubation Checklist</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">{checkedCount}/{checklistItems.length}</span>
            {allChecked
              ? <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle size={10} weight="fill" />Ready</span>
              : <button onClick={() => setCheckedItems({})} className="text-[10px] font-mono text-slate-400 hover:text-slate-600 underline">Reset</button>}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900/50 grid sm:grid-cols-2 gap-1.5">
          {checklistItems.map(item => (
            <button key={item.id} onClick={() => toggleCheck(item.id)}
              className={`flex items-start gap-2.5 text-left rounded-lg px-3 py-2 transition-all text-xs ${
                checkedItems[item.id]
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                  : "bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-200"
              }`}>
              {checkedItems[item.id]
                ? <CheckCircle size={13} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />
                : <Circle size={13} weight="regular" className="text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />}
              {item.label}
            </button>
          ))}
        </div>
        {!allChecked && checkedCount > 0 && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900">
            <div className="flex items-center gap-1.5">
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div className="bg-amber-500 rounded-full h-1.5 transition-all" style={{ width: `${(checkedCount / checklistItems.length) * 100}%` }} />
              </div>
              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">{Math.round((checkedCount / checklistItems.length) * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUB-TAB 2: RSI DRUG DOSES ────────────────────────────────────────────────
function RSIDrugsView() {
  const { weight: ctxWeight } = useWeight();
  const [weight, setWeight] = useState(ctxWeight || 10);
  const [showAll, setShowAll] = useState(false);

  const drugs = useMemo(() => calcRSI(weight), [weight]);
  const induction  = drugs.filter((_, i) => i < 4);
  const paralytic  = drugs.filter((_, i) => i >= 4 && i < 6);
  const adjuncts   = drugs.filter((_, i) => i >= 6);

  function DrugRow({ d, tone = "slate" }) {
    const t = TONE[tone];
    return (
      <div className={`rounded-xl border p-3 bg-white dark:bg-slate-900 ${t.border}`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="font-bold text-sm text-slate-900 dark:text-white"
                style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{d.drug}</span>
          <span className={`font-mono font-black text-base whitespace-nowrap ${t.text}`}>{d.dose}</span>
        </div>
        <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">{d.route}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{d.note}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-4">
        <NumInput label="Weight" value={weight} onChange={setWeight} unit="kg" min={0.5} max={120} step={0.5} />
        <div className="text-xs text-slate-400 font-mono pb-1">All doses calculated for {weight} kg</div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 text-xs text-red-800 dark:text-red-200">
        <Warning size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-red-500" />
        <span>RSI must be performed by a trained clinician with full monitoring, suction, BVM, and a plan for failed intubation. These are reference doses only — adjust for clinical context.</span>
      </div>

      {/* LOAD = Pre-oxygenate */}
      <div className={`rounded-xl border p-3 ${TONE.violet.border} ${TONE.violet.bg}`}>
        <div className="flex items-center gap-2 mb-2">
          <Wind size={12} weight="fill" className="text-violet-500" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-violet-600 dark:text-violet-400">Step 1 — Pre-oxygenate (3 min)</span>
        </div>
        <div className="text-xs text-violet-800 dark:text-violet-200">
          High-flow O₂ via non-rebreathing mask or BVM (passive). Apply monitoring. IV/IO access. Draw up all drugs. Brief team.
        </div>
      </div>

      {/* Induction agents */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Syringe size={12} weight="fill" className="text-blue-500" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-blue-600 dark:text-blue-400">Step 2 — Induction Agent (choose ONE)</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {induction.map((d, i) => <DrugRow key={d.drug} d={d} tone={i === 0 ? "blue" : "slate"} />)}
        </div>
      </div>

      {/* Paralytic */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FirstAid size={12} weight="fill" className="text-red-500" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-red-600 dark:text-red-400">Step 3 — Neuromuscular Blockade (given simultaneously)</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {paralytic.map(d => <DrugRow key={d.drug} d={d} tone="red" />)}
        </div>
      </div>

      {/* Adjuncts */}
      <div>
        <button onClick={() => setShowAll(s => !s)}
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 mb-2">
          <ArrowRight size={10} weight="bold" className={`transition-transform ${showAll ? "rotate-90" : ""}`} />
          Adjuncts &amp; Reversal {showAll ? "▲" : "▼"}
        </button>
        {showAll && (
          <div className="grid sm:grid-cols-2 gap-3">
            {adjuncts.map(d => <DrugRow key={d.drug} d={d} tone="amber" />)}
          </div>
        )}
      </div>

      {/* Post-intubation */}
      <div className={`rounded-xl border p-3 ${TONE.emerald.border} ${TONE.emerald.bg}`}>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={12} weight="fill" className="text-emerald-500" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Step 4 — Post-intubation</span>
        </div>
        <div className="space-y-1">
          {[
            "Confirm ETT position: bilateral chest rise, 5-point auscultation, ETCO₂ waveform",
            "CXR — tip should be at T2–T3 (above carina, 2–3 cm)",
            "Secure ETT at calculated depth — note cm at lip in documentation",
            "Post-intubation sedation: midazolam 0.05–0.2 mg/kg/hr + fentanyl 1–4 mcg/kg/hr",
            "Set initial vent: VT 6–8 mL/kg, PEEP 5, FiO₂ 1.0 → titrate SpO₂",
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-200">
              <ArrowRight size={10} weight="bold" className="text-emerald-500 flex-shrink-0 mt-0.5" />
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SUB-TAB 3: REFERENCE TABLE ───────────────────────────────────────────────
function ReferenceTableView() {
  const { weight } = useWeight();
  const [highlightAge, setHighlightAge] = useState(null);

  // Find suggested row by weight
  const suggestedIdx = useMemo(() => {
    if (!EQUIPMENT_ROWS) return 0;
    const idx = EQUIPMENT_ROWS.findIndex(r => parseFloat(r.weight) >= weight);
    return idx >= 0 ? idx : EQUIPMENT_ROWS.length - 1;
  }, [weight]);

  const cols = [
    { k: "age",     label: "Age"            },
    { k: "weight",  label: "Weight (kg)"    },
    { k: "ett",     label: "ETT (mm ID)"    },
    { k: "depth",   label: "Depth (cm)"     },
    { k: "suction", label: "Suction (Fr)"   },
    { k: "blade",   label: "Laryngoscope"   },
    { k: "lma",     label: "LMA"            },
    { k: "ngt",     label: "NGT (Fr)"       },
    { k: "iv",      label: "IV"             },
    { k: "defib",   label: "Defib (J)"      },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 px-3 py-2.5 text-xs text-sky-800 dark:text-sky-200">
        <Lightbulb size={12} weight="fill" className="text-sky-500 flex-shrink-0 mt-0.5" />
        <span>Row matching current weight ({weight} kg) is highlighted in blue. Click any row to lock the selection.</span>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 dark:bg-slate-950 text-white">
              {cols.map(c => (
                <th key={c.k} className="p-3 text-left font-mono text-[9px] uppercase tracking-widest whitespace-nowrap">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(EQUIPMENT_ROWS || []).map((r, i) => {
              const isSuggested  = i === suggestedIdx;
              const isHighlighted = highlightAge === r.age;
              let rowCls = "border-t border-slate-200 dark:border-slate-800 cursor-pointer transition-colors ";
              if (isHighlighted)    rowCls += "bg-violet-100 dark:bg-violet-950/50 ";
              else if (isSuggested) rowCls += "bg-blue-50 dark:bg-blue-950/30 ";
              else                  rowCls += "odd:bg-white dark:odd:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/30 ";

              return (
                <tr key={r.age} className={rowCls} onClick={() => setHighlightAge(isHighlighted ? null : r.age)}>
                  <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {r.age}
                    {isSuggested && !isHighlighted && (
                      <span className="ml-1.5 text-[8px] font-mono uppercase tracking-widest text-blue-500 border border-blue-200 dark:border-blue-800 rounded px-1 py-0.5">wt</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{r.weight}</td>
                  <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{r.ett}</td>
                  <td className="p-3 font-mono text-blue-600 dark:text-blue-400">{r.depth}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{r.suction}</td>
                  <td className="p-3 font-mono text-amber-700 dark:text-amber-400">{r.blade}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{r.lma}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{r.ngt}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{r.iv}</td>
                  <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">{r.defib}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800" />Weight match</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800" />Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800" />ETT size</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-800" />Defib</span>
      </div>

      {/* Formulas reference */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3">Formula Reference</div>
        <div className="grid sm:grid-cols-2 gap-2 font-mono text-xs">
          {[
            { label: "ETT uncuffed (age ≥2 yr)", val: "(age÷4) + 4" },
            { label: "ETT cuffed (age ≥2 yr)",   val: "(age÷4) + 3.5" },
            { label: "ETT depth — oral",           val: "(age÷2) + 12 cm" },
            { label: "ETT depth — nasal",          val: "(age÷2) + 15 cm" },
            { label: "Defibrillation",             val: "4 J/kg (max 10 J/kg or 360 J)" },
            { label: "Cardioversion",              val: "0.5–1 J/kg → 2 J/kg" },
            { label: "Suction catheter (Fr)",      val: "≈ 3 × ETT (mm)" },
            { label: "Maintenance fluid",          val: "4 mL/kg/hr (first 10kg) + 2 + 1" },
          ].map(f => (
            <div key={f.label} className="flex justify-between gap-2 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{f.label}</span>
              <span className="font-bold text-slate-800 dark:text-white whitespace-nowrap">{f.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "calculator", label: "Equipment Calculator", Icon: Wind          },
  { id: "rsi",        label: "RSI Drugs",             Icon: Syringe       },
  { id: "table",      label: "Reference Table",       Icon: ClipboardText },
];

export default function EquipmentTab() {
  const { weight } = useWeight();
  const [activeTab, setActiveTab] = useState("calculator");

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Airway Equipment &amp; Tubes
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Weight/age-based equipment sizes for{" "}
          <span className="font-bold text-slate-900 dark:text-white">{weight} kg</span> ·
          Harriet Lane 23e · Fleischer &amp; Ludwig 7e · APLS
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
        <Warning size={13} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>Always prepare one size above and below. Cuffed ETTs preferred in children ≥2 yr or ≥8 kg. Confirm ETT position with ETCO₂ waveform — not colorimetric alone.</span>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-mono text-[11px] uppercase tracking-wider transition-all ${
              activeTab === t.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>
            <t.Icon size={13} weight={activeTab === t.id ? "fill" : "regular"} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "calculator" && <LiveEquipmentCalculator />}
      {activeTab === "rsi"        && <RSIDrugsView />}
      {activeTab === "table"      && <ReferenceTableView />}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        Harriet Lane Handbook 23e · Fleischer &amp; Ludwig 7e · APLS · Paediatric Anaesthesia Guidelines
      </div>
    </div>
  );
}
