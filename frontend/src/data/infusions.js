// ═══════════════════════════════════════════════════════════════
// Continuous infusions — concentrations & live mL/hr calculator
// Refs: Harriet Lane 23rd ed. · F&L · ANZPIC / PICU standard recipes
// ═══════════════════════════════════════════════════════════════

// Formula:
//   If rateUnit ends with "/min" → mL/hr = (rate × weight × 60) / concPerMl
//   If rateUnit ends with "/hr"  → mL/hr = (rate × weight)      / concPerMl
// concPerMl and rate must share the SAME base unit (mcg / mg / U).

export const INFUSIONS = [
  // ── Vasoactive / Inotropes ──
  {
    id: "dopamine",
    name: "Dopamine",
    category: "vasoactive",
    rateUnit: "mcg/kg/min",
    baseUnit: "mcg",
    defaultConcPerMl: 1600, // 400 mg / 250 mL
    recipe: "400 mg in 250 mL D5W = 1600 mcg/mL",
    rateMin: 2, rateMax: 20, rateTypical: 10,
    notes: "Renal 2–5 · β 5–10 · α > 10 mcg/kg/min. Central line preferred.",
  },
  {
    id: "dobutamine",
    name: "Dobutamine",
    category: "vasoactive",
    rateUnit: "mcg/kg/min",
    baseUnit: "mcg",
    defaultConcPerMl: 1000, // 250 mg / 250 mL
    recipe: "250 mg in 250 mL D5W = 1000 mcg/mL",
    rateMin: 2, rateMax: 20, rateTypical: 10,
    notes: "β1 inotrope. Titrate to perfusion.",
  },
  {
    id: "adrenaline-inf",
    name: "Adrenaline (Epinephrine)",
    category: "vasoactive",
    rateUnit: "mcg/kg/min",
    baseUnit: "mcg",
    defaultConcPerMl: 16, // 4 mg / 250 mL
    recipe: "4 mg in 250 mL = 16 mcg/mL (or 1 mg in 100 mL = 10 mcg/mL)",
    rateMin: 0.05, rateMax: 1, rateTypical: 0.1,
    notes: "First-line in cold shock / post-arrest.",
  },
  {
    id: "noradrenaline-inf",
    name: "Noradrenaline (Norepinephrine)",
    category: "vasoactive",
    rateUnit: "mcg/kg/min",
    baseUnit: "mcg",
    defaultConcPerMl: 16, // 4 mg / 250 mL
    recipe: "4 mg in 250 mL = 16 mcg/mL",
    rateMin: 0.05, rateMax: 1, rateTypical: 0.1,
    notes: "α1 vasopressor. First-line in warm septic shock. CENTRAL LINE.",
  },
  {
    id: "milrinone-inf",
    name: "Milrinone",
    category: "vasoactive",
    rateUnit: "mcg/kg/min",
    baseUnit: "mcg",
    defaultConcPerMl: 200, // 20 mg / 100 mL
    recipe: "20 mg in 100 mL = 200 mcg/mL",
    rateMin: 0.25, rateMax: 0.75, rateTypical: 0.5,
    notes: "Load 50 mcg/kg over 15 min (optional). Risk of hypotension.",
  },
  {
    id: "vasopressin-inf",
    name: "Vasopressin",
    category: "vasoactive",
    rateUnit: "U/kg/min",
    baseUnit: "U",
    defaultConcPerMl: 0.2, // 20 U / 100 mL
    recipe: "20 units in 100 mL = 0.2 U/mL",
    rateMin: 0.0003, rateMax: 0.002, rateTypical: 0.0005,
    notes: "Catecholamine-resistant shock. 2nd-line vasopressor.",
  },
  // ── Sedation / analgesia ──
  {
    id: "midazolam-inf",
    name: "Midazolam",
    category: "sedation",
    rateUnit: "mg/kg/hr",
    baseUnit: "mg",
    defaultConcPerMl: 1, // 50 mg / 50 mL
    recipe: "50 mg in 50 mL NS = 1 mg/mL",
    rateMin: 0.05, rateMax: 0.4, rateTypical: 0.1,
    notes: "Post-intubation sedation. Bolus 0.1 mg/kg if light.",
  },
  {
    id: "fentanyl-inf",
    name: "Fentanyl",
    category: "sedation",
    rateUnit: "mcg/kg/hr",
    baseUnit: "mcg",
    defaultConcPerMl: 10, // 500 mcg / 50 mL
    recipe: "500 mcg in 50 mL NS = 10 mcg/mL",
    rateMin: 1, rateMax: 5, rateTypical: 2,
    notes: "Post-intubation analgesia-sedation. Tachyphylaxis.",
  },
  {
    id: "morphine-inf",
    name: "Morphine",
    category: "sedation",
    rateUnit: "mcg/kg/hr",
    baseUnit: "mcg",
    defaultConcPerMl: 1000, // 50 mg in 50 mL = 1 mg/mL = 1000 mcg/mL
    recipe: "50 mg in 50 mL = 1 mg/mL (= 1000 mcg/mL)",
    rateMin: 10, rateMax: 40, rateTypical: 20,
    notes: "Titrate to comfort. Monitor for histamine release.",
  },
  {
    id: "ketamine-inf",
    name: "Ketamine",
    category: "sedation",
    rateUnit: "mg/kg/hr",
    baseUnit: "mg",
    defaultConcPerMl: 1, // 50 mg / 50 mL
    recipe: "50 mg in 50 mL NS = 1 mg/mL",
    rateMin: 0.5, rateMax: 3, rateTypical: 1,
    notes: "Useful in asthma and haemodynamic instability.",
  },
  {
    id: "lidocaine-inf",
    name: "Lidocaine",
    category: "vasoactive",
    rateUnit: "mcg/kg/min",
    baseUnit: "mcg",
    defaultConcPerMl: 4000, // 1 g / 250 mL = 4 mg/mL
    recipe: "1 g in 250 mL = 4 mg/mL (= 4000 mcg/mL)",
    rateMin: 20, rateMax: 50, rateTypical: 30,
    notes: "For VT. Load 1 mg/kg bolus first.",
  },
  // ── Neonatal / specialised ──
  {
    id: "prostin-inf",
    name: "Prostaglandin E1 (Alprostadil)",
    category: "neonatal",
    rateUnit: "mcg/kg/min",
    baseUnit: "mcg",
    defaultConcPerMl: 2, // 500 mcg / 250 mL
    recipe: "500 mcg in 250 mL D5W = 2 mcg/mL",
    rateMin: 0.01, rateMax: 0.1, rateTypical: 0.05,
    notes: "Duct-dependent CHD. Apnoea risk — intubate if ≥ 0.05 mcg/kg/min.",
  },
  {
    id: "insulin-inf",
    name: "Insulin (DKA)",
    category: "sedation", // grouped with infusions; category used for color
    rateUnit: "U/kg/hr",
    baseUnit: "U",
    defaultConcPerMl: 1, // 50 U / 50 mL
    recipe: "50 units in 50 mL NS = 1 U/mL (run first 20 mL through line to saturate)",
    rateMin: 0.05, rateMax: 0.1, rateTypical: 0.1,
    notes: "Start ≥ 1 hr after fluids. No bolus.",
  },
];

