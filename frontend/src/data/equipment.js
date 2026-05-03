// equipmentData.js
// All static data, formula engine, and SVG diagrams for EquipmentTab.jsx
// Sources: Harriet Lane 23e · Fleischer & Ludwig 7e · APLS · AIDAA 2022
//          Vortex Approach (Chrimes 2016) · Morgan & Mikhail 7e · Motoyama
//          Bhavani-Shankar Kodali Capnography · AHA PALS 2020 · AAP Neonatology

// ─── FORMULA ENGINE ───────────────────────────────────────────────────────────
export function calcEquipment(weight, ageYears) {
  const age = ageYears ?? 0;
  const ettUncuffed   = age > 0 ? + (age / 4) + 4).toFixed(1) : weight < 1 ? 2.5 : weight < 2 ? 3.0 : weight < 3 ? 3.0 : 3.5;
  const ettCuffed     = age > 0 ? + (age / 4) + 3.5).toFixed(1) : ettUncuffed - 0.5;
  const ettDepthOral  = age > 0 ? Math.round (age / 2) + 12 : Math.round(weight + 6);
  const ettDepthNasal = age > 0 ? Math.round (age / 2) + 15 : Math.round(weight + 9);

  let lma = "1";
  if (weight >= 5  && weight < 10)  lma = "1.5";
  if (weight >= 10 && weight < 20)  lma = "2";
  if (weight >= 20 && weight < 30)  lma = "2.5";
  if (weight >= 30 && weight < 50)  lma = "3";
  if (weight >= 50 && weight < 70)  lma = "4";
  if (weight >= 70)                  lma = "5";

  const suction = Math.round(ettUncuffed * 3);

  let blade = "0 straight";
  if (weight >= 3  && weight < 10) blade = "1 straight";
  if (weight >= 10 && weight < 20) blade = "2 straight or curved";
  if (weight >= 20)                 blade = "3 Macintosh (curved)";

  let ngt = "5 Fr";
  if (weight >= 3  && weight < 7)  ngt = "5–8 Fr";
  if (weight >= 7  && weight < 15) ngt = "8–10 Fr";
  if (weight >= 15 && weight < 30) ngt = "10–12 Fr";
  if (weight >= 30)                 ngt = "12–14 Fr";

  let iv = "24G";
  if (weight >= 10 && weight < 25) iv = "22G";
  if (weight >= 25 && weight < 50) iv = "20G";
  if (weight >= 50)                 iv = "18G";

  let io = "15mm pink";
  if (weight >= 40) io = "25mm blue";

  const chestDrain = weight < 10 ? "10–14 Fr" : weight < 20 ? "16–20 Fr" : weight < 40 ? "20–28 Fr" : "28–32 Fr";
  const ucath      = weight < 5  ? "5 Fr"     : weight < 10 ? "6 Fr"     : weight < 20 ? "8 Fr"     : weight < 40 ? "10 Fr" : "12 Fr";

  const defib      = Math.round(weight * 4);
  const defibMax   = Math.min(weight * 10, 360);
  const cardiovert = Math.round(weight * 1);

  let maskSize = "Neonatal";
  if (weight >= 4  && weight < 10) maskSize = "Infant";
  if (weight >= 10 && weight < 25) maskSize = "Child";
  if (weight >= 25)                 maskSize = "Adult";

  const preferCuffed = weight >= 8 || age >= 2;

  const maintenance = weight < 10
    ? weight * 100
    : weight < 20
    ? 1000 + (weight - 10) * 50
    : 1500 + (weight - 20) * 20;

  return {
    ettUncuffed, ettCuffed, ettDepthOral, ettDepthNasal,
    lma, suction, blade, ngt, iv, io,
    chestDrain, ucath, defib, defibMax, cardiovert,
    maskSize, preferCuffed, maintenance,
  };
}

// ─── FOB SIZING TABLE ─────────────────────────────────────────────────────────
export function getFOBSize(weight) {
  if (weight < 3)  return { scope: "2.2 mm", ett: "3.0", label: "Ultra-thin scope" };
  if (weight < 10) return { scope: "2.8 mm", ett: "3.5", label: "Intubating scope" };
  if (weight < 20) return { scope: "3.5 mm", ett: "4.5", label: "Paeds FOB" };
  if (weight < 40) return { scope: "4.0 mm", ett: "5.5", label: "Paeds/adult thin" };
  return               { scope: "4.9 mm", ett: "7.0", label: "Standard adult" };
}

