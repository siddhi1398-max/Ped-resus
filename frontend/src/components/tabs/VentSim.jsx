import { useEffect, useRef, useState, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SAMPLE_RATE = 200;
const WINDOW_S = 6;
const HISTORY = SAMPLE_RATE * WINDOW_S;

// ─── PATIENT SIMULATION SCENARIOS ─────────────────────────────────────────────
const PATIENT_SCENARIOS = [
  {
    id: "healthy-child",
    label: "Healthy 10kg Child",
    description: "Post-intubation for airway protection. Good lung compliance.",
    weight: 10, age: "1yr",
    settings: { pip: 20, peep: 5, rr: 28, vt: 80, fio2: 40, ie: 0.33, flow: 8 },
    physiology: { compliance: 1.0, resistance: 1.0, autopeep: 0, leak: 0, dyssynch: false, starvation: false },
    alarm: null,
    badge: "emerald",
  },
  {
    id: "ards-15kg",
    label: "ARDS — 15kg",
    description: "Severe ARDS. Stiff lungs. Needs lung-protective ventilation.",
    weight: 15, age: "3yr",
    settings: { pip: 32, peep: 12, rr: 35, vt: 75, fio2: 80, ie: 0.33, flow: 10 },
    physiology: { compliance: 0.3, resistance: 1.0, autopeep: 0, leak: 0, dyssynch: false, starvation: false },
    alarm: "HIGH PIP + HIGH PLATEAU → LOW COMPLIANCE",
    badge: "red",
  },
  {
    id: "asthma-25kg",
    label: "Asthma — 25kg",
    description: "Severe bronchospasm. Auto-PEEP developing. High airway resistance.",
    weight: 25, age: "7yr",
    settings: { pip: 38, peep: 5, rr: 28, vt: 175, fio2: 50, ie: 0.25, flow: 12 },
    physiology: { compliance: 1.0, resistance: 3.5, autopeep: 8, leak: 0, dyssynch: false, starvation: false },
    alarm: "HIGH PIP (RESISTANCE) + AUTO-PEEP",
    badge: "amber",
  },
  {
    id: "cuff-leak",
    label: "Cuff Leak — 20kg",
    description: "ETT cuff deflated. Audible gurgling. Low exhaled Vt.",
    weight: 20, age: "5yr",
    settings: { pip: 22, peep: 5, rr: 22, vt: 140, fio2: 45, ie: 0.33, flow: 9 },
    physiology: { compliance: 1.0, resistance: 1.0, autopeep: 0, leak: 0.5, dyssynch: false, starvation: false },
    alarm: "LOW Vt — CIRCUIT LEAK",
    badge: "orange",
  },
  {
    id: "flow-starvation",
    label: "Flow Starvation — 30kg",
    description: "VC mode with peak flow too low. Patient fighting for breath.",
    weight: 30, age: "10yr",
    settings: { pip: 24, peep: 5, rr: 20, vt: 210, fio2: 40, ie: 0.33, flow: 6 },
    physiology: { compliance: 1.0, resistance: 1.0, autopeep: 0, leak: 0, dyssynch: false, starvation: true },
    alarm: "FLOW STARVATION — VC MODE",
    badge: "yellow",
  },
  {
    id: "dyssynch",
    label: "Dyssynchrony — 18kg",
    description: "Inadequate sedation. Patient fighting vent. Irregular waveforms.",
    weight: 18, age: "4yr",
    settings: { pip: 26, peep: 6, rr: 24, vt: 126, fio2: 45, ie: 0.33, flow: 10 },
    physiology: { compliance: 1.0, resistance: 1.0, autopeep: 0, leak: 0, dyssynch: true, starvation: false },
    alarm: "PATIENT–VENTILATOR DYSSYNCHRONY",
    badge: "violet",
  },
  {
    id: "pneumothorax",
    label: "Tension PTX — 12kg",
    description: "Sudden ↑PIP, ↓Vt, haemodynamic compromise. Right-sided PTX.",
    weight: 12, age: "18mo",
    settings: { pip: 42, peep: 5, rr: 30, vt: 50, fio2: 100, ie: 0.33, flow: 8 },
    physiology: { compliance: 0.2, resistance: 1.8, autopeep: 0, leak: 0, dyssynch: false, starvation: false },
    alarm: "HIGH PIP + LOW Vt → CONSIDER PTX",
    badge: "red",
  },
  {
    id: "custom",
    label: "Custom Patient",
    description: "Manually configure all parameters.",
    weight: 20, age: "",
    settings: { pip: 25, peep: 5, rr: 22, vt: 140, fio2: 40, ie: 0.33, flow: 9 },
    physiology: { compliance: 1.0, resistance: 1.0, autopeep: 0, leak: 0, dyssynch: false, starvation: false },
    alarm: null,
    badge: "slate",
  },
];

const MODES = {
  "vc-ac": { label: "VC–AC", note: "Square flow → ramp pressure. Vt guaranteed." },
  "pc-ac": { label: "PC–AC", note: "Pressure constant → decelerating flow. Vt varies with compliance." },
  "prvc":  { label: "PRVC",  note: "Decelerating flow. Pressure auto-adjusts to hit Vt target." },
  "simv":  { label: "SIMV+PS", note: "Mandatory + spontaneous PS breaths." },
  "ps":    { label: "PSV",   note: "Fully patient-triggered, flow-cycled." },
};

const BADGE_COLORS = {
  emerald: "#10b981", red: "#ef4444", amber: "#f59e0b",
  orange: "#f97316", yellow: "#eab308", violet: "#8b5cf6",
  slate: "#64748b",
};

// ─── SAMPLE GENERATOR ─────────────────────────────────────────────────────────
function generateSample(t, modeKey, settings, physiology, holdState) {
  const { pip, peep, rr, vt } = settings;
  const { compliance: C, resistance: R, autopeep, leak, dyssynch, starvation } = physiology;

  const period = 60 / rr;
  const tInPeriod = ((t % period) + period) % period;
  const ieRatio = settings.ie || 0.33;
  const ti = period * ieRatio / (1 + ieRatio);
  const inInsp = tInPeriod < ti;
  const inspPhase = inInsp ? tInPeriod / ti : 0;
  const expPhase = !inInsp ? (tInPeriod - ti) / (period - ti) : 0;

  if (holdState === "insp") {
    const plateau = peep + (vt / 50) * (1 / C);
    return {
      pressure: Math.min(plateau, pip) + (Math.random() - 0.5) * 0.15,
      flow: (Math.random() - 0.5) * 0.3,
      volume: vt * 0.98,
      isHold: true,
    };
  }

  if (holdState === "exp") {
    const trapped = peep + autopeep;
    return {
      pressure: trapped + (Math.random() - 0.5) * 0.15,
      flow: (Math.random() - 0.5) * 0.2,
      volume: autopeep > 0 ? vt * 0.08 : 0,
      isHold: true,
    };
  }

  let pressure = peep, flow = 0, volume = 0;
  const isVC = modeKey === "vc-ac" || modeKey === "simv";

  if (isVC) {
    if (inInsp) {
      flow = 40;
      const elasticP = peep + (vt * inspPhase) / (50 * C);
      const resistiveP = flow * R * 0.18;
      pressure = starvation
        ? elasticP + resistiveP - 8 * Math.sin(Math.PI * inspPhase)
        : elasticP + resistiveP;
      volume = vt * inspPhase;
    } else {
      const tau = R * C * 0.55;
      flow = -(vt / (50 * Math.max(tau, 0.3))) * Math.exp(-expPhase / Math.max(tau, 0.3)) * 28;
      if (autopeep > 0 && expPhase > 0.7)
        flow *= 1 - ((expPhase - 0.7) / 0.3) * 0.85;
      pressure = peep + autopeep * Math.exp(-expPhase * 3) + (pip - peep) * Math.exp(-expPhase * 6);
      volume = vt * Math.max(0, 1 - (1 - Math.exp(-expPhase / Math.max(tau, 0.3))) * (1 + leak));
    }
  } else {
    if (inInsp) {
      const driveP = pip - peep;
      pressure = peep + driveP * (1 - Math.exp(-inspPhase * 8 / (R * C)));
      flow = (driveP / (R * C)) * Math.exp(-inspPhase * 4) * 14 * C;
      volume = vt * (1 - Math.exp(-inspPhase * 6 / (R * C))) / (1 - Math.exp(-6 / (R * C)));
    } else {
      const tau = R * C * 0.55;
      pressure = peep + autopeep * Math.exp(-expPhase * 3) + (pip - peep) * Math.exp(-expPhase * 8);
      flow = -28 * C * Math.exp(-expPhase / Math.max(tau, 0.3));
      if (autopeep > 0 && expPhase > 0.75)
        flow *= 1 - ((expPhase - 0.75) / 0.25) * 0.9;
      volume = vt * Math.max(0, 1 - expPhase * (1 + leak));
    }
  }

  if (dyssynch) {
    const dPhase = (t * 1.3) % 1;
    if (dPhase > 0.85 && dPhase < 0.95) {
      const dp = Math.sin(((dPhase - 0.85) / 0.1) * Math.PI);
      flow += 12 * dp;
      pressure += 4 * dp;
    }
    if (Math.random() < 0.003) flow += (Math.random() - 0.5) * 18;
  }

  return {
    pressure: Math.max(peep - 0.5, pressure) + (Math.random() - 0.5) * 0.25,
    flow: (flow || 0) + (Math.random() - 0.5) * 0.6,
    volume: Math.max(0, volume || 0),
    isHold: false,
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
    ctx.fillRect(W * 0.65, 0, W * 0.35, H);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(W * 0.65, 0); ctx.lineTo(W * 0.65, H); ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.strokeStyle = holdActive ? "#fbbf24" : color;
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
  ctx.fillStyle = holdActive ? "#fbbf24" : color;
  ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2); ctx.fill();
}

// ─── SLIDER CONTROL ───────────────────────────────────────────────────────────
function Slider({ label, unit, value, min, max, step, onChange, color = "#4a9eff", alert }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontSize: 9, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</span>
        <span style={{
          fontSize: 16, fontWeight: 700, lineHeight: 1,
          color: alert ? "#ef4444" : color,
          fontFamily: '"JetBrains Mono", monospace',
        }}>
          {value}<span style={{ fontSize: 9, color: "#475569", marginLeft: 3, fontWeight: 400 }}>{unit}</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 4, background: "#1e2d3d", borderRadius: 2 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: alert ? "#ef4444" : color, borderRadius: 2, transition: "width 0.1s" }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{
            position: "absolute", top: "50%", left: 0, width: "100%", height: 16,
            transform: "translateY(-50%)", opacity: 0, cursor: "pointer", margin: 0,
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontSize: 8, color: "#1e3a52" }}>{min}</span>
        <span style={{ fontSize: 8, color: "#1e3a52" }}>{max}</span>
      </div>
    </div>
  );
}

