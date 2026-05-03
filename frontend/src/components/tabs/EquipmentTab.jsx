// EquipmentTab.jsx — Interactive Airway Equipment & Tubes
// Sub-tabs: Equipment Calculator · Reference Table · Difficult Airway · Monitoring Equipment
// Sources: Harriet Lane 23e · Fleischer & Ludwig 7e · APLS · Paed Anaesthesia guidelines
//          AIDAA Difficult Airway Guidelines 2022 · DAI Algorithm · Vortex Approach (Chrimes 2016)
//          Morgan & Mikhail Clinical Anaesthesiology 7e · Motoyama Paediatric Anaesthesia
//          Bhavani-Shankar Kodali — Capnography · AHA PALS 2020 · AAP Neonatology

import { useState, useMemo } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Warning, Lightbulb, ArrowRight, CheckCircle, Circle,
  Syringe, Wind, Drop, Heartbeat, FirstAid, ClipboardText,
  ArrowsOut, Pulse, Stethoscope, MaskHappy, Waves, Gauge,
} from "@phosphor-icons/react";
import { EQUIPMENT_ROWS } from "../../data/equipment";

// ─── COLOUR HELPERS ────────────────────────────────────────────────────────────
const TONE = {
  red:     { text: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-950/30",     border: "border-red-200 dark:border-red-800"     },
  emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  amber:   { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800"  },
  blue:    { text: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/30",   border: "border-blue-200 dark:border-blue-800"    },
  violet:  { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800" },
  sky:     { text: "text-sky-600 dark:text-sky-400",     bg: "bg-sky-50 dark:bg-sky-950/30",     border: "border-sky-200 dark:border-sky-800"     },
  orange:  { text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" },
  slate:   { text: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-900/50",  border: "border-slate-200 dark:border-slate-700"  },
};

// ─── FORMULA ENGINE ────────────────────────────────────────────────────────────
function calcEquipment(weight, ageYears) {
  const age = ageYears ?? 0;
  const ettUncuffed  = age > 0 ? +(age / 4 + 4).toFixed(1) : weight < 1 ? 2.5 : weight < 2 ? 3.0 : weight < 3 ? 3.0 : 3.5;
  const ettCuffed    = age > 0 ? +(age / 4 + 3.5).toFixed(1) : ettUncuffed - 0.5;
  const ettDepthOral  = age > 0 ? Math.round(age / 2 + 12)  : Math.round(weight + 6);
  const ettDepthNasal = age > 0 ? Math.round(age / 2 + 15) : Math.round(weight + 9);
  let lma = "1";
  if (weight >= 5  && weight < 10)  lma = "1.5";
  if (weight >= 10 && weight < 20)  lma = "2";
  if (weight >= 20 && weight < 30)  lma = "2.5";
  if (weight >= 30 && weight < 50)  lma = "3";
  if (weight >= 50 && weight < 70)  lma = "4";
  if (weight >= 70)                  lma = "5";
  const suction    = Math.round(ettUncuffed * 3);
  let blade = "0 straight";
  if (weight >= 3  && weight < 10) blade = "1 straight";
  if (weight >= 10 && weight < 20) blade = "2 straight or curved";
  if (weight >= 20)                 blade = "3 Macintosh (curved)";
  let ngt = "5 Fr";
  if (weight >= 3  && weight < 7)  ngt = "5–8 Fr";
  if (weight >= 7  && weight < 15) ngt = "8–10 Fr";
  if (weight >= 15 && weight < 30) ngt = "10–12 Fr";
  if (weight >= 30)                 ngt = "12–14 Fr";
  let iv = "24G";
  if (weight >= 10 && weight < 25) iv = "22G";
  if (weight >= 25 && weight < 50) iv = "20G";
  if (weight >= 50)                 iv = "18G";
  let io = "15mm pink";
  if (weight >= 40) io = "25mm blue";
  const chestDrain  = weight < 10 ? "10–14 Fr" : weight < 20 ? "16–20 Fr" : weight < 40 ? "20–28 Fr" : "28–32 Fr";
  const ucath       = weight < 5 ? "5 Fr" : weight < 10 ? "6 Fr" : weight < 20 ? "8 Fr" : weight < 40 ? "10 Fr" : "12 Fr";
  const defib       = Math.round(weight * 4);
  const defibMax    = Math.min(weight * 10, 360);
  const cardiovert  = Math.round(weight * 1);
  let maskSize = "Neonatal";
  if (weight >= 4  && weight < 10) maskSize = "Infant";
  if (weight >= 10 && weight < 25) maskSize = "Child";
  if (weight >= 25)                 maskSize = "Adult";
  const preferCuffed = weight >= 8 || age >= 2;
  return { ettUncuffed, ettCuffed, ettDepthOral, ettDepthNasal, lma, suction, blade, ngt, iv, io, chestDrain, ucath, defib, defibMax, cardiovert, maskSize, preferCuffed };
}

// ─── SHARED WIDGETS ────────────────────────────────────────────────────────────
function EquipCard({ label, value, sub, tone = "slate", Icon, highlighted }) {
  const t = TONE[tone];
  return (
    <div className={`rounded-xl border p-3 bg-white dark:bg-slate-900 transition-all ${highlighted ? `${t.border} ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-950 ${t.border.replace("border-","ring-")}` : "border-slate-200 dark:border-slate-700"}`}>
      {Icon && <Icon size={13} weight="fill" className={`${t.text} mb-1.5`} />}
      <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      <div className={`font-black text-lg leading-none mb-0.5 ${highlighted ? t.text : "text-slate-900 dark:text-white"}`}
           style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{value}</div>
      {sub && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sub}</div>}
    </div>
  );
}

function NumInput({ label, value, onChange, unit, min = 0, max = 999, step = 1 }) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{label}</label>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(1))))}
          className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-100 text-base">−</button>
        <input type="number" value={value} min={min} max={max} step={step}
          onChange={e => onChange(Math.max(min, Math.min(max, parseFloat(e.target.value) || min)))}
          className="w-20 text-center font-mono font-bold text-lg border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-400 py-1" />
        <button onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(1))))}
          className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-100 text-base">+</button>
        <span className="text-xs text-slate-400 font-mono ml-1">{unit}</span>
      </div>
    </div>
  );
}