export const FOB_ROWS = [
  { age: "Neonate",    wt: "<3 kg",   scope: "2.2 mm", ett: "3.0", note: "Ultra-thin scope"   },
  { age: "Infant",     wt: "3–10 kg", scope: "2.8 mm", ett: "3.5", note: "Intubating scope"   },
  { age: "Toddler",    wt: "10–20 kg",scope: "3.5 mm", ett: "4.5", note: "Paeds FOB"          },
  { age: "School age", wt: "20–40 kg",scope: "4.0 mm", ett: "5.5", note: "Paeds/adult thin"   },
  { age: "Adolescent", wt: ">40 kg",  scope: "4.9 mm", ett: "7.0", note: "Standard adult"     },
];

// ─── BP CUFF SIZE ──────────────────────────────────────────────────────────────
export function getBPCuff(weight) {
  if (weight < 2)   return "Premature neonatal (2 cm)";
  if (weight < 3)   return "Neonatal (2.5 cm)";
  if (weight < 10)  return "Infant (4 cm)";
  if (weight < 20)  return "Child (6 cm)";
  if (weight < 30)  return "Small adult (8 cm)";
  return                   "Adult (10–12 cm)";
}

export const BP_CUFF_ROWS = [
  { aw: "Premature neonate",   cuff: "Premie",      width: "2 cm"  },
  { aw: "Neonate (<3 kg)",     cuff: "Neonatal",    width: "2.5 cm"},
  { aw: "Infant (3–10 kg)",    cuff: "Infant",      width: "4 cm"  },
  { aw: "Child (10–20 kg)",    cuff: "Child",       width: "6 cm"  },
  { aw: "School (20–30 kg)",   cuff: "Small adult", width: "8 cm"  },
  { aw: "Adolescent (>30 kg)", cuff: "Adult",       width: "12 cm" },
];

// ─── FORMULA REFERENCE ────────────────────────────────────────────────────────
export const FORMULA_ROWS = [
  { label: "ETT uncuffed (age ≥2 yr)",  val: "(age÷4) + 4"              },
  { label: "ETT cuffed (age ≥2 yr)",    val: "(age÷4) + 3.5"            },
  { label: "ETT depth — oral",           val: "(age÷2) + 12 cm"         },
  { label: "ETT depth — nasal",          val: "(age÷2) + 15 cm"         },
  { label: "Defibrillation",             val: "4 J/kg (max 10 J/kg or 360 J)" },
  { label: "Cardioversion",              val: "0.5–1 J/kg → 2 J/kg"     },
  { label: "Suction catheter (Fr)",      val: "≈ 3 × ETT (mm)"          },
  { label: "Maintenance fluid",          val: "4 mL/kg/hr (10 kg) + 2 + 1" },
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
      "L — Look externally (dysmorphic)",
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
      "O — Obesity/Obstruction",
      "A — Age (>55 or <1 yr)",
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
      "Use a stylet angled 60–90° for GlideScope (more angulated blade)",
      "3 attempts maximum — each should be BEST attempt with optimisation",
    ],
  },
  {
    name: "2nd Generation LMA (iGel / LMA Supreme)", tone: "violet",
    sub: "Best SGD for paediatric difficult airway management",
    details: [
      "iGel advantages: no cuff, fast insertion, gastric drain port, high seal pressure",
      "Can ventilate + protects against aspiration + allows FOB-guided intubation through it",
      "Insertion: lubricate caudal aspect, insert along hard palate in neutral position",
      "ETCO₂ via iGel acceptable confirmation in confirmed difficult airway scenarios",
    ],
  },
  {
    name: "Bougie / Airway Exchange Catheter", tone: "amber",
    sub: "Improves ETT placement when view is limited",
    details: [
      "Paediatric bougie: 5 Fr Eschmann or Frova catheter for children <10 yr",
      "Advance into trachea under direct/video view → feel tracheal rings → railroad ETT",
      "AEC: 11 Fr for ETT ≥5 mm · 8 Fr for ETT 3.5–5 mm",
      "O₂ via AEC during exchange: 1 L/min insufflation — barotrauma risk if cuffed",
    ],
  },
  {
    name: "Transtracheal Jet Ventilation (TTJV)", tone: "red",
    sub: "Temporising rescue oxygenation — NOT definitive airway",
    details: [
      "16–18G IV cannula through CTM (in children >10 kg)",
      "Attach to high-pressure O₂ source (15 L/min) via Sanders injector",
      "Ventilation: 1 s on / 4 s off (allow passive exhalation — CO₂ rises rapidly)",
      "AVOID in complete upper airway obstruction (cannot exhale — barotrauma)",
      "Limit to 3–5 min as a bridge to definitive airway",
    ],
  },
  {
    name: "Emergency Tracheostomy", tone: "red",
    sub: "Definitive eFONA if CTM not accessible or <8 yr",
    details: [
      "Preferred over surgical cricothyrotomy in children <8 yr (small CTM)",
      "Call ENT/head-neck surgeon early — do NOT attempt alone without training",
      "Trousseau dilator + ETT (smallest available — 3.0–3.5 mm) via trachea below cricoid",
      "Confirm placement: ETCO₂ waveform + bilateral breath sounds + CXR",
    ],
  },
];

