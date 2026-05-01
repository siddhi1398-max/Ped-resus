// criticalCare.js — Pediatric Critical Care Reference
// Refs: Tintinalli Ch.30 · BTS/ATS Guidelines · OpenPediatrics
//       PEMVECC 2017 · ARDSnet · Fleischer & Ludwig 7th Ed

// ─── ICD / CHEST TUBE ────────────────────────────────────────────────────────

export const ICD_INSERTION = {
  indications: [
    "Tension pneumothorax (after needle decompression)",
    "Simple / persistent pneumothorax",
    "Haemothorax",
    "Pleural effusion — large or symptomatic (parapneumonic, malignant)",
    "Empyema",
    "Chylothorax",
    "Penetrating chest trauma with chest signs",
    "Post-cardiothoracic surgery",
  ],

  contraindications: {
    absolute: "None in tension pneumothorax",
    relative: ["Coagulopathy (correct: INR < 1.5, platelets > 50)", "Pulmonary bullae", "Pleural adhesions"],
  },

  sizing: [
    { weight: "Neonate < 5 kg",    range: "8–10 Fr",  pneumo: "8 Fr",    fluid: "10 Fr"  },
    { weight: "Infant 5–10 kg",    range: "10–12 Fr", pneumo: "10 Fr",   fluid: "12 Fr"  },
    { weight: "Child 10–20 kg",    range: "12–18 Fr", pneumo: "12–14 Fr",fluid: "16–18 Fr"},
    { weight: "Child 20–40 kg",    range: "20–28 Fr", pneumo: "16–20 Fr",fluid: "24–28 Fr"},
    { weight: "Adolescent > 40 kg",range: "28–32 Fr", pneumo: "20–24 Fr",fluid: "28–32 Fr"},
  ],

  equipment: [
    "Sterile drape, gown, gloves, mask, eye protection",
    "2% chlorhexidine skin prep",
    "Lidocaine 1% with adrenaline (max 4.5 mg/kg plain · 7 mg/kg with adrenaline)",
    "10 mL syringe + 21G + 25G needles",
    "Scalpel #11 blade",
    "Curved Kelly / Roberts forceps",
    "Chest tube (size per weight)",
    "Underwater seal drainage system (or Heimlich valve for transport)",
    "Suction tubing (set at –20 cmH₂O)",
    "2-0 silk on curved cutting needle (anchor + horizontal mattress)",
    "Sterile transparent occlusive dressing",
  ],

  technique: [
    { step: 1, text: "Position: supine, affected arm abducted above head, or semi-recumbent at 45°" },
    { step: 2, text: "Safe triangle: anterior border latissimus dorsi · lateral border pectoralis major · base at 5th ICS (nipple line in males)" },
    { step: 3, text: "Mark 4–5th ICS mid-axillary line. NEVER insert below 5th ICS — diaphragm / abdominal organ injury risk" },
    { step: 4, text: "Clean, drape, infiltrate LA: skin → subcut → upper rib periosteum → parietal pleura. Aspirate to confirm space before incising" },
    { step: 5, text: "2–3 cm transverse incision ABOVE upper border of rib below chosen ICS (neurovascular bundle runs under each rib)" },
    { step: 6, text: "Blunt dissect with closed Kelly forceps over rib through intercostal muscles and pleura. 'Pop' felt entering pleural space" },
    { step: 7, text: "Finger sweep through tract to confirm pleural space and exclude adhesions / lung" },
    { step: 8, text: "NEVER use trocar in children (high lung perforation risk). Grasp tube tip with Kelly, advance apically for PTX / basally for fluid" },
    { step: 9, text: "Confirm: fogging in tube on expiration, bubbling on cough (PTX), or fluid drainage (haemothorax/effusion)" },
    { step: 10, text: "Anchor with 2-0 silk; horizontal mattress for closure on removal. Connect to underwater seal at –20 cmH₂O. Occlusive dressing" },
    { step: 11, text: "Post-insertion CXR: confirm tip position (apex for PTX, base for fluid). Exclude kink or subcutaneous placement" },
  ],

  postCare: [
    "Vital signs q15 min × 4, then q1h × 4, then q4h",
    "Chart drainage volume and character hourly initially",
    "NEVER clamp a draining pneumothorax",
    "Watch for: tension PTX (if clamped), surgical emphysema, infection, persistent bubbling (BPF)",
    "Analgesia: paracetamol + ibuprofen + intercostal block with bupivacaine",
    "Daily CXR until removal",
  ],

  removal: {
    criteria: [
      "< 2 mL/kg/day drainage for 24 hours",
      "No air leak for ≥ 12 hours",
      "Lung re-expanded on CXR",
    ],
    steps: [
      "Wean: suction → underwater seal 4–6 hr → clamp trial 4–6 hr + CXR (PTX only)",
      "Remove during expiration / Valsalva. Tie purse-string as tube exits",
      "Occlusive dressing × 24–48 hr. Post-removal CXR within 4 hr",
    ],
  },

  complications: [
    "Lung perforation (trocar use — never use in children)",
    "Diaphragmatic / liver / spleen injury (insertion below 5th ICS)",
    "Intercostal artery laceration (lower rib border — avoid)",
    "Tube malposition: extra-pleural, intra-fissural, abdominal",
    "Re-expansion pulmonary oedema (limit drainage to 1L at a time in large effusions)",
    "Subcutaneous emphysema",
    "Empyema / wound infection",
    "Persistent air leak — bronchopleural fistula",
  ],
};

