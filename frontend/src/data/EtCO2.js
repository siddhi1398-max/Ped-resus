// EtCO2View.jsx — Capnography reference for EquipmentTab → Monitoring → EtCO₂
// Sources: Tintinalli · BTS/ATS · Bhavani-Shankar capnography atlas · OpenPediatrics
// Drop-in: add "etco2" to the section tabs in MonitoringView and render <EtCO2View />

import { ArrowRight, Warning, Lightbulb, Wind, Waveform, Pulse, ChartLine } from "@phosphor-icons/react";

// ─── ETCO2 WAVEFORM DATA ─────────────────────────────────────────────────────
const ETCO2_WAVEFORMS = [
  {
    id: "normal-co2", label: "Normal Capnogram", color: "#34d399",
    description: "Classic rectangular waveform. Four distinct phases. EtCO₂ 35–45 mmHg.",
    path: "M5,75 L20,75 L25,25 L70,20 L75,20 L80,75 L120,75 L125,25 L170,20 L175,20 L180,75 L215,75",
    phases: [
      { label: "Phase I",   detail: "Baseline — anatomical dead space gas, CO₂ ≈ 0" },
      { label: "Phase II",  detail: "Rapid expiratory upstroke — alveolar gas arrives at sensor" },
      { label: "Phase III", detail: "Alveolar plateau — EtCO₂ read at the end of this phase" },
      { label: "Phase 0",   detail: "Inspiration — fresh gas washes CO₂ to zero" },
    ],
    pearl: "Normal EtCO₂: 35–45 mmHg. EtCO₂ is typically 5–10 mmHg lower than PaCO₂ due to dead space dilution.",
  },
  {
    id: "obstructive-co2", label: "Obstructive — Shark Fin", color: "#fb923c",
    description: "Sloped 'shark fin' Phase III. No clear plateau. Hallmark of bronchospasm, asthma, COPD.",
    path: "M5,75 L20,75 L25,60 L35,35 L55,22 L75,20 L80,75 L125,75 L130,60 L140,35 L160,22 L180,20 L185,75 L215,75",
    phases: [
      { label: "Sloped Phase III", detail: "Uneven emptying from obstructed airways — heterogeneous time constants" },
      { label: "No plateau",       detail: "EtCO₂ still rising at cycle-off — significantly underestimates true PaCO₂" },
    ],
    pearl: "Shark fin = obstructive pattern. Treat bronchospasm. Widen I:E ratio. EtCO₂ may underestimate PaCO₂ by >10 mmHg — blood gas required.",
  },
  {
    id: "rebreathing-co2", label: "Rebreathing — Elevated Baseline", color: "#f87171",
    description: "Baseline CO₂ above zero — patient rebreathing exhaled CO₂. Circuit malfunction or exhausted soda lime.",
    path: "M5,58 L20,58 L25,38 L70,32 L75,32 L80,58 L120,58 L125,38 L170,32 L175,32 L180,58 L215,58",
    phases: [
      { label: "Elevated baseline",   detail: "CO₂ present during inspiration — not returning to zero" },
      { label: "Reduced ΔCO₂ swing", detail: "Smaller waveform amplitude than normal" },
    ],
    pearl: "Check CO₂ absorber (soda lime) — change if exhausted. Check expiratory valve for sticking. Distinct from oesophageal intubation (decaying, not raised baseline).",
  },
  {
    id: "oesophageal-co2", label: "Oesophageal Intubation", color: "#ef4444",
    description: "Small irregular waveforms decaying rapidly to zero within 4–6 breaths. Confirms incorrect tube placement.",
    path: "M5,75 L20,75 L22,55 L30,52 L38,55 L40,75 L60,75 L62,65 L70,63 L78,65 L80,75 L100,75 L102,70 L110,69 L118,70 L120,75 L140,75 L215,75",
    phases: [
      { label: "Rapidly decaying",        detail: "CO₂ from stomach gas, not alveoli — disappears within 4–6 breaths" },
      { label: "Flat after 4–6 breaths",  detail: "No sustained alveolar CO₂ production — confirms oesophageal placement" },
    ],
    pearl: "Any sustained rectangular waveform confirms endotracheal intubation. Flat/decaying waveform = oesophageal intubation. IMMEDIATELY remove tube and reintubate.",
  },
  {
    id: "cpr-co2", label: "CPR — Low EtCO₂ + ROSC Signal", color: "#a78bfa",
    description: "Low EtCO₂ during CPR reflects poor pulmonary blood flow. Sudden rise signals ROSC.",
    path: "M5,75 L20,75 L22,68 L35,67 L37,75 L60,75 L62,68 L75,67 L77,75 L100,75 L102,68 L115,67 L117,75 L140,75 L142,45 L160,42 L162,75 L190,75 L192,45 L210,42 L215,75",
    phases: [
      { label: "Low amplitude", detail: "Low EtCO₂ = poor cardiac output / inadequate pulmonary blood flow during CPR" },
      { label: "Sudden rise",   detail: "Abrupt ↑ EtCO₂ to >40 mmHg → highly suggestive of ROSC — stop CPR and check pulse" },
    ],
    pearl: "EtCO₂ <10 mmHg after 20 min CPR = poor survival marker. Sudden rise >40 mmHg = likely ROSC. Use as real-time CPR quality and ROSC monitor.",
  },
  {
    id: "curare-co2", label: "Curare Notch — Dyssynchrony", color: "#facc15",
    description: "Notch in Phase III plateau caused by patient inspiratory effort during expiration. Waning NMB or patient fighting vent.",
    path: "M5,75 L20,75 L22,28 L65,22 L68,30 L72,22 L80,22 L82,75 L125,75 L127,28 L170,22 L173,30 L177,22 L185,22 L187,75 L215,75",
    phases: [
      { label: "Phase III notch",    detail: "Patient inspiratory effort drops CO₂ transiently during alveolar plateau" },
      { label: "Returns to plateau", detail: "Repeatable each breath — distinguishes from artefact" },
    ],
    pearl: "Curare notch = patient fighting vent. Check sedation (COMFORT-B target 11–17). Assess NMB level if paralysed. Adjust trigger sensitivity.",
  },
];

