// EquipmentTab.jsx
// Sub-tabs: Equipment Calculator · Difficult Airway · Monitoring Equipment · Reference Table
// Sources: Harriet Lane 23e · Fleischer & Ludwig 7e · APLS · AIDAA 2022
//          Vortex Approach (Chrimes 2016 · vortexapproach.org) · Morgan & Mikhail 7e

import { useState, useMemo } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Warning, Lightbulb, ArrowRight, CheckCircle, Circle,
  Wind, Drop, Heartbeat, ClipboardText, Pulse, Stethoscope,
  Syringe, ArrowsOut,
} from "@phosphor-icons/react";

import {
  getFOBSize,
  getBPCuff,
  BP_CUFF_ROWS,
  FORMULA_ROWS,
  DA_PREDICTORS,
  DA_MNEMONICS,
  RESCUE_DEVICES,
  CTM_NOTES,
  SPO2_PROBE_ROWS,
  SPO2_LIMITATIONS,
  SPO2_TARGETS,
  BVM_SIZES,
  BVM_TECHNIQUES,
  BVM_FAILURES,
  BP_METHODS,
  FOB_STEPS,
  FOB_AWAKE_STEPS,
  FOB_LMA_STEPS,
  FOBSizingSVG,
} from "../../data/equipment";
import { EQUIPMENT_ROWS } from "../../data/equipmentreference";