function InfoBox({ tone = "amber", icon: Icon, title, children }) {
  const t = TONE[tone];
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${t.bg} ${t.border} ${t.text}`}>
      {Icon && <Icon size={13} weight="fill" className="flex-shrink-0 mt-0.5" />}
      <div><strong>{title}</strong>{title ? " — " : ""}{children}</div>
    </div>
  );
}

// ─── SVG: VORTEX APPROACH ─────────────────────────────────────────────────────
function VortexSVG() {
  return (
    <svg viewBox="0 0 360 340" className="w-full max-w-sm mx-auto" aria-label="Vortex Approach diagram">
      {/* Background */}
      <rect width="360" height="340" rx="12" fill="#0f172a" />
      {/* Outer ring */}
      <circle cx="180" cy="170" r="140" fill="none" stroke="#1e3a5f" strokeWidth="1.5" />
      {/* Three upper segments — mask / supra / tracheal */}
      {/* Mask ventilation arc */}
      <path d="M180,170 L180,30 A140,140 0 0,1 301.2,100 Z" fill="#1d4ed8" fillOpacity="0.25" stroke="#3b82f6" strokeWidth="1.5" />
      <text x="230" y="80" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="700" fontFamily="monospace">MASK</text>
      <text x="235" y="91" textAnchor="middle" fill="#93c5fd" fontSize="7" fontFamily="monospace">VENTILATION</text>
      {/* Supraglottic arc */}
      <path d="M180,170 L301.2,100 A140,140 0 0,1 301.2,240 Z" fill="#7c3aed" fillOpacity="0.25" stroke="#a855f7" strokeWidth="1.5" />
      <text x="308" y="172" textAnchor="middle" fill="#c4b5fd" fontSize="9" fontWeight="700" fontFamily="monospace">SGD</text>
      <text x="308" y="183" textAnchor="middle" fill="#c4b5fd" fontSize="7" fontFamily="monospace">LMA / iGel</text>
      {/* Tracheal intubation arc */}
      <path d="M180,170 L301.2,240 A140,140 0 0,1 180,310 Z" fill="#065f46" fillOpacity="0.35" stroke="#10b981" strokeWidth="1.5" />
      <text x="268" y="285" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontWeight="700" fontFamily="monospace">TRACHEAL</text>
      <text x="265" y="296" textAnchor="middle" fill="#6ee7b7" fontSize="7" fontFamily="monospace">Intubation</text>
      {/* Left lower — failure side */}
      <path d="M180,170 L180,310 A140,140 0 0,1 58.8,240 Z" fill="#7f1d1d" fillOpacity="0.35" stroke="#ef4444" strokeWidth="1.5" />
      <text x="105" y="285" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="700" fontFamily="monospace">EMERGENCY</text>
      <text x="107" y="296" textAnchor="middle" fill="#fca5a5" fontSize="7" fontFamily="monospace">FRONT OF NECK</text>
      {/* Left upper */}
      <path d="M180,170 L58.8,240 A140,140 0 0,1 58.8,100 Z" fill="#78350f" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="55" y="172" textAnchor="middle" fill="#fcd34d" fontSize="8" fontWeight="700" fontFamily="monospace">OPTIMISE</text>
      <text x="55" y="183" textAnchor="middle" fill="#fcd34d" fontSize="7" fontFamily="monospace">each lifeline</text>
      {/* Top left */}
      <path d="M180,170 L58.8,100 A140,140 0 0,1 180,30 Z" fill="#0c4a6e" fillOpacity="0.25" stroke="#0ea5e9" strokeWidth="1.5" />
      <text x="110" y="75" textAnchor="middle" fill="#7dd3fc" fontSize="8" fontWeight="700" fontFamily="monospace">REPEAT ×3</text>
      <text x="110" y="86" textAnchor="middle" fill="#7dd3fc" fontSize="7" fontFamily="monospace">best attempt</text>
      {/* Centre */}
      <circle cx="180" cy="170" r="52" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      <circle cx="180" cy="170" r="44" fill="#1e293b" />
      <text x="180" y="163" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="800" fontFamily="monospace">VORTEX</text>
      <text x="180" y="176" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="800" fontFamily="monospace">APPROACH</text>
      <text x="180" y="192" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">Chrimes 2016</text>
      {/* Arrows into centre (spiral) */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r1 = 100, r2 = 56;
        const rad = (deg - 90) * Math.PI / 180;
        const x1 = 180 + r1 * Math.cos(rad), y1 = 170 + r1 * Math.sin(rad);
        const x2 = 180 + r2 * Math.cos(rad), y2 = 170 + r2 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="0.8" strokeDasharray="3,2" />;
      })}
      {/* Green dot = OXYGENATION maintained */}
      <circle cx="180" cy="145" r="5" fill="#22c55e" />
      <text x="180" y="134" textAnchor="middle" fill="#86efac" fontSize="6" fontFamily="monospace">O₂ maintained</text>
    </svg>
  );
}

// ─── SVG: AIDAA CANNOT INTUBATE CANNOT OXYGENATE ─────────────────────────────
function CICOAlgorithmSVG() {
  const box = (x, y, w, h, fill, stroke, text, subtext, textColor = "#f8fafc") => (
    <g key={text}>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 - (subtext ? 6 : 0)} textAnchor="middle" fill={textColor} fontSize="9" fontWeight="700" fontFamily="monospace">{text}</text>
      {subtext && <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle" fill={textColor} fontSize="7" fontFamily="monospace" opacity="0.8">{subtext}</text>}
    </g>
  );
  const arrow = (x1, y1, x2, y2, label) => (
    <g key={`${x1}${y1}`}>
      <defs><marker id={`ah${x1}${y1}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#64748b" /></marker></defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth="1.2" markerEnd={`url(#ah${x1}${y1})`} />
      {label && <text x={(x1+x2)/2 + 4} y={(y1+y2)/2} fill="#94a3b8" fontSize="7" fontFamily="monospace">{label}</text>}
    </g>
  );
  return (
    <svg viewBox="0 0 340 460" className="w-full max-w-xs mx-auto" aria-label="CICO algorithm">
      <rect width="340" height="460" rx="12" fill="#0f172a" />
      {/* Title */}
      <text x="170" y="22" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="800" fontFamily="monospace">CANNOT INTUBATE · CANNOT OXYGENATE</text>
      <text x="170" y="34" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">AIDAA 2022 · Paediatric Difficult Airway</text>

      {box(30, 45, 280, 36, "#1e3a5f", "#3b82f6", "CALL FOR HELP · Continue O₂ · SpO₂ monitor", "Maximise oxygenation by all means")}
      {arrow(170, 81, 170, 104)}

      {box(30, 104, 280, 36, "#78350f", "#f59e0b", "MAXIMISE MASK VENTILATION", "2-person 2-hand technique · OPA/NPA · Reposition")}
      {arrow(170, 140, 170, 163)}

      {box(30, 163, 280, 36, "#4c1d95", "#a855f7", "SUPRAGLOTTIC DEVICE — 2nd GENERATION", "iGel / LMA Supreme · Size for weight · Max 2 attempts")}
      {arrow(170, 199, 170, 222)}

      {/* Decision diamond */}
      <polygon points="170,222 290,250 170,278 50,250" fill="#134e4a" stroke="#10b981" strokeWidth="1.5" />
      <text x="170" y="247" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="700" fontFamily="monospace">SpO₂ IMPROVING?</text>
      <text x="170" y="259" textAnchor="middle" fill="#6ee7b7" fontSize="7" fontFamily="monospace">Oxygenation restored?</text>
      {/* Yes branch */}
      {arrow(50, 250, 30, 295)}
      <text x="10" y="285" fill="#86efac" fontSize="7" fontFamily="monospace">YES</text>
      {box(5, 295, 130, 36, "#052e16", "#16a34a", "MAINTAIN O₂", "Plan definitive airway", "#86efac")}

      {/* No branch */}
      {arrow(290, 250, 310, 295)}
      <text x="295" y="285" fill="#fca5a5" fontSize="7" fontFamily="monospace">NO</text>
      {arrow(170, 278, 170, 300)}

      {box(30, 300, 280, 44, "#450a0a", "#dc2626", "EMERGENCY FRONT OF NECK ACCESS (eFONA)", "Scalpel–finger–tube technique (preferred)", "#fca5a5")}

      {/* Steps for eFONA */}
      <text x="20" y="365" fill="#fca5a5" fontSize="8" fontWeight="700" fontFamily="monospace">eFONA STEPS:</text>
      {[
        "1. Neck extension · Identify CTM (cricothyroid membrane)",
        "2. Horizontal stab incision through skin + CTM",
        "3. Finger/dilator to hold tract open",
        "4. Insert smallest ETT (5.0) or CTM-specific device",
        "5. Inflate cuff · Confirm ETCO₂ · CXR",
      ].map((s, i) => (
        <text key={i} x="20" y={378 + i * 14} fill="#fca5a5" fontSize="7" fontFamily="monospace">{s}</text>
      ))}

      <text x="170" y="455" textAnchor="middle" fill="#475569" fontSize="6" fontFamily="monospace">AIDAA 2022 · Paediatric modification: use 16G cannula + jet oxygenation if &lt; 8 yr</text>
    </svg>
  );
}