// ─── TREND TABLE DATA ─────────────────────────────────────────────────────────
const TREND_ROWS = [
  { finding: "EtCO₂ → 0 suddenly",      cause: "ETT dislodgement, circuit disconnect, cardiac arrest",      action: "Bag manually. DOPE check. Confirm ETT placement.",     color: "#ef4444" },
  { finding: "EtCO₂ gradually ↓",       cause: "Hyperventilation, ↓ cardiac output, PE, ↓ metabolism",     action: "Reduce RR if iatrogenic. Assess haemodynamics. ABG.",  color: "#f97316" },
  { finding: "EtCO₂ gradually ↑",       cause: "Hypoventilation, fever, sepsis, ↑ CO₂ production",         action: "Increase RR or Vt. Treat fever. Send ABG.",           color: "#f97316" },
  { finding: "EtCO₂ sudden ↑",          cause: "ROSC, NaHCO₃ given, ↑ cardiac output",                    action: "Stop CPR, check pulse. Consider ROSC.",               color: "#a78bfa" },
  { finding: "Widened EtCO₂–PaCO₂ gap", cause: "↑ Dead space: PE, ↓ CO, hypovolaemia, high PEEP",          action: "ABG mandatory. Investigate dead space physiology.",    color: "#fbbf24" },
  { finding: "Shark fin waveform",       cause: "Bronchospasm, asthma, COPD, bronchiolitis",                action: "Bronchodilators. Extend Te. Adjust I:E ratio.",        color: "#fb923c" },
  { finding: "Elevated baseline",        cause: "Rebreathing — exhausted soda lime, stuck expiratory valve", action: "Change CO₂ absorber. Check circuit valves.",          color: "#60a5fa" },
];

