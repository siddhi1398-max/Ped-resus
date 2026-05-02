// src/data/vitals.js
// Sources: Nelson 21e · PALS 2020 · Harriet Lane 23e · AAP Bright Futures

// ─── VITALS ROWS ─────────────────────────────────────────────────────────────
// weight field = upper weight boundary for that age band (kg).
// VitalsTab uses parseFloat(r.weight) >= currentWeight to find the matching row.

export const VITALS_ROWS = [
  {
    age:    "Neonate (0–1 mo)",
    weight: "4",          // up to ~4 kg
    hr:     "100–205 (awake) · 90–160 (asleep)",
    rr:     "30–60",
    sbp:    "60–84",
    dbp:    "31–53",
  },
  {
    age:    "Infant (1–12 mo)",
    weight: "10",         // up to ~10 kg
    hr:     "100–190 (awake) · 90–160 (asleep)",
    rr:     "30–53",
    sbp:    "72–104",
    dbp:    "37–56",
  },
  {
    age:    "Toddler (1–2 yr)",
    weight: "14",         // up to ~14 kg
    hr:     "98–140 (awake) · 80–120 (asleep)",
    rr:     "22–37",
    sbp:    "86–106",
    dbp:    "42–63",
  },
  {
    age:    "Preschool (3–5 yr)",
    weight: "20",         // up to ~20 kg
    hr:     "80–120 (awake) · 65–100 (asleep)",
    rr:     "20–28",
    sbp:    "89–112",
    dbp:    "46–72",
  },
  {
    age:    "School age (6–11 yr)",
    weight: "40",         // up to ~40 kg
    hr:     "75–118 (awake) · 58–90 (asleep)",
    rr:     "18–25",
    sbp:    "97–120",
    dbp:    "57–80",
  },
  {
    age:    "Adolescent (12–15 yr)",
    weight: "999",        // catch-all for larger patients
    hr:     "60–100 (awake) · 50–90 (asleep)",
    rr:     "12–20",
    sbp:    "110–131",
    dbp:    "64–83",
  },
];

// ─── TEMPERATURE NOTES ───────────────────────────────────────────────────────
export const TEMP_NOTES = [
  "Fever: ≥ 38.0°C rectal (most accurate in infants) · ≥ 37.8°C axillary · ≥ 38.0°C tympanic",
  "Hyperthermia: ≥ 40°C — consider heat stroke, malignant hyperthermia, neuroleptic malignant syndrome",
  "Hypothermia: < 36.0°C — risk of coagulopathy, arrhythmia, impaired drug metabolism",
  "Neonates may NOT mount a fever even with serious bacterial infection — hypothermia equally significant",
  "Antipyretics treat discomfort but do NOT prevent febrile seizures (AAP 2022)",
];

// ─── SPO2 NOTES ───────────────────────────────────────────────────────────────
export const SPO2_NOTES = [
  "Normal SpO₂: ≥ 94% on room air at sea level",
  "Mild hypoxia: 90–93% — supplemental O₂ via nasal prongs indicated",
  "Moderate hypoxia: 85–89% — high-flow O₂ or NIV/HFNC",
  "Severe hypoxia: < 85% — intubation likely required",
  "Neonates: pre-ductal SpO₂ (right hand) = true arterial; post-ductal (foot) lower in PPHN — difference >5% suggests R→L shunting",
  "Cyanosis clinically visible at SpO₂ ~80–85% — unreliable in anaemia or dark skin",
];

// ─── MIN SYSTOLIC BP ─────────────────────────────────────────────────────────
// PALS formula: 70 + (2 × age in years) for children 1–10 yr
// Approximates age from weight using Luscombe formula: age ≈ (weight/2) − 4
export function minSBP(weightKg) {
  if (!weightKg || weightKg < 3) return 60;   // neonate
  if (weightKg < 10) return 70;               // infant
  // Luscombe weight→age approximation, clamped 1–12 yr
  const approxAge = Math.max(1, Math.min(12, Math.round(weightKg / 2 - 4)));
  if (approxAge <= 10) return 70 + 2 * approxAge;
  return 90;                                  // adolescent
}
