// ═══════════════════════════════════════════════════════════════
// Pediatric pain assessment & severity scores
// Sources: IAP Guidelines, Fleischer & Ludwig (Textbook of Pediatric
// Emergency Medicine), Harriet Lane Handbook 23rd ed.
// ═══════════════════════════════════════════════════════════════

// ── FLACC (2 mo – 7 yr or non-verbal) ──────────────────────────
export const FLACC = {
  id: "flacc",
  name: "FLACC",
  fullName: "Face, Legs, Activity, Cry, Consolability",
  ageRange: "2 mo – 7 yr / non-verbal",
  source: "Merkel 1997 · F&L ch. 57",
  items: [
    {
      key: "face",
      label: "Face",
      options: [
        { v: 0, l: "No particular expression or smile" },
        { v: 1, l: "Occasional grimace, frown, withdrawn, disinterested" },
        { v: 2, l: "Frequent-to-constant quivering chin, clenched jaw" },
      ],
    },
    {
      key: "legs",
      label: "Legs",
      options: [
        { v: 0, l: "Normal position or relaxed" },
        { v: 1, l: "Uneasy, restless, tense" },
        { v: 2, l: "Kicking or legs drawn up" },
      ],
    },
    {
      key: "activity",
      label: "Activity",
      options: [
        { v: 0, l: "Lying quietly, normal position, moves easily" },
        { v: 1, l: "Squirming, shifting back/forth, tense" },
        { v: 2, l: "Arched, rigid, or jerking" },
      ],
    },
    {
      key: "cry",
      label: "Cry",
      options: [
        { v: 0, l: "No cry (awake or asleep)" },
        { v: 1, l: "Moans or whimpers, occasional complaint" },
        { v: 2, l: "Crying steadily, screams, sobs, frequent complaints" },
      ],
    },
    {
      key: "consolability",
      label: "Consolability",
      options: [
        { v: 0, l: "Content, relaxed" },
        { v: 1, l: "Reassured by touching, hugging, talking" },
        { v: 2, l: "Difficult to console or comfort" },
      ],
    },
  ],
  interpret(total) {
    if (total <= 3) return { band: "mild", label: "Mild (1–3)", total };
    if (total <= 6) return { band: "moderate", label: "Moderate (4–6)", total };
    return { band: "severe", label: "Severe (7–10)", total };
  },
};

// ── Wong-Baker FACES (3 – 7 yr) ────────────────────────────────
export const FACES = {
  id: "faces",
  name: "Wong-Baker FACES",
  fullName: "Wong-Baker FACES Pain Rating Scale",
  ageRange: "3 – 7 yr",
  source: "Wong-Baker 1988",
  faces: [
    { score: 0, face: "😀", label: "No hurt" },
    { score: 2, face: "🙂", label: "Hurts little bit" },
    { score: 4, face: "😐", label: "Hurts little more" },
    { score: 6, face: "😕", label: "Hurts even more" },
    { score: 8, face: "😖", label: "Hurts whole lot" },
    { score: 10, face: "😭", label: "Hurts worst" },
  ],
  interpret(total) {
    if (total <= 3) return { band: "mild", label: "Mild (0–3)", total };
    if (total <= 6) return { band: "moderate", label: "Moderate (4–6)", total };
    return { band: "severe", label: "Severe (7–10)", total };
  },
};

// ── Numeric Rating Scale (≥ 8 yr) ──────────────────────────────
export const NRS = {
  id: "nrs",
  name: "NRS",
  fullName: "Numeric Rating Scale (0–10)",
  ageRange: "≥ 8 yr (verbal)",
  source: "Standard verbal scale",
  interpret(total) {
    if (total <= 3) return { band: "mild", label: "Mild (0–3)", total };
    if (total <= 6) return { band: "moderate", label: "Moderate (4–6)", total };
    return { band: "severe", label: "Severe (7–10)", total };
  },
};

// Auto-select pain tool by weight (rough age mapping)
export function recommendPainTool(weightKg) {
  if (weightKg <= 5) return "flacc"; // neonate/infant
  if (weightKg <= 20) return "flacc"; // preverbal / toddler
  if (weightKg <= 26) return "faces"; // 3–7 yr
  return "nrs"; // older
}

