// ManagementAlgorithmsTab.jsx
// Unified Management Algorithms & Guidelines Tab
// Sub-tabs: ED Management · AHA Algorithms · Clinical Guidelines · Interactive Pathways · Differentials
// Sources: IAP 2019–2023 · Fleischer & Ludwig 7e · Nelson 21e · PALS 2025 AHA · WHO · PREM-TAEI

import { useState } from "react";
import { useWeight } from "../../context/WeightContext";
import { useSearchNavigate } from "../../hooks/useSearchNavigate";
import {
  MagnifyingGlass, X, CaretRight, CaretDown, Warning, Lightbulb,
  Syringe, Brain, Baby, Drop, Wind, Lightning, TreeStructure,
  BookOpen, ArrowRight, ArrowDown, Diamond, Heartbeat,
  Metronome, Pulse, Gauge, ChartLineUp, Flask, Bug,
  FirstAid, Stethoscope, ArrowLeft, FilePdf,
} from "@phosphor-icons/react";
import { exportCarePlanPDF } from "../../lib/exportCarePlan";
import { toast } from "sonner";
import { DIFFERENTIALS } from "../../data/differentials";
import { PATHWAYS } from "../../data/pathways";
import { ALGORITHMS as PALS_ALGORITHMS, AHA_2025_UPDATES } from "../../data/algorithms";

useSearchNavigate("algorithms", ({ section }) => {
  const map = {
    "ED Management": "ed", "AHA Algorithms": "aha",
    "Clinical Guidelines": "guidelines",
    "Interactive Pathways": "pathways", "Differentials": "differentials",
  };
  if (map[section]) setActiveTab(map[section]);
});

