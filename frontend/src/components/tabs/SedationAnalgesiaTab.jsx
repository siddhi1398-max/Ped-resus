// frontend/src/components/tabs/SedationAnalgesiaTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sedation & Analgesia reference tab
// Refs: Tintinalli ch.38 · F&L ch.4 · ACEP PSA guidelines · NYSORA · IAP
//       Morgan & Mikhail Clinical Anaesthesiology · Motoyama Paediatric Anaesthesia
//       Cote & Lerman (eds) A Practice of Anesthesia for Infants & Children 6e
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Warning, Lightbulb, CaretDown, ArrowSquareOut, CheckCircle,
  Syringe, FirstAid, Wind, Pill, ClipboardText, Flask,
  Crosshair, Heartbeat, ArrowRight, X, Brain, Stethoscope,
  NoteBlank, Lightning, CheckSquare, ShieldWarning, TestTube,
  Target, Radioactive, EyedropperSample,
} from "@phosphor-icons/react";
import {
  LOCAL_ANAESTHETICS, PSA_PRINCIPLES, PSA_REGIMENS, NERVE_BLOCKS, LAST_PROTOCOL,
} from "../../data/sedationAnalgesia";

// ─── COLOUR MAP ───────────────────────────────────────────────────────────────
const CMAP = {
  violet:  "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  blue:    "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  sky:     "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  orange:  "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  emerald: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  teal:    "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  slate:   "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  red:     "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  amber:   "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  purple:  "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  rose:    "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  cyan:    "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
};

// ─── PSA AGENTS ───────────────────────────────────────────────────────────────
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
    cautions: "Pneumothorax, bowel obstruction, ↑ICP, B12 deficiency, <4 yr",
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
    cautions: "Adrenal suppression (single dose acceptable). Avoid in septic shock.",
    pearl: "Best haemodynamic profile for RSI in shocked patients. Myoclonus common but benign. Not for ongoing sedation.",
  },
];

