// WaveformLibrary.jsx — Static Waveform Reference Library
// Extracted from WaveformView.jsx · Tintinalli · BTS/ATS · PEMVECC 2017

import {
  CheckCircle,
  PauseCircle,
  SealWarning,
  ArrowRight,
  Lightbulb,
  Wind,
  Stethoscope,
} from "@phosphor-icons/react";

// ─── STATIC WAVEFORMS DATA ────────────────────────────────────────────────────
const STATIC_WAVEFORMS = [
  {
    id: "normal-vc", label: "Normal — VC–AC", category: "normal",
    description: "Square flow, linear pressure rise, clean expiratory return to zero. PIP at peak; plateau measurable with inspiratory hold.",
    findings: ["Flow: constant square inspiratory, passive exponential expiratory", "Pressure: ramp rise to PIP, drops at cycle-off", "Volume: ascending ramp, clean return to baseline"],
    svgTraces: {
      pressure: { path: "M5,75 L30,75 L30,25 L80,25 L80,75 L130,25 L180,25 L180,75 L215,75", color: "#4ade80" },
      flow:     { path: "M5,60 L30,60 L30,25 L80,25 L80,72 L130,25 L180,25 L180,72 L215,60", color: "#60a5fa" },
      volume:   { path: "M5,80 L30,80 L80,28 L80,80 L130,28 L180,28 L180,80 L215,80", color: "#f472b6" },
    },
  },
  {
    id: "insp-hold", label: "Inspiratory Hold — Plateau", category: "maneuver",
    description: "Inspiratory hold occludes the expiratory valve. Flow drops to zero, pressure falls from PIP to plateau (Pplat). Plateau – PEEP = driving pressure.",
    findings: ["PIP = resistive + elastic pressure combined", "Plateau = elastic pressure only (no flow = no resistive component)", "Peak – Plateau >10 cmH₂O = resistance problem", "Driving pressure (Pplat − PEEP) target <15 cmH₂O"],
    annotation: "PIP→Pplat",
    svgTraces: {
      pressure: { path: "M5,75 L30,75 L30,16 L80,16 L80,28 L115,28 L115,75 L160,16 L210,16 L215,28", color: "#4ade80" },
      flow:     { path: "M5,60 L30,60 L30,22 L80,22 L80,60 L115,60 L115,75 L160,22 L210,22 L215,60", color: "#60a5fa" },
      volume:   { path: "M5,80 L30,80 L80,24 L115,24 L115,80 L160,24 L215,24", color: "#f472b6" },
    },
  },
  {
    id: "exp-hold", label: "Expiratory Hold — Auto-PEEP", category: "maneuver",
    description: "Expiratory hold occludes the inspiratory valve at end-expiration. Trapped gas equilibrates. Pressure rise above set PEEP = intrinsic PEEP (PEEPi).",
    findings: ["Set PEEP: baseline pressure on vent display", "Auto-PEEP: pressure plateau ABOVE set PEEP after hold", "PEEPi ≥3 cmH₂O = clinically significant air trapping", "Flow–time: failure to return to zero before next breath"],
    svgTraces: {
      pressure: { path: "M5,75 L30,75 L30,22 L65,22 L65,68 L85,45 L110,45 L110,75 L145,22 L175,22 L175,62 L195,38 L215,38", color: "#4ade80" },
      flow:     { path: "M5,60 L30,60 L30,20 L65,20 L65,72 L85,56 L110,56 L110,60 L145,20 L175,20 L175,70 L195,52 L215,52", color: "#60a5fa" },
      volume:   { path: "M5,80 L30,80 L65,25 L85,48 L110,48 L110,80 L145,25 L175,30 L195,52 L215,52", color: "#f472b6" },
    },
  },
  {
    id: "high-pip-resist", label: "↑ PIP — Resistance (Bronchospasm)", category: "abnormal",
    description: "PIP elevated, plateau near-normal. Large Peak–Plateau gap (>10 cmH₂O). Raw airway resistance problem — secretions, bronchospasm, ETT kink.",
    findings: ["PIP markedly elevated", "Plateau near-normal (elastic compliance intact)", "Peak–Plateau gap >10 cmH₂O = RESISTANCE problem", "DOPE: suction, bronchodilators, check ETT"],
    svgTraces: {
      pressure: { path: "M5,75 L30,75 L30,10 L80,16 L80,72 L130,10 L180,16 L180,72 L215,72", color: "#4ade80" },
      flow:     { path: "M5,60 L30,60 L30,22 L80,22 L80,78 L130,22 L180,22 L180,78 L215,60", color: "#60a5fa" },
      volume:   { path: "M5,80 L30,80 L80,28 L80,80 L130,28 L180,28 L180,80 L215,80", color: "#f472b6" },
    },
  },
  {
    id: "low-comp", label: "↑ PIP + Plateau — Low Compliance (ARDS)", category: "abnormal",
    description: "Both PIP and plateau elevated. Small Peak–Plateau gap (<5 cmH₂O). Stiff lung — ARDS, oedema, pneumothorax.",
    findings: ["PIP elevated", "Plateau ALSO elevated (both high)", "Peak–Plateau gap <5 cmH₂O = COMPLIANCE problem", "Driving pressure likely >15 — reduce Vt immediately"],
    svgTraces: {
      pressure: { path: "M5,75 L30,75 L30,10 L80,10 L80,70 L130,10 L180,10 L180,70 L215,70", color: "#4ade80" },
      flow:     { path: "M5,60 L30,60 L30,24 L80,24 L80,78 L130,24 L180,24 L180,78 L215,60", color: "#60a5fa" },
      volume:   { path: "M5,80 L30,80 L80,32 L80,80 L130,32 L180,32 L180,80 L215,80", color: "#f472b6" },
    },
  },
  {
    id: "auto-peep-wf", label: "Auto-PEEP / Breath Stacking", category: "abnormal",
    description: "Expiratory flow does NOT return to zero before next breath. Volume steps up cycle by cycle. Seen in asthma, bronchiolitis, high RR.",
    findings: ["Flow–time: expiratory curve does not reach baseline", "Volume–time: stepped increase each cycle", "Pressure–time: PEEP level drifts upward", "Confirm with expiratory hold manoeuvre"],
    svgTraces: {
      pressure: { path: "M5,75 L30,75 L30,25 L75,25 L75,62 L120,20 L165,20 L165,55 L215,50", color: "#4ade80" },
      flow:     { path: "M5,60 L30,60 L30,20 L75,20 L75,55 L120,20 L165,20 L165,52 L215,50", color: "#60a5fa" },
      volume:   { path: "M5,80 L30,80 L75,22 L75,60 L120,18 L165,18 L165,50 L215,48", color: "#f472b6" },
    },
  },
  {
    id: "flow-starv-wf", label: "Flow Starvation (VC mode)", category: "abnormal",
    description: "Pressure–time shows concave 'scooped' dip mid-inspiration. Patient demand exceeds vent flow delivery.",
    findings: ["Pressure–time: concave scoop mid-inspiration", "Patient pulling against insufficient flow", "Increase peak flow or switch to PC/PRVC mode", "Optimise sedation and analgesia"],
    svgTraces: {
      pressure: { path: "M5,75 L30,75 L30,25 Q55,42 80,25 L80,72 L130,25 Q155,42 180,25 L180,72 L215,72", color: "#4ade80" },
      flow:     { path: "M5,60 L30,60 L30,22 L80,22 L80,75 L130,22 L180,22 L180,75 L215,60", color: "#60a5fa" },
      volume:   { path: "M5,80 L30,80 L80,28 L80,80 L130,28 L180,28 L180,80 L215,80", color: "#f472b6" },
    },
  },
  {
    id: "cuff-leak-wf", label: "Cuff Leak / Circuit Leak", category: "abnormal",
    description: "Exhaled volume consistently less than inhaled. Volume–time does not return to zero. Audible gurgling around ETT.",
    findings: ["Volume–time: expiratory limb does not reach zero", "Exhaled Vt < Inspired Vt on vent readout", "Check cuff pressure (target 20–25 cmH₂O)", "Inspect all circuit connections"],
    svgTraces: {
      pressure: { path: "M5,75 L30,75 L30,25 L80,25 L80,70 L130,25 L180,25 L180,70 L215,70", color: "#4ade80" },
      flow:     { path: "M5,60 L30,60 L30,20 L80,20 L80,68 L130,20 L180,20 L180,68 L215,60", color: "#60a5fa" },
      volume:   { path: "M5,80 L30,80 L80,22 L80,55 L130,32 L180,32 L180,62 L215,65", color: "#f472b6" },
    },
  },
];

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────
function catConfig(category) {
  if (category === "normal")   return { color: "#34d399", label: "NORMAL",    Icon: CheckCircle  };
  if (category === "maneuver") return { color: "#fbbf24", label: "MANOEUVRE", Icon: PauseCircle  };
  return                              { color: "#f87171", label: "ABNORMAL",   Icon: SealWarning  };
}

