// src/data/fluids.js
// References: IAP 2016, IMNCI, WHO ORS guidelines, Nelson 21st ed,
// Fleischer & Ludwig 7th ed, PALS 2020, Harriet Lane 22nd ed,
// Holliday-Segar, PASNA peri-op guidelines, ARDSnet

// ─── BASIC MAINTENANCE ────────────────────────────────────────────────────────
export function maintenanceFluid(weight) {
  // 4-2-1 rule (mL/hr)
  if (weight <= 10) return weight * 4;
  if (weight <= 20) return 40 + (weight - 10) * 2;
  return 60 + (weight - 20);
}

export function maintenanceDaily(weight) {
  // Holliday-Segar (mL/day)
  if (weight <= 10) return weight * 100;
  if (weight <= 20) return 1000 + (weight - 10) * 50;
  return 1500 + (weight - 20) * 20;
}

// ─── BURNS — MODIFIED PARKLAND ────────────────────────────────────────────────
export function parklandBurns(weight, percentBSA) {
  // 3 mL/kg/%BSA (modified paediatric) — half in first 8 hr from time of burn
  const total = 3 * weight * percentBSA;
  return { total24: total, first8: total / 2, next16: total / 2 };
}

// ─── DKA ─────────────────────────────────────────────────────────────────────
export const DKA_PROTOCOL = [
  { title: "Initial resuscitation", body: "10 mL/kg 0.9% NaCl over 30–60 min if shocked. Avoid rapid boluses — risk of cerebral oedema. Maximum 20–30 mL/kg before reassessment." },
  { title: "Severity assessment", body: "Mild: pH 7.20–7.29 or HCO₃ 10–14 mmol/L. Moderate: pH 7.10–7.19 or HCO₃ 5–9 mmol/L. Severe: pH < 7.10 or HCO₃ < 5 mmol/L." },
  { title: "Rehydration", body: "Estimate deficit: 5% (mild), 7% (moderate), 10% (severe). Replace over 48 hours using 0.9% NaCl. Total = maintenance + deficit − resuscitation already given." },
  { title: "Insulin", body: "Start 0.05–0.1 units/kg/hr IV infusion ≥ 1 hour AFTER fluids started. Do NOT give insulin bolus. Target glucose fall of 2–5 mmol/L/hr." },
  { title: "Potassium", body: "Add 40 mmol/L KCl once K⁺ < 5.5 mmol/L and urine output confirmed. Target K⁺ 4–5 mmol/L. If K⁺ < 3: add 60 mmol/L, pause insulin until K⁺ > 3.5." },
  { title: "Glucose management", body: "When BG falls to 14–17 mmol/L (250–300 mg/dL), add 5–10% dextrose to the infusion. Maintain BG 8–12 mmol/L. Continue insulin until acidosis resolves (pH > 7.30, HCO₃ > 15)." },
  { title: "Monitoring", body: "Hourly: HR, BP, RR, GCS, glucose, fluid balance, IV site. 2-hourly: electrolytes, blood gas, osmolality. Strict fluid balance chart." },
  { title: "Cerebral oedema — RED FLAGS", body: "Headache, slowing HR, rising BP, falling SpO₂, behavioural change, focal neurology. TREAT IMMEDIATELY: 3% NaCl 2.5–5 mL/kg IV over 15 min OR Mannitol 0.5–1 g/kg IV over 15 min. Elevate HOB 30°. Restrict fluids. Urgent PICU." },
];

// ─── FLUID TYPES ──────────────────────────────────────────────────────────────
export const FLUID_TYPES = [
  { name: "0.9% NaCl (Normal Saline)",    na: "154", cl: "154", use: "Resuscitation, DKA, hypernatraemia correction" },
  { name: "Ringer's Lactate (Hartmann's)",na: "131", cl: "111", use: "Resuscitation, surgical, burns" },
  { name: "Plasma-Lyte 148",              na: "140", cl: "98",  use: "Balanced crystalloid, less hyperchloraemic acidosis" },
  { name: "5% Dextrose",                  na: "0",   cl: "0",   use: "Hypoglycaemia top-up only — not resuscitation" },
  { name: "10% Dextrose",                 na: "0",   cl: "0",   use: "Neonatal hypoglycaemia: 2 mL/kg IV push" },
  { name: "3% Hypertonic Saline",         na: "513", cl: "513", use: "Raised ICP, DKA cerebral oedema, severe symptomatic hyponatraemia" },
  { name: "0.45% NaCl + 5% Dex",          na: "77",  cl: "77",  use: "DKA when BG < 14 mmol/L (add to avoid hypoglycaemia)" },
];

