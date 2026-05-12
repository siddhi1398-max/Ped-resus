// DrugsTab.jsx
// Sub-tabs: Drug Doses Table · Per Rectal · Intranasal · Intramuscular · Nebulised Drugs
// Sources: Piyush Gupta 18th Ed · IAP · Ontario Lung Care Pathway · GINA Paediatric
//          Harriet Lane 22nd Ed · PALS 2020 · CIMS India 2024 · Drug Today India 2024

import { useState, useMemo, useEffect } from "react";
import { useWeight } from "../../context/WeightContext";
import { DRUGS, DRUG_CATEGORIES, computeDrugDose } from "../../data/drugs";
import { Input } from "../ui/input";
import {
  MagnifyingGlass, Warning, Lightbulb, ArrowRight,
  Wind, Pill, CheckCircle, Info, Syringe, Drop, Eyedropper,
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
  antihypertensive: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200 border-pink-300 dark:border-pink-900",
  antiarrhythmic:   "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 border-indigo-300 dark:border-indigo-900",
  "pulmonary-ht":   "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300 dark:border-rose-900",
  endocrine:        "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200 border-yellow-300 dark:border-yellow-900",
  toxicology:       "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 border-orange-300 dark:border-orange-900",
  haematology:      "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-300 dark:border-red-900",
  renal:            "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200 border-teal-300 dark:border-teal-900",
  "gi-hepatic":     "bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-200 border-lime-300 dark:border-lime-900",
};other:          "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
};