// ─── ORAL SEDATIVE AGENTS ─────────────────────────────────────────────────────
const ORAL_SEDATIVES = [
  {
    drug: "Midazolam",
    class: "Benzodiazepine",
    classColor: "sky",
    brands: "Versed (Roche) · Mezolam (Neon) · Dormalin (Torrent) · Dormicum (Roche)",
    dose: "0.3–0.6 mg/kg PO (max 15 mg)",
    onset: "15–20 min",
    working: "30–45 min",
    halfLife: "1.7–2.4 hr",
    reversal: "Flumazenil 0.01 mg/kg IV",
    airway: "Resp. depression",
    airwayColor: "amber",
    formulations: "Syrup 2 mg/mL · IV solution 1 mg/mL (used orally mixed in juice)",
    comments: "Most widely used oral pre-med in Indian paediatric practice. Bitter taste — mix in juice or honey. Amnesia + anxiolysis. Anticonvulsant. Disinhibition / dysphoria in ~10%. Respiratory depression at higher doses.",
    cautions: "Respiratory depression + apnoea at doses >0.75 mg/kg. Paradoxical agitation. Requires monitoring.",
    pearl: "Gold standard oral sedation in children. Onset predictable at 15–20 min. Give 30 min before procedure.",
  },
  {
    drug: "Triclofos Sodium",
    class: "Sedative-Hypnotic",
    classColor: "violet",
    brands: "Pedicloryl (FDC) · Tricloryl · Calmax (Alkem) · Hypnoderm",
    dose: "50–75 mg/kg PO (max 1,000 mg)",
    onset: "20–40 min",
    working: "6–8 hr",
    halfLife: "4–8 hr (active metabolite trichloroethanol)",
    reversal: "None",
    airway: "Mild depression",
    airwayColor: "amber",
    formulations: "Syrup 500 mg/5 mL — widely available in India · Oral solution",
    comments: "Preferred oral sedative for non-painful procedural sedation in Indian children (EEG, echo, MRI, ophthalmology). Metabolised to trichloroethanol (same active metabolite as chloral hydrate). Palatable syrup — well accepted. NOT analgesic. Long duration useful for MRI.",
    cautions: "Prolonged sedation (4–8 hr) — requires prolonged observation. Sensitises myocardium to catecholamines. Hepatic/renal disease — use with caution. Avoid in neonates <1 month.",
    pearl: "Workhorse oral sedative in Indian paediatric practice. Dose 75 mg/kg for MRI sedation — success rate ~85%. Must fast and monitor. Avoid in cardiac disease.",
  },
  {
    drug: "Chloral Hydrate",
    class: "Sedative-Hypnotic",
    classColor: "rose",
    brands: "Discontinued in India · Previously: Somnote, Noctec",
    dose: "25–100 mg/kg PO (max 1,000 mg single dose)",
    onset: "30–60 min",
    working: "60–90 min",
    halfLife: "4–8 hr (trichloroethanol metabolite)",
    reversal: "None",
    airway: "Resp. depression",
    airwayColor: "red",
    formulations: "No longer available in India — replaced by triclofos sodium",
    comments: "Historically widely used. Sensitises myocardium to epinephrine — arrhythmia risk. Active metabolite trichloroethanol same as triclofos. Now replaced by triclofos in India. Listed for completeness.",
    cautions: "Not available in India. Narrow therapeutic index. Myocardial sensitisation. Respiratory depression. Hepatotoxicity in repeated doses.",
    pearl: "Triclofos sodium is essentially a pro-drug of chloral hydrate with equivalent efficacy and better palatability. Use triclofos where chloral hydrate protocols are referenced.",
  },
  {
    drug: "Hydroxyzine",
    class: "Antihistamine",
    classColor: "amber",
    brands: "Atarax (UCB) · Vistaril · Hydroxyzine (Cipla, Sun)",
    dose: "1–2 mg/kg PO (max 50 mg)",
    onset: "30–45 min",
    working: "30–45 min",
    halfLife: "3–7 hr",
    reversal: "None",
    airway: "Preserved",
    airwayColor: "emerald",
    formulations: "Syrup 10 mg/5 mL (Atarax) · Tablets 10 mg, 25 mg",
    comments: "Antiemetic + anxiolytic + mild sedation. Anticholinergic effects (dry mouth, urinary retention). Useful as pre-medication to reduce opioid requirements. No respiratory depression at standard doses. Often combined with midazolam.",
    cautions: "Anticholinergic: avoid in pyloric stenosis, BPH, glaucoma. May prolong QT at higher doses. Avoid in neonates (<1 month).",
    pearl: "Useful adjunct to midazolam for anxiolysis + antiemesis. 1 mg/kg PO gives reliable sedation and reduces post-operative nausea.",
  },
  {
    drug: "Diphenhydramine",
    class: "Antihistamine",
    classColor: "amber",
    brands: "Benadryl (Pfizer/J&J) · Zydryl · Dimedrol · Diphen (various)",
    dose: "1–2 mg/kg PO (max 50 mg)",
    onset: "5–30 min",
    working: "30–45 min",
    halfLife: "4–7 hr",
    reversal: "None",
    airway: "Preserved",
    airwayColor: "emerald",
    formulations: "Benadryl Syrup 12.5 mg/5 mL · Tablets 25 mg, 50 mg",
    comments: "Antihistamine with sedative + anticholinergic properties. Antiemetic. Mild anxiolysis. Widely available in India. Paradoxical excitation in ~10% of children under 6 yr. NOT a primary sedative agent.",
    cautions: "Paradoxical excitation common in young children. Anticholinergic effects. Avoid <2 yr. Not recommended as sole sedative.",
    pearl: "Useful for anxiolysis and antiemesis. Paradoxical excitement more common than hydroxyzine. Benadryl syrup widely available OTC.",
  },
  {
    drug: "Promethazine",
    class: "Phenothiazine",
    classColor: "orange",
    brands: "Phenergan (Sanofi) · Fenez (FDC) · Promethafix · Avomine (various)",
    dose: "0.5–1 mg/kg PO (max 25 mg)",
    onset: "15–30 min",
    working: "60 min",
    halfLife: "10–19 hr",
    reversal: "None",
    airway: "Resp. depression",
    airwayColor: "red",
    formulations: "Phenergan Syrup 5 mg/5 mL · Tablets 10 mg, 25 mg",
    comments: "Antihistamine + antiemetic + phenothiazine. Sedation, anxiolysis, antiemetic. Extrapyramidal effects (akathisia, dystonia) especially in infants. FDA black box warning: AVOID in children <2 yr.",
    cautions: "AVOID in <2 yr — fatal respiratory depression (FDA black box). Extrapyramidal reactions 2–12 yr — treat with benztropine. QT prolongation. Synergistic respiratory depression with opioids.",
    pearl: "Useful antiemetic in >2 yr. Sedative effect less reliable than midazolam. Reserve for antiemesis rather than primary sedation.",
  },
  {
    drug: "Diazepam",
    class: "Benzodiazepine",
    classColor: "sky",
    brands: "Valium (Roche) · Calmpose (Ranbaxy) · Paxum (Torrent) · Antenex",
    dose: "0.25–0.5 mg/kg PO (max 10 mg)",
    onset: "20–30 min",
    working: "60 min",
    halfLife: "20–100 hr (active metabolites much longer)",
    reversal: "Flumazenil 0.01 mg/kg IV",
    airway: "Resp. depression",
    airwayColor: "amber",
    formulations: "Calmpose Syrup 2 mg/5 mL · Tablets 2 mg, 5 mg, 10 mg",
    comments: "Anxiolytic + amnestic + anticonvulsant. Long half-life with active metabolites (desmethyldiazepam) — prolonged sedation. Less predictable oral absorption than midazolam. Largely replaced by midazolam for procedural sedation.",
    cautions: "Active metabolites → prolonged sedation (12–24 hr post-dose). Accumulation with repeated dosing. Respiratory depression. Not recommended for outpatient procedural sedation.",
    pearl: "Desmethyldiazepam half-life can be 36–200 hr in children — inappropriate for outpatient sedation. Use midazolam instead for procedures.",
  },
  {
    drug: "Lorazepam",
    class: "Benzodiazepine",
    classColor: "sky",
    brands: "Ativan (Wyeth/Pfizer) · Calmdown (Cipla) · Lor (Sun Pharma) · Larpose",
    dose: "0.05 mg/kg PO/SL (max 2 mg)",
    onset: "30–60 min",
    working: "60–90 min",
    halfLife: "10–20 hr",
    reversal: "Flumazenil 0.01 mg/kg IV",
    airway: "Resp. depression",
    airwayColor: "amber",
    formulations: "Ativan Tablets 1 mg, 2 mg (sublingual possible) · IV solution used orally",
    comments: "Potent anxiolytic + amnestic. Useful sublingual route — reliable absorption. No active metabolites unlike diazepam. Less respiratory depression than diazepam at equivalent doses.",
    cautions: "Longer half-life than midazolam → prolonged sedation. Paradoxical agitation. Respiratory depression with concomitant opioids. Limited paediatric oral dosing data.",
    pearl: "Sublingual lorazepam (0.05 mg/kg) useful when oral access limited. Onset 15–30 min sublingually. More predictable than oral diazepam.",
  },
  {
    drug: "Ketamine (oral)",
    class: "NMDA Antagonist",
    classColor: "violet",
    brands: "Ketamine (Neon, Troikaa) · Ketalar · Aneket",
    dose: "3–6 mg/kg PO (+ midazolam 0.3 mg/kg PO)",
    onset: "20–40 min",
    working: "20–120 min (wide variability)",
    halfLife: "2–3 hr (oral bioavailability 16–20%)",
    reversal: "None",
    airway: "Generally maintained",
    airwayColor: "emerald",
    formulations: "Ketamine injection 500 mg/10 mL — mixed in juice for oral use",
    comments: "Oral route has low and variable bioavailability (16–20%) due to extensive first-pass metabolism. Requires higher doses than parenteral. Usually combined with oral midazolam. Analgesic + amnestic + anxiolytic. Working time highly variable.",
    cautions: "Wide variability in oral absorption — unreliable for timed procedures. Dysphoria and emergence reactions. Hypersalivation — add glycopyrrolate 0.01 mg/kg PO. Raised ICP risk (relative). Avoid <3 months.",
    pearl: "Oral ketamine (3–6 mg/kg) + midazolam (0.3 mg/kg) useful for uncooperative children when IV access not possible. Accept wide variability in onset. Combination reduces emergence dysphoria.",
  },
  {
    drug: "Dexmedetomidine (IN)",
    class: "α2-agonist",
    classColor: "teal",
    brands: "Precedex (Hospira/Pfizer) · Dextomid (Neon) · Dexdor",
    dose: "1–2 mcg/kg IN (procedural)",
    onset: "30 min IN",
    working: "60–120 min",
    halfLife: "2–3 hr",
    reversal: "None (atipamezole not routinely available)",
    airway: "Preserved — no resp. depression",
    airwayColor: "emerald",
    formulations: "100 mcg/mL IV solution — used intranasally with MAD atomiser · No specific IN formulation",
    comments: "α2-agonist: anxiolysis without respiratory depression. Intranasal route widely used off-label — MAD nasal device gives reliable absorption. Patients remain arousable and cooperative. No amnesia. Ideal for MRI, echo, EEG.",
    cautions: "Bradycardia + hypotension dose-dependent. Slow onset (30 min IN) — poor for urgent sedation. Not analgesic. Expensive.",
    pearl: "IN dexmedetomidine 2–3 mcg/kg — excellent pre-med for MRI, ECHO, ophthalmology. No respiratory depression = unique safety advantage. Combine with IN midazolam for enhanced effect.",
  },
];