// ─── PERI-OP EBV ──────────────────────────────────────────────────────────────
export const EBV_TABLE = [
  { group: "Premature infant",   mlPerKg: 100 },
  { group: "Full-term neonate",  mlPerKg: 90  },
  { group: "Infant 3 mo – 1 yr", mlPerKg: 80  },
  { group: "Child > 1 yr",       mlPerKg: 75  },
  { group: "Adolescent / adult", mlPerKg: 70  },
];

export function ebvPerKgForWeight(w) {
  if (w <= 2)  return 100;
  if (w <= 4)  return 90;
  if (w <= 10) return 80;
  if (w <= 40) return 75;
  return 70;
}
export function estimatedBloodVolume(w) { return w * ebvPerKgForWeight(w); }
export function allowableBloodLoss(w, hgbStart, hgbMin) {
  const ebv = estimatedBloodVolume(w);
  const avg = (hgbStart + hgbMin) / 2;
  if (!avg) return 0;
  return Math.max(0, ebv * (hgbStart - hgbMin) / avg);
}
export function npoDeficit(w, hours) {
  const hr = maintenanceFluid(w);
  return hr * hours;
}

export const TRANSFUSION_NOTES = [
  { label: "pRBC trigger (stable child)",         value: "Hb < 7 g/dL" },
  { label: "pRBC trigger (cardiac / critically ill)", value: "Hb < 8–9 g/dL" },
  { label: "Volume (pRBC)",                       value: "10–15 mL/kg over 2–4 h" },
  { label: "Platelets",                           value: "10 mL/kg; trigger < 10 (stable) or < 50 with bleeding" },
  { label: "FFP",                                 value: "10–15 mL/kg for active bleeding / coagulopathy" },
  { label: "Cryoprecipitate",                     value: "5–10 mL/kg for fibrinogen < 1 g/L" },
  { label: "Massive transfusion ratio",           value: "1:1:1 (pRBC : FFP : Plt)" },
];

// ─── DIARRHOEA & DEHYDRATION ─────────────────────────────────────────────────
// IAP 2016, IMNCI, WHO 2005, Nelson 21st ed

export const DEHYDRATION_ASSESSMENT = [
  {
    feature: "General condition",
    none:   "Well, alert",
    some:   "Restless, irritable",
    severe: "Lethargic, unconscious, or floppy",
  },
  {
    feature: "Eyes",
    none:   "Normal",
    some:   "Sunken",
    severe: "Very sunken, dry",
  },
  {
    feature: "Tears",
    none:   "Present",
    some:   "Absent",
    severe: "Absent",
  },
  {
    feature: "Mouth / tongue",
    none:   "Moist",
    some:   "Dry",
    severe: "Very dry",
  },
  {
    feature: "Thirst",
    none:   "Drinks normally",
    some:   "Thirsty, drinks eagerly",
    severe: "Unable to drink / drinks poorly",
  },
  {
    feature: "Skin pinch",
    none:   "Returns immediately",
    some:   "Returns slowly (< 2 s)",
    severe: "Returns very slowly (> 2 s)",
  },
  {
    feature: "CRT",
    none:   "< 2 s",
    some:   "2–3 s",
    severe: "> 3 s",
  },
  {
    feature: "Fontanelle (infant)",
    none:   "Normal / flat",
    some:   "Sunken",
    severe: "Very sunken",
  },
  {
    feature: "Urine output",
    none:   "Normal",
    some:   "Decreased",
    severe: "None for > 6 hours",
  },
];