const TONE = {
  red:     { text: "text-red-600 dark:text-red-400",        bg: "bg-red-50 dark:bg-red-950/30",        border: "border-red-200 dark:border-red-800"        },
  emerald: { text: "text-emerald-600 dark:text-emerald-400",bg: "bg-emerald-50 dark:bg-emerald-950/30",border: "border-emerald-200 dark:border-emerald-800" },
  amber:   { text: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-50 dark:bg-amber-950/30",    border: "border-amber-200 dark:border-amber-800"    },
  blue:    { text: "text-blue-600 dark:text-blue-400",      bg: "bg-blue-50 dark:bg-blue-950/30",      border: "border-blue-200 dark:border-blue-800"      },
  sky:     { text: "text-sky-600 dark:text-sky-400",        bg: "bg-sky-50 dark:bg-sky-950/30",        border: "border-sky-200 dark:border-sky-800"        },
  violet:  { text: "text-violet-600 dark:text-violet-400",  bg: "bg-violet-50 dark:bg-violet-950/30",  border: "border-violet-200 dark:border-violet-800"  },
  orange:  { text: "text-orange-600 dark:text-orange-400",  bg: "bg-orange-50 dark:bg-orange-950/30",  border: "border-orange-200 dark:border-orange-800"  },
  teal:    { text: "text-teal-600 dark:text-teal-400",      bg: "bg-teal-50 dark:bg-teal-950/30",      border: "border-teal-200 dark:border-teal-800"      },
  slate:   { text: "text-slate-600 dark:text-slate-400",    bg: "bg-slate-50 dark:bg-slate-900/50",    border: "border-slate-200 dark:border-slate-700"    },
};

function InfoBox({ tone = "amber", icon: Icon, title, children }) {
  const t = TONE[tone] || TONE.amber;
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${t.bg} ${t.border} ${t.text}`}>
      {Icon && <Icon size={13} weight="fill" className="flex-shrink-0 mt-0.5" />}
      <div><strong>{title}</strong>{title ? " — " : ""}{children}</div>
    </div>
  );
}

// ─── WEIGHT-AWARE DOSE COMPUTATION ────────────────────────────────────────────

/** Computes a weight-aware dose from dosePerKg + max, returning display string. */
function computeRouteDose(drug, weight) {
  if (!weight) return drug.doseStr || "—";
  if (drug.fixedDose) return drug.fixedDose;
  if (!drug.dosePerKg) return drug.doseStr || "—";

  let raw = drug.dosePerKg * weight;
  const unit = drug.doseUnit || "";

  if (drug.max) raw = Math.min(raw, drug.max);

  if (unit === "mcg") return `${raw.toFixed(0)} mcg`;
  if (unit === "units") return `${(raw / 1000).toFixed(0)} × 1000 units (${Math.round(raw).toLocaleString()} units)`;
  if (unit === "mL")   return `${raw.toFixed(1)} mL`;
  return `${raw.toFixed(1)} ${unit}`;
}

/** Replaces "X mg/kg" patterns inline in prose strings. */
function inlineComputeDose(str, weight) {
  if (!weight || !str) return str;
  let result = str;
  result = result.replace(/([\d.]+)[–-]([\d.]+)\s*(mg|mcg|mL)\/kg(\/(?:hr|min|day))?/g,
    (_, lo, hi, unit, per) => {
      const suffix = per || "";
      return `${(parseFloat(lo)*weight).toFixed(2)}–${(parseFloat(hi)*weight).toFixed(2)} ${unit}${suffix} [${weight}kg]`;
    });
  result = result.replace(/([\d.]+)\s*(mg|mL)\/kg(\/(?:hr|min|day))?/g,
    (_, n, unit, per) => `${(parseFloat(n)*weight).toFixed(2)} ${unit}${per||""} [${weight}kg]`);
  result = result.replace(/([\d.]+)\s*mcg\/kg(\/(?:hr|min|day))?/g,
    (_, n, per) => `${(parseFloat(n)*weight).toFixed(1)} mcg${per||""} [${weight}kg]`);
  return result;
}

// ─── GENERIC ROUTE DRUG CARD ────────────────────────────────────────────────
// Handles PR, IN, and IM drug entries uniformly.
function RouteDrugCard({ drug, weight }) {
  const [open, setOpen] = useState(false);
  const t = TONE[drug.classColor] || TONE.slate;

  const computedDose = computeRouteDose(drug, weight);
  const isNotRecommended = drug.doseStr?.toLowerCase().includes("not recommended");

  // Fields that differ by route
  const hasSite      = !!drug.site;
  const hasTechnique = !!drug.technique;
  const hasDevice    = !!drug.deviceNeeded;
  const hasHowTo     = !!drug.howToGive;

  return (
    <div className={`border rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 transition-all
      ${open ? "border-slate-300 dark:border-slate-600" : "border-slate-200 dark:border-slate-700"}
      ${isNotRecommended ? "opacity-70" : ""}
    `}>
      {/* Header row */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900 dark:text-white"
                    style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                {drug.name}
              </span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${t.text} ${t.border} ${t.bg} flex-shrink-0`}>
                {drug.class}
              </span>
              {isNotRecommended && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border text-slate-500 border-slate-300 bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  NOT RECOMMENDED
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
              {drug.indication}
            </div>
          </div>
        </div>

        {/* Computed dose badge */}
        <div className={`text-[10px] font-mono font-bold flex-shrink-0 mr-2 ${isNotRecommended ? "text-slate-400 line-through" : t.text}`}>
          {weight ? computedDose : drug.doseStr?.split(" ")[0]}
        </div>

        <ArrowRight
          size={12} weight="bold"
          className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-4">

          {/* Dose panel */}
          <div className={`rounded-xl border p-4 ${t.border} ${t.bg} space-y-3`}>
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Dose</div>
            <div className="flex flex-wrap gap-4 items-start">
              {/* Written dose */}
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">Standard</div>
                <div className={`text-xs font-semibold ${t.text}`}>{drug.doseStr || drug.fixedDose}</div>
              </div>
              {/* Computed dose */}
              {weight && drug.dosePerKg && (
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">
                    For {weight} kg
                  </div>
                  <div className={`text-lg font-black leading-none ${t.text}`}>
                    {computedDose}
                    {drug.max && drug.dosePerKg * weight >= drug.max && (
                      <span className="ml-1.5 text-[9px] font-mono text-slate-400 font-normal">MAX DOSE</span>
                    )}
                  </div>
                </div>
              )}
              {/* Max */}
              {drug.max && (
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">Max</div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {drug.max} {drug.doseUnit}
                  </div>
                </div>
              )}
            </div>

            {/* Onset / Duration */}
            <div className="flex gap-4 pt-1 border-t border-slate-200 dark:border-slate-700">
              {drug.onset && (
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">Onset</div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{drug.onset}</div>
                </div>
              )}
              {drug.duration && (
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">Duration</div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{drug.duration}</div>
                </div>
              )}
              {hasDevice && (
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">Device</div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{drug.deviceNeeded}</div>
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-3">

              {/* Brands + Formulations */}
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">
                  Indian Brands &amp; Formulations
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2.5 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-800 dark:text-white">{drug.brands}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{drug.formulations}</div>
                </div>
              </div>

              {/* Site (IM) */}
              {hasSite && (
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Injection Site</div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                    {drug.site}
                  </div>
                </div>
              )}

              {/* How to give (PR / IN) */}
              {hasHowTo && (
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">How to Give</div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    {drug.howToGive}
                  </div>
                </div>
              )}

              {/* Technique (IM) */}
              {hasTechnique && (
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Technique</div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    {inlineComputeDose(drug.technique, weight)}
                  </div>
                </div>
              )}
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
                      <ArrowRight size={9} weight="bold" className="text-red-500 flex-shrink-0 mt-0.5" />
                      {c}
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
// PR DRUG DATA
// ═══════════════════════════════════════════════════════════════════════════════
const PR_DRUGS = [
  {
    id: "diazepam-pr",
    name: "Diazepam",
    class: "Benzodiazepine", classColor: "violet",
    indication: "Acute seizure / febrile convulsion (when IV unavailable)",
    doseStr: "0.5 mg/kg PR (max 10 mg)",
    dosePerKg: 0.5, doseUnit: "mg", max: 10,
    brands: "Calmpose (Ranbaxy) · Paxum (Torrent) · Valium (Roche) · Anzepam · Diazepam generic (Sun, Cipla)",
    formulations: "IV solution 5 mg/mL (2 mL ampoule) used rectally · Stesolid rectal tube (imported, limited) · Diastat (not available India)",
    howToGive: "Draw up IV solution into oral syringe. Lubricate tip. Insert 4–5 cm into rectum. Inject slowly. Hold buttocks together for 1–2 min. Dose for rectal use is 0.5 mg/kg (double the IV dose of 0.2 mg/kg).",
    onset: "5–10 min", duration: "30–60 min",
    cautions: [
      "Respiratory depression — have BVM ready",
      "Rectal bioavailability ~50–60% of IV — hence higher dose (0.5 mg/kg vs 0.2 mg/kg IV)",
      "Do NOT use oral tablets rectally — not absorbed",
      "Reversible with flumazenil 0.01 mg/kg IV",
    ],
    pearl: "India standard: diazepam IV solution used rectally is widely available and effective. Preferred over buccal/IN midazolam when those aren't available. Give via lubricated oral syringe — no needle required.",
  },
  {
    id: "midazolam-pr",
    name: "Midazolam (rectal)",
    class: "Benzodiazepine", classColor: "violet",
    indication: "Acute seizure (alternative to buccal/IN when IV unavailable)",
    doseStr: "0.3–0.5 mg/kg PR (max 10 mg)",
    dosePerKg: 0.4, doseUnit: "mg", max: 10,
    brands: "Mezolam (Neon) · Midazolam (Sun Pharma, Cipla, Troikaa) · Dormicum (Roche) · Versed",
    formulations: "Midazolam injection 5 mg/mL (1 mL, 2 mL ampoules) used rectally · 1 mg/mL diluted solution",
    howToGive: "Draw up 5 mg/mL IV solution into oral syringe (undiluted or dilute 1:1 with NS). Insert 3–5 cm rectally. Inject. Hold buttocks 2 min. Less volume needed vs diazepam PR.",
    onset: "5–10 min", duration: "20–40 min",
    cautions: [
      "Respiratory depression — monitor SpO₂",
      "Less evidence than diazepam PR — Piyush Gupta recommends diazepam PR as first-line rectal benzodiazepine",
      "Buccal/intranasal route preferred over rectal for midazolam",
    ],
    pearl: "Rectal midazolam is an option when buccal/IN midazolam is not feasible. For most Indian centres, rectal diazepam remains more familiar and evidence-based. Buccal midazolam (Buccolam) preferred when available.",
  },
  {
    id: "paraldehyde-pr",
    name: "Paraldehyde",
    class: "Anticonvulsant", classColor: "amber",
    indication: "Refractory seizures / status epilepticus (3rd/4th line when IV access difficult)",
    doseStr: "0.4 mL/kg PR mixed 1:1 with arachis oil (max 8 mL total)",
    dosePerKg: 0.4, doseUnit: "mL", max: 8,
    brands: "Paraldehyde BP liquid (generic) · Hospital pharmacy bulk liquid · No branded formulation in India",
    formulations: "Paraldehyde liquid — mix 1:1 with arachis oil (peanut oil) or olive oil before rectal use. Use glass or metal syringe — paraldehyde dissolves plastic.",
    howToGive: "Mix equal volume paraldehyde + arachis oil. Use glass syringe. Insert catheter/syringe 5–8 cm. Inject slowly. Do NOT use plastic syringes. Discard unused portion — oxidises rapidly.",
    onset: "15–30 min", duration: "2–6 hr",
    cautions: [
      "MUST use glass or metal syringe — dissolves plastic",
      "Pungent odour — warn parents; breath and urine smell strongly",
      "Hepatic metabolism — avoid in liver failure",
      "Paraldehyde oxidises to acetic acid — do NOT use if discoloured or opened >24 hr",
    ],
    pearl: "Piyush Gupta: Paraldehyde PR is practical in resource-limited settings when IV access fails and benzodiazepines have been given. Still available in many Indian district hospitals. 0.4 mL/kg mixed 1:1 with arachis oil (max total 8 mL).",
  },
  {
    id: "paracetamol-pr",
    name: "Paracetamol (Suppository)",
    class: "Analgesic / Antipyretic", classColor: "emerald",
    indication: "Fever / pain when oral route unavailable (vomiting, post-op, uncooperative)",
    doseStr: "15–20 mg/kg PR (max 1 g)",
    dosePerKg: 15, doseUnit: "mg", max: 1000,
    brands: "Calpol Suppositories (GSK) · Metacin Suppositories (Torrent) · Febrinil Suppositories · Paracetamol Suppositories BP",
    formulations: "125 mg suppository (Calpol 125) · 250 mg suppository (Calpol 250, Metacin 250) · 500 mg suppository (Calpol 500) · 1 g suppository (adult)",
    howToGive: "Choose closest available strength. Unwrap. Moisten tip with water or lubricant gel. Insert blunt end first, past external sphincter (~2 cm in infants, 3–4 cm in children). Hold buttocks together 1–2 min. Refrigerate unused suppositories.",
    onset: "30–60 min (slower than oral/IV)", duration: "4–6 hr",
    cautions: [
      "Bioavailability variable (50–75%) — less predictable than oral",
      "Do NOT use if diarrhoea (expelled too quickly) — switch to IV Perfalgan",
      "Repeat q6h; max 60 mg/kg/day",
    ],
    pearl: "Use Calpol suppository for febrile children who are vomiting and refusing oral. Choose suppository strength closest to 15 mg/kg dose. Common scenario: 10 kg child vomiting → 125 mg supp (slight underdose) or 250 mg supp (slight overdose). 125 mg is safe.",
  },
  {
    id: "indomethacin-pr",
    name: "Indomethacin (Suppository)",
    class: "NSAID", classColor: "amber",
    indication: "Acute pain / fever (older children)",
    doseStr: "1.5–3 mg/kg/day PR ÷ TDS (max 50 mg/dose)",
    dosePerKg: 1, doseUnit: "mg", max: 50,
    brands: "Indocap (Ranbaxy) suppository · Indoflam suppository · Indomod suppository",
    formulations: "25 mg suppository (Indocap-25) · 50 mg suppository (Indocap-50) — hospital pharmacy",
    howToGive: "Insert as per standard suppository technique. Best absorbed from upper rectum. Insert beyond external sphincter.",
    onset: "30–60 min", duration: "4–6 hr",
    cautions: [
      "GI irritation — use only when oral not possible",
      "Avoid in renal impairment, dehydration, dengue",
      "Not first-line in Indian paediatric practice — paracetamol suppository preferred",
    ],
    pearl: "Limited paediatric use for rectal route in India. Paracetamol suppository is safer and more widely available. Indomethacin PR used mainly in older children / adolescents for acute pain.",
  },
  {
    id: "promethazine-pr",
    name: "Promethazine (Suppository)",
    class: "Antiemetic / Antihistamine", classColor: "orange",
    indication: "Severe vomiting when oral/IV unavailable (>2 yr ONLY)",
    doseStr: "0.5–1 mg/kg PR (max 25 mg)",
    dosePerKg: 0.75, doseUnit: "mg", max: 25,
    brands: "Phenergan Suppositories (Sanofi) · Fenez suppository · Promethazine suppository (Cipla)",
    formulations: "12.5 mg suppository (Phenergan-12.5) · 25 mg suppository (Phenergan-25) — limited India availability",
    howToGive: "Refrigerate until use. Moisten tip. Insert blunt end first past sphincter. Hold buttocks 2 min.",
    onset: "15–30 min", duration: "4–6 hr",
    cautions: [
      "CONTRAINDICATED <2 yr — fatal respiratory depression (FDA Black Box Warning)",
      "Extrapyramidal reactions (dystonia, akathisia) — treat with benztropine",
      "QT prolongation — avoid in cardiac disease",
      "Rarely used PR in Indian practice — ondansetron wafer or IV preferred",
    ],
    pearl: "Ondansetron ODT (oral dissolving tablet) is preferred over promethazine PR in India for vomiting children — safer profile, better evidence. Reserve promethazine PR when ondansetron unavailable and child >2 yr.",
  },
  {
    id: "bisacodyl-pr",
    name: "Bisacodyl (Suppository)",
    class: "Stimulant Laxative", classColor: "sky",
    indication: "Constipation / pre-procedure bowel preparation",
    doseStr: "<10 kg: 5 mg OD · ≥10 kg: 10 mg OD",
    dosePerKg: null,
    fixedDose: "< 2 yr: 5 mg · 2–12 yr: 5–10 mg · >12 yr: 10 mg — once daily",
    brands: "Dulcolax Suppository (Sanofi) · Bisacodyl Suppository (generic, Sun Pharma, Cipla) · Conlax",
    formulations: "5 mg suppository · 10 mg suppository — both widely available in Indian pharmacies",
    howToGive: "Insert after gentle lubrication. Acts in 15–45 min. Short-term use only. Do NOT use for >1 week.",
    onset: "15–60 min", duration: "Single dose effect",
    cautions: [
      "Abdominal cramps common",
      "Do NOT use in suspected bowel obstruction or appendicitis",
      "Not for long-term use — can cause rectal irritation",
    ],
    pearl: "Dulcolax suppositories are widely available in Indian pharmacies. For acute constipation relief — onset 15–60 min. Enemas (sodium phosphate/soap water) preferred for severe impaction.",
  },
  {
    id: "sodium-phosphate-enema",
    name: "Sodium Phosphate Enema",
    class: "Osmotic Laxative", classColor: "sky",
    indication: "Severe constipation / faecal impaction / pre-procedure bowel preparation",
    doseStr: "2.5 mL/kg (max 133 mL — 1 adult enema)",
    dosePerKg: 2.5, doseUnit: "mL", max: 133,
    brands: "Fleet Enema (Church & Dwight) · Relaxyl Enema (Sanofi India) · Sodium Phosphate Enema (generic) · Picolax",
    formulations: "Fleet Enema 66 mL (paediatric) · Fleet Enema 133 mL (adult) · Relaxyl Enema 130 mL (sodium phosphate — available India)",
    howToGive: "Child: lie on left side, knees drawn to chest. Insert applicator tip. Squeeze bottle steadily. Retain 1–5 min if possible. Bowel movement expected within 1–5 min.",
    onset: "1–5 min", duration: "Single dose",
    cautions: [
      "Avoid in renal impairment (phosphate retention — fatal hyperphosphataemia)",
      "Avoid in bowel obstruction, Hirschsprung disease, perforation",
      "Do NOT use adult-size enema in small children — hyperphosphataemia risk",
      "Do NOT repeat within 24 hr",
    ],
    pearl: "Relaxyl enema (sodium phosphate) is the most available commercial enema in India. Use paediatric dose (2.5 mL/kg, max 133 mL). Phosphate enemas contraindicated in renal failure — use normal saline enema (10–20 mL/kg) instead.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// IN DRUG DATA
// ═══════════════════════════════════════════════════════════════════════════════
const IN_DRUGS = [
  {
    id: "fentanyl-in",
    name: "Fentanyl",
    class: "Opioid Analgesic", classColor: "orange",
    indication: "Acute severe pain — fractures, burns, trauma (when IV not yet available)",
    doseStr: "1.5–2 mcg/kg IN (max 100 mcg)",
    dosePerKg: 1.5, doseUnit: "mcg", max: 100,
    brands: "Fentanyl (Neon Labs) · Fentoject (Sun Pharma) · Trofentyl (Troikaa) · Fentanil (Cipla)",
    formulations: "50 mcg/mL (0.05 mg/mL) · 100 mcg/mL (0.1 mg/mL) ampoules — use concentrated form for low volumes",
    howToGive: "Use MAD (Mucosal Atomisation Device) atomiser attached to 1 mL syringe. Use 100 mcg/mL concentration to minimise volume. Split dose between nostrils — max 0.5 mL per nostril. Tilt head 30–45°. Sniff gently. Onset 5–10 min.",
    onset: "5–10 min", duration: "30–60 min",
    deviceNeeded: "MAD Nasal atomiser (Wolfe Tory Medical / LMA MAD Nasal)",
    cautions: [
      "Respiratory depression — have naloxone ready (IN naloxone 0.1 mg/kg)",
      "Volume per nostril: max 0.5 mL — use concentrated 100 mcg/mL ampoule",
      "Chest-wall rigidity with rapid large doses — inject slowly",
    ],
    pearl: "IN fentanyl is the most evidence-based intranasal analgesic in children. Onset comparable to IV. Avoids IV delay in trauma. Use 100 mcg/mL concentration — keep volume ≤0.5 mL/nostril. MAD atomiser essential for optimal droplet size.",
  },
  {
    id: "ketamine-in",
    name: "Ketamine (sub-dissociative)",
    class: "NMDA Antagonist", classColor: "violet",
    indication: "Acute pain — opioid-sparing / pre-IV access trauma / short procedures",
    doseStr: "1–2 mg/kg IN (max 75 mg)",
    dosePerKg: 1.5, doseUnit: "mg", max: 75,
    brands: "Aneket (Neon) · Ketalar (Pfizer) · Katamine (Troikaa) · Ketamax (Ranbaxy)",
    formulations: "Use 50 mg/mL concentration. For IN use 50 mg/mL to minimise volume. 500 mg/10 mL vial — draw up concentrated.",
    howToGive: "Use MAD nasal atomiser. Keep volume ≤0.5 mL per nostril. Tilt head 45°. Administer half each nostril. Onset 5–10 min.",
    onset: "5–10 min", duration: "20–30 min",
    deviceNeeded: "MAD Nasal atomiser recommended",
    cautions: [
      "Hypersalivation — consider glycopyrrolate",
      "Emergence dysphoria — quiet environment post-procedure",
      "Not for raised ICP or psychosis",
      "Dissociative dose (4–5 mg/kg IN) — rarely used, monitor airway",
    ],
    pearl: "Sub-dissociative ketamine IN (1–2 mg/kg) gives analgesia without IV. Useful for paediatric trauma pain before IV access. Less evidence than IN fentanyl but additive/alternative. Use 50 mg/mL concentration to keep volume low.",
  },
  {
    id: "midazolam-in",
    name: "Midazolam",
    class: "Benzodiazepine", classColor: "violet",
    indication: "Seizure (when IV unavailable) / procedural anxiolysis / pre-MRI sedation",
    doseStr: "0.2–0.3 mg/kg IN (max 10 mg)",
    dosePerKg: 0.2, doseUnit: "mg", max: 10,
    brands: "Mezolam (Neon) · Dormicum (Roche) · Midazolam (Sun Pharma, Cipla, Troikaa) · Sedonam",
    formulations: "5 mg/mL injection (1 mL, 2 mL ampoules) — use undiluted 5 mg/mL for IN to minimise volume · 1 mg/mL diluted ampoules also available",
    howToGive: "MAD nasal atomiser essential — produces 30–100 µm droplets optimal for nasal mucosa. Draw up 5 mg/mL solution. Split between nostrils (max 0.5 mL each). Tilt head back 30°. Sniff gently after administration. Onset 5–10 min.",
    onset: "5–10 min", duration: "30–60 min",
    deviceNeeded: "MAD Nasal atomiser essential (Wolfe Tory / LMA MAD Nasal)",
    cautions: [
      "Respiratory depression — monitor SpO₂",
      "Nasal irritation (burns) — transient, common with 5 mg/mL",
      "Volume critical: ≤0.5 mL per nostril, use 5 mg/mL concentration",
      "Reversible with flumazenil 0.01 mg/kg IV",
      "Buccal midazolam (Buccolam) preferred in seizures when available — less nasal burning",
    ],
    pearl: "Piyush Gupta: IN midazolam 0.2–0.3 mg/kg is effective for acute seizures when IV unavailable. Nasal burning with 5 mg/mL — warn parents. Use atomiser, not drops — drops run to pharynx and are swallowed. Bioavailability ~50% of IV.",
  },
  {
    id: "dexmedetomidine-in",
    name: "Dexmedetomidine",
    class: "α2-agonist Sedative", classColor: "teal",
    indication: "Pre-MRI sedation / procedural sedation / anxiolysis",
    doseStr: "1–2 mcg/kg IN (max 100 mcg)",
    dosePerKg: 1.5, doseUnit: "mcg", max: 100,
    brands: "Dextomid (Neon Labs) · Precedex (Hospira/Pfizer) · Dexdor (Orion) — IV solution used intranasally",
    formulations: "100 mcg/mL (0.1 mg/mL) IV solution used intranasally with atomiser. 200 mcg/2 mL vials. No specific IN formulation in India.",
    howToGive: "Draw up 100 mcg/mL solution into 1 mL syringe. Attach MAD. Administer half dose each nostril. Onset 30 min (slower than midazolam). Plan timing — give 25–30 min before procedure.",
    onset: "25–30 min", duration: "60–120 min",
    deviceNeeded: "MAD Nasal atomiser",
    cautions: [
      "Bradycardia and hypotension — monitor HR and BP",
      "Slow onset — not for emergency seizure termination",
      "No respiratory depression — key advantage for MRI sedation",
      "Patients remain arousable (cooperative sedation) — not deep sedation",
    ],
    pearl: "IN dexmedetomidine 2 mcg/kg is ideal for MRI sedation — no respiratory depression means safe for unmonitored scanners. Onset 30 min — give in prep room. Can combine with IN midazolam 0.1 mg/kg for deeper effect. Widely used in Indian tertiary centres for non-painful procedures.",
  },
  {
    id: "naloxone-in",
    name: "Naloxone",
    class: "Opioid Antagonist", classColor: "red",
    indication: "Opioid overdose / respiratory depression (when IV unavailable)",
    doseStr: "0.1 mg/kg IN (max 2 mg)",
    dosePerKg: 0.1, doseUnit: "mg", max: 2,
    brands: "Naloxone (Neon Labs) · Narcan (Pfizer) · Nalone (Cipla) · Nalox-400 (Sun Pharma)",
    formulations: "400 mcg/mL (0.4 mg/mL) ampoule — undiluted. 1 mg/mL ampoule (preferred for IN — lower volume). IN-specific Narcan 4 mg/0.1 mL nasal spray not available India — use IV solution with atomiser.",
    howToGive: "Use 1 mg/mL ampoule if available (lower volume). Attach MAD. Administer 0.5 mL per nostril. Rapid onset. May need repeat dose in 2–3 min if inadequate response. Have IV access ready.",
    onset: "2–5 min (IN) vs 1–2 min (IV)", duration: "30–90 min (shorter than most opioids — re-narcotisation risk)",
    deviceNeeded: "MAD Nasal atomiser",
    cautions: [
      "Repeat dosing often needed — naloxone shorter acting than most opioids",
      "Abrupt reversal may precipitate acute opioid withdrawal — agitation, vomiting",
      "Volume: use 1 mg/mL concentration for IN (lower volume = better absorption)",
      "IV route preferred when IV access available — faster, more reliable",
    ],
    pearl: "IN naloxone is lifesaving when IV access unavailable. US/UK: 4 mg ready-to-use nasal spray (Narcan). India: use 0.4 mg/mL or 1 mg/mL ampoule with MAD atomiser. Titrate to breathing — not to consciousness. Re-sedation common with long-acting opioids.",
  },
  {
    id: "diazepam-in",
    name: "Diazepam IN (limited evidence)",
    class: "Benzodiazepine", classColor: "slate",
    indication: "Acute seizure (when midazolam IN not available — poor bioavailability)",
    doseStr: "0.2–0.3 mg/kg IN (max 10 mg) — NOT preferred",
    dosePerKg: 0.25, doseUnit: "mg", max: 10,
    brands: "Calmpose (Ranbaxy) · Valium (Roche) · Paxum (Torrent) · Diazepam generic (Sun, Cipla)",
    formulations: "5 mg/mL IV solution used intranasally. 2 mL ampoule (10 mg).",
    howToGive: "Use atomiser. Max 0.5 mL per nostril. Note: water-soluble diazepam (available internationally) has better IN absorption than standard formulation — Indian IV diazepam has poor IN bioavailability (~25%).",
    onset: "10–15 min (slower than IN midazolam)", duration: "30–60 min",
    deviceNeeded: "MAD Nasal atomiser",
    cautions: [
      "Poor nasal bioavailability of standard Indian IV diazepam formulation",
      "IN midazolam strongly preferred for seizures",
      "Rectal diazepam is a better alternative to IN diazepam",
    ],
    pearl: "IN diazepam has significantly lower bioavailability than IN midazolam in standard IV formulations available in India. Piyush Gupta recommends IN midazolam or rectal diazepam over IN diazepam. Listed for completeness only.",
  },
  {
    id: "mupirocin-in",
    name: "Mupirocin 2% Nasal Ointment",
    class: "Antibiotic (Topical)", classColor: "emerald",
    indication: "MRSA nasal decolonisation — before surgery / outbreak setting",
    doseStr: "Small amount (~0.5 cm) each nostril BD × 5 days",
    dosePerKg: null,
    fixedDose: "~0.5 cm into each nostril BD × 5 days. Massage nostrils together after application.",
    brands: "Bactroban Nasal (GSK) · Mupicin Nasal (Cipla) · Mupiderm Nasal (Lupin) · Mupirocin 2% nasal ointment",
    formulations: "Mupirocin 2% nasal ointment — 3 g tube (Bactroban Nasal) · 5 g tube (generic brands)",
    howToGive: "Apply to inside of each nostril. Massage sides of nose together to spread. Repeat BD × 5 days. Use before any elective surgery for known MRSA carriers.",
    onset: "Days (decolonisation takes 5 days)", duration: "Decolonisation effect ~30 days",
    cautions: [
      "Do NOT use mupirocin skin cream nasally — nasal formulation is different",
      "Resistance developing — reserve for MRSA decolonisation only",
      "Not for treating rhinosinusitis",
    ],
    pearl: "Mupirocin nasal decolonisation reduces post-operative MRSA infection risk by 50–75% in carriers. Standard protocol before elective surgery in known MRSA-positive patients. Bactroban Nasal widely available in India.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// IM DRUG DATA
// ═══════════════════════════════════════════════════════════════════════════════
const IM_DRUGS = [
  {
    id: "adrenaline-im",
    name: "Adrenaline (Epinephrine) 1:1000",
    class: "Vasopressor / Bronchodilator", classColor: "red",
    indication: "Anaphylaxis — first-line definitive treatment",
    doseStr: "0.01 mg/kg IM (max 0.5 mg) = 0.01 mL/kg of 1:1000",
    dosePerKg: 0.01, doseUnit: "mg", max: 0.5,
    brands: "Adrenaline IP 1:1000 (1 mg/mL) — Neon Laboratories · Troikaa · AstraZeneca · Adrenalin (Sun Pharma)",
    formulations: "1 mg/mL (1:1000) ampoule — 1 mL ampoule · Multi-dose vials. EpiPen auto-injectors: imported, expensive, not on CDSCO list.",
    site: "Anterolateral thigh (vastus lateralis) — preferred over deltoid (faster absorption). Can be given through clothing in emergency.",
    technique: "Draw up 0.01 mL/kg of 1:1000 solution into 1 mL syringe. Use 23–25G needle. Anterolateral mid-thigh. Perpendicular. No need to aspirate. Compress 10 sec after. Repeat every 5–15 min PRN.",
    onset: "3–5 min", duration: "15–20 min (may need repeat doses)",
    cautions: [
      "No absolute contraindication in anaphylaxis — MUST give first",
      "Tachycardia, pallor, tremor — expected therapeutic effects",
      "Deltoid gives slower absorption — use thigh",
      "Observe minimum 4–6 hr after anaphylaxis (biphasic reaction risk up to 8–12 hr)",
      "Diphenhydramine and steroids are adjuncts ONLY — never replace adrenaline",
    ],
    pearl: "Adrenaline IM anterolateral thigh is the ONLY first-line treatment for anaphylaxis. Give immediately. Repeat every 5–15 min. In India, EpiPen auto-injectors are prohibitively expensive — use ampoule with 1 mL syringe. Train parents of at-risk children to draw up and inject.",
  },
  {
    id: "midazolam-im",
    name: "Midazolam",
    class: "Benzodiazepine", classColor: "violet",
    indication: "Status epilepticus (when IV unavailable) / procedural sedation pre-medication",
    doseStr: "0.2 mg/kg IM (max 10 mg)",
    dosePerKg: 0.2, doseUnit: "mg", max: 10,
    brands: "Mezolam (Neon) · Midazolam (Sun Pharma, Cipla, Troikaa) · Dormicum (Roche) · Sedonam",
    formulations: "5 mg/mL (1 mL, 2 mL ampoules) · 1 mg/mL diluted ampoule · IM route uses standard IV formulation",
    site: "Anterolateral thigh (preferred in children) or deltoid (older children/adolescents)",
    technique: "0.2 mg/kg IM using 5 mg/mL undiluted. Small volume, rapid absorption. Use 23–25G needle, 2–3 cm depth depending on muscle mass.",
    onset: "5–10 min", duration: "45–90 min",
    cautions: [
      "Respiratory depression — monitor SpO₂",
      "Reversible with flumazenil 0.01 mg/kg IV",
      "RAMPART trial: IM midazolam equivalent to IV lorazepam for pre-hospital SE — often faster due to IV access time",
    ],
    pearl: "RAMPART trial: IM midazolam as effective as IV lorazepam for pre-hospital status epilepticus — 0.2 mg/kg IM anterolateral thigh. First-choice prehospital. Onset 5–10 min. If seizure not terminated in 10 min, escalate to IV.",
  },
  {
    id: "diazepam-im",
    name: "Diazepam IM (NOT recommended)",
    class: "Benzodiazepine", classColor: "slate",
    indication: "NOT recommended IM — unpredictable erratic absorption",
    doseStr: "NOT recommended — use IV or PR route",
    dosePerKg: null,
    fixedDose: "IM diazepam NOT recommended — use rectal (0.5 mg/kg PR) or IV",
    brands: "Calmpose (Ranbaxy) · Valium (Roche)",
    formulations: "5 mg/mL IV ampoule — NOT for IM use",
    site: "N/A — do not use IM",
    technique: "N/A",
    onset: "Unpredictable when given IM (30–90 min)", duration: "Variable",
    cautions: [
      "IM diazepam has erratic, slow, unpredictable absorption — not recommended",
      "Tissue irritation and pain at injection site",
      "Piyush Gupta: IM diazepam NOT recommended for any indication in children",
      "Use IV or PR diazepam instead",
    ],
    pearl: "IM diazepam is explicitly NOT recommended in paediatric guidelines (Piyush Gupta, PALS, IAP). The rectal route is far superior. Included here to prevent its use — choose PR diazepam (0.5 mg/kg) or IM/IN midazolam instead.",
  },
  {
    id: "ceftriaxone-im",
    name: "Ceftriaxone",
    class: "3rd Gen Cephalosporin", classColor: "blue",
    indication: "Sepsis / meningitis / enteric fever / community pneumonia (IM for outpatient treatment)",
    doseStr: "50 mg/kg IM OD (max 2 g) | Meningitis: 100 mg/kg OD (max 4 g)",
    dosePerKg: 50, doseUnit: "mg", max: 2000,
    brands: "Monocef (Aristo) · Rocephin (Roche) · Oframax (Ranbaxy) · Ceftriax (FDC) · Ceftas (Sun Pharma) · Monotax (Lupin) · Xone (Cipla)",
    formulations: "250 mg vial · 500 mg vial · 1 g vial · 2 g vial — reconstitute with 1% lignocaine for IM (reduce pain). Use sterile water for IV.",
    site: "Gluteus (upper outer quadrant) or anterolateral thigh in young children. Do NOT inject deltoid if dose >500 mg.",
    technique: "Reconstitute 1 g vial in 3.5 mL 1% lignocaine for IM (gives 250 mg/mL). Use 21–23G needle. Inject slowly (1 mL/min). Deep IM injection. Max 1 g per injection site — split for larger doses.",
    onset: "1–2 hr (IM peak)", duration: "24 hr (OD dosing sufficient for sepsis)",
    cautions: [
      "Reconstitute with 1% lignocaine for IM — reduces injection pain significantly",
      "Do NOT use calcium-containing solutions or lignocaine for IV route",
      "Max 1 g per injection site — give into 2 sites if dose >1 g",
      "Avoid in neonates <28 days with hyperbilirubinaemia (bilirubin displacement)",
      "Biliary sludging with prolonged high-dose use",
    ],
    pearl: "Ceftriaxone IM is widely used in India for outpatient management of serious infections. Reconstitute with 1% lignocaine — dramatically reduces pain. Monocef (Aristo) is the most common brand. Dose once daily (excellent pharmacokinetics).",
  },
  {
    id: "benzylpenicillin-im",
    name: "Benzylpenicillin (Crystalline Penicillin G)",
    class: "Penicillin", classColor: "emerald",
    indication: "Meningococcal disease (pre-transfer dose) / streptococcal sepsis / tetanus / diphtheria",
    doseStr: "50,000 units/kg IM stat (max 2.4 million units)",
    dosePerKg: 50000, doseUnit: "units", max: 2400000,
    brands: "Crystapen (Beecham/GSK) · Penicillin G Sodium (Sarabhai, FDC) · Benzylpenicillin (generic) · Crystalline Penicillin G",
    formulations: "5 lakh (500,000) units vial · 10 lakh (1 million) units vial · 50 lakh (5 million) units vial. Reconstitute in 2–4 mL sterile water.",
    site: "Deep IM anterolateral thigh or gluteus. Can give IV push if IV access available.",
    technique: "Reconstitute vial with sterile water per pack insert. Give deep IM stat before transfer. Pre-hospital/PHC setting: 50,000 units/kg IM if meningococcal suspected.",
    onset: "15–30 min", duration: "4–6 hr (q4–6h for ongoing treatment via IV)",
    cautions: [
      "Penicillin allergy — have adrenaline available (1:1000)",
      "Test dose not required in emergency — time-critical",
      "Do NOT use procaine penicillin intravascularly",
      "High doses: monitor for hypernatraemia (sodium penicillin G contains Na⁺)",
    ],
    pearl: "Benzylpenicillin IM is the critical pre-transfer dose for suspected meningococcal disease (purpuric rash + fever). IAP/WHO: Give before hospital transfer — reduces mortality significantly. Crystapen widely available in Indian district hospitals.",
  },
  {
    id: "procaine-penicillin-im",
    name: "Procaine / Benzathine Penicillin",
    class: "Penicillin (Long-acting)", classColor: "emerald",
    indication: "Strep throat / rheumatic fever prophylaxis / syphilis / diphtheria",
    doseStr: "<30 kg: 600,000 units IM stat | ≥30 kg: 1,200,000 units IM stat",
    dosePerKg: null,
    fixedDose: "< 30 kg: 600,000 units IM · ≥30 kg: 1,200,000 units IM",
    brands: "Penidure LA (Wyeth/Pfizer) — benzathine penicillin · Pencom (Sun Pharma) · Dupen (Pfizer) · Procaine Penicillin (generic)",
    formulations: "Benzathine penicillin 1.2 MU (Penidure LA 12) · Procaine penicillin 3 lakh/5 lakh/10 lakh units vials · Penidure LA combination vials",
    site: "Deep gluteal (upper outer quadrant) ONLY — NEVER IV (fatal). Large volume — 2–4 mL injection.",
    technique: "Aspirate before injecting (accidental IV is fatal). Deep gluteal injection. Warn child: will be painful. Use 21G needle minimum for suspension formulation.",
    onset: "1–4 hr (slower than crystalline penicillin)", duration: "12–24 hr (procaine) · 21–28 days (benzathine)",
    cautions: [
      "FATAL if given IV — Hoigne syndrome (cardiovascular collapse, hallucinations)",
      "ALWAYS aspirate before injecting — confirm not in vessel",
      "Never use benzathine penicillin IV or intrathecally",
      "Pain at injection site — common, reassure",
    ],
    pearl: "Penidure LA (benzathine penicillin) is first-line for rheumatic fever prophylaxis in India — 1.2 MU IM every 21–28 days for 5–10 years (IAP). ALWAYS aspirate before injecting — IV injection causes Hoigne syndrome (fatal).",
  },
  {
    id: "gentamicin-im",
    name: "Gentamicin",
    class: "Aminoglycoside", classColor: "blue",
    indication: "Gram-negative sepsis / neonatal sepsis (with ampicillin) — IM in resource-limited settings",
    doseStr: "7.5 mg/kg IM OD (children) | Neonates: 4–5 mg/kg OD (GA-dependent)",
    dosePerKg: 7.5, doseUnit: "mg", max: 400,
    brands: "Garamycin (MSD) · Genticyn (Abbott) · Gentamicin (Cipla, Sun, IDPL) · Genospray",
    formulations: "10 mg/mL ampoule · 40 mg/mL ampoule · 80 mg/2 mL ampoule — concentrate for dilution",
    site: "Anterolateral thigh or gluteus (upper outer quadrant).",
    technique: "Once-daily extended interval dosing. Use 40 mg/mL ampoule to minimise volume. Inject deep IM. Monitor trough levels if prolonged course (>5 days).",
    onset: "30–60 min (IM peak)", duration: "24 hr",
    cautions: [
      "Nephrotoxicity and ototoxicity — monitor creatinine and urine output",
      "Avoid concurrent furosemide (synergistic ototoxicity)",
      "Monitor levels if >5 days: trough <1 mcg/mL, peak 5–10 mcg/mL",
      "Neonatal dosing is GA-dependent — under-dose in preterm, over-dose risk",
    ],
    pearl: "Gentamicin IM OD is standard for neonatal sepsis with ampicillin at primary health care level in India. Genticyn (Abbott) and IDPL generic most available. Rotate injection sites. Extended-interval OD dosing (7.5 mg/kg) preferred over TDS.",
  },
  {
    id: "ketorolac-im",
    name: "Ketorolac",
    class: "NSAID", classColor: "amber",
    indication: "Moderate-severe acute pain / post-operative / renal colic (when IV not available)",
    doseStr: "0.5 mg/kg IM (max 30 mg)",
    dosePerKg: 0.5, doseUnit: "mg", max: 30,
    brands: "Toradol (Roche) · Ketanov (Sun Pharma) · Ketlur (Lupin) · Ketorol (Dr. Reddy's) · Acular (Allergan)",
    formulations: "15 mg/mL (1 mL ampoule) · 30 mg/mL (1 mL ampoule) · 30 mg/mL (2 mL ampoule = 60 mg) — use 30 mg/mL for IM",
    site: "Deep gluteal (preferred) or deltoid. Large volume if low concentration — use 30 mg/mL.",
    technique: "0.5 mg/kg deep IM. Max 30 mg/dose. Max 5 days total (IM + PO). Rotate sites if repeat doses.",
    onset: "30–45 min", duration: "4–6 hr",
    cautions: [
      "Avoid in renal impairment, dehydration, active GI bleed, dengue",
      "Max 5 days total (IV + IM + oral combined)",
      "Not for neonates or infants <6 months",
      "Inhibits platelet aggregation — avoid pre-operatively within 7 days",
    ],
    pearl: "Ketorolac IM gives NSAID analgesia comparable to 10 mg morphine with less respiratory depression. Effective for renal colic, musculoskeletal pain, fractures. Ketanov (Sun Pharma) widely available. Max 5 days — transition to oral ibuprofen when possible.",
  },
  {
    id: "ondansetron-im",
    name: "Ondansetron",
    class: "5-HT3 Antagonist", classColor: "sky",
    indication: "Severe vomiting / post-operative nausea when IV access unavailable",
    doseStr: "0.1–0.15 mg/kg IM (max 8 mg)",
    dosePerKg: 0.1, doseUnit: "mg", max: 8,
    brands: "Emeset (Cipla) · Ondem (Alkem) · Zofran (GSK) · Vomikind (Mankind) · Nausea (Lupin) · Ondran (Ranbaxy)",
    formulations: "2 mg/mL · 4 mg/2 mL ampoule · 8 mg/4 mL ampoule — IV solution used IM (off-label but widely practiced India)",
    site: "Anterolateral thigh or deltoid (older children). IM use is off-label but effective.",
    technique: "0.1–0.15 mg/kg IM. Max 4 mg if <15 kg, 8 mg if ≥15 kg. Onset 20–30 min IM.",
    onset: "20–30 min (IM)", duration: "8 hr",
    cautions: [
      "IM route off-label (IV ampoule used — generally safe, widely practiced)",
      "QT prolongation with rapid IV; IM has slower absorption — lower risk",
      "Avoid in congenital long QT syndrome",
    ],
    pearl: "Ondansetron IM is widely practiced in Indian hospitals despite being off-label. Use IV ampoule IM. Effective for severe vomiting/gastroenteritis in the PHC/district hospital setting where IV access may not be established. Max 4 mg if <15 kg.",
  },
  {
    id: "dexamethasone-im",
    name: "Dexamethasone",
    class: "Corticosteroid", classColor: "emerald",
    indication: "Croup / severe allergy / cerebral oedema / anti-emetic (post-op)",
    doseStr: "0.6 mg/kg IM (croup, max 10 mg) | 0.15 mg/kg IM (anti-emetic, max 8 mg)",
    dosePerKg: 0.6, doseUnit: "mg", max: 10,
    brands: "Dexona (Sarabhai) · Decadron (MSD/Merck) · Wymesone (Wyeth) · Dexamethasone (Sun, Cipla, IDPL) · Hexadrol",
    formulations: "4 mg/mL ampoule (1 mL = 4 mg) · 8 mg/2 mL ampoule. Dexona-4 mg/mL is the standard in most Indian hospitals.",
    site: "Anterolateral thigh or deltoid or gluteal.",
    technique: "Draw up 0.6 mg/kg of 4 mg/mL solution. Single injection. For croup: single dose — no repeat needed (duration 36–72 hr).",
    onset: "30–60 min (anti-inflammatory effect begins later)", duration: "36–72 hr (single dose sufficient for croup)",
    cautions: [
      "Single dose has minimal side-effect risk",
      "Hyperglycaemia with repeated doses",
      "Not for long-term IM use",
    ],
    pearl: "Dexamethasone IM/IV/PO 0.6 mg/kg single dose is first-line for moderate-severe croup. PO is equally effective (Piyush Gupta). IM route used when oral route unavailable or vomiting. Dexona (4 mg/mL) is the most widely available brand.",
  },
  {
    id: "morphine-im",
    name: "Morphine",
    class: "Opioid Analgesic", classColor: "orange",
    indication: "Severe pain — fractures, burns, post-operative, sickle cell crisis",
    doseStr: "0.1–0.15 mg/kg IM (max 10 mg)",
    dosePerKg: 0.1, doseUnit: "mg", max: 10,
    brands: "Morphine Sulphate (Neon Labs, IDPL) · Morphgesic (Sun Pharma) · Morph (Rusan) — Schedule X",
    formulations: "10 mg/mL ampoule (1 mL) · 15 mg/mL ampoule · 1 mg/mL diluted ampoule (safer for paediatrics) · Schedule X drug — special prescribing authority required India",
    site: "Deep IM anterolateral thigh or deltoid.",
    technique: "0.1 mg/kg IM. Use 1 mg/mL diluted preparation for more accurate paediatric dosing. Onset 15–30 min IM. Monitor SpO₂.",
    onset: "15–30 min (IM peak 30–60 min)", duration: "3–5 hr",
    cautions: [
      "Respiratory depression — have naloxone 0.01 mg/kg IV ready",
      "Schedule X drug — requires special narcotic prescription (Form 7/8) in India",
      "Storage: double-lock, narcotic register maintained",
      "Reduce dose in renal impairment (morphine-6-glucuronide accumulation)",
      "Histamine release — avoid in asthma if possible (use fentanyl instead)",
    ],
    pearl: "Morphine IM requires Schedule X prescription (Narcotic Drugs and Psychotropic Substances Act). 0.1–0.15 mg/kg IM. Onset 15–30 min. Always have naloxone at bedside. 1 mg/mL diluted preparation safer for accurate paediatric dosing.",
  },
  {
    id: "vitamin-k-im",
    name: "Vitamin K1 (Phytomenadione)",
    class: "Fat-soluble Vitamin", classColor: "emerald",
    indication: "Neonatal prophylaxis (VKDB) / Vitamin K deficiency / warfarin reversal",
    doseStr: "Neonates: 1 mg IM at birth (0.5 mg if <1.5 kg) | Children: 1–5 mg IM OD × 3 days",
    dosePerKg: null,
    fixedDose: "Neonates: 1 mg IM at birth · Premature <1.5 kg: 0.5 mg · Children: 1–10 mg IM OD × 3 days",
    brands: "Phytomenadione injection (Cipla, Sun) · Konakion (Roche) · Kenadion · Vitamin K injection (IDPL, Neon) · Mephyton injection",
    formulations: "1 mg/0.5 mL ampoule (neonatal) · 10 mg/mL ampoule (adult — must dilute for neonates) · Konakion MM 10 mg/mL (preferred, can give IV slowly or IM)",
    site: "Anterolateral thigh (neonates — vastus lateralis). Use 25G 16mm needle. Pinch muscle. Perpendicular injection.",
    technique: "Neonatal: 1 mg IM to anterolateral thigh within 6 hr of birth. For IV: Konakion MM — slow IV infusion (not bolus). Do NOT give IV bolus (anaphylaxis risk).",
    onset: "6–12 hr (coagulation correction begins)", duration: "5–7 days (single dose prophylaxis)",
    cautions: [
      "IV bolus associated with anaphylaxis — give IV slowly over 15–30 min only",
      "IM is the preferred and safest route for neonatal prophylaxis",
      "Do NOT give adult 10 mg/mL concentration undiluted to neonates IM",
      "Konakion MM Paediatric (2 mg/0.2 mL) is the preferred neonatal formulation",
    ],
    pearl: "Vitamin K 1 mg IM at birth is mandatory in India (IAP recommendation) to prevent VKDB. Konakion MM Paediatric (2 mg/0.2 mL) is the preferred formulation. For warfarin reversal: 1–5 mg IV slowly — effect in 6 hr.",
  },
  {
    id: "glucagon-im",
    name: "Glucagon",
    class: "Pancreatic Hormone", classColor: "amber",
    indication: "Severe hypoglycaemia (unconscious / convulsing — when IV access impossible)",
    doseStr: "<25 kg: 0.5 mg IM | ≥25 kg: 1 mg IM",
    dosePerKg: null,
    fixedDose: "< 25 kg (or <8 yr): 0.5 mg IM stat · ≥ 25 kg: 1 mg IM stat",
    brands: "GlucaGen HypoKit (Novo Nordisk) · Glucagen (Novo Nordisk India) · Glucagon for Injection (Eli Lilly — limited India availability)",
    formulations: "GlucaGen HypoKit: 1 mg vial + 1 mL diluent syringe (ready to reconstitute). Reconstitute immediately before use.",
    site: "IM anterolateral thigh or deltoid or SC — all routes effective.",
    technique: "Reconstitute vial with provided diluent. Give full 0.5 mL (<25 kg) or 1 mL (≥25 kg) IM or SC. Child will usually regain consciousness in 10–15 min. Turn child on side before injection (vomiting common). Give oral glucose as soon as able to swallow.",
    onset: "10–15 min (glycogenolysis)", duration: "30–60 min (then oral glucose needed)",
    cautions: [
      "Position on side (lateral decubitus) before injection — vomiting common as child regains consciousness",
      "Does NOT work in glycogen-depleted states (malnutrition, prolonged fasting — no hepatic glycogen)",
      "GlucaGen HypoKit is expensive (~₹3000) — limited government hospital availability",
      "Replace with oral/IV glucose after recovery",
    ],
    pearl: "Glucagon IM is the primary emergency treatment for severe hypoglycaemia outside hospital. Train T1DM families to use GlucaGen HypoKit at home. Works by stimulating hepatic glycogenolysis — requires hepatic glycogen stores. Give oral glucose immediately once child is conscious.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// NEBULISED DRUG DATA (unchanged from original)
// ═══════════════════════════════════════════════════════════════════════════════
const NEBULISED_DRUGS = [
  {
    id: "salbutamol-neb",
    drug: "Salbutamol (Albuterol)",
    class: "SABA", classColor: "blue",
    brands: "Asthalin (Cipla) · Ventolin (GSK) · Salbair (Intas) · Salamol (Glenmark)",
    formulations: "Respules: 2.5 mg/2.5 mL · 5 mg/2.5 mL · Solution: 5 mg/mL (dilute before use)",
    dose: {
      mild_mod: "<20 kg: 2.5 mg · ≥20 kg: 5 mg",
      severe:   "Continuous nebulisation 0.15–0.3 mg/kg/hr (max 15 mg/hr) in ICU",
      mdi:      "4–8 puffs (100 mcg/puff) via spacer — preferred over nebuliser (IAP 2022)",
    },
    frequency: "Q20 min × 3 (acute) → Q4–6 hr (maintenance)",
    diluent: "2–3 mL NS to total volume 4 mL",
    onset: "5 min", duration: "4–6 hr",
    indications: ["Acute asthma (all severities)", "Bronchospasm", "Hyperkalaemia (adjunct, high-dose)", "COPD exacerbation"],
    cautions: ["Tachycardia, tremor, hypokalaemia (high doses)", "Paradoxical bronchospasm (rare)", "IV salbutamol available for refractory: 5–10 mcg/kg over 15 min then 1–5 mcg/kg/min"],
    pearl: "MDI + spacer is preferred over nebuliser for mild-moderate asthma (equivalent efficacy, faster, fewer side effects — IAP 2022, GINA 2024). Nebuliser preferred in severe/critical or child unable to use MDI.",
  },
  {
    id: "ipratropium-neb",
    drug: "Ipratropium Bromide",
    class: "SAMA", classColor: "violet",
    brands: "Ipravent (Sun Pharma) · Ipratop · Duolin (combined with salbutamol — Cipla) · Tiova",
    formulations: "Ipravent Respules: 250 mcg/mL · 500 mcg/2 mL · Duolin Respules: Salbutamol 2.5 mg + Ipratropium 500 mcg/2.5 mL",
    dose: {
      mild_mod: "<5 yr: 250 mcg · ≥5 yr: 500 mcg",
      note:     "Add to salbutamol for FIRST 1–2 hr only in moderate-severe asthma",
    },
    frequency: "Q20 min × 3 (first hr only) — no benefit beyond initial doses",
    diluent: "Add to salbutamol respule to reach 4 mL total (or use Duolin)",
    onset: "15–20 min", duration: "4–6 hr",
    indications: ["Moderate-severe acute asthma (combined with SABA)", "COPD exacerbation"],
    cautions: ["Avoid getting into eyes (mydriasis, blurred vision)", "Dry mouth, urinary retention", "No benefit in bronchiolitis"],
    pearl: "Use Duolin respules (combined formulation) for convenience. Do NOT use beyond first 1–2 hr — no added benefit (Cochrane, Ontario Pathway). Not indicated in bronchiolitis or viral wheeze.",
  },
  {
    id: "budesonide-neb",
    drug: "Budesonide",
    class: "ICS", classColor: "emerald",
    brands: "Budecort (Cipla) · Pulmicort (AstraZeneca) · Budeair (Intas) · Budamate (combined — Sun)",
    formulations: "Respules: 0.25 mg/2 mL · 0.5 mg/2 mL · 1 mg/2 mL",
    dose: {
      croup:   "2 mg single dose (equal to 0.6 mg/kg dexamethasone PO for moderate-severe croup)",
      asthma:  "0.5–1 mg BD (maintenance nebulised ICS — when MDI not possible)",
      note:    "For croup: 2 mg via nebuliser if PO/IM dexamethasone not possible",
    },
    frequency: "Croup: single dose · Maintenance: BD",
    diluent: "Can use undiluted or add NS to 4 mL",
    onset: "30–60 min (croup effect within 2 hr)", duration: "12–24 hr",
    indications: ["Croup (moderate-severe, when oral dexamethasone not possible)", "Asthma maintenance (nebulised ICS — younger children)"],
    cautions: ["Oral candidiasis with long-term use (rinse mouth after)", "Adrenal suppression with high chronic doses", "Oral dexamethasone 0.6 mg/kg preferred for croup — nebulised budesonide is alternative"],
    pearl: "Piyush Gupta: Nebulised budesonide 2 mg equivalent to oral dexamethasone 0.6 mg/kg in croup. In asthma: MDI + spacer preferred over routine nebulisation for ICS delivery.",
  },
  {
    id: "adrenaline-neb",
    drug: "Adrenaline (Epinephrine) 1:1000",
    class: "Vasoconstrictive", classColor: "red",
    brands: "Adrenaline IP 1 mg/mL (1:1000) — Neon Labs · Troikaa · AstraZeneca · Generic",
    formulations: "Adrenaline 1:1000 (1 mg/mL) ampoules — 1 mL · Multi-dose vials",
    dose: {
      croup:   "0.5 mL/kg of 1:1000 undiluted (max 5 mL) — make up to 4 mL with NS",
      racemic: "Racemic epinephrine 2.25%: 0.05 mL/kg (max 0.5 mL) in 3 mL NS — not widely available India",
      note:    "L-adrenaline 1:1000 at 0.5 mL/kg = racemic 2.25% at 0.05 mL/kg — equivalent efficacy",
    },
    frequency: "Q20–30 min PRN in moderate-severe croup. Observe ≥2–4 hr after last dose (rebound stridor)",
    diluent: "Make up to 4 mL with NS",
    onset: "10–30 min", duration: "1–2 hr (rebound stridor risk at 2–3 hr)",
    indications: ["Croup (moderate-severe, stridor at rest)", "Post-extubation stridor", "Anaphylaxis (bridge only — IM adrenaline is definitive)"],
    cautions: ["Observe MINIMUM 2–4 hr after nebulisation for rebound stridor", "Tachycardia, pallor, tremor", "Do NOT discharge immediately after nebulised adrenaline"],
    pearl: "L-adrenaline 1:1000 is the standard in India (racemic not widely available). Dose 0.5 mL/kg undiluted, dilute to 4 mL. Effect transient — always give systemic dexamethasone concurrently.",
  },
  {
    id: "hypertonic-saline-neb",
    drug: "Hypertonic Saline 3%",
    class: "Mucoactive", classColor: "sky",
    brands: "Neosal (Glenmark) · Saline Neb 3% · Pharmasal · Hypersal · Compounded 3% NaCl",
    formulations: "3% NaCl ampoules/vials 4–5 mL · Some brands available as 6% · Compounded from 30% NaCl stock",
    dose: {
      bronchiolitis: "4 mL 3% NaCl Q4–8 hr (nebulised)",
      note:          "Evidence inconsistent — IAP 2020 does NOT recommend routine use. Some centres use if admitted.",
    },
    frequency: "Q4–8 hr if used",
    diluent: "Use undiluted (4 mL 3% NaCl per dose)",
    onset: "15–30 min", duration: "4–8 hr",
    indications: ["Bronchiolitis (moderate-severe, hospitalised — inconsistent evidence)", "Cystic fibrosis airway clearance"],
    cautions: ["Bronchospasm — pretreat with salbutamol if wheeze present", "IAP 2020: NOT routinely recommended for bronchiolitis"],
    pearl: "Cochrane 2017: modest reduction in length of stay in hospitalised bronchiolitis, no significant ED benefit. If used, pretreat with salbutamol and give with suction available.",
  },
];

// ─── WEIGHT-AWARE HELPERS FOR NEB ─────────────────────────────────────────────
function computeNebDose(doseStr, weight) {
  if (!weight || !doseStr) return doseStr;
  let result = doseStr;
  result = result.replace(/([\d.]+)[–-]([\d.]+)\s*(mg|mcg)\/kg(\/(?:hr|min|day))?/g,
    (_, lo, hi, unit, per) => {
      const suffix = per || "";
      return `${(parseFloat(lo)*weight).toFixed(2)}–${(parseFloat(hi)*weight).toFixed(2)} ${unit}${suffix} [${weight}kg]`;
    });
  result = result.replace(/([\d.]+)\s*(mg)\/kg(\/(?:hr|min|day))?/g,
    (_, n, unit, per) => `${(parseFloat(n)*weight).toFixed(2)} ${unit}${per||""} [${weight}kg]`);
  result = result.replace(/([\d.]+)\s*mcg\/kg(\/(?:hr|min|day))?/g,
    (_, n, per) => `${(parseFloat(n)*weight).toFixed(1)} mcg${per||""} [${weight}kg]`);
  return result;
}

function resolveWeightBracket(doseStr, weight) {
  if (!weight || !doseStr) return [{ text: doseStr, active: true }];
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

function DoseValue({ doseStr, weight, toneText }) {
  const parts = resolveWeightBracket(doseStr, weight);
  if (parts.length === 1) return <span className={`text-xs font-semibold ${toneText}`}>{parts[0].text}</span>;
  return (
    <span className="text-xs font-semibold">
      {parts.map(({ text, active }, i) => (
        <span key={i}>
          {i > 0 && <span className="text-slate-300 dark:text-slate-600 mx-1">·</span>}
          <span className={active ? toneText : "text-slate-400 dark:text-slate-600 line-through text-[10px]"}>
            {text}
          </span>
        </span>
      ))}
    </span>
  );
}

// ─── NEB DRUG CARD (original pattern preserved) ───────────────────────────────
function NebDrugCard({ drug, weight, expandedDrugId }) {
  const [open, setOpen] = useState(false);
  const isExpanded = expandedDrugId === drug.id;
  const t = TONE[drug.classColor] || TONE.slate;

  useEffect(() => {
    if (isExpanded) {
      setOpen(true);
      setTimeout(() => {
        document.getElementById(`neb-drug-${drug.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [isExpanded, drug.id]);

  const previewDoseStr = Object.values(drug.dose)[0].split("·")[0].trim();
  const previewParts   = resolveWeightBracket(previewDoseStr, weight);
  const previewActive  = previewParts.find(p => p.active) || previewParts[0];

  return (
    <div id={`neb-drug-${drug.id}`}
      className={`border rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 transition-all
        ${open ? "border-slate-300 dark:border-slate-600" : "border-slate-200 dark:border-slate-700"}
        ${isExpanded ? "ring-2 ring-blue-400 dark:ring-blue-500 shadow-md" : ""}
      `}>
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
            <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
              {drug.brands.split(" · ")[0]} · {drug.brands.split(" · ")[1]}
            </div>
          </div>
        </div>
        <div className={`text-[10px] font-mono font-bold flex-shrink-0 mr-2 ${t.text}`}>
          {previewActive.text}
        </div>
        <ArrowRight size={12} weight="bold"
          className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-4">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2">Doses</div>
            <div className="space-y-1.5">
              {Object.entries(drug.dose).map(([k, v]) => (
                <div key={k} className={`rounded-lg px-3 py-2 border ${t.border} ${t.bg}`}>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">{k.replace(/_/g," ")}</div>
                  <DoseValue doseStr={v} weight={weight} toneText={t.text} />
                </div>
              ))}
            </div>
            {weight && (
              <div className="mt-1.5 text-[9px] font-mono text-slate-400 flex items-center gap-1">
                <span className={`font-bold ${t.text}`}>⚖ {weight} kg</span>
                <span>· doses above computed for this weight</span>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Indian Brands &amp; Formulations</div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-white">{drug.brands}</div>
                  <div className="text-slate-500 dark:text-slate-400">{drug.formulations}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Diluent",    val: drug.diluent    },
                  { label: "Frequency",  val: drug.frequency  },
                  { label: "Onset",      val: drug.onset      },
                  { label: "Duration",   val: drug.duration   },
                ].map(({ label, val }) => (
                  <div key={label} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5">
                    <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">{label}</div>
                    <div className="font-semibold text-slate-800 dark:text-white">{val}</div>
                  </div>
                ))}
              </div>
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
            <div className="space-y-3">
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

// ─── ROUTE DRUG LIST WRAPPER ───────────────────────────────────────────────────
function RouteDrugList({ drugs, weight, routeLabel, routeColor, infoText }) {
  const t = TONE[routeColor] || TONE.slate;
  return (
    <div className="space-y-3">
      <InfoBox tone={routeColor} icon={Info}>
        {infoText}
      </InfoBox>
      <div className="space-y-2">
        {drugs.map(drug => (
          <RouteDrugCard key={drug.id} drug={drug} weight={weight} />
        ))}
      </div>
      <p className="text-[10px] text-slate-400 font-mono text-center pt-1">
        Piyush Gupta 18e · IAP 2024 · Harriet Lane 22e · PALS 2020 · CIMS India 2024 · Drug Today India 2024 · CDSCO India
      </p>
    </div>
  );
}

// ─── SPACER + NEB TECHNIQUE DATA (unchanged) ──────────────────────────────────
const SPACER_DEVICES = [
  { age: "0–2 yr",  mask: "Round infant mask (soft seal)",           device: "Aerochamber Plus (small mask) · Babyhaler (GSK) · Volumatic + infant mask",          notes: "Crying during inhalation reduces drug delivery. Use when calm/sleeping if possible. 5–10 slow breaths per puff." },
  { age: "2–6 yr",  mask: "Child mask or mouthpiece (if can seal)",  device: "Aerochamber Plus Flow-Vu · Volumatic (GSK) · BreathAlert (Indian)",                  notes: "Mouthpiece preferred once child can seal lips (usually ≥4 yr). Tidal breathing technique. 5–10 breaths per puff." },
  { age: "6+ yr",   mask: "Mouthpiece",                              device: "Aerochamber Plus Flow-Vu · Volumatic · Inhalaid · SpaceChamber",                       notes: "Slow deep breath or tidal breathing × 5–10. Wait 30–60 s between puffs. Rinse mouth after ICS." },
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

// ─── NEBULISED DRUGS TAB (unchanged structure) ────────────────────────────────
function NebulisedDrugsTab({ weight, expandedDrugId }) {
  const [section, setSection] = useState("drugs");

  return (
    <div className="space-y-4">
      <InfoBox tone="blue" icon={Wind}>
        MDI + spacer is preferred over nebuliser for mild-moderate asthma across all ages — equivalent efficacy, faster, more portable, fewer side effects (IAP 2022 · GINA 2024 · Piyush Gupta 18e). Reserve nebuliser for severe exacerbations, very young infants, or inability to use MDI.
      </InfoBox>
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: "drugs", label: "Nebulised Drugs" }, { id: "spacer", label: "Spacer / MDI Guide" }, { id: "technique", label: "Nebuliser Technique" },
        ].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
              section === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{s.label}</button>
        ))}
      </div>

      {section === "drugs" && (
        <div className="space-y-3">
          {NEBULISED_DRUGS.map(drug => (
            <NebDrugCard key={drug.id} drug={drug} weight={weight} expandedDrugId={expandedDrugId} />
          ))}
          <p className="text-[10px] text-slate-400 font-mono text-center">
            Piyush Gupta 18e · IAP Asthma &amp; Bronchiolitis Guidelines 2020/2022 · GINA 2024 Paediatric · Ontario CHEO Lung Care Pathway
          </p>
        </div>
      )}

      {section === "spacer" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
            <div className="font-bold text-sm mb-2 text-blue-700 dark:text-blue-300" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Why MDI + Spacer is Preferred (GINA 2024 · IAP 2022)
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-xs text-blue-800 dark:text-blue-200">
              {["Equivalent bronchodilation to nebuliser in mild-moderate acute asthma (Cochrane 2013)","Less systemic absorption → fewer side effects (less tachycardia, hypokalaemia)","Faster to set up — no wet circuit preparation required","Can deliver O₂ through facemask while using spacer during acute episodes","Better lung deposition than nebuliser when used correctly with spacer","Portable, convenient for home use — reduces unnecessary nebuliser dependence"].map((s, i) => (
                <div key={i} className="flex items-start gap-1.5"><CheckCircle size={9} weight="fill" className="text-blue-500 flex-shrink-0 mt-0.5" />{s}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-bold text-sm mb-2 text-slate-800 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Spacer Selection by Age</div>
            <div className="space-y-3">
              {SPACER_DEVICES.map((s, i) => (
                <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="font-black text-2xl text-blue-600 dark:text-blue-400 flex-shrink-0 leading-none" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{s.age}</div>
                    <div className="flex-1 space-y-1.5">
                      <div className="text-xs"><span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mr-1">Mask:</span><span className="text-slate-700 dark:text-slate-200">{s.mask}</span></div>
                      <div className="text-xs"><span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mr-1">Devices:</span><span className="text-slate-700 dark:text-slate-200 font-semibold">{s.device}</span></div>
                      <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300"><Info size={10} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />{s.notes}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-bold text-sm mb-2 text-slate-800 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>MDI + Spacer Technique</div>
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
        </div>
      )}

      {section === "technique" && (
        <div className="space-y-4">
          <InfoBox tone="amber" icon={Lightbulb} title="When to use a nebuliser">
            Severe/life-threatening exacerbation · Child unable to use MDI + spacer · Continuous salbutamol needed · Adrenaline for croup · Very young infant who cannot cooperate with MDI
          </InfoBox>
          <div>
            <div className="font-bold text-sm mb-2 text-slate-800 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Nebuliser Technique — Step by Step</div>
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
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
            <div className="font-bold text-xs text-red-700 dark:text-red-300 mb-2" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Common Errors That Reduce Drug Delivery</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {["Poor mask seal — leaks around nose/chin reduce delivery by 50–70%","Flow rate too low (<6 L/min) — produces large particles that deposit in upper airway","Not diluting to 4 mL — dead volume wastes more drug proportionally with small volumes","Holding nebuliser at angle >45° — drug pools, reduced output","Child crying during treatment — reduces deposition, use calm/sleep/distraction","Mouthpiece (not mask) in <4 yr — child breathes nasally, drug never reaches lungs"].map((s, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-red-800 dark:text-red-200">
                  <ArrowRight size={9} weight="bold" className="text-red-500 flex-shrink-0 mt-0.5" />{s}
                </div>
              ))}
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
  { id: "drugs",  label: "Drug Doses", Icon: Pill        },
  { id: "pr",     label: "Per Rectal", Icon: Drop        },
  { id: "in",     label: "Intranasal", Icon: Eyedropper  },
  { id: "im",     label: "IM Drugs",   Icon: Syringe     },
  { id: "nebs",   label: "Nebulised",  Icon: Wind        },
];

export default function DrugsTab({ searchEntry }) {
  const { weight } = useWeight();
  const [activeTab, setActiveTab] = useState("drugs");
  const [searchQuery, setSearchQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [expandedDrugId, setExpandedDrugId] = useState(null);

  useEffect(() => {
    if (!searchEntry) return;
    if (searchEntry.section === "Nebulised Drugs") {
      setActiveTab("nebs");
      if (searchEntry.drugId) setExpandedDrugId(searchEntry.drugId);
    } else if (searchEntry.section === "Per Rectal") {
      setActiveTab("pr");
    } else if (searchEntry.section === "Intranasal") {
      setActiveTab("in");
    } else if (searchEntry.section === "Intramuscular") {
      setActiveTab("im");
    } else {
      setActiveTab("drugs");
      if (searchEntry.drugId) {
        const matchedDrug = DRUGS.find(d => d.id === searchEntry.drugId);
        if (matchedDrug) {
          const matchingCat = DRUG_CATEGORIES.find(c => c.matches?.includes(matchedDrug.category));
          setCat(matchingCat?.id ?? "all");
          setSearchQuery(matchedDrug.name);
        }
        setExpandedDrugId(searchEntry.drugId);
      }
    }
  }, [searchEntry]);

  useEffect(() => {
    if (expandedDrugId) {
      const t = setTimeout(() => setExpandedDrugId(null), 6000);
      return () => clearTimeout(t);
    }
  }, [expandedDrugId]);

  const filtered = useMemo(() => {
    const catDef = DRUG_CATEGORIES.find((c) => c.id === cat);
    const matches = catDef?.matches;
    return DRUGS.filter((d) => {
      const matchCat = !matches || matches.includes(d.category);
      const matchQ   = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.indication.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQ;
    });
  }, [searchQuery, cat]);

  return (
    <div className="space-y-5">
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

      {/* Tab bar */}
      <div className="flex gap-1.5 flex-wrap">
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
                placeholder="Search drug or indication…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {DRUG_CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setCat(c.id)}
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
                  {["Drug","Indication","Category","Dose / kg",`Calc (${weight} kg)`,"Route","Notes"].map(h => (
                    <th key={h} className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} id={`drug-row-${d.id}`}
                    className={`border-t border-slate-200 dark:border-slate-800 align-top transition-all ${
                      expandedDrugId === d.id
                        ? "bg-blue-50 dark:bg-blue-950/30 outline outline-2 outline-blue-400 dark:outline-blue-600 outline-offset-[-2px]"
                        : "odd:bg-slate-50 dark:odd:bg-slate-900/40"
                    }`}>
                    <td className="p-3 font-bold">{d.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{d.indication}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${CAT_COLORS[d.category]}`}>
                        {d.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {d.fixedDose ? d.fixedDose : d.dosePerKg == null ? "—" : `${d.dosePerKg} ${d.unit}/kg${d.max ? ` (max ${d.max})` : ""}`}
                    </td>
                    <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">{computeDrugDose(d, weight)}</td>
                    <td className="p-3 font-mono text-xs">{d.route}</td>
                    <td className="p-3 text-xs text-slate-500 dark:text-slate-400 max-w-xs">{d.notes}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">No drugs match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PER RECTAL ── */}
      {activeTab === "pr" && (
        <RouteDrugList
          drugs={PR_DRUGS}
          weight={weight}
          routeLabel="Per Rectal"
          routeColor="violet"
          infoText="Per rectal (PR) drugs are used when IV access is unavailable, the child is vomiting, or oral route is not feasible. Rectal bioavailability is lower and more variable than IV — doses are higher accordingly. Diazepam PR is the most commonly used PR drug in Indian paediatric practice for acute seizures."
        />
      )}

      {/* ── INTRANASAL ── */}
      {activeTab === "in" && (
        <RouteDrugList
          drugs={IN_DRUGS}
          weight={weight}
          routeLabel="Intranasal"
          routeColor="sky"
          infoText="Intranasal (IN) drugs deliver rapid systemic effect via nasal mucosa. A MAD (Mucosal Atomisation Device) atomiser is essential — drops run to pharynx and are swallowed. Maximum volume per nostril is 0.5 mL; split doses between both nostrils for larger volumes. Use concentrated formulations to minimise volume."
        />
      )}

      {/* ── INTRAMUSCULAR ── */}
      {activeTab === "im" && (
        <RouteDrugList
          drugs={IM_DRUGS}
          weight={weight}
          routeLabel="Intramuscular"
          routeColor="orange"
          infoText="Intramuscular (IM) drugs are used when IV access is delayed or unavailable. Anterolateral thigh (vastus lateralis) is the preferred site in children — faster absorption and less risk than deltoid or gluteal. Always aspirate before injecting depot penicillins. Rotate injection sites for repeated doses."
        />
      )}

      {/* ── NEBULISED ── */}
      {activeTab === "nebs" && (
        <NebulisedDrugsTab weight={weight} expandedDrugId={expandedDrugId} />
      )}
    </div>
  );
}
