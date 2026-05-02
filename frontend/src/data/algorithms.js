
// src/data/algorithms.js
// AHA PALS 2025 · NRP 2020 · Fleischer & Ludwig 7e · Nelson 21e
// Referenced by ManagementAlgorithmsTab → AHAAlgorithmsView

// ─── 2025 AHA KEY UPDATES ─────────────────────────────────────────────────────
export const AHA_2025_UPDATES = [
  {
    title:  "Ventilation Rate",
    icon:   "metronome",
    value:  "20–30/min",
    sub:    "Advanced airway in place",
    note:   "Previous guideline was 8–10/min. Now 1 breath every 2–3 s with continuous compressions when advanced airway placed.",
  },
  {
    title:  "Compression-Ventilation",
    icon:   "pulse",
    value:  "15:2",
    sub:    "2-rescuer paediatric (no advanced airway)",
    note:   "Single rescuer continues 30:2. Once advanced airway placed, switch to asynchronous compressions + 20–30 ventilations/min.",
  },
  {
    title:  "Arterial DBP Target",
    icon:   "gauge",
    value:  "≥25 / ≥30",
    sub:    "Infant mmHg / Child mmHg",
    note:   "New 2025 target. If arterial line in place during CPR, titrate compressions to achieve diastolic BP target as feedback metric.",
  },
  {
    title:  "CCF Target",
    icon:   "chart",
    value:  "> 80%",
    sub:    "Chest Compression Fraction",
    note:   "Minimise pre/post-shock pauses to < 10 s. Continuous CPR quality metrics recommended where monitoring available.",
  },
  {
    title:  "Epinephrine Timing",
    icon:   "beaker",
    value:  "< 5 min",
    sub:    "Non-shockable rhythms",
    note:   "Give epinephrine as soon as IV/IO access achieved in PEA/asystole. For VF/pVT: give after 3rd shock (unchanged).",
  },
  {
    title:  "Post-Arrest SpO₂",
    icon:   "brain",
    value:  "94–99%",
    sub:    "Avoid hyperoxia",
    note:   "Target normoxia post-ROSC. Titrate FiO₂ down once SpO₂ reliably ≥94%. PaCO₂ target 35–45 mmHg (normocapnia).",
  },
];

// ─── PALS ALGORITHMS ──────────────────────────────────────────────────────────
// step.type: "action" | "decision" | "drug" | "warning"
// color key must match PALS_COLORS in ManagementAlgorithmsTab:
//   "resuscitation" | "fluid" | "anticonvulsant"