export const DEHYDRATION_PLAN = {
  none: {
    label: "No dehydration",
    deficit: 0,
    plan: "Plan A",
    color: "emerald",
    steps: [
      "Continue breastfeeding / normal feeds",
      "Offer extra ORS after each loose stool: < 2 yr → 50–100 mL; ≥ 2 yr → 100–200 mL",
      "Zinc supplementation: < 6 mo → 10 mg/day × 14 days; ≥ 6 mo → 20 mg/day × 14 days",
      "Return if: > 3 stools/hr, not eating/drinking, fever persists, blood in stool",
    ],
    discharge: [
      "Prepare ORS at home: 1 L clean water + 6 tsp sugar + ½ tsp salt",
      "Continue normal diet — avoid juices and carbonated drinks",
      "Zinc 20 mg once daily × 14 days (proven to reduce duration and recurrence)",
      "Hand hygiene: wash hands before feeding and after changing nappy",
      "Return immediately if child becomes drowsy, cannot drink, develops blood in stool, or worsens",
    ],
  },
  some: {
    label: "Some dehydration (5–9%)",
    deficit: 75,
    plan: "Plan B",
    color: "amber",
    steps: [
      "Give ORS 75 mL/kg over 4 hours (Plan B) — supervised in clinic or OPD",
      "Reassess every hour for improvement or worsening",
      "If vomiting: wait 10 min then retry; give small sips (5 mL/kg/hr) for first 30 min",
      "Nasogastric ORS if unable to drink: same volume over same time",
      "After 4 hr: reassess dehydration. If improved → Plan A. If not improved → repeat Plan B. If worse → Plan C (IV).",
      "Zinc supplementation as for Plan A",
    ],
    discharge: [
      "Teach mother/caregiver to prepare and give ORS at home",
      "Continue breastfeeding during rehydration",
      "Resume normal feeds as soon as rehydration complete — early feeding reduces duration",
      "Zinc 20 mg once daily × 14 days",
      "Follow up in 24 hours or return earlier if unable to drink, vomiting everything, worsening, blood in stool, fever",
      "Do NOT restrict diet — BRAT diet not recommended by IAP/WHO",
    ],
  },
  severe: {
    label: "Severe dehydration (≥ 10%)",
    deficit: 100,
    plan: "Plan C",
    color: "red",
    steps: [
      "IV access immediately — IO if IV fails after 2 attempts",
      "Shock: 20 mL/kg 0.9% NaCl or Ringer's Lactate IV over 15–30 min. Repeat up to 3 × if signs of shock persist.",
      "After shock correction: give remaining deficit as 0.9% NaCl + 5% Dextrose + 20 mmol/L KCl over 24 hr",
      "If can drink: give ORS simultaneously while IV running",
      "Reassess every 30 min until stable, then every 1–2 hr",
      "Check blood glucose, electrolytes, blood gas",
      "Admit to hospital for continued monitoring",
    ],
    discharge: [
      "Only discharge once oral intake is adequate and no signs of dehydration remain",
      "Send home with ORS sachets and written instructions",
      "Zinc 20 mg once daily × 14 days",
      "Educate on danger signs requiring immediate return",
      "Ensure follow-up within 24–48 hours",
    ],
  },
};

// ORS volumes by weight and plan
export function orsVolumePlanB(weight) {
  return Math.round(weight * 75); // mL over 4 hours
}
export function orsRatePerHour(weight) {
  return Math.round((weight * 75) / 4);
}
export function orsAfterStool(weight) {
  return weight < 10 ? 75 : 150; // mL per stool
}

export const ORS_COMPOSITION = {
  who: { na: 75, k: 20, cl: 65, citrate: 10, glucose: 75, osmolarity: 245, note: "WHO low-osmolarity ORS (2003) — reduces stool output vs standard ORS. Recommended by IAP, WHO, ESPGHAN." },
  standard: { na: 90, k: 20, cl: 80, citrate: 10, glucose: 111, osmolarity: 311, note: "Original WHO 1975 ORS. Still used in cholera." },
  homemade: { na: "~50", k: "~20", note: "1 L clean water + 6 level teaspoons sugar + ½ level teaspoon salt. Boil and cool. Use within 24 hr." },
};

export const DIARRHOEA_DANGER_SIGNS = [
  "Sunken eyes + skin pinch returns very slowly",
  "Unable to drink or breastfeed",
  "Lethargic or unconscious",
  "Blood in stool (dysentery)",
  "High fever with diarrhoea (> 38.5°C in < 3 months or > 39°C older)",
  "Diarrhoea > 14 days (persistent diarrhoea — different management)",
  "Signs of severe malnutrition (marasmus / kwashiorkor)",
  "Abdominal distension / peritonism",
];

export const ANTIBIOTIC_INDICATIONS = [
  { condition: "Dysentery (bloody diarrhoea)", drug: "Azithromycin 10–12 mg/kg/day OD × 3 days (preferred over cotrimoxazole)", note: "Avoid loperamide in children < 12 yr" },
  { condition: "Cholera", drug: "Azithromycin 20 mg/kg single dose (max 1 g)", note: "Only if cholera confirmed/suspected" },
  { condition: "Giardiasis (persistent)", drug: "Metronidazole 15–30 mg/kg/day TDS × 5 days", note: "Consider if > 14 days and no other cause" },
  { condition: "Clostridium difficile", drug: "Oral Metronidazole 10 mg/kg TDS × 10 days (mild-moderate)", note: "Vancomycin PO for severe C. diff" },
];

// ─── SHOCK ────────────────────────────────────────────────────────────────────
// Fleischer & Ludwig 7th ed, PALS 2020, Nelson 21st ed

