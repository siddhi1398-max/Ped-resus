// src/data/equipment.js
// Static data, formula helpers, and SVG components for EquipmentTab.jsx
// Sources: Harriet Lane 23e · Fleischer & Ludwig 7e · APLS · AIDAA 2022
//          Vortex Approach (Chrimes 2016 · vortexapproach.org)
//          Morgan & Mikhail 7e · AHA PALS 2020 · AAP Neonatology

// ─── EQUIPMENT REFERENCE TABLE ROWS ─────────────────────────────────────────
// weight = upper boundary (kg) used by suggestedIdx logic
export const EQUIPMENT_ROWS = [
  { age: "Premature (<1 kg)",   weight: "1",   ett: "2.5 uncuffed", depth: "6–7 cm",  suction: "6 Fr",    blade: "00 straight",         lma: "—",   ngt: "5 Fr",    iv: "24G", defib: "4 J"   },
  { age: "Premature (1–2 kg)",  weight: "2",   ett: "3.0 uncuffed", depth: "7–8 cm",  suction: "6 Fr",    blade: "0 straight",          lma: "—",   ngt: "5 Fr",    iv: "24G", defib: "6 J"   },
  { age: "Neonate (2–3 kg)",    weight: "3",   ett: "3.0 uncuffed", depth: "9 cm",    suction: "8 Fr",    blade: "0–1 straight",        lma: "1",   ngt: "5–6 Fr",  iv: "24G", defib: "12 J"  },
  { age: "Neonate (3–5 kg)",    weight: "5",   ett: "3.5 uncuffed", depth: "10 cm",   suction: "8 Fr",    blade: "1 straight",          lma: "1",   ngt: "6–8 Fr",  iv: "24G", defib: "16 J"  },
  { age: "Infant (5–10 kg)",    weight: "10",  ett: "3.5–4.0",      depth: "11–12 cm",suction: "10 Fr",   blade: "1 straight",          lma: "1.5", ngt: "8 Fr",    iv: "24G", defib: "30 J"  },
  { age: "Toddler (10–14 kg)",  weight: "14",  ett: "4.0–4.5",      depth: "13–14 cm",suction: "10 Fr",   blade: "1–2 straight",        lma: "2",   ngt: "8–10 Fr", iv: "22G", defib: "48 J"  },
  { age: "Preschool (14–20 kg)",weight: "20",  ett: "4.5–5.0",      depth: "14–15 cm",suction: "10 Fr",   blade: "2 straight or curved",lma: "2",   ngt: "10 Fr",   iv: "22G", defib: "64 J"  },
  { age: "School (20–30 kg)",   weight: "30",  ett: "5.0–5.5 cuffed",depth:"15–17 cm",suction: "12 Fr",   blade: "2 Macintosh",         lma: "2.5", ngt: "10–12 Fr",iv: "22G", defib: "100 J" },
  { age: "School (30–40 kg)",   weight: "40",  ett: "5.5–6.0 cuffed",depth:"17–18 cm",suction: "12–14 Fr",blade: "3 Macintosh",         lma: "3",   ngt: "12 Fr",   iv: "20G", defib: "140 J" },
  { age: "Adolescent (40–60 kg)",weight:"60",  ett: "6.0–7.0 cuffed",depth:"18–20 cm",suction: "14 Fr",   blade: "3 Macintosh",         lma: "3–4", ngt: "12–14 Fr",iv: "20G", defib: "200 J" },
  { age: "Adolescent (>60 kg)", weight: "999", ett: "7.0–8.0 cuffed",depth:"20–22 cm",suction: "14 Fr",   blade: "3–4 Macintosh",       lma: "4–5", ngt: "14 Fr",   iv: "18G", defib: "240 J" },
];