// ─── SHARED STYLE MAPS ────────────────────────────────────────────────────────
const PHASE_COLORS = {
  red:     { border: "border-l-red-500",     bg: "bg-red-50 dark:bg-red-950/20",     badge: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },
  orange:  { border: "border-l-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/20", badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700" },
  blue:    { border: "border-l-blue-500",    bg: "bg-blue-50 dark:bg-blue-950/20",   badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700" },
  emerald: { border: "border-l-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20", badge: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700" },
};

const PALS_COLORS = {
  resuscitation: { bar: "bg-red-500",  accent: "text-red-600 dark:text-red-400",  border: "border-red-500/40",  chip: "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900" },
  fluid:         { bar: "bg-cyan-500", accent: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/40", chip: "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-900" },
  anticonvulsant:{ bar: "bg-fuchsia-500", accent: "text-fuchsia-600 dark:text-fuchsia-400", border: "border-fuchsia-500/40", chip: "bg-fuchsia-50 dark:bg-fuchsia-950/60 border-fuchsia-200 dark:border-fuchsia-900" },
};

const CAT_DOT   = { Emergency: "bg-red-500", Respiratory: "bg-sky-500", Neurology: "bg-violet-500", "Infectious Disease": "bg-emerald-500", Neonatal: "bg-rose-500" };
const CAT_COLOR = { Emergency: "text-red-600 dark:text-red-400", Respiratory: "text-sky-600 dark:text-sky-400", Neurology: "text-violet-600 dark:text-violet-400", "Infectious Disease": "text-emerald-600 dark:text-emerald-400", Neonatal: "text-rose-600 dark:text-rose-400" };

const IAP_COLOR_MAP = {
  red:     { bg: "bg-red-50 dark:bg-red-950/20",     border: "border-red-200 dark:border-red-800",     text: "text-red-700 dark:text-red-300",     dot: "bg-red-500",     header: "bg-red-50 dark:bg-red-950/30"     },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500", header: "bg-emerald-50 dark:bg-emerald-950/30" },
  sky:     { bg: "bg-sky-50 dark:bg-sky-950/20",     border: "border-sky-200 dark:border-sky-800",     text: "text-sky-700 dark:text-sky-300",     dot: "bg-sky-500",     header: "bg-sky-50 dark:bg-sky-950/30"     },
  violet:  { bg: "bg-violet-50 dark:bg-violet-950/20", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500", header: "bg-violet-50 dark:bg-violet-950/30" },
  rose:    { bg: "bg-rose-50 dark:bg-rose-950/20",   border: "border-rose-200 dark:border-rose-800",   text: "text-rose-700 dark:text-rose-300",   dot: "bg-rose-500",   header: "bg-rose-50 dark:bg-rose-950/30"   },
  amber:   { bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500",  header: "bg-amber-50 dark:bg-amber-950/30" },
  teal:    { bg: "bg-teal-50 dark:bg-teal-950/20",   border: "border-teal-200 dark:border-teal-800",   text: "text-teal-700 dark:text-teal-300",   dot: "bg-teal-500",   header: "bg-teal-50 dark:bg-teal-950/30"   },
};

const TONE = {
  red:     "bg-red-100 text-red-900 border-red-400 dark:bg-red-950 dark:text-red-200 dark:border-red-700",
  amber:   "bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700",
  emerald: "bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700",
};

const ICON_MAP = { metronome: Metronome, pulse: Pulse, gauge: Gauge, chart: ChartLineUp, beaker: Flask, brain: Brain };

// ─── ED MANAGEMENT DATA ───────────────────────────────────────────────────────
const ED_ALGORITHMS = [
  {
    id: "septic-shock", category: "Emergency", title: "Septic Shock", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.4", "IAP PALS 2020", "Nelson 21e Ch.527"],
    diagnostic: {
      title: "Recognise Septic Shock",
      steps: [
        { label: "Suspect",    text: "Fever/hypothermia + altered perfusion: tachycardia, prolonged CRT, mottling, altered mentation" },
        { label: "Warm shock", text: "Bounding pulses, flash CRT, wide pulse pressure, fever — commonest in early sepsis" },
        { label: "Cold shock", text: "Diminished pulses, CRT >3s, mottled/cool peripheries, narrow pulse pressure" },
        { label: "Labs",       text: "CBC, CRP, procalcitonin, lactate, blood culture ×2 before antibiotics, LFT, RFT, coagulation" },
        { label: "Severity",   text: "Lactate >2 mmol/L = sepsis · >4 = severe · MAP <65 mmHg + vasopressors = septic shock" },
      ],
    },
    management: {
      title: "Hour-1 Bundle",
      phases: [
        { time: "0–15 min", color: "red",     steps: ["IV/IO access immediately · Blood cultures before antibiotics", "Isotonic crystalloid 20 mL/kg NS/RL bolus over 5–10 min. Reassess after each bolus (HR, CRT, BP, mentation). Repeat up to 60 mL/kg", "Broad-spectrum antibiotics within 1 hour of recognition", "Avoid bolus fluids in SAM → WHO SAM protocol"] },
        { time: "15–60 min", color: "orange",  steps: ["Fluid-refractory: norepinephrine 0.05–0.3 mcg/kg/min — first-line per IAP (NOT dopamine)", "Cold shock: add epinephrine 0.05–0.3 mcg/kg/min", "Warm shock: norepinephrine ± vasopressin 0.03–0.04 units/kg/min", "Target MAP ≥65 mmHg · ScvO₂ ≥70% · CRT <2 sec", "Hydrocortisone 2 mg/kg IV if catecholamine-resistant"] },
        { time: "Antibiotics (India)", color: "emerald", steps: ["Community sepsis: pip-tazo 100 mg/kg/day + amikacin 15 mg/kg/day (IAP AMS 2023)", "Hospital/ICU: meropenem 60–120 mg/kg/day + vancomycin (AUC-guided)", "ESBL +ve: meropenem (avoid pip-tazo)", "De-escalate within 48–72h on culture results"] },
      ],
    },
  },
  {
    id: "anaphylaxis", category: "Emergency", title: "Anaphylaxis", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.82", "IAP 2023"],
    diagnostic: {
      title: "Diagnose — ANY 1 of 3 Criteria",
      steps: [
        { label: "Criterion 1", text: "Skin/mucosal involvement PLUS respiratory compromise OR hypotension" },
        { label: "Criterion 2", text: "≥2 organ systems after likely allergen: skin + respiratory + GI + cardiovascular" },
        { label: "Criterion 3", text: "Reduced BP alone after known allergen exposure" },
        { label: "Biphasic",    text: "Recurrence 1–72hr later (4–23%); observe ≥4–6hr minimum" },
        { label: "Grading",     text: "1: skin only · 2: mild systemic · 3: severe systemic · 4: cardiac arrest" },
      ],
    },
    management: {
      title: "Immediate Response",
      phases: [
        { time: "First Line ONLY", color: "red", steps: ["EPINEPHRINE IM 0.01 mg/kg (max 0.5 mg) anterolateral mid-thigh — ONLY life-saving drug", "Auto-injector: <15 kg → 0.15 mg · 15–30 kg → 0.3 mg · >30 kg → 0.5 mg", "Repeat every 5–15 min PRN — no maximum dose if haemodynamically unstable", "Lateral decubitus/supine + legs elevated · Call for help · Remove trigger"] },
        { time: "Concurrent",     color: "orange", steps: ["O₂ 8–10 L/min face mask · IV/IO access", "IV fluid 20 mL/kg NS if hypotensive", "Salbutamol neb if bronchospasm persists after epi", "Refractory hypotension: epinephrine infusion 0.1–1 mcg/kg/min IV"] },
        { time: "Adjuncts Only",  color: "blue",   steps: ["Diphenhydramine 1 mg/kg IV (max 50 mg) — treats skin only, NOT first line", "Hydrocortisone 5 mg/kg IV — may reduce biphasic reaction", "Glucagon 20–30 mcg/kg IV if on beta-blockers and epi inadequate", "Discharge: auto-injector prescription + written action plan + allergy referral"] },
      ],
    },
  },
  {
    id: "dka", category: "Emergency", title: "DKA", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.97", "IAP 2020", "ISPAD 2022"],
    diagnostic: {
      title: "Diagnose & Severity-Stratify",
      steps: [
        { label: "DKA criteria",         text: "Glucose >11 mmol/L + pH <7.3 OR bicarb <15 mEq/L + ketonuria/ketonemia" },
        { label: "Mild",                 text: "pH 7.2–7.3, bicarb 10–15, alert" },
        { label: "Moderate",             text: "pH 7.1–7.2, bicarb 5–10, drowsy" },
        { label: "Severe",               text: "pH <7.1, bicarb <5, obtunded/comatose" },
        { label: "Cerebral oedema risk", text: "Age <5yr, new-onset DM, severe DKA, Na fails to rise as glucose falls, AMS during treatment" },
        { label: "Labs",                 text: "VBG, BSL q1hr, U&E corrected Na, osmolality, urine ketones, HbA1c, ECG for K+ effects" },
      ],
    },
    management: {
      title: "DKA Protocol (IAP 2020 / ISPAD 2022)",
      phases: [
        { time: "Hour 1 — Resuscitation", color: "red",    steps: ["10–20 mL/kg 0.9% NS over 30–60 min ONLY if haemodynamically compromised", "Do NOT routinely give large boluses — increases cerebral oedema risk", "No bicarbonate (not recommended IAP/ISPAD)"] },
        { time: "Hours 1–48 — Rehydration", color: "orange", steps: ["Deficit: mild 5%, moderate 7%, severe 10% body weight", "Replace deficit OVER 48 HOURS — not 24hr (IAP strong recommendation)", "0.9% NS initially → 0.45% NaCl + 5% dextrose when BSL <14 mmol/L", "Add KCl 40 mEq/L once urine output confirmed"] },
        { time: "Insulin — After 1hr Fluids", color: "blue", steps: ["Do NOT start insulin until 1 hour of IV fluids completed", "Regular insulin infusion 0.05–0.1 units/kg/hr (use 0.05 in young/severe)", "Target BSL fall: 2–5 mmol/L/hr", "CEREBRAL OEDEMA: mannitol 0.5–1 g/kg IV over 15 min OR 3% NaCl 3–5 mL/kg at FIRST sign"] },
      ],
    },
  },
  {
    id: "status-epilepticus", category: "Neurology", title: "Status Epilepticus", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.70", "IAP 2021"],
    diagnostic: {
      title: "Classify & Identify Cause",
      steps: [
        { label: "Definition",     text: "Continuous seizure >5 min OR ≥2 seizures without full recovery between them" },
        { label: "Refractory SE",  text: "Failed ≥2 first-line + ≥1 second-line AED — 15–25% of SE cases" },
        { label: "Immediate check",text: "BSL — treat hypoglycaemia NOW: D10% 5 mL/kg IV or glucagon IM" },
        { label: "Common causes",  text: "Fever/meningitis, epilepsy breakthrough, hyponatraemia, hypocalcaemia, toxin, structural" },
        { label: "Workup",         text: "BSL, electrolytes, Ca, Mg, ammonia, tox screen · LP after seizure control if meningitis suspected" },
      ],
    },
    management: {
      title: "Time-Based Protocol (IAP 2021)",
      phases: [
        { time: "0–5 min — First Line", color: "blue",   steps: ["ABC · O₂ · Lateral position · BSL · IV access attempt", "Midazolam intranasal 0.2 mg/kg (max 10 mg) — preferred if no IV, equal to IV lorazepam", "OR midazolam buccal 0.3 mg/kg (max 10 mg)", "IV access: lorazepam 0.1 mg/kg IV (max 4 mg)"] },
        { time: "5–20 min — Second Line", color: "orange", steps: ["Levetiracetam 40–60 mg/kg IV over 5–15 min (max 3 g) — preferred IAP 2021", "OR valproate 20–40 mg/kg IV over 5–10 min — AVOID: liver disease, metabolic disorders, females ≥10yr", "OR phenytoin 18–20 mg/kg IV over 20 min (max 1 g) — cardiac monitor mandatory"] },
        { time: "20–40 min — Refractory", color: "red",   steps: ["PICU involvement mandatory — DO NOT DELAY", "Midazolam infusion: load 0.15–0.2 mg/kg IV → 0.05–0.5 mg/kg/hr", "Ketamine 1.5 mg/kg IV bolus + infusion — NMDA antagonist", "Propofol: AVOID in children <3yr (propofol infusion syndrome)"] },
      ],
    },
  },
  {
    id: "meningitis", category: "Infectious Disease", title: "Bacterial Meningitis", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.92", "IAP 2019"],
    diagnostic: {
      title: "Diagnose & Risk-Stratify",
      steps: [
        { label: "Classic triad",        text: "Fever + neck stiffness + altered mentation — only 44% have all 3; absent in infants" },
        { label: "Infants",              text: "Bulging fontanelle, paradoxical irritability, poor feeding, high-pitched cry" },
        { label: "LP contraindications", text: "Papilloedema · Focal neurological deficit · Seizure within 30 min · Haemodynamically unstable" },
        { label: "CSF — Bacterial",      text: "WBC >1000 (PMN), glucose <2.2 mmol/L (CSF:serum <0.4), protein >1 g/L" },
        { label: "CSF — Viral",          text: "WBC 10–500 (lymphocytic), glucose normal, protein mildly elevated" },
      ],
    },
    management: {
      title: "Antibiotic + Steroid Protocol",
      phases: [
        { time: "Immediate Antibiotics", color: "red",    steps: ["Ceftriaxone 100 mg/kg/day IV ÷ 12-hourly (max 4 g/dose) — IAP 2019", "Neonates <1 month: cefotaxime + ampicillin (Listeria cover) — NOT ceftriaxone in neonates", "Add vancomycin 60 mg/kg/day if MRSA or penicillin-resistant pneumococcus suspected"] },
        { time: "Dexamethasone Timing",  color: "blue",   steps: ["0.15 mg/kg IV q6h × 4 days — proven to reduce hearing loss in H. influenzae b meningitis", "Give 15–30 min BEFORE or WITH first antibiotic dose — NOT after (Fleisher 7e)", "Benefit weaker for pneumococcal; NOT recommended for neonatal meningitis"] },
        { time: "Duration & Follow-up",  color: "orange", steps: ["Pneumococcal: 10–14 days · Meningococcal: 5–7 days · H. influenzae: 7–10 days", "Raised ICP: mannitol 0.5 g/kg IV + fluid restriction 60–80% maintenance", "Audiological assessment at discharge — SNHL 10–30%", "Chemoprophylaxis: rifampicin for H. influenzae and meningococcal household contacts"] },
      ],
    },
  },
  {
    id: "asthma", category: "Respiratory", title: "Acute Asthma", tag: "COMMON",
    refs: ["Fleisher & Ludwig 7e Ch.79", "IAP 2022"],
    diagnostic: {
      title: "Severity Assessment",
      steps: [
        { label: "Mild",            text: "SpO₂ ≥95%, speaks sentences, mild wheeze, PEFR >70% predicted" },
        { label: "Moderate",        text: "SpO₂ 92–95%, speaks phrases, polyphonic wheeze + recession, PEFR 40–70%" },
        { label: "Severe",          text: "SpO₂ <92%, speaks words only, severe wheeze/silent chest, significant recession, PEFR <40%" },
        { label: "Life-threatening",text: "SpO₂ <90%, cyanosis, exhausted, silent chest, confusion, PEFR <25%" },
        { label: "Pitfall",         text: "Silent chest = severe obstruction, NOT improvement." },
      ],
    },
    management: {
      title: "Stepwise Treatment",
      phases: [
        { time: "All Severities",       color: "blue",    steps: ["O₂ via face mask — target SpO₂ ≥94%", "Salbutamol MDI + spacer 4–8 puffs q20min × 3 — preferred over nebuliser (IAP 2022)", "Ipratropium 0.25–0.5 mg neb with salbutamol — moderate/severe only, first 3 doses"] },
        { time: "Systemic Steroids",    color: "orange",  steps: ["Prednisolone 1–2 mg/kg/day PO (max 40 mg) × 3–5 days", "OR dexamethasone 0.6 mg/kg PO/IM × 2 doses 24hr apart — equal efficacy (IAP 2022)"] },
        { time: "Severe/Refractory",    color: "red",     steps: ["IV MgSO₄ 25–50 mg/kg (max 2.5 g) over 20 min for severe not responding to 3×SABA", "Salbutamol IV infusion 5–10 mcg/kg/min in ICU", "Ketamine 1–2 mg/kg IV if intubation needed (bronchodilator)", "Heliox 70:30 if available for near-fatal/refractory"] },
      ],
    },
  },
  {
    id: "croup", category: "Respiratory", title: "Croup (Viral LTB)", tag: "COMMON",
    refs: ["Fleisher & Ludwig 7e Ch.86", "IAP 2019"],
    diagnostic: {
      title: "Westley Croup Score",
      steps: [
        { label: "Score ≤1",     text: "Mild — barky cough, no stridor at rest" },
        { label: "Score 2–7",    text: "Moderate — stridor at rest, visible recession" },
        { label: "Score 8–11",   text: "Severe — marked stridor, agitation" },
        { label: "Score ≥12",    text: "Impending failure — cyanosis, decreased consciousness" },
        { label: "Differentiate",text: "Epiglottitis: toxic, drooling, tripod, NO barking cough · Bacterial tracheitis: very toxic, does NOT improve with epi" },
      ],
    },
    management: {
      title: "Croup Algorithm",
      phases: [
        { time: "All Grades",          color: "blue",   steps: ["Dexamethasone 0.6 mg/kg PO single dose (max 10 mg) — IAP 2019", "Keep child calm on parent's lap — minimise distress"] },
        { time: "Moderate–Severe",     color: "orange", steps: ["Neb epinephrine 0.5 mL/kg of 1:1000 undiluted (max 5 mL) — onset 10–30 min", "Observe MINIMUM 2–4 hours post-nebulisation for rebound stridor"] },
        { time: "Impending Failure",   color: "red",    steps: ["Senior airway clinician — call EARLY", "Intubate with tube 0.5–1 mm smaller than expected (subglottic oedema)", "Ketamine 1–2 mg/kg IV induction", "Heliox 70:30 as bridge while preparing for intubation"] },
      ],
    },
  },
  {
    id: "dengue", category: "Infectious Disease", title: "Dengue", tag: "COMMON",
    refs: ["Fleisher & Ludwig 7e Ch.102", "IAP 2021", "WHO 2012"],
    diagnostic: {
      title: "WHO Dengue Phase Classification",
      steps: [
        { label: "Febrile (D1–3)",    text: "High fever, myalgia, rash — NS1 Ag positive" },
        { label: "Critical (D3–7)",   text: "Fever defervesces — HIGH RISK: plasma leakage, haemoconcentration, DSS" },
        { label: "Warning signs",     text: "Abdominal pain, persistent vomiting, clinical fluid accumulation, mucosal bleeding, lethargy, liver >2 cm, HCT rise + rapid platelet fall" },
        { label: "Severe dengue",     text: "Severe plasma leakage/shock (DSS) OR severe bleeding OR severe organ dysfunction" },
        { label: "Lab triggers",      text: "HCT rise ≥20% = leakage · Plt <20,000 = transfuse only if bleeding" },
      ],
    },
    management: {
      title: "Group-Based Fluid Management",
      phases: [
        { time: "Group A — Outpatient", color: "emerald", steps: ["No warning signs, tolerating orals, adequate urine output", "Paracetamol 15 mg/kg q4–6h — No NSAIDs, aspirin, ibuprofen", "Oral fluids 3–5 L/m²/day · Daily review during critical phase (D3–7)"] },
        { time: "Group B — Hospital",   color: "orange",  steps: ["IV NS/RL 5–7 mL/kg/hr × 2–4hr → reduce stepwise: 5 → 3 → 2.5 → 1.5 mL/kg/hr", "Monitor HCT 4–6 hourly · Urine output ≥0.5 mL/kg/hr target"] },
        { time: "Group C — Severe",     color: "red",     steps: ["IV NS/RL 10–20 mL/kg over 15–30 min → reassess → repeat PRN", "Colloid if haemodynamic instability persists after 2 crystalloid boluses", "Plt transfuse ONLY if <10,000 OR clinically significant active bleeding"] },
      ],
    },
  },
  {
    id: "neonatal-resus", category: "Neonatal", title: "Neonatal Resuscitation (NRP)", tag: "CRITICAL",
    refs: ["IAP NRP 2021", "Nelson 21e Ch.117"],
    diagnostic: {
      title: "Initial Assessment — First 30 Seconds",
      steps: [
        { label: "Assess immediately", text: "Term? Breathing/crying? Good tone? → YES all → routine care + delayed cord clamping ≥60 sec" },
        { label: "If NO to any",       text: "Cord clamp → warm + dry + stimulate → clear airway if secretions visible" },
        { label: "SpO₂ targets",       text: "1min: 60–65% · 2min: 65–70% · 3min: 70–75% · 5min: 80–85% · 10min: 85–95%" },
        { label: "Initial FiO₂",       text: "Term: 0.21 · Preterm <35wks: 0.21–0.30 · Titrate by SpO₂ target" },
      ],
    },
    management: {
      title: "NRP Steps — IAP 2021",
      phases: [
        { time: "HR <100 or Apnoea",   color: "orange", steps: ["PPV: peak pressure 20–25 cmH₂O (30 cmH₂O if no chest rise), PEEP 5 cmH₂O, rate 40–60/min", "T-piece resuscitator preferred over bag-valve (IAP NRP 2021)", "Reassess HR after 30 sec effective PPV — MR SOPA if chest not rising"] },
        { time: "HR <60 — CPR + PPV",  color: "red",    steps: ["2-thumb encircling technique — preferred (higher BP than 2-finger)", "Ratio: 3:1 (compressions:breaths) = 90 comp + 30 breaths per minute", "Depth: 1/3 AP diameter · Allow full recoil · Increase FiO₂ to 1.0 · Intubate"] },
        { time: "HR <60 After CPR",    color: "red",    steps: ["Adrenaline IV/IO: 0.01–0.03 mg/kg (0.1–0.3 mL/kg of 1:10,000)", "Repeat every 3–5 min if no response", "NS 10 mL/kg IV/IO if hypovolaemia suspected"] },
      ],
    },
  },
];

// ─── IAP GUIDELINES DATA ──────────────────────────────────────────────────────
const IAP_GUIDELINES = [
  {
    category: "Emergency & Critical Care", color: "red",
    guidelines: [
      { title: "IAP PALS / Septic Shock 2020", year: "2020", summary: "Norepinephrine first-line vasopressor. Early antibiotics within 1 hour. 20 mL/kg isotonic crystalloid bolus. Lactate-guided resuscitation.", keyPoints: ["Norepi first-line over dopamine", "Antibiotics within 1hr of recognition", "20 mL/kg NS bolus × 3 if needed", "Target MAP ≥ 65 mmHg"] },
      { title: "IAP Anaphylaxis Guidelines 2023", year: "2023", summary: "IM epinephrine 0.01 mg/kg anterolateral thigh is first and only life-saving intervention.", keyPoints: ["Epi IM 0.01 mg/kg (max 0.5 mg) immediately", "Repeat every 5–15 min PRN", "Observe minimum 4–6 hours post reaction", "Antihistamines NOT first-line"] },
      { title: "IAP DKA Management 2020", year: "2020", summary: "Fluid deficit replaced over 48 hours. Avoid rapid rehydration — cerebral oedema risk. Insulin infusion after 1 hour of fluids.", keyPoints: ["0.9% NS for initial resuscitation", "Deficit over 48hr not 24hr", "Insulin 0.05–0.1 units/kg/hr after 1hr fluids", "Cerebral oedema: mannitol 0.5–1 g/kg OR 3% NaCl 3–5 mL/kg"] },
    ],
  },
  {
    category: "Infectious Disease", color: "emerald",
    guidelines: [
      { title: "IAP Antimicrobial Stewardship 2023", year: "2023", summary: "ESBL-aware empirical antibiotic selection for Indian EDs. Meropenem-sparing strategies strongly recommended.", keyPoints: ["ESBL UTI: nitrofurantoin or fosfomycin oral", "Community sepsis: pip-tazo + amikacin", "Hospital sepsis: meropenem + vancomycin (AUC-guided)", "De-escalate within 48–72h"] },
      { title: "IAP Dengue Management 2021", year: "2021", summary: "Supportive care only. No NSAIDs, no aspirin, no empirical antibiotics. Fluid management guided by haematocrit.", keyPoints: ["Paracetamol only for fever", "Platelets transfuse only <10,000 or active bleeding", "Watch for plasma leakage in critical phase (day 3–7)", "No corticosteroids"] },
      { title: "IAP Community Pneumonia 2022", year: "2022", summary: "High-dose amoxicillin for mild-moderate CAP in Indian children.", keyPoints: ["Mild-mod: amoxicillin 80–90 mg/kg/day PO", "Severe: IV ampicillin-sulbactam or ceftriaxone", "Add azithromycin if age >5 yr", "O₂ if SpO₂ <92%"] },
      { title: "IAP Meningitis Guidelines 2019", year: "2019", summary: "Ceftriaxone 100 mg/kg/day IV. Dexamethasone 0.15 mg/kg q6h × 4 days — give before or with first antibiotic.", keyPoints: ["Ceftriaxone preferred over cefotaxime (once daily)", "Dexamethasone reduces hearing loss in H. influenzae meningitis", "Neonates: add ampicillin + cefotaxime", "LP before antibiotics if no signs of raised ICP"] },
    ],
  },
  {
    category: "Respiratory", color: "sky",
    guidelines: [
      { title: "IAP Asthma Management 2022", year: "2022", summary: "Dexamethasone 0.6 mg/kg × 2 doses equivalent to prednisolone 5-day course. MDI + spacer preferred.", keyPoints: ["Salbutamol MDI 4–8 puffs q20min × 3 (mild-mod)", "Dexamethasone 0.6 mg/kg PO/IM × 2 doses", "Magnesium sulfate 25–50 mg/kg IV for severe", "Heliox if available for near-fatal"] },
      { title: "IAP Bronchiolitis 2020", year: "2020", summary: "Supportive care only. No salbutamol, no steroids, no antibiotics, no nebulised saline routinely.", keyPoints: ["Oxygen if SpO₂ <92%", "HFNC if increased WOB", "No salbutamol", "No corticosteroids", "No routine chest physiotherapy"] },
      { title: "IAP Croup (LTB) 2019", year: "2019", summary: "Single dose dexamethasone 0.6 mg/kg PO effective for all grades.", keyPoints: ["Dexamethasone 0.6 mg/kg PO single dose (max 10 mg)", "Neb epinephrine: 0.5 mL/kg of 1:1000 (max 5 mL)", "Observe 2–4 hr post-neb for rebound", "Westley score guides severity"] },
    ],
  },
  {
    category: "Neurology", color: "violet",
    guidelines: [
      { title: "IAP Status Epilepticus 2021", year: "2021", summary: "Midazolam IN/buccal/IM first-line. Levetiracetam preferred second-line over phenytoin.", keyPoints: ["0–5 min: midazolam IN 0.2 mg/kg or buccal 0.3 mg/kg", "5–20 min: lorazepam IV 0.1 mg/kg", "20–40 min: levetiracetam 40–60 mg/kg IV preferred", "40+ min: midazolam infusion"] },
      { title: "IAP Febrile Seizure 2017", year: "2017", summary: "No anticonvulsant prophylaxis recommended. Simple febrile seizures do not require neuroimaging.", keyPoints: ["No long-term antiepileptic drugs for simple FS", "No EEG or neuroimaging for typical simple FS", "Fever control with paracetamol/ibuprofen", "Risk of recurrence: 30%"] },
    ],
  },
  {
    category: "Neonatal", color: "rose",
    guidelines: [
      { title: "IAP NRP / Neonatal Resuscitation 2021", year: "2021", summary: "Delayed cord clamping ≥60 seconds for non-asphyxiated newborns. T-piece resuscitator preferred.", keyPoints: ["Delayed cord clamping ≥60s", "Initial FiO₂: term 0.21, preterm 0.21–0.30", "HR <60 after PPV: start chest compressions", "Epinephrine 0.01–0.03 mg/kg IV/IO if no response"] },
      { title: "IAP Neonatal Sepsis 2022", year: "2022", summary: "Ampicillin + gentamicin first-line for early-onset sepsis (EOS).", keyPoints: ["EOS: ampicillin + gentamicin (once-daily dosing)", "LONS: pip-tazo or cloxacillin + amikacin", "Blood culture before first dose", "Minimum 7–10 day course"] },
    ],
  },
  {
    category: "Fluid & Electrolytes", color: "amber",
    guidelines: [
      { title: "IAP Fluid Therapy 2020", year: "2020", summary: "20 mL/kg isotonic crystalloid bolus for septic shock. FEAST trial — restrict bolus fluids in SAM and malaria.", keyPoints: ["Isotonic NS or RL for bolus", "Max 60 mL/kg in first hour then reassess", "Avoid bolus in SAM — WHO SAM protocol", "Hypertonic 3% NaCl for symptomatic hyponatraemia"] },
      { title: "IAP Diarrhoea & ORT 2021", year: "2021", summary: "Oral rehydration therapy for all grades except severe dehydration with shock.", keyPoints: ["Mild: ORS 50 mL/kg over 4 hr", "Moderate: ORS 100 mL/kg over 4 hr", "Severe + shock: IV NS 20 mL/kg then ORS", "Zinc: <6 mo 10 mg/day, >6 mo 20 mg/day × 14 days"] },
    ],
  },
];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder="Search conditions, drugs, doses..."
        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-slate-400 font-mono" />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X size={12} weight="bold" />
        </button>
      )}
    </div>
  );
}

function AlgoCard({ algo, isOpen, onToggle, activeTab, onTabChange }) {
  const dotCls   = CAT_DOT[algo.category]   || "bg-slate-400";
  const catColor = CAT_COLOR[algo.category] || "text-slate-500";
  const tab = activeTab || "diag";

  return (
    <div className={`bg-white dark:bg-slate-900/50 border rounded-xl overflow-hidden ${isOpen ? "border-slate-300 dark:border-slate-600" : "border-slate-200 dark:border-slate-700"}`}>
      <button onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotCls}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900 dark:text-white"
                    style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{algo.title}</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                algo.tag === "CRITICAL"
                  ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                  : "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800"
              }`}>{algo.tag}</span>
            </div>
            <div className={`text-[9px] font-mono mt-0.5 ${catColor}`}>{algo.refs?.join(" · ")}</div>
          </div>
        </div>
        <CaretRight size={12} weight="bold" className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            {[{ key: "diag", label: "Diagnostic", Icon: MagnifyingGlass }, { key: "mgmt", label: "Management", Icon: Syringe }].map(({ key, label, Icon }) => (
              <button key={key} onClick={() => onTabChange(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold font-mono uppercase tracking-widest border-b-2 transition-all ${
                  tab === key ? "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-blue-500" : "bg-white dark:bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-600"
                }`}>
                <Icon size={11} weight="bold" />{label}
              </button>
            ))}
          </div>
          <div className="p-4">
            {tab === "diag" && (
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
            {tab === "mgmt" && (
              <div className="space-y-3">
                <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">{algo.management.title}</div>
                {algo.management.phases.map((phase, pi) => {
                  const pc = PHASE_COLORS[phase.color] || PHASE_COLORS.blue;
                  return (
                    <div key={pi} className={`border-l-4 rounded-r-lg p-3 ${pc.border} ${pc.bg}`}>
                      <div className="mb-2">
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded border ${pc.badge}`}>{phase.time}</span>
                      </div>
                      <div className="space-y-1.5">
                        {phase.steps.map((step, si) => (
                          <div key={si} className="flex items-start gap-2">
                            <span className={`w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border ${pc.badge}`}>{si + 1}</span>
                            <span className={`text-xs font-mono leading-relaxed ${
                              step.startsWith("No ") ? "text-red-600 dark:text-red-400" :
                              step.startsWith("CEREBRAL") || step.startsWith("PICU") ? "text-amber-700 dark:text-amber-300 font-semibold" :
                              "text-slate-700 dark:text-slate-200"
                            }`}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SUB-TAB 1: ED MANAGEMENT ────────────────────────────────────────────────
function EDManagementView() {
  const [openId, setOpenId]       = useState(null);
  const [activeTabs, setActiveTabs] = useState({});
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("All");

  const cats = ["All", ...Array.from(new Set(ED_ALGORITHMS.map(a => a.category)))];

  const filtered = ED_ALGORITHMS.filter(a => {
    const matchCat = catFilter === "All" || a.category === catFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || [a.title, a.category, ...a.diagnostic.steps.map(s => s.text + s.label), ...a.management.phases.flatMap(p => p.steps)].some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-3">
      <SearchBar value={search} onChange={setSearch} />
      <div className="flex flex-wrap gap-1.5">
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-2.5 py-1.5 rounded-md border font-mono text-[10px] uppercase tracking-widest transition-all ${catFilter === c ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`}>{c}</button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map(algo => (
          <AlgoCard key={algo.id} algo={algo}
            isOpen={openId === algo.id}
            onToggle={() => setOpenId(prev => prev === algo.id ? null : algo.id)}
            activeTab={activeTabs[algo.id]}
            onTabChange={(t) => setActiveTabs(prev => ({ ...prev, [algo.id]: t }))} />
        ))}
        {filtered.length === 0 && <div className="text-center py-10 text-slate-400 font-mono text-sm">No results for &quot;{search}&quot;</div>}
      </div>
      <p className="text-[10px] text-slate-400 font-mono text-center">Fleischer &amp; Ludwig 7e · IAP 2019–2023 · Nelson 21e · WHO · ISPAD 2022</p>
    </div>
  );
}

// ─── SUB-TAB 2: AHA ALGORITHMS ───────────────────────────────────────────────
function AHAAlgorithmsView() {
  const [activeId, setActiveId]   = useState(PALS_ALGORITHMS[0].id);
  const [showUpdates, setShowUpdates] = useState(true);
  const active = PALS_ALGORITHMS.find(a => a.id === activeId);
  const c = PALS_COLORS[active?.color] || PALS_COLORS.resuscitation;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Step-by-step pathways. Updated with <strong>2025 AHA</strong> PALS guideline changes.</p>
        <button onClick={() => setShowUpdates(s => !s)}
          className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900">
          {showUpdates ? "Hide" : "Show"} 2025 updates
        </button>
      </div>

      {showUpdates && (
        <div className="rounded-md border-2 border-red-500/40 dark:border-red-400/40 bg-red-50/60 dark:bg-red-950/30 p-4">
          <div className="flex items-center gap-2 mb-3 text-red-700 dark:text-red-300">
            <Lightning size={16} weight="fill" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">2025 AHA — Key Updates</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AHA_2025_UPDATES.map(u => {
              const Icon = ICON_MAP[u.icon] || Lightning;
              return (
                <div key={u.title} className="rounded-md bg-white dark:bg-slate-900/70 border border-red-200 dark:border-red-900 p-3">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-1">
                    <Icon size={14} weight="bold" />
                    <span className="font-mono text-[10px] uppercase tracking-widest font-bold">{u.title}</span>
                  </div>
                  <div className="font-mono font-black text-xl text-red-700 dark:text-red-300 leading-none">{u.value}</div>
                  <div className="text-xs text-slate-700 dark:text-slate-200 mt-1.5 font-medium">{u.sub}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{u.note}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CPR visual reference */}
      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3">2025 AHA · CPR cadence reference (1-minute timeline)</div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400">Compressions · 100–120/min</span>
              <span className="font-mono text-[10px] text-slate-400">depth ≥ ⅓ AP</span>
            </div>
            <svg viewBox="0 0 600 30" className="w-full h-6" preserveAspectRatio="none">
              {Array.from({ length: 110 }, (_, i) => (
                <rect key={i} x={i * (600 / 110)} y="2" width={(600 / 110) - 1} height="26" rx="1" className="fill-red-500/70 dark:fill-red-400/80" />
              ))}
            </svg>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400">Ventilation · advanced airway · 1 breath / 2–3 s (20–30/min)</span>
              <span className="font-mono text-[10px] text-slate-400">2025 AHA</span>
            </div>
            <svg viewBox="0 0 600 30" className="w-full h-6" preserveAspectRatio="none">
              {Array.from({ length: 24 }, (_, i) => (
                <rect key={i} x={i * (600 / 24)} y="2" width={(600 / 24) - 2} height="26" rx="2" className="fill-blue-500/70 dark:fill-blue-400/80" />
              ))}
            </svg>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-200">No advanced airway · 15:2 (2-rescuer)</span>
              <span className="font-mono text-[10px] text-slate-400">interruptions &lt; 10 s</span>
            </div>
            <svg viewBox="0 0 600 20" className="w-full h-5" preserveAspectRatio="none">
              {Array.from({ length: 8 }, (_, cycle) => {
                const cw = 600 / 8;
                const x0 = cycle * cw;
                return (
                  <g key={cycle}>
                    <rect x={x0 + 2} y="2" width={cw * 0.85} height="16" rx="2" className="fill-red-500/50 dark:fill-red-400/60" />
                    <rect x={x0 + cw * 0.87} y="2" width={cw * 0.11} height="16" rx="2" className="fill-blue-500/70 dark:fill-blue-400/80" />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          Chest compression fraction target <strong>&gt;80%</strong>. Pre- and post-shock pauses <strong>&lt;10 s</strong>.
          Arterial DBP target: <strong>≥25 mmHg (infant)</strong> / <strong>≥30 mmHg (child)</strong>.
        </div>
      </div>

      {/* Algorithm selector */}
      <div className="flex gap-2 flex-wrap">
        {PALS_ALGORITHMS.map(a => (
          <button key={a.id} onClick={() => setActiveId(a.id)}
            className={`px-3 py-2 rounded-md border font-mono text-[11px] uppercase tracking-widest transition-all ${activeId === a.id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"}`}>
            {a.title}
          </button>
        ))}
      </div>

      {active && (
        <div className={`rounded-md border ${c.border} p-5 bg-white dark:bg-slate-900/40`}>
          <div className={`flex items-center gap-2 ${c.accent} mb-1 flex-wrap`}>
            <div className={`h-1 w-8 rounded-full ${c.bar}`} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Algorithm</span>
            {active.badge && <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${c.chip}`}>{active.badge}</span>}
          </div>
          <h3 className="font-bold text-xl tracking-tight" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{active.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{active.subtitle}</p>
          <div className="mt-6 space-y-3">
            {active.steps.map((step, i) => (
              <div key={step.title}>
                <div className={`rounded-md border p-4 flex gap-4 ${step.type === "decision" ? `${c.chip} border-dashed` : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}>
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 w-14">
                    {step.type === "decision" ? <Diamond size={20} weight="bold" className={c.accent} /> : <CaretRight size={20} weight="bold" className={c.accent} />}
                    <span className={`font-mono text-[9px] uppercase tracking-widest ${c.accent}`}>{step.type === "decision" ? "Decide" : `Step ${i + 1}`}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-base leading-tight">{step.title}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{step.body}</div>
                  </div>
                </div>
                {i < active.steps.length - 1 && (
                  <div className="flex justify-start pl-5 py-1"><ArrowDown size={18} weight="bold" className="text-slate-400" /></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-slate-500 dark:text-slate-400 italic">2025 AHA PALS guidelines · NRP 2020 · Fleischer &amp; Ludwig · Harriet Lane 23rd ed.</p>
    </div>
  );
}

// ─── SUB-TAB 3: CLINICAL GUIDELINES ─────────────────────────────────────────
function GuidelinesView() {
  const [openCat, setOpenCat]         = useState("Emergency & Critical Care");
  const [openGuideline, setOpenGuideline] = useState(null);
  const [search, setSearch]           = useState("");

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
      <SearchBar value={search} onChange={setSearch} />
      {filtered.map(cat => {
        const c = IAP_COLOR_MAP[cat.color] || IAP_COLOR_MAP.emerald;
        const isOpen = openCat === cat.category;
        return (
          <div key={cat.category} className={`border rounded-xl overflow-hidden ${c.border}`}>
            <button onClick={() => setOpenCat(isOpen ? null : cat.category)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${c.header}`}>
              <div className="flex items-center gap-2.5">
                <span className={`text-sm font-bold ${c.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{cat.category}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${c.text} ${c.border} bg-white/60 dark:bg-black/20`}>{cat.guidelines.length}</span>
              </div>
              <CaretRight size={12} weight="bold" className={`${c.text} transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
            </button>
            {isOpen && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {cat.guidelines.map(g => {
                  const gKey = cat.category + g.title;
                  const gOpen = openGuideline === gKey;
                  return (
                    <div key={g.title} className="bg-white dark:bg-slate-900/50">
                      <button onClick={() => setOpenGuideline(gOpen ? null : gKey)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{g.title}</p>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700">{g.year}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{g.summary}</p>
                          </div>
                          <CaretRight size={11} weight="bold" className={`text-slate-400 flex-shrink-0 mt-1 transition-transform ${gOpen ? "rotate-90" : ""}`} />
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
      {filtered.length === 0 && <div className="text-center py-10 text-slate-400 font-mono text-sm">No guidelines match &quot;{search}&quot;</div>}
      <p className="text-[10px] text-slate-400 font-mono text-center">Source: Indian Academy of Pediatrics · iapindia.org · All guidelines subject to local institutional protocols</p>
    </div>
  );
}

// ─── SUB-TAB 4: INTERACTIVE PATHWAYS ─────────────────────────────────────────
function PathwayRunner({ pathway, weight, onExit }) {
  const [history, setHistory] = useState([pathway.start]);
  const currentId = history[history.length - 1];
  const node = pathway.nodes[currentId];
  const goBack  = () => history.length > 1 ? setHistory(history.slice(0, -1)) : onExit();
  const goto    = (next) => setHistory([...history, next]);
  const restart = () => setHistory([pathway.start]);

  const exportPDF = () => {
    const bundle = {
      title: `${pathway.title} · Care Plan`, source: pathway.source, weight,
      total: "—", interpretation: node.title, band: node.severity,
      findings: history.filter(id => pathway.nodes[id].kind === "question").map(id => {
        const n = pathway.nodes[id];
        const nextId = history[history.indexOf(id) + 1];
        const chosen = n.options.find(o => o.next === nextId);
        return [n.prompt, chosen?.label || ""];
      }),
      nonPharm: node.actions || [],
      drugs: (node.drugs || []).map(d => ({ name: d.name, dose: d.dose, route: d.route, note: "" })),
      additionalNotes: [node.summary, `Pathway reference: ${pathway.source}`],
    };
    exportCarePlanPDF(bundle);
    toast.success("Care plan PDF exported");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={goBack}
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft size={14} weight="bold" /> Back
        </button>
        <button onClick={restart}
          className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          Restart
        </button>
        <span className="font-mono text-[10px] text-slate-400 ml-auto">Step {history.length} · {pathway.title}</span>
      </div>

      {node?.kind === "question" ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5">
          <div className="flex items-center gap-2 mb-4 text-slate-500">
            <Diamond size={16} weight="bold" />
            <span className="font-mono text-[10px] uppercase tracking-widest">Decision</span>
          </div>
          <h3 className="font-bold text-lg leading-snug" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{node.prompt}</h3>
          <div className="mt-4 space-y-2">
            {node.options.map(opt => (
              <button key={opt.label} onClick={() => goto(opt.next)}
                className="w-full text-left rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 flex items-center justify-between gap-3 transition-colors">
                <span className="text-sm font-medium">{opt.label}</span>
                <CaretRight size={16} weight="bold" className="text-slate-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ) : node ? (
        <div className={`rounded-xl border-2 p-5 ${TONE[node.severity]}`}>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-75 mb-1">Result</div>
          <h3 className="font-bold text-xl tracking-tight" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{node.title}</h3>
          {node.summary && <p className="text-sm mt-2 leading-relaxed">{node.summary}</p>}
          {node.actions?.length > 0 && (
            <div className="mt-4">
              <div className="font-mono text-[10px] uppercase tracking-widest opacity-75 mb-2">Actions</div>
              <ul className="space-y-1.5 text-sm">
                {node.actions.map((a, i) => <li key={i} className="flex gap-2"><span className="opacity-60">•</span><span>{a}</span></li>)}
              </ul>
            </div>
          )}
          {node.drugs?.length > 0 && (
            <div className="mt-4">
              <div className="font-mono text-[10px] uppercase tracking-widest opacity-75 mb-2">Drug recommendations · for {weight} kg</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {node.drugs.map(d => (
                  <div key={d.name} className="rounded-md bg-white/70 dark:bg-black/30 border border-current/30 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-sm">{d.name}</div>
                      <div className="font-mono font-bold text-sm whitespace-nowrap">{d.dose}</div>
                    </div>
                    <div className="font-mono text-[10px] opacity-70 mt-0.5">{d.route}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={exportPDF}
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold">
              <FilePdf size={14} weight="bold" /> Download Care Plan PDF
            </button>
            <button onClick={restart}
              className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-md border border-current/40">
              Restart pathway
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InteractivePathwaysView() {
  const { weight } = useWeight();
  const [activeId, setActiveId] = useState(null);

  if (activeId) {
    const pathway = PATHWAYS.find(p => p.id === activeId);
    return <PathwayRunner pathway={pathway} weight={weight} onExit={() => setActiveId(null)} />;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Select a clinical scenario to walk through a decision-tree pathway with weight-based drug doses.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PATHWAYS.map(p => (
          <button key={p.id} onClick={() => setActiveId(p.id)}
            className="text-left rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/50 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
            <div className={`font-mono text-[10px] uppercase tracking-widest mb-1.5 ${p.category === "surgical" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>{p.category}</div>
            <div className="font-bold text-sm" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{p.title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{p.source}</div>
            <div className="mt-3 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
              <span>Start pathway</span><CaretRight size={12} weight="bold" />
            </div>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 font-mono text-center">Tintinalli · Fleischer &amp; Ludwig · Harriet Lane · IAP</p>
    </div>
  );
}

// ─── SUB-TAB 5: DIFFERENTIAL DIAGNOSIS ───────────────────────────────────────
function DifferentialView() {
  const [activeId, setActiveId] = useState(DIFFERENTIALS[0]?.id);
  const active = DIFFERENTIALS.find(d => d.id === activeId);

  if (!active) return <p className="text-slate-400 font-mono text-sm">No differentials loaded.</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">
        {DIFFERENTIALS.map(d => (
          <button key={d.id} onClick={() => setActiveId(d.id)}
            className={`px-3 py-2 rounded-md border font-mono text-[11px] uppercase tracking-widest transition-all ${activeId === d.id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"}`}>
            {d.title}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5">
        <div className="flex items-center gap-2 text-slate-500 mb-2">
          <BookOpen size={16} weight="bold" />
          <span className="font-mono text-[10px] uppercase tracking-widest">Chief complaint</span>
        </div>
        <h3 className="font-bold text-xl tracking-tight" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{active.title}</h3>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{active.source}</div>

        {active.mnemonic && (
          <div className="mt-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1">Mnemonic</div>
            <div className="font-mono font-bold text-sm">{active.mnemonic}</div>
            {active.mnemonicExpand && <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{active.mnemonicExpand}</div>}
          </div>
        )}

        <div className="mt-5 overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-widest">Diagnosis</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-widest">Typical age</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-widest">Clues</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-widest">Workup / Mgmt</th>
              </tr>
            </thead>
            <tbody>
              {active.differentials.map(d => (
                <tr key={d.dx} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40 align-top">
                  <td className="p-3 font-bold">{d.dx}</td>
                  <td className="p-3 font-mono text-xs text-slate-600 dark:text-slate-300">{d.age}</td>
                  <td className="p-3 text-xs text-slate-600 dark:text-slate-300 max-w-xs">{d.clues}</td>
                  <td className="p-3 text-xs text-slate-600 dark:text-slate-300 max-w-xs">{d.workup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {active.redFlags?.length > 0 && (
          <div className="mt-5 rounded-xl border-2 border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
              <Warning size={14} weight="fill" />
              <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Red Flags</span>
            </div>
            <ul className="space-y-1 text-sm text-red-900 dark:text-red-200">
              {active.redFlags.map(r => <li key={r} className="flex gap-2"><span className="opacity-60">•</span><span>{r}</span></li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "ed",          label: "ED Management",       Icon: FirstAid,      shortLabel: "ED Mgmt"      },
  { id: "aha",         label: "AHA Algorithms",       Icon: Heartbeat,     shortLabel: "AHA"          },
  { id: "guidelines",  label: "Clinical Guidelines",  Icon: BookOpen,      shortLabel: "Guidelines"   },
  { id: "pathways",    label: "Interactive Pathways", Icon: TreeStructure, shortLabel: "Pathways"     },
  { id: "differentials",label: "Differentials",       Icon: Stethoscope,   shortLabel: "DDx"          },
];

export default function ManagementAlgorithmsTab() {
  const [activeTab, setActiveTab] = useState("ed");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Management Algorithms
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          IAP 2019–2023 · Fleischer &amp; Ludwig 7e · Nelson 21e · AHA PALS 2025 · WHO · IDSA
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
        <Warning size={13} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>Clinical reference only. Always verify doses against current guidelines and institutional protocols before administration.</span>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-mono text-[11px] uppercase tracking-widest transition-all ${
              activeTab === t.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}>
            <t.Icon size={13} weight={activeTab === t.id ? "fill" : "regular"} />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "ed"           && <EDManagementView />}
      {activeTab === "aha"          && <AHAAlgorithmsView />}
      {activeTab === "guidelines"   && <GuidelinesView />}
      {activeTab === "pathways"     && <InteractivePathwaysView />}
      {activeTab === "differentials"&& <DifferentialView />}

      {/* Footer */}
      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        Fleischer &amp; Ludwig 7e · IAP Clinical Practice Guidelines 2019–2023 · Nelson 21e ·
        AHA PALS 2025 · WHO · IDSA 2010 · ISPAD 2022
      </div>
    </div>
  );
}
