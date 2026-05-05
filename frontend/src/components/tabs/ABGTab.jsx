// ABGTab.jsx — Arterial Blood Gas Interpretation
// Interactive step-by-step ABG analyser: auto-diagnosis, compensation check,
// anion gap, delta ratio, osmolal gap, paediatric-specific normal ranges,
// full differential diagnosis trees with clinical context
//
// Sources:
//   Tintinalli Emergency Medicine 9e — Chapter 22 Blood Gas Interpretation
//   LITFL Acid-Base series (litfl.com/acid-base/)
//   PaediatricFOAM — Blood gases in the NICU
//   Gomella's Neonatology 8e — Normal Neonatal ABG Values
//   Winters formula, GOLDMARK, MUDPILES, HARDUPS mnemonics
//   PALS 2020 · APLS paediatric acid-base reference ranges

import { useState, useMemo } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Warning, ArrowRight, CheckCircle, Info,
  Lightbulb, Flask, ArrowsClockwise,
} from "@phosphor-icons/react";

// ─── TONE HELPERS ──────────────────────────────────────────────────────────────
const TONE = {
  red:     { text: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-950/30",         border: "border-red-200 dark:border-red-800"         },
  amber:   { text: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200 dark:border-amber-800"     },
  blue:    { text: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-950/30",       border: "border-blue-200 dark:border-blue-800"       },
  emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  violet:  { text: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-50 dark:bg-violet-950/30",   border: "border-violet-200 dark:border-violet-800"   },
  slate:   { text: "text-slate-600 dark:text-slate-400",     bg: "bg-slate-50 dark:bg-slate-900/50",     border: "border-slate-200 dark:border-slate-700"     },
  sky:     { text: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-50 dark:bg-sky-950/30",         border: "border-sky-200 dark:border-sky-800"         },
  orange:  { text: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-950/30",   border: "border-orange-200 dark:border-orange-800"   },
};

// ─── PAEDIATRIC NORMAL RANGES (age-specific) ───────────────────────────────────
// Neonates: pH 7.30–7.40, PaCO2 35–45, HCO3 19–22 (lower buffer reserve)
// Preterm:  pH 7.25–7.40 acceptable, PaO2 45–65 (avoid hyperoxia — ROP)
// Infants+: pH 7.35–7.45, PaCO2 35–45, HCO3 22–26 (approaching adult values)
// Reference: Gomella's Neonatology 8e; Tintinalli 9e; LITFL
function getNormals(ageMonths) {
  if (ageMonths < 0.5)  // Preterm / immediate newborn
    return { pH: [7.25, 7.40], pco2: [35, 50], hco3: [17, 23], pao2: [45, 70],  be: [-7, -3],  label: "Preterm / Newborn"  };
  if (ageMonths < 1)    // Term neonate
    return { pH: [7.30, 7.40], pco2: [35, 45], hco3: [19, 22], pao2: [50, 80],  be: [-5, -2],  label: "Term Neonate (0–1 mo)"};
  if (ageMonths < 12)   // Infant
    return { pH: [7.34, 7.45], pco2: [34, 45], hco3: [20, 25], pao2: [75, 100], be: [-4, 2],   label: "Infant (1–12 mo)"   };
  if (ageMonths < 36)   // Toddler
    return { pH: [7.35, 7.45], pco2: [34, 44], hco3: [21, 25], pao2: [80, 100], be: [-3, 3],   label: "Toddler (1–3 yr)"   };
  return                // School age / Adolescent — adult-equivalent
         { pH: [7.35, 7.45], pco2: [35, 45], hco3: [22, 26], pao2: [80, 100],   be: [-3, 3],   label: "Child / Adolescent" };
}

// ─── CORE INTERPRETATION ENGINE ────────────────────────────────────────────────
function interpretABG({ pH, pco2, hco3, pao2, na, cl, albumin, lactate, fio2, ageMonths }) {
  const steps = [];
  const findings = [];
  let primaryDisorder = null;
  let compensationStatus = null;
  let agType = null;
  let tone = "slate";

  const n = getNormals(ageMonths);

  // ── STEP 1: pH ──────────────────────────────────────────────────────────────
  let phStatus;
  if      (pH < n.pH[0])       phStatus = "acidaemia";
  else if (pH > n.pH[1])       phStatus = "alkalaemia";
  else if (pH < 7.40)          phStatus = "normal (leans acidic)";
  else if (pH > 7.40)          phStatus = "normal (leans alkalotic)";
  else                          phStatus = "normal";

  const isAcidaemia   = pH < (n.pH[0] + n.pH[1]) / 2;  // compare to midpoint
  const isAlkalaemia  = pH > (n.pH[0] + n.pH[1]) / 2;
  const inNormalRange = pH >= n.pH[0] && pH <= n.pH[1];

  steps.push({
    num: 1,
    title: "pH — Acid-Base Status",
    value: `${pH}`,
    normal: `${n.pH[0]}–${n.pH[1]} (${n.label})`,
    result: phStatus.toUpperCase(),
    detail: inNormalRange
      ? "pH within age-appropriate normal range. Still check PaCO₂ and HCO₃⁻ for compensated or mixed disorders."
      : (pH < n.pH[0] ? "Acidaemia present. Life-threatening below 7.10." : "Alkalaemia present. Severe >7.60."),
    tone: inNormalRange ? "emerald" : (pH < n.pH[0] ? "red" : "blue"),
  });

  // ── STEP 2: Primary disorder ─────────────────────────────────────────────────
  const co2High = pco2 > n.pco2[1];
  const co2Low  = pco2 < n.pco2[0];
  const hco3Low = hco3 < n.hco3[0];
  const hco3High= hco3 > n.hco3[1];

  if (isAcidaemia || (!inNormalRange && pH < 7.40)) {
    if (co2High && !hco3High)  { primaryDisorder = "respiratory_acidosis";  tone = "orange"; }
    else if (hco3Low)           { primaryDisorder = "metabolic_acidosis";     tone = "red";    }
    else if (co2High && hco3High){ primaryDisorder = "mixed_resp_met_acidosis"; tone = "red"; }
    else                         { primaryDisorder = "metabolic_acidosis";     tone = "red";    }
  } else if (isAlkalaemia || (!inNormalRange && pH > 7.40)) {
    if (co2Low && !hco3Low)    { primaryDisorder = "respiratory_alkalosis";  tone = "blue";   }
    else if (hco3High)          { primaryDisorder = "metabolic_alkalosis";    tone = "violet"; }
    else if (co2Low && hco3Low) { primaryDisorder = "mixed_resp_met_alkalosis"; tone = "violet"; }
    else                         { primaryDisorder = "metabolic_alkalosis";    tone = "violet"; }
  } else {
    // Normal pH — could be compensated or normal
    if (co2High && hco3High)   { primaryDisorder = "compensated_resp_acidosis"; tone = "amber"; }
    else if (co2Low && hco3Low) { primaryDisorder = "compensated_resp_alkalosis"; tone = "sky"; }
    else if (hco3Low && co2Low) { primaryDisorder = "compensated_met_acidosis";  tone = "amber"; }
    else if (hco3High && co2High){ primaryDisorder = "compensated_met_alkalosis"; tone = "amber"; }
    else                         { primaryDisorder = "normal"; tone = "emerald"; }
  }

  const disorderLabels = {
    respiratory_acidosis:       "Primary Respiratory Acidosis",
    respiratory_alkalosis:      "Primary Respiratory Alkalosis",
    metabolic_acidosis:         "Primary Metabolic Acidosis",
    metabolic_alkalosis:        "Primary Metabolic Alkalosis",
    mixed_resp_met_acidosis:    "Mixed Respiratory + Metabolic Acidosis",
    mixed_resp_met_alkalosis:   "Mixed Respiratory + Metabolic Alkalosis",
    compensated_resp_acidosis:  "Compensated Respiratory Acidosis",
    compensated_resp_alkalosis: "Compensated Respiratory Alkalosis",
    compensated_met_acidosis:   "Compensated Metabolic Acidosis",
    compensated_met_alkalosis:  "Compensated Metabolic Alkalosis",
    normal:                     "Normal ABG",
  };

  steps.push({
    num: 2,
    title: "Primary Disorder",
    value: `PaCO₂ ${pco2} mmHg  ·  HCO₃⁻ ${hco3} mmol/L`,
    normal: `CO₂: ${n.pco2[0]}–${n.pco2[1]}  |  HCO₃⁻: ${n.hco3[0]}–${n.hco3[1]}`,
    result: disorderLabels[primaryDisorder] || "Indeterminate",
    detail: `PaCO₂ ${co2High?"↑ elevated":co2Low?"↓ low":"normal"} · HCO₃⁻ ${hco3High?"↑ elevated":hco3Low?"↓ low":"normal"}`,
    tone,
  });

  // ── STEP 3: Compensation ─────────────────────────────────────────────────────
  let expectedCO2 = null, expectedHCO3 = null, compDetail = "", compResult = "";
  let compTone = "amber";

  if (primaryDisorder === "metabolic_acidosis" || primaryDisorder.includes("compensated_met_acidosis")) {
    // Winters' formula: expected PaCO₂ = (1.5 × HCO₃) + 8 ± 2
    const expectedLow  = (1.5 * hco3 + 8) - 2;
    const expectedHigh = (1.5 * hco3 + 8) + 2;
    expectedCO2 = `${expectedLow.toFixed(1)}–${expectedHigh.toFixed(1)} mmHg`;
    if (pco2 >= expectedLow && pco2 <= expectedHigh) {
      compResult = "Appropriate respiratory compensation (Winters' formula met)";
      compTone   = "emerald";
    } else if (pco2 > expectedHigh) {
      compResult = "PaCO₂ HIGHER than expected → Additional respiratory acidosis";
      compTone   = "red";
      findings.push("Concurrent respiratory acidosis superimposed on metabolic acidosis");
    } else {
      compResult = "PaCO₂ LOWER than expected → Additional respiratory alkalosis";
      compTone   = "blue";
      findings.push("Concurrent respiratory alkalosis superimposed on metabolic acidosis");
    }
    compDetail = `Winters' formula: Expected PaCO₂ = (1.5 × ${hco3}) + 8 ± 2 = ${expectedCO2}`;
  }

  else if (primaryDisorder === "metabolic_alkalosis" || primaryDisorder.includes("compensated_met_alkalosis")) {
    // Expected PaCO₂ = 40 + 0.6 × (HCO₃ - 24), max ~55 mmHg
    const exp  = 40 + 0.6 * (hco3 - 24);
    const expCapped = Math.min(exp, 55);
    expectedCO2 = `~${expCapped.toFixed(1)} mmHg (max 55)`;
    if (Math.abs(pco2 - expCapped) <= 4) {
      compResult = "Appropriate hypoventilation compensation";
      compTone   = "emerald";
    } else if (pco2 > expCapped + 4) {
      compResult = "PaCO₂ higher than expected → Additional respiratory acidosis";
      compTone   = "red";
    } else {
      compResult = "PaCO₂ lower than expected → Insufficient compensation or concurrent resp alkalosis";
      compTone   = "amber";
    }
    compDetail = `Expected PaCO₂ = 40 + 0.6 × (${hco3} − 24) = ~${expCapped.toFixed(1)} mmHg`;
  }

  else if (primaryDisorder === "respiratory_acidosis") {
    // Acute: HCO₃ rises 1 mmol/L per 10 mmHg ↑CO₂
    // Chronic: HCO₃ rises 3.5 mmol/L per 10 mmHg ↑CO₂
    const deltaCO2   = pco2 - 40;
    const expAcute   = 24 + (deltaCO2 / 10) * 1;
    const expChronic = 24 + (deltaCO2 / 10) * 3.5;
    expectedHCO3     = `Acute: ~${expAcute.toFixed(1)} | Chronic: ~${expChronic.toFixed(1)} mmol/L`;
    if      (hco3 <= expAcute + 2)   { compResult = "Acute (minimal metabolic compensation)"; compTone = "amber"; }
    else if (hco3 >= expChronic - 2) { compResult = "Chronic (full metabolic compensation)";  compTone = "emerald"; }
    else                              { compResult = "Partially compensated";                   compTone = "amber"; }
    if (hco3 > expChronic + 3) { findings.push("HCO₃⁻ exceeds chronic compensation — concurrent metabolic alkalosis"); }
    compDetail = `ΔCO₂ = ${deltaCO2} mmHg · Expected HCO₃⁻: ${expectedHCO3}`;
  }

  else if (primaryDisorder === "respiratory_alkalosis") {
    // Acute: HCO₃ falls 2 mmol/L per 10 mmHg ↓CO₂
    // Chronic: HCO₃ falls 5 mmol/L per 10 mmHg ↓CO₂
    const deltaCO2   = 40 - pco2;
    const expAcute   = 24 - (deltaCO2 / 10) * 2;
    const expChronic = 24 - (deltaCO2 / 10) * 5;
    expectedHCO3     = `Acute: ~${expAcute.toFixed(1)} | Chronic: ~${Math.max(expChronic, 15).toFixed(1)} mmol/L`;
    if      (hco3 >= expAcute - 2)   { compResult = "Acute (minimal metabolic compensation)"; compTone = "amber"; }
    else if (hco3 <= expChronic + 2) { compResult = "Chronic (full metabolic compensation)";  compTone = "emerald"; }
    else                              { compResult = "Partially compensated";                   compTone = "amber"; }
    compDetail = `ΔCO₂ = ${deltaCO2} mmHg · Expected HCO₃⁻: ${expectedHCO3}`;
  }

  if (compDetail) {
    steps.push({
      num: 3,
      title: "Compensation Check",
      value: compDetail,
      result: compResult,
      tone: compTone,
    });
  }

  // ── STEP 4: Anion Gap ────────────────────────────────────────────────────────
  let ag = null, agCorrected = null, agStep = null;
  if (na && cl) {
    ag = na - (cl + hco3);
    // Albumin correction: for every 10 g/L below 40 g/L, add 2.5 to AG
    const albCorrection = albumin ? 2.5 * ((40 - albumin) / 10) : 0;
    agCorrected         = albumin ? +(ag + albCorrection).toFixed(1) : null;
    const agDisplay     = agCorrected ?? ag;
    const agHigh        = agDisplay > 12;

    if (agHigh) {
      agType = "HAGMA";
      findings.push(`Elevated anion gap (AG = ${agDisplay}${agCorrected ? " corrected" : ""}) → HAGMA`);
    } else {
      agType = "NAGMA";
    }

    agStep = {
      num: 4,
      title: "Anion Gap",
      value: `AG = Na⁺ − (Cl⁻ + HCO₃⁻) = ${na} − (${cl} + ${hco3}) = ${ag}${agCorrected ? ` → Albumin-corrected: ${agCorrected}` : ""}`,
      normal: "Normal: 8–12 mmol/L (12 without albumin correction)",
      result: agHigh ? `ELEVATED AG = ${agDisplay} → HAGMA` : `NORMAL AG = ${agDisplay} → NAGMA / Hyperchloraemic`,
      detail: albumin
        ? `Albumin ${albumin} g/L → correction +${albCorrection.toFixed(1)} → corrected AG ${agCorrected}`
        : "Albumin not entered — hypoalbuminaemia (common in critical illness) may mask a true elevated AG",
      tone: agHigh ? "red" : "slate",
    };
    steps.push(agStep);

    // ── STEP 5: Delta Ratio (if HAGMA + metabolic acidosis) ──────────────────
    if (agHigh && (primaryDisorder === "metabolic_acidosis" || primaryDisorder.includes("met_acidosis"))) {
      const deltaAG   = agDisplay - 12;  // change from normal AG
      const deltaHCO3 = 24 - hco3;       // change from normal HCO3
      const deltaRatio = deltaHCO3 > 0 ? +(deltaAG / deltaHCO3).toFixed(2) : null;

      let drResult = "", drTone = "slate";
      if (deltaRatio !== null) {
        if      (deltaRatio < 0.4)  { drResult = "Delta ratio <0.4 → Concurrent NAGMA (more HCO₃ lost than AG gained)"; drTone = "amber"; }
        else if (deltaRatio < 1.0)  { drResult = "Delta ratio 0.4–1.0 → Mixed HAGMA + NAGMA"; drTone = "amber"; }
        else if (deltaRatio <= 2.0) { drResult = "Delta ratio 1–2 → Pure HAGMA (expected range)"; drTone = "emerald"; }
        else                         { drResult = "Delta ratio >2 → Concurrent metabolic alkalosis (HCO₃ higher than gap predicts)"; drTone = "violet"; }
      }

      steps.push({
        num: 5,
        title: "Delta Ratio (Mixed Disorder Screen)",
        value: `ΔAG / ΔHCO₃⁻ = (${agDisplay} − 12) / (24 − ${hco3}) = ${deltaRatio}`,
        normal: "<0.4 = NAGMA co-exists · 1–2 = pure HAGMA · >2 = metabolic alkalosis co-exists",
        result: drResult,
        tone: drTone,
      });
    }
  }

  // ── STEP 6: Oxygenation ──────────────────────────────────────────────────────
  if (pao2 !== null && pao2 !== "") {
    const normalPaO2 = n.pao2;
    const paO2Status = pao2 < normalPaO2[0]
      ? (pao2 < 60 ? "SEVERE hypoxaemia" : "Mild-moderate hypoxaemia")
      : (pao2 > 120 ? "HYPEROXIA — reduce FiO₂" : "Normal");

    let aaGrad = null, aaDetail = "";
    if (fio2) {
      const PiO2 = fio2 * (760 - 47);
      const PAO2 = PiO2 - (pco2 / 0.8);
      aaGrad     = +(PAO2 - pao2).toFixed(1);
      // Normal A-a gradient rises with age: ~2.5 + (age in years × 0.21)
      const estAgeYears  = ageMonths / 12;
      const normalAaGrad = +(2.5 + estAgeYears * 0.21).toFixed(1);
      aaDetail = `A-a gradient = ${aaGrad} mmHg (normal for age: ~${normalAaGrad} mmHg). ${aaGrad > normalAaGrad * 2 ? "Elevated — intrapulmonary shunt, V/Q mismatch, or diffusion defect." : "Normal."}`;
    }

    steps.push({
      num: steps.length + 1,
      title: "Oxygenation",
      value: `PaO₂ = ${pao2} mmHg${fio2 ? ` on FiO₂ ${fio2}` : ""}`,
      normal: `${normalPaO2[0]}–${normalPaO2[1]} mmHg (${n.label})`,
      result: paO2Status,
      detail: aaGrad !== null ? aaDetail : "Enter FiO₂ to calculate A-a gradient",
      tone: pao2 < 60 ? "red" : pao2 > 120 ? "amber" : "emerald",
    });

    if (pao2 < 60) findings.push("Significant hypoxaemia — immediate O₂ therapy or ventilatory support");
    if (pao2 > 120) findings.push("Hyperoxaemia — reduce FiO₂ (causes oxidative stress, especially in neonates)");
  }

  // ── Lactate ──────────────────────────────────────────────────────────────────
  if (lactate && lactate > 2) {
    findings.push(`Elevated lactate ${lactate} mmol/L → tissue hypoperfusion / type A lactic acidosis. Treat underlying cause.`);
    if (lactate > 4) findings.push("Severe hyperlactataemia (>4) — associated with >50% mortality in septic shock. Resuscitate aggressively.");
  }

  return { steps, findings, primaryDisorder, agType, tone, normals: n };
}

// ─── DIFFERENTIALS DATABASE ────────────────────────────────────────────────────
const DIFFERENTIALS = {
  HAGMA: {
    mnemonic: "GOLDMARK",
    title: "High Anion Gap Metabolic Acidosis (HAGMA) — GOLDMARK",
    tone: "red",
    causes: [
      { letter: "G", cause: "Glycols (ethylene glycol — antifreeze; propylene glycol — IV medications)", paeds: "Ingestion of automotive antifreeze — sweet taste, entices children. High osmolal gap." },
      { letter: "O", cause: "Oxoproline / 5-oxoprolinuria (pyroglutamic acidosis)", paeds: "Chronic paracetamol use (depletes glutathione) or metabolic enzyme defects. Check with urine organic acids." },
      { letter: "L", cause: "L-Lactate (lactic acidosis — most common)", paeds: "Sepsis (most common), shock (any cause), hypoxia, seizures, liver failure, inborn errors of metabolism (IEM)." },
      { letter: "D", cause: "D-Lactate", paeds: "Short gut syndrome, intestinal bacterial overgrowth. Standard lactate assay misses it — specific D-lactate assay needed." },
      { letter: "M", cause: "Methanol", paeds: "Ingestion (household cleaning products, windshield washer fluid). High osmolal gap + visual symptoms." },
      { letter: "A", cause: "Aspirin (salicylate toxicity)", paeds: "Classically: mixed respiratory alkalosis + HAGMA. Tinnitus, hyperventilation. Check salicylate level." },
      { letter: "R", cause: "Renal failure (uraemic acidosis)", paeds: "Accumulation of sulphate, phosphate, urate. Usually AG 15–20. Check creatinine, BUN." },
      { letter: "K", cause: "Ketoacidosis (DKA, starvation, alcoholic)", paeds: "DKA most common in children. Check glucose, ketones (blood or urine). Starvation ketosis in fasting infants." },
    ],
    extra: [
      "Always check osmolal gap if toxic alcohol ingestion suspected: Osmolal gap = measured Osm − calculated Osm. Calc Osm = 2×Na + glucose/18 + urea/2.8. Gap >10 mOsm/kg = unmeasured osmoles present.",
      "Lactic acidosis in children: Type A (hypoperfusion) = sepsis, cardiac failure, severe anaemia. Type B (metabolic) = IEM (MSUD, methylmalonic acidaemia, pyruvate dehydrogenase deficiency).",
      "IEM should always be considered in neonates/infants with unexplained HAGMA — send metabolic screen (amino acids, organic acids, ammonia, lactate, pyruvate).",
    ],
  },
  NAGMA: {
    mnemonic: "HARDUPS",
    title: "Normal Anion Gap Metabolic Acidosis (NAGMA) — HARDUPS",
    tone: "orange",
    causes: [
      { letter: "H", cause: "Hyperchloraemia (iatrogenic — excessive normal saline)", paeds: "Most common NAGMA in PICU — large-volume NS resuscitation. Use balanced crystalloids (Hartmann/LR) instead." },
      { letter: "A", cause: "Addison's disease / adrenal insufficiency", paeds: "Primary or secondary. Hyponatraemia, hyperkalaemia, hypoglycaemia. Check cortisol." },
      { letter: "R", cause: "Renal tubular acidosis (RTA) types 1, 2, 4", paeds: "Type 1 (distal): hypokalaemia, nephrocalcinosis. Type 2 (proximal): Fanconi syndrome, cystinosis. Type 4 (hyperkalaemic): aldosterone deficiency." },
      { letter: "D", cause: "Diarrhoea (GI bicarbonate loss)", paeds: "Most common NAGMA cause in children globally. Severe dehydration + metabolic acidosis = diarrhoea until proven otherwise." },
      { letter: "U", cause: "Ureteral diversion / urinary fistula", paeds: "Post-surgical. Ileal conduit causes hyperchloraemic acidosis via urinary Cl⁻ absorption." },
      { letter: "P", cause: "Pancreatic fistula / biliary losses", paeds: "HCO₃-rich pancreatic juice lost. Rare in children." },
      { letter: "S", cause: "Saline (excess) / Spironolactone overdose", paeds: "NS resuscitation — most iatrogenic NAGMA. Prefer balanced crystalloids." },
    ],
    extra: [
      "Urinary anion gap (UAG) helps differentiate renal vs GI cause: UAG = urinary Na⁺ + K⁺ − Cl⁻. Negative UAG = GI loss (appropriate NH₄⁺ excretion). Positive UAG = renal cause (RTA, Addison's).",
      "In acute gastroenteritis with severe dehydration, NAGMA is a marker of severity. Correct volume deficit with balanced crystalloids, not pure sodium bicarbonate.",
      "Paediatric RTA: suspect if persistent NAGMA, hypokalaemia, alkaline urine (pH >5.5 during acidosis), growth retardation, polyuria.",
    ],
  },
  resp_acidosis: {
    title: "Respiratory Acidosis — Causes",
    tone: "orange",
    groups: [
      { label: "Central (↓ Respiratory Drive)", items: [
        "Opioid/sedative overdose — most common (morphine, benzodiazepines, anaesthetic agents)",
        "Raised ICP / brainstem herniation — Cushing triad",
        "Seizures (post-ictal hypoventilation)",
        "Central sleep apnoea / hypoventilation syndromes",
        "CNS infection — meningitis, encephalitis",
      ]},
      { label: "Neuromuscular (↓ Chest Wall / Pump)", items: [
        "Guillain-Barré syndrome — ascending paralysis",
        "Myasthenia gravis / neuromuscular blockade",
        "Spinal cord injury above C3–C5",
        "Duchenne muscular dystrophy (respiratory failure)",
        "Infant botulism — bulbar and respiratory muscle weakness",
        "Phrenic nerve injury (post-cardiac surgery)",
      ]},
      { label: "Airway / Pulmonary", items: [
        "Severe asthma / status asthmaticus — silent chest = hypercapnia",
        "ARDS / severe pneumonia / pulmonary oedema",
        "Airway obstruction — foreign body, croup, epiglottitis",
        "Bronchopulmonary dysplasia (chronic CO₂ retention)",
        "Tracheomalacia / laryngomalacia",
      ]},
    ],
  },
  resp_alkalosis: {
    title: "Respiratory Alkalosis — Causes",
    tone: "blue",
    groups: [
      { label: "Most Common", items: [
        "Anxiety / pain / crying (most common in children) — hyperventilation",
        "Fever / sepsis — cytokine-driven hyperventilation",
        "Hypoxia — compensatory hyperventilation (most important to exclude)",
        "Mechanical ventilation — iatrogenic (excessive RR or TV)",
      ]},
      { label: "Central / Pulmonary", items: [
        "Salicylate toxicity — early phase (mixed resp alkalosis + met acidosis later)",
        "Hepatic failure — hyperammonaemia stimulates respiratory centre",
        "CNS lesion affecting brainstem respiratory centre",
        "Pulmonary embolism — hypoxia + pain-driven hyperventilation",
        "High altitude — hypoxic hyperventilation",
      ]},
    ],
  },
  met_alkalosis: {
    title: "Metabolic Alkalosis — Causes",
    tone: "violet",
    groups: [
      { label: "Chloride-Responsive (Urine Cl⁻ <20) — most common", items: [
        "Vomiting — loss of HCl (pyloric stenosis: classic hypochloraemic hypokalaemic met alkalosis)",
        "Nasogastric suction — HCl loss",
        "Post-diuretic therapy — volume depletion + urinary Cl⁻ loss",
        "Post-hypercapnia — HCO₃ retained after CO₂ normalised",
        "Cystic fibrosis — sweat Cl⁻ loss",
      ]},
      { label: "Chloride-Resistant (Urine Cl⁻ >20) — rarer", items: [
        "Hyperaldosteronism (primary or secondary) — Bartter/Gitelman syndromes in children",
        "Exogenous steroids / Cushing's syndrome",
        "Hypokalaemia (from any cause) — H⁺/K⁺ exchange",
        "Excess antacid (milk-alkali) or bicarbonate administration",
        "Liquorice / carbenoxolone ingestion",
      ]},
      { label: "Paediatric Pearls", items: [
        "Pyloric stenosis: infant (2–6 wks), projectile vomiting, hypochloraemic, hypokalaemic, metabolic alkalosis — paradoxical aciduria late",
        "Bartter syndrome: normotensive, hypokalaemia, high renin/aldosterone, diagnosed in childhood",
        "Post-cardiac surgery: diuretics + citrate in blood products → common met alkalosis in PICU",
      ]},
    ],
  },
};

// ─── STEP CARD ─────────────────────────────────────────────────────────────────
function StepCard({ step }) {
  const t = TONE[step.tone] || TONE.slate;
  return (
    <div className={`rounded-xl border p-4 bg-white dark:bg-slate-900/50 ${t.border}`}>
      <div className="flex items-start gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 ${t.bg} ${t.text}`}
             style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{step.num}</div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">{step.title}</div>
          <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mb-1.5 break-words">{step.value}</div>
          <div className={`font-bold text-sm mb-1 ${t.text}`}
               style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{step.result}</div>
          {step.detail && <div className="text-xs text-slate-500 dark:text-slate-400">{step.detail}</div>}
          {step.normal && (
            <div className="mt-1 text-[10px] font-mono text-slate-400">
              Normal: {step.normal}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DIFFERENTIAL SECTION ──────────────────────────────────────────────────────
function DifferentialSection({ diff }) {
  if (!diff) return null;
  const t = TONE[diff.tone] || TONE.slate;

  return (
    <div className={`rounded-xl border overflow-hidden bg-white dark:bg-slate-900/50 ${t.border}`}>
      <div className={`px-4 py-3 ${t.bg} border-b ${t.border}`}>
        <div className={`font-bold text-sm ${t.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          {diff.title}
          {diff.mnemonic && <span className="ml-2 font-mono text-[10px] opacity-70">({diff.mnemonic})</span>}
        </div>
      </div>
      <div className="p-4 space-y-3">
        {/* Mnemonic table */}
        {diff.causes && (
          <div className="space-y-1.5">
            {diff.causes.map(c => (
              <div key={c.letter} className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2">
                <div className="flex items-start gap-2">
                  <span className={`font-black text-base flex-shrink-0 w-5 ${t.text}`}
                        style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{c.letter}</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{c.cause}</div>
                    <div className={`text-[10px] font-mono mt-0.5 ${t.text}`}>
                      🧒 Paeds: {c.paeds}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Groups */}
        {diff.groups && diff.groups.map(g => (
          <div key={g.label}>
            <div className={`font-mono text-[9px] uppercase tracking-widest mb-1.5 ${t.text}`}>{g.label}</div>
            <div className="space-y-1">
              {g.items.map((item, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <ArrowRight size={9} weight="bold" className={`${t.text} flex-shrink-0 mt-0.5`} />{item}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Extra pearls */}
        {diff.extra && (
          <div className={`rounded-lg border p-3 ${t.bg} ${t.border} space-y-1.5`}>
            <div className={`font-mono text-[9px] uppercase tracking-widest mb-1 ${t.text}`}>Clinical Pearls</div>
            {diff.extra.map((e, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-200">
                <Lightbulb size={9} weight="fill" className={`${t.text} flex-shrink-0 mt-0.5`} />{e}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NORMAL RANGES TABLE ────────────────────────────────────────────────────────
function NormalsTable() {
  const ageGroups = [
    { label: "Preterm / Newborn (<4 wks)",   pH: "7.25–7.40", co2: "35–50", hco3: "17–23", pao2: "45–70",  be: "−7 to −3" },
    { label: "Term Neonate (0–1 mo)",         pH: "7.30–7.40", co2: "35–45", hco3: "19–22", pao2: "50–80",  be: "−5 to −2" },
    { label: "Infant (1–12 mo)",              pH: "7.34–7.45", co2: "34–45", hco3: "20–25", pao2: "75–100", be: "−4 to +2" },
    { label: "Toddler (1–3 yr)",              pH: "7.35–7.45", co2: "34–44", hco3: "21–25", pao2: "80–100", be: "−3 to +3" },
    { label: "Child / Adolescent (>3 yr)",    pH: "7.35–7.45", co2: "35–45", hco3: "22–26", pao2: "80–100", be: "−3 to +3" },
  ];
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-slate-900 dark:bg-slate-950 text-white">
            {["Age Group","pH","PaCO₂ (mmHg)","HCO₃⁻ (mmol/L)","PaO₂ (mmHg)","Base Excess"].map(h => (
              <th key={h} className="p-2.5 text-left font-mono text-[8px] uppercase tracking-widest whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ageGroups.map((r, i) => (
            <tr key={r.label} className={`border-t border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? "bg-white dark:bg-slate-900/20" : "bg-slate-50/50 dark:bg-slate-900/40"}`}>
              <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{r.label}</td>
              <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{r.pH}</td>
              <td className="p-2.5 font-mono text-blue-600 dark:text-blue-400">{r.co2}</td>
              <td className="p-2.5 font-mono text-violet-600 dark:text-violet-400">{r.hco3}</td>
              <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{r.pao2}</td>
              <td className="p-2.5 font-mono text-amber-600 dark:text-amber-400">{r.be}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 text-[9px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800">
        Sources: Gomella's Neonatology 8e · Tintinalli Emergency Medicine 9e · LITFL Acid-Base · PALS 2020 ·
        Note: PaO₂ targets in preterm infants: 45–65 mmHg (avoid hyperoxia — retinopathy of prematurity risk)
      </div>
    </div>
  );
}

// ─── COMPENSATION FORMULAS REFERENCE ──────────────────────────────────────────
function CompensationRef() {
  const rows = [
    { disorder: "Metabolic Acidosis",   system: "Respiratory ↓CO₂", formula: "Expected PaCO₂ = (1.5 × HCO₃⁻) + 8 ± 2  (Winters' formula)", limit: "PaCO₂ min ~10–15 mmHg" },
    { disorder: "Metabolic Alkalosis",  system: "Respiratory ↑CO₂", formula: "Expected PaCO₂ = 40 + 0.6 × (HCO₃⁻ − 24)",                    limit: "PaCO₂ max ~55 mmHg" },
    { disorder: "Resp. Acidosis (acute)",system:"Renal ↑HCO₃⁻",     formula: "↑HCO₃⁻ = 1 mmol/L per 10 mmHg ↑PaCO₂",                       limit: "Max HCO₃⁻ ~30" },
    { disorder: "Resp. Acidosis (chronic)",system:"Renal ↑HCO₃⁻",   formula: "↑HCO₃⁻ = 3.5 mmol/L per 10 mmHg ↑PaCO₂",                     limit: "Max HCO₃⁻ ~45" },
    { disorder: "Resp. Alkalosis (acute)",system:"Renal ↓HCO₃⁻",    formula: "↓HCO₃⁻ = 2 mmol/L per 10 mmHg ↓PaCO₂",                       limit: "Min HCO₃⁻ ~18" },
    { disorder: "Resp. Alkalosis (chronic)",system:"Renal ↓HCO₃⁻",  formula: "↓HCO₃⁻ = 5 mmol/L per 10 mmHg ↓PaCO₂",                       limit: "Min HCO₃⁻ ~12–15" },
  ];
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-slate-900 dark:bg-slate-950 text-white">
            {["Primary Disorder","Compensation","Formula","Limit"].map(h => (
              <th key={h} className="p-2.5 text-left font-mono text-[8px] uppercase tracking-widest whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-t border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? "bg-white dark:bg-slate-900/20" : "bg-slate-50/50 dark:bg-slate-900/40"}`}>
              <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-200">{r.disorder}</td>
              <td className="p-2.5 font-mono text-blue-600 dark:text-blue-400">{r.system}</td>
              <td className="p-2.5 font-mono text-violet-600 dark:text-violet-400">{r.formula}</td>
              <td className="p-2.5 font-mono text-amber-600 dark:text-amber-400">{r.limit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── INPUT FIELD ───────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, unit, step = "0.1", min, max, optional }) {
  return (
    <div>
      <label className="block font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">
        {label}{optional && <span className="ml-1 text-slate-300 dark:text-slate-600">(opt)</span>}
      </label>
      <div className="relative">
        <input
          type="number" step={step} min={min} max={max}
          value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 font-mono tabular-nums"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function ABGTab() {
  const { weight } = useWeight();

  // ── Inputs ──
  const [pH,      setpH]      = useState("");
  const [pco2,    setPco2]    = useState("");
  const [hco3,    setHco3]    = useState("");
  const [pao2,    setPao2]    = useState("");
  const [be,      setBe]      = useState("");
  const [na,      setNa]      = useState("");
  const [cl,      setCl]      = useState("");
  const [albumin, setAlbumin] = useState("");
  const [lactate, setLactate] = useState("");
  const [fio2,    setFio2]    = useState("");
  const [ageMonths, setAgeMonths] = useState("60");
  const [ageUnit,   setAgeUnit]   = useState("months");

  const [activeSection, setActiveSection] = useState("interpreter");

  const ageMonthsCalc = useMemo(() => {
    const n = parseFloat(ageMonths);
    if (isNaN(n)) return 60;
    return ageUnit === "years" ? n * 12 : n;
  }, [ageMonths, ageUnit]);

  const hasMinimum = pH !== "" && pco2 !== "" && hco3 !== "";

  const result = useMemo(() => {
    if (!hasMinimum) return null;
    return interpretABG({
      pH:      parseFloat(pH),
      pco2:    parseFloat(pco2),
      hco3:    parseFloat(hco3),
      pao2:    pao2    !== "" ? parseFloat(pao2)    : null,
      na:      na      !== "" ? parseFloat(na)      : null,
      cl:      cl      !== "" ? parseFloat(cl)      : null,
      albumin: albumin !== "" ? parseFloat(albumin) : null,
      lactate: lactate !== "" ? parseFloat(lactate) : null,
      fio2:    fio2    !== "" ? parseFloat(fio2)    : null,
      be:      be      !== "" ? parseFloat(be)      : null,
      ageMonths: ageMonthsCalc,
    });
  }, [pH, pco2, hco3, pao2, na, cl, albumin, lactate, fio2, be, ageMonthsCalc, hasMinimum]);

  function reset() {
    setpH(""); setPco2(""); setHco3(""); setPao2(""); setBe("");
    setNa(""); setCl(""); setAlbumin(""); setLactate(""); setFio2("");
  }

  // Which differentials to show based on result
  const diffsToShow = useMemo(() => {
    if (!result) return [];
    const d = [];
    if (result.agType === "HAGMA")                                            d.push(DIFFERENTIALS.HAGMA);
    if (result.agType === "NAGMA" && result.primaryDisorder?.includes("met_acidosis")) d.push(DIFFERENTIALS.NAGMA);
    if (result.primaryDisorder?.includes("resp_acid"))                        d.push(DIFFERENTIALS.resp_acidosis);
    if (result.primaryDisorder?.includes("resp_alk"))                         d.push(DIFFERENTIALS.resp_alkalosis);
    if (result.primaryDisorder?.includes("met_alk"))                          d.push(DIFFERENTIALS.met_alkalosis);
    return d;
  }, [result]);

  const resultTone = result ? (TONE[result.tone] || TONE.slate) : TONE.slate;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          ABG Interpretation
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Paediatric-specific ABG analysis · auto-compensation check · HAGMA/NAGMA differentials ·
          Tintinalli 9e · LITFL · PaediatricFOAM · Gomella's Neonatology 8e
        </p>
      </div>

      {/* SUB-NAV */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "interpreter", label: "Interpreter" },
          { id: "normals",     label: "Normal Ranges" },
          { id: "formulas",    label: "Compensation Formulas" },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`px-3 py-2 rounded-lg border font-mono text-[11px] uppercase tracking-wider transition-all ${
              activeSection === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{s.label}</button>
        ))}
      </div>

      {/* ── NORMAL RANGES ── */}
      {activeSection === "normals" && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300">
            <Info size={13} weight="fill" className="flex-shrink-0 mt-0.5" />
            <div>Paediatric acid-base normal values differ significantly from adults, especially in neonates. Neonates have lower buffering capacity and lower HCO₃⁻ reserve. PaO₂ targets in preterms are deliberately lower to prevent retinopathy.</div>
          </div>
          <NormalsTable />
        </div>
      )}

      {/* ── COMPENSATION FORMULAS ── */}
      {activeSection === "formulas" && (
        <div className="space-y-4">
          <CompensationRef />
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4">
            <div className="font-bold text-xs text-amber-700 dark:text-amber-300 mb-2 uppercase tracking-widest font-mono">Key Principles (LITFL)</div>
            <div className="space-y-1">
              {[
                "pH and PaCO₂ always move in opposite directions in a simple disorder — if both go same direction → mixed metabolic disorder",
                "HCO₃⁻ and PaCO₂ always move in the same direction in compensation — if opposing → mixed disorder",
                "Compensation is never complete (pH never returns fully to normal in simple disorders) — if it does, suspect a mixed disorder",
                "Kidneys take 3–5 days to fully compensate respiratory disorders. Lungs compensate metabolic disorders in minutes–hours.",
                "Anion gap always calculate when metabolic acidosis is present — even if you think you know the cause",
                "Always albumin-correct the AG in critically ill children — hypoalbuminaemia is common and masks true HAGMA",
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-200">
                  <ArrowRight size={9} weight="bold" className="text-amber-500 flex-shrink-0 mt-0.5" />{p}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INTERPRETER ── */}
      {activeSection === "interpreter" && (
        <div className="space-y-5">
          {/* Input form */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Enter ABG Values</div>
              <button onClick={reset}
                className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowsClockwise size={10} weight="bold" /> Clear
              </button>
            </div>

            {/* Age selector */}
            <div className="mb-4 flex items-end gap-2">
              <div className="flex-1">
                <Field label="Patient Age" value={ageMonths} onChange={setAgeMonths} placeholder="e.g. 24" step="1" min="0" />
              </div>
              <select value={ageUnit} onChange={e => setAgeUnit(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none mb-0">
                <option value="months">months</option>
                <option value="years">years</option>
              </select>
              <div className="text-[10px] font-mono text-slate-400 pb-2 whitespace-nowrap">
                → {result?.normals?.label || "—"}
              </div>
            </div>

            {/* Primary ABG values */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <Field label="pH *"         value={pH}   onChange={setpH}   placeholder="7.35" unit="" step="0.01" min="6.5" max="8.0" />
              <Field label="PaCO₂ *"      value={pco2} onChange={setPco2} placeholder="40"   unit="mmHg" step="1" />
              <Field label="HCO₃⁻ *"      value={hco3} onChange={setHco3} placeholder="24"   unit="mmol/L" step="0.5" />
              <Field label="PaO₂"         value={pao2} onChange={setPao2} placeholder="90"   unit="mmHg" step="1" optional />
              <Field label="Base Excess"  value={be}   onChange={setBe}   placeholder="0"    unit="mmol/L" step="0.1" optional />
              <Field label="Lactate"      value={lactate} onChange={setLactate} placeholder="1.0" unit="mmol/L" step="0.1" optional />
            </div>

            {/* Electrolytes for AG */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-1">
              <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-2">Electrolytes (for anion gap)</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Field label="Na⁺"       value={na}      onChange={setNa}      placeholder="140" unit="mmol/L" step="1" optional />
                <Field label="Cl⁻"       value={cl}      onChange={setCl}      placeholder="105" unit="mmol/L" step="1" optional />
                <Field label="Albumin"   value={albumin} onChange={setAlbumin} placeholder="40"  unit="g/L"    step="1" optional />
                <Field label="FiO₂"      value={fio2}    onChange={setFio2}    placeholder="0.21" unit="(0–1)" step="0.01" min="0.21" max="1.0" optional />
              </div>
            </div>
          </div>

          {/* No minimum inputs */}
          {!hasMinimum && (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-8 text-center">
              <div className="text-slate-400 text-sm font-mono">Enter pH, PaCO₂ and HCO₃⁻ to begin interpretation</div>
              <div className="text-slate-300 dark:text-slate-600 text-xs font-mono mt-1">Electrolytes optional (required for anion gap)</div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Summary banner */}
              <div className={`rounded-xl border-2 p-4 ${resultTone.bg} ${resultTone.border}`}>
                <div className={`font-black text-xl mb-1 ${resultTone.text}`}
                     style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                  {result.steps[1]?.result || "Interpretation complete"}
                </div>
                <div className="flex flex-wrap gap-3 text-[10px] font-mono">
                  <span className={resultTone.text}>pH {pH}</span>
                  <span className="text-slate-400">·</span>
                  <span className={resultTone.text}>PaCO₂ {pco2} mmHg</span>
                  <span className="text-slate-400">·</span>
                  <span className={resultTone.text}>HCO₃⁻ {hco3} mmol/L</span>
                  {result.agType && (
                    <>
                      <span className="text-slate-400">·</span>
                      <span className={result.agType === "HAGMA" ? "text-red-600 dark:text-red-400 font-bold" : "text-slate-500"}>
                        {result.agType}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Additional findings */}
              {result.findings.length > 0 && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-1">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1.5">Additional Findings</div>
                  {result.findings.map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-200">
                      <Warning size={10} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />{f}
                    </div>
                  ))}
                </div>
              )}

              {/* Step-by-step */}
              <div className="space-y-2">
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Step-by-Step Interpretation</div>
                {result.steps.map(step => <StepCard key={step.num} step={step} />)}
              </div>

              {/* Differentials */}
              {diffsToShow.length > 0 && (
                <div className="space-y-4">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                    Differential Diagnosis
                  </div>
                  {diffsToShow.map((d, i) => <DifferentialSection key={i} diff={d} />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        Tintinalli Emergency Medicine 9e (Ch.22) · LITFL Acid-Base Series (litfl.com/acid-base) ·
        PaediatricFOAM · Gomella's Neonatology 8e · Winters' formula · GOLDMARK · HARDUPS
      </div>
    </div>
  );
}
