// Neonatal reference data (Harriet Lane Handbook 23rd ed.)

export const APGAR_CRITERIA = [
  {
    criterion: "Appearance (colour)",
    s0: "Blue / pale all over",
    s1: "Blue extremities, pink trunk",
    s2: "Pink all over",
  },
  {
    criterion: "Pulse (HR)",
    s0: "Absent",
    s1: "< 100 bpm",
    s2: "≥ 100 bpm",
  },
  {
    criterion: "Grimace (reflex)",
    s0: "No response",
    s1: "Grimace / weak cry",
    s2: "Cough / sneeze / strong cry",
  },
  {
    criterion: "Activity (tone)",
    s0: "Limp",
    s1: "Some flexion",
    s2: "Active motion",
  },
  {
    criterion: "Respiration",
    s0: "Absent",
    s1: "Slow / irregular / weak cry",
    s2: "Good / strong cry",
  },
];

export const APGAR_INTERPRETATION = [
  { score: "7–10", label: "Normal", tone: "emerald" },
  { score: "4–6", label: "Moderately depressed", tone: "amber" },
  { score: "0–3", label: "Severely depressed — resuscitate", tone: "red" },
];

export const NEONATAL_VITALS = [
  { param: "Heart rate", awake: "120–160 bpm", alert: "< 100 → concern; < 60 → CPR" },
  { param: "Respiratory rate", awake: "40–60 /min", alert: "Apnoea > 20 s or with cyanosis" },
  { param: "SpO₂ (preductal, term)", awake: "See SpO₂ targets below", alert: "< target → supplemental O₂" },
  { param: "Systolic BP (term)", awake: "60–90 mmHg", alert: "MAP < gestational age (wk) = hypotension" },
  { param: "Temperature", awake: "36.5–37.5 °C (axillary)", alert: "< 36 °C → warm; sepsis workup" },
  { param: "Glucose", awake: "> 45 mg/dL (2.5 mmol/L)", alert: "< 40 mg/dL → treat with D10W 2 mL/kg" },
];

export const SPO2_TARGETS_NRP = [
  { time: "1 min", target: "60–65%" },
  { time: "2 min", target: "65–70%" },
  { time: "3 min", target: "70–75%" },
  { time: "4 min", target: "75–80%" },
  { time: "5 min", target: "80–85%" },
  { time: "10 min", target: "85–95%" },
];

export const NRP_EQUIPMENT = [
  { weight: "< 1 kg", ett: "2.5", depth: "6–7 cm", mask: "00 (preemie)" },
  { weight: "1–2 kg", ett: "3.0", depth: "7–8 cm", mask: "0 (newborn)" },
  { weight: "2–3 kg", ett: "3.0–3.5", depth: "8–9 cm", mask: "0 (newborn)" },
  { weight: "> 3 kg", ett: "3.5", depth: "9–10 cm", mask: "1 (infant)" },
];

// ETT depth rule: 6 + weight in kg (cm from upper lip)
export function nrpETTDepth(weightKg) {
  return (6 + weightKg).toFixed(1);
}

// UVC insertion depth: (1.5 × weight kg) + 5.5 cm  (emergency low ~3–5 cm)
export function uvcDepth(weightKg) {
  return (1.5 * weightKg + 5.5).toFixed(1);
}

export const NRP_PEARLS = [
  "Start timer when baby is born. Initial steps should complete by 30 s; PPV by 60 s if needed.",
  "Effective PPV is the single most important step in NRP. If HR not rising, use MR SOPA before compressions.",
  "Compressions only after 30 s of effective PPV with HR < 60. Ratio 3:1 (90 compressions + 30 breaths per minute).",
  "Adrenaline IV/UVC preferred: 0.01–0.03 mg/kg (1:10,000). ETT route less reliable: 0.05–0.1 mg/kg.",
  "Therapeutic hypothermia (33–34 °C × 72 h) within 6 h of birth for moderate–severe HIE ≥ 36 wk gestation.",
  "Term babies start with room air (21%). Preterm < 35 wk start with 21–30% and titrate to pre-ductal SpO₂ targets.",
  "Glucose check within 30 min of birth if unwell; treat < 40 mg/dL with D10W 2 mL/kg IV.",
];