// ─── OPA / NPA SIZING ────────────────────────────────────────────────────────
// OPA (Guedel) size = distance from centre of mouth to angle of jaw (earlobe tip)
// NPA (Nasopharyngeal airway) size = distance from tip of nose to earlobe / tragus
// Sources: Fleischer & Ludwig 7e · APLS 5e · Resuscitation Council UK 2021
export const OPA_ROWS = [
  {
    age:     "Premature / Neonate",
    weight:  "< 3 kg",
    size:    "000 (40 mm)",
    color:   "Pink",
    colorHex:"#f9a8d4",
    measure: "Corner of mouth → centre of ear pinna ≈ 4 cm",
    note:    "Rarely needed. Ensure patent nares. NGT may be safer.",
  },
  {
    age:     "Neonate – Small infant",
    weight:  "3–5 kg",
    size:    "00 (50 mm)",
    color:   "Blue",
    colorHex:"#93c5fd",
    measure: "Corner of mouth → centre of ear pinna ≈ 5 cm",
    note:    "Tongue supports: neutral head position, avoid hyperextension.",
  },
  {
    age:     "Infant",
    weight:  "5–10 kg",
    size:    "0 (60 mm)",
    color:   "Black",
    colorHex:"#6b7280",
    measure: "Corner of mouth → centre of ear pinna ≈ 6 cm",
    note:    "Insert right-way up in infants (NOT inverted like adults — risk epiglottis trauma).",
  },
  {
    age:     "Toddler",
    weight:  "10–15 kg",
    size:    "1 (70 mm)",
    color:   "White",
    colorHex:"#e2e8f0",
    measure: "Corner of mouth → angle of jaw ≈ 7 cm",
    note:    "Insert with tongue depressor or right-way-up in children.",
  },
  {
    age:     "Preschool",
    weight:  "15–25 kg",
    size:    "2 (80 mm)",
    color:   "Green",
    colorHex:"#86efac",
    measure: "Corner of mouth → angle of jaw ≈ 8 cm",
    note:    "From ~5 yr: may insert inverted then rotate 180° (adult technique).",
  },
  {
    age:     "School age",
    weight:  "25–40 kg",
    size:    "3 (90 mm)",
    color:   "Orange",
    colorHex:"#fdba74",
    measure: "Corner of mouth → angle of jaw ≈ 9 cm",
    note:    "Standard adult technique (inverted + rotate) acceptable from ~7 yr.",
  },
  {
    age:     "Adolescent",
    weight:  "> 40 kg",
    size:    "4 (100 mm)",
    color:   "Red",
    colorHex:"#fca5a5",
    measure: "Corner of mouth → angle of jaw ≈ 10 cm",
    note:    "Size 4 fits most adolescents / small adults. Size 5 for large adults.",
  },
];

// NPA (Nasopharyngeal airway)
// Size (mm) = internal diameter. Length selected by distance from nostril to tragus.
// French size ≈ external diameter × 3 (i.e., 6 mm ID ≈ 18–20 Fr externally)
export const NPA_ROWS = [
  {
    age:      "Infant",
    weight:   "3–10 kg",
    sizeID:   "3.0–3.5 mm ID",
    fr:       "12–14 Fr",
    length:   "8–10 cm (nostril to tragus)",
    note:     "Rarely used <1 yr. Soft NPA preferred. Monitor: may kink in infant.",
  },
  {
    age:      "Toddler",
    weight:   "10–15 kg",
    sizeID:   "4.0–4.5 mm ID",
    fr:       "14–16 Fr",
    length:   "10–12 cm (nostril to tragus)",
    note:     "Tolerated better than OPA if gag reflex present. Lubricate well.",
  },
  {
    age:      "Preschool",
    weight:   "15–25 kg",
    sizeID:   "5.0–5.5 mm ID",
    fr:       "16–18 Fr",
    length:   "12–14 cm (nostril to tragus)",
    note:     "Use safety pin through flange or cut finger of glove to prevent migration.",
  },
  {
    age:      "School age",
    weight:   "25–40 kg",
    sizeID:   "6.0–6.5 mm ID",
    fr:       "18–22 Fr",
    length:   "14–16 cm (nostril to tragus)",
    note:     "Equivalent to a cut ETT (same ID). Insert bevel facing the septum.",
  },
  {
    age:      "Adolescent",
    weight:   "> 40 kg",
    sizeID:   "6.5–7.0 mm ID",
    fr:       "22–26 Fr",
    length:   "16–20 cm (nostril to tragus)",
    note:     "Adult NPA. Lubricate generously. Right nostril preferred (valve anatomy).",
  },
];

// Size-by-weight quick lookup helpers
export function getOPASize(weight) {
  if (weight < 3)  return { size: "000 (40 mm)", color: "Pink",   note: "Premature/neonate" };
  if (weight < 5)  return { size: "00 (50 mm)",  color: "Blue",   note: "Neonate–small infant" };
  if (weight < 10) return { size: "0 (60 mm)",   color: "Black",  note: "Infant" };
  if (weight < 15) return { size: "1 (70 mm)",   color: "White",  note: "Toddler" };
  if (weight < 25) return { size: "2 (80 mm)",   color: "Green",  note: "Preschool" };
  if (weight < 40) return { size: "3 (90 mm)",   color: "Orange", note: "School age" };
  return                  { size: "4 (100 mm)",  color: "Red",    note: "Adolescent" };
}

export function getNPASize(weight) {
  if (weight < 10) return { sizeID: "3.0–3.5 mm", fr: "12–14 Fr", length: "8–10 cm" };
  if (weight < 15) return { sizeID: "4.0–4.5 mm", fr: "14–16 Fr", length: "10–12 cm" };
  if (weight < 25) return { sizeID: "5.0–5.5 mm", fr: "16–18 Fr", length: "12–14 cm" };
  if (weight < 40) return { sizeID: "6.0–6.5 mm", fr: "18–22 Fr", length: "14–16 cm" };
  return                  { sizeID: "6.5–7.0 mm", fr: "22–26 Fr", length: "16–20 cm" };
}

