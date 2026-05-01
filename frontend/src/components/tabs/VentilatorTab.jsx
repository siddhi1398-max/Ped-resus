// frontend/src/components/tabs/VentilatorTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Pediatric Ventilator Settings Dashboard
// Weight-based parameter calculator + troubleshooting guide + waveforms
// References: Tintinalli · BTS/ATS · OpenPediatrics · PaediatricEmergencies.com
//             PEMVECC 2017 · ARDSnet · Fleischer & Ludwig
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Warning, Lightbulb, ArrowRight, CaretDown, CheckCircle,
  XCircle,
} from "@phosphor-icons/react";

// ─── CLINICAL CONDITION PRESETS ───────────────────────────────────────────────
const CONDITIONS = [
  { id: "normal",       label: "Normal Lungs",       color: "emerald", peep: 5,  fio2: 0.40, vtFactor: 7,  rateAdj: 1.0, note: "Standard post-intubation settings" },
  { id: "ards",         label: "ARDS",                color: "red",     peep: 10, fio2: 0.80, vtFactor: 5,  rateAdj: 1.3, note: "Lung-protective: Vt 4–6 mL/kg, high PEEP, permissive hypercapnia" },
  { id: "asthma",       label: "Asthma / BPD",        color: "amber",   peep: 5,  fio2: 0.50, vtFactor: 7,  rateAdj: 0.7, note: "Low rate, long expiratory time (I:E 1:3–4), avoid auto-PEEP" },
  { id: "pneumonia",    label: "Pneumonia",            color: "orange",  peep: 6,  fio2: 0.60, vtFactor: 6,  rateAdj: 1.1, note: "Moderate PEEP, standard Vt. Watch for consolidation worsening" },
  { id: "cardiac",      label: "Post-Cardiac Surgery", color: "violet",  peep: 5,  fio2: 0.40, vtFactor: 6,  rateAdj: 1.0, note: "Aim early extubation. Avoid high PEEP (↓venous return)" },
  { id: "pphn",         label: "PPHN (Neonatal)",      color: "rose",    peep: 5,  fio2: 1.0,  vtFactor: 5,  rateAdj: 1.5, note: "High FiO₂, consider iNO. Avoid hypocarbia. Alkalosis helps (pH 7.45–7.55)" },
  { id: "bronchiolitis",label: "Bronchiolitis",        color: "sky",     peep: 5,  fio2: 0.50, vtFactor: 6,  rateAdj: 0.8, note: "HFNC / NIV preferred. If intubated: low rate, long Te, avoid PEEP stacking" },
];