// ═══════════════════════════════════════════════════════════════
// Pain → Analgesia decision pathway (weight-based)
// Refs: IAP pain management, F&L ch. 57 / Harriet Lane Ch. 6
// ═══════════════════════════════════════════════════════════════
export const PAIN_PATHWAY = {
  mild: {
    title: "Mild Pain (score 1–3)",
    tone: "emerald",
    nonPharm: [
      "Distraction, comfort, positioning, swaddling",
      "Cold pack / topical measures",
      "Parental presence",
    ],
    drugs: [
      { name: "Paracetamol", dosePerKg: 15, unit: "mg", max: 1000, route: "PO/IV q4–6h", note: "Max 60 mg/kg/day" },
      { name: "Ibuprofen", dosePerKg: 10, unit: "mg", max: 400, route: "PO q6–8h", note: "≥ 3 mo, adequately hydrated" },
    ],
  },
  moderate: {
    title: "Moderate Pain (score 4–6)",
    tone: "amber",
    nonPharm: [
      "All of the above",
      "LET / EMLA topical for procedures",
      "Sucrose 24% 0.5–2 mL PO in neonates (procedural)",
    ],
    drugs: [
      { name: "Paracetamol", dosePerKg: 15, unit: "mg", max: 1000, route: "PO/IV", note: "Continue baseline" },
      { name: "Ibuprofen", dosePerKg: 10, unit: "mg", max: 400, route: "PO", note: "Continue baseline" },
      { name: "Fentanyl intranasal", dosePerKg: 1.5, unit: "mcg", max: 100, route: "IN", note: "Rapid onset, no IV needed" },
      { name: "Oxycodone PO", dosePerKg: 0.1, unit: "mg", max: 10, route: "PO", note: "Alternative to IN fentanyl" },
      { name: "Ketorolac IV/IM", dosePerKg: 0.5, unit: "mg", max: 30, route: "IV/IM q6h", note: "Opioid-sparing. Avoid >5 days / renal impairment" },
    ],
  },
  severe: {
    title: "Severe Pain (score 7–10)",
    tone: "red",
    nonPharm: [
      "All of the above",
      "Obtain IV/IO access",
      "Consider regional block / local anaesthesia",
    ],
    drugs: [
      { name: "Morphine IV", dosePerKg: 0.1, unit: "mg", max: 5, route: "IV/IM", note: "Titrate q5–10 min to effect" },
      { name: "Fentanyl IV", dosePerKg: 1, unit: "mcg", max: 50, route: "IV slow", note: "1–2 mcg/kg. Risk of chest-wall rigidity with fast push" },
      { name: "Ketamine sub-dissociative", dosePerKg: 0.3, unit: "mg", max: 30, route: "IV over 10 min", note: "Opioid-sparing, haemodynamically stable" },
      { name: "Paracetamol + NSAID", dosePerKg: 15, unit: "mg", max: 1000, route: "PO/IV", note: "Multi-modal baseline" },
      { name: "Hydromorphone", dosePerKg: 0.015, unit: "mg", max: 1, route: "IV", note: "Alternative strong opioid (~7× morphine)" },
    ],
  },
};

export function calcDrug(drug, weight) {
  let d = weight * drug.dosePerKg;
  if (drug.max) d = Math.min(d, drug.max);
  return `${+d.toFixed(2)} ${drug.unit}`;
}

// ═══════════════════════════════════════════════════════════════
// Pediatric Glasgow Coma Scale
// ═══════════════════════════════════════════════════════════════
export const GCS_VERBAL = {
  id: "gcs-verbal",
  name: "GCS (Verbal child, > 2 yr)",
  source: "Teasdale 1974 · Harriet Lane Ch. 4",
  items: [
    {
      key: "eye",
      label: "Eye opening (E)",
      options: [
        { v: 4, l: "Spontaneous" },
        { v: 3, l: "To voice" },
        { v: 2, l: "To pain" },
        { v: 1, l: "None" },
      ],
    },
    {
      key: "verbal",
      label: "Verbal response (V)",
      options: [
        { v: 5, l: "Oriented, appropriate" },
        { v: 4, l: "Confused conversation" },
        { v: 3, l: "Inappropriate words" },
        { v: 2, l: "Incomprehensible sounds" },
        { v: 1, l: "None" },
      ],
    },
    {
      key: "motor",
      label: "Motor response (M)",
      options: [
        { v: 6, l: "Obeys commands" },
        { v: 5, l: "Localises pain" },
        { v: 4, l: "Withdraws from pain" },
        { v: 3, l: "Abnormal flexion (decorticate)" },
        { v: 2, l: "Abnormal extension (decerebrate)" },
        { v: 1, l: "None" },
      ],
    },
  ],
};