// ─── TOGGLE SWITCH ────────────────────────────────────────────────────────────
function Toggle({ label, value, onChange, color = "#4a9eff" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
      <span style={{ fontSize: 10, color: "#64748b" }}>{label}</span>
      <div onClick={() => onChange(!value)} style={{
        width: 34, height: 18, borderRadius: 9,
        background: value ? color : "#1e2d3d",
        position: "relative", cursor: "pointer", transition: "background 0.2s",
      }}>
        <div style={{
          position: "absolute", top: 2, left: value ? 16 : 2,
          width: 14, height: 14, borderRadius: 7,
          background: "#fff", transition: "left 0.2s",
        }} />
      </div>
    </div>
  );
}

// ─── ALARM PANEL ─────────────────────────────────────────────────────────────
const ALARM_DATA = {
  "HIGH PIP + HIGH PLATEAU → LOW COMPLIANCE": {
    color: "#ef4444",
    causes: ["ARDS / diffuse alveolar damage", "Pulmonary oedema", "Pneumothorax", "Over-distension"],
    action: "Lung-protective: reduce Vt to 4–6 mL/kg PBW. Check plateau (insp hold). Target plateau ≤30, driving pressure ≤15 cmH₂O.",
    pearl: "Peak–Plateau gap SMALL (<5 cmH₂O) = compliance problem. Both elevated together = stiff lung, not airway resistance.",
    interpret: "insp-hold",
  },
  "HIGH PIP (RESISTANCE) + AUTO-PEEP": {
    color: "#f59e0b",
    causes: ["Bronchospasm — asthma, bronchiolitis", "Secretions / mucus plugging", "ETT kink", "Inadequate expiratory time"],
    action: "DOPE check. Suction ETT. Bronchodilators. Reduce RR, extend I:E to 1:3–1:4. Expiratory hold to quantify auto-PEEP.",
    pearl: "Peak–Plateau gap >10 cmH₂O = RESISTANCE problem. Distinct from compliance. Plateau should be near-normal.",
    interpret: "both-holds",
  },
  "LOW Vt — CIRCUIT LEAK": {
    color: "#f97316",
    causes: ["ETT cuff deflated (audible gurgling)", "Circuit disconnection or crack", "ETT dislodgement", "Large bronchopleural fistula"],
    action: "Check ETT depth at lips. Inflate cuff to 20–25 cmH₂O. Inspect all circuit connections. Observe bilateral chest rise.",
    pearl: "Volume scalar is key: expiratory limb does not return to zero = circuit leak. In PC mode, same PIP with lower Vt = leak OR ↓compliance.",
    interpret: null,
  },
  "FLOW STARVATION — VC MODE": {
    color: "#eab308",
    causes: ["Peak flow set too low for patient demand", "High respiratory drive", "Inadequate analgosedation"],
    action: "Increase peak flow rate. Switch to decelerating flow (PC/PRVC). Optimise sedation + analgesia (fentanyl + midazolam).",
    pearl: "Pressure scalar shows characteristic 'scooped' concave dip mid-inspiration. Only visible in VC with square flow pattern.",
    interpret: null,
  },
  "PATIENT–VENTILATOR DYSSYNCHRONY": {
    color: "#8b5cf6",
    causes: ["Inadequate sedation/analgesia", "Inappropriate trigger sensitivity", "Auto-PEEP → missed triggers", "Wrong inspiratory time"],
    action: "Optimise fentanyl (1–4 mcg/kg/hr) + midazolam (0.05–0.2 mg/kg/hr). Adjust flow trigger to 1–3 L/min. Check for auto-PEEP. Switch to PRVC or PS.",
    pearl: "Look for: double triggers, reverse triggering, premature cycling. COMFORT-B target 11–17. Avoid NMB unless severe ARDS.",
    interpret: null,
  },
  "HIGH PIP + LOW Vt → CONSIDER PTX": {
    color: "#ef4444",
    causes: ["Tension pneumothorax", "Main-stem intubation", "Massive atelectasis", "Mucus plugging with collapse"],
    action: "DOPE + immediate auscultation. Bedside lung US (absent sliding = PTX). If tension: needle decompression 2nd ICS MCL → chest drain.",
    pearl: "Tension PTX = obstructive shock. Don't wait for CXR if haemodynamically compromised. Tracheal deviation is a late sign in children.",
    interpret: "insp-hold",
  },
  "HIGH PIP (RESISTANCE) + AUTO-PEEP": {
    color: "#f59e0b",
    causes: ["Bronchospasm", "Secretions", "High RR / short Te"],
    action: "Reduce RR. Bronchodilators. Expiratory hold to measure auto-PEEP.",
    pearl: "Peak–Plateau gap >10 = resistance. Expiratory hold shows trapped PEEP.",
    interpret: "exp-hold",
  },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function VentSim() {
  const [selectedScenario, setSelectedScenario] = useState("healthy-child");
  const [mode, setMode] = useState("vc-ac");
  const [settings, setSettings] = useState(PATIENT_SCENARIOS[0].settings);
  const [physiology, setPhysiology] = useState(PATIENT_SCENARIOS[0].physiology);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [holdState, setHoldState] = useState(null);
  const [holdResult, setHoldResult] = useState(null);
  const [live, setLive] = useState({ pip: 0, flow: 0, vol: 0 });
  const [panel, setPanel] = useState("scenario"); // scenario | settings | physiology
  const [alarmDismissed, setAlarmDismissed] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  const canvPRef = useRef(null);
  const canvFRef = useRef(null);
  const canvVRef = useRef(null);
  const stateRef = useRef({ t: 0, bufIdx: 0, mode, settings, physiology, hold: null });
  const holdResultRef = useRef(null);
  const holdSamplesRef = useRef(0);
  const animRef = useRef(null);
  const tickRef = useRef(0);
  const pressBuf = useRef(new Float32Array(HISTORY).fill(5));
  const flowBuf = useRef(new Float32Array(HISTORY).fill(0));
  const volBuf = useRef(new Float32Array(HISTORY).fill(0));

  useEffect(() => { stateRef.current.mode = mode; }, [mode]);
  useEffect(() => { stateRef.current.settings = settings; }, [settings]);
  useEffect(() => { stateRef.current.physiology = physiology; }, [physiology]);
  useEffect(() => { stateRef.current.hold = holdState; }, [holdState]);

  const loadScenario = useCallback((id) => {
    const sc = PATIENT_SCENARIOS.find(s => s.id === id);
    if (!sc) return;
    setSelectedScenario(id);
    setSettings({ ...sc.settings });
    setPhysiology({ ...sc.physiology });
    setActiveAlarm(sc.alarm);
    setAlarmDismissed(false);
    setHoldResult(null);
    setHoldState(null);
    setShowTroubleshoot(false);
  }, []);

  const triggerHold = useCallback((type) => {
    if (holdState) {
      setHoldState(null);
      const r = holdResultRef.current;
      if (r) setHoldResult(r);
      holdResultRef.current = null;
      holdSamplesRef.current = 0;
      return;
    }
    setHoldState(type);
    setHoldResult(null);
    holdResultRef.current = null;
    holdSamplesRef.current = 0;
    setTimeout(() => {
      setHoldState(prev => {
        if (prev === type) {
          const r = holdResultRef.current;
          if (r) setHoldResult(r);
          holdResultRef.current = null;
          holdSamplesRef.current = 0;
          return null;
        }
        return prev;
      });
    }, 4000);
  }, [holdState]);

  useEffect(() => {
    const cP = canvPRef.current;
    const cF = canvFRef.current;
    const cV = canvVRef.current;
    if (!cP || !cF || !cV) return;

    const resize = () => {
      [cP, cF, cV].forEach(c => {
        c.width = c.offsetWidth || 520;
        c.height = c.offsetHeight || 80;
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
        const smpl = generateSample(
          stateRef.current.t,
          stateRef.current.mode,
          stateRef.current.settings,
          stateRef.current.physiology,
          currentHold
        );
        const bi = stateRef.current.bufIdx;
        pressBuf.current[bi] = smpl.pressure;
        flowBuf.current[bi] = smpl.flow;
        volBuf.current[bi] = smpl.volume;
        stateRef.current.bufIdx = (bi + 1) % HISTORY;

        if (currentHold) {
          holdSamplesRef.current++;
          if (holdSamplesRef.current > 60) {
            holdResultRef.current = { type: currentHold, pressure: Math.round(smpl.pressure * 10) / 10 };
          }
        }
      }

      const bi = stateRef.current.bufIdx;
      const pipMax = stateRef.current.settings.pip * 1.5;
      drawTrace(ctxP, pressBuf.current, bi, "#4ade80", 0, Math.max(pipMax, 40), false, !!currentHold);
      drawTrace(ctxF, flowBuf.current, bi, "#60a5fa", -60, 60, true, !!currentHold);
      drawTrace(ctxV, volBuf.current, bi, "#f472b6", 0, Math.max(stateRef.current.settings.vt * 1.5, 200), false, !!currentHold);

      tickRef.current++;
      if (tickRef.current % 12 === 0) {
        const lastP = pressBuf.current[(bi - 1 + HISTORY) % HISTORY];
        const lastF = flowBuf.current[(bi - 1 + HISTORY) % HISTORY];
        const lastV = volBuf.current[(bi - 1 + HISTORY) % HISTORY];
        setLive({ pip: Math.round(lastP), flow: Math.round(lastF), vol: Math.round(lastV) });
      }

      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  }, []);

  // Compute hold result
  const getHoldResult = () => {
    if (!holdResult) return null;
    const { type, pressure } = holdResult;
    const { pip, peep } = settings;
    if (type === "insp") {
      const gap = Math.round((pip - pressure) * 10) / 10;
      const driv = Math.round((pressure - peep) * 10) / 10;
      return {
        title: "Inspiratory Hold",
        items: [
          { label: "Plateau (Pplat)", val: `${pressure}`, unit: "cmH₂O", color: "#4ade80" },
          { label: "PIP", val: `${Math.round(pip)}`, unit: "cmH₂O", color: "#94a3b8" },
          { label: "Peak–Plateau gap", val: `${gap}`, unit: "cmH₂O", color: gap > 10 ? "#ef4444" : "#4ade80", alert: gap > 10 },
          { label: "Driving pressure", val: `${driv}`, unit: "cmH₂O", color: driv > 15 ? "#ef4444" : "#4ade80", alert: driv > 15 },
        ],
        interp: gap > 10
          ? `Peak–Plateau gap ${gap} cmH₂O (>10) → RESISTANCE problem. Bronchospasm, secretions, or ETT kink.`
          : driv > 15
          ? `Driving pressure ${driv} cmH₂O (>15) → Reduce Vt immediately. High VILI risk.`
          : `Normal mechanics. Plateau ${pressure} cmH₂O, driving pressure ${driv} cmH₂O.`,
        color: (gap > 10 || driv > 15) ? "#ef4444" : "#4ade80",
      };
    } else {
      const auto = Math.round((pressure - peep) * 10) / 10;
      return {
        title: "Expiratory Hold",
        items: [
          { label: "Total PEEP", val: `${pressure}`, unit: "cmH₂O", color: "#60a5fa" },
          { label: "Set PEEP", val: `${peep}`, unit: "cmH₂O", color: "#94a3b8" },
          { label: "Auto-PEEP (PEEPi)", val: `${auto}`, unit: "cmH₂O", color: auto >= 3 ? "#f59e0b" : "#4ade80", alert: auto >= 3 },
        ],
        interp: auto >= 3
          ? `Auto-PEEP ${auto} cmH₂O → Air trapping. Reduce RR, extend I:E to 1:3–1:4, bronchodilators.`
          : `Minimal intrinsic PEEP (${auto} cmH₂O). Expiratory time adequate.`,
        color: auto >= 3 ? "#f59e0b" : "#4ade80",
      };
    }
  };

  const result = getHoldResult();
  const alarmInfo = activeAlarm && ALARM_DATA[activeAlarm] ? ALARM_DATA[activeAlarm] : null;
  const currentScenario = PATIENT_SCENARIOS.find(s => s.id === selectedScenario);

  const updateSetting = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));
  const updatePhysiology = (key, val) => setPhysiology(prev => ({ ...prev, [key]: val }));

  const panelBtn = (id, label) => (
    <button onClick={() => setPanel(id)} style={{
      padding: "5px 14px", borderRadius: 4, cursor: "pointer",
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase",
      border: `1px solid ${panel === id ? "#4a9eff" : "#1e3a52"}`,
      background: panel === id ? "#0d2137" : "#0a0f14",
      color: panel === id ? "#4a9eff" : "#334155",
      transition: "all 0.15s",
    }}>{label}</button>
  );

  return (
    <div style={{
      background: "#060d14", color: "#e2e8f0", borderRadius: 12,
      fontFamily: '"JetBrains Mono", monospace',
      border: "1px solid #1e2d3d", overflow: "hidden",
      maxWidth: 900, margin: "0 auto",
    }}>
      <style>{`
        @keyframes vpulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes alarmblink{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes slidein{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        input[type=range]{-webkit-appearance:none;appearance:none;background:transparent;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#4a9eff;cursor:pointer;}
        .scrollbar-hide::-webkit-scrollbar{display:none;}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ borderBottom: "1px solid #1e2d3d", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0f14" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: holdState ? "#fbbf24" : activeAlarm && !alarmDismissed ? "#ef4444" : "#22c55e", animation: "vpulse 1.2s infinite" }} />
          <span style={{ fontSize: 10, letterSpacing: 3, color: "#4a9eff", textTransform: "uppercase" }}>
            Vent Simulator — Interactive
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {currentScenario && (
            <span style={{ fontSize: 9, color: BADGE_COLORS[currentScenario.badge] || "#64748b", letterSpacing: 1 }}>
              {currentScenario.label}
            </span>
          )}
          <span style={{ fontSize: 9, color: "#334155" }}>Mode: {MODES[mode]?.label}</span>
          <span style={{ fontSize: 9, color: "#334155" }}>RR: {settings.rr}/min</span>
          {holdState && (
            <span style={{ fontSize: 9, color: "#fbbf24", letterSpacing: 1, animation: "vpulse 0.8s infinite" }}>
              {holdState === "insp" ? "● INSP HOLD" : "● EXP HOLD"}
            </span>
          )}
        </div>
      </div>

      {/* ── ALARM BANNER ── */}
      {activeAlarm && !alarmDismissed && (
        <div style={{
          background: alarmInfo ? `${alarmInfo.color}15` : "#ef444415",
          borderBottom: `1px solid ${alarmInfo ? alarmInfo.color : "#ef4444"}44`,
          padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          animation: "alarmblink 1.5s infinite",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: alarmInfo?.color || "#ef4444", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
              ⚠ {activeAlarm}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowTroubleshoot(t => !t)} style={{
              padding: "3px 10px", borderRadius: 4, cursor: "pointer",
              border: `1px solid ${alarmInfo?.color || "#ef4444"}`,
              background: "transparent", color: alarmInfo?.color || "#ef4444",
              fontSize: 9, letterSpacing: 1, textTransform: "uppercase", fontFamily: "inherit",
            }}>
              {showTroubleshoot ? "Hide Guide" : "Troubleshoot"}
            </button>
            <button onClick={() => setAlarmDismissed(true)} style={{
              padding: "3px 10px", borderRadius: 4, cursor: "pointer",
              border: "1px solid #1e3a52", background: "transparent", color: "#475569",
              fontSize: 9, letterSpacing: 1, textTransform: "uppercase", fontFamily: "inherit",
            }}>Dismiss</button>
          </div>
        </div>
      )}

      {/* ── TROUBLESHOOT PANEL ── */}
      {showTroubleshoot && alarmInfo && (
        <div style={{ background: "#0a0f14", borderBottom: "1px solid #1e2d3d", padding: "12px 16px", animation: "slidein 0.2s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 8, color: "#475569", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>Possible Causes</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {alarmInfo.causes.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 9, color: alarmInfo.color, flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                    <span style={{ fontSize: 10, color: "#64748b" }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, color: "#475569", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>Immediate Action</div>
              <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.7, borderLeft: `2px solid ${alarmInfo.color}`, paddingLeft: 8 }}>
                {alarmInfo.action}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-start", background: "#1a1000", borderRadius: 5, padding: "7px 10px", fontSize: 10, color: "#fbbf24" }}>
            <span style={{ flexShrink: 0 }}>💡</span>
            {alarmInfo.pearl}
          </div>
          {alarmInfo.interpret && (
            <div style={{ marginTop: 8, fontSize: 9, color: "#4a9eff", letterSpacing: 1 }}>
              → Try: {alarmInfo.interpret === "insp-hold" ? "Inspiratory Hold (measures plateau)" : alarmInfo.interpret === "exp-hold" ? "Expiratory Hold (measures auto-PEEP)" : "Both hold manoeuvres"} to confirm
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ borderBottom: "1px solid #1e2d3d", display: "flex", flexDirection: "column" }}>
          <div style={{ borderBottom: "1px solid #1e2d3d", padding: "8px 10px", display: "flex", gap: 4 }}>
            {panelBtn("scenario", "Scenarios")}
            {panelBtn("settings", "Vent Settings")}
            {panelBtn("physiology", "Physiology")}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }} className="scrollbar-hide">

            {/* SCENARIO PANEL */}
            {panel === "scenario" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 8, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                  Patient Presets — Click to Load
                </div>
                {PATIENT_SCENARIOS.map(sc => (
                  <button key={sc.id} onClick={() => loadScenario(sc.id)} style={{
                    width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 6, cursor: "pointer",
                    border: `1px solid ${selectedScenario === sc.id ? BADGE_COLORS[sc.badge] || "#4a9eff" : "#1e2d3d"}`,
                    background: selectedScenario === sc.id ? `${BADGE_COLORS[sc.badge] || "#4a9eff"}12` : "#0a0f14",
                    fontFamily: '"JetBrains Mono", monospace',
                    transition: "all 0.15s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <span style={{ fontSize: 10, color: selectedScenario === sc.id ? BADGE_COLORS[sc.badge] : "#94a3b8", fontWeight: 600 }}>
                        {sc.label}
                      </span>
                      {sc.alarm && (
                        <span style={{ fontSize: 7, color: "#ef4444", letterSpacing: 1, background: "#ef444415", padding: "1px 4px", borderRadius: 2 }}>
                          ALARM
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 9, color: "#475569", lineHeight: 1.4 }}>{sc.description}</div>
                    {sc.weight > 0 && (
                      <div style={{ fontSize: 8, color: "#334155", marginTop: 3 }}>
                        {sc.weight}kg · RR {sc.settings.rr} · PIP {sc.settings.pip} · PEEP {sc.settings.peep}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* SETTINGS PANEL */}
            {panel === "settings" && (
              <div>
                <div style={{ fontSize: 8, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
                  Ventilator Mode
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
                  {Object.entries(MODES).map(([id, m]) => (
                    <button key={id} onClick={() => setMode(id)} style={{
                      padding: "4px 8px", borderRadius: 4, cursor: "pointer",
                      border: `1px solid ${mode === id ? "#4a9eff" : "#1e3a52"}`,
                      background: mode === id ? "#0d2137" : "#0a0f14",
                      color: mode === id ? "#4a9eff" : "#475569",
                      fontSize: 9, letterSpacing: 1, fontFamily: "inherit",
                    }}>{m.label}</button>
                  ))}
                </div>
                <div style={{ fontSize: 9, color: "#334155", lineHeight: 1.5, marginBottom: 14, borderLeft: "2px solid #1e3a52", paddingLeft: 8 }}>
                  {MODES[mode]?.note}
                </div>

                <div style={{ fontSize: 8, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                  Vent Parameters
                </div>
                <Slider label="Peak Insp Pressure" unit="cmH₂O" value={settings.pip} min={10} max={60} step={1}
                  onChange={v => updateSetting("pip", v)} color="#4ade80" alert={settings.pip > 35} />
                <Slider label="PEEP" unit="cmH₂O" value={settings.peep} min={3} max={20} step={1}
                  onChange={v => updateSetting("peep", v)} color="#4ade80" />
                <Slider label="Tidal Volume" unit="mL" value={settings.vt} min={20} max={500} step={5}
                  onChange={v => updateSetting("vt", v)} color="#f472b6" />
                <Slider label="Respiratory Rate" unit="/min" value={settings.rr} min={8} max={60} step={1}
                  onChange={v => updateSetting("rr", v)} color="#60a5fa" />
                <Slider label="FiO₂" unit="%" value={settings.fio2} min={21} max={100} step={1}
                  onChange={v => updateSetting("fio2", v)} color="#fb923c" alert={settings.fio2 > 60} />
                <Slider label="I:E ratio (insp fraction)" unit="" value={settings.ie} min={0.15} max={0.6} step={0.01}
                  onChange={v => updateSetting("ie", v)} color="#a78bfa" />
                <Slider label="Peak Flow" unit="L/min" value={settings.flow} min={3} max={30} step={1}
                  onChange={v => updateSetting("flow", v)} color="#60a5fa" />

                <div style={{ marginTop: 10, background: "#0a0f14", borderRadius: 5, padding: "8px 10px", border: "1px solid #1e2d3d", fontSize: 9, color: "#475569" }}>
                  <div style={{ color: "#334155", marginBottom: 4, fontSize: 8, letterSpacing: 1, textTransform: "uppercase" }}>Derived Values</div>
                  <div>MV: {((settings.vt * settings.rr) / 1000).toFixed(2)} L/min</div>
                  <div>I:E = 1:{(1 / settings.ie - 1).toFixed(1)}</div>
                  <div>Ti = {((60 / settings.rr) * settings.ie / (1 + settings.ie)).toFixed(2)}s</div>
                </div>
              </div>
            )}

            {/* PHYSIOLOGY PANEL */}
            {panel === "physiology" && (
              <div>
                <div style={{ fontSize: 8, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
                  Lung Physiology Simulator
                </div>
                <Slider label="Compliance" unit="×normal" value={physiology.compliance} min={0.1} max={1.5} step={0.05}
                  onChange={v => { updatePhysiology("compliance", v); setActiveAlarm(v < 0.5 ? "HIGH PIP + HIGH PLATEAU → LOW COMPLIANCE" : null); setAlarmDismissed(false); }}
                  color="#4ade80" alert={physiology.compliance < 0.4} />
                <div style={{ fontSize: 8, color: "#334155", marginTop: -6, marginBottom: 10 }}>
                  &lt;0.4 = stiff (ARDS) · 0.4–0.7 = reduced · 1.0 = normal
                </div>

                <Slider label="Airway Resistance" unit="×normal" value={physiology.resistance} min={0.5} max={5} step={0.1}
                  onChange={v => { updatePhysiology("resistance", v); setActiveAlarm(v > 2 ? "HIGH PIP (RESISTANCE) + AUTO-PEEP" : null); setAlarmDismissed(false); }}
                  color="#f59e0b" alert={physiology.resistance > 2.5} />
                <div style={{ fontSize: 8, color: "#334155", marginTop: -6, marginBottom: 10 }}>
                  &gt;2 = obstructive (asthma) · &gt;3 = severe bronchospasm
                </div>

                <Slider label="Auto-PEEP (trapped)" unit="cmH₂O" value={physiology.autopeep} min={0} max={15} step={0.5}
                  onChange={v => updatePhysiology("autopeep", v)} color="#f59e0b" alert={physiology.autopeep > 5} />

                <Slider label="Circuit Leak" unit="fraction" value={physiology.leak} min={0} max={0.8} step={0.05}
                  onChange={v => { updatePhysiology("leak", v); setActiveAlarm(v > 0.3 ? "LOW Vt — CIRCUIT LEAK" : null); setAlarmDismissed(false); }}
                  color="#f97316" alert={physiology.leak > 0.3} />

                <div style={{ borderTop: "1px solid #1e2d3d", paddingTop: 10, marginTop: 4 }}>
                  <div style={{ fontSize: 8, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
                    <div style={{ borderBottom: "1px solid #1e2d3d", padding: "8px 10px", display: "flex", gap: 4, flexWrap: "wrap" }}>
                    Patient–Vent Interaction
                  </div>
                  <Toggle label="Flow Starvation (VC mode)" value={physiology.starvation}
                    onChange={v => { updatePhysiology("starvation", v); setActiveAlarm(v ? "FLOW STARVATION — VC MODE" : null); setAlarmDismissed(false); }}
                    color="#eab308" />
                  <Toggle label="Dyssynchrony / Agitation" value={physiology.dyssynch}
                    onChange={v => { updatePhysiology("dyssynch", v); setActiveAlarm(v ? "PATIENT–VENTILATOR DYSSYNCHRONY" : null); setAlarmDismissed(false); }}
                    color="#8b5cf6" />
                </div>

                <div style={{ marginTop: 12 }}>
                  <button onClick={() => {
                    updatePhysiology("compliance", 1.0);
                    updatePhysiology("resistance", 1.0);
                    updatePhysiology("autopeep", 0);
                    updatePhysiology("leak", 0);
                    updatePhysiology("starvation", false);
                    updatePhysiology("dyssynch", false);
                    setActiveAlarm(null);
                  }} style={{
                    width: "100%", padding: "6px", borderRadius: 4, cursor: "pointer",
                    border: "1px solid #1e3a52", background: "#0a0f14",
                    color: "#475569", fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                    fontFamily: "inherit",
                  }}>Reset Physiology to Normal</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: WAVEFORMS ── */}
        <div style={{ display: "flex", flexDirection: "column" }}>

          {/* Numerics bar */}
         <div style={{ borderBottom: "1px solid #1e2d3d", display: "flex", flexWrap: "wrap", padding: "0 12px" }}>
            {[
              { label: "PIP", val: live.pip, unit: "cmH₂O", color: "#4ade80", alert: live.pip > 35 },
              { label: "PEEP", val: settings.peep, unit: "cmH₂O", color: "#4ade80" },
              { label: "Vt set", val: settings.vt, unit: "mL", color: "#f472b6" },
              { label: "RR", val: settings.rr, unit: "/min", color: "#e2e8f0" },
              { label: "FiO₂", val: `${settings.fio2}%`, unit: "", color: settings.fio2 > 60 ? "#ef4444" : "#fb923c" },
              { label: "MV", val: ((settings.vt * settings.rr) / 1000).toFixed(1), unit: "L/min", color: "#94a3b8" },
            ].map(p => (
              <div key={p.label} style={{ padding: "8px 10px", borderRight: "1px solid #1e2d3d", textAlign: "center", minWidth: 64 }}>
                <div style={{ fontSize: 7, color: "#334155", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 1 }}>{p.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: p.alert ? "#ef4444" : p.color, lineHeight: 1, fontFamily: '"JetBrains Mono", monospace' }}>
                  {p.val}
                </div>
                <div style={{ fontSize: 7, color: "#334155" }}>{p.unit}</div>
              </div>
            ))}
          </div>

          {/* Canvas traces */}
          <div style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { ref: canvPRef, label: "Paw", unit: "cmH₂O", val: live.pip, color: "#4ade80" },
              { ref: canvFRef, label: "Flow", unit: "L/min", val: live.flow, color: "#60a5fa" },
              { ref: canvVRef, label: "Vol", unit: "mL", val: live.vol, color: "#f472b6" },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                <div style={{ width: 46, flexShrink: 0 }}>
                  <div style={{ fontSize: 8, color: row.color, letterSpacing: 1, textTransform: "uppercase" }}>{row.label}</div>
                  <div style={{ fontSize: 7, color: "#1e3a52" }}>{row.unit}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: holdState ? "#fbbf24" : row.color, marginTop: 2 }}>{row.val}</div>
                </div>
                <canvas ref={row.ref} style={{ flex: 1, height: 80, minWidth: 0, borderRadius: 4, border: "1px solid #0e1f2e", display: "block" }} />
              </div>
            ))}
          </div>

          {/* Hold Manoeuvre Controls */}
          <div style={{ borderTop: "1px solid #1e2d3d", padding: "8px 12px", background: "#0a0f14" }}>
            <div style={{ fontSize: 8, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Hold Manoeuvres</div>
            <div style={{ display: "flex", gap: 8,"1 1 auto", minWidth: 120, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={() => triggerHold("insp")} style={{
                display: "flex", alignItems: "center", gap: 5,
                background: holdState === "insp" ? "#1a3a00" : "#0e1922",
                border: `1px solid ${holdState === "insp" ? "#fbbf24" : "#1e3a52"}`,
                color: holdState === "insp" ? "#fbbf24" : "#4ade80",
                padding: "5px 12px", borderRadius: 4, cursor: "pointer",
                fontSize: 9, letterSpacing: 1, textTransform: "uppercase", fontFamily: "inherit",
              }}>
                {holdState === "insp" ? "⏹ Release" : "⏸ Insp Hold"}
              </button>
              <button onClick={() => triggerHold("exp")} style={{
                display: "flex", alignItems: "center", gap: 5,
                background: holdState === "exp" ? "#1a0a00" : "#0e1922",
                border: `1px solid ${holdState === "exp" ? "#fbbf24" : "#1e3a52"}`,
                color: holdState === "exp" ? "#fbbf24" : "#60a5fa",
                padding: "5px 12px", borderRadius: 4, cursor: "pointer",
                fontSize: 9, letterSpacing: 1, textTransform: "uppercase", fontFamily: "inherit",
              }}>
                {holdState === "exp" ? "⏹ Release" : "⏸ Exp Hold"}
              </button>
              <span style={{ fontSize: 8, color: "#1e3a52" }}>4s auto-release · waveform turns amber</span>
              {holdState && (
                <span style={{ fontSize: 9, color: "#fbbf24", animation: "vpulse 0.8s infinite" }}>
                  Measuring…
                </span>
              )}
            </div>

            {/* Hold Result */}
            {result && (
              <div style={{ marginTop: 8, background: "#060d14", borderRadius: 6, padding: "8px 10px", border: `1px solid ${result.color}33`, animation: "slidein 0.2s ease" }}>
                <div style={{ fontSize: 8, color: result.color, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
                  {result.title} Result
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  {result.items.map((item, i) => (
                    <div key={i} style={{ background: "#0a0f14", borderRadius: 5, padding: "5px 8px", border: "1px solid #1e2d3d", minWidth: 80 }}>
                      <div style={{ fontSize: 7, color: "#334155", letterSpacing: 1, textTransform: "uppercase" }}>{item.label}</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: item.color, lineHeight: 1.1 }}>
                        {item.val} <span style={{ fontSize: 8, fontWeight: 400, color: "#475569" }}>{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 9, color: result.color, borderLeft: `2px solid ${result.color}`, paddingLeft: 8, lineHeight: 1.6 }}>
                  → {result.interp}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: "1px solid #1e2d3d", padding: "6px 16px", display: "flex", justifyContent: "center" }}>
        <span style={{ fontSize: 8, color: "#1e3a52", letterSpacing: 1 }}>
          Tintinalli · BTS/ATS · PEMVECC 2017 · ARDSnet · OpenPediatrics — Educational simulator only
        </span>
      </div>
    </div>
  );
}
