// src/components/GlobalSearch.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Cross-tab search for PedResus
// Indexes key clinical content across all tabs.
// Used in TopBar — renders as a command-palette style popover.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MagnifyingGlass, X, ArrowRight, Lightning, Drop, Wind, Pill,
  Heartbeat, Syringe, Baby, Brain, Bug, Fire, Skull, Calculator,
  ClipboardText, Wrench, FirstAid, Ambulance, TreeStructure,
} from "@phosphor-icons/react";

// ─── SEARCH INDEX ─────────────────────────────────────────────────────────────
// Each entry: { tab, label, sublabel, keywords, icon, color }
// tab must match an id in ALL_TABS
const SEARCH_INDEX = [

  // ── CALCULATOR ──────────────────────────────────────────────────────────────
  { tab: "calculator", label: "Weight Calculator", sublabel: "Age-based weight estimation · Broselow", keywords: ["weight", "kg", "broselow", "age", "estimate"], icon: Calculator, color: "text-slate-500" },
  { tab: "calculator", label: "Ideal Body Weight", sublabel: "IBW calculation for obese patients", keywords: ["ideal body weight", "ibw", "obesity", "obese"], icon: Calculator, color: "text-slate-500" },

  // ── EQUIPMENT ───────────────────────────────────────────────────────────────
  { tab: "equipment", label: "ETT Size & Depth", sublabel: "Endotracheal tube size by age/weight", keywords: ["ett", "tube", "intubation", "endotracheal", "size", "depth"], icon: Wrench, color: "text-blue-500" },
  { tab: "equipment", label: "Laryngoscope Blade", sublabel: "Miller / Macintosh blade selection", keywords: ["laryngoscope", "blade", "miller", "macintosh"], icon: Wrench, color: "text-blue-500" },
  { tab: "equipment", label: "LMA Size", sublabel: "Laryngeal mask airway selection", keywords: ["lma", "laryngeal mask", "supraglottic"], icon: Wrench, color: "text-blue-500" },
  { tab: "equipment", label: "Suction Catheter", sublabel: "Suction catheter French size", keywords: ["suction", "catheter", "french", "yankauer"], icon: Wrench, color: "text-blue-500" },
  { tab: "equipment", label: "NG Tube Size", sublabel: "Nasogastric tube size by weight", keywords: ["ng tube", "nasogastric", "orogastric"], icon: Wrench, color: "text-blue-500" },
  { tab: "equipment", label: "Chest Tube Size", sublabel: "Intercostal drain selection", keywords: ["chest tube", "intercostal drain", "icd", "thoracostomy"], icon: Wrench, color: "text-blue-500" },
  { tab: "equipment", label: "Foley Catheter Size", sublabel: "Urinary catheter sizing", keywords: ["foley", "urinary catheter", "urethral"], icon: Wrench, color: "text-blue-500" },
  { tab: "equipment", label: "Defibrillation", sublabel: "Joules/kg for DC cardioversion and defibrillation", keywords: ["defibrillation", "cardioversion", "joules", "shock", "aed", "dc"], icon: Wrench, color: "text-blue-500" },

  // ── VITALS ──────────────────────────────────────────────────────────────────
  { tab: "vitals", label: "Normal Heart Rate", sublabel: "HR ranges by age", keywords: ["heart rate", "hr", "tachycardia", "bradycardia", "pulse", "normal vitals"], icon: Heartbeat, color: "text-red-500" },
  { tab: "vitals", label: "Normal Blood Pressure", sublabel: "SBP / DBP / MAP normal ranges", keywords: ["blood pressure", "bp", "systolic", "diastolic", "map", "hypotension", "hypertension"], icon: Heartbeat, color: "text-red-500" },
  { tab: "vitals", label: "Normal Respiratory Rate", sublabel: "RR by age — tachypnoea thresholds", keywords: ["respiratory rate", "rr", "tachypnoea", "tachypnea", "breathing rate"], icon: Heartbeat, color: "text-red-500" },
  { tab: "vitals", label: "SpO₂ Targets", sublabel: "Oxygen saturation targets by age and condition", keywords: ["spo2", "oxygen saturation", "pulse oximetry", "oxygenation", "hypoxia"], icon: Heartbeat, color: "text-red-500" },

  // ── RESUSCITATION ───────────────────────────────────────────────────────────
  { tab: "resuscitation", label: "Cardiac Arrest — CPR", sublabel: "PALS cardiac arrest algorithm · AHA 2025", keywords: ["cpr", "cardiac arrest", "pals", "resuscitation", "compressions", "chest compression", "aha"], icon: Lightning, color: "text-red-600" },
  { tab: "resuscitation", label: "Adrenaline / Epinephrine", sublabel: "Cardiac arrest dose · 0.01 mg/kg IV/IO", keywords: ["adrenaline", "epinephrine", "cardiac arrest", "arrest", "0.01 mg/kg", "1:10000"], icon: Lightning, color: "text-red-600" },
  { tab: "resuscitation", label: "Defibrillation Dose", sublabel: "4 J/kg for VF / pulseless VT", keywords: ["defibrillation", "vf", "vt", "ventricular fibrillation", "4 j/kg", "shock"], icon: Lightning, color: "text-red-600" },
  { tab: "resuscitation", label: "Amiodarone", sublabel: "5 mg/kg IV/IO for shockable rhythm", keywords: ["amiodarone", "5 mg/kg", "vf", "vt", "antiarrhythmic"], icon: Lightning, color: "text-red-600" },
  { tab: "resuscitation", label: "Post-Resuscitation Care", sublabel: "ROSC management · TTM · glucose", keywords: ["rosc", "post resuscitation", "ttm", "targeted temperature", "post cardiac arrest"], icon: Lightning, color: "text-red-600" },

  // ── VENTILATOR ──────────────────────────────────────────────────────────────
  { tab: "ventilator", label: "Tidal Volume", sublabel: "6–8 mL/kg for lung-protective ventilation", keywords: ["tidal volume", "tv", "lung protective", "6 ml/kg", "ventilation", "ards"], icon: Wind, color: "text-sky-500" },
  { tab: "ventilator", label: "PEEP", sublabel: "Positive end-expiratory pressure settings", keywords: ["peep", "positive end expiratory pressure", "cpap", "lung recruitment"], icon: Wind, color: "text-sky-500" },
  { tab: "ventilator", label: "Initial Vent Settings", sublabel: "FiO₂, RR, PIP, I:E ratio by condition", keywords: ["ventilator settings", "fio2", "pip", "rate", "i:e ratio", "mechanical ventilation", "intubation settings"], icon: Wind, color: "text-sky-500" },
  { tab: "ventilator", label: "RSI — Rapid Sequence Intubation", sublabel: "Ketamine + rocuronium · drug doses", keywords: ["rsi", "rapid sequence intubation", "ketamine", "rocuronium", "succinylcholine", "intubation drugs", "pre-intubation"], icon: Wind, color: "text-sky-500" },
  { tab: "ventilator", label: "Atropine Pre-intubation", sublabel: "0.02 mg/kg IV before laryngoscopy in infants", keywords: ["atropine", "pre-intubation", "bradycardia intubation", "0.02 mg/kg"], icon: Wind, color: "text-sky-500" },

  // ── FLUIDS ───────────────────────────────────────────────────────────────────
  { tab: "fluids", label: "Maintenance Fluids — Holliday-Segar", sublabel: "4-2-1 rule · daily and hourly rates", keywords: ["maintenance fluid", "holliday segar", "4-2-1", "fluid rate", "daily fluid", "hourly fluid"], icon: Drop, color: "text-cyan-500" },
  { tab: "fluids", label: "Fluid Bolus — Septic Shock", sublabel: "20 mL/kg NS/RL · isotonic crystalloid", keywords: ["fluid bolus", "septic shock", "20 ml/kg", "resuscitation fluid", "crystalloid", "normal saline", "ringer lactate"], icon: Drop, color: "text-cyan-500" },
  { tab: "fluids", label: "Dehydration — ORS", sublabel: "ORT for mild-moderate dehydration", keywords: ["ors", "oral rehydration", "dehydration", "diarrhoea", "gastroenteritis", "rehydration"], icon: Drop, color: "text-cyan-500" },
  { tab: "fluids", label: "DKA Fluids", sublabel: "0.9% NaCl deficit replacement over 48hr", keywords: ["dka", "diabetic ketoacidosis", "dka fluids", "fluid deficit", "0.9% nacl", "insulin"], icon: Drop, color: "text-cyan-500" },
  { tab: "fluids", label: "Blood Transfusion", sublabel: "10 mL/kg packed red cells · rate", keywords: ["blood transfusion", "prc", "packed red cells", "blood product", "haemoglobin", "anaemia transfusion"], icon: Drop, color: "text-cyan-500" },
  { tab: "fluids", label: "Glucose Correction", sublabel: "D10% 5 mL/kg IV for hypoglycaemia", keywords: ["glucose", "dextrose", "hypoglycaemia", "d10", "d25", "low blood sugar", "cbg"], icon: Drop, color: "text-cyan-500" },

  // ── DRUGS ────────────────────────────────────────────────────────────────────
  { tab: "drugs", label: "Paracetamol / Acetaminophen", sublabel: "15 mg/kg PO/IV q4–6hr", keywords: ["paracetamol", "acetaminophen", "pcm", "fever", "analgesic", "15 mg/kg"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Ibuprofen", sublabel: "10 mg/kg PO q6–8hr · >3 months", keywords: ["ibuprofen", "nsaid", "brufen", "fever", "anti-inflammatory", "10 mg/kg"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Ceftriaxone", sublabel: "50–100 mg/kg/day IV · sepsis, meningitis", keywords: ["ceftriaxone", "antibiotic", "sepsis", "meningitis", "cephalosporin", "100 mg/kg"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Amoxicillin", sublabel: "80–90 mg/kg/day PO · pneumonia", keywords: ["amoxicillin", "amox", "pneumonia", "antibiotic", "penicillin"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Azithromycin", sublabel: "10 mg/kg day 1, 5 mg/kg days 2–5", keywords: ["azithromycin", "zithromax", "atypical pneumonia", "mycoplasma", "macrolide"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Dexamethasone", sublabel: "0.6 mg/kg · croup, asthma, meningitis", keywords: ["dexamethasone", "dex", "steroid", "corticosteroid", "croup", "asthma", "0.6 mg/kg"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Prednisolone", sublabel: "1–2 mg/kg/day PO · asthma, croup", keywords: ["prednisolone", "prednisone", "steroid", "asthma steroid", "1 mg/kg"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Salbutamol / Albuterol", sublabel: "MDI + spacer · 4–8 puffs q20min", keywords: ["salbutamol", "albuterol", "ventolin", "bronchodilator", "asthma", "wheeze", "beta agonist"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Magnesium Sulfate", sublabel: "25–50 mg/kg IV · severe asthma, seizure", keywords: ["magnesium", "mgso4", "magnesium sulfate", "severe asthma", "eclampsia", "torsades"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Midazolam", sublabel: "0.1–0.2 mg/kg IN/buccal · seizure", keywords: ["midazolam", "benzo", "benzodiazepine", "seizure", "intranasal", "buccal", "0.2 mg/kg"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Lorazepam", sublabel: "0.1 mg/kg IV · status epilepticus", keywords: ["lorazepam", "ativan", "benzodiazepine", "status epilepticus", "seizure iv"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Levetiracetam", sublabel: "40–60 mg/kg IV · second-line seizure", keywords: ["levetiracetam", "keppra", "second line seizure", "status epilepticus", "anticonvulsant"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Phenytoin / Fosphenytoin", sublabel: "18–20 mg/kg IV · second-line anticonvulsant", keywords: ["phenytoin", "fosphenytoin", "dilantin", "anticonvulsant", "status epilepticus"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Naloxone", sublabel: "0.01 mg/kg IV · opioid reversal", keywords: ["naloxone", "narcan", "opioid reversal", "0.01 mg/kg", "morphine overdose", "fentanyl overdose"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Flumazenil", sublabel: "0.01 mg/kg IV · benzodiazepine reversal", keywords: ["flumazenil", "anexate", "benzodiazepine reversal", "benzo reversal"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Mannitol", sublabel: "0.5–1 g/kg IV · raised ICP, cerebral oedema", keywords: ["mannitol", "raised icp", "intracranial pressure", "cerebral oedema", "brain herniation"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Adenosine", sublabel: "0.1 mg/kg IV rapid · SVT", keywords: ["adenosine", "svt", "supraventricular tachycardia", "0.1 mg/kg", "arrhythmia"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Dopamine Infusion", sublabel: "5–10 mcg/kg/min · inotrope", keywords: ["dopamine", "inotrope", "vasopressor", "dopamine infusion", "cardiogenic shock"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Norepinephrine / Noradrenaline", sublabel: "0.1–1 mcg/kg/min · vasopressor sepsis", keywords: ["norepinephrine", "noradrenaline", "vasopressor", "septic shock", "norepi"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Hydrocortisone", sublabel: "2 mg/kg IV · adrenal insufficiency, shock", keywords: ["hydrocortisone", "solu-cortef", "adrenal", "steroid shock", "relative adrenal insufficiency"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Calcium Gluconate", sublabel: "0.5 mL/kg of 10% IV · hypocalcaemia", keywords: ["calcium gluconate", "hypocalcaemia", "calcium", "tetany", "neonatal seizure calcium"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Sodium Bicarbonate", sublabel: "1 mEq/kg IV · metabolic acidosis, arrest", keywords: ["sodium bicarbonate", "bicarb", "nabicarbonate", "metabolic acidosis", "cardiac arrest bicarb"], icon: Pill, color: "text-emerald-500" },
  { tab: "drugs", label: "Furosemide", sublabel: "1–2 mg/kg IV · pulmonary oedema, fluid overload", keywords: ["furosemide", "lasix", "diuretic", "pulmonary oedema", "fluid overload", "diuresis"], icon: Pill, color: "text-emerald-500" },

  // ── SYRUP CALCULATOR ────────────────────────────────────────────────────────
  { tab: "syrup", label: "Syrup Dose Calculator", sublabel: "Calculate mL from mg/mL concentration", keywords: ["syrup", "liquid", "suspension", "ml dose", "oral medicine", "calculate volume", "concentration"], icon: Pill, color: "text-teal-500" },
  { tab: "syrup", label: "Paracetamol Syrup", sublabel: "120 mg/5 mL · 250 mg/5 mL volume", keywords: ["paracetamol syrup", "calpol", "125mg/5ml", "250mg/5ml", "fever syrup"], icon: Pill, color: "text-teal-500" },
  { tab: "syrup", label: "Amoxicillin Suspension", sublabel: "125 mg/5 mL · 250 mg/5 mL", keywords: ["amoxicillin suspension", "augmentin syrup", "125mg/5ml", "antibiotic suspension"], icon: Pill, color: "text-teal-500" },

  // ── SEVERITY SCORES ──────────────────────────────────────────────────────────
  { tab: "scores", label: "GCS — Glasgow Coma Scale", sublabel: "Eye + Motor + Verbal scores", keywords: ["gcs", "glasgow coma scale", "coma score", "consciousness", "gcs score", "e4m6v5"], icon: ClipboardText, color: "text-violet-500" },
  { tab: "scores", label: "PEWS — Paediatric Early Warning Score", sublabel: "Deterioration detection tool", keywords: ["pews", "paediatric early warning", "early warning score", "deterioration"], icon: ClipboardText, color: "text-violet-500" },
  { tab: "scores", label: "PRISM Score", sublabel: "Paediatric RISk of Mortality — PICU", keywords: ["prism", "paediatric mortality", "picu mortality", "risk of mortality"], icon: ClipboardText, color: "text-violet-500" },
  { tab: "scores", label: "Westley Croup Score", sublabel: "Severity of laryngotracheobronchitis", keywords: ["westley", "croup score", "ltb", "stridor severity", "croup severity"], icon: ClipboardText, color: "text-violet-500" },
  { tab: "scores", label: "PESI Score", sublabel: "Pulmonary embolism severity index", keywords: ["pesi", "pulmonary embolism", "pe score", "pe severity"], icon: ClipboardText, color: "text-violet-500" },
  { tab: "scores", label: "Dehydration Score", sublabel: "WHO dehydration assessment", keywords: ["dehydration score", "who dehydration", "clinical dehydration", "dehydration assessment"], icon: ClipboardText, color: "text-violet-500" },
  { tab: "scores", label: "Ballard Score", sublabel: "Gestational age assessment — neonatal", keywords: ["ballard", "new ballard", "gestational age", "neonatal assessment", "maturity score"], icon: ClipboardText, color: "text-violet-500" },
  { tab: "scores", label: "APGAR Score", sublabel: "Newborn assessment at 1 and 5 minutes", keywords: ["apgar", "apgar score", "newborn", "birth assessment", "1 minute apgar", "5 minute apgar"], icon: ClipboardText, color: "text-violet-500" },

  // ── SEDATION & ANALGESIA ──────────────────────────────────────────────────────
  { tab: "sedation", label: "Ketamine — PSA", sublabel: "1–2 mg/kg IV · dissociative · ED procedural sedation", keywords: ["ketamine", "procedural sedation", "psa", "dissociative", "ketamine dose", "ed sedation"], icon: FirstAid, color: "text-fuchsia-500" },
  { tab: "sedation", label: "Propofol — PSA", sublabel: "1–2 mg/kg IV · imaging, cardioversion", keywords: ["propofol", "diprivan", "psa", "imaging sedation", "procedural sedation", "propofol dose"], icon: FirstAid, color: "text-fuchsia-500" },
  { tab: "sedation", label: "Fentanyl IN", sublabel: "1.5 mcg/kg intranasal · needle-phobic", keywords: ["fentanyl", "intranasal fentanyl", "fentanyl in", "in fentanyl", "pain", "analgesia", "opioid"], icon: FirstAid, color: "text-fuchsia-500" },
  { tab: "sedation", label: "Ketofol", sublabel: "Ketamine + propofol 1:1 mixture", keywords: ["ketofol", "ketamine propofol", "combination sedation", "psa combination"], icon: FirstAid, color: "text-fuchsia-500" },
  { tab: "sedation", label: "Triclofos Sodium", sublabel: "50–75 mg/kg PO · MRI/echo/EEG sedation", keywords: ["triclofos", "pedicloryl", "oral sedation", "mri sedation", "echo sedation", "eeg sedation"], icon: FirstAid, color: "text-fuchsia-500" },
  { tab: "sedation", label: "Oral Midazolam", sublabel: "0.3–0.6 mg/kg PO · pre-procedure anxiolysis", keywords: ["oral midazolam", "midazolam syrup", "oral sedation", "anxiolysis", "pre-medication", "mezolam"], icon: FirstAid, color: "text-fuchsia-500" },
  { tab: "sedation", label: "Dexmedetomidine IN", sublabel: "1–2 mcg/kg IN · MRI pre-med, no resp depression", keywords: ["dexmedetomidine", "dex", "precedex", "intranasal dex", "mri premedication", "alpha 2 agonist"], icon: FirstAid, color: "text-fuchsia-500" },
  { tab: "sedation", label: "Nerve Blocks — Paediatric", sublabel: "DFTB · NYSORA · Femoral, FICB, IANB", keywords: ["nerve block", "regional anaesthesia", "femoral nerve block", "ficb", "fascia iliaca", "ianb", "dental block", "ultrasound block"], icon: FirstAid, color: "text-fuchsia-500" },
  { tab: "sedation", label: "Intralipid — LAST Protocol", sublabel: "1.5 mL/kg 20% intralipid · local anaesthetic toxicity", keywords: ["intralipid", "last", "local anaesthetic toxicity", "lipid rescue", "bupivacaine toxicity", "ropivacaine toxicity"], icon: FirstAid, color: "text-fuchsia-500" },
  { tab: "sedation", label: "Local Anaesthetic Max Dose", sublabel: "Lidocaine 3 mg/kg · Bupivacaine 2 mg/kg", keywords: ["local anaesthetic", "lidocaine", "lignocaine", "bupivacaine", "max dose local", "ropivacaine", "toxicity dose"], icon: FirstAid, color: "text-fuchsia-500" },

  // ── NEONATAL ─────────────────────────────────────────────────────────────────
  { tab: "neonatal", label: "Neonatal Resuscitation", sublabel: "NRP 2021 · PPV · T-piece · delayed cord clamping", keywords: ["nrp", "neonatal resuscitation", "ppv", "newborn resuscitation", "birth asphyxia", "t-piece", "delayed cord clamping"], icon: Baby, color: "text-rose-500" },
  { tab: "neonatal", label: "Neonatal Sepsis", sublabel: "EOS · ampicillin + gentamicin · LONS", keywords: ["neonatal sepsis", "eos", "early onset sepsis", "lons", "late onset sepsis", "ampicillin gentamicin", "newborn sepsis"], icon: Baby, color: "text-rose-500" },
  { tab: "neonatal", label: "Neonatal Hypoglycaemia", sublabel: "D10% 2 mL/kg · GIR 6–8 mg/kg/min", keywords: ["neonatal hypoglycaemia", "newborn hypoglycaemia", "d10", "gir", "glucose infusion rate", "neonatal glucose"], icon: Baby, color: "text-rose-500" },
  { tab: "neonatal", label: "Phototherapy", sublabel: "Jaundice thresholds · bilirubin levels", keywords: ["phototherapy", "jaundice", "bilirubin", "neonatal jaundice", "phototherapy threshold", "exchange transfusion"], icon: Baby, color: "text-rose-500" },
  { tab: "neonatal", label: "Surfactant", sublabel: "Poractant alfa 100–200 mg/kg · RDS", keywords: ["surfactant", "poractant", "curosurf", "rds", "respiratory distress syndrome", "prematurity", "premature lung"], icon: Baby, color: "text-rose-500" },
  { tab: "neonatal", label: "Caffeine Citrate", sublabel: "20 mg/kg load · apnoea of prematurity", keywords: ["caffeine", "caffeine citrate", "apnoea of prematurity", "apnea prematurity", "20 mg/kg"], icon: Baby, color: "text-rose-500" },
  { tab: "neonatal", label: "Vitamin K — Newborn", sublabel: "Phytomenadione 0.5–1 mg IM at birth", keywords: ["vitamin k", "phytomenadione", "vkdb", "haemorrhagic disease newborn", "vitamin k newborn"], icon: Baby, color: "text-rose-500" },

  // ── MANAGEMENT ALGORITHMS ───────────────────────────────────────────────────
  { tab: "algorithms", label: "Septic Shock Algorithm", sublabel: "Hour-1 bundle · norepi · antibiotics · PREM triggers", keywords: ["septic shock", "sepsis algorithm", "hour-1", "norepinephrine", "shock algorithm", "sepsis management"], icon: TreeStructure, color: "text-red-600" },
  { tab: "algorithms", label: "Anaphylaxis Algorithm", sublabel: "Epinephrine IM 0.01 mg/kg · IAP 2023", keywords: ["anaphylaxis", "allergic reaction", "epinephrine anaphylaxis", "adrenaline im", "anaphylactic shock"], icon: TreeStructure, color: "text-red-600" },
  { tab: "algorithms", label: "DKA Algorithm", sublabel: "48hr rehydration · insulin after 1hr fluids", keywords: ["dka algorithm", "diabetic ketoacidosis algorithm", "dka management", "cerebral oedema dka", "insulin infusion"], icon: TreeStructure, color: "text-red-600" },
  { tab: "algorithms", label: "Status Epilepticus Algorithm", sublabel: "Midazolam IN → levetiracetam → PICU", keywords: ["status epilepticus", "seizure algorithm", "status epilepticus management", "midazolam seizure", "levetiracetam status"], icon: TreeStructure, color: "text-red-600" },
  { tab: "algorithms", label: "Acute Asthma Algorithm", sublabel: "Salbutamol MDI · dexamethasone · MgSO₄", keywords: ["asthma algorithm", "acute asthma management", "salbutamol", "status asthmaticus", "severe asthma", "near fatal asthma"], icon: TreeStructure, color: "text-red-600" },
  { tab: "algorithms", label: "Meningitis Algorithm", sublabel: "Ceftriaxone + dexamethasone · timing critical", keywords: ["meningitis algorithm", "bacterial meningitis", "ceftriaxone meningitis", "dexamethasone meningitis", "meningitis management"], icon: TreeStructure, color: "text-red-600" },
  { tab: "algorithms", label: "Dengue Management", sublabel: "WHO group A/B/C · critical phase day 3–7", keywords: ["dengue", "dengue management", "dengue algorithm", "dengue shock", "dss", "dengue critical phase"], icon: TreeStructure, color: "text-red-600" },
  { tab: "algorithms", label: "Malaria Treatment", sublabel: "Artemether-lumefantrine · IV artesunate severe", keywords: ["malaria", "malaria treatment", "artemether lumefantrine", "artesunate", "cerebral malaria"], icon: TreeStructure, color: "text-red-600" },
  { tab: "algorithms", label: "Febrile Neutropenia", sublabel: "Pip-tazo + amikacin · antifungal if >72hr", keywords: ["febrile neutropenia", "neutropenia fever", "oncology fever", "pip-tazo", "immunocompromised fever"], icon: TreeStructure, color: "text-red-600" },
  { tab: "algorithms", label: "Neonatal Resuscitation Algorithm", sublabel: "IAP NRP 2021 · PPV · compressions", keywords: ["neonatal resuscitation algorithm", "nrp algorithm", "newborn delivery room", "birth resuscitation"], icon: TreeStructure, color: "text-red-600" },
  { tab: "algorithms", label: "Differential Diagnosis — Wheeze", sublabel: "Asthma vs bronchiolitis vs FB vs cardiac", keywords: ["wheeze differential", "wheeze ddx", "bronchiolitis vs asthma", "wheeze causes", "differential wheeze"], icon: TreeStructure, color: "text-red-600" },
  { tab: "algorithms", label: "Differential Diagnosis — Stridor", sublabel: "Croup vs epiglottitis vs FB vs LM", keywords: ["stridor differential", "stridor causes", "stridor ddx", "croup vs epiglottitis", "stridor diagnosis"], icon: TreeStructure, color: "text-red-600" },
  { tab: "algorithms", label: "AHA PALS 2025", sublabel: "Updated compression rate · ventilation with adv. airway", keywords: ["aha 2025", "pals 2025", "aha guidelines", "cpr update 2025", "20-30 breaths per min", "compressions aha"], icon: TreeStructure, color: "text-red-600" },

  // ── PREHOSPITAL ──────────────────────────────────────────────────────────────
  { tab: "prehsopital", label: "PREM Triangle — ABCDE", sublabel: "mRCPCA · airway/breathing/circulation/disability", keywords: ["prem", "prem triangle", "abcde", "mrpcpca", "rapid assessment", "prehospital assessment"], icon: Ambulance, color: "text-orange-500" },
  { tab: "prehsopital", label: "Choking — First Aid", sublabel: "Infant back blows · child Heimlich manoeuvre", keywords: ["choking", "airway foreign body", "heimlich", "back blows", "chest thrusts", "choking first aid"], icon: Ambulance, color: "text-orange-500" },
  { tab: "prehsopital", label: "Burns — First Aid", sublabel: "Cool running water 20 min · do NOT use ice", keywords: ["burns first aid", "burn management", "cool water burn", "tbsa", "lund browder", "burn percentage"], icon: Fire, color: "text-orange-500" },
  { tab: "prehsopital", label: "Snake Bite — Do It RIGHT", sublabel: "Immobilise · WBCT · no tourniquet", keywords: ["snake bite", "snakebite", "envenomation", "asv", "antivenom", "wbct", "right mnemonic"], icon: Skull, color: "text-orange-500" },
  { tab: "prehsopital", label: "Scorpion Sting", sublabel: "Prazosin 30 mcg/kg · autonomic storm", keywords: ["scorpion", "scorpion sting", "prazosin", "autonomic storm", "scorpion envenomation"], icon: Skull, color: "text-orange-500" },
  { tab: "prehsopital", label: "Poisoning — First Aid", sublabel: "Do NOT induce vomiting · charcoal ≤2hr", keywords: ["poisoning", "overdose", "ingestion", "activated charcoal", "do not induce vomiting", "antidote"], icon: Skull, color: "text-orange-500" },
  { tab: "prehsopital", label: "Poison Information Centres", sublabel: "AIIMS · Amrita · CMC · Egmore · 24hr helplines", keywords: ["poison centre", "poison control", "poison helpline", "aiims poison", "cmc vellore poison", "egmore poison", "amrita poison"], icon: Ambulance, color: "text-teal-500" },
  { tab: "prehsopital", label: "Anaphylaxis — Prehospital", sublabel: "Adrenaline IM 0.01 mg/kg · age-based doses", keywords: ["anaphylaxis prehospital", "anaphylaxis first aid", "epipen", "adrenaline im anaphylaxis", "epinephrine injection"], icon: Ambulance, color: "text-orange-500" },
  { tab: "prehsopital", label: "Transfer Checklist — ABCDE", sublabel: "Stabilise before transfer · SBAR handover", keywords: ["transfer checklist", "stabilise before transfer", "sbar", "ift", "inter-facility transfer", "pre-transfer"], icon: Ambulance, color: "text-orange-500" },
  { tab: "prehsopital", label: "BLS — Basic Life Support", sublabel: "15:2 CPR · 2-thumb technique · adrenaline", keywords: ["bls", "basic life support", "paediatric cpr", "infant cpr", "child cpr", "2-thumb", "compressions child"], icon: Ambulance, color: "text-orange-500" },
  { tab: "prehsopital", label: "Inotrope Ready Reckoner", sublabel: "3×BW mg in 50 mL = 1 mcg/kg/min", keywords: ["inotrope reckoner", "dopamine infusion", "noradrenaline infusion", "inotrope preparation", "3xbw", "vasopressor preparation"], icon: Ambulance, color: "text-orange-500" },

  // ── IMMUNISATION ─────────────────────────────────────────────────────────────
  { tab: "immunisation", label: "IAP Immunisation Schedule", sublabel: "BCG · OPV · DPT · MMR · Hep B · PCV · Varicella", keywords: ["immunisation", "vaccine", "vaccination schedule", "iap schedule", "bcg", "dpt", "mmr", "pcv", "opv", "hep b", "varicella"], icon: Syringe, color: "text-emerald-600" },
  { tab: "immunisation", label: "Catch-up Vaccination", sublabel: "Missed doses · minimum intervals", keywords: ["catch up vaccination", "missed vaccine", "overdue vaccine", "immunisation catch up"], icon: Syringe, color: "text-emerald-600" },
  { tab: "immunisation", label: "COVID-19 Vaccine — Paediatric", sublabel: "Corbevax · Covaxin · 12 yr and above", keywords: ["covid vaccine", "covid-19 paediatric", "corbevax", "covaxin children", "covid 19 child"], icon: Syringe, color: "text-emerald-600" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function scoreMatch(entry, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const label = entry.label.toLowerCase();
  const sublabel = entry.sublabel.toLowerCase();
  const kws = entry.keywords.join(" ").toLowerCase();
  if (label.startsWith(q)) return 100;
  if (label.includes(q)) return 80;
  if (sublabel.includes(q)) return 60;
  const words = q.split(/\s+/);
  const allMatch = words.every(w => kws.includes(w) || label.includes(w) || sublabel.includes(w));
  if (allMatch) return 50;
  const anyMatch = words.some(w => kws.includes(w) || label.includes(w) || sublabel.includes(w));
  if (anyMatch) return 20;
  return 0;
}

// ─── TAB LABEL MAP ────────────────────────────────────────────────────────────
const TAB_LABELS = {
  calculator:    "Calculator",
  equipment:     "Equipment",
  vitals:        "Vitals",
  resuscitation: "Resuscitation",
  ventilator:    "Ventilator",
  fluids:        "Fluids",
  drugs:         "Drug Doses",
  syrup:         "Syrup Calc",
  scores:        "Scores",
  sedation:      "Sedation",
  neonatal:      "Neonatal",
  algorithms:    "Algorithms",
  prehsopital:   "Prehospital",
  immunisation:  "Immunisation",
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function GlobalSearch({ onNavigate }) {
  const [query,   setQuery]   = useState("");
  const [open,    setOpen]    = useState(false);
  const [focused, setFocused] = useState(0);
  const inputRef  = useRef(null);
  const listRef   = useRef(null);

  const results = query.trim().length >= 1
    ? SEARCH_INDEX
        .map(e => ({ ...e, score: scoreMatch(e, query) }))
        .filter(e => e.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
    : [];

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocused(f => Math.min(f + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocused(f => Math.max(f - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[focused]) {
        handleSelect(results[focused]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  }, [open, results, focused]);

  const handleSelect = (entry) => {
    onNavigate(entry.tab);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  // Reset focused when results change
  useEffect(() => { setFocused(0); }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-global-search]")) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll focused result into view
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[focused];
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [focused]);

  const showDropdown = open && query.trim().length >= 1;

  return (
    <div data-global-search className="relative w-full max-w-xs sm:max-w-sm">
      {/* Input */}
      <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all ${
        open
          ? "border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900 shadow-sm"
          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60"
      }`}>
        <MagnifyingGlass
          size={13}
          weight="bold"
          className={open ? "text-slate-500 dark:text-slate-400" : "text-slate-400"}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search drugs, scores, algorithms…"
          className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none min-w-0"
          style={{ fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace' }}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
          >
            <X size={11} weight="bold" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400"
                 style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              No results for "{query}"
            </div>
          ) : (
            <>
              <div ref={listRef} className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {results.map((entry, i) => {
                  const Icon = entry.icon;
                  return (
                    <button
                      key={`${entry.tab}-${entry.label}`}
                      onClick={() => handleSelect(entry)}
                      onMouseEnter={() => setFocused(i)}
                      className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                        focused === i
                          ? "bg-slate-100 dark:bg-slate-800"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 mt-0.5 ${entry.color}`}>
                        <Icon size={14} weight="bold" />
                      </div>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white leading-snug truncate"
                             style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                          {entry.label}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 truncate"
                             style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
                          {entry.sublabel}
                        </div>
                      </div>
                      {/* Tab badge */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                              style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                          {TAB_LABELS[entry.tab] || entry.tab}
                        </span>
                        <ArrowRight size={10} weight="bold" className="text-slate-300 dark:text-slate-600" />
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  ↑↓ navigate · ↵ go · esc close
                </span>
                <span className="ml-auto text-[9px] font-mono text-slate-300 dark:text-slate-600"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
