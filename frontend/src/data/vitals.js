export const VITALS_ROWS = [
  { age: "Neonate (0–1 mo)", hr: "100–205 (awake) / 90–160 (asleep)", rr: "30–60", sbp: "60–84", dbp: "31–53" },
  { age: "Infant (1–12 mo)", hr: "100–190 / 90–160", rr: "30–53", sbp: "72–104", dbp: "37–56" },
  { age: "Toddler (1–2 yr)", hr: "98–140 / 80–120", rr: "22–37", sbp: "86–106", dbp: "42–63" },
  { age: "Preschool (3–5 yr)", hr: "80–120 / 65–100", rr: "20–28", sbp: "89–112", dbp: "46–72" },
  { age: "School (6–11 yr)", hr: "75–118 / 58–90", rr: "18–25", sbp: "97–120", dbp: "57–80" },
  { age: "Adolescent (12–15 yr)", hr: "60–100 / 50–90", rr: "12–20", sbp: "110–131", dbp: "64–83" },
];

export const TEMP_NOTES = [
  "Fever: ≥ 38.0 °C (100.4 °F) rectal or ≥ 37.5 °C oral.",
  "Hypothermia: < 36.0 °C — warm actively.",
  "Neonatal sepsis should be considered for T < 36 °C or > 38 °C.",
];

export const SPO2_NOTES = [
  "Target SpO₂ ≥ 94% on air (sea level).",
  "Accept 90–94% on air in stable chronic pulmonary disease.",
  "In bronchiolitis, oxygen generally indicated if SpO₂ < 90–92%.",
];

// Min systolic BP rule: 70 + 2×age (years) for 1–10 yr, 70 for <1 mo child
export function minSBP(weightKg) {
  if (weightKg < 4) return 60;
  if (weightKg < 10) return 70;
  // approximate age from weight (Luscombe): age ≈ (w/2) - 4, clamp
  const age = Math.max(1, Math.min(12, weightKg / 2 - 4));
  if (age <= 10) return 70 + 2 * Math.round(age);
  return 90;
}