// Key clinical rules for airway adjuncts
export const OPA_RULES = [
  "Size = corner of mouth to centre of ear pinna (children) or angle of jaw (older). Too long → laryngospasm; too short → pushes tongue back.",
  "Use ONLY in unconscious patients with no gag reflex — stimulates vomiting if gag intact.",
  "Insertion technique: in infants/young children (<5 yr) insert RIGHT-WAY UP with tongue depressor — do NOT use the adult inverted technique (risk of epiglottis trauma).",
  "From ~5–7 yr: may use adult technique — insert inverted (concave up) then rotate 180° as tip passes hard palate.",
  "Colour coding: use the Guedel colour sequence (Pink 000 → Blue 00 → Black 0 → White 1 → Green 2 → Orange 3 → Red 4) — consistent across most manufacturers.",
  "Test fit: holds lips open, flange at teeth/gums, tip curves to base of tongue — check no pharyngeal mucosa folding.",
];

export const NPA_RULES = [
  "Size = distance from tip of nose to earlobe (tragus). Slightly shorter is safer than too long (risk: epiglottis/laryngeal entry).",
  "Internal diameter (ID) ≈ the patient's little finger width — useful bedside estimate.",
  "Use when OPA not tolerated (gag reflex present), mouth cannot be opened, or in awake/semi-conscious patients.",
  "CONTRAINDICATED in suspected base-of-skull fracture (clinical signs: Battle's sign, raccoon eyes, CSF rhinorrhoea/otorrhoea).",
  "Lubricate generously with lignocaine gel (2%) — anaesthetic + lubricant benefit.",
  "Insert bevel toward the nasal septum. Right nostril preferred (wider anatomically in most patients).",
  "Safety: pass safety pin through flange or use purpose-made NPA with flange — prevents inward migration.",
  "Can use cut ETT as NPA in emergency (same ID, softer material). Attach safety pin.",
  "Topical vasoconstrictant (xylometazoline 0.05% or oxymetazoline) before insertion reduces epistaxis — avoid in children <6 yr except under specialist guidance.",
];

// ─── FOB SIZING ───────────────────────────────────────────────────────────────
export const FOB_ROWS = [
  { age: "Neonate",    wt: "<3 kg",    scope: "2.2 mm", ett: "3.0", note: "Ultra-thin scope"  },
  { age: "Infant",     wt: "3–10 kg",  scope: "2.8 mm", ett: "3.5", note: "Intubating scope"  },
  { age: "Toddler",    wt: "10–20 kg", scope: "3.5 mm", ett: "4.5", note: "Paeds FOB"         },
  { age: "School age", wt: "20–40 kg", scope: "4.0 mm", ett: "5.5", note: "Paeds/adult thin"  },
  { age: "Adolescent", wt: ">40 kg",   scope: "4.9 mm", ett: "7.0", note: "Standard adult"    },
];

export function getFOBSize(weight) {
  if (weight < 3)  return { scope: "2.2 mm", ett: "3.0", label: "Ultra-thin scope" };
  if (weight < 10) return { scope: "2.8 mm", ett: "3.5", label: "Intubating scope" };
  if (weight < 20) return { scope: "3.5 mm", ett: "4.5", label: "Paeds FOB" };
  if (weight < 40) return { scope: "4.0 mm", ett: "5.5", label: "Paeds/adult thin" };
  return               { scope: "4.9 mm", ett: "7.0", label: "Standard adult" };
}

// ─── BP CUFF ──────────────────────────────────────────────────────────────────
export function getBPCuff(weight) {
  if (weight < 2)  return "Premature neonatal (2 cm)";
  if (weight < 3)  return "Neonatal (2.5 cm)";
  if (weight < 10) return "Infant (4 cm)";
  if (weight < 20) return "Child (6 cm)";
  if (weight < 30) return "Small adult (8 cm)";
  return                  "Adult (10–12 cm)";
}

export const BP_CUFF_ROWS = [
  { aw: "Premature neonate",   cuff: "Premie",      width: "2 cm"   },
  { aw: "Neonate (<3 kg)",     cuff: "Neonatal",    width: "2.5 cm" },
  { aw: "Infant (3–10 kg)",    cuff: "Infant",      width: "4 cm"   },
  { aw: "Child (10–20 kg)",    cuff: "Child",       width: "6 cm"   },
  { aw: "School (20–30 kg)",   cuff: "Small adult", width: "8 cm"   },
  { aw: "Adolescent (>30 kg)", cuff: "Adult",       width: "12 cm"  },
];

