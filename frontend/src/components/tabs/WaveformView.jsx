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