// ─── COLOUR MAP ───────────────────────────────────────────────────────────────
const CMAP = {
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-300 dark:border-emerald-700", text: "text-emerald-700 dark:text-emerald-400", badge: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" },
  red:     { bg: "bg-red-50 dark:bg-red-950/40",         border: "border-red-300 dark:border-red-700",         text: "text-red-700 dark:text-red-400",         badge: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-950/40",     border: "border-amber-300 dark:border-amber-700",     text: "text-amber-700 dark:text-amber-400",     badge: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" },
  orange:  { bg: "bg-orange-50 dark:bg-orange-950/40",   border: "border-orange-300 dark:border-orange-700",   text: "text-orange-700 dark:text-orange-400",   badge: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300" },
  violet:  { bg: "bg-violet-50 dark:bg-violet-950/40",   border: "border-violet-300 dark:border-violet-700",   text: "text-violet-700 dark:text-violet-400",   badge: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300" },
  rose:    { bg: "bg-rose-50 dark:bg-rose-950/40",       border: "border-rose-300 dark:border-rose-700",       text: "text-rose-700 dark:text-rose-400",       badge: "bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300" },
  sky:     { bg: "bg-sky-50 dark:bg-sky-950/40",         border: "border-sky-300 dark:border-sky-700",         text: "text-sky-700 dark:text-sky-400",         badge: "bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300" },
};

// ─── TROUBLESHOOTING DATA ─────────────────────────────────────────────────────
const TROUBLESHOOT = [
  {
    id: "high-pip",
    problem: "↑ Peak Airway Pressure",
    severity: "urgent",
    causes: ["Bronchospasm / secretions", "ETT obstruction, kink or biting", "Pneumothorax", "Main-stem intubation", "Pulmonary oedema / stiff ARDS lung"],
    action: "DOPE mnemonic: Disconnect from vent → bag manually. Check: D-isplaced ETT · O-bstruction (suction) · P-neumothorax (auscultate/chest US) · E-quipment failure.",
    pearl: "If Peak–Plateau pressure gradient >10 cmH₂O → airway resistance problem (secretions, bronchospasm). If both elevated → compliance problem (ARDS, oedema, PTX).",
  },
  {
    id: "low-vt",
    problem: "↓ Tidal Volume / Minute Ventilation",
    severity: "urgent",
    causes: ["Cuff leak (hear gurgling)", "Circuit disconnect", "ETT dislodgement", "Severe bronchospasm"],
    action: "Check ETT depth and position. Check cuff pressure (target 20–25 cmH₂O). Inspect all circuit connections. Observe chest rise bilaterally.",
    pearl: "In pressure-controlled ventilation, a drop in Vt with unchanged PIP = ↓ compliance. In volume-controlled, a rise in PIP with unchanged Vt = ↑ resistance or ↓ compliance.",
  },
  {
    id: "hypoxia",
    problem: "Refractory Hypoxia (SpO₂ < 88%)",
    severity: "critical",
    causes: ["FiO₂ / PEEP inadequate", "Main-stem intubation", "Pneumothorax", "Pulmonary embolism", "Cardiac R→L shunt", "Decompensated heart failure"],
    action: "Step 1: Increase FiO₂ to 1.0 immediately. Step 2: Confirm bilateral breath sounds. Step 3: Bedside echo (effusion, tamponade, RV failure). Step 4: CXR. Step 5: Consider recruitment manoeuvre if ARDS (30 cmH₂O × 30 s).",
    pearl: "SpO₂ probe on right hand = pre-ductal in neonates (true arterial). Post-ductal (foot) SpO₂ lower in PPHN — difference >5% suggests R→L ductal shunting.",
  },
  {
    id: "hypercapnia",
    problem: "Hypercapnia (PaCO₂ > 55 mmHg)",
    severity: "moderate",
    causes: ["Low rate or Vt", "Large dead space (↑ PEEP, ↓ CO)", "Increased CO₂ production (fever, sepsis, agitation)", "ETT cuff leak"],
    action: "Increase RR first (preferred over Vt to limit volutrauma). Accept permissive hypercapnia (pH 7.20–7.30) in lung-protective strategy for ARDS. Treat fever. Check for cuff leak.",
    pearl: "PaCO₂ = VCO₂ / (VA). Increasing RR raises VA more safely than increasing Vt. ETCO₂ < PaCO₂ by 5–10 mmHg in normal physiology — widening gap = ↑ dead space.",
  },
  {
    id: "auto-peep",
    problem: "Auto-PEEP / Breath Stacking",
    severity: "moderate",
    causes: ["Obstructive disease (asthma, bronchiolitis)", "Inadequate expiratory time", "High respiratory rate"],
    action: "Reduce RR (allow more expiratory time). Extend I:E to 1:3 or 1:4. Bronchodilators via in-line nebuliser. Confirm on vent flow-time waveform (flow not returning to zero before next breath).",
    pearl: "To measure auto-PEEP: perform expiratory hold manoeuvre — read the plateau. In severe asthma, disconnect briefly to allow full exhalation if haemodynamic compromise.",
  },
  {
    id: "dysynchrony",
    problem: "Patient–Ventilator Dyssynchrony",
    severity: "moderate",
    causes: ["Pain or agitation (inadequate sedation)", "Inappropriate trigger sensitivity", "Auto-PEEP (patient triggering against stacked breaths)", "Inappropriate flow or inspiratory time"],
    action: "Optimise analgesia (fentanyl) + sedation (midazolam). Adjust flow trigger to 1–3 L/min (or pressure trigger –1 to –2 cmH₂O). Check for auto-PEEP. Consider PRVC or pressure support if fighting VC mode.",
    pearl: "COMFORT-B score target 11–17 for sedated ventilated children. Daily sedation interruption reduces vent days. Neuromuscular blockade only for severe dyssynchrony or prone positioning.",
  },
];

// ─── WAVEFORM DATA ────────────────────────────────────────────────────────────
const WAVEFORMS = [
  {
    id: "normal-vc",
    label: "Normal — Volume Control",
    category: "normal",
    description: "Square flow pattern. Pressure rises linearly to PIP. Volume rises as ascending ramp. Expiratory flow returns smoothly to zero.",
    findings: ["PIP clearly visible", "Plateau pressure measurable on inspiratory hold", "Flow returns to baseline before next breath"],
    // SVG path data for pressure, flow, volume traces (2 breath cycles shown)
    svgPaths: {
      pressure: "M10,80 L10,80 L10,30 L60,30 L60,60 L60,60 L110,30 L160,30 L160,60 L160,60 L210,60",
      flow:     "M10,60 L10,20 L60,20 L60,80 L60,80 L110,20 L160,20 L160,80 L160,80 L210,60",
      volume:   "M10,80 L60,20 L60,80 L110,20 L160,20 L160,80 L210,80",
    },
  },
  {
    id: "normal-pc",
    label: "Normal — Pressure Control",
    category: "normal",
    description: "Decelerating flow (rapid then declining). Pressure rectangular with set limit. Volume rises quickly then plateaus.",
    findings: ["Decelerating flow pattern", "Volume delivered depends on compliance and resistance", "Flow always returns to zero (no auto-PEEP)"],
    svgPaths: {
      pressure: "M10,80 L10,30 L60,30 L60,60 L110,30 L160,30 L160,60 L210,60",
      flow:     "M10,60 L10,15 Q40,50 60,80 L110,15 Q140,50 160,80 L210,60",
      volume:   "M10,80 Q35,25 60,22 L60,80 Q85,25 110,22 Q135,22 160,22 L160,80 L210,80",
    },
  },
  {
    id: "high-pip",
    label: "↑ PIP — High Resistance",
    category: "abnormal",
    description: "Peak pressure elevated with normal plateau. Large Peak–Plateau gradient (>10 cmH₂O). Seen in bronchospasm or secretions.",
    findings: ["PIP elevated", "Plateau normal or mildly elevated", "Peak–Plateau gap >10 cmH₂O = AIRWAY problem"],
    svgPaths: {
      pressure: "M10,80 L10,15 L60,25 L60,65 L110,15 L160,25 L160,65 L210,65",
      flow:     "M10,60 L10,18 L60,18 L60,85 L110,18 L160,18 L160,85 L210,60",
      volume:   "M10,80 L60,20 L60,80 L110,20 L160,20 L160,80 L210,80",
    },
  },
  {
    id: "low-compliance",
    label: "↑ PIP + Plateau — Low Compliance",
    category: "abnormal",
    description: "Both PIP and plateau elevated. Small Peak–Plateau gradient. Stiff lung (ARDS / oedema) requires higher pressure for same Vt.",
    findings: ["Both PIP and Plateau elevated", "Peak–Plateau gap small (<5 cmH₂O)", "COMPLIANCE problem (ARDS, oedema, PTX)"],
    svgPaths: {
      pressure: "M10,80 L10,12 L30,12 L60,12 L60,65 L110,12 L130,12 L160,12 L160,65 L210,65",
      flow:     "M10,60 L10,20 L60,20 L60,80 L110,20 L160,20 L160,80 L210,60",
      volume:   "M10,80 L60,28 L60,80 L110,28 L160,28 L160,80 L210,80",
    },
  },
  {
    id: "auto-peep",
    label: "Auto-PEEP / Air Trapping",
    category: "abnormal",
    description: "Expiratory flow does not return to zero before next breath. Breath stacking. Seen in asthma, bronchiolitis, high RR.",
    findings: ["Flow-time: expiratory curve does not reach baseline", "Each breath starts above zero flow", "Volume-time: stepped increase cycle by cycle"],
    svgPaths: {
      pressure: "M10,80 L10,30 L60,30 L60,55 L110,25 L160,25 L160,50 L210,50",
      flow:     "M10,60 L10,20 L60,20 L60,55 L110,20 L160,20 L160,52 L210,52",
      volume:   "M10,80 L60,22 L60,60 L110,18 L160,18 L160,48 L210,48",
    },
  },
  {
    id: "cuff-leak",
    label: "Cuff Leak / Circuit Leak",
    category: "abnormal",
    description: "Exhaled volume consistently less than inhaled. Inspiratory and expiratory Vt do not match. Audible gurgling.",
    findings: ["Exhaled Vt < Inspired Vt on volume scalar", "Flow-time: expiratory curve smaller than inspiratory", "Volume-time: does not return fully to baseline"],
    svgPaths: {
      pressure: "M10,80 L10,30 L60,30 L60,65 L110,30 L160,30 L160,65 L210,65",
      flow:     "M10,60 L10,20 L60,20 L60,70 L110,20 L160,20 L160,70 L210,60",
      volume:   "M10,80 L60,22 L60,55 L110,22 L160,22 L160,55 L210,55",
    },
  },
  {
    id: "flow-starvation",
    label: "Flow Starvation (VC Mode)",
    category: "abnormal",
    description: "Pressure-time waveform shows 'scooped out' appearance mid-inspiration. Patient demand exceeds ventilator flow delivery.",
    findings: ["Pressure-time: concave 'scooped' mid-inspiratory dip", "Patient effort pulls pressure below square waveform", "Indicates inadequate flow rate for patient demand"],
    svgPaths: {
      pressure: "M10,80 L10,30 Q35,45 60,30 L60,65 L110,30 Q135,45 160,30 L160,65 L210,65",
      flow:     "M10,60 L10,20 L60,20 L60,80 L110,20 L160,20 L160,80 L210,60",
      volume:   "M10,80 L60,22 L60,80 L110,22 L160,22 L160,80 L210,80",
    },
  },
  {
    id: "dysynchrony",
    label: "Patient–Ventilator Dyssynchrony",
    category: "abnormal",
    description: "Multiple waveform irregularities: double triggering, missed triggers, premature cycling.",
    findings: ["Irregular pressure and flow waveforms", "Variable Vt breath to breath", "Pressure spikes or double peaks visible"],
    svgPaths: {
      pressure: "M10,80 L10,30 L40,30 L50,20 L60,30 L60,65 L100,65 L110,25 L125,25 L160,30 L160,65 L210,65",
      flow:     "M10,60 L10,20 L60,20 L60,80 L100,80 L110,15 L160,20 L160,80 L210,60",
      volume:   "M10,80 L60,22 L60,80 L110,18 L160,22 L160,80 L210,80",
    },
  },
];

// ─── PARAM DISPLAY CARD ───────────────────────────────────────────────────────
function ParamCard({ label, value, unit, range, alert, info }) {
  return (
    <div className={`rounded-xl border p-4 ${alert ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"}`}>
      <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-1">{label}</div>
      <div className={`text-2xl font-black leading-none mb-0.5 ${alert ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}
           style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
        {value}
        <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
      </div>
      {range && <div className="text-[10px] text-slate-400 font-mono mt-0.5">Range: {range}</div>}
      {info && <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{info}</div>}
    </div>
  );
}

// ─── SECTION TOGGLE ──────────────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{icon}</span>
          <span className="font-bold text-sm text-slate-900 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            {title}
          </span>
        </div>
        <CaretDown size={14} weight="bold" className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 py-4 bg-white dark:bg-slate-900/50">{children}</div>}
    </div>
  );
}

// ─── WAVEFORM SVG ─────────────────────────────────────────────────────────────
function WaveformSVG({ paths, label, isDark }) {
  const traces = [
    { key: "pressure", color: "#ef4444", label: "Pressure (cmH₂O)", yLabel: "P" },
    { key: "flow",     color: "#3b82f6", label: "Flow (L/min)",      yLabel: "F" },
    { key: "volume",   color: "#10b981", label: "Volume (mL)",       yLabel: "V" },
  ];

  return (
    <div className="space-y-1">
      {traces.map(t => (
        <div key={t.key} className="flex items-center gap-2">
          <span className="text-[9px] font-mono w-4 text-right shrink-0" style={{ color: t.color }}>{t.yLabel}</span>
          <svg viewBox="0 0 220 100" className="flex-1 h-14 rounded-md bg-slate-950 dark:bg-slate-950" style={{ border: "1px solid #1e293b" }}>
            {/* Grid lines */}
            {[25,50,75].map(y => (
              <line key={y} x1="10" y1={y} x2="210" y2={y} stroke="#1e293b" strokeWidth="1" />
            ))}
            <line x1="110" y1="5" x2="110" y2="95" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
            {/* Baseline */}
            <line x1="10" y1="60" x2="210" y2="60" stroke="#334155" strokeWidth="0.5" />
            {/* Waveform */}
            <path
              d={paths[t.key]}
              fill="none"
              stroke={t.color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-1">
        {traces.map(t => (
          <div key={t.key} className="flex items-center gap-1">
            <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: t.color }} />
            <span className="text-[9px] font-mono text-slate-400">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WAVEFORM VIEW ────────────────────────────────────────────────────────────
function WaveformsView() {
  const [selected, setSelected] = useState("normal-vc");
  const waveform = WAVEFORMS.find(w => w.id === selected);

  const normal   = WAVEFORMS.filter(w => w.category === "normal");
  const abnormal = WAVEFORMS.filter(w => w.category === "abnormal");

  return (
    <div className="space-y-5">
      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
        Select a pattern to view pressure–flow–volume scalars and clinical interpretation.
      </div>

      {/* Selector */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">Normal Patterns</div>
        <div className="flex flex-wrap gap-2">
          {normal.map(w => (
            <button key={w.id} onClick={() => setSelected(w.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                selected === w.id
                  ? "bg-emerald-600 text-white border-transparent"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400"
              }`}>
              {w.label}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-red-500 dark:text-red-400 mt-3">Abnormal Patterns</div>
        <div className="flex flex-wrap gap-2">
          {abnormal.map(w => (
            <button key={w.id} onClick={() => setSelected(w.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                selected === w.id
                  ? "bg-red-600 text-white border-transparent"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-400"
              }`}>
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Waveform display */}
      {waveform && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className={`px-4 py-3 ${waveform.category === "normal" ? "bg-emerald-900/20 border-b border-emerald-800/30" : "bg-red-900/20 border-b border-red-800/30"}`}>
            <div className="font-bold text-sm text-white">{waveform.label}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest mt-0.5"
              style={{ color: waveform.category === "normal" ? "#34d399" : "#f87171" }}>
              {waveform.category === "normal" ? "✓ Normal" : "⚠ Abnormal"}
            </div>
          </div>

          <div className="p-4 bg-slate-900 space-y-4">
            {/* SVG Waveforms */}
            <WaveformSVG paths={waveform.svgPaths} label={waveform.label} />

            {/* Description */}
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-3">
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Description</div>
              <p className="text-xs text-slate-200 leading-relaxed">{waveform.description}</p>
            </div>

            {/* Key findings */}
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-3">
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Key Findings</div>
              <div className="space-y-1">
                {waveform.findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                    <span className={`font-bold mt-0.5 ${waveform.category === "normal" ? "text-emerald-400" : "text-red-400"}`}>→</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reference note */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
        <Lightbulb size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>Waveforms are schematic illustrations for teaching. Real ventilator graphics vary by manufacturer and clinical context. Always correlate with patient exam and blood gases.</span>
      </div>
    </div>
  );
}
// WaveformView.jsx
// Drop-in sub-tab for VentilatorTab.jsx
// Usage: import WaveformView from "./WaveformView"; then render <WaveformView /> inside the waveforms activeView block

import { useEffect, useRef, useState, useCallback } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const MODES = {
  "vc-ac": {
    label: "VC–AC",
    pip: 28, peep: 5, vt: 280, rr: 22, ie: 0.33,
    flow: "square",
    note: "Constant square flow → pressure rises as a ramp. PIP visible at end of inspiration. Plateau measurable with inspiratory hold. Flow returns cleanly to zero each cycle.",
  },
  "pc-ac": {
    label: "PC–AC",
    pip: 22, peep: 5, vt: 260, rr: 22, ie: 0.33,
    flow: "decelerating",
    note: "Pressure steps instantly to set level (rectangular). Flow decelerates exponentially — fastest at start, tapers to zero. Vt is variable — depends on compliance and resistance.",
  },
  "prvc": {
    label: "PRVC",
    pip: 20, peep: 5, vt: 270, rr: 22, ie: 0.33,
    flow: "decelerating",
    note: "Pressure-regulated volume control: decelerating flow like PC, but vent adjusts pressure each breath to hit the Vt target. Preferred mode in paediatric ARDS.",
  },
  "simv": {
    label: "SIMV+PS",
    pip: 24, peep: 5, vt: 260, rr: 16, ie: 0.33,
    flow: "square",
    note: "Mandatory VC breaths alternate with patient-triggered PS breaths (smaller, variable Vt). PS breaths show a pressure support plateau rather than a full PIP spike.",
  },
  "ps": {
    label: "Pressure Support",
    pip: 14, peep: 5, vt: 240, rr: 18, ie: 0.38,
    flow: "decelerating",
    note: "All breaths patient-triggered and flow-cycled. Pressure steps to PS level, flow decelerates, breath ends when flow drops to ~25% of peak. No mandatory rate — fully spontaneous.",
  },
};

const SCENARIOS = {
  normal: {
    label: "Normal", alarm: false,
    pipMult: 1, peepMult: 1, vtMult: 1, autopeep: 0, leak: 0, starvation: false, dyssynch: false,
    alarmTitle: "", causes: [], action: "", pearl: "",
  },
  "high-pip": {
    label: "High PIP", alarm: true,
    alarmTitle: "HIGH PIP ALARM",
    causes: ["Bronchospasm / secretions", "ETT obstruction, kink, or biting", "Main-stem intubation", "Pneumothorax", "Low compliance — ARDS, oedema"],
    action: "DOPE: Disconnect → bag manually. Suction ETT. Auscultate bilaterally. Check ETT depth at lips. If Peak−Plateau gap >10 cmH₂O → airway resistance problem. If both elevated → compliance problem.",
    pearl: "Peak−Plateau gap diagnostic: large gap = resistance ↑ (bronchospasm, secretions). Small gap with both elevated = stiff lung (ARDS, PTX, oedema).",
    pipMult: 1.7, peepMult: 1, vtMult: 0.9, autopeep: 0, leak: 0, starvation: false, dyssynch: false,
  },
  "auto-peep": {
    label: "Auto-PEEP", alarm: true,
    alarmTitle: "AUTO-PEEP / BREATH STACKING",
    causes: ["Obstructive disease — asthma, bronchiolitis", "High RR with insufficient expiratory time", "Inadequate I:E ratio"],
    action: "Reduce RR. Extend I:E to 1:3–1:4. Bronchodilators via in-line nebuliser. Perform expiratory hold manoeuvre → read trapped PEEP. In severe asthma: briefly disconnect to allow full exhalation.",
    pearl: "Flow scalar: expiratory flow does NOT return to zero before the next breath. Volume scalar: stepped increase cycle by cycle — the hallmark of breath stacking.",
    pipMult: 1.1, peepMult: 1, vtMult: 1, autopeep: 6, leak: 0, starvation: false, dyssynch: false,
  },
  "low-vt": {
    label: "Low Vt / Leak", alarm: true,
    alarmTitle: "LOW Vt — CIRCUIT LEAK",
    causes: ["ETT cuff deflated (audible gurgling)", "Circuit disconnection or crack", "ETT dislodgement"],
    action: "Check ETT depth at lips. Inflate cuff to 20–25 cmH₂O. Inspect all circuit connections. Observe bilateral chest rise. Volume scalar: exhaled Vt does not return to baseline.",
    pearl: "Volume scalar is the key diagnostic: if the expiratory limb does not return to zero → circuit leak. In PC mode, same PIP with lower Vt = ↓ compliance OR leak.",
    pipMult: 0.9, peepMult: 1, vtMult: 0.45, autopeep: 0, leak: 0.45, starvation: false, dyssynch: false,
  },
  "flow-starvation": {
    label: "Flow starvation", alarm: false,
    alarmTitle: "FLOW STARVATION — VC MODE",
    causes: ["Peak flow rate set too low for patient demand", "High patient respiratory drive", "Inappropriate flow pattern"],
    action: "Increase peak flow rate. Switch to decelerating flow pattern. Consider pressure control mode. Optimise sedation and analgesia.",
    pearl: "Pressure scalar shows a characteristic 'scooped' concave dip mid-inspiration — patient is actively pulling but the vent cannot match demand. Only visible in VC with square flow.",
    pipMult: 1, peepMult: 1, vtMult: 1, autopeep: 0, leak: 0, starvation: true, dyssynch: false,
  },
  dyssynch: {
    label: "Dyssynchrony", alarm: false,
    alarmTitle: "PATIENT–VENTILATOR DYSSYNCHRONY",
    causes: ["Pain or agitation — inadequate sedation/analgesia", "Inappropriate trigger sensitivity", "Auto-PEEP causing missed triggers", "Inappropriate inspiratory time"],
    action: "Optimise analgesia (fentanyl 1–4 mcg/kg/hr) + sedation (midazolam 0.05–0.2 mg/kg/hr). Adjust flow trigger to 1–3 L/min. Check for auto-PEEP. Consider PRVC or PS mode.",
    pearl: "Look for: double triggers (two volume peaks per patient effort), reverse triggering, premature cycling, irregular breath-to-breath Vt. COMFORT-B score target 11–17.",
    pipMult: 1, peepMult: 1, vtMult: 1, autopeep: 0, leak: 0, starvation: false, dyssynch: true,
  },
  "low-compliance": {
    label: "Low compliance", alarm: true,
    alarmTitle: "LOW COMPLIANCE — ARDS PATTERN",
    causes: ["ARDS / diffuse alveolar damage", "Pulmonary oedema", "Over-inflation / excessive PEEP", "Bilateral pneumothorax"],
    action: "Lung-protective strategy: Vt 4–6 mL/kg PBW. Plateau ≤ 30 cmH₂O. Driving pressure = Plateau − PEEP: target < 15. Use ARDSnet PEEP–FiO₂ ladder. Consider prone ≥ 12 hr/day if PaO₂/FiO₂ < 150.",
    pearl: "Peak–Plateau gap SMALL (<5 cmH₂O) = compliance problem. Distinct from bronchospasm where peak is high but plateau is near-normal. Both elevated together = stiff lung.",
    pipMult: 1.65, peepMult: 2, vtMult: 0.75, autopeep: 0, leak: 0, starvation: false, dyssynch: false,
  },
};

// ─── SAMPLE GENERATOR ─────────────────────────────────────────────────────────
function generateSample(t, modeKey, scenKey) {
  const m = MODES[modeKey];
  const s = SCENARIOS[scenKey];
  const period = 60 / m.rr;
  const tInPeriod = ((t % period) + period) % period;
  const ti = period * m.ie / (1 + m.ie);
  const inInsp = tInPeriod < ti;
  const inspPhase = inInsp ? tInPeriod / ti : 0;
  const expPhase  = !inInsp ? (tInPeriod - ti) / (period - ti) : 0;

  const pip  = m.pip  * s.pipMult;
  const peep = m.peep * s.peepMult;
  const vtT  = m.vt   * s.vtMult;

  let pressure = peep, flow = 0, volume = 0;
  const isVC = modeKey === "vc-ac" || modeKey === "simv";

  if (isVC) {
    if (inInsp) {
      flow = 40;
      if (s.starvation) {
        pressure = peep + (pip - peep) * inspPhase - 8 * Math.sin(Math.PI * inspPhase);
      } else {
        pressure = peep + (pip - peep) * inspPhase;
      }
      volume = vtT * inspPhase;
    } else {
      flow = -28 * Math.exp(-expPhase / 0.4);
      if (s.autopeep > 0 && expPhase > 0.7)
        flow *= 1 - ((expPhase - 0.7) / 0.3) * 0.85;
      pressure = peep + s.autopeep * (1 - expPhase) + (pip - peep) * Math.exp(-expPhase * 6);
      volume = vtT * Math.max(0, 1 - expPhase * (1 + s.leak));
    }
  } else {
    if (inInsp) {
      pressure = peep + (pip - peep) * (1 - Math.exp(-inspPhase * 8));
      flow = ((pip - peep) / 2.5) * Math.exp(-inspPhase * 4) * 15;
      volume = vtT * (1 - Math.exp(-inspPhase * 6)) / (1 - Math.exp(-6));
      if (s.starvation) pressure -= 4 * Math.sin(Math.PI * inspPhase);
    } else {
      pressure = peep + s.autopeep * (1 - expPhase) + (pip - peep) * Math.exp(-expPhase * 8);
      flow = -30 * Math.exp(-expPhase / 0.5);
      if (s.autopeep > 0 && expPhase > 0.75)
        flow *= 1 - ((expPhase - 0.75) / 0.25) * 0.9;
      volume = vtT * Math.max(0, 1 - expPhase * (1 + s.leak));
    }
  }

  if (s.dyssynch) {
    const dPhase = (t * 1.3) % 1;
    if (dPhase > 0.85 && dPhase < 0.95) {
      const dp = Math.sin(((dPhase - 0.85) / 0.1) * Math.PI);
      flow += 12 * dp;
      pressure += 4 * dp;
    }
    if (Math.random() < 0.003) flow += (Math.random() - 0.5) * 18;
  }

  pressure = Math.max(peep, pressure) + (Math.random() - 0.5) * 0.3;
  flow     = (flow || 0)              + (Math.random() - 0.5) * 0.8;
  volume   = Math.max(0, volume || 0);

  return { pressure, flow, volume, pip, peep, vt: vtT, rr: m.rr };
}

// ─── CANVAS DRAW ──────────────────────────────────────────────────────────────
function drawTrace(ctx, buf, headIdx, color, yMin, yMax, showZero) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const LEN = buf.length;

  ctx.fillStyle = "#060d14";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "#0e1f2e";
  ctx.lineWidth = 0.5;
  for (let g = 0; g < 5; g++) {
    const gy = H * 0.1 + H * 0.8 * (g / 4);
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }
  for (let g = 1; g < 8; g++) {
    const gx = W * g / 8;
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }

  if (showZero) {
    const zy = H * 0.9 - (H * 0.8) * (0 - yMin) / (yMax - yMin);
    ctx.strokeStyle = "#1e3a52";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, zy); ctx.lineTo(W, zy); ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.lineJoin = "round";
  ctx.beginPath();
  let first = true;
  for (let i = 0; i < LEN; i++) {
    const di = (headIdx - LEN + i + LEN * 2) % LEN;
    const val = buf[di];
    const x = W * i / (LEN - 1);
    const rawY = H * 0.9 - (H * 0.8) * (val - yMin) / (yMax - yMin);
    const y = Math.max(2, Math.min(H - 2, rawY));
    if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const lastVal = buf[(headIdx - 1 + LEN) % LEN];
  const lx = W - 3;
  const rawLy = H * 0.9 - (H * 0.8) * (lastVal - yMin) / (yMax - yMin);
  const ly = Math.max(4, Math.min(H - 4, rawLy));
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2); ctx.fill();
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function WaveformView() {
  const [mode, setMode]   = useState("vc-ac");
  const [scen, setScen]   = useState("normal");
  const [live, setLive]   = useState({ pip: 0, flow: 0, vol: 0, rr: 22 });

  const canvPRef = useRef(null);
  const canvFRef = useRef(null);
  const canvVRef = useRef(null);
  const stateRef = useRef({ mode, scen, t: 0, bufIdx: 0 });

  const SAMPLE_RATE = 200;
  const WINDOW_S    = 4;
  const HISTORY     = SAMPLE_RATE * WINDOW_S;

  const pressBuf = useRef(new Float32Array(HISTORY).fill(5));
  const flowBuf  = useRef(new Float32Array(HISTORY).fill(0));
  const volBuf   = useRef(new Float32Array(HISTORY).fill(0));
  const animRef  = useRef(null);
  const tickRef  = useRef(0);

  // keep stateRef in sync
  useEffect(() => { stateRef.current.mode = mode; }, [mode]);
  useEffect(() => { stateRef.current.scen = scen; }, [scen]);

  // animation loop
  useEffect(() => {
    const cP = canvPRef.current;
    const cF = canvFRef.current;
    const cV = canvVRef.current;
    if (!cP || !cF || !cV) return;

    const resize = () => {
      [cP, cF, cV].forEach(c => {
        c.width  = c.offsetWidth  || 520;
        c.height = c.offsetHeight || 90;
      });
    };
    resize();
    const ro = new ResizeObserver(resize);
    [cP, cF, cV].forEach(c => ro.observe(c));

    const ctxP = cP.getContext("2d");
    const ctxF = cF.getContext("2d");
    const ctxV = cV.getContext("2d");

    const DT = 1 / SAMPLE_RATE;
    let last = performance.now();

    function loop(now) {
      const elapsed = Math.min((now - last) / 1000, 0.05);
      last = now;
      const steps = Math.round(elapsed / DT);

      for (let i = 0; i < steps; i++) {
        stateRef.current.t += DT;
        const s = generateSample(stateRef.current.t, stateRef.current.mode, stateRef.current.scen);
        const bi = stateRef.current.bufIdx;
        pressBuf.current[bi] = s.pressure;
        flowBuf.current[bi]  = s.flow;
        volBuf.current[bi]   = s.volume;
        stateRef.current.bufIdx = (bi + 1) % HISTORY;
      }

      const bi = stateRef.current.bufIdx;
      drawTrace(ctxP, pressBuf.current, bi, "#4ade80", 0, 55, false);
      drawTrace(ctxF, flowBuf.current,  bi, "#60a5fa", -55, 65, true);
      drawTrace(ctxV, volBuf.current,   bi, "#f472b6", 0, 650, false);

      tickRef.current++;
      if (tickRef.current % 12 === 0) {
        const lastP = pressBuf.current[(bi - 1 + HISTORY) % HISTORY];
        const lastF = flowBuf.current[(bi - 1 + HISTORY) % HISTORY];
        const lastV = volBuf.current[(bi - 1 + HISTORY) % HISTORY];
        const m = MODES[stateRef.current.mode];
        setLive({ pip: Math.round(lastP), flow: Math.round(lastF), vol: Math.round(lastV), rr: m.rr });
      }

      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  const modeList = [
    { id: "vc-ac", label: "VC–AC" },
    { id: "pc-ac", label: "PC–AC" },
    { id: "prvc",  label: "PRVC" },
    { id: "simv",  label: "SIMV+PS" },
    { id: "ps",    label: "Pressure Support" },
  ];
  const scenList = [
    { id: "normal",           label: "Normal" },
    { id: "high-pip",         label: "↑ PIP alarm" },
    { id: "auto-peep",        label: "Auto-PEEP" },
    { id: "low-vt",           label: "Low Vt / Leak" },
    { id: "flow-starvation",  label: "Flow starvation" },
    { id: "dyssynch",         label: "Dyssynchrony" },
    { id: "low-compliance",   label: "Low compliance" },
  ];

  const s = SCENARIOS[scen];
  const m = MODES[mode];
  const isAlarm = scen !== "normal";

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800"
         style={{ background: "#0a0f14", fontFamily: '"JetBrains Mono", monospace' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <span style={{ fontSize: 10, letterSpacing: 3, color: "#4a9eff", textTransform: "uppercase" }}>
          Ped·Resus — Vent Monitor
        </span>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 10, color: "#334155" }}>RR: {live.rr}/min</span>
          <div className="flex items-center gap-1.5">
            <span style={{
              width: 7, height: 7, borderRadius: "50%", display: "inline-block",
              background: isAlarm ? "#ef4444" : "#22c55e",
              animation: "vpulse 1s infinite"
            }} />
            <span style={{ fontSize: 10, color: isAlarm ? "#ef4444" : "#22c55e" }}>
              {isAlarm ? (s.alarm ? "ALARM" : "ASSESS") : "VENTILATING"}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes vpulse { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>

      <div className="p-4 space-y-4">

        {/* ── Mode buttons ── */}
        <div>
          <div style={{ fontSize: 9, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Mode</div>
          <div className="flex flex-wrap gap-1.5">
            {modeList.map(ml => (
              <button key={ml.id} onClick={() => setMode(ml.id)}
                style={{
                  background: mode === ml.id ? "#0d2137" : "#0e1922",
                  border: `1px solid ${mode === ml.id ? "#4a9eff" : "#1e3a52"}`,
                  color: mode === ml.id ? "#4a9eff" : "#475569",
                  padding: "4px 10px", borderRadius: 5, cursor: "pointer",
                  fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontFamily: "inherit",
                }}>
                {ml.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scenario buttons ── */}
        <div>
          <div style={{ fontSize: 9, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Scenario</div>
          <div className="flex flex-wrap gap-1.5">
            {scenList.map(sl => {
              const isNormal = sl.id === "normal";
              const isActive = scen === sl.id;
              return (
                <button key={sl.id} onClick={() => setScen(sl.id)}
                  style={{
                    background: isActive ? (isNormal ? "#0d2137" : "#1c0a00") : "#0e1922",
                    border: `1px solid ${isActive ? (isNormal ? "#4a9eff" : "#f97316") : "#1e3a52"}`,
                    color: isActive ? (isNormal ? "#4a9eff" : "#fb923c") : "#475569",
                    padding: "4px 10px", borderRadius: 5, cursor: "pointer",
                    fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontFamily: "inherit",
                  }}>
                  {sl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Alarm panel ── */}
        {isAlarm && (
          <div style={{ background: "#0e1116", border: "1px solid #7c2d12", borderRadius: 8, padding: "10px 12px" }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "vpulse .7s infinite", flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: "#f97316", letterSpacing: 2, textTransform: "uppercase" }}>{s.alarmTitle}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {s.causes.map((c, i) => (
                <span key={i} style={{ background: "#1c0a00", border: "1px solid #7c2d12", color: "#fb923c", fontSize: 10, padding: "2px 7px", borderRadius: 4 }}>
                  {c}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.65, borderLeft: "2px solid #f97316", paddingLeft: 10, marginBottom: 6 }}>
              {s.action}
            </div>
            <div style={{ fontSize: 10, color: "#fbbf24", background: "#1a1000", borderRadius: 4, padding: "5px 8px" }}>
              💡 {s.pearl}
            </div>
          </div>
        )}

        {/* ── Waveform canvases ── */}
        <div style={{ display: "grid", gap: 4 }}>
          {[
            { ref: canvPRef, label: "Paw", unit: "cmH₂O", val: live.pip,  color: "#4ade80", showZero: false },
            { ref: canvFRef, label: "Flow", unit: "L/min", val: live.flow, color: "#60a5fa", showZero: true },
            { ref: canvVRef, label: "Vol",  unit: "mL",    val: live.vol,  color: "#f472b6", showZero: false },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 50, flexShrink: 0 }}>
                <div style={{ fontSize: 9, color: row.color, letterSpacing: 1, textTransform: "uppercase" }}>{row.label}</div>
                <div style={{ fontSize: 8, color: "#334155", letterSpacing: 1 }}>{row.unit}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: row.color, marginTop: 1 }}>{row.val}</div>
              </div>
              <canvas ref={row.ref}
                style={{ flex: 1, height: 90, borderRadius: 4, border: "1px solid #0e1f2e", display: "block" }} />
            </div>
          ))}
        </div>

        {/* ── Numeric readouts ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
          {[
            { label: "PIP",     val: Math.round(m.pip  * s.pipMult),  unit: "cmH₂O", color: "#4ade80" },
            { label: "PEEP",    val: Math.round(m.peep * s.peepMult), unit: "cmH₂O", color: "#4ade80" },
            { label: "Vt exp",  val: Math.round(m.vt   * s.vtMult),   unit: "mL",    color: "#f472b6" },
            { label: "RR set",  val: m.rr,                             unit: "/min",  color: "#e2e8f0" },
          ].map(p => (
            <div key={p.label} style={{ background: "#0e1922", border: "1px solid #1e2d3d", borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>{p.label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: p.color, lineHeight: 1 }}>{p.val}</div>
              <div style={{ fontSize: 9, color: "#334155", marginTop: 2 }}>{p.unit}</div>
            </div>
          ))}
        </div>

        {/* ── Mode interpretation ── */}
        <div style={{ background: "#060d14", border: "1px solid #1e2d3d", borderRadius: 6, padding: "10px 12px" }}>
          <span style={{ fontSize: 9, color: "#4a9eff", letterSpacing: 2, textTransform: "uppercase" }}>{m.label}</span>
          <span style={{ color: "#1e3a52", margin: "0 8px" }}>|</span>
          <span style={{ fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>{m.note}</span>
        </div>

        <div style={{ fontSize: 9, color: "#1e3a52", textAlign: "center", letterSpacing: 1 }}>
          Tintinalli · BTS/ATS · PEMVECC 2017 · OpenPediatrics · schematic waveforms for teaching
        </div>
      </div>
    </div>
  );
}
// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function VentilatorTab() {
  const { weight } = useWeight();
  const [condition, setCondition] = useState("normal");
  const [openTrouble, setOpenTrouble] = useState(null);
  const [activeView, setActiveView] = useState("settings");

  const cond = CONDITIONS.find(c => c.id === condition);
  const c = CMAP[cond.color];

  // ── Calculated parameters ─────────────────────────────────────────────────
  const params = useMemo(() => {
    const wt = Math.max(weight, 0.5);
    const baseRate = wt < 3 ? 50 : wt < 10 ? 30 : wt < 20 ? 25 : wt < 35 ? 20 : 16;
    const rate = Math.round(baseRate * cond.rateAdj);
    const vtLow  = +(wt * (cond.vtFactor - 1)).toFixed(1);
    const vtHigh = +(wt * cond.vtFactor).toFixed(1);
    const peep = cond.peep;
    const mvLow  = +((vtLow / 1000) * rate).toFixed(2);
    const mvHigh = +((vtHigh / 1000) * rate).toFixed(2);
    const ti = wt < 5 ? "0.3–0.5" : wt < 10 ? "0.5–0.7" : wt < 20 ? "0.7–0.9" : wt < 40 ? "0.9–1.1" : "1.2–1.5";
    const ie = condition === "asthma" || condition === "bronchiolitis" ? "1:3 to 1:4" : wt < 5 ? "1:1 to 1:2" : "1:2";
    const pipMax = condition === "ards" ? 28 : 30;
    const midaz  = +(wt * 0.05).toFixed(2);
    const midazH = +(wt * 0.2).toFixed(2);
    const fentL  = wt * 1;
    const fentH  = wt * 4;
    return { wt, rate, vtLow, vtHigh, peep, mvLow, mvHigh, ti, ie, pipMax, midaz, midazH, fentL, fentH };
  }, [weight, condition, cond]);

  const views = [
    { id: "settings",     label: "Vent Settings",  emoji: "🫁" },
    { id: "troubleshoot", label: "Troubleshoot",   emoji: "⚡" },
    { id: "waveforms",    label: "Waveforms",      emoji: "📈" },
    { id: "weaning",      label: "Weaning & SBT",  emoji: "📉" },
  ];

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Ventilator Dashboard
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Weight-based settings for <span className="text-slate-900 dark:text-white font-bold">{weight} kg</span> patient ·
          Tintinalli · BTS/ATS · PEMVECC 2017 · OpenPediatrics
        </p>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
        <Warning size={13} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>Educational reference only. All ventilator settings must be individualised by a qualified intensivist based on clinical response, blood gases, and vent waveforms.</span>
      </div>

      {/* ── View tabs ── */}
      <div className="flex flex-wrap gap-2">
        {views.map(v => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
              activeView === v.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}
          >
            <span>{v.emoji}</span> {v.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          VIEW 1: VENTILATOR SETTINGS
      ════════════════════════════════════════════ */}
      {activeView === "settings" && (
        <div className="space-y-5">

          {/* Condition selector */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">Clinical Condition / Preset</div>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(cond2 => {
                const cm = CMAP[cond2.color];
                return (
                  <button key={cond2.id} onClick={() => setCondition(cond2.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      condition === cond2.id
                        ? `${cm.badge} border-transparent shadow-sm`
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
                    }`}>
                    {cond2.label}
                  </button>
                );
              })}
            </div>
            <div className={`mt-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${c.bg} ${c.border}`}>
              <Lightbulb size={12} weight="fill" className={`flex-shrink-0 mt-0.5 ${c.text}`} />
              <span className={c.text}>{cond.note}</span>
            </div>
          </div>

          {/* Settings grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <ParamCard label="Tidal Volume" value={`${params.vtLow}–${params.vtHigh}`} unit="mL"
              range={`${cond.vtFactor - 1}–${cond.vtFactor} mL/kg`} alert={condition === "ards"}
              info="Use IBW not actual weight for obese patients" />
            <ParamCard label="Rate (RR)" value={`${Math.max(params.rate - 2, 10)}–${params.rate + 2}`} unit="/min"
              range="Age-adjusted"
              info={params.wt < 5 ? "Neonate: 40–60/min" : params.wt < 10 ? "Infant: 25–35/min" : params.wt < 20 ? "Toddler: 20–28/min" : "Child: 16–24/min"} />
            <ParamCard label="PEEP" value={params.peep} unit="cmH₂O"
              range={condition === "ards" ? "8–15" : "4–6"}
              info="↑ PEEP = ↑ oxygenation but ↓ venous return" />
            <ParamCard label="FiO₂ (start)" value={`${Math.round(cond.fio2 * 100)}%`} unit=""
              range="Titrate to SpO₂ ≥ 92%"
              info="Reduce FiO₂ to < 60% as soon as safe (O₂ toxicity)"
              alert={cond.fio2 >= 0.8} />
            <ParamCard label="Minute Ventilation" value={`${params.mvLow}–${params.mvHigh}`} unit="L/min"
              range="Normal 100–150 mL/kg/min" info="MV = Vt × RR" />
            <ParamCard label="Inspiratory Time" value={params.ti} unit="sec" range="Age-adjusted"
              info={params.wt < 5 ? "Neonates: 0.3–0.5 s" : params.wt < 10 ? "Infant: 0.5–0.7 s" : params.wt < 20 ? "Toddler: 0.7–0.9 s" : params.wt < 40 ? "Child: 0.9–1.1 s" : "Adolescent: 1.2–1.5 s"} />
            <ParamCard label="I:E Ratio" value={params.ie} unit=""
              range={condition === "asthma" ? "Extend to 1:4" : "Standard 1:2"}
              info={condition === "asthma" ? "Allow full expiration to prevent air trapping" : "Increase E time in obstructive disease"} />
            <ParamCard label="Max PIP / Plateau" value={`≤ ${params.pipMax}`} unit="cmH₂O"
              range="Plateau ≤ 30" alert={condition === "ards"}
              info="Driving pressure = Plateau – PEEP. Target < 15 cmH₂O" />
          </div>

          {/* Mode recommendation */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-3">Recommended Mode</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-mono text-slate-400 mb-1">PEDIATRIC (&gt; 5 kg)</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {condition === "ards" ? "PRVC (Pressure-Regulated Volume Control)" :
                   condition === "asthma" || condition === "bronchiolitis" ? "SIMV-PC + PS (low rate, long Te)" :
                   condition === "pphn" ? "PC-AC (optimise oxygenation)" :
                   "PRVC or SIMV-PC + PS"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">PS 5–10 cmH₂O for spontaneous breaths</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 mb-1">NEONATAL (&lt; 5 kg)</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {condition === "pphn" ? "PC-AC + volume guarantee" : "PC-AC / SIMV-PC + PS with volume guarantee"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Volume guarantee 4–6 mL/kg if available</div>
              </div>
            </div>
          </div>

          {/* Sedation */}
          <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-violet-600 dark:text-violet-400 mb-3">Post-Intubation Sedation / Analgesia</div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-violet-100 dark:border-violet-900">
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Midazolam</div>
                <div className="font-black text-lg text-violet-600 dark:text-violet-400" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                  {params.midaz}–{params.midazH}
                  <span className="text-xs font-normal text-slate-400 ml-1">mg/hr</span>
                </div>
                <div className="text-[10px] text-slate-400">0.05–0.2 mg/kg/hr</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-violet-100 dark:border-violet-900">
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Fentanyl</div>
                <div className="font-black text-lg text-violet-600 dark:text-violet-400" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                  {params.fentL}–{params.fentH}
                  <span className="text-xs font-normal text-slate-400 ml-1">mcg/hr</span>
                </div>
                <div className="text-[10px] text-slate-400">1–4 mcg/kg/hr</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-violet-100 dark:border-violet-900">
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">NMB (if needed)</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Rocuronium</div>
                <div className="text-[10px] text-slate-400">5–10 mcg/kg/min infusion. Only for severe dyssynchrony / prone / severe ARDS</div>
              </div>
            </div>
            <div className="text-[10px] text-violet-600 dark:text-violet-400 mt-2">
              Target: COMFORT-B score 11–17 · Daily sedation interruption + SBT as tolerated
            </div>
          </div>

          {/* ARDSnet ladder */}
          {condition === "ards" && (
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-red-600 dark:text-red-400 mb-3">ARDSnet PEEP–FiO₂ Ladder</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-red-100 dark:bg-red-900/40">
                      <th className="text-left px-2 py-1.5 font-mono text-[9px] uppercase tracking-widest text-red-600 dark:text-red-400">FiO₂</th>
                      {[30,40,50,60,70,80,90,100].map(f => <th key={f} className="px-2 py-1.5 font-mono text-[9px] text-red-500">{f}%</th>)}
                    </tr>
                    <tr className="border-t border-red-200 dark:border-red-800">
                      <th className="text-left px-2 py-1.5 font-mono text-[9px] uppercase tracking-widest text-red-600 dark:text-red-400">PEEP</th>
                      {[5,5,8,10,10,10,14,18].map((p, i) => <td key={i} className="px-2 py-1.5 text-center font-mono font-bold text-red-600 dark:text-red-400 text-xs">{p}</td>)}
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="text-[10px] text-red-600 dark:text-red-400 mt-2">
                Permissive hypercapnia: accept pH 7.20–7.30 to keep plateau ≤ 30 cmH₂O. Prone ≥ 12 hr/day if PaO₂/FiO₂ &lt; 150.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════
          VIEW 2: TROUBLESHOOTING
      ════════════════════════════════════════════ */}
      {activeView === "troubleshoot" && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Click any problem to expand causes and immediate actions.
          </div>

          {TROUBLESHOOT.map(t => {
            const isOpen = openTrouble === t.id;
            const severityColor = t.severity === "critical"
              ? "border-l-red-500 bg-red-50 dark:bg-red-950/20"
              : t.severity === "urgent"
              ? "border-l-amber-500 bg-amber-50 dark:bg-amber-950/20"
              : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20";
            return (
              <div key={t.id} className={`border-l-4 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden ${severityColor}`}>
                <button
                  onClick={() => setOpenTrouble(isOpen ? null : t.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{t.icon}</span>
                    <div className="text-left">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{t.problem}</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-0.5">
                        {t.severity === "critical" ? "CRITICAL" : t.severity === "urgent" ? "URGENT" : "ASSESS"}
                      </div>
                    </div>
                  </div>
                  <CaretDown size={13} weight="bold" className={`text-slate-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Possible Causes</div>
                      <div className="space-y-1">
                        {t.causes.map((cause, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                            {cause}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <ArrowRight size={12} weight="bold" className="text-slate-500" />
                        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Immediate Action</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{t.action}</p>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2">
                      <Lightbulb size={12} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{t.pearl}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* DOPE card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 mt-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-3">DOPE Mnemonic — Acute Deterioration on Ventilator</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { letter: "D", word: "Displaced",   detail: "ETT moved up/down. Check depth at lips." },
                { letter: "O", word: "Obstructed",  detail: "Mucus plug, kink, biting tube. Suction + check." },
                { letter: "P", word: "Pneumothorax",detail: "Auscultate + bedside US. Needle decompress if tension." },
                { letter: "E", word: "Equipment",   detail: "Circuit disconnect, vent failure. Bag manually." },
              ].map(d => (
                <div key={d.letter} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  <div className="text-3xl font-black text-slate-900 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{d.letter}</div>
                  <div className="font-bold text-xs text-slate-700 dark:text-slate-200 mb-1">{d.word}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">{d.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          VIEW 3: WAVEFORMS
      ════════════════════════════════════════════ */}
      {activeView === "waveforms" && <WaveformsView />}

      {/* ════════════════════════════════════════════
          VIEW 4: WEANING & SBT
      ════════════════════════════════════════════ */}
      {activeView === "weaning" && (
        <div className="space-y-5">

          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 mb-3">Daily Readiness Assessment</div>
            <div className="space-y-2">
              {[
                "Haemodynamically stable (no/low vasopressors)",
                "SpO₂ ≥ 92% on FiO₂ ≤ 0.40 + PEEP ≤ 5–8 cmH₂O",
                "Adequate cough and gag reflex",
                "Spontaneous respiratory effort present",
                "No significant metabolic derangement (pH ≥ 7.30)",
                "Resolving primary pathology",
                "Sedation weaned to low level (COMFORT-B ≤ 17)",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                  <CheckCircle size={13} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Section title="Spontaneous Breathing Trial (SBT)" icon="🌬️" defaultOpen={true}>
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">SBT Settings</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">PS 5–8 cmH₂O + PEEP 5</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Duration: 30–120 minutes</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Monitor During SBT</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                    <div>• RR, SpO₂, HR, BP every 15 min</div>
                    <div>• Increased work of breathing</div>
                    <div>• Diaphoresis / agitation</div>
                    <div>• SpO₂ &lt; 90% → STOP SBT</div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3">
                <div className="text-[9px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">Cuff Leak Test (pre-extubation)</div>
                <div className="text-xs text-amber-800 dark:text-amber-200">
                  Deflate ETT cuff → listen for air leak around tube on inspiration. <strong>Audible leak = lower risk of post-extubation stridor.</strong> No leak in child &lt; 7 yr → consider dexamethasone pre-extubation.
                </div>
              </div>
              <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 p-3">
                <div className="text-[9px] font-mono uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-1">Pre-Extubation Dexamethasone</div>
                <div className="text-xs text-violet-800 dark:text-violet-200">
                  If at risk of post-extubation stridor (prolonged intubation &gt; 5 days, &lt; 7 yr, previous stridor, no cuff leak):
                  <strong> Dexamethasone 0.25 mg/kg IV q6h × 4 doses</strong> (first dose 12 hr before extubation). Max 10 mg.
                </div>
              </div>
            </div>
          </Section>

          <Section title="Post-Extubation Support" icon="🫁">
            <div className="space-y-2">
              {[
                { label: "HFNC (High Flow Nasal Cannula)", detail: `Flow: ${Math.round(weight * 2)}–${Math.round(weight * 3)} L/min (2–3 L/kg/min). FiO₂ titrate to SpO₂. Reduces work of breathing post-extubation.` },
                { label: "NIV (CPAP/BiPAP)", detail: "CPAP 5–8 cmH₂O or BiPAP IPAP 10–14 / EPAP 5. If HFNC failing or high risk of re-intubation." },
                { label: "Heliox 70:30", detail: "If post-extubation stridor — reduces turbulent flow. Give via tight-fitting mask. Buys time before re-intubation." },
                { label: "Nebulised adrenaline", detail: `${weight < 20 ? "2.5 mL of 1:1000" : "5 mL of 1:1000"} nebulised for post-extubation stridor. Observe ≥ 2 hr for rebound.` },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-xs text-slate-900 dark:text-white mb-0.5">{item.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Lung Protective Strategy (ARDS)" icon="🛡️">
            <div className="space-y-2">
              {[
                "Vt 4–6 mL/kg PBW · Plateau pressure ≤ 30 cmH₂O · Driving pressure ≤ 15 cmH₂O",
                "Permissive hypercapnia: pH 7.20–7.45 acceptable to achieve low Vt/pressure targets",
                "PEEP–FiO₂ ladder per ARDSnet (see Settings view)",
                "Recruitment manoeuvre: 30–40 cmH₂O × 30–40 s if refractory hypoxia (avoid if haemodynamic instability)",
                "Prone positioning: ≥ 12 hr/day if PaO₂/FiO₂ < 150 despite optimised conventional ventilation",
                "iNO: rescue for refractory hypoxaemia, PPHN, post-cardiac surgery",
                "ECMO: oscillation index > 40 or PaO₂/FiO₂ < 100 despite optimised ventilation",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <ArrowRight size={11} weight="bold" className="text-slate-400 flex-shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* Footer */}
      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        Tintinalli Ch.30 · BTS/ATS Guidelines · PEMVECC 2017 · ARDSnet · OpenPediatrics · PaediatricEmergencies.com
      </div>
    </div>
  );
}