// ─── FORMULA REFERENCE ────────────────────────────────────────────────────────
export const FORMULA_ROWS = [
  { label: "ETT uncuffed (age ≥2 yr)",  val: "(age÷4) + 4"                      },
  { label: "ETT cuffed (age ≥2 yr)",    val: "(age÷4) + 3.5"                    },
  { label: "ETT depth — oral",           val: "(age÷2) + 12 cm"                  },
  { label: "ETT depth — nasal",          val: "(age÷2) + 15 cm"                  },
  { label: "OPA size (Guedel)",          val: "Corner of mouth → centre of ear pinna (cm)" },
  { label: "NPA size",                   val: "Tip of nose → tragus (earlobe) (cm)" },
  { label: "Defibrillation",             val: "4 J/kg (max 10 J/kg or 360 J)"   },
  { label: "Cardioversion",              val: "0.5–1 J/kg → 2 J/kg"             },
  { label: "Suction catheter (Fr)",      val: "≈ 3 × ETT (mm)"                  },
  { label: "Maintenance fluid",          val: "4 mL/kg/hr (first 10 kg) + 2 + 1"},
];

// ─── DIFFICULT AIRWAY DATA ────────────────────────────────────────────────────
export const DA_PREDICTORS = [
  {
    label: "Anatomy / Structural",
    items: [
      "Micrognathia (Pierre Robin, Treacher Collins, Goldenhar)",
      "Macroglossia (Trisomy 21, Beckwith-Wiedemann)",
      "Cleft palate — difficult mask seal",
      "Narrow mouth opening — trismus, ankylosis",
      "Short neck / limited extension — cervical spine anomaly",
      "Laryngomalacia, subglottic stenosis, tracheomalacia",
    ],
  },
  {
    label: "Acquired / Functional",
    items: [
      "Oedema — anaphylaxis, angioedema, burns, trauma",
      "Infection — epiglottitis, bacterial tracheitis, croup",
      "Foreign body — partial or complete obstruction",
      "Haematoma, abscess (peritonsillar, retropharyngeal)",
      "Obesity — reduced FRC, rapid desaturation",
      "Mediastinal mass — dynamic airway compression",
    ],
  },
];

export const DA_MNEMONICS = [
  {
    mnemonic: "LEMON (difficult laryngoscopy)",
    items: [
      "L — Look externally (dysmorphic features)",
      "E — Evaluate 3-3-2 (3 finger mouth, 3 hyoid, 2 thyroid-floor)",
      "M — Mallampati (unreliable <2 yr)",
      "O — Obstruction",
      "N — Neck mobility",
    ],
  },
  {
    mnemonic: "MOANS (difficult BVM)",
    items: [
      "M — Mask seal (beard, facial injury)",
      "O — Obesity / Obstruction",
      "A — Age (>55 yr or <1 yr)",
      "N — No teeth (edentulous)",
      "S — Stiff lungs (asthma, fibrosis)",
    ],
  },
  {
    mnemonic: "RODS (difficult rigid scope)",
    items: [
      "R — Restricted mouth opening",
      "O — Obstruction above glottis",
      "D — Disrupted or Distorted airway",
      "S — Stiff cervical spine",
    ],
  },
];

