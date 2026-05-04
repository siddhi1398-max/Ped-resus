// EquipmentTab.jsx — Airway Equipment & Monitoring
// Sub-tabs: Reference Table · Equipment Cards · Difficult Airway · Monitoring
// Sources: Harriet Lane 23e · Fleischer & Ludwig 7e · APLS · AIDAA 2022
//          Vortex Approach (Chrimes 2016 · vortexapproach.org)
//          Morgan & Mikhail 7e · AHA PALS 2020

import { useState, useMemo } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Warning, Lightbulb, ArrowRight, CheckCircle, Circle,
  Wind, Drop, Heartbeat, ClipboardText, Pulse, Stethoscope,
  Syringe, ArrowsOut,
} from "@phosphor-icons/react";
import { EQUIPMENT_ROWS } from "../../data/equipment";

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

// ─── FORMULA ENGINE ────────────────────────────────────────────────────────────
function calcEquipment(weight) {
  // Weight-only formulas (no separate age input — weight context drives everything)
  const ettUncuffed   = weight < 1 ? 2.5 : weight < 2 ? 3.0 : weight < 3 ? 3.0 : weight < 4 ? 3.5 : +(Math.round((weight / 4 + 4) * 2) / 2).toFixed(1);
  const ettCuffed     = +(ettUncuffed - 0.5).toFixed(1);
  const ettDepthOral  = Math.round(weight + 6);
  const ettDepthNasal = Math.round(weight + 9);

  let lma = "1";
  if (weight >= 5  && weight < 10)  lma = "1.5";
  if (weight >= 10 && weight < 20)  lma = "2";
  if (weight >= 20 && weight < 30)  lma = "2.5";
  if (weight >= 30 && weight < 50)  lma = "3";
  if (weight >= 50 && weight < 70)  lma = "4";
  if (weight >= 70)                  lma = "5";

  const suction = Math.round(ettUncuffed * 3);

  let blade = "0 straight";
  if (weight >= 3  && weight < 10) blade = "1 straight";
  if (weight >= 10 && weight < 20) blade = "2 straight/curved";
  if (weight >= 20)                 blade = "3 Macintosh";

  let ngt = "5 Fr";
  if (weight >= 3  && weight < 7)  ngt = "5–8 Fr";
  if (weight >= 7  && weight < 15) ngt = "8–10 Fr";
  if (weight >= 15 && weight < 30) ngt = "10–12 Fr";
  if (weight >= 30)                 ngt = "12–14 Fr";

  let iv = "24G";
  if (weight >= 10 && weight < 25) iv = "22G";
  if (weight >= 25 && weight < 50) iv = "20G";
  if (weight >= 50)                 iv = "18G";

  let io = "15 mm pink";
  if (weight >= 40) io = "25 mm blue";

  const chestDrain = weight < 10 ? "10–14 Fr" : weight < 20 ? "16–20 Fr" : weight < 40 ? "20–28 Fr" : "28–32 Fr";
  const ucath      = weight < 5  ? "5 Fr"     : weight < 10 ? "6 Fr"     : weight < 20 ? "8 Fr"     : weight < 40 ? "10 Fr" : "12 Fr";
  const defib      = Math.round(weight * 4);
  const defibMax   = Math.min(weight * 10, 360);
  const cardiovert = Math.round(weight * 1);

  let maskSize = "Neonatal";
  if (weight >= 4  && weight < 10) maskSize = "Infant";
  if (weight >= 10 && weight < 25) maskSize = "Child";
  if (weight >= 25)                 maskSize = "Adult";

  const preferCuffed = weight >= 8;

  return {
    ettUncuffed, ettCuffed, ettDepthOral, ettDepthNasal,
    lma, suction, blade, ngt, iv, io,
    chestDrain, ucath, defib, defibMax, cardiovert,
    maskSize, preferCuffed,
  };
}

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
      <div className={`font-black text-lg leading-none mb-0.5 ${highlighted ? t.text : "text-slate-900 dark:text-white"}`}
           style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{value}</div>
      {sub && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sub}</div>}
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

// ─── FOB SIZING SVG (kept — clinically useful, not replaced by text) ──────────
function FOBSizingSVG() {
  const rows = [
    { age: "Neonate",    wt: "<3 kg",    scope: "2.2 mm", ett: "3.0", note: "Ultra-thin scope"   },
    { age: "Infant",     wt: "3–10 kg",  scope: "2.8 mm", ett: "3.5", note: "Intubating scope"   },
    { age: "Toddler",    wt: "10–20 kg", scope: "3.5 mm", ett: "4.5", note: "Paeds FOB"          },
    { age: "School age", wt: "20–40 kg", scope: "4.0 mm", ett: "5.5", note: "Paeds/adult thin"   },
    { age: "Adolescent", wt: ">40 kg",   scope: "4.9 mm", ett: "7.0", note: "Standard adult"     },
  ];
  return (
    <svg viewBox="0 0 360 210" className="w-full" aria-label="Fibreoptic bronchoscope sizing table">
      <rect width="360" height="210" rx="8" fill="#0f172a" />
      <text x="180" y="18" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="800" fontFamily="monospace">
        FIBREOPTIC BRONCHOSCOPE — PAEDIATRIC SIZING
      </text>
      {["Age Band", "Weight", "Scope OD", "Min ETT ID", "Notes"].map((h, i) => (
        <text key={h} x={[16, 76, 140, 200, 258][i]} y="33" fill="#64748b" fontSize="7" fontWeight="700" fontFamily="monospace">{h}</text>
      ))}
      <line x1="12" y1="36" x2="348" y2="36" stroke="#1e293b" strokeWidth="1" />
      {rows.map((r, i) => {
        const y = 48 + i * 32;
        return (
          <g key={r.age}>
            <rect x="12" y={y - 11} width="336" height="26" rx="3" fill={i % 2 === 0 ? "#111827" : "#0f172a"} />
            <text x="16"  y={y + 5} fill="#e2e8f0" fontSize="8" fontFamily="monospace" fontWeight="600">{r.age}</text>
            <text x="76"  y={y + 5} fill="#94a3b8" fontSize="8" fontFamily="monospace">{r.wt}</text>
            <text x="140" y={y + 5} fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="800">{r.scope}</text>
            <text x="200" y={y + 5} fill="#60a5fa" fontSize="9" fontFamily="monospace" fontWeight="800">{r.ett} mm</text>
            <text x="258" y={y + 5} fill="#94a3b8" fontSize="7" fontFamily="monospace">{r.note}</text>
          </g>
        );
      })}
      <text x="12" y="205" fill="#475569" fontSize="6" fontFamily="monospace">
        Load ETT BEFORE scope insertion · ETT ID ≥ scope OD + 0.8 mm · Lubricate · Antifog · Scope must reach carina
      </text>
    </svg>
  );
}