export const CTM_NOTES = [
  { label: "Neonates / Infants",   text: "CTM is 1–2 mm height. Use ultrasound to identify. Cannula cricothyrotomy only — not surgical." },
  { label: "Children <8 yr",       text: "CTM still small. FONA very high risk. Prioritise SGD or call surgeons for emergency tracheostomy." },
  { label: "Children ≥8 yr",       text: "CTM becomes larger. Surgical FONA feasible. Identify: thyroid notch → thyroid cartilage → soft spot above cricoid = CTM." },
  { label: "Ultrasound guidance",  text: "Linear probe transverse + sagittal scan. Tracheal rings: hypoechoic + air reverberation. CTM: no ring, hyperechoic." },
];

// ─── MONITORING DATA ──────────────────────────────────────────────────────────
export const SPO2_PROBE_SITES = [
  { site: "Finger",     pre: "Post-ductal",  color: "#3b82f6", note: "Preferred >3 yr"       },
  { site: "Toe",        pre: "Post-ductal",  color: "#8b5cf6", note: "Neonates / infants"     },
  { site: "Right hand", pre: "Pre-ductal",   color: "#10b981", note: "PPHN monitor"           },
  { site: "Ear lobe",   pre: "Central",      color: "#f59e0b", note: ">3 yr; faster response" },
  { site: "Forehead",   pre: "Central",      color: "#ef4444", note: "Reflectance probe"      },
];

export const SPO2_PROBE_ROWS = [
  { age: "Neonate / Premature", site: "Wrap probe (foot/hand). Gelstix or Neonatal D-lite.",    warn: "Use foot for post-ductal, right hand for pre-ductal (PPHN)." },
  { age: "Infant (1–12 mo)",    site: "Foot/toe. Palm wrap probe. Masimo RD rainbow preferred.", warn: "Motion artefact common — pause suction if NICU." },
  { age: "Toddler–School",      site: "Finger clip or tape wrap. Index or middle finger.",       warn: "Nail polish: remove. Cold periphery: false low reading." },
  { age: "Adolescent",          site: "Standard adult finger clip probe. Earlobe acceptable.",   warn: "COHb reads as normal SpO₂ — use co-oximeter if CO exposure." },
];

export const SPO2_LIMITATIONS = [
  "Accuracy validated to SpO₂ ≥70% only",
  "Motion artefact: Masimo SET algorithm better than Nellcor",
  "Carboxyhaemoglobin (COHb): reads as OxyHb — falsely NORMAL in CO poisoning",
  "MetHaemoglobinaemia: SpO₂ reads ~85% regardless of true value",
  "Nail polish (blue, black, green): use alternate site or remove polish",
  "Pigmented skin: may overestimate SpO₂ by 2–3% (Masimo Root better)",
  "Severe anaemia (Hb <5): inaccurate",
  "Poor peripheral perfusion: use central site (ear, forehead)",
  "Ambient light artefact: cover probe in phototherapy",
];

