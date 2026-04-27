// Fluid management references

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

export function parklandBurns(weight, percentBSA) {
  // 3 mL/kg/%BSA (modified) or 4 mL/kg/%BSA (classic Parkland)
  // Give half in first 8 hr from time of burn
  const total = 3 * weight * percentBSA;
  return {
    total24: total,
    first8: total / 2,
    next16: total / 2,
  };
}

export const DKA_PROTOCOL = [
  { title: "Initial resuscitation", body: "10 mL/kg NS bolus over 30–60 min if shocked. Avoid rapid boluses — risk of cerebral oedema." },
  { title: "Rehydration", body: "Estimate deficit (5–10%). Replace over 48 hours. Use NS or balanced fluid. Maintenance + deficit − resuscitation fluids already given." },
  { title: "Insulin", body: "Start 0.05–0.1 units/kg/hr IV infusion ≥ 1 hour after fluids started. Do NOT bolus insulin." },
  { title: "Potassium", body: "Add 40 mmol/L KCl once K⁺ < 5.5 mmol/L and urine output established." },
  { title: "Glucose", body: "When BG < 14–17 mmol/L (250–300 mg/dL), add dextrose (5–10%) to maintenance fluid." },
  { title: "Monitoring", body: "Hourly: HR, BP, GCS, glucose, fluid balance. 2-hourly: electrolytes, blood gas." },
  { title: "Cerebral oedema — red flags", body: "Headache, altered GCS, bradycardia, hypertension, focal neurology. Treat with hypertonic saline 3% (2.5–5 mL/kg) or mannitol 0.5–1 g/kg." },
];

export const FLUID_TYPES = [
  { name: "0.9% NaCl (Normal Saline)", na: "154", cl: "154", use: "Resuscitation, DKA" },
  { name: "Ringer's Lactate (Hartmann's)", na: "131", cl: "111", use: "Resuscitation, surgical" },
  { name: "Plasma-Lyte 148", na: "140", cl: "98", use: "Balanced crystalloid" },
  { name: "5% Dextrose", na: "0", cl: "0", use: "Hypoglycaemia top-up (not resus)" },
  { name: "10% Dextrose", na: "0", cl: "0", use: "Neonatal hypoglycaemia 2 mL/kg" },
  { name: "3% Hypertonic Saline", na: "513", cl: "513", use: "Raised ICP, severe hyponatraemia" },
  { name: "0.45% NaCl + 5% Dex", na: "77", cl: "77", use: "Maintenance (older guidance)" },
];

// ─── Peri-op / Emergency Physician calculations ────────────────────────
// Age-adjusted Estimated Blood Volume (mL/kg) per PASNA / paediatric anaesthesia refs
export const EBV_TABLE = [
  { group: "Premature infant", mlPerKg: 100 },
  { group: "Full-term neonate", mlPerKg: 90 },
  { group: "Infant 3 mo – 1 yr", mlPerKg: 80 },
  { group: "Child > 1 yr", mlPerKg: 75 },
  { group: "Adolescent / adult", mlPerKg: 70 },
];

export function ebvPerKgForWeight(weightKg) {
  // Approximate age band from weight
  if (weightKg <= 2) return 100; // premature
  if (weightKg <= 4) return 90;  // term neonate
  if (weightKg <= 10) return 80; // 3 mo – 1 yr
  if (weightKg <= 40) return 75; // child
  return 70; // adolescent / adult
}

export function estimatedBloodVolume(weightKg) {
  return weightKg * ebvPerKgForWeight(weightKg);
}

// Allowable Blood Loss
// ABL = EBV × (Hgb_start − Hgb_min) / Hgb_average
export function allowableBloodLoss(weightKg, hgbStart, hgbMin) {
  const ebv = estimatedBloodVolume(weightKg);
  const hgbAvg = (hgbStart + hgbMin) / 2;
  if (!hgbAvg) return 0;
  return Math.max(0, ebv * (hgbStart - hgbMin) / hgbAvg);
}

// NPO fluid deficit (Holliday-Segar 4-2-1 × hours NPO)
export function npoDeficit(weightKg, hoursNPO) {
  const hourly = weightKg <= 10
    ? weightKg * 4
    : weightKg <= 20
      ? 40 + (weightKg - 10) * 2
      : 60 + (weightKg - 20);
  return hourly * hoursNPO;
}

// Local anaesthetic max safe doses (mg/kg) and their volumes at common concentrations
export const LOCAL_ANAESTHETICS = [
  { name: "Lidocaine (plain)", mgPerKg: 4.5, max: 300, concentration: "1% = 10 mg/mL" },
  { name: "Lidocaine + adrenaline", mgPerKg: 7, max: 500, concentration: "1% = 10 mg/mL" },
  { name: "Bupivacaine (plain)", mgPerKg: 2, max: 175, concentration: "0.25% = 2.5 mg/mL" },
  { name: "Bupivacaine + adrenaline", mgPerKg: 2.5, max: 225, concentration: "0.25% = 2.5 mg/mL" },
  { name: "Ropivacaine", mgPerKg: 3, max: 200, concentration: "0.2% = 2 mg/mL" },
];

// Transfusion thresholds (commonly quoted paediatric ED / peri-op)
export const TRANSFUSION_NOTES = [
  { label: "pRBC trigger (stable child)", value: "Hb < 7 g/dL" },
  { label: "pRBC trigger (cardiac / critically ill)", value: "Hb < 8–9 g/dL" },
  { label: "Volume (pRBC)", value: "10–15 mL/kg over 2–4 h" },
  { label: "Platelets", value: "10 mL/kg; threshold < 10 × 10⁹/L (stable) or < 50 with bleeding" },
  { label: "FFP", value: "10–15 mL/kg for active bleeding / coagulopathy" },
  { label: "Cryoprecipitate", value: "5–10 mL/kg for fibrinogen < 1 g/L" },
  { label: "Massive transfusion ratio", value: "1 : 1 : 1 (pRBC : FFP : Plt)" },
];