// ─── COLOUR HELPERS ────────────────────────────────────────────────────────────
const TONE = {
  red:     { text: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-950/30",       border: "border-red-200 dark:border-red-800"       },
  emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  amber:   { text: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-amber-200 dark:border-amber-800"   },
  blue:    { text: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200 dark:border-blue-800"     },
  violet:  { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800" },
  sky:     { text: "text-sky-600 dark:text-sky-400",       bg: "bg-sky-50 dark:bg-sky-950/30",       border: "border-sky-200 dark:border-sky-800"       },
  orange:  { text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" },
  slate:   { text: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-50 dark:bg-slate-900/50",   border: "border-slate-200 dark:border-slate-700"   },
};

// ─── SHARED WIDGETS ────────────────────────────────────────────────────────────
function EquipCard({ label, value, sub, tone = "slate", Icon, highlighted }) {
  const t = TONE[tone];
  return (
    <div className={`rounded-xl border p-3 bg-white dark:bg-slate-900 transition-all ${
      highlighted
        ? `${t.border} ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-950 ${t.border.replace("border-", "ring-")}`
        : "border-slate-200 dark:border-slate-700"
    }`}>
      {Icon && <Icon size={13} weight="fill" className={`${t.text} mb-1.5`} />}
      <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      <div
        className={`font-black text-lg leading-none mb-0.5 ${highlighted ? t.text : "text-slate-900 dark:text-white"}`}
        style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
      >{value}</div>
      {sub && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sub}</div>}
    </div>
  );
}

function InfoBox({ tone = "amber", icon: Icon, title, children }) {
  const t = TONE[tone];
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${t.bg} ${t.border} ${t.text}`}>
      {Icon && <Icon size={13} weight="fill" className="flex-shrink-0 mt-0.5" />}
      <div>
        <strong>{title}</strong>{title ? " — " : ""}{children}
      </div>
    </div>
  );
}
// ─── SUB-TAB 1: REFERENCE TABLE ───────────────────────────────────────────────
function ReferenceTableView() {
  const { weight } = useWeight();
  const [highlightAge, setHighlightAge] = useState(null);

  const suggestedIdx = useMemo(() => {
    const idx = EQUIPMENT_ROWS.findIndex(r => parseFloat(r.weight) >= weight);
    return idx >= 0 ? idx : EQUIPMENT_ROWS.length - 1;
  }, [weight]);

  const cols = [
    { k: "age",     label: "Age"          },
    { k: "weight",  label: "Weight (kg)"  },
    { k: "ett",     label: "ETT (mm ID)"  },
    { k: "depth",   label: "Depth (cm)"   },
    { k: "suction", label: "Suction (Fr)" },
    { k: "blade",   label: "Laryngoscope" },
    { k: "lma",     label: "LMA"          },
    { k: "ngt",     label: "NGT (Fr)"     },
    { k: "iv",      label: "IV"           },
    { k: "defib",   label: "Defib (J)"    },
  ];

  return (
    <div className="space-y-4">
      <InfoBox tone="sky" icon={Lightbulb}>
        Row matching current weight ({weight} kg) highlighted in blue. Tap any row to lock selection.
      </InfoBox>

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
            {EQUIPMENT_ROWS.map((r, i) => {
              const isSuggested   = i === suggestedIdx;
              const isHighlighted = highlightAge === r.age;
              let rowCls = "border-t border-slate-200 dark:border-slate-800 cursor-pointer transition-colors ";
              if      (isHighlighted) rowCls += "bg-violet-100 dark:bg-violet-950/50 ";
              else if (isSuggested)   rowCls += "bg-blue-50 dark:bg-blue-950/30 ";
              else                    rowCls += "odd:bg-white dark:odd:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/30 ";
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

      <div className="flex flex-wrap gap-4 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800" />Weight match</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800" />Selected</span>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3">Formula Reference</div>
        <div className="grid sm:grid-cols-2 gap-2 font-mono text-xs">
          {FORMULA_ROWS.map(f => (
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

// ─── CORRECT VORTEX SVG ───────────────────────────────────────────────────────
// Based on vortexapproach.org (Chrimes 2016)
// 3 lifelines: Face Mask · Supraglottic Airway · Endotracheal Tube
// Green Zone = oxygenation maintained (outer ring)
// Neck Rescue = centre (CICO)
// Each lifeline: attempt → optimise → attempt → if fail → spiral inward
function VortexSVG() {
  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-sm mx-auto" aria-label="Vortex Approach — Chrimes 2016 — vortexapproach.org">
      <defs>
        <radialGradient id="vortexGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#0c1a3a" />
          <stop offset="100%" stopColor="#071428" />
        </radialGradient>
      </defs>

      <rect width="400" height="400" rx="14" fill="#0a0f1e" />

      {/* ── Green Zone outer ring ── */}
      <circle cx="200" cy="200" r="185" fill="#064e3b" opacity="0.35" />
      <circle cx="200" cy="200" r="185" fill="none" stroke="#10b981" strokeWidth="3" />
      <text x="200" y="22"  textAnchor="middle" fill="#34d399" fontSize="9"  fontWeight="800" fontFamily="monospace" letterSpacing="3">GREEN ZONE</text>
      <text x="200" y="34"  textAnchor="middle" fill="#6ee7b7" fontSize="7"  fontFamily="monospace">OXYGENATION MAINTAINED</text>
      <text x="200" y="382" textAnchor="middle" fill="#34d399" fontSize="8"  fontFamily="monospace">Pause · Re-oxygenate · Plan next step</text>

      {/* ── Three lifeline sectors (120° each) ── */}

      {/* FACE MASK — top (blue) */}
      {/* Arc from 270° to 30° (top third) */}
      <path
        d="M200,200 L200,48 A152,152 0 0,1 331.6,276 Z"
        fill="#1d4ed8" fillOpacity="0.18"
        stroke="#3b82f6" strokeWidth="1.5"
      />
      {/* Label */}
      <text x="248" y="110" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="800" fontFamily="monospace">FACE</text>
      <text x="248" y="124" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="800" fontFamily="monospace">MASK</text>
      <text x="248" y="138" textAnchor="middle" fill="#60a5fa" fontSize="7"  fontFamily="monospace">Lifeline 1</text>

      {/* SUPRAGLOTTIC AIRWAY — bottom right (violet) */}
      <path
        d="M200,200 L331.6,276 A152,152 0 0,1 68.4,276 Z"
        fill="#5b21b6" fillOpacity="0.18"
        stroke="#8b5cf6" strokeWidth="1.5"
      />
      <text x="200" y="318" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="800" fontFamily="monospace">SUPRAGLOTTIC</text>
      <text x="200" y="332" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="800" fontFamily="monospace">AIRWAY</text>
      <text x="200" y="346" textAnchor="middle" fill="#a78bfa" fontSize="7"  fontFamily="monospace">Lifeline 2 · LMA / iGel</text>

      {/* ENDOTRACHEAL TUBE — bottom left (emerald) */}
      <path
        d="M200,200 L68.4,276 A152,152 0 0,1 200,48 Z"
        fill="#065f46" fillOpacity="0.18"
        stroke="#10b981" strokeWidth="1.5"
      />
      <text x="120" y="178" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="800" fontFamily="monospace">ENDO-</text>
      <text x="120" y="193" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="800" fontFamily="monospace">TRACHEAL</text>
      <text x="120" y="208" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="800" fontFamily="monospace">TUBE</text>
      <text x="120" y="222" textAnchor="middle" fill="#34d399" fontSize="7"  fontFamily="monospace">Lifeline 3 · ETT</text>

      {/* ── Optimisation prompts on each sector boundary ── */}
      <text x="172" y="66"  textAnchor="middle" fill="#fbbf24" fontSize="6" fontFamily="monospace" transform="rotate(-30,172,66)">OPTIMISE</text>
      <text x="340" y="260" textAnchor="middle" fill="#fbbf24" fontSize="6" fontFamily="monospace" transform="rotate(90,340,260)">OPTIMISE</text>
      <text x="60"  y="260" textAnchor="middle" fill="#fbbf24" fontSize="6" fontFamily="monospace" transform="rotate(-90,60,260)">OPTIMISE</text>

      {/* ── Sector dividing lines ── */}
      <line x1="200" y1="200" x2="200"   y2="48"   stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4,3" />
      <line x1="200" y1="200" x2="331.6" y2="276"  stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4,3" />
      <line x1="200" y1="200" x2="68.4"  y2="276"  stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4,3" />

      {/* ── Spiral arrows suggesting inward movement ── */}
      {/* These represent the "spiral inward" concept when lifelines fail */}
      <path d="M200,80 Q270,90 270,145" fill="none" stroke="#3b82f6" strokeWidth="1.2" strokeDasharray="3,2"
        markerEnd="url(#arrowBlue)" opacity="0.7"/>
      <path d="M308,264 Q270,230 240,210" fill="none" stroke="#8b5cf6" strokeWidth="1.2" strokeDasharray="3,2"
        markerEnd="url(#arrowViolet)" opacity="0.7"/>
      <path d="M92,264 Q130,230 158,210" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3,2"
        markerEnd="url(#arrowEmerald)" opacity="0.7"/>

      <defs>
        <marker id="arrowBlue"   markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#3b82f6" />
        </marker>
        <marker id="arrowViolet" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#8b5cf6" />
        </marker>
        <marker id="arrowEmerald"markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#10b981" />
        </marker>
        <marker id="arrowRed"    markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#ef4444" />
        </marker>
      </defs>

      {/* ── Centre — Neck Rescue (CICO) ── */}
      <circle cx="200" cy="200" r="60" fill="#450a0a" stroke="#dc2626" strokeWidth="2" />
      <circle cx="200" cy="200" r="52" fill="#3f0707" />
      {/* Small green dot in centre per vortexapproach.org — Green Zone also at centre after neck rescue */}
      <circle cx="200" cy="175" r="7" fill="#10b981" opacity="0.9" />
      <text x="200" y="179" textAnchor="middle" fill="#ffffff" fontSize="5" fontWeight="800" fontFamily="monospace">O₂</text>
      <text x="200" y="193" textAnchor="middle" fill="#fca5a5" fontSize="8.5" fontWeight="800" fontFamily="monospace">NECK</text>
      <text x="200" y="205" textAnchor="middle" fill="#fca5a5" fontSize="8.5" fontWeight="800" fontFamily="monospace">RESCUE</text>
      <text x="200" y="218" textAnchor="middle" fill="#fca5a5" fontSize="7"   fontFamily="monospace">eFONA / CICO</text>
      <text x="200" y="230" textAnchor="middle" fill="#f87171" fontSize="6"   fontFamily="monospace">ALL lifelines failed</text>
      <text x="200" y="241" textAnchor="middle" fill="#f87171" fontSize="6"   fontFamily="monospace">CALL EARLY</text>

      {/* Source attribution */}
      <text x="200" y="397" textAnchor="middle" fill="#334155" fontSize="6" fontFamily="monospace">
        Vortex Approach · N. Chrimes 2016 · vortexapproach.org
      </text>
    </svg>
  );
}

  return (
    <div className="space-y-5">

      {/* Weight display — from context, read-only */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Patient Weight</div>
          <div className="font-black text-2xl text-slate-900 dark:text-white"
               style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            {weight} <span className="text-base font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Set via weight input above ↑</div>
        </div>
        <div className="flex gap-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1 self-end">ETT Type</div>
          {[{ v: false, l: "Uncuffed" }, { v: true, l: "Cuffed" }].map(opt => (
            <button key={opt.l} onClick={() => setCuffed(opt.v)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono self-center transition-all ${
                cuffed === opt.v
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}>{opt.l}</button>
          ))}
        </div>
      </div>
      {eq.preferCuffed && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 -mt-3 px-1">
          <CheckCircle size={12} weight="fill" className="text-emerald-500" />
          Cuffed ETT preferred (≥2 yr or ≥8 kg) — reduces reintubation, allows PEEP, safer in transport
        </div>
      )}

      {/* Hero ETT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
            ETT Size — {cuffed ? "Cuffed" : "Uncuffed"}
          </div>
          <div className="font-black text-5xl text-emerald-700 dark:text-emerald-300 leading-none mb-1"
               style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            {ettSize}<span className="text-lg font-normal ml-1">mm ID</span>
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

// ─── SUB-TAB 2: DIFFICULT AIRWAY ──────────────────────────────────────────────
function DifficultAirwayView() {
  const { weight } = useWeight();
  const [section, setSection] = useState("predict");

  const lmaSize = weight < 5 ? "1" : weight < 10 ? "1.5" : weight < 20 ? "2" : weight < 30 ? "2.5" : weight < 50 ? "3" : "4";
  const fob     = getFOBSize(weight);

  const sectionBtns = [
    { id: "predict", label: "Prediction"      },
    { id: "vortex",  label: "Vortex Approach" },
    { id: "fob",     label: "Fibreoptic"      },
    { id: "devices", label: "Rescue Devices"  },
  ];

  return (
    <div className="space-y-4">
      <InfoBox tone="red" icon={Warning}>
        Difficult airway in children is life-threatening. Senior clinician and anaesthesia backup MUST be called early.
        Never allow SpO₂ to fall below 90% before escalating. Use the Vortex Approach.
      </InfoBox>

      <div className="flex flex-wrap gap-1.5">
        {sectionBtns.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
              section === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{s.label}</button>
        ))}
      </div>

      {/* ── PREDICTION ── */}
      {section === "predict" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-3" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Difficult Airway Predictors — Paediatric (AIDAA 2022)
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {DA_PREDICTORS.map(g => (
                <div key={g.label} className="space-y-1.5">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">{g.label}</div>
                  {g.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <ArrowRight size={10} weight="bold" className="text-amber-500 flex-shrink-0 mt-0.5" />{item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
            <div className="font-bold text-sm mb-2 text-amber-700 dark:text-amber-300"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Paediatric LEMON / MOANS / RODS</div>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              {DA_MNEMONICS.map(g => (
                <div key={g.mnemonic} className="space-y-1">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">{g.mnemonic}</div>
                  {g.items.map((item, i) => (
                    <div key={i} className="text-amber-800 dark:text-amber-200 text-[11px]">{item}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── VORTEX ── */}
      {section === "vortex" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-0.5" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              The Vortex Approach — N. Chrimes 2016
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">
              3 lifelines: Face Mask · Supraglottic Airway · Endotracheal Tube.
              Best effort at each → if fail → spiral inward → Neck Rescue.
              Green Zone = oxygenation maintained → pause · re-oxygenate · plan.
            </p>
            <a href="https://www.vortexapproach.org" target="_blank" rel="noopener noreferrer"
               className="text-[10px] font-mono text-blue-500 hover:underline block mb-3">
              vortexapproach.org ↗
            </a>

            <VortexSVG />

            {/* Lifeline detail cards */}
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {[
                {
                  color: "blue", lifeline: "Face Mask", num: "1",
                  steps: ["2-person EC grip preferred", "OPA: (age/4 + 4) cm", "NPA if OPA not tolerated", "Jaw thrust — not head tilt if c-spine concern", "Best effort = all optimisations attempted"],
                },
                {
                  color: "violet", lifeline: "Supraglottic Airway", num: "2",
                  steps: [`LMA size ${lmaSize} for ${weight} kg`, "2nd gen preferred: iGel / LMA Supreme", "Deflate cuff fully before insertion", "Max 2 attempts per operator", "iGel has gastric drain + high seal pressure"],
                },
                {
                  color: "emerald", lifeline: "Endotracheal Tube", num: "3",
                  steps: ["Optimise: BURP, head position, bougie", "Video laryngoscopy preferred in DA", "Max 3 laryngoscopy attempts total", "Confirm with waveform ETCO₂", "Use smallest ETT that passes easily"],
                },
              ].map(l => (
                <div key={l.lifeline} className={`rounded-lg border p-3 ${TONE[l.color].border} ${TONE[l.color].bg}`}>
                  <div className={`flex items-center gap-2 mb-2`}>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${TONE[l.color].text} border ${TONE[l.color].border} bg-white/50 dark:bg-black/20`}>
                      LIFELINE {l.num}
                    </span>
                  </div>
                  <div className={`font-bold text-xs mb-2 ${TONE[l.color].text}`}
                       style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{l.lifeline}</div>
                  {l.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-200 mb-1">
                      <span className={`font-bold ${TONE[l.color].text} flex-shrink-0`}>{i + 1}.</span> {s}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Neck Rescue callout */}
            <div className={`mt-3 rounded-lg border p-3 ${TONE.red.border} ${TONE.red.bg}`}>
              <div className={`font-bold text-xs mb-1.5 ${TONE.red.text}`}>
                Neck Rescue (eFONA) — All 3 Lifelines Failed
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-red-800 dark:text-red-200">
                <div>
                  <div className="font-semibold mb-1">Children ≥8 yr — Surgical CTM</div>
                  <div>Scalpel → horizontal stab incision → finger/dilator → ETT 5.0 mm → inflate cuff → confirm ETCO₂</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Children &lt;8 yr — Cannula</div>
                  <div>16G IV cannula through CTM → jet oxygenation (1 s on / 4 s off) → 3–5 min bridge only → CO₂ retention risk</div>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-red-700 dark:text-red-300 font-mono">
                ⚠ CTM is very small in children &lt;8 yr. Call ENT / surgeons EARLY. Do not wait for cardiac arrest.
              </div>
            </div>

            {/* Optimisation prompts */}
            <div className="mt-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3">
              <div className="font-bold text-xs text-amber-700 dark:text-amber-300 mb-1">
                5 Optimisation Categories — Apply to Each Lifeline
              </div>
              <div className="grid sm:grid-cols-5 gap-2 text-[10px] text-amber-800 dark:text-amber-200">
                {["Position (head/neck/body)", "Equipment (size, type, adjunct)", "Person (operator experience)", "External manipulation (BURP, jaw thrust)", "Pharmacology (relaxant, topical LA)"].map((o, i) => (
                  <div key={i} className="bg-white/50 dark:bg-black/20 rounded p-1.5 text-center font-mono">
                    <div className="font-bold text-amber-600 dark:text-amber-400 text-[11px] mb-0.5">{i + 1}</div>
                    {o}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FIBREOPTIC ── */}
      {section === "fob" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Fibreoptic Bronchoscope (FOB) — {weight} kg
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Gold standard for anticipated difficult airway. ETT must be loaded onto scope BEFORE insertion.
            </p>
            <FOBSizingSVG />
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-3 text-xs text-sky-800 dark:text-sky-200 space-y-1">
                  <div className="font-bold text-sky-600 dark:text-sky-400 text-[10px] uppercase tracking-wider mb-1">For {weight} kg patient</div>
                  <div className="font-bold text-sm">Scope OD: {fob.scope}</div>
                  <div>Min ETT ID: {fob.ett} mm (load before inserting)</div>
                  <div className="text-[10px] opacity-80">ETT must be ≥ scope OD + 0.8 mm</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1">Standard Technique</div>
                  {FOB_STEPS.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-sky-500 flex-shrink-0">{i + 1}.</span> {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">Awake FOB — Older Children</div>
                  {FOB_AWAKE_STEPS.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <ArrowRight size={9} weight="bold" className="text-amber-500 flex-shrink-0 mt-0.5" />{s}
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-200 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">LMA-Guided FOB</div>
                  {FOB_LMA_STEPS.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <ArrowRight size={9} weight="bold" className="text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESCUE DEVICES ── */}
      {section === "devices" && (
        <div className="space-y-3">
          {RESCUE_DEVICES.map(d => (
            <div key={d.name} className={`rounded-xl border p-4 bg-white dark:bg-slate-900/50 ${TONE[d.tone].border}`}>
              <div className={`font-bold text-sm mb-0.5 ${TONE[d.tone].text}`}
                   style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{d.name}</div>
              <div className="text-[10px] font-mono text-slate-400 mb-2">{d.sub}</div>
              <div className="space-y-1">
                {d.details.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <ArrowRight size={10} weight="bold" className={`${TONE[d.tone].text} flex-shrink-0 mt-0.5`} />{s}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SUB-TAB 3: MONITORING EQUIPMENT ─────────────────────────────────────────
// Removed: ETCO2 (covered in Ventilator tab), SpO2 SVG, BVM SVG
function MonitoringEquipmentView() {
  const { weight } = useWeight();
  const [section, setSection] = useState("spo2");

  const bpCuff     = getBPCuff(weight);
  const bpCuffRule = "Width = 40% of arm circumference · Length = 80–100% of arm circumference";

  const sectionBtns = [
    { id: "spo2", label: "Pulse Oximetry" },
    { id: "bp",   label: "BP Measurement" },
    { id: "bvm",  label: "BVM Details"    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {sectionBtns.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
              section === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{s.label}</button>
        ))}
      </div>

      {/* ── SPO2 ── (text only, no SVG) */}
      {section === "spo2" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-4">
          <div>
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Pulse Oximetry — Paediatric Principles</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standard of care for all sedated or critically ill children. 2 wavelengths (660 nm red / 940 nm infrared) — Beer-Lambert law.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2">Probe Selection by Age</div>
              <div className="space-y-2">
                {SPO2_PROBE_ROWS.map(r => (
                  <div key={r.age} className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2.5 text-xs">
                    <div className="font-bold text-slate-800 dark:text-white mb-0.5">{r.age}</div>
                    <div className="text-slate-600 dark:text-slate-300">{r.site}</div>
                    <div className="text-amber-600 dark:text-amber-400 text-[10px] mt-0.5">{r.warn}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className={`rounded-lg border p-3 ${TONE.red.border} ${TONE.red.bg}`}>
                <div className={`font-bold text-xs mb-1.5 ${TONE.red.text}`}>Limitations — Know Before You Trust</div>
                {SPO2_LIMITATIONS.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-800 dark:text-red-200">
                    <ArrowRight size={9} weight="bold" className="text-red-500 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
              <div className={`rounded-lg border p-3 ${TONE.emerald.border} ${TONE.emerald.bg}`}>
                <div className={`font-bold text-xs mb-1.5 ${TONE.emerald.text}`}>SpO₂ Targets by Age / Condition</div>
                {SPO2_TARGETS.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-200">
                    <ArrowRight size={9} weight="bold" className="text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BP ── */}
      {section === "bp" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-4">
          <div>
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Blood Pressure Measurement — {weight} kg</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Wrong cuff = wrong BP. Oscillometric (NIBP) is standard; Doppler preferred in shock.</p>
          </div>
          <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
            <div className="text-[9px] font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Recommended cuff for {weight} kg</div>
            <div className="font-black text-2xl text-blue-700 dark:text-blue-300"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{bpCuff}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{bpCuffRule}</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2">Cuff Size Reference</div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                      <th className="p-2 text-left font-mono text-[8px] uppercase tracking-widest">Age / Weight</th>
                      <th className="p-2 text-left font-mono text-[8px] uppercase tracking-widest">Cuff</th>
                      <th className="p-2 text-left font-mono text-[8px] uppercase tracking-widest">Width</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BP_CUFF_ROWS.map((r, i) => (
                      <tr key={r.aw} className={`border-t border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? "bg-white dark:bg-slate-900/30" : "bg-slate-50/50 dark:bg-slate-900/50"}`}>
                        <td className="p-2 text-slate-700 dark:text-slate-200">{r.aw}</td>
                        <td className="p-2 font-mono font-bold text-blue-600 dark:text-blue-400">{r.cuff}</td>
                        <td className="p-2 font-mono text-slate-500">{r.width}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3">
                <div className="font-bold text-xs mb-2 text-slate-700 dark:text-slate-200">Methods — When to Use</div>
                {BP_METHODS.map(m => (
                  <div key={m.method} className="mb-2">
                    <div className="font-bold text-[10px] text-slate-700 dark:text-slate-200">{m.method}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{m.use}</div>
                  </div>
                ))}
              </div>
              <InfoBox tone="amber" icon={Warning} title="Cuff errors">
                Too small → falsely HIGH BP. Too large → falsely LOW. In shocked child NIBP is unreliable — use arterial line or Doppler.
              </InfoBox>
            </div>
          </div>
        </div>
      )}

      {/* ── BVM — text only, no SVG ── */}
      {section === "bvm" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-4">
          <div>
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Bag-Valve-Mask — {weight} kg</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Seal failure is the #1 reason for BVM failure. Always use 2-person technique in critical cases.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs">
                <div className="font-bold text-slate-800 dark:text-white mb-2">Bag Sizes</div>
                {BVM_SIZES.map(b => (
                  <div key={b.size} className="mb-2 border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0 last:mb-0">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{b.size}</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">{b.vol}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[10px]">{b.use}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-3 text-xs text-sky-800 dark:text-sky-200 space-y-1.5">
                <div className="font-bold text-[10px] uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">Ventilation Targets — {weight} kg</div>
                <div>Tidal volume: <strong>6–8 mL/kg</strong> = <strong>{Math.round(weight * 6)}–{Math.round(weight * 8)} mL</strong></div>
                <div>Rate: infants 20–40/min · children 15–25/min · adolescents 12–20/min</div>
                <div>FiO₂ without reservoir: ~0.4 · With reservoir at 10–15 L/min: ~0.85–0.95</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-200 space-y-1.5">
                <div className="font-bold text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Technique</div>
                {BVM_TECHNIQUES.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckCircle size={9} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
              <div className={`rounded-lg border p-3 ${TONE.red.border} ${TONE.red.bg}`}>
                <div className={`font-bold text-xs mb-1.5 ${TONE.red.text}`}>Common BVM Failures</div>
                {BVM_FAILURES.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-800 dark:text-red-200">
                    <ArrowRight size={9} weight="bold" className="text-red-500 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "table",      label: "Reference Table",      Icon: ClipboardText },
  { id: "difficult",  label: "Difficult Airway",     Icon: Warning       },
  { id: "monitoring", label: "Monitoring",           Icon: Pulse         },
];

export default function EquipmentTab() {
  const { weight }  = useWeight();
  const [activeTab, setActiveTab] = useState("calculator");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Airway Equipment &amp; Monitoring
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Calculations for{" "}
          <span className="font-bold text-slate-900 dark:text-white">{weight} kg</span> ·
          Harriet Lane 23e · F&amp;L 7e · APLS · AIDAA 2022 · Vortex Approach (Chrimes 2016)
        </p>
      </div>

      <InfoBox tone="amber" icon={Warning}>
        Always prepare one ETT size above and below. Cuffed ETTs preferred ≥2 yr or ≥8 kg.
        Confirm ETT position with waveform ETCO₂ (colorimetric is backup only).
        RSI drug doses → Resuscitation tab. ETCO₂ interpretation → Ventilator tab.
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

      {activeTab === "table"      && <ReferenceTableView />}
      {activeTab === "difficult"  && <DifficultAirwayView />}
      {activeTab === "monitoring" && <MonitoringEquipmentView />}
     
      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        Harriet Lane 23e · Fleischer &amp; Ludwig 7e · APLS · AIDAA 2022 ·
        Vortex Approach — N. Chrimes 2016 · vortexapproach.org · Morgan &amp; Mikhail 7e · AHA PALS 2020
      </div>
    </div>
  );
}