// ─── VENTILATOR SETTINGS ──────────────────────────────────────────────────────

export const VENTILATOR = {

  // Initial parameter targets
  initialSettings: [
    {
      param: "Mode",
      pediatric: "PRVC (Pressure-Regulated Volume Control) or SIMV-PC + PS",
      neonatal: "PC-AC / SIMV-PC + PS · Volume-guarantee if available",
      note: "PS 5–10 cmH₂O for spontaneous breaths. Volume-targeted preferred in children > 5 kg.",
    },
    {
      param: "Tidal Volume",
      pediatric: "6–8 mL/kg IBW",
      neonatal: "4–6 mL/kg",
      note: "Use IBW. Lower (4–6 mL/kg) in ARDS or lung-protective strategy. NEVER exceed 10 mL/kg.",
    },
    {
      param: "Respiratory Rate",
      pediatric: "Infant 25–35 · Toddler 20–28 · Child 18–22 · Adolescent 12–18 /min",
      neonatal: "40–60 /min",
      note: "Adjust to maintain age-appropriate minute ventilation. Allow Te ≥ 2× Ti.",
    },
    {
      param: "PEEP",
      pediatric: "5 cmH₂O (start) · titrate 8–15 in ARDS",
      neonatal: "4–6 cmH₂O",
      note: "PEEP < 4 → atelectasis risk. High PEEP improves oxygenation but reduces venous return.",
    },
    {
      param: "FiO₂",
      pediatric: "Start 1.0 → titrate to lowest maintaining SpO₂ ≥ 92%",
      neonatal: "Term 0.21–0.30 · Preterm 0.21–0.30. Target NRP SpO₂ per minute of life",
      note: "Reduce to < 0.60 as soon as safe (O₂ toxicity risk). Target SpO₂ 90–95% in preterm (limit ROP).",
    },
    {
      param: "I:E Ratio",
      pediatric: "1:2 normal · 1:3–1:4 obstructive disease",
      neonatal: "1:1 to 1:2",
      note: "Extend expiratory time in asthma/bronchiolitis to prevent auto-PEEP. Inverse ratio (I > E) only in severe ARDS.",
    },
    {
      param: "Inspiratory Time",
      pediatric: "< 1yr: 0.6–0.8 s · 1–5yr: 0.8–1.0 s · 5–12yr: 1.0–1.2 s · >12yr: 1.2–1.5 s",
      neonatal: "0.3–0.5 s",
      note: "Too short → inadequate Vt delivery. Too long → limits RR, ↑ risk hypercapnia.",
    },
    {
      param: "PIP / Plateau",
      pediatric: "Plateau ≤ 30 cmH₂O · Driving pressure (Plateau – PEEP) < 15",
      neonatal: "PIP 15–25 cmH₂O initially",
      note: "Plateau > 30 → barotrauma. Driving pressure is a stronger mortality predictor than Vt alone in ARDS.",
    },
  ],

  // Sedation and paralysis
  sedation: {
    routine: [
      "Midazolam 0.05–0.2 mg/kg/hr infusion",
      "Fentanyl 1–4 mcg/kg/hr infusion",
      "Target: COMFORT-B score 11–17",
    ],
    nmb: "Rocuronium 0.6–1 mg/kg bolus then 5–10 mcg/kg/min. Only for: severe dyssynchrony, refractory ARDS, prone positioning",
    principles: "Daily sedation interruption + spontaneous breathing trial as tolerated. Avoid over-sedation — prolongs ventilation",
  },

  // Condition-specific adjustments
  conditionPresets: [
    {
      condition: "Normal Lungs",
      vtFactor: 7,
      peep: 5,
      fio2Start: 0.40,
      rateAdj: 1.0,
      ie: "1:2",
      note: "Standard post-intubation. Titrate down FiO₂ rapidly.",
    },
    {
      condition: "ARDS",
      vtFactor: 5,
      peep: 10,
      fio2Start: 0.80,
      rateAdj: 1.3,
      ie: "1:2",
      note: "Lung-protective: Vt 4–6 mL/kg, high PEEP, accept pH 7.20–7.30",
    },
    {
      condition: "Asthma / BPD",
      vtFactor: 7,
      peep: 5,
      fio2Start: 0.50,
      rateAdj: 0.7,
      ie: "1:3 to 1:4",
      note: "Low rate, long expiratory time. Avoid auto-PEEP. Bronchodilators in-line.",
    },
    {
      condition: "Pneumonia",
      vtFactor: 6,
      peep: 6,
      fio2Start: 0.60,
      rateAdj: 1.1,
      ie: "1:2",
      note: "Moderate PEEP. Standard Vt. Watch for consolidation worsening.",
    },
    {
      condition: "Post-Cardiac Surgery",
      vtFactor: 6,
      peep: 5,
      fio2Start: 0.40,
      rateAdj: 1.0,
      ie: "1:2",
      note: "Aim early extubation. Avoid high PEEP (reduces venous return).",
    },
    {
      condition: "PPHN (Neonatal)",
      vtFactor: 5,
      peep: 5,
      fio2Start: 1.0,
      rateAdj: 1.5,
      ie: "1:1.5",
      note: "High FiO₂, consider iNO. Avoid hypocarbia. Target pH 7.45–7.55.",
    },
    {
      condition: "Bronchiolitis",
      vtFactor: 6,
      peep: 5,
      fio2Start: 0.50,
      rateAdj: 0.8,
      ie: "1:3",
      note: "HFNC/NIV preferred. If intubated: low rate, long Te, avoid breath stacking.",
    },
  ],

  // ARDSnet PEEP-FiO2 ladder
  ardsPeepFio2: [
    { fio2: 0.30, peep: 5  },
    { fio2: 0.40, peep: 5  },
    { fio2: 0.50, peep: 8  },
    { fio2: 0.60, peep: 10 },
    { fio2: 0.70, peep: 10 },
    { fio2: 0.80, peep: 10 },
    { fio2: 0.90, peep: 14 },
    { fio2: 1.0,  peep: 18 },
  ],

  // Troubleshooting
  troubleshooting: [
    {
      id: "high-pip",
      problem: "↑ Peak Airway Pressure",
      severity: "urgent",
      waveformType: "high-pip",
      causes: [
        "Bronchospasm / secretions",
        "ETT obstruction, kink, or biting",
        "Pneumothorax",
        "Main-stem intubation",
        "Pulmonary oedema / stiff ARDS lung",
      ],
      action: "DOPE: Disconnect → bag manually. D-isplaced ETT · O-bstruction (suction) · P-neumothorax (auscultate/US) · E-quipment failure",
      pearl: "Peak–Plateau gradient > 10 cmH₂O = airway resistance (secretions, bronchospasm). Both elevated = compliance problem (ARDS, PTX, oedema).",
    },
    {
      id: "low-vt",
      problem: "↓ Tidal Volume / Minute Ventilation",
      severity: "urgent",
      waveformType: "cuff-leak",
      causes: [
        "Cuff leak (gurgling sound)",
        "Circuit disconnect",
        "ETT dislodgement",
        "Severe bronchospasm",
      ],
      action: "Check ETT depth + cuff pressure (target 20–25 cmH₂O). Inspect all circuit connections. Observe bilateral chest rise.",
      pearl: "In PC ventilation: ↓Vt with unchanged PIP = ↓ compliance. In VC: ↑PIP with unchanged Vt = ↑ resistance or ↓ compliance.",
    },
    {
      id: "hypoxia",
      problem: "Refractory Hypoxia (SpO₂ < 88%)",
      severity: "critical",
      waveformType: "hypoxia",
      causes: [
        "FiO₂ / PEEP inadequate",
        "Main-stem intubation",
        "Pneumothorax",
        "Pulmonary embolism",
        "Cardiac R→L shunt",
        "Decompensated heart failure",
      ],
      action: "1. FiO₂ → 1.0 immediately. 2. Confirm bilateral breath sounds. 3. Bedside echo. 4. CXR. 5. Recruitment manoeuvre in ARDS (30 cmH₂O × 30 s).",
      pearl: "Pre-ductal (right hand) vs post-ductal (foot) SpO₂ difference > 5% in neonates = R→L ductal shunting (PPHN).",
    },
    {
      id: "hypercapnia",
      problem: "Hypercapnia (PaCO₂ > 55 mmHg)",
      severity: "moderate",
      waveformType: "hypercapnia",
      causes: [
        "Low rate or Vt",
        "↑ Dead space (high PEEP, ↓CO)",
        "↑ CO₂ production (fever, sepsis, agitation)",
        "ETT cuff leak",
      ],
      action: "Increase RR (preferred over Vt). Accept permissive hypercapnia pH 7.20–7.30 in ARDS. Treat fever. Check cuff leak.",
      pearl: "ETCO₂ normally 5–10 mmHg less than PaCO₂. Widening gap = ↑ dead space (PE, low CO, high PEEP).",
    },
    {
      id: "auto-peep",
      problem: "Auto-PEEP / Breath Stacking",
      severity: "moderate",
      waveformType: "auto-peep",
      causes: [
        "Obstructive disease (asthma, bronchiolitis)",
        "Inadequate expiratory time",
        "High respiratory rate",
      ],
      action: "Reduce RR, extend I:E to 1:3–1:4. Bronchodilators via in-line nebuliser. Confirm on flow-time waveform (flow not returning to zero before next breath).",
      pearl: "To measure auto-PEEP: perform expiratory hold. In severe asthma with haemodynamic compromise — brief disconnection allows full exhalation.",
    },
    {
      id: "dysynchrony",
      problem: "Patient–Ventilator Dyssynchrony",
      severity: "moderate",
      waveformType: "dysynchrony",
      causes: [
        "Pain / agitation (inadequate sedation)",
        "Inappropriate trigger sensitivity",
        "Auto-PEEP",
        "Inappropriate flow or Ti",
      ],
      action: "Optimise fentanyl + midazolam. Adjust flow trigger 1–3 L/min (or pressure trigger –1 to –2 cmH₂O). Check auto-PEEP. Consider PRVC if fighting VC mode.",
      pearl: "COMFORT-B target 11–17. NMB only for severe dyssynchrony or prone. Daily sedation interruption reduces ventilator days.",
    },
    {
      id: "flow-starvation",
      problem: "Flow Starvation (VC Mode)",
      severity: "moderate",
      waveformType: "flow-starvation",
      causes: [
        "Set flow rate too low for patient demand",
        "Inadequate inspiratory time",
        "High patient respiratory drive",
      ],
      action: "Increase set flow rate. Switch to pressure-targeted mode (PC or PRVC) which delivers variable flow matching patient demand. Optimise sedation.",
      pearl: "Pressure waveform shows 'scooped out' appearance mid-inspiration — patient pulling in extra flow not provided by ventilator. Increases work of breathing.",
    },
  ],

  // Protective strategy
  protectiveStrategy: [
    "Vt 4–6 mL/kg PBW · Plateau ≤ 30 cmH₂O · Driving pressure ≤ 15 cmH₂O",
    "Permissive hypercapnia: pH 7.20–7.45 to achieve low Vt/pressure targets",
    "PEEP–FiO₂ titration per ARDSnet ladder",
    "Recruitment manoeuvre: 30–40 cmH₂O × 30–40 s for refractory hypoxia (avoid if haemodynamically unstable)",
    "Prone positioning ≥ 12 hr/day if PaO₂/FiO₂ < 150",
    "iNO: rescue for refractory hypoxaemia, PPHN, post-cardiac surgery",
    "ECMO: OI > 40 or PaO₂/FiO₂ < 100 despite optimised ventilation",
  ],

  // Weaning protocol
  weaning: {
    readiness: [
      "Haemodynamically stable (no/minimal vasopressors)",
      "SpO₂ ≥ 92% on FiO₂ ≤ 0.40 + PEEP ≤ 5–8 cmH₂O",
      "Adequate cough and gag reflex",
      "Spontaneous respiratory effort present",
      "pH ≥ 7.30, resolving primary pathology",
      "Sedation weaned (COMFORT-B ≤ 17)",
    ],
    sbt: {
      settings: "PS 5–8 + PEEP 5 × 30–120 min",
      monitor: ["RR, SpO₂, HR, BP q15 min", "Work of breathing, diaphoresis, agitation", "Stop SBT if SpO₂ < 90%, RR > 2× baseline, haemodynamic instability"],
    },
    cuffLeak: "Deflate ETT cuff. Audible leak = lower risk of post-extubation stridor. No leak in child < 7 yr → dexamethasone pre-extubation.",
    preExtubationDex: "Dexamethasone 0.25 mg/kg q6h × 4 doses IV (first dose 12 hr before extubation). Max 10 mg. Indicated if: prolonged intubation > 5 days, age < 7 yr, no cuff leak, prior stridor.",
    postExtubation: [
      { label: "HFNC", detail: "2–3 L/kg/min. Titrate FiO₂ to SpO₂ ≥ 92%" },
      { label: "NIV (CPAP/BiPAP)", detail: "CPAP 5–8 cmH₂O or BiPAP IPAP 10–14 / EPAP 5. If HFNC failing" },
      { label: "Heliox 70:30", detail: "Post-extubation stridor — reduces turbulent flow" },
      { label: "Nebulised adrenaline", detail: "0.5 mL/kg of 1:1000 (max 5 mL) for post-extubation stridor. Observe ≥ 2 hr" },
    ],
  },
};