export const GCS_INFANT = {
  id: "gcs-infant",
  name: "GCS (Infant / pre-verbal)",
  source: "Harriet Lane Ch. 4 · F&L ch. 122",
  items: [
    {
      key: "eye",
      label: "Eye opening (E)",
      options: [
        { v: 4, l: "Spontaneous" },
        { v: 3, l: "To speech" },
        { v: 2, l: "To pain" },
        { v: 1, l: "None" },
      ],
    },
    {
      key: "verbal",
      label: "Verbal response (V)",
      options: [
        { v: 5, l: "Coos, babbles" },
        { v: 4, l: "Irritable cries" },
        { v: 3, l: "Cries to pain" },
        { v: 2, l: "Moans to pain" },
        { v: 1, l: "None" },
      ],
    },
    {
      key: "motor",
      label: "Motor response (M)",
      options: [
        { v: 6, l: "Spontaneous movement" },
        { v: 5, l: "Withdraws to touch" },
        { v: 4, l: "Withdraws to pain" },
        { v: 3, l: "Abnormal flexion" },
        { v: 2, l: "Abnormal extension" },
        { v: 1, l: "None" },
      ],
    },
  ],
};

export function gcsInterpret(total) {
  if (total >= 13) return { band: "emerald", label: "Mild (13–15)" };
  if (total >= 9) return { band: "amber", label: "Moderate (9–12)" };
  return { band: "red", label: "Severe (≤ 8) — consider intubation" };
}

// ═══════════════════════════════════════════════════════════════
// PEWS — Pediatric Early Warning Score (Brighton / RCPCH)
// ═══════════════════════════════════════════════════════════════
export const PEWS = {
  id: "pews",
  name: "PEWS",
  fullName: "Pediatric Early Warning Score",
  source: "Monaghan 2005 · RCPCH",
  items: [
    {
      key: "behaviour",
      label: "Behaviour",
      options: [
        { v: 0, l: "Playing / appropriate" },
        { v: 1, l: "Sleeping" },
        { v: 2, l: "Irritable" },
        { v: 3, l: "Lethargic / confused / reduced pain response" },
      ],
    },
    {
      key: "cvs",
      label: "Cardiovascular",
      options: [
        { v: 0, l: "Pink, CRT 1–2 s" },
        { v: 1, l: "Pale, CRT 3 s" },
        { v: 2, l: "Grey, CRT 4 s, HR > 20 above normal" },
        { v: 3, l: "Grey/mottled, CRT ≥ 5 s, HR > 30 above normal OR bradycardia" },
      ],
    },
    {
      key: "resp",
      label: "Respiratory",
      options: [
        { v: 0, l: "Normal, no recession" },
        { v: 1, l: "RR > 10 above normal OR using accessory muscles OR FiO₂ ≥ 30% / 3 L/min" },
        { v: 2, l: "RR > 20 above normal OR recessions OR FiO₂ ≥ 40% / 6 L/min" },
        { v: 3, l: "RR ≥ 5 below normal OR sternal recession, grunting, FiO₂ ≥ 50% / 8 L/min" },
      ],
    },
  ],
  interpret(total) {
    if (total <= 2) return { band: "emerald", label: `Score ${total} — routine review` };
    if (total <= 4) return { band: "amber", label: `Score ${total} — increased monitoring` };
    return { band: "red", label: `Score ${total} — call senior / MET review` };
  },
};

// ═══════════════════════════════════════════════════════════════
// Westley Croup Score
// ═══════════════════════════════════════════════════════════════
export const WESTLEY = {
  id: "westley",
  name: "Westley Croup Score",
  source: "Westley 1978 · F&L ch. 71",
  items: [
    {
      key: "stridor",
      label: "Inspiratory stridor",
      options: [
        { v: 0, l: "None" },
        { v: 1, l: "When agitated" },
        { v: 2, l: "At rest" },
      ],
    },
    {
      key: "retractions",
      label: "Intercostal / sternal retractions",
      options: [
        { v: 0, l: "None" },
        { v: 1, l: "Mild" },
        { v: 2, l: "Moderate" },
        { v: 3, l: "Severe" },
      ],
    },
    {
      key: "airEntry",
      label: "Air entry",
      options: [
        { v: 0, l: "Normal" },
        { v: 1, l: "Decreased" },
        { v: 2, l: "Markedly decreased" },
      ],
    },
    {
      key: "cyanosis",
      label: "Cyanosis",
      options: [
        { v: 0, l: "None" },
        { v: 4, l: "With agitation" },
        { v: 5, l: "At rest" },
      ],
    },
    {
      key: "conscious",
      label: "Level of consciousness",
      options: [
        { v: 0, l: "Normal" },
        { v: 5, l: "Altered / disoriented" },
      ],
    },
  ],
  interpret(total) {
    if (total <= 2) return { band: "emerald", label: `Score ${total} — Mild · Dexamethasone 0.15–0.6 mg/kg PO × 1, discharge` };
    if (total <= 7) return { band: "amber", label: `Score ${total} — Moderate · Dexamethasone + nebulised adrenaline 0.5 mg/kg (max 5 mg)` };
    if (total <= 11) return { band: "red", label: `Score ${total} — Severe · Neb adrenaline, admit, consider PICU` };
    return { band: "red", label: `Score ${total} — Impending respiratory failure — intubate` };
  },
};