export const SPO2_TARGETS = [
  "Term neonate: 94–98% (air). Avoid hyperoxia.",
  "Preterm <32 wks: 90–95% — higher → retinopathy of prematurity (ROP)",
  "PPHN neonate: pre-ductal (right hand) ≥95%, aim for pH 7.45–7.55",
  "Children on room air: ≥94%",
  "Post-cardiac arrest (ROSC): 94–99% — titrate FiO₂ to avoid hyperoxia",
  "ARDS / PICU: 92–96% acceptable to allow lower FiO₂",
];

export const ETCO2_PATTERNS = [
  { pat: "Low ETCO₂ (<30 mmHg)",   cause: "Hyperventilation · Low cardiac output · Pulmonary embolism · Circuit leak" },
  { pat: "High ETCO₂ (>50 mmHg)",  cause: "Hypoventilation · Malignant hyperthermia · Raised CO₂ production (fever, seizures)" },
  { pat: "Shark fin / Obstructed", cause: "Slow alveolar emptying — asthma, bronchospasm, auto-PEEP. Sloped plateau." },
  { pat: "Sudden drop to zero",    cause: "Oesophageal intubation · Circuit disconnect · Cardiac arrest" },
  { pat: "ETCO₂ < PaCO₂",          cause: "Normal gradient 2–5 mmHg. Widened gap = increased dead space (PE, low CO)" },
  { pat: "ETCO₂ during CPR",        cause: "<10 mmHg = poor compressions. Sustained rise = ROSC" },
];

export const BVM_SIZES = [
  { size: "Neonatal bag",    vol: "250 mL",     use: "Premature and term neonates. Min PEEP valve." },
  { size: "Infant bag",      vol: "450 mL",     use: "Infants up to ~10 kg." },
  { size: "Paediatric bag",  vol: "500–750 mL", use: "10–25 kg. Standard paediatric practice." },
  { size: "Adult bag",       vol: "1500 mL",    use: "Adolescents >25 kg. Adult mask." },
];

export const BVM_TECHNIQUES = [
  "EC technique: thumb+index form C over mask, 3rd-5th fingers form E on mandible",
  "2-person technique preferred: one holds mask (2-hand), one squeezes bag",
  "Jaw thrust: 3rd/4th fingers behind mandibular angles, push forward (not occiput)",
  "OPA size = corner of mouth → centre of ear pinna (age/4 + 4 cm)",
  "NPA: use if OPA not tolerated. Contraindicated in base of skull fracture",
  "Infant positioning: neutral — do NOT hyperextend (floppy trachea may kink)",
  "Sniffing position only in children >2 yr",
];

export const BVM_FAILURES = [
  "Poor seal — 2-hand 2-person technique if 1-person failing",
  "Upper airway obstruction — add OPA/NPA, reposition",
  "Gastric distension → aspiration risk → insert NGT / decompress",
  "Pressure pop-off valve: neonatal bags have 40 cmH₂O pop-off — bypass if stiff lungs",
  "Bag too large: adult bag in infant → impossible to control tidal volume",
];

export const BP_METHODS = [
  { method: "Oscillometric NIBP",          use: "Standard monitoring. Measures MAP directly, derives systolic/diastolic. Reliable >3 kg." },
  { method: "Auscultatory (Korotkoff)",    use: "Gold standard for diagnosis. Korotkoff I = systolic, V = diastolic (IV in <13 yr)." },
  { method: "Doppler ultrasound",          use: "Best for neonates and poor perfusion. Place probe over radial/brachial artery. Systolic only." },
  { method: "Flush method",                use: "Neonates only (if no Doppler). Limb elevated, cuff released — flush returns = MAP." },
  { method: "Invasive arterial (A-line)",  use: "ICU/theatre. Radial preferred (20G infant, 22G neonate). Continuous waveform + MAP." },
];

