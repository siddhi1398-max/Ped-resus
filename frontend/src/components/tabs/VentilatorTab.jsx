// frontend/src/components/tabs/VentilatorTab.jsx
// References: Tintinalli · BTS/ATS · OpenPediatrics · PEMVECC 2017 · ARDSnet · Fleischer & Ludwig

import { useState, useMemo, useEffect } from "react";
import WaveformLibrary from "../tabs/WaveformView";
import VentSim from "../tabs/VentSim"; 
import { useWeight } from "../../context/WeightContext";
import {
  Warning,
  Lightbulb,
  ArrowRight,
  CaretDown,
  CheckCircle,
  Gear,
  Wrench,
  ChartLine,
  ArrowLineDown,
  Wind,
  Thermometer,
  Drop,
  FirstAid,
  ArrowUp,
  ArrowDown,
  Waves,
  Lightning,
  Stethoscope,
  SmileyXEyes,
  Prohibit,
  Pulse,
  ArrowsOut,
  ShieldWarning,
} from "@phosphor-icons/react";

// ─── CLINICAL CONDITION PRESETS ───────────────────────────────────────────────
const CONDITIONS = [
  { id: "normal",        label: "Normal Lungs",        color: "emerald", peep: 5,  fio2: 0.40, vtFactor: 7, rateAdj: 1.0, note: "Standard post-intubation settings" },
  { id: "ards",          label: "ARDS",                 color: "red",     peep: 10, fio2: 0.80, vtFactor: 5, rateAdj: 1.3, note: "Lung-protective: Vt 4–6 mL/kg, high PEEP, permissive hypercapnia" },
  { id: "asthma",        label: "Asthma / BPD",         color: "amber",   peep: 5,  fio2: 0.50, vtFactor: 7, rateAdj: 0.7, note: "Low rate, long expiratory time (I:E 1:3–4), avoid auto-PEEP" },
  { id: "pneumonia",     label: "Pneumonia",             color: "orange",  peep: 6,  fio2: 0.60, vtFactor: 6, rateAdj: 1.1, note: "Moderate PEEP, standard Vt. Watch for consolidation worsening" },
  { id: "cardiac",       label: "Post-Cardiac Surgery",  color: "violet",  peep: 5,  fio2: 0.40, vtFactor: 6, rateAdj: 1.0, note: "Aim early extubation. Avoid high PEEP (↓venous return)" },
  { id: "pphn",          label: "PPHN (Neonatal)",       color: "rose",    peep: 5,  fio2: 1.0,  vtFactor: 5, rateAdj: 1.5, note: "High FiO₂, consider iNO. Avoid hypocarbia. Alkalosis helps (pH 7.45–7.55)" },
  { id: "bronchiolitis", label: "Bronchiolitis",         color: "sky",     peep: 5,  fio2: 0.50, vtFactor: 6, rateAdj: 0.8, note: "HFNC / NIV preferred. If intubated: low rate, long Te, avoid PEEP stacking" },
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
    Icon: ArrowUp,
    severity: "urgent",
    causes: ["Bronchospasm / secretions", "ETT obstruction, kink or biting", "Pneumothorax", "Main-stem intubation", "Pulmonary oedema / stiff ARDS lung"],
    action: "DOPES mnemonic: Disconnect from vent → bag manually. Check: D-isplaced ETT · O-bstruction (suction) · P-neumothorax (auscultate/chest US) · E-quipment failure · S-tacked breaths.",
    pearl: "Peak–Plateau pressure gradient >10 cmH₂O → airway resistance problem (secretions, bronchospasm). If both elevated → compliance problem (ARDS, oedema, PTX).",
  },
  {
    id: "low-vt",
    problem: "↓ Tidal Volume / Minute Ventilation",
    Icon: ArrowDown,
    severity: "urgent",
    causes: ["Cuff leak (hear gurgling)", "Circuit disconnect", "ETT dislodgement", "Severe bronchospasm"],
    action: "Check ETT depth and position. Check cuff pressure (target 20–25 cmH₂O). Inspect all circuit connections. Observe chest rise bilaterally.",
    pearl: "In pressure-controlled ventilation, a drop in Vt with unchanged PIP = ↓ compliance. In volume-controlled, a rise in PIP with unchanged Vt = ↑ resistance or ↓ compliance.",
  },
  {
    id: "hypoxia",
    problem: "Refractory Hypoxia (SpO₂ < 88%)",
    Icon: Prohibit,
    severity: "critical",
    causes: ["FiO₂ / PEEP inadequate", "Main-stem intubation", "Pneumothorax", "Pulmonary embolism", "Cardiac R→L shunt", "Decompensated heart failure"],
    action: "Step 1: Increase FiO₂ to 1.0 immediately. Step 2: Confirm bilateral breath sounds. Step 3: Bedside echo (effusion, tamponade, RV failure). Step 4: CXR. Step 5: Consider recruitment manoeuvre if ARDS (30 cmH₂O × 30 s).",
    pearl: "SpO₂ probe on right hand = pre-ductal in neonates (true arterial). Post-ductal (foot) SpO₂ lower in PPHN — difference >5% suggests R→L ductal shunting.",
  },
  {
    id: "hypercapnia",
    problem: "Hypercapnia (PaCO₂ > 55 mmHg)",
    Icon: Wind,
    severity: "moderate",
    causes: ["Low rate or Vt", "Large dead space (↑ PEEP, ↓ CO)", "Increased CO₂ production (fever, sepsis, agitation)", "ETT cuff leak"],
    action: "Increase RR first (preferred over Vt to limit volutrauma). Accept permissive hypercapnia (pH 7.20–7.30) in lung-protective strategy for ARDS. Treat fever. Check for cuff leak.",
    pearl: "PaCO₂ = VCO₂ / (VA). Increasing RR raises VA more safely than increasing Vt. ETCO₂ < PaCO₂ by 5–10 mmHg in normal physiology — widening gap = ↑ dead space.",
  },
  {
    id: "auto-peep",
    problem: "Auto-PEEP / Breath Stacking",
    Icon: Waves,
    severity: "moderate",
    causes: ["Obstructive disease (asthma, bronchiolitis)", "Inadequate expiratory time", "High respiratory rate"],
    action: "Reduce RR (allow more expiratory time). Extend I:E to 1:3 or 1:4. Bronchodilators via in-line nebuliser. Confirm on vent flow-time waveform (flow not returning to zero before next breath).",
    pearl: "To measure auto-PEEP: perform expiratory hold manoeuvre — read the plateau. In severe asthma, disconnect briefly to allow full exhalation if haemodynamic compromise.",
  },
  {
    id: "dysynchrony",
    problem: "Patient–Ventilator Dyssynchrony",
    Icon: Lightning,
    severity: "moderate",
    causes: ["Pain or agitation (inadequate sedation)", "Inappropriate trigger sensitivity", "Auto-PEEP (patient triggering against stacked breaths)", "Inappropriate flow or inspiratory time"],
    action: "Optimise analgesia (fentanyl) + sedation (midazolam). Adjust flow trigger to 1–3 L/min (or pressure trigger –1 to –2 cmH₂O). Check for auto-PEEP. Consider PRVC or pressure support if fighting VC mode.",
    pearl: "COMFORT-B score target 11–17 for sedated ventilated children. Daily sedation interruption reduces vent days. Neuromuscular blockade only for severe dyssynchrony or prone positioning.",
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
      {info  && <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{info}</div>}
    </div>
  );
}

