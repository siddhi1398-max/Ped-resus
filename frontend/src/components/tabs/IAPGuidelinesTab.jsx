import { useState, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// IAP GUIDELINES DATA (Tab 1)
// ═══════════════════════════════════════════════════════════════════════════════

const IAP_GUIDELINES = [
  {
    category: "Emergency & Critical Care",
    color: "red",
    guidelines: [
      {
        title: "IAP PALS / Septic Shock Guidelines 2020",
        summary: "Norepinephrine first-line vasopressor. Early antibiotics within 1 hour. 20 mL/kg isotonic crystalloid bolus. Lactate-guided resuscitation.",
        year: "2020",
        keyPoints: ["Norepi first-line over dopamine", "Antibiotics within 1hr of recognition", "20 mL/kg NS bolus × 3 if needed", "Target MAP ≥ 65 mmHg"],
      },
      {
        title: "IAP Anaphylaxis Guidelines 2023",
        summary: "IM epinephrine 0.01 mg/kg anterolateral thigh is first and only life-saving intervention. Antihistamines and steroids are adjuncts only.",
        year: "2023",
        keyPoints: ["Epi IM 0.01 mg/kg (max 0.5mg) immediately", "Repeat every 5–15 min PRN", "Observe minimum 4–6 hours post reaction", "Antihistamines NOT first-line"],
      },
      {
        title: "IAP DKA Management Guidelines 2020",
        summary: "Fluid deficit replaced over 48 hours. Avoid rapid rehydration — cerebral edema risk. Insulin infusion after 1 hour of fluids.",
        year: "2020",
        keyPoints: ["0.9% NS for initial resuscitation", "Deficit over 48hr not 24hr", "Insulin 0.05–0.1 units/kg/hr after 1hr fluids", "Cerebral edema: mannitol 0.5–1 g/kg OR 3% NaCl 3–5 mL/kg"],
      },
    ],
  },
  {
    category: "Infectious Disease",
    color: "emerald",
    guidelines: [
      {
        title: "IAP Antimicrobial Stewardship Guidelines 2023",
        summary: "ESBL-aware empirical antibiotic selection for Indian EDs. High rates of CRKP and MRSA. Meropenem-sparing strategies strongly recommended.",
        year: "2023",
        keyPoints: ["ESBL UTI: nitrofurantoin or fosfomycin oral", "Community sepsis: pip-tazo + amikacin", "Hospital sepsis: meropenem + vancomycin (AUC-guided)", "De-escalate within 48–72h based on culture"],
      },
      {
        title: "IAP Dengue Management Guidelines 2021",
        summary: "Supportive care only. No NSAIDs, no aspirin, no empirical antibiotics. Fluid management guided by hematocrit and clinical signs.",
        year: "2021",
        keyPoints: ["Paracetamol only for fever", "Platelets transfuse only <10,000 or active bleeding", "Watch for plasma leakage in critical phase (day 3–7)", "No corticosteroids"],
      },
      {
        title: "IAP Malaria Guidelines 2022",
        summary: "Artemether-lumefantrine for uncomplicated falciparum. IV artesunate for severe disease. Primaquine for P. vivax radical cure (check G6PD).",
        year: "2022",
        keyPoints: ["AL: weight-based BD × 3 days with food", "Severe: IV artesunate 2.4 mg/kg at 0, 12, 24hr", "Vivax: primaquine 0.25 mg/kg × 14d after G6PD test", "Quinine if artesunate unavailable"],
      },
      {
        title: "IAP Community Pneumonia Guidelines 2022",
        summary: "High-dose amoxicillin for mild-moderate CAP in Indian children. Azithromycin if atypical (Mycoplasma) suspected. Hospital admission criteria clearly defined.",
        year: "2022",
        keyPoints: ["Mild-mod: amoxicillin 80–90 mg/kg/day PO", "Severe: IV ampicillin-sulbactam or ceftriaxone", "Add azithromycin if age >5 yr (atypical cover)", "O₂ if SpO₂ <92%"],
      },
      {
        title: "IAP Meningitis Guidelines 2019",
        summary: "Ceftriaxone 100 mg/kg/day IV. Dexamethasone 0.15 mg/kg q6h × 4 days — give 15–30 min before or with first antibiotic dose.",
        year: "2019",
        keyPoints: ["Ceftriaxone preferred over cefotaxime (once daily)", "Dexamethasone reduces hearing loss in H. influenzae meningitis", "Neonates: add ampicillin (Listeria) + cefotaxime not ceftriaxone", "LP before antibiotics if no signs of raised ICP"],
      },
    ],
  },
  {
    category: "Respiratory",
    color: "sky",
    guidelines: [
      {
        title: "IAP Asthma Management Guidelines 2022",
        summary: "Dexamethasone 0.6 mg/kg × 2 doses (24hr apart) equivalent to prednisolone 5-day course. MDI + spacer preferred over nebulizer for all severities.",
        year: "2022",
        keyPoints: ["Salbutamol MDI 4–8 puffs q20min × 3 (mild-mod)", "Dexamethasone 0.6 mg/kg PO/IM × 2 doses", "Magnesium sulfate 25–50 mg/kg IV for severe", "Heliox if available for near-fatal asthma"],
      },
      {
        title: "IAP Bronchiolitis Guidelines 2020",
        summary: "Supportive care only in uncomplicated viral bronchiolitis. No salbutamol, no steroids, no antibiotics, no nebulized saline routinely.",
        year: "2020",
        keyPoints: ["Oxygen if SpO₂ <92%", "High-flow nasal cannula if work of breathing high", "No salbutamol (no proven benefit)", "No corticosteroids", "No routine chest physiotherapy"],
      },
      {
        title: "IAP Croup (LTB) Guidelines 2019",
        summary: "Single dose dexamethasone 0.6 mg/kg PO effective for all grades. Nebulized epinephrine for stridor at rest. Observe ≥2 hours after epinephrine.",
        year: "2019",
        keyPoints: ["Dexamethasone 0.6 mg/kg PO single dose (max 10 mg)", "Neb epinephrine: 0.5 mL/kg of 1:1000 (max 5 mL)", "Observe 2–4 hr post-neb epinephrine for rebound", "Westley score guides severity"],
      },
    ],
  },
  {
    category: "Neurology",
    color: "violet",
    guidelines: [
      {
        title: "IAP Status Epilepticus Guidelines 2021",
        summary: "Midazolam IN/buccal/IM first-line (equal to IV lorazepam). Levetiracetam preferred second-line over phenytoin/valproate for safety profile.",
        year: "2021",
        keyPoints: ["0–5 min: midazolam IN 0.2 mg/kg or buccal 0.3 mg/kg", "5–20 min: lorazepam IV 0.1 mg/kg if access", "20–40 min: levetiracetam 40–60 mg/kg IV preferred", "40+ min: midazolam infusion or phenobarbital"],
      },
      {
        title: "IAP Febrile Seizure Guidelines 2017",
        summary: "No anticonvulsant prophylaxis recommended. Reassurance and parental education are cornerstones. Simple febrile seizures do not require neuroimaging.",
        year: "2017",
        keyPoints: ["No long-term antiepileptic drugs for simple FS", "No EEG or neuroimaging for typical simple FS", "Fever control with paracetamol/ibuprofen", "Risk of recurrence: 30% overall"],
      },
    ],
  },
  {
    category: "Neonatal",
    color: "rose",
    guidelines: [
      {
        title: "IAP NRP / Neonatal Resuscitation 2021",
        summary: "Delayed cord clamping ≥60 seconds for non-asphyxiated newborns. Thermoregulation critical. T-piece resuscitator preferred. Targeted SpO₂ in first minutes.",
        year: "2021",
        keyPoints: ["Delayed cord clamping ≥60s (unless depressed)", "Initial FiO₂: term 0.21, preterm 0.21–0.30", "HR <60 after PPV: start chest compressions", "Epinephrine 0.01–0.03 mg/kg IV/IO if no response"],
      },
      {
        title: "IAP Neonatal Sepsis Guidelines 2022",
        summary: "Ampicillin + gentamicin first-line for early-onset sepsis (EOS). Culture before antibiotics. Differentiate EOS (<72hr) vs LONS (>72hr) for antibiotic choice.",
        year: "2022",
        keyPoints: ["EOS: ampicillin + gentamicin (once-daily dosing)", "LONS: pip-tazo or cloxacillin + amikacin", "Blood culture before first dose", "Minimum 7–10 day course for confirmed sepsis"],
      },
      {
        title: "IAP Neonatal Hypoglycemia Guidelines 2020",
        summary: "Target glucose >2.6 mmol/L (47 mg/dL). D10% 2 mL/kg IV bolus for symptomatic hypoglycemia. Maintain GIR 6–8 mg/kg/min.",
        year: "2020",
        keyPoints: ["Symptomatic: D10% 2 mL/kg IV bolus", "Asymptomatic: early breastfeeding + monitor", "GIR 6–8 mg/kg/min maintenance infusion", "Recheck glucose 30 min after intervention"],
      },
    ],
  },
  {
    category: "Fluid & Electrolytes",
    color: "amber",
    guidelines: [
      {
        title: "IAP Fluid Therapy in Children 2020",
        summary: "20 mL/kg isotonic crystalloid bolus for septic shock. FEAST trial awareness — restrict bolus fluids in severe malnutrition and malaria.",
        year: "2020",
        keyPoints: ["Isotonic NS or RL for bolus", "Max 60 mL/kg in first hour then reassess", "Avoid bolus in SAM — use cautious ORS + WHO SAM protocol", "Hypertonic 3% NaCl for symptomatic hyponatremia"],
      },
      {
        title: "IAP Diarrhea & ORT Guidelines 2021",
        summary: "Oral rehydration therapy for all grades except severe dehydration with shock. Zinc supplementation 10–20 mg/day × 14 days reduces duration and recurrence.",
        year: "2021",
        keyPoints: ["Mild: ORS 50 mL/kg over 4 hr", "Moderate: ORS 100 mL/kg over 4 hr", "Severe + shock: IV NS 20 mL/kg then ORS", "Zinc: <6 mo 10 mg/day, >6 mo 20 mg/day × 14 days"],
      },
    ],
  },
  {
    category: "Growth & Development",
    color: "teal",
    guidelines: [
      {
        title: "IAP Growth Charts & Anthropometry 2015",
        summary: "IAP growth charts for Indian children recommended over WHO charts for children >5 years. Weight-for-age, height-for-age, BMI-for-age percentiles defined.",
        year: "2015",
        keyPoints: ["Use WHO charts for 0–5 years", "Use IAP charts for 5–18 years", "Underweight: weight-for-age <3rd percentile", "Obesity: BMI >95th percentile for age/sex"],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ALGORITHM DATA (Tab 2)
// ═══════════════════════════════════════════════════════════════════════════════

const ALGORITHMS = [
  // ─── EMERGENCY ────────────────────────────────────────────────────────────
  {
    id: "septic-shock", category: "Emergency", title: "Septic Shock", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.4", "IAP PALS 2020", "Nelson's 21e Ch.527"],
    diagnostic: {
      title: "Recognise Septic Shock",
      steps: [
        { label: "Suspect", text: "Fever/hypothermia + altered perfusion: tachycardia, prolonged CRT, mottling, altered mentation" },
        { label: "Warm shock", text: "Bounding pulses, flash CRT, wide pulse pressure, fever — commonest in early sepsis" },
        { label: "Cold shock", text: "Diminished pulses, CRT >3s, mottled/cool peripheries, narrow pulse pressure" },
        { label: "Labs", text: "CBC, CRP, procalcitonin, lactate, blood culture ×2 (before antibiotics), LFT, RFT, coagulation" },
        { label: "Severity", text: "Lactate >2 mmol/L = sepsis · >4 = severe · MAP <65 mmHg + vasopressors = septic shock" },
      ],
    },
    management: {
      title: "Hour-1 Bundle",
      phases: [
        { time: "0–15 min", color: "red", steps: ["IV/IO access immediately · Blood cultures before antibiotics", "Isotonic crystalloid 20 mL/kg NS/RL bolus over 5–10 min", "Reassess after each bolus (HR, CRT, BP, mentation) · Repeat up to 60 mL/kg", "Broad-spectrum antibiotics within 1 hour of recognition", "Avoid bolus fluids in SAM → WHO SAM protocol"] },
        { time: "15–60 min", color: "orange", steps: ["Fluid-refractory: norepinephrine 0.05–0.3 mcg/kg/min — first-line per IAP (NOT dopamine)", "Cold shock: add epinephrine 0.05–0.3 mcg/kg/min", "Warm shock: norepinephrine ± vasopressin 0.03–0.04 units/kg/min", "Target MAP ≥65 mmHg · ScvO₂ ≥70% · CRT <2 sec", "Hydrocortisone 2 mg/kg IV if catecholamine-resistant or adrenal insufficiency"] },
        { time: "Antibiotic Choice (India)", color: "emerald", steps: ["Community sepsis: pip-tazo 100 mg/kg/day + amikacin 15 mg/kg/day (IAP AMS 2023)", "Hospital/ICU-acquired: meropenem 60–120 mg/kg/day + vancomycin (AUC-guided)", "ESBL screen +ve: meropenem (avoid pip-tazo)", "De-escalate within 48–72h on culture results", "Fungal cover (echinocandin) if prolonged Abx / immunocompromised"] },
      ],
    },
  },
  {
    id: "anaphylaxis", category: "Emergency", title: "Anaphylaxis", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.82", "IAP 2023", "Nelson's 21e Ch.168"],
    diagnostic: {
      title: "Diagnose — ANY 1 of 3 Criteria",
      steps: [
        { label: "Criterion 1", text: "Skin/mucosal involvement (urticaria, flushing, angioedema) PLUS respiratory compromise OR hypotension" },
        { label: "Criterion 2", text: "≥2 organ systems: skin + respiratory + GI + cardiovascular — after likely allergen" },
        { label: "Criterion 3", text: "Reduced BP alone after known allergen exposure" },
        { label: "Biphasic", text: "Recurrence 1–72hr later (4–23%); observe ≥4–6hr minimum, 24hr if severe (IAP 2023)" },
        { label: "Grading", text: "1: skin only · 2: mild systemic · 3: severe systemic · 4: cardiac arrest" },
      ],
    },
    management: {
      title: "Immediate Response",
      phases: [
        { time: "Immediate — First Line ONLY", color: "red", steps: ["EPINEPHRINE IM 0.01 mg/kg (max 0.5 mg) anterolateral mid-thigh — ONLY life-saving drug", "Auto-injector: <15 kg → 0.15 mg · 15–30 kg → 0.3 mg · >30 kg → 0.5 mg", "Repeat every 5–15 min PRN — no maximum dose if haemodynamically unstable", "Lateral decubitus / supine + legs elevated · Call for help · Remove trigger"] },
        { time: "Concurrent", color: "orange", steps: ["O₂ 8–10 L/min face mask · IV/IO access", "IV fluid 20 mL/kg NS if hypotensive", "Salbutamol neb if bronchospasm persists after epi", "Refractory hypotension: epinephrine infusion 0.1–1 mcg/kg/min IV"] },
        { time: "Adjuncts — NOT First Line", color: "blue", steps: ["Diphenhydramine 1 mg/kg IV (max 50 mg) — treats skin only, delays recognition if given first", "Hydrocortisone 5 mg/kg IV or prednisolone 1–2 mg/kg PO — may reduce biphasic reaction", "Glucagon 20–30 mcg/kg IV if on beta-blockers and epi inadequate", "Discharge: auto-injector prescription + written action plan + allergy referral mandatory"] },
      ],
    },
  },
  {
    id: "dka", category: "Emergency", title: "Diabetic Ketoacidosis", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.97", "IAP 2020", "ISPAD 2022", "Nelson's 21e Ch.607"],
    diagnostic: {
      title: "Diagnose & Severity-Stratify",
      steps: [
        { label: "DKA criteria", text: "Glucose >11 mmol/L (200 mg/dL) + pH <7.3 OR bicarb <15 mEq/L + ketonuria/ketonemia" },
        { label: "Mild", text: "pH 7.2–7.3, bicarb 10–15, alert" },
        { label: "Moderate", text: "pH 7.1–7.2, bicarb 5–10, drowsy" },
        { label: "Severe", text: "pH <7.1, bicarb <5, obtunded/comatose" },
        { label: "Cerebral oedema risk", text: "Age <5yr, new-onset DM, severe DKA, Na fails to rise as glucose falls, AMS during treatment" },
        { label: "Labs", text: "VBG, BSL q1hr, U&E (corrected Na), osmolality, urine ketones, HbA1c, ECG for K+ effects" },
      ],
    },
    management: {
      title: "DKA Protocol (IAP 2020 / ISPAD 2022)",
      phases: [
        { time: "Hour 1 — Resuscitation Only", color: "red", steps: ["10–20 mL/kg 0.9% NS over 30–60 min ONLY if haemodynamically compromised", "Do NOT routinely give large boluses — increases cerebral oedema risk", "No bicarbonate (not recommended IAP/ISPAD)"] },
        { time: "Hours 1–48 — Controlled Rehydration", color: "orange", steps: ["Deficit: mild 5%, moderate 7%, severe 10% body weight", "Replace deficit OVER 48 HOURS — not 24hr (IAP strong recommendation)", "0.9% NS initially → switch to 0.45% NaCl + 5% dextrose when BSL <14 mmol/L", "Add KCl 40 mEq/L once urine output confirmed (or immediately if hypokalaemic)", "Correct Na rising <5 mEq/L per hour during rehydration"] },
        { time: "Insulin — After 1hr of Fluids", color: "blue", steps: ["Do NOT start insulin until 1 hour of IV fluids completed", "Regular insulin infusion 0.05–0.1 units/kg/hr (use 0.05 in young or severe)", "Target BSL fall: 2–5 mmol/L/hr — adjust rate accordingly", "Continue until pH >7.3, bicarb >15, anion gap normal → then SC basal-bolus", "⚠ CEREBRAL OEDEMA: mannitol 0.5–1 g/kg IV over 15 min OR 3% NaCl 3–5 mL/kg — treat at FIRST sign (headache, bradycardia, papilloedema, AMS)"] },
      ],
    },
  },
  {
    id: "cardiac-arrest", category: "Emergency", title: "Paediatric Cardiac Arrest (PALS)", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.5", "IAP PALS 2020", "Nelson's 21e Ch.526"],
    diagnostic: {
      title: "Assess & Identify Rhythm",
      steps: [
        { label: "Shockable", text: "VF / Pulseless VT — uncommon in children; think cardiac channelopathy, hypertrophic CMP, drug toxicity" },
        { label: "Non-shockable", text: "PEA / Asystole — commonest paediatric arrest rhythms (hypoxia, sepsis, airway, hypovolaemia)" },
        { label: "4Hs", text: "Hypoxia · Hypovolaemia · Hypo/hyperkalaemia (metabolic) · Hypothermia" },
        { label: "4Ts", text: "Tension pneumothorax · Tamponade · Toxins · Thrombosis (PE/coronary)" },
        { label: "Quality CPR", text: "Rate 100–120/min · Depth 1/3 AP chest · Allow full recoil · Minimise interruptions · 30:2 (1-rescuer) or 15:2 (2-rescuer paediatric)" },
      ],
    },
    management: {
      title: "PALS Algorithm",
      phases: [
        { time: "CPR — All Rhythms", color: "red", steps: ["High-quality CPR immediately — 2-thumb encircling technique preferred in infants", "Bag-mask ventilation FiO₂ 1.0 · Intubate when able without interrupting CPR", "IO access if IV not achieved within 60–90 sec — IO is first-line in arrest", "Adrenaline 0.01 mg/kg IV/IO (0.1 mL/kg of 1:10,000) every 3–5 min", "Sodium bicarb 1 mEq/kg IV only for prolonged arrest or confirmed metabolic acidosis"] },
        { time: "VF / Pulseless VT", color: "orange", steps: ["Defibrillation: 4 J/kg (monophasic or biphasic) — first shock immediately", "Resume CPR immediately after shock — do not check pulse", "Amiodarone 5 mg/kg IV/IO (max 300 mg) — after 3rd shock, then after 5th shock", "Lidocaine 1 mg/kg IV if amiodarone unavailable", "Magnesium 25–50 mg/kg IV for Torsades de Pointes or hypomagnesaemia"] },
        { time: "Post-Resuscitation", color: "blue", steps: ["Targeted temperature management 36–37.5°C (avoid hyperthermia)", "Maintain SpO₂ 94–99% — avoid hyperoxia", "Permissive hypercapnia: PaCO₂ 45–55 in PICU unless raised ICP", "Treat reversible cause identified during arrest", "12-lead ECG, echo, glucose monitoring, PICU transfer"] },
      ],
    },
  },
  {
    id: "arrhythmia", category: "Emergency", title: "Tachyarrhythmia", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.72", "IAP PALS 2020", "Nelson's 21e Ch.473"],
    diagnostic: {
      title: "Differentiate SVT vs Sinus Tachycardia vs VT",
      steps: [
        { label: "Sinus tachy", text: "HR <220 infants / <180 older · Gradual onset · P before every QRS · Variable RR · Cause identifiable (fever, pain, hypovolaemia)" },
        { label: "SVT", text: "HR >220 infants / >180 older · Abrupt onset/offset · P absent or retrograde · Fixed RR · Narrow QRS (usually)" },
        { label: "VT", text: "Wide QRS (>0.09 sec) · AV dissociation · Rate 120–300 · Fusion/capture beats diagnostic" },
        { label: "Stable vs Unstable", text: "Unstable = hypotension, AMS, poor perfusion, heart failure → CARDIOVERT. Stable = proceed stepwise." },
        { label: "WPW suspect", text: "Delta waves, short PR, broad QRS in sinus rhythm → AVOID adenosine if AF + WPW (may → VF)" },
      ],
    },
    management: {
      title: "SVT & VT Management",
      phases: [
        { time: "Stable SVT — Vagal First", color: "blue", steps: ["Infants: ice bag to face 15–30 sec (diving reflex) — most effective vagal manoeuvre", "Children: Valsalva (blow through straw/syringe) · Modified Valsalva (legs elevated after strain)", "DO NOT use ocular pressure (corneal injury risk)", "Adenosine 0.1 mg/kg rapid IV push + flush (max first dose 6 mg) · double to 0.2 mg/kg if no response (max 12 mg)"] },
        { time: "Stable SVT — Refractory", color: "orange", steps: ["Amiodarone 5 mg/kg IV over 20–60 min (preferred in structural heart disease)", "Procainamide 15 mg/kg IV over 30–60 min (avoid if long QT)", "Flecainide (only in structurally normal heart, specialist guidance)", "Verapamil: AVOID in infants <1yr — risk of cardiovascular collapse"] },
        { time: "Unstable SVT or VT", color: "red", steps: ["Synchronised DC cardioversion: 0.5–1 J/kg → escalate to 2 J/kg if no response", "Always synchronised for VT with pulse — unsynchronised (defibrillation) only for VF/pulseless VT", "Sedation/analgesia before cardioversion if haemodynamically stable enough", "For VT: amiodarone 5 mg/kg IV over 20 min preferred over lidocaine"] },
      ],
    },
  },

  // ─── RESPIRATORY ──────────────────────────────────────────────────────────
  {
    id: "asthma", category: "Respiratory", title: "Acute Asthma", tag: "COMMON",
    refs: ["Fleisher & Ludwig 7e Ch.79", "IAP 2022", "Nelson's 21e Ch.169"],
    diagnostic: {
      title: "Severity Assessment",
      steps: [
        { label: "Mild", text: "SpO₂ ≥95%, speaks sentences, mild wheeze end-expiratory, PEFR >70% predicted" },
        { label: "Moderate", text: "SpO₂ 92–95%, speaks phrases, polyphonic wheeze + recession, PEFR 40–70%" },
        { label: "Severe", text: "SpO₂ <92%, speaks words only, severe wheeze/silent chest, significant recession, PEFR <40%" },
        { label: "Life-threatening", text: "SpO₂ <90%, cyanosis, exhausted, silent chest, confusion, bradycardia, PEFR <25%" },
        { label: "⚠ Pitfall", text: "Silent chest = severe obstruction, NOT improvement. Chest wall recession with silent auscultation = impending respiratory failure." },
      ],
    },
    management: {
      title: "Stepwise Treatment",
      phases: [
        { time: "All Severities", color: "blue", steps: ["O₂ via face mask — target SpO₂ ≥94%", "Salbutamol MDI + spacer 4–8 puffs q20min × 3 — preferred over nebuliser (IAP 2022)", "Neb salbutamol: 2.5 mg (<20 kg) or 5 mg (>20 kg) q20min × 3 if MDI unavailable", "Ipratropium 0.25–0.5 mg neb with salbutamol (first 3 doses only) — moderate/severe only"] },
        { time: "Systemic Corticosteroids", color: "orange", steps: ["Prednisolone 1–2 mg/kg/day PO (max 40 mg) × 3–5 days", "OR dexamethasone 0.6 mg/kg PO/IM × 2 doses 24hr apart — equal efficacy, better adherence (IAP 2022)", "Start early — no benefit from delay"] },
        { time: "Severe / Refractory", color: "red", steps: ["IV MgSO₄ 25–50 mg/kg (max 2.5 g) over 20 min — for severe not responding to 3×SABA", "Salbutamol IV infusion 5–10 mcg/kg/min in monitored setting (ICU)", "Ketamine 1–2 mg/kg IV as induction agent if intubation needed (bronchodilator)", "Heliox 70:30 if available for near-fatal/refractory — reduces work of breathing (IAP 2022)", "❌ Avoid NIV as first-line · ❌ HFNC only in experienced centres"] },
      ],
    },
  },
  {
    id: "bronchiolitis", category: "Respiratory", title: "Bronchiolitis (RSV)", tag: "COMMON",
    refs: ["Fleisher & Ludwig 7e Ch.84", "IAP 2020", "Nelson's 21e Ch.416"],
    diagnostic: {
      title: "Diagnose Bronchiolitis",
      steps: [
        { label: "Definition", text: "First episode of viral wheeze in child <2yr — URI prodrome → wheeze, crepitations, hyperinflation" },
        { label: "Mild", text: "SpO₂ ≥95%, feeding >75% normal, mild recession, no apnoea" },
        { label: "Moderate", text: "SpO₂ 92–95%, feeding 50–75% normal, subcostal/intercostal recession" },
        { label: "Severe", text: "SpO₂ <92%, feeding <50%, significant recession, exhaustion, apnoea" },
        { label: "High-risk features", text: "Age <3 months, prematurity <35wks, congenital heart disease, chronic lung disease, immunodeficiency" },
        { label: "Investigations", text: "Viral swab RSV (cohorting only) · CXR only if diagnosis uncertain or severe/deteriorating" },
      ],
    },
    management: {
      title: "Supportive Care — Evidence-Based Only",
      phases: [
        { time: "Recommended", color: "emerald", steps: ["O₂ if SpO₂ <92% — nasal prongs preferred (less distress)", "HFNC 1–2 L/kg/min if increased WOB despite low-flow O₂ — start early in moderate-severe", "NG/OG feeds if oral intake <75% — avoid dehydration", "Head-of-bed elevation 30° · Gentle nasal suctioning before feeds", "Apnoea monitoring for high-risk infants (<3 months, premature)"] },
        { time: "NOT Recommended (IAP 2020)", color: "red", steps: ["❌ Salbutamol — no proven benefit in bronchiolitis (multiple RCTs)", "❌ Corticosteroids — not effective (Cochrane 2013)", "❌ Nebulised 3% hypertonic saline — inconsistent evidence, not routine", "❌ Antibiotics — only if confirmed secondary bacterial infection", "❌ Chest physiotherapy — no benefit (Cochrane 2016)", "❌ Nebulised adrenaline — transient effect only, not sustained; inpatient use only"] },
      ],
    },
  },
  {
    id: "croup", category: "Respiratory", title: "Croup (Viral LTB)", tag: "COMMON",
    refs: ["Fleisher & Ludwig 7e Ch.86", "IAP 2019", "Nelson's 21e Ch.416"],
    diagnostic: {
      title: "Westley Croup Score",
      steps: [
        { label: "Score ≤1", text: "Mild — barky cough, no stridor at rest, mild/no recession, normal conscious level" },
        { label: "Score 2–7", text: "Moderate — stridor at rest, visible recession, no agitation or cyanosis" },
        { label: "Score 8–11", text: "Severe — marked stridor at rest, significant recession, agitation" },
        { label: "Score ≥12", text: "Impending failure — cyanosis, decreased consciousness, exhaustion" },
        { label: "Westley items", text: "Stridor (0–2) + recession (0–3) + air entry (0–2) + cyanosis (0–4) + consciousness (0–5)" },
        { label: "Differentiate", text: "Epiglottitis: toxic, drooling, tripod, NO barking cough · Bacterial tracheitis: very toxic, high fever, does NOT improve with epi, needs intubation" },
      ],
    },
    management: {
      title: "Croup Algorithm",
      phases: [
        { time: "All Grades", color: "blue", steps: ["Dexamethasone 0.6 mg/kg PO single dose (max 10 mg) — IAP 2019 / Fleisher 7e", "IM/IV if vomiting · Budesonide neb 2 mg if PO/IM not possible", "Keep child calm on parent's lap — minimise distress, avoid unnecessary procedures", "Humidified O₂ if hypoxic — cool mist therapy has no RCT evidence but low harm"] },
        { time: "Moderate–Severe (Stridor at Rest)", color: "orange", steps: ["Neb epinephrine 0.5 mL/kg of 1:1000 undiluted (max 5 mL) — onset 10–30 min", "Observe MINIMUM 2–4 hours post-nebulisation for rebound stridor", "Repeat neb every 20–30 min PRN while preparing for definitive airway", "O₂ via face mask or prongs if SpO₂ <94%"] },
        { time: "Impending Failure", color: "red", steps: ["Senior airway clinician — call EARLY, do NOT wait for deterioration", "Intubate with tube 0.5–1 mm smaller than expected (subglottic oedema)", "Ketamine 1–2 mg/kg IV induction (preserves airway tone)", "Heliox 70:30 as bridge while preparing for intubation", "Tracheostomy kit at bedside before intubation attempt"] },
      ],
    },
  },
  {
    id: "airway-fb", category: "Respiratory", title: "Foreign Body Airway", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.30", "Nelson's 21e Ch.413"],
    diagnostic: {
      title: "Diagnose Airway Foreign Body",
      steps: [
        { label: "Classic history", text: "Sudden choking episode while eating/playing, ± witnessed · Peak age 6 months–4 years" },
        { label: "Laryngeal/tracheal", text: "Stridor, aphonia, severe distress, cyanosis — high-risk, life-threatening" },
        { label: "Bronchial", text: "Unilateral wheeze, reduced air entry, localised wheeze — right mainstem most common (vertical angle)" },
        { label: "CXR (expiratory)", text: "Air trapping / hyperinflation on affected side · Opaque FB visible if radio-opaque (10–25% only)" },
        { label: "If asymp or missed", text: "Recurrent pneumonia same lobe, refractory wheeze, persistent atelectasis → suspect chronic FB" },
        { label: "⚠ Do NOT", text: "Do NOT perform blind finger sweeps · Do NOT delay BLS if complete obstruction · Do NOT do emergency laryngoscopy without senior airway help" },
      ],
    },
    management: {
      title: "Airway FB Response",
      phases: [
        { time: "Complete Obstruction (No Air Movement)", color: "red", steps: ["<1 year: 5 back blows + 5 chest thrusts (NOT abdominal — risk of organ injury)", ">1 year: 5 back blows + 5 abdominal thrusts (Heimlich)", "Alternate until FB expelled or child unconscious", "If unconscious: start CPR — compressions may dislodge FB · Look in mouth before each breath", "Laryngoscopy + Magill forceps removal by trained clinician if visible"] },
        { time: "Partial Obstruction (Some Air Movement)", color: "orange", steps: ["Allow child to cough — natural mechanism is most effective", "Do NOT interfere — do NOT attempt back blows if child is effectively coughing", "High-flow O₂ · Sitting position preferred · Keep calm", "Monitor for deterioration → progression to complete obstruction protocol"] },
        { time: "Definitive Management", color: "blue", steps: ["Rigid bronchoscopy under GA — gold standard for retrieval (Fleisher 7e)", "Flexible bronchoscopy diagnostic but less effective for retrieval", "Pre-op: NPO, IV access, anaesthesia + ENT/thoracic surgery team", "Post-procedure: CXR, monitor for post-obstructive pulmonary oedema", "Vegetable matter (nuts, seeds): causes intense inflammation — urgent retrieval even if asymptomatic"] },
      ],
    },
  },

  // ─── NEUROLOGY ────────────────────────────────────────────────────────────
  {
    id: "status-epilepticus", category: "Neurology", title: "Status Epilepticus", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.70", "IAP 2021", "Nelson's 21e Ch.611"],
    diagnostic: {
      title: "Classify & Identify Cause",
      steps: [
        { label: "Definition", text: "Continuous seizure >5 min OR ≥2 seizures without full recovery between them" },
        { label: "Refractory SE", text: "Failed ≥2 first-line + ≥1 second-line AED — occurs in 15–25% of SE cases" },
        { label: "Immediate check", text: "BSL — treat hypoglycaemia NOW: D10% 5 mL/kg IV or glucagon IM 0.5 mg (<25 kg) / 1 mg (>25 kg)" },
        { label: "Common causes", text: "Fever/meningitis, epilepsy breakthrough, hyponatraemia, hypocalcaemia, toxin, structural" },
        { label: "Workup", text: "BSL, electrolytes, Ca, Mg, ammonia, tox screen · LP after seizure control if meningitis suspected" },
      ],
    },
    management: {
      title: "Time-Based Protocol (IAP 2021)",
      phases: [
        { time: "0–5 min — First Line", color: "blue", steps: ["ABC · O₂ · Lateral position · BSL · IV access attempt", "Midazolam intranasal 0.2 mg/kg (max 10 mg) — preferred if no IV, equal efficacy to IV lorazepam", "OR midazolam buccal 0.3 mg/kg (max 10 mg)", "OR diazepam rectal 0.5 mg/kg (max 10 mg) if IN/buccal unavailable", "IV access established: lorazepam 0.1 mg/kg IV (max 4 mg)"] },
        { time: "5–20 min — Second Line", color: "orange", steps: ["Still seizing after 2 benzo doses → escalate without delay", "Levetiracetam 40–60 mg/kg IV over 5–15 min (max 3 g) — preferred IAP 2021 (fewest SE, no respiratory depression)", "OR valproate 20–40 mg/kg IV over 5–10 min — AVOID: liver disease, metabolic disorders, females ≥10yr", "OR phenytoin 18–20 mg/kg IV over 20 min (max 1 g) — cardiac monitor mandatory, avoid extravasation", "Phenobarbitone 20 mg/kg IV over 20 min — useful in neonates"] },
        { time: "20–40 min — Refractory SE", color: "red", steps: ["PICU involvement mandatory — DO NOT DELAY TRANSFER", "Midazolam infusion: load 0.15–0.2 mg/kg IV → infusion 0.05–0.5 mg/kg/hr", "OR thiopentone 3–5 mg/kg IV bolus + 2–5 mg/kg/hr (EEG burst-suppression target)", "Ketamine 1.5 mg/kg IV bolus + infusion — NMDA antagonist useful in RSE", "❌ Propofol: AVOID in children <3yr (propofol infusion syndrome)"] },
      ],
    },
  },

  // ─── INFECTIOUS DISEASE ───────────────────────────────────────────────────
  {
    id: "meningitis", category: "Infectious Disease", title: "Bacterial Meningitis", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.92", "IAP 2019", "Nelson's 21e Ch.616"],
    diagnostic: {
      title: "Diagnose & Risk-Stratify",
      steps: [
        { label: "Classic triad", text: "Fever + neck stiffness + altered mentation — only 44% have all 3; absent in infants" },
        { label: "Infants", text: "Bulging fontanelle, paradoxical irritability, poor feeding, high-pitched cry — neck stiffness unreliable <18 months" },
        { label: "LP contraindications", text: "Papilloedema · Focal neurological deficit · Seizure within 30 min · Haemodynamically unstable · Signs of herniation" },
        { label: "CSF — Bacterial", text: "WBC >1000 (PMN), glucose <2.2 mmol/L (CSF:serum <0.4), protein >1 g/L" },
        { label: "CSF — Viral", text: "WBC 10–500 (lymphocytic), glucose normal, protein mildly elevated" },
        { label: "Antibiotics before LP?", text: "If LP delayed/contraindicated: blood cultures × 2 → antibiotics within 30 min → LP within 4–6hrs" },
      ],
    },
    management: {
      title: "Antibiotic + Steroid Protocol",
      phases: [
        { time: "Immediate Antibiotics", color: "red", steps: ["Ceftriaxone 100 mg/kg/day IV ÷ 12-hourly (max 4 g/dose) — IAP 2019", "Neonates <1 month: cefotaxime + ampicillin (Listeria cover) — NOT ceftriaxone in neonates", "Add vancomycin 60 mg/kg/day if MRSA or penicillin-resistant pneumococcus suspected", "Aciclovir 15–20 mg/kg IV if HSV encephalitis possible (temporal lobe involvement, neonates)"] },
        { time: "Dexamethasone (Critical Timing)", color: "blue", steps: ["0.15 mg/kg IV q6h × 4 days — proven to reduce hearing loss in H. influenzae b meningitis", "Give 15–30 min BEFORE or WITH first antibiotic dose — NOT after (Fleisher 7e)", "Benefit weaker for pneumococcal; not recommended for neonatal meningitis"] },
        { time: "Duration & Monitoring", color: "orange", steps: ["Pneumococcal: 10–14 days · Meningococcal: 5–7 days · H. influenzae: 7–10 days", "Raised ICP: mannitol 0.5 g/kg IV + fluid restriction to 60–80% maintenance", "Audiological assessment at discharge — SNHL 10–30%", "Chemoprophylaxis: rifampicin for H. influenzae and meningococcal household contacts"] },
      ],
    },
  },
  {
    id: "dengue", category: "Infectious Disease", title: "Dengue (WHO Classification)", tag: "COMMON",
    refs: ["Fleisher & Ludwig 7e Ch.102", "IAP 2021", "Nelson's 21e Ch.302", "WHO 2012"],
    diagnostic: {
      title: "WHO Dengue Phase Classification",
      steps: [
        { label: "Febrile (D1–3)", text: "High fever, myalgia, rash — differentiate from other febrile illnesses; NS1 Ag positive" },
        { label: "Critical (D3–7)", text: "Fever defervesces — HIGH RISK: plasma leakage, haemoconcentration, effusions, DSS" },
        { label: "No warning signs", text: "Fever + ≥2 of: nausea/vomiting, rash, aches, +ve tourniquet test, leukopenia" },
        { label: "Warning signs", text: "Abdominal pain, persistent vomiting, clinical fluid accumulation, mucosal bleeding, lethargy, liver >2 cm, HCT rise + rapid platelet fall" },
        { label: "Severe dengue", text: "Severe plasma leakage/shock (DSS) OR severe bleeding OR severe organ dysfunction (liver, CNS, kidney, heart)" },
        { label: "Lab triggers", text: "HCT rise ≥20% = leakage · Plt <20,000 = transfuse only if bleeding · IgM positive from day 5" },
      ],
    },
    management: {
      title: "Group-Based Fluid Management",
      phases: [
        { time: "Group A — Outpatient", color: "emerald", steps: ["No warning signs, tolerating orals, adequate urine output", "Paracetamol 15 mg/kg q4–6h (max 4 doses/24hr) — ❌ No NSAIDs, aspirin, ibuprofen", "Oral fluids 3–5 L/m²/day · Daily review during critical phase (D3–7)", "Written instructions: return immediately if warning signs develop"] },
        { time: "Group B — Hospital", color: "orange", steps: ["Warning signs OR co-morbidities OR unable to tolerate oral", "IV NS/RL 5–7 mL/kg/hr × 2–4hr → reduce stepwise: 5 → 3 → 2.5 → 1.5 mL/kg/hr", "Monitor HCT 4–6 hourly · Urine output ≥0.5 mL/kg/hr target", "HCT rises despite fluids → increase rate · HCT falls + haemodynamic instability → suspect bleeding"] },
        { time: "Group C — Severe/Shock", color: "red", steps: ["IV NS/RL 10–20 mL/kg over 15–30 min → reassess → repeat PRN", "Colloid (dextran 40 or starch) if haemodynamic instability persists after 2 crystalloid boluses", "Plt transfuse ONLY if <10,000 OR clinically significant active bleeding", "❌ No corticosteroids · ❌ No prophylactic platelet transfusions", "Watch for fluid overload in recovery phase — dengue shock → pulmonary oedema if over-resuscitated"] },
      ],
    },
  },
  {
    id: "malaria", category: "Infectious Disease", title: "Malaria (Paediatric)", tag: "COMMON",
    refs: ["Fleisher & Ludwig 7e Ch.101", "IAP 2022", "Nelson's 21e Ch.304", "WHO 2015"],
    diagnostic: {
      title: "Diagnose & Classify",
      steps: [
        { label: "Diagnosis", text: "Thick and thin film (gold standard) OR RDT (HRP-2 for P. falciparum, pLDH for all species)" },
        { label: "Species", text: "P. falciparum — severe disease, cerebral malaria · P. vivax — relapse, thrombocytopaenia · P. knowlesi — rapid parasite doubling" },
        { label: "Uncomplicated", text: "Fever + parasitaemia, no severity features, can tolerate oral medications" },
        { label: "Severe falciparum", text: "ANY of: impaired consciousness, seizures ≥2, severe anaemia Hb <5, respiratory distress, hypoglycaemia <2.2 mmol/L, SBP <70, haemoglobinuria, jaundice, hyperparasitaemia >5%" },
        { label: "Cerebral malaria", text: "Unarousable coma + P. falciparum + no other cause — mortality 15–20% even with treatment" },
        { label: "Labs", text: "Blood film, RDT, FBC, glucose (check q1hr), RFT, LFT, lactate, blood group + hold" },
      ],
    },
    management: {
      title: "Treatment by Severity",
      phases: [
        { time: "Uncomplicated Falciparum", color: "emerald", steps: ["Artemether-lumefantrine (AL) weight-based — take with fatty food (maximises absorption)", "AL dosing: 5–14 kg: 1 tab · 15–24 kg: 2 tab · 25–34 kg: 3 tab · >34 kg: 4 tab — BD × 3 days", "Primaquine single dose (0.25 mg/kg) after AL for transmission blocking (check G6PD)", "Do NOT use chloroquine for falciparum (widespread resistance India)"] },
        { time: "Uncomplicated Vivax", color: "blue", steps: ["Chloroquine 25 mg/kg total over 3 days (10 + 10 + 5 mg/kg) — vivax mostly sensitive", "Radical cure: primaquine 0.25 mg/kg × 14 days — MUST check G6PD first", "G6PD deficient: primaquine 0.75 mg/kg weekly × 8 weeks (supervised)", "Follow-up blood film at day 28 to confirm clearance"] },
        { time: "Severe Malaria — IV", color: "red", steps: ["IV artesunate 2.4 mg/kg at 0, 12, 24hr then daily — IAP 2022 / WHO first-line", "If artesunate unavailable: IV quinine 20 mg/kg loading then 10 mg/kg q8h (+ cardiac monitoring)", "IV dextrose 5–10% for hypoglycaemia — check glucose every hour", "Antipyretic + tepid sponging for fever", "Cerebral malaria: DO NOT use steroids (increases mortality — Lancet RCT)", "Exchange transfusion if parasitaemia >10% + deteriorating — specialist decision"] },
      ],
    },
  },
  {
    id: "febrile-neutropenia", category: "Infectious Disease", title: "Febrile Neutropenia", tag: "CRITICAL",
    refs: ["Fleisher & Ludwig 7e Ch.95", "Nelson's 21e Ch.535", "IDSA 2010"],
    diagnostic: {
      title: "Define & Risk-Stratify",
      steps: [
        { label: "Definition", text: "Temp ≥38.3°C single OR ≥38.0°C for ≥1hr + ANC <500/μL OR expected to fall to <500 in 48hr" },
        { label: "Low risk", text: "ANC >100, solid tumour, expected short neutropenia <7 days, clinically well, no comorbidities, fever <39°C, no IVAD infection → consider outpatient (specialist decision)" },
        { label: "High risk", text: "Haematological malignancy, AML, allogeneic HSCT, prolonged neutropenia >7 days, ANC <100, unstable, mucositis, uncontrolled tumour → ADMIT + IV antibiotics" },
        { label: "Cultures", text: "Blood cultures × 2 (peripheral + CVAD lumen if present) + urine + throat swab + any focal site" },
        { label: "Investigations", text: "FBC, CRP, PCT, RFT, LFT, CXR + CT chest (if respiratory symptoms — PCP/aspergillus)" },
      ],
    },
    management: {
      title: "Empirical Antibiotic Protocol",
      phases: [
        { time: "Low Risk (Outpatient)", color: "emerald", steps: ["Amoxicillin-clavulanate + ciprofloxacin PO — if reliable family, daily review assured", "Restart IV if fever persists >48hr or clinical deterioration", "Specialist/oncology guidance mandatory before outpatient treatment"] },
        { time: "High Risk — IV Monotherapy", color: "orange", steps: ["Pip-tazo 300–400 mg/kg/day ÷ 6-hourly — preferred in India (local sensitivity patterns)", "OR cefepime 150 mg/kg/day ÷ 8-hourly", "Meropenem 60–120 mg/kg/day if ESBL risk, haemodynamic instability, prior resistant organism", "Add vancomycin ONLY if: CVAD infection likely, skin/soft tissue infection, MRSA risk, haemodynamic instability"] },
        { time: "Persistent Fever >72–96hr", color: "red", steps: ["Reassess — consider resistant organism, fungal infection, occult focus", "Add antifungal: micafungin 2 mg/kg IV daily (echinocandin preferred, less nephrotoxic)", "CT chest for pulmonary aspergillosis if respiratory symptoms or prolonged neutropenia", "G-CSF consideration in haemodynamically unstable — oncology decision", "Reassess antibiotics based on culture results — de-escalate when safe"] },
      ],
    },
  },

  // ─── NEONATAL ─────────────────────────────────────────────────────────────
  {
    id: "neonatal-resus", category: "Neonatal", title: "Neonatal Resuscitation (NRP)", tag: "CRITICAL",
    refs: ["IAP NRP 2021", "Nelson's 21e Ch.117", "Fleisher & Ludwig 7e Ch.28"],
    diagnostic: {
      title: "Initial Assessment — First 30 Seconds",
      steps: [
        { label: "Assess immediately", text: "Term? Breathing/crying? Good tone? → YES all → routine care + delayed cord clamping ≥60 sec" },
        { label: "If NO to any", text: "Cord clamp → warm + dry + stimulate → clear airway if secretions visible" },
        { label: "After 30 sec", text: "Reassess: respiratory effort + HR (ausculatation or ECG monitor preferred — more accurate than pulse ox)" },
        { label: "SpO₂ targets", text: "1min: 60–65% · 2min: 65–70% · 3min: 70–75% · 5min: 80–85% · 10min: 85–95%" },
        { label: "Initial FiO₂", text: "Term: 0.21 (room air) · Preterm <35wks: 0.21–0.30 · Titrate by SpO₂ target" },
      ],
    },
    management: {
      title: "NRP Steps — IAP 2021",
      phases: [
        { time: "HR <100 or Apnoea", color: "orange", steps: ["PPV: peak pressure 20–25 cmH₂O (30 cmH₂O if no chest rise), PEEP 5 cmH₂O", "Rate 40–60 breaths/min · T-piece resuscitator preferred over bag-valve (IAP NRP 2021)", "Reassess HR after 30 sec effective PPV — 'MR SOPA' if chest not rising: M=mask, R=reposition, S=suction, O=open mouth, P=pressure↑, A=airway adjunct", "HR >60 and rising → continue PPV, wean O₂ by SpO₂"] },
        { time: "HR <60 — Compressions + Ventilation", color: "red", steps: ["2-thumb encircling technique — preferred (higher BP than 2-finger)", "Ratio: 3:1 (compressions:breaths) = 90 comp + 30 breaths per minute", "Depth: 1/3 AP diameter of chest · Allow full recoil · Minimise interruptions", "Increase FiO₂ to 1.0 · Intubate for effective PPV during chest compressions", "Reassess HR every 60 sec"] },
        { time: "HR <60 After CPR ≥30 sec", color: "red", steps: ["Adrenaline IV/IO: 0.01–0.03 mg/kg (0.1–0.3 mL/kg of 1:10,000) — IV/IO preferred", "ETT adrenaline: 0.05–0.1 mg/kg (higher dose needed — less reliable)", "Repeat every 3–5 min if no response", "NS 10 mL/kg IV/IO if hypovolaemia suspected (pale, not responding to epi)", "Cooling (33–34°C × 72hr) if ≥36wks + HIE features — refer NICU, do NOT cool in delivery room without cooling device"] },
      ],
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const IAP_COLOR_MAP = {
  red:     { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     dot: "bg-red-500",     header: "bg-red-50"     },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", header: "bg-emerald-50" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     dot: "bg-sky-500",     header: "bg-sky-50"     },
  violet:  { bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700",  dot: "bg-violet-500",  header: "bg-violet-50"  },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    dot: "bg-rose-500",    header: "bg-rose-50"    },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   dot: "bg-amber-500",   header: "bg-amber-50"   },
  teal:    { bg: "bg-teal-50",    border: "border-teal-200",    text: "text-teal-700",    dot: "bg-teal-500",    header: "bg-teal-50"    },
};

const ALGO_CATEGORIES = ["All", "Emergency", "Respiratory", "Neurology", "Infectious Disease", "Neonatal"];

const CAT_DOT = {
  Emergency:           "#f87171",
  Respiratory:         "#38bdf8",
  Neurology:           "#a78bfa",
  "Infectious Disease":"#34d399",
  Neonatal:            "#fb7185",
};

const PHASE_THEME = {
  red:     { border: "#ef4444", bg: "rgba(239,68,68,0.05)",   label: { bg: "rgba(239,68,68,0.15)",   color: "#fca5a5", border: "rgba(239,68,68,0.35)"   } },
  orange:  { border: "#f59e0b", bg: "rgba(245,158,11,0.05)",  label: { bg: "rgba(245,158,11,0.15)",  color: "#fcd34d", border: "rgba(245,158,11,0.35)"  } },
  blue:    { border: "#3b82f6", bg: "rgba(59,130,246,0.05)",  label: { bg: "rgba(59,130,246,0.15)",  color: "#93c5fd", border: "rgba(59,130,246,0.35)"  } },
  emerald: { border: "#10b981", bg: "rgba(16,185,129,0.05)",  label: { bg: "rgba(16,185,129,0.15)",  color: "#6ee7b7", border: "rgba(16,185,129,0.35)"  } },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — IAP GUIDELINES
// ═══════════════════════════════════════════════════════════════════════════════

function IAPGuidelinesTab() {
  const [openCategory, setOpenCategory] = useState("Emergency & Critical Care");
  const [openGuideline, setOpenGuideline] = useState(null);
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
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">⌕</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search guidelines, drugs, conditions..."
          className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
        )}
      </div>

      <div className="space-y-2">
        {filtered.map((cat) => {
          const c = IAP_COLOR_MAP[cat.color] || IAP_COLOR_MAP.emerald;
          const isOpen = openCategory === cat.category;
          return (
            <div key={cat.category} className={`border rounded-xl overflow-hidden ${c.border}`}>
              <button
                onClick={() => setOpenCategory(isOpen ? null : cat.category)}
                className={`w-full flex items-center justify-between px-4 py-3 ${c.header} transition-colors`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                  <span className={`text-sm font-bold ${c.text}`}>{cat.category}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${c.text} ${c.border} bg-white/60`}>
                    {cat.guidelines.length}
                  </span>
                </div>
                <span className={`text-xs ${c.text} transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}>▶</span>
              </button>

              {isOpen && (
                <div className="divide-y divide-slate-100">
                  {cat.guidelines.map((g) => {
                    const gKey = cat.category + g.title;
                    const gOpen = openGuideline === gKey;
                    return (
                      <div key={g.title} className="bg-white">
                        <button
                          onClick={() => setOpenGuideline(gOpen ? null : gKey)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="text-sm font-semibold text-slate-900 leading-snug">{g.title}</p>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 flex-shrink-0">{g.year}</span>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">{g.summary}</p>
                            </div>
                            <span className={`text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 text-xs ${gOpen ? "rotate-90" : ""}`}>▶</span>
                          </div>
                        </button>
                        {gOpen && (
                          <div className={`px-4 pb-4 pt-1 ${c.bg}`}>
                            <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2">Key clinical points</p>
                            <div className="space-y-1.5">
                              {g.keyPoints.map((kp, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className={`w-4 h-4 rounded-full ${c.dot} text-white text-[8px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5`}>{i + 1}</span>
                                  <span className="text-xs text-slate-700 leading-snug">{kp}</span>
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
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400 font-mono text-sm">No guidelines match "{search}"</div>
      )}

      <div className="mt-5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-400 font-mono text-center leading-relaxed">
        Source: Indian Academy of Pediatrics · iapindia.org<br />
        All guidelines subject to local institutional protocols · Last reviewed 2024<br />
        ⚠️ Clinical reference only — always verify before administration
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — ED ALGORITHMS
// ═══════════════════════════════════════════════════════════════════════════════

function AlgorithmsTab() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [activeTab, setActiveTab] = useState({});

  const filtered = ALGORITHMS.filter(a => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || [a.title, a.category,
      ...a.diagnostic.steps.map(s => s.text + s.label),
      ...a.management.phases.flatMap(p => p.steps),
    ].some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const getTab = (id) => activeTab[id] || "diag";
  const setTab = (id, tab) => setActiveTab(prev => ({ ...prev, [id]: tab }));
  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  const mono = { fontFamily: '"IBM Plex Mono", "Fira Code", monospace' };

  return (
    <div>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}>⌕</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search condition, drug, dose, symptom..."
          style={{
            width: "100%", boxSizing: "border-box",
            background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8,
            padding: "9px 32px 9px 32px", fontSize: 12, color: "#1e293b",
            outline: "none", ...mono,
          }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>✕</button>
        )}
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
        {ALGO_CATEGORIES.map(cat => {
          const isActive = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              fontSize: 9, letterSpacing: "0.08em", fontWeight: 700,
              padding: "3px 9px", borderRadius: 4,
              border: `1px solid ${isActive ? "#64748b" : "#e2e8f0"}`,
              background: isActive ? "#1e293b" : "#f8fafc",
              color: isActive ? "#f1f5f9" : "#94a3b8",
              cursor: "pointer", ...mono, transition: "all 0.15s",
            }}>
              {cat.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Algorithm list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(algo => {
          const isOpen = openId === algo.id;
          const tab = getTab(algo.id);
          const dotColor = CAT_DOT[algo.category] || "#94a3b8";

          return (
            <div key={algo.id} style={{
              background: "#fff", border: `1px solid ${isOpen ? "#cbd5e1" : "#e2e8f0"}`,
              borderRadius: 8, overflow: "hidden",
            }}>
              {/* Row */}
              <button onClick={() => toggle(algo.id)} style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: 10,
                padding: "11px 14px", background: isOpen ? "#f8fafc" : "#fff",
                border: "none", cursor: "pointer", textAlign: "left", ...mono,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, minWidth: 0 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, backgroundColor: dotColor }} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>{algo.title}</span>
                      <span style={{
                        fontSize: 8, letterSpacing: "0.1em", fontWeight: 700, padding: "2px 5px", borderRadius: 3,
                        border: "1px solid", background: algo.tag === "CRITICAL" ? "rgba(239,68,68,0.1)" : "rgba(14,165,233,0.1)",
                        color: algo.tag === "CRITICAL" ? "#dc2626" : "#0284c7",
                        borderColor: algo.tag === "CRITICAL" ? "rgba(239,68,68,0.3)" : "rgba(14,165,233,0.3)",
                      }}>{algo.tag}</span>
                    </div>
                    <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{algo.refs.join(" · ")}</div>
                  </div>
                </div>
                <span style={{ color: "#94a3b8", fontSize: 9, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>▶</span>
              </button>

              {/* Expanded */}
              {isOpen && (
                <div style={{ borderTop: "1px solid #e2e8f0" }}>
                  {/* Tabs */}
                  <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
                    {[["diag", "🔍 Diagnostic"], ["mgmt", "💊 Management"]].map(([key, label]) => (
                      <button key={key} onClick={() => setTab(algo.id, key)} style={{
                        flex: 1, padding: "8px 0", fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.08em", border: "none", cursor: "pointer", ...mono,
                        background: tab === key ? "#f1f5f9" : "#fff",
                        color: tab === key ? "#1e293b" : "#94a3b8",
                        borderBottom: tab === key ? "2px solid #3b82f6" : "2px solid transparent",
                      }}>
                        {label.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div style={{ padding: "14px" }}>
                    {/* DIAGNOSTIC */}
                    {tab === "diag" && (
                      <div>
                        <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#94a3b8", marginBottom: 8, fontWeight: 700, ...mono }}>
                          ▸ {algo.diagnostic.title.toUpperCase()}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {algo.diagnostic.steps.map((step, i) => (
                            <div key={i} style={{
                              display: "flex", gap: 9, padding: "7px 10px",
                              background: "#f8fafc", borderRadius: 5, border: "1px solid #e2e8f0",
                            }}>
                              <span style={{
                                fontSize: 8, fontWeight: 700, color: "#3b82f6",
                                minWidth: 85, flexShrink: 0, letterSpacing: "0.04em",
                                paddingTop: 1, ...mono,
                              }}>{step.label.toUpperCase()}</span>
                              <span style={{ fontSize: 11, color: "#334155", lineHeight: 1.55, ...mono }}>{step.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MANAGEMENT */}
                    {tab === "mgmt" && (
                      <div>
                        <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#94a3b8", marginBottom: 10, fontWeight: 700, ...mono }}>
                          ▸ {algo.management.title.toUpperCase()}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {algo.management.phases.map((phase, pi) => {
                            const pc = PHASE_THEME[phase.color] || PHASE_THEME.blue;
                            return (
                              <div key={pi} style={{
                                borderLeft: `3px solid ${pc.border}`,
                                background: pc.bg, borderRadius: "0 5px 5px 0", padding: "9px 12px",
                              }}>
                                <div style={{ marginBottom: 7 }}>
                                  <span style={{
                                    fontSize: 8, fontWeight: 700, letterSpacing: "0.1em",
                                    padding: "2px 7px", borderRadius: 3,
                                    background: pc.label.bg, color: pc.label.color,
                                    border: `1px solid ${pc.label.border}`, ...mono,
                                  }}>{phase.time.toUpperCase()}</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                  {phase.steps.map((step, si) => (
                                    <div key={si} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                      <span style={{
                                        width: 14, height: 14, borderRadius: "50%",
                                        background: pc.label.bg, border: `1px solid ${pc.label.border}`,
                                        color: pc.label.color, fontSize: 7, fontWeight: 800,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0, marginTop: 2,
                                      }}>{si + 1}</span>
                                      <span style={{
                                        fontSize: 11, lineHeight: 1.6, ...mono,
                                        color: step.startsWith("❌") ? "#dc2626" : "#334155",
                                        fontWeight: step.startsWith("⚠") ? 600 : 400,
                                      }}>{step}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px 0", color: "#94a3b8", fontSize: 12, fontFamily: "monospace" }}>
          No algorithms match "{search}"
        </div>
      )}

      <div style={{
        marginTop: 18, padding: "10px 14px",
        background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6,
        fontSize: 9, color: "#94a3b8", lineHeight: 1.8, textAlign: "center",
        fontFamily: '"IBM Plex Mono", monospace',
      }}>
        Fleischer & Ludwig — Textbook of Pediatric Emergency Medicine 7e ·
        IAP Clinical Practice Guidelines 2019–2023 ·
        Nelson's Textbook of Pediatrics 21e · WHO Guidelines · IDSA 2010<br />
        ⚠ Clinical reference only · Verify all doses before administration · Follow local protocols
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function PedED() {
  const [activeTab, setActiveTab] = useState("guidelines");

  const tabs = [
    { id: "guidelines", label: "IAP Guidelines", icon: "📋" },
    { id: "algorithms", label: "ED Algorithms", icon: "⚡" },
  ];

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* ── HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: "18px 20px 0",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                <span style={{
                  fontSize: 8, letterSpacing: "0.18em", fontWeight: 800,
                  background: "rgba(239,68,68,0.15)", color: "#fca5a5",
                  border: "1px solid rgba(239,68,68,0.35)", padding: "2px 7px", borderRadius: 3,
                }}>PEDS ED</span>
                <span style={{ fontSize: 8, color: "#475569", letterSpacing: "0.12em", fontFamily: "monospace" }}>QUICK REFERENCE</span>
              </div>
              <h1 style={{
                fontSize: 18, fontWeight: 800, color: "#f1f5f9",
                letterSpacing: "-0.025em", margin: 0,
                fontFamily: '"IBM Plex Mono", monospace',
              }}>Paediatric Emergency Compendium</h1>
              <p style={{ fontSize: 9, color: "#475569", margin: "3px 0 0", letterSpacing: "0.05em", fontFamily: "monospace" }}>
                Fleischer & Ludwig 7e · IAP 2019–2023 · Nelson's 21e · WHO · IDSA
              </p>
            </div>
            <div style={{
              fontSize: 8, color: "#f87171",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 4, padding: "5px 9px", lineHeight: 1.7,
              textAlign: "right", fontFamily: "monospace", flexShrink: 0,
            }}>
              ⚠ Reference only<br />Verify all doses<br />Check local Rx
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 0 }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: "10px 0", fontSize: 11, fontWeight: 700,
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                  fontFamily: '"IBM Plex Mono", monospace',
                  background: activeTab === tab.id ? "#f1f5f9" : "transparent",
                  color: activeTab === tab.id ? "#0f172a" : "#64748b",
                  borderRadius: activeTab === tab.id ? "8px 8px 0 0" : "0",
                  borderBottom: activeTab === tab.id ? "none" : "1px solid #1e293b",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 40px" }}>
        {activeTab === "guidelines" ? <IAPGuidelinesTab /> : <AlgorithmsTab />}
      </div>
    </div>
  );
}