// ─── FOB TECHNIQUE STEPS ─────────────────────────────────────────────────────
export const FOB_STEPS = [
  "Pre-oxygenate · anti-sialagogue (glycopyrrolate 0.01 mg/kg)",
  "Load ETT on scope, lubricate generously",
  "Topical anaesthesia: lignocaine 4% spray (max 4 mg/kg) to airway",
  "Insert nasally (preferred in children) or orally via Berman/Ovassapian airway",
  "Identify cords → advance into trachea → confirm with carina view",
  "Railroad ETT off scope. Remove scope while holding ETT fixed",
  "Confirm with ETCO₂ waveform and bilateral breath sounds",
];

export const FOB_AWAKE_STEPS = [
  "Preferred in children ≥8–10 yr who can cooperate",
  "Dexmedetomidine 1–2 mcg/kg IN as pre-med (30 min before)",
  "Topical lignocaine 4% spray: nasal, pharynx, subglottic",
  "Maintain spontaneous ventilation throughout",
  "Do NOT give muscle relaxant until airway confirmed",
];

export const FOB_LMA_STEPS = [
  "Insert LMA first for oxygenation",
  "Pass FOB through LMA to identify glottis",
  "Railroad ETT over FOB through LMA",
  "Remove LMA while holding ETT — use LMA-exchange catheter technique",
  "Useful when direct laryngoscopy fails but ventilation via LMA is possible",
];

// ─── SVG DIAGRAMS ─────────────────────────────────────────────────────────────
export function VortexSVG() {
  return (
    <svg viewBox="0 0 360 340" className="w-full max-w-sm mx-auto" aria-label="Vortex Approach diagram">
      <rect width="360" height="340" rx="12" fill="#0f172a" />
      <circle cx="180" cy="170" r="140" fill="none" stroke="#1e3a5f" strokeWidth="1.5" />
      {/* Mask ventilation arc */}
      <path d="M180,170 L180,30 A140,140 0 0,1 301.2,100 Z" fill="#1d4ed8" fillOpacity="0.25" stroke="#3b82f6" strokeWidth="1.5" />
      <text x="230" y="80" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="700" fontFamily="monospace">MASK</text>
      <text x="235" y="91" textAnchor="middle" fill="#93c5fd" fontSize="7" fontFamily="monospace">VENTILATION</text>
      {/* Supraglottic arc */}
      <path d="M180,170 L301.2,100 A140,140 0 0,1 301.2,240 Z" fill="#7c3aed" fillOpacity="0.25" stroke="#a855f7" strokeWidth="1.5" />
      <text x="308" y="172" textAnchor="middle" fill="#c4b5fd" fontSize="9" fontWeight="700" fontFamily="monospace">SGD</text>
      <text x="308" y="183" textAnchor="middle" fill="#c4b5fd" fontSize="7" fontFamily="monospace">LMA / iGel</text>
      {/* Tracheal arc */}
      <path d="M180,170 L301.2,240 A140,140 0 0,1 180,310 Z" fill="#065f46" fillOpacity="0.35" stroke="#10b981" strokeWidth="1.5" />
      <text x="268" y="285" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontWeight="700" fontFamily="monospace">TRACHEAL</text>
      <text x="265" y="296" textAnchor="middle" fill="#6ee7b7" fontSize="7" fontFamily="monospace">Intubation</text>
      {/* Emergency eFONA arc */}
      <path d="M180,170 L180,310 A140,140 0 0,1 58.8,240 Z" fill="#7f1d1d" fillOpacity="0.35" stroke="#ef4444" strokeWidth="1.5" />
      <text x="105" y="285" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="700" fontFamily="monospace">EMERGENCY</text>
      <text x="107" y="296" textAnchor="middle" fill="#fca5a5" fontSize="7" fontFamily="monospace">FRONT OF NECK</text>
      {/* Optimise arc */}
      <path d="M180,170 L58.8,240 A140,140 0 0,1 58.8,100 Z" fill="#78350f" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="55" y="172" textAnchor="middle" fill="#fcd34d" fontSize="8" fontWeight="700" fontFamily="monospace">OPTIMISE</text>
      <text x="55" y="183" textAnchor="middle" fill="#fcd34d" fontSize="7" fontFamily="monospace">each lifeline</text>
      {/* Repeat arc */}
      <path d="M180,170 L58.8,100 A140,140 0 0,1 180,30 Z" fill="#0c4a6e" fillOpacity="0.25" stroke="#0ea5e9" strokeWidth="1.5" />
      <text x="110" y="75" textAnchor="middle" fill="#7dd3fc" fontSize="8" fontWeight="700" fontFamily="monospace">REPEAT ×3</text>
      <text x="110" y="86" textAnchor="middle" fill="#7dd3fc" fontSize="7" fontFamily="monospace">best attempt</text>
      {/* Centre */}
      <circle cx="180" cy="170" r="52" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      <circle cx="180" cy="170" r="44" fill="#1e293b" />
      <text x="180" y="163" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="800" fontFamily="monospace">VORTEX</text>
      <text x="180" y="176" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="800" fontFamily="monospace">APPROACH</text>
      <text x="180" y="192" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">Chrimes 2016</text>
      {/* Radial guide lines */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r1 = 100, r2 = 56;
        const rad = (deg - 90) * Math.PI / 180;
        return <line key={i} x1={180 + r1 * Math.cos(rad)} y1={170 + r1 * Math.sin(rad)} x2={180 + r2 * Math.cos(rad)} y2={170 + r2 * Math.sin(rad)} stroke="#475569" strokeWidth="0.8" strokeDasharray="3,2" />;
      })}
      <circle cx="180" cy="145" r="5" fill="#22c55e" />
      <text x="180" y="134" textAnchor="middle" fill="#86efac" fontSize="6" fontFamily="monospace">O₂ maintained</text>
    </svg>
  );
}

