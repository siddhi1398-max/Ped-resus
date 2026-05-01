// frontend/src/components/tabs/SedationAnalgesiaTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sedation & Analgesia reference tab
// Sections:
//   1. PSA Agent Comparison Table (from drugs.js data)
//   2. PSA Principles (pre/during/post procedure)
//   3. Common PSA Regimens
//   4. Local Anaesthetics Max Dose Table
//   5. Nerve Blocks
//   6. LAST Protocol
// Refs: Tintinalli ch.38 · F&L ch.4 · ACEP PSA guidelines · NYSORA · IAP
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Warning, Lightbulb, CaretDown, ArrowSquareOut, CheckCircle,
  Syringe, FirstAid, Wind,
} from "@phosphor-icons/react";

// ─── PSA AGENTS — derived from drugs.js (embedded here for self-contained tab) ─
const PSA_AGENTS = [
  {
    name: "Ketamine",
    class: "Dissociative",
    classColor: "violet",
    ivDose: "1–2 mg/kg IV",
    imDose: "4–5 mg/kg IM",
    inDose: "—",
    onset: "1 min IV / 5 min IM",
    duration: "10–20 min IV / 30–60 min IM",
    analgesia: true,
    amnesia: true,
    airway: "Maintained",
    airwayColor: "emerald",
    bp: "↑ / Stable",
    bpColor: "emerald",
    reversal: "None",
    bestFor: "Painful procedures: fracture, I&D, burns",
    cautions: "↑ICP (relative), psychosis, open globe, <3 mo",
    pearl: "First-line for ED PSA. Bronchodilates — ideal in asthma. Add midazolam 0.05 mg/kg to reduce emergence dysphoria.",
  },
  {
    name: "Propofol",
    class: "Hypnotic",
    classColor: "blue",
    ivDose: "1–2 mg/kg IV then 0.5 mg/kg PRN",
    imDose: "—",
    inDose: "—",
    onset: "30 s",
    duration: "5–10 min",
    analgesia: false,
    amnesia: true,
    airway: "Risk of apnoea",
    airwayColor: "red",
    bp: "↓ Hypotension",
    bpColor: "red",
    reversal: "None",
    bestFor: "Brief non-painful procedures, cardioversion, imaging",
    cautions: "Shock, compromised airway, egg/soy allergy (controversial)",
    pearl: "No analgesia — always combine with opioid. Antiemetic effect. Painful injection — pretreat with lidocaine 0.5 mg/kg IV.",
  },
  {
    name: "Midazolam",
    class: "Benzodiazepine",
    classColor: "sky",
    ivDose: "0.05–0.1 mg/kg IV (max 5 mg)",
    imDose: "0.1–0.2 mg/kg IM",
    inDose: "0.2 mg/kg IN (max 10 mg)",
    onset: "2 min IV / 5 min IN",
    duration: "30–60 min",
    analgesia: false,
    amnesia: true,
    airway: "Respiratory depression",
    airwayColor: "amber",
    bp: "Mild ↓",
    bpColor: "amber",
    reversal: "Flumazenil 0.01 mg/kg IV",
    bestFor: "Anxiolysis, procedures, seizures",
    cautions: "Paradoxical agitation in young children, elderly, cognitive impairment",
    pearl: "IN midazolam useful without IV. Titrate carefully — synergistic respiratory depression with opioids. COMFORT-B target 11–17 in ICU.",
  },
  {
    name: "Fentanyl",
    class: "Opioid",
    classColor: "orange",
    ivDose: "1–2 mcg/kg IV slow",
    imDose: "—",
    inDose: "1.5 mcg/kg IN",
    onset: "1 min IV / 5–10 min IN",
    duration: "30–60 min",
    analgesia: true,
    amnesia: false,
    airway: "Respiratory depression",
    airwayColor: "amber",
    bp: "Stable",
    bpColor: "emerald",
    reversal: "Naloxone 0.01 mg/kg IV",
    bestFor: "Analgesia, RSI co-induction, IN for needle-phobic patients",
    cautions: "Chest-wall rigidity with fast IV push — give over 3–5 min. Avoid rapid IN >1 mL/nostril.",
    pearl: "IN fentanyl: rapid analgesia without IV. Pre-ductal SpO₂ essential in neonates (right hand). 100× more potent than morphine.",
  },
  {
    name: "Ketofol (1:1 mix)",
    class: "Combination",
    classColor: "emerald",
    ivDose: "0.5–1 mg/kg of mixture IV titrated",
    imDose: "—",
    inDose: "—",
    onset: "30–60 s",
    duration: "5–10 min",
    analgesia: true,
    amnesia: true,
    airway: "Generally maintained",
    airwayColor: "emerald",
    bp: "Stable (synergy balances effects)",
    bpColor: "emerald",
    reversal: "None",
    bestFor: "Brief painful procedures requiring deep sedation",
    cautions: "Requires experienced provider, both drug cautions apply",
    pearl: "Ketamine offsets propofol hypotension; propofol reduces emergence reactions. Mix 1:1 in one syringe.",
  },
  {
    name: "Dexmedetomidine",
    class: "α2-agonist",
    classColor: "teal",
    ivDose: "Load 0.5–1 mcg/kg over 10 min, then 0.2–0.7 mcg/kg/hr",
    imDose: "—",
    inDose: "1–2 mcg/kg IN (procedural)",
    onset: "5–10 min IV",
    duration: "60–90 min",
    analgesia: false,
    amnesia: false,
    airway: "Preserved — no respiratory depression",
    airwayColor: "emerald",
    bp: "Bradycardia / hypotension",
    bpColor: "amber",
    reversal: "None",
    bestFor: "MRI/procedural sedation, ICU sedation, weaning agitation",
    cautions: "Bradycardia, hypotension, slow onset — not for emergency rescue",
    pearl: "Unique: sedation without respiratory depression. Patients arousable and cooperative. IN 2–3 mcg/kg excellent for MRI pre-medication.",
  },
  {
    name: "Nitrous oxide (50:50)",
    class: "Inhaled",
    classColor: "slate",
    ivDose: "—",
    imDose: "—",
    inDose: "Self-administered inhalation",
    onset: "30–60 s",
    duration: "5 min (rapid offset)",
    analgesia: true,
    amnesia: true,
    airway: "Self-maintained",
    airwayColor: "emerald",
    bp: "Stable",
    bpColor: "emerald",
    reversal: "None needed — offset rapid",
    bestFor: "Cooperative ≥5 yr: IV, lac repair, dressing change, minor reductions",
    cautions: "Pneumothorax, bowel obstruction, ↑ICP, B12 deficiency, <4 yr (cooperation needed)",
    pearl: "Child self-administers — inherent safety mechanism. No IV needed. Scavenging required. Fastest on/off of any PSA agent.",
  },
  {
    name: "Etomidate",
    class: "Hypnotic (RSI)",
    classColor: "red",
    ivDose: "0.3 mg/kg IV",
    imDose: "—",
    inDose: "—",
    onset: "30 s",
    duration: "5–10 min",
    analgesia: false,
    amnesia: true,
    airway: "Apnoea (RSI context)",
    airwayColor: "red",
    bp: "Neutral — haemodynamically stable",
    bpColor: "emerald",
    reversal: "None",
    bestFor: "RSI induction in haemodynamically unstable patients",
    cautions: "Adrenal suppression (single dose acceptable). Avoid in septic shock (controversial).",
    pearl: "Best haemodynamic profile for RSI in shocked patients. Myoclonus common but benign. Not for ongoing sedation.",
  },
];

