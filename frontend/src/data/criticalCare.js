// Intercostal drain (ICD / chest tube) insertion — pediatric
// Mechanical ventilation initial settings & troubleshooting
// Refs: Tintinalli ch. 30, BTS / ATS guidelines, OpenPediatrics, F&L

export const ICD_INSERTION = {
  indications: [
    "Tension pneumothorax (after needle decompression)",
    "Simple / persistent pneumothorax",
    "Haemothorax",
    "Pleural effusion (parapneumonic, malignant) — large or symptomatic",
    "Empyema",
    "Chylothorax",
    "Penetrating chest trauma with chest signs",
    "Post-cardiothoracic surgery",
  ],
  contraindications: [
    "Relative: coagulopathy (correct INR < 1.5, platelets > 50), pulmonary bullae (perforation risk), adhesions",
    "Absolute: none in tension pneumothorax",
  ],
  sizingTable: [
    { weight: "Neonate (< 5 kg)", french: "8–10 Fr", pneumo: "8 Fr", fluid: "10 Fr" },
    { weight: "Infant 5–10 kg", french: "10–12 Fr", pneumo: "10 Fr", fluid: "12 Fr" },
    { weight: "Child 10–20 kg", french: "12–18 Fr", pneumo: "12–14 Fr", fluid: "16–18 Fr" },
    { weight: "Child 20–40 kg", french: "20–28 Fr", pneumo: "16–20 Fr", fluid: "24–28 Fr" },
    { weight: "Adolescent > 40 kg", french: "28–32 Fr", pneumo: "20–24 Fr", fluid: "28–32 Fr" },
  ],
  equipment: [
    "Sterile drape, gown, gloves, mask, eye protection",
    "2% chlorhexidine + skin prep",
    "Lidocaine 1% with adrenaline (max 4.5 mg/kg plain · 7 mg/kg with adrenaline)",
    "10 mL syringe + 21 G + 25 G needles",
    "Scalpel #11 blade",
    "Curved Kelly / Roberts forceps (artery clip)",
    "Chest tube (size per table)",
    "Underwater seal drainage system (or Heimlich valve for transport)",
    "Suction tubing (set at –20 cmH₂O)",
    "2-0 silk on a curved cutting needle (anchor + horizontal mattress)",
    "Sterile dressing, transparent occlusive",
  ],
  technique: [
    "Position: supine with affected arm abducted above head, or semi-recumbent at 45°",
    "Identify SAFE TRIANGLE: anterior border of latissimus dorsi · lateral border of pectoralis major · base at 5th intercostal space (line of nipple in male)",
    "Mark: 4–5th ICS in mid-axillary line (avoid below 5th ICS — risk of diaphragmatic / abdominal injury)",
    "Clean & drape widely. Infiltrate skin → subcutaneous → periosteum of UPPER border of rib below → parietal pleura with local anaesthetic",
    "Aspirate air or fluid to confirm correct space before incision",
    "Make 2–3 cm transverse incision parallel to rib, ABOVE the upper border of the rib below the chosen ICS (avoid neurovascular bundle running under each rib)",
    "Blunt dissect with closed Kelly forceps over the upper border of the rib through subcutaneous tissue, intercostal muscles, and parietal pleura. 'Pop' is felt on entering pleural space",
    "Insert sterile finger sweep through tract to confirm pleural space and exclude adhesions / lung",
    "Without trocar (NEVER use trocar in children — high lung-injury risk): grasp tip of chest tube with Kelly forceps and advance posteriorly + apically (for pneumothorax) or basally (for fluid)",
    "Confirm position: condensation in tube on expiration / fogging, bubbling on cough (pneumothorax), drainage of fluid (haemothorax)",
    "Anchor with 2-0 silk: deep stitch through skin + subcut, tied to tube with multiple wraps; horizontal mattress 'purse-string' for closure on removal (avoid over-tight purse-string — necrosis)",
    "Connect to underwater seal at –20 cmH₂O suction (or to Heimlich valve)",
    "Apply occlusive dressing",
    "POST-INSERTION CXR — confirm position (tip in apex for PTX, base for fluid), exclude tube kink / SC placement",
  ],
  postProcedure: [
    "Vital signs q15 min × 4, then q1 h × 4, then q4 h",
    "Chart drainage volume and characteristics hourly initially",
    "Clamp tube only briefly for transport / disconnection (NEVER clamp draining pneumothorax for any duration)",
    "Watch for: tension PTX (clamp), surgical emphysema, infection at site, persistent bubbling (bronchopleural fistula)",
    "Analgesia — opioid-sparing: paracetamol + ibuprofen, intercostal nerve block with bupivacaine",
    "Daily CXR until removal",
  ],
  removal: [
    "Criteria: < 2 mL/kg/day drainage for 24 h AND no air leak for ≥ 12 h AND lung re-expanded on CXR",
    "Wean off suction → underwater seal for 4–6 h → clamp trial 4–6 h with CXR if PTX",
    "Remove during expiration / Valsalva. Tie purse-string suture as tube exits to seal tract",
    "Apply occlusive dressing × 24–48 h",
    "Post-removal CXR within 4 h",
  ],
  complications: [
    "Lung perforation (especially with trocar — DO NOT use)",
    "Diaphragmatic / liver / spleen injury (low insertion)",
    "Intercostal artery laceration (lower border of rib — avoid)",
    "Tube malposition (extra-pleural, intra-fissural, abdominal)",
    "Re-expansion pulmonary oedema (rapid drainage of large effusion > 1.5 L)",
    "Subcutaneous emphysema",
    "Empyema / wound infection",
    "Persistent air leak — bronchopleural fistula",
  ],
};