// ═══════════════════════════════════════════════════════════════
// Clinical Dehydration Scale (Gorelick / Fleischer & Ludwig)
// ═══════════════════════════════════════════════════════════════
export const DEHYDRATION = {
  id: "dehydration",
  name: "Clinical Dehydration Scale",
  source: "Gorelick 1997 · F&L ch. 85 · IAP diarrhoea guidelines",
  items: [
    {
      key: "general",
      label: "General appearance",
      options: [
        { v: 0, l: "Normal, alert" },
        { v: 1, l: "Thirsty, restless, irritable" },
        { v: 2, l: "Drowsy, limp, lethargic, unconscious" },
      ],
    },
    {
      key: "eyes",
      label: "Eyes",
      options: [
        { v: 0, l: "Normal" },
        { v: 1, l: "Slightly sunken" },
        { v: 2, l: "Very sunken / dry" },
      ],
    },
    {
      key: "mucous",
      label: "Mucous membranes",
      options: [
        { v: 0, l: "Moist" },
        { v: 1, l: "Sticky" },
        { v: 2, l: "Dry, parched" },
      ],
    },
    {
      key: "tears",
      label: "Tears (when crying)",
      options: [
        { v: 0, l: "Present" },
        { v: 1, l: "Decreased" },
        { v: 2, l: "Absent" },
      ],
    },
  ],
  interpret(total) {
    if (total === 0) return { band: "emerald", label: "No dehydration (< 3%) — ORS at home" };
    if (total <= 4) return { band: "amber", label: `Some dehydration (3–6%) — ORS 50–100 mL/kg over 4 h in ED` };
    return { band: "red", label: `Severe dehydration (> 6%) — IV resuscitation 20 mL/kg NS bolus, repeat PRN` };
  },
};

// ═══════════════════════════════════════════════════════════════
// PRAM — Pediatric Respiratory Assessment Measure (Asthma)
// ═══════════════════════════════════════════════════════════════
export const PRAM = {
  id: "pram",
  name: "PRAM Asthma Score",
  source: "Chalut 2000 · IAP asthma guidelines · F&L ch. 73",
  items: [
    {
      key: "spo2",
      label: "SpO₂ on room air",
      options: [
        { v: 0, l: "≥ 95%" },
        { v: 1, l: "92–94%" },
        { v: 2, l: "< 92%" },
      ],
    },
    {
      key: "accessory",
      label: "Suprasternal retractions",
      options: [
        { v: 0, l: "Absent" },
        { v: 2, l: "Present" },
      ],
    },
    {
      key: "scalene",
      label: "Scalene muscle contraction",
      options: [
        { v: 0, l: "Absent" },
        { v: 2, l: "Present" },
      ],
    },
    {
      key: "airEntry",
      label: "Air entry",
      options: [
        { v: 0, l: "Normal" },
        { v: 1, l: "Decreased at the base" },
        { v: 2, l: "Widespread decrease" },
        { v: 3, l: "Absent / minimal" },
      ],
    },
    {
      key: "wheeze",
      label: "Wheezing",
      options: [
        { v: 0, l: "Absent" },
        { v: 1, l: "Expiratory only" },
        { v: 2, l: "Inspiratory + expiratory" },
        { v: 3, l: "Audible without stethoscope OR silent chest" },
      ],
    },
  ],
  interpret(total) {
    if (total <= 3) return { band: "emerald", label: `Score ${total} — Mild · Salbutamol MDI + spacer, prednisolone 1 mg/kg PO` };
    if (total <= 7) return { band: "amber", label: `Score ${total} — Moderate · Salbutamol neb q20min × 3, oral steroids, ipratropium` };
    return { band: "red", label: `Score ${total} — Severe · Continuous salb neb, IV MgSO₄ 50 mg/kg, IV steroids, prepare for ICU` };
  },
};