// ─── SVG: FIBREOPTIC BRONCHOSCOPE SIZING ─────────────────────────────────────
function FOBSizingSVG() {
  const rows = [
    { age: "Neonate",      wt: "<3 kg",    scope: "2.2 mm",  ett: "3.0",  note: "Ultra-thin scope" },
    { age: "Infant",       wt: "3–10 kg",  scope: "2.8 mm",  ett: "3.5",  note: "Intubating scope" },
    { age: "Toddler",      wt: "10–20 kg", scope: "3.5 mm",  ett: "4.5",  note: "Paeds FOB" },
    { age: "School age",   wt: "20–40 kg", scope: "4.0 mm",  ett: "5.5",  note: "Paeds/adult thin" },
    { age: "Adolescent",   wt: ">40 kg",   scope: "4.9 mm",  ett: "7.0",  note: "Standard adult" },
  ];
  return (
    <svg viewBox="0 0 360 210" className="w-full" aria-label="Fibreoptic bronchoscope sizing table">
      <rect width="360" height="210" rx="8" fill="#0f172a" />
      <text x="180" y="18" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="800" fontFamily="monospace">FIBREOPTIC BRONCHOSCOPE — PAEDIATRIC SIZING</text>
      {/* Header */}
      {["Age Band","Weight","Scope OD","Min ETT ID","Notes"].map((h, i) => (
        <text key={h} x={[16, 76, 140, 200, 258][i]} y="33" fill="#64748b" fontSize="7" fontWeight="700" fontFamily="monospace">{h}</text>
      ))}
      <line x1="12" y1="36" x2="348" y2="36" stroke="#1e293b" strokeWidth="1" />
      {rows.map((r, i) => {
        const y = 48 + i * 32;
        const bg = i % 2 === 0 ? "#111827" : "#0f172a";
        return (
          <g key={r.age}>
            <rect x="12" y={y - 11} width="336" height="26" rx="3" fill={bg} />
            <text x="16"  y={y + 5} fill="#e2e8f0" fontSize="8" fontFamily="monospace" fontWeight="600">{r.age}</text>
            <text x="76"  y={y + 5} fill="#94a3b8" fontSize="8" fontFamily="monospace">{r.wt}</text>
            <text x="140" y={y + 5} fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="800">{r.scope}</text>
            <text x="200" y={y + 5} fill="#60a5fa" fontSize="9" fontFamily="monospace" fontWeight="800">{r.ett} mm</text>
            <text x="258" y={y + 5} fill="#94a3b8" fontSize="7" fontFamily="monospace">{r.note}</text>
          </g>
        );
      })}
      <text x="12" y="205" fill="#475569" fontSize="6" fontFamily="monospace">ETT must be loaded BEFORE scope insertion. Use ETT ID ≥ scope OD + 0.8 mm. Lubricate scope. Antifog lens. Scope must reach carina.</text>
    </svg>
  );
}

// ─── SVG: BVM COMPONENTS ──────────────────────────────────────────────────────
function BVMDiagramSVG() {
  return (
    <svg viewBox="0 0 380 200" className="w-full" aria-label="Bag-valve-mask components">
      <rect width="380" height="200" rx="8" fill="#0f172a" />
      <text x="190" y="18" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="800" fontFamily="monospace">BAG-VALVE-MASK — PAEDIATRIC COMPONENTS</text>

      {/* Mask */}
      <ellipse cx="52" cy="110" rx="38" ry="26" fill="#1d4ed8" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="1.5" />
      <text x="52" y="106" textAnchor="middle" fill="#93c5fd" fontSize="7" fontWeight="700" fontFamily="monospace">MASK</text>
      <text x="52" y="117" textAnchor="middle" fill="#93c5fd" fontSize="6" fontFamily="monospace">Anatomical seal</text>
      <text x="52" y="128" textAnchor="middle" fill="#93c5fd" fontSize="6" fontFamily="monospace">Transparent</text>

      {/* Valve */}
      <rect x="98" y="96" width="44" height="28" rx="5" fill="#0f172a" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="120" y="112" textAnchor="middle" fill="#93c5fd" fontSize="7" fontWeight="700" fontFamily="monospace">VALVE</text>
      <text x="120" y="122" textAnchor="middle" fill="#93c5fd" fontSize="6" fontFamily="monospace">1-way</text>

      {/* Bag */}
      <ellipse cx="210" cy="110" rx="68" ry="32" fill="#065f46" fillOpacity="0.4" stroke="#10b981" strokeWidth="1.5" />
      <text x="210" y="105" textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">SELF-INFLATING BAG</text>
      <text x="210" y="116" textAnchor="middle" fill="#6ee7b7" fontSize="6" fontFamily="monospace">Neonatal 250 mL</text>
      <text x="210" y="126" textAnchor="middle" fill="#6ee7b7" fontSize="6" fontFamily="monospace">Paediatric 500 mL</text>

      {/* Reservoir */}
      <rect x="290" y="93" width="72" height="34" rx="5" fill="#7c3aed" fillOpacity="0.3" stroke="#a855f7" strokeWidth="1.5" />
      <text x="326" y="108" textAnchor="middle" fill="#c4b5fd" fontSize="7" fontWeight="700" fontFamily="monospace">RESERVOIR</text>
      <text x="326" y="119" textAnchor="middle" fill="#c4b5fd" fontSize="6" fontFamily="monospace">O₂ 10–15 L/min</text>
      <text x="326" y="130" textAnchor="middle" fill="#c4b5fd" fontSize="6" fontFamily="monospace">FiO₂ ≥ 0.85</text>

      {/* Connecting arrows */}
      <line x1="90" y1="110" x2="98" y2="110" stroke="#475569" strokeWidth="1.5" />
      <line x1="142" y1="110" x2="142" y2="110" stroke="#475569" strokeWidth="1.5" />
      <line x1="142" y1="110" x2="142" y2="110" stroke="#475569" strokeWidth="1.5" />
      <line x1="278" y1="110" x2="290" y2="110" stroke="#475569" strokeWidth="1.5" />

      {/* Sizes table */}
      <text x="12" y="165" fill="#64748b" fontSize="7" fontWeight="700" fontFamily="monospace">MASK SIZES: Neonatal (0) · Infant (1) · Child (2–3) · Adult (4–5)</text>
      <text x="12" y="178" fill="#64748b" fontSize="7" fontFamily="monospace">E-C grip for seal. 2-person 2-hand preferred (better seal, less fatigue). Jaw thrust for airway opening.</text>
      <text x="12" y="191" fill="#64748b" fontSize="7" fontFamily="monospace">Tidal volume target: 6–8 mL/kg. Rate: 20–30/min (infant) · 12–20/min (child). Watch for chest rise ONLY.</text>
    </svg>
  );
}

// ─── SVG: PULSE OXIMETRY PROBE PLACEMENT ─────────────────────────────────────
function SpO2ProbeSVG() {
  return (
    <svg viewBox="0 0 380 140" className="w-full" aria-label="Pulse oximetry probe placement sites">
      <rect width="380" height="140" rx="8" fill="#0f172a" />
      <text x="190" y="18" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="800" fontFamily="monospace">PULSE OXIMETRY — PAEDIATRIC PROBE SITES</text>
      {[
        { x: 30,  site: "Finger",       pre: "Post-ductal",  color: "#3b82f6", note: "Preferred >3 yr" },
        { x: 105, site: "Toe",          pre: "Post-ductal",  color: "#8b5cf6", note: "Neonates / infants" },
        { x: 185, site: "Right hand",   pre: "Pre-ductal",   color: "#10b981", note: "PPHN monitor" },
        { x: 270, site: "Ear lobe",     pre: "Central",      color: "#f59e0b", note: ">3 yr; faster response" },
        { x: 330, site: "Forehead",     pre: "Central",      color: "#ef4444", note: "Reflectance probe" },
      ].map(s => (
        <g key={s.site}>
          <circle cx={s.x + 28} cy="65" r="22" fill={s.color} fillOpacity="0.15" stroke={s.color} strokeWidth="1.5" />
          <text x={s.x + 28} y="61" textAnchor="middle" fill={s.color} fontSize="7" fontWeight="700" fontFamily="monospace">{s.site}</text>
          <text x={s.x + 28} y="72" textAnchor="middle" fill={s.color} fontSize="6" fontFamily="monospace">{s.pre}</text>
          <text x={s.x + 28} y="100" textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="monospace" width="70">{s.note}</text>
        </g>
      ))}
      <text x="12" y="120" fill="#475569" fontSize="6" fontFamily="monospace">Pre-ductal (right hand) vs post-ductal difference &gt;3–4% SpO₂ = significant R→L shunting (PPHN). Motion artefact: pause, reposition, check waveform pleth.</text>
      <text x="12" y="132" fill="#475569" fontSize="6" fontFamily="monospace">Accuracy: validated to SpO₂ ≥70%. Inaccurate in nail polish, methHb, COHb, poor perfusion, shivering, pigmented skin (may read high).</text>
    </svg>
  );
}