// ─── COLOUR MAP ───────────────────────────────────────────────────────────────
const CMAP = {
  violet: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  blue:   "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  sky:    "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  orange: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  emerald:"bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  teal:   "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  slate:  "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  red:    "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  amber:  "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
};

// ─── SECTION TOGGLE ───────────────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{icon}</span>
          <span className="font-bold text-sm text-slate-900 dark:text-white"
                style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            {title}
          </span>
        </div>
        <CaretDown size={14} weight="bold"
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 py-4 bg-white dark:bg-slate-900/50">{children}</div>}
    </div>
  );
}

// ─── PSA AGENT TABLE ──────────────────────────────────────────────────────────
function PSAAgentTable({ weight }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
        Doses calculated for <span className="text-slate-900 dark:text-white font-bold">{weight} kg</span>.
        Click any agent to see clinical details.
      </p>

      {/* Scrollable table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-xs border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500 w-32">Agent</th>
              <th className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">IV Dose</th>
              <th className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">IN/IM Dose</th>
              <th className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">Onset / Duration</th>
              <th className="text-center px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">Analg.</th>
              <th className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">Airway</th>
              <th className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">BP</th>
              <th className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">Reversal</th>
            </tr>
          </thead>
          <tbody>
            {PSA_AGENTS.map(a => {
              const isOpen = expanded === a.name;

              // Compute weight-based dose where possible
              const wDose = (doseStr) => {
                if (!doseStr || doseStr === "—") return "—";
                const mgKg = doseStr.match(/([\d.]+)–?([\d.]*)\s*mg\/kg/);
                const mcgKg = doseStr.match(/([\d.]+)–?([\d.]*)\s*mcg\/kg/);
                if (mgKg) {
                  const lo = +(parseFloat(mgKg[1]) * weight).toFixed(1);
                  const hi = mgKg[2] ? +(parseFloat(mgKg[2]) * weight).toFixed(1) : null;
                  return hi ? `${lo}–${hi} mg` : `${lo} mg`;
                }
                if (mcgKg) {
                  const lo = +(parseFloat(mcgKg[1]) * weight).toFixed(0);
                  const hi = mcgKg[2] ? +(parseFloat(mcgKg[2]) * weight).toFixed(0) : null;
                  return hi ? `${lo}–${hi} mcg` : `${lo} mcg`;
                }
                return doseStr;
              };

              return (
                <>
                  <tr
                    key={a.name}
                    onClick={() => setExpanded(isOpen ? null : a.name)}
                    className={`border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${
                      isOpen ? "bg-slate-50 dark:bg-slate-800/60" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-slate-900 dark:text-white">{a.name}</div>
                      <span className={`inline-block text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border mt-0.5 ${CMAP[a.classColor]}`}>
                        {a.class}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{wDose(a.ivDose)}</div>
                      <div className="text-slate-400 text-[9px] mt-0.5">{a.ivDose}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-mono font-bold text-violet-600 dark:text-violet-400">{wDose(a.inDose)}</div>
                      <div className="text-slate-400 text-[9px] mt-0.5">{a.inDose !== "—" ? a.inDose : ""}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-slate-700 dark:text-slate-200">{a.onset}</div>
                      <div className="text-slate-400 text-[9px]">{a.duration}</div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {a.analgesia
                        ? <CheckCircle size={14} weight="fill" className="text-emerald-500 mx-auto" />
                        : <span className="text-slate-300 dark:text-slate-600 font-bold text-base leading-none">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${CMAP[a.airwayColor]}`}>
                        {a.airway}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${CMAP[a.bpColor]}`}>
                        {a.bp}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 text-[10px]">
                      {a.reversal}
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {isOpen && (
                    <tr key={`${a.name}-exp`} className="border-t border-slate-100 dark:border-slate-800">
                      <td colSpan={8} className="px-4 pb-4 pt-2 bg-slate-50 dark:bg-slate-800/50">
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Best For</div>
                            <p className="text-xs text-slate-700 dark:text-slate-200">{a.bestFor}</p>
                          </div>
                          <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-red-200 dark:border-red-800">
                            <div className="text-[9px] font-mono uppercase tracking-widest text-red-500 mb-1">Cautions</div>
                            <p className="text-xs text-slate-700 dark:text-slate-200">{a.cautions}</p>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center gap-1 mb-1">
                              <Lightbulb size={10} weight="fill" className="text-amber-500" />
                              <span className="text-[9px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400">Clinical Pearl</span>
                            </div>
                            <p className="text-xs text-amber-800 dark:text-amber-200">{a.pearl}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── LOCAL ANAESTHETIC TABLE ──────────────────────────────────────────────────
function LocalAnaestheticTable({ weight }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800">
            <th className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">Agent</th>
            <th className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">Max mg/kg</th>
            <th className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-blue-500">Max dose ({weight} kg)</th>
            <th className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">Concentration</th>
            <th className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">Onset</th>
            <th className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">Duration</th>
          </tr>
        </thead>
        <tbody>
          {LOCAL_ANAESTHETICS.map((la, i) => {
            const maxDose = la.mgPerKg && weight
              ? Math.min(+(la.mgPerKg * weight).toFixed(0), la.max || 9999)
              : "—";
            return (
              <tr key={i} className="border-t border-slate-100 dark:border-slate-800 odd:bg-white dark:odd:bg-slate-900/30">
                <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-white">{la.name}</td>
                <td className="px-3 py-2.5 font-mono font-bold text-slate-700 dark:text-slate-200">
                  {la.mgPerKg ? `${la.mgPerKg} mg/kg` : "Fixed"}
                </td>
                <td className="px-3 py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                  {la.mgPerKg ? `${maxDose} mg` : "—"}
                  {la.max && la.mgPerKg && +(la.mgPerKg * weight).toFixed(0) >= la.max && (
                    <span className="text-[8px] text-amber-500 ml-1">(capped at {la.max} mg)</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{la.concentration}</td>
                <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{la.onset}</td>
                <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{la.duration}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── NERVE BLOCK CARD ─────────────────────────────────────────────────────────
function NerveBlockCard({ block }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="text-left">
          <div className="font-bold text-sm text-slate-900 dark:text-white">{block.name}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{block.indication}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[9px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
            {block.duration}
          </span>
          <CaretDown size={12} weight="bold"
            className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Drug & Dose</div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
                {block.drug}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Nerves Blocked</div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
                {block.nerves}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Landmarks</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{block.landmarks}</p>
          </div>

          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Technique</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{block.technique}</p>
          </div>

          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            <Warning size={12} weight="fill" className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-800 dark:text-red-200">{block.cautions}</p>
          </div>

          {block.refUrl && (
            <a href={block.refUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-mono text-blue-600 dark:text-blue-400 hover:underline">
              <ArrowSquareOut size={11} weight="bold" />
              Reference / Cases
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SedationAnalgesiaTab() {
  const { weight } = useWeight();
  const [psaSection, setPsaSection] = useState("pre");

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Sedation &amp; Analgesia
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          PSA agents · Local anaesthetics · Nerve blocks · LAST protocol ·
          Tintinalli ch.38 · F&amp;L ch.4 · ACEP PSA guidelines · NYSORA · IAP
        </p>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
        <Warning size={13} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>
          All sedation and regional anaesthesia must be performed with appropriate monitoring, trained personnel,
          and emergency equipment immediately available. Reference only — individualise to patient.
        </span>
      </div>

      {/* ═══════════════════════════════════════════
          1. PSA AGENT TABLE
      ═══════════════════════════════════════════ */}
      <Section title="PSA Agent Comparison — Weight-Based Doses" icon="💉" defaultOpen={true}>
        <PSAAgentTable weight={weight} />
      </Section>

      {/* ═══════════════════════════════════════════
          2. PSA PRINCIPLES
      ═══════════════════════════════════════════ */}
      <Section title="PSA Principles — Pre / During / Post Procedure" icon="📋">
        {/* Sub-tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { id: "pre",   label: "Pre-Procedure",  icon: "📝" },
            { id: "during",label: "During",         icon: "⚡" },
            { id: "post",  label: "Post-Procedure", icon: "✅" },
          ].map(t => (
            <button key={t.id} onClick={() => setPsaSection(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                psaSection === t.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {(psaSection === "pre"
            ? PSA_PRINCIPLES.preProcedure
            : psaSection === "during"
            ? PSA_PRINCIPLES.duringProcedure
            : PSA_PRINCIPLES.postProcedure
          ).map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[9px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {item}
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════
          3. PSA REGIMENS
      ═══════════════════════════════════════════ */}
      <Section title="Common PSA Regimens" icon="🧪">
        <div className="space-y-3">
          {PSA_REGIMENS.map((r, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="font-bold text-sm text-slate-900 dark:text-white">{r.name}</div>
                <div className="font-mono text-xs text-blue-600 dark:text-blue-400 mt-0.5">{r.dosing}</div>
              </div>
              <div className="px-4 py-3 grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Onset / Duration</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">{r.onset} · {r.duration}</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Best Indication</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">{r.indication}</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-emerald-500 mb-1">Pros</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">{r.pros}</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-red-500 mb-1">Cons / Cautions</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">{r.cons} {r.cautions && `· ${r.cautions}`}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════
          4. LOCAL ANAESTHETICS
      ═══════════════════════════════════════════ */}
      <Section title="Local Anaesthetic Safe Dose Reference" icon="💊">
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Maximum doses for <span className="text-slate-900 dark:text-white font-bold">{weight} kg</span> patient.
            NEVER exceed absolute maximum regardless of weight.
          </p>
          <LocalAnaestheticTable weight={weight} />
          <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2.5 text-xs text-red-800 dark:text-red-200">
            <Warning size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-red-500" />
            <span>
              <strong>NEVER use adrenaline-containing solutions</strong> for digital blocks (fingers/toes), penile blocks, or other end-artery sites. Risk of irreversible ischaemia.
            </span>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════
          5. NERVE BLOCKS
      ═══════════════════════════════════════════ */}
      <Section title="Pediatric ED Nerve Blocks" icon="🎯">
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2 text-xs text-blue-800 dark:text-blue-200">
            <Lightbulb size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-blue-500" />
            <span>Ultrasound guidance preferred for most blocks. Aspirate every 5 mL. Monitor for LAST (see below). Reference: baby-blocks.com · NYSORA</span>
          </div>
          {NERVE_BLOCKS.map(block => (
            <NerveBlockCard key={block.id} block={block} />
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════
          6. LAST PROTOCOL
      ═══════════════════════════════════════════ */}
      <Section title="LAST — Local Anaesthetic Systemic Toxicity" icon="🚨">
        <div className="space-y-4">
          {/* Signs */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">Signs & Symptoms</div>
            <div className="space-y-1.5">
              {LAST_PROTOCOL.signs.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Warning size={11} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Management */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-red-500 mb-2">Emergency Management</div>
            <div className="space-y-2">
              {LAST_PROTOCOL.management.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5 ${
                    i < 2 ? "bg-red-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }`}>
                    {i + 1}
                  </span>
                  <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{step}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Intralipid box */}
          <div className="rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="font-black text-red-700 dark:text-red-300 text-sm mb-2"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              20% INTRALIPID RESCUE — {weight} kg
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-red-500 mb-1">Bolus</div>
                <div className="font-mono font-bold text-red-700 dark:text-red-300 text-lg">
                  {+(1.5 * weight).toFixed(0)} mL
                </div>
                <div className="text-red-600 dark:text-red-400">1.5 mL/kg over 1 min. Repeat q5 min × 2.</div>
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-red-500 mb-1">Infusion</div>
                <div className="font-mono font-bold text-red-700 dark:text-red-300 text-lg">
                  {+(0.25 * weight).toFixed(0)}–{+(0.5 * weight).toFixed(0)} mL/min
                </div>
                <div className="text-red-600 dark:text-red-400">0.25–0.5 mL/kg/min. Max 12 mL/kg total.</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        Tintinalli ch.38 · Fleischer &amp; Ludwig ch.4 · ACEP PSA Guidelines 2014 · NYSORA · baby-blocks.com · IAP Analgesia &amp; Sedation 2021
      </div>
    </div>
  );
}
