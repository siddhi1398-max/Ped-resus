// DrugsTab.jsx
// Sub-tabs: Drug Doses Table · Nebulised Drugs
// Sources: Piyush Gupta 18th Ed · IAP · Ontario Lung Care Pathway · GINA Paediatric

import { useState, useMemo } from "react";
import { useWeight } from "../../context/WeightContext";
import { DRUGS, DRUG_CATEGORIES, computeDrugDose } from "../../data/drugs";
import { Input } from "../ui/input";
import {
  MagnifyingGlass, Warning, Lightbulb, ArrowRight,
  Wind, Pill, CheckCircle, Info,
} from "@phosphor-icons/react";

// ─── COLOUR MAP ────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  resuscitation:  "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-300 dark:border-red-900",
  sedation:       "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 border-purple-300 dark:border-purple-900",
  antibiotic:     "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-300 dark:border-blue-900",
  fluid:          "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200 border-cyan-300 dark:border-cyan-900",
  airway:         "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-900",
  analgesia:      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-900",
  anticonvulsant: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200 border-fuchsia-300 dark:border-fuchsia-900",
  other:          "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
};

const TONE = {
  red:     { text: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-950/30",       border: "border-red-200 dark:border-red-800"       },
  emerald: { text: "text-emerald-600 dark:text-emerald-400",bg: "bg-emerald-50 dark:bg-emerald-950/30",border: "border-emerald-200 dark:border-emerald-800"},
  amber:   { text: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-amber-200 dark:border-amber-800"   },
  blue:    { text: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200 dark:border-blue-800"     },
  sky:     { text: "text-sky-600 dark:text-sky-400",       bg: "bg-sky-50 dark:bg-sky-950/30",       border: "border-sky-200 dark:border-sky-800"       },
  violet:  { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800" },
  slate:   { text: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-50 dark:bg-slate-900/50",   border: "border-slate-200 dark:border-slate-700"   },
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

// ─── WEIGHT-AWARE DOSE HELPERS ─────────────────────────────────────────────────

/**
 * Replaces "X mg/kg" and "X–Y mg/kg" / "X mcg/kg" patterns with computed values.
 * Also handles "X–Y mcg/kg/min" style infusion rates.
 */
function computeNebDose(doseStr, weight) {
  if (!weight || !doseStr) return doseStr;

  let result = doseStr;

  // Range: "0.15–0.3 mg/kg/hr" → "X.XX–X.XX mg/hr"
  result = result.replace(
    /([\d.]+)[–-]([\d.]+)\s*(mg|mcg)\/kg(\/(?:hr|min|day))?/g,
    (_, lo, hi, unit, per) => {
      const suffix = per || "";
      const loVal = (parseFloat(lo) * weight).toFixed(2);
      const hiVal = (parseFloat(hi) * weight).toFixed(2);
      return `${loVal}–${hiVal} ${unit}${suffix} [for ${weight} kg]`;
    }
  );

  // Single: "0.5 mg/kg" → "X.XX mg"
  result = result.replace(
    /([\d.]+)\s*(mg)\/kg(\/(?:hr|min|day))?/g,
    (_, n, unit, per) => {
      const suffix = per || "";
      return `${(parseFloat(n) * weight).toFixed(2)} ${unit}${suffix} [for ${weight} kg]`;
    }
  );

  // Single mcg/kg
  result = result.replace(
    /([\d.]+)\s*mcg\/kg(\/(?:hr|min|day))?/g,
    (_, n, per) => {
      const suffix = per || "";
      return `${(parseFloat(n) * weight).toFixed(1)} mcg${suffix} [for ${weight} kg]`;
    }
  );

  return result;
}

/**
 * Parses weight-bracket dose strings like:
 *   "<20 kg: 2.5 mg · ≥20 kg: 5 mg"
 * and returns an array of { text, active } so the inapplicable bracket
 * can be visually dimmed.
 */
function resolveWeightBracket(doseStr, weight) {
  if (!weight || !doseStr) return [{ text: doseStr, active: true }];

  // Only process strings that actually contain weight brackets
  const hasBracket = /[<≥>]\s*\d+\s*kg/i.test(doseStr);
  if (!hasBracket) return [{ text: computeNebDose(doseStr, weight), active: true }];

  const parts = doseStr.split(/\s*·\s*/).map(s => s.trim());

  return parts.map(part => {
    const ltMatch  = part.match(/^<\s*(\d+)\s*kg/i);
    const gteMatch = part.match(/^[≥>=]+\s*(\d+)\s*kg/i);
    const lteMatch = part.match(/^≤\s*(\d+)\s*kg/i);

    let active = true;
    if (ltMatch)  active = weight <  parseFloat(ltMatch[1]);
    if (gteMatch) active = weight >= parseFloat(gteMatch[1]);
    if (lteMatch) active = weight <= parseFloat(lteMatch[1]);

    return { text: computeNebDose(part, weight), active };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEBULISED DRUG DATA
// Sources: Piyush Gupta 18th Ed · IAP Asthma / Bronchiolitis Guidelines
//          Ontario Lung Care Pathway (CHEO / McMaster) · GINA 2024 Paediatric
//          CIMS India / Drug Today India 2024 (Indian brands)
// ═══════════════════════════════════════════════════════════════════════════════
const NEBULISED_DRUGS = [
  // ── BRONCHODILATORS ──────────────────────────────────────────────────────
  {
    id: "salbutamol-neb",
    drug: "Salbutamol (Albuterol)",
    class: "SABA",
    classColor: "blue",
    brands: "Asthalin (Cipla) · Ventolin (GSK) · Salbair (Intas) · Salamol (Glenmark)",
    formulations: "Respules: 2.5 mg/2.5 mL · 5 mg/2.5 mL · Solution: 5 mg/mL (dilute before use)",
    dose: {
      mild_mod: "<20 kg: 2.5 mg · ≥20 kg: 5 mg",
      severe:   "Continuous nebulisation 0.15–0.3 mg/kg/hr (max 15 mg/hr) in ICU",
      mdi:      "4–8 puffs (100 mcg/puff) via spacer — preferred over nebuliser (IAP 2022)",
    },
    frequency: "Q20 min × 3 (acute) → Q4–6 hr (maintenance)",
    diluent: "2–3 mL NS to total volume 4 mL",
    onset: "5 min",
    duration: "4–6 hr",
    indications: ["Acute asthma (all severities)", "Bronchospasm", "Hyperkalemia (adjunct, high-dose)", "COPD exacerbation"],
    cautions: ["Tachycardia, tremor, hypokalaemia (high doses)", "Paradoxical bronchospasm (rare)", "IV salbutamol available for refractory: 5–10 mcg/kg over 15 min then 1–5 mcg/kg/min"],
    pearl: "MDI + spacer is preferred over nebuliser for mild-moderate asthma (equivalent efficacy, faster, fewer side effects — IAP 2022, GINA 2024). Nebuliser preferred in severe/critical or child unable to use MDI.",
  },
  {
    id: "ipratropium-neb",
    drug: "Ipratropium Bromide",
    class: "SAMA",
    classColor: "violet",
    brands: "Ipravent (Sun Pharma) · Ipratop · Duolin (combined with salbutamol — Cipla) · Tiova",
    formulations: "Ipravent Respules: 250 mcg/mL · 500 mcg/2 mL · Duolin Respules: Salbutamol 2.5 mg + Ipratropium 500 mcg/2.5 mL",
    dose: {
      mild_mod: "<5 yr: 250 mcg · ≥5 yr: 500 mcg",
      note:     "Add to salbutamol for FIRST 1–2 hr only in moderate-severe asthma",
    },
    frequency: "Q20 min × 3 (first hr only) — no benefit beyond initial doses (IAP, Ontario)",
    diluent: "Add to salbutamol respule to reach 4 mL total (or use Duolin combination)",
    onset: "15–20 min",
    duration: "4–6 hr",
    indications: ["Moderate-severe acute asthma (combined with SABA)", "COPD exacerbation"],
    cautions: ["Avoid getting into eyes (mydriasis, blurred vision)", "Dry mouth, urinary retention", "No benefit in bronchiolitis"],
    pearl: "Use Duolin respules (combined formulation) for convenience in moderate-severe asthma. Do NOT use beyond first 1–2 hr — no added benefit (Cochrane, Ontario Pathway). Not indicated in bronchiolitis or viral wheeze.",
  },
  {
    id: "budesonide-neb",
    drug: "Budesonide",
    class: "ICS",
    classColor: "emerald",
    brands: "Budecort (Cipla) · Pulmicort (AstraZeneca) · Budeair (Intas) · Budamate (combined — Sun)",
    formulations: "Respules: 0.25 mg/2 mL · 0.5 mg/2 mL · 1 mg/2 mL",
    dose: {
      croup:    "2 mg single dose (equal to 0.6 mg/kg dexamethasone PO for moderate-severe croup)",
      asthma:   "0.5–1 mg BD (maintenance nebulised ICS — when MDI not possible)",
      note:     "For croup: 2 mg via nebuliser if PO/IM dexamethasone not possible",
    },
    frequency: "Croup: single dose · Maintenance: BD",
    diluent: "Can use undiluted or add NS to 4 mL",
    onset: "30–60 min (croup effect within 2 hr)",
    duration: "12–24 hr",
    indications: ["Croup (moderate-severe, when oral dexamethasone not possible)", "Asthma maintenance (nebulised ICS — younger children)", "Subglottic oedema"],
    cautions: ["Oral candidiasis with long-term use (rinse mouth after)", "Adrenal suppression with high chronic doses", "In croup: oral dexamethasone 0.6 mg/kg preferred — nebulised budesonide is an alternative"],
    pearl: "Piyush Gupta: Nebulised budesonide 2 mg equivalent to oral dexamethasone 0.6 mg/kg in croup — use when oral/IM route not possible. In asthma: MDI + spacer preferred over routine nebulisation for ICS delivery.",
  },
  {
    id: "adrenaline-neb",
    drug: "Adrenaline (Epinephrine) 1:1000",
    class: "Vasoconstrictive",
    classColor: "red",
    brands: "Adrenaline IP 1 mg/mL (1:1000) — Neon Labs · Troikaa · AstraZeneca · Generic",
    formulations: "Adrenaline 1:1000 (1 mg/mL) ampoules — 1 mL · Multi-dose vials",
    dose: {
      croup:   "0.5 mL/kg of 1:1000 undiluted (max 5 mL) — make up to 4 mL with NS",
      racemic: "Racemic epinephrine 2.25%: 0.05 mL/kg (max 0.5 mL) in 3 mL NS — not widely available in India",
      note:    "L-adrenaline 1:1000 at 0.5 mL/kg = racemic 2.25% at 0.05 mL/kg — equivalent efficacy (Piyush Gupta)",
    },
    frequency: "Q20–30 min PRN in moderate-severe croup. Observe ≥2–4 hr after last dose (rebound stridor)",
    diluent: "Make up to 4 mL with NS",
    onset: "10–30 min",
    duration: "1–2 hr (rebound stridor risk at 2–3 hr)",
    indications: ["Croup (moderate-severe, stridor at rest)", "Post-extubation stridor", "Anaphylaxis (as bridge only — IM adrenaline is definitive)"],
    cautions: ["Observe MINIMUM 2–4 hr after nebulisation for rebound stridor", "Rebound occurs as vasoconstrictive effect wears off", "Tachycardia, pallor, tremor", "Do NOT discharge immediately after nebulised adrenaline"],
    pearl: "L-adrenaline 1:1000 is the standard in India (racemic not widely available). Dose 0.5 mL/kg undiluted, dilute to 4 mL. Effect transient — always give systemic dexamethasone concurrently (dexamethasone is the definitive treatment).",
  },
  {
    id: "hypertonic-saline-neb",
    drug: "Hypertonic Saline 3%",
    class: "Mucoactive",
    classColor: "sky",
    brands: "Neosal (Glenmark) · Saline Neb 3% · Pharmasal · Hypersal · Compounded 3% NaCl",
    formulations: "3% NaCl ampoules/vials 4–5 mL · Some brands available as 6% · Compounded from 30% NaCl stock",
    dose: {
      bronchiolitis: "4 mL 3% NaCl Q4–8 hr (nebulised)",
      note:          "Evidence inconsistent — IAP 2020 does NOT recommend routine use. Some centres use if admitted.",
    },
    frequency: "Q4–8 hr if used",
    diluent: "Use undiluted (4 mL 3% NaCl per dose)",
    onset: "15–30 min",
    duration: "4–8 hr",
    indications: ["Bronchiolitis (moderate-severe, hospitalised — inconsistent evidence)", "Cystic fibrosis airway clearance", "Viscous secretion management"],
    cautions: ["Bronchospasm — pretreat with salbutamol if wheeze present", "IAP 2020: NOT routinely recommended for bronchiolitis", "Ontario: may use in admitted patients but not in ED for discharge"],
    pearl: "Cochrane 2017: modest reduction in length of stay in hospitalised bronchiolitis, no significant ED benefit. IAP 2020 does not recommend routine use. If used, pretreat with salbutamol and give with suction available.",
  },
  {
    id: "dornase-alfa-neb",
    drug: "Dornase Alfa (rhDNase)",
    class: "Mucolytic",
    classColor: "emerald",
    brands: "Pulmozyme (Genentech/Roche) — expensive, limited availability India",
    formulations: "Pulmozyme 2.5 mg/2.5 mL single-use ampule",
    dose: { cf: "2.5 mg OD (standard) · BD for severe disease or >21 yr" },
    frequency: "OD or BD as per pulmonologist guidance",
    diluent: "Use undiluted",
    onset: "Weeks (mucociliary clearance effect)",
    duration: "Ongoing (chronic therapy)",
    indications: ["Cystic fibrosis — reduces exacerbation frequency and improves FEV1", "NOT for general use or acute bronchiolitis"],
    cautions: ["Specialist/CF clinic guidance required", "Very expensive — limited insurance coverage India", "Not for acute ED use"],
    pearl: "CF-specific agent. Not for general paediatric use. Prescribe only under specialist CF guidance. Shown to reduce exacerbations and hospitalisation in CF.",
  },
  {
    id: "salbutamol-hyperK",
    drug: "Salbutamol (Hyperkalemia — high dose)",
    class: "SABA (metabolic)",
    classColor: "amber",
    brands: "Same as salbutamol above — Asthalin 5 mg/2.5 mL, Ventolin",
    formulations: "Asthalin 5 mg/2.5 mL respules (use 2 respules for full dose in large child)",
    dose: {
      hyperK: "2.5 mg (<25 kg) · 5 mg (≥25 kg) nebulised — onset 30 min, adjunct only",
      note:   "NOT a substitute for calcium or insulin-dextrose — temporising measure only",
    },
    frequency: "Single dose — may repeat. Adjunct to definitive treatment",
    diluent: "As standard nebulisation",
    onset: "30 min (K⁺ shift)",
    duration: "2–4 hr",
    indications: ["Hyperkalaemia (adjunct — shifts K⁺ intracellularly via β2)"],
    cautions: ["Temporary effect only — K⁺ returns to baseline when drug wears off", "Must combine with calcium gluconate and insulin-dextrose", "Tachycardia — caution in cardiac disease"],
    pearl: "Nebulised salbutamol 5–20 mg reduces serum K⁺ by 0.5–1 mmol/L. Quick to administer — useful while setting up IV insulin. Combine, not replace, definitive treatment.",
  },
];

// ─── SPACER GUIDANCE DATA ──────────────────────────────────────────────────────
const SPACER_DEVICES = [
  {
    age:   "0–2 yr",
    mask:  "Round infant mask (soft seal)",
    device:"Aerochamber Plus (small mask) · Babyhaler (GSK) · Volumatic + infant mask",
    notes: "Crying during inhalation reduces drug delivery. Use when calm/sleeping if possible. 5–10 slow breaths per puff.",
  },
  {
    age:   "2–6 yr",
    mask:  "Child mask or mouthpiece (if can seal)",
    device:"Aerochamber Plus Flow-Vu · Volumatic (GSK) · BreathAlert (Indian)",
    notes: "Mouthpiece preferred once child can seal lips (usually ≥4 yr). Tidal breathing technique. 5–10 breaths per puff.",
  },
  {
    age:   "6+ yr",
    mask:  "Mouthpiece",
    device:"Aerochamber Plus Flow-Vu · Volumatic · Inhalaid · SpaceChamber",
    notes: "Slow deep breath or tidal breathing × 5–10. Wait 30–60 s between puffs. Rinse mouth after ICS.",
  },
];

const MDI_STEPS = [
  "Shake the inhaler well for 5 seconds",
  "Attach MDI to spacer — exhale fully",
  "Seal mask firmly over nose and mouth (or mouthpiece between lips, sealing with teeth and lips)",
  "Press MDI canister once — hear or see the puff enter the spacer",
  "Breathe in slowly and deeply (or tidal breathing × 5–10 breaths for children who cannot slow-breathe)",
  "Hold breath 5–10 seconds if possible (older children)",
  "Wait 30–60 seconds before repeating for the next puff",
  "After ICS use: rinse mouth and spit — prevents oral candidiasis",
];

const SPACER_CARE = [
  "Wash spacer weekly with warm soapy water — do NOT rub dry (static reduces drug delivery)",
  "Allow to air-dry — reassemble without touching inside",
  "Replace mask or spacer if cracked, deformed, or valve sticking",
  "Replace approximately every 6–12 months with regular use",
  "Metal/conducting spacers (Volumatic, Inhalaid) less affected by static",
  "Prime new plastic spacers with 5–10 puffs before first use (coats the chamber)",
];

// ─── NEBULISER TECHNIQUE ──────────────────────────────────────────────────────
const NEB_TECHNIQUE = [
  "Prepare drug: draw up correct dose, dilute with NS to 4 mL total volume",
  "Use appropriate mask size — cover nose AND mouth fully without leaks",
  "Sit upright (or semi-reclined in infants — improves drug deposition)",
  "Run at 6–8 L/min O₂ or air — generates particle size 1–5 µm (respirable range)",
  "Treatment complete when spitting/sputtering — typically 8–12 min",
  "Tap nebuliser cup midway — recovers drug pooled at edges",
  "Discard residual (>0.5 mL dead volume in cup) — expected loss",
  "Wash mask and cup with warm water after each use · Air dry",
];

// ─── DOSE DISPLAY COMPONENT ────────────────────────────────────────────────────
// Renders a single dose value string with weight-bracket highlighting and
// per-kg computation. Active bracket is bold; inactive is dimmed + struck.
function DoseValue({ doseStr, weight, toneText }) {
  const parts = resolveWeightBracket(doseStr, weight);

  // Single part (no brackets) — just render inline
  if (parts.length === 1) {
    return <span className={`text-xs font-semibold ${toneText}`}>{parts[0].text}</span>;
  }

  // Multiple brackets — render each with active/inactive styling
  return (
    <span className="text-xs font-semibold">
      {parts.map(({ text, active }, i) => (
        <span key={i}>
          {i > 0 && <span className="text-slate-300 dark:text-slate-600 mx-1">·</span>}
          <span className={
            active
              ? toneText
              : "text-slate-400 dark:text-slate-600 line-through text-[10px]"
          }>
            {text}
          </span>
        </span>
      ))}
    </span>
  );
}

// ─── NEBULISED DRUG CARD ─────────────────────────────────────────────────────
function NebDrugCard({ drug, weight }) {
  const [open, setOpen] = useState(false);
  const t = TONE[drug.classColor] || TONE.slate;

  // Preview dose shown in collapsed header — first dose entry, first bracket resolved
  const previewDoseStr = Object.values(drug.dose)[0].split("·")[0].trim();
  const previewParts   = resolveWeightBracket(previewDoseStr, weight);
  const previewActive  = previewParts.find(p => p.active) || previewParts[0];

  return (
    <div className={`border rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 ${open ? "border-slate-300 dark:border-slate-600" : "border-slate-200 dark:border-slate-700"}`}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900 dark:text-white"
                    style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{drug.drug}</span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${t.text} ${t.border} ${t.bg} flex-shrink-0`}>
                {drug.class}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{drug.brands.split(" · ")[0]} · {drug.brands.split(" · ")[1]}</div>
          </div>
        </div>

        {/* Collapsed dose preview — shows weight-resolved active bracket */}
        <div className={`text-[10px] font-mono font-bold flex-shrink-0 mr-2 ${t.text}`}>
          {previewActive.text}
        </div>

        <ArrowRight size={12} weight="bold" className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-4">

          {/* Dose table */}
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2">Doses</div>
            <div className="space-y-1.5">
              {Object.entries(drug.dose).map(([k, v]) => (
                <div key={k} className={`rounded-lg px-3 py-2 border ${t.border} ${t.bg}`}>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">{k.replace(/_/g," ")}</div>
                  {/* Weight-aware dose rendering */}
                  <DoseValue doseStr={v} weight={weight} toneText={t.text} />
                </div>
              ))}
            </div>
            {/* Weight indicator */}
            {weight && (
              <div className="mt-1.5 text-[9px] font-mono text-slate-400 flex items-center gap-1">
                <span className={`font-bold ${t.text}`}>⚖ {weight} kg</span>
                <span>· doses above computed for this weight</span>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-3">
              {/* Formulations + Indian brands */}
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Indian Brands &amp; Formulations</div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-white">{drug.brands}</div>
                  <div className="text-slate-500 dark:text-slate-400">{drug.formulations}</div>
                </div>
              </div>

              {/* Diluent + frequency */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">Diluent</div>
                  <div className="font-semibold text-slate-800 dark:text-white">{drug.diluent}</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">Frequency</div>
                  <div className="font-semibold text-slate-800 dark:text-white">{drug.frequency}</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">Onset</div>
                  <div className="font-semibold text-slate-800 dark:text-white">{drug.onset}</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">Duration</div>
                  <div className="font-semibold text-slate-800 dark:text-white">{drug.duration}</div>
                </div>
              </div>

              {/* Indications */}
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Indications</div>
                <div className="space-y-1">
                  {drug.indications.map((ind, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-200">
                      <CheckCircle size={9} weight="fill" className={`${t.text} flex-shrink-0 mt-0.5`} />{ind}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-3">
              {/* Cautions */}
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Warning size={11} weight="fill" className="text-red-500" />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-red-600 dark:text-red-400">Cautions</span>
                </div>
                <div className="space-y-1">
                  {drug.cautions.map((c, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-red-800 dark:text-red-200">
                      <ArrowRight size={9} weight="bold" className="text-red-500 flex-shrink-0 mt-0.5" />{c}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pearl */}
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Info size={11} weight="fill" className="text-amber-500" />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400">Clinical Pearl</span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{drug.pearl}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEBULISED DRUGS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function NebulisedDrugsTab({ weight }) {
  const [section, setSection] = useState("drugs");

  return (
    <div className="space-y-4">
      <InfoBox tone="blue" icon={Wind}>
        MDI + spacer is preferred over nebuliser for mild-moderate asthma across all ages — equivalent efficacy, faster, more portable, fewer side effects (IAP 2022 · GINA 2024 · Piyush Gupta 18e). Reserve nebuliser for severe exacerbations, very young infants, or inability to use MDI.
      </InfoBox>

      {/* Section nav */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: "drugs",   label: "Nebulised Drugs"     },
          { id: "spacer",  label: "Spacer / MDI Guide"  },
          { id: "technique", label: "Nebuliser Technique"},
        ].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
              section === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{s.label}</button>
        ))}
      </div>

      {/* ── NEBULISED DRUGS ── */}
      {section === "drugs" && (
        <div className="space-y-3">
          {NEBULISED_DRUGS.map(drug => (
            <NebDrugCard key={drug.id} drug={drug} weight={weight} />
          ))}

          {/* Combination reference */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-3 text-slate-800 dark:text-white"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Combination Protocols</div>
            <div className="space-y-3">
              {[
                {
                  name: "Acute Moderate Asthma", tone: "blue",
                  steps: [
                    "Salbutamol 2.5 mg (<20 kg) or 5 mg (≥20 kg) + Ipratropium 250/500 mcg Q20 min × 3 (first hr)",
                    "Use Duolin respules (combined) for convenience — dilute to 4 mL with NS",
                    "Prednisolone 1–2 mg/kg PO (or Dexamethasone 0.6 mg/kg × 2 doses) concurrently",
                    "After first hr: Salbutamol alone Q20 min × 3 more if needed, then Q4–6 hr",
                  ],
                },
                {
                  name: "Croup — Moderate (Stridor at Rest)", tone: "amber",
                  steps: [
                    "Dexamethasone 0.6 mg/kg PO/IV (max 10 mg) — FIRST-LINE (Piyush Gupta, IAP)",
                    "If oral not possible: Nebulised Budesonide 2 mg × 1 dose (alternative, not preferred)",
                    "Stridor at rest: Adrenaline 1:1000 — 0.5 mL/kg (max 5 mL) in 3.5 mL NS nebulised",
                    "Observe minimum 2–4 hr post-adrenaline for rebound stridor before discharge",
                  ],
                },
                {
                  name: "Bronchiolitis — Supportive Only", tone: "red",
                  steps: [
                    "IAP 2020: NO salbutamol, NO steroids, NO routine hypertonic saline",
                    "O₂ if SpO₂ <92% via nasal prongs. HFNC if increasing WOB",
                    "Do NOT nebulise routine bronchodilators — no proven benefit (multiple RCTs)",
                    "If wheeze + possible asthma: one-time salbutamol trial, assess response in 30 min",
                  ],
                },
                {
                  name: "Severe/Life-Threatening Asthma", tone: "red",
                  steps: [
                    "Salbutamol continuous nebulisation: 0.15–0.3 mg/kg/hr (max 15 mg/hr) via nebuliser",
                    "IV MgSO₄ 25–50 mg/kg (max 2.5 g) over 20 min simultaneously",
                    "IV Salbutamol 5–10 mcg/kg over 15 min then 1–5 mcg/kg/min infusion (ICU)",
                    "Intubation last resort — ketamine induction (bronchodilator), use heliox if available",
                  ],
                },
              ].map(combo => {
                const t = TONE[combo.tone];
                return (
                  <div key={combo.name} className={`rounded-lg border p-3 ${t.border} ${t.bg}`}>
                    <div className={`font-bold text-xs mb-2 ${t.text}`}
                         style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{combo.name}</div>
                    <div className="space-y-1">
                      {combo.steps.map((s, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-200">
                          <span className={`font-bold ${t.text} flex-shrink-0 text-[10px]`}>{i+1}.</span>
                          {/* Resolve weight-based doses inside combo protocol steps */}
                          {computeNebDose(s, weight)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-mono text-center">
            Piyush Gupta Textbook 18e · IAP Asthma &amp; Bronchiolitis Guidelines 2020/2022 · GINA 2024 Paediatric · Ontario CHEO Lung Care Pathway
          </p>
        </div>
      )}

      {/* ── SPACER / MDI GUIDE ── */}
      {section === "spacer" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
            <div className="font-bold text-sm mb-2 text-blue-700 dark:text-blue-300"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Why MDI + Spacer is Preferred (GINA 2024 · IAP 2022)
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-xs text-blue-800 dark:text-blue-200">
              {[
                "Equivalent bronchodilation to nebuliser in mild-moderate acute asthma (Cochrane 2013)",
                "Less systemic absorption → fewer side effects (less tachycardia, hypokalaemia)",
                "Faster to set up — no wet circuit preparation required",
                "Can deliver O₂ through facemask while using spacer during acute episodes",
                "Better lung deposition than nebuliser when used correctly with spacer",
                "Portable, convenient for home use — reduces unnecessary nebuliser dependence",
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <CheckCircle size={9} weight="fill" className="text-blue-500 flex-shrink-0 mt-0.5" />{s}
                </div>
              ))}
            </div>
          </div>

          {/* Spacer by age */}
          <div>
            <div className="font-bold text-sm mb-2 text-slate-800 dark:text-white"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Spacer Selection by Age</div>
            <div className="space-y-3">
              {SPACER_DEVICES.map((s, i) => (
                <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="font-black text-2xl text-blue-600 dark:text-blue-400 flex-shrink-0 leading-none"
                         style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{s.age}</div>
                    <div className="flex-1 space-y-1.5">
                      <div className="text-xs">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mr-1">Mask:</span>
                        <span className="text-slate-700 dark:text-slate-200">{s.mask}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mr-1">Devices (Indian market):</span>
                        <span className="text-slate-700 dark:text-slate-200 font-semibold">{s.device}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                        <Info size={10} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />{s.notes}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MDI technique */}
          <div>
            <div className="font-bold text-sm mb-2 text-slate-800 dark:text-white"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>MDI + Spacer Technique</div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
              <div className="space-y-2">
                {MDI_STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[9px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spacer care */}
          <div>
            <div className="font-bold text-sm mb-2 text-slate-800 dark:text-white"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Spacer Care &amp; Maintenance</div>
            <div className={`rounded-xl border p-4 ${TONE.amber.border} ${TONE.amber.bg}`}>
              <div className="space-y-1.5">
                {SPACER_CARE.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200">
                    <ArrowRight size={9} weight="bold" className="text-amber-500 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Indian brands availability */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
            <div className="font-bold text-xs text-slate-700 dark:text-slate-200 mb-3"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Spacer Devices — Indian Market Availability</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-800">
                    <th className="p-2 text-left font-mono text-[8px] uppercase tracking-wider text-slate-500">Device</th>
                    <th className="p-2 text-left font-mono text-[8px] uppercase tracking-wider text-slate-500">Brand / Mfr</th>
                    <th className="p-2 text-left font-mono text-[8px] uppercase tracking-wider text-slate-500">Age</th>
                    <th className="p-2 text-left font-mono text-[8px] uppercase tracking-wider text-slate-500">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { device: "Aerochamber Plus Flow-Vu", brand: "Trudell Medical",          age: "0–adult",  note: "Flow-Vu indicator shows correct technique. Best evidence." },
                    { device: "Babyhaler",               brand: "GSK",                      age: "0–2 yr",   note: "Paediatric holding chamber. Fits Ventolin MDI." },
                    { device: "Volumatic",               brand: "GSK",                      age: "5+",       note: "Large volume, metal-lined — less static. Fits GSK MDIs." },
                    { device: "BreathAlert",             brand: "Indian generic",            age: "5+",       note: "Inexpensive. No flow indicator. Works." },
                    { device: "Inhalaid",                brand: "Indian (various)",          age: "3+",       note: "Widely available in chemists. Check valve function regularly." },
                    { device: "SpaceChamber Plus",       brand: "Medical Developments",     age: "0–adult",  note: "With or without mask. Flow-through design." },
                    { device: "Placeholder / DIY",       brand: "500 mL plastic bottle",    age: "Emergency",note: "Cut bottle, seal MDI in neck — effective emergency spacer (WHO, Piyush Gupta)." },
                  ].map((r, i) => (
                    <tr key={r.device} className={`border-t border-slate-100 dark:border-slate-800 ${i%2===0?"bg-white dark:bg-slate-900/30":"bg-slate-50 dark:bg-slate-900/50"}`}>
                      <td className="p-2 font-semibold text-slate-700 dark:text-slate-200">{r.device}</td>
                      <td className="p-2 text-slate-600 dark:text-slate-300">{r.brand}</td>
                      <td className="p-2 font-mono text-slate-500">{r.age}</td>
                      <td className="p-2 text-slate-500 dark:text-slate-400">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── NEBULISER TECHNIQUE ── */}
      {section === "technique" && (
        <div className="space-y-4">
          <InfoBox tone="amber" icon={Lightbulb} title="When to use a nebuliser">
            Severe/life-threatening exacerbation · Child unable to use MDI + spacer · Continuous salbutamol needed · Adrenaline for croup · Very young infant who cannot cooperate with MDI
          </InfoBox>

          <div>
            <div className="font-bold text-sm mb-2 text-slate-800 dark:text-white"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Nebuliser Technique — Step by Step</div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
              <div className="space-y-2">
                {NEB_TECHNIQUE.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[9px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Common errors */}
          <div>
            <div className="font-bold text-sm mb-2 text-slate-800 dark:text-white"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Common Errors That Reduce Drug Delivery</div>
            <div className={`rounded-xl border p-4 ${TONE.red.border} ${TONE.red.bg}`}>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  "Poor mask seal — leaks around nose/chin reduce delivery by 50–70%",
                  "Flow rate too low (<6 L/min) — produces large particles that deposit in upper airway",
                  "Not diluting to 4 mL — dead volume wastes more drug proportionally with small volumes",
                  "Holding nebuliser at angle >45° — drug pools, reduced output",
                  "Running to complete dryness — last drops often most concentrated (in some designs)",
                  "Child crying during treatment — reduces deposition, use calm/sleep/distraction",
                  "Mouthpiece (not mask) in <4 yr — child breathes nasally, drug never reaches lungs",
                  "Not tapping cup mid-treatment — drug wets cup walls, reducing output",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-red-800 dark:text-red-200">
                    <ArrowRight size={9} weight="bold" className="text-red-500 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drug compatibility */}
          <div>
            <div className="font-bold text-sm mb-2 text-slate-800 dark:text-white"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Drug Mixing in Nebuliser — Compatibility</div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                    <th className="p-3 text-left font-mono text-[9px] uppercase tracking-widest">Combination</th>
                    <th className="p-3 text-left font-mono text-[9px] uppercase tracking-widest">Compatible?</th>
                    <th className="p-3 text-left font-mono text-[9px] uppercase tracking-widest">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { combo: "Salbutamol + Ipratropium (NS diluent)",     ok: true,  note: "Compatible — use Duolin respules or mix in cup" },
                    { combo: "Salbutamol + Budesonide",                   ok: true,  note: "Compatible. But budesonide mixed last" },
                    { combo: "Salbutamol + Ipratropium + Budesonide",     ok: true,  note: "Triple mix — compatible. Dilute to 4 mL" },
                    { combo: "Salbutamol + Adrenaline (concurrent)",      ok: false, note: "Not recommended — do not mix; give sequentially if both needed" },
                    { combo: "Adrenaline + Budesonide (croup)",           ok: false, note: "Give separately — adrenaline first then budesonide if both needed" },
                    { combo: "Any drug + 3% Hypertonic Saline",           ok: true,  note: "Can mix — pretreat with salbutamol to prevent bronchospasm" },
                  ].map((r, i) => (
                    <tr key={r.combo} className={`border-t border-slate-100 dark:border-slate-800 ${i%2===0?"bg-white dark:bg-slate-900/20":"bg-slate-50 dark:bg-slate-900/40"}`}>
                      <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{r.combo}</td>
                      <td className="p-3">
                        {r.ok
                          ? <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">✓ Yes</span>
                          : <span className="font-mono font-bold text-red-600 dark:text-red-400 text-[10px]">✕ No</span>}
                      </td>
                      <td className="p-3 text-xs text-slate-500 dark:text-slate-400">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "drugs",   label: "Drug Doses",      Icon: Pill },
  { id: "nebs",    label: "Nebulised Drugs", Icon: Wind },
];

export default function DrugsTab() {
  const { weight } = useWeight();
  const [activeTab, setActiveTab] = useState("drugs");
  const [q,   setQ]   = useState("");
  const [cat, setCat] = useState("all");

  const filtered = useMemo(() => {
    const catDef = DRUG_CATEGORIES.find((c) => c.id === cat);
    const matches = catDef?.matches;
    return DRUGS.filter((d) => {
      const matchCat = !matches || matches.includes(d.category);
      const matchQ   = !q || d.name.toLowerCase().includes(q.toLowerCase()) || d.indication.toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQ;
    });
  }, [q, cat]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Drug Doses Reference
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Doses calculated for{" "}
          <span className="font-bold text-slate-900 dark:text-white">{weight} kg</span> ·
          Piyush Gupta 18e · IAP · Harriet Lane 22e · PALS 2020
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 flex-wrap">
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

      {/* ── DRUG DOSES TABLE ── */}
      {activeTab === "drugs" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                data-testid="drug-search"
                placeholder="Search drug or indication…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {DRUG_CATEGORIES.map((c) => (
                <button key={c.id} data-testid={`drug-cat-${c.id}`} onClick={() => setCat(c.id)}
                  className={`px-3 py-1.5 rounded-full border font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${
                    cat === c.id
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                      : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}>{c.label}</button>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Drug</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Indication</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Category</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Dose / kg</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Calc ({weight} kg)</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Route</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40 align-top">
                    <td className="p-3 font-bold">{d.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{d.indication}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${CAT_COLORS[d.category]}`}>
                        {d.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {(() => {
                        if (d.fixedDose) return d.fixedDose;
                        if (d.dosePerKg == null) return "—";
                        const maxSuffix = d.max ? ` (max ${d.max})` : "";
                        return `${d.dosePerKg} ${d.unit}/kg${maxSuffix}`;
                      })()}
                    </td>
                    <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">{computeDrugDose(d, weight)}</td>
                    <td className="p-3 font-mono text-xs">{d.route}</td>
                    <td className="p-3 text-xs text-slate-500 dark:text-slate-400 max-w-xs">{d.notes}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">No drugs match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── NEBULISED DRUGS ── */}
      {activeTab === "nebs" && <NebulisedDrugsTab weight={weight} />}
    </div>
  );
}