// ─── SUB-TAB 1: EQUIPMENT CALCULATOR ─────────────────────────────────────────
function LiveEquipmentCalculator() {
  const { weight: ctxWeight } = useWeight();
  const [weight, setWeight]   = useState(ctxWeight || 10);
  const [ageYears, setAgeYears] = useState(2);
  const [useAge, setUseAge]   = useState(true);
  const [cuffed, setCuffed]   = useState(true);
  const [checkedItems, setCheckedItems] = useState({});

  const eq = useMemo(() => calcEquipment(weight, useAge ? ageYears : null), [weight, ageYears, useAge]);
  const ettSize = cuffed ? eq.ettCuffed : eq.ettUncuffed;

  const checklistItems = [
    { id: "suction",  label: "Suction working + Yankauer attached" },
    { id: "bvm",      label: `BVM + correct mask (${eq.maskSize})` },
    { id: "o2",       label: "O₂ flow confirmed + reservoir bag" },
    { id: "ett",      label: `ETT ${ettSize} mm ${cuffed ? "(cuffed)" : "(uncuffed)"} ready + one size above/below` },
    { id: "syringe",  label: "10 mL syringe for cuff inflation" },
    { id: "stylet",   label: "Stylet shaped + lubricated inside ETT" },
    { id: "laryngo",  label: `Laryngoscope ${eq.blade} — light working` },
    { id: "capno",    label: "Colorimetric ETCO₂ or capnography attached" },
    { id: "tape",     label: `ETT tape/holder prepared for ${eq.ettDepthOral} cm at lip` },
    { id: "iv",       label: `IV/IO access confirmed (${eq.iv} or IO)` },
    { id: "drugs",    label: "RSI drugs drawn up and labelled (see Resuscitation tab)" },
    { id: "desat",    label: "Monitoring: SpO₂, ECG, ETCO₂ in place" },
    { id: "backup",   label: `Difficult airway backup: LMA ${eq.lma}, scalpel kit` },
  ];

  const toggleCheck = (id) => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  const allChecked  = checklistItems.every(item => checkedItems[item.id]);
  const checkedCount = checklistItems.filter(item => checkedItems[item.id]).length;

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-4">Patient Parameters</div>
        <div className="flex flex-wrap gap-6 items-end">
          <NumInput label="Weight"  value={weight}   onChange={setWeight}   unit="kg" min={0.5} max={120} step={0.5} />
          <NumInput label="Age"     value={ageYears} onChange={setAgeYears} unit="yr" min={0}   max={18}  step={0.5} />
          <div className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Size by</div>
            <div className="flex gap-2">
              {[{v:false,l:"Weight"},{v:true,l:"Age"}].map(opt => (
                <button key={opt.l} onClick={() => setUseAge(opt.v)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${useAge === opt.v ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"}`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">ETT Type</div>
            <div className="flex gap-2">
              {[{v:false,l:"Uncuffed"},{v:true,l:"Cuffed"}].map(opt => (
                <button key={opt.l} onClick={() => setCuffed(opt.v)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${cuffed === opt.v ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"}`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        </div>
        {eq.preferCuffed && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle size={12} weight="fill" className="text-emerald-500" />
            Cuffed ETT preferred (≥2 yr or ≥8 kg) — reduces reintubation, allows PEEP, safer in IR/transport
          </div>
        )}
      </div>

      {/* Hero ETT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">ETT Size — {cuffed ? "Cuffed" : "Uncuffed"}</div>
          <div className="font-black text-5xl text-emerald-700 dark:text-emerald-300 leading-none mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
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
            <div className="font-black text-3xl text-blue-600 dark:text-blue-400" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              {eq.ettDepthOral}<span className="text-sm font-normal ml-1">cm</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">at lips</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">Depth — Nasal</div>
            <div className="font-black text-3xl text-violet-600 dark:text-violet-400" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              {eq.ettDepthNasal}<span className="text-sm font-normal ml-1">cm</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">at nares</div>
          </div>
        </div>
      </div>

      {/* Equipment grid */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3">All Equipment — {weight} kg</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <EquipCard label="LMA Size"         value={eq.lma}             sub="Laryngeal mask airway"   tone="blue"   Icon={Wind}      highlighted />
          <EquipCard label="Suction Catheter" value={`${eq.suction} Fr`} sub="≈ 3 × ETT size"          tone="slate"  Icon={ArrowsOut}            />
          <EquipCard label="Laryngoscope"     value={eq.blade}           sub="Blade size/type"          tone="amber"  Icon={Stethoscope}          />
          <EquipCard label="BVM Mask"         value={eq.maskSize}        sub="Bag-valve-mask size"      tone="sky"    Icon={Wind}                 />
          <EquipCard label="NGT / OGT"        value={eq.ngt}             sub="Nasogastric tube"         tone="slate"                              />
          <EquipCard label="IV Cannula"       value={eq.iv}              sub="Peripheral IV"            tone="blue"   Icon={Drop}      highlighted />
          <EquipCard label="IO Access"        value={eq.io}              sub="Intraosseous needle"      tone="red"    Icon={Syringe}              />
          <EquipCard label="Urinary Catheter" value={eq.ucath}           sub="Foley catheter"           tone="slate"                              />
          <EquipCard label="Chest Drain"      value={eq.chestDrain}      sub="Intercostal drain"        tone="violet" Icon={Wind}                 />
          <EquipCard label="Defibrillation"   value={`${eq.defib} J`}    sub={`4 J/kg · max ${eq.defibMax} J`} tone="red" Icon={Heartbeat} highlighted />
          <EquipCard label="Cardioversion"    value={`${eq.cardiovert} J`} sub="0.5–1 J/kg sync"       tone="amber"  Icon={Pulse}                />
          <EquipCard label="Maintenance"      value={`${weight < 10 ? weight * 100 : weight < 20 ? 1000 + (weight - 10) * 50 : 1500 + (weight - 20) * 20} mL/24hr`} sub="Holliday-Segar" tone="slate" Icon={Drop} />
        </div>
      </div>

      {/* Pre-intubation checklist */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className={`flex items-center justify-between px-4 py-3 ${allChecked ? "bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800" : "bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"}`}>
          <div className="flex items-center gap-2">
            <ClipboardText size={14} weight="fill" className={allChecked ? "text-emerald-500" : "text-slate-400"} />
            <span className="font-bold text-sm text-slate-900 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Pre-intubation Checklist</span>
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
              className={`flex items-start gap-2.5 text-left rounded-lg px-3 py-2 transition-all text-xs ${checkedItems[item.id] ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200" : "bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-200"}`}>
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

// ─── SUB-TAB 2: DIFFICULT AIRWAY ──────────────────────────────────────────────
function DifficultAirwayView() {
  const { weight } = useWeight();
  const [section, setSection] = useState("predict");

  const lmaSize = weight < 5 ? "1" : weight < 10 ? "1.5" : weight < 20 ? "2" : weight < 30 ? "2.5" : weight < 50 ? "3" : "4";
  const fobScope = weight < 3 ? "2.2 mm" : weight < 10 ? "2.8 mm" : weight < 20 ? "3.5 mm" : weight < 40 ? "4.0 mm" : "4.9 mm";
  const ettForFOB = weight < 3 ? "3.0" : weight < 10 ? "3.5" : weight < 20 ? "4.5" : weight < 40 ? "5.5" : "7.0";

  const sectionBtns = [
    { id: "predict",  label: "Prediction" },
    { id: "vortex",   label: "Vortex Approach" },
    { id: "aidaa",    label: "AIDAA / CICO" },
    { id: "fob",      label: "Fibreoptic" },
    { id: "devices",  label: "Rescue Devices" },
  ];

  return (
    <div className="space-y-4">
      <InfoBox tone="red" icon={Warning}>
        Difficult airway in children is life-threatening. Senior clinician and anaesthesia backup MUST be called early. Never allow SpO₂ to fall below 90% before escalating.
      </InfoBox>

      {/* Section nav */}
      <div className="flex flex-wrap gap-1.5">
        {sectionBtns.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${section === s.id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`}>
            {s.label}
          </button>
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
              {[
                { label: "Anatomy / Structural", items: ["Micrognathia (Pierre Robin, Treacher Collins, Goldenhar)", "Macroglossia (Trisomy 21, Beckwith-Wiedemann)", "Cleft palate — difficult mask seal", "Narrow mouth opening — trismus, ankylosis", "Short neck / limited extension — cervical spine anomaly", "Laryngomalacia, subglottic stenosis, tracheomalacia"] },
                { label: "Acquired / Functional", items: ["Oedema — anaphylaxis, angioedema, burns, trauma", "Infection — epiglottitis, bacterial tracheitis, croup", "Foreign body — partial or complete obstruction", "Haematoma, abscess (peritonsillar, retropharyngeal)", "Obesity — reduced FRC, rapid desaturation", "Mediastinal mass — dynamic airway compression"] },
              ].map(g => (
                <div key={g.label} className="space-y-1.5">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">{g.label}</div>
                  {g.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <ArrowRight size={10} weight="bold" className="text-amber-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
            <div className="font-bold text-sm mb-2 text-amber-700 dark:text-amber-300" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Paediatric LEMON / MOANS / RODS</div>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              {[
                { mnemonic: "LEMON (difficult laryngoscopy)", items: ["L — Look externally (dysmorphic)", "E — Evaluate 3-3-2 (3 finger mouth, 3 hyoid, 2 thyroid-floor)", "M — Mallampati (unreliable <2 yr)", "O — Obstruction", "N — Neck mobility"] },
                { mnemonic: "MOANS (difficult BVM)", items: ["M — Mask seal (beard, facial injury)", "O — Obesity/Obstruction", "A — Age (>55 or <1 yr)", "N — No teeth (edentulous)", "S — Stiff lungs (asthma, fibrosis)"] },
                { mnemonic: "RODS (difficult rigid scope)", items: ["R — Restricted mouth opening", "O — Obstruction above glottis", "D — Disrupted or Distorted airway", "S — Stiff cervical spine"] },
              ].map(g => (
                <div key={g.mnemonic} className="space-y-1">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">{g.mnemonic}</div>
                  {g.items.map((item, i) => <div key={i} className="text-amber-800 dark:text-amber-200 text-[11px]">{item}</div>)}
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
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>The Vortex Approach (Chrimes 2016)</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-3">A cognitive aid for managing the cannot-oxygenate airway. Three lifelines (mask, SGD, tracheal) — each optimised once, then escalate. Green zone = oxygenation maintained.</p>
            <VortexSVG />
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {[
                { color: "blue",    lifeline: "Mask Ventilation", steps: ["2-person EC grip", "OPA size (age/4 + 4) cm or NPA", "Jaw thrust — NOT head tilt if cervical concern", "Jaw thrust Esmarch manoeuvre if still poor"] },
                { color: "violet",  lifeline: "Supraglottic Device (SGD)", steps: [`LMA size ${lmaSize} for ${weight} kg`, "2nd gen preferred (iGel, LMA Supreme)", "Deflate cuff fully before insert", "Max 2 insertion attempts per operator"] },
                { color: "emerald", lifeline: "Tracheal Intubation", steps: ["Optimise position (BURP, bougie)", "Video laryngoscopy preferred in DA", "Max 3 laryngoscopy attempts total", "Confirm with waveform ETCO₂"] },
              ].map(l => (
                <div key={l.lifeline} className={`rounded-lg border p-3 ${TONE[l.color].border} ${TONE[l.color].bg}`}>
                  <div className={`font-bold text-xs mb-2 ${TONE[l.color].text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{l.lifeline}</div>
                  {l.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-200 mb-1">
                      <span className={`font-bold ${TONE[l.color].text} flex-shrink-0`}>{i + 1}.</span> {s}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className={`mt-3 rounded-lg border p-3 ${TONE.red.border} ${TONE.red.bg}`}>
              <div className={`font-bold text-xs mb-1.5 ${TONE.red.text}`}>When Green Zone Is NOT Achievable → eFONA</div>
              <p className="text-xs text-red-800 dark:text-red-200">If all three lifelines fail and SpO₂ cannot be maintained → Emergency Front of Neck Access (eFONA). Call this EARLY — do not wait until cardiac arrest.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── AIDAA / CICO ── */}
      {section === "aidaa" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>AIDAA Difficult Airway Algorithm 2022</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Adapted for paediatric practice. Key principle: oxygenation is the priority, not intubation.</p>
            <CICOAlgorithmSVG />
            <div className="mt-4 space-y-3">
              <InfoBox tone="red" icon={Warning} title="Paediatric eFONA Notes">
                Children &lt;8 yr: CTM is small, difficult to identify, and surgical access is higher risk. Cannula cricothyrotomy (16G IV cannula + jet ventilation) is an acceptable temporising bridge in infants when surgical eFONA is not possible. However, barotrauma and CO₂ retention are significant risks — limit to 3–5 min.
              </InfoBox>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
                <div className="font-bold text-xs mb-2" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>CTM Identification — Paediatric</div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { label: "Neonates / Infants", text: "CTM is 1–2 mm height. Use ultrasound (linear probe) to identify. Cannula cricothyrotomy only — not surgical." },
                    { label: "Children &lt;8 yr",  text: "CTM still small. FONA very high risk. Prioritise re-intubation, SGD, or call surgeons for emergency tracheostomy." },
                    { label: "Children ≥8 yr",     text: "CTM becomes larger. Surgical FONA feasible. Identify: thyroid notch → thyroid cartilage → soft spot above cricoid = CTM." },
                    { label: "Ultrasound guidance", text: "Linear probe transverse + sagittal scan. Tracheal rings: hypoechoic rings + air reverberation. CTM: no ring, hyperechoic." },
                  ].map(n => (
                    <div key={n.label} className="bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-[10px] text-slate-700 dark:text-slate-200 mb-1">{n.label}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">{n.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FIBREOPTIC ── */}
      {section === "fob" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Fibreoptic Bronchoscope (FOB) — Paediatric</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Gold standard for anticipated difficult airway. Requires expertise. ETT must be loaded onto scope BEFORE insertion.</p>
            <FOBSizingSVG />
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">For {weight} kg patient</div>
                <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-3 text-xs text-sky-800 dark:text-sky-200 space-y-1">
                  <div className="font-bold">Scope OD: {fobScope}</div>
                  <div>Min ETT ID: {ettForFOB} mm (load before inserting)</div>
                  <div>ETT must be ≥ scope OD + 0.8 mm</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1">Technique</div>
                  {[
                    "Pre-oxygenate · anti-sialagogue (glycopyrrolate 0.01 mg/kg)",
                    "Load ETT on scope, lubricate generously",
                    "Topical anaesthesia: lignocaine 4% spray (max 4 mg/kg) to airway",
                    "Insert nasally (preferred in children) or orally via Berman/Ovassapian airway",
                    "Identify cords → advance into trachea → confirm with carina view",
                    "Railroads ETT off scope. Remove scope while holding ETT fixed",
                    "Confirm with ETCO₂ waveform and bilateral breath sounds",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-sky-500 flex-shrink-0">{i + 1}.</span> {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">Awake FOB — Older Children</div>
                  {[
                    "Preferred in children ≥8–10 yr who can cooperate",
                    "Dexmedetomidine 1–2 mcg/kg IN as pre-med (30 min before)",
                    "Topical lignocaine 4% spray: nasal, pharynx, subglottic",
                    "Maintain spontaneous ventilation throughout",
                    "Do NOT give muscle relaxant until airway confirmed",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5"><ArrowRight size={9} weight="bold" className="text-amber-500 flex-shrink-0 mt-0.5" />{s}</div>
                  ))}
                </div>
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-200 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">LMA-guided FOB</div>
                  {[
                    "Insert LMA first for oxygenation",
                    "Pass FOB through LMA to identify glottis",
                    "Railroad ETT over FOB through LMA",
                    "Remove LMA while holding ETT — use LMA-exchange catheter technique",
                    "Useful when direct laryngoscopy fails but ventilation via LMA is possible",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5"><ArrowRight size={9} weight="bold" className="text-emerald-500 flex-shrink-0 mt-0.5" />{s}</div>
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
          {[
            {
              name: "Video Laryngoscopy (VL)", tone: "blue", highlight: true,
              sub: "First-line for anticipated difficult airway in children ≥10 kg",
              details: [
                `LMA size ${lmaSize} / ETT ${weight < 10 ? "3.5" : weight < 20 ? "4.5" : "5.5"} mm for ${weight} kg`,
                "C-MAC / GlideScope / CMAC-D Blade — improves Cormack-Lehane grade by 1–2",
                "Indirect view: do NOT align oral-pharyngeal-laryngeal axes — angle blade, look at screen",
                "Use a stylet angled 60–90° for GlideScope (more angulated blade)",
                "3 attempts maximum — each should be BEST attempt with optimisation",
              ],
            },
            {
              name: "2nd Generation LMA (iGel / LMA Supreme)", tone: "violet",
              sub: "Best SGD for paediatric difficult airway management",
              details: [
                `iGel size: wt ${weight < 5 ? "1 (2–5 kg)" : weight < 12 ? "1.5 (5–12 kg)" : weight < 25 ? "2 (10–25 kg)" : weight < 35 ? "2.5 (25–35 kg)" : "3 (30–60 kg)"}`,
                "iGel advantages: no cuff, fast insertion, gastric drain port, high seal pressure",
                "Can ventilate + protects against aspiration + allows FOB-guided intubation through it",
                "Insertion: lubricate caudal aspect, insert along hard palate in neutral position, do not rotate",
                "ETCO₂ via iGel is acceptable confirmation in confirmed difficult airway scenarios",
              ],
            },
            {
              name: "Bougie / Airway Exchange Catheter", tone: "amber",
              sub: "Improves ETT placement when view is limited",
              details: [
                "Paediatric bougie: 5 Fr Eschmann or Frova catheter for children <10 yr",
                "Advance into trachea under direct/video view → feel tracheal rings → railroad ETT",
                "Airway exchange catheter (AEC): used to change ETTs safely over established airway",
                "AEC size: 11 Fr for ETT ≥5 mm · 8 Fr for ETT 3.5–5 mm",
                "Give O₂ via AEC during exchange: 1 L/min insufflation (risk of barotrauma if cuffed)",
              ],
            },
            {
              name: "Transtracheal Jet Ventilation (TTJV)", tone: "red",
              sub: "Temporising rescue oxygenation — NOT definitive airway",
              details: [
                "16–18G IV cannula through CTM (in children >10 kg)",
                "Attach to high-pressure O₂ source (15 L/min) via Sanders injector or manual jet device",
                "Ventilation: 1 s on / 4 s off (allow passive exhalation — CO₂ rises rapidly)",
                "Risk of barotrauma especially with upper airway obstruction — expiration must be clear",
                "Limit to 3–5 min as a bridge to definitive airway",
                "AVOID in complete upper airway obstruction (cannot exhale)",
              ],
            },
            {
              name: "Surgical Airway — Emergency Tracheostomy", tone: "red",
              sub: "Definitive eFONA if CTM not accessible or <8 yr",
              details: [
                "Preferred over surgical cricothyrotomy in children <8 yr (small CTM)",
                "Call ENT/head-neck surgeon early — do NOT attempt alone without training",
                "Trousseau dilator + ETT (smallest available — 3.0 or 3.5 mm) via trachea below cricoid",
                "Percutaneous tracheostomy kits (Portex Seldinger): avoid in <12 yr — high complication rate",
                "Confirm placement: ETCO₂ waveform + bilateral breath sounds + CXR",
              ],
            },
          ].map(d => (
            <div key={d.name} className={`rounded-xl border p-4 bg-white dark:bg-slate-900/50 ${TONE[d.tone].border}`}>
              <div className={`font-bold text-sm mb-0.5 ${TONE[d.tone].text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{d.name}</div>
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
function MonitoringEquipmentView() {
  const { weight } = useWeight();
  const [section, setSection] = useState("spo2");

  // BP cuff size by weight
  const bpCuff = weight < 5 ? "Neonatal (2.5 cm)" : weight < 10 ? "Infant (4 cm)" : weight < 20 ? "Child (6 cm)" : weight < 30 ? "Small adult (8 cm)" : "Adult (10–12 cm)";
  const bpCuffRule = "Width = 40% of arm circumference · Length = 80–100% of arm circumference";

  const sectionBtns = [
    { id: "spo2",   label: "Pulse Oximetry" },
    { id: "bp",     label: "BP Measurement" },
    { id: "bvm",    label: "BVM Details" },
    { id: "etco2",  label: "ETCO₂" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {sectionBtns.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${section === s.id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── SPO2 ── */}
      {section === "spo2" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Pulse Oximetry — Paediatric Principles</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Standard of care for all sedated, monitored, or critically ill children. Measures functional O₂ saturation via Beer-Lambert law — 2 wavelengths (660 nm red / 940 nm infrared).
            </p>
            <SpO2ProbeSVG />
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2">Probe Selection by Age</div>
                <div className="space-y-2">
                  {[
                    { age: "Neonate / Premature", site: "Wrap probe (foot/hand). Gelstix or Neonatal D-lite.", warn: "Use foot for post-ductal, right hand for pre-ductal (PPHN)." },
                    { age: "Infant (1–12 mo)",    site: "Foot/toe. Palm wrap probe. Masimo RD rainbow preferred.", warn: "Motion artefact common — pause sucks if NICU." },
                    { age: "Toddler–School",      site: "Finger clip or tape wrap probe. Index or middle finger.", warn: "Nail polish: remove. Cold periphery: false low reading." },
                    { age: "Adolescent",          site: "Standard adult finger clip probe. Earlobe acceptable.", warn: "Carboxyhaemoglobin (COHb) reads as normal SpO₂ — use co-oximeter if CO exposure." },
                  ].map(r => (
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
                  {[
                    "Accuracy validated to SpO₂ ≥70% only",
                    "Motion artefact: Masimo SET algorithm better than Nellcor",
                    "Carboxyhaemoglobin (COHb): reads as OxyHb — SpO₂ falsely NORMAL in CO poisoning",
                    "MetHaemoglobinaemia: SpO₂ reads ~85% regardless of true value",
                    "Nail polish (blue, black, green): use alternate site or remove polish",
                    "Pigmented skin: may overestimate SpO₂ by 2–3% (Masimo Root better)",
                    "Severe anaemia (Hb <5): inaccurate",
                    "Poor peripheral perfusion: use central site (ear, forehead)",
                    "Ambient light artefact: cover probe in phototherapy",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-800 dark:text-red-200">
                      <ArrowRight size={9} weight="bold" className="text-red-500 flex-shrink-0 mt-0.5" />{s}
                    </div>
                  ))}
                </div>
                <div className={`rounded-lg border p-3 ${TONE.emerald.border} ${TONE.emerald.bg}`}>
                  <div className={`font-bold text-xs mb-1.5 ${TONE.emerald.text}`}>SpO₂ Targets by Age</div>
                  {[
                    "Term neonate: 94–98% (air). Avoid hyperoxia.",
                    "Preterm <32 wks: 90–95% — higher → retinopathy of prematurity (ROP)",
                    "PPHN neonate: pre-ductal (right hand) ≥95%, aim for pH 7.45–7.55",
                    "Children on room air: ≥94%",
                    "Post-cardiac arrest (ROSC): 94–99% — titrate FiO₂ to avoid hyperoxia",
                    "ARDS / PICU: 92–96% acceptable to allow lower FiO₂",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-200">
                      <ArrowRight size={9} weight="bold" className="text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BP ── */}
      {section === "bp" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Blood Pressure Measurement — Paediatric</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">BP measurement in children requires age-appropriate cuff sizing. Wrong cuff = wrong BP. Oscillometric (NIBP) is standard; Doppler and invasive are preferred in specific settings.</p>

            {/* Cuff size for this patient */}
            <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 mb-4">
              <div className="text-[9px] font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Recommended cuff for {weight} kg</div>
              <div className="font-black text-2xl text-blue-700 dark:text-blue-300" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{bpCuff}</div>
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
                      {[
                        { aw: "Premature neonate",  cuff: "Premie",       width: "2 cm"  },
                        { aw: "Neonate (<3 kg)",    cuff: "Neonatal",     width: "2.5 cm"},
                        { aw: "Infant (3–10 kg)",   cuff: "Infant",       width: "4 cm"  },
                        { aw: "Child (10–20 kg)",   cuff: "Child",        width: "6 cm"  },
                        { aw: "School (20–30 kg)",  cuff: "Small adult",  width: "8 cm"  },
                        { aw: "Adolescent (>30 kg)",cuff: "Adult",        width: "12 cm" },
                      ].map((r, i) => (
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
                  {[
                    { method: "Oscillometric NIBP", use: "Standard monitoring. Measures MAP directly, derives systolic/diastolic. Reliable >3 kg." },
                    { method: "Auscultatory (Korotkoff)", use: "Gold standard for diagnosis. Korotkoff I = systolic, Korotkoff V = diastolic (IV in children <13 yr). Use stethoscope over brachial artery." },
                    { method: "Doppler ultrasound", use: "Best for neonates and poor perfusion. Place probe over radial/brachial artery. Only gives systolic BP." },
                    { method: "Flush method", use: "Neonates only (if no Doppler). Limb elevated, cuff inflated, limb exsanguinated, cuff released — note pressure when flush returns = MAP." },
                    { method: "Invasive arterial (A-line)", use: "ICU/theatre. Radial preferred (20G infant, 22G neonate). Femoral if radial unavailable. Continuous waveform + MAP." },
                  ].map(m => (
                    <div key={m.method} className="mb-2">
                      <div className="font-bold text-[10px] text-slate-700 dark:text-slate-200">{m.method}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{m.use}</div>
                    </div>
                  ))}
                </div>
                <InfoBox tone="amber" icon={Warning} title="Cuff errors">
                  Too small cuff → falsely HIGH BP. Too large → falsely LOW. In shocked child: NIBP unreliable — use arterial line or Doppler.
                </InfoBox>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BVM ── */}
      {section === "bvm" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Bag-Valve-Mask — Paediatric Details</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">The most important rescue ventilation device. Correct size, technique, and adjuncts are critical — seal failure is the #1 reason for BVM failure.</p>
            <BVMDiagramSVG />
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs">
                  <div className="font-bold text-slate-800 dark:text-white mb-2">Bag Sizes — Paediatric</div>
                  {[
                    { size: "Neonatal bag",    vol: "250 mL",  use: "Premature and term neonates. Min PEEP valve." },
                    { size: "Infant bag",      vol: "450 mL",  use: "Infants up to ~10 kg. Neonatal bag insufficient volume for active lungs." },
                    { size: "Paediatric bag",  vol: "500–750 mL", use: "10–25 kg. Standard paediatric practice." },
                    { size: "Adult bag",       vol: "1500 mL", use: "Adolescents >25 kg. Adult mask." },
                  ].map(b => (
                    <div key={b.size} className="mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{b.size}</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400">{b.vol}</span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[10px]">{b.use}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-3 text-xs text-sky-800 dark:text-sky-200 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">Ventilation Targets</div>
                  <div>Tidal volume: <strong>6–8 mL/kg</strong> = {Math.round(weight * 6)}–{Math.round(weight * 8)} mL for {weight} kg</div>
                  <div>Rate: infants 20–40/min · children 15–25/min · adolescents 12–20/min</div>
                  <div>Observe: chest rise only — avoid visible overinflation</div>
                  <div>Peak pressure: neonates limit to 20–25 cmH₂O (PEEP valve on bag)</div>
                  <div>FiO₂ without reservoir: ~0.4. With reservoir at 10–15 L/min: ~0.85–0.95</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-200 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Mask Technique</div>
                  {[
                    "EC technique: thumb+index form C over mask, 3rd-5th fingers form E on mandible",
                    "2-person technique preferred: one holds mask (2-hand), one squeezes bag",
                    "Jaw thrust: 3rd/4th fingers behind mandibular angles, push forward (not occiput)",
                    "OPA size = corner of mouth → centre of ear pinna (age/4 + 4 cm)",
                    "NPA: use if OPA not tolerated. Contraindicated in base of skull fracture",
                    "Infant positioning: neutral — do NOT hyperextend (floppy trachea may kink)",
                    "Sniffing position only in children >2 yr",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5"><CheckCircle size={9} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />{s}</div>
                  ))}
                </div>
                <div className={`rounded-lg border p-3 ${TONE.red.border} ${TONE.red.bg}`}>
                  <div className={`font-bold text-xs mb-1.5 ${TONE.red.text}`}>Common BVM Failures</div>
                  {[
                    "Poor seal — 2-hand 2-person technique if 1-person failing",
                    "Upper airway obstruction — add OPA/NPA, reposition",
                    "Gastric distension → aspiration risk → insert NGT / decompress",
                    "Pressure pop-off valve: neonatal bags have 40 cmH₂O pop-off — bypass if stiff lungs",
                    "Bag too large: adult bag in infant → impossible to control tidal volume",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-800 dark:text-red-200"><ArrowRight size={9} weight="bold" className="text-red-500 flex-shrink-0 mt-0.5" />{s}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ETCO2 ── */}
      {section === "etco2" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Capnography / ETCO₂ — Paediatric</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              ETCO₂ monitoring is mandatory for all intubated patients and strongly recommended during procedural sedation. The most reliable ETT confirmation — colorimetric is a backup only.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs">
                  <div className="font-bold text-slate-800 dark:text-white mb-2">Normal Capnography Waveform</div>
                  {/* Mini SVG waveform */}
                  <svg viewBox="0 0 200 60" className="w-full h-14 bg-slate-950 rounded mb-2">
                    <path d="M5,50 L35,50 L38,10 L55,10 L58,50 L100,50 L103,10 L120,10 L123,50 L165,50 L168,10 L185,10 L188,50 L200,50"
                      fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinejoin="round" />
                    <text x="10" y="57" fill="#64748b" fontSize="6" fontFamily="monospace">Phase 1-2</text>
                    <text x="40" y="8" fill="#64748b" fontSize="6" fontFamily="monospace">Phase 3 (plateau)</text>
                    <text x="60" y="57" fill="#64748b" fontSize="6" fontFamily="monospace">Phase 0 (insp)</text>
                    <line x1="0" y1="35" x2="200" y2="35" stroke="#1e3a5f" strokeWidth="0.5" strokeDasharray="3,3" />
                    <text x="2" y="33" fill="#475569" fontSize="5" fontFamily="monospace">Normal 35–45 mmHg</text>
                  </svg>
                  {[
                    { phase: "Phase I",  desc: "Inspiratory baseline — dead space washout (CO₂ ~0 mmHg)" },
                    { phase: "Phase II", desc: "Expiratory upstroke — mixing of dead space + alveolar gas" },
                    { phase: "Phase III",desc: "Alveolar plateau — normal 35–45 mmHg. Alpha angle = compliance" },
                    { phase: "Phase 0",  desc: "Inspiratory downstroke — fresh gas inhalation" },
                  ].map(p => (
                    <div key={p.phase} className="mb-1.5">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.phase}: </span>
                      <span className="text-slate-600 dark:text-slate-300 text-[11px]">{p.desc}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-3 text-xs text-sky-800 dark:text-sky-200 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">Device Selection</div>
                  <div><strong>Intubated:</strong> Mainstream or sidestream capnography. Mainstream preferred in small children (no dead space added). Sidestream: sampling rate 50–200 mL/min (use paed adapter).</div>
                  <div><strong>Non-intubated (PSA):</strong> Sidestream via nasal cannula or bifurcated O₂/CO₂ cannula. Less accurate but detects apnoea and hypoventilation early.</div>
                  <div><strong>Colorimetric (Easy Cap):</strong> Tan = ETCO₂ &gt;2% = in trachea. Purple = oesophageal. Only use when waveform unavailable. Inaccurate in prolonged cardiac arrest.</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200 space-y-2">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">ETCO₂ Pattern Interpretation</div>
                  {[
                    { pat: "Low ETCO₂ (<30 mmHg)",  cause: "Hyperventilation · Low cardiac output · Pulmonary embolism · Leak in circuit" },
                    { pat: "High ETCO₂ (>50 mmHg)", cause: "Hypoventilation · Malignant hyperthermia · Raised CO₂ production (fever, seizures)" },
                    { pat: "Shark fin / Obstructed", cause: "Slow alveolar emptying — asthma, bronchospasm, auto-PEEP. Sloped plateau." },
                    { pat: "Sudden drop to zero",    cause: "Oesophageal intubation · Circuit disconnect · Cardiac arrest" },
                    { pat: "ETCO₂ < PaCO₂",          cause: "Normal: gradient 2–5 mmHg. Widened gap = increased dead space (PE, low CO)" },
                    { pat: "ETCO₂ during CPR",        cause: "<10 mmHg despite CPR = poor compressions. Sustained rise = ROSC" },
                  ].map(p => (
                    <div key={p.pat} className="border-b border-amber-200 dark:border-amber-800 pb-1.5 mb-1">
                      <div className="font-bold text-[10px]">{p.pat}</div>
                      <div className="text-[10px] opacity-80">{p.cause}</div>
                    </div>
                  ))}
                </div>
                <InfoBox tone="emerald" icon={CheckCircle} title="Paediatric tip">
                  In neonates and infants, ETCO₂ underestimates PaCO₂ due to high respiratory rates and relatively larger dead space. Always correlate with ABG in ventilated neonates. Reliable waveform confirms ETT in trachea — regardless of absolute value.
                </InfoBox>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SUB-TAB 4: REFERENCE TABLE ───────────────────────────────────────────────
function ReferenceTableView() {
  const { weight } = useWeight();
  const [highlightAge, setHighlightAge] = useState(null);
  const suggestedIdx = useMemo(() => {
    if (!EQUIPMENT_ROWS) return 0;
    const idx = EQUIPMENT_ROWS.findIndex(r => parseFloat(r.weight) >= weight);
    return idx >= 0 ? idx : EQUIPMENT_ROWS.length - 1;
  }, [weight]);

  const cols = [
    { k: "age",     label: "Age"           },
    { k: "weight",  label: "Weight (kg)"   },
    { k: "ett",     label: "ETT (mm ID)"   },
    { k: "depth",   label: "Depth (cm)"    },
    { k: "suction", label: "Suction (Fr)"  },
    { k: "blade",   label: "Laryngoscope"  },
    { k: "lma",     label: "LMA"           },
    { k: "ngt",     label: "NGT (Fr)"      },
    { k: "iv",      label: "IV"            },
    { k: "defib",   label: "Defib (J)"     },
  ];

  return (
    <div className="space-y-4">
      <InfoBox tone="sky" icon={Lightbulb}>
        Row matching current weight ({weight} kg) highlighted in blue. Click any row to lock selection.
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
            {(EQUIPMENT_ROWS || []).map((r, i) => {
              const isSuggested   = i === suggestedIdx;
              const isHighlighted = highlightAge === r.age;
              let rowCls = "border-t border-slate-200 dark:border-slate-800 cursor-pointer transition-colors ";
              if (isHighlighted)    rowCls += "bg-violet-100 dark:bg-violet-950/50 ";
              else if (isSuggested) rowCls += "bg-blue-50 dark:bg-blue-950/30 ";
              else                  rowCls += "odd:bg-white dark:odd:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/30 ";
              return (
                <tr key={r.age} className={rowCls} onClick={() => setHighlightAge(isHighlighted ? null : r.age)}>
                  <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {r.age}
                    {isSuggested && !isHighlighted && <span className="ml-1.5 text-[8px] font-mono uppercase tracking-widest text-blue-500 border border-blue-200 dark:border-blue-800 rounded px-1 py-0.5">wt</span>}
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
  { id: "difficult",  label: "Difficult Airway",     Icon: Warning       },
  { id: "monitoring", label: "Monitoring Equipment", Icon: Activity      },
  { id: "table",      label: "Reference Table",      Icon: ClipboardText },
];

export default function EquipmentTab() {
  const { weight } = useWeight();
  const [activeTab, setActiveTab] = useState("calculator");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Airway Equipment &amp; Monitoring
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Weight/age-based equipment for{" "}
          <span className="font-bold text-slate-900 dark:text-white">{weight} kg</span> ·
          Harriet Lane 23e · Fleischer &amp; Ludwig 7e · APLS · AIDAA 2022 · Morgan &amp; Mikhail 7e
        </p>
      </div>

      <InfoBox tone="amber" icon={Warning}>
        Always prepare one size above and below. Cuffed ETTs preferred ≥2 yr or ≥8 kg. Confirm ETT position with ETCO₂ waveform — not colorimetric alone. For RSI drug doses see the Resuscitation tab.
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

      {activeTab === "calculator" && <LiveEquipmentCalculator />}
      {activeTab === "difficult"  && <DifficultAirwayView />}
      {activeTab === "monitoring" && <MonitoringEquipmentView />}
      {activeTab === "table"      && <ReferenceTableView />}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        Harriet Lane 23e · Fleischer &amp; Ludwig 7e · APLS · AIDAA 2022 · Vortex Approach (Chrimes 2016) ·
        Morgan &amp; Mikhail 7e · Motoyama Paediatric Anaesthesia · AHA PALS 2020
      </div>
    </div>
  );
}