export const RESCUE_DEVICES = [
  {
    name: "Video Laryngoscopy (VL)", tone: "blue",
    sub: "First-line for anticipated difficult airway in children ≥10 kg",
    details: [
      "C-MAC / GlideScope / CMAC-D Blade — improves Cormack-Lehane grade by 1–2",
      "Indirect view: do NOT align oral-pharyngeal-laryngeal axes — angle blade, look at screen",
      "Use stylet angled 60–90° for GlideScope (more angulated blade)",
      "Maximum 3 attempts — each should be the BEST attempt with full optimisation",
    ],
  },
  {
    name: "2nd Generation LMA (iGel / LMA Supreme)", tone: "violet",
    sub: "Best SGD for paediatric difficult airway — oxygenate first",
    details: [
      "iGel: no cuff, fast insertion, gastric drain port, high seal pressure",
      "Can oxygenate + protect from aspiration + allow FOB-guided intubation through it",
      "Insertion: lubricate caudal aspect, insert along hard palate in neutral position",
      "ETCO₂ via iGel is acceptable confirmation in confirmed difficult airway scenarios",
    ],
  },
  {
    name: "Bougie / Airway Exchange Catheter", tone: "amber",
    sub: "Improves ETT placement when laryngoscopic view is limited",
    details: [
      "Paediatric bougie: 5 Fr Eschmann or Frova catheter for children <10 yr",
      "Advance into trachea under direct/video view → feel tracheal rings → railroad ETT",
      "AEC: 11 Fr for ETT ≥5 mm · 8 Fr for ETT 3.5–5 mm",
      "O₂ via AEC during ETT exchange: 1 L/min insufflation — barotrauma risk if cuffed ETT",
    ],
  },
  {
    name: "Transtracheal Jet Ventilation (TTJV)", tone: "red",
    sub: "Temporising rescue oxygenation only — NOT a definitive airway",
    details: [
      "16–18G IV cannula through CTM (children >10 kg)",
      "Attach to high-pressure O₂ (15 L/min) via Sanders injector or manual jet device",
      "Ventilation: 1 s on / 4 s off — allow passive exhalation (CO₂ rises rapidly)",
      "AVOID in complete upper airway obstruction — cannot exhale → fatal barotrauma",
      "Limit to 3–5 min as a bridge to definitive airway",
    ],
  },
  {
    name: "Emergency Tracheostomy", tone: "red",
    sub: "Definitive eFONA — preferred over cricothyrotomy in children <8 yr",
    details: [
      "Preferred over surgical cricothyrotomy in children <8 yr (CTM too small)",
      "Call ENT/head-neck surgeon EARLY — do NOT attempt alone without training",
      "Trousseau dilator + smallest ETT (3.0–3.5 mm) via trachea below cricoid cartilage",
      "Confirm: waveform ETCO₂ + bilateral breath sounds + CXR",
    ],
  },
];

// ─── MONITORING DATA ──────────────────────────────────────────────────────────
export const SPO2_PROBE_SITES = [
  { site: "Finger",     pre: "Post-ductal", color: "#3b82f6", note: "Preferred >3 yr"        },
  { site: "Toe",        pre: "Post-ductal", color: "#8b5cf6", note: "Neonates / infants"      },
  { site: "Right hand", pre: "Pre-ductal",  color: "#10b981", note: "PPHN monitor"            },
  { site: "Ear lobe",   pre: "Central",     color: "#f59e0b", note: ">3 yr; faster response"  },
  { site: "Forehead",   pre: "Central",     color: "#ef4444", note: "Reflectance probe"       },
];

export const SPO2_PROBE_ROWS = [
  { age: "Neonate / Premature", site: "Wrap probe (foot/hand). Gelstix or Neonatal D-lite.",    warn: "Use foot for post-ductal, right hand for pre-ductal (PPHN)." },
  { age: "Infant (1–12 mo)",    site: "Foot/toe. Palm wrap probe. Masimo RD rainbow preferred.", warn: "Motion artefact common — pause suction in NICU." },
  { age: "Toddler – School",    site: "Finger clip or tape wrap. Index or middle finger.",       warn: "Remove nail polish. Cold periphery: false low reading." },
  { age: "Adolescent",          site: "Standard adult finger clip. Earlobe acceptable.",         warn: "COHb reads as normal SpO₂ — use co-oximeter if CO exposure." },
];

export const SPO2_LIMITATIONS = [
  "Accuracy validated to SpO₂ ≥70% only",
  "Motion artefact: Masimo SET algorithm better than Nellcor",
  "Carboxyhaemoglobin (COHb): reads as OxyHb — falsely NORMAL in CO poisoning",
  "MetHaemoglobinaemia: SpO₂ reads ~85% regardless of true value",
  "Nail polish (blue, black, green): use alternate site or remove polish",
  "Pigmented skin: may overestimate SpO₂ by 2–3% (Masimo Root better)",
  "Severe anaemia (Hb <5 g/dL): inaccurate",
  "Poor peripheral perfusion: use central site (ear lobe or forehead)",
  "Ambient light artefact: cover probe during phototherapy",
];

export const SPO2_TARGETS = [
  "Term neonate: 94–98% on air. Avoid hyperoxia.",
  "Preterm <32 wks: 90–95% — higher → retinopathy of prematurity (ROP)",
  "PPHN neonate: pre-ductal (right hand) ≥95%, target pH 7.45–7.55",
  "Children on room air: ≥94%",
  "Post-cardiac arrest (ROSC): 94–99% — titrate FiO₂ to avoid hyperoxia",
  "ARDS / PICU: 92–96% acceptable to permit lower FiO₂",
];

export const BVM_SIZES = [
  { size: "Neonatal bag",   vol: "250 mL",     use: "Premature and term neonates. Must have PEEP valve." },
  { size: "Infant bag",     vol: "450 mL",     use: "Infants up to ~10 kg. Neonatal bag insufficient for active lungs." },
  { size: "Paediatric bag", vol: "500–750 mL", use: "10–25 kg. Standard paediatric practice." },
  { size: "Adult bag",      vol: "1500 mL",    use: "Adolescents >25 kg. Use adult mask." },
];

