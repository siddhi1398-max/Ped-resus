// ECGTab.jsx — ECG / Cardiac Rhythm Recognition
// Visual rhythm library with SVG strips, clinical features,
// and weight-based treatment doses for each rhythm
// Sources: AHA PALS 2020, APLS, ESC Paediatric EP Guidelines

import { useState } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Warning, ArrowRight, Heartbeat, Lightning, Pulse,
  CheckCircle, Info,
} from "@phosphor-icons/react";

// ─── COLOUR HELPERS ────────────────────────────────────────────────────────────
const TONE = {
  red:     { text: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-950/30",         border: "border-red-200 dark:border-red-800"     },
  amber:   { text: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200 dark:border-amber-800" },
  blue:    { text: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-950/30",       border: "border-blue-200 dark:border-blue-800"   },
  emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  violet:  { text: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-50 dark:bg-violet-950/30",   border: "border-violet-200 dark:border-violet-800" },
  slate:   { text: "text-slate-600 dark:text-slate-400",     bg: "bg-slate-50 dark:bg-slate-900/50",     border: "border-slate-200 dark:border-slate-700" },
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

// ─── RHYTHM SVG STRIPS ─────────────────────────────────────────────────────────
// Each rhythm is drawn as a simplified but clinically representative SVG strip
// Grid: 1 small square = 0.04s / 1 mm, 1 large square = 0.2s / 5 mm
// Strip width = 700px representing ~6 seconds of rhythm

function GridLines({ w = 700, h = 100 }) {
  const smallSq = 14; // pixels per small square (0.04s)
  const largeSq = 70; // pixels per large square (0.2s = 5 small)
  return (
    <g>
      {/* Small grid */}
      {Array.from({ length: Math.ceil(w / smallSq) + 1 }, (_, i) => (
        <line key={`vs${i}`} x1={i * smallSq} y1={0} x2={i * smallSq} y2={h}
          stroke="#fca5a5" strokeWidth="0.3" strokeOpacity="0.4" />
      ))}
      {Array.from({ length: Math.ceil(h / smallSq) + 1 }, (_, i) => (
        <line key={`hs${i}`} x1={0} y1={i * smallSq} x2={w} y2={i * smallSq}
          stroke="#fca5a5" strokeWidth="0.3" strokeOpacity="0.4" />
      ))}
      {/* Large grid */}
      {Array.from({ length: Math.ceil(w / largeSq) + 1 }, (_, i) => (
        <line key={`vl${i}`} x1={i * largeSq} y1={0} x2={i * largeSq} y2={h}
          stroke="#fca5a5" strokeWidth="0.8" strokeOpacity="0.5" />
      ))}
      {Array.from({ length: Math.ceil(h / largeSq) + 1 }, (_, i) => (
        <line key={`hl${i}`} x1={0} y1={i * largeSq} x2={w} y2={i * largeSq}
          stroke="#fca5a5" strokeWidth="0.8" strokeOpacity="0.5" />
      ))}
    </g>
  );
}

// Build a single QRS-T complex path at x offset, baseline y
// Returns path string
function qrsComplex(x, y, { prSeg=28, qDip=6, rHeight=38, sDip=14, stSeg=21, tHeight=14, rrInterval=70 } = {}) {
  // P wave (small bump)
  const pStart = x;
  const pPeak  = x + 10;
  const pEnd   = x + 18;
  // PR segment
  const qStart = pEnd + (prSeg - 18);
  // QRS
  const qPeak  = qStart + 3;
  const rPeak  = qStart + 8;
  const sPeak  = qStart + 14;
  const sEnd   = qStart + 20;
  // ST + T
  const tPeak  = sEnd + stSeg + 8;
  const tEnd   = sEnd + stSeg + 18;

  return [
    `M${pStart},${y}`,
    `C${pStart+4},${y} ${pStart+6},${y - 8} ${pPeak},${y - 8}`,
    `C${pPeak+4},${y - 8} ${pEnd-2},${y} ${pEnd},${y}`,
    `L${qStart},${y}`,
    `L${qPeak},${y + qDip}`,
    `L${rPeak},${y - rHeight}`,
    `L${sPeak},${y + sDip}`,
    `L${sEnd},${y}`,
    `L${sEnd + stSeg},${y}`,
    `C${sEnd+stSeg+4},${y} ${sEnd+stSeg+6},${y - tHeight} ${tPeak},${y - tHeight}`,
    `C${tPeak+4},${y - tHeight} ${tEnd-2},${y} ${tEnd},${y}`,
  ].join(" ");
}

// ── Normal Sinus Rhythm ──
function NSRStrip() {
  const y = 55; const w = 700;
  const complexes = [60, 200, 340, 480, 620];
  return (
    <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines w={w} h={110} />
      <path d={complexes.map(x => qrsComplex(x, y)).join(" ")}
        fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1={y} x2="60" y2={y} stroke="#1e293b" strokeWidth="1.8" />
      <line x1={complexes[complexes.length-1] + 88} y1={y} x2={w} y2={y} stroke="#1e293b" strokeWidth="1.8" />
    </svg>
  );
}

// ── Sinus Tachycardia ──
function SinusTachyStrip() {
  const y = 55;
  const complexes = [30, 130, 230, 330, 430, 530, 630];
  return (
    <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines w={700} h={110} />
      <path d={complexes.map(x => qrsComplex(x, y, { prSeg: 20, rrInterval: 50 })).join(" ")}
        fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1={y} x2="30" y2={y} stroke="#1e293b" strokeWidth="1.8" />
      <line x1={complexes[complexes.length-1] + 70} y1={y} x2={700} y2={y} stroke="#1e293b" strokeWidth="1.8" />
    </svg>
  );
}

// ── SVT (narrow, very fast, no visible P) ──
function SVTStrip() {
  const y = 55;
  const complexes = [20, 95, 170, 245, 320, 395, 470, 545, 620];
  return (
    <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines w={700} h={110} />
      {complexes.map(x => (
        <path key={x}
          d={`M${x},${y} L${x},${y} L${x+3},${y+4} L${x+7},${y-36} L${x+12},${y+10} L${x+16},${y} L${x+34},${y}`}
          fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <line x1="0" y1={y} x2="20" y2={y} stroke="#dc2626" strokeWidth="1.8" />
    </svg>
  );
}

// ── VT (wide bizarre QRS, fast, no visible P) ──
function VTStrip() {
  const y = 55;
  const complexes = [20, 120, 220, 320, 420, 520, 620];
  return (
    <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines w={700} h={110} />
      {complexes.map(x => (
        <path key={x}
          d={`M${x},${y} L${x+6},${y+12} L${x+16},${y-38} L${x+26},${y+16} L${x+36},${y+6} L${x+50},${y+2} L${x+60},${y+8} L${x+70},${y-4} L${x+80},${y} L${x+98},${y}`}
          fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <line x1="0" y1={y} x2="20" y2={y} stroke="#dc2626" strokeWidth="2" />
    </svg>
  );
}

// ── VF (chaotic, no recognisable complexes) ──
function VFStrip() {
  const pts = "M0,55 C15,55 18,10 28,18 C38,26 40,80 52,72 C64,64 66,22 78,30 C90,38 92,70 104,62 C116,54 118,15 130,25 C142,35 144,78 156,68 C168,58 170,30 182,38 C194,46 196,72 208,60 C220,48 222,20 234,28 C246,36 248,80 260,70 C272,60 274,18 286,26 C298,34 300,68 312,58 C324,48 326,22 338,32 C350,42 352,76 364,64 C376,52 378,28 390,36 C402,44 404,74 416,62 C428,50 430,16 442,24 C454,32 456,80 468,68 C480,56 482,24 494,34 C506,44 508,72 520,60 C532,48 534,18 546,28 C558,38 560,76 572,64 C584,52 586,26 598,34 C610,42 612,70 624,60 C636,50 638,22 650,30 C662,38 664,80 676,68 C688,56 690,45 700,55";
  return (
    <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines w={700} h={110} />
      <path d={pts} fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Asystole ──
function AsystoleStrip() {
  const y = 55;
  return (
    <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines w={700} h={110} />
      <path d={`M0,${y} C100,${y} 140,${y-3} 200,${y+2} C260,${y+2} 300,${y-1} 350,${y} L700,${y}`}
        fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
      <text x="350" y="30" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#94a3b8">NO ELECTRICAL ACTIVITY</text>
    </svg>
  );
}

// ── PEA ──
function PEAStrip() {
  const y = 55;
  const complexes = [60, 200, 340, 480, 620];
  return (
    <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines w={700} h={110} />
      <path d={complexes.map(x => qrsComplex(x, y, { rHeight: 20, sDip: 8, tHeight: 8 })).join(" ")}
        fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1={y} x2="60" y2={y} stroke="#f59e0b" strokeWidth="1.8" />
      <line x1={complexes[complexes.length-1] + 70} y1={y} x2={700} y2={y} stroke="#f59e0b" strokeWidth="1.8" />
      <text x="350" y="20" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#d97706">Organised electrical activity — NO palpable pulse</text>
    </svg>
  );
}

// ── Bradycardia / Heart Block ──
function BradyStrip() {
  const y = 55;
  const complexes = [40, 240, 440, 640];
  return (
    <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines w={700} h={110} />
      <path d={complexes.map(x => qrsComplex(x, y, { prSeg: 35, rrInterval: 120 })).join(" ")}
        fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1={y} x2="40" y2={y} stroke="#3b82f6" strokeWidth="1.8" />
    </svg>
  );
}

// ── Complete Heart Block (3°) ──
function CHBStrip() {
  const y = 55;
  // Independent P waves (fast) + slow QRS complexes (different rate)
  const pWaves  = [30, 80, 130, 180, 230, 280, 330, 380, 430, 480, 530, 580, 630, 680];
  const qrsList = [60, 220, 380, 540, 700];
  return (
    <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines w={700} h={110} />
      {/* P waves only */}
      {pWaves.map(x => (
        <path key={x}
          d={`M${x},${y} C${x+3},${y} ${x+5},${y-9} ${x+8},${y-9} C${x+11},${y-9} ${x+13},${y} ${x+16},${y}`}
          fill="none" stroke="#94a3b8" strokeWidth="1.2" />
      ))}
      {/* Slow, independent QRS */}
      {qrsList.map(x => x <= 700 && (
        <path key={x}
          d={`M${x-10<0?0:x-10},${y} L${x},${y} L${x+3},${y+5} L${x+10},${y-42} L${x+17},${y+14} L${x+24},${y} L${x+40},${y}`}
          fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      ))}
      <text x="350" y="18" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#94a3b8">
        P waves (grey) march independently from QRS — no relationship
      </text>
    </svg>
  );
}

// ── WPW / Delta wave ──
function WPWStrip() {
  const y = 55;
  const complexes = [60, 200, 340, 480, 620];
  return (
    <svg viewBox="0 0 700 110" className="w-full" style={{ background: "#fff8f8" }}>
      <GridLines w={700} h={110} />
      {complexes.map(x => (
        <path key={x}
          d={`M${x},${y} C${x+8},${y} ${x+12},${y-6} ${x+18},${y} L${x+22},${y+4} L${x+28},${y-36} L${x+36},${y+12} L${x+42},${y} L${x+60},${y-10} C${x+68},${y-10} ${x+74},${y} ${x+82},${y} L${x+100},${y}`}
          fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <line x1="0" y1={y} x2="60" y2={y} stroke="#8b5cf6" strokeWidth="1.8" />
      <text x="350" y="16" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#8b5cf6">
        Short PR + delta wave (slurred upstroke) + wide QRS
      </text>
    </svg>
  );
}

// ─── RHYTHM DATA ──────────────────────────────────────────────────────────────
function getRhythms(weight) {
  const w = weight;
  return [
    // ── SHOCKABLE ──
    {
      id: "vf", group: "shockable", tone: "red",
      name: "Ventricular Fibrillation (VF)",
      rate: "Indeterminate — chaotic",
      strip: <VFStrip />,
      features: [
        "Chaotic irregular deflections — no organised complexes",
        "No identifiable P waves, QRS, or T waves",
        "Variable amplitude (coarse VF = higher amplitude)",
        "Most common initial rhythm in witnessed cardiac arrest",
      ],
      management: [
        `Immediate defibrillation: ${Math.round(w*4)} J (4 J/kg) non-synchronised`,
        "Continue CPR immediately after shock — do not check rhythm first",
        `Adrenaline after 2nd shock: ${(w*0.01).toFixed(2)} mg IV/IO (0.01 mg/kg)`,
        `Amiodarone after 3rd shock: ${Math.round(w*5)} mg IV (5 mg/kg, max 300 mg)`,
        "Treat reversible causes: 4H4T",
        `Subsequent shocks: ${Math.round(w*4)}–${Math.min(Math.round(w*10),360)} J (escalate to max)`,
      ],
      drugs: [],
      tone_specific: "red",
    },
    {
      id: "vt", group: "shockable", tone: "red",
      name: "Pulseless Ventricular Tachycardia (pVT)",
      rate: "150–250 bpm",
      strip: <VTStrip />,
      features: [
        "Wide bizarre QRS >0.12 s (>3 small squares)",
        "Regular or slightly irregular rhythm",
        "No identifiable P waves",
        "Monomorphic (same shape) or polymorphic (Torsades)",
        "No palpable pulse — treat as VF",
      ],
      management: [
        `Pulseless VT = treat as VF: ${Math.round(w*4)} J non-sync immediately`,
        "If pulse present with VT: Seek senior help — do NOT shock without anaesthesia",
        `Amiodarone (stable VT with pulse): ${Math.round(w*5)} mg/kg IV over 20–60 min`,
        "Torsades de Pointes: IV Magnesium sulphate 25–50 mg/kg (max 2 g)",
        "Correct QTc-prolonging drugs, hypoK⁺, hypoMg²⁺",
      ],
      tone_specific: "red",
    },

    // ── NON-SHOCKABLE ──
    {
      id: "asystole", group: "nonshockable", tone: "slate",
      name: "Asystole",
      rate: "0 bpm",
      strip: <AsystoleStrip />,
      features: [
        "Flat line — no electrical activity",
        "Confirm in 2 leads — artefact can mimic asystole",
        "Fine VF must be excluded (increase gain)",
        "Most common arrest rhythm in children",
        "Usually preceded by progressive bradycardia",
      ],
      management: [
        "CPR immediately — high-quality chest compressions",
        `Adrenaline ASAP: ${(w*0.01).toFixed(2)} mg IV/IO (0.01 mg/kg) — repeat every 3–5 min`,
        "Treat 4H4T: Hypoxia, Hypovolaemia, Hypo/hyperkalaemia, Hypothermia / Tension pneumo, Tamponade, Toxins, Thrombosis",
        "Do NOT defibrillate asystole — no evidence of benefit",
        "Consider sodium bicarbonate if prolonged arrest or acidosis",
      ],
      tone_specific: "slate",
    },
    {
      id: "pea", group: "nonshockable", tone: "amber",
      name: "Pulseless Electrical Activity (PEA)",
      rate: "Variable — organised but no pulse",
      strip: <PEAStrip />,
      features: [
        "Organised electrical activity on monitor",
        "No palpable pulse (central)",
        "May look like normal sinus, bradycardia, or any rhythm",
        "EMD (electromechanical dissociation) — same thing",
      ],
      management: [
        "CPR immediately — treat as non-shockable",
        `Adrenaline: ${(w*0.01).toFixed(2)} mg IV/IO — repeat every 3–5 min`,
        "Aggressively identify and treat reversible causes (4H4T)",
        "FAST for tamponade; ultrasound for other causes",
        "Tension pneumo → immediate needle decompression",
        "Hypovolaemia → 10 mL/kg blood products",
      ],
      tone_specific: "amber",
    },

    // ── TACHYCARDIAS ──
    {
      id: "svt", group: "tachy", tone: "red",
      name: "Supraventricular Tachycardia (SVT)",
      rate: "Infants >220 bpm · Children >180 bpm",
      strip: <SVTStrip />,
      features: [
        "Narrow QRS (<0.08 s) — regular rhythm",
        "Heart rate typically >220 bpm in infants, >180 in children",
        "Abrupt onset and termination",
        "P waves not visible or retrograde (after QRS)",
        "Most common tachyarrhythmia in children",
      ],
      management: [
        "STABLE: Vagal manoeuvres first — ice to face (diving reflex in infants), Valsalva in older children",
        `Adenosine: ${Math.min((w*0.1).toFixed(1),6)} mg IV RAPID bolus (0.1 mg/kg, max 6 mg) — flush immediately`,
        `If no conversion: Adenosine 0.2 mg/kg = ${Math.min((w*0.2).toFixed(1),12)} mg (max 12 mg)`,
        `UNSTABLE (poor perfusion): Sync cardioversion ${Math.round(w*0.5)}–${Math.round(w*1)} J (0.5–1 J/kg)`,
        "Escalate to 2 J/kg if initial cardioversion fails",
        "Seek cardiology advice after conversion — investigate cause",
      ],
      tone_specific: "red",
    },
    {
      id: "vt_pulse", group: "tachy", tone: "red",
      name: "VT with Pulse",
      rate: "150–250 bpm",
      strip: <VTStrip />,
      features: [
        "Wide QRS >0.12 s (>3 small squares) — regular",
        "No identifiable P waves",
        "AV dissociation, fusion beats, capture beats (pathognomonic)",
        "Cannon A waves in JVP",
        "Haemodynamic compromise common",
      ],
      management: [
        "UNSTABLE: Sync cardioversion with sedation — DO NOT delay",
        `Sync cardioversion: ${Math.round(w*1)} J → ${Math.round(w*2)} J escalating`,
        `STABLE: Amiodarone ${Math.round(w*5)} mg/kg IV over 20–60 min (max 300 mg)`,
        "Do NOT give adenosine for wide complex tachycardia — may cause VF",
        "Do NOT give verapamil in children — may cause cardiac arrest",
        "Cardiology input essential — all VT needs investigation",
      ],
      tone_specific: "red",
    },
    {
      id: "sinustachy", group: "tachy", tone: "amber",
      name: "Sinus Tachycardia",
      rate: "Variable — appropriate for age",
      strip: <SinusTachyStrip />,
      features: [
        "Narrow QRS, regular, visible P waves before each QRS",
        "P wave normal axis (upright in lead II)",
        "Rate usually <220 bpm in infants",
        "Gradual onset / offset (vs SVT abrupt)",
        "NOT a primary rhythm problem — always has a CAUSE",
      ],
      management: [
        "Identify and treat the underlying cause — this is the treatment",
        "Common causes: Fever, pain, hypovolaemia, hypoxia, anxiety, anaemia, sepsis",
        "Do NOT treat sinus tachycardia with antiarrhythmics",
        "Volume replacement if hypovolaemic",
        "Treat fever/pain/sepsis as appropriate",
      ],
      tone_specific: "amber",
    },

    // ── BRADYCARDIAS ──
    {
      id: "brady", group: "brady", tone: "blue",
      name: "Symptomatic Bradycardia",
      rate: "<60 bpm (or age-inappropriately slow with haemodynamic compromise)",
      strip: <BradyStrip />,
      features: [
        "P waves present but may be slow",
        "HR <60 bpm in children — or slow for age with poor perfusion",
        "May have wide QRS if infranodal block or junctional rhythm",
        "Hypotension, poor perfusion, decreased consciousness",
        "Signs of haemodynamic compromise — NOT just HR",
      ],
      management: [
        "If NO pulse → arrest protocol (CPR)",
        "Airway + oxygen first — most paediatric bradycardia is hypoxic",
        `Atropine: ${Math.max((w*0.02).toFixed(2), 0.1)} mg IV/IO (0.02 mg/kg, min 0.1 mg, max 0.5 mg)`,
        `Adrenaline infusion: 0.1–1 mcg/kg/min — start at ${(w*0.1).toFixed(1)} mcg/min`,
        "Transcutaneous pacing if drug-resistant — painful, requires sedation",
        "Treat reversible causes: hypoxia (most common), hypothermia, heart block, toxins",
      ],
      tone_specific: "blue",
    },
    {
      id: "chb", group: "brady", tone: "blue",
      name: "Complete Heart Block (3° AV Block)",
      rate: "Ventricular rate 30–60 bpm (escape)",
      strip: <CHBStrip />,
      features: [
        "P waves and QRS completely independent — no relationship",
        "P rate > QRS rate (faster atria, slower ventricles)",
        "QRS may be narrow (junctional escape) or wide (ventricular escape)",
        "Fixed PR intervals that don't correspond",
        "Cannon A waves in JVP",
      ],
      management: [
        "Congenital CHB: may be well-tolerated — monitor, cardiology referral",
        "Acquired CHB (Lyme, post-surgical): more urgent",
        `Atropine (if symptomatic): ${Math.max((w*0.02).toFixed(2), 0.1)} mg IV — may not work on ventricular escape`,
        `Isoprenaline infusion: 0.05–0.5 mcg/kg/min (bridge to pacing)`,
        "Transvenous/transcutaneous pacing — definitive treatment",
        "Cardiology urgent — most CHB requires permanent pacemaker",
      ],
      tone_specific: "blue",
    },

    // ── OTHER ──
    {
      id: "nsr", group: "normal", tone: "emerald",
      name: "Normal Sinus Rhythm (NSR)",
      rate: "Age-appropriate",
      strip: <NSRStrip />,
      features: [
        "Regular P-QRS-T sequence — upright P in lead II",
        "PR interval 0.12–0.20 s (3–5 small squares)",
        "QRS <0.08 s narrow (≤2 small squares)",
        "QTc ≤0.44 s (Bazett formula)",
        "Age-appropriate rate (see Vitals tab for ranges)",
      ],
      management: [
        "Normal rhythm — no treatment required",
        "Confirm clinical correlation: a normal ECG does not exclude structural heart disease",
        "If history of syncope / palpitations with normal ECG: 24h Holter, echo, cardiology referral",
        "Check QTc carefully — may be prolonged with normal-looking rhythm",
      ],
      tone_specific: "emerald",
    },
    {
      id: "wpw", group: "other", tone: "violet",
      name: "Wolff-Parkinson-White (WPW)",
      rate: "Normal at rest — rapid during SVT",
      strip: <WPWStrip />,
      features: [
        "Short PR interval (<0.12 s) in sinus rhythm",
        "Delta wave — slurred upstroke of QRS",
        "Wide QRS due to pre-excitation",
        "Pseudo-infarct pattern (negative delta = pseudo-Q)",
        "Risk of pre-excited AF → VF (avoid AV node blockers)",
      ],
      management: [
        "Asymptomatic WPW: risk stratification by electrophysiology study",
        "SVT in WPW: adenosine usually safe — may reveal AF",
        "Pre-excited AF (wide, irregular, very fast): DO NOT use adenosine/digoxin/verapamil",
        "Pre-excited AF: DC cardioversion or IV procainamide (not available universally)",
        "Definitive treatment: radiofrequency catheter ablation",
        "Urgent cardiology referral for all WPW in children",
      ],
      tone_specific: "violet",
    },
  ];
}

// ─── RHYTHM CARD ────────────────────────────────────────────────────────────────
function RhythmCard({ rhythm, weight, selected, onSelect }) {
  const t = TONE[rhythm.tone];
  return (
    <button
      onClick={() => onSelect(rhythm.id)}
      className={`w-full text-left rounded-xl border p-3 transition-all ${
        selected
          ? `border-2 bg-white dark:bg-slate-900 ${t.border}`
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
      }`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className={`font-bold text-xs leading-tight ${t.text}`}
              style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          {rhythm.name}
        </span>
        {rhythm.group === "shockable" && (
          <span className="text-[8px] font-mono font-bold text-white bg-red-600 rounded px-1.5 py-0.5 flex-shrink-0">SHOCK</span>
        )}
      </div>
      <div className="font-mono text-[9px] text-slate-400">{rhythm.rate}</div>
    </button>
  );
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function ECGTab() {
  const { weight } = useWeight();
  const rhythms = getRhythms(weight);

  const [selectedId, setSelectedId] = useState("vf");
  const [activeGroup, setActiveGroup] = useState("all");

  const groups = [
    { id: "all",         label: "All" },
    { id: "shockable",   label: "Shockable" },
    { id: "nonshockable",label: "Non-Shockable" },
    { id: "tachy",       label: "Tachyarrhythmia" },
    { id: "brady",       label: "Bradyarrhythmia" },
    { id: "normal",      label: "Normal/Other" },
    { id: "other",       label: "Special" },
  ];

  const filtered = activeGroup === "all" ? rhythms : rhythms.filter(r => r.group === activeGroup);
  const selected = rhythms.find(r => r.id === selectedId) || rhythms[0];
  const t = TONE[selected.tone];

  // 4H4T
  const H4T4 = {
    h: ["Hypoxia — O₂, airway, ventilation", "Hypovolaemia — fluids/blood", "Hypo/hyperkalaemia, hypoglycaemia, other metabolic", "Hypothermia — warm patient"],
    t: ["Tension pneumothorax — needle decompression", "Tamponade — pericardiocentesis", "Toxins/drugs — antidote, supportive", "Thrombosis (pulmonary/coronary) — treat cause"],
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          ECG &amp; Rhythm Recognition
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Visual rhythm library with {weight} kg weight-based treatment doses · AHA PALS 2020 · APLS
        </p>
      </div>

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
        {/* Left: Rhythm list */}
        <div className="space-y-2">
          {filtered.map(r => (
            <RhythmCard key={r.id} rhythm={r} weight={weight}
              selected={selectedId === r.id}
              onSelect={setSelectedId} />
          ))}
        </div>

        {/* Right: Detail panel */}
        <div className="sm:col-span-2 space-y-4">
          {/* Header */}
          <div className={`rounded-xl border p-4 ${t.bg} ${t.border}`}>
            <div className={`font-bold text-lg mb-0.5 ${t.text}`}
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              {selected.name}
            </div>
            <div className="font-mono text-[10px] text-slate-400">Rate: {selected.rate}</div>
          </div>

          {/* Strip */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <span className="font-mono text-[8px] uppercase tracking-widest text-slate-400">Rhythm strip — 6 second view (25 mm/s, 10 mm/mV)</span>
            </div>
            <div className="p-2">
              {selected.strip}
            </div>
          </div>

          {/* Features + Management */}
          <div className="grid sm:grid-cols-2 gap-4">
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
              <div className="font-bold text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                Treatment — {weight} kg
              </div>
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
             style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Reversible Causes — 4H4T (check in every arrest)
        </div>
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
            {H4T4.t.map((t, i) => (
              <div key={i} className="flex items-start gap-1.5 text-amber-800 dark:text-amber-200 mb-1">
                <span className="font-black text-amber-500 flex-shrink-0">T{i+1}</span>{t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        AHA PALS 2020 · APLS · ESC Paediatric EP Guidelines 2021 · Rhythm strips are schematic representations — always interpret in clinical context
      </div>
    </div>
  );
}