// ─── WAVEFORM DEFINITIONS (for SVG rendering) ────────────────────────────────
// Each entry describes the clinical scenario and SVG path data
// for pressure-time, flow-time, and volume-time scalars

export const WAVEFORMS = [
  {
    id: "normal-vc",
    label: "Normal — Volume Control",
    category: "normal",
    description: "Square flow pattern. Pressure rises linearly to PIP. Volume rises as ascending ramp. Expiratory flow returns smoothly to zero.",
    findings: ["PIP clearly visible", "Plateau pressure measurable on inspiratory hold", "Flow returns to baseline before next breath"],
  },
  {
    id: "normal-pc",
    label: "Normal — Pressure Control",
    category: "normal",
    description: "Decelerating flow (rapid then declining). Pressure rectangular with set limit. Volume rises quickly then plateaus.",
    findings: ["Decelerating flow pattern", "Volume delivered depends on compliance and resistance", "Flow always returns to zero (no auto-PEEP)"],
  },
  {
    id: "high-pip",
    label: "↑ PIP — High Resistance (Bronchospasm / Secretions)",
    category: "abnormal",
    description: "Peak pressure elevated with normal plateau. Large Peak–Plateau gradient (> 10 cmH₂O). Expiratory flow may be prolonged.",
    findings: ["PIP elevated", "Plateau normal or mildly elevated", "Peak–Plateau gap > 10 cmH₂O = AIRWAY problem"],
  },
  {
    id: "low-compliance",
    label: "↑ PIP + Plateau — Low Compliance (ARDS / Oedema)",
    category: "abnormal",
    description: "Both PIP and plateau elevated. Small Peak–Plateau gradient. Stiff lung requires higher pressure to deliver same Vt.",
    findings: ["Both PIP and Plateau elevated", "Peak–Plateau gap small (< 5 cmH₂O)", "COMPLIANCE problem (ARDS, oedema, PTX, over-inflation)"],
  },
  {
    id: "auto-peep",
    label: "Auto-PEEP / Air Trapping",
    category: "abnormal",
    description: "Expiratory flow does not return to zero before next breath. Breath stacking. Seen in asthma, bronchiolitis, high RR.",
    findings: ["Flow-time: expiratory curve does not reach baseline", "Each breath starts above zero flow", "Volume-time: stepped increase cycle by cycle"],
  },
  {
    id: "cuff-leak",
    label: "Cuff Leak / Circuit Leak",
    category: "abnormal",
    description: "Exhaled volume consistently less than inhaled volume. Inspiratory and expiratory Vt do not match. Gurgling sound audible.",
    findings: ["Exhaled Vt < Inspired Vt on volume scalar", "Flow-time: expiratory curve smaller than inspiratory", "Volume-time: does not return fully to baseline"],
  },
  {
    id: "flow-starvation",
    label: "Flow Starvation (VC Mode)",
    category: "abnormal",
    description: "Pressure-time waveform shows 'scooped out' appearance mid-inspiration. Patient actively breathing in but ventilator not matching demand.",
    findings: ["Pressure-time: concave 'scooped' mid-inspiratory dip", "Patient effort pulls pressure below expected square waveform", "Indicates inadequate flow rate for patient demand"],
  },
  {
    id: "dysynchrony",
    label: "Patient–Ventilator Dyssynchrony",
    category: "abnormal",
    description: "Multiple waveform irregularities: double triggering, missed triggers, premature cycling. Patient and ventilator out of sync.",
    findings: ["Irregular pressure and flow waveforms", "Variable Vt breath to breath", "Pressure spikes or double peaks visible"],
  },
];