// ─── WAVEFORM CARD ────────────────────────────────────────────────────────────
function EtCO2Card({ w }) {
  return (
    <div style={{ background: "#0a0f14", border: "1px solid #1e2d3d", borderRadius: 10, overflow: "hidden", fontFamily: '"JetBrains Mono", monospace' }}>
      <div style={{ padding: "9px 12px", borderBottom: "1px solid #1e2d3d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0" }}>{w.label}</span>
        <span style={{ fontSize: 8, letterSpacing: 2, color: w.color, textTransform: "uppercase" }}>EtCO₂</span>
      </div>
      <div style={{ padding: "8px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 8, color: w.color, letterSpacing: 1, textTransform: "uppercase", width: 36 }}>EtCO₂</span>
          <svg viewBox="0 0 220 85" style={{ flex: 1, height: 50, background: "#060d14", borderRadius: 4, border: "1px solid #0e1f2e" }}>
            {[20, 42, 63].map(y => <line key={y} x1="5" y1={y} x2="215" y2={y} stroke="#0d1f30" strokeWidth="0.8" />)}
            <line x1="5" y1="75" x2="215" y2="75" stroke="#1e3a52" strokeWidth="0.5" strokeDasharray="3,3" />
            <path d={w.path} fill="none" stroke={w.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>
        <p style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.55, marginBottom: 6 }}>{w.description}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 6 }}>
          {w.phases.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 5, alignItems: "flex-start" }}>
              <ArrowRight size={9} weight="bold" style={{ color: w.color, flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 10, color: "#64748b" }}>
                <strong style={{ color: "#94a3b8" }}>{f.label}:</strong> {f.detail}
              </span>
            </div>
          ))}
        </div>
        <div style={{ background: "#1a1000", borderRadius: 4, padding: "5px 8px", fontSize: 10, color: "#fbbf24", display: "flex", gap: 6, alignItems: "flex-start" }}>
          <Lightbulb size={11} weight="fill" style={{ color: "#fbbf24", flexShrink: 0, marginTop: 1 }} />
          {w.pearl}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function EtCO2View() {
  return (
    <div style={{ background: "#0a0f14", borderRadius: 12, border: "1px solid #1e2d3d", padding: "16px", fontFamily: '"JetBrains Mono", monospace' }}>

      {/* Key numerics bar */}
      <div style={{ background: "#0e1116", border: "1px solid #1e3a52", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Wind size={11} weight="fill" style={{ color: "#4a9eff" }} />
          <span style={{ fontSize: 9, color: "#4a9eff", letterSpacing: 2, textTransform: "uppercase" }}>Capnography — Key Values</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8, marginBottom: 12 }}>
          {[
            { label: "Normal EtCO₂",       val: "35–45",        unit: "mmHg",           color: "#34d399" },
            { label: "EtCO₂ – PaCO₂ gap",  val: "5–10",         unit: "mmHg (dead space)",color: "#60a5fa" },
            { label: "CPR poor prognosis",  val: "<10",          unit: "mmHg at 20 min", color: "#f87171" },
            { label: "ROSC signal",         val: "Sudden >40",   unit: "mmHg",           color: "#a78bfa" },
          ].map(p => (
            <div key={p.label} style={{ background: "#060d14", borderRadius: 6, padding: "8px 10px", border: "1px solid #1e2d3d" }}>
              <div style={{ fontSize: 8, color: "#475569", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{p.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: p.color, lineHeight: 1 }}>{p.val}</div>
              <div style={{ fontSize: 8, color: "#334155", marginTop: 2 }}>{p.unit}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 10, color: "#64748b", lineHeight: 1.7 }}>
          Capnography measures CO₂ in exhaled gas over time. Clinical uses: ETT position confirmation, ventilation monitoring, CPR quality assessment, ROSC detection, sedation monitoring, and metabolic assessment.
        </p>
      </div>

      {/* Four phases */}
      <div style={{ background: "#0e1116", border: "1px solid #1e3a52", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
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

      {/* Waveform pattern cards */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Pulse size={11} weight="fill" style={{ color: "#94a3b8" }} />
          <span style={{ fontSize: 9, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase" }}>Capnogram Patterns — Recognition &amp; Response</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
          {ETCO2_WAVEFORMS.map(w => <EtCO2Card key={w.id} w={w} />)}
        </div>
      </div>

      {/* Trend table */}
      <div style={{ background: "#0e1116", border: "1px solid #1e3a52", borderRadius: 8, padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <ChartLine size={11} weight="fill" style={{ color: "#4a9eff" }} />
          <span style={{ fontSize: 9, color: "#4a9eff", letterSpacing: 2, textTransform: "uppercase" }}>EtCO₂ Trend Interpretation</span>
        </div>
        {/* Headers */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1.5fr", gap: 8, marginBottom: 5, padding: "0 10px" }}>
          {["Finding", "Causes", "Action"].map(h => (
            <span key={h} style={{ fontSize: 8, color: "#334155", letterSpacing: 2, textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {TREND_ROWS.map((r, i) => (
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

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 9, color: "#1e3a52", letterSpacing: 1, paddingTop: 12, marginTop: 4, borderTop: "1px solid #1e2d3d" }}>
        Tintinalli · BTS/ATS · Bhavani-Shankar capnography atlas · OpenPediatrics — schematic for teaching only
      </div>
    </div>
  );
}