export const SHOCK_TYPES = [
  {
    id: "hypovolaemic",
    label: "Hypovolaemic",
    color: "red",
    causes: ["Diarrhoea / vomiting (most common in paeds)", "Haemorrhage — trauma, GI bleed, ectopic", "Burns (> 15% BSA)", "Diabetic ketoacidosis", "Sepsis with capillary leak"],
  },
  {
    id: "distributive",
    label: "Distributive (Septic)",
    color: "orange",
    causes: ["Bacterial sepsis — most common distributive cause", "Anaphylaxis", "Toxic shock syndrome", "Neurogenic shock (spinal cord injury)", "Adrenal crisis"],
  },
  {
    id: "cardiogenic",
    label: "Cardiogenic",
    color: "violet",
    causes: ["Myocarditis", "Congenital heart disease — ductal-dependent lesions", "Arrhythmia (SVT, VT)", "Post-cardiac surgery", "Cardiomyopathy"],
  },
  {
    id: "obstructive",
    label: "Obstructive",
    color: "sky",
    causes: ["Tension pneumothorax", "Cardiac tamponade", "Massive pulmonary embolism", "Congenital heart disease — critical LVOTO or coarctation"],
  },
];

export const SHOCK_IDENTIFICATION = {
  compensated: {
    label: "Compensated shock",
    color: "amber",
    definition: "BP normal, perfusion impaired. Early — do not wait for hypotension.",
    features: [
      "Tachycardia (most sensitive early sign)",
      "Prolonged CRT > 2 s (warm shock: CRT normal or flash)",
      "Cool / mottled extremities (cold shock) OR warm flushed extremities (warm/distributive shock)",
      "Weak peripheral pulses (cold shock) OR bounding pulses (warm shock)",
      "Altered mental status — irritability, decreased responsiveness",
      "Decreased urine output (< 1 mL/kg/hr in infant, < 0.5 mL/kg/hr in older child)",
      "Normal systolic BP — PALS criterion for compensated",
    ],
  },
  hypotensive: {
    label: "Uncompensated (hypotensive) shock",
    color: "red",
    definition: "BP below age-specific threshold. Late sign in children — represents decompensation.",
    features: [
      "Hypotension: SBP < 70 + (2 × age in years) mmHg — PALS threshold",
      "Severe tachycardia or bradycardia (pre-arrest sign)",
      "Very prolonged CRT > 5 s or mottling to trunk",
      "Weak / absent central pulses",
      "Altered or depressed consciousness, unresponsive",
      "Oliguria / anuria",
      "Metabolic acidosis: pH < 7.3, lactate > 2 mmol/L",
    ],
  },
};

export const SHOCK_VITALS_THRESHOLDS = [
  { age: "< 1 mo",    hrHigh: 180, hrLow: 100, sbpLow: 60,  note: "Neonate — tachycardia most sensitive" },
  { age: "1–12 mo",   hrHigh: 180, hrLow: 100, sbpLow: 70,  note: "Infant — sepsis often presents as inconsolable crying + poor feeding" },
  { age: "1–2 yr",    hrHigh: 160, hrLow: 90,  sbpLow: 72,  note: "SBP threshold = 70 + (2 × age in yr)" },
  { age: "2–5 yr",    hrHigh: 150, hrLow: 85,  sbpLow: 74,  note: "" },
  { age: "5–12 yr",   hrHigh: 140, hrLow: 65,  sbpLow: 80,  note: "" },
  { age: "> 12 yr",   hrHigh: 130, hrLow: 60,  sbpLow: 90,  note: "Adolescent — closer to adult thresholds" },
];

