// VitalsTab.jsx — Interactive Vital Signs Reference
// Features: age-band highlighter · weight-based BP/HR thresholds · live alarm calculator
// Sources: Nelson 21e · PALS 2020 · Harriet Lane 23e · AAP

import { useState, useMemo } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Thermometer, Wind, Heartbeat, Waveform, Warning,
  CheckCircle, XCircle, ArrowRight, Lightbulb,
} from "@phosphor-icons/react";
// FIX 5: Removed unused 'Drop' import
import { VITALS_ROWS, TEMP_NOTES, SPO2_NOTES, minSBP } from "../../data/vitals";

// ─── COLOUR HELPERS ────────────────────────────────────────────────────────────
const TONE = {
  red:     { text: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-950/30",       border: "border-red-200 dark:border-red-800"       },
  emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  amber:   { text: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-amber-200 dark:border-amber-800"   },
  blue:    { text: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200 dark:border-blue-800"     },
  violet:  { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800" },
  slate:   { text: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-50 dark:bg-slate-900/50",   border: "border-slate-200 dark:border-slate-700"   },
};

// ─── STATIC BORDER MAP ────────────────────────────────────────────────────────
// FIX 3: Pre-defined static Tailwind classes instead of dynamic string interpolation
// Dynamic classes like `border-${tone}-300` are purged by Tailwind and never render.
const ABNORMAL_BORDER = {
  red:     "border-red-300 dark:border-red-700",
  emerald: "border-emerald-300 dark:border-emerald-700",
  amber:   "border-amber-300 dark:border-amber-700",
  blue:    "border-blue-300 dark:border-blue-700",
  violet:  "border-violet-300 dark:border-violet-700",
  slate:   "border-slate-300 dark:border-slate-600",
};

// ─── AGE-DERIVED VITALS THRESHOLDS ────────────────────────────────────────────
function getThresholds(ageYears) {
  if (ageYears < 0.084) return { hrLo: 100, hrHi: 165, rr: [40, 60], sbpMin: 60,  sbpHi: 90,  dbpHi: 60,  label: "Neonate (<1 mo)"      };
  if (ageYears < 0.5)   return { hrLo: 100, hrHi: 165, rr: [30, 60], sbpMin: 70,  sbpHi: 104, dbpHi: 56,  label: "Infant 1–5 mo"        };
  if (ageYears < 1)     return { hrLo: 90,  hrHi: 150, rr: [25, 50], sbpMin: 72,  sbpHi: 112, dbpHi: 66,  label: "Infant 6–11 mo"       };
  if (ageYears < 2)     return { hrLo: 90,  hrHi: 150, rr: [20, 40], sbpMin: 74,  sbpHi: 112, dbpHi: 74,  label: "Toddler 1–2 yr"       };
  if (ageYears < 5)     return { hrLo: 70,  hrHi: 140, rr: [20, 35], sbpMin: 78,  sbpHi: 116, dbpHi: 76,  label: "Pre-school 3–5 yr"    };
  if (ageYears < 10)    return { hrLo: 60,  hrHi: 130, rr: [15, 30], sbpMin: 80,  sbpHi: 122, dbpHi: 78,  label: "School age 6–9 yr"    };
  if (ageYears < 13)    return { hrLo: 60,  hrHi: 120, rr: [12, 25], sbpMin: 90,  sbpHi: 126, dbpHi: 82,  label: "Pre-teen 10–12 yr"    };
  return                        { hrLo: 55,  hrHi: 100, rr: [12, 20], sbpMin: 90,  sbpHi: 136, dbpHi: 86,  label: "Adolescent ≥13 yr"    };
}

// Status badge
function StatusBadge({ ok }) {
  return ok
    ? <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400"><CheckCircle size={10} weight="fill" />Normal</span>
    : <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-red-600 dark:text-red-400"><XCircle size={10} weight="fill" />Abnormal</span>;
}

// Numeric input with +/- controls
function NumInput({ label, value, onChange, unit, min = 0, max = 999 }) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{label}</label>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-base flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700"
        >−</button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={e => onChange(Math.max(min, Math.min(max, +e.target.value || min)))}
          className="w-20 text-center font-mono font-bold text-lg border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-400 py-1"
        />
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-base flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700"
        >+</button>
        <span className="text-xs text-slate-400 font-mono ml-1">{unit}</span>
      </div>
    </div>
  );
}

// ─── LIVE CALCULATOR TAB ──────────────────────────────────────────────────────
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
    { label: "1 yr",  val: 1    }, { label: "2 yr",  val: 2    }, { label: "5 yr", val: 5   },
    { label: "8 yr",  val: 8    }, { label: "12 yr", val: 12   }, { label: "16 yr",val: 16  },
  ];

  // ─── Card data defined BEFORE the map so variables are all in scope ──────
  // FIX 1: Each card carries its own boolean `ok` field so the map closure
  // can reference `card.ok` unambiguously — the original code used a bare
  // `ok` variable that was never declared in the map scope, causing a
  // ReferenceError that crashed the component tree (white screen).
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
      {/* Age selector */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-2">Patient Age Band</div>
        <div className="flex flex-wrap gap-1.5">
          {ageOptions.map(a => (
            <button
              key={a.label}
              onClick={() => setAgeYears(a.val)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-wider transition-all ${
                ageYears === a.val
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-mono text-xs text-slate-500">{thr.label}</span>
          <span className="font-mono text-[10px] text-slate-400">· Min SBP: {Math.round(minBP)} mmHg</span>
        </div>
      </div>

      {/* Input grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <NumInput label="Heart Rate"   value={hrVal}   onChange={setHrVal}   unit="bpm"  min={20} max={300} />
        <NumInput label="Resp Rate"    value={rrVal}   onChange={setRrVal}   unit="/min" min={5}  max={80}  />
        <NumInput label="Systolic BP"  value={sbpVal}  onChange={setSbpVal}  unit="mmHg" min={30} max={200} />
        <NumInput label="Diastolic BP" value={dbpVal}  onChange={setDbpVal}  unit="mmHg" min={20} max={150} />
        <NumInput label="Temperature"  value={tempVal} onChange={setTempVal} unit="°C"   min={33} max={43}  />
        <NumInput label="SpO₂"         value={spo2Val} onChange={setSpo2Val} unit="%"    min={60} max={100} />
      </div>

      {/* Status cards */}
      {/* FIX 1 & FIX 3: Use card.ok (not bare `ok`); use ABNORMAL_BORDER map (not dynamic string) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map(card => (
          <div
            key={card.label}
            className={`rounded-xl border p-3 bg-white dark:bg-slate-900 ${
              card.ok
                ? "border-emerald-200 dark:border-emerald-800"
                : ABNORMAL_BORDER[card.tone]
            }`}
          >
            <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">{card.label}</div>
            <div
              className={`font-black text-xl leading-none mb-1 ${
                card.ok ? "text-slate-800 dark:text-white" : "text-red-600 dark:text-red-400"
              }`}
              style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
            >
              {card.val}
            </div>
            <div className="font-mono text-[9px] text-slate-400 mb-1.5">Normal: {card.range}</div>
            <StatusBadge ok={card.ok} />
          </div>
        ))}
      </div>

      {/* Alert panel */}
      {allNormal ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
          <CheckCircle size={16} weight="fill" className="text-emerald-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            All vitals within normal range for {thr.label}
          </span>
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
              <ArrowRight size={11} weight="bold" className="text-red-500 flex-shrink-0 mt-0.5" />
              {a}
            </div>
          ))}
        </div>
      )}

      {/* Formula reference */}
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

// ─── REFERENCE TABLE TAB ─────────────────────────────────────────────────────
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
      <div className="flex items-start gap-2 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 px-3 py-2.5 text-xs text-sky-800 dark:text-sky-200">
        <Lightbulb size={12} weight="fill" className="text-sky-500 flex-shrink-0 mt-0.5" />
        <span>Click any row to highlight it. The row matching the current weight ({weight} kg) is pre-highlighted in blue.</span>
      </div>

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
              const isSuggested  = i === suggestedIdx;
              const isHighlighted = highlightAge === r.age;
              let rowCls = "border-t border-slate-200 dark:border-slate-800 cursor-pointer transition-colors ";
              if      (isHighlighted) rowCls += "bg-violet-100 dark:bg-violet-950/50 ";
              else if (isSuggested)   rowCls += "bg-blue-50 dark:bg-blue-950/30 ";
              else                    rowCls += "odd:bg-slate-50 dark:odd:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/50 ";

              return (
                <tr
                  key={r.age}
                  className={rowCls}
                  onClick={() => setHighlightAge(isHighlighted ? null : r.age)}
                >
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {r.age}
                    {isSuggested && !isHighlighted && (
                      <span className="ml-2 text-[8px] font-mono uppercase tracking-widest text-blue-500 border border-blue-200 dark:border-blue-800 rounded px-1 py-0.5">
                        current wt
                      </span>
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
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800" />Weight match
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800" />Selected row
        </span>
      </div>
    </div>
  );
}

// ─── QUICK REFERENCE CARDS ────────────────────────────────────────────────────
function QuickReference() {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Temperature */}
        <div className={`rounded-xl border p-4 ${TONE.amber.border} ${TONE.amber.bg}`}>
          <div className="flex items-center gap-2 mb-3">
            <Thermometer size={15} weight="fill" className="text-amber-500" />
            <span className="font-bold text-sm text-amber-700 dark:text-amber-300"
                  style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Temperature</span>
          </div>
          <div className="space-y-1.5">
            {(TEMP_NOTES || [
              "Fever: ≥ 38.0°C rectal (most accurate in infants) · ≥ 37.8°C axillary · ≥ 38.0°C tympanic",
              "Hyperthermia: ≥ 40°C — consider heat stroke, malignant hyperthermia, neuroleptic malignant syndrome",
              "Hypothermia: < 36.0°C — risk of coagulopathy, arrhythmia, impaired drug metabolism",
              "Neonates may NOT mount a fever even with serious bacterial infection — hypothermia equally significant",
              "Antipyretics treat discomfort but do NOT prevent febrile seizures (AAP 2022)",
            ]).map((note, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200">
                <ArrowRight size={10} weight="bold" className="text-amber-500 flex-shrink-0 mt-0.5" />
                {note}
              </div>
            ))}
          </div>
        </div>

        {/* SpO2 */}
        <div className={`rounded-xl border p-4 ${TONE.violet.border} ${TONE.violet.bg}`}>
          <div className="flex items-center gap-2 mb-3">
            <Wind size={15} weight="bold" className="text-violet-500" />
            <span className="font-bold text-sm text-violet-700 dark:text-violet-300"
                  style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Oxygenation</span>
          </div>
          <div className="space-y-1.5">
            {(SPO2_NOTES || [
              "Normal SpO₂: ≥ 94% on room air at sea level",
              "Mild hypoxia: 90–93% — supplemental O₂ via nasal prongs indicated",
              "Moderate hypoxia: 85–89% — high-flow O₂ or NIV/HFNC",
              "Severe hypoxia: < 85% — intubation likely required",
              "Neonates: pre-ductal SpO₂ (right hand) = true arterial; post-ductal (foot) lower in PPHN — difference >5% suggests R→L shunting",
              "Cyanosis clinically visible at SpO₂ ~80–85% — unreliable in anaemia or dark skin",
            ]).map((note, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-violet-800 dark:text-violet-200">
                <ArrowRight size={10} weight="bold" className="text-violet-500 flex-shrink-0 mt-0.5" />
                {note}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PALS at-a-glance table */}
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
                <th className="p-2.5 text-center font-mono text-[9px] uppercase tracking-widest text-amber-500">Hypo-tension</th>
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

      {/* Key formulas */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3">Key Formulas</div>
        <div className="grid sm:grid-cols-2 gap-2 font-mono text-xs text-slate-700 dark:text-slate-200">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Min SBP (1–10 yr)</div>
            <strong>70 + (2 × age in years) mmHg</strong>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">CPR Trigger</div>
            <strong>HR &lt;60 bpm + poor perfusion → start CPR</strong>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Fluid Resuscitation</div>
            <strong>20 mL/kg NS/LR IV over 5–15 min</strong>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Defibrillation</div>
            <strong>4 J/kg (mono/biphasic)</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const TABS = [
  { id: "calculator", label: "Live Calculator", Icon: Heartbeat   },
  { id: "table",      label: "Reference Table", Icon: Waveform    },
  { id: "reference",  label: "Quick Reference", Icon: Thermometer },
];

export default function VitalsTab() {
  const { weight } = useWeight();
  const [activeTab, setActiveTab] = useState("calculator");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Vital Signs
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Live threshold calculator for{" "}
          <span className="font-bold text-slate-900 dark:text-white">{weight} kg</span> ·
          Nelson 21e · PALS 2020 · Harriet Lane 23e
        </p>
      </div>

      {/* Quick stat bar */}
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
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-mono text-[11px] uppercase tracking-wider transition-all ${
              activeTab === t.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}
          >
            <t.Icon size={13} weight={activeTab === t.id ? "fill" : "regular"} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "calculator" && <LiveCalculator />}
      {activeTab === "table"      && <ReferenceTable />}
      {activeTab === "reference"  && <QuickReference />}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        Nelson Textbook 21e · PALS 2020 AHA · Harriet Lane Handbook 23e · AAP Bright Futures
      </div>
    </div>
  );
}