export const BVM_TECHNIQUES = [
  "EC technique: thumb+index form C over mask, 3rd–5th fingers form E on mandible (jaw)",
  "2-person technique preferred: one holds mask 2-handed, one squeezes bag",
  "Jaw thrust: 3rd/4th fingers behind mandibular angles, push forward — not occiput pressure",
  "OPA size = corner of mouth → centre of ear pinna (≈ age/4 + 4 cm)",
  "NPA: use if OPA not tolerated. Contraindicated in base-of-skull fracture",
  "Infant positioning: neutral sniffing — do NOT hyperextend (floppy trachea may kink)",
  "Sniffing position (head elevated) only in children >2 yr",
];

export const BVM_FAILURES = [
  "Poor mask seal — switch to 2-hand 2-person technique",
  "Upper airway obstruction — add OPA/NPA, reposition, jaw thrust",
  "Gastric distension → aspiration risk → insert NGT and decompress",
  "Pop-off valve: neonatal bags have 40 cmH₂O pop-off — bypass manually if stiff lungs",
  "Bag too large: adult bag in infant makes tidal volume control impossible",
];

export const BP_METHODS = [
  { method: "Oscillometric NIBP",         use: "Standard monitoring. Measures MAP directly, derives SBP/DBP. Reliable >3 kg." },
  { method: "Auscultatory (Korotkoff)",   use: "Gold standard for diagnosis. Korotkoff I = systolic, V = diastolic (use IV in <13 yr)." },
  { method: "Doppler ultrasound",         use: "Best for neonates and shocked patients. Probe over radial/brachial artery. Systolic only." },
  { method: "Flush method",               use: "Neonates only if no Doppler. Limb elevated, cuff inflated then released — flush = MAP." },
  { method: "Invasive arterial (A-line)", use: "ICU/theatre. Radial preferred (20G infant, 22G neonate). Continuous waveform + MAP." },
];

// ─── FOB TECHNIQUE STEPS ──────────────────────────────────────────────────────
export const FOB_STEPS = [
  "Pre-oxygenate. Anti-sialagogue: glycopyrrolate 0.01 mg/kg IM/IV 30 min before",
  "Load ETT onto scope and lubricate scope generously. Apply antifog to lens",
  "Topical anaesthesia: lignocaine 4% spray to nose, pharynx, subglottis (max 4 mg/kg total)",
  "Insert scope nasally (preferred in children) or orally via Berman/Ovassapian airway",
  "Advance scope to identify vocal cords → enter trachea → confirm carina in view",
  "Railroad ETT off scope into trachea. Hold ETT fixed, remove scope carefully",
  "Confirm position: waveform ETCO₂ + bilateral breath sounds + CXR",
];

export const FOB_AWAKE_STEPS = [
  "Preferred in cooperative children ≥8–10 yr",
  "Pre-med: dexmedetomidine 1–2 mcg/kg IN 30 min before procedure",
  "Topical lignocaine 4% spray: nasal, pharyngeal, and subglottic (spray-as-you-go)",
  "Maintain spontaneous ventilation throughout — do NOT apnoeise patient",
  "Do NOT give neuromuscular blocker until tracheal position confirmed by ETCO₂",
];

export const FOB_LMA_STEPS = [
  "Insert appropriately-sized LMA first to oxygenate and secure airway",
  "Pass lubricated FOB through the LMA to identify the glottic opening",
  "Railroad ETT over FOB, advancing through the LMA into the trachea",
  "Hold ETT fixed, withdraw LMA over the ETT (LMA-exchange catheter technique optional)",
  "Useful when direct laryngoscopy fails but LMA ventilation is achievable",
];

// ─── SVG COMPONENTS ───────────────────────────────────────────────────────────
export function FOBSizingSVG() {
  return (
    <svg viewBox="0 0 360 210" className="w-full" aria-label="Fibreoptic bronchoscope sizing">
      <rect width="360" height="210" rx="8" fill="#0f172a" />
      <text x="180" y="18" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="800" fontFamily="monospace">FIBREOPTIC BRONCHOSCOPE — PAEDIATRIC SIZING</text>
      {["Age Band","Weight","Scope OD","Min ETT ID","Notes"].map((h, i) => (
        <text key={h} x={[16,76,140,200,258][i]} y="33" fill="#64748b" fontSize="7" fontWeight="700" fontFamily="monospace">{h}</text>
      ))}
      <line x1="12" y1="36" x2="348" y2="36" stroke="#1e293b" strokeWidth="1" />
      {FOB_ROWS.map((r, i) => {
        const y = 48 + i * 32;
        return (
          <g key={r.age}>
            <rect x="12" y={y - 11} width="336" height="26" rx="3" fill={i % 2 === 0 ? "#111827" : "#0f172a"} />
            <text x="16"  y={y + 5} fill="#e2e8f0" fontSize="8" fontFamily="monospace" fontWeight="600">{r.age}</text>
            <text x="76"  y={y + 5} fill="#94a3b8" fontSize="8" fontFamily="monospace">{r.wt}</text>
            <text x="140" y={y + 5} fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="800">{r.scope}</text>
            <text x="200" y={y + 5} fill="#60a5fa" fontSize="9" fontFamily="monospace" fontWeight="800">{r.ett} mm</text>
            <text x="258" y={y + 5} fill="#94a3b8" fontSize="7" fontFamily="monospace">{r.note}</text>
          </g>
        );
      })}
      <text x="12" y="205" fill="#475569" fontSize="6" fontFamily="monospace">Load ETT BEFORE scope insertion. ETT ID ≥ scope OD + 0.8 mm. Lubricate. Antifog. Scope must reach carina.</text>
    </svg>
  );
}

