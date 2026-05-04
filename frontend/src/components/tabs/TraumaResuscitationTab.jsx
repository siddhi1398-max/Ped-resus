// TraumaTab.jsx — Pediatric Trauma Resuscitation
// Sub-tabs: Primary Survey · Shock & Fluids · TBI · Secondary Survey · Scores
// Sources: ATLS 11th ed (ACS 2025) · PALS 2020 · APLS · CRASH-2 · Broselow · Pediatric Surgery NatCertBoard

import { useState, useMemo } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Warning, ArrowRight, CheckCircle, Circle, Heartbeat,
  Drop, Brain, ClipboardText, Pulse, FirstAid, Siren,
  ArrowsClockwise, Thermometer, Eye,
} from "@phosphor-icons/react";

// ─── COLOUR HELPERS (identical to rest of app) ─────────────────────────────────
const TONE = {
  red:     { text: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-950/30",         border: "border-red-200 dark:border-red-800"         },
  emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  amber:   { text: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200 dark:border-amber-800"     },
  blue:    { text: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-950/30",       border: "border-blue-200 dark:border-blue-800"       },
  violet:  { text: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-50 dark:bg-violet-950/30",   border: "border-violet-200 dark:border-violet-800"   },
  sky:     { text: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-50 dark:bg-sky-950/30",         border: "border-sky-200 dark:border-sky-800"         },
  orange:  { text: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-950/30",   border: "border-orange-200 dark:border-orange-800"   },
  slate:   { text: "text-slate-600 dark:text-slate-400",     bg: "bg-slate-50 dark:bg-slate-900/50",     border: "border-slate-200 dark:border-slate-700"     },
  rose:    { text: "text-rose-600 dark:text-rose-400",       bg: "bg-rose-50 dark:bg-rose-950/30",       border: "border-rose-200 dark:border-rose-800"       },
};

// ─── SHARED WIDGETS ────────────────────────────────────────────────────────────
function InfoBox({ tone = "amber", icon: Icon, title, children }) {
  const t = TONE[tone];
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${t.bg} ${t.border} ${t.text}`}>
      {Icon && <Icon size={13} weight="fill" className="flex-shrink-0 mt-0.5" />}
      <div><strong>{title}</strong>{title ? " — " : ""}{children}</div>
    </div>
  );
}

function SectionCard({ tone = "slate", title, children, noPad }) {
  const t = TONE[tone];
  return (
    <div className={`rounded-xl border bg-white dark:bg-slate-900/50 ${t.border} overflow-hidden`}>
      <div className={`px-4 py-2.5 border-b ${t.bg} ${t.border}`}>
        <div className={`font-bold text-xs uppercase tracking-widest ${t.text}`}
             style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{title}</div>
      </div>
      <div className={noPad ? "" : "p-4"}>{children}</div>
    </div>
  );
}

function BulletList({ items, tone = "slate", icon: Icon }) {
  const t = TONE[tone];
  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className={`flex items-start gap-1.5 text-xs ${t.text === TONE.slate.text ? "text-slate-600 dark:text-slate-300" : ""}`}>
          {Icon
            ? <Icon size={10} weight="bold" className={`${t.text} flex-shrink-0 mt-0.5`} />
            : <ArrowRight size={10} weight="bold" className={`${t.text} flex-shrink-0 mt-0.5`} />}
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

// ─── WEIGHT-BASED CALC ─────────────────────────────────────────────────────────
function calcTrauma(weight) {
  const w = weight;
  // Blood volume
  const ebv = w < 1 ? Math.round(w * 100) : w <= 3 ? Math.round(w * 90) : Math.round(w * 80);
  // Shock thresholds: 10% = mild, 20% = moderate, 30% = severe, 40% = pre-terminal
  const shock10 = Math.round(ebv * 0.10);
  const shock20 = Math.round(ebv * 0.20);
  const shock30 = Math.round(ebv * 0.30);
  const shock40 = Math.round(ebv * 0.40);
  // Fluid bolus: 10 mL/kg isotonic (ATLS 11 — limit crystalloid)
  const fluidBolus10  = Math.round(w * 10);
  const fluidBolus20  = Math.round(w * 20);
  // Blood products 10–15 mL/kg
  const rbcDose   = Math.round(w * 10);
  const ffpDose   = Math.round(w * 10);
  const pltDose   = Math.round(w * 10);
  // TXA: 15 mg/kg IV over 10 min (max 1000 mg loading dose), then 2 mg/kg/hr x 8hr
  const txaLoad   = Math.min(Math.round(w * 15), 1000);
  const txaInfMg  = Math.round(w * 2);
  // Hypotension threshold: 70 + (2 × age) — use weight-to-age estimate
  // Rough weight→age: age ≈ (weight - 9) / 2 for 1-10yr (Luscombe)
  const estimatedAge = Math.max(0, Math.round((w - 9) / 2));
  const sbpMin = w < 3 ? 50 : w < 10 ? 70 : Math.min(90, 70 + estimatedAge * 2);
  // Permissive hypotension target: MAP ≥ 50 mmHg (no TBI), SBP ≥ sbpMin
  // Urine output target
  const uoTarget = Math.round(w * 1); // 1 mL/kg/hr
  // Mannitol: 0.5–1 g/kg (for herniation / ICP crisis)
  const mannitolDose = `${Math.round(w * 0.5)}–${Math.round(w * 1)} mL of 20%`;
  // 3% NaCl: 2–5 mL/kg
  const htsLow  = Math.round(w * 2);
  const htsHigh = Math.round(w * 5);

  return {
    ebv, shock10, shock20, shock30, shock40,
    fluidBolus10, fluidBolus20,
    rbcDose, ffpDose, pltDose,
    txaLoad, txaInfMg,
    sbpMin, uoTarget,
    mannitolDose, htsLow, htsHigh,
    estimatedAge,
  };
}

// ─── TAB 1: PRIMARY SURVEY (xABCDE) ──────────────────────────────────────────
function PrimarySurveyView() {
  const { weight } = useWeight();
  const [checkedItems, setCheckedItems] = useState({});

  const steps = [
    {
      id: "x", letter: "x", label: "Exsanguinating Haemorrhage", tone: "red",
      headline: "Stop the bleed first — before airway",
      items: [
        "Identify and control massive external haemorrhage immediately on contact",
        "Tourniquet (CAT/SOFTT-W) proximal to wound for extremity — apply before moving patient",
        "Direct pressure + wound packing (haemostatic gauze: QuikClot / Celox) for junctional wounds",
        "Pelvic binder (sheet or commercial) if suspected pelvic fracture — place at greater trochanters",
        "Activate Massive Transfusion Protocol (MTP) if >20% EBV loss suspected",
        "Do NOT remove tourniquet in ED until surgical haemorrhage control is confirmed",
      ],
    },
    {
      id: "a", letter: "A", label: "Airway + C-Spine", tone: "amber",
      headline: "Open and protect — assume c-spine injury until cleared",
      items: [
        "Jaw thrust (not head-tilt chin-lift) — maintains in-line c-spine stabilisation",
        "Suction blood, vomit, foreign body from airway",
        "OPA if unconscious and no gag reflex; NPA if conscious or gag present",
        "Manual in-line stabilisation (MILS) — do not use collar alone to immobilise",
        "RSI if: GCS ≤8, airway unprotected, impending obstruction, or inability to maintain SpO₂ ≥94%",
        "Video laryngoscopy preferred for all trauma intubations — c-spine in neutral with MILS",
        "Consider surgical airway early — paediatric threshold for surgical airway is lower",
      ],
    },
    {
      id: "b", letter: "B", label: "Breathing + Ventilation", tone: "blue",
      headline: "Inspect, percuss, auscultate — treat immediately",
      items: [
        "SpO₂ ≥94% on high-flow O₂ (15 L/min NRB mask). Aim 94–99% post-intubation",
        "Tension pneumothorax: hyperresonance + tracheal deviation + haemodynamic collapse → immediate needle decompression (2nd ICS MCL or 4th/5th ICS AAL) before CXR",
        "Open chest wound: 3-sided occlusive dressing (flutter valve effect) → definitive chest drain",
        "Haemothorax: intercostal chest drain (ICC) — size per weight (Equipment tab)",
        "Sucking chest wound, flail segment, pulmonary contusion — all can cause silent hypoxia",
        "Post-intubation vent: TV 6–8 mL/kg, RR age-appropriate, PEEP 5–8 cmH₂O, FiO₂ to SpO₂",
      ],
    },
    {
      id: "c", letter: "C", label: "Circulation + Haemorrhage Control", tone: "emerald",
      headline: "Two large-bore IVs or IO — blood not saline",
      items: [
        "Establish IV/IO access immediately — 2 large-bore IVs preferred; IO if IV delayed >90 sec",
        "Blood products preferred over crystalloid: pRBC + FFP + Platelets in 1:1:1 ratio",
        "If no blood available: 10 mL/kg isotonic crystalloid (Hartmann/LR — not NS) as single bolus",
        "Do NOT exceed 3 crystalloid boluses — switch to blood products. Saline resuscitation increases mortality",
        "Warm all fluids (blood warmer — cold blood → coagulopathy → lethal triad)",
        "FAST exam: pericardial effusion, haemoperitoneum, haemothorax, pneumothorax",
        "TXA within 3 hours of injury for major haemorrhage (see Shock & Fluids tab for dosing)",
        "Permissive hypotension: SBP target above minimum (see Shock tab) until surgical control",
      ],
    },
    {
      id: "d", letter: "D", label: "Disability (Neurological)", tone: "violet",
      headline: "GCS + pupils + blood glucose",
      items: [
        "GCS: Eyes (1–4) + Verbal (1–5) + Motor (1–6). Severe TBI = GCS ≤8",
        "Pupils: size, reactivity, asymmetry. Fixed dilated pupil = uncal herniation until proven otherwise",
        "AVPU: Alert / Voice / Pain / Unresponsive (rapid bedside assessment)",
        "BGL immediately: hypoglycaemia mimics and worsens TBI. Target 5–10 mmol/L",
        "GCS ≤8 → definitive airway. Avoid: hypoxia (SpO₂ <94%), hypotension, hyperthermia, hypoglycaemia",
        "Avoid hyperventilation unless active herniation (pupil changes, Cushing triad). Target PaCO₂ 35–40 mmHg",
      ],
    },
    {
      id: "e", letter: "E", label: "Exposure + Environment", tone: "orange",
      headline: "Undress fully — log roll — prevent hypothermia",
      items: [
        "Remove all clothing — a missed injury kills. Cut, do not undress",
        "Log roll with MILS: inspect posterior thorax, spine, perineum, rectum",
        "Hypothermia prevention: warm blankets, warmed fluids, raise room temperature ≥26°C for paediatric patients",
        "Lethal triad: Hypothermia + Coagulopathy + Acidosis — prevent aggressively from the outset",
        "Temperature ≤35°C = hypothermia. Severe coagulopathy begins at ≤34°C",
        "Record ALL injuries — formal documentation prevents injuries being missed in resuscitation",
      ],
    },
  ];

  const checklistItems = [
    { id: "haem",    label: "Exsanguinating bleed controlled / tourniquet applied" },
    { id: "airway",  label: "Airway open, jaw thrust applied, c-spine MILS" },
    { id: "spo2",    label: "SpO₂ ≥94% on O₂ / intubated if indicated" },
    { id: "tension", label: "Tension pneumothorax excluded / treated" },
    { id: "iv",      label: "2× large-bore IV / IO access established" },
    { id: "fast",    label: "FAST exam performed" },
    { id: "blood",   label: "Blood products ordered / MTP activated if indicated" },
    { id: "txa",     label: "TXA given within 3 hours of injury if major haemorrhage" },
    { id: "gcs",     label: "GCS + pupils + BGL documented" },
    { id: "glucose", label: "Hypoglycaemia excluded / treated" },
    { id: "expose",  label: "Patient fully exposed + log rolled" },
    { id: "warm",    label: "Hypothermia prevention in place" },
    { id: "xray",    label: "Trauma XR: CXR + pelvis ± FAST ordered" },
    { id: "family",  label: "Family informed, social worker/team notified" },
  ];

  const toggle = id => setCheckedItems(p => ({ ...p, [id]: !p[id] }));
  const done = checklistItems.filter(i => checkedItems[i.id]).length;
  const allDone = done === checklistItems.length;

  return (
    <div className="space-y-4">
      <InfoBox tone="red" icon={Warning}>
        <strong>ATLS 11th ed 2025 — xABCDE:</strong> Exsanguinating haemorrhage control NOW precedes airway. Bleeding kills before airway obstruction in most paediatric trauma. Activate trauma team and MTP early.
      </InfoBox>

      <div className="space-y-3">
        {steps.map(step => {
          const t = TONE[step.tone];
          return (
            <div key={step.id} className={`rounded-xl border overflow-hidden bg-white dark:bg-slate-900/50 ${t.border}`}>
              <div className={`flex items-center gap-3 px-4 py-3 ${t.bg} border-b ${t.border}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg flex-shrink-0 ${
                  step.id === "x" ? "bg-red-600 text-white" : `bg-white dark:bg-slate-900 border ${t.border} ${t.text}`
                }`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{step.letter}</span>
                <div>
                  <div className={`font-bold text-sm ${t.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                    {step.label}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">{step.headline}</div>
                </div>
              </div>
              <div className="p-4 grid sm:grid-cols-2 gap-1.5">
                {step.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <ArrowRight size={10} weight="bold" className={`${t.text} flex-shrink-0 mt-0.5`} />{item}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trauma resus checklist */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          allDone
            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
        }`}>
          <div className="flex items-center gap-2">
            <ClipboardText size={14} weight="fill" className={allDone ? "text-emerald-500" : "text-slate-400"} />
            <span className="font-bold text-sm text-slate-900 dark:text-white"
                  style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Trauma Resus Checklist
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">{done}/{checklistItems.length}</span>
            {!allDone && done > 0 && (
              <button onClick={() => setCheckedItems({})} className="text-[10px] font-mono text-slate-400 hover:text-slate-600 underline">Reset</button>
            )}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900/50 grid sm:grid-cols-2 gap-1.5">
          {checklistItems.map(item => (
            <button key={item.id} onClick={() => toggle(item.id)}
              className={`flex items-start gap-2.5 text-left rounded-lg px-3 py-2 transition-all text-xs ${
                checkedItems[item.id]
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                  : "bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-200"
              }`}>
              {checkedItems[item.id]
                ? <CheckCircle size={13} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />
                : <Circle      size={13} weight="regular" className="text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />}
              {item.label}
            </button>
          ))}
        </div>
        {!allDone && done > 0 && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div className="bg-amber-500 rounded-full h-1.5 transition-all"
                     style={{ width: `${(done / checklistItems.length) * 100}%` }} />
              </div>
              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                {Math.round((done / checklistItems.length) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB 2: SHOCK & FLUIDS ─────────────────────────────────────────────────────
function ShockFluidsView() {
  const { weight } = useWeight();
  const c = useMemo(() => calcTrauma(weight), [weight]);

  const shockClasses = [
    { cls: "Class I",  pct: "<15%",   vol: `<${c.shock10} mL`,                   hr: "Mild ↑",       sbp: "Normal",     pulse: "Normal",     crt: "<2 s",      ms: "Normal",       urine: `>${c.uoTarget} mL/hr`, tone: "emerald" },
    { cls: "Class II", pct: "15–30%", vol: `${c.shock10}–${c.shock30} mL`,       hr: "Moderate ↑↑",  sbp: "Normal/↓",   pulse: "Weak",       crt: "2–3 s",     ms: "Anxious",      urine: `${c.uoTarget} mL/hr`, tone: "amber"  },
    { cls: "Class III",pct: "30–40%", vol: `${c.shock30}–${c.shock40} mL`,       hr: "Marked ↑↑↑",   sbp: "↓",          pulse: "Thready",    crt: ">3 s",      ms: "Confused",     urine: "<1 mL/kg/hr",          tone: "orange" },
    { cls: "Class IV", pct: ">40%",   vol: `>${c.shock40} mL`,                   hr: "Severe ↑↑↑↑ / Bradycardia", sbp: "↓↓ / Arrest", pulse: "Absent",  crt: "Mottled",   ms: "Unconscious",  urine: "None",                 tone: "red"    },
  ];

  return (
    <div className="space-y-5">
      <InfoBox tone="amber" icon={Warning}>
        Children compensate well — normal BP does NOT exclude significant haemorrhage. Tachycardia is the earliest sign. Hypotension is a pre-terminal finding (25–30% volume loss). Blood products first, crystalloid last resort.
      </InfoBox>

      {/* EBV + Key Values */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Est. Blood Volume",    val: `${c.ebv} mL`,           sub: `80 mL/kg × ${weight} kg`,       tone: "red"     },
          { label: "Min SBP",              val: `${c.sbpMin} mmHg`,       sub: "Hypotension threshold",         tone: "amber"   },
          { label: "UO Target",            val: `≥${c.uoTarget} mL/hr`,   sub: "1 mL/kg/hr — organ perfusion", tone: "blue"    },
          { label: "Fluid Bolus (max 1st)", val: `${c.fluidBolus10} mL`,  sub: "10 mL/kg LR/NS if no blood",   tone: "emerald" },
        ].map(v => {
          const t = TONE[v.tone];
          return (
            <div key={v.label} className={`rounded-xl border p-3 bg-white dark:bg-slate-900 ${t.border}`}>
              <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">{v.label}</div>
              <div className={`font-black text-xl leading-none mb-0.5 ${t.text}`}
                   style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{v.val}</div>
              <div className="text-[10px] text-slate-400 font-mono">{v.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Shock Classification Table */}
      <SectionCard tone="red" title={`Haemorrhagic Shock Classification — ${weight} kg (EBV ${c.ebv} mL)`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                {["Class", "Blood Loss", "Volume", "Heart Rate", "SBP", "Pulse", "Cap Refill", "Mental State", "Urine Output"].map(h => (
                  <th key={h} className="p-2.5 text-left font-mono text-[8px] uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shockClasses.map((r, i) => {
                const t = TONE[r.tone];
                return (
                  <tr key={r.cls} className={`border-t border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? "bg-white dark:bg-slate-900/20" : "bg-slate-50/50 dark:bg-slate-900/40"}`}>
                    <td className={`p-2.5 font-bold whitespace-nowrap ${t.text}`}>{r.cls}</td>
                    <td className={`p-2.5 font-mono font-bold ${t.text}`}>{r.pct}</td>
                    <td className={`p-2.5 font-mono text-slate-600 dark:text-slate-300`}>{r.vol}</td>
                    <td className={`p-2.5 font-mono ${t.text}`}>{r.hr}</td>
                    <td className={`p-2.5 font-mono text-slate-600 dark:text-slate-300`}>{r.sbp}</td>
                    <td className={`p-2.5 font-mono text-slate-600 dark:text-slate-300`}>{r.pulse}</td>
                    <td className={`p-2.5 font-mono text-slate-600 dark:text-slate-300`}>{r.crt}</td>
                    <td className={`p-2.5 font-mono text-slate-600 dark:text-slate-300`}>{r.ms}</td>
                    <td className={`p-2.5 font-mono text-slate-600 dark:text-slate-300`}>{r.urine}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-3 pt-2">
          <p className="text-[10px] text-slate-400 font-mono">
            ⚠ Paediatric patients maintain BP until 25–30% volume loss — tachycardia is the key early sign. Class III/IV = life-threatening emergency.
          </p>
        </div>
      </SectionCard>

      {/* Resuscitation Strategy */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* DCR / Blood Products */}
        <SectionCard tone="red" title="Damage Control Resuscitation (DCR)">
          <div className="space-y-3 text-xs">
            <div className={`rounded-lg border p-3 ${TONE.red.bg} ${TONE.red.border}`}>
              <div className={`font-bold text-[10px] uppercase tracking-wider mb-1.5 ${TONE.red.text}`}>
                Blood Products — {weight} kg
              </div>
              <div className="space-y-1 text-red-800 dark:text-red-200 font-mono">
                <div>pRBC: <strong>{c.rbcDose} mL</strong> (10 mL/kg, repeat PRN)</div>
                <div>FFP:  <strong>{c.ffpDose} mL</strong> (10 mL/kg, 1:1 with RBC)</div>
                <div>Platelets: <strong>{c.pltDose} mL</strong> (10 mL/kg, 1:1:1 ratio)</div>
                <div>Cryoprecipitate: <strong>1 unit per 10 kg</strong> = ~{Math.round(weight/10)} unit(s)</div>
                <div>Whole blood: <strong>{c.rbcDose} mL</strong> (preferred over components if available)</div>
              </div>
            </div>

            <BulletList tone="red" items={[
              "1:1:1 ratio pRBC:FFP:PLT mimics whole blood — reduces dilutional coagulopathy",
              "Low-titre O-negative whole blood preferred when available (especially in prehospital)",
              "Activate MTP if: estimated loss >20% EBV, ongoing haemorrhage, shock not responding to 1 bolus",
              "Avoid crystalloid-predominant resuscitation — increases mortality, ARDS, abdominal compartment syndrome",
              "Monitor: Hb, lactate, base excess, PT/APTT, fibrinogen, ionised Ca²⁺, temperature",
              "Calcium chloride 10–20 mg/kg (or gluconate) with each blood product — citrate chelates Ca²⁺",
            ]} />
          </div>
        </SectionCard>

        {/* TXA + Permissive Hypotension */}
        <div className="space-y-4">
          <SectionCard tone="amber" title={`Tranexamic Acid (TXA) — ${weight} kg`}>
            <div className="space-y-2 text-xs">
              <div className={`rounded-lg border p-3 font-mono ${TONE.amber.bg} ${TONE.amber.border} text-amber-800 dark:text-amber-200`}>
                <div className={`font-bold text-[10px] uppercase tracking-wider mb-1.5 ${TONE.amber.text}`}>Dosing</div>
                <div>Loading: <strong>{c.txaLoad} mg IV</strong> over 10 min (15 mg/kg, max 1 g)</div>
                <div>Maintenance: <strong>{c.txaInfMg} mg/hr</strong> IV × 8 hr (2 mg/kg/hr)</div>
                <div className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                  ⏱ Must give within 3 hours of injury. No benefit after 3 hrs.
                </div>
              </div>
              <BulletList tone="amber" items={[
                "Indicated: major haemorrhage — traumatic or surgical. Give as soon as possible",
                "TBI with haemorrhage: TXA reduces intracranial haematoma expansion",
                "Seizure risk with high doses — use weight-based dosing (do not exceed 30 mg/kg bolus)",
                "CRASH-2 trial evidence in adults; TIC-TOC trial ongoing for paediatric dosing",
              ]} />
            </div>
          </SectionCard>

          <SectionCard tone="blue" title="Permissive Hypotension">
            <div className="space-y-2 text-xs">
              <div className={`rounded-lg border p-3 font-mono ${TONE.blue.bg} ${TONE.blue.border} text-blue-800 dark:text-blue-200`}>
                <div className="font-bold mb-1">Target SBP: ≥{c.sbpMin} mmHg</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400">
                  Allow BP below normal until surgical haemorrhage control — prevents clot disruption
                </div>
              </div>
              <BulletList tone="blue" items={[
                "Allow SBP slightly below normal until haemorrhage surgically controlled",
                "Rationale: aggressive resuscitation raises BP → dislodges clot → more bleeding",
                `Minimum acceptable SBP: ${c.sbpMin} mmHg (formula: 70 + 2×age)`,
                "CONTRAINDICATED in TBI — maintain SBP ≥90 mmHg (or age-appropriate) to preserve CPP",
                "Goal: peripheral perfusion (CRT, lactate) NOT blood pressure alone",
              ]} />
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Vital signs reference */}
      <SectionCard tone="slate" title="Age-Specific Normal Vital Signs (PALS 2020)">
        <div className="overflow-x-auto" noPad>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                {["Age", "HR (/min)", "RR (/min)", "SBP (mmHg)", "Min SBP", "Weight (kg)"].map(h => (
                  <th key={h} className="p-2.5 text-left font-mono text-[8px] uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { age: "Neonate (0–1 mo)",   hr: "100–160", rr: "30–60", sbp: "60–90",   minSbp: "60",  wt: "3–4" },
                { age: "Infant (1–12 mo)",   hr: "100–160", rr: "25–50", sbp: "70–100",  minSbp: "70",  wt: "4–10" },
                { age: "Toddler (1–3 yr)",   hr: "90–150",  rr: "20–40", sbp: "80–110",  minSbp: "72",  wt: "10–14" },
                { age: "Preschool (3–5 yr)", hr: "80–140",  rr: "20–30", sbp: "80–110",  minSbp: "76",  wt: "14–18" },
                { age: "School (6–12 yr)",   hr: "70–120",  rr: "18–25", sbp: "90–120",  minSbp: "82",  wt: "20–42" },
                { age: "Adolescent (>12 yr)",hr: "60–100",  rr: "12–20", sbp: "100–130", minSbp: "90",  wt: ">42"  },
              ].map((r, i) => (
                <tr key={r.age} className={`border-t border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? "bg-white dark:bg-slate-900/20" : "bg-slate-50/50 dark:bg-slate-900/40"}`}>
                  <td className="p-2.5 font-bold text-slate-800 dark:text-white whitespace-nowrap">{r.age}</td>
                  <td className="p-2.5 font-mono text-blue-600 dark:text-blue-400">{r.hr}</td>
                  <td className="p-2.5 font-mono text-emerald-600 dark:text-emerald-400">{r.rr}</td>
                  <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{r.sbp}</td>
                  <td className="p-2.5 font-mono font-bold text-red-600 dark:text-red-400">{r.minSbp}</td>
                  <td className="p-2.5 font-mono text-slate-500 dark:text-slate-400">{r.wt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-3 pt-2 text-[10px] font-mono text-slate-400">
          Min SBP = 70 + (2 × age in years) for 1–10 yr. Tachycardia is the earliest sign of shock in children.
        </div>
      </SectionCard>
    </div>
  );
}

// ─── TAB 3: TBI ────────────────────────────────────────────────────────────────
function TBIView() {
  const { weight } = useWeight();
  const c = useMemo(() => calcTrauma(weight), [weight]);

  const gcsTable = {
    eye:    [{ s: 4, a: "Opens spontaneously",               i: "Opens spontaneously"          },
             { s: 3, a: "Opens to verbal command",            i: "Opens to voice"               },
             { s: 2, a: "Opens to pain",                      i: "Opens to pain"                },
             { s: 1, a: "No response",                        i: "No response"                  }],
    verbal: [{ s: 5, a: "Oriented, converses",                i: "Coos/babbles — normal sounds" },
             { s: 4, a: "Confused, disoriented",              i: "Crying but consolable"        },
             { s: 3, a: "Inappropriate words",                i: "Persistent crying/screaming"  },
             { s: 2, a: "Incomprehensible sounds",            i: "Grunts / agitated"            },
             { s: 1, a: "No response",                        i: "No response"                  }],
    motor:  [{ s: 6, a: "Obeys commands",                    i: "Normal spontaneous movement"  },
             { s: 5, a: "Localises to pain",                  i: "Withdraws to touch"           },
             { s: 4, a: "Withdraws from pain",                i: "Withdraws from pain"          },
             { s: 3, a: "Abnormal flexion (decorticate)",     i: "Abnormal flexion"             },
             { s: 2, a: "Extension (decerebrate)",            i: "Abnormal extension"           },
             { s: 1, a: "No response",                        i: "Flaccid / no response"        }],
  };

  return (
    <div className="space-y-5">
      <InfoBox tone="red" icon={Warning}>
        Paediatric TBI — leading cause of trauma mortality. Avoid the 4 H's: Hypoxia (SpO₂ &lt;94%), Hypotension (SBP &lt;{c.sbpMin} mmHg), Hypercarbia (PaCO₂ &gt;45), Hyperthermia (&gt;37.5°C). Secondary injury is preventable.
      </InfoBox>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: "Severe TBI",    val: "GCS ≤8",    sub: "Immediate definitive airway", tone: "red"    },
          { label: "Moderate TBI",  val: "GCS 9–13",  sub: "Close monitoring, CT head",   tone: "amber"  },
          { label: "Mild TBI",      val: "GCS 14–15", sub: "PECARN rule, observe/d/c",    tone: "emerald"},
        ].map(v => {
          const t = TONE[v.tone];
          return (
            <div key={v.label} className={`rounded-xl border p-3 bg-white dark:bg-slate-900 ${t.border}`}>
              <div className={`font-mono text-[9px] uppercase tracking-widest mb-1 ${t.text}`}>{v.label}</div>
              <div className={`font-black text-xl leading-none mb-0.5 ${t.text}`}
                   style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{v.val}</div>
              <div className="text-[10px] text-slate-400 font-mono">{v.sub}</div>
            </div>
          );
        })}
      </div>

      {/* GCS Table */}
      <SectionCard tone="violet" title="Paediatric Glasgow Coma Scale (pGCS)">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { key: "eye",    label: "Eye Opening (E)", max: 4 },
            { key: "verbal", label: "Verbal Response (V) — Older / Infant", max: 5 },
            { key: "motor",  label: "Motor Response (M)", max: 6 },
          ].map(section => (
            <div key={section.key}>
              <div className="font-mono text-[9px] uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">
                {section.label}
              </div>
              <div className="space-y-1">
                {gcsTable[section.key].map(row => (
                  <div key={row.s} className="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 px-2.5 py-1.5">
                    <span className="font-black text-sm text-violet-600 dark:text-violet-400 w-4 flex-shrink-0"
                          style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{row.s}</span>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{row.a}</div>
                      {row.i !== row.a && (
                        <div className="text-[10px] text-violet-500 dark:text-violet-400 font-mono">Infant: {row.i}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 px-1 text-[10px] font-mono text-slate-400">
          Total = E + V + M · Minimum 3, Maximum 15 · Severe ≤8 · Moderate 9–13 · Mild 14–15
        </div>
      </SectionCard>

      {/* Management Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SectionCard tone="red" title="Severe TBI Management (GCS ≤8)">
          <div className="space-y-2 text-xs">
            <BulletList tone="red" items={[
              "Immediate RSI — avoid ketamine alone if haemodynamically unstable with high ICP (debated)",
              "Maintain SpO₂ 94–99% — never let hypoxia occur",
              `Maintain SBP ≥${c.sbpMin} mmHg (age-appropriate) — NO permissive hypotension in TBI`,
              "Target PaCO₂ 35–40 mmHg — avoid hyperventilation unless herniation",
              "HOB 30° once haemodynamics stable — improves venous drainage",
              "Osmotherapy for ICP crisis / herniation (see below)",
              "Avoid fever: target temp 36–37.5°C. Avoid prophylactic hypothermia (no benefit)",
              "Neurosurgery consult immediately for GCS ≤8, focal deficits, or haematoma on CT",
              "CT head priority — but resuscitate first (unstable → OR not CT)",
            ]} />
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard tone="amber" title={`Osmotherapy — ${weight} kg`}>
            <div className="space-y-2 text-xs">
              <div className={`rounded-lg border p-3 font-mono ${TONE.amber.bg} ${TONE.amber.border} text-amber-800 dark:text-amber-200 space-y-1`}>
                <div className="font-bold text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                  ICP Crisis / Herniation Signs
                </div>
                <div>3% NaCl (HTS): <strong>{c.htsLow}–{c.htsHigh} mL IV</strong> over 10–20 min</div>
                <div>Mannitol 20%: <strong>{c.mannitolDose}</strong> IV over 20 min</div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400">
                  HTS preferred if hypovolaemic. Mannitol: avoid if hypovolaemic.
                </div>
              </div>
              <BulletList tone="amber" items={[
                "Herniation signs: fixed dilated pupil(s), Cushing triad (bradycardia + hypertension + irregular breathing), posturing",
                "Hyperventilate ONLY as bridge to osmotherapy in active herniation: target PaCO₂ 30–35 mmHg",
                "Repeat osmotherapy q4–6h if needed; monitor Na⁺ (target 145–160 mmol/L for HTS)",
              ]} />
            </div>
          </SectionCard>

          <SectionCard tone="sky" title="PECARN Rule — CT Decision (Mild TBI)">
            <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="font-bold text-[10px] uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-1">High-risk features → CT head</div>
              <BulletList tone="sky" items={[
                "GCS <15 at 2 hours post-injury",
                "Suspected skull fracture or palpable depression",
                "Altered mental status (confusion, agitation, slow response)",
                "Scalp haematoma (especially posterior/parietal in <2 yr)",
                "Basilar skull fracture signs: Battle sign, raccoon eyes, haemotympanum, CSF leak",
                "Severe mechanism: MVA ejection / rollover, fall >3 m (or >1 m in <2 yr), head struck by high-speed object",
              ]} />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 4: SECONDARY SURVEY ───────────────────────────────────────────────────
function SecondarySurveyView() {
  const [section, setSection] = useState("head");

  const sections = [
    { id: "head",    label: "Head & Neck"     },
    { id: "chest",   label: "Chest"           },
    { id: "abdomen", label: "Abdomen"         },
    { id: "spine",   label: "Spine & Pelvis"  },
    { id: "limbs",   label: "Extremities"     },
    { id: "burns",   label: "Burns"           },
  ];

  const content = {
    head: {
      tone: "violet",
      groups: [
        { title: "Scalp & Skull", items: [
          "Palpate entire scalp — lacerations, haematomas, step-off, depression",
          "Basilar skull fracture: Battle sign (mastoid bruising), raccoon eyes, haemotympanum, CSF otorrhoea/rhinorrhoea",
          "Fontanelle (infants): bulging suggests ↑ICP, sunken suggests dehydration",
          "Penetrating injuries: do NOT remove impaled objects — stabilise in place",
        ]},
        { title: "Face", items: [
          "Facial fractures: LeFort I/II/III, zygomatic, mandibular, nasal",
          "Malocclusion, intraoral bleeding, dental avulsion",
          "Periorbital haematoma, enophthalmos, diplopia — orbital fracture",
          "Facial bleeding into airway — highest priority airway threat",
        ]},
        { title: "Neck / C-Spine", items: [
          "Midline cervical tenderness, step-off, guarding → immobilise until cleared",
          "Tracheal deviation, surgical emphysema, expanding haematoma",
          "JVD: raises suspicion for cardiac tamponade or tension pneumothorax",
          "Carotid haematoma or bruit — carotid/vertebral artery injury (BCVI)",
          "NEXUS / Canadian C-Spine rules not validated in children <8 yr — clinical and CT as guided",
        ]},
      ],
    },
    chest: {
      tone: "blue",
      groups: [
        { title: "Life-Threatening Injuries (must find in primary survey)", items: [
          "Tension pneumothorax — immediate needle decompression",
          "Open pneumothorax — 3-sided dressing",
          "Massive haemothorax — ICC + blood transfusion",
          "Flail chest — adequate analgesia, consider CPAP/intubation",
          "Cardiac tamponade — pericardiocentesis, thoracotomy",
          "Aortic injury — CXR: widened mediastinum, blurred aortic knob",
        ]},
        { title: "Potentially Serious Injuries", items: [
          "Pulmonary contusion: silent initially; CXR may lag by 6–12 hrs",
          "Rib fractures: rare in children (ribs are elastic); presence suggests HIGH force",
          "Myocardial contusion: arrhythmia, ST changes on ECG — troponin + continuous monitoring",
          "Oesophageal rupture: surgical emphysema, mediastinitis — rare but lethal",
          "Diaphragmatic injury: bowel sounds in chest, elevated hemidiaphragm",
        ]},
      ],
    },
    abdomen: {
      tone: "emerald",
      groups: [
        { title: "Blunt Abdominal Trauma (most common in paediatric)", items: [
          "Solid organ injury (liver, spleen, kidney) — most managed non-operatively",
          "Seat belt sign: abdominal bruising + lumbar spine injury (Chance fracture)",
          "Handlebar injury: duodenal haematoma / pancreatic injury — delayed presentation",
          "FAST: free fluid in Morrison's pouch, splenorenal recess, pelvis, pericardium",
          "CT abdomen-pelvis with IV contrast: gold standard — only if haemodynamically stable",
          "Unstable + FAST positive → OR without CT",
        ]},
        { title: "Surgical Referral Triggers", items: [
          "Peritonitis on exam, evisceration, impaled object",
          "Haemodynamic instability not responding to resuscitation",
          "Free air on imaging — hollow viscus injury",
          "FAST positive with shock — immediate OR",
          "Increasing pain / peritonism on serial exams",
        ]},
      ],
    },
    spine: {
      tone: "amber",
      groups: [
        { title: "Spinal Cord Injury", items: [
          "Spinal cord injury without radiological abnormality (SCIWORA) — unique to children; MRI gold standard",
          "Neurogenic shock: hypotension + bradycardia + warm skin (vasodilation)",
          "Priapism in males → suggests spinal injury",
          "In-line stabilisation until clinically and radiologically cleared",
          "Steroids NOT recommended for acute SCI (NASCIS 3 evidence withdrawn)",
        ]},
        { title: "Pelvic Fracture", items: [
          "Pelvic binder immediately at greater trochanters if suspected — reduces pelvic volume by 30%",
          "Pelvic fracture = major haemorrhage source — can lose full EBV into pelvis",
          "Classification: stable (lateral compression) vs unstable (open book, vertical shear)",
          "Activate MTP early — pelvic haemorrhage often requires angioembolisation + blood products",
          "Avoid pelvic exam in unstable pelvis — may displace fracture",
          "Open pelvic fracture: pack + antibiotics + urgent IR/surgical haemostasis",
        ]},
      ],
    },
    limbs: {
      tone: "orange",
      groups: [
        { title: "Extremity Injuries", items: [
          "Vascular assessment: 6 P's — Pain, Pallor, Pulselessness, Paraesthesia, Paralysis, Poikilothermia",
          "Compartment syndrome: pain out of proportion + pain on passive stretch → fasciotomy",
          "Crush injuries: rhabdomyolysis — aggressive IV fluids, urine dipstick (myoglobin), monitor creatinine",
          "Long bone fractures: femur fracture can cause 500–1000 mL blood loss in adults (proportionally less in children)",
          "Splint, traction splint for femur fractures — reduces pain and blood loss",
          "Neurovascular exam before and after splinting — document in notes",
        ]},
        { title: "Paediatric-Specific Fractures", items: [
          "Physeal (growth plate) fractures — Salter-Harris classification: SH3+ need orthopaedic review",
          "Greenstick/torus fractures — incomplete cortical break — typically treated conservatively",
          "Non-accidental injury (NAI): multiple fractures at different stages, unusual pattern (posterior rib, metaphyseal corner), inconsistent history — mandatory safeguarding referral",
        ]},
      ],
    },
    burns: {
      tone: "red",
      groups: [
        { title: "Burns Assessment (Paediatric)", items: [
          "Rule of 9 modified for children: head = 18% (≥2× adult proportion), each leg = 14%",
          "Lund & Browder chart preferred for accuracy in children",
          "Airway burns: hoarse voice, stridor, singed nasal hair, soot in mouth/throat, facial burns → early intubation (airway oedema progresses rapidly)",
          "Circumferential burns: escharotomy for limb / chest burns causing vascular or ventilatory compromise",
        ]},
        { title: "Parkland Formula (Burns Fluids)", items: [
          "Fluid resuscitation: 3 mL × weight (kg) × %TBSA (Hartmann/LR) over 24 hr",
          "Half in first 8 hr from time of burn (NOT from time of arrival), second half over next 16 hr",
          "Add maintenance fluids separately (4-2-1 rule)",
          "Target UO: 1 mL/kg/hr (children) — titrate fluid to UO",
          "Do NOT use Parkland for electrical burns — titrate to UO ≥1 mL/kg/hr to prevent myoglobinuria",
          "≥15% TBSA: early surgical referral; ≥10% in children <5 yr",
        ]},
      ],
    },
  };

  const active = content[section];

  return (
    <div className="space-y-4">
      <InfoBox tone="sky" icon={Pulse}>
        Secondary survey is a head-to-toe examination after primary survey and initial resuscitation. Do not begin until xABCDE complete and patient haemodynamically stable.
      </InfoBox>

      <div className="flex flex-wrap gap-1.5">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
              section === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{s.label}</button>
        ))}
      </div>

      <div className="space-y-4">
        {active.groups.map(g => (
          <SectionCard key={g.title} tone={active.tone} title={g.title}>
            <BulletList tone={active.tone} items={g.items} />
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

// ─── TAB 5: SCORES ─────────────────────────────────────────────────────────────
function TraumaScoresView() {
  const { weight } = useWeight();
  const [gcsE, setGcsE] = useState(4);
  const [gcsV, setGcsV] = useState(5);
  const [gcsM, setGcsM] = useState(6);
  const [sbp,  setSbp]  = useState(90);
  const [rr,   setRr]   = useState(20);

  const gcsTotal = gcsE + gcsV + gcsM;

  // Revised Trauma Score
  const gcsRts  = gcsTotal >= 13 ? 4 : gcsTotal >= 9 ? 3 : gcsTotal >= 6 ? 2 : gcsTotal >= 4 ? 1 : 0;
  const sbpRts  = sbp >= 90 ? 4 : sbp >= 76 ? 3 : sbp >= 50 ? 2 : sbp > 0 ? 1 : 0;
  const rrRts   = (rr >= 10 && rr <= 29) ? 4 : rr > 29 ? 3 : (rr >= 6 && rr <= 9) ? 2 : (rr >= 1 && rr <= 5) ? 1 : 0;
  const rts     = +(gcsRts * 0.9368 + sbpRts * 0.7326 + rrRts * 0.2908).toFixed(2);
  const rtsSurv = rts >= 7 ? ">95%" : rts >= 5 ? "~75%" : rts >= 3 ? "~50%" : "<25%";
  const rtsTone = rts >= 6 ? "emerald" : rts >= 4 ? "amber" : "red";

  // SIPA (Shock Index Paediatric Age-Adjusted) — approximation
  const estimatedAge = Math.max(1, Math.round((weight - 9) / 2));
  const si = +(120 / Math.max(sbp, 1)).toFixed(2); // rough: using 120 as representative HR

  return (
    <div className="space-y-5">
      <InfoBox tone="blue" icon={ClipboardText}>
        Trauma scores aid triage and outcome prediction. They are tools — not substitutes for clinical judgement. Calculate post-resuscitation GCS for accuracy.
      </InfoBox>

      {/* RTS Calculator */}
      <SectionCard tone="blue" title="Revised Trauma Score (RTS) Calculator">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {/* GCS */}
            <div className="space-y-2">
              <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">GCS Total</div>
              <div className="flex items-center gap-3">
                <button onClick={() => setGcsE(Math.max(1, gcsE-1))} className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800">−</button>
                <div className="text-center">
                  <div className="font-black text-2xl text-violet-600 dark:text-violet-400"
                       style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{gcsTotal}</div>
                  <div className="text-[9px] font-mono text-slate-400">E{gcsE}+V{gcsV}+M{gcsM}</div>
                </div>
                <button onClick={() => setGcsE(Math.min(4, gcsE+1))} className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800">+</button>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center">
                {[{l:"E",v:gcsE,set:setGcsE,max:4},{l:"V",v:gcsV,set:setGcsV,max:5},{l:"M",v:gcsM,set:setGcsM,max:6}].map(c => (
                  <div key={c.l}>
                    <div className="font-mono text-[8px] text-slate-400">{c.l}</div>
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => c.set(Math.min(c.max, c.v+1))} className="text-[9px] rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">▲</button>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{c.v}</div>
                      <button onClick={() => c.set(Math.max(1, c.v-1))} className="text-[9px] rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">▼</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* SBP */}
            <div className="space-y-2">
              <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Systolic BP (mmHg)</div>
              <input type="range" min={0} max={180} step={5} value={sbp}
                onChange={e => setSbp(Number(e.target.value))}
                className="w-full accent-blue-500" />
              <div className="font-black text-2xl text-blue-600 dark:text-blue-400 text-center"
                   style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{sbp}</div>
              <div className="text-[9px] font-mono text-center text-slate-400">
                {sbp >= 90 ? "Normal" : sbp >= 76 ? "Mild ↓" : sbp >= 50 ? "Moderate ↓" : "Severe ↓"}
              </div>
            </div>
            {/* RR */}
            <div className="space-y-2">
              <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Resp Rate (/min)</div>
              <input type="range" min={0} max={50} step={1} value={rr}
                onChange={e => setRr(Number(e.target.value))}
                className="w-full accent-emerald-500" />
              <div className="font-black text-2xl text-emerald-600 dark:text-emerald-400 text-center"
                   style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{rr}</div>
              <div className="text-[9px] font-mono text-center text-slate-400">
                {rr === 0 ? "Apnoeic" : rr < 6 ? "Severe ↓" : rr <= 9 ? "Slow" : rr <= 29 ? "Normal" : "Tachypnoeic"}
              </div>
            </div>
          </div>

          {/* RTS Result */}
          <div className={`rounded-xl border p-4 ${TONE[rtsTone].bg} ${TONE[rtsTone].border}`}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">RTS Score</div>
                <div className={`font-black text-3xl ${TONE[rtsTone].text}`}
                     style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{rts}</div>
                <div className="text-[9px] font-mono text-slate-400">max 7.84</div>
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">Survival (Ps)</div>
                <div className={`font-black text-2xl ${TONE[rtsTone].text}`}
                     style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{rtsSurv}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">Triage</div>
                <div className={`font-bold text-sm ${TONE[rtsTone].text}`}
                     style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                  {rts >= 7.84 ? "Minor" : rts >= 4 ? "Delayed/Urgent" : "Immediate / Black"}
                </div>
                <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                  GCS coded {gcsRts} · SBP coded {sbpRts} · RR coded {rrRts}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Score Reference Table */}
      <SectionCard tone="slate" title="Trauma Score Quick Reference">
        <div className="space-y-4 text-xs">
          {[
            {
              name: "Revised Trauma Score (RTS)",
              calc: "GCS(coded) × 0.94 + SBP(coded) × 0.73 + RR(coded) × 0.29",
              interp: ["7.84 = minor", "4–7.83 = delayed/urgent", "<4 = immediate or expectant"],
              tone: "blue",
              use: "Triage + survival prediction. Used in TRISS calculation."
            },
            {
              name: "Paediatric Trauma Score (PTS)",
              calc: "Sum of 6 components (+2/+1/−1): Weight >20kg / 10–20kg / <10kg · Airway · SBP · CNS · Wound · Skeletal",
              interp: [">8 = minor", "0–8 = potentially life-threatening", "<0 = survival unlikely"],
              tone: "violet",
              use: "Validated triage tool specifically for children. Better than RTS for paediatrics."
            },
            {
              name: "Injury Severity Score (ISS)",
              calc: "Sum of squares of 3 highest AIS scores across body regions",
              interp: ["<9 = minor", "9–15 = moderate", "16–24 = serious", "≥25 = critical/severe"],
              tone: "amber",
              use: "Definitive anatomical scoring. Retrospective. ISS ≥25 = major trauma."
            },
            {
              name: "SIPA (Shock Index Paediatric Age-Adjusted)",
              calc: "HR ÷ SBP, adjusted for age-specific normal HR range",
              interp: ["<1 = normal", "1–1.22 (infant) / 1–1.0 (school age) = borderline", "Above threshold = abnormal"],
              tone: "red",
              use: "Early predictor of major trauma, need for blood transfusion, ICU admission. More sensitive than HR or BP alone."
            },
          ].map(score => {
            const t = TONE[score.tone];
            return (
              <div key={score.name} className={`rounded-xl border p-3 bg-white dark:bg-slate-900/50 ${t.border}`}>
                <div className={`font-bold text-sm mb-0.5 ${t.text}`}
                     style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{score.name}</div>
                <div className="text-[10px] font-mono text-slate-400 mb-2">{score.use}</div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 font-mono text-[10px] text-slate-500 dark:text-slate-400 mb-2">
                  {score.calc}
                </div>
                <div className="flex flex-wrap gap-2">
                  {score.interp.map((s, i) => (
                    <span key={i} className={`text-[10px] font-mono px-2 py-0.5 rounded border ${t.bg} ${t.border} ${t.text}`}>{s}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────
const TABS = [
  { id: "primary",   label: "Primary Survey",   Icon: Siren       },
  { id: "shock",     label: "Shock & Fluids",   Icon: Drop        },
  { id: "tbi",       label: "Head Injury / TBI",Icon: Brain       },
  { id: "secondary", label: "Secondary Survey", Icon: Pulse       },
  { id: "scores",    label: "Trauma Scores",    Icon: ClipboardText },
];

export default function TraumaTab() {
  const { weight }  = useWeight();
  const [activeTab, setActiveTab] = useState("primary");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Trauma Resuscitation
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Calculations for{" "}
          <span className="font-bold text-slate-900 dark:text-white">{weight} kg</span> ·
          ATLS 11th ed (ACS 2025) · PALS 2020 · APLS · CRASH-2 · Paediatric Surgery NatCertBoard
        </p>
      </div>

      <InfoBox tone="red" icon={Warning}>
        ATLS 11 (2025): Algorithm is now <strong>xABCDE</strong> — exsanguinating haemorrhage control FIRST.
        Blood products over crystalloid. TXA within 3 hours. No permissive hypotension in TBI.
      </InfoBox>

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

      {activeTab === "primary"   && <PrimarySurveyView />}
      {activeTab === "shock"     && <ShockFluidsView />}
      {activeTab === "tbi"       && <TBIView />}
      {activeTab === "secondary" && <SecondarySurveyView />}
      {activeTab === "scores"    && <TraumaScoresView />}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        ATLS 11th ed · ACS 2025 · PALS 2020 · CRASH-2 · APLS · Broselow · TIC-TOC trial ·
        Paediatric Surgery NatCertBoard · Evidence-based; always verify against local institutional protocols.
      </div>
    </div>
  );
}