// ─── SECTION TOGGLE ───────────────────────────────────────────────────────────
function Section({ title, IconComp, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {IconComp && <IconComp size={16} weight="bold" className="text-slate-500 dark:text-slate-400 flex-shrink-0" />}
          <span className="font-bold text-sm text-slate-900 dark:text-white"
                style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{title}</span>
        </div>
        <CaretDown size={14} weight="bold" className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 py-4 bg-white dark:bg-slate-900/50">{children}</div>}
    </div>
  );
}

// ─── MNEMONIC CARD ────────────────────────────────────────────────────────────
function MnemonicCard({ title, items }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-3">{title}</div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {items.map(d => (
          <div key={d.letter + d.word} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{d.letter}</div>
            <div className="font-bold text-xs text-slate-700 dark:text-slate-200 mb-1">{d.word}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">{d.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function VentilatorTab({ searchEntry }) {
  const { weight } = useWeight();
  const [condition, setCondition]     = useState("normal");
  const [openTrouble, setOpenTrouble] = useState(null);
  const [activeView, setActiveView]   = useState("settings");

  useEffect(() => {
    if (!searchEntry?.section) return;
    const sectionMap = {
      "Settings":   "settings",
      "Troubleshoot": "troubleshoot",
      "Waveforms":  "waveforms",
      "Weaning":    "weaning",
    };
    const view = sectionMap[searchEntry.section];
    if (view) setActiveView(view);
  }, [searchEntry]);

  const cond = CONDITIONS.find(c => c.id === condition);
  const c    = CMAP[cond.color];

  const params = useMemo(() => {
    const wt       = Math.max(weight, 0.5);
    const baseRate = wt < 3 ? 50 : wt < 10 ? 30 : wt < 20 ? 25 : wt < 35 ? 20 : 16;
    const rate     = Math.round(baseRate * cond.rateAdj);
    const vtLow    = +(wt * (cond.vtFactor - 1)).toFixed(1);
    const vtHigh   = +(wt * cond.vtFactor).toFixed(1);
    const peep     = cond.peep;
    const mvLow    = +((vtLow  / 1000) * rate).toFixed(2);
    const mvHigh   = +((vtHigh / 1000) * rate).toFixed(2);
    const ti       = wt < 5 ? "0.3–0.5" : wt < 10 ? "0.5–0.7" : wt < 20 ? "0.7–0.9" : wt < 40 ? "0.9–1.1" : "1.2–1.5";
    const ie       = condition === "asthma" || condition === "bronchiolitis" ? "1:3 to 1:4" : wt < 5 ? "1:1 to 1:2" : "1:2";
    const pipMax   = condition === "ards" ? 28 : 30;
    const midaz    = +(wt * 0.05).toFixed(2);
    const midazH   = +(wt * 0.2).toFixed(2);
    const fentL    = wt * 1;
    const fentH    = wt * 4;
    return { wt, rate, vtLow, vtHigh, peep, mvLow, mvHigh, ti, ie, pipMax, midaz, midazH, fentL, fentH };
  }, [weight, condition, cond]);

  // ── View tab config ──────────────────────────────────────────────────────
 const views = [
  { id: "settings",     label: "Vent Settings",    Icon: Gear          },
  { id: "troubleshoot", label: "Troubleshoot",     Icon: Wrench        },
  { id: "waveforms",    label: "Waveform Library", Icon: ChartLine     },
  { id: "simulator",    label: "Vent Simulator",   Icon: ArrowsOut     }, 
  { id: "weaning",      label: "Weaning & SBT",    Icon: ArrowLineDown },
];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Ventilator Dashboard
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Weight-based settings for{" "}
          <span className="text-slate-900 dark:text-white font-bold">{weight} kg</span> patient ·
          Tintinalli · BTS/ATS · PEMVECC 2017 · OpenPediatrics
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
        <Warning size={13} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>Educational reference only. All ventilator settings must be individualised by a qualified intensivist based on clinical response, blood gases, and vent waveforms.</span>
      </div>

      {/* View tabs */}
      <div className="flex flex-wrap gap-2">
        {views.map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
              activeView === v.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>
            <v.Icon size={13} weight="bold" />
            {v.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════ VIEW 1: SETTINGS ════════════════════════ */}
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
            <ParamCard label="Tidal Volume"      value={`${params.vtLow}–${params.vtHigh}`}                    unit="mL"     range={`${cond.vtFactor - 1}–${cond.vtFactor} mL/kg`} alert={condition === "ards"} info="Use IBW not actual weight for obese patients" />
            <ParamCard label="Rate (RR)"          value={`${Math.max(params.rate - 2, 10)}–${params.rate + 2}`} unit="/min"   range="Age-adjusted" info={params.wt < 5 ? "Neonate: 40–60/min" : params.wt < 10 ? "Infant: 25–35/min" : params.wt < 20 ? "Toddler: 20–28/min" : "Child: 16–24/min"} />
            <ParamCard label="PEEP"               value={params.peep}                                            unit="cmH₂O" range={condition === "ards" ? "8–15" : "4–6"} info="↑ PEEP = ↑ oxygenation but ↓ venous return" />
            <ParamCard label="FiO₂ (start)"       value={`${Math.round(cond.fio2 * 100)}%`}                     unit=""       range="Titrate to SpO₂ ≥ 92%" info="Reduce FiO₂ to < 60% as soon as safe (O₂ toxicity)" alert={cond.fio2 >= 0.8} />
            <ParamCard label="Minute Ventilation" value={`${params.mvLow}–${params.mvHigh}`}                    unit="L/min"  range="Normal 100–150 mL/kg/min" info="MV = Vt × RR" />
            <ParamCard label="Inspiratory Time"   value={params.ti}                                              unit="sec"    range="Age-adjusted" info={params.wt < 5 ? "Neonates: 0.3–0.5 s" : params.wt < 10 ? "Infant: 0.5–0.7 s" : params.wt < 20 ? "Toddler: 0.7–0.9 s" : params.wt < 40 ? "Child: 0.9–1.1 s" : "Adolescent: 1.2–1.5 s"} />
            <ParamCard label="I:E Ratio"           value={params.ie}                                              unit=""       range={condition === "asthma" ? "Extend to 1:4" : "Standard 1:2"} info={condition === "asthma" ? "Allow full expiration to prevent air trapping" : "Increase E time in obstructive disease"} />
            <ParamCard label="Max PIP / Plateau"  value={`≤ ${params.pipMax}`}                                  unit="cmH₂O" range="Plateau ≤ 30" alert={condition === "ards"} info="Driving pressure = Plateau – PEEP. Target < 15 cmH₂O" />
          </div>

          {/* Mode recommendation */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-3">Recommended Mode</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-mono text-slate-400 mb-1">PEDIATRIC (&gt; 5 kg)</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {condition === "ards"         ? "PRVC (Pressure-Regulated Volume Control)"    :
                   condition === "asthma" || condition === "bronchiolitis" ? "SIMV-PC + PS (low rate, long Te)" :
                   condition === "pphn"          ? "PC-AC (optimise oxygenation)"                :
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
              {[
                { label: "Midazolam",  val: `${params.midaz}–${params.midazH}`, unit: "mg/hr",  sub: "0.05–0.2 mg/kg/hr" },
                { label: "Fentanyl",   val: `${params.fentL}–${params.fentH}`,  unit: "mcg/hr", sub: "1–4 mcg/kg/hr" },
                { label: "NMB (if needed)", val: "Rocuronium", unit: "",         sub: "5–10 mcg/kg/min infusion. Only for severe dyssynchrony / prone / severe ARDS" },
              ].map(drug => (
                <div key={drug.label} className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-violet-100 dark:border-violet-900">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">{drug.label}</div>
                  <div className="font-black text-lg text-violet-600 dark:text-violet-400"
                       style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                    {drug.val}
                    {drug.unit && <span className="text-xs font-normal text-slate-400 ml-1">{drug.unit}</span>}
                  </div>
                  <div className="text-[10px] text-slate-400">{drug.sub}</div>
                </div>
              ))}
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
                      {[5,5,8,10,10,10,14,18].map((p, i) => (
                        <td key={i} className="px-2 py-1.5 text-center font-mono font-bold text-red-600 dark:text-red-400 text-xs">{p}</td>
                      ))}
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

      {/* ════════════════════════ VIEW 2: TROUBLESHOOT ════════════════════════ */}
      {activeView === "troubleshoot" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Tap any problem to expand causes and immediate actions.
          </p>

          {TROUBLESHOOT.map(t => {
            const isOpen = openTrouble === t.id;
            const severityStyle =
              t.severity === "critical" ? "border-l-red-500 bg-red-50 dark:bg-red-950/20"    :
              t.severity === "urgent"   ? "border-l-amber-500 bg-amber-50 dark:bg-amber-950/20" :
                                          "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20";
            const severityLabel =
              t.severity === "critical" ? "CRITICAL" :
              t.severity === "urgent"   ? "URGENT"   : "ASSESS";
            const severityColor =
              t.severity === "critical" ? "text-red-500"   :
              t.severity === "urgent"   ? "text-amber-500" : "text-blue-500";

            return (
              <div key={t.id} className={`border-l-4 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden ${severityStyle}`}>
                <button
                  onClick={() => setOpenTrouble(isOpen ? null : t.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <t.Icon size={18} weight="bold" className={`${severityColor} flex-shrink-0`} />
                    <div className="text-left">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{t.problem}</div>
                      <div className={`text-[10px] font-mono uppercase tracking-widest mt-0.5 ${severityColor}`}>
                        {severityLabel}
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
                            <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
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

          {/* DOPES mnemonic */}
          <MnemonicCard
            title="DOPES Mnemonic — Acute Deterioration on Ventilator"
            items={[
              { letter: "D", word: "Displaced",      detail: "ETT moved up/down. Check depth at lips." },
              { letter: "O", word: "Obstructed",     detail: "Mucus plug, kink, biting tube. Suction + check." },
              { letter: "P", word: "Pneumothorax",   detail: "Auscultate + bedside US. Needle decompress if tension." },
              { letter: "E", word: "Equipment",      detail: "Circuit disconnect, vent failure. Bag manually." },
              { letter: "S", word: "Stacked Breaths",detail: "Auto-PEEP from inadequate expiratory time." },
            ]}
          />

          {/* DOTTS mnemonic */}
          <MnemonicCard
            title="DOTTS Mnemonic — Systematic Vent Check"
            items={[
              { letter: "D", word: "Disconnect",       detail: "Disconnect patient from vent. Bag manually — assess resistance." },
              { letter: "O", word: "Oxygen",           detail: "Oxygenate with bag-mask. Note resistance and compliance." },
              { letter: "T", word: "Tube Position",    detail: "Check ETT depth, migration, kinking, or mucus plug obstruction." },
              { letter: "T", word: "Tweak the Vent",   detail: "Review if settings are appropriate for current patient state." },
              { letter: "S", word: "Sonography",       detail: "Lung ultrasound: bilateral lung sliding, rule out PTX / effusion." },
            ]}
          />
        </div>
      )}

      {/* ════════════════════════ VIEW 3: WAVEFORMS ════════════════════════ */}
      {activeView === "waveforms"  && <WaveformLibrary />}

       {/* ════════════════════════ VIEW 4: VENT SIMULATOR ════════════════════════ */}
      {activeView === "simulator"  && <VentSim />}
      
      {/* ════════════════════════ VIEW 4: WEANING ════════════════════════ */}
      {activeView === "weaning" && (
        <div className="space-y-5">

          {/* Readiness checklist */}
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

          <Section title="Spontaneous Breathing Trial (SBT)" IconComp={Wind} defaultOpen={true}>
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
                    <div>· RR, SpO₂, HR, BP every 15 min</div>
                    <div>· Increased work of breathing</div>
                    <div>· Diaphoresis / agitation</div>
                    <div>· SpO₂ &lt; 90% → STOP SBT</div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Stethoscope size={11} weight="bold" className="text-amber-600 dark:text-amber-400" />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400">Cuff Leak Test (pre-extubation)</span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Deflate ETT cuff → listen for air leak on inspiration.{" "}
                  <strong>Audible leak = lower risk of post-extubation stridor.</strong> No leak in child &lt; 7 yr → consider dexamethasone pre-extubation.
                </p>
              </div>
              <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FirstAid size={11} weight="bold" className="text-violet-600 dark:text-violet-400" />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-violet-600 dark:text-violet-400">Pre-Extubation Dexamethasone</span>
                </div>
                <p className="text-xs text-violet-800 dark:text-violet-200">
                  If at risk of post-extubation stridor (prolonged intubation &gt; 5 days, &lt; 7 yr, previous stridor, no cuff leak):{" "}
                  <strong>Dexamethasone 0.25 mg/kg IV q6h × 4 doses</strong> (first dose 12 hr before extubation). Max 10 mg.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Post-Extubation Support" IconComp={ArrowsOut}>
            <div className="space-y-2">
              {[
                { label: "HFNC (High Flow Nasal Cannula)", detail: `Flow: ${Math.round(weight * 2)}–${Math.round(weight * 3)} L/min (2–3 L/kg/min). FiO₂ titrate to SpO₂. Reduces work of breathing post-extubation.` },
                { label: "NIV (CPAP/BiPAP)",               detail: "CPAP 5–8 cmH₂O or BiPAP IPAP 10–14 / EPAP 5. If HFNC failing or high risk of re-intubation." },
                { label: "Heliox 70:30",                   detail: "If post-extubation stridor — reduces turbulent flow. Give via tight-fitting mask. Buys time before re-intubation." },
                { label: "Nebulised adrenaline",           detail: `${weight < 20 ? "2.5 mL of 1:1000" : "5 mL of 1:1000"} nebulised for post-extubation stridor. Observe ≥ 2 hr for rebound.` },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-xs text-slate-900 dark:text-white mb-0.5">{item.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Lung Protective Strategy (ARDS)" IconComp={ShieldWarning}>
            <div className="space-y-1.5">
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
