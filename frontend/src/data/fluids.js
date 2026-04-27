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