export function CICOAlgorithmSVG() {
  const mkr = (id) => (
    <defs key={id}>
      <marker id={id} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
      </marker>
    </defs>
  );

  return (
    <svg viewBox="0 0 340 460" className="w-full max-w-xs mx-auto" aria-label="CICO algorithm">
      <rect width="340" height="460" rx="12" fill="#0f172a" />
      <text x="170" y="22" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="800" fontFamily="monospace">CANNOT INTUBATE · CANNOT OXYGENATE</text>
      <text x="170" y="34" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">AIDAA 2022 · Paediatric Difficult Airway</text>
      {/* Step boxes */}
      {[
        { y: 45,  fill: "#1e3a5f", stroke: "#3b82f6", text: "CALL FOR HELP · Continue O₂ · SpO₂ monitor",    sub: "Maximise oxygenation by all means"           },
        { y: 104, fill: "#78350f", stroke: "#f59e0b", text: "MAXIMISE MASK VENTILATION",                       sub: "2-person 2-hand technique · OPA/NPA"          },
        { y: 163, fill: "#4c1d95", stroke: "#a855f7", text: "SUPRAGLOTTIC DEVICE — 2nd GENERATION",            sub: "iGel / LMA Supreme · Max 2 attempts"          },
      ].map((b, i) => (
        <g key={i}>
          <rect x="30" y={b.y} width="280" height="36" rx="6" fill={b.fill} stroke={b.stroke} strokeWidth="1.5" />
          <text x="170" y={b.y + 17} textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="700" fontFamily="monospace">{b.text}</text>
          <text x="170" y={b.y + 29} textAnchor="middle" fill="#f8fafc" fontSize="7" fontFamily="monospace" opacity="0.8">{b.sub}</text>
        </g>
      ))}
      {/* Arrows */}
      {mkr("a1")}{mkr("a2")}{mkr("a3")}{mkr("a4")}{mkr("a5")}
      <line x1="170" y1="81"  x2="170" y2="104" stroke="#64748b" strokeWidth="1.2" markerEnd="url(#a1)" />
      <line x1="170" y1="140" x2="170" y2="163" stroke="#64748b" strokeWidth="1.2" markerEnd="url(#a2)" />
      <line x1="170" y1="199" x2="170" y2="222" stroke="#64748b" strokeWidth="1.2" markerEnd="url(#a3)" />
      {/* Decision diamond */}
      <polygon points="170,222 290,250 170,278 50,250" fill="#134e4a" stroke="#10b981" strokeWidth="1.5" />
      <text x="170" y="247" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="700" fontFamily="monospace">SpO₂ IMPROVING?</text>
      <text x="170" y="259" textAnchor="middle" fill="#6ee7b7" fontSize="7" fontFamily="monospace">Oxygenation restored?</text>
      {/* Yes / No branches */}
      <line x1="50"  y1="250" x2="30"  y2="295" stroke="#64748b" strokeWidth="1.2" markerEnd="url(#a4)" />
      <text x="10"  y="285" fill="#86efac" fontSize="7" fontFamily="monospace">YES</text>
      <rect x="5"   y="295" width="130" height="36" rx="6" fill="#052e16" stroke="#16a34a" strokeWidth="1.5" />
      <text x="70"  y="313" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="700" fontFamily="monospace">MAINTAIN O₂</text>
      <text x="70"  y="325" textAnchor="middle" fill="#86efac" fontSize="7" fontFamily="monospace">Plan definitive airway</text>
      <line x1="290" y1="250" x2="310" y2="295" stroke="#64748b" strokeWidth="1.2" markerEnd="url(#a5)" />
      <text x="296" y="285" fill="#fca5a5" fontSize="7" fontFamily="monospace">NO</text>
      {/* eFONA box */}
      <line x1="170" y1="278" x2="170" y2="300" stroke="#64748b" strokeWidth="1.2" />
      <rect x="30" y="300" width="280" height="44" rx="6" fill="#450a0a" stroke="#dc2626" strokeWidth="1.5" />
      <text x="170" y="319" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="700" fontFamily="monospace">EMERGENCY FRONT OF NECK ACCESS (eFONA)</text>
      <text x="170" y="334" textAnchor="middle" fill="#fca5a5" fontSize="7" fontFamily="monospace">Scalpel–finger–tube technique (preferred)</text>
      {/* eFONA steps */}
      <text x="20" y="365" fill="#fca5a5" fontSize="8" fontWeight="700" fontFamily="monospace">eFONA STEPS:</text>
      {[
        "1. Neck extension · Identify CTM",
        "2. Horizontal stab incision through skin + CTM",
        "3. Finger/dilator to hold tract open",
        "4. Insert smallest ETT (5.0) or CTM device",
        "5. Inflate cuff · Confirm ETCO₂ · CXR",
      ].map((s, i) => (
        <text key={i} x="20" y={378 + i * 14} fill="#fca5a5" fontSize="7" fontFamily="monospace">{s}</text>
      ))}
      <text x="170" y="455" textAnchor="middle" fill="#475569" fontSize="6" fontFamily="monospace">Paediatric mod: 16G cannula + jet oxygenation if &lt;8 yr</text>
    </svg>
  );
}