// Convert rate + weight + concentration → mL/hr
export function calcMlPerHr(infusion, rate, weight) {
  const perHr = infusion.rateUnit.endsWith("/min") ? rate * 60 : rate;
  if (infusion.defaultConcPerMl === 0) return 0;
  return (perHr * weight) / infusion.defaultConcPerMl;
}

// ═══════════════════════════════════════════════════════════════
// RSI (Rapid Sequence Intubation) — weight-based quickstart
// Ref: Harriet Lane Ch. 4 · F&L ch. 5 · Walls 6th ed.
// ═══════════════════════════════════════════════════════════════

export const RSI_PRE_MEDICATION = [
  { name: "Atropine", dosePerKg: 0.02, unit: "mg", min: 0.1, max: 0.5, route: "IV", note: "For infants < 1 yr, or if sux used in child < 5 yr. Prevents vagal bradycardia." },
  { name: "Lidocaine", dosePerKg: 1, unit: "mg", max: 100, route: "IV 2 min pre", note: "Optional for ↑ICP — evidence weak." },
  { name: "Fentanyl (sympatholysis)", dosePerKg: 2, unit: "mcg", max: 100, route: "IV", note: "For ↑ICP / aortic pathology. Avoid in shock (hypotension)." },
];

export const RSI_INDUCTION = [
  { name: "Ketamine", dosePerKg: 2, unit: "mg", route: "IV", note: "First-line in shock / asthma. 1–2 mg/kg.", tone: "emerald" },
  { name: "Etomidate", dosePerKg: 0.3, unit: "mg", route: "IV", note: "Haemodynamically neutral. Avoid in sepsis (adrenal suppression).", tone: "amber" },
  { name: "Propofol", dosePerKg: 2, unit: "mg", route: "IV", note: "Avoid in shock / hypovolaemia (hypotension). 1–3 mg/kg.", tone: "amber" },
  { name: "Midazolam", dosePerKg: 0.3, unit: "mg", max: 10, route: "IV", note: "Less ideal for RSI — slow onset. Reserve for unavailable alternatives.", tone: "amber" },
  { name: "Thiopentone", dosePerKg: 4, unit: "mg", route: "IV", note: "Rapid onset. Avoid in shock / status asthmaticus.", tone: "amber" },
];