export function SpO2ProbeSVG() {
  return (
    <svg viewBox="0 0 380 140" className="w-full" aria-label="Pulse oximetry probe sites">
      <rect width="380" height="140" rx="8" fill="#0f172a" />
      <text x="190" y="18" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="800" fontFamily="monospace">PULSE OXIMETRY — PAEDIATRIC PROBE SITES</text>
      {SPO2_PROBE_SITES.map((s, i) => {
        const x = 28 + i * 70;
        return (
          <g key={s.site}>
            <circle cx={x} cy="65" r="22" fill={s.color} fillOpacity="0.15" stroke={s.color} strokeWidth="1.5" />
            <text x={x} y="61" textAnchor="middle" fill={s.color} fontSize="7" fontWeight="700" fontFamily="monospace">{s.site}</text>
            <text x={x} y="72" textAnchor="middle" fill={s.color} fontSize="6" fontFamily="monospace">{s.pre}</text>
            <text x={x} y="100" textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="monospace">{s.note}</text>
          </g>
        );
      })}
      <text x="12" y="120" fill="#475569" fontSize="6" fontFamily="monospace">Pre-ductal (right hand) vs post-ductal (foot) difference &gt;3–4% SpO₂ = significant R→L shunting (PPHN).</text>
      <text x="12" y="132" fill="#475569" fontSize="6" fontFamily="monospace">Accuracy validated to SpO₂ ≥70%. Inaccurate: nail polish, methHb, COHb, poor perfusion, pigmented skin.</text>
    </svg>
  );
}

