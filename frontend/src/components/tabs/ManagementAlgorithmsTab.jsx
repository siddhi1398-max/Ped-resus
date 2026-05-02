/**
 * ManagementAlgorithmsTab.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Single-file Management Algorithm Tab with 5 sub-tabs:
 *   1. ED Management       — IAP 2019-2023 diagnostic + management algorithms
 *   2. AHA Algorithms      — PALS CPR cadence + step-by-step pathways.
 *   3. Clinical Guidelines — IAP guideline summaries (accordion)
 *   4. Clinical Pathways   — Interactive decision trees + DDx tables
 *   5. Prehospital         — PREM triangle, triage, transfer (with NIS sub-tab)
 *
 * Sources: IAP 2019–2023 · Fleisher & Ludwig 7e · Nelson's 21e · WHO STM 2017
 *          PREM-TAEI SOP (NHM Tamil Nadu) · AHA PALS 2025
 *
 * App.js changes required — see bottom of file.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import {
  MagnifyingGlass, X, CaretRight, Warning,
  Syringe, Brain, Baby, Drop, ChartBar,
  Bug, Wind, Lightning, TreeStructure,
  BookOpen, Heartbeat, Ambulance, FirstAid,
  Metronome, Pulse, Gauge, ChartLineUp,
  Diamond, ArrowDown, ArrowLeft,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════════════════
// SHARED STYLE MAPS
// ═══════════════════════════════════════════════════════════════════════════

const PHASE_COLORS = {
  red:     { border: "border-l-red-500",     bg: "bg-red-50 dark:bg-red-950/20",     badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },
  orange:  { border: "border-l-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/20", badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700" },
  blue:    { border: "border-l-blue-500",    bg: "bg-blue-50 dark:bg-blue-950/20",   badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700" },
  emerald: { border: "border-l-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20", badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700" },
  violet:  { border: "border-l-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/20",  badge: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700" },
};

const IAP_COLOR_MAP = {
  red:     { bg: "bg-red-50 dark:bg-red-950/20",     border: "border-red-200 dark:border-red-800",     text: "text-red-700 dark:text-red-300",     dot: "bg-red-500",     header: "bg-red-50 dark:bg-red-950/30"     },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500", header: "bg-emerald-50 dark:bg-emerald-950/30" },
  sky:     { bg: "bg-sky-50 dark:bg-sky-950/20",     border: "border-sky-200 dark:border-sky-800",     text: "text-sky-700 dark:text-sky-300",     dot: "bg-sky-500",     header: "bg-sky-50 dark:bg-sky-950/30"     },
  violet:  { bg: "bg-violet-50 dark:bg-violet-950/20", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500", header: "bg-violet-50 dark:bg-violet-950/30" },
  rose:    { bg: "bg-rose-50 dark:bg-rose-950/20",   border: "border-rose-200 dark:border-rose-800",   text: "text-rose-700 dark:text-rose-300",   dot: "bg-rose-500",   header: "bg-rose-50 dark:bg-rose-950/30"   },
  amber:   { bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500",  header: "bg-amber-50 dark:bg-amber-950/30" },
  teal:    { bg: "bg-teal-50 dark:bg-teal-950/20",   border: "border-teal-200 dark:border-teal-800",   text: "text-teal-700 dark:text-teal-300",   dot: "bg-teal-500",   header: "bg-teal-50 dark:bg-teal-950/30"   },
  orange:  { bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200 dark:border-orange-800", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500", header: "bg-orange-50 dark:bg-orange-950/30" },
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA — ED ALGORITHMS (Tab 1)
// ═══════════════════════════════════════════════════════════════════════════

const ALGO_CATEGORIES = ["All", "Emergency", "Respiratory", "Neurology", "Infectious Disease", "Neonatal"];
const CAT_DOT = { Emergency: "bg-red-500", Respiratory: "bg-sky-500", Neurology: "bg-violet-500", "Infectious Disease": "bg-emerald-500", Neonatal: "bg-rose-500" };
const CAT_TAG_COLORS = { Emergency: "text-red-600 dark:text-red-400", Respiratory: "text-sky-600 dark:text-sky-400", Neurology: "text-violet-600 dark:text-violet-400", "Infectious Disease": "text-emerald-600 dark:text-emerald-400", Neonatal: "text-rose-600 dark:text-rose-400" };

const ALGORITHMS = [
  {
    id: "septic-shock", category: "Emergency", title: "Septic Shock", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.4", "IAP PALS 2020", "Nelson's 21e Ch.527"],
    diagnostic: { title: "Recognise Septic Shock", steps: [
      { label: "Suspect",    text: "Fever/hypothermia + altered perfusion: tachycardia, prolonged CRT, mottling, altered mentation" },
      { label: "Warm shock", text: "Bounding pulses, flash CRT, wide pulse pressure — commonest in early sepsis (PREM: wide PP = DBP <50% SBP)" },
      { label: "Cold shock", text: "Diminished pulses, CRT >3s, mottled/cool peripheries, narrow pulse pressure, relative bradycardia" },
      { label: "Labs",       text: "CBC, CRP, procalcitonin, lactate, blood culture ×2 (before antibiotics), LFT, RFT, coagulation, liver span" },
      { label: "Severity",   text: "Lactate >2 mmol/L = sepsis · >4 = severe · MAP <65 mmHg + vasopressors = septic shock" },
    ]},
    management: { title: "Hour-1 Bundle (PREM + IAP)", phases: [
      { time: "0–15 min", color: "red", steps: ["IV/IO access immediately · Blood cultures before antibiotics", "Isotonic crystalloid 10–20 mL/kg NS/RL over 10–20 min (gravity; pull-push if SBP low)", "Reassess after each bolus: HR, CRT, BP, liver span, mentation · Repeat up to 60 mL/kg", "Broad-spectrum antibiotics within 1 hour of recognition", "Avoid bolus in SAM/malaria → WHO SAM protocol · Watch for cardiac dysfunction triggers"] },
      { time: "15–60 min", color: "orange", steps: ["Fluid-refractory: norepinephrine 0.1–1 mcg/kg/min — first-line per IAP (NOT dopamine alone)", "Wide PP + normal MAP: dopamine 10 mcg/kg/min first · then add norepinephrine if MAP falls", "Low SBP: epinephrine 0.1–1 mcg/kg/min + plan intubation (CPR alert per PREM)", "Target MAP ≥65 mmHg · ScvO₂ ≥70% · CRT <2 sec · urine output >1 mL/kg/hr", "Hydrocortisone 2 mg/kg IV if catecholamine-resistant or adrenal insufficiency"] },
      { time: "Antibiotic Choice (India)", color: "emerald", steps: ["Community sepsis: pip-tazo 100 mg/kg/day + amikacin 15 mg/kg/day (IAP AMS 2023)", "Hospital/ICU: meropenem 60–120 mg/kg/day + vancomycin (AUC-guided)", "ESBL screen +ve: meropenem (avoid pip-tazo)", "De-escalate within 48–72h on culture results", "Fungal cover (echinocandin) if prolonged Abx / immunocompromised"] },
      { time: "⚠ Inotrope/Intubation Triggers (PREM)", color: "violet", steps: ["A: Froth, new cough, neurogenic stridor", "B: RR >80/min, grunt, new retractions, abdominal breathing, new rales, SpO₂ <94%", "C: Relative bradycardia, muffling, gallop, hepatomegaly, low SBP/MAP", "D: Agitation, combative, fighting O₂ mask, worsening LOC, NCSE signs", "Action: STOP further fluid bolus → CPAP/NIV + inotrope ± intubate (ketamine + atropine + relaxant)"] },
    ]},
  },
  {
    id: "anaphylaxis", category: "Emergency", title: "Anaphylaxis", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.82", "IAP 2023", "Nelson's 21e Ch.168"],
    diagnostic: { title: "Diagnose — ANY 1 of 3 Criteria", steps: [
      { label: "Criterion 1", text: "Skin/mucosal involvement (urticaria, flushing, angioedema) PLUS respiratory compromise OR hypotension" },
      { label: "Criterion 2", text: "≥2 organ systems: skin + respiratory + GI + cardiovascular — after likely allergen" },
      { label: "Criterion 3", text: "Reduced BP alone after known allergen exposure" },
      { label: "Biphasic",    text: "Recurrence 1–72hr later (4–23%); observe ≥4–6hr minimum, 24hr if severe" },
      { label: "Grading",     text: "1: skin only · 2: mild systemic · 3: severe systemic · 4: cardiac arrest" },
    ]},
    management: { title: "Immediate Response", phases: [
      { time: "Immediate — ONLY Life-Saving Drug", color: "red", steps: ["EPINEPHRINE IM 0.01 mg/kg (max 0.5 mg) anterolateral mid-thigh", "Auto-injector: <15 kg → 0.15 mg · 15–30 kg → 0.3 mg · >30 kg → 0.5 mg", "Repeat every 5–15 min PRN — no maximum dose if haemodynamically unstable", "Supine + legs elevated · Call for help · Remove trigger"] },
      { time: "Concurrent", color: "orange", steps: ["O₂ 8–10 L/min face mask · IV/IO access", "IV fluid 20 mL/kg NS if hypotensive", "Salbutamol neb if bronchospasm persists after epi", "Refractory hypotension: epinephrine infusion 0.1–1 mcg/kg/min IV"] },
      { time: "Adjuncts — NOT First Line", color: "blue", steps: ["Diphenhydramine 1 mg/kg IV (max 50 mg) — treats skin only; do NOT give before epi", "Hydrocortisone 5 mg/kg IV — may reduce biphasic reaction", "Glucagon 20–30 mcg/kg IV if on beta-blockers and epi inadequate", "Discharge: auto-injector + written action plan + allergy referral mandatory"] },
    ]},
  },
  {
    id: "dka", category: "Emergency", title: "Diabetic Ketoacidosis", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.97", "IAP 2020", "ISPAD 2022", "Nelson's 21e Ch.607"],
    diagnostic: { title: "Diagnose & Severity-Stratify", steps: [
      { label: "DKA criteria",         text: "Glucose >11 mmol/L + pH <7.3 OR bicarb <15 mEq/L + ketonuria/ketonemia" },
      { label: "Mild",                 text: "pH 7.2–7.3, bicarb 10–15, alert" },
      { label: "Moderate",             text: "pH 7.1–7.2, bicarb 5–10, drowsy" },
      { label: "Severe",               text: "pH <7.1, bicarb <5, obtunded/comatose" },
      { label: "Cerebral oedema risk", text: "Age <5yr, new-onset DM, severe DKA, Na fails to rise as glucose falls, AMS during treatment" },
      { label: "Labs",                 text: "VBG, BSL q1hr, U&E (corrected Na), osmolality, urine ketones, HbA1c, ECG for K+ effects" },
    ]},
    management: { title: "DKA Protocol", phases: [
      { time: "Hour 1 — Resuscitation Only", color: "red", steps: ["10–20 mL/kg 0.9% NS over 30–60 min ONLY if haemodynamically compromised", "Do NOT give large boluses routinely — increases cerebral oedema risk", "No bicarbonate (IAP/ISPAD)"] },
      { time: "Hours 1–48 — Controlled Rehydration", color: "orange", steps: ["Deficit: mild 5%, moderate 7%, severe 10% body weight", "Replace over 48 HOURS — not 24hr (IAP strong recommendation)", "0.9% NS initially → switch to 0.45% NaCl + 5% dextrose when BSL <14 mmol/L", "Add KCl 40 mEq/L once urine output confirmed"] },
      { time: "Insulin — After 1hr of Fluids", color: "blue", steps: ["Do NOT start insulin until 1 hour of IV fluids completed", "Regular insulin 0.05–0.1 units/kg/hr infusion (0.05 in young or severe)", "Target BSL fall: 2–5 mmol/L/hr", "⚠ CEREBRAL OEDEMA: mannitol 0.5–1 g/kg IV over 15 min OR 3% NaCl 3–5 mL/kg — treat at FIRST sign"] },
    ]},
  },
  {
    id: "status-epilepticus", category: "Neurology", title: "Status Epilepticus", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.70", "IAP 2021", "PREM SOP", "Nelson's 21e Ch.611"],
    diagnostic: { title: "Classify & Identify Cause", steps: [
      { label: "Definition",      text: "Continuous seizure >5 min OR ≥2 seizures without full recovery between them" },
      { label: "PREM: NCSE",      text: "LOC: responsive to pain/unresponsive + ≥1 abnormal EOM (conjugate deviation, nystagmus, lid twitch) = Non-Convulsive SE" },
      { label: "Immediate check", text: "BSL — if CBG <54 mg/dL: 5 mL/kg D10% IV immediately · Do NOT give anticonvulsants to hypoxic/hypotensive children with posturing" },
      { label: "Common causes",   text: "Fever/meningitis, epilepsy breakthrough, hyponatraemia, hypocalcaemia, toxin, structural" },
      { label: "Workup",          text: "BSL, electrolytes, Ca, Mg, ammonia, tox screen, ECG · LP after seizure control if meningitis suspected" },
    ]},
    management: { title: "Time-Based Protocol (IAP 2021 / PREM)", phases: [
      { time: "0–5 min — First Line", color: "blue", steps: ["ABC · O₂ · Lateral position · BSL · IV access attempt", "Midazolam intranasal 0.2 mg/kg (max 10 mg) — preferred if no IV", "OR midazolam buccal 0.3 mg/kg (max 10 mg)", "OR diazepam rectal 0.5 mg/kg (max 10 mg)", "IV access established: lorazepam 0.1 mg/kg IV (max 4 mg)"] },
      { time: "5–20 min — Second Line", color: "orange", steps: ["Levetiracetam 40–60 mg/kg IV over 5–15 min (max 3 g) — preferred IAP 2021", "OR valproate 20–40 mg/kg IV over 5–10 min — AVOID: liver disease, metabolic disorders, females ≥10yr", "OR phenytoin 18–20 mg/kg IV over 20 min — cardiac monitor mandatory", "⚠ AVOID anticonvulsants if posturing is due to hypoxia/shock — correct ABCs first (PREM)"] },
      { time: "20–40 min — Refractory SE", color: "red", steps: ["PICU involvement mandatory", "Midazolam infusion: load 0.15–0.2 mg/kg IV → 0.05–0.5 mg/kg/hr", "OR thiopentone 3–5 mg/kg IV bolus + 2–5 mg/kg/hr (EEG burst-suppression)", "Ketamine 1.5 mg/kg IV bolus — NMDA antagonist useful in RSE", "⚠ Propofol: AVOID in children <3yr"] },
    ]},
  },
  {
    id: "asthma", category: "Respiratory", title: "Acute Asthma", tag: "COMMON",
    refs: ["Fleisher & Ludwig 7e Ch.79", "IAP 2022", "PREM SOP", "Nelson's 21e Ch.169"],
    diagnostic: { title: "Severity Assessment (PREM Triangle)", steps: [
      { label: "Moderate",        text: "RD + no hypoxia · SpO₂ >94%, tachycardia, wheeze, retractions · normal SBP/MAP" },
      { label: "Severe",          text: "RD + some hypoxia · SpO₂ >94% ± · retractions + · vasodilatory shock (N MAP) possible" },
      { label: "Life-threatening",text: "RD + severe hypoxia · SpO₂ ≤94% · vasodilatory shock (low MAP) · wide PP" },
      { label: "Near-fatal",      text: "Respiratory failure + severe hypoxia + shock + low SBP · exhaustion, head bob, abdominal breathing" },
      { label: "⚠ Pitfall",       text: "Silent chest = severe obstruction NOT improvement · AgitATION/fighting mask = cerebral hypoperfusion, NOT anxiety" },
    ]},
    management: { title: "Stepwise (IAP 2022 / PREM)", phases: [
      { time: "Moderate — No Hypoxia", color: "blue", steps: ["Salbutamol MDI + spacer 4–8 puffs q20min (IAP preferred over neb)", "Oral prednisolone 10 mg (<2yr) / 20 mg (2–5yr) / 30–40 mg (>5yr) · or dexamethasone 0.6 mg/kg ×2 doses", "O₂ if SpO₂ <94%"] },
      { time: "Severe — Hypoxia Present", color: "orange", steps: ["100% O₂ via non-rebreathing mask", "Neb salbutamol 2.5 mg via O₂ + ipratropium 500 mcg q20min ×3", "IV hydrocortisone: <2yr 4 mg/kg · 2–5yr 50 mg · >5yr 100 mg", "Correct vasodilatory shock: 10 mL/kg NS (max 30 mL/kg) if MAP low"] },
      { time: "Life-threatening / Near-Fatal", color: "red", steps: ["O₂ via NIV/CPAP · Neb salbutamol + ipratropium via O₂", "Neb epinephrine 0.1 mL/kg of 1:1000 SC q15min ×3 (max 3 doses)", "IV MgSO₄ 0.1 mL/kg of 50% over 30 min (max 2 g) — once only", "If MAP low: dopamine/norepinephrine infusion · IV hydrocortisone", "Aminophylline 5 mg/kg loading (omit if already on theophylline) then 1 mg/kg/hr", "AVOID intubation unless: respiratory arrest, cardiac arrest, severe exhaustion, rapid LOC decline"] },
    ]},
  },
  {
    id: "bronchiolitis", category: "Respiratory", title: "Bronchiolitis (RSV)", tag: "COMMON",
    refs: ["Fleisher & Ludwig 7e Ch.84", "IAP 2020", "Nelson's 21e Ch.416"],
    diagnostic: { title: "Diagnose & Stratify", steps: [
      { label: "Definition", text: "First episode of viral wheeze in child <2yr — URI prodrome → wheeze, crepitations, hyperinflation" },
      { label: "Mild",       text: "SpO₂ ≥95%, feeding >75% normal, mild recession, no apnoea" },
      { label: "Moderate",   text: "SpO₂ 92–95%, feeding 50–75% normal, subcostal/intercostal recession" },
      { label: "Severe",     text: "SpO₂ <92%, feeding <50%, significant recession, exhaustion, apnoea" },
      { label: "High-risk",  text: "Age <3 months, prematurity <35wks, CHD, chronic lung disease, immunodeficiency" },
    ]},
    management: { title: "Supportive Care Only", phases: [
      { time: "Recommended", color: "emerald", steps: ["O₂ if SpO₂ <92% — nasal prongs preferred", "HFNC 1–2 L/kg/min if increased WOB despite low-flow O₂", "NG/OG feeds if oral intake <75%", "Apnoea monitoring for high-risk infants"] },
      { time: "NOT Recommended (IAP 2020)", color: "red", steps: ["⛔ Salbutamol — no proven benefit", "⛔ Corticosteroids — not effective", "⛔ Nebulised 3% hypertonic saline — not routine", "⛔ Antibiotics — only if secondary bacterial infection confirmed", "⛔ Chest physiotherapy — no benefit"] },
    ]},
  },
  {
    id: "meningitis", category: "Infectious Disease", title: "Bacterial Meningitis", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.92", "IAP 2019", "Nelson's 21e Ch.616"],
    diagnostic: { title: "Diagnose & Risk-Stratify", steps: [
      { label: "Classic triad",        text: "Fever + neck stiffness + altered mentation — only 44% have all 3; absent in infants" },
      { label: "Infants",              text: "Bulging fontanelle, paradoxical irritability, poor feeding, high-pitched cry — neck stiffness unreliable <18 months" },
      { label: "LP contraindications", text: "Papilloedema · Focal neurological deficit · Seizure within 30 min · Haemodynamically unstable · Signs of herniation" },
      { label: "CSF — Bacterial",      text: "WBC >1000 (PMN), glucose <2.2 mmol/L, protein >1 g/L" },
      { label: "CSF — Viral",          text: "WBC 10–500 (lymphocytic), glucose normal, protein mildly elevated" },
    ]},
    management: { title: "Antibiotic + Steroid Protocol", phases: [
      { time: "Immediate Antibiotics", color: "red", steps: ["Ceftriaxone 100 mg/kg/day IV ÷ 12-hourly (max 4 g/dose) — IAP 2019", "Neonates <1 month: cefotaxime + ampicillin (Listeria) — NOT ceftriaxone", "Add vancomycin 60 mg/kg/day if MRSA or penicillin-resistant pneumococcus", "Aciclovir 15–20 mg/kg IV if HSV encephalitis possible"] },
      { time: "Dexamethasone (Critical Timing)", color: "blue", steps: ["0.15 mg/kg IV q6h × 4 days — give 15–30 min BEFORE or WITH first dose", "Proven to reduce hearing loss in H. influenzae b meningitis", "NOT for neonatal meningitis"] },
      { time: "Duration & Monitoring", color: "orange", steps: ["Pneumococcal: 10–14 days · Meningococcal: 5–7 days · H. influenzae: 7–10 days", "Raised ICP: mannitol 0.5 g/kg IV + fluid restriction to 60–80% maintenance", "Audiological assessment at discharge — SNHL in 10–30%"] },
    ]},
  },
  {
    id: "neonatal-resus", category: "Neonatal", title: "Neonatal Resuscitation (NRP)", tag: "CRITICAL",
    refs: ["IAP NRP 2021", "Nelson's 21e Ch.117", "Fleisher & Ludwig 7e Ch.28"],
    diagnostic: { title: "Initial Assessment — First 30 Seconds", steps: [
      { label: "Assess",        text: "Term? Breathing/crying? Good tone? → YES all → routine care + delayed cord clamping ≥60 sec" },
      { label: "If NO to any",  text: "Cord clamp → warm + dry + stimulate → clear airway" },
      { label: "SpO₂ targets",  text: "1min: 60–65% · 2min: 65–70% · 3min: 70–75% · 5min: 80–85% · 10min: 85–95%" },
      { label: "Initial FiO₂",  text: "Term: 0.21 · Preterm <35wks: 0.21–0.30 · Titrate by SpO₂" },
    ]},
    management: { title: "NRP Steps", phases: [
      { time: "HR <100 or Apnoea", color: "orange", steps: ["PPV: 20–25 cmH₂O (30 cmH₂O if no chest rise), PEEP 5 cmH₂O at 40–60/min", "T-piece resuscitator preferred (IAP NRP 2021)", "MR SOPA if chest not rising: Mask, Reposition, Suction, Open mouth, Pressure↑, Airway adjunct"] },
      { time: "HR <60 — Compressions", color: "red", steps: ["2-thumb encircling technique — 3:1 ratio (90 comp + 30 breaths/min)", "Depth: 1/3 AP diameter · Full recoil · Increase FiO₂ to 1.0"] },
      { time: "HR <60 After CPR ≥30 sec", color: "red", steps: ["Adrenaline IV/IO: 0.01–0.03 mg/kg (0.1–0.3 mL/kg of 1:10,000)", "NS 10 mL/kg IV/IO if hypovolaemia (pale, not responding to epi)", "Cooling (33–34°C × 72hr) if ≥36wks + HIE — refer NICU"] },
    ]},
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DATA — IAP CLINICAL GUIDELINES (Tab 3)
// ═══════════════════════════════════════════════════════════════════════════

const IAP_GUIDELINES = [
  {
    category: "Emergency & Critical Care", color: "red",
    guidelines: [
      { title: "IAP PALS / Septic Shock 2020", year: "2020", summary: "Norepinephrine first-line vasopressor. Early antibiotics within 1 hour. 20 mL/kg isotonic crystalloid bolus.", keyPoints: ["Norepi first-line over dopamine", "Antibiotics within 1hr of recognition", "20 mL/kg NS bolus × 3 if needed", "Target MAP ≥ 65 mmHg"] },
      { title: "IAP Anaphylaxis 2023", year: "2023", summary: "IM epinephrine 0.01 mg/kg anterolateral thigh — first and only life-saving intervention.", keyPoints: ["Epi IM 0.01 mg/kg (max 0.5 mg) immediately", "Repeat every 5–15 min PRN", "Observe ≥4–6 hr post reaction", "Antihistamines NOT first-line"] },
      { title: "IAP DKA 2020", year: "2020", summary: "Fluid deficit over 48 hours. Avoid rapid rehydration — cerebral oedema risk. Insulin after 1 hour of fluids.", keyPoints: ["0.9% NS initial resuscitation", "Deficit over 48hr not 24hr", "Insulin 0.05–0.1 units/kg/hr after 1hr", "Cerebral oedema: mannitol 0.5–1 g/kg"] },
    ],
  },
  {
    category: "Infectious Disease", color: "emerald",
    guidelines: [
      { title: "IAP Antimicrobial Stewardship 2023", year: "2023", summary: "ESBL-aware antibiotic selection. High rates of CRKP and MRSA. Meropenem-sparing strongly recommended.", keyPoints: ["ESBL UTI: nitrofurantoin or fosfomycin PO", "Community sepsis: pip-tazo + amikacin", "Hospital sepsis: meropenem + vancomycin (AUC-guided)", "De-escalate 48–72h on culture"] },
      { title: "IAP Dengue 2021", year: "2021", summary: "Supportive care only. No NSAIDs, no aspirin. Fluid management guided by haematocrit.", keyPoints: ["Paracetamol only for fever", "Plt transfuse only <10,000 or active bleeding", "Watch plasma leakage: critical phase day 3–7", "No corticosteroids"] },
      { title: "IAP Malaria 2022", year: "2022", summary: "Artemether-lumefantrine for uncomplicated falciparum. IV artesunate for severe disease.", keyPoints: ["AL: weight-based BD × 3 days with food", "Severe: IV artesunate 2.4 mg/kg at 0, 12, 24hr", "Vivax: primaquine 0.25 mg/kg × 14d after G6PD", "No steroids in cerebral malaria"] },
      { title: "IAP Community Pneumonia 2022", year: "2022", summary: "High-dose amoxicillin for mild-moderate CAP. Azithromycin if atypical suspected.", keyPoints: ["Mild-mod: amoxicillin 80–90 mg/kg/day PO", "Severe: IV ampicillin-sulbactam or ceftriaxone", "Add azithromycin if age >5yr (atypical cover)", "O₂ if SpO₂ <92%"] },
      { title: "IAP Meningitis 2019", year: "2019", summary: "Ceftriaxone 100 mg/kg/day IV. Dexamethasone before or with first antibiotic dose.", keyPoints: ["Ceftriaxone preferred (once daily)", "Dexamethasone 0.15 mg/kg q6h × 4 days", "Neonates: ampicillin + cefotaxime (Listeria)", "LP before antibiotics if no signs of raised ICP"] },
    ],
  },
  {
    category: "Respiratory", color: "sky",
    guidelines: [
      { title: "IAP Asthma 2022", year: "2022", summary: "Dexamethasone 0.6 mg/kg ×2 doses (24hr apart) equivalent to prednisolone 5-day course.", keyPoints: ["Salbutamol MDI 4–8 puffs q20min × 3", "Dexamethasone 0.6 mg/kg PO/IM × 2 doses", "MgSO₄ 25–50 mg/kg IV for severe", "Heliox for near-fatal"] },
      { title: "IAP Bronchiolitis 2020", year: "2020", summary: "Supportive care only. No salbutamol, no steroids, no antibiotics, no nebulised saline routinely.", keyPoints: ["O₂ if SpO₂ <92%", "HFNC if work of breathing high", "No salbutamol (no proven benefit)", "No corticosteroids"] },
      { title: "IAP Croup (LTB) 2019", year: "2019", summary: "Single dose dexamethasone 0.6 mg/kg PO. Nebulised epinephrine for stridor at rest.", keyPoints: ["Dexamethasone 0.6 mg/kg PO (max 10 mg)", "Neb epinephrine 0.5 mL/kg of 1:1000 (max 5 mL)", "Observe ≥2–4hr post-neb for rebound", "Westley score guides severity"] },
    ],
  },
  {
    category: "Neurology", color: "violet",
    guidelines: [
      { title: "IAP Status Epilepticus 2021", year: "2021", summary: "Midazolam IN/buccal first-line. Levetiracetam preferred second-line over phenytoin/valproate.", keyPoints: ["0–5 min: midazolam IN 0.2 mg/kg or buccal 0.3 mg/kg", "5–20 min: lorazepam IV 0.1 mg/kg", "20–40 min: levetiracetam 40–60 mg/kg IV preferred", "40+ min: midazolam infusion"] },
      { title: "IAP Febrile Seizure 2017", year: "2017", summary: "No anticonvulsant prophylaxis. Simple febrile seizures do not require neuroimaging.", keyPoints: ["No long-term AEDs for simple FS", "No EEG or imaging for typical simple FS", "Fever control with paracetamol/ibuprofen", "Recurrence risk: 30%"] },
    ],
  },
  {
    category: "Neonatal", color: "rose",
    guidelines: [
      { title: "IAP NRP / Neonatal Resuscitation 2021", year: "2021", summary: "Delayed cord clamping ≥60 sec. T-piece resuscitator preferred. Targeted SpO₂ in first minutes.", keyPoints: ["Delayed cord clamping ≥60s (unless depressed)", "Initial FiO₂: term 0.21, preterm 0.21–0.30", "HR <60 after PPV: start chest compressions", "Epi 0.01–0.03 mg/kg IV/IO if no response"] },
      { title: "IAP Neonatal Sepsis 2022", year: "2022", summary: "Ampicillin + gentamicin first-line for EOS. Culture before antibiotics.", keyPoints: ["EOS: ampicillin + gentamicin (once-daily)", "LONS: pip-tazo or cloxacillin + amikacin", "Blood culture before first dose", "Min 7–10 day course for confirmed sepsis"] },
    ],
  },
  {
    category: "Fluid & Electrolytes", color: "amber",
    guidelines: [
      { title: "IAP Fluid Therapy 2020", year: "2020", summary: "20 mL/kg isotonic crystalloid for septic shock. Restrict bolus fluids in SAM and malaria.", keyPoints: ["Isotonic NS or RL for bolus", "Max 60 mL/kg first hour then reassess", "Avoid bolus in SAM → WHO SAM protocol", "3% NaCl for symptomatic hyponatraemia"] },
      { title: "IAP Diarrhoea & ORT 2021", year: "2021", summary: "ORT for all grades except severe dehydration with shock. Zinc 10–20 mg/day × 14 days.", keyPoints: ["Mild: ORS 50 mL/kg over 4hr", "Moderate: ORS 100 mL/kg over 4hr", "Severe + shock: IV NS 20 mL/kg then ORS", "Zinc: <6mo 10 mg/day, >6mo 20 mg/day × 14d"] },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DATA — AHA ALGORITHMS (Tab 2)
// ═══════════════════════════════════════════════════════════════════════════

const AHA_CPR_STEPS = [
  { type: "action", title: "Unresponsive / Not breathing normally?", body: "Call for help. Start CPR timer. Assign roles: compressor, airway, medications, recorder." },
  { type: "decision", title: "Shockable rhythm? (VF / pVT)", body: "Attach monitor/defibrillator ASAP. Identify VF or pVT (shockable) vs. PEA/asystole (non-shockable)." },
  { type: "action", title: "Shockable — Defibrillate", body: "Shock at 4 J/kg (AHA 2025). Resume CPR immediately — do NOT pause to check pulse. Adrenaline 0.01 mg/kg IV/IO after 3rd shock. Amiodarone 5 mg/kg IV/IO after 3rd and 5th shocks." },
  { type: "action", title: "Non-shockable — CPR + Adrenaline", body: "Adrenaline 0.01 mg/kg IV/IO (0.1 mL/kg of 1:10,000) as soon as IV/IO established. Repeat every 3–5 min. Search for reversible causes (4Hs + 4Ts)." },
  { type: "action", title: "High-Quality CPR Throughout", body: "Rate 100–120/min · Depth ≥1/3 AP chest · Full recoil · CCF >80% · Pause <10 sec · Change compressor every 2 min." },
  { type: "action", title: "Advanced Airway", body: "Bag-mask initially (excellent). Intubate when resources allow without interrupting CPR. Advanced airway: 1 breath every 2–3 sec (20–30/min) — AHA 2025 update. DBP target: ≥25 mmHg (infant) / ≥30 mmHg (child) if arterial line in situ." },
  { type: "decision", title: "ROSC achieved?", body: "Check: sustained HR, palpable pulse, rising ETCO₂ (>40 mmHg), improving waveform capnography." },
  { type: "action", title: "Post-Resuscitation Care", body: "Targeted temperature 36–37.5°C · SpO₂ 94–99% (avoid hyperoxia) · PaCO₂ 45–55 · Treat reversible cause · 12-lead ECG + echo · Glucose monitoring · PICU transfer." },
];

const AHA_UPDATES = [
  { icon: Metronome, title: "Compression Rate", value: "100–120", sub: "per min", note: "No upper limit benefit above 120 — avoid excessive rate" },
  { icon: Pulse, title: "Vent with Adv. Airway", value: "1/2–3 sec", sub: "= 20–30/min", note: "2025 update: increased from 10/min to 20–30/min" },
  { icon: Gauge, title: "Chest Comp. Fraction", value: ">80%", sub: "target", note: "Pre/post-shock pause <10 sec mandatory" },
  { icon: ChartLineUp, title: "DBP Target (art line)", value: "≥25/30", sub: "infant/child mmHg", note: "Titrate CPR quality to diastolic pressure if monitored" },
];

// ═══════════════════════════════════════════════════════════════════════════
// DATA — INTERACTIVE PATHWAYS (Tab 4)
// ═══════════════════════════════════════════════════════════════════════════

const PATHWAYS = [
  {
    id: "wheeze", title: "Child with Wheeze", category: "Respiratory",
    source: "IAP 2022 / Fleisher 7e / PREM SOP",
    start: "q1",
    nodes: {
      q1: { kind: "question", prompt: "What is the child's SpO₂ on room air?", options: [{ label: "≥95%", next: "q2" }, { label: "92–94%", next: "q3" }, { label: "<92%", next: "r-severe" }] },
      q2: { kind: "question", prompt: "Age <2yr with first episode of wheeze?", options: [{ label: "Yes — likely bronchiolitis", next: "r-bronchiolitis" }, { label: "No — recurrent wheeze/asthma", next: "r-mild-asthma" }] },
      q3: { kind: "question", prompt: "Can child speak in sentences?", options: [{ label: "Yes — sentences", next: "r-moderate" }, { label: "Only words or phrases", next: "r-severe" }] },
      "r-bronchiolitis": { kind: "result", severity: "emerald", title: "Bronchiolitis — Supportive Care", summary: "No bronchodilators, no steroids. O₂ if SpO₂ <92%. HFNC if WOB high. Feeds via NG if oral <75%.", actions: ["O₂ via nasal prongs if SpO₂ <92%", "High-flow nasal cannula if increased WOB", "NG feeds if tolerating <75% orally", "Monitor for apnoea (high-risk <3 months)", "No salbutamol · No steroids · No antibiotics"] },
      "r-mild-asthma": { kind: "result", severity: "emerald", title: "Mild Asthma — Outpatient Rx", summary: "MDI salbutamol + spacer. Oral dexamethasone or prednisolone. Review in 24–48hr.", actions: ["Salbutamol MDI 4–8 puffs q20min ×3 via spacer", "Dexamethasone 0.6 mg/kg PO ×2 doses 24hr apart (IAP preferred)", "O₂ to maintain SpO₂ ≥94%", "Discharge if SpO₂ ≥95% and not in distress", "Written asthma action plan + spacer technique education"] },
      "r-moderate": { kind: "result", severity: "amber", title: "Moderate Asthma — Hospital Obs", summary: "O₂ + salbutamol neb + ipratropium. IV hydrocortisone. Observe minimum 4 hours.", actions: ["O₂ via mask — target SpO₂ ≥94%", "Neb salbutamol 2.5–5 mg q20min ×3 via O₂", "Ipratropium 250–500 mcg neb with first 3 doses", "IV hydrocortisone 50–100 mg (age-appropriate)", "Review at 1 hour — if improved → oral steroids and observe; if not → escalate"] },
      "r-severe": { kind: "result", severity: "red", title: "Severe / Life-Threatening Asthma — URGENT", summary: "O₂, salbutamol, steroids, consider epinephrine and MgSO₄. PICU involvement.", actions: ["100% O₂ via non-rebreathing mask or NIV", "Continuous salbutamol neb + ipratropium", "Neb epinephrine 0.1 mL/kg 1:1000 SC if no improvement after 3 SABA doses", "IV hydrocortisone + IV MgSO₄ 25–50 mg/kg over 20 min (once)", "Correct vasodilatory shock: 10 mL/kg NS if MAP low", "PREM: do NOT intubate unless respiratory/cardiac arrest, severe exhaustion"] },
    },
  },
  {
    id: "fever-child", title: "Febrile Child Assessment", category: "Infectious Disease",
    source: "WHO STM 2017 / IAP / IMCI",
    start: "q1",
    nodes: {
      q1: { kind: "question", prompt: "Does the child have any General Danger Signs? (Unable to drink, vomits everything, convulsions, very lethargic/unconscious)", options: [{ label: "Yes — any danger sign", next: "r-danger" }, { label: "No danger signs", next: "q2" }] },
      q2: { kind: "question", prompt: "Age of the child?", options: [{ label: "<2 months", next: "q3-neonate" }, { label: "2 months–5 years", next: "q4" }, { label: ">5 years", next: "q5" }] },
      "q3-neonate": { kind: "question", prompt: "Young infant — any of: fast breathing (RR>60), severe chest in-drawing, grunting, central cyanosis, hypothermia, bulging fontanelle?", options: [{ label: "Yes — any sign present", next: "r-danger" }, { label: "No — stable infant", next: "r-young-stable" }] },
      q4: { kind: "question", prompt: "Any signs of respiratory distress? (Fast breathing, chest indrawing, stridor)", options: [{ label: "Yes", next: "q4b" }, { label: "No", next: "q4c" }] },
      q4b: { kind: "question", prompt: "Oxygen saturation?", options: [{ label: "SpO₂ <92% or central cyanosis", next: "r-severe-resp" }, { label: "SpO₂ 92–95% with retractions", next: "r-moderate-resp" }, { label: "SpO₂ >95%, fast breathing only", next: "r-mild-resp" }] },
      q4c: { kind: "question", prompt: "Signs of shock? (CRT >3sec, weak pulse, cold extremities, altered mentation)", options: [{ label: "Yes — shock present", next: "r-shock" }, { label: "No", next: "r-assess-focus" }] },
      q5: { kind: "question", prompt: "Fever >7 days OR unexplained weight loss?", options: [{ label: "Yes", next: "r-refer" }, { label: "No — evaluate focus of infection", next: "r-assess-focus" }] },
      "r-danger": { kind: "result", severity: "red", title: "IMMEDIATE ACTION — General Danger Signs", summary: "Give immediate treatment and ADMIT or REFER urgently (WHO STM 2017).", actions: ["Airway: open + O₂ · if apnoeic: BVM ventilation", "BSL check: if <54 mg/dL → D10% 5 mL/kg IV immediately", "If seizure: midazolam IN 0.2 mg/kg", "If shock signs: NS/RL 10–20 mL/kg over 20 min", "IV/IO access · Blood cultures · Broad-spectrum antibiotics", "Urgent referral to hospital — stabilise before transfer"] },
      "r-young-stable": { kind: "result", severity: "amber", title: "Young Infant — Admit for Observation", summary: "Low threshold for admission. Early warning signs may be subtle.", actions: ["Assess for bacterial infection (fever, feeding, colour, tone)", "Blood culture + FBC + CRP if febrile", "If source found → targeted antibiotic", "Educate mother on danger signs", "Follow-up within 24–48hr if outpatient"] },
      "r-severe-resp": { kind: "result", severity: "red", title: "Severe Pneumonia — Admit + Oxygen", summary: "WHO/IAP: severe CAP requires IV antibiotics and admission.", actions: ["O₂ to maintain SpO₂ ≥94%", "IV ceftriaxone 80–100 mg/kg/day or ampicillin-sulbactam", "Add azithromycin if >5yr or atypical suspected", "CXR + blood culture", "Avoid food if respiratory distress — NG feeds if needed"] },
      "r-moderate-resp": { kind: "result", severity: "amber", title: "Moderate Pneumonia — Oral Antibiotics + Review", summary: "Amoxicillin high-dose for CAP (IAP 2022).", actions: ["Amoxicillin 80–90 mg/kg/day PO ÷ 3 daily × 5 days", "Paracetamol for fever comfort", "O₂ if SpO₂ <94%", "Teach danger signs — return if not improving in 48hr", "Review within 2 days"] },
      "r-mild-resp": { kind: "result", severity: "emerald", title: "Fast Breathing Only — Monitor Closely", summary: "Mild pneumonia — outpatient amoxicillin.", actions: ["Amoxicillin 80–90 mg/kg/day PO", "Paracetamol 15 mg/kg q4–6hr for comfort", "Danger sign education to parents", "Return immediately if any danger sign develops"] },
      "r-shock": { kind: "result", severity: "red", title: "Shock — Resuscitate & Transfer", summary: "Stabilise immediately. PREM: fluid bolus + identify cause + transfer.", actions: ["O₂ + IV/IO access", "NS/RL 20 mL/kg over 10–20 min (gravity)", "Blood cultures before antibiotics", "Broad-spectrum antibiotics IV", "Reassess: HR, CRT, BP, mentation, liver span", "Transfer to higher facility after stabilisation"] },
      "r-assess-focus": { kind: "result", severity: "emerald", title: "Assess for Focus of Infection", summary: "Use 10-Step Checklist (WHO STM) — systematic assessment for source.", actions: ["Check ears (AOM), throat, skin, joints", "Malaria RDT/film if endemic region", "Urine dipstick if no obvious source", "Paracetamol 15 mg/kg q4–6h (no NSAIDs if dengue possible)", "Return if fever persists >3 days or danger signs develop"] },
      "r-refer": { kind: "result", severity: "amber", title: "Refer for Further Investigation", summary: "Unexplained prolonged fever or weight loss — rule out TB, malignancy, chronic infection (WHO STM 2017).", actions: ["Blood culture, FBC, CRP, malaria film/RDT", "CXR — rule out TB/pneumonia", "Mantoux test + TB screen if TB contact", "Refer to hospital for further workup", "Do not delay referral in deteriorating child"] },
    },
  },
];

const DDX_LIST = [
  {
    id: "wheeze-ddx", title: "Wheeze",
    source: "Fleisher & Ludwig 7e / IAP / Nelson's 21e",
    mnemonic: "ABCDEF of wheeze",
    mnemonicExpand: "Asthma · Bronchiolitis · Cardiac failure · Dys-swallowing/aspiration · EGFR (foreign body) · Foreign body",
    differentials: [
      { dx: "Asthma", age: ">2yr", clues: "Recurrent wheeze, nocturnal symptoms, atopy, response to salbutamol", workup: "PEFR, spirometry, trial of bronchodilator" },
      { dx: "Bronchiolitis", age: "<2yr", clues: "First episode, URI prodrome, RSV season, crepitations + wheeze", workup: "Clinical diagnosis; RSV swab for cohorting only" },
      { dx: "Foreign body", age: "6mo–4yr", clues: "Sudden onset, unilateral wheeze, no fever, witnessed event", workup: "CXR (expiratory), rigid bronchoscopy" },
      { dx: "Cardiac failure", age: "Any", clues: "Hepatomegaly, gallop, wide pulse pressure, poor feeding, failure to thrive", workup: "CXR, ECG, Echo, BNP" },
      { dx: "Vascular ring", age: "<1yr", clues: "Stridor + wheeze, positional, worsens with feeds", workup: "Barium swallow, CT angiogram, Echo" },
      { dx: "Pneumonia + wheeze", age: "Any", clues: "Fever, focal signs, consolidation on CXR, elevated WBC/CRP", workup: "CXR, FBC, CRP, blood culture" },
    ],
    redFlags: ["SpO₂ <92% at rest", "Silent chest (severe obstruction)", "Stridor + wheeze (large airway pathology)", "First episode in infant <6 weeks", "Weight loss + wheeze (TB, CF, cardiac)"],
  },
  {
    id: "stridor-ddx", title: "Stridor",
    source: "Fleisher & Ludwig 7e / PREM SOP / Nelson's 21e",
    mnemonic: "AVPU of stridor by age",
    mnemonicExpand: "Acute (croup/FB/epiglottitis) vs Persistent (laryngomalacia/subglottic stenosis) vs Progressive (vascular/mass)",
    differentials: [
      { dx: "Viral croup (LTB)", age: "6mo–6yr", clues: "Barky cough, hoarse voice, worse at night, URI prodrome, responds to dex + neb epi", workup: "Clinical; Westley score; steeple sign on XR" },
      { dx: "Epiglottitis", age: "2–7yr", clues: "Toxic, drooling, tripod, no barking cough, rapid onset, muffled voice", workup: "Clinical — do NOT examine throat; XR (thumb sign); ENT urgent" },
      { dx: "Bacterial tracheitis", age: "6mo–6yr", clues: "Very toxic, high fever, does NOT improve with nebulised epi, purulent secretions", workup: "CXR (subglottic narrowing + membranes), blood culture — needs intubation" },
      { dx: "Foreign body", age: "6mo–4yr", clues: "Sudden, witnessed, no fever, may have brief apnoea", workup: "CXR (hyperlucency), bronchoscopy" },
      { dx: "Laryngomalacia", age: "<1yr", clues: "Inspiratory stridor since birth, worse with feeds/supine, self-limiting", workup: "Flexible nasolaryngoscopy" },
      { dx: "Angio-oedema", age: "Any", clues: "Rapid onset, urticaria, trigger exposure, family history of HAE", workup: "Clinical; give epi immediately; C4, C1-INH if recurrent" },
    ],
    redFlags: ["SpO₂ <94% at rest", "Drooling + tripod posture (epiglottitis)", "Stridor at rest with retractions", "Cyanosis", "Toxic-appearing child", "Stridor not improving with nebulised epinephrine × 2"],
  },
  {
    id: "seizure-ddx", title: "First Seizure / Altered LOC",
    source: "Fleisher & Ludwig 7e / PREM SOP / IAP 2021",
    mnemonic: "DEFG + PREM Triangle",
    mnemonicExpand: "Don't Ever Forget Glucose — check BSL in ALL altered children. Then derive PREM Triangle to identify NCSE, shock, or hypoxia as cause.",
    differentials: [
      { dx: "Febrile seizure", age: "6mo–5yr", clues: "Fever + GTCS, brief, self-limiting, no post-ictal focus, normal after", workup: "Clinical; LP if <12mo + no immunisations; no EEG/imaging for simple FS" },
      { dx: "Non-convulsive SE (NCSE)", age: "Any", clues: "PREM: LOC P/U + eye deviation/nystagmus/lid twitch — often mistaken for posturing", workup: "EEG; correct hypoxia/shock first — do NOT give anticonvulsants to hypoxic child" },
      { dx: "Hypoglycaemia", age: "Any", clues: "Altered LOC, jitteriness, sweating, BSL <54 mg/dL, known DM/malnutrition/newborn", workup: "CBG immediately; D10% 5 mL/kg IV" },
      { dx: "Meningitis/encephalitis", age: "Any", clues: "Fever, neck stiffness, bulging fontanelle, petechiae, focal signs", workup: "LP (if safe), blood culture, ceftriaxone + dexamethasone" },
      { dx: "Hyponatraemia", age: "Any", clues: "Excessive water intake, gastroenteritis with hypotonic fluids, Na <125", workup: "Electrolytes; 3% NaCl 3–5 mL/kg over 10–15 min if severe" },
      { dx: "Posturing due to hypoxia/shock", age: "Any", clues: "PREM: shock signs + posturing — flexor or extensor stiffening — often misdiagnosed as SE", workup: "Treat ABC first; correct hypoxia/MAP; EEG if still altered after correction" },
    ],
    redFlags: ["First seizure + focal deficit → brain imaging urgently", "Seizure + petechial rash → meningococcal sepsis", "Seizure + toxic-looking + fever → LP + antibiotics", "LOC + posturing + shock/hypoxia → ABC first, NOT anticonvulsants"],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DATA — PREHOSPITAL (Tab 5) — from PREM SOP + WHO STM 2017
// ═══════════════════════════════════════════════════════════════════════════

const PREHOSPITAL_SUBTABS = ["PREM Triangle", "Triage", "Transfer", "NIS"];

const PREM_TRIANGLE = {
  title: "PREM Triangle — Modified Rapid Cardiopulmonary Cerebral Assessment",
  source: "PREM-TAEI SOP · NHM Tamil Nadu · ICH & HC, Madras Medical College",
  intro: "The PREM (Paediatric Resuscitation & Emergency Medicine) process: perform 1-minute mRCPCA after every intervention. Document → interpret vitals for age → derive physiological status → decide next step.",
  sides: [
    {
      side: "A — AIRWAY",
      color: "sky",
      states: [
        { state: "Maintainable / Stable", signs: "Crying, talking, coughing — airway open by own tone", action: "Position of comfort · Do not separate from mother · No invasive intervention" },
        { state: "Obstructed (Stridor)", signs: "Stridor in alert child = structural obstruction (foreign body, croup, angioedema, epiglottitis)", action: "Position of comfort · O₂ · Neb epinephrine for croup · Avoid noxious stimuli" },
        { state: "Unmaintainable", signs: "Unresponsive / convulsing — tone lost, tongue falls back, airway protective reflexes absent", action: "Head tilt–chin lift · Suction oropharynx (Yankauer) · NGT to decompress stomach · BVM ventilation · Plan intubation" },
      ],
    },
    {
      side: "B — BREATHING",
      color: "blue",
      states: [
        { state: "Normal", signs: "Normal RR for age + normal work of breathing (thoracic, no grunt/stridor/retractions)", action: "Observe · O₂ PRN" },
        { state: "Effortless Tachypnoea", signs: "↑RR but NO increased WOB — think metabolic acidosis (shock, DKA, salicylate)", action: "O₂ via non-rebreathing mask · Correct underlying cause" },
        { state: "Respiratory Distress", signs: "↑RR + retractions (intercostal, subcostal, suprasternal) ± wheeze ± crepitations", action: "O₂ · Bronchodilator if wheeze · Neb epinephrine if stridor · Jackson-Rees circuit for severe RD" },
        { state: "Impending Failure", signs: "Grunt + abdominal breathing + reduced air entry — exhaustion imminent", action: "Jackson-Rees circuit (manual CPAP) or NIV · Prepare for intubation · Call for senior help" },
        { state: "Apnoea", signs: "No breathing effort · Presume apnoea in ALL unresponsive children", action: "BVM ventilation immediately · NGT decompression · Intubate" },
      ],
    },
    {
      side: "C — CIRCULATION",
      color: "red",
      states: [
        { state: "Normal Perfusion", signs: "HR normal for age · Pulses +++/++ (femoral = dorsalis pedis) · CRT <2 sec · Warm pink peripheries · SBP normal · DBP >50% of SBP · PP 30–40 mmHg · MAP normal · Liver span normal", action: "Continue monitoring · Reassess after every intervention" },
        { state: "Vasodilatory (Warm) Shock", signs: "↑HR · Bounding pulses +++/+++ · CRT instant (flash) · Warm flushed · Wide PP >40 mmHg · DBP <50% SBP · MAP normal or low — early sepsis, anaphylaxis, early dengue shock", action: "10–20 mL/kg NS/RL bolus · Dopamine 10 mcg/kg/min if MAP low · Add norepinephrine if refractory" },
        { state: "Vasoconstrictive (Cold) Shock", signs: "↑HR · Weak/absent peripheral pulses +++/0 · CRT >2 sec · Cool dusky · Narrow PP · MAP low — late sepsis, hypovolaemia, cardiac", action: "20 mL/kg NS/RL pull-push if low SBP · Epinephrine infusion 0.1–1 mcg/kg/min · Plan intubation" },
        { state: "Relative Bradypnea/Bradycardia/Hypotension", signs: "Vital signs within 'normal range' BUT other sides of PREM triangle are ABNORMAL = failing compensation — danger sign", action: "Do NOT be reassured by 'normal' vitals — treat as shock/respiratory failure" },
        { state: "Bradycardia + Shock", signs: "HR low + absent pulses + SBP unrecordable — pre-arrest", action: "CPR immediately · Adrenaline 0.1 mL/kg of 1:10,000 IV/IO every 3–5 min" },
      ],
    },
    {
      side: "D — DISABILITY",
      color: "violet",
      states: [
        { state: "Alert", signs: "Child is 'as usual' per mother — interacting, playful, consolable", action: "Routine assessment · Mother's perception is highly sensitive" },
        { state: "Altered LOC (dLOC)", signs: "AVPU: V, P, or U — or: incessant cry, not as usual, sleepy, agitation, combative, fighting O₂ mask = cerebral hypoperfusion", action: "Correct hypoxia + shock FIRST · Do NOT give anticonvulsants to hypoxic/hypotensive child" },
        { state: "NCSE (Non-Convulsive SE)", signs: "LOC = P or U + ≥1 EOM sign: conjugate deviation, nystagmus, lid twitch — may mimic posturing or shock", action: "EEG if available · Correct ABC first · Levetiracetam (2nd line) if SE confirmed after correcting ABCs" },
        { state: "Raised ICP", signs: "Unequal pupils, papilloedema, Cushing's triad (bradycardia + hypertension + irregular breathing)", action: "30° head elevation · Mannitol 0.5–1 g/kg IV · Hyperventilate briefly · Neurosurgery" },
        { state: "⚠ DEFG", signs: "Don't Ever Forget Glucose — check CBG in ALL seriously ill children", action: "If CBG <54 mg/dL (3 mmol/L): D10% 5 mL/kg IV immediately" },
      ],
    },
  ],
  vitalSigns: {
    title: "Normal Vital Signs Reference (PREM Card)",
    data: [
      { age: "Neonate", wt: "3.5", rr: "30–60", hr: "90–180", sbp: "50–70", map: "45", liver: "—" },
      { age: "6 months", wt: "7", rr: "24–40", hr: "85–170", sbp: "65–106", map: "—", liver: "5" },
      { age: "1 year", wt: "10", rr: "20–40", hr: "80–140", sbp: "72–110", map: "—", liver: "6" },
      { age: "3 years", wt: "14", rr: "20–30", hr: "80–130", sbp: "78–114", map: "50", liver: "7" },
      { age: "6 years", wt: "20", rr: "18–25", hr: "70–120", sbp: "80–115", map: "—", liver: "8" },
      { age: "8 years", wt: "25", rr: "18–25", hr: "70–110", sbp: "84–122", map: "60", liver: "—" },
      { age: "10 years", wt: "30", rr: "16–20", hr: "65–110", sbp: "90–130", map: "—", liver: "—" },
      { age: "12 years", wt: "35–40", rr: "14–20", hr: "60–110", sbp: "94–136", map: "65", liver: "9" },
    ],
    equipmentSizes: [
      { age: "Newborn (3.5 kg)", laryngoscope: "1", etTube: "3.0–3.5", etDepth: "8–9.5 cm", suction: "6 Fr", ngt: "8 Fr" },
      { age: "6 months (7 kg)", laryngoscope: "1", etTube: "3.5–4.0", etDepth: "9.5–11 cm", suction: "8 Fr", ngt: "8 Fr" },
      { age: "1 year (10 kg)", laryngoscope: "2", etTube: "4.0–4.5", etDepth: "11–12.5 cm", suction: "8 Fr", ngt: "10 Fr" },
      { age: "3 years (15 kg)", laryngoscope: "2", etTube: "4.5–5.0", etDepth: "12.5–14 cm", suction: "8 Fr", ngt: "10 Fr" },
      { age: "6 years (20 kg)", laryngoscope: "2", etTube: "5.0–5.5", etDepth: "14–15.5 cm", suction: "10 Fr", ngt: "12 Fr" },
      { age: "8 years (25 kg)", laryngoscope: "3", etTube: "6.0–6.5 (cuffed)", etDepth: "17–18.5 cm", suction: "10 Fr", ngt: "12 Fr" },
      { age: "10 years (30 kg)", laryngoscope: "3", etTube: "6.5–7.0 (cuffed)", etDepth: "18.5–20 cm", suction: "12 Fr", ngt: "14 Fr" },
    ],
  },
};

const TRIAGE_DATA = {
  title: "Triage — PREM OPD Recognition Tool",
  source: "PREM SOP · NHM Tamil Nadu · WHO STM 2017",
  avpu: [
    { level: "A — Alert", color: "emerald", description: "'As usual' per mother — interacting, playful, consolable. Mom's history of 'not as usual' or 'sleepier than usual' overrides apparent alertness.", action: "Routine assessment. Trust the mother." },
    { level: "V — Voice", color: "amber", description: "Responds to voice — subtle drop in mental status. Not easy to recognise. Ask: is child sleepier than usual? Not as usual? Breathless?", action: "Perform mRCPCA. Give O₂. One bolus and reassess." },
    { level: "P — Pain", color: "orange", description: "Posturing (flexion/extension) + upward gaze in breathless/febrile child = likely hypoxia/shock NOT seizure. Agitation/combativeness in older child = cerebral hypoperfusion.", action: "AIRWAY + O₂ FIRST. Do NOT give anticonvulsants until ABCs corrected." },
    { level: "U — Unresponsive", color: "red", description: "Commonest cause of sudden unresponsiveness in normal child = NCSE. Check EOM (conjugate deviation, nystagmus, lid twitch). Also rule out hypoglycaemia.", action: "DEFG: BSL immediately. Open airway. BVM if apnoeic. Correct shock. EEG/anticonvulsant only after ABCs." },
  ],
  triageQuestions: [
    "Does child have a drop in mental status? (lethargy, incessant cry, not as usual) → If yes: consider shock",
    "Does child have breathlessness with fever/diarrhoea? → If yes: rule out pulmonary oedema (cardiac or septic)",
    "Is child posturing/convulsing? → First correct hypoxia and shock before giving anticonvulsants",
    "Is child fighting the O₂ mask or agitated? → This is cerebral hypoperfusion, NOT behavioural",
    "Are vital signs 'normal'? → In a sick-looking child, 'normal' vitals may be FAILING compensation",
  ],
  whoAdmitCriteria: [
    "Intercostal recession or chest indrawing",
    "Severe dehydration",
    "Convulsion with fever",
    "Fever and not sucking or breastfeeding",
    "Drowsiness, confusion, lethargy or unconscious",
    "Continued vomiting, abdominal pain or distension",
    "Oedema (swelling)",
    "Severe malnutrition",
    "Sudden onset of paralysis",
    "Swallowed poison",
    "Stridor (noisy breathing)",
    "Passing blood in the stool",
    "History of unconsciousness after head injury",
  ],
};

const TRANSFER_DATA = {
  title: "Pre-Transfer Stabilisation & Referral",
  source: "WHO STM 2017 · PREM SOP · IAP",
  preTxChecklist: [
    { item: "Airway", detail: "Confirm stable/maintainable. If unmaintainable → intubate before departure. NGT for gastric decompression." },
    { item: "Breathing", detail: "O₂ supply for journey (calculate volume needed). If apnoeic or impending failure → secure airway first." },
    { item: "Circulation", detail: "IV/IO access confirmed. Fluids infusing. Vasopressors running if needed. Monitor HR, BP, CRT during transfer." },
    { item: "Disability", detail: "BSL corrected. Anti-seizure medication given if needed. Pupils documented. AVPU documented." },
    { item: "Exposure", detail: "Temperature controlled. Blanket/warming for neonates. Identify all injuries/wounds." },
    { item: "Drugs", detail: "Weight-based doses calculated. Emergency drugs drawn up: adrenaline 0.01 mg/kg, midazolam 0.1 mg/kg, glucose." },
    { item: "Documentation", detail: "Referral letter with: PREM triangle status, vitals, interventions done, doses given, time of each intervention." },
    { item: "Communication", detail: "Call receiving hospital BEFORE departure. Use SBAR: Situation, Background, Assessment, Recommendation." },
  ],
  sbar: {
    S: "Situation: 'I am calling about [name], [age], presenting with [chief complaint]. I am concerned because [acute change].'",
    B: "Background: 'History of [relevant past]. On arrival: [vitals]. PREM triangle: [A/B/C/D status].'",
    A: "Assessment: 'I think the problem is [diagnosis/concern]. Physiological status: [PREM category].'",
    R: "Recommendation: 'I am transferring this child. We have done [interventions]. I need [specific support on arrival].'",
  },
  urgentReferralSigns: {
    newborns: [
      "Birth weight 1.0–1.5 kg",
      "Birth weight 1.5–2.0 kg + respiratory distress / apnoea / sepsis",
      "Birth asphyxia",
      "Respiratory distress / central cyanosis",
      "Signs of shock (CRT >3 sec, weak pulse, cold hands)",
      "Suspected meningitis / sepsis",
      "Severe jaundice",
      "Bilious vomiting or abdominal distension",
      "Suspected congenital heart disease",
    ],
    children: [
      "Severe respiratory distress or obstructed breathing",
      "Convulsions not responding to first-line treatment",
      "Impaired consciousness / coma",
      "Central cyanosis",
      "Signs of shock",
      "Persistent vomiting — unable to take medications",
      "Severe malnutrition (visible wasting, oedema of feet)",
      "Suspected meningitis",
      "Uncontrolled bleeding",
      "Suspected intussusception (severe abdominal pain + bloody stool)",
      "Suspected appendicitis",
      "Burns — >10% BSA or face/hands/perineum",
      "Unexplained fever >2 weeks",
    ],
  },
};

const NIS_DATA = {
  title: "NIS — Nursing Intervention Sheet",
  subtitle: "Systematic nursing assessment and first-response framework for critically ill children",
  source: "PREM SOP (ICH & HC, MMC Chennai) · NHM Tamil Nadu · WHO STM 2017",
  intro: "The NIS guides nursing staff through rapid systematic assessment and immediate first-response actions in the PREM unit. Assessment and intervention occur simultaneously — never in sequence.",
  steps: [
    {
      step: "N — Note & Notify",
      color: "red",
      items: [
        "Note the presenting complaint and triage category on arrival",
        "Note vital signs immediately: RR (count 6 sec × 10), HR (count 6 sec × 10), SpO₂, temperature, CBG",
        "Note AVPU level — ask mother 'is your child as usual?'",
        "Notify the doctor immediately if: AVPU < A, SpO₂ <94%, HR very high/low for age, or mother reports 'not as usual'",
        "Note time of assessment — document within 30 seconds",
      ],
    },
    {
      step: "I — Initiate Immediate Actions",
      color: "orange",
      items: [
        "Open airway: head tilt–chin lift if unresponsive, suction oropharynx if secretions visible",
        "O₂: non-rebreathing mask for effortless tachypnoea/distress · Jackson-Rees for impending failure · BVM for apnoea",
        "Position: position of comfort with mother if airway maintainable · supine on resus trolley if unresponsive",
        "BSL: check capillary blood glucose in ALL seriously ill children — treat if <54 mg/dL (D10% 5 mL/kg IV)",
        "IV/IO access: prepare IV set + 0.9% NS bag + mark calculated fluid volume on bag · assemble IO kit",
      ],
    },
    {
      step: "S — Systematic mRCPCA (Airway → Breathing → Circulation → Disability)",
      color: "blue",
      items: [
        "AIRWAY: vocalising (stable) / stridor (obstructed) / silent + unresponsive (unmaintainable) — document status",
        "BREATHING: count RR × 6 sec. Note: grunt, stridor, retractions, abdominal breathing, air entry, SpO₂ — classify as normal/effortless tachypnoea/distress/failure/apnoea",
        "CIRCULATION: count HR × 6 sec. Compare femoral vs. dorsalis pedis pulse volume. Check CRT (limb above heart). Palpate liver span. Record SBP + DBP. Calculate MAP = DBP + ⅓ PP. Note core vs. peripheral temperature gradient",
        "DISABILITY: AVPU. Pupils (size, equality, reaction). EOM (conjugate deviation, nystagmus, lid twitch). Tone and posture",
        "EXPOSURE: temperature, check for rash/petechiae/bleeding/burns. Weigh using Broselow tape",
      ],
    },
    {
      step: "Inotrope Preparation (Ready Reckoner)",
      color: "violet",
      items: [
        "Dopamine: (3 × body weight) mg in 50 mL NS → 1 mL/hr = 1 mcg/kg/min → standard dose: 10 mL/hr",
        "Dobutamine: (3 × body weight) mg in 50 mL NS → same as dopamine",
        "Norepinephrine: (0.3 × body weight) mg in 50 mL NS → 1 mL/hr = 0.1 mcg/kg/min → start 1 mL/hr",
        "Epinephrine: (0.3 × body weight) mg in 50 mL NS → 1 mL/hr = 0.1 mcg/kg/min → range 0.1–1 mcg/kg/min",
        "Fluid bolus: calculate 20 mL/kg → mark on bag → run by gravity · pull-push if SBP low",
      ],
    },
    {
      step: "Epinephrine Dose Reference",
      color: "emerald",
      items: [
        "Cardiac arrest: 0.1 mL/kg of 1:10,000 IV/IO q3–5 min",
        "Anaphylaxis: 0.01 mg/kg IM (0.01 mL/kg of 1:1,000) q15 min · max 0.5 mg",
        "Croup (ALTB): 0.4 mL/kg of 1:1,000 neb (max 5 mL)",
        "Hypotensive shock: infusion 0.1–1 mcg/kg/min IV/IO (see inotrope preparation above)",
        "Hypoglycaemia: D10% 5 mL/kg IV (if CBG <54 mg/dL / <3 mmol/L)",
        "Hypocalcaemia: 10% calcium gluconate 2 mL/kg + equal volume D10% over 20 min under cardiac monitoring",
      ],
    },
    {
      step: "Documentation — PREM Case Record",
      color: "amber",
      items: [
        "Record time of arrival and time of each intervention — time-stamped documentation is mandatory",
        "Document: Airway status · RR · Breathing classification · HR · Pulse volume femoral/DP · CRT · Liver span · BP (SBP + DBP) · MAP · AVPU · Pupils · SpO₂",
        "Record all interventions in the data flow sheet: fluid volume + time, drug dose + route + time",
        "Pre-hospital resuscitation: document ABCD status on arrival and what was done before arrival",
        "Total fluid volume/kg and number of drug doses at each reassessment point",
        "Inotrope trigger time and drug started — document clearly on flow sheet",
      ],
    },
  ],
  flowSheet: {
    title: "PREM Data Flow Sheet — Parameters to Monitor",
    parameters: ["Airway status", "RR", "Grunt/Stridor", "Retractions", "Abdominal/Thoracic resp.", "Air entry", "Added sounds", "Colour", "SpO₂", "HR", "Muffled/Gallop heart sounds", "Central/Distal pulse", "Core-Peripheral temp gap", "CRT", "Liver span", "BP (SBP + DBP)", "MAP", "AVPU", "Pupils", "Eye position/Conjugate deviation", "Nystagmus/Lid twitch", "Tone/Posture", "Urine output"],
    interventions: ["Airway intervention", "Breathing: O₂ device used", "Circulation: Fluids given (mL/kg, rate)", "Vasopressors: drug, dose, rate, time started", "Disability: anti-seizure drug + dose", "Glucose correction", "Other (antibiotics, antiemetics, vitamin K)"],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// REUSABLE UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" weight="bold" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-slate-400 font-mono" />
      {value && <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={12} weight="bold" /></button>}
    </div>
  );
}

function PhaseBlock({ phase }) {
  const pc = PHASE_COLORS[phase.color] || PHASE_COLORS.blue;
  return (
    <div className={`border-l-4 rounded-r-lg p-3 ${pc.border} ${pc.bg}`}>
      <div className="mb-2">
        <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded border ${pc.badge}`}>{phase.time}</span>
      </div>
      <div className="space-y-1.5">
        {phase.steps.map((step, si) => (
          <div key={si} className="flex items-start gap-2">
            <span className={`w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border ${pc.badge}`}>{si + 1}</span>
            <span className={`text-xs font-mono leading-relaxed ${step.startsWith("⛔") ? "text-red-600 dark:text-red-400" : step.startsWith("⚠") ? "text-amber-700 dark:text-amber-300 font-semibold" : "text-slate-700 dark:text-slate-200"}`}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 1 — ED MANAGEMENT ALGORITHMS
// ═══════════════════════════════════════════════════════════════════════════

function EDManagementView() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [activePane, setActivePane] = useState({});

  const filtered = ALGORITHMS.filter(a => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || [a.title, a.category,
      ...a.diagnostic.steps.map(s => s.text + s.label),
      ...a.management.phases.flatMap(p => p.steps),
    ].some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const getPane = id => activePane[id] || "diag";
  const setPane = (id, p) => setActivePane(prev => ({ ...prev, [id]: p }));
  const toggle = id => setOpenId(prev => prev === id ? null : id);

  return (
    <div className="space-y-3">
      <SearchBar value={search} onChange={setSearch} placeholder="Search condition, drug, dose, symptom…" />
      <div className="flex flex-wrap gap-1.5">
        {ALGO_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-md border font-mono text-[10px] uppercase tracking-widest transition-all ${activeCategory === cat ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400"}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(algo => {
          const isOpen = openId === algo.id;
          const pane = getPane(algo.id);
          return (
            <div key={algo.id} className={`bg-white dark:bg-slate-900/50 border rounded-xl overflow-hidden ${isOpen ? "border-slate-300 dark:border-slate-600" : "border-slate-200 dark:border-slate-700"}`}>
              <button onClick={() => toggle(algo.id)} className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${CAT_DOT[algo.category] || "bg-slate-400"}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{algo.title}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${algo.tag === "CRITICAL" ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" : "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800"}`}>{algo.tag}</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 mt-0.5 truncate">{algo.refs.join(" · ")}</div>
                  </div>
                </div>
                <CaretRight size={12} weight="bold" className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 dark:border-slate-800">
                  <div className="flex border-b border-slate-100 dark:border-slate-800">
                    {[["diag", MagnifyingGlass, "Diagnostic"], ["mgmt", Syringe, "Management"]].map(([key, Icon, label]) => (
                      <button key={key} onClick={() => setPane(algo.id, key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold font-mono uppercase tracking-widest border-b-2 transition-all ${pane === key ? "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-blue-500" : "bg-white dark:bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-600"}`}>
                        <Icon size={11} weight="bold" />{label}
                      </button>
                    ))}
                  </div>
                  <div className="p-4">
                    {pane === "diag" && (
                      <div className="space-y-2">
                        <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">{algo.diagnostic.title}</div>
                        {algo.diagnostic.steps.map((step, i) => (
                          <div key={i} className="flex gap-2.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 min-w-[90px] flex-shrink-0 font-mono uppercase tracking-wider pt-0.5">{step.label}</span>
                            <span className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-mono">{step.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {pane === "mgmt" && (
                      <div className="space-y-3">
                        <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">{algo.management.title}</div>
                        {algo.management.phases.map((phase, pi) => <PhaseBlock key={pi} phase={phase} />)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="text-center py-12 text-slate-400 font-mono text-sm">No algorithms match "{search}"</p>}
      <RefFooter refs={["Fleisher & Ludwig 7e", "IAP 2019–2023", "Nelson's 21e", "PREM SOP"]} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 2 — AHA ALGORITHMS
// ═══════════════════════════════════════════════════════════════════════════

function AHAView() {
  return (
    <div className="space-y-5">
      <div className="rounded-md border-2 border-red-500/40 dark:border-red-400/40 bg-red-50/60 dark:bg-red-950/30 p-4">
        <div className="flex items-center gap-2 mb-3 text-red-700 dark:text-red-300">
          <Lightning size={16} weight="fill" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">2025 AHA PALS — Key Updates at a Glance</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AHA_UPDATES.map((u, i) => (
            <div key={i} className="rounded-md bg-white dark:bg-slate-900/70 border border-red-200 dark:border-red-900 p-3">
              <div className="flex items-center gap-1.5 text-red-700 dark:text-red-300 mb-1">
                <u.icon size={14} weight="bold" />
                <span className="font-mono text-[9px] uppercase tracking-wider font-bold">{u.title}</span>
              </div>
              <div className="font-mono font-black text-xl text-red-700 dark:text-red-300 leading-none">{u.value}</div>
              <div className="text-xs text-slate-700 dark:text-slate-200 mt-1 font-medium">{u.sub}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{u.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CPR cadence SVG */}
      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4">
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-3">AHA 2025 — CPR Cadence (1-min timeline)</div>
        <div className="space-y-3">
          {[
            { label: "Compressions · 100–120/min", color: "fill-red-500/70", n: 110, note: "depth ≥⅓ AP" },
            { label: "Ventilation (advanced airway) · 20–30/min (1 breath / 2–3 sec)", color: "fill-blue-500/70", n: 24, note: "2025 AHA update" },
          ].map((row, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-mono text-[9px] uppercase tracking-wider ${i === 0 ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>{row.label}</span>
                <span className="font-mono text-[9px] text-slate-400">{row.note}</span>
              </div>
              <svg viewBox="0 0 600 28" className="w-full h-6" preserveAspectRatio="none">
                {Array.from({ length: row.n }, (_, k) => (
                  <rect key={k} x={k * (600 / row.n)} y="2" width={(600 / row.n) - 1} height="24" rx="1" className={row.color} />
                ))}
              </svg>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-snug">
          Chest compression fraction target <strong>&gt;80%</strong>. Pre/post-shock pause <strong>&lt;10 sec</strong>. DBP target: ≥25 mmHg (infant) / ≥30 mmHg (child) if art line.
        </div>
      </div>

      {/* Step-by-step */}
      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4">
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-4">PALS Algorithm — Step by Step</div>
        <div className="space-y-3">
          {AHA_CPR_STEPS.map((step, i) => (
            <div key={i}>
              <div className={`rounded-md border p-4 flex gap-3 ${step.type === "decision" ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 border-dashed" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>
                <div className="flex-shrink-0 flex flex-col items-center gap-1 w-10">
                  {step.type === "decision" ? <Diamond size={20} weight="bold" className="text-amber-600 dark:text-amber-400" /> : <CaretRight size={20} weight="bold" className="text-slate-400" />}
                  <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400">{step.type === "decision" ? "Decide" : `Step ${i + 1}`}</span>
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{step.title}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-mono">{step.body}</div>
                </div>
              </div>
              {i < AHA_CPR_STEPS.length - 1 && (
                <div className="flex justify-start pl-4 py-1">
                  <ArrowDown size={16} weight="bold" className="text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <RefFooter refs={["AHA PALS 2025", "IAP PALS 2020", "Fleisher & Ludwig 7e", "Nelson's 21e Ch.526"]} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 3 — CLINICAL GUIDELINES (IAP)
// ═══════════════════════════════════════════════════════════════════════════

function ClinicalGuidelinesView() {
  const [openCat, setOpenCat] = useState("Emergency & Critical Care");
  const [openG, setOpenG] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = IAP_GUIDELINES.map(cat => ({
    ...cat,
    guidelines: cat.guidelines.filter(g =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.summary.toLowerCase().includes(search.toLowerCase()) ||
      g.keyPoints.some(k => k.toLowerCase().includes(search.toLowerCase()))
    ),
  })).filter(cat => cat.guidelines.length > 0);

  return (
    <div className="space-y-3">
      <SearchBar value={search} onChange={setSearch} placeholder="Search guidelines, drugs, conditions…" />
      {filtered.map(cat => {
        const c = IAP_COLOR_MAP[cat.color] || IAP_COLOR_MAP.emerald;
        const isOpen = openCat === cat.category;
        return (
          <div key={cat.category} className={`border rounded-xl overflow-hidden ${c.border}`}>
            <button onClick={() => setOpenCat(isOpen ? null : cat.category)} className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${c.header}`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className={`text-sm font-bold ${c.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{cat.category}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${c.text} ${c.border} bg-white/60 dark:bg-black/20`}>{cat.guidelines.length}</span>
              </div>
              <CaretRight size={12} weight="bold" className={`${c.text} transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
            </button>
            {isOpen && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {cat.guidelines.map(g => {
                  const gKey = cat.category + g.title;
                  const gOpen = openG === gKey;
                  return (
                    <div key={g.title} className="bg-white dark:bg-slate-900/50">
                      <button onClick={() => setOpenG(gOpen ? null : gKey)} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{g.title}</p>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700">{g.year}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-mono">{g.summary}</p>
                          </div>
                          <CaretRight size={11} weight="bold" className={`text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 ${gOpen ? "rotate-90" : ""}`} />
                        </div>
                      </button>
                      {gOpen && (
                        <div className={`px-4 pb-4 pt-1 ${c.bg}`}>
                          <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2">Key Clinical Points</div>
                          <div className="space-y-1.5">
                            {g.keyPoints.map((kp, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className={`w-4 h-4 rounded-full ${c.dot} text-white text-[8px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5`}>{i + 1}</span>
                                <span className="text-xs text-slate-700 dark:text-slate-200 leading-snug font-mono">{kp}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && <p className="text-center py-12 text-slate-400 font-mono text-sm">No guidelines match "{search}"</p>}
      <RefFooter refs={["IAP iapindia.org 2019–2023", "Last reviewed 2024"]} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 4 — CLINICAL PATHWAYS
// ═══════════════════════════════════════════════════════════════════════════

function PathwaysView() {
  const [mode, setMode] = useState("pathways");
  const [activePathwayId, setActivePathwayId] = useState(null);
  const [activeDDxId, setActiveDDxId] = useState(DDX_LIST[0].id);
  const [pathwayHistory, setPathwayHistory] = useState([]);

  const startPathway = id => { setActivePathwayId(id); setPathwayHistory([PATHWAYS.find(p => p.id === id).start]); };
  const exitPathway = () => { setActivePathwayId(null); setPathwayHistory([]); };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[["pathways", TreeStructure, "Interactive Pathways"], ["ddx", BookOpen, "Differential Diagnosis"]].map(([id, Icon, label]) => (
          <button key={id} onClick={() => { setMode(id); exitPathway(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-all ${mode === id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`}>
            <Icon size={13} weight="bold" />{label}
          </button>
        ))}
      </div>

      {mode === "pathways" && !activePathwayId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PATHWAYS.map(p => (
            <button key={p.id} onClick={() => startPathway(p.id)} className="text-left rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900/50 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
              <div className={`font-mono text-[9px] uppercase tracking-widest mb-1.5 ${p.category === "Respiratory" ? "text-sky-600" : p.category === "Infectious Disease" ? "text-emerald-600" : "text-blue-600"}`}>{p.category}</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{p.title}</div>
              <div className="text-xs text-slate-500 font-mono mt-1">{p.source}</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-mono">Start pathway <CaretRight size={11} weight="bold" /></div>
            </button>
          ))}
        </div>
      )}

      {mode === "pathways" && activePathwayId && (
        <PathwayRunner
          pathway={PATHWAYS.find(p => p.id === activePathwayId)}
          history={pathwayHistory}
          setHistory={setPathwayHistory}
          onExit={exitPathway}
        />
      )}

      {mode === "ddx" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {DDX_LIST.map(d => (
              <button key={d.id} onClick={() => setActiveDDxId(d.id)}
                className={`px-3 py-2 rounded-md border font-mono text-[10px] uppercase tracking-widest transition-all ${activeDDxId === d.id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`}>
                {d.title}
              </button>
            ))}
          </div>
          {(() => {
            const active = DDX_LIST.find(d => d.id === activeDDxId);
            return (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4">
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">Chief complaint: {active.title}</div>
                <div className="text-xs text-slate-500 font-mono">{active.source}</div>
                {active.mnemonic && (
                  <div className="mt-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">Mnemonic</div>
                    <div className="font-bold text-sm font-mono text-slate-900 dark:text-white">{active.mnemonic}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-mono">{active.mnemonicExpand}</div>
                  </div>
                )}
                <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                        {["Diagnosis", "Typical Age", "Clues", "Workup / Mgmt"].map(h => (
                          <th key={h} className="p-3 text-left font-mono text-[9px] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {active.differentials.map((d, i) => (
                        <tr key={i} className="border-t border-slate-200 dark:border-slate-700 odd:bg-slate-50 dark:odd:bg-slate-900/40 align-top">
                          <td className="p-3 font-bold font-mono text-slate-900 dark:text-white">{d.dx}</td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{d.age}</td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-300 max-w-[180px]">{d.clues}</td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-300 max-w-[180px]">{d.workup}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {active.redFlags?.length > 0 && (
                  <div className="mt-4 rounded-lg border-2 border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-950/40 p-3">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
                      <Warning size={13} weight="fill" />
                      <span className="font-mono text-[9px] uppercase tracking-widest font-bold">Red Flags</span>
                    </div>
                    <ul className="space-y-1 text-xs text-red-900 dark:text-red-200 font-mono">
                      {active.redFlags.map((r, i) => <li key={i} className="flex gap-2"><span className="opacity-60">•</span><span>{r}</span></li>)}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function PathwayRunner({ pathway, history, setHistory, onExit }) {
  const currentId = history[history.length - 1];
  const node = pathway.nodes[currentId];
  const goBack = () => history.length > 1 ? setHistory(history.slice(0, -1)) : onExit();
  const goto = next => setHistory([...history, next]);
  const RESULT_COLORS = { red: "bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-700 text-red-900 dark:text-red-100", amber: "bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-100", emerald: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100" };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={goBack} className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft size={12} weight="bold" /> Back
        </button>
        <button onClick={() => setHistory([pathway.start])} className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Restart</button>
        <span className="font-mono text-[9px] text-slate-400 ml-auto">Step {history.length} · {pathway.title}</span>
      </div>
      {node?.kind === "question" ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 p-4">
          <div className="flex items-center gap-2 mb-3 text-slate-500">
            <Diamond size={16} weight="bold" />
            <span className="font-mono text-[9px] uppercase tracking-widest">Decision Point</span>
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug mb-4" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{node.prompt}</h3>
          <div className="space-y-2">
            {node.options.map(opt => (
              <button key={opt.label} onClick={() => goto(opt.next)} className="w-full text-left rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-3 flex items-center justify-between gap-3 transition-colors">
                <span className="text-sm font-mono text-slate-700 dark:text-slate-200">{opt.label}</span>
                <CaretRight size={14} weight="bold" className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      ) : node ? (
        <div className={`rounded-xl border-2 p-4 ${RESULT_COLORS[node.severity] || RESULT_COLORS.emerald}`}>
          <div className="font-mono text-[9px] uppercase tracking-widest opacity-70 mb-1">Result</div>
          <h3 className="font-bold text-lg leading-snug" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{node.title}</h3>
          {node.summary && <p className="text-sm mt-2 leading-relaxed font-mono">{node.summary}</p>}
          {node.actions?.length > 0 && (
            <div className="mt-3">
              <div className="font-mono text-[9px] uppercase tracking-wider opacity-70 mb-2">Actions</div>
              <ul className="space-y-1 text-sm font-mono">
                {node.actions.map((a, i) => <li key={i} className="flex gap-2"><span className="opacity-60">•</span><span>{a}</span></li>)}
              </ul>
            </div>
          )}
          <button onClick={() => setHistory([pathway.start])} className="mt-4 font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-md border border-current/40 hover:bg-black/10">Restart Pathway</button>
        </div>
      ) : null}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 5 — PREHOSPITAL (PREM + WHO STM)
// ═══════════════════════════════════════════════════════════════════════════

function PrehospitalView() {
  const [activeSubTab, setActiveSubTab] = useState("PREM Triangle");

  return (
    <div className="space-y-4">
      {/* Sub-tab bar */}
      <div className="flex gap-1.5 flex-wrap border-b border-slate-200 dark:border-slate-700 pb-3">
        {PREHOSPITAL_SUBTABS.map(tab => (
          <button key={tab} onClick={() => setActiveSubTab(tab)}
            className={`px-3 py-1.5 rounded-md border font-mono text-[10px] uppercase tracking-widest transition-all ${activeSubTab === tab ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`}>
            {tab === "NIS" ? <span className="flex items-center gap-1"><FirstAid size={11} weight="bold" />NIS</span> : tab}
          </button>
        ))}
      </div>

      {activeSubTab === "PREM Triangle" && <PREMTriangleView />}
      {activeSubTab === "Triage" && <TriageView />}
      {activeSubTab === "Transfer" && <TransferView />}
      {activeSubTab === "NIS" && <NISView />}
    </div>
  );
}

// — PREM Triangle sub-tab —
function PREMTriangleView() {
  const [openSide, setOpenSide] = useState("A — AIRWAY");
  const [showEquipment, setShowEquipment] = useState(false);
  const pt = PREM_TRIANGLE;
  const sideColors = { sky: "border-sky-400 dark:border-sky-600 text-sky-700 dark:text-sky-300", blue: "border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300", red: "border-red-400 dark:border-red-600 text-red-700 dark:text-red-300", violet: "border-violet-400 dark:border-violet-600 text-violet-700 dark:text-violet-300" };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-200 font-mono leading-relaxed">
        <strong>{pt.title}</strong><br />{pt.intro}
      </div>

      {/* Triangle sides */}
      {pt.sides.map(side => {
        const isOpen = openSide === side.side;
        const sc = sideColors[side.color] || sideColors.blue;
        return (
          <div key={side.side} className={`border-2 rounded-xl overflow-hidden ${sc}`}>
            <button onClick={() => setOpenSide(isOpen ? null : side.side)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <span className={`font-bold text-sm font-mono uppercase tracking-widest ${sc}`}>{side.side}</span>
              <CaretRight size={13} weight="bold" className={`${sc} transition-transform ${isOpen ? "rotate-90" : ""}`} />
            </button>
            {isOpen && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {side.states.map((s, i) => (
                  <div key={i} className="px-4 py-3 bg-white dark:bg-slate-900/50">
                    <div className="flex items-start gap-3">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider min-w-[110px] flex-shrink-0 pt-0.5 ${sc}`}>{s.state}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-slate-600 dark:text-slate-300 leading-relaxed">{s.signs}</p>
                        <p className="text-xs font-mono text-slate-900 dark:text-white font-semibold mt-1 leading-relaxed">→ {s.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Vital signs reference */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-900 dark:bg-slate-950 text-white">
          <span className="font-mono text-[10px] uppercase tracking-widest">{pt.vitalSigns.title}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                {["Age", "Wt (kg)", "RR (bpm)", "HR (bpm)", "SBP (mmHg)", "MAP", "Liver (cm)"].map(h => (
                  <th key={h} className="p-2 text-left font-mono text-[9px] uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pt.vitalSigns.data.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 odd:bg-white dark:odd:bg-slate-900/30">
                  {[row.age, row.wt, row.rr, row.hr, row.sbp, row.map, row.liver].map((v, j) => (
                    <td key={j} className="p-2 font-mono text-slate-700 dark:text-slate-200">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button onClick={() => setShowEquipment(!showEquipment)} className="text-xs font-mono text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline">
        {showEquipment ? "Hide" : "Show"} Equipment Sizes Reference
      </button>

      {showEquipment && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 bg-slate-900 dark:bg-slate-950 text-white font-mono text-[10px] uppercase tracking-widest">Airway Equipment Sizes (PREM Ready Reckoner)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  {["Age / Weight", "Laryngoscope", "ETT Size", "ETT Depth", "Suction", "NGT"].map(h => (
                    <th key={h} className="p-2 text-left font-mono text-[9px] uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pt.vitalSigns.equipmentSizes.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800 odd:bg-white dark:odd:bg-slate-900/30">
                    {[row.age, row.laryngoscope, row.etTube, row.etDepth, row.suction, row.ngt].map((v, j) => (
                      <td key={j} className="p-2 font-mono text-slate-700 dark:text-slate-200">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <RefFooter refs={["PREM SOP — NHM Tamil Nadu (ICH & HC, MMC Chennai)", "G.O.(D) No. 539"]} />
    </div>
  );
}

// — Triage sub-tab —
function TriageView() {
  const td = TRIAGE_DATA;
  return (
    <div className="space-y-4">
      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400">{td.source}</div>

      {/* AVPU */}
      <div className="space-y-2">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1">AVPU Scale — Triage Level of Consciousness</div>
        {td.avpu.map(a => {
          const barColors = { emerald: "bg-emerald-500", amber: "bg-amber-500", orange: "bg-orange-500", red: "bg-red-500" };
          const textColors = { emerald: "text-emerald-700 dark:text-emerald-300", amber: "text-amber-700 dark:text-amber-300", orange: "text-orange-700 dark:text-orange-300", red: "text-red-700 dark:text-red-300" };
          return (
            <div key={a.level} className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className={`px-3 py-2 ${barColors[a.color]} bg-opacity-20`} style={{ background: `var(--${a.color}-50, #f0fdf4)` }}>
                <span className={`font-bold text-sm font-mono ${textColors[a.color]}`}>{a.level}</span>
              </div>
              <div className="px-3 py-2 bg-white dark:bg-slate-900/50 space-y-1">
                <p className="text-xs font-mono text-slate-600 dark:text-slate-300">{a.description}</p>
                <p className="text-xs font-mono font-semibold text-slate-900 dark:text-white">→ {a.action}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Triage questions */}
      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-3">
        <div className="font-mono text-[9px] uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">PREM Triage Questions — Ask Concurrently with Assessment</div>
        <ul className="space-y-1.5">
          {td.triageQuestions.map((q, i) => (
            <li key={i} className="flex gap-2 text-xs font-mono text-blue-900 dark:text-blue-200">
              <span className="font-bold opacity-60">{i + 1}.</span><span>{q}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* WHO admit criteria */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
        <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-2">WHO STM 2017 — Admit Children Who Have ANY of These</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {td.whoAdmitCriteria.map((c, i) => (
            <div key={i} className="flex gap-2 text-xs font-mono text-slate-700 dark:text-slate-200">
              <span className="text-red-400 flex-shrink-0">•</span><span>{c}</span>
            </div>
          ))}
        </div>
      </div>
      <RefFooter refs={["PREM SOP · NHM Tamil Nadu", "WHO Standard Treatment Manual for Children 2017"]} />
    </div>
  );
}

// — Transfer sub-tab —
function TransferView() {
  const td = TRANSFER_DATA;
  return (
    <div className="space-y-4">
      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400">{td.source}</div>

      {/* Pre-transfer checklist */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-900 dark:bg-slate-950 text-white font-mono text-[10px] uppercase tracking-widest">Pre-Transfer Stabilisation Checklist — ABCDE</div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {td.preTxChecklist.map((item, i) => (
            <div key={i} className="flex gap-3 px-4 py-3 bg-white dark:bg-slate-900/50">
              <span className="font-bold text-sm font-mono text-red-600 dark:text-red-400 flex-shrink-0 w-6">{item.item.split(" ")[0]}</span>
              <div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white font-mono">{item.item}</div>
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-0.5">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SBAR */}
      <div className="rounded-xl border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 p-4">
        <div className="font-mono text-[9px] uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">SBAR — Handover Communication Tool</div>
        <div className="space-y-2">
          {Object.entries(td.sbar).map(([key, text]) => (
            <div key={key} className="flex gap-3">
              <span className="font-bold text-sm font-mono text-blue-700 dark:text-blue-300 w-5 flex-shrink-0">{key}:</span>
              <span className="text-xs font-mono text-blue-900 dark:text-blue-200 leading-relaxed">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Urgent referral signs */}
      {[["Newborns", td.urgentReferralSigns.newborns], ["Children (>1 month)", td.urgentReferralSigns.children]].map(([label, signs]) => (
        <div key={label} className="rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
          <div className="px-4 py-3 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <Warning size={13} weight="fill" />
              <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Urgent Referral — {label} (WHO STM 2017)</span>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900/50 grid grid-cols-1 sm:grid-cols-2 gap-1">
            {signs.map((s, i) => (
              <div key={i} className="flex gap-2 text-xs font-mono text-slate-700 dark:text-slate-200">
                <span className="text-red-400 flex-shrink-0">•</span><span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <RefFooter refs={["WHO STM 2017", "PREM SOP · NHM Tamil Nadu"]} />
    </div>
  );
}

// — NIS sub-tab —
function NISView() {
  const [openStep, setOpenStep] = useState(NIS_DATA.steps[0].step);
  const stepColors = { red: IAP_COLOR_MAP.red, orange: IAP_COLOR_MAP.amber, blue: IAP_COLOR_MAP.sky, violet: IAP_COLOR_MAP.violet, emerald: IAP_COLOR_MAP.emerald, amber: IAP_COLOR_MAP.amber };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
        <div className="font-bold text-sm text-orange-800 dark:text-orange-200 font-mono">{NIS_DATA.title}</div>
        <div className="text-xs text-orange-700 dark:text-orange-300 font-mono mt-1">{NIS_DATA.subtitle}</div>
        <div className="text-[10px] text-orange-600 dark:text-orange-400 font-mono mt-1">{NIS_DATA.source}</div>
        <div className="text-xs text-orange-800 dark:text-orange-200 font-mono mt-2 leading-relaxed">{NIS_DATA.intro}</div>
      </div>

      {/* NIS Steps */}
      {NIS_DATA.steps.map(step => {
        const sc = stepColors[step.color] || stepColors.blue;
        const isOpen = openStep === step.step;
        return (
          <div key={step.step} className={`border-2 rounded-xl overflow-hidden ${sc.border}`}>
            <button onClick={() => setOpenStep(isOpen ? null : step.step)} className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${sc.header}`}>
              <span className={`font-bold text-sm font-mono ${sc.text}`}>{step.step}</span>
              <CaretRight size={13} weight="bold" className={`${sc.text} transition-transform ${isOpen ? "rotate-90" : ""}`} />
            </button>
            {isOpen && (
              <div className={`px-4 pb-4 pt-2 ${sc.bg}`}>
                <div className="space-y-2">
                  {step.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`w-5 h-5 rounded-full ${sc.dot} text-white text-[8px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5`}>{i + 1}</span>
                      <span className="text-xs font-mono text-slate-700 dark:text-slate-200 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Flow sheet parameters */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-900 dark:bg-slate-950 text-white font-mono text-[10px] uppercase tracking-widest">{NIS_DATA.flowSheet.title}</div>
        <div className="p-4 bg-white dark:bg-slate-900/50 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {NIS_DATA.flowSheet.parameters.map((p, i) => (
            <div key={i} className="flex gap-2 text-xs font-mono text-slate-700 dark:text-slate-200">
              <span className="text-blue-400 flex-shrink-0">•</span><span>{p}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-2">Interventions to Document</div>
          <div className="space-y-1">
            {NIS_DATA.flowSheet.interventions.map((iv, i) => (
              <div key={i} className="flex gap-2 text-xs font-mono text-slate-700 dark:text-slate-200">
                <span className="text-red-400 flex-shrink-0">→</span><span>{iv}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <RefFooter refs={["PREM SOP · NHM Tamil Nadu (ICH & HC, MMC Chennai)", "WHO STM 2017"]} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED FOOTER
// ═══════════════════════════════════════════════════════════════════════════

function RefFooter({ refs }) {
  return (
    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] text-slate-400 font-mono text-center leading-relaxed">
      {refs.join(" · ")}
      <div className="mt-1 text-amber-500">⚠ Clinical reference only — always verify doses and follow local institutional protocols</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ═══════════════════════════════════════════════════════════════════════════

const MAIN_TABS = [
  { id: "ed",          label: "ED Management",      Icon: FirstAid      },
  { id: "aha",         label: "AHA Algorithms",      Icon: Heartbeat     },
  { id: "guidelines",  label: "Clinical Guidelines", Icon: BookOpen      },
  { id: "pathways",    label: "Clinical Pathways",   Icon: TreeStructure },
  { id: "prehospital", label: "Prehospital",         Icon: Ambulance     },
];

export default function ManagementAlgorithmsTab() {
  const [activeTab, setActiveTab] = useState("ed");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Management Algorithms
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          IAP 2019–2023 · Fleischer &amp; Ludwig 7e · Nelson's 21e · AHA PALS 2025 · PREM-TAEI SOP · WHO STM 2017
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
        <Warning size={13} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>Clinical reference only. Always verify doses against current guidelines and institutional protocols before administration.</span>
      </div>

      {/* Main tab strip */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-1">
        {MAIN_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-[11px] font-mono font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === t.id ? "border-blue-500 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50" : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}>
            <t.Icon size={13} weight="bold" />{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "ed"          && <EDManagementView />}
      {activeTab === "aha"         && <AHAView />}
      {activeTab === "guidelines"  && <ClinicalGuidelinesView />}
      {activeTab === "pathways"    && <PathwaysView />}
      {activeTab === "prehospital" && <PrehospitalView />}
    </div>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * APP.JS CHANGES REQUIRED
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. REPLACE the old tab imports with this single file:
 *
 *    // REMOVE these (if they exist as separate files):
 *    import IAPGuidelinesTab from "./components/tabs/IAPGuidelinesTab";
 *    import AlgorithmsTab    from "./components/tabs/AlgorithmsTab";
 *    import ClinicalPathwaysTab from "./components/tabs/ClinicalPathwaysTab";
 *
 *    // ADD this single import:
 *    import ManagementAlgorithmsTab from "./components/tabs/ManagementAlgorithmsTab";
 *
 * 2. In your TAB_DEFINITIONS array (or wherever you define nav tabs),
 *    REPLACE any separate entries for "IAP Guidelines", "ED Algorithms",
 *    "Clinical Pathways" with ONE entry:
 *
 *    {
 *      id:        "management",
 *      label:     "Management",
 *      icon:      FirstAid,           // or any icon from @phosphor-icons/react
 *      component: ManagementAlgorithmsTab,
 *    }
 *
 * 3. In your route/tab renderer, render ONE component:
 *
 *    {activeTab === "management" && <ManagementAlgorithmsTab />}
 *
 *    (remove the old separate renders for IAPGuidelinesTab, AlgorithmsTab, etc.)
 *
 * 4. DELETE (or archive) the now-redundant separate tab files:
 *    - IAPGuidelinesTab.jsx
 *    - AlgorithmsTab.jsx         (and its data/algorithms.js if used only there)
 *    - ClinicalPathwaysTab.jsx   (and its data/pathways.js, data/differentials.js)
 *
 * 5. If WeightContext was used only in ClinicalPathwaysTab and you have
 *    removed that file, you can either keep WeightContext (it's not imported
 *    here — PathwayRunner was simplified) or remove it if unused elsewhere.
 *
 * 6. The AHA_2025_UPDATES and ALGORITHMS imports from "../../data/algorithms"
 *    in the old AlgorithmsTab.jsx are now inline in this file — those data
 *    files can be deleted.
 *
 * 7. exportCarePlanPDF from "../../lib/exportCarePlan" is NOT used in this
 *    simplified version. Keep it if used elsewhere; otherwise remove.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