// ─── WAVEFORM CARD ────────────────────────────────────────────────────────────
function WaveformCard({ w }) {
  const { color, label, Icon } = catConfig(w.category);
  return (
    <div style={{ background: "#0a0f14", border: "1px solid #1e2d3d", borderRadius: 10, overflow: "hidden", fontFamily: '"JetBrains Mono", monospace' }}>
      <div style={{ padding: "9px 12px", borderBottom: "1px solid #1e2d3d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0" }}>{w.label}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 8, letterSpacing: 2, color, textTransform: "uppercase" }}>
          <Icon size={10} weight="fill" style={{ color }} />
          {label}
        </span>
      </div>
      <div style={{ padding: "8px 12px" }}>
        {["pressure", "flow", "volume"].map(key => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 8, color: w.svgTraces[key].color, letterSpacing: 1, textTransform: "uppercase", width: 28 }}>
              {key === "pressure" ? "Paw" : key === "flow" ? "Flow" : "Vol"}
            </span>
            <svg viewBox="0 0 220 85" style={{ flex: 1, height: 40, background: "#060d14", borderRadius: 4, border: "1px solid #0e1f2e" }}>
              {[20, 42, 63].map(y => <line key={y} x1="5" y1={y} x2="215" y2={y} stroke="#0d1f30" strokeWidth="0.8" />)}
              {key === "flow" && <line x1="5" y1="60" x2="215" y2="60" stroke="#1e3a52" strokeWidth="0.5" strokeDasharray="3,3" />}
              <path d={w.svgTraces[key].path} fill="none" stroke={w.svgTraces[key].color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {w.annotation && key === "pressure" && (
                <text x={82} y={12} fontSize="6.5" fill="#fbbf24" fontFamily="monospace">{w.annotation}</text>
              )}
            </svg>
          </div>
        ))}
        <p style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.55, marginBottom: 6, marginTop: 4 }}>{w.description}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {w.findings.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 5, alignItems: "flex-start" }}>
              <ArrowRight size={9} weight="bold" style={{ color, flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 10, color: "#64748b" }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function WaveformLibrary() {
  const normalWfs   = STATIC_WAVEFORMS.filter(w => w.category === "normal");
  const maneuverWfs = STATIC_WAVEFORMS.filter(w => w.category === "maneuver");
  const abnormalWfs = STATIC_WAVEFORMS.filter(w => w.category === "abnormal");

  return (
    <div style={{ background: "#0a0f14", borderRadius: 12, border: "1px solid #1e2d3d", padding: "16px", fontFamily: '"JetBrains Mono", monospace' }}>

      <p style={{ fontSize: 10, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>
        Reference pressure–flow–volume scalar graphics. Each shows 2 breath cycles with key diagnostic features annotated.
        Use alongside the Vent Simulator to practise pattern recognition.
      </p>

      {/* Normal */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <CheckCircle size={11} weight="fill" style={{ color: "#34d399" }} />
          <span style={{ fontSize: 9, color: "#34d399", letterSpacing: 2, textTransform: "uppercase" }}>Normal Patterns</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
          {normalWfs.map(w => <WaveformCard key={w.id} w={w} />)}
        </div>
      </div>

      {/* Manoeuvres */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <PauseCircle size={11} weight="fill" style={{ color: "#fbbf24" }} />
          <span style={{ fontSize: 9, color: "#fbbf24", letterSpacing: 2, textTransform: "uppercase" }}>Hold Manoeuvres</span>
        </div>

        {/* How-to box */}
        <div style={{ background: "#0e1116", border: "1px solid #3a2f00", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Lightbulb size={11} weight="fill" style={{ color: "#fbbf24" }} />
            <span style={{ fontSize: 10, color: "#fbbf24" }}>How to perform on a real ventilator</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.65 }}>
              <strong style={{ color: "#94a3b8" }}>Inspiratory Hold (Drager/Maquet):</strong> Press and hold Insp-Hold button at any point in the breath. Patient must be passive (well sedated / paralysed). Hold 0.3–0.5 s. Plateau appears on pressure scalar. Read from vent display before releasing.
            </div>
            <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.65 }}>
              <strong style={{ color: "#94a3b8" }}>Expiratory Hold:</strong> Press Exp-Hold at end-expiration. Hold 3–5 s. Read total PEEP from display. Subtract set PEEP = auto-PEEP (PEEPi). In severe asthma with haemodynamic compromise, disconnect briefly instead to allow full exhalation.
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
          {maneuverWfs.map(w => <WaveformCard key={w.id} w={w} />)}
        </div>
      </div>

      {/* Abnormal */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <SealWarning size={11} weight="fill" style={{ color: "#f87171" }} />
          <span style={{ fontSize: 9, color: "#f87171", letterSpacing: 2, textTransform: "uppercase" }}>Abnormal Patterns — Recognition &amp; Response</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
          {abnormalWfs.map(w => <WaveformCard key={w.id} w={w} />)}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 9, color: "#1e3a52", letterSpacing: 1, paddingTop: 8, borderTop: "1px solid #1e2d3d" }}>
        <Stethoscope size={10} style={{ color: "#1e3a52" }} />
        Tintinalli · BTS/ATS · PEMVECC 2017 · OpenPediatrics — schematic for teaching only
      </div>
    </div>
  );
}
