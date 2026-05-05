// ABGTab.jsx — Arterial Blood Gas Interpretation
// Step-by-step: pH → primary disorder → compensation check → mixed disorder → AG → clinical context
// Sources: Marino ICU Book · Cote & Lerman · PALS · Fleischer & Ludwig
// Paediatric age-appropriate normal ranges built in

import { useState, useMemo } from "react";
import {
  Warning, Lightbulb, ArrowRight, CheckCircle, Info,
  Flask,
} from "@phosphor-icons/react";

// ─── NORMAL RANGES BY AGE GROUP ───────────────────────────────────────────────
const AGE_NORMALS = [
  { label: "Neonate (<1 mo)",     pH: [7.30, 7.40], pco2: [35, 45], hco3: [19, 22], pao2: [60, 80]  },
  { label: "Infant (1–12 mo)",    pH: [7.34, 7.46], pco2: [30, 40], hco3: [20, 25], pao2: [75, 100] },
  { label: "Child (1–12 yr)",     pH: [7.35, 7.45], pco2: [35, 45], hco3: [22, 26], pao2: [80, 100] },
  { label: "Adolescent (≥13 yr)", pH: [7.35, 7.45], pco2: [35, 45], hco3: [22, 26], pao2: [80, 100] },
];

const TONE = {
  red:     { text: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-950/30",         border: "border-red-200 dark:border-red-800"       },
  emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  amber:   { text: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200 dark:border-amber-800"   },
  blue:    { text: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-950/30",       border: "border-blue-200 dark:border-blue-800"     },
  violet:  { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30",   border: "border-violet-200 dark:border-violet-800" },
  slate:   { text: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-50 dark:bg-slate-900/50",     border: "border-slate-200 dark:border-slate-700"   },
  orange:  { text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30",   border: "border-orange-200 dark:border-orange-800" },
};

// ─── INTERPRETATION ENGINE ────────────────────────────────────────────────────
function interpretABG({ pH, pco2, hco3, pao2, fio2, na, cl, ageIdx }) {
  const norms = AGE_NORMALS[ageIdx];
  const steps = [];
  const findings = [];
  let primaryLabel = "";
  let primaryTone  = "slate";
  let summaryTone  = "emerald";

  const phLo  = norms.pH[0],   phHi  = norms.pH[1];
  const co2Lo = norms.pco2[0], co2Hi = norms.pco2[1];
  const hcoLo = norms.hco3[0], hcoHi = norms.hco3[1];

  const phNum   = parseFloat(pH);
  const co2Num  = parseFloat(pco2);
  const hco3Num = parseFloat(hco3);
  const pao2Num = parseFloat(pao2);
  const fio2Num = parseFloat(fio2) || 0.21;
  const naNum   = parseFloat(na);
  const clNum   = parseFloat(cl);

  const phAcid = phNum < phLo;
  const phAlk  = phNum > phHi;
  const phNorm = !phAcid && !phAlk;

  const co2High = co2Num > co2Hi;
  const co2Low  = co2Num < co2Lo;
  const co2Norm = !co2High && !co2Low;

  const hco3High = hco3Num > hcoHi;
  const hco3Low  = hco3Num < hcoLo;
  const hco3Norm = !hco3High && !hco3Low;

  // ── STEP 1: pH ──
  let phStatus, phDesc, phSeverity;
  if (phAcid) {
    phSeverity = phNum < 7.10 ? "Life-threatening acidaemia. Immediate action required." : phNum < 7.20 ? "Severe acidaemia." : "Mild–moderate acidaemia.";
    phStatus = "ACIDAEMIA";
    phDesc   = phSeverity;
    summaryTone = "red";
  } else if (phAlk) {
    phSeverity = phNum > 7.60 ? "Severe alkalaemia." : "Mild–moderate alkalaemia.";
    phStatus = "ALKALAEMIA";
    phDesc   = phSeverity;
    summaryTone = "blue";
  } else {
    phStatus = "NORMAL pH";
    phDesc   = "pH within normal limits. May still have mixed disorder.";
    summaryTone = "emerald";
  }
  steps.push({
    num: 1, title: "pH — Acid-Base Status",
    body: `${phNum}`,
    result: phStatus,
    detail: `${phDesc}\nNormal: ${phLo}–${phHi} (${norms.label})`,
    tone: phAcid ? "red" : phAlk ? "blue" : "emerald",
  });

  // ── STEP 2: Primary Disorder ──
  // Logic:
  //   Acidaemia: if PaCO2 HIGH → respiratory acidosis PRIMARY
  //              if HCO3 LOW → metabolic acidosis PRIMARY
  //              if both abnormal → whichever magnitude is the primary driver
  //   Alkalaemia: if PaCO2 LOW → respiratory alkalosis PRIMARY
  //               if HCO3 HIGH → metabolic alkalosis PRIMARY
  //   Normal pH: could be mixed (compensated or cancelling)

  let primaryDisorder = "";
  let primaryMechanism = "";
  let step2Tone = "slate";

  if (phAcid) {
    if (co2High && hco3Low) {
      // Both abnormal in acidosis direction — determine which is primary
      // Primary = the one NOT compensating; compensation is in opposite direction
      // In resp acidosis: CO2 up → kidney retains HCO3 (HCO3 should be HIGH or normal)
      // In met acidosis: HCO3 down → lungs blow off CO2 (CO2 should be LOW or normal)
      // Here BOTH are in acidosis direction → mixed resp + met acidosis
      primaryDisorder = "Mixed Respiratory + Metabolic Acidosis";
      primaryMechanism = `PaCO₂ ↑ elevated · HCO₃⁻ ↓ low — both driving acidosis simultaneously`;
      step2Tone = "red";
      findings.push("Mixed respiratory and metabolic acidosis — dual insult");
    } else if (co2High) {
      primaryDisorder = "Primary Respiratory Acidosis";
      primaryMechanism = `PaCO₂ ↑ elevated (${co2Num} mmHg) · HCO₃⁻ ${hco3Norm ? "normal" : hco3High ? "↑ elevated (compensatory)" : "↓ low"}`;
      step2Tone = "red";
    } else if (hco3Low) {
      primaryDisorder = "Primary Metabolic Acidosis";
      primaryMechanism = `HCO₃⁻ ↓ low (${hco3Num} mmol/L) · PaCO₂ ${co2Norm ? "normal" : co2Low ? "↓ low (compensatory)" : "↑ elevated"}`;
      step2Tone = "red";
    } else {
      // pH acid but both CO2 and HCO3 normal — early/borderline
      primaryDisorder = "Mild Acidaemia — borderline";
      primaryMechanism = "PaCO₂ and HCO₃⁻ within normal limits — early or borderline process";
      step2Tone = "amber";
    }
  } else if (phAlk) {
    if (co2Low && hco3High) {
      primaryDisorder = "Mixed Respiratory + Metabolic Alkalosis";
      primaryMechanism = `PaCO₂ ↓ low · HCO₃⁻ ↑ elevated — both driving alkalosis simultaneously`;
      step2Tone = "blue";
      findings.push("Mixed respiratory and metabolic alkalosis — dual insult");
    } else if (co2Low) {
      primaryDisorder = "Primary Respiratory Alkalosis";
      primaryMechanism = `PaCO₂ ↓ low (${co2Num} mmHg) · HCO₃⁻ ${hco3Norm ? "normal" : hco3Low ? "↓ low (compensatory)" : "↑ elevated"}`;
      step2Tone = "blue";
    } else if (hco3High) {
      primaryDisorder = "Primary Metabolic Alkalosis";
      primaryMechanism = `HCO₃⁻ ↑ elevated (${hco3Num} mmol/L) · PaCO₂ ${co2Norm ? "normal" : co2High ? "↑ elevated (compensatory)" : "↓ low"}`;
      step2Tone = "blue";
    } else {
      primaryDisorder = "Mild Alkalaemia — borderline";
      primaryMechanism = "PaCO₂ and HCO₃⁻ within normal limits";
      step2Tone = "amber";
    }
  } else {
    // Normal pH
    if (co2High && hco3High) {
      primaryDisorder = "Compensated Respiratory Acidosis OR Compensated Metabolic Alkalosis";
      primaryMechanism = "pH normal — PaCO₂ ↑ with HCO₃⁻ ↑. Clinical context required to identify primary disorder.";
      step2Tone = "amber";
    } else if (co2Low && hco3Low) {
      primaryDisorder = "Compensated Respiratory Alkalosis OR Compensated Metabolic Acidosis";
      primaryMechanism = "pH normal — PaCO₂ ↓ with HCO₃⁻ ↓. Clinical context required.";
      step2Tone = "amber";
    } else if (co2High && hco3Low) {
      primaryDisorder = "Mixed Respiratory Acidosis + Metabolic Acidosis (Normal pH by chance)";
      primaryMechanism = "Opposing disorders cancelling each other — do not be reassured by normal pH";
      step2Tone = "red";
      findings.push("Normal pH masking opposing mixed disorder — treat both");
    } else if (co2Low && hco3High) {
      primaryDisorder = "Mixed Respiratory Alkalosis + Metabolic Alkalosis (Normal pH)";
      primaryMechanism = "Opposing alkalotic disorders with normal pH";
      step2Tone = "blue";
    } else {
      primaryDisorder = "Normal Acid-Base Status";
      primaryMechanism = "pH, PaCO₂, and HCO₃⁻ all within normal limits";
      step2Tone = "emerald";
    }
  }

  primaryLabel = primaryDisorder;
  primaryTone  = step2Tone;

  steps.push({
    num: 2, title: "Primary Disorder",
    body: `PaCO₂ ${co2Num} mmHg · HCO₃⁻ ${hco3Num} mmol/L`,
    result: primaryDisorder,
    detail: `${primaryMechanism}\nNormal: CO₂: ${co2Lo}–${co2Hi} | HCO₃⁻: ${hcoLo}–${hcoHi}`,
    tone: step2Tone,
  });

  // ── STEP 3: Compensation Check ──
  let compStep = null;
  const isPrimaryRespAcid = primaryDisorder === "Primary Respiratory Acidosis";
  const isPrimaryRespAlk  = primaryDisorder === "Primary Respiratory Alkalosis";
  const isPrimaryMetAcid  = primaryDisorder === "Primary Metabolic Acidosis";
  const isPrimaryMetAlk   = primaryDisorder === "Primary Metabolic Alkalosis";

  if (isPrimaryMetAcid) {
    // Winters' formula: expected PaCO2 = (1.5 × HCO3) + 8 ± 2
    const expLo = +(1.5 * hco3Num + 8 - 2).toFixed(1);
    const expHi = +(1.5 * hco3Num + 8 + 2).toFixed(1);
    let compResult, compTone, compNote;
    if (co2Num >= expLo && co2Num <= expHi) {
      compResult = "Appropriate respiratory compensation";
      compTone = "emerald";
      compNote = "Simple metabolic acidosis — no additional respiratory disorder";
    } else if (co2Num > expHi) {
      compResult = "PaCO₂ HIGHER than expected → Additional respiratory acidosis";
      compTone = "red";
      findings.push("Concurrent respiratory acidosis superimposed on metabolic acidosis");
    } else {
      compResult = "PaCO₂ LOWER than expected → Additional respiratory alkalosis";
      compTone = "blue";
      findings.push("Concurrent respiratory alkalosis superimposed on metabolic acidosis");
    }
    compStep = {
      num: 3, title: "Compensation Check",
      body: `Winters' formula: Expected PaCO₂ = (1.5 × ${hco3Num}) + 8 ± 2 = ${expLo}–${expHi} mmHg`,
      result: compResult,
      detail: `Measured PaCO₂: ${co2Num} mmHg`,
      tone: compResult.includes("Appropriate") ? "emerald" : compResult.includes("HIGHER") ? "red" : "blue",
    };
  } else if (isPrimaryRespAcid) {
    // Acute: HCO3 rises 1 per 10 CO2 rise; Chronic: HCO3 rises 3.5 per 10 CO2 rise
    const co2Rise = co2Num - 40;
    const expHco3Acute   = +(24 + (co2Rise / 10) * 1).toFixed(1);
    const expHco3Chronic = +(24 + (co2Rise / 10) * 3.5).toFixed(1);
    let compResult, compTone;
    if (hco3Num >= expHco3Acute - 2 && hco3Num <= expHco3Acute + 2) {
      compResult = `Acute respiratory acidosis — HCO₃⁻ ≈ expected (${expHco3Acute} mmol/L)`;
      compTone = "emerald";
    } else if (hco3Num >= expHco3Chronic - 2 && hco3Num <= expHco3Chronic + 2) {
      compResult = `Chronic respiratory acidosis — HCO₃⁻ ≈ expected (${expHco3Chronic} mmol/L)`;
      compTone = "amber";
    } else if (hco3Num < expHco3Acute - 2) {
      compResult = `HCO₃⁻ lower than expected → superimposed metabolic acidosis`;
      compTone = "red";
      findings.push("Superimposed metabolic acidosis on respiratory acidosis");
    } else {
      compResult = `HCO₃⁻ higher than expected → superimposed metabolic alkalosis`;
      compTone = "blue";
      findings.push("Superimposed metabolic alkalosis on respiratory acidosis");
    }
    compStep = {
      num: 3, title: "Compensation Check",
      body: `Acute: HCO₃⁻ expected ≈ ${expHco3Acute} mmol/L (↑1 per 10 mmHg CO₂ rise)\nChronic: HCO₃⁻ expected ≈ ${expHco3Chronic} mmol/L (↑3.5 per 10 mmHg CO₂ rise)`,
      result: compResult,
      detail: `Measured HCO₃⁻: ${hco3Num} mmol/L`,
      tone: compTone,
    };
  } else if (isPrimaryRespAlk) {
    const co2Drop = 40 - co2Num;
    const expHco3Acute   = +(24 - (co2Drop / 10) * 2).toFixed(1);
    const expHco3Chronic = +(24 - (co2Drop / 10) * 5).toFixed(1);
    let compResult, compTone;
    if (hco3Num <= expHco3Acute + 2 && hco3Num >= expHco3Acute - 2) {
      compResult = `Acute respiratory alkalosis — HCO₃⁻ ≈ expected (${expHco3Acute} mmol/L)`;
      compTone = "emerald";
    } else if (hco3Num <= expHco3Chronic + 2 && hco3Num >= expHco3Chronic - 2) {
      compResult = `Chronic respiratory alkalosis — HCO₃⁻ ≈ expected (${expHco3Chronic} mmol/L)`;
      compTone = "amber";
    } else if (hco3Num > expHco3Acute + 2) {
      compResult = `HCO₃⁻ higher than expected → superimposed metabolic alkalosis`;
      compTone = "blue";
      findings.push("Superimposed metabolic alkalosis on respiratory alkalosis");
    } else {
      compResult = `HCO₃⁻ lower than expected → superimposed metabolic acidosis`;
      compTone = "red";
      findings.push("Superimposed metabolic acidosis on respiratory alkalosis");
    }
    compStep = {
      num: 3, title: "Compensation Check",
      body: `Acute: HCO₃⁻ expected ≈ ${expHco3Acute} mmol/L (↓2 per 10 mmHg CO₂ drop)\nChronic: HCO₃⁻ expected ≈ ${expHco3Chronic} mmol/L (↓5 per 10 mmHg CO₂ drop)`,
      result: compResult,
      detail: `Measured HCO₃⁻: ${hco3Num} mmol/L`,
      tone: compTone,
    };
  } else if (isPrimaryMetAlk) {
    // Expected PaCO2 = 0.7 × HCO3 + 21 ± 2
    const expCo2Lo = +(0.7 * hco3Num + 21 - 2).toFixed(1);
    const expCo2Hi = +(0.7 * hco3Num + 21 + 2).toFixed(1);
    let compResult, compTone;
    if (co2Num >= expCo2Lo && co2Num <= expCo2Hi) {
      compResult = "Appropriate hypoventilatory compensation";
      compTone = "emerald";
    } else if (co2Num < expCo2Lo) {
      compResult = "PaCO₂ lower than expected → superimposed respiratory alkalosis";
      compTone = "blue";
      findings.push("Concurrent respiratory alkalosis on metabolic alkalosis");
    } else {
      compResult = "PaCO₂ higher than expected → superimposed respiratory acidosis";
      compTone = "red";
      findings.push("Concurrent respiratory acidosis on metabolic alkalosis");
    }
    compStep = {
      num: 3, title: "Compensation Check",
      body: `Expected PaCO₂ = (0.7 × ${hco3Num}) + 21 ± 2 = ${expCo2Lo}–${expCo2Hi} mmHg`,
      result: compResult,
      detail: `Measured PaCO₂: ${co2Num} mmHg`,
      tone: compTone,
    };
  }

  if (compStep) steps.push(compStep);

  // ── STEP 4: Anion Gap ──
  let agStep = null;
  if (!isNaN(naNum) && !isNaN(clNum)) {
    const ag = naNum - (clNum + hco3Num);
    const agHigh = ag > 12;
    const agNorm = ag <= 12;
    let agInterp, agTone;
    if (agHigh) {
      agInterp = `Elevated AG (${ag.toFixed(0)}) → HAGMA — MUDPILES`;
      agTone = "red";
      findings.push(`High anion gap (${ag.toFixed(0)}) — consider MUDPILES causes`);
    } else {
      agInterp = `Normal AG (${ag.toFixed(0)}) — NAGMA or non-gap process`;
      agTone = "emerald";
    }

    // Delta-delta ratio (only meaningful in HAGMA)
    let deltaStr = "";
    if (agHigh && isPrimaryMetAcid) {
      const deltaAG  = ag - 12;        // excess AG above normal
      const deltaHCO3 = 24 - hco3Num; // HCO3 drop from normal
      const ratio = deltaAG / (deltaHCO3 || 1);
      let ddInterp;
      if (ratio < 0.4)      ddInterp = "Very low — suspect non-gap component or loss of bicarb";
      else if (ratio < 1.0) ddInterp = "Low (0.4–1.0) — mixed HAGMA + NAGMA";
      else if (ratio <= 2.0) ddInterp = "Normal (1–2) — pure HAGMA";
      else                   ddInterp = "High (>2) — concurrent metabolic alkalosis or pre-existing chronic resp acidosis";
      deltaStr = `\nΔ/Δ ratio: ${ratio.toFixed(2)} → ${ddInterp}`;
      if (ratio < 1.0)  findings.push("Delta-delta <1 → mixed HAGMA + NAGMA");
      if (ratio > 2.0)  findings.push("Delta-delta >2 → concurrent metabolic alkalosis");
    }

    agStep = {
      num: compStep ? 4 : 3,
      title: "Anion Gap" + (agHigh && isPrimaryMetAcid ? " + Delta-Delta Ratio" : ""),
      body: `AG = Na⁺ − (Cl⁻ + HCO₃⁻) = ${naNum} − (${clNum} + ${hco3Num}) = ${ag.toFixed(0)} mmol/L`,
      result: agInterp,
      detail: `Normal AG: 8–12 mmol/L${deltaStr}`,
      tone: agTone,
    };
    steps.push(agStep);

    // MUDPILES / HARDUPS if HAGMA
    if (agHigh) {
      steps.push({
        num: steps.length + 1,
        title: "HAGMA Differential — MUDPILES",
        body: "",
        result: "",
        detail: "",
        tone: "red",
        isMudpiles: true,
      });
    }
  }

  // ── STEP: Oxygenation ──
  if (!isNaN(pao2Num)) {
    const pao2Low  = pao2Num < norms.pao2[0];
    const pao2Norm = pao2Num >= norms.pao2[0];
    // A-a gradient = (FiO2 × (Patm - PH2O) - PaCO2/0.8) - PaO2
    // Simplified: PAO2 = (FiO2 × 713) - (PaCO2 / 0.8)  [sea level, Patm 760, PH2O 47]
    const PAO2   = fio2Num * 713 - co2Num / 0.8;
    const aaGrad = +(PAO2 - pao2Num).toFixed(1);
    const aaHigh = aaGrad > 15; // normal A-a gradient <15 in children/young adults
    let oxyInterp, oxyTone;
    if (pao2Low && aaHigh) {
      oxyInterp = `Hypoxaemia with ↑ A-a gradient (${aaGrad} mmHg) → V/Q mismatch, shunt, or diffusion defect`;
      oxyTone = "red";
      findings.push(`Hypoxaemia — A-a gradient elevated (${aaGrad} mmHg)`);
    } else if (pao2Low && !aaHigh) {
      oxyInterp = `Hypoxaemia with normal A-a gradient → hypoventilation (A-a = ${aaGrad} mmHg)`;
      oxyTone = "amber";
      findings.push("Hypoxaemia due to hypoventilation — normal A-a gradient");
    } else if (aaHigh) {
      oxyInterp = `PaO₂ normal but A-a gradient elevated (${aaGrad} mmHg) → early V/Q mismatch`;
      oxyTone = "amber";
      findings.push(`Elevated A-a gradient (${aaGrad} mmHg) despite normal PaO₂`);
    } else {
      oxyInterp = `Oxygenation normal · A-a gradient ${aaGrad} mmHg (normal <15)`;
      oxyTone = "emerald";
    }
    steps.push({
      num: steps.length + 1,
      title: "Oxygenation + A-a Gradient",
      body: `PaO₂ ${pao2Num} mmHg · FiO₂ ${fio2Num} · PAO₂ = ${PAO2.toFixed(1)} mmHg`,
      result: oxyInterp,
      detail: `A-a gradient = ${aaGrad} mmHg (normal <15 mmHg at sea level)\nNormal PaO₂ for ${norms.label}: ${norms.pao2[0]}–${norms.pao2[1]} mmHg`,
      tone: oxyTone,
    });
  }

  return { steps, findings, primaryLabel, primaryTone, summaryTone, norms };
}

// ─── CAUSES REFERENCE ─────────────────────────────────────────────────────────
const CAUSES = {
  "Primary Respiratory Acidosis": [
    "Hypoventilation: CNS depression (opioids, sedatives, raised ICP)",
    "Neuromuscular: GBS, myasthenia gravis, spinal cord injury",
    "Airway obstruction: severe asthma, croup, foreign body",
    "Chest wall: pneumothorax, haemothorax, rib fractures, obesity",
    "Lung parenchyma: severe pneumonia, ARDS, pulmonary oedema",
  ],
  "Primary Respiratory Alkalosis": [
    "Hyperventilation: anxiety, pain, fever, hypoxia (reflex)",
    "CNS: meningitis, encephalitis, stroke, salicylate (early)",
    "Hepatic failure (hepatic encephalopathy)",
    "Sepsis (early phase — hyperventilation response)",
    "Mechanical ventilation: excessive rate or tidal volume",
  ],
  "Primary Metabolic Acidosis": [
    "HAGMA — MUDPILES: Methanol · Uraemia · DKA · Paracetamol/Propylene glycol · Iron/INH · Lactic acidosis · Ethylene glycol · Salicylates",
    "NAGMA — HARDUPS: Hyperalimentation · Addison's disease · RTA · Diarrhoea (HCO3 loss) · Uretero-sigmoido / Pancreatic fistula · Saline excess (dilutional)",
    "Lactic acidosis: sepsis, hypoperfusion, metformin, liver failure",
    "DKA: hallmark of paediatric T1DM emergency",
    "Diarrhoea: most common cause of NAGMA in children in India",
  ],
  "Primary Metabolic Alkalosis": [
    "Vomiting / NG suction: loss of H⁺ and Cl⁻",
    "Diuretics: loop/thiazide — loss of K⁺ and H⁺",
    "Pyloric stenosis (infants): classic hypochloraemic hypokalaemic met alk",
    "Excess bicarbonate: over-zealous NaHCO3 administration",
    "Mineralocorticoid excess: hyperaldosteronism, Cushing's syndrome",
    "Bartter/Gitelman syndrome",
  ],
};

const MUDPILES = [
  { letter: "M", cause: "Methanol",                 note: "Osmolar gap elevated. Severe visual disturbance." },
  { letter: "U", cause: "Uraemia",                  note: "BUN/creatinine elevated. Renal failure." },
  { letter: "D", cause: "Diabetic Ketoacidosis",    note: "Glucose high, ketonuria. Most common HAGMA in children." },
  { letter: "P", cause: "Paracetamol / Propylene glycol", note: "LFTs ↑ in paracetamol toxicity. Check drug history." },
  { letter: "I", cause: "Iron / Isoniazid",          note: "History of ingestion. Specific antidotes available." },
  { letter: "L", cause: "Lactic acidosis",           note: "Sepsis, shock, ischaemia, metformin. Lactate >5 mmol/L." },
  { letter: "E", cause: "Ethylene glycol",            note: "Osmolar gap. Renal failure. Calcium oxalate crystals." },
  { letter: "S", cause: "Salicylates",               note: "Mixed resp alk + met acid. Tinnitus, high anion gap." },
];

// ─── INPUT FIELD ──────────────────────────────────────────────────────────────
function Field({ label, value, onChange, unit, placeholder, hint }) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
        />
        {unit && <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 w-12">{unit}</span>}
      </div>
      {hint && <div className="text-[9px] text-slate-400 font-mono">{hint}</div>}
    </div>
  );
}

// ─── STEP CARD ────────────────────────────────────────────────────────────────
function StepCard({ step }) {
  const t = TONE[step.tone] || TONE.slate;
  if (step.isMudpiles) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900/50 overflow-hidden">
        <div className="px-4 py-3 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}>{step.num}</span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-red-500">HAGMA Differential — MUDPILES</span>
        </div>
        <div className="p-4 grid sm:grid-cols-2 gap-2">
          {MUDPILES.map(m => (
            <div key={m.letter} className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/20 rounded-lg p-2.5 border border-red-100 dark:border-red-900">
              <span className="font-black text-red-600 dark:text-red-400 text-base w-4 flex-shrink-0"
                    style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{m.letter}</span>
              <div>
                <div className="font-bold text-xs text-slate-800 dark:text-white">{m.cause}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{m.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border bg-white dark:bg-slate-900/50 overflow-hidden ${t.border}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b flex items-center gap-2.5 ${t.bg} ${t.border}`}>
        <span className={`w-5 h-5 rounded-full text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0 ${
          step.tone === "red" ? "bg-red-600" : step.tone === "blue" ? "bg-blue-600" : step.tone === "emerald" ? "bg-emerald-600" : step.tone === "amber" ? "bg-amber-500" : "bg-slate-500"
        }`} style={{ fontFamily: '"JetBrains Mono", monospace' }}>{step.num}</span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}>{step.title}</span>
      </div>

      <div className="px-4 py-3 space-y-2">
        {/* Entered value */}
        {step.body && (
          <div className="font-mono text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line"
               style={{ fontFamily: '"JetBrains Mono", monospace' }}>{step.body}</div>
        )}
        {/* Result */}
        {step.result && (
          <div className={`font-bold text-sm ${t.text}`}
               style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{step.result}</div>
        )}
        {/* Detail / formula */}
        {step.detail && (
          <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500 whitespace-pre-line"
               style={{ fontFamily: '"JetBrains Mono", monospace' }}>{step.detail}</div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ABGTab() {
  const [ageIdx, setAgeIdx] = useState(2); // default: Child
  const [ph,    setPh]    = useState("");
  const [pco2,  setPco2]  = useState("");
  const [hco3,  setHco3]  = useState("");
  const [pao2,  setPao2]  = useState("");
  const [fio2,  setFio2]  = useState("");
  const [na,    setNa]    = useState("");
  const [cl,    setCl]    = useState("");
  const [showCauses, setShowCauses] = useState(false);

  const hasMinInput = ph !== "" && pco2 !== "" && hco3 !== "";

  const result = useMemo(() => {
    if (!hasMinInput) return null;
    return interpretABG({ pH: ph, pco2, hco3, pao2, fio2, na, cl, ageIdx });
  }, [ph, pco2, hco3, pao2, fio2, na, cl, ageIdx, hasMinInput]);

  function handleReset() {
    setPh(""); setPco2(""); setHco3(""); setPao2(""); setFio2(""); setNa(""); setCl("");
  }

  // Example presets
  const PRESETS = [
    { label: "DKA",       vals: { ph: "7.18", pco2: "22", hco3: "8",  pao2: "95",  fio2: "0.21", na: "138", cl: "102" } },
    { label: "Resp Acid", vals: { ph: "7.25", pco2: "70", hco3: "30", pao2: "52",  fio2: "0.21", na: "",    cl: ""    } },
    { label: "Met Alk",   vals: { ph: "7.52", pco2: "48", hco3: "38", pao2: "92",  fio2: "0.21", na: "140", cl: "90"  } },
    { label: "Mixed",     vals: { ph: "7.10", pco2: "80", hco3: "28", pao2: "55",  fio2: "0.21", na: "",    cl: ""    } },
    { label: "Normal",    vals: { ph: "7.40", pco2: "40", hco3: "24", pao2: "95",  fio2: "0.21", na: "140", cl: "104" } },
  ];

  function applyPreset(vals) {
    setPh(vals.ph); setPco2(vals.pco2); setHco3(vals.hco3);
    setPao2(vals.pao2 || ""); setFio2(vals.fio2 || "");
    setNa(vals.na || ""); setCl(vals.cl || "");
  }

  const primaryCauses = result ? CAUSES[result.primaryLabel] || null : null;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          ABG Interpretation
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Step-by-step acid-base analysis · Compensation formulas · Anion gap · A-a gradient ·
          Paediatric age-adjusted normals · Marino ICU Book · Cote &amp; Lerman
        </p>
      </div>

      {/* Disclaimer */}
      <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${TONE.amber.bg} ${TONE.amber.border} ${TONE.amber.text}`}>
        <Warning size={13} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>Clinical interpretation only. Always correlate with the full clinical picture.
          HCO₃⁻ entered here is measured (from ABG report) — not calculated from pH + PaCO₂.</span>
      </div>

      {/* Age selector */}
      <div>
        <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-2">Age Group — Normal Ranges</div>
        <div className="flex flex-wrap gap-1.5">
          {AGE_NORMALS.map((a, i) => (
            <button key={a.label} onClick={() => setAgeIdx(i)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
                ageIdx === i
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
              }`}>{a.label}</button>
          ))}
        </div>
        <div className="mt-1.5 font-mono text-[9px] text-slate-400">
          pH {AGE_NORMALS[ageIdx].pH[0]}–{AGE_NORMALS[ageIdx].pH[1]} ·
          PaCO₂ {AGE_NORMALS[ageIdx].pco2[0]}–{AGE_NORMALS[ageIdx].pco2[1]} mmHg ·
          HCO₃⁻ {AGE_NORMALS[ageIdx].hco3[0]}–{AGE_NORMALS[ageIdx].hco3[1]} mmol/L ·
          PaO₂ {AGE_NORMALS[ageIdx].pao2[0]}–{AGE_NORMALS[ageIdx].pao2[1]} mmHg
        </div>
      </div>

      {/* Input form */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">ABG Values</div>
          <div className="flex gap-2">
            {/* Presets */}
            <div className="flex gap-1 flex-wrap">
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => applyPreset(p.vals)}
                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 font-mono text-[9px] uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-all">
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={handleReset}
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-400 font-mono text-[9px] uppercase tracking-widest hover:text-red-500 hover:border-red-200 transition-all">
              Reset
            </button>
          </div>
        </div>

        {/* Required fields */}
        <div>
          <div className="font-mono text-[8px] uppercase tracking-widest text-slate-300 dark:text-slate-600 mb-2">Required</div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="pH"    value={ph}   onChange={setPh}   unit=""        placeholder="7.35" hint="7.35–7.45" />
            <Field label="PaCO₂" value={pco2} onChange={setPco2} unit="mmHg"    placeholder="40"   hint="35–45 mmHg" />
            <Field label="HCO₃⁻" value={hco3} onChange={setHco3} unit="mmol/L"  placeholder="24"   hint="22–26 mmol/L" />
          </div>
        </div>

        {/* Optional fields */}
        <div>
          <div className="font-mono text-[8px] uppercase tracking-widest text-slate-300 dark:text-slate-600 mb-2">Optional — for oxygenation &amp; anion gap</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="PaO₂"  value={pao2} onChange={setPao2} unit="mmHg"    placeholder="95"   hint="80–100 mmHg" />
            <Field label="FiO₂"  value={fio2} onChange={setFio2} unit=""        placeholder="0.21" hint="0.21 = room air" />
            <Field label="Na⁺"   value={na}   onChange={setNa}   unit="mmol/L"  placeholder="140"  hint="for anion gap" />
            <Field label="Cl⁻"   value={cl}   onChange={setCl}   unit="mmol/L"  placeholder="104"  hint="for anion gap" />
          </div>
        </div>
      </div>

      {/* Results */}
      {!hasMinInput && (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-8 text-center">
          <FlaskConical size={28} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <div className="font-mono text-xs text-slate-400">Enter pH, PaCO₂, and HCO₃⁻ to begin interpretation</div>
        </div>
      )}

      {result && (
        <div className="space-y-4">

          {/* Summary banner */}
          <div className={`rounded-xl border-2 p-4 ${TONE[result.primaryTone]?.border || TONE.slate.border} ${TONE[result.summaryTone]?.bg || TONE.slate.bg}`}>
            <div className={`font-black text-xl mb-1 ${TONE[result.primaryTone]?.text || TONE.slate.text}`}
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              {result.primaryLabel}
            </div>
            <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
              pH {ph} · PaCO₂ {pco2} mmHg · HCO₃⁻ {hco3} mmol/L
              {pao2 ? ` · PaO₂ ${pao2} mmHg` : ""}
            </div>
          </div>

          {/* Additional findings */}
          {result.findings.length > 0 && (
            <div className={`rounded-xl border px-4 py-3 space-y-1.5 ${TONE.amber.bg} ${TONE.amber.border}`}>
              <div className="font-mono text-[9px] uppercase tracking-widest text-amber-500 mb-1">
                Additional Findings
              </div>
              {result.findings.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200">
                  <Warning size={11} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />{f}
                </div>
              ))}
            </div>
          )}

          {/* Step-by-step */}
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-3">
              Step-by-Step Interpretation
            </div>
            <div className="space-y-3">
              {result.steps.map((step, i) => (
                <StepCard key={i} step={step} />
              ))}
            </div>
          </div>

          {/* Causes */}
          {primaryCauses && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                onClick={() => setShowCauses(!showCauses)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <Lightbulb size={13} weight="fill" className="text-amber-500" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white"
                        style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                    Common Causes — {result.primaryLabel}
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-xs">{showCauses ? "▲" : "▼"}</span>
              </button>
              {showCauses && (
                <div className="px-4 pb-4 pt-3 bg-white dark:bg-slate-900/50 space-y-2">
                  {primaryCauses.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <ArrowRight size={10} weight="bold" className="text-amber-500 flex-shrink-0 mt-0.5" />{c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick reference cheatsheet */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-3">Compensation Formulas Reference</div>
            <div className="grid sm:grid-cols-2 gap-2 text-[10px] font-mono text-slate-600 dark:text-slate-300">
              {[
                { d: "Met Acidosis",     f: "Expected PaCO₂ = (1.5 × HCO₃) + 8 ± 2  (Winters')" },
                { d: "Met Alkalosis",    f: "Expected PaCO₂ = (0.7 × HCO₃) + 21 ± 2" },
                { d: "Resp Acid (acute)",f: "Expected HCO₃ = 24 + (ΔPCO₂ / 10) × 1" },
                { d: "Resp Acid (chron)",f: "Expected HCO₃ = 24 + (ΔPCO₂ / 10) × 3.5" },
                { d: "Resp Alk (acute)", f: "Expected HCO₃ = 24 − (ΔPCO₂ / 10) × 2" },
                { d: "Resp Alk (chron)", f: "Expected HCO₃ = 24 − (ΔPCO₂ / 10) × 5" },
                { d: "Anion Gap",        f: "AG = Na⁺ − (Cl⁻ + HCO₃⁻)  · Normal 8–12" },
                { d: "A-a Gradient",     f: "A-a = (FiO₂ × 713 − PaCO₂/0.8) − PaO₂" },
              ].map(row => (
                <div key={row.d} className="bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-800">
                  <div className="text-[8px] uppercase tracking-widest text-slate-400 mb-0.5">{row.d}</div>
                  <div className="text-[10px] text-slate-700 dark:text-slate-200">{row.f}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        Marino ICU Book 4e · Cote &amp; Lerman Paediatric Anaesthesia 6e · PALS 2020 · Fleischer &amp; Ludwig 7e ·
        Winters' formula 1960 · Paediatric normal ranges: Harriet Lane 23e
      </div>
    </div>
  );
}
