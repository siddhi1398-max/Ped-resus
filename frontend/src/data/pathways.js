// ═══════════════════════════════════════════════════════════════════════════
// PATHWAYS.js — Comprehensive Interactive Clinical Pathways
// Paediatric Emergency Decision Support
//
// Architecture:
//   kind: "question"  — branch node with options
//   kind: "ddx"       — differential diagnosis narrowing node (new)
//   kind: "algorithm" — step-by-step management protocol (end node)
//   kind: "result"    — summary result (end node, legacy)
//
// Sources:
//   Fleischer & Ludwig's Textbook of Paediatric Emergency Medicine 8e (2021)
//   Tintinalli's Emergency Medicine 9e
//   Harriet Lane Handbook 23e
//   APLS (Advanced Paediatric Life Support) 6e
//   IAP Guidelines 2024
//   ILAE / AES Status Epilepticus Guidelines 2023
//   CHOP / BCH / RCH Clinical Pathways
//   PECARN rules (Kuppermann 2009; Dayan 2018)
//   ATLS 11e (ACS 2025)
// ═══════════════════════════════════════════════════════════════════════════
import 
{ Siren, Wind, Brain, ThermometerHot, Drop,}
        from "@phosphor-icons/react";
export const PATHWAYS = [

  // ══════════════════════════════════════════════════════════════════════════
  // 1. STRIDOR — deep differential narrowing tree (F&L ch. 14, 71, 72)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "stridor",
    title: "Stridor — Differential Diagnosis",
    category: "medical",
    icon: Siren,
    description: "Systematic approach to narrow the stridor differential before committing to a management pathway.",
    source: "F&L 8e ch. 14 & 71 · Tintinalli 9e ch. 120 · APLS 6e · CHOP Croup Pathway 2023",
    start: "stability",
    nodes: {

      stability: {
        kind: "question",
        prompt: "Initial rapid assessment — is the child in immediate danger?",
        options: [
          { label: "Severe distress: cyanosis / SpO₂ <92% / silent chest / impending arrest", next: "r-immediate" },
          { label: "Moderate distress or rapidly deteriorating — stridor at rest, retractions", next: "onset" },
          { label: "Mild distress — stridor on exertion or intermittent", next: "onset" },
        ],
      },

      onset: {
        kind: "question",
        prompt: "Onset pattern of stridor?",
        options: [
          { label: "Present since birth / early infancy (congenital / chronic)", next: "congenital" },
          { label: "Acute onset — hours to days (acquired)", next: "fever_check" },
          { label: "Recurrent episodes — well between", next: "recurrent" },
        ],
      },

      congenital: {
        kind: "ddx",
        prompt: "Stridor since infancy — characteristic features?",
        differentials: [
          { dx: "Laryngomalacia", clues: "Most common (60%). Inspiratory only. Worse supine/feeding/crying. Improves prone. Soft 'floppy' stridor. Typically resolves by 18–24 mo.", urgency: "low" },
          { dx: "Subglottic stenosis", clues: "Biphasic stridor. May have been intubated. Often presents with recurrent croup. CT/endoscopy to grade.", urgency: "medium" },
          { dx: "Vocal cord palsy", clues: "Weak cry. Often after cardiac/thoracic surgery (left recurrent laryngeal nerve). Biphasic or expiratory.", urgency: "medium" },
          { dx: "Tracheomalacia", clues: "Expiratory wheeze/stridor. 'Barking seal' cough. Worsened by URI. Associated with TOF/oesophageal atresia.", urgency: "low" },
          { dx: "Haemangioma / vascular ring", clues: "Biphasic, progressive. Skin haemangiomas in 50% of airway haemangioma. Vascular ring: worse with feeding, neck position change.", urgency: "medium" },
          { dx: "Laryngeal web / cleft", clues: "Present from birth. Aphonia or weak cry with laryngeal web. Aspiration with laryngeal cleft.", urgency: "high" },
        ],
        next: "alg-congenital",
      },

      recurrent: {
        kind: "ddx",
        prompt: "Recurrent episodic stridor — pattern?",
        differentials: [
          { dx: "Spasmodic / allergic croup", clues: "Sudden onset at night. No fever. Resolves quickly with cool air/steam. Atopic history. Responds to steroids.", urgency: "low" },
          { dx: "Recurrent croup over same structural lesion", clues: "Asks: Why recurrent? Subglottic stenosis, haemangioma, papillomatosis. ENT scoping needed.", urgency: "medium" },
          { dx: "Vocal cord dysfunction (VCD)", clues: "Adolescents. Inspiratory stridor. Exercise-triggered. Normal between episodes. Resolves with speech therapy.", urgency: "low" },
          { dx: "Laryngeal papillomatosis", clues: "HPV. Progressive hoarseness and stridor. School age. Recurrent obstruction requiring surgical debulking.", urgency: "medium" },
          { dx: "Subglottic haemangioma", clues: "< 6 months. Biphasic, progressive. Skin haemangiomas. Worsened with crying. Propranolol treatment.", urgency: "high" },
        ],
        next: "alg-recurrent",
      },

      fever_check: {
        kind: "question",
        prompt: "Is there fever (≥38°C)?",
        options: [
          { label: "Yes — febrile", next: "toxic_check" },
          { label: "No — afebrile", next: "afebrile_acute" },
        ],
      },

      afebrile_acute: {
        kind: "question",
        prompt: "Afebrile acute stridor — circumstances?",
        options: [
          { label: "Witnessed choking / eating / playing with small objects", next: "r-fb" },
          { label: "Allergen exposure / urticaria / angioedema / known allergy", next: "alg-anaphylaxis" },
          { label: "Neck trauma / post-intubation / caustic ingestion", next: "r-trauma-airway" },
          { label: "Night-time, no fever, atopic child, improves spontaneously", next: "alg-spasmodic-croup" },
        ],
      },

      toxic_check: {
        kind: "question",
        prompt: "Fever + stridor — does the child appear TOXIC (septic, shocked, altered)?",
        options: [
          { label: "Yes — high fever, toxic, no cough or minimal cough, drooling, tripod posture", next: "severe_febrile" },
          { label: "No — febrile but not toxic", next: "cough_check" },
        ],
      },

      severe_febrile: {
        kind: "question",
        prompt: "Toxic + febrile stridor — localise the features:",
        options: [
          { label: "Drooling + tripod position + NO barking cough + vaccinated → epiglottitis", next: "alg-epiglottitis" },
          { label: "High fever + barking cough + ill + worsening on steroids → bacterial tracheitis", next: "alg-bact-tracheitis" },
          { label: "Neck stiffness + trismus + bulging posterior pharynx + torticollis", next: "neck_abscess" },
        ],
      },

      neck_abscess: {
        kind: "question",
        prompt: "Deep neck space infection — site of swelling / symptoms?",
        options: [
          { label: "Posterior pharyngeal wall bulging, younger child (<4 yr), following URTI", next: "alg-rpa" },
          { label: "Unilateral tonsillar bulge, uvular deviation, trismus, hot-potato voice, adolescent", next: "alg-pta" },
          { label: "Anterior neck / submandibular, rapidly spreading, bilateral floor-of-mouth", next: "r-ludwigs" },
        ],
      },

      cough_check: {
        kind: "question",
        prompt: "Febrile + stridor, not toxic — cough character?",
        options: [
          { label: "Barking / seal-like cough, hoarse voice, URTI prodrome, 6 mo–6 yr", next: "croup_severity" },
          { label: "Mononucleosis features: exudative pharyngitis, lymphadenopathy, petechiae on palate", next: "alg-mono" },
          { label: "Inspiratory + expiratory stridor, severe sore throat, unilateral swelling", next: "alg-pta" },
          { label: "Drooling, sore throat, neck pain, < 4 yr, posterior pharyngeal swelling", next: "alg-rpa" },
        ],
      },

      croup_severity: {
        kind: "question",
        prompt: "Westley Croup Score — severity?",
        options: [
          { label: "Mild (score ≤2): barking cough only, no stridor at rest", next: "alg-croup-mild" },
          { label: "Moderate (3–7): stridor at rest, mild retractions, alert", next: "alg-croup-mod" },
          { label: "Severe (8–11): marked stridor, marked retractions, agitated / decreasing consciousness", next: "alg-croup-severe" },
          { label: "Impending failure (≥12): cyanosis, decreased consciousness, minimal air entry", next: "r-immediate" },
        ],
      },

      // ── END NODES (Algorithms) ──────────────────────────────────────────

      "r-immediate": {
        kind: "algorithm",
        severity: "red",
        title: "⚠ Immediate Airway Emergency",
        summary: "Impending airway obstruction — call for senior help NOW. Do not leave child alone.",
        phases: [
          {
            label: "0 min — Simultaneous actions",
            steps: [
              "Call anaesthesia + ENT + senior paediatrician simultaneously",
              "Keep child calm in position of comfort — do NOT lay supine, do NOT examine throat",
              "Parent to hold child — minimise distress at all costs",
              "Blow-by O₂ only if tolerated (mask may worsen distress)",
              "Prepare for controlled intubation in theatre OR bedside surgical airway",
            ],
          },
          {
            label: "Immediate decisions",
            steps: [
              "If known/suspected epiglottitis → theatre for gas induction with ENT standby for surgical airway",
              "If VF/arrest → bag-mask ventilation, airway adjuncts, RSI with surgical airway backup",
              "Do NOT attempt IV cannulation if this increases distress in suspected epiglottitis",
              "Prepare: ETT (full size + 0.5 below), LMA, bougie, scalpel (surgical airway)",
            ],
          },
        ],
        drugs: [],
        source: "F&L 8e ch. 7 · APLS 6e Difficult Airway · Vortex Approach",
      },

      "alg-croup-mild": {
        kind: "algorithm",
        severity: "emerald",
        title: "Viral Croup — Mild (Westley ≤2)",
        summary: "Barking cough only, no stridor at rest. Dexamethasone recommended for all grades. Can be managed at home.",
        phases: [
          {
            label: "ED / Clinic Management",
            steps: [
              "Single dose oral Dexamethasone 0.15 mg/kg (minimum effective dose — equivalent to 0.6 mg/kg)",
              "Observe 30–60 min post dexamethasone",
              "Do NOT routinely give nebulised adrenaline for mild croup",
              "Keep child calm — crying worsens stridor (airway narrows with turbulent flow)",
              "SpO₂ monitoring not required if no respiratory distress",
            ],
          },
          {
            label: "Discharge Criteria & Parent Education",
            steps: [
              "Discharge if: well, drinking, no stridor at rest after observation",
              "Written croup advice: cool night air, calm environment, avoid steam (outdated — no evidence)",
              "Return if: stridor at rest, won't drink, increased work of breathing, cyanosis, fever >5 days",
              "Second dose dexamethasone not routinely recommended; discuss with ED senior if recurrent",
              "Do NOT prescribe antibiotics — viral aetiology",
            ],
          },
        ],
        drugs: [
          { name: "Dexamethasone", dose: "0.15 mg/kg PO (max 10 mg)", route: "PO × 1", note: "0.6 mg/kg is also used — no proven superiority of higher dose in mild croup" },
          { name: "Paracetamol (antipyretic if febrile)", dose: "15 mg/kg", route: "PO q4–6h" },
        ],
        source: "F&L 8e ch. 71 · Russell & Dobson Cochrane 2011 · CHOP Croup Pathway 2023",
      },

      "alg-croup-mod": {
        kind: "algorithm",
        severity: "amber",
        title: "Viral Croup — Moderate (Westley 3–7)",
        summary: "Stridor at rest, mild–moderate retractions. Dexamethasone + nebulised adrenaline. Observe ≥2–4 h post-adrenaline.",
        phases: [
          {
            label: "Immediate",
            steps: [
              "Position of comfort — sitting upright, parent present",
              "High-flow blow-by O₂ if distressed (mask if tolerated)",
              "Nebulised adrenaline (1:1000) immediately — acts within 10–30 min",
              "Single dose Dexamethasone 0.15–0.6 mg/kg PO/IM (if vomiting/refusing PO)",
            ],
          },
          {
            label: "Observation phase (minimum 2–4 h post-adrenaline)",
            steps: [
              "Monitor: RR, HR, SpO₂, Westley score q30min for first 2 h",
              "Rebound stridor possible 1–2 h post-adrenaline — repeat neb if needed",
              "If requires ≥2 adrenaline nebulisations in < 1 h → ADMIT + continuous cardiac monitoring (adrenaline arrhythmia risk)",
              "Discharge if: Westley score ≤2 sustained, SpO₂ ≥95%, drinking well, no stridor at rest for ≥2 h after last neb",
            ],
          },
          {
            label: "Escalation triggers",
            steps: [
              "No response to two doses of nebulised adrenaline → RECONSIDER DIAGNOSIS (bacterial tracheitis, foreign body, epiglottitis)",
              "Hypoxia (SpO₂ <92%) → unusual in croup, suggests alternative/severe disease",
              "Age <6 months with croup → admit all",
            ],
          },
        ],
        drugs: [
          { name: "Adrenaline nebulised 1:1000", dose: "0.5 mL/kg (max 5 mL)", route: "Nebulised — undiluted, high-flow O₂" },
          { name: "Dexamethasone", dose: "0.15–0.6 mg/kg (max 10 mg)", route: "PO preferred / IM if unable to take PO" },
          { name: "Prednisolone (if dexamethasone unavailable)", dose: "1 mg/kg", route: "PO" },
        ],
        source: "F&L 8e ch. 71 · Bjornson & Johnson NEJM 2008 · CHOP Croup Pathway 2023 · Cochrane RSL",
      },

      "alg-croup-severe": {
        kind: "algorithm",
        severity: "red",
        title: "Viral Croup — Severe / Impending Failure (Westley ≥8)",
        summary: "Severe stridor, marked retractions, agitation/decreasing consciousness. Treat aggressively and prepare for intubation.",
        phases: [
          {
            label: "Immediate — Simultaneous",
            steps: [
              "Alert anaesthesia NOW — prepare for potential intubation",
              "DO NOT distress child — parent holds, position of comfort",
              "Continuous nebulised adrenaline (back-to-back) via blow-by O₂",
              "IM dexamethasone (IV if access easy — do not sacrifice calm for IV)",
              "Continuous SpO₂ monitoring, ECG monitoring (arrhythmia risk with repeated adrenaline)",
            ],
          },
          {
            label: "If not improving in 30 min",
            steps: [
              "Re-evaluate diagnosis — is this really croup? Consider: bacterial tracheitis, foreign body, epiglottitis",
              "Prepare for intubation under ketamine sedation OR gas induction in theatre",
              "ETT 0.5–1 size SMALLER than expected (subglottic oedema)",
              "Have a surgical airway (scalpel + tube) kit at bedside",
              "Post-intubation: ICU admission, humidified ventilation, steroid course",
            ],
          },
        ],
        drugs: [
          { name: "Adrenaline nebulised 1:1000", dose: "0.5 mL/kg (max 5 mL)", route: "Continuous neb or q20min" },
          { name: "Dexamethasone", dose: "0.6 mg/kg (max 10 mg)", route: "IM (IV if accessible)" },
          { name: "Ketamine (for intubation)", dose: "1–2 mg/kg", route: "IV if needed for RSI" },
          { name: "Heliox 70:30 (if available)", dose: "N/A", route: "Via tight-fitting mask — bridge to intubation" },
        ],
        source: "F&L 8e ch. 71 · APLS 6e · CHOP Croup Pathway 2023",
      },

      "alg-epiglottitis": {
        kind: "algorithm",
        severity: "red",
        title: "Epiglottitis — Controlled Airway Emergency",
        summary: "Rare post-Hib vaccine. High fever, drooling, tripod, NO barking cough. Theatre for gas induction. Do NOT examine throat.",
        phases: [
          {
            label: "Phase 1 — DO NOT disturb",
            steps: [
              "DO NOT examine throat or oropharynx — laryngospasm risk",
              "DO NOT attempt IV access if distress will increase",
              "DO NOT lay child supine",
              "Blow-by O₂ only — parent holds in position of comfort",
              "Activate: anaesthesia + ENT + PICU — simultaneously",
            ],
          },
          {
            label: "Phase 2 — Theatre (controlled gas induction)",
            steps: [
              "Inhalational induction with sevoflurane in sitting position",
              "ENT surgeon scrubbed and ready for surgical airway if intubation fails",
              "Maintain spontaneous ventilation until vocal cords visualised",
              "Intubate orally under direct laryngoscopy — cherry-red swollen epiglottis is pathognomonic",
              "ETT 0.5–1 size smaller than expected",
              "Post-intubation: PICU, blood cultures, IV antibiotics, blood glucose",
            ],
          },
          {
            label: "Phase 3 — After airway secured",
            steps: [
              "Blood cultures before antibiotics",
              "IV antibiotics immediately",
              "Extubate when afebrile + leak around ETT confirms oedema resolving (usually 24–48 h)",
              "Public health notification (H. influenzae type b — notifiable in most regions)",
              "Household rifampicin prophylaxis if Hib confirmed",
            ],
          },
        ],
        drugs: [
          { name: "Ceftriaxone", dose: "100 mg/kg (max 2 g)", route: "IV once airway secured" },
          { name: "Vancomycin (if MRSA risk)", dose: "15 mg/kg", route: "IV q6h" },
          { name: "Dexamethasone (post-intubation oedema)", dose: "0.15 mg/kg", route: "IV q6h × 3–4 doses" },
        ],
        source: "F&L 8e ch. 72 · Tintinalli 9e ch. 120 · APLS 6e",
      },

      "alg-bact-tracheitis": {
        kind: "algorithm",
        severity: "red",
        title: "Bacterial Tracheitis (Membranous Laryngotracheobronchitis)",
        summary: "Post-viral superinfection (Staph aureus most common). Toxic child, high fever, barking cough, rapid deterioration, NO response to croup treatment. CXR: subglottic membrane.",
        phases: [
          {
            label: "Recognition (critical — often misdiagnosed as severe croup)",
            steps: [
              "Suspect if: previous 'croup' not responding to adrenaline × 2, high fever, toxic appearance",
              "Lateral neck X-ray: irregular ragged tracheal mucosa, steeple sign with membrane",
              "Blood cultures before antibiotics",
              "Alert anaesthesia — high risk of complete obstruction",
            ],
          },
          {
            label: "Airway + ICU",
            steps: [
              "RSI/gas induction for intubation — expect THICK purulent mucus/pseudomembranes",
              "Large-bore suction catheter immediately post-intubation (membranes cause ETT obstruction)",
              "Frequent tracheal suctioning — ETT occlusion is the primary mortality risk",
              "PICU admission mandatory",
              "Extubation typically 3–7 days (until fever resolving, secretions clearing, audible ETT leak)",
            ],
          },
          {
            label: "Antimicrobials",
            steps: [
              "Cover: S. aureus (including MRSA) + H. influenzae + Streptococcus",
              "Send tracheal aspirate for MC+S",
              "Antifungal NOT required unless immunocompromised",
            ],
          },
        ],
        drugs: [
          { name: "Cefazolin (if MSSA suspected)", dose: "50 mg/kg", route: "IV q6h" },
          { name: "Vancomycin (MRSA cover)", dose: "15 mg/kg", route: "IV q6h" },
          { name: "Clindamycin (toxin suppression)", dose: "10 mg/kg", route: "IV q6–8h — can add to vancomycin" },
          { name: "Ceftriaxone (if H. influenzae)", dose: "100 mg/kg", route: "IV" },
        ],
        source: "F&L 8e ch. 72 · Donnelly & Klassen NEJM 2012 · CHOP deep neck pathway",
      },

      "alg-rpa": {
        kind: "algorithm",
        severity: "red",
        title: "Retropharyngeal Abscess (RPA)",
        summary: "Most common < 4 yr. Preceding URTI → neck pain, drooling, stiff neck, posterior pharyngeal bulge on the midline. Do NOT use tongue depressor — rupture risk.",
        phases: [
          {
            label: "Assessment & Imaging",
            steps: [
              "Lateral neck X-ray: prevertebral soft tissue >7 mm at C2, >14 mm at C6 (child), or > width of vertebral body",
              "CT neck with contrast (gold standard): identifies if phlegmon vs abscess, size, extension",
              "Do NOT vigorously examine posterior pharynx — risk of rupture and aspiration",
              "Full septic workup: FBC, CRP, blood cultures",
              "Airway assessment: if stridor or significant airway compromise → theatre first",
            ],
          },
          {
            label: "Management",
            steps: [
              "IV antibiotics (all) — trial of 24–48 h if small phlegmon without abscess on CT",
              "ENT/surgical drainage: if frank abscess on CT, not improving on antibiotics, airway compromise",
              "Aspiration/needle drainage vs open surgical drainage — per ENT preference and anatomy",
              "NPO until airway/surgical plan confirmed",
              "Admit + continuous airway monitoring",
            ],
          },
        ],
        drugs: [
          { name: "Amoxicillin-Clavulanate (mild, phlegmon)", dose: "45 mg/kg/day amoxicillin component", route: "IV q8h" },
          { name: "Ampicillin-Sulbactam (moderate)", dose: "200 mg/kg/day ampicillin component", route: "IV q6h (max 8 g/day)" },
          { name: "Piperacillin-Tazobactam (severe/polymicrobial)", dose: "300 mg/kg/day piperacillin component", route: "IV q6h" },
          { name: "Metronidazole (anaerobic cover)", dose: "10 mg/kg", route: "IV q8h" },
          { name: "Dexamethasone (airway oedema)", dose: "0.15 mg/kg q6h", route: "IV × 3–4 doses" },
        ],
        source: "F&L 8e ch. 73 · Tintinalli 9e · CHOP Deep Neck Space Pathway 2023",
      },

      "alg-pta": {
        kind: "algorithm",
        severity: "amber",
        title: "Peritonsillar Abscess (PTA)",
        summary: "Most common deep neck infection in children > 8 yr. Unilateral tonsillar bulge, uvula deviation, trismus, hot-potato voice. Treat with drainage + antibiotics.",
        phases: [
          {
            label: "Diagnosis",
            steps: [
              "Clinical: uvular deviation AWAY from affected side, palatal fullness, trismus, ipsilateral otalgia, muffled voice",
              "Intraoral ultrasound (if available): confirms abscess vs peritonsillar cellulitis (sensitivity ~90%)",
              "CT only if diagnosis uncertain, bilateral, or concern for parapharyngeal extension",
              "Throat swab + blood cultures if toxic",
            ],
          },
          {
            label: "Drainage",
            steps: [
              "Needle aspiration (first-line) OR incision and drainage (I&D) under local anaesthetic",
              "Procedural sedation: intranasal fentanyl 1.5 mcg/kg + midazolam 0.1 mg/kg IN",
              "Position: semi-recumbent, suction available (abscess contents must not be aspirated)",
              "ENT consult if unable to drain in ED or bilateral/complicated",
              "Quinsy tonsillectomy (hot tonsillectomy) if recurrent PTA or unable to drain",
            ],
          },
          {
            label: "Post-drainage",
            steps: [
              "IV/PO antibiotics (step-down to PO if improving)",
              "Analgesia: paracetamol + ibuprofen; opioid if severe",
              "Adequate hydration — dysphagia may limit PO",
              "Discharge if: improving, able to drink, afebrile, no airway concern. Oral antibiotics × 10 days.",
              "Complications to exclude: aspiration, carotid pseudoaneurysm (rare), mediastinitis",
            ],
          },
        ],
        drugs: [
          { name: "Amoxicillin-Clavulanate", dose: "45 mg/kg/day amoxicillin component (max 2 g/day)", route: "IV then PO × 10 d" },
          { name: "Benzylpenicillin + Metronidazole (IV phase)", dose: "60 mg/kg/day + 10 mg/kg q8h", route: "IV" },
          { name: "Clindamycin (penicillin allergy)", dose: "10 mg/kg", route: "IV q8h then PO × 10 d" },
          { name: "Dexamethasone (oedema + pain)", dose: "0.15 mg/kg (max 10 mg)", route: "IV × 1" },
          { name: "Fentanyl IN (procedural)", dose: "1.5 mcg/kg", route: "IN" },
        ],
        source: "F&L 8e ch. 73 · CHOP PTA Pathway 2023 · Tintinalli 9e ch. 243",
      },

      "alg-anaphylaxis": {
        kind: "algorithm",
        severity: "red",
        title: "Anaphylaxis",
        summary: "Allergen + multi-system involvement (airway/breathing/circulation). IM adrenaline is the only first-line treatment.",
        phases: [
          {
            label: "Phase 1 — Immediate (0–2 min)",
            steps: [
              "Remove trigger (if identifiable — e.g. IV medication, food)",
              "Adrenaline IM anterolateral thigh IMMEDIATELY — no other treatment takes priority",
              "Call for help / activate anaphylaxis response",
              "Position: supine with legs elevated (unless resp distress → semi-recumbent)",
              "High-flow O₂ 10–15 L/min",
            ],
          },
          {
            label: "Phase 2 — After adrenaline (2–10 min)",
            steps: [
              "IV/IO access while colleague gives adrenaline",
              "Fluid bolus 10–20 mL/kg NS if hypotension/shock",
              "Repeat IM adrenaline at 5 min if no improvement (same dose, same site)",
              "Salbutamol neb 2.5–5 mg if bronchospasm",
              "Adjuncts (NOT first-line): chlorpheniramine IV, hydrocortisone IV",
            ],
          },
          {
            label: "Phase 3 — Refractory / IV adrenaline",
            steps: [
              "If no response to 2× IM adrenaline → IV adrenaline infusion",
              "PICU review for IV adrenaline use",
              "Observe minimum 4–6 h after last adrenaline (biphasic reaction risk at 1–72 h)",
              "Discharge with × 2 adrenaline auto-injectors + written anaphylaxis plan",
              "Allergy/immunology referral",
            ],
          },
        ],
        drugs: [
          { name: "Adrenaline IM 1:1000", dose: "0.01 mg/kg (max 0.5 mg)", route: "IM anterolateral thigh — repeat at 5 min if needed" },
          { name: "Adrenaline IV infusion (refractory)", dose: "0.1–1 mcg/kg/min", route: "IV infusion — PICU level care" },
          { name: "NS bolus", dose: "20 mL/kg", route: "IV/IO — for hypotension" },
          { name: "Salbutamol neb (bronchospasm)", dose: "2.5 mg (<25 kg) / 5 mg (>25 kg)", route: "Neb" },
          { name: "Hydrocortisone (adjunct, not first-line)", dose: "4 mg/kg (max 200 mg)", route: "IV" },
          { name: "Chlorpheniramine (adjunct)", dose: "<1 yr: 250 mcg/kg · 1–5 yr: 2.5 mg · 6–12 yr: 5 mg", route: "IV slow / IM" },
        ],
        source: "F&L 8e ch. 87 · WAO Anaphylaxis Guidelines 2020 · APLS 6e",
      },

      "alg-spasmodic-croup": {
        kind: "algorithm",
        severity: "emerald",
        title: "Spasmodic / Allergic Croup",
        summary: "Afebrile, atopic, sudden onset (often nocturnal). Resolves rapidly. Treat same as viral croup. Consider allergic workup.",
        phases: [
          {
            label: "Acute Management",
            steps: [
              "Dexamethasone 0.15 mg/kg PO — works for spasmodic and viral croup equally",
              "Nebulised adrenaline if moderate distress (same dose as viral croup)",
              "Cool night air: some evidence for benefit via mucosal vasoconstriction",
              "Reassure parents — typically resolves within 1–2 h",
            ],
          },
          {
            label: "Longer term",
            steps: [
              "If recurrent (≥3 episodes): ENT referral for direct laryngoscopy to exclude fixed lesion",
              "Consider allergy assessment if strongly atopic / food/environmental triggers",
              "No role for prophylactic steroids or LABA",
            ],
          },
        ],
        drugs: [
          { name: "Dexamethasone", dose: "0.15 mg/kg (max 10 mg)", route: "PO × 1" },
        ],
        source: "F&L 8e ch. 71 · Tintinalli 9e",
      },

      "alg-mono": {
        kind: "algorithm",
        severity: "amber",
        title: "Infectious Mononucleosis (EBV) — Airway Involvement",
        summary: "Exudative pharyngitis + lymphadenopathy + splenomegaly ± stridor from massive tonsillar enlargement. Avoid amoxicillin (rash in 90%). Splenic rupture risk.",
        phases: [
          {
            label: "Assessment",
            steps: [
              "Monospot test (> 4 yr); EBV serology (< 4 yr — monospot less sensitive)",
              "FBC: atypical lymphocytes, lymphocytosis; thrombocytopenia common",
              "LFTs: transaminitis in 80% — avoid heavy activity / contact sport",
              "Assess tonsillar size: Brodsky grade III–IV (touching uvula or meeting midline) → steroid + ENT",
              "Abdominal US if splenomegaly palpable — splenic rupture risk (greatest 2–3 wks of illness)",
            ],
          },
          {
            label: "Airway Management",
            steps: [
              "Mild–moderate: corticosteroids (to reduce tonsillar oedema), soft diet, analgesics",
              "Severe airway compromise (stridor, SpO₂ decrease): ENT consult + IV dexamethasone",
              "Intubation if complete obstruction — expect very difficult airway (massive tonsils)",
              "Avoid amoxicillin/ampicillin (90% develop morbilliform rash — not true allergy)",
              "No sport × 3–4 weeks (spleen risk); return to sport only after imaging confirms normal spleen",
            ],
          },
        ],
        drugs: [
          { name: "Dexamethasone (airway oedema)", dose: "0.6 mg/kg (max 10 mg)", route: "IV/PO — taper over 3–5 days" },
          { name: "Paracetamol", dose: "15 mg/kg", route: "PO q4–6h" },
          { name: "Ibuprofen", dose: "10 mg/kg (max 400 mg)", route: "PO q6–8h — avoid if thrombocytopenia" },
        ],
        source: "F&L 8e ch. 87 · Tintinalli 9e",
      },

      "r-fb": {
        kind: "algorithm",
        severity: "red",
        title: "Foreign Body Airway Obstruction (FBAO)",
        summary: "Key question: is the cough effective? Effective = encourage coughing. Ineffective = back blows + thrusts.",
        phases: [
          {
            label: "Effective cough (conscious, able to cry/speak)",
            steps: [
              "Encourage coughing — DO NOT interfere",
              "Watch closely for deterioration",
              "Do NOT perform blind finger sweeps — may impact the FB further",
              "ENT/bronchoscopy for removal — even if cough improves (FB still present)",
            ],
          },
          {
            label: "Ineffective cough — CONSCIOUS",
            steps: [
              "< 1 year: 5 back blows (heel of hand, between shoulder blades, head-down prone) + 5 chest thrusts — alternate",
              "≥ 1 year: 5 back blows + 5 abdominal thrusts (Heimlich) — alternate",
              "Check mouth after each cycle — only remove FB if CLEARLY visible",
              "Continue until object expelled, patient loses consciousness, or help arrives",
            ],
          },
          {
            label: "UNCONSCIOUS at any age",
            steps: [
              "Call cardiac arrest team",
              "Open airway + check mouth — only remove visible FB",
              "Attempt 5 rescue breaths (if no chest rise after airway repositioning → obstruction still present)",
              "Start CPR (30:2 ratio or 15:2 if 2 rescuers + child) — compressions may dislodge FB",
              "Look in mouth before each rescue breath",
              "Laryngoscopy + Magill forceps under direct vision if immediately available",
              "Definitive: rigid bronchoscopy in theatre",
            ],
          },
        ],
        drugs: [],
        source: "APLS 6e · ERC 2021 · F&L 8e ch. 71",
      },

      "r-trauma-airway": {
        kind: "algorithm",
        severity: "red",
        title: "Traumatic / Iatrogenic Airway Injury",
        summary: "Post-intubation, neck trauma, or caustic ingestion causing acute stridor. Rapidly progressive. ENT + anaesthesia urgently.",
        phases: [
          {
            label: "Immediate",
            steps: [
              "Minimise neck movement if cervical spine injury possible",
              "Blow-by O₂, position of comfort",
              "Simultaneous alert: ENT + anaesthesia + trauma surgery",
              "Do NOT attempt blind nasal/oral intubation in laryngeal trauma (risk of complete obstruction)",
              "CT neck if haemodynamically stable — identifies extent of injury",
              "Surgical airway (tracheostomy preferred over cricothyrotomy in tracheal injury) if obstructing",
            ],
          },
          {
            label: "Caustic ingestion",
            steps: [
              "Do NOT induce vomiting, do NOT give charcoal",
              "Chest X-ray + CXR if oesophageal injury suspected",
              "Upper GI endoscopy within 24 h (timing: > 12 h from ingestion is safest)",
              "pH test of ingested substance if available",
              "Surgical consult if signs of perforation (pneumomediastinum, peritonitis)",
            ],
          },
        ],
        drugs: [
          { name: "Dexamethasone (oedema)", dose: "0.15–0.6 mg/kg", route: "IV" },
        ],
        source: "F&L 8e ch. 71 · Tintinalli 9e",
      },

      "alg-congenital": {
        kind: "algorithm",
        severity: "amber",
        title: "Congenital / Chronic Stridor — Workup & Management",
        summary: "Most require ENT/respiratory specialist scoping. Acute decompensation = treat as acute airway emergency.",
        phases: [
          {
            label: "Outpatient workup (if stable)",
            steps: [
              "Flexible nasolaryngoscopy by ENT — most diagnostic",
              "CT airway ± CXR (vascular ring: barium swallow / MRI/CT chest)",
              "Pulmonary function tests (older children)",
              "Swallow study if aspiration suspected",
              "GORD assessment — worsens laryngomalacia",
            ],
          },
          {
            label: "Laryngomalacia-specific",
            steps: [
              "Most resolve by 18–24 months — reassurance for mild cases",
              "Supraglottoplasty if: failure to thrive, apnoea, severe hypoxia, pulmonary hypertension",
              "Treat GORD (omeprazole) — often co-exists",
            ],
          },
          {
            label: "Subglottic haemangioma",
            steps: [
              "Propranolol 1–3 mg/kg/day PO — highly effective (reduces haemangioma size)",
              "Initiate propranolol in hospital (bradycardia/hypoglycaemia risk with first dose)",
              "Laser ablation or tracheostomy if rapidly progressive",
            ],
          },
        ],
        drugs: [
          { name: "Propranolol (subglottic haemangioma)", dose: "Start 0.5 mg/kg/day → titrate to 2–3 mg/kg/day", route: "PO (hospital initiation)" },
          { name: "Omeprazole (GORD with laryngomalacia)", dose: "1 mg/kg/day (max 20 mg)", route: "PO" },
        ],
        source: "F&L 8e ch. 71 · Leaute-Labreze NEJM 2008 (propranolol)",
      },

      "alg-recurrent": {
        kind: "algorithm",
        severity: "amber",
        title: "Recurrent Episodic Stridor — Investigation Plan",
        summary: "Always ask why it is recurring. Structural lesion must be excluded. ENT scoping is the key investigation.",
        phases: [
          {
            label: "Minimum workup",
            steps: [
              "Detailed history: exactly when (age of onset), how often, precipitants, associated URTI, response to treatment",
              "Flexible nasolaryngoscopy (ENT) — all recurrent stridor episodes warrant scoping",
              "CXR / lateral neck X-ray",
              "CT airway / larynx if structural lesion suspected",
              "Allergy assessment if spasmodic croup pattern (atopy, food triggers)",
            ],
          },
          {
            label: "Recurrent croup (>3 episodes)",
            steps: [
              "Most common: spasmodic/allergic croup — rule out structural cause first",
              "Fixed lesion (subglottic stenosis, haemangioma, papillomatosis): microlaryngoscopy in theatre",
              "Laryngeal papillomatosis (HPV): multiple debulking procedures, consider cidofovir injection",
            ],
          },
        ],
        drugs: [],
        source: "F&L 8e ch. 71 · Tintinalli 9e",
      },

      "r-ludwigs": {
        kind: "algorithm",
        severity: "red",
        title: "Ludwig's Angina — Bilateral Submandibular Space Infection",
        summary: "Rapidly progressive, potentially fatal. Odontogenic origin most common. Floor-of-mouth elevation + bilateral neck swelling. Airway emergency.",
        phases: [
          {
            label: "Airway FIRST",
            steps: [
              "Alert anaesthesia + ENT + maxillofacial surgery IMMEDIATELY",
              "Trismus often prevents oral examination — do NOT attempt to examine if distressed",
              "Awake intubation by experienced operator preferred (supraglottic oedema + trismus = extremely difficult airway)",
              "Nasotracheal intubation under topical LA + sedation if trismus prevents oral approach",
              "Surgical airway (tracheostomy) if intubation fails — have surgeon scrubbed",
            ],
          },
          {
            label: "Medical + Surgical",
            steps: [
              "IV antibiotics immediately after blood cultures",
              "CT neck with contrast: extent of spread, gas formation (necrotising), abscess vs cellulitis",
              "Surgical drainage of submandibular space",
              "Dental assessment: source control (tooth extraction) after acute phase",
              "PICU admission — airway can deteriorate rapidly",
            ],
          },
        ],
        drugs: [
          { name: "Piperacillin-Tazobactam", dose: "300 mg/kg/day piperacillin component", route: "IV q6h" },
          { name: "Clindamycin (add for anaerobic/necrotising)", dose: "10 mg/kg", route: "IV q6–8h" },
          { name: "Dexamethasone", dose: "0.6 mg/kg", route: "IV (oedema reduction)" },
        ],
        source: "F&L 8e ch. 73 · Tintinalli 9e ch. 240",
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. STATUS EPILEPTICUS — tiered drug ladder (APLS 2022 / ILAE 2023)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "status-epilepticus",
    title: "Status Epilepticus",
    category: "medical",
    icon: Brain,
    description: "Time-based tiered management. Seizure >5 min = SE. Start treatment, call for help.",
    source: "APLS 6e (2022 algorithm) · ILAE 2023 · AES 2016 · F&L 8e ch. 69",
    start: "confirm",
    nodes: {

      confirm: {
        kind: "question",
        prompt: "Confirm: Is this a generalised tonic-clonic seizure lasting >5 min OR 2 seizures without return to baseline?",
        options: [
          { label: "Yes — confirmed status epilepticus (or high suspicion)", next: "age_se" },
          { label: "Uncertain — possible non-epileptic paroxysmal event or first brief seizure", next: "r-first-seizure" },
          { label: "Neonatal — <4 weeks old", next: "r-neonatal-seizure" },
        ],
      },

      age_se: {
        kind: "question",
        prompt: "Patient's age (guides drug choices and doses)?",
        options: [
          { label: "Neonate (<28 days)", next: "r-neonatal-seizure" },
          { label: "Infant / child (1 month – 18 years)", next: "phase1" },
        ],
      },

      phase1: {
        kind: "question",
        prompt: "Phase 1 (0–10 min) — Is IV/IO access immediately available?",
        options: [
          { label: "No IV/IO — out-of-hospital or ED without access yet", next: "alg-phase1-no-iv" },
          { label: "Yes — IV/IO available", next: "alg-phase1-iv" },
        ],
      },

      "r-first-seizure": {
        kind: "algorithm",
        severity: "amber",
        title: "First / Brief Seizure — Assessment",
        summary: "A single seizure <5 min that has stopped: investigate cause, do not routinely treat. If ongoing >5 min → treat as SE.",
        phases: [
          {
            label: "Assessment",
            steps: [
              "BGL immediately — hypoglycaemia is the most treatable cause",
              "Temperature: febrile seizure? (most common cause in 6 mo–5 yr)",
              "Post-ictal: expect reduced consciousness for minutes–1 hour",
              "Full history: first seizure? Known epilepsy? Medications missed? Trauma? Infection? Metabolic?",
              "Examine: meningism, focal neurology, rash, birth marks (tuberous sclerosis, Sturge-Weber)",
            ],
          },
          {
            label: "Investigations (tailor to clinical picture)",
            steps: [
              "BGL — mandatory for all",
              "Electrolytes (Na, Ca, Mg) — especially infants and if no obvious cause",
              "FBC, CRP + LP if fever without clear source (meningitis)",
              "EEG — not routine in ED for first seizure, but same-day or next-day referral",
              "CT/MRI if: focal seizure, focal neurology, status, age <6 months, suspected structural cause",
              "Toxicology screen if suspected ingestion",
            ],
          },
          {
            label: "Disposition",
            steps: [
              "First febrile seizure, age 6 mo–5 yr, fully recovered, no meningism → discharge with advice",
              "Prolonged (>15 min) or focal → admit",
              "Unknown cause, < 6 months, not back to baseline → admit",
              "Neurology referral for all first afebrile seizures",
            ],
          },
        ],
        drugs: [
          { name: "Glucose 10% (if BGL <3 mmol/L)", dose: "2 mL/kg", route: "IV/IO" },
        ],
        source: "F&L 8e ch. 69 · NICE Epilepsies guideline NG217 2022",
      },

      "r-neonatal-seizure": {
        kind: "algorithm",
        severity: "red",
        title: "Neonatal Seizure (0–28 days)",
        summary: "Neonatal seizures are mostly acute-symptomatic. Priority: BGL, electrolytes, HIE assessment. Drug choices differ from older children.",
        phases: [
          {
            label: "Immediate priorities",
            steps: [
              "BGL: treat if <2.6 mmol/L with glucose 10% 2 mL/kg IV",
              "Calcium: treat if ionised Ca <0.8 mmol/L with 10% calcium gluconate 0.5 mL/kg IV slowly",
              "Pyridoxine 50–100 mg IV (empirical if cause unknown — pyridoxine-dependent epilepsy)",
              "Temperature: target normothermia (unless HIE protocol → therapeutic hypothermia)",
              "Establish IV access",
            ],
          },
          {
            label: "Anti-seizure medications (ILAE Neonatal Seizure Algorithm 2021)",
            steps: [
              "1st: Phenobarbitone 20 mg/kg IV over 10–15 min (most common first-line)",
              "2nd: Phenobarbitone 10 mg/kg top-up if not controlled (max 40 mg/kg total)",
              "3rd: Levetiracetam 40–60 mg/kg IV over 15 min (increasingly used)",
              "4th: Midazolam IV 0.15 mg/kg bolus or infusion 0.1–0.4 mg/kg/hr",
              "5th: Phenytoin/Fosphenytoin 20 mg/kg IV",
              "Pyridoxine empirical trial if refractory and cause unknown",
            ],
          },
          {
            label: "Investigations (parallel to treatment)",
            steps: [
              "Amplitude-integrated EEG (aEEG) or cEEG: gold standard for neonatal seizures",
              "Cranial US, MRI head (MRI >24 h from birth for HIE assessment)",
              "Metabolic screen: ammonia, lactate, amino acids, organic acids, IEM panel",
              "Septic workup + LP (after airway secured if needed)",
              "TORCH serology, thyroid function",
            ],
          },
        ],
        drugs: [
          { name: "Glucose 10%", dose: "2 mL/kg", route: "IV" },
          { name: "Phenobarbitone", dose: "20 mg/kg IV over 10–15 min", route: "IV — max 40 mg/kg total" },
          { name: "Levetiracetam", dose: "40–60 mg/kg IV over 15 min", route: "IV" },
          { name: "Pyridoxine (empirical)", dose: "50–100 mg", route: "IV — have phenobarbitone ready (may cause apnoea)" },
        ],
        source: "CHOP Neonatal SE Pathway · ILAE Neonatal Seizure Guidelines 2021 · Tintinalli 9e",
      },

      "alg-phase1-no-iv": {
        kind: "algorithm",
        severity: "red",
        title: "SE Phase 1 (0–10 min) — No IV Access",
        summary: "Use non-IV routes. Give one drug only. Get IO access simultaneously.",
        phases: [
          {
            label: "Give immediately (choose ONE route):",
            steps: [
              "Buccal midazolam 0.5 mg/kg (max 10 mg) — preferred non-IV first-line (UK/APLS)",
              "OR Intranasal midazolam 0.2 mg/kg (max 10 mg) — use mucosal atomisation device (MAD)",
              "OR Rectal diazepam 0.5 mg/kg (max 10 mg) — if other routes not available",
              "OR IM midazolam 0.2 mg/kg (max 10 mg) — RAMPART trial: as effective as IV lorazepam",
              "Simultaneously: insert IO if IV fails after 90 seconds",
              "If IO placed before drug given → IV route preferred for second dose",
            ],
          },
          {
            label: "Concurrent actions",
            steps: [
              "BGL — treat hypoglycaemia with glucose 10% 2 mL/kg",
              "Temperature (paracetamol suppository if febrile)",
              "O₂ high flow (seizure causes hypoxia)",
              "Call for help / alert anaesthesia if not already",
              "Time all drug doses",
            ],
          },
        ],
        drugs: [
          { name: "Buccal midazolam", dose: "0.5 mg/kg (max 10 mg)", route: "Buccal — between cheek and gum" },
          { name: "IN midazolam", dose: "0.2 mg/kg (max 10 mg)", route: "Intranasal via MAD — split between nostrils" },
          { name: "Rectal diazepam", dose: "0.5 mg/kg (max 10 mg)", route: "PR" },
          { name: "IM midazolam", dose: "0.2 mg/kg (max 10 mg)", route: "IM anterolateral thigh" },
          { name: "Glucose 10% (if BGL <3 mmol/L)", dose: "2 mL/kg", route: "IO" },
        ],
        nextPhase: "alg-phase2",
        source: "APLS 6e 2022 algorithm · Chamberlain RAMPART 2012 · F&L 8e",
      },

      "alg-phase1-iv": {
        kind: "algorithm",
        severity: "red",
        title: "SE Phase 1 (0–10 min) — IV/IO Available",
        summary: "IV lorazepam or midazolam first-line. Faster onset than non-IV routes.",
        phases: [
          {
            label: "Give immediately:",
            steps: [
              "IV lorazepam 0.1 mg/kg (max 4 mg) IV over 2 min — preferred in UK/Australia",
              "OR IV midazolam 0.15 mg/kg (max 10 mg) IV — North America preference",
              "OR IV diazepam 0.3 mg/kg (max 10 mg) slow IV (higher respiratory depression, shorter duration than lorazepam)",
              "Observe 5 min — if seizure continues after 5 min → move to Phase 2",
            ],
          },
          {
            label: "Concurrent actions",
            steps: [
              "BGL + treat hypoglycaemia",
              "O₂ high-flow; airway adjunct if vomiting",
              "Bloods: BGL, lytes, Ca, Mg, FBC, cultures (if febrile), toxicology",
              "Alert senior/anaesthesia if not resolved by 10 min",
            ],
          },
        ],
        drugs: [
          { name: "Lorazepam IV", dose: "0.1 mg/kg (max 4 mg)", route: "IV over 2 min — 1st line IV" },
          { name: "Midazolam IV", dose: "0.15 mg/kg (max 10 mg)", route: "IV — alternative" },
          { name: "Diazepam IV", dose: "0.3 mg/kg (max 10 mg)", route: "IV slow — if only benzo available" },
        ],
        nextPhase: "alg-phase2",
        source: "APLS 6e 2022 · AES SE Guidelines 2016 · F&L 8e ch. 69",
      },

      "alg-phase2": {
        kind: "algorithm",
        severity: "red",
        title: "SE Phase 2 (10–30 min) — Benzodiazepine-Refractory",
        summary: "Seizure continuing >10 min despite benzodiazepine. Second-line anti-seizure medications now. Anaesthesia alert.",
        phases: [
          {
            label: "Choose ONE second-line agent (all equally supported — KONECT 2019):",
            steps: [
              "Levetiracetam 60 mg/kg IV over 5 min (max 4500 mg) — 1st choice: best safety profile",
              "OR Phenytoin 20 mg/kg IV over 20 min (max 1500 mg) — monitor ECG (arrhythmia risk, bradycardia)",
              "OR Fosphenytoin 30 mg/kg PE IV (preferred over phenytoin for IM route)",
              "OR Phenobarbitone 20 mg/kg IV over 10–15 min (max 1000 mg) — if others unavailable",
              "OR Sodium valproate 40 mg/kg IV over 5 min (max 3000 mg) — AVOID in metabolic disease/liver disease",
              "Repeat benzodiazepine is NOT recommended at this stage (high respiratory depression risk)",
            ],
          },
          {
            label: "Concurrent",
            steps: [
              "Anaesthesia + PICU alert NOW if not already done",
              "Establish second IV line",
              "Blood cultures if febrile + empirical antibiotics if meningitis cannot be excluded",
              "CT head if focal onset, head trauma, or no obvious cause",
              "Continue O₂, airway monitoring, BGL checks q15min",
            ],
          },
        ],
        drugs: [
          { name: "Levetiracetam IV", dose: "60 mg/kg IV over 5 min (max 4500 mg)", route: "IV — preferred 2nd line" },
          { name: "Phenytoin IV", dose: "20 mg/kg over 20 min (max 1500 mg)", route: "IV — ECG monitoring mandatory" },
          { name: "Sodium valproate IV", dose: "40 mg/kg over 5 min (max 3000 mg)", route: "IV — avoid if liver disease / metabolic" },
          { name: "Phenobarbitone IV", dose: "20 mg/kg over 10–15 min", route: "IV — may cause apnoea" },
          { name: "Ceftriaxone (if meningitis possible)", dose: "100 mg/kg", route: "IV" },
        ],
        source: "KONECT Trial (Lyttle 2019) · APLS 6e · ILAE 2023 · AES 2016",
      },

      "alg-phase3": {
        kind: "algorithm",
        severity: "red",
        title: "SE Phase 3 (>30 min) — Refractory Status Epilepticus (RSE)",
        summary: "Refractory SE (RSE): seizures continuing >30 min despite 2 drugs. Requires anaesthetic drugs, intubation, continuous EEG. PICU.",
        phases: [
          {
            label: "RSE — Immediate actions",
            steps: [
              "Intubate: RSI with midazolam 0.15 mg/kg + rocuronium 1.2 mg/kg (or ketamine 1–2 mg/kg if haemodynamically unstable)",
              "Continuous EEG monitoring — MANDATORY in intubated RSE (clinical signs masked by paralysis/sedation)",
              "PICU admission",
            ],
          },
          {
            label: "Anaesthetic agents (choose one, titrate to burst-suppression):",
            steps: [
              "Midazolam infusion: 0.1–0.4 mg/kg/hr (titrate to effect, max 2 mg/kg/hr)",
              "Thiopentone infusion: 3–5 mg/kg IV bolus then 1–5 mg/kg/hr",
              "Propofol (caution <16 yr — PRIS risk with prolonged use): 1–5 mg/kg/hr",
              "Target: burst-suppression on cEEG",
              "Continue all oral/enteral anti-seizure medications (NG tube)",
            ],
          },
          {
            label: "Investigations to guide aetiology",
            steps: [
              "Autoimmune encephalitis screen: NMDA-R Ab, LGI1, CASPR2, GABA-B — in all RSE without clear cause",
              "MRI brain (MRI-compatible monitoring)",
              "CSF: cells, protein, glucose, oligoclonal bands, viral PCR, autoimmune antibodies",
              "Metabolic: ammonia, lactate, amino acids, organic acids (IEM in infants/young children)",
              "Febrile-infection-related epilepsy syndrome (FIRES): consider in school-age + preceding febrile illness",
            ],
          },
          {
            label: "Super-refractory SE (>24 h despite anaesthesia)",
            steps: [
              "Ketogenic diet (enteral — requires metabolic dietitian)",
              "Immunotherapy if FIRES or autoimmune: IVIG 2 g/kg + IV methylprednisolone 30 mg/kg",
              "Ketamine infusion (NMDA antagonist): 1–5 mg/kg/hr",
              "Hypothermia (34–35°C) — limited evidence, specialist centres only",
              "Vagal nerve stimulator / responsive neurostimulation (specialist)",
            ],
          },
        ],
        drugs: [
          { name: "Midazolam infusion", dose: "0.1–0.4 mg/kg/hr (max 2 mg/kg/hr)", route: "IV infusion — titrate to burst-suppression" },
          { name: "Thiopentone", dose: "3–5 mg/kg IV, then 1–5 mg/kg/hr", route: "IV infusion" },
          { name: "Ketamine infusion", dose: "1–5 mg/kg/hr", route: "IV" },
          { name: "IVIG (autoimmune/FIRES)", dose: "2 g/kg over 2–5 days", route: "IV" },
          { name: "Methylprednisolone (autoimmune)", dose: "30 mg/kg/day (max 1 g)", route: "IV × 5 days" },
        ],
        source: "Ferlisi & Shorvon Epilepsia 2012 · APLS 6e · AES SE Guidelines 2016 · FIRES guidelines",
      },

      "r-first-seizure-default": {
        kind: "algorithm",
        severity: "emerald",
        title: "Brief First Seizure — Assessment",
        summary: "Single seizure <5 min that has stopped. Do not routinely treat. Find the cause.",
        phases: [{ label: "Assessment", steps: ["BGL mandatory", "Assess for meningism, focal neurology", "Febrile seizure most common in 6 mo–5 yr", "Neurology referral if first afebrile seizure"] }],
        drugs: [],
        source: "NICE NG217 2022 · F&L 8e ch. 69",
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. FEVER IN YOUNG INFANT (expanded from original)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "fever-infant",
    title: "Fever in Young Infant (≤90 days)",
    category: "medical",
    icon: ThermometerHot,
    description: "Step-by-step risk stratification for the febrile neonate and young infant.",
    source: "IAP Febrile Infant Guideline 2023 · F&L 8e ch. 84 · Step-by-Step rule (Mintegi 2019) · PECARN febrile infant rule (Dayan 2019)",
    start: "age",
    nodes: {
      age: {
        kind: "question",
        prompt: "Age of infant?",
        options: [
          { label: "<28 days (neonate)", next: "alg-neonate-fever" },
          { label: "29–60 days", next: "appearance_60" },
          { label: "61–90 days", next: "appearance_90" },
        ],
      },
      appearance_60: {
        kind: "question",
        prompt: "29–60 days — overall appearance?",
        options: [
          { label: "Ill-appearing (lethargic, poor perfusion, apnoea, shock)", next: "alg-ill-infant" },
          { label: "Well-appearing", next: "focus_60" },
        ],
      },
      focus_60: {
        kind: "question",
        prompt: "29–60 days, well-appearing — Is there a clear viral focus?",
        options: [
          { label: "Clear viral focus (RSV bronchiolitis, influenza confirmed)", next: "alg-viral-focus" },
          { label: "No viral focus identified / UTI suspected on dipstick", next: "alg-stepbystep" },
        ],
      },
      appearance_90: {
        kind: "question",
        prompt: "61–90 days — overall appearance?",
        options: [
          { label: "Ill-appearing", next: "alg-ill-infant" },
          { label: "Well-appearing", next: "alg-stepbystep-90" },
        ],
      },

      "alg-neonate-fever": {
        kind: "algorithm",
        severity: "red",
        title: "Febrile Neonate (<28 days) — Full Evaluation + Admit",
        summary: "All febrile neonates require full septic evaluation, admission, and empirical antibiotics regardless of appearance. HSV must be considered.",
        phases: [
          {
            label: "Full workup (all neonates)",
            steps: [
              "Blood culture × 2",
              "FBC + differential + CRP + procalcitonin",
              "Urine culture (catheter or suprapubic aspiration — NOT bag specimen)",
              "Lumbar puncture: cell count, protein, glucose, culture, Gram stain, HSV PCR",
              "CXR if any respiratory signs",
              "HSV workup if: skin/mucous membrane vesicles, seizures, CSF pleocytosis, elevated ALT, maternal HSV, age <21 days",
            ],
          },
          {
            label: "Empirical antibiotics (within 1 hour)",
            steps: [
              "Cover: GBS, E. coli, Listeria monocytogenes, HSV",
              "Ampicillin + Gentamicin (standard) — cover Listeria (cephalosporins do NOT cover Listeria)",
              "OR Ampicillin + Cefotaxime (CSF penetration if meningitis likely)",
              "Add Acyclovir if HSV features present",
              "Minimum admission 48 h (until cultures final)",
            ],
          },
        ],
        drugs: [
          { name: "Ampicillin", dose: "50 mg/kg", route: "IV q6h (<7 days old: q12h)" },
          { name: "Gentamicin", dose: "4–5 mg/kg", route: "IV q24–36h (per weight/GA — level monitoring)" },
          { name: "Cefotaxime (meningitis dose)", dose: "50 mg/kg", route: "IV q6h" },
          { name: "Acyclovir (if HSV suspected)", dose: "20 mg/kg", route: "IV q8h — do not delay for culture" },
        ],
        source: "F&L 8e ch. 84 · AAP Febrile Infant CPG 2021 · IAP Guideline 2023",
      },

      "alg-ill-infant": {
        kind: "algorithm",
        severity: "red",
        title: "Ill-Appearing Febrile Infant — Resuscitate + Full Workup",
        summary: "Ill appearance at any age <90 days = septic until proven otherwise. Resuscitate first, then investigate.",
        phases: [
          {
            label: "Resuscitation",
            steps: [
              "ABCDE assessment + high-flow O₂",
              "IV/IO access — fluid bolus 10–20 mL/kg NS",
              "BGL — treat hypoglycaemia",
              "Blood culture before antibiotics (≤5 min delay acceptable)",
            ],
          },
          {
            label: "Workup + antibiotics (within 1 hour)",
            steps: [
              "Full septic screen: blood culture, FBC, CRP, PCT, urine culture, LP if stable",
              "LP: defer if haemodynamically unstable — give antibiotics first",
              "CXR",
              "IV antibiotics immediately after blood cultures",
              "Meningitis dose ceftriaxone + cover for neonates if <3 months (add ampicillin)",
              "Consider PICU transfer",
            ],
          },
        ],
        drugs: [
          { name: "Ceftriaxone (meningitis dose)", dose: "100 mg/kg (max 4 g)", route: "IV" },
          { name: "Ampicillin (if <3 months, cover Listeria)", dose: "50 mg/kg", route: "IV q6h" },
          { name: "Vancomycin (if MRSA risk)", dose: "15 mg/kg", route: "IV q6h" },
          { name: "Acyclovir (if HSV features)", dose: "20 mg/kg", route: "IV q8h" },
        ],
        source: "F&L 8e ch. 84 · IAP 2023",
      },

      "alg-viral-focus": {
        kind: "algorithm",
        severity: "amber",
        title: "Well Febrile Infant with Clear Viral Focus",
        summary: "RSV/influenza-confirmed reduces IBI risk but does not exclude UTI (co-infection ~1–3%). Tailored approach.",
        phases: [
          {
            label: "Minimum workup",
            steps: [
              "Urine dipstick + culture — UTI co-exists with viral illness",
              "CRP + FBC if any doubt",
              "Reassess in 8–12 h (or sooner if deteriorates)",
            ],
          },
          {
            label: "Management",
            steps: [
              "Supportive care: antipyretics, hydration, oxygen if SpO₂ <92%",
              "Admit if: age ≤60 days + viral focus (higher risk period), feeding <50%, hypoxia, social concerns",
              "HFNC/CPAP if increased work of breathing (bronchiolitis)",
              "No antibiotics unless UTI confirmed or CRP/PCT elevated",
            ],
          },
        ],
        drugs: [
          { name: "Paracetamol", dose: "15 mg/kg", route: "PO q4–6h" },
        ],
        source: "F&L 8e ch. 84 · Gomez NEJM 2016 · IAP 2023",
      },

      "alg-stepbystep": {
        kind: "algorithm",
        severity: "amber",
        title: "Step-by-Step Rule — 29–60 Days, Well-Appearing",
        summary: "Validates low risk: well-appearance + urinalysis negative + PCT <0.5 + CRP <20 + ANC <10,000 = observe without antibiotics.",
        phases: [
          {
            label: "Apply Step-by-Step criteria",
            steps: [
              "Step 1: Well-appearing — YES → continue",
              "Step 2: Urine dipstick/micro NEGATIVE — YES → continue",
              "Step 3: PCT <0.5 ng/mL — YES → continue",
              "Step 4: CRP <20 mg/L — YES → continue",
              "Step 5: ANC <10,000/μL — YES → LOW RISK",
              "Any criterion fails → HIGH RISK → LP + empirical antibiotics + admit",
            ],
          },
          {
            label: "Low-risk management",
            steps: [
              "Observe 8–24 h (admit for observation OR close follow-up at 12–24 h)",
              "Blood culture × 1",
              "Urine culture",
              "No antibiotics unless cultures positive",
              "Return precautions: appears unwell, not feeding, worse",
            ],
          },
        ],
        drugs: [
          { name: "Ceftriaxone (if treating)", dose: "50 mg/kg", route: "IV" },
        ],
        source: "Step-by-Step Rule (Mintegi JAMA Ped 2019) · PECARN Febrile Infant (Dayan NEJM 2019) · F&L 8e ch. 84",
      },

      "alg-stepbystep-90": {
        kind: "algorithm",
        severity: "emerald",
        title: "61–90 Days, Well-Appearing Febrile Infant",
        summary: "Lower IBI risk than 29–60 days. Low-risk criteria can stratify to outpatient management with close follow-up.",
        phases: [
          {
            label: "Assessment",
            steps: [
              "Urine dipstick + culture — UTI most common IBI in this age group",
              "CRP + PCT if available",
              "Blood culture if any concern or PCT elevated",
              "LP: selectively — well-appearing, normal UA, low CRP → LP may be deferred if close follow-up guaranteed",
            ],
          },
          {
            label: "Management",
            steps: [
              "If meets low-risk criteria: discharge with close follow-up within 12–24 h",
              "Antipyretics, hydration advice",
              "Return precautions (written)",
              "No antibiotics unless UA positive or PCT elevated",
            ],
          },
        ],
        drugs: [
          { name: "Paracetamol", dose: "15 mg/kg", route: "PO q4–6h" },
        ],
        source: "F&L 8e ch. 84 · IAP Febrile Infant Guideline 2023",
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. WHEEZE / LOWER AIRWAY — differential + algorithms
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "wheeze",
    title: "Wheeze & Lower Airway Obstruction",
    category: "medical",
    icon: Wind,
    description: "Age-based wheeze differential with management algorithms for each diagnosis.",
    source: "F&L 8e ch. 72–73 · GINA 2023 · SIGN 158 · IAP Asthma Guidelines 2024 · NICE NG80",
    start: "age_wheeze",
    nodes: {
      age_wheeze: {
        kind: "question",
        prompt: "Age of child?",
        options: [
          { label: "<2 years — infant", next: "infant_wheeze" },
          { label: "2–5 years — preschool", next: "preschool_wheeze" },
          { label: ">5 years — school age / adolescent", next: "school_wheeze" },
        ],
      },

      infant_wheeze: {
        kind: "question",
        prompt: "Infant wheeze — clinical pattern?",
        options: [
          { label: "URTI prodrome, coryzal, crackles + wheeze, winter/early spring, first or second episode", next: "alg-bronchiolitis" },
          { label: "Sudden onset, unilateral wheeze, choking episode", next: "alg-fb-lower" },
          { label: "Recurrent wheeze with atopic features (eczema, family history)", next: "alg-preschool-wheeze" },
          { label: "Failure to thrive + recurrent lower respiratory infections", next: "r-cf-workup" },
        ],
      },

      preschool_wheeze: {
        kind: "question",
        prompt: "Preschool wheeze (2–5 yr) — trigger pattern?",
        options: [
          { label: "Only with viral URTI (no symptoms between)", next: "alg-episodic-viral" },
          { label: "Multiple triggers (cold, exercise, allergens) + interval symptoms", next: "alg-preschool-wheeze" },
          { label: "Sudden onset, playing with small toys/eating", next: "alg-fb-lower" },
          { label: "Chronic productive cough + wheeze, recurrent infections, not responding to bronchodilators", next: "r-chronic-workup" },
        ],
      },

      school_wheeze: {
        kind: "question",
        prompt: "School-age wheeze — severity?",
        options: [
          { label: "Known asthma — acute exacerbation", next: "asthma_severity" },
          { label: "First presentation — no previous diagnosis", next: "first_asthma" },
          { label: "Exercise-only wheeze", next: "alg-eia" },
          { label: "Wheeze not responding to salbutamol + unusual features", next: "r-not-asthma" },
        ],
      },

      first_asthma: {
        kind: "question",
        prompt: "First wheeze in school-age child — consider non-asthma causes?",
        options: [
          { label: "Responds well to salbutamol, no concerning features → probable asthma", next: "asthma_severity" },
          { label: "Monophonic wheeze, asymmetric, or does NOT respond to salbutamol", next: "alg-fb-lower" },
          { label: "Chronic productive cough, digital clubbing, failure to thrive", next: "r-cf-workup" },
          { label: "Cardiac history, bilateral fine crackles, hepatomegaly", next: "r-cardiac-wheeze" },
        ],
      },

      asthma_severity: {
        kind: "question",
        prompt: "Asthma severity — PRAM or clinical assessment?",
        options: [
          { label: "Mild (PRAM 0–3): talks in sentences, SpO₂ ≥95%, mild wheeze", next: "alg-asthma-mild" },
          { label: "Moderate (PRAM 4–7): short sentences, SpO₂ 92–95%, moderate wheeze/retractions", next: "alg-asthma-mod" },
          { label: "Severe (PRAM 8–12): words only / silent chest, SpO₂ <92%, severe retractions", next: "alg-asthma-severe" },
          { label: "Near-fatal / life-threatening: cyanosis, unable to speak, bradycardia, confusion", next: "alg-asthma-lifethreat" },
        ],
      },

      "alg-bronchiolitis": {
        kind: "algorithm",
        severity: "amber",
        title: "Viral Bronchiolitis (RSV)",
        summary: "Supportive care is the mainstay. No bronchodilators, steroids, or antibiotics routinely.",
        phases: [
          {
            label: "Assessment — severity classification",
            steps: [
              "Mild: SpO₂ ≥95%, normal feeding (>75% of usual), RR normal, no/minimal retractions",
              "Moderate: SpO₂ 90–94%, feeding 50–75% of usual, RR elevated, moderate retractions",
              "Severe: SpO₂ <90%, feeding <50%, marked retractions, grunting, apnoeic episodes",
            ],
          },
          {
            label: "Management",
            steps: [
              "Nasal suction (bulb suction for mild home; nasopharyngeal for hospital) — most benefit in infants",
              "O₂ to maintain SpO₂ ≥92% (target ≥94% in high-risk: CHD, CLD, prematurity)",
              "Feeding support: nasogastric feeds if <50% of usual intake or work of breathing prevents safe feeds",
              "HFNC for moderate–severe — RCT evidence for work-of-breathing reduction (RCT Reduce 2019)",
              "CPAP/intubation for respiratory failure",
              "DO NOT routinely give: salbutamol, ipratropium, nebulised hypertonic saline, ribavirin, steroids, antibiotics",
            ],
          },
          {
            label: "Admission criteria",
            steps: [
              "SpO₂ <92% on room air, or ≥94% if high-risk",
              "Apnoea (any)",
              "Feeding <50% of usual",
              "Age <6 weeks",
              "Prematurity <34 weeks",
              "Parental inability to cope / social concerns",
            ],
          },
        ],
        drugs: [],
        source: "F&L 8e ch. 73 · SIGN 158 2023 · Ricci NEJM 2020 · Reduce Trial",
      },

      "alg-asthma-mild": {
        kind: "algorithm",
        severity: "emerald",
        title: "Mild Acute Asthma (PRAM 0–3)",
        summary: "Salbutamol + single-dose steroid. Likely discharge after 1–2 h observation.",
        phases: [
          {
            label: "Treatment",
            steps: [
              "Salbutamol MDI + spacer 4–10 puffs (1 puff/kg max 10) q20min × 3 doses",
              "Or nebulised salbutamol 2.5 mg (<25 kg) / 5 mg (>25 kg) q20min × 3 doses",
              "Single dose oral prednisolone 1 mg/kg (max 40 mg)",
              "O₂ only if SpO₂ <94% (O₂ drives away salbutamol from small airways if excessive)",
            ],
          },
          {
            label: "Observe 1 h post-treatment",
            steps: [
              "Reassess PRAM + SpO₂",
              "Discharge if: SpO₂ ≥95%, PRAM ≤3, tolerating oral, reliable caregiver",
              "Discharge: salbutamol 4–6 puffs q4h PRN × 3–5 days, complete prednisolone × 3 days",
              "GP / asthma nurse follow-up within 48 h",
              "Written asthma action plan",
            ],
          },
        ],
        drugs: [
          { name: "Salbutamol MDI + spacer", dose: "1 puff/kg (max 10 puffs)", route: "Inhaled q20min × 3" },
          { name: "Prednisolone", dose: "1 mg/kg (max 40 mg)", route: "PO × 3 days" },
        ],
        source: "GINA 2023 · IAP Asthma Guidelines 2024 · F&L 8e ch. 72",
      },

      "alg-asthma-mod": {
        kind: "algorithm",
        severity: "amber",
        title: "Moderate Acute Asthma (PRAM 4–7)",
        summary: "Back-to-back salbutamol + ipratropium × 3 + steroids. Likely admission.",
        phases: [
          {
            label: "Acute treatment (first hour)",
            steps: [
              "High-flow O₂ to SpO₂ ≥94%",
              "Salbutamol neb 2.5 mg (<25 kg) / 5 mg (>25 kg) q20min × 3",
              "Ipratropium neb 250 mcg (<25 kg) / 500 mcg (>25 kg) — add to salbutamol for first 3 nebulisations only",
              "Systemic steroid: prednisolone 1 mg/kg PO (max 40 mg) OR hydrocortisone 4 mg/kg IV if vomiting",
              "Reassess after each nebulisation",
            ],
          },
          {
            label: "If improving (PRAM falls to ≤3 by 1 h)",
            steps: [
              "Continue salbutamol q2–4h",
              "Consider discharge vs short admission (observe 2–4 h for relapse)",
              "Complete prednisolone course × 3–5 days",
            ],
          },
          {
            label: "If not improving / worsening",
            steps: [
              "IV magnesium sulphate 50 mg/kg (max 2 g) over 20 min",
              "Alert PICU / senior",
              "Escalate to severe asthma pathway",
            ],
          },
        ],
        drugs: [
          { name: "Salbutamol neb", dose: "2.5 mg (<25 kg) / 5 mg (>25 kg)", route: "Neb q20min × 3" },
          { name: "Ipratropium neb", dose: "250 mcg (<25 kg) / 500 mcg (>25 kg)", route: "Neb — first 3 nebulisations only" },
          { name: "Prednisolone", dose: "1 mg/kg (max 40 mg)", route: "PO × 3–5 days" },
          { name: "Hydrocortisone (if vomiting)", dose: "4 mg/kg (max 200 mg)", route: "IV q6h" },
          { name: "Magnesium sulphate (if inadequate response)", dose: "50 mg/kg (max 2 g)", route: "IV over 20 min" },
        ],
        source: "GINA 2023 · SIGN 158 · IAP 2024 · F&L 8e ch. 72",
      },

      "alg-asthma-severe": {
        kind: "algorithm",
        severity: "red",
        title: "Severe Acute Asthma (PRAM 8–12)",
        summary: "Continuous salbutamol + MgSO₄. PICU alert. Prepare for IV therapy or intubation.",
        phases: [
          {
            label: "Immediate",
            steps: [
              "PICU alert NOW",
              "Continuous nebulised salbutamol (not q20min — continuous neb via nebuliser)",
              "High-flow O₂ to SpO₂ ≥94%",
              "IV hydrocortisone 4 mg/kg (max 200 mg) — PO absorption unreliable in severe asthma",
              "IV magnesium sulphate 50 mg/kg (max 2 g) over 20 min — single dose, early",
              "IV access mandatory",
            ],
          },
          {
            label: "If not improving in 30–60 min",
            steps: [
              "IV salbutamol: 15 mcg/kg over 10 min loading dose, then 1–5 mcg/kg/min infusion",
              "IV aminophylline: 5 mg/kg loading over 20 min (if not on theophylline), then 1 mg/kg/hr infusion",
              "CXR: exclude pneumothorax (rare but occurs with severe asthma)",
              "ABG: rising PaCO₂ (>45 mmHg) = impending respiratory failure",
              "Consider HFNC or CPAP (keep child calm — avoid intubation if possible)",
            ],
          },
          {
            label: "Intubation (last resort)",
            steps: [
              "Ketamine RSI preferred (bronchodilator + sedative): 1–2 mg/kg IV + rocuronium 1.2 mg/kg",
              "Aim: low rate + long expiratory time (prevent air trapping / auto-PEEP)",
              "Start with RR lower than normal for age, I:E ratio 1:3–1:4",
              "Expect haemodynamic instability post-intubation (preload reduction from PEEP)",
            ],
          },
        ],
        drugs: [
          { name: "Continuous salbutamol neb", dose: "0.5 mg/kg/hr (max 5 mg/hr)", route: "Continuous neb" },
          { name: "Hydrocortisone", dose: "4 mg/kg (max 200 mg)", route: "IV q6h" },
          { name: "Magnesium sulphate", dose: "50 mg/kg (max 2 g)", route: "IV over 20 min — ONCE" },
          { name: "IV salbutamol", dose: "15 mcg/kg over 10 min, then 1–5 mcg/kg/min", route: "IV infusion" },
          { name: "Aminophylline (specialist use)", dose: "5 mg/kg load over 20 min → 1 mg/kg/hr", route: "IV" },
          { name: "Ketamine (RSI)", dose: "1–2 mg/kg", route: "IV" },
        ],
        source: "GINA 2023 · SIGN 158 · Rodrigo & Rodrigo meta-analysis · F&L 8e ch. 72",
      },

      "alg-asthma-lifethreat": {
        kind: "algorithm",
        severity: "red",
        title: "Life-Threatening / Near-Fatal Asthma",
        summary: "Silent chest, cyanosis, bradycardia, confusion. Immediate PICU + resuscitation.",
        phases: [
          {
            label: "Immediate",
            steps: [
              "Call PICU + anaesthesia + senior simultaneously",
              "100% O₂",
              "IM adrenaline 10 mcg/kg (0.01 mg/kg of 1:1000) if shocked / imminent arrest — bridge to IV",
              "IV magnesium sulphate 50 mg/kg immediately",
              "IV hydrocortisone 4 mg/kg",
              "Prepare for RSI: ketamine 1–2 mg/kg IV + rocuronium 1.2 mg/kg",
            ],
          },
          {
            label: "If cardiac arrest (asphyxial arrest)",
            steps: [
              "Standard CPR 15:2",
              "After intubation: disconnect from bag-mask q10–15 sec (allow passive exhalation to release air trapping)",
              "Bilateral needle decompression if concerned about tension pneumothorax",
              "Adrenaline per arrest protocol",
            ],
          },
        ],
        drugs: [
          { name: "Adrenaline IM", dose: "0.01 mg/kg (max 0.5 mg) 1:1000", route: "IM — bridge to IV" },
          { name: "Magnesium sulphate IV", dose: "50 mg/kg (max 2 g)", route: "IV immediately" },
          { name: "Ketamine IV (RSI)", dose: "1–2 mg/kg", route: "IV" },
        ],
        source: "GINA 2023 · BTS Asthma Guideline · APLS 6e",
      },

      "alg-fb-lower": {
        kind: "algorithm",
        severity: "red",
        title: "Foreign Body — Lower Airway",
        summary: "Sudden choking, unilateral wheeze, decreased breath sounds, asymmetric CXR. Rigid bronchoscopy is definitive.",
        phases: [
          {
            label: "Assessment",
            steps: [
              "CXR: may show air trapping (hyperinflation), mediastinal shift, atelectasis, or radio-opaque FB",
              "Inspiratory + expiratory CXR or decubitus films (air trapping on affected side)",
              "CT chest if CXR inconclusive (sensitivity for radio-lucent FB)",
              "Bronchoscopy is both diagnostic and therapeutic",
              "Do NOT perform bronchodilators expecting improvement — may delay diagnosis",
            ],
          },
          {
            label: "Management",
            steps: [
              "Rigid bronchoscopy in theatre (definitive)",
              "Keep child calm — do NOT perform Heimlich if breathing adequately",
              "NPO, IV access, anaesthesia team",
              "If complete obstruction → FBAO protocol (back blows / CPR)",
              "Post-bronchoscopy: observe for oedema, re-expansion pneumonia, antibiotic cover if aspiration",
            ],
          },
        ],
        drugs: [
          { name: "Dexamethasone (post-bronchoscopy oedema)", dose: "0.15 mg/kg", route: "IV" },
        ],
        source: "F&L 8e ch. 71 · Tintinalli 9e · APLS 6e",
      },

      "alg-episodic-viral": {
        kind: "algorithm",
        severity: "emerald",
        title: "Episodic Viral Wheeze (Preschool)",
        summary: "Wheeze only with URTI. No symptoms between. Most outgrow by school age. Intermittent salbutamol.",
        phases: [
          {
            label: "Acute episode management",
            steps: [
              "Salbutamol MDI + spacer — trial during wheeze",
              "If responds: use salbutamol PRN during URTI episodes (q4h during episode, discontinue when well)",
              "Short course prednisolone only if moderate–severe episode (evidence weak in this phenotype)",
              "Montelukast: reduces episode severity if started at URTI onset — reasonable in recurrent cases",
            ],
          },
          {
            label: "Long-term",
            steps: [
              "Do NOT start regular ICS for this phenotype — no evidence of benefit (PEAK trial)",
              "Reassure: majority outgrow episodic viral wheeze by 5–6 years",
              "Refer to paediatric respiratory if: >3 episodes/year, hospital admission, suspected asthma phenotype",
            ],
          },
        ],
        drugs: [
          { name: "Salbutamol MDI + spacer (trial)", dose: "4–6 puffs", route: "Inhaled via spacer — q4–6h during episode" },
          { name: "Prednisolone (moderate–severe)", dose: "1 mg/kg (max 20 mg)", route: "PO × 3 days" },
          { name: "Montelukast (preventive during URTI)", dose: "4 mg (<5 yr) / 5 mg (5–11 yr)", route: "PO nocte at URTI onset" },
        ],
        source: "SIGN 158 2023 · PEAK Trial · F&L 8e ch. 72",
      },

      "alg-preschool-wheeze": {
        kind: "algorithm",
        severity: "amber",
        title: "Multiple-Trigger Wheeze / Early Asthma (Preschool)",
        summary: "Symptoms between infections + multiple triggers + atopy. May be early asthma phenotype. Trial of ICS.",
        phases: [
          {
            label: "Assessment for ICS trial",
            steps: [
              "Document triggers: URTI + exercise + cold + allergens + smoke",
              "Atopic features: eczema, rhinitis, food allergy, family history",
              "Document frequency + severity + impact on sleep/activity",
              "If ≥3 episodes/year or significant morbidity → trial of low-dose ICS",
            ],
          },
          {
            label: "Management",
            steps: [
              "Low-dose ICS × 8–12 weeks: reassess response (if marked improvement → confirms asthma phenotype)",
              "Salbutamol reliever PRN",
              "Allergen avoidance (house dust mite, pet dander, tobacco smoke)",
              "Paediatric respiratory referral if: poor response to ICS, diagnosis uncertain, severe episodes",
              "Montelukast as alternative to ICS in this age group (less effective, fewer side effects)",
            ],
          },
        ],
        drugs: [
          { name: "Fluticasone propionate (low-dose ICS)", dose: "50 mcg per actuation × 2 puffs BD", route: "MDI + spacer" },
          { name: "Beclomethasone (low-dose ICS)", dose: "50 mcg per actuation × 2 puffs BD", route: "MDI + spacer" },
          { name: "Montelukast (alternative)", dose: "4 mg (<5 yr) / 5 mg (5–11 yr)", route: "PO nocte" },
        ],
        source: "GINA 2023 · SIGN 158 · IAP Asthma 2024 · F&L 8e",
      },

      "alg-eia": {
        kind: "algorithm",
        severity: "emerald",
        title: "Exercise-Induced Asthma (EIA)",
        summary: "Wheeze/cough exclusively with exercise. Usually well between. Confirm diagnosis — consider VCD if post-exercise or inspiratory.",
        phases: [
          {
            label: "Confirm diagnosis",
            steps: [
              "History: onset during or 5–15 min after exercise? (not immediately = more likely VCD)",
              "Consider exercise challenge test if diagnosis uncertain",
              "Spirometry pre/post bronchodilator — may be normal between attacks",
              "Exclude VCD (vocal cord dysfunction): inspiratory stridor, improves with speech therapy)",
            ],
          },
          {
            label: "Management",
            steps: [
              "Pre-exercise salbutamol 2–4 puffs 15 min before (first-line EIA)",
              "If also requiring regular reliever → add regular ICS",
              "Warm-up before exercise (10–15 min moderate exercise reduces EIA by 50%)",
              "Mask or scarf in cold weather",
              "Montelukast effective specifically for EIA",
            ],
          },
        ],
        drugs: [
          { name: "Salbutamol (pre-exercise)", dose: "2–4 puffs MDI + spacer", route: "Inhaled 15 min before exercise" },
          { name: "Montelukast (EIA-specific)", dose: "5 mg (5–11 yr) / 10 mg (>12 yr)", route: "PO nocte" },
        ],
        source: "GINA 2023 · F&L 8e ch. 72",
      },

      "r-cf-workup": {
        kind: "algorithm",
        severity: "amber",
        title: "Cystic Fibrosis — Suspect & Workup",
        summary: "Recurrent lower respiratory infections + failure to thrive + steatorrhoea + digital clubbing. Sweat chloride is the gold standard.",
        phases: [
          {
            label: "Investigations",
            steps: [
              "Sweat chloride test (pilocarpine iontophoresis): >60 mmol/L = positive, 40–60 = borderline",
              "CFTR gene mutation panel (2–3 mutation panels cover >95% of mutations)",
              "Sputum/cough swab MC+S: common organisms — Staphylococcus aureus, Pseudomonas aeruginosa, Haemophilus",
              "CXR: hyperinflation, bronchiectasis (later), mucus plugging",
              "Faecal elastase (exocrine pancreatic insufficiency in 85–90% CF)",
              "Lung function (spirometry) from age 5–6 years",
            ],
          },
          {
            label: "Refer",
            steps: [
              "Paediatric respiratory + CF clinic immediately",
              "Dietitian: high-calorie diet, fat-soluble vitamins, pancreatic enzyme replacement",
              "Physiotherapy: airway clearance techniques daily",
              "CFTR modulator therapy (elexacaftor/tezacaftor/ivacaftor) — eligible from age 2 yr",
            ],
          },
        ],
        drugs: [],
        source: "F&L 8e · CFF Care Guidelines 2023",
      },

      "r-not-asthma": {
        kind: "algorithm",
        severity: "amber",
        title: "Wheeze NOT responding to salbutamol — Consider alternatives",
        summary: "Unilateral, monophonic, fixed wheeze unresponsive to bronchodilators demands alternative diagnosis.",
        phases: [
          {
            label: "Differential diagnoses",
            steps: [
              "Foreign body: unilateral wheeze, sudden onset, monophonic — bronchoscopy",
              "Vocal cord dysfunction (VCD): inspiratory, young athlete, post-exercise, responds to speech therapy",
              "Vascular ring: biphasic stridor + wheeze, improves in specific position, diagnosis on CT/MRI chest",
              "Cardiac wheeze: fine bilateral crackles, hepatomegaly, cardiomegaly on CXR",
              "Tracheomalacia: expiratory wheeze, barky cough, associated oesophageal atresia",
              "Endobronchial lesion (tumour, lymph node compression): progressive, no viral trigger, CT + bronchoscopy",
            ],
          },
        ],
        drugs: [],
        source: "F&L 8e · Tintinalli 9e",
      },

      "r-cardiac-wheeze": {
        kind: "algorithm",
        severity: "red",
        title: "Cardiac Cause of Wheeze — Cardiac Failure",
        summary: "Pulmonary oedema from left heart failure can present as wheeze. Hepatomegaly + gallop rhythm + cardiomegaly = cardiac emergency.",
        phases: [
          {
            label: "Acute management",
            steps: [
              "High-flow O₂ / CPAP",
              "Diuresis: furosemide 1 mg/kg IV",
              "CXR: cardiomegaly, pulmonary venous congestion, pleural effusions",
              "ECG: arrhythmia, LVH, myocarditis pattern (ST changes, low voltage)",
              "Urgent cardiology + echo",
              "Restrict IV fluids — do NOT give boluses",
            ],
          },
        ],
        drugs: [
          { name: "Furosemide", dose: "1 mg/kg (max 40 mg)", route: "IV" },
        ],
        source: "F&L 8e · APLS 6e",
      },

      "r-chronic-workup": {
        kind: "algorithm",
        severity: "amber",
        title: "Chronic / Persistent Wheeze — Specialist Referral",
        summary: "Productive cough, recurrent infections, poor bronchodilator response → structured workup for bronchiectasis, CF, PCD, PIBI.",
        phases: [
          {
            label: "Investigations",
            steps: [
              "Sweat chloride + CFTR mutation (CF)",
              "Nasal brush biopsy for ciliary beat frequency (PCD — primary ciliary dyskinesia)",
              "High-resolution CT chest (bronchiectasis, air trapping)",
              "Spirometry with bronchodilator reversibility",
              "Immunology: immunoglobulin levels, specific antibody responses (CVID)",
              "Sputum MC+S",
            ],
          },
          {
            label: "Referral",
            steps: [
              "Paediatric respiratory specialist",
              "Physiotherapy: regular airway clearance",
              "Dietitian if failure to thrive",
            ],
          },
        ],
        drugs: [],
        source: "F&L 8e ch. 73 · APLS 6e",
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. ACUTE ABDOMEN (preserved + expanded)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "acute-abdomen",
    title: "Acute Abdominal Pain (Surgical)",
    category: "surgical",
    icon: Siren,
    description: "Age-based surgical abdominal pathways from intussusception to appendicitis.",
    source: "F&L 8e ch. 48 · Tintinalli 9e ch. 121 · Harriet Lane 23e ch. 12",
    start: "age",
    nodes: {
      age: {
        kind: "question",
        prompt: "Age group?",
        options: [
          { label: "Infant <2 yr", next: "q-infant" },
          { label: "Child 2–10 yr", next: "q-child" },
          { label: "Adolescent >10 yr", next: "q-adolescent" },
        ],
      },
      "q-infant": {
        kind: "question",
        prompt: "Infant — key features?",
        options: [
          { label: "Episodic inconsolable cry + vomiting + currant-jelly stool / sausage mass", next: "alg-intuss" },
          { label: "Projectile non-bilious vomiting, hungry after, male 2–8 wk", next: "alg-pyloric" },
          { label: "Bilious vomiting (any age)", next: "alg-malrot" },
          { label: "Incarcerated groin / scrotal swelling", next: "alg-hernia" },
        ],
      },
      "q-child": {
        kind: "question",
        prompt: "Child 2–10 yr — presentation?",
        options: [
          { label: "Peri-umbilical → RLQ, anorexia, fever, guarding", next: "alg-appendix" },
          { label: "Bilious vomiting + distension + crampy pain", next: "alg-obstruction" },
          { label: "Sudden scrotal pain + swelling (boys)", next: "alg-torsion" },
          { label: "Palpable purpura + colicky pain + joint pain", next: "alg-hsp" },
        ],
      },
      "q-adolescent": {
        kind: "question",
        prompt: "Adolescent features?",
        options: [
          { label: "RLQ pain, anorexia, peritoneal signs", next: "alg-appendix" },
          { label: "Sudden testicular pain (boys)", next: "alg-torsion" },
          { label: "Sudden pelvic pain ± amenorrhoea (girls)", next: "alg-ovarian" },
          { label: "Haematemesis / melaena", next: "alg-gi-bleed" },
        ],
      },

      "alg-intuss": {
        kind: "algorithm", severity: "red",
        title: "Intussusception",
        summary: "Peak 5–9 months. Delay = bowel ischaemia. Air enema is first-line reduction.",
        phases: [
          { label: "Resuscitation", steps: ["IV access, NPO, IV fluid bolus 20 mL/kg if shocked", "NG decompression if distended", "Blood cultures + FBC + U&E"] },
          { label: "Imaging + Reduction", steps: ["Urgent abdominal US: target / pseudo-kidney sign (confirms diagnosis)", "Call paediatric surgery (for standby)", "Pneumatic (air) enema reduction: 80–120 mmHg air — success 80–90%", "Hydrostatic (saline) enema: alternative to air enema", "Contraindications to enema: free peritoneal air, haemodynamic instability, peritonitis"] },
          { label: "If enema fails or contraindicated", steps: ["Operative reduction (laparoscopic or open)", "Broad-spectrum antibiotics pre-operatively", "Look for pathological lead point (Meckel's, lymphoma) in >5 yr or recurrent"] },
        ],
        drugs: [
          { name: "IV fluid bolus", dose: "20 mL/kg", route: "NS IV" },
          { name: "Ceftriaxone + Metronidazole (if perforation)", dose: "50 + 10 mg/kg", route: "IV" },
          { name: "Morphine", dose: "0.1 mg/kg", route: "IV PRN" },
        ],
        source: "F&L 8e ch. 48 · APLS 6e",
      },

      "alg-pyloric": {
        kind: "algorithm", severity: "amber",
        title: "Hypertrophic Pyloric Stenosis",
        summary: "Correct electrolytes BEFORE surgery. HCO₃ target <30 before GA.",
        phases: [
          { label: "Diagnosis", steps: ["US: pyloric muscle thickness >3 mm + length >15 mm", "Electrolytes: hypoNa, hypoK, hypochloraemia, metabolic alkalosis", "BGL: hypoglycaemia common"] },
          { label: "Resuscitation (pre-operative)", steps: ["NPO + NG decompression", "NS bolus if dehydrated", "Maintenance: D5 0.45%NaCl + 20 mEq/L KCl (add K once voiding confirmed)", "Target: Cl >95, HCO₃ <30, K >3.5 before surgery", "Typical correction time: 12–48 h"] },
          { label: "Surgery", steps: ["Ramstedt pyloromyotomy — laparoscopic preferred", "Post-op: start feeds 4–6 h post-op", "Spitting/vomiting post-op expected for 24–48 h"] },
        ],
        drugs: [{ name: "Maintenance fluid", dose: "D5 0.45%NaCl + 20 mEq/L KCl", route: "IV at 1.0–1.5× maintenance" }],
        source: "F&L 8e ch. 48 · Tintinalli 9e",
      },

      "alg-malrot": {
        kind: "algorithm", severity: "red",
        title: "Malrotation / Volvulus — SURGICAL EMERGENCY",
        summary: "Bilious vomiting = surgical emergency until proven otherwise. Minutes matter for gut viability.",
        phases: [
          { label: "Immediate", steps: ["Call paediatric surgery NOW — do not delay for imaging if shocked", "NPO + large-bore NG decompression", "IV access + fluid resuscitation"] },
          { label: "Imaging (if haemodynamically stable)", steps: ["Upper GI contrast study: gold standard — shows abnormal duodenojejunal flexure position", "AXR: 'double bubble' if duodenal obstruction", "US: abnormal superior mesenteric artery/vein relationship"] },
          { label: "Surgery", steps: ["Ladd's procedure: counterclockwise detorsion + broadening of mesentery + appendicectomy + straightening of duodenum", "Bowel viability assessment — second-look laparotomy at 24–48 h if ischaemia", "Broad-spectrum antibiotics"] },
        ],
        drugs: [
          { name: "Ceftriaxone + Metronidazole", dose: "50 + 10 mg/kg", route: "IV" },
          { name: "Fluid resuscitation", dose: "20 mL/kg", route: "NS IV" },
        ],
        source: "F&L 8e ch. 48",
      },

      "alg-hernia": {
        kind: "algorithm", severity: "red",
        title: "Incarcerated Hernia",
        summary: "Attempt gentle reduction within 6 h if skin changes absent. Surgical standby.",
        phases: [
          { label: "Assessment", steps: ["Duration? Skin changes (erythema, blue discolouration = strangulation)?", ">6 h or skin changes → no reduction attempt → theatre"] },
          { label: "Manual reduction attempt", steps: ["Analgesia: fentanyl IN 1.5 mcg/kg + Trendelenburg positioning", "Gentle sustained bimanual taxis — 5–10 min", "If successful: admit for elective repair within 24–48 h (recurrence risk high)", "If fails: theatre for emergency repair"] },
        ],
        drugs: [
          { name: "Fentanyl IN", dose: "1.5 mcg/kg", route: "IN" },
          { name: "Morphine IV", dose: "0.1 mg/kg", route: "IV" },
        ],
        source: "F&L 8e ch. 48",
      },

      "alg-appendix": {
        kind: "algorithm", severity: "red",
        title: "Acute Appendicitis",
        summary: "PAS score guides imaging and management. Analgesia does NOT mask diagnosis.",
        phases: [
          { label: "Risk stratification (PAS — Paediatric Appendicitis Score)", steps: ["PAS ≤3: low risk → observe, discharge with return precautions", "PAS 4–6: intermediate → ultrasound ± MRI (preferred over CT in children)", "PAS ≥7: high risk → surgery without delay"] },
          { label: "Investigations", steps: ["FBC (WBC), CRP, urine (exclude UTI)", "US abdomen (first-line imaging)", "MRI if US inconclusive (preferred over CT to avoid radiation)", "CT only if MRI unavailable and diagnosis uncertain"] },
          { label: "Management", steps: ["Analgesia first: opioid does NOT mask surgical signs (RCT evidence)", "NPO + IV maintenance", "Laparoscopic appendicectomy", "Perforated: IV antibiotics pre-op + peritoneal washout", "Non-operative management (antibiotics alone): emerging option for uncomplicated appendicitis — discuss with surgeon"] },
        ],
        drugs: [
          { name: "Ceftriaxone + Metronidazole", dose: "50 + 10 mg/kg", route: "IV" },
          { name: "Morphine", dose: "0.1 mg/kg", route: "IV PRN" },
          { name: "Ondansetron", dose: "0.15 mg/kg", route: "IV" },
        ],
        source: "F&L 8e ch. 48 · Tintinalli 9e · Samuel PAS Score 2002",
      },

      "alg-torsion": {
        kind: "algorithm", severity: "red",
        title: "Testicular Torsion — 6-Hour Window",
        summary: "Time is testis. Do NOT wait for imaging if clinical diagnosis is clear.",
        phases: [
          { label: "Immediate", steps: ["Call urology/surgery IMMEDIATELY", "NPO, analgesia, anti-emetic", "Doppler US only if it does NOT delay theatre", "Manual detorsion while awaiting theatre: open book (medial to lateral) — 3–4 rotations per side"] },
          { label: "Surgery", steps: ["Scrotal exploration + bilateral orchidopexy", "Orchiectomy if testis non-viable", "Contralateral orchidopexy mandatory (bell-clapper deformity bilateral)"] },
          { label: "Timing and salvage rates", steps: ["<6 h: >90% salvage", "6–12 h: 50%", ">24 h: <10% salvage — still explore (viability occasionally higher)"] },
        ],
        drugs: [
          { name: "Fentanyl IV", dose: "1 mcg/kg", route: "IV" },
          { name: "Ondansetron", dose: "0.15 mg/kg", route: "IV" },
        ],
        source: "F&L 8e ch. 61 · Tintinalli 9e",
      },

      "alg-hsp": {
        kind: "algorithm", severity: "amber",
        title: "Henoch-Schönlein Purpura (IgA Vasculitis)",
        summary: "Triad: palpable purpura (lower limbs/buttocks), colicky abdominal pain, arthritis. Renal surveillance mandatory.",
        phases: [
          { label: "Diagnosis (ACR 2022)", steps: ["Palpable purpura + any of: age <20 yr / abdominal pain / arthritis / renal involvement (haematuria/proteinuria)", "Skin biopsy: IgA-dominant deposits (if diagnosis uncertain)", "Urine dipstick: haematuria + proteinuria (renal involvement — most important complication)"] },
          { label: "Management", steps: ["Analgesia: paracetamol (avoid NSAIDs if renal involvement)", "Hydration: oral or IV", "Prednisolone for severe abdominal pain (suspected intussusception or haemorrhage)", "Admit if: severe abdominal pain, GI bleeding, intussusception, renal impairment, nephrotic syndrome"] },
          { label: "Renal surveillance", steps: ["Urine dipstick + BP at diagnosis, weekly × 4 weeks, monthly × 6 months", "Refer to nephrology: persistent haematuria >3 months, proteinuria, hypertension, declining GFR"] },
        ],
        drugs: [
          { name: "Paracetamol", dose: "15 mg/kg", route: "PO" },
          { name: "Prednisolone (severe abdominal pain)", dose: "1–2 mg/kg (max 60 mg)", route: "PO × 1–2 weeks, taper" },
        ],
        source: "F&L 8e ch. 84 · ACR IgA Vasculitis Classification 2022",
      },

      "alg-ovarian": {
        kind: "algorithm", severity: "red",
        title: "Ovarian Torsion / Ectopic Pregnancy",
        summary: "Mandatory urine hCG in all adolescent females with pelvic pain. Gynaecology consult.",
        phases: [
          { label: "Immediate", steps: ["Urine β-hCG MANDATORY in all adolescent females", "If positive hCG: ectopic pregnancy until proven otherwise", "Pelvic US with Doppler", "NPO + analgesia + IV access + group and save"] },
          { label: "Ectopic pregnancy", steps: ["Haemodynamically unstable → immediate theatre", "Stable: rhesus typing, serial β-hCG, repeat US at 48 h", "Methotrexate if: unruptured <3.5 cm, β-hCG <5000, no cardiac activity", "Surgical (salpingotomy or salpingectomy) if: ruptured, large, β-hCG >5000"] },
          { label: "Ovarian torsion", steps: ["Laparoscopy for detorsion + oophoropexy", "Do NOT remove ovary unless clearly non-viable (haemorrhagic infarction) — even twisted ovaries can recover", "Both ovaries fixed (contralateral oophoropexy): if > 4–5 cm ovarian cyst (risk of recurrent torsion)"] },
        ],
        drugs: [
          { name: "Morphine", dose: "0.1 mg/kg", route: "IV" },
          { name: "Ondansetron", dose: "0.15 mg/kg", route: "IV" },
        ],
        source: "F&L 8e ch. 95 · Tintinalli 9e",
      },

      "alg-gi-bleed": {
        kind: "algorithm", severity: "red",
        title: "Paediatric GI Bleed",
        summary: "Resuscitate, identify upper vs lower, early endoscopy.",
        phases: [
          { label: "Resuscitation + stratification", steps: ["ABC, 2 large-bore IVs, group + crossmatch", "Upper GI (haematemesis/coffee-ground): NG tube, urgent endoscopy", "Lower GI (PR bleeding): rectal exam, colonoscopy vs CT angiography if massive"] },
          { label: "Upper GI bleed", steps: ["PPI IV high-dose", "Endoscopy within 24 h (12 h if actively bleeding)", "Variceal bleed: octreotide + endoscopic band ligation + terlipressin", "Transfuse at Hb <7 g/dL (restrictive strategy — Villanueva NEJM 2013)"] },
          { label: "Lower GI bleed", steps: ["Meckel's scan if age <2 yr (nuclear medicine 99mTc-pertechnetate)", "Colonoscopy for polyps, IBD, vascular malformation", "CT angiography if haemodynamically significant and above not available"] },
        ],
        drugs: [
          { name: "Pantoprazole", dose: "1 mg/kg (max 40 mg) then 0.1–0.2 mg/kg/hr", route: "IV" },
          { name: "pRBC transfusion", dose: "10–15 mL/kg over 2–4 h", route: "IV" },
          { name: "Octreotide (variceal)", dose: "1 mcg/kg bolus then 1 mcg/kg/hr", route: "IV" },
          { name: "Terlipressin (variceal)", dose: "20 mcg/kg (max 2 mg)", route: "IV bolus" },
        ],
        source: "F&L 8e ch. 78 · Tintinalli 9e · Villanueva NEJM 2013",
      },

      "alg-obstruction": {
        kind: "algorithm", severity: "red",
        title: "Bowel Obstruction",
        summary: "Identify cause (adhesions, hernia, mass). Resuscitate, decompress, surgical consult.",
        phases: [
          { label: "Immediate", steps: ["NPO + NG tube decompression (nasogastric)", "IV fluids — significant third-space losses likely", "Erect + supine AXR: dilated loops, air-fluid levels", "CT if high-grade or suspected cause not clear on AXR", "Surgical consult"] },
          { label: "Distinguish complete vs partial", steps: ["Partial: may try conservative management + NGT decompression", "Complete: theatre", "If strangulation suspected (tachycardia, severe pain, fever, peritonism) → theatre without delay"] },
        ],
        drugs: [
          { name: "Fluid bolus", dose: "20 mL/kg", route: "NS IV" },
          { name: "Ceftriaxone + Metronidazole (if strangulation)", dose: "50 + 10 mg/kg", route: "IV" },
        ],
        source: "F&L 8e ch. 48 · Tintinalli 9e",
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 6. FEVER WITH RASH — preserved from original with algorithm nodes
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "fever-rash",
    title: "Fever with Rash",
    category: "medical",
    icon: ThermometerHot,
    description: "Systematic approach to fever with rash — from meningococcaemia to varicella.",
    source: "F&L 8e ch. 74 · Tintinalli 9e ch. 119 · IAP",
    start: "type",
    nodes: {
      type: {
        kind: "question",
        prompt: "Type of rash?",
        options: [
          { label: "Non-blanching / petechial / purpuric", next: "q-petechial" },
          { label: "Maculopapular / morbilliform", next: "q-macpap" },
          { label: "Vesicular / bullous", next: "q-vesicular" },
          { label: "Diffuse erythroderma / desquamation", next: "q-erythro" },
        ],
      },
      "q-petechial": {
        kind: "question",
        prompt: "Petechial rash — clinical state?",
        options: [
          { label: "Ill, febrile, shock, rapidly spreading purpura", next: "alg-mening" },
          { label: "Well, petechiae only above nipple line (after coughing/vomiting)", next: "alg-traum-petec" },
          { label: "Palpable purpura lower limbs + arthritis + abdominal pain", next: "alg-hsp-rash" },
        ],
      },
      "q-macpap": {
        kind: "question",
        prompt: "Maculopapular pattern?",
        options: [
          { label: "Fever + 3Cs + Koplik spots, cephalocaudal spread", next: "alg-measles" },
          { label: "Fever ≥5 d + conjunctivitis + lip changes + lymphadenopathy", next: "alg-kawa" },
          { label: "Sore throat + sandpaper rash + strawberry tongue", next: "alg-scarlet" },
          { label: "High fever 3–5 d then rash as fever breaks (6 mo–2 yr)", next: "alg-roseola" },
          { label: "Slapped-cheek + lacy rash body", next: "alg-parvo" },
        ],
      },
      "q-vesicular": {
        kind: "question",
        prompt: "Vesicular distribution?",
        options: [
          { label: "Crops at different stages, whole body, fever", next: "alg-vzv" },
          { label: "Vesicles on hands, feet, mouth, coxsackie", next: "alg-hfm" },
          { label: "Grouped vesicles in dermatomal distribution", next: "alg-hsv" },
        ],
      },
      "q-erythro": {
        kind: "question",
        prompt: "Erythroderma?",
        options: [
          { label: "Fever + hypotension + erythroderma + multiorgan involvement", next: "alg-tss" },
          { label: "Flaccid bullae, positive Nikolsky sign, infant/child", next: "alg-ssss" },
        ],
      },

      "alg-mening": {
        kind: "algorithm", severity: "red",
        title: "Meningococcaemia / Septic Shock",
        summary: "Time-critical. Antibiotics within 30 min. Do NOT wait for LP before antibiotics.",
        phases: [
          { label: "Immediate", steps: ["IV/IO access × 2", "High-flow O₂", "Blood cultures × 2 (5 min max delay)", "IV antibiotics WITHIN 30 MIN", "Fluid bolus 10–20 mL/kg NS — reassess; escalate to vasoactives if needed"] },
          { label: "Workup", steps: ["FBC, coagulation, lactate, blood gas, glucose, meningococcal PCR", "LP: after haemodynamic stabilisation (do NOT delay antibiotics for LP)", "CXR", "Strict isolation; notify public health; contact prophylaxis (household/close contacts)"] },
        ],
        drugs: [
          { name: "Ceftriaxone (meningitis dose)", dose: "100 mg/kg (max 4 g)", route: "IV" },
          { name: "Dexamethasone (meningitis)", dose: "0.15 mg/kg q6h × 4 days", route: "IV — with or just before 1st antibiotics" },
          { name: "Adrenaline infusion (cold shock)", dose: "0.05–0.3 mcg/kg/min", route: "IV — titrate" },
          { name: "Noradrenaline (warm shock)", dose: "0.05–0.5 mcg/kg/min", route: "IV — titrate" },
        ],
        source: "F&L 8e ch. 74 · Surviving Sepsis Campaign Paediatric 2020 · IAP 2024",
      },

      "alg-traum-petec": {
        kind: "algorithm", severity: "amber",
        title: "Traumatic Petechiae",
        summary: "Above SVC distribution after coughing/vomiting in a well child — observe + exclude thrombocytopenia.",
        phases: [
          { label: "Assessment", steps: ["Assess: any ill appearance, fever, spreading, below nipple line? → treat as meningococcaemia if any red flag", "FBC: exclude thrombocytopenia (ITP, leukaemia)", "Observe 4 h", "Safety-net precautions + written discharge advice"] },
        ],
        drugs: [],
        source: "F&L 8e",
      },

      "alg-hsp-rash": {
        kind: "algorithm", severity: "amber",
        title: "IgA Vasculitis (HSP) — see Acute Abdomen pathway",
        summary: "Manage as per IgA Vasculitis algorithm. Urine surveillance for renal involvement mandatory.",
        phases: [
          { label: "Refer to HSP algorithm in Acute Abdomen pathway", steps: ["Weekly urine dipstick × 6 months", "BP monitoring", "Prednisolone for severe abdominal pain or nephrotic syndrome"] },
        ],
        drugs: [{ name: "Paracetamol", dose: "15 mg/kg", route: "PO" }],
        source: "F&L 8e",
      },

      "alg-measles": {
        kind: "algorithm", severity: "amber",
        title: "Measles",
        summary: "Notifiable, airborne isolation, vitamin A, watch for complications.",
        phases: [
          { label: "Isolation + notification", steps: ["Airborne isolation (negative pressure preferred)", "Notify public health department (notifiable disease)", "Post-exposure: VIG for susceptible pregnant/immunocompromised within 6 days of exposure"] },
          { label: "Treatment", steps: ["Vitamin A × 2 days (dose by age)", "Supportive: antipyretics, hydration, eye care (conjunctivitis)", "Antibiotics only for bacterial complications (otitis media, pneumonia)"] },
          { label: "Watch for complications", steps: ["Pneumonia (viral or secondary bacterial): most common cause of measles death", "Encephalitis (1/1000): seizures, altered consciousness — CSF, MRI, LP", "SSPE (subacute sclerosing panencephalitis): years later — progressive neurological decline"] },
        ],
        drugs: [
          { name: "Vitamin A <6 mo", dose: "50,000 IU × 2 days", route: "PO" },
          { name: "Vitamin A 6–11 mo", dose: "100,000 IU × 2 days", route: "PO" },
          { name: "Vitamin A ≥12 mo", dose: "200,000 IU × 2 days", route: "PO" },
        ],
        source: "F&L 8e · WHO Measles Guidelines 2023",
      },

      "alg-kawa": {
        kind: "algorithm", severity: "red",
        title: "Kawasaki Disease",
        summary: "Treat within 10 days to prevent coronary aneurysms. IVIG + aspirin.",
        phases: [
          { label: "Diagnosis", steps: ["Classic KD: fever ≥5 days + 4 of 5: conjunctivitis / oral changes / rash / extremity changes / cervical lymphadenopathy", "Incomplete KD: fever ≥5 days + <4 features + elevated CRP/ESR + echo changes", "Echo: baseline (before IVIG), repeat at 2 and 6 weeks"] },
          { label: "Treatment", steps: ["IVIG 2 g/kg over 10–12 h — within 10 days of fever onset", "High-dose aspirin 30–50 mg/kg/day q6h until afebrile × 48 h", "Then low-dose aspirin 3–5 mg/kg/day × 6–8 weeks", "IVIG refractory (persistent fever >36 h after IVIG): 2nd IVIG / IV methylprednisolone / infliximab"] },
        ],
        drugs: [
          { name: "IVIG", dose: "2 g/kg", route: "IV over 10–12 h" },
          { name: "Aspirin (high dose)", dose: "30–50 mg/kg/day divided q6h", route: "PO" },
          { name: "Methylprednisolone (IVIG-refractory)", dose: "30 mg/kg/day × 3 days", route: "IV" },
        ],
        source: "F&L 8e · AHA KD Guidelines 2017 · Shulman JAMA 2018",
      },

      "alg-scarlet": {
        kind: "algorithm", severity: "emerald",
        title: "Scarlet Fever (GAS)",
        summary: "Penicillin/amoxicillin × 10 days. Prevents acute rheumatic fever.",
        phases: [
          { label: "Diagnosis + treatment", steps: ["Throat swab (rapid antigen + culture)", "10-day course mandatory (compliance important to prevent ARF)", "Exclude from school × 24 h after antibiotics started", "Household contacts not routinely treated unless recurrent or high-risk"] },
        ],
        drugs: [
          { name: "Amoxicillin", dose: "50 mg/kg/day (max 1 g/day)", route: "PO × 10 days" },
          { name: "Phenoxymethylpenicillin", dose: "12.5 mg/kg BD (max 500 mg BD)", route: "PO × 10 days" },
          { name: "Azithromycin (penicillin allergy)", dose: "12 mg/kg day 1, 6 mg/kg × 4 days", route: "PO" },
        ],
        source: "F&L 8e · NICE GAS guidelines",
      },

      "alg-roseola": {
        kind: "algorithm", severity: "emerald",
        title: "Roseola (HHV-6)",
        summary: "High fever × 3–5 days then rash as fever breaks. Self-limiting. Febrile seizures in the high-fever phase.",
        phases: [
          { label: "Management", steps: ["Supportive: antipyretics, hydration", "Reassure parents: rash appears AFTER fever breaks (not drug rash)", "Safety-net for febrile seizures (20% risk during high-fever phase)", "No antiviral needed in immunocompetent"] },
        ],
        drugs: [{ name: "Paracetamol", dose: "15 mg/kg", route: "PO q4–6h" }],
        source: "F&L 8e",
      },

      "alg-parvo": {
        kind: "algorithm", severity: "emerald",
        title: "Parvovirus B19 (Fifth Disease / Slapped Cheek)",
        summary: "Benign in immunocompetent. Important in haemolytic anaemia (aplastic crisis) and pregnancy (hydrops fetalis).",
        phases: [
          { label: "Management", steps: ["Supportive, no specific treatment", "Advise about contact with pregnant women (especially <20 weeks)", "Haemolytic anaemia (sickle cell, thalassaemia): monitor Hb closely — aplastic crisis possible", "Immunocompromised: IVIG may be used"] },
        ],
        drugs: [],
        source: "F&L 8e",
      },

      "alg-vzv": {
        kind: "algorithm", severity: "amber",
        title: "Varicella (Chickenpox)",
        summary: "Acyclovir for high-risk groups. AVOID aspirin (Reye's syndrome) and NSAIDs (skin superinfection).",
        phases: [
          { label: "Treatment", steps: ["Mild/immunocompetent: supportive (calamine, antihistamine, nail trim)", "High-risk (immunocompromised, neonate, adolescent >13 yr, severe): oral or IV acyclovir within 24 h of rash", "Isolation until all lesions crusted (~5–7 days)"] },
          { label: "Complications", steps: ["Bacterial superinfection (impetigo, cellulitis): GAS/Staph — antibiotics", "Varicella pneumonia: ICU, IV acyclovir", "Encephalitis/cerebellar ataxia: IV acyclovir, MRI, CSF"] },
        ],
        drugs: [
          { name: "Acyclovir (oral, high-risk)", dose: "20 mg/kg q6h (max 800 mg)", route: "PO × 5 days" },
          { name: "Acyclovir IV (severe/immunocompromised)", dose: "10 mg/kg", route: "IV q8h × 7–10 days" },
        ],
        source: "F&L 8e",
      },

      "alg-hfm": {
        kind: "algorithm", severity: "emerald",
        title: "Hand-Foot-Mouth Disease (HFMD)",
        summary: "Self-limiting. Enterovirus 71 can cause rare neurological complications.",
        phases: [
          { label: "Management", steps: ["Supportive: analgesia, cold fluids (avoid citrus)", "Exclude from nursery until lesions dry", "EV71 warning signs: persistent fever, vomiting, drowsiness, ataxia, limb weakness → admit"] },
        ],
        drugs: [{ name: "Paracetamol", dose: "15 mg/kg", route: "PO" }],
        source: "F&L 8e",
      },

      "alg-hsv": {
        kind: "algorithm", severity: "amber",
        title: "HSV Infection",
        summary: "Neonatal HSV (≤6 wk) = LIFE-THREATENING. IV acyclovir empirically. Older child: oral.",
        phases: [
          { label: "Neonatal HSV (≤6 wk)", steps: ["Full HSV workup: skin/eye/mouth swabs, CSF HSV PCR, LFTs, full blood count", "IV acyclovir EMPIRICALLY — do not wait for results", "Admit: minimum 21 days IV acyclovir for CNS/disseminated disease", "Neonatal HSV classification: SEM (skin-eye-mouth), CNS, disseminated"] },
          { label: "Older child", steps: ["Primary gingivostomatitis: oral acyclovir if within 72 h + severe", "Herpes labialis: topical acyclovir (limited benefit) or oral if frequent/severe", "Encephalitis: IV acyclovir 10–15 mg/kg q8h + MRI + EEG"] },
        ],
        drugs: [
          { name: "Acyclovir IV (neonate)", dose: "20 mg/kg q8h × 14–21 days", route: "IV" },
          { name: "Acyclovir IV (encephalitis)", dose: "15 mg/kg q8h × 21 days", route: "IV" },
          { name: "Acyclovir oral (older child)", dose: "20 mg/kg (max 800 mg) 5×/day", route: "PO × 5 days" },
        ],
        source: "F&L 8e",
      },

      "alg-tss": {
        kind: "algorithm", severity: "red",
        title: "Toxic Shock Syndrome (Staph / Strep)",
        summary: "Remove source, aggressive resuscitation, combination antibiotics with anti-toxin activity.",
        phases: [
          { label: "Immediate", steps: ["Remove source: foreign body, wound packing, tampon, nasal packing", "Resuscitate: fluid bolus 20 mL/kg NS, vasoactives if refractory", "Blood cultures × 2, wound swab", "Broad-spectrum IV antibiotics within 1 h"] },
          { label: "Antibiotics — combination (anti-toxin coverage critical)", steps: ["β-lactam: kills bacteria and reduces biofilm", "Clindamycin: inhibits ribosomal toxin production — CRITICAL addition", "IVIG: neutralises circulating superantigen toxins in severe/refractory cases", "PICU admission"] },
        ],
        drugs: [
          { name: "Flucloxacillin (MSSA)", dose: "50 mg/kg (max 2 g)", route: "IV q6h" },
          { name: "Vancomycin (MRSA risk)", dose: "15 mg/kg", route: "IV q6h" },
          { name: "Clindamycin (add for all TSS — anti-toxin)", dose: "10 mg/kg (max 600 mg)", route: "IV q6h" },
          { name: "IVIG (refractory)", dose: "1 g/kg day 1, 0.5 g/kg days 2–3", route: "IV" },
        ],
        source: "F&L 8e",
      },

      "alg-ssss": {
        kind: "algorithm", severity: "red",
        title: "Staphylococcal Scalded Skin Syndrome (SSSS)",
        summary: "Toxin-mediated exfoliative dermatitis. Treat like a burn.",
        phases: [
          { label: "Management", steps: ["Admit: fluid balance, wound care, barrier nursing", "Anti-staph IV antibiotics", "Analgesia — very painful", "Dermatology / burns team involvement if extensive", "Nikolsky sign: gentle lateral pressure causes skin separation"] },
        ],
        drugs: [
          { name: "Flucloxacillin", dose: "50 mg/kg (max 2 g)", route: "IV q6h" },
          { name: "Clindamycin", dose: "10 mg/kg", route: "IV q6h (anti-toxin)" },
        ],
        source: "F&L 8e",
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 7. SEPSIS — NEW PATHWAY
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "sepsis",
    title: "Paediatric Sepsis",
    category: "medical",
    icon: Siren,
    description: "Phoenix Sepsis Score + hour-1 bundle + vasopressor titration.",
    source: "Phoenix Sepsis Score (Sanchez-Pinto JAMA 2024) · Surviving Sepsis Campaign Paediatric 2020 · APLS 6e · IAP Sepsis Guidelines 2024",
    start: "recognition",
    nodes: {
      recognition: {
        kind: "question",
        prompt: "Suspected infection + organ dysfunction?",
        options: [
          { label: "Yes — sepsis suspected: infection + altered haemodynamics/neuro/respiratory/coagulation", next: "severity" },
          { label: "Febrile child, no organ dysfunction → go to Fever pathway", next: "alg-not-sepsis" },
        ],
      },
      severity: {
        kind: "question",
        prompt: "Haemodynamic status?",
        options: [
          { label: "Compensated shock: tachycardia + poor CRT/weak pulses + normal BP", next: "alg-sepsis-compensated" },
          { label: "Hypotensive / decompensated shock", next: "alg-sepsis-decompensated" },
          { label: "Septic shock not responding to fluids", next: "alg-septic-shock-refractory" },
        ],
      },
      "alg-not-sepsis": {
        kind: "algorithm", severity: "emerald",
        title: "Febrile child without organ dysfunction",
        summary: "Go to Fever in Young Infant or Head Injury pathway as appropriate.",
        phases: [{ label: "Redirect", steps: ["Use Fever in Young Infant pathway for infants <90 days", "Routine fever assessment for older children"] }],
        drugs: [],
        source: "IAP 2024",
      },
      "alg-sepsis-compensated": {
        kind: "algorithm", severity: "amber",
        title: "Compensated Septic Shock — Hour-1 Bundle",
        summary: "Recognise early, treat early. IV access + blood cultures + antibiotics within 1 hour.",
        phases: [
          { label: "Hour-1 bundle", steps: ["IV/IO access + blood cultures × 2 (< 5 min delay)", "Lactate measurement", "10 mL/kg isotonic fluid bolus — reassess after each; max 40–60 mL/kg before reassessment", "IV broad-spectrum antibiotics within 1 HOUR of recognition", "BGL, FBC, CMP, coagulation"] },
          { label: "Antibiotic selection (empirical)", steps: ["Community-acquired sepsis: ceftriaxone 100 mg/kg (max 4 g)", "Hospital-acquired / immunocompromised: piperacillin-tazobactam 100 mg/kg piperacillin component", "Add vancomycin if MRSA risk, line infection, or not improving", "Add metronidazole if abdominal source", "Add antifungal (caspofungin) if prolonged antibiotics, immunocompromised"] },
          { label: "Reassessment after each fluid bolus", steps: ["Improvement in CRT (<2 s), HR, BP → continue current plan", "No improvement after 40 mL/kg → vasopressors", "Fluid overload signs (rales, hepatomegaly, SpO₂ drop) → stop fluids"] },
        ],
        drugs: [
          { name: "Fluid bolus", dose: "10 mL/kg × 1 (reassess, repeat)", route: "NS / Hartmann's IV" },
          { name: "Ceftriaxone (community)", dose: "100 mg/kg (max 4 g)", route: "IV" },
          { name: "Piperacillin-Tazobactam (hospital)", dose: "100 mg/kg piperacillin component", route: "IV q6h" },
          { name: "Vancomycin", dose: "15 mg/kg", route: "IV q6h" },
        ],
        source: "Surviving Sepsis Campaign Paediatric 2020 · IAP Sepsis 2024",
      },
      "alg-sepsis-decompensated": {
        kind: "algorithm", severity: "red",
        title: "Decompensated Septic Shock",
        summary: "Hypotension + fluid-resuscitation + vasopressors + PICU.",
        phases: [
          { label: "Immediate resuscitation", steps: ["Airway: consider intubation if respiratory failure (ketamine preferred)", "2 × large-bore IV/IO", "Fluid bolus 10–20 mL/kg — reassess constantly; stop if fluid overload", "Blood cultures + antibiotics within 1 h", "PICU alert"] },
          { label: "Vasopressors (if fluid-refractory)", steps: ["Adrenaline (cold shock: cool peripheries, poor CRT): 0.05–1 mcg/kg/min", "Noradrenaline (warm shock: warm peripheries, bounding pulses): 0.05–1 mcg/kg/min", "Hydrocortisone (catecholamine-refractory shock): 1–2 mg/kg bolus, then 0.2–0.5 mg/kg/hr"] },
          { label: "Targets", steps: ["CRT <2 s + HR normal for age + BP ≥ age-appropriate minimum + UO ≥1 mL/kg/hr", "Lactate clearance >10% per 2 h", "Avoid fluid overload >10% of body weight"] },
        ],
        drugs: [
          { name: "Adrenaline (cold shock)", dose: "0.05–1 mcg/kg/min", route: "IV infusion" },
          { name: "Noradrenaline (warm shock)", dose: "0.05–1 mcg/kg/min", route: "IV infusion" },
          { name: "Hydrocortisone (catecholamine-resistant)", dose: "1–2 mg/kg bolus then 0.2–0.5 mg/kg/hr", route: "IV" },
        ],
        source: "Surviving Sepsis Campaign Paediatric 2020 · APLS 6e",
      },
      "alg-septic-shock-refractory": {
        kind: "algorithm", severity: "red",
        title: "Refractory Septic Shock — PICU",
        summary: "Not responding to fluids + first-line vasopressors. Expert review. Consider ECMO.",
        phases: [
          { label: "Additional interventions", steps: ["Second vasopressor (add vasopressin 0.01–0.04 U/kg/hr if noradrenaline max)", "Hydrocortisone if not already started", "Source control: drain abscess, remove infected line, surgical consultation", "ECMO if refractory shock at ECMO centre", "Treat complications: DIC (FFP + platelets), ARDS (lung-protective ventilation), AKI (CRRT)"] },
        ],
        drugs: [
          { name: "Vasopressin (third-line vasopressor)", dose: "0.01–0.04 U/kg/hr", route: "IV infusion" },
          { name: "FFP (for DIC)", dose: "10–15 mL/kg", route: "IV" },
        ],
        source: "Surviving Sepsis Campaign Paediatric 2020",
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 8. DKA — NEW PATHWAY (ISPAD 2022)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "dka",
    title: "Diabetic Ketoacidosis (DKA)",
    category: "medical",
    icon: Drop,
    description: "ISPAD 2022 — fluid deficit calculation, insulin timing, cerebral oedema prevention.",
    source: "ISPAD Clinical Practice Consensus Guidelines 2022 · F&L 8e ch. 86 · Wolfsdorf JCEM 2018",
    start: "severity",
    nodes: {
      severity: {
        kind: "question",
        prompt: "DKA severity (by pH or bicarbonate)?",
        options: [
          { label: "Mild: pH 7.20–7.29 OR HCO₃ 10–15 mmol/L", next: "alg-dka-mild" },
          { label: "Moderate: pH 7.10–7.19 OR HCO₃ 5–9 mmol/L", next: "alg-dka-mod" },
          { label: "Severe: pH <7.10 OR HCO₃ <5 mmol/L", next: "alg-dka-severe" },
        ],
      },
      "alg-dka-mild": {
        kind: "algorithm", severity: "emerald",
        title: "Mild DKA — Oral / SC Management",
        summary: "pH 7.20–7.29. Well-established DM + able to drink + tolerating PO → may manage with SC insulin and oral fluids.",
        phases: [
          { label: "Assessment", steps: ["BGL, blood gas, U&E, creatinine, β-hydroxybutyrate or urine ketones", "Weight (compare to last known)", "FBC + CRP if infection trigger", "If new diagnosis OR vomiting → IV fluid protocol"] },
          { label: "Management", steps: ["Continue previous insulin regimen + correction dose rapid-acting insulin", "Oral rehydration if tolerating", "2-hourly BGL monitoring", "If not improving in 2 h → IV protocol"] },
        ],
        drugs: [{ name: "Rapid-acting insulin (correction)", dose: "0.05–0.1 U/kg", route: "SC" }],
        source: "ISPAD 2022",
      },
      "alg-dka-mod": {
        kind: "algorithm", severity: "amber",
        title: "Moderate DKA — IV Fluids + Insulin",
        summary: "pH 7.10–7.19. Full IV DKA protocol. Cerebral oedema risk — avoid rapid fluid shifts.",
        phases: [
          { label: "Phase 1 — Resuscitation (if shocked: CRT >3 s, hypotension, poor perfusion)", steps: ["10 mL/kg NS bolus over 30–60 min — ONLY if haemodynamically compromised", "Repeat up to 20 mL/kg if still shocked", "Bolus fluid comes off calculated deficit"] },
          { label: "Phase 2 — Rehydration (over 48 hours — ISPAD 2022)", steps: ["Estimate deficit: moderate DKA = 7% deficit", "Deficit mL = weight (kg) × 70 mL/kg", "Total fluid over 48 h = deficit + maintenance (4-2-1 rule × 48 h)", "Use NS (0.9% NaCl) initially; switch to 0.45% NaCl + 5% dextrose when BGL <14 mmol/L", "Rate = Total fluid ÷ 48 h (mL/hr) — DO NOT change rate rapidly"] },
          { label: "Insulin (start ≥1 h after fluids begun)", steps: ["Do NOT start insulin in first hour — fluid first", "Insulin infusion 0.05–0.1 U/kg/hr — start AFTER 1 h of IV fluids", "Once BGL <14 mmol/L: add glucose to IV fluid (use dual-bag system)", "Target BGL fall: 2–5 mmol/L per hour — not faster", "Continue insulin infusion until ketones clear + HCO₃ >15 + pH >7.30", "Switch to SC insulin 30 min before stopping infusion"] },
          { label: "Potassium", steps: ["Add 40 mEq/L KCl to fluids ONCE urine output confirmed AND K <5.5 mmol/L", "Serum K <3.5: increase to 60 mEq/L, delay insulin until K corrected", "Monitor K hourly for first 4 h, then 2-hourly"] },
        ],
        drugs: [
          { name: "NS 0.9% (initial rehydration)", dose: "Calculated rate (see above)", route: "IV over 48 h" },
          { name: "Insulin infusion", dose: "0.05–0.1 U/kg/hr", route: "IV — start ≥1 h after fluids" },
          { name: "KCl in IV fluid", dose: "40 mEq/L (↑ to 60 mEq/L if K <3.5)", route: "IV (in running fluids)" },
        ],
        source: "ISPAD 2022 · Wolfsdorf JCEM 2018 · F&L 8e ch. 86",
      },
      "alg-dka-severe": {
        kind: "algorithm", severity: "red",
        title: "Severe DKA + Cerebral Oedema",
        summary: "pH <7.10. PICU. Strict fluid management. Cerebral oedema is the leading cause of DKA mortality.",
        phases: [
          { label: "Severe DKA management", steps: ["Same as moderate DKA protocol but: admit to PICU", "Careful neurological monitoring q1h (GCS, pupils, BP, HR)", "Lower insulin dose: 0.05 U/kg/hr", "Phosphate replacement if <0.32 mmol/L (phosphate-containing potassium solution)"] },
          { label: "Cerebral oedema — recognition", steps: ["Suspect if: worsening headache, change in behaviour, vomiting after starting treatment, declining GCS, pupil changes, bradycardia + hypertension + abnormal breathing (Cushing)", "CT head if diagnosis uncertain (may be normal early)"] },
          { label: "Cerebral oedema — treatment", steps: ["Hypertonic saline 3%: 2.5–5 mL/kg IV over 15–30 min — FIRST LINE (preferred over mannitol in DKA)", "OR Mannitol 20%: 0.5–1 g/kg IV over 15 min — alternative", "Reduce IV fluid rate by 30%", "Intubate if GCS ≤8 (target normocarbia — hyperventilation WORSENS cerebral oedema in DKA)", "PICU + neurosurgery"] },
        ],
        drugs: [
          { name: "Hypertonic saline 3% (cerebral oedema)", dose: "2.5–5 mL/kg IV", route: "IV over 15–30 min — repeat if needed" },
          { name: "Mannitol 20% (alternative)", dose: "0.5–1 g/kg", route: "IV over 15 min" },
          { name: "Insulin infusion", dose: "0.05 U/kg/hr", route: "IV (lower dose in severe)" },
        ],
        source: "ISPAD 2022 · Tasker Arch Dis Child 2019 · F&L 8e",
      },
    },
  },
];
