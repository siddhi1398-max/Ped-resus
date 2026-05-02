// WaveformView.jsx — Enhanced with hold maneuvers, realistic physics,
// static critical waveform library, and EtCO2 subsection
// Icons: @phosphor-icons/react throughout

import { useEffect, useRef, useState } from "react";
import {
  Broadcast,
  Books,
  Wind,
  PauseCircle,
  StopCircle,
  Warning,
  Lightbulb,
  ArrowRight,
  Heartbeat,
  WaveTriangle,
  WaveSawtooth,
  Waveform,
  Drop,
  Fire,
  SealWarning,
  CheckCircle,
  Pulse,
  ArrowFatLinesUp,
  ArrowFatLinesDown,
  ArrowsIn,
  ArrowsOut,
  SkipBack,
  Pulse,
  ChartLine,
  Stethoscope,
} from "@phosphor-icons/react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SAMPLE_RATE = 200;
const WINDOW_S    = 6;
const HISTORY     = SAMPLE_RATE * WINDOW_S;

// ─── MODE DATA ────────────────────────────────────────────────────────────────
const MODES = {
  "vc-ac": {
    label: "VC–AC", pip: 28, peep: 5, vt: 280, rr: 22, ie: 0.33,
    note: "Constant square flow → pressure rises as a ramp. PIP visible at end of inspiration. Plateau measurable with inspiratory hold.",
  },
  "pc-ac": {
    label: "PC–AC", pip: 22, peep: 5, vt: 260, rr: 22, ie: 0.33,
    note: "Pressure steps instantly to set level (rectangular). Flow decelerates exponentially. Vt depends on compliance and resistance.",
  },
  "prvc": {
    label: "PRVC", pip: 20, peep: 5, vt: 270, rr: 22, ie: 0.33,
    note: "Decelerating flow like PC, but vent adjusts pressure each breath to hit the Vt target. Preferred in paediatric ARDS.",
  },
  "simv": {
    label: "SIMV+PS", pip: 24, peep: 5, vt: 260, rr: 16, ie: 0.33,
    note: "Mandatory VC breaths alternate with patient-triggered PS breaths (smaller, variable Vt).",
  },
  "ps": {
    label: "Pressure Support", pip: 14, peep: 5, vt: 240, rr: 18, ie: 0.38,
    note: "All breaths patient-triggered and flow-cycled. No mandatory rate — fully spontaneous.",
  },
};

// ─── SCENARIO DATA ────────────────────────────────────────────────────────────
const SCENARIOS = {
  normal: {
    label: "Normal", alarm: false,
    pipMult: 1, peepMult: 1, vtMult: 1, autopeep: 0, leak: 0, starvation: false, dyssynch: false,
    alarmTitle: "", causes: [], action: "", pearl: "",
    compliance: 1.0, resistance: 1.0,
  },
  "high-pip": {
    label: "High PIP", alarm: true, alarmTitle: "HIGH PIP ALARM",
    causes: ["Bronchospasm / secretions", "ETT obstruction, kink, or biting", "Main-stem intubation", "Pneumothorax", "Low compliance — ARDS, oedema"],
    action: "DOPE: Disconnect → bag manually. Suction ETT. Auscultate bilaterally. Check ETT depth at lips. If Peak−Plateau gap >10 cmH₂O → airway resistance problem. If both elevated → compliance problem.",
    pearl: "Peak−Plateau gap diagnostic: large gap = resistance ↑ (bronchospasm, secretions). Small gap with both elevated = stiff lung (ARDS, PTX, oedema).",
    pipMult: 1.7, peepMult: 1, vtMult: 0.9, autopeep: 0, leak: 0, starvation: false, dyssynch: false,
    compliance: 1.0, resistance: 2.5,
  },
  "auto-peep": {
    label: "Auto-PEEP", alarm: true, alarmTitle: "AUTO-PEEP / BREATH STACKING",
    causes: ["Obstructive disease — asthma, bronchiolitis", "High RR with insufficient expiratory time", "Inadequate I:E ratio"],
    action: "Reduce RR. Extend I:E to 1:3–1:4. Bronchodilators via in-line nebuliser. Perform expiratory hold manoeuvre → read trapped PEEP. In severe asthma: briefly disconnect to allow full exhalation.",
    pearl: "Flow scalar: expiratory flow does NOT return to zero before the next breath. Volume scalar: stepped increase cycle by cycle — the hallmark of breath stacking.",
    pipMult: 1.1, peepMult: 1, vtMult: 1, autopeep: 6, leak: 0, starvation: false, dyssynch: false,
    compliance: 1.0, resistance: 2.2,
  },
  "low-vt": {
    label: "Low Vt / Leak", alarm: true, alarmTitle: "LOW Vt — CIRCUIT LEAK",
    causes: ["ETT cuff deflated (audible gurgling)", "Circuit disconnection or crack", "ETT dislodgement"],
    action: "Check ETT depth at lips. Inflate cuff to 20–25 cmH₂O. Inspect all circuit connections. Observe bilateral chest rise.",
    pearl: "Volume scalar is the key diagnostic: if the expiratory limb does not return to zero → circuit leak. In PC mode, same PIP with lower Vt = ↓ compliance OR leak.",
    pipMult: 0.9, peepMult: 1, vtMult: 0.45, autopeep: 0, leak: 0.45, starvation: false, dyssynch: false,
    compliance: 1.0, resistance: 1.0,
  },
  "flow-starvation": {
    label: "Flow starvation", alarm: false, alarmTitle: "FLOW STARVATION — VC MODE",
    causes: ["Peak flow rate set too low for patient demand", "High patient respiratory drive", "Inappropriate flow pattern"],
    action: "Increase peak flow rate. Switch to decelerating flow pattern. Consider pressure control mode. Optimise sedation and analgesia.",
    pearl: "Pressure scalar shows a characteristic 'scooped' concave dip mid-inspiration — patient is actively pulling but the vent cannot match demand. Only visible in VC with square flow.",
    pipMult: 1, peepMult: 1, vtMult: 1, autopeep: 0, leak: 0, starvation: true, dyssynch: false,
    compliance: 1.0, resistance: 1.0,
  },
  dyssynch: {
    label: "Dyssynchrony", alarm: false, alarmTitle: "PATIENT–VENTILATOR DYSSYNCHRONY",
    causes: ["Pain or agitation — inadequate sedation/analgesia", "Inappropriate trigger sensitivity", "Auto-PEEP causing missed triggers", "Inappropriate inspiratory time"],
    action: "Optimise analgesia (fentanyl 1–4 mcg/kg/hr) + sedation (midazolam 0.05–0.2 mg/kg/hr). Adjust flow trigger to 1–3 L/min. Check for auto-PEEP. Consider PRVC or PS mode.",
    pearl: "Look for: double triggers (two volume peaks per patient effort), reverse triggering, premature cycling, irregular breath-to-breath Vt. COMFORT-B score target 11–17.",
    pipMult: 1, peepMult: 1, vtMult: 1, autopeep: 0, leak: 0, starvation: false, dyssynch: true,
    compliance: 1.0, resistance: 1.0,
  },
  "low-compliance": {
    label: "Low compliance", alarm: true, alarmTitle: "LOW COMPLIANCE — ARDS PATTERN",
    causes: ["ARDS / diffuse alveolar damage", "Pulmonary oedema", "Over-inflation / excessive PEEP", "Bilateral pneumothorax"],
    action: "Lung-protective strategy: Vt 4–6 mL/kg PBW. Plateau ≤ 30 cmH₂O. Driving pressure = Plateau − PEEP: target < 15. Use ARDSnet PEEP–FiO₂ ladder.",
    pearl: "Peak–Plateau gap SMALL (<5 cmH₂O) = compliance problem. Distinct from bronchospasm. Both elevated together = stiff lung.",
    pipMult: 1.65, peepMult: 2, vtMult: 0.75, autopeep: 0, leak: 0, starvation: false, dyssynch: false,
    compliance: 0.35, resistance: 1.0,
  },
};