export function FOBSizingSVG() {
  return (
    <svg viewBox="0 0 360 210" className="w-full" aria-label="Fibreoptic bronchoscope sizing">
      <rect width="360" height="210" rx="8" fill="#0f172a" />
      <text x="180" y="18" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="800" fontFamily="monospace">FIBREOPTIC BRONCHOSCOPE — PAEDIATRIC SIZING</text>
      {["Age Band", "Weight", "Scope OD", "Min ETT ID", "Notes"].map((h, i) => (
        <text key={h} x={[16, 76, 140, 200, 258][i]} y="33" fill="#64748b" fontSize="7" fontWeight="700" fontFamily="monospace">{h}</text>
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
      <text x="12" y="205" fill="#475569" fontSize="6" fontFamily="monospace">Load ETT BEFORE scope insertion. ETT ID ≥ scope OD + 0.8 mm. Lubricate. Antifog lens. Scope must reach carina.</text>
    </svg>
  );
}

export function BVMDiagramSVG() {
  return (
    <svg viewBox="0 0 380 200" className="w-full" aria-label="Bag-valve-mask components">
      <rect width="380" height="200" rx="8" fill="#0f172a" />
      <text x="190" y="18" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="800" fontFamily="monospace">BAG-VALVE-MASK — PAEDIATRIC COMPONENTS</text>
      {/* Mask */}
      <ellipse cx="52" cy="110" rx="38" ry="26" fill="#1d4ed8" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="1.5" />
      <text x="52" y="106" textAnchor="middle" fill="#93c5fd" fontSize="7" fontWeight="700" fontFamily="monospace">MASK</text>
      <text x="52" y="117" textAnchor="middle" fill="#93c5fd" fontSize="6" fontFamily="monospace">Transparent</text>
      {/* Valve */}
      <rect x="98" y="96" width="44" height="28" rx="5" fill="#0f172a" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="120" y="112" textAnchor="middle" fill="#93c5fd" fontSize="7" fontWeight="700" fontFamily="monospace">VALVE</text>
      <text x="120" y="122" textAnchor="middle" fill="#93c5fd" fontSize="6" fontFamily="monospace">1-way</text>
      {/* Bag */}
      <ellipse cx="210" cy="110" rx="68" ry="32" fill="#065f46" fillOpacity="0.4" stroke="#10b981" strokeWidth="1.5" />
      <text x="210" y="105" textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">SELF-INFLATING BAG</text>
      <text x="210" y="116" textAnchor="middle" fill="#6ee7b7" fontSize="6" fontFamily="monospace">Neonatal 250 mL</text>
      <text x="210" y="126" textAnchor="middle" fill="#6ee7b7" fontSize="6" fontFamily="monospace">Paediatric 500 mL</text>
      {/* Reservoir */}
      <rect x="290" y="93" width="72" height="34" rx="5" fill="#7c3aed" fillOpacity="0.3" stroke="#a855f7" strokeWidth="1.5" />
      <text x="326" y="108" textAnchor="middle" fill="#c4b5fd" fontSize="7" fontWeight="700" fontFamily="monospace">RESERVOIR</text>
      <text x="326" y="119" textAnchor="middle" fill="#c4b5fd" fontSize="6" fontFamily="monospace">O₂ 10–15 L/min</text>
      <text x="326" y="130" textAnchor="middle" fill="#c4b5fd" fontSize="6" fontFamily="monospace">FiO₂ ≥ 0.85</text>
      {/* Lines */}
      <line x1="90" y1="110" x2="98"  y2="110" stroke="#475569" strokeWidth="1.5" />
      <line x1="278" y1="110" x2="290" y2="110" stroke="#475569" strokeWidth="1.5" />
      {/* Caption */}
      <text x="12" y="165" fill="#64748b" fontSize="7" fontFamily="monospace">MASK SIZES: Neonatal (0) · Infant (1) · Child (2–3) · Adult (4–5)</text>
      <text x="12" y="178" fill="#64748b" fontSize="7" fontFamily="monospace">E-C grip for seal. 2-person 2-hand preferred. Jaw thrust for airway opening.</text>
      <text x="12" y="191" fill="#64748b" fontSize="7" fontFamily="monospace">Tidal volume: 6–8 mL/kg. Rate: 20–30/min (infant) · 12–20/min (child).</text>
    </svg>
  );
}

export function SpO2ProbeSVG() {
  return (
    <svg viewBox="0 0 380 140" className="w-full" aria-label="Pulse oximetry probe placement">
      <rect width="380" height="140" rx="8" fill="#0f172a" />
      <text x="190" y="18" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="800" fontFamily="monospace">PULSE OXIMETRY — PAEDIATRIC PROBE SITES</text>
      {SPO2_PROBE_SITES.map((s, i) => {
        const x = 30 + i * 70;
        return (
          <g key={s.site}>
            <circle cx={x + 28} cy="65" r="22" fill={s.color} fillOpacity="0.15" stroke={s.color} strokeWidth="1.5" />
            <text x={x + 28} y="61" textAnchor="middle" fill={s.color} fontSize="7" fontWeight="700" fontFamily="monospace">{s.site}</text>
            <text x={x + 28} y="72" textAnchor="middle" fill={s.color} fontSize="6" fontFamily="monospace">{s.pre}</text>
            <text x={x + 28} y="100" textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="monospace">{s.note}</text>
          </g>
        );
      })}
      <text x="12" y="120" fill="#475569" fontSize="6" fontFamily="monospace">Pre-ductal (right hand) vs post-ductal difference &gt;3–4% SpO₂ = significant R→L shunting (PPHN).</text>
      <text x="12" y="132" fill="#475569" fontSize="6" fontFamily="monospace">Accuracy: validated to SpO₂ ≥70%. Inaccurate: nail polish, methHb, COHb, poor perfusion, pigmented skin.</text>
    </svg>
  );
}