// ─── OPA / NPA SVG ────────────────────────────────────────────────────────────
// Renders a combined sizing chart: OPA colour-coded rows on left, NPA on right
export function OPANPASizingSVG() {
  // OPA colour swatch + data
  const opaData = [
    { size: "000 · 40 mm", age: "Premature / Neonate  <3 kg",  fill: "#f9a8d4", text: "#9d174d" },
    { size: "00 · 50 mm",  age: "Neonate – Infant     3–5 kg", fill: "#93c5fd", text: "#1e3a8a" },
    { size: "0 · 60 mm",   age: "Infant               5–10 kg",fill: "#6b7280", text: "#f1f5f9" },
    { size: "1 · 70 mm",   age: "Toddler              10–15 kg",fill: "#e2e8f0", text: "#1e293b" },
    { size: "2 · 80 mm",   age: "Preschool            15–25 kg",fill: "#86efac", text: "#14532d" },
    { size: "3 · 90 mm",   age: "School age           25–40 kg",fill: "#fdba74", text: "#7c2d12" },
    { size: "4 · 100 mm",  age: "Adolescent           >40 kg",  fill: "#fca5a5", text: "#7f1d1d" },
  ];

  const npaData = [
    { id: "3.0–3.5 mm", fr: "12–14 Fr", age: "Infant      3–10 kg",  len: "8–10 cm"  },
    { id: "4.0–4.5 mm", fr: "14–16 Fr", age: "Toddler     10–15 kg", len: "10–12 cm" },
    { id: "5.0–5.5 mm", fr: "16–18 Fr", age: "Preschool   15–25 kg", len: "12–14 cm" },
    { id: "6.0–6.5 mm", fr: "18–22 Fr", age: "School age  25–40 kg", len: "14–16 cm" },
    { id: "6.5–7.0 mm", fr: "22–26 Fr", age: "Adolescent  >40 kg",   len: "16–20 cm" },
  ];

  const W = 720, H = 310;
  const opaX = 12, npaX = 378;
  const colW = 348;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="OPA and NPA sizing chart">
      <rect width={W} height={H} rx="10" fill="#0f172a" />

      {/* ── OPA PANEL ── */}
      <text x={opaX + colW / 2} y="20" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="800" fontFamily="monospace">OPA (GUEDEL) — PAEDIATRIC SIZING</text>

      {/* Column headers */}
      {[["Size", opaX + 8], ["Age / Weight", opaX + 90], ["Colour", opaX + 230]].map(([label, x]) => (
        <text key={label} x={x} y="36" fill="#64748b" fontSize="7.5" fontWeight="700" fontFamily="monospace">{label}</text>
      ))}
      <line x1={opaX} y1="40" x2={opaX + colW} y2="40" stroke="#1e293b" strokeWidth="1" />

      {opaData.map((row, i) => {
        const y = 52 + i * 33;
        return (
          <g key={row.size}>
            <rect x={opaX} y={y - 10} width={colW} height="28" rx="4"
              fill={i % 2 === 0 ? "#111827" : "#0f172a"} />
            {/* colour swatch */}
            <rect x={opaX + 228} y={y - 7} width="44" height="22" rx="4"
              fill={row.fill} stroke="#334155" strokeWidth="0.5" />
            <text x={opaX + 8}  y={y + 8} fill="#e2e8f0" fontSize="8.5" fontFamily="monospace" fontWeight="800">{row.size}</text>
            <text x={opaX + 90} y={y + 8} fill="#94a3b8" fontSize="7.5" fontFamily="monospace">{row.age}</text>
          </g>
        );
      })}

      {/* Measurement rule */}
      <rect x={opaX} y={H - 42} width={colW} height="32" rx="4" fill="#0c1420" />
      <text x={opaX + 8} y={H - 27} fill="#38bdf8" fontSize="7" fontFamily="monospace" fontWeight="700">SIZING RULE:</text>
      <text x={opaX + 8} y={H - 16} fill="#64748b" fontSize="6.5" fontFamily="monospace">Corner of mouth → centre of ear pinna (children)</text>
      <text x={opaX + 8} y={H - 7}  fill="#64748b" fontSize="6.5" fontFamily="monospace">Corner of mouth → angle of jaw (older children / adults)</text>

      {/* Divider */}
      <line x1={npaX - 8} y1="12" x2={npaX - 8} y2={H - 8} stroke="#1e293b" strokeWidth="1.5" />

      {/* ── NPA PANEL ── */}
      <text x={npaX + colW / 2} y="20" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="800" fontFamily="monospace">NPA (NASOPHARYNGEAL) — PAEDIATRIC SIZING</text>

      {[["ID (mm)", npaX + 8], ["Fr", npaX + 88], ["Age / Weight", npaX + 130], ["Length", npaX + 262]].map(([label, x]) => (
        <text key={label} x={x} y="36" fill="#64748b" fontSize="7.5" fontWeight="700" fontFamily="monospace">{label}</text>
      ))}
      <line x1={npaX} y1="40" x2={npaX + colW} y2="40" stroke="#1e293b" strokeWidth="1" />

      {npaData.map((row, i) => {
        const y = 52 + i * 33;
        return (
          <g key={row.id}>
            <rect x={npaX} y={y - 10} width={colW} height="28" rx="4"
              fill={i % 2 === 0 ? "#111827" : "#0f172a"} />
            <text x={npaX + 8}   y={y + 8} fill="#a78bfa" fontSize="8.5" fontFamily="monospace" fontWeight="800">{row.id}</text>
            <text x={npaX + 88}  y={y + 8} fill="#94a3b8" fontSize="8"   fontFamily="monospace">{row.fr}</text>
            <text x={npaX + 130} y={y + 8} fill="#94a3b8" fontSize="7.5" fontFamily="monospace">{row.age}</text>
            <text x={npaX + 262} y={y + 8} fill="#34d399" fontSize="8"   fontFamily="monospace" fontWeight="700">{row.len}</text>
          </g>
        );
      })}

      {/* NPA measurement rule + key caution */}
      <rect x={npaX} y={H - 58} width={colW} height="48" rx="4" fill="#0c1420" />
      <text x={npaX + 8} y={H - 44} fill="#a78bfa" fontSize="7" fontFamily="monospace" fontWeight="700">SIZING RULE:</text>
      <text x={npaX + 8} y={H - 33} fill="#64748b" fontSize="6.5" fontFamily="monospace">Tip of nose → earlobe (tragus). Width ≈ patient's little finger.</text>
      <text x={npaX + 8} y={H - 22} fill="#f87171" fontSize="7" fontFamily="monospace" fontWeight="700">⚠ CONTRAINDICATED: suspected base-of-skull fracture</text>
      <text x={npaX + 8} y={H - 11} fill="#64748b" fontSize="6.5" fontFamily="monospace">Right nostril preferred · Insert bevel toward septum · Lubricate with lignocaine gel</text>
    </svg>
  );
}