// ─── REALISTIC SAMPLE GENERATOR ──────────────────────────────────────────────
function generateSample(t, modeKey, scenKey, holdState) {
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
  const R    = s.resistance;
  const C    = s.compliance;

  if (holdState === "insp") {
    const plateau = peep + (vtT / 50) * (1 / C);
    return {
      pressure: Math.min(plateau, pip) + (Math.random() - 0.5) * 0.15,
      flow: (Math.random() - 0.5) * 0.3,
      volume: vtT * 0.98,
      pip, peep, vt: vtT, rr: m.rr, isHold: true,
    };
  }

  if (holdState === "exp") {
    const trapped = peep + s.autopeep;
    return {
      pressure: trapped + (Math.random() - 0.5) * 0.15,
      flow: (Math.random() - 0.5) * 0.2,
      volume: s.autopeep > 0 ? vtT * 0.08 : 0,
      pip, peep, vt: vtT, rr: m.rr, isHold: true,
    };
  }

  let pressure = peep, flow = 0, volume = 0;
  const isVC = modeKey === "vc-ac" || modeKey === "simv";

  if (isVC) {
    if (inInsp) {
      flow = 40;
      const elasticP   = peep + (vtT * inspPhase) / (50 * C);
      const resistiveP = flow * R * 0.18;
      pressure = s.starvation
        ? elasticP + resistiveP - 8 * Math.sin(Math.PI * inspPhase)
        : elasticP + resistiveP;
      volume = vtT * inspPhase;
    } else {
      const tau = R * C * 0.55;
      flow = -(vtT / (50 * Math.max(tau, 0.3))) * Math.exp(-expPhase / Math.max(tau, 0.3)) * 28;
      if (s.autopeep > 0 && expPhase > 0.7)
        flow *= 1 - ((expPhase - 0.7) / 0.3) * 0.85;
      pressure = peep + s.autopeep * Math.exp(-expPhase * 3) + (pip - peep) * Math.exp(-expPhase * 6);
      volume = vtT * Math.max(0, 1 - (1 - Math.exp(-expPhase / Math.max(tau, 0.3))) * (1 + s.leak));
    }
  } else {
    if (inInsp) {
      const driveP = pip - peep;
      pressure = peep + driveP * (1 - Math.exp(-inspPhase * 8 / (R * C)));
      flow = (driveP / (R * C)) * Math.exp(-inspPhase * 4) * 14 * C;
      volume = vtT * (1 - Math.exp(-inspPhase * 6 / (R * C))) / (1 - Math.exp(-6 / (R * C)));
      if (s.starvation) pressure -= 4 * Math.sin(Math.PI * inspPhase);
    } else {
      const tau = R * C * 0.55;
      pressure = peep + s.autopeep * Math.exp(-expPhase * 3) + (pip - peep) * Math.exp(-expPhase * 8);
      flow = -28 * C * Math.exp(-expPhase / Math.max(tau, 0.3));
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

  return {
    pressure: Math.max(peep, pressure) + (Math.random() - 0.5) * 0.25,
    flow: (flow || 0) + (Math.random() - 0.5) * 0.6,
    volume: Math.max(0, volume || 0),
    pip, peep, vt: vtT, rr: m.rr, isHold: false,
  };
}

// ─── CANVAS DRAW ──────────────────────────────────────────────────────────────
function drawTrace(ctx, buf, headIdx, color, yMin, yMax, showZero, holdActive) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const LEN = buf.length;

  ctx.fillStyle = "#060d14";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "#0d1f30";
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

  if (holdActive) {
    ctx.fillStyle = "rgba(251,191,36,0.05)";
    ctx.fillRect(W * 0.68, 0, W * 0.32, H);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(W * 0.68, 0); ctx.lineTo(W * 0.68, H); ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.strokeStyle = holdActive ? "#fbbf24" : color;
  ctx.lineWidth = holdActive ? 1.4 : 1.8;
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
  ctx.fillStyle = holdActive ? "#fbbf24" : color;
  ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2); ctx.fill();
}

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

// ─── ETCO2 DATA ───────────────────────────────────────────────────────────────
const ETCO2_WAVEFORMS = [
  {
    id: "normal-co2", label: "Normal Capnogram", color: "#34d399",
    description: "Classic rectangular waveform. Four distinct phases. EtCO₂ 35–45 mmHg.",
    path: "M5,75 L20,75 L25,25 L70,20 L75,20 L80,75 L120,75 L125,25 L170,20 L175,20 L180,75 L215,75",
    phases: [
      { label: "Phase I",   detail: "Baseline — dead space gas, CO₂ ≈ 0" },
      { label: "Phase II",  detail: "Rapid expiratory upstroke — alveolar gas arrives" },
      { label: "Phase III", detail: "Alveolar plateau — EtCO₂ read at peak" },
      { label: "Phase 0",   detail: "Inspiration — CO₂ washed out to zero" },
    ],
    pearl: "Normal EtCO₂: 35–45 mmHg. EtCO₂ = PaCO₂ − 5–10 mmHg in normal physiology (dead space effect).",
  },
  {
    id: "obstructive-co2", label: "Obstructive — Shark Fin", color: "#fb923c",
    description: "Sloped 'shark fin' Phase III. No clear plateau. Hallmark of bronchospasm, asthma, COPD.",
    path: "M5,75 L20,75 L25,60 L35,35 L55,22 L75,20 L80,75 L125,75 L130,60 L140,35 L160,22 L180,20 L185,75 L215,75",
    phases: [
      { label: "Sloped Phase III", detail: "Uneven emptying from obstructed airways" },
      { label: "No plateau",       detail: "EtCO₂ still rising at cycle-off — underestimates true PaCO₂" },
    ],
    pearl: "Shark fin = obstructive. Treat bronchospasm. Widen I:E. EtCO₂ may significantly underestimate true PaCO₂ — blood gas required.",
  },
  {
    id: "rebreathing-co2", label: "Rebreathing — Elevated Baseline", color: "#f87171",
    description: "Baseline CO₂ above zero — patient rebreathing exhaled CO₂. Circuit malfunction or exhausted soda lime.",
    path: "M5,58 L20,58 L25,38 L70,32 L75,32 L80,58 L120,58 L125,38 L170,32 L175,32 L180,58 L215,58",
    phases: [
      { label: "Elevated baseline",   detail: "CO₂ present during inspiration — not zero" },
      { label: "Reduced ΔCO₂ swing", detail: "Smaller waveform amplitude" },
    ],
    pearl: "Check CO₂ absorber (soda lime). Check expiratory valve. Rule out oesophageal intubation (flat decaying waveform, not raised baseline).",
  },
  {
    id: "oesophageal-co2", label: "Oesophageal Intubation", color: "#ef4444",
    description: "Small irregular waveforms decaying rapidly to zero. No sustained CO₂. Confirms incorrect tube placement.",
    path: "M5,75 L20,75 L22,55 L30,52 L38,55 L40,75 L60,75 L62,65 L70,63 L78,65 L80,75 L100,75 L102,70 L110,69 L118,70 L120,75 L140,75 L215,75",
    phases: [
      { label: "Rapidly decaying",        detail: "CO₂ from stomach gas, not alveoli" },
      { label: "Flat after 4–6 breaths",  detail: "No sustained alveolar CO₂ production" },
    ],
    pearl: "Any sustained rectangular capnogram confirms endotracheal intubation. Flat/decaying waveform = oesophageal intubation. IMMEDIATELY reintubate.",
  },
  {
    id: "cpr-co2", label: "CPR — Low EtCO₂ + ROSC", color: "#a78bfa",
    description: "Low EtCO₂ during CPR reflects poor cardiac output. Sudden rise signals ROSC.",
    path: "M5,75 L20,75 L22,68 L35,67 L37,75 L60,75 L62,68 L75,67 L77,75 L100,75 L102,68 L115,67 L117,75 L140,75 L142,45 L160,42 L162,75 L190,75 L192,45 L210,42 L215,75",
    phases: [
      { label: "Low amplitude", detail: "Low CO₂ = poor cardiac output / pulmonary blood flow" },
      { label: "Sudden rise",   detail: "Abrupt ↑ EtCO₂ → ROSC — stop CPR and reassess" },
    ],
    pearl: "EtCO₂ <10 mmHg after 20 min CPR = poor survival. Sudden rise to >40 mmHg = likely ROSC. Use as real-time CPR quality and ROSC monitor.",
  },
  {
    id: "curare-co2", label: "Curare Notch — Dyssynchrony", color: "#facc15",
    description: "Notch in Phase III plateau caused by patient inspiratory effort during expiration. Waning NMB or patient fighting vent.",
    path: "M5,75 L20,75 L22,28 L65,22 L68,30 L72,22 L80,22 L82,75 L125,75 L127,28 L170,22 L173,30 L177,22 L185,22 L187,75 L215,75",
    phases: [
      { label: "Phase III notch",    detail: "Patient effort drops CO₂ momentarily during plateau" },
      { label: "Returns to plateau", detail: "Distinguishes from artifact — repeatable each breath" },
    ],
    pearl: "Curare notch = patient fighting vent. Check sedation (COMFORT-B target 11–17). Check NMB level. Adjust trigger sensitivity.",
  },
];

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────
function catConfig(category, isEtco2) {
  if (isEtco2)                  return { color: "#34d399", label: "EtCO₂" };
  if (category === "normal")    return { color: "#34d399", label: "NORMAL" };
  if (category === "maneuver")  return { color: "#fbbf24", label: "MANOEUVRE" };
  return { color: "#f87171", label: "ABNORMAL" };
}

// ─── STATIC WAVEFORM CARD ─────────────────────────────────────────────────────
function StaticWaveformCard({ w, isEtco2 = false }) {
  const { color: catColor, label: catLabel } = catConfig(w.category, isEtco2);

  // Choose a small Phosphor icon for the category badge
  const CatIcon = isEtco2
    ? Wind
    : w.category === "normal"
    ? CheckCircle
    : w.category === "maneuver"
    ? PauseCircle
    : SealWarning;

  return (
    <div style={{ background: "#0a0f14", border: "1px solid #1e2d3d", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "9px 12px", borderBottom: "1px solid #1e2d3d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0" }}>{w.label}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 8, letterSpacing: 2, color: catColor, textTransform: "uppercase" }}>
          <CatIcon size={10} weight="fill" style={{ color: catColor }} />
          {catLabel}
        </span>
      </div>
      <div style={{ padding: "8px 12px" }}>
        {isEtco2 ? (
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 8, color: w.color, letterSpacing: 1, textTransform: "uppercase", width: 36 }}>EtCO₂</span>
              <svg viewBox="0 0 220 85" style={{ flex: 1, height: 50, background: "#060d14", borderRadius: 4, border: "1px solid #0e1f2e" }}>
                {[20, 42, 63].map(y => <line key={y} x1="5" y1={y} x2="215" y2={y} stroke="#0d1f30" strokeWidth="0.8" />)}
                <line x1="5" y1="75" x2="215" y2="75" stroke="#1e3a52" strokeWidth="0.5" strokeDasharray="3,3" />
                <path d={w.path} fill="none" stroke={w.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 6 }}>
            {[
              { key: "pressure", label: "Paw" },
              { key: "flow",     label: "Flow" },
              { key: "volume",   label: "Vol" },
            ].map(row => (
              <div key={row.key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 8, color: w.svgTraces[row.key].color, letterSpacing: 1, textTransform: "uppercase", width: 28 }}>{row.label}</span>
                <svg viewBox="0 0 220 85" style={{ flex: 1, height: 40, background: "#060d14", borderRadius: 4, border: "1px solid #0e1f2e" }}>
                  {[20, 42, 63].map(y => <line key={y} x1="5" y1={y} x2="215" y2={y} stroke="#0d1f30" strokeWidth="0.8" />)}
                  {row.key === "flow" && <line x1="5" y1="60" x2="215" y2="60" stroke="#1e3a52" strokeWidth="0.5" strokeDasharray="3,3" />}
                  <path d={w.svgTraces[row.key].path} fill="none" stroke={w.svgTraces[row.key].color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  {w.annotation && row.key === "pressure" && (
                    <text x={82} y={12} fontSize="6.5" fill="#fbbf24">{w.annotation}</text>
                  )}
                </svg>
              </div>
            ))}
          </div>
        )}
        <p style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.55, marginBottom: 6 }}>{w.description}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {(isEtco2 ? w.phases : w.findings).map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 5, alignItems: "flex-start" }}>
              <ArrowRight size={9} weight="bold" style={{ color: catColor, flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 10, color: "#64748b" }}>
                {isEtco2
                  ? <><strong style={{ color: "#94a3b8" }}>{f.label}:</strong> {f.detail}</>
                  : f}
              </span>
            </div>
          ))}
        </div>
        {isEtco2 && w.pearl && (
          <div style={{ marginTop: 8, background: "#1a1000", borderRadius: 4, padding: "5px 8px", fontSize: 10, color: "#fbbf24", display: "flex", gap: 6, alignItems: "flex-start" }}>
            <Lightbulb size={11} weight="fill" style={{ color: "#fbbf24", flexShrink: 0, marginTop: 1 }} />
            {w.pearl}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function WaveformView() {
  const [mode, setMode]             = useState("vc-ac");
  const [scen, setScen]             = useState("normal");
  const [live, setLive]             = useState({ pip: 0, flow: 0, vol: 0, rr: 22 });
  const [holdState, setHoldState]   = useState(null);
  const [holdResult, setHoldResult] = useState(null);
  const [activeTab, setActiveTab]   = useState("live");

  const canvPRef = useRef(null);
  const canvFRef = useRef(null);
  const canvVRef = useRef(null);
  const stateRef       = useRef({ mode, scen, t: 0, bufIdx: 0, hold: null });
  const holdResultRef  = useRef(null);
  const holdSamplesRef = useRef(0);
  const animRef        = useRef(null);
  const tickRef        = useRef(0);

  const pressBuf = useRef(new Float32Array(HISTORY).fill(5));
  const flowBuf  = useRef(new Float32Array(HISTORY).fill(0));
  const volBuf   = useRef(new Float32Array(HISTORY).fill(0));

  useEffect(() => { stateRef.current.mode = mode; }, [mode]);
  useEffect(() => { stateRef.current.scen = scen; }, [scen]);
  useEffect(() => { stateRef.current.hold = holdState; }, [holdState]);

  const triggerHold = (type) => {
    if (holdState) {
      setHoldState(null);
      const r = holdResultRef.current;
      if (r) setHoldResult(r);
      holdResultRef.current  = null;
      holdSamplesRef.current = 0;
      return;
    }
    setHoldState(type);
    setHoldResult(null);
    holdResultRef.current  = null;
    holdSamplesRef.current = 0;
    setTimeout(() => {
      setHoldState(prev => {
        if (prev === type) {
          const r = holdResultRef.current;
          if (r) setHoldResult(r);
          holdResultRef.current  = null;
          holdSamplesRef.current = 0;
          return null;
        }
        return prev;
      });
    }, 4000);
  };

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
      const currentHold = stateRef.current.hold;

      for (let i = 0; i < steps; i++) {
        stateRef.current.t += DT;
        const smpl = generateSample(stateRef.current.t, stateRef.current.mode, stateRef.current.scen, currentHold);
        const bi = stateRef.current.bufIdx;
        pressBuf.current[bi] = smpl.pressure;
        flowBuf.current[bi]  = smpl.flow;
        volBuf.current[bi]   = smpl.volume;
        stateRef.current.bufIdx = (bi + 1) % HISTORY;

        if (currentHold) {
          holdSamplesRef.current++;
          if (holdSamplesRef.current > 60) {
            holdResultRef.current = { type: currentHold, pressure: Math.round(smpl.pressure * 10) / 10 };
          }
        }
      }

      const bi = stateRef.current.bufIdx;
      drawTrace(ctxP, pressBuf.current, bi, "#4ade80", 0,   55,  false, !!currentHold);
      drawTrace(ctxF, flowBuf.current,  bi, "#60a5fa", -55, 65,  true,  !!currentHold);
      drawTrace(ctxV, volBuf.current,   bi, "#f472b6", 0,   650, false, !!currentHold);

      tickRef.current++;
      if (tickRef.current % 12 === 0) {
        const lastP = pressBuf.current[(bi - 1 + HISTORY) % HISTORY];
        const lastF = flowBuf.current[(bi - 1 + HISTORY) % HISTORY];
        const lastV = volBuf.current[(bi - 1 + HISTORY) % HISTORY];
        const mv = MODES[stateRef.current.mode];
        setLive({ pip: Math.round(lastP), flow: Math.round(lastF), vol: Math.round(lastV), rr: mv.rr });
      }

      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = SCENARIOS[scen];
  const m = MODES[mode];
  const isAlarm = scen !== "normal";

  const getResult = () => {
    if (!holdResult) return null;
    const { type, pressure } = holdResult;
    const peepSet = m.peep * s.peepMult;
    if (type === "insp") {
      const pip  = m.pip * s.pipMult;
      const gap  = Math.round((pip - pressure) * 10) / 10;
      const driv = Math.round((pressure - peepSet) * 10) / 10;
      return {
        title: "Inspiratory Hold Result",
        values: [
          { label: "Plateau (Pplat)",    val: `${pressure} cmH₂O`, color: "#4ade80" },
          { label: "PIP",                val: `${Math.round(pip)} cmH₂O`, color: "#94a3b8" },
          { label: "Peak – Plateau gap", val: `${gap} cmH₂O`,     color: gap > 10 ? "#f87171" : "#4ade80" },
          { label: "Driving pressure",   val: `${driv} cmH₂O`,    color: driv > 15 ? "#f87171" : "#4ade80" },
        ],
        interpretation: gap > 10
          ? "↑ Peak–Plateau gap (>10 cmH₂O) → RESISTANCE problem. Consider bronchospasm, secretions, ETT kink."
          : driv > 15
          ? "↑ Driving pressure (>15 cmH₂O) → Reduce Vt. Risk of VILI."
          : "Normal mechanics. Plateau and driving pressure within target range.",
        color: (gap > 10 || driv > 15) ? "#f87171" : "#4ade80",
      };
    } else {
      const autoPeep = Math.round((pressure - peepSet) * 10) / 10;
      return {
        title: "Expiratory Hold Result",
        values: [
          { label: "Total PEEP",         val: `${pressure} cmH₂O`, color: "#4ade80" },
          { label: "Set PEEP",           val: `${Math.round(peepSet)} cmH₂O`, color: "#94a3b8" },
          { label: "Auto-PEEP (PEEPi)",  val: `${autoPeep} cmH₂O`, color: autoPeep >= 3 ? "#fb923c" : "#4ade80" },
        ],
        interpretation: autoPeep >= 3
          ? `Significant auto-PEEP (${autoPeep} cmH₂O). Reduce RR, extend I:E to 1:3–1:4, give bronchodilators.`
          : "Minimal intrinsic PEEP. Expiratory time appears adequate.",
        color: autoPeep >= 3 ? "#fb923c" : "#4ade80",
      };
    }
  };

  const result = getResult();

  const modeList = [
    { id: "vc-ac", label: "VC–AC" },
    { id: "pc-ac", label: "PC–AC" },
    { id: "prvc",  label: "PRVC"  },
    { id: "simv",  label: "SIMV+PS" },
    { id: "ps",    label: "PSV"   },
  ];
  const scenList = [
    { id: "normal",          label: "Normal"     },
    { id: "high-pip",        label: "↑ PIP"      },
    { id: "auto-peep",       label: "Auto-PEEP"  },
    { id: "low-vt",          label: "Leak"       },
    { id: "flow-starvation", label: "Flow starv."},
    { id: "dyssynch",        label: "Dyssynch"   },
    { id: "low-compliance",  label: "Low Cmpl"   },
  ];

  // Sub-tab button style
  const tabBtn = (id, Icon, label) => (
    <button onClick={() => setActiveTab(id)} style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "5px 12px", borderRadius: 5, cursor: "pointer",
      fontFamily: "inherit", fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
      border: `1px solid ${activeTab === id ? "#4a9eff" : "#1e3a52"}`,
      background: activeTab === id ? "#0d2137" : "#0e1922",
      color: activeTab === id ? "#4a9eff" : "#475569",
    }}>
      <Icon size={12} weight={activeTab === id ? "fill" : "regular"} />
      {label}
    </button>
  );

  // Small inline button style for mode/scenario
  const chipBtn = (isActive, isWarn) => ({
    background: isActive ? (isWarn ? "#1c0a00" : "#0d2137") : "#0e1922",
    border: `1px solid ${isActive ? (isWarn ? "#f97316" : "#4a9eff") : "#1e3a52"}`,
    color: isActive ? (isWarn ? "#fb923c" : "#4a9eff") : "#475569",
    padding: "3px 8px", borderRadius: 4, cursor: "pointer",
    fontSize: 9, letterSpacing: 1, textTransform: "uppercase", fontFamily: "inherit",
  });

  const normalWfs   = STATIC_WAVEFORMS.filter(w => w.category === "normal");
  const maneuverWfs = STATIC_WAVEFORMS.filter(w => w.category === "maneuver");
  const abnormalWfs = STATIC_WAVEFORMS.filter(w => w.category === "abnormal");

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800"
         style={{ background: "#0a0f14", fontFamily: '"JetBrains Mono", monospace' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Pulse size={13} style={{ color: "#4a9eff" }} />
          <span style={{ fontSize: 10, letterSpacing: 3, color: "#4a9eff", textTransform: "uppercase" }}>
            Ped·Resus — Vent Monitor
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 10, color: "#334155" }}>RR: {live.rr}/min</span>
          <div className="flex items-center gap-1.5">
            <span style={{
              width: 7, height: 7, borderRadius: "50%", display: "inline-block",
              background: holdState ? "#fbbf24" : isAlarm ? "#ef4444" : "#22c55e",
              animation: "vpulse 1s infinite",
            }} />
            <span style={{ fontSize: 10, color: holdState ? "#fbbf24" : isAlarm ? "#ef4444" : "#22c55e" }}>
              {holdState === "insp" ? "INSP HOLD"
                : holdState === "exp" ? "EXP HOLD"
                : isAlarm ? (s.alarm ? "ALARM" : "ASSESS")
                : "VENTILATING"}
            </span>
          </div>
        </div>
      </div>

      <style>{`@keyframes vpulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>

      <div className="p-4 space-y-4">

        {/* Sub-tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tabBtn("live",   Broadcast, "Live Waveforms")}
          {tabBtn("static", Books,     "Waveform Library")}
          {tabBtn("etco2",  Wind,      "EtCO₂")}
        </div>

        {/* ══════════ TAB 1: LIVE ══════════ */}
        {activeTab === "live" && (
          <>
            {/* Mode / Scenario */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 9, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>Mode</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {modeList.map(ml => (
                    <button key={ml.id} onClick={() => setMode(ml.id)}
                      style={chipBtn(mode === ml.id, false)}>
                      {ml.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>Scenario</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {scenList.map(sl => (
                    <button key={sl.id} onClick={() => setScen(sl.id)}
                      style={chipBtn(scen === sl.id, scen === sl.id && sl.id !== "normal")}>
                      {sl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hold Manoeuvres */}
            <div style={{ background: "#0e1116", border: "1px solid #1e3a52", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <PauseCircle size={11} weight="fill" style={{ color: "#4a9eff" }} />
                <span style={{ fontSize: 9, color: "#4a9eff", letterSpacing: 2, textTransform: "uppercase" }}>Hold Manoeuvres</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
                <button onClick={() => triggerHold("insp")} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: holdState === "insp" ? "#1a3a00" : "#0e1922",
                  border: `1px solid ${holdState === "insp" ? "#fbbf24" : "#1e3a52"}`,
                  color: holdState === "insp" ? "#fbbf24" : "#4ade80",
                  padding: "7px 14px", borderRadius: 5, cursor: "pointer",
                  fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontFamily: "inherit", fontWeight: 600,
                }}>
                  {holdState === "insp"
                    ? <><StopCircle size={13} weight="fill" /> Release</>
                    : <><PauseCircle size={13} weight="fill" /> Inspiratory Hold</>}
                </button>
                <button onClick={() => triggerHold("exp")} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: holdState === "exp" ? "#1a0a00" : "#0e1922",
                  border: `1px solid ${holdState === "exp" ? "#fbbf24" : "#1e3a52"}`,
                  color: holdState === "exp" ? "#fbbf24" : "#60a5fa",
                  padding: "7px 14px", borderRadius: 5, cursor: "pointer",
                  fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontFamily: "inherit", fontWeight: 600,
                }}>
                  {holdState === "exp"
                    ? <><StopCircle size={13} weight="fill" /> Release</>
                    : <><PauseCircle size={13} weight="fill" /> Expiratory Hold</>}
                </button>
                <span style={{ fontSize: 9, color: "#334155", lineHeight: 1.5 }}>
                  4 s · auto-releases · waveform turns <span style={{ color: "#fbbf24" }}>amber</span>
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "#060d14", borderRadius: 6, padding: "8px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <ArrowsIn size={10} weight="bold" style={{ color: "#4ade80" }} />
                    <span style={{ fontSize: 9, color: "#4ade80", letterSpacing: 1, textTransform: "uppercase" }}>Insp Hold → Plateau</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.6 }}>
                    Occludes expiratory valve. No flow → pressure equilibrates to alveolar pressure.
                    <strong style={{ color: "#94a3b8" }}> Peak − Plateau &gt;10</strong> = resistance ↑.
                    <strong style={{ color: "#94a3b8" }}> Driving pressure &gt;15</strong> = reduce Vt.
                  </div>
                </div>
                <div style={{ background: "#060d14", borderRadius: 6, padding: "8px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <ArrowsOut size={10} weight="bold" style={{ color: "#60a5fa" }} />
                    <span style={{ fontSize: 9, color: "#60a5fa", letterSpacing: 1, textTransform: "uppercase" }}>Exp Hold → Auto-PEEP</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.6 }}>
                    Occludes inspiratory valve at end-expiration. Rise above set PEEP = intrinsic PEEP.
                    <strong style={{ color: "#94a3b8" }}> PEEPi ≥3 cmH₂O</strong> = significant air trapping.
                  </div>
                </div>
              </div>
            </div>

            {/* Hold Result */}
            {result && (
              <div style={{ background: "#0e1116", border: `1px solid ${result.color}44`, borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <ChartLine size={11} weight="fill" style={{ color: result.color }} />
                  <span style={{ fontSize: 9, color: result.color, letterSpacing: 2, textTransform: "uppercase" }}>{result.title}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  {result.values.map((v, i) => (
                    <div key={i} style={{ background: "#060d14", borderRadius: 6, padding: "6px 10px", border: "1px solid #1e2d3d" }}>
                      <div style={{ fontSize: 8, color: "#475569", letterSpacing: 1, textTransform: "uppercase" }}>{v.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: v.color, lineHeight: 1.2 }}>{v.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 10, color: result.color, background: "#060d14", borderRadius: 4, padding: "6px 10px", borderLeft: `2px solid ${result.color}` }}>
                  <ArrowRight size={11} weight="bold" style={{ flexShrink: 0, marginTop: 2 }} />
                  {result.interpretation}
                </div>
              </div>
            )}

            {/* Alarm panel */}
            {isAlarm && (
              <div style={{ background: "#0e1116", border: "1px solid #7c2d12", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <SealWarning size={13} weight="fill" style={{ color: "#ef4444" }} />
                  <span style={{ fontSize: 9, color: "#f97316", letterSpacing: 2, textTransform: "uppercase" }}>{s.alarmTitle}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                  {s.causes.map((c, i) => (
                    <span key={i} style={{ background: "#1c0a00", border: "1px solid #7c2d12", color: "#fb923c", fontSize: 10, padding: "2px 7px", borderRadius: 4 }}>{c}</span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.65, borderLeft: "2px solid #f97316", paddingLeft: 10, marginBottom: 6 }}>{s.action}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 10, color: "#fbbf24", background: "#1a1000", borderRadius: 4, padding: "5px 8px" }}>
                  <Lightbulb size={11} weight="fill" style={{ color: "#fbbf24", flexShrink: 0, marginTop: 1 }} />
                  {s.pearl}
                </div>
              </div>
            )}

            {/* Live canvases */}
            <div style={{ display: "grid", gap: 4 }}>
              {[
                { ref: canvPRef, label: "Paw",  unit: "cmH₂O", val: live.pip,  color: "#4ade80" },
                { ref: canvFRef, label: "Flow", unit: "L/min",  val: live.flow, color: "#60a5fa" },
                { ref: canvVRef, label: "Vol",  unit: "mL",     val: live.vol,  color: "#f472b6" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 52, flexShrink: 0 }}>
                    <div style={{ fontSize: 9, color: row.color, letterSpacing: 1, textTransform: "uppercase" }}>{row.label}</div>
                    <div style={{ fontSize: 8, color: "#334155" }}>{row.unit}</div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: holdState ? "#fbbf24" : row.color, marginTop: 1 }}>{row.val}</div>
                  </div>
                  <canvas ref={row.ref} style={{ flex: 1, height: 90, borderRadius: 4, border: "1px solid #0e1f2e", display: "block" }} />
                </div>
              ))}
            </div>

            {/* Numerics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
              {[
                { label: "PIP",    val: Math.round(m.pip  * s.pipMult),  unit: "cmH₂O", color: "#4ade80" },
                { label: "PEEP",   val: Math.round(m.peep * s.peepMult), unit: "cmH₂O", color: "#4ade80" },
                { label: "Vt exp", val: Math.round(m.vt   * s.vtMult),   unit: "mL",    color: "#f472b6" },
                { label: "RR set", val: m.rr,                             unit: "/min",  color: "#e2e8f0" },
              ].map(p => (
                <div key={p.label} style={{ background: "#0e1922", border: "1px solid #1e2d3d", borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>{p.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 500, color: p.color, lineHeight: 1 }}>{p.val}</div>
                  <div style={{ fontSize: 9, color: "#334155", marginTop: 2 }}>{p.unit}</div>
                </div>
              ))}
            </div>

            {/* Mode note */}
            <div style={{ background: "#060d14", border: "1px solid #1e2d3d", borderRadius: 6, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <Stethoscope size={12} style={{ color: "#4a9eff", flexShrink: 0, marginTop: 2 }} />
              <div>
                <span style={{ fontSize: 9, color: "#4a9eff", letterSpacing: 2, textTransform: "uppercase" }}>{m.label}</span>
                <span style={{ color: "#1e3a52", margin: "0 8px" }}>|</span>
                <span style={{ fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>{m.note}</span>
              </div>
            </div>
          </>
        )}

        {/* ══════════ TAB 2: STATIC LIBRARY ══════════ */}
        {activeTab === "static" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 10, color: "#475569", lineHeight: 1.6 }}>
              Reference pressure–flow–volume scalar graphics. Each shows 2 breath cycles with key diagnostic features.
            </p>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <CheckCircle size={11} weight="fill" style={{ color: "#34d399" }} />
                <span style={{ fontSize: 9, color: "#34d399", letterSpacing: 2, textTransform: "uppercase" }}>Normal Patterns</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {normalWfs.map(w => <StaticWaveformCard key={w.id} w={w} />)}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <PauseCircle size={11} weight="fill" style={{ color: "#fbbf24" }} />
                <span style={{ fontSize: 9, color: "#fbbf24", letterSpacing: 2, textTransform: "uppercase" }}>Hold Manoeuvres</span>
              </div>
              <div style={{ background: "#0e1116", border: "1px solid #3a2f00", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <Lightbulb size={11} weight="fill" style={{ color: "#fbbf24" }} />
                  <span style={{ fontSize: 10, color: "#fbbf24" }}>How to perform on a real ventilator</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.65 }}>
                    <strong style={{ color: "#94a3b8" }}>Inspiratory Hold (Drager/Maquet):</strong> Press and hold Insp-Hold button at any point in the breath. Patient must be passive. Hold 0.3–0.5 s. Plateau appears on pressure scalar. Read from vent display before releasing.
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.65 }}>
                    <strong style={{ color: "#94a3b8" }}>Expiratory Hold:</strong> Press Exp-Hold at end-expiration. Hold 3–5 s. Read total PEEP. Subtract set PEEP = auto-PEEP (PEEPi). Disconnect briefly in severe asthma if haemodynamically compromised.
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {maneuverWfs.map(w => <StaticWaveformCard key={w.id} w={w} />)}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <SealWarning size={11} weight="fill" style={{ color: "#f87171" }} />
                <span style={{ fontSize: 9, color: "#f87171", letterSpacing: 2, textTransform: "uppercase" }}>Abnormal Patterns</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {abnormalWfs.map(w => <StaticWaveformCard key={w.id} w={w} />)}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ TAB 3: ETCO2 ══════════ */}
        {activeTab === "etco2" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Intro */}
            <div style={{ background: "#0e1116", border: "1px solid #1e3a52", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Wind size={11} weight="fill" style={{ color: "#4a9eff" }} />
                <span style={{ fontSize: 9, color: "#4a9eff", letterSpacing: 2, textTransform: "uppercase" }}>Capnography — Clinical Overview</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8, marginBottom: 10 }}>
                {[
                  { label: "Normal EtCO₂",       val: "35–45",        unit: "mmHg",           color: "#34d399" },
                  { label: "EtCO₂ – PaCO₂ gap",  val: "5–10",         unit: "mmHg",           color: "#60a5fa" },
                  { label: "CPR poor prognosis",  val: "<10",          unit: "mmHg at 20 min", color: "#f87171" },
                  { label: "ROSC signal",         val: ">40 sudden ↑", unit: "mmHg",           color: "#a78bfa" },
                ].map(p => (
                  <div key={p.label} style={{ background: "#060d14", borderRadius: 6, padding: "8px 10px", border: "1px solid #1e2d3d" }}>
                    <div style={{ fontSize: 8, color: "#475569", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{p.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: p.color, lineHeight: 1 }}>{p.val}</div>
                    <div style={{ fontSize: 8, color: "#334155", marginTop: 2 }}>{p.unit}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 10, color: "#64748b", lineHeight: 1.7 }}>
                Capnography measures CO₂ in exhaled gas over time. Uses: ETT position confirmation, ventilation monitoring, CPR quality, ROSC detection, sedation monitoring, and metabolic assessment.
              </p>
            </div>

            {/* Four phases */}
            <div style={{ background: "#0e1116", border: "1px solid #1e3a52", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Waveform size={11} weight="fill" style={{ color: "#34d399" }} />
                <span style={{ fontSize: 9, color: "#34d399", letterSpacing: 2, textTransform: "uppercase" }}>The Four Phases of a Normal Capnogram</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 8 }}>
                {[
                  { phase: "Phase I",   sub: "Anatomical dead space", color: "#60a5fa", detail: "Exhaled gas from trachea and large airways. CO₂ ≈ 0 mmHg. Duration reflects dead space volume." },
                  { phase: "Phase II",  sub: "Expiratory upstroke",   color: "#4ade80", detail: "Rapid rise — mixing of dead space and alveolar gas. Slope reflects heterogeneity of lung emptying." },
                  { phase: "Phase III", sub: "Alveolar plateau",      color: "#fbbf24", detail: "CO₂-rich alveolar gas. EtCO₂ read at END. Steep slope or 'shark fin' = obstructive disease." },
                  { phase: "Phase 0",   sub: "Inspiration",           color: "#f472b6", detail: "Fresh gas washes CO₂ to zero. Elevated baseline (>0) = rebreathing. Failure to zero = circuit problem." },
                ].map(p => (
                  <div key={p.phase} style={{ background: "#060d14", borderRadius: 6, padding: "8px 10px", border: "1px solid #1e2d3d" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: p.color }}>{p.phase}</div>
                    <div style={{ fontSize: 9, color: "#475569", marginBottom: 4, letterSpacing: 1 }}>{p.sub}</div>
                    <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.55 }}>{p.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* EtCO2 waveform cards */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Pulse size={11} weight="fill" style={{ color: "#94a3b8" }} />
                <span style={{ fontSize: 9, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase" }}>Capnogram Patterns — Recognition &amp; Response</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {ETCO2_WAVEFORMS.map(w => <StaticWaveformCard key={w.id} w={w} isEtco2 />)}
              </div>
            </div>

            {/* Trend table */}
            <div style={{ background: "#0e1116", border: "1px solid #1e3a52", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <ChartLine size={11} weight="fill" style={{ color: "#4a9eff" }} />
                <span style={{ fontSize: 9, color: "#4a9eff", letterSpacing: 2, textTransform: "uppercase" }}>EtCO₂ Trend Interpretation</span>
              </div>
              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1.5fr", gap: 8, marginBottom: 4, padding: "0 10px" }}>
                {["Finding", "Causes", "Action"].map(h => (
                  <span key={h} style={{ fontSize: 8, color: "#334155", letterSpacing: 2, textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  { finding: "EtCO₂ → 0 suddenly",      cause: "ETT dislodgement, circuit disconnect, cardiac arrest",      action: "Bag manually. DOPE. Check ETT.",                     color: "#ef4444" },
                  { finding: "EtCO₂ gradually ↓",       cause: "Hyperventilation, ↓ CO, PE, ↓ metabolism",                  action: "Reduce RR if iatrogenic. Haemodynamics. ABG.",        color: "#f97316" },
                  { finding: "EtCO₂ gradually ↑",       cause: "Hypoventilation, fever, sepsis, ↑ CO₂ production",          action: "Increase RR/Vt. Treat fever. ABG.",                  color: "#f97316" },
                  { finding: "EtCO₂ sudden ↑",          cause: "ROSC, NaHCO₃ given, ↑ cardiac output",                     action: "If CPR: stop and check pulse. Consider ROSC.",       color: "#a78bfa" },
                  { finding: "Widened EtCO₂–PaCO₂ gap", cause: "↑ Dead space: PE, ↓ CO, hypovolaemia, high PEEP",           action: "ABG mandatory. Investigate dead space physiology.",  color: "#fbbf24" },
                  { finding: "Shark fin waveform",       cause: "Bronchospasm, asthma, COPD, bronchiolitis",                 action: "Bronchodilators. Extend Te. Adjust I:E.",            color: "#fb923c" },
                  { finding: "Elevated baseline",        cause: "Rebreathing — exhausted soda lime, stuck expiratory valve", action: "Change CO₂ absorber. Check circuit valves.",         color: "#60a5fa" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1.5fr", gap: 8, background: "#060d14", borderRadius: 6, padding: "7px 10px", borderLeft: `2px solid ${r.color}` }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                      <Warning size={9} weight="fill" style={{ color: r.color, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 10, color: r.color, fontWeight: 600 }}>{r.finding}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>{r.cause}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{r.action}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 9, color: "#1e3a52", letterSpacing: 1 }}>
          <Stethoscope size={10} style={{ color: "#1e3a52" }} />
          Tintinalli · BTS/ATS · PEMVECC 2017 · OpenPediatrics · Bhavani-Shankar capnography atlas · schematic for teaching
        </div>
      </div>
    </div>
  );
}