export const SHOCK_MANAGEMENT = {
  initial: [
    "SIMULTANEOUS: Airway + Breathing + Circulation — do not complete ABC sequentially in shock",
    "High-flow O₂ via NRM 10–15 L/min immediately. Target SpO₂ ≥ 94%",
    "IV access × 2 large-bore; if fails after 90 s → IO access (tibial plateau preferred in < 6 yr)",
    "Blood: glucose (point-of-care), VBG/ABG, FBC, U&E, LFT, coagulation, lactate, blood culture × 2 (before antibiotics if < 45 min delay)",
    "Cardiac monitor, pulse oximetry, non-invasive BP — continuous monitoring",
    "12-lead ECG if cardiogenic shock suspected — look for arrhythmia, ischaemia, delta waves",
    "Bedside echo (FAST / RUSH protocol) if trained — identify cardiac tamponade, PTX, ventricular function",
  ],
  fluids: {
    septic: "20 mL/kg 0.9% NaCl or Hartmann's IV over 5–10 min. Reassess after each bolus. Repeat up to 60 mL/kg total in first hour if no improvement. STOP if crackles / hepatomegaly develop.",
    hypovolaemic: "20 mL/kg 0.9% NaCl or Hartmann's IV bolus. Repeat as needed. For haemorrhage: pRBC 10–15 mL/kg if Hb < 7 (or < 8–9 if shocked). 1:1:1 MTP if massive haemorrhage.",
    cardiogenic: "Cautious 5–10 mL/kg fluid bolus over 20–30 min only if likely underfilled. Avoid large boluses — risk of worsening pulmonary oedema. Early inotropes.",
    obstructive: "Treat the cause FIRST (needle decompression for tension PTX, pericardiocentesis for tamponade). Fluid temporises only.",
    dka: "10 mL/kg 0.9% NaCl over 30–60 min. Avoid > 20–30 mL/kg total bolus. Risk of cerebral oedema.",
  },
  antibiotics: [
    "Septic shock: give within 1 hour of recognition — every hour of delay increases mortality",
    "Neonatal sepsis (< 28 days): Ampicillin 50 mg/kg + Gentamicin 4 mg/kg IV",
    "Infant / child (no focus): Ceftriaxone 100 mg/kg IV (max 4 g) ± Vancomycin 15 mg/kg if MRSA risk",
    "Meningococcal: Ceftriaxone 100 mg/kg IV immediately on suspicion",
    "Anaphylaxis: Adrenaline 0.01 mg/kg IM (max 0.5 mg) — first-line. Do NOT delay for IV access.",
  ],
  vasoactives: [
    { drug: "Adrenaline (epinephrine)", dose: "0.05–2 mcg/kg/min IV infusion", indication: "Cold shock, refractory septic shock, anaphylaxis, cardiogenic shock", note: "First-line for cold shock per PALS / ACCM" },
    { drug: "Noradrenaline (norepinephrine)", dose: "0.05–2 mcg/kg/min IV infusion", indication: "Warm distributive shock (septic, anaphylaxis after adrenaline)", note: "Increases SVR; use once volume-resuscitated" },
    { drug: "Dopamine", dose: "5–20 mcg/kg/min IV infusion", indication: "Alternative if adrenaline/noradrenaline unavailable; renal dosing at 2–5 mcg/kg/min (controversial)", note: "Less preferred than adrenaline in paeds — more dysrhythmogenic" },
    { drug: "Dobutamine", dose: "2–20 mcg/kg/min IV infusion", indication: "Cardiogenic shock with adequate BP — improves contractility", note: "May worsen hypotension if vasoplegia present; combine with noradrenaline" },
    { drug: "Milrinone", dose: "Loading 50 mcg/kg over 10–60 min (omit if hypotensive); maintenance 0.25–0.75 mcg/kg/min", indication: "Post-cardiac surgery low-output, cardiogenic shock, refractory cold shock", note: "PDE-3 inhibitor: inotropy + vasodilation. Avoid in hypovolaemia." },
  ],
  definitive: [
    "Identify and treat underlying cause: source control for sepsis (drain abscess, remove infected line, antibiotics)",
    "Hydrocortisone 1–2 mg/kg IV q6h (max 50 mg/dose) if vasopressor-dependent septic shock and adrenal insufficiency suspected",
    "Correct metabolic derangements: glucose, calcium (iCa < 1.1 mmol/L impairs cardiac contractility), magnesium",
    "Tension PTX: needle decompression 4th–5th ICS MAL → ICD insertion",
    "Cardiac tamponade: emergent pericardiocentesis (bedside echo-guided)",
    "SVT causing cardiogenic shock: adenosine 0.1 mg/kg IV (max 6 mg first dose) → cardioversion if unstable",
    "Ductal-dependent lesion (neonate): Prostaglandin E1 0.05–0.1 mcg/kg/min IV — keep duct open",
    "Anaphylaxis: adrenaline IM → IV infusion if refractory → hydrocortisone 4 mg/kg IV + chlorphenamine 0.2 mg/kg IV",
    "Refractory shock: consider ECMO activation criteria (experienced centre); early PICU notification",
  ],
};

export const SHOCK_ENDPOINTS = [
  "CRT ≤ 2 s",
  "Normal pulse quality (peripheral = central)",
  "HR returning to age-appropriate normal",
  "BP above age-appropriate threshold",
  "Mental status improving (alert, interactive)",
  "Urine output ≥ 1 mL/kg/hr (infant) / ≥ 0.5 mL/kg/hr (older child)",
  "Lactate clearing (aim < 2 mmol/L or > 10% fall per hour)",
  "ScvO₂ ≥ 70% if central line in place",
];