export const RSI_PARALYSIS = [
  { name: "Rocuronium", dosePerKg: 1.2, unit: "mg", route: "IV", note: "Onset 60 s · duration 45–60 min. Reversal: sugammadex 16 mg/kg.", tone: "emerald" },
  { name: "Suxamethonium (Succinylcholine)", dosePerKg: 2, unit: "mg", route: "IV", note: "Onset 30–60 s · duration 5–10 min. C/I: hyperkalaemia, burns > 24 h, MH.", tone: "amber" },
  { name: "Vecuronium", dosePerKg: 0.1, unit: "mg", route: "IV", note: "Onset 2–3 min. Alternative non-depolariser.", tone: "amber" },
];

export const RSI_POST = [
  { name: "Midazolam infusion", dosePerKg: 0.1, unit: "mg/hr", route: "IV", note: "Start 0.05–0.4 mg/kg/hr. Bolus 0.1 mg/kg prn.", tone: "sedation" },
  { name: "Fentanyl infusion", dosePerKg: 2, unit: "mcg/hr", route: "IV", note: "1–5 mcg/kg/hr post-intubation.", tone: "sedation" },
  { name: "Morphine infusion", dosePerKg: 20, unit: "mcg/hr", route: "IV", note: "10–40 mcg/kg/hr.", tone: "sedation" },
];

// 7 Ps checklist (Walls) — RSI workflow
export const RSI_CHECKLIST = [
  { p: "Preparation", items: ["Monitors (ECG, SpO₂, BP, ETCO₂)", "IV × 2", "Suction (Yankauer) ready", "Self-inflating bag + mask correct size", "Airway kit (ETT, stylet, blade, backup supraglottic)", "Drugs drawn up + labelled", "Team roles assigned"] },
  { p: "Pre-oxygenation", items: ["100% O₂ via NRB for 3 min", "Passive apnoeic oxygenation with NC at 4–8 L/min (children), 15 L/min (adolescents)", "Avoid PPV if possible to prevent gastric insufflation"] },
  { p: "Pre-treatment (optional)", items: ["Atropine 0.02 mg/kg if < 1 yr or sux in < 5 yr", "Fentanyl 2 mcg/kg for ↑ICP (if haemodynamically stable)"] },
  { p: "Paralysis with induction", items: ["Give induction agent IV push", "Immediately follow with paralytic", "Wait 45–60 s (roc) or 30–45 s (sux)"] },
  { p: "Positioning", items: ["Sniffing position (child > 2 yr)", "Shoulder roll for infants (large occiput)", "Align external auditory meatus with sternal notch"] },
  { p: "Placement with proof", items: ["Direct/video laryngoscopy", "Visualise cords, pass ETT", "Confirm: ETCO₂ waveform, bilateral breath sounds, chest rise, mist in tube, CXR"] },
  { p: "Post-intubation management", items: ["Secure ETT, document depth", "Start sedation ± analgesia infusion", "Ventilator settings (Vt 6–8 mL/kg IBW, PEEP 5, RR age-appropriate)", "NG tube decompression", "Reassess SpO₂, ETCO₂, BP"] },
];