// ─── SECTION ICON MAP ─────────────────────────────────────────────────────────
const SECTION_ICONS = {
  psa:           { icon: Syringe,          color: "text-violet-500" },
  oralSedation:  { icon: EyedropperSample, color: "text-teal-500"   },
  psaPrinciples: { icon: ClipboardText,    color: "text-blue-500"   },
  regimens:      { icon: TestTube,         color: "text-teal-500"   },
  local:         { icon: ShieldWarning,    color: "text-orange-500" },
  blocks:        { icon: Crosshair,        color: "text-red-500"    },
  last:          { icon: ShieldWarning,    color: "text-red-600"    },
};

function Section({ title, sectionKey, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg  = SECTION_ICONS[sectionKey] || { icon: NoteBlank, color: "text-slate-400" };
  const Icon = cfg.icon;
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={16} weight="bold" className={`flex-shrink-0 ${cfg.color}`} />
          <span className="font-bold text-sm text-slate-900 dark:text-white"
                style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{title}</span>
        </div>
        <CaretDown size={14} weight="bold"
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 py-4 bg-white dark:bg-slate-900/50">{children}</div>}
    </div>
  );
}

// ─── SHARED EXPANDED DETAIL PANEL ─────────────────────────────────────────────
// Used identically by both PSA agent rows and oral sedative rows
function ExpandedDetail({ bestFor, cautions, pearl, brands, formulations, comments, colSpan }) {
  const isOral = !!brands; // oral sedatives have brands/formulations/comments

  return (
    <tr>
      <td colSpan={colSpan} className="px-4 pb-4 pt-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
        <div className={`grid gap-3 ${isOral ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>

          {/* Best For / Indian Brands */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 mb-1.5">
              {isOral
                ? <Flask size={10} weight="bold" className="text-slate-400" />
                : <Target size={10} weight="bold" className="text-slate-400" />
              }
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {isOral ? "Indian Brands" : "Best For"}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed"
               style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
              {isOral ? brands : bestFor}
            </p>
          </div>

          {/* Formulations (oral only) */}
          {isOral && (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Pill size={10} weight="bold" className="text-slate-400" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}>Formulations</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed"
                 style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>{formulations}</p>
            </div>
          )}

          {/* Clinical Comments (oral) / Best For already shown for PSA above */}
          {isOral && (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 mb-1.5">
                <NoteBlank size={10} weight="bold" className="text-slate-400" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}>Clinical Comments</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                 style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>{comments}</p>
            </div>
          )}

          {/* Cautions */}
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Warning size={10} weight="fill" className="text-red-500" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-red-500"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>Cautions</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed"
               style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>{cautions}</p>
          </div>

          {/* Pearl */}
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb size={10} weight="fill" className="text-amber-500" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>Clinical Pearl</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed"
               style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>{pearl}</p>
          </div>

        </div>
      </td>
    </tr>
  );
}

// ─── PSA AGENT TABLE ──────────────────────────────────────────────────────────
function PSAAgentTable({ weight }) {
  const [expanded, setExpanded] = useState(null);

  const wDose = (doseStr) => {
    if (!doseStr || doseStr === "—") return "—";
    const mgKg  = doseStr.match(/([\d.]+)–?([\d.]*)\s*mg\/kg/);
    const mcgKg = doseStr.match(/([\d.]+)–?([\d.]*)\s*mcg\/kg/);
    if (mgKg) {
      const lo = +(parseFloat(mgKg[1])  * weight).toFixed(1);
      const hi = mgKg[2]  ? +(parseFloat(mgKg[2])  * weight).toFixed(1) : null;
      return hi ? `${lo}–${hi} mg`  : `${lo} mg`;
    }
    if (mcgKg) {
      const lo = +(parseFloat(mcgKg[1]) * weight).toFixed(0);
      const hi = mcgKg[2] ? +(parseFloat(mcgKg[2]) * weight).toFixed(0) : null;
      return hi ? `${lo}–${hi} mcg` : `${lo} mcg`;
    }
    return doseStr;
  };

  const COLS = ["Agent & Class", "IV Dose", "IN / IM Dose", "Onset / Duration", "Analg.", "Airway", "BP", "Reversal"];

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
        Doses calculated for{" "}
        <span className="text-slate-900 dark:text-white font-bold"
              style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{weight} kg</span>.
        Tap any row to expand clinical details.
      </p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-xs border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              {COLS.map(h => (
                <th key={h} className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PSA_AGENTS.map(a => {
              const isOpen = expanded === a.name;
              return (
                <>
                  <tr key={a.name}
                    onClick={() => setExpanded(isOpen ? null : a.name)}
                    className={`border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${
                      isOpen ? "bg-slate-50 dark:bg-slate-800/60" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    }`}>
                    {/* Col 1: Agent + Class badge */}
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-slate-900 dark:text-white"
                           style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{a.name}</div>
                      <span className={`inline-block text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border mt-0.5 ${CMAP[a.classColor]}`}
                            style={{ fontFamily: '"JetBrains Mono", monospace' }}>{a.class}</span>
                    </td>
                    {/* Col 2: IV Dose */}
                    <td className="px-3 py-2.5">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400"
                           style={{ fontFamily: '"JetBrains Mono", monospace' }}>{wDose(a.ivDose)}</div>
                      <div className="text-slate-400 text-[9px] mt-0.5"
                           style={{ fontFamily: '"JetBrains Mono", monospace' }}>{a.ivDose}</div>
                    </td>
                    {/* Col 3: IN/IM Dose */}
                    <td className="px-3 py-2.5">
                      <div className="font-mono font-bold text-violet-600 dark:text-violet-400"
                           style={{ fontFamily: '"JetBrains Mono", monospace' }}>{wDose(a.inDose)}</div>
                      <div className="text-slate-400 text-[9px] mt-0.5"
                           style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        {a.inDose !== "—" ? a.inDose : ""}
                        {a.imDose !== "—" && a.imDose ? ` · IM: ${a.imDose}` : ""}
                      </div>
                    </td>
                    {/* Col 4: Onset/Duration */}
                    <td className="px-3 py-2.5">
                      <div className="text-slate-700 dark:text-slate-200"
                           style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>{a.onset}</div>
                      <div className="text-slate-400 text-[9px]"
                           style={{ fontFamily: '"JetBrains Mono", monospace' }}>{a.duration}</div>
                    </td>
                    {/* Col 5: Analgesia */}
                    <td className="px-3 py-2.5 text-center">
                      {a.analgesia
                        ? <CheckCircle size={14} weight="fill" className="text-emerald-500 mx-auto" />
                        : <X size={12} weight="bold" className="text-slate-300 dark:text-slate-600 mx-auto" />}
                    </td>
                    {/* Col 6: Airway */}
                    <td className="px-3 py-2.5">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${CMAP[a.airwayColor]}`}
                            style={{ fontFamily: '"JetBrains Mono", monospace' }}>{a.airway}</span>
                    </td>
                    {/* Col 7: BP */}
                    <td className="px-3 py-2.5">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${CMAP[a.bpColor]}`}
                            style={{ fontFamily: '"JetBrains Mono", monospace' }}>{a.bp}</span>
                    </td>
                    {/* Col 8: Reversal */}
                    <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 text-[10px]"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}>{a.reversal}</td>
                  </tr>

                  {isOpen && (
                    <ExpandedDetail
                      key={`${a.name}-exp`}
                      bestFor={a.bestFor}
                      cautions={a.cautions}
                      pearl={a.pearl}
                      colSpan={COLS.length}
                    />
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

// ─── ORAL SEDATION TABLE ──────────────────────────────────────────────────────
function OralSedationTable({ weight }) {
  const [expanded, setExpanded] = useState(null);

  const calcDose = (doseStr, wt) => {
    const mgKg  = doseStr.match(/([\d.]+)–?([\d.]*)\s*mg\/kg/);
    const mcgKg = doseStr.match(/([\d.]+)–?([\d.]*)\s*mcg\/kg/);
    if (mgKg) {
      const lo = +(parseFloat(mgKg[1]) * wt).toFixed(1);
      const hi = mgKg[2] ? +(parseFloat(mgKg[2]) * wt).toFixed(1) : null;
      const maxMatch = doseStr.match(/max\s+([\d,]+)\s*mg/);
      const cap = maxMatch ? parseInt(maxMatch[1].replace(",", "")) : null;
      const loC = cap ? Math.min(lo, cap) : lo;
      const hiC = hi && cap ? Math.min(hi, cap) : hi;
      if (hiC) return `${loC}–${hiC} mg${cap && hi >= cap ? ` (max ${cap} mg)` : ""}`;
      return `${loC} mg${cap && lo >= cap ? ` (max ${cap} mg)` : ""}`;
    }
    if (mcgKg) {
      const lo = +(parseFloat(mcgKg[1]) * wt).toFixed(0);
      const hi = mcgKg[2] ? +(parseFloat(mcgKg[2]) * wt).toFixed(0) : null;
      return hi ? `${lo}–${hi} mcg` : `${lo} mcg`;
    }
    return "—";
  };

  // Match PSA table column count: 8 cols
  const COLS = ["Drug & Class", "Dose / Route", "Calc dose", "Onset", "Duration", "Half-life", "Airway", "Reversal"];

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
        Weight-based doses for{" "}
        <span className="text-slate-900 dark:text-white font-bold"
              style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{weight} kg</span>.
        Tap any row for Indian brands, formulations, and clinical pearls.
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-xs border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              {COLS.map(h => (
                <th key={h} className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ORAL_SEDATIVES.map(os => {
              const isOpen = expanded === os.drug;
              return (
                <>
                  <tr key={os.drug}
                    onClick={() => setExpanded(isOpen ? null : os.drug)}
                    className={`border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${
                      isOpen ? "bg-slate-50 dark:bg-slate-800/60" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    }`}>
                    {/* Col 1: Drug + Class badge — mirrors "Agent & Class" in PSA table */}
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-slate-900 dark:text-white whitespace-nowrap"
                           style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{os.drug}</div>
                      <span className={`inline-block text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border mt-0.5 ${CMAP[os.classColor]}`}
                            style={{ fontFamily: '"JetBrains Mono", monospace' }}>{os.class}</span>
                    </td>
                    {/* Col 2: Dose/Route */}
                    <td className="px-3 py-2.5 font-mono text-slate-600 dark:text-slate-300 text-[10px]"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}>{os.dose}</td>
                    {/* Col 3: Calculated dose — mirrors IV Dose calc in PSA */}
                    <td className="px-3 py-2.5">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400"
                           style={{ fontFamily: '"JetBrains Mono", monospace' }}>{calcDose(os.dose, weight)}</div>
                    </td>
                    {/* Col 4: Onset */}
                    <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-200"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}>{os.onset}</td>
                    {/* Col 5: Duration/Working */}
                    <td className="px-3 py-2.5 font-mono text-slate-600 dark:text-slate-300"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}>{os.working}</td>
                    {/* Col 6: Half-life */}
                    <td className="px-3 py-2.5 font-mono text-slate-500 dark:text-slate-400"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}>{os.halfLife}</td>
                    {/* Col 7: Airway — mirrors PSA airway badge */}
                    <td className="px-3 py-2.5">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${CMAP[os.airwayColor]}`}
                            style={{ fontFamily: '"JetBrains Mono", monospace' }}>{os.airway}</span>
                    </td>
                    {/* Col 8: Reversal */}
                    <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 text-[10px]"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}>{os.reversal}</td>
                  </tr>

                  {isOpen && (
                    <ExpandedDetail
                      key={`${os.drug}-exp`}
                      brands={os.brands}
                      formulations={os.formulations}
                      comments={os.comments}
                      cautions={os.cautions}
                      pearl={os.pearl}
                      colSpan={COLS.length}
                    />
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footnotes */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 space-y-1.5">
        <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1"
             style={{ fontFamily: '"JetBrains Mono", monospace' }}>Notes</div>
        {[
          "Triclofos sodium and chloral hydrate are pro-drugs of trichloroethanol — equivalent efficacy. Triclofos preferred in India for better palatability.",
          "Oral ketamine bioavailability is 16–20% — use 3–6 mg/kg PO. Working time highly variable (20–120 min). Combine with oral midazolam.",
          "Dexmedetomidine listed for intranasal use — use IV solution (100 mcg/mL) with MAD atomiser device. No oral formulation available.",
          "Promethazine CONTRAINDICATED <2 yr (FDA black box — fatal respiratory depression). Extreme caution 2–12 yr.",
          "All oral sedation requires: NPO status · IV access ready · pulse oximetry monitoring · resuscitation equipment immediately available.",
        ].map((note, i) => (
          <div key={i} className="flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400"
               style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
            <span className="font-bold text-slate-400 flex-shrink-0"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}>{i + 1}.</span>
            {note}
          </div>
        ))}
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
            {["Agent", "Max mg/kg", `Max dose (${weight} kg)`, "Concentration", "Onset", "Duration"].map(h => (
              <th key={h} className="text-left px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-500"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LOCAL_ANAESTHETICS.map((la, i) => {
            const raw     = la.mgPerKg ? la.mgPerKg * weight : null;
            const maxDose = raw ? Math.min(+raw.toFixed(0), la.max || 9999) : null;
            const capped  = raw && la.max && raw >= la.max;
            return (
              <tr key={i} className="border-t border-slate-100 dark:border-slate-800 odd:bg-white dark:odd:bg-slate-900/30">
                <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white"
                    style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{la.name}</td>
                <td className="px-3 py-2.5 font-mono font-bold text-slate-700 dark:text-slate-200"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  {la.mgPerKg ? `${la.mgPerKg} mg/kg` : "Fixed"}
                </td>
                <td className="px-3 py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  {maxDose ? `${maxDose} mg` : "—"}
                  {capped && <span className="text-[8px] text-amber-500 ml-1">(capped at {la.max} mg)</span>}
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
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <div className="text-left">
          <div className="font-bold text-sm text-slate-900 dark:text-white"
               style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{block.name}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5"
               style={{ fontFamily: '"JetBrains Mono", monospace' }}>{block.indication}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[9px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}>{block.duration}</span>
          <CaretDown size={12} weight="bold" className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Pill size={10} weight="bold" className="text-slate-400" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}>Drug &amp; Dose</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">{block.drug}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Brain size={10} weight="bold" className="text-slate-400" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}>Nerves Blocked</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">{block.nerves}</div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Crosshair size={10} weight="bold" className="text-slate-400" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>Landmarks</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{block.landmarks}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Stethoscope size={10} weight="bold" className="text-slate-400" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>Technique</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{block.technique}</p>
          </div>
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            <Warning size={12} weight="fill" className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-800 dark:text-red-200">{block.cautions}</p>
          </div>
          {block.refUrl && (
            <a href={block.refUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-mono text-blue-600 dark:text-blue-400 hover:underline">
              <ArrowSquareOut size={11} weight="bold" />Reference / Cases
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PSA PRINCIPLES ───────────────────────────────────────────────────────────
const PSA_PHASE_CONFIG = [
  { id: "pre",    label: "Pre-Procedure",  Icon: NoteBlank,   color: "text-blue-500"    },
  { id: "during", label: "During",         Icon: Lightning,   color: "text-amber-500"   },
  { id: "post",   label: "Post-Procedure", Icon: CheckSquare, color: "text-emerald-500" },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SedationAnalgesiaTab() {
  const { weight }    = useWeight();
  const [psaSection, setPsaSection] = useState("pre");

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Sedation &amp; Analgesia
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono"
           style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          PSA agents · Oral sedation · Local anaesthetics · Nerve blocks · LAST protocol ·
          Tintinalli ch.38 · F&amp;L ch.4 · ACEP PSA · NYSORA · IAP · Cote &amp; Lerman 6e
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
        <Warning size={13} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
          All sedation must be performed with appropriate monitoring, trained personnel,
          and emergency equipment immediately available. Reference only — individualise to patient.
        </span>
      </div>

      {/* 1. PSA AGENTS */}
      <Section title="PSA Agent Comparison — Weight-Based Doses" sectionKey="psa" defaultOpen={true}>
        <PSAAgentTable weight={weight} />
      </Section>

      {/* 2. ORAL SEDATION */}
      <Section title="Oral Sedative Agents — Paediatric (Indian Brands)" sectionKey="oralSedation">
        <OralSedationTable weight={weight} />
      </Section>

      {/* 3. PSA PRINCIPLES */}
      <Section title="PSA Principles — Pre / During / Post Procedure" sectionKey="psaPrinciples">
        <div className="flex gap-2 mb-4 flex-wrap">
          {PSA_PHASE_CONFIG.map(t => {
            const active = psaSection === t.id;
            return (
              <button key={t.id} onClick={() => setPsaSection(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  active
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
                }`}>
                <t.Icon size={12} weight="bold" className={active ? "" : t.color} />
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {(psaSection === "pre"
            ? PSA_PRINCIPLES.preProcedure
            : psaSection === "during"
            ? PSA_PRINCIPLES.duringProcedure
            : PSA_PRINCIPLES.postProcedure
          ).map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[9px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>{i + 1}</span>
              <span style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>{item}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. PSA REGIMENS */}
      <Section title="Common PSA Regimens" sectionKey="regimens">
        <div className="space-y-3">
          {PSA_REGIMENS.map((r, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="font-bold text-sm text-slate-900 dark:text-white"
                     style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{r.name}</div>
                <div className="font-mono text-xs text-blue-600 dark:text-blue-400 mt-0.5"
                     style={{ fontFamily: '"JetBrains Mono", monospace' }}>{r.dosing}</div>
              </div>
              <div className="px-4 py-3 grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1"
                       style={{ fontFamily: '"JetBrains Mono", monospace' }}>Onset / Duration</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">{r.onset} · {r.duration}</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1"
                       style={{ fontFamily: '"JetBrains Mono", monospace' }}>Best Indication</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">{r.indication}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <CheckCircle size={9} weight="fill" className="text-emerald-500" />
                    <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400"
                          style={{ fontFamily: '"JetBrains Mono", monospace' }}>Pros</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">{r.pros}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Warning size={9} weight="fill" className="text-red-500" />
                    <span className="text-[9px] font-mono uppercase tracking-widest text-red-500"
                          style={{ fontFamily: '"JetBrains Mono", monospace' }}>Cons / Cautions</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">{r.cons}{r.cautions ? ` · ${r.cautions}` : ""}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. LOCAL ANAESTHETICS */}
      <Section title="Local Anaesthetic Safe Dose Reference" sectionKey="local">
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400"
             style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
            Maximum doses for{" "}
            <span className="text-slate-900 dark:text-white font-bold"
                  style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{weight} kg</span> patient.
            NEVER exceed absolute maximum regardless of weight.
          </p>
          <LocalAnaestheticTable weight={weight} />
          <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2.5 text-xs text-red-800 dark:text-red-200">
            <Warning size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-red-500" />
            <span style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
              <strong>NEVER use adrenaline-containing solutions</strong> for digital blocks (fingers/toes),
              penile blocks, or other end-artery sites. Risk of irreversible ischaemia.
            </span>
          </div>
        </div>
      </Section>

      {/* 6. NERVE BLOCKS */}
      <Section title="Pediatric ED Nerve Blocks" sectionKey="blocks">
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2 text-xs text-blue-800 dark:text-blue-200">
            <Lightbulb size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-blue-500" />
            <span style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
              Ultrasound guidance preferred for most blocks. Aspirate every 5 mL. Monitor for LAST (see below).
              Reference: baby-blocks.com · NYSORA
            </span>
          </div>
          {NERVE_BLOCKS.map(block => (
            <NerveBlockCard key={block.id} block={block} />
          ))}
        </div>
      </Section>

      {/* 7. LAST PROTOCOL */}
      <Section title="LAST — Local Anaesthetic Systemic Toxicity" sectionKey="last">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Heartbeat size={11} weight="bold" className="text-amber-500" />
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>Signs &amp; Symptoms</span>
            </div>
            <div className="space-y-1.5">
              {LAST_PROTOCOL.signs.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Warning size={11} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <span style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldWarning size={11} weight="bold" className="text-red-500" />
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-red-500"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>Emergency Management</span>
            </div>
            <div className="space-y-2">
              {LAST_PROTOCOL.management.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5 ${
                    i < 2 ? "bg-red-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }`} style={{ fontFamily: '"JetBrains Mono", monospace' }}>{i + 1}</span>
                  <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed"
                       style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Radioactive size={16} weight="fill" className="text-red-600 dark:text-red-400" />
              <span className="font-black text-red-700 dark:text-red-300 text-sm"
                    style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                20% INTRALIPID RESCUE — {weight} kg
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-1 mb-1">
                  <ArrowRight size={9} weight="bold" className="text-red-500" />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-red-500"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}>Bolus</span>
                </div>
                <div className="font-mono font-bold text-red-700 dark:text-red-300 text-2xl"
                     style={{ fontFamily: '"JetBrains Mono", monospace' }}>{+(1.5 * weight).toFixed(0)} mL</div>
                <div className="text-red-600 dark:text-red-400 mt-1"
                     style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
                  1.5 mL/kg over 1 min. Repeat q5 min × 2 if arrest persists.
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-1 mb-1">
                  <ArrowRight size={9} weight="bold" className="text-red-500" />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-red-500"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}>Infusion</span>
                </div>
                <div className="font-mono font-bold text-red-700 dark:text-red-300 text-2xl"
                     style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  {+(0.25 * weight).toFixed(0)}–{+(0.5 * weight).toFixed(0)} mL/min
                </div>
                <div className="text-red-600 dark:text-red-400 mt-1"
                     style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
                  0.25–0.5 mL/kg/min. Max cumulative 12 mL/kg total.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 mt-3 text-[10px] text-red-700 dark:text-red-300">
              <Warning size={11} weight="fill" className="text-red-500 flex-shrink-0 mt-0.5" />
              <span style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
                Use reduced adrenaline doses in LAST arrest (1 mcg/kg only — NOT 10 mcg/kg).
                Avoid vasopressin, calcium channel blockers, and propofol during lipid rescue.
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2"
           style={{ fontFamily: '"JetBrains Mono", monospace' }}>
        Tintinalli ch.38 · Fleischer &amp; Ludwig ch.4 · ACEP PSA Guidelines 2014 · NYSORA · baby-blocks.com ·
        IAP Analgesia &amp; Sedation 2021 · Cote &amp; Lerman 6e · Morgan &amp; Mikhail 7e · CIMS India 2024
      </div>
    </div>
  );
}