export const VENTILATOR_SETTINGS = {
  initial: [
    {
      param: "Mode",
      pediatric: "Pressure-Regulated Volume Control (PRVC) or SIMV–PC + PS",
      neonatal: "PC-AC / SIMV-PC + PS · Volume-guarantee if available",
      note: "Pressure-targeted in neonates, volume-targeted in older children. PS 5–10 cmH₂O for spontaneous breaths.",
    },
    {
      param: "Tidal Volume (Vt)",
      pediatric: "6–8 mL/kg ideal body weight",
      neonatal: "4–6 mL/kg",
      note: "Use lower Vt (4–6) in ARDS or lung-protective ventilation. NEVER exceed 10 mL/kg.",
    },
    {
      param: "Respiratory Rate (initial)",
      pediatric: "Infant 25–30 · Toddler 20–25 · Child 18–22 · Adolescent 12–18 /min",
      neonatal: "40–60 /min",
      note: "Adjust to age-appropriate minute ventilation. Allow expiratory time ≥ 2× inspiratory.",
    },
    {
      param: "PEEP",
      pediatric: "5 cmH₂O (start) · titrate up to 10–15 in ARDS",
      neonatal: "4–6 cmH₂O · titrate to oxygenation",
      note: "Avoid PEEP < 4 (atelectasis risk). High PEEP improves oxygenation but reduces venous return.",
    },
    {
      param: "FiO₂",
      pediatric: "Start 1.0, titrate down to lowest maintaining SpO₂ ≥ 92%",
      neonatal: "Term: 0.21–0.30 · Preterm: 0.21–0.30 · titrate to NRP SpO₂ targets",
      note: "Goal: SpO₂ 92–96% (term/older child); 90–95% (preterm to limit ROP).",
    },
    {
      param: "I:E ratio",
      pediatric: "1:2 (normal) · 1:3–1:4 in obstructive disease",
      neonatal: "1:1 to 1:2",
      note: "Inverse ratio (I > E) in severe ARDS. Watch for auto-PEEP in obstructive disease.",
    },
    {
      param: "Inspiratory Time (Ti)",
      pediatric: "0.6–1.0 s",
      neonatal: "0.3–0.5 s",
      note: "Shorter Ti for high-rate neonatal ventilation; longer Ti for ARDS recruitment.",
    },
    {
      param: "Peak Inspiratory Pressure (PIP)",
      pediatric: "Aim plateau ≤ 30 cmH₂O · driving pressure < 15",
      neonatal: "15–25 cmH₂O initially",
      note: "Plateau > 30 increases barotrauma risk.",
    },
  ],
  sedationParalysis: [
    "Routine post-intubation sedation: midazolam 0.05–0.2 mg/kg/hr + fentanyl 1–4 mcg/kg/hr (titrate to RASS / COMFORT-B)",
    "Add neuromuscular blockade only if ventilator dyssynchrony, severe ARDS, or to facilitate proning: rocuronium 0.6–1 mg/kg bolus then 5–10 mcg/kg/min",
    "Daily sedation interruption / spontaneous breathing trial as tolerated",
  ],
  troubleshooting: [
    {
      problem: "High peak airway pressure",
      causes: "Bronchospasm · ETT obstruction (mucous plug, kink, biting) · pneumothorax · main-stem intubation · pulmonary oedema · stiff lung (ARDS, pneumonia)",
      action: "DOPE mnemonic: Displaced ETT? Obstruction? Pneumothorax? Equipment failure? Disconnect from vent + bag manually; suction; check breath sounds bilaterally; CXR if uncertain.",
    },
    {
      problem: "Low tidal volume / minute ventilation",
      causes: "Cuff leak · disconnection · circuit leak · ETT dislodgement",
      action: "Check ETT depth, cuff pressure (target 20–25 cmH₂O), all connections; observe chest rise.",
    },
    {
      problem: "Hypoxia despite ventilation",
      causes: "FiO₂ inadequate · PEEP inadequate · main-stem · pneumothorax · pulmonary embolism · cardiac shunt · decompensated heart failure",
      action: "Increase FiO₂ to 1.0, increase PEEP, confirm bilateral breath sounds, urgent CXR + bedside echo, ETCO₂ trend.",
    },
    {
      problem: "Hypercapnia (high PaCO₂)",
      causes: "Hypoventilation (low rate / Vt) · increased dead space · increased CO₂ production (fever, sepsis) · ETT cuff leak",
      action: "Increase rate (preferred over Vt to limit volutrauma), check for leak. Permissive hypercapnia (pH 7.20–7.30) acceptable in lung-protective strategy.",
    },
    {
      problem: "Auto-PEEP / breath stacking",
      causes: "Obstructive disease (asthma, bronchiolitis) · inadequate expiratory time · high rate",
      action: "Decrease rate, increase expiratory time (I:E 1:3 or 1:4), bronchodilators, check for breath-stacking on ventilator graphics.",
    },
    {
      problem: "Patient–ventilator dyssynchrony",
      causes: "Pain · agitation · inadequate sedation · inappropriate trigger sensitivity · auto-PEEP",
      action: "Optimise sedation/analgesia, adjust trigger sensitivity (flow trigger 1–3 L/min · pressure trigger –1 to –2 cmH₂O), check for auto-PEEP.",
    },
  ],
  protectiveStrategy: [
    "ARDS: Vt 4–6 mL/kg PBW · plateau pressure ≤ 30 · driving pressure ≤ 15 · pH 7.20–7.45 (permissive hypercapnia) · PEEP–FiO₂ ladder per ARDSnet",
    "Recruitment manoeuvres: 30–40 cmH₂O × 30–40 s if refractory hypoxia (controversial; avoid in haemodynamic instability)",
    "Prone positioning: ≥ 12 h/day for severe paediatric ARDS (PaO₂/FiO₂ < 150)",
    "iNO: rescue therapy for refractory hypoxaemia, PPHN of newborn, post-cardiac-surgery",
    "ECMO: consider if oscillatory index > 40 or PaO₂/FiO₂ < 100 despite optimised conventional ventilation",
  ],
  weaning: [
    "Daily readiness: stable haemodynamics, adequate oxygenation (SpO₂ ≥ 92% on FiO₂ ≤ 0.4 + PEEP ≤ 5–8), adequate cough/gag, spontaneous respiratory effort",
    "SBT (spontaneous breathing trial): PS 5–8 + PEEP 5 × 30–120 min · monitor RR, Vt, oxygenation, work of breathing",
    "Successful SBT → extubate. Ready criteria: cuff-leak test (audible leak when cuff deflated) to predict post-extubation stridor",
    "Post-extubation: HFNC or NIV ready; dexamethasone 0.25 mg/kg q6h × 24 h pre-extubation if at risk of post-extubation stridor",
  ],
};