export const ALGORITHMS = [

  // ── 1. PALS OVERVIEW ──────────────────────────────────────────────────────
  {
    id:       "pals-overview",
    title:    "PALS Overview",
    subtitle: "Systematic approach to the critically ill child. Always start here before entering a specific algorithm.",
    badge:    "AHA 2025",
    color:    "resuscitation",
    steps: [
      {
        type:  "action",
        title: "1 — Safety & First Impression",
        body:  "Scene safety → gloves/PPE. First impression: Appearance (tone, interactiveness, cry/speech) · Work of breathing (retractions, nasal flaring, head bobbing) · Circulation (skin colour, mottling, pallor, cyanosis). This 30-second Paediatric Assessment Triangle (PAT) guides urgency.",
      },
      {
        type:  "action",
        title: "2 — Primary Survey (ABCDE)",
        body:  "A — Airway: open/patent? secretions? stridor?\nB — Breathing: rate, effort, aeration, SpO₂\nC — Circulation: HR, BP, CRT, pulses (central vs peripheral), skin\nD — Disability: AVPU/GCS, pupils, BSL (check IMMEDIATELY if altered)\nE — Exposure: temperature, rash, trauma, deformity",
      },
      {
        type:     "decision",
        title:    "Life-Threatening Problem Identified?",
        body:     "If YES → Intervene immediately before completing assessment. If NO → proceed to secondary survey and monitoring.\n\nDo NOT delay CPR, airway intervention, or defibrillation to complete assessment.",
      },
      {
        type:  "action",
        title: "3 — Oxygen & Monitoring",
        body:  "High-flow O₂ via NRM 10–15 L/min for all critically ill children. Attach: pulse oximetry · cardiac monitor · BP cuff · ETCO₂ if intubated. IV/IO access — IO is first-line if IV not achieved within 60–90 sec in arrest or haemodynamic instability.",
      },
      {
        type:  "action",
        title: "4 — Identify & Treat Cause",
        body:  "Use the H's and T's to identify reversible causes in all peri-arrest and arrest situations:\n\n4 H's: Hypoxia · Hypovolaemia · Hypo/hyperkalaemia & metabolic · Hypothermia\n4 T's: Tension pneumothorax · Tamponade (cardiac) · Toxins · Thrombosis (PE/coronary)\n\nBedside echo (RUSH/FAST protocol) is strongly recommended when available.",
      },
      {
        type:  "action",
        title: "5 — Secondary Survey & Disposition",
        body:  "SAMPLE history: Signs/symptoms · Allergies · Medications · Past medical history · Last meal · Events preceding illness. Full head-to-toe exam. Investigations: BSL, VBG/ABG, electrolytes, FBC, cultures, CXR, ECG. PICU/HDU notification early. Family communication and consent.",
      },
    ],
  },

  // ── 2. PAEDIATRIC CARDIAC ARREST ─────────────────────────────────────────
  {
    id:       "cardiac-arrest",
    title:    "Cardiac Arrest",
    subtitle: "Pulseless arrest. Start CPR immediately — quality compressions are the most important intervention.",
    badge:    "AHA 2025",
    color:    "resuscitation",
    steps: [
      {
        type:  "action",
        title: "Start CPR Immediately",
        body:  "Rate 100–120/min · Depth ≥ ⅓ AP diameter (≥4 cm infant, ≥5 cm child) · Allow full chest recoil between compressions · Minimise interruptions (CCF target > 80%) · 2-thumb encircling technique preferred in infants · 2-hand technique in children.\n\nBag-mask ventilation with FiO₂ 1.0 · Ratio 15:2 (2-rescuer paediatric) or 30:2 (single rescuer) until advanced airway placed.",
      },
      {
        type:  "action",
        title: "Attach Monitor & Check Rhythm",
        body:  "Attach defibrillator/monitor as soon as available. Check rhythm while maintaining CPR.\n\nIV/IO access — IO (tibial plateau preferred in < 6 yr) if IV not achieved within 60–90 seconds.",
      },
      {
        type:     "decision",
        title:    "Is the Rhythm Shockable?",
        body:     "SHOCKABLE: VF (ventricular fibrillation) or pulseless VT (ventricular tachycardia with wide QRS > 0.08 s)\n\nNON-SHOCKABLE: Asystole or PEA (pulseless electrical activity with any narrow/wide QRS)\n\nNote: Shockable rhythms are UNCOMMON in children (most paediatric arrests are asphyxial → PEA/asystole). VF more common in adolescents, channelopathies, structural heart disease.",
      },
      {
        type:  "drug",
        title: "Non-Shockable (PEA / Asystole) — Epinephrine ASAP",
        body:  "Epinephrine 0.01 mg/kg IV/IO (= 0.1 mL/kg of 1:10,000 solution). Max dose 1 mg.\n→ Repeat every 3–5 min throughout arrest.\n→ 2025 AHA: Give as soon as IV/IO available — do NOT delay.\n\nETT dose if no IV/IO: 0.1 mg/kg (= 0.1 mL/kg of 1:1,000) — much less reliable.\n\nSodium bicarbonate 1 mEq/kg IV/IO — ONLY for prolonged arrest (>10 min) or confirmed severe metabolic acidosis or hyperkalaemia.",
      },
      {
        type:  "action",
        title: "Shockable (VF / pVT) — Defibrillate",
        body:  "Defibrillation: 4 J/kg — UNSYNCHRONISED (do NOT synchronise for VF/pVT).\n→ Resume CPR IMMEDIATELY after shock — do NOT pause to check pulse.\n→ Reassess rhythm after 2 min CPR.\n\nFor refractory VF/pVT:\nAmiodarone 5 mg/kg IV/IO (max 300 mg) — after 3rd shock, repeat after 5th shock.\nOR Lidocaine 1 mg/kg IV/IO if amiodarone unavailable.\n\nAdd Epinephrine 0.01 mg/kg IV/IO after 3rd shock, then every 3–5 min.\nMagnesium 25–50 mg/kg IV/IO for Torsades de Pointes or hypomagnesaemia.",
      },
      {
        type:  "action",
        title: "Advanced Airway",
        body:  "Intubate when CPR is ongoing — do NOT stop compressions for intubation attempt.\n→ Once advanced airway in place: switch to ASYNCHRONOUS compressions at 100–120/min + ventilation at 20–30 breaths/min (1 breath every 2–3 s) — 2025 AHA update.\n→ Confirm ETT: waveform ETCO₂ (most reliable), bilateral breath sounds, chest rise, CXR.\n→ ETCO₂ < 10 mmHg despite good CPR = consider compressor change, epinephrine. Sustained ETCO₂ rise suggests ROSC.",
      },
      {
        type:  "warning",
        title: "Reversible Causes — Check Throughout",
        body:  "4 H's: Hypoxia (commonest paediatric cause) · Hypovolaemia (give NS 10–20 mL/kg IO/IV) · Hypo/hyperkalaemia + other metabolic · Hypothermia (active rewarming, continue CPR until ≥32°C)\n\n4 T's: Tension PTX (needle decompression 4th/5th ICS MAL then ICD) · Tamponade (pericardiocentesis — bedside echo) · Toxins (specific antidotes where available) · Thrombosis (consider thrombolytics if PE suspected)",
      },
      {
        type:  "action",
        title: "Post-Resuscitation Care (ROSC)",
        body:  "SpO₂ target 94–99% — avoid hyperoxia (wean FiO₂). PaCO₂ 35–45 mmHg (avoid hypo/hypercapnia).\nTemperature: Targeted temperature management (TTM) 36–37.5°C × 48 hr — AVOID hyperthermia > 37.5°C.\nBP: maintain age-appropriate MAP — dopamine or epinephrine infusion if needed.\nGlucose: target 4–8 mmol/L — correct hypo/hyperglycaemia.\n12-lead ECG (look for QTc prolongation, Brugada, LQTS, channelopathy).\nEcho + neurology consult · PICU admission · Family debrief.",
      },
    ],
  },

  // ── 3. BRADYCARDIA ────────────────────────────────────────────────────────
  {
    id:       "bradycardia",
    title:    "Bradycardia",
    subtitle: "HR below normal for age with signs of poor perfusion. Sinus bradycardia in a sick child = hypoxia until proven otherwise.",
    badge:    "AHA 2025",
    color:    "resuscitation",
    steps: [
      {
        type:  "action",
        title: "Identify & Support",
        body:  "Normal HR thresholds: < 1 yr < 100/min · 1–8 yr < 80/min · > 8 yr < 60/min.\n\nImmediate: O₂ at highest available concentration · Position (sniffing/neutral) · Suction secretions · Bag-mask ventilation if inadequate respiratory effort.\n\nMonitor: attach cardiac monitor, pulse ox, BP.",
      },
      {
        type:     "decision",
        title:    "Adequate Perfusion?",
        body:     "ADEQUATE PERFUSION (HR low but child alert, pink, CRT < 2 s, BP normal) → Support, observe, treat cause. No immediate intervention needed.\n\nPOOR PERFUSION (altered consciousness, hypotension, severe respiratory distress, poor CRT, cyanosis) → Act immediately.",
      },
      {
        type:  "action",
        title: "Treat Cause First",
        body:  "Most common causes of bradycardia in children:\n· Hypoxia — MOST COMMON, treat with airway + O₂ first\n· Increased vagal tone (suctioning, defecation, Valsalva, laryngoscopy)\n· Hypothermia\n· Raised intracranial pressure (Cushing's triad: bradycardia + hypertension + irregular respirations)\n· Drug/toxin: beta-blockers, calcium channel blockers, digoxin, organophosphates\n· Structural heart disease, post-cardiac surgery\n· Electrolyte: hyperkalaemia, hypocalcaemia\n\nIf cause is hypoxia → airway + ventilation is the TREATMENT, not atropine.",
      },
      {
        type:  "drug",
        title: "Pharmacological Treatment (Poor Perfusion)",
        body:  "Step 1 — Epinephrine 0.01 mg/kg IV/IO (0.1 mL/kg of 1:10,000). Repeat every 3–5 min.\n→ Preferred over atropine in most paediatric scenarios.\n\nStep 2 — Atropine 0.02 mg/kg IV/IO. Min dose 0.1 mg, max single dose 0.5 mg (child) / 1 mg (adolescent).\n→ Use for vagally-mediated bradycardia (suctioning, laryngoscopy).\n→ May repeat once.\n\nStep 3 — Epinephrine infusion 0.1–1 mcg/kg/min if persistent bradycardia.\nOR Dopamine infusion 5–20 mcg/kg/min as alternative.",
      },
      {
        type:  "action",
        title: "CPR If Pulseless or HR < 60 With Poor Perfusion",
        body:  "If HR < 60/min despite adequate oxygenation and ventilation AND signs of poor perfusion → START CPR.\n\nCPR takes priority over drugs. Do not delay compressions to find IV access.\n\nFollow Cardiac Arrest algorithm.\n\nPacing: consider transcutaneous pacing for complete heart block or sinus node dysfunction unresponsive to medications — specialist input required.",
      },
    ],
  },

  // ── 4. TACHYCARDIA ────────────────────────────────────────────────────────
  {
    id:       "tachycardia",
    title:    "Tachycardia",
    subtitle: "Differentiate sinus tachycardia (reactive) from SVT and VT. Stability determines urgency.",
    badge:    "AHA 2025",
    color:    "resuscitation",
    steps: [
      {
        type:  "action",
        title: "Assess & Characterise",
        body:  "Attach monitor + 12-lead ECG.\n\nKey differentiation:\n· Sinus tachycardia: gradual onset, history explains (fever, pain, dehydration, anaemia, anxiety), HR usually < 220 (infant) / < 180 (child), P wave before every QRS, variable RR interval.\n· SVT: abrupt onset/offset, HR typically > 220 (infant) / > 180 (child), P absent or retrograde, fixed RR, often narrow QRS (may be wide with aberrancy or WPW).\n· VT: wide QRS > 0.09 s, AV dissociation, rate 120–300, capture/fusion beats pathognomonic.",
      },
      {
        type:     "decision",
        title:    "Adequate Perfusion / Stable?",
        body:     "UNSTABLE (any of): hypotension for age, altered consciousness, signs of shock, severe respiratory distress, chest pain with haemodynamic compromise → SYNCHRONISED CARDIOVERSION immediately.\n\nSTABLE → Identify rhythm type, proceed stepwise.\n\nWARNING — WPW: if AF + WPW (irregular wide-complex tachycardia) → AVOID adenosine, digoxin, verapamil. These may accelerate conduction → VF. Seek senior/electrophysiology input.",
      },
      {
        type:  "action",
        title: "Stable Narrow QRS SVT — Vagal Manoeuvres First",
        body:  "Infants: Ice bag to face for 15–30 s (diving reflex) — most effective single vagal manoeuvre in infants. Do NOT cover airway.\n\nChildren: Valsalva — blow through narrow straw/occluded syringe barrel. Modified Valsalva: strain for 15 s → immediately lay supine + elevate legs 45° for 15 s (improves conversion rate to ~40%).\n\nOlder children: Carotid sinus massage — light pressure at jaw angle for 5 s (one side only).\n\nDO NOT: apply ocular pressure (risk of retinal detachment).",
      },
      {
        type:  "drug",
        title: "Stable SVT — Adenosine (If Vagal Fails)",
        body:  "Adenosine 0.1 mg/kg RAPID IV push + immediate 10 mL NS flush (max first dose 6 mg).\n→ Give in largest most proximal vein available (antecubital or central preferred).\n→ Half-life 10 s — speed of administration is critical.\n→ Warn patient: brief chest tightness/flushing/feeling of doom — transient.\n\nIf no response: Adenosine 0.2 mg/kg rapid IV push (max 12 mg). One further attempt at this dose.\n\nIO route: same dose, equally effective.\n\nRefractory narrow SVT:\nAmiodarone 5 mg/kg IV over 20–60 min (preferred in structural heart disease).\nOR Procainamide 15 mg/kg IV over 30–60 min (avoid if prolonged QT).\nDo NOT give verapamil in children < 1 yr — risk of cardiovascular collapse.",
      },
      {
        type:  "action",
        title: "Unstable SVT or VT — Synchronised Cardioversion",
        body:  "SYNCHRONISED DC cardioversion: 1 J/kg initial → escalate to 2 J/kg if no conversion.\n→ ALWAYS synchronise for SVT and VT with pulse — unsynchronised only for VF or pulseless VT.\n→ Sedation/analgesia if patient is conscious (ketamine 1–2 mg/kg IV or midazolam 0.05 mg/kg IV).\n→ Document rhythm before and after.\n\nPost-cardioversion: 12-lead ECG · look for delta waves (WPW) · electrolytes · echo if structural disease suspected · cardiology consult.',",
      },
      {
        type:  "drug",
        title: "Stable Wide-Complex VT",
        body:  "Treat as VT until proven otherwise — wide QRS tachycardia in haemodynamically stable child.\n\nAmiodarone 5 mg/kg IV over 20–60 min — preferred (avoid in hepatic disease or thyroid disorders).\nOR Procainamide 15 mg/kg IV over 30–60 min — effective but requires cardiac monitoring (risk of QT prolongation, hypotension).\n\nDo NOT give adenosine if VT is likely (may cause haemodynamic deterioration).\nDo NOT delay cardioversion if patient deteriorates.",
      },
    ],
  },

  // ── 5. NRP — NEONATAL RESUSCITATION ──────────────────────────────────────
  {
    id:       "nrp",
    title:    "NRP — Neonatal Resus",
    subtitle: "Neonatal Resuscitation Program 2020 · IAP NRP 2021. Most neonates need warmth and stimulation only.",
    badge:    "NRP 2020",
    color:    "fluid",
    steps: [
      {
        type:  "action",
        title: "Birth — First 30 Seconds",
        body:  "Answer 3 questions simultaneously:\n1. Term gestation (≥37 weeks)?\n2. Good muscle tone?\n3. Breathing or crying?\n\nIF YES TO ALL → Routine care: delayed cord clamping ≥ 60 s (non-asphyxiated) · dry and stimulate · skin-to-skin · ongoing evaluation.\n\nIF NO TO ANY → Cord clamp (delayed if condition permits) → Warm, dry, stimulate (vigorous drying of the trunk and extremities) → Clear airway if copious/visible secretions (bulb syringe or catheter, limit suctioning). Place under radiant warmer or plastic wrap for < 32 weeks.",
      },
      {
        type:  "action",
        title: "Initial SpO₂ Targets (Right Hand — Pre-Ductal)",
        body:  "1 min: 60–65% · 2 min: 65–70% · 3 min: 70–75% · 5 min: 80–85% · 10 min: 85–95%\n\nInitial FiO₂:\n· Term (≥ 36 weeks): start with 0.21 (room air)\n· Preterm 32–35 weeks: start with 0.21–0.30\n· Preterm < 32 weeks: start with 0.30\n→ Titrate FiO₂ up or down to meet SpO₂ targets.\n\nHeart rate assessment: ECG monitor preferred (more accurate than pulse oximetry in newborns).",
      },
      {
        type:     "decision",
        title:    "HR ≥ 100 and Breathing? (After Initial Steps)",
        body:     "HR ≥ 100/min AND adequate breathing/crying AND SpO₂ improving → Routine care / ongoing monitoring.\n\nHR < 100/min OR apnoea/gasping OR laboured breathing → Begin PPV immediately.\n\nThe most important action in neonatal resuscitation is EFFECTIVE VENTILATION.",
      },
      {
        type:  "action",
        title: "PPV — Positive Pressure Ventilation",
        body:  "Rate: 40–60 breaths/min (squeeze-release-release counting rhythm).\nPressure: initial 20–25 cmH₂O (up to 30 cmH₂O if no chest rise).\nPEEP: 5 cmH₂O — T-piece resuscitator preferred over self-inflating bag (better PEEP/PIP control).\n\nMR SOPA — if chest not rising after 5 breaths:\nM — Mask readjustment\nR — Reposition airway (neutral or slight sniff position)\nS — Suction mouth and nose\nO — Open mouth slightly\nP — Pressure increase (up to 30–40 cmH₂O)\nA — Airway alternative (LMA or intubation)\n\nReassess HR after every 30 seconds of PPV.",
      },
      {
        type:     "decision",
        title:    "HR After 30 s of PPV?",
        body:     "HR ≥ 100/min and rising → Gradually reduce PPV, wean FiO₂, continue monitoring.\nHR 60–100/min → Check ventilation quality (chest rise, MR SOPA) · consider intubation.\nHR < 60/min despite effective PPV × 30 s → BEGIN CHEST COMPRESSIONS.",
      },
      {
        type:  "action",
        title: "Chest Compressions",
        body:  "Technique: 2-THUMB ENCIRCLING method preferred (generates higher peak BP and coronary perfusion pressure than 2-finger technique).\nThumb placement: just below nipple line on lower sternum.\nDepth: ⅓ AP diameter of chest.\nRate: Ratio 3:1 (compressions:breaths) = 90 compressions + 30 breaths = 120 events/min.\nAllow complete chest recoil without lifting thumbs.\n\nIncrease FiO₂ to 1.0 during chest compressions.\nIntubate if not already done — ensures effective ventilation during compressions.\n\nReassess HR every 60 seconds.',",
      },
      {
        type:  "drug",
        title: "HR < 60 After ≥ 30 s of Coordinated CPR + PPV",
        body:  "Epinephrine (adrenaline):\n· IV/IO (umbilical vein IV preferred): 0.01–0.03 mg/kg (= 0.1–0.3 mL/kg of 1:10,000 solution)\n· ETT (last resort, less reliable): 0.05–0.1 mg/kg (= 0.5–1 mL/kg of 1:10,000)\n→ Repeat every 3–5 min.\n\nVolume: if pale, weak pulses, suspected hypovolaemia → NS 10 mL/kg IV/IO over 5–10 min. Repeat if needed.\n\nTargeted Temperature Management (TTM): if ≥ 36 weeks + signs of HIE (encephalopathy) → do NOT actively cool in delivery room without proper TTM device. Transfer to NICU. Initiate cooling at 6 hr of life if criteria met.",
      },
      {
        type:  "warning",
        title: "When to Consider Stopping",
        body:  "Resuscitation may be discontinued if no HR is detectable after 20 minutes of effective resuscitation (adequate chest compressions + ventilation + epinephrine × 3 doses) at term gestation with no special circumstances.\n\nThis should be a team decision involving senior clinician, family where appropriate, and documented carefully.\n\nContinue for longer in: hypothermia, congenital heart disease, suspected reversible cause, borderline gestational age with family wishes.\n\nFamily communication: clear, compassionate, contemporaneous documentation.",
      },
    ],
  },

];
