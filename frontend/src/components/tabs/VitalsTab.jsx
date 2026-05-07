// VitalsTab.jsx — Unified Patient Monitoring Hub
// Sub-tabs: Live Calculator · Reference Table · Quick Reference · ECG & Rhythms · Vitals Trending
// Sources: AHA PALS 2020 · APLS · ESC Paediatric EP Guidelines 2021

import { useState, useMemo, useEffect } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Thermometer, Wind, Heartbeat, Waveform, Warning,
  CheckCircle, XCircle, ArrowRight, Lightbulb, Table,
  Lightning, Pulse, Plus, Trash, Download, User, Info,
} from "@phosphor-icons/react";
import { VITALS_ROWS, TEMP_NOTES, SPO2_NOTES, minSBP } from "../../data/vitals";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

// ─── SHARED COLOUR MAP ─────────────────────────────────────────────────────────
const TONE = {
  red:     { text: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-950/30",       border: "border-red-200 dark:border-red-800"       },
  emerald: { text: "text-emerald-600 dark:text-emerald-400",bg: "bg-emerald-50 dark:bg-emerald-950/30",border: "border-emerald-200 dark:border-emerald-800"},
  amber:   { text: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-amber-200 dark:border-amber-800"   },
  blue:    { text: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200 dark:border-blue-800"     },
  violet:  { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800" },
  slate:   { text: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-50 dark:bg-slate-900/50",   border: "border-slate-200 dark:border-slate-700"   },
};

// Static abnormal border classes — dynamic string interpolation is purged by Tailwind
const ABNORMAL_BORDER = {
  red:     "border-red-300 dark:border-red-700",
  emerald: "border-emerald-300 dark:border-emerald-700",
  amber:   "border-amber-300 dark:border-amber-700",
  blue:    "border-blue-300 dark:border-blue-700",
  violet:  "border-violet-300 dark:border-violet-700",
  slate:   "border-slate-300 dark:border-slate-600",
};

function InfoBox({ tone = "amber", icon: Icon, title, children }) {
  const t = TONE[tone];
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${t.bg} ${t.border} ${t.text}`}>
      {Icon && <Icon size={13} weight="fill" className="flex-shrink-0 mt-0.5" />}
      <div><strong>{title}</strong>{title ? " — " : ""}{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — LIVE CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════════

function getThresholds(ageYears) {
  if (ageYears < 0.084) return { hrLo: 100, hrHi: 165, rr: [40, 60], sbpMin: 60,  sbpHi: 90,  dbpHi: 60,  label: "Neonate (<1 mo)"    };
  if (ageYears < 0.5)   return { hrLo: 100, hrHi: 165, rr: [30, 60], sbpMin: 70,  sbpHi: 104, dbpHi: 56,  label: "Infant 1–5 mo"      };
  if (ageYears < 1)     return { hrLo: 90,  hrHi: 150, rr: [25, 50], sbpMin: 72,  sbpHi: 112, dbpHi: 66,  label: "Infant 6–11 mo"     };
  if (ageYears < 2)     return { hrLo: 90,  hrHi: 150, rr: [20, 40], sbpMin: 74,  sbpHi: 112, dbpHi: 74,  label: "Toddler 1–2 yr"     };
  if (ageYears < 5)     return { hrLo: 70,  hrHi: 140, rr: [20, 35], sbpMin: 78,  sbpHi: 116, dbpHi: 76,  label: "Pre-school 3–5 yr"  };
  if (ageYears < 10)    return { hrLo: 60,  hrHi: 130, rr: [15, 30], sbpMin: 80,  sbpHi: 122, dbpHi: 78,  label: "School age 6–9 yr"  };
  if (ageYears < 13)    return { hrLo: 60,  hrHi: 120, rr: [12, 25], sbpMin: 90,  sbpHi: 126, dbpHi: 82,  label: "Pre-teen 10–12 yr"  };
  return                        { hrLo: 55,  hrHi: 100, rr: [12, 20], sbpMin: 90,  sbpHi: 136, dbpHi: 86,  label: "Adolescent ≥13 yr" };
}

function StatusBadge({ ok }) {
  return ok
    ? <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400"><CheckCircle size={10} weight="fill" />Normal</span>
    : <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-red-600 dark:text-red-400"><XCircle size={10} weight="fill" />Abnormal</span>;
}

function NumInput({ label, value, onChange, unit, min = 0, max = 999 }) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{label}</label>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-base flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700">−</button>
        <input type="number" value={value} min={min} max={max}
          onChange={e => onChange(Math.max(min, Math.min(max, +e.target.value || min)))}
          className="w-20 text-center font-mono font-bold text-lg border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-400 py-1" />
        <button onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-base flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700">+</button>
        <span className="text-xs text-slate-400 font-mono ml-1">{unit}</span>
      </div>
    </div>
  );
}

function LiveCalculator() {
  const { weight } = useWeight();
  const [ageYears, setAgeYears] = useState(2);
  const [hrVal,    setHrVal]    = useState(110);
  const [rrVal,    setRrVal]    = useState(28);
  const [sbpVal,   setSbpVal]   = useState(90);
  const [dbpVal,   setDbpVal]   = useState(60);
  const [tempVal,  setTempVal]  = useState(37);
  const [spo2Val,  setSpo2Val]  = useState(98);

  const thr   = useMemo(() => getThresholds(ageYears), [ageYears]);
  const minBP = minSBP ? minSBP(weight) : 70 + (2 * ageYears);

  const hrOk   = hrVal  >= thr.hrLo  && hrVal  <= thr.hrHi;
  const rrOk   = rrVal  >= thr.rr[0] && rrVal  <= thr.rr[1];
  const sbpOk  = sbpVal >= thr.sbpMin && sbpVal <= thr.sbpHi;
  const dbpOk  = dbpVal <= thr.dbpHi;
  const tempOk = tempVal < 38;
  const spo2Ok = spo2Val >= 94;

  const alerts = [
    !hrOk   && (hrVal < thr.hrLo ? `Bradycardia: HR ${hrVal} < ${thr.hrLo} bpm` : `Tachycardia: HR ${hrVal} > ${thr.hrHi} bpm`),
    !rrOk   && (rrVal < thr.rr[0] ? `Bradypnoea: RR ${rrVal} < ${thr.rr[0]}/min` : `Tachypnoea: RR ${rrVal} > ${thr.rr[1]}/min`),
    !sbpOk  && (sbpVal < thr.sbpMin ? `Hypotension: SBP ${sbpVal} < ${thr.sbpMin} mmHg` : `Hypertension: SBP ${sbpVal} > ${thr.sbpHi} mmHg`),
    sbpVal < minBP && `Below formula min SBP: ${sbpVal} < ${minBP} mmHg [70 + 2×age]`,
    !tempOk && `Fever: ${tempVal}°C ≥ 38°C`,
    !spo2Ok && `Hypoxia: SpO₂ ${spo2Val}% < 94%`,
    hrVal < 60 && weight && `HR <60 with poor perfusion → START CPR`,
  ].filter(Boolean);

  const allNormal = alerts.length === 0;

  const ageOptions = [
    { label: "<1 mo", val: 0.04 }, { label: "3 mo", val: 0.25 }, { label: "6 mo", val: 0.5 },
    { label: "1 yr",  val: 1    }, { label: "2 yr",  val: 2    }, { label: "5 yr", val: 5  },
    { label: "8 yr",  val: 8    }, { label: "12 yr", val: 12   }, { label: "16 yr",val: 16 },
  ];

  const statCards = [
    { label: "Heart Rate",   val: `${hrVal} bpm`,   range: `${thr.hrLo}–${thr.hrHi} bpm`,    ok: hrOk,   tone: "red"     },
    { label: "Resp Rate",    val: `${rrVal}/min`,   range: `${thr.rr[0]}–${thr.rr[1]}/min`,  ok: rrOk,   tone: "emerald" },
    { label: "Systolic BP",  val: `${sbpVal} mmHg`, range: `${thr.sbpMin}–${thr.sbpHi} mmHg`,ok: sbpOk,  tone: "blue"    },
    { label: "Diastolic BP", val: `${dbpVal} mmHg`, range: `≤${thr.dbpHi} mmHg`,             ok: dbpOk,  tone: "blue"    },
    { label: "Temperature",  val: `${tempVal}°C`,   range: "< 38°C",                          ok: tempOk, tone: "amber"   },
    { label: "SpO₂",         val: `${spo2Val}%`,    range: "≥ 94%",                           ok: spo2Ok, tone: "violet"  },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-2">Patient Age Band</div>
        <div className="flex flex-wrap gap-1.5">
          {ageOptions.map(a => (
            <button key={a.label} onClick={() => setAgeYears(a.val)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-wider transition-all ${
                ageYears === a.val
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
              }`}>{a.label}</button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-mono text-xs text-slate-500">{thr.label}</span>
          <span className="font-mono text-[10px] text-slate-400">· Min SBP: {Math.round(minBP)} mmHg</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <NumInput label="Heart Rate"   value={hrVal}   onChange={setHrVal}   unit="bpm"  min={20} max={300} />
        <NumInput label="Resp Rate"    value={rrVal}   onChange={setRrVal}   unit="/min" min={5}  max={80}  />
        <NumInput label="Systolic BP"  value={sbpVal}  onChange={setSbpVal}  unit="mmHg" min={30} max={200} />
        <NumInput label="Diastolic BP" value={dbpVal}  onChange={setDbpVal}  unit="mmHg" min={20} max={150} />
        <NumInput label="Temperature"  value={tempVal} onChange={setTempVal} unit="°C"   min={33} max={43}  />
        <NumInput label="SpO₂"         value={spo2Val} onChange={setSpo2Val} unit="%"    min={60} max={100} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map(card => (
          <div key={card.label} className={`rounded-xl border p-3 bg-white dark:bg-slate-900 ${
            card.ok ? "border-emerald-200 dark:border-emerald-800" : ABNORMAL_BORDER[card.tone]
          }`}>
            <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">{card.label}</div>
            <div className={`font-black text-xl leading-none mb-1 ${card.ok ? "text-slate-800 dark:text-white" : "text-red-600 dark:text-red-400"}`}
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{card.val}</div>
            <div className="font-mono text-[9px] text-slate-400 mb-1.5">Normal: {card.range}</div>
            <StatusBadge ok={card.ok} />
          </div>
        ))}
      </div>

      {allNormal ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
          <CheckCircle size={16} weight="fill" className="text-emerald-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">All vitals within normal range for {thr.label}</span>
        </div>
      ) : (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Warning size={14} weight="fill" className="text-red-500" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400">
              {alerts.length} Alert{alerts.length > 1 ? "s" : ""} — {thr.label}
            </span>
          </div>
          {alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
              <ArrowRight size={11} weight="bold" className="text-red-500 flex-shrink-0 mt-0.5" />{a}
            </div>
          ))}
        </div>
      )}

      <div className={`rounded-xl border p-3 ${TONE.amber.border} ${TONE.amber.bg}`}>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={12} weight="fill" className="text-amber-500" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400">BP Formula Reference</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 text-xs text-amber-800 dark:text-amber-200 font-mono">
          <div>Min SBP (1–10 yr): <strong>70 + (2 × age)</strong> = <strong>{Math.round(minBP)} mmHg</strong></div>
          <div>Min SBP (neonate): <strong>≥ 60 mmHg</strong></div>
          <div>5th percentile SBP: <strong>{thr.sbpMin} mmHg</strong> for {thr.label}</div>
          <div>Hypotension (PALS): SBP &lt; {Math.round(minBP)} mmHg → treat</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — QUICK REFERENCE
// ═══════════════════════════════════════════════════════════════════════════════
function ReferenceTable() {
  const { weight } = useWeight();
  const [highlightAge, setHighlightAge] = useState(null);

  const suggestedIdx = useMemo(() => {
    if (!weight || !VITALS_ROWS) return null;
    const idx = VITALS_ROWS.findIndex(r => parseFloat(r.weight) >= weight);
    return idx >= 0 ? idx : VITALS_ROWS.length - 1;
  }, [weight]);

  return (
    <div className="space-y-4">
      <InfoBox tone="sky" icon={Lightbulb}>
        Click any row to highlight it. Row matching current weight ({weight} kg) is pre-highlighted in blue.
      </InfoBox>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 dark:bg-slate-950 text-white">
              {[
                { k: "age", label: "Age Band"   },
                { k: "hr",  label: "HR (bpm)"   },
                { k: "rr",  label: "RR (/min)"  },
                { k: "sbp", label: "SBP (mmHg)" },
                { k: "dbp", label: "DBP (mmHg)" },
              ].map(c => (
                <th key={c.k} className="p-3 text-left font-mono text-[10px] uppercase tracking-widest">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VITALS_ROWS.map((r, i) => {
              const isSuggested   = i === suggestedIdx;
              const isHighlighted = highlightAge === r.age;
              let rowCls = "border-t border-slate-200 dark:border-slate-800 cursor-pointer transition-colors ";
              if      (isHighlighted) rowCls += "bg-violet-100 dark:bg-violet-950/50 ";
              else if (isSuggested)   rowCls += "bg-blue-50 dark:bg-blue-950/30 ";
              else                    rowCls += "odd:bg-slate-50 dark:odd:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/50 ";
              return (
                <tr key={r.age} className={rowCls} onClick={() => setHighlightAge(isHighlighted ? null : r.age)}>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {r.age}
                    {isSuggested && !isHighlighted && (
                      <span className="ml-2 text-[8px] font-mono uppercase tracking-widest text-blue-500 border border-blue-200 dark:border-blue-800 rounded px-1 py-0.5">current wt</span>
                    )}
                  </td>
                  <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">{r.hr}</td>
                  <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{r.rr}</td>
                  <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">{r.sbp}</td>
                  <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{r.dbp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800" />Weight match</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800" />Selected row</span>
      </div>
    </div>
  );
}

function QuickReference() {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className={`rounded-xl border p-4 ${TONE.amber.border} ${TONE.amber.bg}`}>
          <div className="flex items-center gap-2 mb-3">
            <Thermometer size={15} weight="fill" className="text-amber-500" />
            <span className="font-bold text-sm text-amber-700 dark:text-amber-300"
                  style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Temperature</span>
          </div>
          <div className="space-y-1.5">
            {(TEMP_NOTES || [
              "Fever: ≥ 38.0°C rectal · ≥ 37.8°C axillary · ≥ 38.0°C tympanic",
              "Hyperthermia: ≥ 40°C — heat stroke, malignant hyperthermia, NMS",
              "Hypothermia: < 36.0°C — coagulopathy, arrhythmia, impaired metabolism",
              "Neonates may NOT mount fever with serious bacterial infection",
              "Antipyretics treat discomfort but do NOT prevent febrile seizures",
            ]).map((note, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200">
                <ArrowRight size={10} weight="bold" className="text-amber-500 flex-shrink-0 mt-0.5" />{note}
              </div>
            ))}
          </div>
        </div>
        <div className={`rounded-xl border p-4 ${TONE.violet.border} ${TONE.violet.bg}`}>
          <div className="flex items-center gap-2 mb-3">
            <Wind size={15} weight="bold" className="text-violet-500" />
            <span className="font-bold text-sm text-violet-700 dark:text-violet-300"
                  style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Oxygenation</span>
          </div>
          <div className="space-y-1.5">
            {(SPO2_NOTES || [
              "Normal SpO₂: ≥ 94% on room air at sea level",
              "Mild hypoxia: 90–93% — supplemental O₂ indicated",
              "Moderate hypoxia: 85–89% — high-flow O₂ or NIV/HFNC",
              "Severe hypoxia: < 85% — intubation likely required",
              "Neonates: pre-ductal SpO₂ (right hand) vs post-ductal (foot) — difference >5% suggests PPHN",
              "Cyanosis visible at ~80–85% — unreliable in anaemia or dark skin",
            ]).map((note, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-violet-800 dark:text-violet-200">
                <ArrowRight size={10} weight="bold" className="text-violet-500 flex-shrink-0 mt-0.5" />{note}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-900 dark:bg-slate-950">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white">PALS 2020 — Abnormal Vital Signs at a Glance</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-slate-500">Age</th>
                <th className="p-2.5 text-center font-mono text-[9px] uppercase tracking-widest text-red-500">Tachycardia</th>
                <th className="p-2.5 text-center font-mono text-[9px] uppercase tracking-widest text-blue-500">Bradycardia</th>
                <th className="p-2.5 text-center font-mono text-[9px] uppercase tracking-widest text-emerald-600">Tachypnoea</th>
                <th className="p-2.5 text-center font-mono text-[9px] uppercase tracking-widest text-amber-500">Hypotension</th>
              </tr>
            </thead>
            <tbody>
              {[
                { age: "Neonate",          tachy: ">165", brady: "<100", tachRR: ">60", hypoBP: "<60" },
                { age: "Infant 1–11 mo",   tachy: ">150", brady: "<90",  tachRR: ">50", hypoBP: "<70" },
                { age: "Toddler 1–2 yr",   tachy: ">150", brady: "<90",  tachRR: ">40", hypoBP: "<74" },
                { age: "Pre-school 3–5 yr",tachy: ">140", brady: "<70",  tachRR: ">35", hypoBP: "<78" },
                { age: "School 6–9 yr",    tachy: ">130", brady: "<60",  tachRR: ">30", hypoBP: "<80" },
                { age: "Pre-teen 10–12 yr",tachy: ">120", brady: "<60",  tachRR: ">25", hypoBP: "<90" },
                { age: "Adolescent ≥13 yr",tachy: ">100", brady: "<55",  tachRR: ">20", hypoBP: "<90" },
              ].map((r, i) => (
                <tr key={r.age} className={`border-t border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? "bg-white dark:bg-slate-900/30" : "bg-slate-50/50 dark:bg-slate-900/50"}`}>
                  <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-200">{r.age}</td>
                  <td className="p-2.5 text-center font-mono font-bold text-red-600 dark:text-red-400">{r.tachy}</td>
                  <td className="p-2.5 text-center font-mono font-bold text-blue-600 dark:text-blue-400">{r.brady}</td>
                  <td className="p-2.5 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">{r.tachRR}</td>
                  <td className="p-2.5 text-center font-mono font-bold text-amber-600 dark:text-amber-400">{r.hypoBP}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3">Key Formulas</div>
        <div className="grid sm:grid-cols-2 gap-2 font-mono text-xs text-slate-700 dark:text-slate-200">
          {[
            { label: "Min SBP (1–10 yr)", val: "70 + (2 × age in years) mmHg" },
            { label: "CPR Trigger",        val: "HR <60 bpm + poor perfusion → start CPR" },
            { label: "Fluid Bolus",        val: "20 mL/kg NS/LR IV over 5–15 min" },
            { label: "Defibrillation",     val: "4 J/kg (mono/biphasic)" },
          ].map(f => (
            <div key={f.label} className="bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">{f.label}</div>
              <strong>{f.val}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — ECG & RHYTHM RECOGNITION
// ═══════════════════════════════════════════════════════════════════════════════

// ── ECG grid background ──
function GridLines({ w = 700, h = 100 }) {
  const sm = 14, lg = 70;
  return (
    <g>
      {Array.from({ length: Math.ceil(w / sm) + 1 }, (_, i) => (
        <line key={`vs${i}`} x1={i*sm} y1={0} x2={i*sm} y2={h} stroke="#fca5a5" strokeWidth="0.3" strokeOpacity="0.4" />
      ))}
      {Array.from({ length: Math.ceil(h / sm) + 1 }, (_, i) => (
        <line key={`hs${i}`} x1={0} y1={i*sm} x2={w} y2={i*sm} stroke="#fca5a5" strokeWidth="0.3" strokeOpacity="0.4" />
      ))}
      {Array.from({ length: Math.ceil(w / lg) + 1 }, (_, i) => (
        <line key={`vl${i}`} x1={i*lg} y1={0} x2={i*lg} y2={h} stroke="#fca5a5" strokeWidth="0.8" strokeOpacity="0.5" />
      ))}
      {Array.from({ length: Math.ceil(h / lg) + 1 }, (_, i) => (
        <line key={`hl${i}`} x1={0} y1={i*lg} x2={w} y2={i*lg} stroke="#fca5a5" strokeWidth="0.8" strokeOpacity="0.5" />
      ))}
    </g>
  );
}

function qrsComplex(x, y, { prSeg=28, qDip=6, rHeight=38, sDip=14, stSeg=21, tHeight=14 } = {}) {
  const pEnd = x + 18, qStart = x + prSeg, rPeak = qStart + 8, sPeak = qStart + 14, sEnd = qStart + 20;
  const tPeak = sEnd + stSeg + 8, tEnd = sEnd + stSeg + 18;
  return [
    `M${x},${y}`,
    `C${x+4},${y} ${x+6},${y-8} ${x+10},${y-8}`,
    `C${x+14},${y-8} ${pEnd-2},${y} ${pEnd},${y}`,
    `L${qStart},${y} L${qStart+3},${y+qDip} L${rPeak},${y-rHeight}`,
    `L${sPeak},${y+sDip} L${sEnd},${y} L${sEnd+stSeg},${y}`,
    `C${sEnd+stSeg+4},${y} ${sEnd+stSeg+6},${y-tHeight} ${tPeak},${y-tHeight}`,
    `C${tPeak+4},${y-tHeight} ${tEnd-2},${y} ${tEnd},${y}`,
  ].join(" ");
}

const Strips = {
  nsr: () => {
    const y = 55, xs = [60, 200, 340, 480, 620];
    return <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines /><path d={xs.map(x => qrsComplex(x, y)).join(" ")} fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1={y} x2="60" y2={y} stroke="#1e293b" strokeWidth="1.8" />
      <line x1={xs[xs.length-1]+88} y1={y} x2="700" y2={y} stroke="#1e293b" strokeWidth="1.8" />
    </svg>;
  },
  sinustachy: () => {
    const y = 55, xs = [30, 130, 230, 330, 430, 530, 630];
    return <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines /><path d={xs.map(x => qrsComplex(x, y, { prSeg: 20 })).join(" ")} fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1={y} x2="30" y2={y} stroke="#1e293b" strokeWidth="1.8" />
    </svg>;
  },
  svt: () => {
    const y = 55, xs = [20, 95, 170, 245, 320, 395, 470, 545, 620];
    return <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines />
      {xs.map(x => <path key={x} d={`M${x},${y} L${x+3},${y+4} L${x+7},${y-36} L${x+12},${y+10} L${x+16},${y} L${x+34},${y}`} fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />)}
      <line x1="0" y1={y} x2="20" y2={y} stroke="#dc2626" strokeWidth="1.8" />
    </svg>;
  },
  vt: () => {
    const y = 55, xs = [20, 120, 220, 320, 420, 520, 620];
    return <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines />
      {xs.map(x => <path key={x} d={`M${x},${y} L${x+6},${y+12} L${x+16},${y-38} L${x+26},${y+16} L${x+36},${y+6} L${x+50},${y+2} L${x+60},${y+8} L${x+70},${y-4} L${x+80},${y} L${x+98},${y}`} fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />)}
      <line x1="0" y1={y} x2="20" y2={y} stroke="#dc2626" strokeWidth="2" />
    </svg>;
  },
  vf: () => (
    <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines />
      <path d="M0,55 C15,55 18,10 28,18 C38,26 40,80 52,72 C64,64 66,22 78,30 C90,38 92,70 104,62 C116,54 118,15 130,25 C142,35 144,78 156,68 C168,58 170,30 182,38 C194,46 196,72 208,60 C220,48 222,20 234,28 C246,36 248,80 260,70 C272,60 274,18 286,26 C298,34 300,68 312,58 C324,48 326,22 338,32 C350,42 352,76 364,64 C376,52 378,28 390,36 C402,44 404,74 416,62 C428,50 430,16 442,24 C454,32 456,80 468,68 C480,56 482,24 494,34 C506,44 508,72 520,60 C532,48 534,18 546,28 C558,38 560,76 572,64 C584,52 586,26 598,34 C610,42 612,70 624,60 C636,50 638,22 650,30 C662,38 664,80 676,68 C688,56 690,45 700,55" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  asystole: () => (
    <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines />
      <path d="M0,55 C100,55 140,52 200,57 C260,57 300,54 350,55 L700,55" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
      <text x="350" y="30" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#94a3b8">NO ELECTRICAL ACTIVITY</text>
    </svg>
  ),
  pea: () => {
    const y = 55, xs = [60, 200, 340, 480, 620];
    return <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines />
      <path d={xs.map(x => qrsComplex(x, y, { rHeight: 20, sDip: 8, tHeight: 8 })).join(" ")} fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1={y} x2="60" y2={y} stroke="#f59e0b" strokeWidth="1.8" />
      <text x="350" y="18" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#d97706">Organised activity — NO palpable pulse</text>
    </svg>;
  },
  brady: () => {
    const y = 55, xs = [40, 240, 440, 640];
    return <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines />
      <path d={xs.map(x => qrsComplex(x, y, { prSeg: 35 })).join(" ")} fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1={y} x2="40" y2={y} stroke="#3b82f6" strokeWidth="1.8" />
    </svg>;
  },
  chb: () => {
    const y = 55;
    const pWaves = [30, 80, 130, 180, 230, 280, 330, 380, 430, 480, 530, 580, 630, 680];
    const qrsList = [60, 220, 380, 540];
    return <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines />
      {pWaves.map(x => <path key={x} d={`M${x},${y} C${x+3},${y} ${x+5},${y-9} ${x+8},${y-9} C${x+11},${y-9} ${x+13},${y} ${x+16},${y}`} fill="none" stroke="#94a3b8" strokeWidth="1.2" />)}
      {qrsList.map(x => <path key={x} d={`M${x},${y} L${x+3},${y+5} L${x+10},${y-42} L${x+17},${y+14} L${x+24},${y} L${x+40},${y}`} fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />)}
      <text x="350" y="18" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#94a3b8">P waves (grey) independent from QRS — no relationship</text>
    </svg>;
  },
  wpw: () => {
    const y = 55, xs = [60, 200, 340, 480, 620];
    return <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines />
      {xs.map(x => <path key={x} d={`M${x},${y} C${x+8},${y} ${x+12},${y-6} ${x+18},${y} L${x+22},${y+4} L${x+28},${y-36} L${x+36},${y+12} L${x+42},${y} L${x+60},${y-10} C${x+68},${y-10} ${x+74},${y} ${x+82},${y} L${x+100},${y}`} fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />)}
      <line x1="0" y1={y} x2="60" y2={y} stroke="#8b5cf6" strokeWidth="1.8" />
      <text x="350" y="16" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#8b5cf6">Short PR + delta wave + wide QRS</text>
    </svg>;
  },
};

function getRhythms(weight) {
  const w = weight;
  return [
    { id: "vf",         group: "shockable",    tone: "red",     name: "Ventricular Fibrillation (VF)",        rate: "Indeterminate — chaotic",
      features: ["Chaotic irregular deflections — no organised complexes","No identifiable P, QRS, or T","Variable amplitude (coarse VF = higher)","Most common initial rhythm in witnessed arrest"],
      management: [`Immediate defibrillation: ${Math.round(w*4)} J (4 J/kg) NON-synchronised`,`CPR immediately after shock — do NOT check rhythm first`,`Adrenaline after 2nd shock: ${(w*0.01).toFixed(2)} mg IV/IO (0.01 mg/kg)`,`Amiodarone after 3rd shock: ${Math.round(w*5)} mg IV (5 mg/kg, max 300 mg)`,"Treat reversible causes: 4H4T"] },
    { id: "vt",         group: "shockable",    tone: "red",     name: "Pulseless VT (pVT)",                   rate: "150–250 bpm — wide QRS",
      features: ["Wide bizarre QRS >0.12 s (>3 small squares)","Regular or slightly irregular","No identifiable P waves","Monomorphic or polymorphic (Torsades)","No palpable pulse — treat as VF"],
      management: [`Pulseless VT = treat as VF: ${Math.round(w*4)} J non-sync immediately`,"VT with pulse + unstable: sync cardioversion with sedation",`Amiodarone (stable VT): ${Math.round(w*5)} mg/kg IV over 20–60 min`,"Torsades: IV Magnesium 25–50 mg/kg (max 2 g)","Correct QTc-prolonging drugs, hypoK⁺, hypoMg²⁺"] },
    { id: "asystole",   group: "nonshockable", tone: "slate",   name: "Asystole",                             rate: "0 bpm — no activity",
      features: ["Flat line — no electrical activity","Confirm in 2 leads — artefact can mimic","Fine VF must be excluded (increase gain)","Most common arrest rhythm in children","Usually preceded by progressive bradycardia"],
      management: ["CPR immediately — high-quality compressions",`Adrenaline ASAP: ${(w*0.01).toFixed(2)} mg IV/IO (0.01 mg/kg) — repeat every 3–5 min`,"Treat 4H4T aggressively","Do NOT defibrillate asystole — no evidence of benefit","Consider sodium bicarbonate if prolonged arrest"] },
    { id: "pea",        group: "nonshockable", tone: "amber",   name: "Pulseless Electrical Activity (PEA)",  rate: "Variable — organised but no pulse",
      features: ["Organised activity on monitor","No palpable central pulse","May look like sinus, brady, or any rhythm","Always has a REVERSIBLE CAUSE — find it"],
      management: ["CPR immediately — treat as non-shockable",`Adrenaline: ${(w*0.01).toFixed(2)} mg IV/IO — repeat every 3–5 min`,"Aggressively identify 4H4T reversible causes","Tension pneumo → immediate needle decompression","Hypovolaemia → 10 mL/kg blood products","Bedside ultrasound for tamponade, PTX"] },
    { id: "svt",        group: "tachy",        tone: "red",     name: "SVT",                                  rate: "Infants >220 bpm · Children >180 bpm",
      features: ["Narrow QRS (<0.08 s) — regular","HR >220 bpm infants, >180 children","Abrupt onset and termination","P waves absent or retrograde (after QRS)","Most common tachyarrhythmia in children"],
      management: [`STABLE: Vagal manoeuvres — ice to face (diving reflex) in infants, Valsalva in older`,`Adenosine: ${Math.min((w*0.1).toFixed(1),6)} mg IV RAPID (0.1 mg/kg, max 6 mg) — flush immediately`,`If fails: ${Math.min((w*0.2).toFixed(1),12)} mg (0.2 mg/kg, max 12 mg)`,`UNSTABLE: Sync cardioversion ${Math.round(w*0.5)}–${Math.round(w*1)} J → escalate to 2 J/kg`] },
    { id: "sinustachy", group: "tachy",        tone: "amber",   name: "Sinus Tachycardia",                    rate: "Variable — appropriate for age",
      features: ["Narrow QRS, regular, P before every QRS","Rate usually <220 bpm in infants","Gradual onset/offset (vs SVT abrupt)","NOT a primary rhythm problem — always has a CAUSE"],
      management: ["Identify and treat the underlying cause — this IS the treatment","Common causes: fever, pain, hypovolaemia, hypoxia, anxiety, sepsis, anaemia","Do NOT treat sinus tachycardia with antiarrhythmics","Volume replacement if hypovolaemic; treat sepsis/pain/fever"] },
    { id: "brady",      group: "brady",        tone: "blue",    name: "Symptomatic Bradycardia",              rate: "<60 bpm or age-inappropriately slow with compromise",
      features: ["HR <60 bpm — or slow for age with poor perfusion","P waves present but slow","Hypotension, poor CRT, altered consciousness","Haemodynamic compromise — not just HR alone"],
      management: ["Airway + O₂ first — most paediatric bradycardia is hypoxic",`Atropine: ${Math.max((w*0.02).toFixed(2), 0.1)} mg IV/IO (0.02 mg/kg, min 0.1 mg, max 0.5 mg)`,`Adrenaline: 0.1–1 mcg/kg/min infusion if atropine fails`,"If HR <60 + no pulse → CPR immediately","Transcutaneous pacing if drug-resistant — requires sedation"] },
    { id: "chb",        group: "brady",        tone: "blue",    name: "Complete Heart Block (3°)",            rate: "Ventricular escape 30–60 bpm",
      features: ["P waves and QRS completely independent","P rate > QRS rate","QRS may be narrow (junctional) or wide (ventricular escape)","Cannon A waves in JVP"],
      management: [`Atropine if symptomatic: ${Math.max((w*0.02).toFixed(2), 0.1)} mg IV — may not work on ventricular escape`,"Isoprenaline 0.05–0.5 mcg/kg/min (bridge to pacing)","Transvenous/transcutaneous pacing — definitive","Cardiology urgent — most CHB requires permanent pacemaker","Congenital CHB: often well-tolerated initially"] },
    { id: "nsr",        group: "normal",       tone: "emerald", name: "Normal Sinus Rhythm",                  rate: "Age-appropriate",
      features: ["Regular P-QRS-T — upright P in lead II","PR interval 0.12–0.20 s","QRS <0.08 s narrow","QTc ≤0.44 s (Bazett)","Age-appropriate rate"],
      management: ["Normal rhythm — no treatment required","Normal ECG does not exclude structural heart disease","Syncope/palpitations with normal ECG: 24h Holter, echo, cardiology","Check QTc carefully — may be prolonged with normal-looking rhythm"] },
    { id: "wpw",        group: "other",        tone: "violet",  name: "WPW (Pre-excitation)",                 rate: "Normal at rest — rapid during SVT",
      features: ["Short PR (<0.12 s) in sinus rhythm","Delta wave — slurred QRS upstroke","Wide QRS due to pre-excitation","Risk of pre-excited AF → VF"],
      management: ["Asymptomatic: risk stratification by electrophysiology study","SVT in WPW: adenosine usually safe","Pre-excited AF: DO NOT use adenosine/digoxin/verapamil","Pre-excited AF: DC cardioversion or IV procainamide","Definitive: radiofrequency catheter ablation","Urgent cardiology referral for all WPW in children"] },
  ];
}

function ECGTab() {
  const { weight } = useWeight();
  const rhythms = getRhythms(weight);
  const [selectedId,  setSelectedId]  = useState("vf");
  const [activeGroup, setActiveGroup] = useState("all");

  const groups = [
    { id: "all",         label: "All"          },
    { id: "shockable",   label: "Shockable"    },
    { id: "nonshockable",label: "Non-Shockable"},
    { id: "tachy",       label: "Tachycardia"  },
    { id: "brady",       label: "Bradycardia"  },
    { id: "normal",      label: "Normal/Other" },
    { id: "other",       label: "Special"      },
  ];

  const filtered = activeGroup === "all" ? rhythms : rhythms.filter(r => r.group === activeGroup);
  const selected = rhythms.find(r => r.id === selectedId) || rhythms[0];
  const t = TONE[selected.tone];
  const StripComponent = Strips[selected.id];

  const H4T4 = {
    h: ["Hypoxia — O₂, airway, ventilation", "Hypovolaemia — fluids/blood", "Hypo/hyperkalaemia, hypoglycaemia, metabolic", "Hypothermia — warm patient"],
    t: ["Tension pneumothorax — needle decompression", "Tamponade — pericardiocentesis", "Toxins/drugs — antidote, supportive", "Thrombosis (PE/coronary) — treat cause"],
  };

  return (
    <div className="space-y-4">
      <InfoBox tone="red" icon={Warning}>
        Always confirm rhythm in two leads. Treat the patient, not the monitor. Pulseless rhythm regardless of appearance → CPR immediately.
      </InfoBox>

      {/* Group filter */}
      <div className="flex flex-wrap gap-1.5">
        {groups.map(g => (
          <button key={g.id} onClick={() => setActiveGroup(g.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
              activeGroup === g.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{g.label}</button>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {/* Rhythm list */}
        <div className="space-y-2">
          {filtered.map(r => {
            const rt = TONE[r.tone];
            return (
              <button key={r.id} onClick={() => setSelectedId(r.id)}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  selectedId === r.id
                    ? `border-2 bg-white dark:bg-slate-900 ${rt.border}`
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300"
                }`}>
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <span className={`font-bold text-xs leading-tight ${rt.text}`}
                        style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{r.name}</span>
                  {r.group === "shockable" && (
                    <span className="text-[8px] font-mono font-bold text-white bg-red-600 rounded px-1.5 py-0.5 flex-shrink-0">SHOCK</span>
                  )}
                </div>
                <div className="font-mono text-[9px] text-slate-400">{r.rate}</div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="sm:col-span-2 space-y-3">
          <div className={`rounded-xl border p-4 ${t.bg} ${t.border}`}>
            <div className={`font-bold text-lg mb-0.5 ${t.text}`}
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{selected.name}</div>
            <div className="font-mono text-[10px] text-slate-400">Rate: {selected.rate}</div>
          </div>

          {/* Strip */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <span className="font-mono text-[8px] uppercase tracking-widest text-slate-400">Rhythm strip — 6 second view (25 mm/s, 10 mm/mV)</span>
            </div>
            <div className="p-2">{StripComponent && <StripComponent />}</div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className={`rounded-xl border p-4 bg-white dark:bg-slate-900/50 ${t.border}`}>
              <div className={`font-bold text-xs uppercase tracking-widest mb-2 ${t.text}`}>ECG Features</div>
              <div className="space-y-1">
                {selected.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <ArrowRight size={9} weight="bold" className={`${t.text} flex-shrink-0 mt-0.5`} />{f}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900/50 p-4">
              <div className="font-bold text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Treatment — {weight} kg</div>
              <div className="space-y-1">
                {selected.management.map((m, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-emerald-500 flex-shrink-0 text-[10px] tabular-nums">{i+1}.</span>{m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4H4T */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4">
        <div className="font-bold text-sm text-amber-700 dark:text-amber-300 mb-3"
             style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Reversible Causes — 4H4T (every arrest)</div>
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-amber-500 mb-1.5">4H</div>
            {H4T4.h.map((h, i) => (
              <div key={i} className="flex items-start gap-1.5 text-amber-800 dark:text-amber-200 mb-1">
                <span className="font-black text-amber-500 flex-shrink-0">H{i+1}</span>{h}
              </div>
            ))}
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-amber-500 mb-1.5">4T</div>
            {H4T4.t.map((h, i) => (
              <div key={i} className="flex items-start gap-1.5 text-amber-800 dark:text-amber-200 mb-1">
                <span className="font-black text-amber-500 flex-shrink-0">T{i+1}</span>{h}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — VITALS TRENDING
// ═══════════════════════════════════════════════════════════════════════════════

function getTrendNormals(ageYears) {
  if (ageYears < 0.08)  return { hr:[100,160], rr:[30,60], sbp:[60,90],  dbp:[30,60],  spo2:[94,100], temp:[36.5,37.5] };
  if (ageYears < 1)     return { hr:[100,160], rr:[25,50], sbp:[70,100], dbp:[40,65],  spo2:[94,100], temp:[36.5,37.5] };
  if (ageYears < 3)     return { hr:[90,150],  rr:[20,40], sbp:[80,110], dbp:[45,70],  spo2:[95,100], temp:[36.5,37.5] };
  if (ageYears < 6)     return { hr:[80,140],  rr:[20,30], sbp:[80,112], dbp:[45,72],  spo2:[95,100], temp:[36.5,37.5] };
  if (ageYears < 12)    return { hr:[70,120],  rr:[18,25], sbp:[90,120], dbp:[55,80],  spo2:[95,100], temp:[36.5,37.5] };
  return                       { hr:[60,100],  rr:[12,20], sbp:[100,130],dbp:[60,85],  spo2:[95,100], temp:[36.5,37.5] };
}

function isAbnormal(val, range) {
  if (val === null || val === "" || isNaN(Number(val))) return false;
  return Number(val) < range[0] || Number(val) > range[1];
}

function nowTime() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function nowFull() {
  return new Date().toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

const VITAL_FIELDS = [
  { key: "hr",   label: "Heart Rate",  unit: "bpm",  color: "#ef4444" },
  { key: "rr",   label: "Resp Rate",   unit: "/min", color: "#3b82f6" },
  { key: "sbp",  label: "SBP",         unit: "mmHg", color: "#8b5cf6" },
  { key: "dbp",  label: "DBP",         unit: "mmHg", color: "#a78bfa" },
  { key: "spo2", label: "SpO₂",        unit: "%",    color: "#10b981" },
  { key: "temp", label: "Temp",        unit: "°C",   color: "#f59e0b" },
];

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs shadow-lg">
      <div className="font-mono text-slate-400 mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function VitalsTrending() {
  const { weight } = useWeight();
  const [patient, setPatient] = useState({ name: "", age: "", ageUnit: "years", diagnosis: "", mrn: "", ward: "" });
  const [entries, setEntries] = useState([]);
  const [form,    setForm]    = useState({ hr:"", rr:"", sbp:"", dbp:"", spo2:"", temp:"", notes:"" });
  const [activeChart,   setActiveChart]   = useState("hr");
  const [activeSection, setActiveSection] = useState("chart");

  const ageYears = useMemo(() => {
    const n = parseFloat(patient.age);
    if (isNaN(n)) return 5;
    return patient.ageUnit === "months" ? n / 12 : n;
  }, [patient.age, patient.ageUnit]);

  const normals = useMemo(() => getTrendNormals(ageYears), [ageYears]);

  function addEntry() {
    setEntries(p => [...p, {
      id: Date.now(), time: nowTime(), timestamp: Date.now(),
      ...Object.fromEntries(Object.keys(form).map(k => [k, form[k] === "" ? null : (k === "notes" ? form[k] : parseFloat(form[k]) || null)])),
    }]);
    setForm({ hr:"", rr:"", sbp:"", dbp:"", spo2:"", temp:"", notes:"" });
  }

  const hasData    = Object.values(form).some(v => v !== "");
  const latest     = entries[entries.length - 1];
  const activeV    = VITAL_FIELDS.find(v => v.key === activeChart);
  const chartData  = entries.map(e => ({ time: e.time, [activeChart]: e[activeChart] })).filter(e => e[activeChart] !== null);

  function exportCSV() {
    const header = [`PedResus Vitals Export`,`Patient: ${patient.name||"Unknown"} | Age: ${patient.age} ${patient.ageUnit} | Weight: ${weight} kg`,`Dx: ${patient.diagnosis||"—"} | MRN: ${patient.mrn||"—"} | Ward: ${patient.ward||"—"}`,`Exported: ${nowFull()}`,``,`Time,HR,RR,SBP,DBP,SpO2,Temp,Notes`].join("\n");
    const rows = entries.map(e => [e.time,e.hr??"",e.rr??"",e.sbp??"",e.dbp??"",e.spo2??"",e.temp??"",e.notes??""].join(","));
    const blob = new Blob([[header,...rows].join("\n")], { type:"text/csv" });
    const a    = Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:`vitals-${(patient.name||"patient").replace(/\s+/g,"-")}-${new Date().toISOString().slice(0,10)}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-4">
      {/* Sub-nav */}
      <div className="flex gap-2 flex-wrap items-center">
        {[{ id:"chart", label:"Chart & Entry" },{ id:"patient", label:"Patient Details" },{ id:"table", label:`All Readings (${entries.length})` }].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`px-3 py-2 rounded-lg border font-mono text-[11px] uppercase tracking-wider transition-all ${activeSection === s.id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`}>{s.label}</button>
        ))}
        {entries.length > 0 && (
          <button onClick={exportCSV} className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-mono text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all">
            <Download size={11} weight="bold" /> CSV
          </button>
        )}
      </div>

      {/* Patient details */}
      {activeSection === "patient" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <User size={14} className="text-slate-400" />
            <span className="font-bold text-sm" style={{ fontFamily:'"Chivo", system-ui, sans-serif' }}>Patient Details</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[{k:"name",label:"Patient Name",ph:"Full name"},{k:"mrn",label:"MRN",ph:"Hospital ID"},{k:"diagnosis",label:"Diagnosis",ph:"Working diagnosis"},{k:"ward",label:"Ward",ph:"ED / PICU / Ward"}].map(f => (
              <div key={f.k}>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">{f.label}</label>
                <input type="text" placeholder={f.ph} value={patient[f.k]}
                  onChange={e => setPatient(p => ({...p,[f.k]:e.target.value}))}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            ))}
            <div>
              <label className="block font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">Age</label>
              <div className="flex gap-2">
                <input type="number" min="0" placeholder="0" value={patient.age}
                  onChange={e => setPatient(p => ({...p,age:e.target.value}))}
                  className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200" />
                <select value={patient.ageUnit} onChange={e => setPatient(p => ({...p,ageUnit:e.target.value}))}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none">
                  <option value="years">years</option>
                  <option value="months">months</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart + entry */}
      {activeSection === "chart" && (
        <div className="space-y-4">
          {latest && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {VITAL_FIELDS.map(v => {
                const val  = latest[v.key];
                const abnl = val !== null && isAbnormal(val, normals[v.key]);
                return (
                  <div key={v.key} onClick={() => setActiveChart(v.key)}
                    className={`rounded-xl border p-2.5 cursor-pointer transition-all ${activeChart === v.key ? "border-2" : "border-slate-200 dark:border-slate-700"} ${abnl ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700" : "bg-white dark:bg-slate-900"}`}
                    style={{ borderColor: activeChart === v.key && !abnl ? v.color : undefined }}>
                    <div className="font-mono text-[8px] uppercase tracking-widest text-slate-400 mb-0.5">{v.label}</div>
                    <div className={`font-black text-lg leading-none ${abnl ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}
                         style={{ fontFamily:'"Chivo",system-ui,sans-serif', color: abnl ? undefined : v.color }}>{val ?? "—"}</div>
                    <div className="text-[9px] text-slate-400 font-mono">{v.unit}</div>
                    {abnl && <div className="text-[8px] text-red-500 font-bold mt-0.5">↑↓ ABNL</div>}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {VITAL_FIELDS.map(v => (
              <button key={v.key} onClick={() => setActiveChart(v.key)}
                className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${activeChart === v.key ? "text-white border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"}`}
                style={{ backgroundColor: activeChart === v.key ? activeV.color : undefined }}>
                {v.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm" style={{ fontFamily:'"Chivo",system-ui,sans-serif' }}>{activeV.label} <span className="font-normal text-slate-400 text-xs font-mono">{activeV.unit}</span></span>
              <span className="font-mono text-[10px] text-slate-400">Normal: {normals[activeChart][0]}–{normals[activeChart][1]} {activeV.unit}</span>
            </div>
            {chartData.length < 2 ? (
              <div className="h-40 flex items-center justify-center text-slate-300 dark:text-slate-700 text-sm font-mono">Add ≥2 readings to see trend</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top:4, right:8, bottom:0, left:-20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                  <XAxis dataKey="time" tick={{ fontSize:9, fontFamily:"monospace", fill:"#94a3b8" }} />
                  <YAxis tick={{ fontSize:9, fontFamily:"monospace", fill:"#94a3b8" }} />
                  <Tooltip content={<TrendTooltip />} />
                  <ReferenceLine y={normals[activeChart][0]} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.5} />
                  <ReferenceLine y={normals[activeChart][1]} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.5} />
                  <Line type="monotone" dataKey={activeChart} stroke={activeV.color} strokeWidth={2} dot={{ r:3, fill:activeV.color }} activeDot={{ r:5 }} name={activeV.label} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Entry form */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-3">Record vitals — {nowTime()}</div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
              {VITAL_FIELDS.map(v => {
                const abnl = form[v.key] !== "" && isAbnormal(form[v.key], normals[v.key]);
                return (
                  <div key={v.key}>
                    <label className={`block font-mono text-[8px] uppercase tracking-widest mb-1 ${abnl ? "text-red-500" : "text-slate-400"}`}>{v.label}</label>
                    <input type="number" placeholder="—" value={form[v.key]}
                      onChange={e => setForm(p => ({...p,[v.key]:e.target.value}))}
                      className={`w-full border rounded-lg px-2 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-center font-mono tabular-nums ${abnl ? "border-red-300 dark:border-red-700 focus:ring-red-200" : "border-slate-200 dark:border-slate-700 focus:ring-blue-200"}`} />
                    {abnl && <div className="text-[8px] text-red-500 font-bold text-center mt-0.5">Normal: {normals[v.key][0]}–{normals[v.key][1]}</div>}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Notes (optional)" value={form.notes}
                onChange={e => setForm(p => ({...p,notes:e.target.value}))}
                className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              <button onClick={addEntry} disabled={!hasData}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs disabled:opacity-40 hover:bg-slate-700 transition-all"
                style={{ fontFamily:'"Chivo",system-ui,sans-serif' }}>
                <Plus size={12} weight="bold" /> Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All readings table */}
      {activeSection === "table" && (
        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center text-slate-400 text-sm font-mono">No readings recorded yet</div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                    {["Time","HR","RR","SBP","DBP","SpO₂","Temp","Notes",""].map(h => (
                      <th key={h} className="p-2.5 text-left font-mono text-[8px] uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...entries].reverse().map((e, i) => (
                    <tr key={e.id} className={`border-t border-slate-100 dark:border-slate-800 ${i%2===0?"bg-white dark:bg-slate-900/20":"bg-slate-50/50 dark:bg-slate-900/40"}`}>
                      <td className="p-2.5 font-mono text-slate-500 whitespace-nowrap">{e.time}</td>
                      {["hr","rr","sbp","dbp","spo2","temp"].map(k => {
                        const abnl = e[k] !== null && isAbnormal(e[k], normals[k]);
                        return <td key={k} className={`p-2.5 font-mono font-bold tabular-nums ${abnl?"text-red-600 dark:text-red-400":"text-slate-700 dark:text-slate-200"}`}>{e[k]??'—'}{abnl&&" ↑"}</td>;
                      })}
                      <td className="p-2.5 text-slate-500 max-w-[120px] truncate">{e.notes}</td>
                      <td className="p-2.5">
                        <button onClick={() => setEntries(p => p.filter(x => x.id !== e.id))} className="text-slate-300 hover:text-red-400 transition-colors">
                          <Trash size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {entries.length > 0 && (
            <div className="flex justify-end">
              <button onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-mono text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all">
                <Download size={11} weight="bold" /> Download CSV
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { id: "calculator", label: "Live Calculator", Icon: Heartbeat   },
  { id: "reference",  label: "Quick Reference", Icon: Table       },
  { id: "ecg",        label: "ECG & Rhythms",   Icon: Lightning   },
  { id: "trending",   label: "Vitals Trending", Icon: Pulse       },
];

export default function VitalsTab({ searchEntry }) {
  const { weight } = useWeight();
  const [activeTab, setActiveTab] = useState("calculator");

  // ADD this useEffect:
  useEffect(() => {
    if (!searchEntry?.section) return;
    const sectionMap = {
      "Live Calculator":  "calculator",
      "Quick Reference":  "reference",
      "ECG & Rhythms":    "ecg",
      "Vitals Trending":  "trending",
    };
    const tab = sectionMap[searchEntry.section];
    if (tab) setActiveTab(tab);
  }, [searchEntry]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Vital Signs &amp; Monitoring
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Live thresholds · ECG rhythms · serial trending for{" "}
          <span className="font-bold text-slate-900 dark:text-white">{weight} kg</span> ·
          AHA PALS 2020 · APLS
        </p>
      </div>

      {/* Quick stat bar — monitoring essentials only */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { Icon: Heartbeat,   label: "Min SBP (wt-based)", val: `${minSBP ? minSBP(weight) : "70+"} mmHg`, tone: "red"     },
          { Icon: Waveform,    label: "CPR trigger",         val: "HR <60 + poor perf",                      tone: "red"     },
          { Icon: Wind,        label: "SpO₂ target",         val: "≥ 94%",                                   tone: "emerald" },
          { Icon: Thermometer, label: "Fever threshold",     val: "≥ 38.0°C rectal",                         tone: "amber"   },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-3 bg-white dark:bg-slate-900 ${TONE[s.tone].border}`}>
            <div className={`flex items-center gap-1.5 mb-1 ${TONE[s.tone].text}`}>
              <s.Icon size={12} weight="fill" />
              <span className="font-mono text-[9px] uppercase tracking-wider">{s.label}</span>
            </div>
            <div className={`font-black text-base leading-tight ${TONE[s.tone].text}`}
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{s.val}</div>
          </div>
        ))}
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

      {activeTab === "calculator" && <LiveCalculator />}
      {activeTab === "reference"  && <QuickReference />}
      {activeTab === "ecg"        && <ECGTab />}
      {activeTab === "trending"   && <VitalsTrending />}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        AHA PALS 2020 · APLS · ESC Paediatric EP Guidelines 2021 · Rhythm strips are schematic — always interpret in clinical context
      </div>
    </div>
  );
}
