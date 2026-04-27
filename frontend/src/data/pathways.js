// ═══════════════════════════════════════════════════════════════
// Interactive clinical pathways — acute medical & surgical emergencies
// Refs: Tintinalli Emergency Medicine, Fleischer & Ludwig, Harriet
// Lane Handbook 23rd ed., IAP guidelines
// ═══════════════════════════════════════════════════════════════
// Node types:
//   { kind: "question", prompt, options: [{label, next}] }
//   { kind: "result", severity, title, summary, actions, drugs, source }

export const PATHWAYS = [
  // ── 1. FEVER IN YOUNG INFANT ───────────────────────────────
  {
    id: "fever-infant",
    title: "Fever in Young Infant (≤ 90 days)",
    category: "medical",
    source: "IAP febrile infant guideline · F&L ch. 84 · Harriet Lane ch. 3",
    start: "age",
    nodes: {
      age: {
        kind: "question",
        prompt: "Age of infant?",
        options: [
          { label: "< 28 days (neonate)", next: "r-neonate" },
          { label: "29 – 60 days", next: "ill" },
          { label: "61 – 90 days", next: "ill" },
        ],
      },
      ill: {
        kind: "question",
        prompt: "Ill-appearing (lethargy, poor perfusion, grunting, apnoea, shock)?",
        options: [
          { label: "Yes", next: "r-ill" },
          { label: "No — well-appearing", next: "focus" },
        ],
      },
      focus: {
        kind: "question",
        prompt: "Identifiable focus of infection (bronchiolitis, otitis, UTI on dipstick)?",
        options: [
          { label: "Clear viral focus (bronchiolitis / RSV)", next: "r-viral" },
          { label: "UTI suspected / no clear focus", next: "r-low-risk" },
        ],
      },
      "r-neonate": {
        kind: "result",
        severity: "red",
        title: "Full sepsis evaluation — ADMIT",
        summary: "All febrile neonates require admission, full workup, empiric antibiotics regardless of appearance.",
        actions: [
          "Full septic workup: CBC, CRP, blood culture, urine (cath/SPA) + culture, LP (CSF cell count, glucose, protein, culture, Gram stain, HSV PCR)",
          "Consider CXR if respiratory signs",
          "Admit for minimum 48 h observation",
          "Empiric IV antibiotics within 1 hour",
          "If vesicles, mucocutaneous lesions, seizures, CSF pleocytosis → add Acyclovir 20 mg/kg IV q8h for HSV",
        ],
        drugs: [
          { name: "Ampicillin", dose: "50 mg/kg", route: "IV q6h" },
          { name: "Gentamicin", dose: "4 mg/kg", route: "IV q24h" },
          { name: "Acyclovir (if HSV suspected)", dose: "20 mg/kg", route: "IV q8h" },
        ],
      },
      "r-ill": {
        kind: "result",
        severity: "red",
        title: "Ill-appearing febrile infant — ADMIT, full workup",
        summary: "Ill-appearing at any age < 90 d → treat as septic. Resuscitate then investigate.",
        actions: [
          "ABCDE resuscitation. Fluid bolus 10–20 mL/kg NS, reassess",
          "Full septic workup (blood + urine + CSF)",
          "IV antibiotics within 1 hour",
          "Admit — consider PICU",
        ],
        drugs: [
          { name: "Ceftriaxone", dose: "100 mg/kg (meningitis dose)", route: "IV" },
          { name: "Vancomycin", dose: "15 mg/kg", route: "IV (if MRSA risk)" },
          { name: "Acyclovir", dose: "20 mg/kg", route: "IV (if HSV features)" },
        ],
      },
      "r-viral": {
        kind: "result",
        severity: "amber",
        title: "Likely viral focus — tailored assessment",
        summary: "Clear viral focus (e.g., RSV bronchiolitis) reduces bacterial risk but does NOT exclude concurrent UTI.",
        actions: [
          "Urine analysis + culture (cath/SPA) — UTI coexists with viral illness in ~1–3%",
          "Supportive care: antipyretics, oxygen if SpO₂ < 92%, feeds/hydration",
          "Observe; admit if feeding poorly, work of breathing, ≤ 60 days, or social concerns",
        ],
        drugs: [
          { name: "Paracetamol", dose: "15 mg/kg", route: "PO q4–6h" },
        ],
      },
      "r-low-risk": {
        kind: "result",
        severity: "amber",
        title: "Step-by-Step / low-risk criteria",
        summary: "Well-appearing 29–90 d infant: apply step-by-step rule (age, appearance, urine, PCT/CRP, ANC).",
        actions: [
          "Urine dipstick + culture mandatory",
          "CBC, CRP, procalcitonin (PCT) if available",
          "Blood culture",
          "Low risk (all of): well-appearing + age > 21 d + negative UA + PCT < 0.5 + CRP < 20 + ANC < 10,000 → observe without antibiotics (8–24 h reassessment)",
          "If any criterion fails → LP + empiric antibiotics + admit",
        ],
        drugs: [
          { name: "Ceftriaxone (if treating)", dose: "50 mg/kg", route: "IV" },
        ],
      },
    },
  },

  // ── 2. HEAD INJURY / PECARN ─────────────────────────────────
  {
    id: "head-injury",
    title: "Paediatric Head Injury (PECARN)",
    category: "medical",
    source: "PECARN rule (Kuppermann 2009) · Tintinalli ch. 116 · F&L ch. 37",
    start: "gcs",
    nodes: {
      gcs: {
        kind: "question",
        prompt: "GCS and mechanism?",
        options: [
          { label: "GCS ≤ 14 OR signs of altered mental status OR palpable skull # OR signs of basilar skull #", next: "r-ct-now" },
          { label: "GCS 15 — no obvious severe signs", next: "age" },
        ],
      },
      age: {
        kind: "question",
        prompt: "Child's age?",
        options: [
          { label: "< 2 years", next: "q-under2" },
          { label: "≥ 2 years", next: "q-over2" },
        ],
      },
      "q-under2": {
        kind: "question",
        prompt: "Any of: scalp haematoma (non-frontal), LOC ≥ 5 s, severe mechanism, not acting normally per parent?",
        options: [
          { label: "Yes (any one)", next: "r-obs-or-ct" },
          { label: "No — none present", next: "r-discharge" },
        ],
      },
      "q-over2": {
        kind: "question",
        prompt: "Any of: any LOC, vomiting, severe headache, severe mechanism?",
        options: [
          { label: "Yes (any one)", next: "r-obs-or-ct" },
          { label: "No — none present", next: "r-discharge" },
        ],
      },
      "r-ct-now": {
        kind: "result",
        severity: "red",
        title: "CT head NOW — high risk ciTBI",
        summary: "PECARN high-risk group — CT head recommended. Risk of ciTBI ~4.4%.",
        actions: [
          "Urgent CT head (non-contrast)",
          "C-spine immobilisation if mechanism suggests",
          "Strict ABC, reverse coagulopathy if present",
          "Neurosurgical consult if evacuable lesion, GCS ≤ 8 → intubate",
          "Maintain CPP: normotension, head-up 30°, normocarbia, SpO₂ > 94%",
        ],
        drugs: [
          { name: "Mannitol 20% (if signs of ↑ICP/herniation)", dose: "0.5 g/kg", route: "IV over 20 min" },
          { name: "Hypertonic saline 3%", dose: "4 mL/kg", route: "IV bolus" },
          { name: "Levetiracetam (post-traumatic seizure prophylaxis)", dose: "40 mg/kg", route: "IV" },
        ],
      },
      "r-obs-or-ct": {
        kind: "result",
        severity: "amber",
        title: "Observation vs CT — shared decision",
        summary: "PECARN intermediate-risk. ciTBI risk ~0.8–0.9%. Discuss CT vs 4–6 h observation with parents.",
        actions: [
          "Observe 4–6 h in ED — reassess mental status, vomiting, symptoms",
          "CT if: worsening symptoms, multiple findings, parental preference, age < 3 mo, physician experience low",
          "Consider: single finding + isolated + experienced clinician → observation reasonable",
          "Discharge criteria: asymptomatic, normal exam, reliable caregiver",
        ],
        drugs: [
          { name: "Ondansetron (vomiting)", dose: "0.15 mg/kg", route: "IV/ODT (max 4 mg if <15 kg, 8 mg if ≥15 kg)" },
        ],
      },
      "r-discharge": {
        kind: "result",
        severity: "emerald",
        title: "Discharge — very low risk",
        summary: "PECARN low-risk: ciTBI risk < 0.02%. No CT needed.",
        actions: [
          "Paracetamol for pain",
          "Discharge with written head-injury advice",
          "Return precautions: persistent vomiting, worsening headache, LOC, seizure, unsteady gait, behaviour change, drowsiness",
          "GP follow-up if persistent symptoms > 48 h",
        ],
        drugs: [
          { name: "Paracetamol", dose: "15 mg/kg", route: "PO q4–6h" },
        ],
      },
    },
  },

  // ── 3. RESPIRATORY DISTRESS DIFFERENTIAL ────────────────────
  {
    id: "resp-distress",
    title: "Paediatric Respiratory Distress",
    category: "medical",
    source: "F&L ch. 71–73 · Tintinalli ch. 115 · IAP respiratory guidelines",
    start: "sound",
    nodes: {
      sound: {
        kind: "question",
        prompt: "Predominant abnormal sound?",
        options: [
          { label: "Stridor (inspiratory upper-airway)", next: "q-stridor" },
          { label: "Wheeze (expiratory lower-airway)", next: "q-wheeze" },
          { label: "Grunting / crackles", next: "q-grunt" },
        ],
      },
      "q-stridor": {
        kind: "question",
        prompt: "Onset & associated features?",
        options: [
          { label: "Barking cough, URTI prodrome, 6 mo – 6 yr", next: "r-croup" },
          { label: "Toxic, drooling, tripod, no cough (rare post vaccine)", next: "r-epiglottitis" },
          { label: "Sudden choking, witnessed event", next: "r-fb" },
          { label: "Hives, swelling, known allergen exposure", next: "r-anaphylaxis" },
        ],
      },
      "q-wheeze": {
        kind: "question",
        prompt: "Clinical pattern?",
        options: [
          { label: "Age ≤ 2 yr, URTI, crackles + wheeze, first episode (winter)", next: "r-bronch" },
          { label: "Recurrent, known asthma / atopy, responds to β-agonist", next: "r-asthma" },
          { label: "Sudden onset, unilateral, history of choking", next: "r-fb" },
          { label: "Associated with allergen / urticaria", next: "r-anaphylaxis" },
        ],
      },
      "q-grunt": {
        kind: "question",
        prompt: "Clinical clues?",
        options: [
          { label: "Fever, focal crackles, tachypnoea", next: "r-pneumonia" },
          { label: "Neonate / young infant, preceding cough-coryza, cyanotic spells", next: "r-pertussis" },
        ],
      },
      "r-croup": {
        kind: "result",
        severity: "amber",
        title: "Viral Croup (Laryngotracheobronchitis)",
        summary: "Assess severity with Westley score. Dexamethasone is the mainstay; nebulised adrenaline for moderate–severe.",
        actions: [
          "Minimise distress — parental comfort",
          "Score (Westley): mild ≤ 2, moderate 3–7, severe 8–11, impending failure ≥ 12",
          "All severities → Dexamethasone (single dose)",
          "Moderate–severe → Nebulised adrenaline; observe ≥ 2–4 h post-dose for rebound",
          "Admit if repeated adrenaline needed, stridor at rest > 4 h, age < 6 mo",
        ],
        drugs: [
          { name: "Dexamethasone", dose: "0.15–0.6 mg/kg", route: "PO/IM × 1 (max 10 mg)" },
          { name: "Adrenaline nebulised (1:1000)", dose: "0.5 mg/kg (max 5 mL)", route: "Neb" },
        ],
      },
      "r-epiglottitis": {
        kind: "result",
        severity: "red",
        title: "Epiglottitis — AIRWAY EMERGENCY",
        summary: "Do NOT examine throat or distress child. Call anaesthesia + ENT for controlled airway in theatre.",
        actions: [
          "Keep child calm with parent; allow position of comfort",
          "Give O₂ blow-by only if tolerated",
          "Anaesthesia + ENT to theatre for intubation under inhalational induction with ENT surgeon present for surgical airway",
          "IV antibiotics AFTER airway secured",
          "Blood cultures, full septic screen",
        ],
        drugs: [
          { name: "Ceftriaxone", dose: "100 mg/kg (max 2 g)", route: "IV (after airway)" },
        ],
      },
      "r-fb": {
        kind: "result",
        severity: "red",
        title: "Foreign Body Airway Obstruction",
        summary: "Assess effectiveness of cough. Management depends on age and effectiveness.",
        actions: [
          "Effective cough → encourage coughing, DO NOT intervene; observe for deterioration",
          "Ineffective cough, conscious, < 1 yr: 5 back blows + 5 chest thrusts alternating",
          "Ineffective cough, conscious, ≥ 1 yr: 5 back blows + 5 abdominal (Heimlich) thrusts alternating",
          "Unconscious at any age: start CPR (check mouth before each rescue breath)",
          "All cases → ENT / bronchoscopy for foreign body removal",
        ],
        drugs: [],
      },
      "r-anaphylaxis": {
        kind: "result",
        severity: "red",
        title: "Anaphylaxis — IM adrenaline NOW",
        summary: "Airway/breathing/circulation involvement with allergen exposure. Go to Anaphylaxis algorithm.",
        actions: [
          "IM Adrenaline 0.01 mg/kg (1:1000) anterolateral thigh",
          "High-flow O₂, supine with legs up (or sitting if resp distress)",
          "IV fluid bolus 20 mL/kg NS",
          "Adjuncts: salbutamol neb, hydrocortisone, antihistamine",
          "Observe ≥ 4–6 h, discharge with 2 adrenaline auto-injectors",
        ],
        drugs: [
          { name: "Adrenaline IM", dose: "0.01 mg/kg (max 0.5 mg)", route: "IM anterolateral thigh" },
          { name: "Hydrocortisone", dose: "4 mg/kg (max 200 mg)", route: "IV" },
        ],
      },
      "r-bronch": {
        kind: "result",
        severity: "amber",
        title: "Viral Bronchiolitis (RSV)",
        summary: "Supportive care. Bronchodilators / steroids NOT routinely recommended.",
        actions: [
          "Nasal suction + supportive feeds",
          "Oxygen for SpO₂ < 90–92%",
          "HFNC or CPAP for work-of-breathing",
          "NG feeds if feeding < 50% normal",
          "Admit if: apnoea, hypoxia, dehydration, age < 2 mo, social concerns",
          "DO NOT routinely give bronchodilators, steroids, antibiotics",
        ],
        drugs: [],
      },
      "r-asthma": {
        kind: "result",
        severity: "amber",
        title: "Acute Asthma Exacerbation",
        summary: "Score with PRAM. Salbutamol ± ipratropium + steroids for all; add MgSO₄ for severe.",
        actions: [
          "O₂ to SpO₂ ≥ 94%",
          "Salbutamol 2.5 mg (<5 yr) / 5 mg (≥5 yr) neb — continuous if severe",
          "Ipratropium 250 mcg (<5 yr) / 500 mcg neb × 3 back-to-back in severe",
          "Systemic steroids — PO prednisolone preferred (= IV hydrocortisone)",
          "Severe: MgSO₄ 50 mg/kg IV over 20 min (max 2 g)",
          "Refractory: IV salbutamol, aminophylline, or intubation",
        ],
        drugs: [
          { name: "Salbutamol nebulised", dose: "2.5–5 mg", route: "Neb q20min" },
          { name: "Prednisolone", dose: "1 mg/kg (max 40 mg)", route: "PO" },
          { name: "Magnesium sulfate", dose: "50 mg/kg (max 2 g)", route: "IV over 20 min" },
        ],
      },
      "r-pneumonia": {
        kind: "result",
        severity: "amber",
        title: "Community-acquired Pneumonia",
        summary: "Empirical antibiotics — amoxicillin first-line. Admit if hypoxia, poor feeding, age < 6 mo, toxic.",
        actions: [
          "CXR if: diagnostic doubt, severe disease, failure of outpatient therapy, hypoxia",
          "Blood cultures if admitted / severe",
          "Oxygen to SpO₂ ≥ 92%",
          "Outpatient: oral amoxicillin; atypical cover (macrolide) if age > 5 yr or atypical features",
          "Inpatient: IV ampicillin/amoxicillin or ceftriaxone; add macrolide if severe/atypical",
        ],
        drugs: [
          { name: "Amoxicillin", dose: "30 mg/kg", route: "PO TDS" },
          { name: "Ceftriaxone (inpatient)", dose: "50 mg/kg", route: "IV" },
          { name: "Azithromycin (atypical)", dose: "10 mg/kg day 1, then 5 mg/kg", route: "PO/IV" },
        ],
      },
      "r-pertussis": {
        kind: "result",
        severity: "red",
        title: "Pertussis — consider in young infant",
        summary: "Paroxysmal cough with whoop / apnoea / cyanotic spells. Macrolide + isolation.",
        actions: [
          "Isolation (droplet)",
          "Nasopharyngeal swab for B. pertussis PCR",
          "Oxygen for hypoxia; monitor for apnoea",
          "Admit ALL infants < 6 mo",
          "Macrolide antibiotic to reduce transmission (little effect on disease course if given late)",
          "Contact prophylaxis for household/high-risk contacts",
        ],
        drugs: [
          { name: "Azithromycin", dose: "10 mg/kg day 1, then 5 mg/kg × 4 d", route: "PO" },
        ],
      },
    },
  },

  // ── 4. ACUTE ABDOMINAL PAIN (SURGICAL) ──────────────────────
  {
    id: "acute-abdomen",
    title: "Acute Abdominal Pain (Surgical)",
    category: "surgical",
    source: "F&L ch. 48 · Tintinalli ch. 121 · Harriet Lane ch. 12",
    start: "age",
    nodes: {
      age: {
        kind: "question",
        prompt: "Age group?",
        options: [
          { label: "Infant < 2 yr", next: "q-infant" },
          { label: "Child 2 – 10 yr", next: "q-child" },
          { label: "Adolescent > 10 yr", next: "q-adolescent" },
        ],
      },
      "q-infant": {
        kind: "question",
        prompt: "Key features?",
        options: [
          { label: "Episodic inconsolable cry, vomiting, red-currant-jelly stool, sausage-shaped mass", next: "r-intuss" },
          { label: "Projectile non-bilious vomiting, hungry after feed, 2–8 wk old boy", next: "r-pyloric" },
          { label: "Bilious vomiting at any age", next: "r-malrot" },
          { label: "Incarcerated groin / scrotal swelling", next: "r-hernia" },
        ],
      },
      "q-child": {
        kind: "question",
        prompt: "Localisation and features?",
        options: [
          { label: "Peri-umbilical → RLQ, anorexia, fever, guarding", next: "r-appendix" },
          { label: "Crampy, intermittent, bilious vomiting, distension", next: "r-obstruction" },
          { label: "Sudden scrotal pain + swelling (boys)", next: "r-torsion" },
          { label: "Palpable purpura + colicky abdominal pain", next: "r-hsp" },
        ],
      },
      "q-adolescent": {
        kind: "question",
        prompt: "Features?",
        options: [
          { label: "RLQ pain, anorexia, peritoneal signs", next: "r-appendix" },
          { label: "Sudden testicular pain (boys)", next: "r-torsion" },
          { label: "Sudden pelvic pain ± amenorrhoea (girls)", next: "r-ovarian" },
          { label: "Haematemesis / melaena", next: "r-gi-bleed" },
        ],
      },
      "r-intuss": {
        kind: "result",
        severity: "red",
        title: "Intussusception",
        summary: "Surgical/radiological emergency. Delay = bowel ischaemia.",
        actions: [
          "Resuscitate — IV fluids, NPO, NG decompression",
          "URGENT abdominal ultrasound (target/pseudo-kidney sign)",
          "Call paediatric surgery",
          "Air or hydrostatic enema reduction (if stable, no perforation/peritonitis)",
          "Operative reduction if enema fails or peritonitis",
          "Broad-spectrum antibiotics if signs of perforation",
        ],
        drugs: [
          { name: "IV fluid bolus", dose: "20 mL/kg", route: "NS IV" },
          { name: "Ceftriaxone (if perforation)", dose: "50 mg/kg", route: "IV" },
          { name: "Metronidazole", dose: "10 mg/kg", route: "IV" },
        ],
      },
      "r-pyloric": {
        kind: "result",
        severity: "amber",
        title: "Hypertrophic Pyloric Stenosis",
        summary: "Correct hypochloraemic hypokalaemic metabolic alkalosis BEFORE surgery.",
        actions: [
          "NPO, NG decompression",
          "Bloods: U&E, blood gas (expect Cl < 98, HCO₃ > 28, hypoK)",
          "IV fluid resuscitation (NS bolus if dehydrated) then D5½NS + 20 mEq KCl once voiding",
          "Correct alkalosis before surgery (HCO₃ < 30 target)",
          "US: pyloric thickness > 3 mm, length > 15 mm",
          "Ramstedt pyloromyotomy (after correction)",
        ],
        drugs: [
          { name: "Fluid maintenance", dose: "D5½NS + 20 mEq/L KCl", route: "IV at 1.5× maintenance" },
        ],
      },
      "r-malrot": {
        kind: "result",
        severity: "red",
        title: "Malrotation with volvulus — SURGICAL EMERGENCY",
        summary: "Bilious vomiting in ANY child until proven otherwise = surgical emergency.",
        actions: [
          "Resuscitate, NPO, large-bore NG",
          "URGENT upper GI contrast study (gold standard)",
          "Paediatric surgery consult NOW — theatre standby",
          "Ladd's procedure if volvulus confirmed",
          "Broad-spectrum antibiotics if signs of ischaemia",
        ],
        drugs: [
          { name: "Ceftriaxone + Metronidazole", dose: "50 + 10 mg/kg", route: "IV" },
          { name: "Fluid resuscitation", dose: "20 mL/kg", route: "NS IV" },
        ],
      },
      "r-hernia": {
        kind: "result",
        severity: "red",
        title: "Incarcerated / Strangulated Hernia",
        summary: "Attempt manual reduction if incarcerated < 6 h + skin normal; surgical referral for definitive repair.",
        actions: [
          "Gentle taxis reduction after analgesia (fentanyl IN + trendelenburg) within 1 h of presentation",
          "If successful → elective repair within 24–48 h (still admit)",
          "If failed, skin changes, peritonitis, or > 6 h → emergency surgical reduction + repair",
          "NPO, IV fluids, analgesia",
        ],
        drugs: [
          { name: "Fentanyl IN", dose: "1.5 mcg/kg", route: "IN" },
          { name: "Morphine IV", dose: "0.1 mg/kg", route: "IV" },
        ],
      },
      "r-appendix": {
        kind: "result",
        severity: "red",
        title: "Acute Appendicitis",
        summary: "Use Alvarado / PAS. Imaging if uncertain. Early surgical consultation.",
        actions: [
          "PAS (Paediatric Appendicitis Score) ≥ 7 → surgery; 4–6 → imaging; ≤ 3 → observe/discharge",
          "Labs: FBC, CRP, urine",
          "US first (operator-dependent). CT or MRI if inconclusive",
          "NPO, IV fluid maintenance, analgesia (opioid DOES NOT mask signs)",
          "Empiric antibiotics pre-op if perforation suspected",
          "Laparoscopic appendicectomy",
        ],
        drugs: [
          { name: "Ceftriaxone + Metronidazole", dose: "50 + 10 mg/kg", route: "IV" },
          { name: "Morphine", dose: "0.1 mg/kg", route: "IV PRN" },
          { name: "Ondansetron", dose: "0.15 mg/kg", route: "IV" },
        ],
      },
      "r-obstruction": {
        kind: "result",
        severity: "red",
        title: "Bowel Obstruction",
        summary: "Identify cause (adhesions, hernia, mass). Resuscitate and decompress.",
        actions: [
          "NPO, NG tube decompression",
          "IV fluid resuscitation — often significant third-space losses",
          "U&E, lactate, blood gas",
          "Erect + supine AXR; CT if high-grade or suspicious cause",
          "Surgical consult",
          "Antibiotics if strangulation / perforation suspected",
        ],
        drugs: [
          { name: "Fluid bolus", dose: "20 mL/kg", route: "NS IV" },
          { name: "Ceftriaxone + Metronidazole", dose: "50 + 10 mg/kg", route: "IV" },
        ],
      },
      "r-torsion": {
        kind: "result",
        severity: "red",
        title: "Testicular Torsion — 6-hour window",
        summary: "Time is testis. Do NOT wait for imaging if clinical diagnosis clear.",
        actions: [
          "URGENT urology/surgical consult",
          "Manual detorsion (open book — medial to lateral rotation) while awaiting theatre",
          "Doppler US only if diagnostic doubt AND does not delay surgery",
          "NPO, analgesia, anti-emetic",
          "Scrotal exploration + bilateral orchidopexy",
        ],
        drugs: [
          { name: "Fentanyl IV", dose: "1 mcg/kg", route: "IV" },
          { name: "Ondansetron", dose: "0.15 mg/kg", route: "IV" },
        ],
      },
      "r-hsp": {
        kind: "result",
        severity: "amber",
        title: "Henoch-Schönlein Purpura (IgA vasculitis)",
        summary: "Triad: palpable purpura (lower limbs/buttocks), colicky abdominal pain, arthritis. Watch for intussusception and renal involvement.",
        actions: [
          "Hydration, analgesia (paracetamol, avoid NSAIDs if renal involvement)",
          "Urine analysis for blood/protein at presentation and weekly × 6 mo (renal surveillance)",
          "BP monitoring",
          "Admit if severe abdominal pain, GI bleed, suspected intussusception, nephritis",
          "Corticosteroids for severe abdominal pain or nephrotic-range proteinuria",
        ],
        drugs: [
          { name: "Paracetamol", dose: "15 mg/kg", route: "PO" },
          { name: "Prednisolone (severe)", dose: "1–2 mg/kg (max 60 mg)", route: "PO" },
        ],
      },
      "r-ovarian": {
        kind: "result",
        severity: "red",
        title: "Ovarian Torsion / Ectopic Pregnancy",
        summary: "In adolescent girls with sudden pelvic pain — urgent surgical/gynae assessment and imaging.",
        actions: [
          "Urine pregnancy test MANDATORY",
          "Pelvic US with Doppler",
          "NPO, analgesia, IV fluids",
          "Gynae/surgical consult",
          "If ectopic: rhesus typing, group + save, consider methotrexate vs surgical",
          "If torsion: laparoscopy for detorsion + oophoropexy",
        ],
        drugs: [
          { name: "Morphine", dose: "0.1 mg/kg", route: "IV" },
          { name: "Ondansetron", dose: "0.15 mg/kg", route: "IV" },
        ],
      },
      "r-gi-bleed": {
        kind: "result",
        severity: "red",
        title: "Paediatric GI Bleed",
        summary: "Resuscitate, identify upper vs lower, endoscopy.",
        actions: [
          "ABC, 2 large-bore IV, group + crossmatch",
          "FBC, coag, U&E, LFT, lipase, group",
          "NG tube (upper GI), PR exam",
          "Fluid/blood resuscitation — transfuse at Hb < 7 (or < 8 if cardiac / symptomatic)",
          "PPI IV for suspected upper GI bleed",
          "Early gastroenterology / endoscopy",
          "Consider octreotide if variceal bleed suspected",
        ],
        drugs: [
          { name: "Pantoprazole", dose: "1 mg/kg (max 40 mg) bolus, then 0.1 mg/kg/hr", route: "IV" },
          { name: "pRBC transfusion", dose: "10–15 mL/kg", route: "IV over 2–4 h" },
          { name: "Octreotide (variceal)", dose: "1 mcg/kg bolus, then 1 mcg/kg/hr", route: "IV" },
        ],
      },
    },
  },

  // ── 5. TRAUMA PRIMARY SURVEY ────────────────────────────────
  {
    id: "trauma",
    title: "Paediatric Trauma — Primary Survey",
    category: "surgical",
    source: "ATLS/APLS · Tintinalli ch. 113 · F&L ch. 115",
    start: "airway",
    nodes: {
      airway: {
        kind: "question",
        prompt: "A · Airway (with C-spine protection)?",
        options: [
          { label: "Patent, protecting — proceed", next: "breathing" },
          { label: "Compromised / GCS ≤ 8 / threatened", next: "r-airway-emergency" },
        ],
      },
      breathing: {
        kind: "question",
        prompt: "B · Breathing — RR, SpO₂, chest wall?",
        options: [
          { label: "Adequate — proceed", next: "circulation" },
          { label: "Tension pneumothorax / haemothorax signs", next: "r-chest-emergency" },
          { label: "Respiratory distress without obvious chest injury", next: "r-respiratory" },
        ],
      },
      circulation: {
        kind: "question",
        prompt: "C · Circulation — HR, CRT, BP, mental status?",
        options: [
          { label: "Haemodynamically stable", next: "disability" },
          { label: "Shock (tachycardia, poor CRT, hypotension)", next: "r-shock" },
        ],
      },
      disability: {
        kind: "question",
        prompt: "D · Disability — GCS, pupils, glucose?",
        options: [
          { label: "GCS 15, pupils equal — proceed", next: "exposure" },
          { label: "GCS < 15 or focal neurology or ↑ICP signs", next: "r-head" },
        ],
      },
      exposure: {
        kind: "result",
        severity: "emerald",
        title: "Secondary survey — head-to-toe",
        summary: "Primary survey complete. Proceed to log-roll, secondary head-to-toe exam, AMPLE history, tertiary survey within 24 h.",
        actions: [
          "Keep warm (prevent hypothermia)",
          "Complete head-to-toe exam with log-roll",
          "AMPLE history (Allergies, Meds, PMH, Last meal, Events)",
          "Adjunct imaging: FAST, trauma series (C-spine, CXR, pelvis), CT if indicated",
          "Analgesia: IN fentanyl 1.5 mcg/kg for rapid relief",
          "Tertiary survey within 24 h to catch missed injuries",
        ],
        drugs: [
          { name: "Fentanyl IN", dose: "1.5 mcg/kg", route: "IN" },
          { name: "Tetanus toxoid", dose: "per vaccination status", route: "IM" },
        ],
      },
      "r-airway-emergency": {
        kind: "result",
        severity: "red",
        title: "Airway intervention NOW",
        summary: "Open airway, suction, jaw thrust with manual inline C-spine stabilisation. RSI if GCS ≤ 8.",
        actions: [
          "Jaw thrust + manual in-line cervical stabilisation",
          "Suction, chin lift, oropharyngeal airway",
          "Bag-mask with cricoid pressure at 100% O₂",
          "RSI when ready — see RSI/Sedation tab",
          "Ketamine preferred if haemodynamically compromised; rocuronium paralysis",
          "End-tidal CO₂ for confirmation; secure ETT",
        ],
        drugs: [
          { name: "Ketamine", dose: "2 mg/kg", route: "IV" },
          { name: "Rocuronium", dose: "1.2 mg/kg", route: "IV" },
        ],
      },
      "r-chest-emergency": {
        kind: "result",
        severity: "red",
        title: "Immediate chest decompression",
        summary: "Tension pneumothorax = clinical diagnosis. Do NOT wait for imaging.",
        actions: [
          "Needle decompression 2nd ICS MCL (or 4–5th ICS AAL) on affected side",
          "Followed by tube thoracostomy (28–32 Fr child; 8–10 Fr in small infant)",
          "Large haemothorax (> 20 mL/kg initial or > 2 mL/kg/hr) → thoracotomy",
          "Analgesia & intercostal block",
        ],
        drugs: [
          { name: "Cefazolin (pre-chest-tube prophylaxis)", dose: "25 mg/kg", route: "IV" },
          { name: "Fentanyl", dose: "1 mcg/kg", route: "IV" },
        ],
      },
      "r-respiratory": {
        kind: "result",
        severity: "amber",
        title: "Respiratory support",
        summary: "Supplemental O₂, consider NIV or intubation if worsening.",
        actions: [
          "High-flow O₂ to SpO₂ ≥ 94%",
          "CXR, blood gas",
          "Consider NIV or HFNC, escalate if required",
          "If pulmonary contusion: fluid sparing, analgesia, chest physio",
        ],
        drugs: [],
      },
      "r-shock": {
        kind: "result",
        severity: "red",
        title: "Paediatric Traumatic Shock",
        summary: "Almost always haemorrhagic. Control bleeding + balanced resuscitation.",
        actions: [
          "Direct pressure / tourniquet for external bleeding",
          "Pelvic binder if pelvic # suspected",
          "2 large-bore IV / IO access",
          "Crystalloid bolus 10–20 mL/kg × 1–2 (reassess)",
          "Early blood product transfusion if no response — 10 mL/kg pRBC, 1:1:1 ratio",
          "TXA 15 mg/kg (max 1 g) IV within 3 h of injury",
          "FAST scan, consider OR for damage control surgery",
        ],
        drugs: [
          { name: "Tranexamic acid (TXA)", dose: "15 mg/kg (max 1 g)", route: "IV over 10 min" },
          { name: "pRBC", dose: "10 mL/kg", route: "IV" },
          { name: "Fluid bolus", dose: "10–20 mL/kg", route: "NS/LR IV" },
        ],
      },
      "r-head": {
        kind: "result",
        severity: "red",
        title: "Traumatic Brain Injury — neuroprotection",
        summary: "Prevent secondary injury. CT head, consider intubation if GCS ≤ 8.",
        actions: [
          "RSI if GCS ≤ 8 — maintain normal MAP, SpO₂ 94–98%, PaCO₂ 35–40",
          "Head-up 30°, neutral neck",
          "Treat raised ICP: Mannitol 0.5 g/kg or hypertonic saline 3% 4 mL/kg",
          "Levetiracetam 40 mg/kg IV for post-traumatic seizure prophylaxis",
          "Glucose check, treat hypoglycaemia",
          "Urgent CT head, neurosurgical consult",
          "Avoid hypotension, hypoxia, hypo/hyperthermia",
        ],
        drugs: [
          { name: "Mannitol 20%", dose: "0.5 g/kg", route: "IV over 20 min" },
          { name: "Hypertonic saline 3%", dose: "4 mL/kg", route: "IV bolus" },
          { name: "Levetiracetam", dose: "40 mg/kg", route: "IV" },
        ],
      },
    },
  },
];
