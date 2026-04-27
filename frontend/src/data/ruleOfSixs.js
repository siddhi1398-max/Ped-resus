// ═══════════════════════════════════════════════════════════════
// Rule of 6s — Paediatric continuous infusion shortcut
// Ref: Tintinalli Emergency Medicine 9th ed., Tables 109-1, 109-2
// ═══════════════════════════════════════════════════════════════
//
// RULE OF 6  (standard concentration, dilute drugs):
//   6 × weight(kg) = mg of drug added to diluent to make 100 mL
//   → 1 mL/hr = 1 mcg/kg/min
//
// RULE OF 0.6  (potent drugs, lower concentration):
//   0.6 × weight(kg) = mg of drug added to diluent to make 100 mL
//   → 1 mL/hr = 0.1 mcg/kg/min
//
// Advantage: nurses can titrate by whole mL/hr increments with
// direct correspondence to mcg/kg/min.

export const RULE_OF_SIXS_DRUGS = [
  {
    name: "Dopamine",
    rule: 6,
    usualRange: "5 – 20 mcg/kg/min",
    note: "β-effects 5–10; α-effects > 10.",
  },
  {
    name: "Dobutamine",
    rule: 6,
    usualRange: "5 – 20 mcg/kg/min",
    note: "Predominant β1 inotropy.",
  },
  {
    name: "Nitroprusside",
    rule: 6,
    usualRange: "0.5 – 8 mcg/kg/min",
    note: "Light-protect. Monitor thiocyanate in prolonged use.",
  },
  {
    name: "Amrinone / Milrinone",
    rule: 6,
    usualRange: "Milrinone 0.25 – 0.75 mcg/kg/min",
    note: "Load 50 mcg/kg (milrinone) — not via this rule.",
  },
  {
    name: "Adrenaline (Epinephrine)",
    rule: 0.6,
    usualRange: "0.05 – 1 mcg/kg/min",
    note: "Preferred first-line in cold shock / post-arrest.",
  },
  {
    name: "Noradrenaline (Norepinephrine)",
    rule: 0.6,
    usualRange: "0.05 – 1 mcg/kg/min",
    note: "Preferred in warm septic shock. CENTRAL LINE.",
  },
  {
    name: "Isoproterenol",
    rule: 0.6,
    usualRange: "0.05 – 2 mcg/kg/min",
    note: "For refractory bradycardia / torsades bridging.",
  },
  {
    name: "Phenylephrine",
    rule: 0.6,
    usualRange: "0.1 – 0.5 mcg/kg/min",
    note: "Pure α1 vasopressor.",
  },
];

// Calculate the mg to add to 100 mL so that rate in mL/hr matches the target rate correspondence
export function ruleOf6Mg(weightKg, rule = 6) {
  return +(rule * weightKg).toFixed(2);
}

// Reverse: rate in mL/hr → mcg/kg/min (when mixed per rule)
export function mlHrToMcgKgMin(rule, mlPerHr) {
  return rule === 6 ? mlPerHr : mlPerHr * 0.1;
}

// Target rate (mcg/kg/min) → mL/hr (when mixed per rule)
export function mcgKgMinToMlHr(rule, mcgKgMin) {
  return rule === 6 ? mcgKgMin : mcgKgMin * 10;
}