// ─── VORTEX SVG — correct per vortexapproach.org (Chrimes 2016) ───────────────
// Layout: circular tool, 3 lifelines as equal arcs (Face Mask · SGA · ETT),
// outer Green Zone ring = oxygenation maintained,
// centre = Neck Rescue (CICO — all lifelines failed),
// small green disc inside centre = Green Zone also reachable via neck rescue,
// spiral arrows = inward movement when lifeline fails.
function VortexSVG() {
  const cx = 200, cy = 200, R = 170, rMid = 100, rInner = 62;

  // Helper: point on circle
  const pt = (deg, r) => {
    const rad = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };

  // 3 lifelines at 0°, 120°, 240° (top = Face Mask, bottom-right = SGA, bottom-left = ETT)
  // Each sector spans 120°
  const sectors = [
    { label: "FACE MASK",   sub: "Lifeline 1", startDeg: -60, endDeg: 60,  fill: "#1e3a8a", stroke: "#3b82f6", textDeg: 0,   textColor: "#93c5fd" },
    { label: "SGA",         sub: "Lifeline 2", startDeg: 60,  endDeg: 180, fill: "#4c1d95", stroke: "#8b5cf6", textDeg: 120, textColor: "#c4b5fd" },
    { label: "ETT",         sub: "Lifeline 3", startDeg: 180, endDeg: 300, fill: "#064e3b", stroke: "#10b981", textDeg: 240, textColor: "#6ee7b7" },
  ];

  const arcPath = (startDeg, endDeg, outerR, innerR) => {
    const [x1, y1] = pt(startDeg, outerR);
    const [x2, y2] = pt(endDeg, outerR);
    const [x3, y3] = pt(endDeg, innerR);
    const [x4, y4] = pt(startDeg, innerR);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M${x1},${y1} A${outerR},${outerR} 0 ${large},1 ${x2},${y2} L${x3},${y3} A${innerR},${innerR} 0 ${large},0 ${x4},${y4} Z`;
  };

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-sm mx-auto"
         aria-label="Vortex Approach cognitive aid — Chrimes 2016 — vortexapproach.org">
      <defs>
        <marker id="varrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#64748b" />
        </marker>
      </defs>

      {/* Background */}
      <rect width="400" height="400" rx="14" fill="#080e1c" />

      {/* Outer Green Zone ring */}
      <circle cx={cx} cy={cy} r={R + 18} fill="#052e16" opacity="0.6" />
      <circle cx={cx} cy={cy} r={R + 18} fill="none" stroke="#16a34a" strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={R}      fill="none" stroke="#15803d" strokeWidth="1" strokeDasharray="4,3" />

      {/* GREEN ZONE label — 4 corners of the ring */}
      {[0, 90, 180, 270].map(deg => {
        const [x, y] = pt(deg, R + 10);
        return (
          <text key={deg} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                fill="#22c55e" fontSize="7" fontWeight="800" fontFamily="monospace"
                transform={`rotate(${deg}, ${x}, ${y})`}>
            GREEN ZONE
          </text>
        );
      })}

      {/* Three sector arcs (lifelines) */}
      {sectors.map(s => (
        <g key={s.label}>
          <path d={arcPath(s.startDeg, s.endDeg, R, rInner + 4)}
                fill={s.fill} fillOpacity="0.45" stroke={s.stroke} strokeWidth="1.5" />
          {/* Sector label — positioned at midpoint of arc */}
          {(() => {
            const midDeg = (s.startDeg + s.endDeg) / 2;
            const [tx, ty] = pt(midDeg, rMid + 28);
            return (
              <g key="label">
                <text x={tx} y={ty - 8} textAnchor="middle" fill={s.textColor}
                      fontSize="11" fontWeight="800" fontFamily="monospace">{s.label}</text>
                <text x={tx} y={ty + 5} textAnchor="middle" fill={s.textColor}
                      fontSize="8" fontFamily="monospace" opacity="0.8">{s.sub}</text>
              </g>
            );
          })()}
        </g>
      ))}

      {/* Sector dividing lines (radial, from inner to outer) */}
      {[0, 120, 240].map(deg => {
        const [x1, y1] = pt(deg, rInner + 4);
        const [x2, y2] = pt(deg, R);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="1.2" />;
      })}

      {/* Spiral/inward arrows — one per lifeline sector suggesting descent */}
      {sectors.map(s => {
        const midDeg = (s.startDeg + s.endDeg) / 2;
        const [ax, ay] = pt(midDeg, rMid + 5);
        const [bx, by] = pt(midDeg, rInner + 14);
        return (
          <line key={s.label + "arrow"} x1={ax} y1={ay} x2={bx} y2={by}
                stroke={s.stroke} strokeWidth="1.4" strokeDasharray="4,2"
                markerEnd="url(#varrow)" opacity="0.8" />
        );
      })}

      {/* "OPTIMISE" labels on each dividing line */}
      {[0, 120, 240].map((deg, i) => {
        const [x, y] = pt(deg + 10, rMid + 45);
        return (
          <text key={i} x={x} y={y} textAnchor="middle"
                fill="#fbbf24" fontSize="6.5" fontFamily="monospace" fontWeight="700"
                transform={`rotate(${deg + 10}, ${x}, ${y})`}>
            OPTIMISE
          </text>
        );
      })}

      {/* Centre circle — Neck Rescue (CICO) */}
      <circle cx={cx} cy={cy} r={rInner}     fill="#3b0000" />
      <circle cx={cx} cy={cy} r={rInner}     fill="none" stroke="#dc2626" strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={rInner - 6} fill="#2d0000" />

      {/* Small green disc inside centre = Green Zone reachable via Neck Rescue */}
      <circle cx={cx} cy={cy - 26} r="10" fill="#15803d" opacity="0.9" />
      <text x={cx} y={cy - 23} textAnchor="middle" fill="#dcfce7" fontSize="5.5"
            fontWeight="800" fontFamily="monospace">GREEN</text>
      <text x={cx} y={cy - 13} textAnchor="middle" fill="#dcfce7" fontSize="5"
            fontFamily="monospace">ZONE</text>

      <text x={cx} y={cy - 1}  textAnchor="middle" fill="#fca5a5" fontSize="9.5"
            fontWeight="800" fontFamily="monospace">NECK</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#fca5a5" fontSize="9.5"
            fontWeight="800" fontFamily="monospace">RESCUE</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill="#f87171" fontSize="7"
            fontFamily="monospace">eFONA / CICO</text>
      <text x={cx} y={cy + 35} textAnchor="middle" fill="#f87171" fontSize="6"
            fontFamily="monospace">All lifelines failed</text>

      {/* Source */}
      <text x={cx} y="396" textAnchor="middle" fill="#1e3a5f" fontSize="6.5" fontFamily="monospace">
        Vortex Approach · N. Chrimes 2016 · vortexapproach.org
      </text>
    </svg>
  );
}

// ─── TAB 1: REFERENCE TABLE ────────────────────────────────────────────────────
function ReferenceTableView() {
  const { weight } = useWeight();
  const [highlightAge, setHighlightAge] = useState(null);

  const suggestedIdx = useMemo(() => {
    if (!EQUIPMENT_ROWS?.length) return 0;
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
        Row matching current weight ({weight} kg) highlighted in blue. Tap any row to lock selection.
      </InfoBox>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 dark:bg-slate-950 text-white">
              {cols.map(c => (
                <th key={c.k} className="p-3 text-left font-mono text-[9px] uppercase tracking-widest whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(EQUIPMENT_ROWS || []).map((r, i) => {
              const isSuggested   = i === suggestedIdx;
              const isHighlighted = highlightAge === r.age;
              let cls = "border-t border-slate-200 dark:border-slate-800 cursor-pointer transition-colors ";
              if      (isHighlighted) cls += "bg-violet-100 dark:bg-violet-950/50 ";
              else if (isSuggested)   cls += "bg-blue-50 dark:bg-blue-950/30 ";
              else                    cls += "odd:bg-white dark:odd:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/30 ";
              return (
                <tr key={r.age} className={cls} onClick={() => setHighlightAge(isHighlighted ? null : r.age)}>
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
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800" />
          Weight match
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800" />
          Selected
        </span>
      </div>

      {/* Formula reference */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3">Formula Reference</div>
        <div className="grid sm:grid-cols-2 gap-2 font-mono text-xs">
          {[
            { label: "ETT uncuffed (age ≥2 yr)",  val: "(age÷4) + 4"              },
            { label: "ETT cuffed (age ≥2 yr)",    val: "(age÷4) + 3.5"            },
            { label: "ETT depth — oral",           val: "(age÷2) + 12 cm"          },
            { label: "ETT depth — nasal",          val: "(age÷2) + 15 cm"          },
            { label: "Defibrillation",             val: "4 J/kg (max 10 J/kg / 360 J)" },
            { label: "Cardioversion",              val: "0.5–1 J/kg → 2 J/kg"      },
            { label: "Suction catheter (Fr)",      val: "≈ 3 × ETT mm"             },
            { label: "Maintenance fluid",          val: "4-2-1 rule (mL/kg/hr)"    },
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

// ─── TAB 2: EQUIPMENT CARDS ────────────────────────────────────────────────────
function EquipmentCardsView() {
  const { weight } = useWeight();
  const [cuffed, setCuffed] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});

  const eq      = useMemo(() => calcEquipment(weight), [weight]);
  const ettSize = cuffed ? eq.ettCuffed : eq.ettUncuffed;

  const maintenance =
    weight < 10  ? weight * 100
    : weight < 20 ? 1000 + (weight - 10) * 50
    : 1500 + (weight - 20) * 20;

  const checklistItems = [
    { id: "suction",  label: "Suction working + Yankauer attached" },
    { id: "bvm",      label: `BVM + correct mask (${eq.maskSize})` },
    { id: "o2",       label: "O₂ flow confirmed + reservoir bag" },
    { id: "ett",      label: `ETT ${ettSize} mm ${cuffed ? "(cuffed)" : "(uncuffed)"} + size above/below` },
    { id: "syringe",  label: "10 mL syringe for cuff inflation" },
    { id: "stylet",   label: "Stylet shaped + lubricated inside ETT" },
    { id: "laryngo",  label: `Laryngoscope ${eq.blade} — light working` },
    { id: "capno",    label: "Waveform ETCO₂ or colorimetric attached" },
    { id: "tape",     label: `ETT holder prepared for ${eq.ettDepthOral} cm at lip` },
    { id: "iv",       label: `IV/IO access confirmed (${eq.iv} or IO)` },
    { id: "drugs",    label: "RSI drugs drawn up + labelled (Resuscitation tab)" },
    { id: "desat",    label: "Monitoring: SpO₂, ECG, ETCO₂ in place" },
    { id: "backup",   label: `Difficult airway backup: LMA ${eq.lma}, scalpel kit` },
  ];

  const toggleCheck  = id => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  const checkedCount = checklistItems.filter(i => checkedItems[i.id]).length;
  const allChecked   = checkedCount === checklistItems.length;

  return (
    <div className="space-y-5">

      {/* Weight from context — ETT type toggle only */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 flex-wrap gap-3">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Patient Weight</div>
          <div className="font-black text-2xl text-slate-900 dark:text-white"
               style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            {weight} <span className="text-sm font-normal text-slate-400">kg</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">ETT Type</div>
          <div className="flex gap-2">
            {[{ v: false, l: "Uncuffed" }, { v: true, l: "Cuffed" }].map(opt => (
              <button key={opt.l} onClick={() => setCuffed(opt.v)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                  cuffed === opt.v
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                }`}>{opt.l}</button>
            ))}
          </div>
        </div>
      </div>
      {eq.preferCuffed && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 -mt-3 px-1">
          <CheckCircle size={12} weight="fill" className="text-emerald-500" />
          Cuffed ETT preferred (≥8 kg) — reduces reintubation, allows PEEP, safer in transport
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

      {/* Equipment grid */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3">
          All Equipment — {weight} kg
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <EquipCard label="LMA Size"         value={eq.lma}                sub="Laryngeal mask airway"        tone="blue"   Icon={Wind}        highlighted />
          <EquipCard label="Suction Catheter" value={`${eq.suction} Fr`}    sub="≈ 3 × ETT size"              tone="slate"  Icon={ArrowsOut}               />
          <EquipCard label="Laryngoscope"     value={eq.blade}              sub="Blade size/type"             tone="amber"  Icon={Stethoscope}             />
          <EquipCard label="BVM Mask"         value={eq.maskSize}           sub="Bag-valve-mask size"         tone="sky"    Icon={Wind}                    />
          <EquipCard label="NGT / OGT"        value={eq.ngt}                sub="Nasogastric tube"            tone="slate"                                 />
          <EquipCard label="IV Cannula"       value={eq.iv}                 sub="Peripheral IV"               tone="blue"   Icon={Drop}        highlighted />
          <EquipCard label="IO Access"        value={eq.io}                 sub="Intraosseous needle"         tone="red"    Icon={Syringe}                 />
          <EquipCard label="Urinary Catheter" value={eq.ucath}              sub="Foley catheter"              tone="slate"                                 />
          <EquipCard label="Chest Drain"      value={eq.chestDrain}         sub="Intercostal drain"           tone="violet" Icon={Wind}                    />
          <EquipCard label="Defibrillation"   value={`${eq.defib} J`}       sub={`4 J/kg · max ${eq.defibMax} J`} tone="red" Icon={Heartbeat} highlighted />
          <EquipCard label="Cardioversion"    value={`${eq.cardiovert} J`}  sub="0.5–1 J/kg sync"            tone="amber"  Icon={Pulse}                   />
          <EquipCard label="Maintenance"      value={`${maintenance} mL`}   sub="mL/24hr · Holliday-Segar"   tone="slate"  Icon={Drop}                    />
        </div>
      </div>

      {/* Pre-intubation checklist */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          allChecked
            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
        }`}>
          <div className="flex items-center gap-2">
            <ClipboardText size={14} weight="fill" className={allChecked ? "text-emerald-500" : "text-slate-400"} />
            <span className="font-bold text-sm text-slate-900 dark:text-white"
                  style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Pre-intubation Checklist
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">{checkedCount}/{checklistItems.length}</span>
            {allChecked
              ? <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle size={10} weight="fill" />Ready
                </span>
              : <button onClick={() => setCheckedItems({})}
                  className="text-[10px] font-mono text-slate-400 hover:text-slate-600 underline">Reset</button>
            }
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900/50 grid sm:grid-cols-2 gap-1.5">
          {checklistItems.map(item => (
            <button key={item.id} onClick={() => toggleCheck(item.id)}
              className={`flex items-start gap-2.5 text-left rounded-lg px-3 py-2 transition-all text-xs ${
                checkedItems[item.id]
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                  : "bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-200"
              }`}>
              {checkedItems[item.id]
                ? <CheckCircle size={13} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />
                : <Circle      size={13} weight="regular" className="text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />}
              {item.label}
            </button>
          ))}
        </div>

        {!allChecked && checkedCount > 0 && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900">
            <div className="flex items-center gap-1.5">
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div className="bg-amber-500 rounded-full h-1.5 transition-all"
                     style={{ width: `${(checkedCount / checklistItems.length) * 100}%` }} />
              </div>
              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                {Math.round((checkedCount / checklistItems.length) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB 3: DIFFICULT AIRWAY ───────────────────────────────────────────────────
function DifficultAirwayView() {
  const { weight } = useWeight();
  const [section, setSection] = useState("predict");

  const lmaSize  = weight < 5 ? "1" : weight < 10 ? "1.5" : weight < 20 ? "2" : weight < 30 ? "2.5" : weight < 50 ? "3" : "4";
  const fobScope = weight < 3 ? "2.2 mm" : weight < 10 ? "2.8 mm" : weight < 20 ? "3.5 mm" : weight < 40 ? "4.0 mm" : "4.9 mm";
  const ettFOB   = weight < 3 ? "3.0"    : weight < 10 ? "3.5"    : weight < 20 ? "4.5"    : weight < 40 ? "5.5"    : "7.0";

  const sectionBtns = [
    { id: "predict", label: "Prediction"      },
    { id: "vortex",  label: "Vortex Approach" },
    { id: "fob",     label: "Fibreoptic"      },
    { id: "devices", label: "Rescue Devices"  },
  ];

  const predictors = [
    { label: "Anatomy / Structural", items: [
      "Micrognathia — Pierre Robin, Treacher Collins, Goldenhar",
      "Macroglossia — Trisomy 21, Beckwith-Wiedemann",
      "Cleft palate — difficult mask seal",
      "Narrow mouth opening — trismus, ankylosis",
      "Short neck / limited extension — cervical spine anomaly",
      "Laryngomalacia, subglottic stenosis, tracheomalacia",
    ]},
    { label: "Acquired / Functional", items: [
      "Oedema — anaphylaxis, angioedema, burns, trauma",
      "Infection — epiglottitis, bacterial tracheitis, croup",
      "Foreign body — partial or complete obstruction",
      "Haematoma / abscess — peritonsillar, retropharyngeal",
      "Obesity — reduced FRC, rapid desaturation",
      "Mediastinal mass — dynamic airway compression",
    ]},
  ];

  const mnemonics = [
    { m: "LEMON", sub: "Difficult laryngoscopy", items: ["Look externally (dysmorphic)", "Evaluate 3-3-2", "Mallampati (unreliable <2 yr)", "Obstruction", "Neck mobility"] },
    { m: "MOANS", sub: "Difficult BVM",           items: ["Mask seal", "Obesity/Obstruction", "Age (>55 or <1 yr)", "No teeth", "Stiff lungs"] },
    { m: "RODS",  sub: "Difficult rigid scope",   items: ["Restricted mouth", "Obstruction above glottis", "Disrupted/Distorted airway", "Stiff c-spine"] },
  ];

  const rescueDevices = [
    { name: "Video Laryngoscopy (VL)", tone: "blue",
      sub: "First-line for anticipated difficult airway ≥10 kg",
      details: ["C-MAC / GlideScope / CMAC-D Blade — improves CL grade by 1–2", "Indirect view — do NOT align axes; angle blade and look at screen", "Use stylet angled 60–90° for GlideScope", "Max 3 attempts — each should be best attempt with full optimisation"] },
    { name: `2nd Gen LMA — iGel / LMA Supreme (size ${lmaSize} for ${weight} kg)`, tone: "violet",
      sub: "Best SGD for paediatric difficult airway",
      details: ["iGel: no cuff, gastric drain port, high seal pressure, fast insertion", "Can ventilate + protects against aspiration + allows FOB-guided intubation", "Insertion: lubricate caudal aspect, advance along hard palate — do not rotate", "Acceptable ETCO₂ confirmation if waveform present"] },
    { name: "Bougie / Airway Exchange Catheter", tone: "amber",
      sub: "Improves ETT placement with limited view",
      details: ["Paediatric bougie: 5 Fr Eschmann or Frova for children <10 yr", "Advance into trachea → feel tracheal rings → railroad ETT over bougie", "AEC: 11 Fr for ETT ≥5 mm · 8 Fr for ETT 3.5–5 mm", "O₂ insufflation via AEC: 1 L/min only — barotrauma risk"] },
    { name: "Surgical eFONA / Emergency Tracheostomy", tone: "red",
      sub: "When all 3 lifelines fail — CICO",
      details: ["Children ≥8 yr: scalpel–finger–tube technique through CTM", "Children <8 yr: CTM too small — cannula cricothyrotomy (16G) + jet vent (3–5 min bridge only)", "Preferred: call ENT / head-neck surgeon EARLY for emergency tracheostomy in infants", "Confirm placement: ETCO₂ waveform + bilateral breath sounds + CXR"] },
  ];

  return (
    <div className="space-y-4">
      <InfoBox tone="red" icon={Warning}>
        Difficult airway is life-threatening. Call for senior help early — do not wait until desaturation.
        Never allow SpO₂ to fall below 90% before escalating. Use the Vortex Approach cognitive aid.
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

      {/* PREDICTION */}
      {section === "predict" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-3" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Difficult Airway Predictors — Paediatric (AIDAA 2022)
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {predictors.map(g => (
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
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              LEMON / MOANS / RODS
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              {mnemonics.map(g => (
                <div key={g.m} className="space-y-1">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">{g.m}</div>
                  <div className="text-[10px] text-amber-500 dark:text-amber-500 font-mono mb-1">{g.sub}</div>
                  {g.items.map((item, i) => (
                    <div key={i} className="text-amber-800 dark:text-amber-200 text-[11px]">{item}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VORTEX */}
      {section === "vortex" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-0.5" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              The Vortex Approach — N. Chrimes 2016
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 font-mono">
              3 lifelines · best effort at each · fail → spiral inward → Neck Rescue.
              Green Zone = oxygenation maintained → pause · re-oxygenate · plan.
            </p>
            <a href="https://www.vortexapproach.org" target="_blank" rel="noopener noreferrer"
               className="text-[10px] font-mono text-blue-500 hover:underline block mb-3">
              vortexapproach.org ↗
            </a>

            <VortexSVG />

            {/* Lifeline cards */}
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {[
                { color: "blue",    num: "1", label: "Face Mask",
                  steps: ["2-person EC grip preferred — always better than 1-person", "OPA: insert to corner of mouth → ear pinna length", "NPA if OPA not tolerated; contraindicated in skull fracture", "Jaw thrust: fingers behind mandibular angles, push forward"] },
                { color: "violet",  num: "2", label: "Supraglottic Airway (SGA)",
                  steps: [`LMA size ${lmaSize} for ${weight} kg`, "2nd gen preferred: iGel / LMA Supreme", "Deflate cuff fully before insertion", "Max 2 attempts per operator — escalate after"] },
                { color: "emerald", num: "3", label: "Endotracheal Tube (ETT)",
                  steps: ["Optimise: head position, BURP, bougie, VL", "Video laryngoscopy preferred in DA", "Max 3 laryngoscopy attempts total", "Confirm placement: waveform ETCO₂ only"] },
              ].map(l => (
                <div key={l.num} className={`rounded-lg border p-3 ${TONE[l.color].border} ${TONE[l.color].bg}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${TONE[l.color].text} ${TONE[l.color].border} bg-white/50 dark:bg-black/20`}>
                      LIFELINE {l.num}
                    </span>
                  </div>
                  <div className={`font-bold text-xs mb-2 ${TONE[l.color].text}`}
                       style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{l.label}</div>
                  {l.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-200 mb-1">
                      <span className={`font-bold ${TONE[l.color].text} flex-shrink-0`}>{i + 1}.</span> {s}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Optimisation + Neck Rescue */}
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3">
                <div className="font-bold text-xs text-amber-700 dark:text-amber-300 mb-2">
                  5 Optimisation Categories (apply to each lifeline)
                </div>
                {["Position — head, neck, body", "Equipment — size, type, adjunct", "Person — most experienced operator", "External manoeuvre — BURP, jaw thrust", "Pharmacology — relaxant, topical LA"].map((o, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-200 mb-0.5">
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">{i + 1}.</span> {o}
                  </div>
                ))}
              </div>
              <div className={`rounded-lg border p-3 ${TONE.red.border} ${TONE.red.bg}`}>
                <div className={`font-bold text-xs mb-2 ${TONE.red.text}`}>
                  Neck Rescue — All 3 Lifelines Failed
                </div>
                <div className="space-y-1.5 text-[11px] text-red-800 dark:text-red-200">
                  <div><span className="font-semibold">≥8 yr:</span> Scalpel–finger–tube through CTM. 5.0 mm ETT, inflate cuff, confirm ETCO₂.</div>
                  <div><span className="font-semibold">&lt;8 yr:</span> CTM too small. 16G cannula + jet ventilation (1 s on / 4 s off). 3–5 min bridge only — CO₂ rises.</div>
                  <div><span className="font-semibold">Always:</span> Call ENT / surgeons early. Do NOT wait for cardiac arrest.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIBREOPTIC */}
      {section === "fob" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Fibreoptic Bronchoscope — {weight} kg
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Gold standard for anticipated difficult airway. ETT must be loaded BEFORE insertion.
            </p>
            <FOBSizingSVG />
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-3 text-xs text-sky-800 dark:text-sky-200 space-y-1">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">For {weight} kg</div>
                  <div className="font-bold">Scope OD: {fobScope}</div>
                  <div>Min ETT ID: {ettFOB} mm (loaded before inserting)</div>
                  <div className="opacity-80 text-[10px]">ETT must be ≥ scope OD + 0.8 mm</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1">Standard Technique</div>
                  {[
                    "Pre-oxygenate · glycopyrrolate 0.01 mg/kg IM (anti-sialagogue)",
                    "Load ETT on scope · lubricate generously",
                    "Topical lignocaine 4% spray max 4 mg/kg — nasal, pharynx, subglottic",
                    "Insert nasally (preferred) or orally via Berman/Ovassapian airway",
                    "Identify cords → advance → confirm carina view",
                    "Railroad ETT off scope while holding ETT fixed",
                    "Confirm with waveform ETCO₂ + bilateral breath sounds",
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
                    "Preferred ≥8–10 yr who can cooperate",
                    "IN dexmedetomidine 1–2 mcg/kg 30 min before (pre-med)",
                    "Topical lignocaine 4%: nasal, pharynx, subglottic",
                    "Maintain spontaneous ventilation throughout",
                    "Do NOT give muscle relaxant until airway confirmed",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <ArrowRight size={9} weight="bold" className="text-amber-500 flex-shrink-0 mt-0.5" />{s}
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-200 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">LMA-Guided FOB</div>
                  {[
                    "Insert LMA first for oxygenation",
                    "Pass FOB through LMA to identify glottis",
                    "Railroad ETT over FOB through LMA",
                    "Remove LMA over ETT — use exchange catheter technique",
                    "Useful when laryngoscopy fails but LMA ventilation is possible",
                  ].map((s, i) => (
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

      {/* RESCUE DEVICES */}
      {section === "devices" && (
        <div className="space-y-3">
          {rescueDevices.map(d => (
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

// ─── TAB 4: MONITORING ─────────────────────────────────────────────────────────
// Removed: ETCO₂ (covered in Ventilator tab), SpO₂ SVG, BVM SVG
function MonitoringView() {
  const { weight } = useWeight();
  const [section, setSection] = useState("spo2");

  const bpCuff = weight < 2 ? "Premature neonatal (2 cm)" : weight < 3 ? "Neonatal (2.5 cm)"
    : weight < 10 ? "Infant (4 cm)" : weight < 20 ? "Child (6 cm)"
    : weight < 30 ? "Small adult (8 cm)" : "Adult (10–12 cm)";

  const spo2Probes = [
    { age: "Neonate / Premature", site: "Wrap probe (foot/hand). Gelstix or Neonatal D-lite.",      warn: "Right hand = pre-ductal. Foot = post-ductal. Difference >3–4% = significant R→L shunt (PPHN)." },
    { age: "Infant (1–12 mo)",    site: "Foot/toe. Palm wrap. Masimo RD rainbow preferred.",         warn: "Motion artefact common. Pause suction/stimulation during reading." },
    { age: "Toddler–School",      site: "Finger clip or tape wrap. Index or middle finger.",          warn: "Nail polish (blue/black/green): remove or use alternate site." },
    { age: "Adolescent",          site: "Standard adult finger clip. Earlobe gives faster response.", warn: "COHb reads as normal SpO₂ in CO poisoning — use co-oximeter." },
  ];

  const spo2Limitations = [
    "Validated to SpO₂ ≥70% only — below this: inaccurate",
    "COHb reads as OxyHb → SpO₂ falsely normal in CO poisoning",
    "MetHaemoglobinaemia: SpO₂ reads ~85% regardless of true value",
    "Nail polish (blue, black, green): false low reading — use alternate site",
    "Pigmented skin: may overestimate SpO₂ by 2–3% (Masimo Root reduces this)",
    "Severe anaemia (Hb <5 g/dL): inaccurate",
    "Poor peripheral perfusion → use central site (ear, forehead)",
    "Ambient light in phototherapy: cover probe",
  ];

  const spo2Targets = [
    "Term neonate (room air): 94–98%. Avoid hyperoxia.",
    "Preterm <32 wks: 90–95% — higher increases ROP risk",
    "PPHN: pre-ductal (right hand) ≥95%",
    "Children on room air: ≥94%",
    "Post-ROSC: 94–99% — titrate FiO₂ (avoid hyperoxia)",
    "ARDS / PICU: 92–96% acceptable if allows FiO₂ reduction",
  ];

  const bvmSizes = [
    { size: "Neonatal bag",   vol: "250 mL",     use: "Premature and term neonates. Has pop-off valve at 40 cmH₂O." },
    { size: "Infant bag",     vol: "450 mL",     use: "Infants up to ~10 kg." },
    { size: "Paediatric bag", vol: "500–750 mL", use: "10–25 kg. Standard paediatric." },
    { size: "Adult bag",      vol: "1500 mL",    use: "Adolescents >25 kg." },
  ];

  const bvmTechnique = [
    "EC technique: thumb+index = C over mask · ring/middle/small = E on mandible",
    "2-person 2-hand technique preferred — always better seal than 1-person",
    "Jaw thrust: fingers behind mandibular angles, push forward (not occiput)",
    "OPA size: corner of mouth → centre of ear pinna",
    "NPA: use if OPA not tolerated · contraindicated in skull base fracture",
    "Infant: neutral position only — hyperextension kinks the trachea",
    "Sniffing position: children >2 yr only",
  ];

  const bvmFailures = [
    "Poor mask seal → 2-person 2-hand technique",
    "Airway obstruction → OPA/NPA, reposition, jaw thrust",
    "Gastric distension → insert NGT and decompress",
    "Pop-off valve limiting pressure → bypass in stiff lungs",
    "Wrong bag size → adult bag in infant = uncontrollable tidal volume",
  ];

  return (
    <div className="space-y-4">
      <InfoBox tone="amber" icon={Warning}>
        ETCO₂ interpretation is covered in the Ventilator tab. For RSI drugs see the Resuscitation tab.
      </InfoBox>

      <div className="flex flex-wrap gap-1.5">
        {[{ id: "spo2", label: "Pulse Oximetry" }, { id: "bp", label: "BP Measurement" }, { id: "bvm", label: "BVM" }].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
              section === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{s.label}</button>
        ))}
      </div>

      {/* SPO2 — text only, no SVG */}
      {section === "spo2" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-4">
          <div>
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Pulse Oximetry — Paediatric
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Beer-Lambert law · 660 nm (red) + 940 nm (infrared) · functional saturation only.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2">Probe Site by Age</div>
              <div className="space-y-2">
                {spo2Probes.map(r => (
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
                <div className={`font-bold text-xs mb-1.5 ${TONE.red.text}`}>Limitations</div>
                {spo2Limitations.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-800 dark:text-red-200">
                    <ArrowRight size={9} weight="bold" className="text-red-500 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
              <div className={`rounded-lg border p-3 ${TONE.emerald.border} ${TONE.emerald.bg}`}>
                <div className={`font-bold text-xs mb-1.5 ${TONE.emerald.text}`}>SpO₂ Targets</div>
                {spo2Targets.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-200">
                    <ArrowRight size={9} weight="bold" className="text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BP */}
      {section === "bp" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-4">
          <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            Blood Pressure — {weight} kg
          </div>
          <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
            <div className="text-[9px] font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
              Recommended cuff for {weight} kg
            </div>
            <div className="font-black text-2xl text-blue-700 dark:text-blue-300"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{bpCuff}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Width = 40% arm circumference · Length = 80–100% arm circumference
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
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
                    { aw: "Premature neonate",   cuff: "Premie",      width: "2 cm"   },
                    { aw: "Neonate (<3 kg)",      cuff: "Neonatal",    width: "2.5 cm" },
                    { aw: "Infant (3–10 kg)",     cuff: "Infant",      width: "4 cm"   },
                    { aw: "Child (10–20 kg)",     cuff: "Child",       width: "6 cm"   },
                    { aw: "School (20–30 kg)",    cuff: "Small adult", width: "8 cm"   },
                    { aw: "Adolescent (>30 kg)",  cuff: "Adult",       width: "12 cm"  },
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
            <div className="space-y-2 text-xs">
              {[
                { m: "Oscillometric NIBP",    u: "Standard. Measures MAP directly. Reliable >3 kg." },
                { m: "Auscultatory",          u: "Gold standard for diagnosis. K1 = systolic, K4/5 = diastolic." },
                { m: "Doppler",               u: "Best in neonates / poor perfusion. Systolic only." },
                { m: "Flush method",          u: "Neonates only. Gives MAP approximation." },
                { m: "Invasive (A-line)",     u: "ICU/theatre. Radial 20–22G. Continuous MAP." },
              ].map(m => (
                <div key={m.m} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2">
                  <div className="font-bold text-slate-800 dark:text-white text-[10px]">{m.m}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">{m.u}</div>
                </div>
              ))}
              <InfoBox tone="amber" icon={Warning} title="Cuff errors">
                Too small → falsely HIGH. Too large → falsely LOW. In shock: use Doppler or A-line.
              </InfoBox>
            </div>
          </div>
        </div>
      )}

      {/* BVM — text only, no SVG */}
      {section === "bvm" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-4">
          <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            Bag-Valve-Mask — {weight} kg
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs">
                <div className="font-bold text-slate-800 dark:text-white mb-2">Bag Sizes</div>
                {bvmSizes.map(b => (
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
                <div className="font-bold text-[10px] uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">
                  Ventilation Targets — {weight} kg
                </div>
                <div>Tidal volume: <strong>6–8 mL/kg = {Math.round(weight * 6)}–{Math.round(weight * 8)} mL</strong></div>
                <div>Rate: infants 20–40 · children 15–25 · adolescents 12–20 /min</div>
                <div>FiO₂: ~0.4 without reservoir · ~0.85–0.95 with reservoir + 10–15 L/min O₂</div>
                <div>Neonates: limit PIP to 20–25 cmH₂O (pop-off valve on bag)</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-200 space-y-1.5">
                <div className="font-bold text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Technique</div>
                {bvmTechnique.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckCircle size={9} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
              <div className={`rounded-lg border p-3 ${TONE.red.border} ${TONE.red.bg}`}>
                <div className={`font-bold text-xs mb-1.5 ${TONE.red.text}`}>Common Failures</div>
                {bvmFailures.map((s, i) => (
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

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────
const TABS = [
  { id: "table",      label: "Reference Table",       Icon: ClipboardText  },  // ← first
  { id: "equipment",  label: "Equipment Cards",       Icon: Wind          },
  { id: "difficult",  label: "Difficult Airway",      Icon: Warning       },
  { id: "monitoring", label: "Monitoring",            Icon: Pulse         },
];

export default function EquipmentTab() {
  const { weight }  = useWeight();
  const [activeTab, setActiveTab] = useState("table");  // ← default first

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
          Harriet Lane 23e · F&amp;L 7e · APLS · AIDAA 2022 · Vortex (Chrimes 2016 · vortexapproach.org)
        </p>
      </div>

      <InfoBox tone="amber" icon={Warning}>
        Always prepare ETT one size above and below. Cuffed preferred ≥8 kg.
        Confirm position with waveform ETCO₂ — not colorimetric alone.
        RSI drugs → Resuscitation tab. ETCO₂ patterns → Ventilator tab.
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
      {activeTab === "equipment"  && <EquipmentCardsView />}
      {activeTab === "difficult"  && <DifficultAirwayView />}
      {activeTab === "monitoring" && <MonitoringView />}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        Harriet Lane 23e · Fleischer &amp; Ludwig 7e · APLS · AIDAA 2022 ·
        Vortex Approach — N. Chrimes 2016 · vortexapproach.org · Morgan &amp; Mikhail 7e · AHA PALS 2020
      </div>
    </div>
  );
}
