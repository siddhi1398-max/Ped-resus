// ═══════════════════════════════════════════════════════════════════════════════
// ORAL / SYRUP FORMULATIONS — INDIAN PEDIATRIC DRUG REFERENCE
// References: IAP Guidelines 2024 · Piyush Gupta Pediatric Drug Doses 18th Ed
//             Harriet Lane Handbook 22nd Ed · WHO AWaRe 2022
//             CDSCO India Approved Formulations · NCDC India
// ═══════════════════════════════════════════════════════════════════════════════
// Each entry has:
//   dosePerKg     — mg/kg per dose (unless fixedDose)
//   frequency     — "OD" | "BD" | "TDS" | "QID" | "single"
//   unit          — "mg" (always, syrup mL calculated from concentration)
//   max           — max dose per single administration (mg)
//   maxDaily      — max total daily dose (mg) [optional]
//   formulations  — array of { conc: "125 mg/5mL", mgPerMl: 25, brands: ["X","Y"] }
//   route         — PO route note
//   notes         — clinical notes
//   ageMin        — minimum age (months) [optional]
//   withFood      — boolean
// ═══════════════════════════════════════════════════════════════════════════════

export const ORAL_DRUGS = [

  // ══════════════════════════════════════════════════════════════════
  // ANALGESICS / ANTIPYRETICS
  // ══════════════════════════════════════════════════════════════════
  {
    id: "paracetamol-oral",
    name: "Paracetamol (Acetaminophen)",
    category: "analgesic",
    indication: "Fever / mild-moderate pain",
    dosePerKg: 15,
    frequency: "QID",
    frequencyHours: 6,
    unit: "mg",
    max: 1000,
    maxDaily: 4000,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "120 mg/5mL (paediatric drops)", mgPerMl: 24, brands: ["Calpol-120", "Metacin-120", "Dolo-120", "Tylenol Infant drops"] },
      { conc: "125 mg/5mL", mgPerMl: 25, brands: ["Calpol-125", "Metacin Syrup", "Febrinil-125"] },
      { conc: "250 mg/5mL", mgPerMl: 50, brands: ["Calpol-250", "Metacin Forte", "Dolo-250"] },
      { conc: "500 mg tablet (dispersible)", mgPerMl: null, brands: ["Calpol-500 DT", "Dolo-500 DT", "Metacin-500 DT"] },
    ],
    notes: "Max 60 mg/kg/day (children). Avoid in hepatic disease. Safest analgesic for all ages including neonates.",
    route: "PO / PR (suppository 125 mg/250 mg available)",
  },

  {
    id: "ibuprofen-oral",
    name: "Ibuprofen",
    category: "analgesic",
    indication: "Fever / mild-moderate pain / inflammatory conditions",
    dosePerKg: 10,
    frequency: "TDS",
    frequencyHours: 8,
    unit: "mg",
    max: 400,
    maxDaily: 1200,
    ageMin: 3,
    withFood: true,
    formulations: [
      { conc: "100 mg/5mL", mgPerMl: 20, brands: ["Ibugesic-100", "Brufen-100", "Advil-100", "Calprofen-100 DS"] },
      { conc: "200 mg/5mL", mgPerMl: 40, brands: ["Ibugesic-200 Forte", "Brufen-200", "Nurofen-200"] },
      { conc: "400 mg tablet", mgPerMl: null, brands: ["Brufen-400", "Ibugesic-400"] },
    ],
    notes: "Avoid if dehydrated, GFR reduced, active GI bleed, <3 months, dengue suspected. Give with food/milk. Max 40 mg/kg/day.",
    route: "PO with food",
  },

  {
    id: "naproxen-oral",
    name: "Naproxen",
    category: "analgesic",
    indication: "JIA / musculoskeletal pain / dysmenorrhoea (>2 yr)",
    dosePerKg: 5,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 500,
    maxDaily: 1000,
    ageMin: 24,
    withFood: true,
    formulations: [
      { conc: "125 mg/5mL", mgPerMl: 25, brands: ["Naprosyn suspension", "Flanax suspension"] },
      { conc: "250 mg tablet", mgPerMl: null, brands: ["Naprosyn-250", "Naxdom-250"] },
    ],
    notes: "5 mg/kg BD (max 500 mg/dose). JIA: 10–20 mg/kg/day ÷ BD (max 1 g/day). Longer half-life than ibuprofen. Give with food.",
    route: "PO with food",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIEMETICS / GI
  // ══════════════════════════════════════════════════════════════════
  {
    id: "ondansetron-oral",
    name: "Ondansetron",
    category: "other",
    indication: "Nausea / vomiting / chemotherapy-induced",
    dosePerKg: 0.15,
    frequency: "TDS",
    frequencyHours: 8,
    unit: "mg",
    max: 8,
    maxDaily: 24,
    ageMin: 6,
    withFood: false,
    formulations: [
      { conc: "2 mg/5mL", mgPerMl: 0.4, brands: ["Emeset-2 syrup", "Ondem-2 syrup", "Zofran-2", "Vomikind-2"] },
      { conc: "4 mg/5mL", mgPerMl: 0.8, brands: ["Emeset-4 syrup", "Ondem-4", "Zofran-4"] },
      { conc: "4 mg ODT (oral dissolving tablet)", mgPerMl: null, brands: ["Emeset-4 MD", "Ondem MD-4"] },
    ],
    notes: "Max 4 mg/dose if <15 kg; 8 mg/dose if ≥15 kg. Avoid in long QT syndrome. ODT useful when vomiting (dissolves on tongue).",
    route: "PO / ODT (no water needed)",
  },

  {
    id: "domperidone-oral",
    name: "Domperidone",
    category: "other",
    indication: "Nausea / vomiting / gastroparesis / GERD (prokinetic)",
    dosePerKg: 0.25,
    frequency: "TDS",
    frequencyHours: 8,
    unit: "mg",
    max: 10,
    maxDaily: 30,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "1 mg/mL (10 mg/10mL)", mgPerMl: 1, brands: ["Domstal drops 10 mg/10mL", "Motilium-1mg/mL", "Vomistop drops"] },
      { conc: "5 mg/5mL", mgPerMl: 1, brands: ["Domstal-5 syrup", "Motilium-5 syrup", "Vomistop-5"] },
    ],
    notes: "0.25–0.5 mg/kg TDS before meals (max 10 mg/dose). Avoid >12 weeks or in cardiac patients (QT risk). EMA restricted — use shortest duration.",
    route: "PO 15–30 min before feeds",
    withFood: false,
  },

  {
    id: "metoclopramide-oral",
    name: "Metoclopramide",
    category: "other",
    indication: "Nausea / vomiting / GERD (short-term)",
    dosePerKg: 0.1,
    frequency: "TDS",
    frequencyHours: 8,
    unit: "mg",
    max: 10,
    maxDaily: 30,
    ageMin: 12,
    withFood: false,
    formulations: [
      { conc: "5 mg/5mL", mgPerMl: 1, brands: ["Perinorm-5 syrup", "Maxolon-5", "Reglan-5"] },
      { conc: "10 mg tablet", mgPerMl: null, brands: ["Perinorm-10", "Maxolon-10"] },
    ],
    notes: "0.1 mg/kg TDS (max 10 mg). Extrapyramidal reactions — avoid in young children <1 yr. Dystonic reactions: treat with diphenhydramine 1 mg/kg IV.",
    route: "PO 30 min before meals",
  },

  {
    id: "ranitidine-oral",
    name: "Ranitidine (H2 blocker)",
    category: "other",
    indication: "GERD / peptic ulcer / stress ulcer prophylaxis",
    dosePerKg: 2,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 150,
    maxDaily: 300,
    ageMin: 1,
    withFood: false,
    formulations: [
      { conc: "75 mg/5mL", mgPerMl: 15, brands: ["Rantac-75 syrup", "Zinetac-75", "Aciloc-75"] },
      { conc: "150 mg tablet", mgPerMl: null, brands: ["Rantac-150", "Zinetac-150"] },
    ],
    notes: "2–4 mg/kg/dose BD (max 150 mg/dose). Note: NDMA contamination concerns — omeprazole preferred. Still widely used in India.",
    route: "PO before meals",
  },

  {
    id: "omeprazole-oral",
    name: "Omeprazole (PPI)",
    category: "other",
    indication: "GERD / erosive esophagitis / H. pylori / peptic ulcer",
    dosePerKg: 1,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 20,
    maxDaily: 40,
    ageMin: 2,
    withFood: false,
    formulations: [
      { conc: "Capsule 10 mg (open and sprinkle)", mgPerMl: null, brands: ["Omez-10", "Omicap-10", "Omsar-10"] },
      { conc: "Capsule 20 mg (open and sprinkle)", mgPerMl: null, brands: ["Omez-20", "Ocid-20", "Prilosec-20"] },
      { conc: "Sachet 10 mg (for suspension)", mgPerMl: null, brands: ["Omez-D sachet", "Nexpro sachet"] },
    ],
    notes: "1 mg/kg OD (max 20 mg). Open capsule, sprinkle granules on cold applesauce/yoghurt — do NOT crush granules. Give 30 min before first meal. Better acid suppression than H2 blockers.",
    route: "PO 30 min before first meal",
  },

  {
    id: "zinc-supp",
    name: "Zinc (ORS adjunct / deficiency)",
    category: "other",
    indication: "Acute diarrhoea (WHO-UNICEF protocol) / zinc deficiency",
    dosePerKg: null,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    fixedDose: "<6 mo: 10 mg OD × 10–14 days | ≥6 mo: 20 mg OD × 10–14 days",
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "20 mg/5mL syrup", mgPerMl: 4, brands: ["Zincovit syrup", "Zinconia syrup", "Pedizinc DS", "Ziconil-20"] },
      { conc: "10 mg dispersible tablet", mgPerMl: null, brands: ["ZinCo-10 DT", "Zincovit DT", "Numzinc-10 DT"] },
      { conc: "20 mg dispersible tablet", mgPerMl: null, brands: ["ZinCo-20 DT", "Zincovit-20 DT"] },
    ],
    notes: "IAP/WHO mandatory for diarrhoea. Reduces duration and severity. Give for full 14 days even after diarrhoea stops. Dispersible tablet dissolves in 5 mL ORS/water.",
    route: "PO with ORS",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIHISTAMINES / ANTI-ALLERGIC
  // ══════════════════════════════════════════════════════════════════
  {
    id: "cetirizine-oral",
    name: "Cetirizine",
    category: "other",
    indication: "Allergic rhinitis / urticaria / allergic conjunctivitis",
    dosePerKg: null,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    fixedDose: "2–5 yr: 2.5 mg OD | 6–11 yr: 5 mg OD | ≥12 yr: 10 mg OD",
    ageMin: 24,
    withFood: false,
    formulations: [
      { conc: "5 mg/5mL", mgPerMl: 1, brands: ["Alerid-5 syrup", "Cetcip-5", "Zyrtec-5", "Okacet-5"] },
      { conc: "10 mg tablet", mgPerMl: null, brands: ["Alerid-10", "Cetcip-10", "Zyrtec-10"] },
    ],
    notes: "Minimal sedation (2nd gen). Give at bedtime if drowsiness occurs. Safe from 2 years. No dose reduction needed for standard allergic conditions.",
    route: "PO at bedtime preferred",
  },

  {
    id: "levocetirizine-oral",
    name: "Levocetirizine",
    category: "other",
    indication: "Allergic rhinitis / urticaria / chronic urticaria",
    dosePerKg: null,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    fixedDose: "2–5 yr: 1.25 mg OD | 6–11 yr: 2.5 mg OD | ≥12 yr: 5 mg OD",
    ageMin: 24,
    withFood: false,
    formulations: [
      { conc: "2.5 mg/5mL", mgPerMl: 0.5, brands: ["Levorid-2.5 syrup", "Xyzal-2.5", "Levocet-2.5", "Lezyncet-2.5"] },
      { conc: "5 mg tablet", mgPerMl: null, brands: ["Levorid-5", "Xyzal-5", "Levocet-5"] },
    ],
    notes: "R-enantiomer of cetirizine, slightly more potent. Use half the cetirizine dose. Less sedating. From 2 years.",
    route: "PO at bedtime",
  },

  {
    id: "chlorpheniramine-oral",
    name: "Chlorpheniramine (CPM)",
    category: "other",
    indication: "Allergic rhinitis / urticaria / motion sickness / anaphylaxis adjunct",
    dosePerKg: 0.1,
    frequency: "TDS",
    frequencyHours: 8,
    unit: "mg",
    max: 4,
    maxDaily: 12,
    ageMin: 24,
    withFood: false,
    formulations: [
      { conc: "2 mg/5mL", mgPerMl: 0.4, brands: ["Piriton-2 syrup", "Avil-2 syrup", "CPM syrup", "Teldane syrup"] },
      { conc: "4 mg tablet", mgPerMl: null, brands: ["Piriton-4", "Avil-4"] },
    ],
    notes: "0.1 mg/kg TDS (max 4 mg/dose). Sedating (1st gen) — avoid in infants <2 yr, avoid if driving/school. Widely available. Avoid in closed-angle glaucoma.",
    route: "PO",
  },

  {
    id: "promethazine-oral",
    name: "Promethazine",
    category: "other",
    indication: "Allergic conditions / motion sickness / pre-medication",
    dosePerKg: 0.5,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 25,
    maxDaily: 50,
    ageMin: 24,
    withFood: true,
    formulations: [
      { conc: "5 mg/5mL", mgPerMl: 1, brands: ["Phenergan-5 syrup", "Promethyl-5", "Avomine syrup"] },
      { conc: "10 mg tablet", mgPerMl: null, brands: ["Phenergan-10", "Promethyl-10"] },
    ],
    notes: "0.5 mg/kg BD (max 25 mg/dose). AVOID <2 yr — risk of respiratory depression. Sedating. Motion sickness: give 30–60 min before travel.",
    route: "PO with food",
  },

  // ══════════════════════════════════════════════════════════════════
  // STEROIDS / ANTI-INFLAMMATORY
  // ══════════════════════════════════════════════════════════════════
  {
    id: "prednisolone-oral",
    name: "Prednisolone",
    category: "other",
    indication: "Asthma exacerbation / croup / nephrotic syndrome / JIA / allergic reactions",
    dosePerKg: 1,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 60,
    maxDaily: 60,
    ageMin: 1,
    withFood: true,
    formulations: [
      { conc: "5 mg/5mL", mgPerMl: 1, brands: ["Omnacortil-5 syrup", "Wysolone-5 syrup", "Prelone-5"] },
      { conc: "10 mg/5mL", mgPerMl: 2, brands: ["Omnacortil-10 DS", "Wysolone-10"] },
      { conc: "5 mg tablet (dispersible)", mgPerMl: null, brands: ["Omnacortil-5 DT", "Wysolone-5 DT"] },
    ],
    notes: "Asthma: 1–2 mg/kg OD × 3–5 days (max 40–60 mg). Nephrotic: 2 mg/kg OD × 6 weeks (max 60 mg). Give in morning with food to mimic cortisol rhythm. Taper if >7 days. Monitor BP, glucose.",
    route: "PO with food in morning",
  },

  {
    id: "dexamethasone-oral",
    name: "Dexamethasone",
    category: "other",
    indication: "Croup / cerebral oedema / anti-emetic (oncology) / severe asthma",
    dosePerKg: 0.6,
    frequency: "single",
    frequencyHours: null,
    unit: "mg",
    max: 10,
    ageMin: 0,
    withFood: true,
    formulations: [
      { conc: "0.5 mg/5mL", mgPerMl: 0.1, brands: ["Dexona-0.5 syrup", "Wymesone syrup", "Decadron syrup"] },
      { conc: "0.5 mg tablet", mgPerMl: null, brands: ["Dexona-0.5 tablet", "Wymesone-0.5"] },
    ],
    notes: "Croup: 0.6 mg/kg single dose (max 10 mg) PO/IM/IV. PO as effective as IM/IV (Piyush Gupta). Injection solution can be given orally. 25× more potent than hydrocortisone.",
    route: "PO / oral solution from injection vial",
  },

  {
    id: "budesonide-oral",
    name: "Budesonide (oral — Crohn's / IBD)",
    category: "other",
    indication: "Crohn's disease / IBD / mild croup (inhaled — see notes)",
    dosePerKg: null,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    fixedDose: "Crohn's (>8 yr): 9 mg OD × 8 weeks, then taper | Croup: 2 mg nebulised (single dose)",
    ageMin: 12,
    withFood: false,
    formulations: [
      { conc: "3 mg capsule (Entocort)", mgPerMl: null, brands: ["Entocort-3 mg capsule", "Budenofalk-3"] },
      { conc: "0.5 mg/2mL nebulising solution (for croup)", mgPerMl: 0.25, brands: ["Budecort-0.5 Respules", "Budesonide nebules 0.5mg"] },
    ],
    notes: "Oral Entocort capsule: swallow whole, do NOT chew. For croup: budesonide 2 mg nebulised is alternative to IM dexamethasone. Respules (0.5 mg/2mL): use 4 mL (2 mg) nebulised.",
    route: "PO swallow whole / Nebulised for croup",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTICONVULSANTS (ORAL)
  // ══════════════════════════════════════════════════════════════════
  {
    id: "levetiracetam-oral",
    name: "Levetiracetam",
    category: "anticonvulsant",
    indication: "Epilepsy (focal / generalised) / status epilepticus (oral maintenance)",
    dosePerKg: 10,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 1500,
    maxDaily: 3000,
    ageMin: 1,
    withFood: false,
    formulations: [
      { conc: "100 mg/mL solution", mgPerMl: 100, brands: ["Levepsy-100 oral solution", "Keppra-100 mg/mL", "Levroxa oral solution"] },
      { conc: "250 mg tablet", mgPerMl: null, brands: ["Levipil-250", "Keppra-250", "Levroxa-250"] },
    ],
    notes: "Start 10 mg/kg BD, increase by 10 mg/kg q2 weeks to max 30 mg/kg BD. Minimal drug interactions. Side effects: irritability, behavioural issues (supplement B6 if needed). IV and PO same bioavailability.",
    route: "PO with or without food",
  },

  {
    id: "valproate-oral",
    name: "Sodium Valproate / Valproic acid",
    category: "anticonvulsant",
    indication: "Generalised epilepsy / absence / myoclonic / maintenance after status",
    dosePerKg: 10,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 1000,
    maxDaily: 2500,
    ageMin: 2,
    withFood: true,
    formulations: [
      { conc: "200 mg/5mL (40 mg/mL)", mgPerMl: 40, brands: ["Valparin-200 syrup", "Encorate-200 syrup", "Epilex-200 syrup", "Depakene-200 syrup"] },
      { conc: "200 mg tablet", mgPerMl: null, brands: ["Valparin-200", "Encorate-200"] },
      { conc: "500 mg CR tablet", mgPerMl: null, brands: ["Valparin CR-500", "Encorate CR-500"] },
    ],
    notes: "10–15 mg/kg BD, increase by 5–10 mg/kg/week to 20–40 mg/kg/day. AVOID <2 yr (hepatotoxicity risk). Monitor LFTs, ammonia, CBC. Teratogenic — counsel in adolescent girls. CR tablet: swallow whole, do NOT crush.",
    route: "PO with food (reduces GI upset)",
  },

  {
    id: "carbamazepine-oral",
    name: "Carbamazepine",
    category: "anticonvulsant",
    indication: "Focal seizures / trigeminal neuralgia / bipolar (adjunct)",
    dosePerKg: 5,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 400,
    maxDaily: 1200,
    ageMin: 1,
    withFood: true,
    formulations: [
      { conc: "100 mg/5mL", mgPerMl: 20, brands: ["Tegretol-100 syrup", "Mazetol-100 syrup", "Carbatol-100 syrup"] },
      { conc: "200 mg tablet", mgPerMl: null, brands: ["Tegretol-200", "Mazetol-200"] },
      { conc: "200 mg CR tablet", mgPerMl: null, brands: ["Tegretol CR-200", "Carbatol-200 CR"] },
    ],
    notes: "Start low (5 mg/kg BD), titrate to 10–20 mg/kg/day ÷ BD. Autoinduction — dose may need increase after 2–4 weeks. Check HLA-B*1502 (South Asian population) before use — risk of Stevens-Johnson syndrome. Strong enzyme inducer.",
    route: "PO with food",
  },

  {
    id: "phenobarbitone-oral",
    name: "Phenobarbitone (Phenobarbital)",
    category: "anticonvulsant",
    indication: "Neonatal seizures / epilepsy (1st line in resource-limited settings)",
    dosePerKg: 3,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 200,
    maxDaily: 200,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "20 mg/5mL", mgPerMl: 4, brands: ["Gardenal-20 syrup", "Phenobarb syrup", "Luminal-20 syrup"] },
      { conc: "30 mg tablet", mgPerMl: null, brands: ["Gardenal-30", "Luminal-30"] },
      { conc: "60 mg tablet", mgPerMl: null, brands: ["Gardenal-60", "Luminal-60"] },
    ],
    notes: "Maintenance: 3–5 mg/kg OD. Sedation common initially. Cognitive side effects limit use. Still first-line for neonatal seizures in India (Piyush Gupta). Therapeutic range 15–40 mcg/mL.",
    route: "PO at bedtime (sedating)",
  },

  {
    id: "clonazepam-oral",
    name: "Clonazepam",
    category: "anticonvulsant",
    indication: "Myoclonic / absence epilepsy / spasms / anxiety",
    dosePerKg: 0.01,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 0.5,
    maxDaily: 2,
    ageMin: 1,
    withFood: false,
    formulations: [
      { conc: "0.5 mg/5mL", mgPerMl: 0.1, brands: ["Clonotril-0.5 drops/syrup", "Rivotril drops", "Lonazep drops"] },
      { conc: "0.5 mg tablet", mgPerMl: null, brands: ["Clonotril-0.5", "Rivotril-0.5", "Lonazep-0.5"] },
    ],
    notes: "Start 0.01 mg/kg BD, increase slowly. Tolerance may develop. Sedating. Useful for infantile spasms and myoclonic epilepsy. Rivotril drops: 2.5 mg/mL (25 drops = 2.5 mg).",
    route: "PO",
  },

  {
    id: "clobazam-oral",
    name: "Clobazam",
    category: "anticonvulsant",
    indication: "Adjunct epilepsy / Lennox-Gastaut / catamenial epilepsy",
    dosePerKg: 0.3,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 20,
    maxDaily: 40,
    ageMin: 6,
    withFood: false,
    formulations: [
      { conc: "5 mg/5mL", mgPerMl: 1, brands: ["Frisium-5 syrup", "Lobazam-5 syrup", "Cloba-5 suspension"] },
      { conc: "10 mg tablet", mgPerMl: null, brands: ["Frisium-10", "Cloba-10", "Lobazam-10"] },
    ],
    notes: "0.3 mg/kg BD increasing to 1 mg/kg BD. Less sedating than clonazepam. Widely used in India as adjunct for refractory epilepsy. Tolerance to sedation develops faster than anticonvulsant effect.",
    route: "PO",
  },

  {
    id: "oxcarbazepine-oral",
    name: "Oxcarbazepine",
    category: "anticonvulsant",
    indication: "Focal epilepsy (better tolerated than carbamazepine)",
    dosePerKg: 5,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 600,
    maxDaily: 2400,
    ageMin: 24,
    withFood: true,
    formulations: [
      { conc: "300 mg/5mL suspension (60 mg/mL)", mgPerMl: 60, brands: ["Oxetol-300 suspension", "Trileptal-300 susp", "Oxcarb suspension"] },
      { conc: "150 mg tablet", mgPerMl: null, brands: ["Oxetol-150", "Trileptal-150"] },
    ],
    notes: "Start 5 mg/kg BD, increase by 5 mg/kg/week to 30–46 mg/kg/day. Less enzyme induction than CBZ. Hyponatraemia risk — check Na⁺ periodically. HLA-B*1502 still relevant.",
    route: "PO with food",
  },

  // ══════════════════════════════════════════════════════════════════
  // SEDATION / ANXIOLYTICS (ORAL)
  // ══════════════════════════════════════════════════════════════════
  {
    id: "midazolam-oral",
    name: "Midazolam (oral pre-medication)",
    category: "sedation",
    indication: "Pre-procedural anxiolysis / procedural sedation pre-medication",
    dosePerKg: 0.5,
    frequency: "single",
    frequencyHours: null,
    unit: "mg",
    max: 15,
    ageMin: 6,
    withFood: false,
    formulations: [
      { conc: "Injection solution 5 mg/mL (used orally)", mgPerMl: 5, brands: ["Mezolam-5 mg/mL injection", "Versed oral (dilute injection)"] },
      { conc: "Mixed with juice (2 mg/mL in sweet syrup)", mgPerMl: 2, brands: ["Extemporaneous — dilute injection in ORS/juice"] },
    ],
    notes: "0.5 mg/kg oral 20–30 min before procedure (max 15 mg). Use injection solution (5 mg/mL) mixed with sweet juice to mask bitter taste. Onset 15–30 min, duration 60–90 min. Monitor O₂ sat. Piyush Gupta: widely used for pre-medication in Indian hospitals.",
    route: "PO mixed in sweet juice 20-30 min pre-procedure",
  },

  {
    id: "diazepam-oral",
    name: "Diazepam (oral)",
    category: "anticonvulsant",
    indication: "Seizure prophylaxis / febrile seizures / muscle spasm / anxiety",
    dosePerKg: 0.3,
    frequency: "TDS",
    frequencyHours: 8,
    unit: "mg",
    max: 10,
    maxDaily: 30,
    ageMin: 1,
    withFood: false,
    formulations: [
      { conc: "2 mg/5mL", mgPerMl: 0.4, brands: ["Calmpose-2 syrup", "Valium-2 syrup", "Paxum-2 syrup"] },
      { conc: "5 mg tablet", mgPerMl: null, brands: ["Calmpose-5", "Valium-5"] },
    ],
    notes: "Febrile seizure prophylaxis: 0.3 mg/kg TDS for duration of fever (only if high recurrence risk). PR gel (rectal): 0.5 mg/kg PR — Diastat rectal gel not available in India; use IV solution rectally. Sedating.",
    route: "PO / PR (injection solution rectally)",
  },

  {
    id: "hydroxyzine-oral",
    name: "Hydroxyzine",
    category: "sedation",
    indication: "Pre-medication anxiety / urticaria / pruritus / procedural anxiolysis",
    dosePerKg: 0.5,
    frequency: "TDS",
    frequencyHours: 8,
    unit: "mg",
    max: 25,
    maxDaily: 100,
    ageMin: 6,
    withFood: false,
    formulations: [
      { conc: "10 mg/5mL", mgPerMl: 2, brands: ["Atarax-10 syrup", "Hydroxin syrup", "Vistaril-10"] },
      { conc: "25 mg tablet", mgPerMl: null, brands: ["Atarax-25", "Hydroxin-25"] },
    ],
    notes: "Pre-op/procedural: 0.5–1 mg/kg oral 1 hr before (max 50 mg). Urticaria: 0.5 mg/kg TDS. Antihistamine with anxiolytic, antiemetic, antipruritc effects. Safe from 6 months.",
    route: "PO",
  },

  {
    id: "melatonin-oral",
    name: "Melatonin",
    category: "sedation",
    indication: "Sleep disorder / ASD sleep issues / pre-medication anxiety (adjunct)",
    dosePerKg: null,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    fixedDose: "Start 0.5–1 mg at bedtime; usual 1–5 mg; max 10 mg",
    ageMin: 24,
    withFood: false,
    formulations: [
      { conc: "1 mg tablet/capsule", mgPerMl: null, brands: ["Meloset-1", "Melzap-1", "Slenyto-1 (paeds)"] },
      { conc: "3 mg tablet", mgPerMl: null, brands: ["Meloset-3", "Melzap-3", "Circadin-3"] },
    ],
    notes: "Give 30–60 min before desired sleep time. Start low (0.5–1 mg), titrate. Well tolerated. Particularly useful in ASD/ADHD sleep problems. Not a sedative — works on circadian rhythm.",
    route: "PO 30-60 min before bedtime",
  },

  // ══════════════════════════════════════════════════════════════════
  // RESPIRATORY — BRONCHODILATORS (ORAL)
  // ══════════════════════════════════════════════════════════════════
  {
    id: "salbutamol-oral",
    name: "Salbutamol (oral syrup)",
    category: "other",
    indication: "Mild asthma / bronchospasm (nebulised/inhaled preferred)",
    dosePerKg: 0.1,
    frequency: "TDS",
    frequencyHours: 8,
    unit: "mg",
    max: 4,
    maxDaily: 12,
    ageMin: 2,
    withFood: false,
    formulations: [
      { conc: "2 mg/5mL", mgPerMl: 0.4, brands: ["Asthalin-2 syrup", "Salbetol-2", "Ventolin-2 syrup", "Salbutol-2"] },
      { conc: "4 mg/5mL", mgPerMl: 0.8, brands: ["Asthalin-4 syrup", "Salbetol-4 Forte"] },
    ],
    notes: "0.1–0.15 mg/kg TDS (max 4 mg/dose). Oral less effective than inhaled — use only when no inhaler available. Tachycardia, tremor common. Inhaled route (MDI with spacer or nebuliser) always preferred.",
    route: "PO — inhaled route strongly preferred",
  },

  {
    id: "montelukast-oral",
    name: "Montelukast (Leukotriene antagonist)",
    category: "other",
    indication: "Asthma prophylaxis / allergic rhinitis / post-viral wheeze",
    dosePerKg: null,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    fixedDose: "6–23 mo: 4 mg granules OD | 2–5 yr: 4 mg chewable OD | 6–14 yr: 5 mg OD | ≥15 yr: 10 mg OD",
    ageMin: 6,
    withFood: false,
    formulations: [
      { conc: "4 mg granule sachet (for infants)", mgPerMl: null, brands: ["Montek-4 granules", "Romilast-4 sachet", "Singulair-4 granules"] },
      { conc: "4 mg chewable tablet", mgPerMl: null, brands: ["Montek-4 LC chewable", "Romilast-4 CT", "Singulair-4 CT"] },
      { conc: "5 mg chewable tablet", mgPerMl: null, brands: ["Montek-5 LC", "Romilast-5", "Singulair-5"] },
      { conc: "10 mg tablet", mgPerMl: null, brands: ["Montek-10 LC", "Singulair-10"] },
    ],
    notes: "Give in evening. Granules mixed in 5 mL cool water/applesauce — give immediately. FDA warning: neuropsychiatric events (mood changes, nightmares) — stop if occurs. Not for acute attacks.",
    route: "PO in evening",
  },

  {
    id: "theophylline-oral",
    name: "Theophylline (oral SR)",
    category: "other",
    indication: "Chronic asthma (add-on) / apnoea of prematurity (caffeine preferred)",
    dosePerKg: 5,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 300,
    maxDaily: 600,
    ageMin: 6,
    withFood: true,
    formulations: [
      { conc: "100 mg SR capsule", mgPerMl: null, brands: ["Theo-Asthalin-100 SR", "Phyllocontin-100", "Uniphyl-100"] },
      { conc: "200 mg SR tablet", mgPerMl: null, brands: ["Theo-Asthalin-200 SR", "Phyllocontin-225"] },
    ],
    notes: "5 mg/kg BD (max 300 mg). Narrow therapeutic index — target 5–15 mcg/mL. Many drug interactions (erythromycin, ciprofloxacin increase levels). Tachycardia, seizures in overdose. Rarely used now — ICS preferred.",
    route: "PO with food at same time daily",
  },

  // ══════════════════════════════════════════════════════════════════
  // CARDIAC / ANTIHYPERTENSIVE (ORAL)
  // ══════════════════════════════════════════════════════════════════
  {
    id: "digoxin-oral",
    name: "Digoxin",
    category: "other",
    indication: "SVT / atrial flutter / heart failure with systolic dysfunction",
    dosePerKg: 0.008,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 0.25,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "0.05 mg/mL (50 mcg/mL) elixir", mgPerMl: 0.05, brands: ["Lanoxin-0.05mg/mL elixir", "Digoxin paediatric elixir", "Dilanacin drops"] },
      { conc: "0.25 mg tablet", mgPerMl: null, brands: ["Lanoxin-0.25", "Digoxin-0.25"] },
    ],
    notes: "Maintenance: 8–10 mcg/kg/day OD (preterm 5 mcg/kg). Target level 0.5–2 ng/mL. Check levels, K⁺ (hypoK increases toxicity). Narrow TI — measure levels if toxicity suspected (nausea, bradycardia, visual disturbance). Many drug interactions.",
    route: "PO on empty stomach",
  },

  {
    id: "amlodipine-oral",
    name: "Amlodipine",
    category: "other",
    indication: "Hypertension / SVT (2nd line) / Raynaud's",
    dosePerKg: 0.1,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 5,
    ageMin: 6,
    withFood: false,
    formulations: [
      { conc: "1 mg/mL extemporaneous suspension", mgPerMl: 1, brands: ["Extemporaneous 1 mg/mL in OraSweet + OraPlus"] },
      { conc: "5 mg tablet (crushed)", mgPerMl: null, brands: ["Amcard-5", "Amlip-5", "Norvasc-5", "Stamlo-5"] },
    ],
    notes: "0.1–0.2 mg/kg OD (max 5 mg, up to 10 mg in adolescents). Tablet can be crushed and suspended in 5 mL water. Long half-life — OD dosing. Ankle oedema, flushing common.",
    route: "PO at same time daily",
  },

  {
    id: "enalapril-oral",
    name: "Enalapril (ACE inhibitor)",
    category: "other",
    indication: "Hypertension / heart failure / nephrotic syndrome / cardiomyopathy",
    dosePerKg: 0.1,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 5,
    ageMin: 1,
    withFood: false,
    formulations: [
      { conc: "1 mg/mL suspension (extemporaneous)", mgPerMl: 1, brands: ["Extemporaneous — enalapril tablets crushed in OraSweet"] },
      { conc: "2.5 mg tablet (scored)", mgPerMl: null, brands: ["Enam-2.5", "Enalapril-2.5", "Envas-2.5"] },
      { conc: "5 mg tablet", mgPerMl: null, brands: ["Enam-5", "Envas-5"] },
    ],
    notes: "0.1 mg/kg OD, titrate to 0.5 mg/kg/day (max 40 mg/day). Monitor K⁺ and creatinine. AVOID in bilateral renal artery stenosis, pregnancy. Dry cough — switch to losartan if troublesome.",
    route: "PO",
  },

  {
    id: "propranolol-oral",
    name: "Propranolol (beta-blocker)",
    category: "other",
    indication: "SVT / hypertension / haemangioma / thyrotoxicosis / migraine prophylaxis",
    dosePerKg: 1,
    frequency: "TDS",
    frequencyHours: 8,
    unit: "mg",
    max: 40,
    maxDaily: 120,
    ageMin: 1,
    withFood: true,
    formulations: [
      { conc: "5 mg/5mL", mgPerMl: 1, brands: ["Ciplar-5 syrup", "Inderal-5 syrup", "Propranolol paed solution"] },
      { conc: "10 mg tablet", mgPerMl: null, brands: ["Ciplar-10", "Inderal-10"] },
      { conc: "40 mg tablet", mgPerMl: null, brands: ["Ciplar-40", "Inderal-40"] },
    ],
    notes: "SVT/HTN: 1–4 mg/kg/day ÷ TDS. Infantile haemangioma: 2–3 mg/kg/day ÷ BD. Avoid in asthma, hypoglycaemia-prone, heart block. Monitor HR. Abrupt discontinuation risk — taper.",
    route: "PO with food (consistent timing)",
  },

  // ══════════════════════════════════════════════════════════════════
  // DIURETICS (ORAL)
  // ══════════════════════════════════════════════════════════════════
  {
    id: "furosemide-oral",
    name: "Furosemide (Lasix) oral",
    category: "other",
    indication: "Oedema / heart failure / nephrotic syndrome (oral maintenance)",
    dosePerKg: 1,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 40,
    maxDaily: 80,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "10 mg/mL (40 mg/4mL) oral solution", mgPerMl: 10, brands: ["Lasix-10 mg/mL oral solution", "Frusamide oral liquid"] },
      { conc: "40 mg tablet", mgPerMl: null, brands: ["Lasix-40", "Frusamide-40", "Salurin-40"] },
    ],
    notes: "1–2 mg/kg BD PO (max 40 mg/dose). IV twice as potent as PO. Monitor K⁺, Na⁺, creatinine. Supplement potassium if prolonged use. Give in morning/afternoon (diuretic effect — avoid bedtime).",
    route: "PO in morning and afternoon",
  },

  {
    id: "spironolactone-oral",
    name: "Spironolactone",
    category: "other",
    indication: "Oedema / hypertension / heart failure / hyperaldosteronism",
    dosePerKg: 1,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 50,
    maxDaily: 200,
    ageMin: 0,
    withFood: true,
    formulations: [
      { conc: "5 mg/5mL (1 mg/mL) suspension", mgPerMl: 1, brands: ["Aldactone suspension extemporaneous", "Spiromide-1mg/mL"] },
      { conc: "25 mg tablet (can crush)", mgPerMl: null, brands: ["Aldactone-25", "Spiromide-25", "Lasilactone-25"] },
    ],
    notes: "1–3 mg/kg/day ÷ BD (max 100 mg/day). Potassium-sparing — avoid K supplements, ACE inhibitor combination (monitor K⁺). Tablet can be crushed in water. Monitor K⁺ and creatinine closely.",
    route: "PO with food",
  },

  // ══════════════════════════════════════════════════════════════════
  // THYROID
  // ══════════════════════════════════════════════════════════════════
  {
    id: "levothyroxine-oral",
    name: "Levothyroxine (T4)",
    category: "other",
    indication: "Congenital / acquired hypothyroidism",
    dosePerKg: null,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mcg",
    fixedDose: "0–3 mo: 10–15 mcg/kg/day | 3–6 mo: 8–10 mcg/kg | 6–12 mo: 6–8 mcg/kg | 1–5 yr: 5–6 mcg/kg | 6–12 yr: 4–5 mcg/kg | >12 yr: 2–3 mcg/kg",
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "25 mcg tablet (crush in 5 mL breast milk)", mgPerMl: null, brands: ["Eltroxin-25", "Thyronorm-25", "Thyrox-25"] },
      { conc: "50 mcg tablet", mgPerMl: null, brands: ["Eltroxin-50", "Thyronorm-50"] },
      { conc: "100 mcg tablet", mgPerMl: null, brands: ["Eltroxin-100", "Thyronorm-100"] },
    ],
    notes: "Crush tablet, dissolve in 5 mL breast milk or formula — give immediately. Do NOT use soy formula (reduces absorption). Give 30 min before first feed/meal. Avoid iron, calcium within 4 hr. Monitor T4/TSH 4 weekly in infants.",
    route: "PO 30 min before first feed on empty stomach",
  },

  // ══════════════════════════════════════════════════════════════════
  // IRON / HAEMATINICS
  // ══════════════════════════════════════════════════════════════════
  {
    id: "ferrous-sulfate-oral",
    name: "Elemental Iron (for IDA)",
    category: "other",
    indication: "Iron deficiency anaemia (IDA) / iron supplementation",
    dosePerKg: 3,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 200,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "Ferrous sulfate 15 mg elemental Fe/mL drops", mgPerMl: 15, brands: ["Pediron drops 15 mg/0.6mL", "Fer-In-Sol drops", "Tonoferon drops"] },
      { conc: "Ferrous ascorbate 30 mg elem Fe/5mL", mgPerMl: 6, brands: ["Orofer-XT syrup", "Feronia syrup", "Autrin syrup"] },
      { conc: "Ferrous gluconate 35 mg elem Fe/5mL", mgPerMl: 7, brands: ["Fersolate syrup", "Iberet syrup"] },
    ],
    notes: "Therapeutic: 3–6 mg/kg elemental iron OD (max 200 mg/day). Prophylaxis (IAP): 1 mg/kg OD from 6 months (formula-fed from 4 mo). Take between meals (↑absorption), avoid milk/antacids within 2 hr. Dark stools normal. Drops: 15 mg/mL — 1 mL = 15 mg elemental iron.",
    route: "PO between meals (orange juice enhances absorption)",
  },

  // ══════════════════════════════════════════════════════════════════
  // VITAMINS / SUPPLEMENTS
  // ══════════════════════════════════════════════════════════════════
  {
    id: "vitamin-d-oral",
    name: "Vitamin D3 (Cholecalciferol)",
    category: "other",
    indication: "Vitamin D deficiency / rickets / prevention / VDD",
    dosePerKg: null,
    frequency: "OD",
    frequencyHours: 24,
    unit: "IU",
    fixedDose: "Prevention: 400 IU/day (all infants) | Deficiency: 2000–4000 IU/day × 12 weeks | Rickets: 2000–6000 IU/day × 12 weeks (IAP)",
    ageMin: 0,
    withFood: true,
    formulations: [
      { conc: "400 IU/drop (1000 IU/mL) oral drops", mgPerMl: null, brands: ["D-Vit drops 400 IU/drop", "Aquasol-D drops", "Calciol drops"] },
      { conc: "1000 IU/mL oral drops", mgPerMl: null, brands: ["D-Rise 1000 drops", "Calcirol-D3 drops", "Uprise-D3 drops"] },
      { conc: "Sachet 60,000 IU (weekly/monthly)", mgPerMl: null, brands: ["D-Rise 60K sachet", "Uprise-60K", "Caldikind-60K"] },
    ],
    notes: "IAP 2022: universal supplementation 400 IU/day from birth × 1 year. Deficiency: 2000–4000 IU/day; stoss therapy (600,000 IU IM) not recommended by IAP. Give with fatty meal (fat-soluble). 60K sachets dissolved in 2–3 mL water for weekly dosing in older children.",
    route: "PO with meals (fat-soluble vitamin)",
  },

  {
    id: "calcium-oral",
    name: "Calcium (oral supplement)",
    category: "other",
    indication: "Hypocalcaemia / rickets / hypoparathyroidism / supplement",
    dosePerKg: null,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    fixedDose: "1–3 yr: 500 mg/day | 4–8 yr: 800 mg/day | 9–18 yr: 1300 mg/day (elemental calcium)",
    ageMin: 0,
    withFood: true,
    formulations: [
      { conc: "Calcium gluconate 90 mg/5mL syrup (elem Ca)", mgPerMl: 18, brands: ["Shelcal-H syrup", "Calcium Sandoz syrup", "Cal-C-Vita syrup"] },
      { conc: "Calcium carbonate 1250 mg tablet (500 mg elem Ca)", mgPerMl: null, brands: ["Shelcal-500", "Caldikind-500", "Cipcal-500"] },
    ],
    notes: "Elemental calcium = 40% of calcium carbonate, 9% of gluconate. Give with food (carbonate needs acid for absorption). Separate from iron supplements by 2 hr. For hypocalcaemia treatment — add Vit D.",
    route: "PO with meals",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIDIABETIC
  // ══════════════════════════════════════════════════════════════════
  {
    id: "metformin-oral",
    name: "Metformin",
    category: "other",
    indication: "Type 2 diabetes / insulin resistance / PCOS (>10 yr)",
    dosePerKg: null,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    fixedDose: "Start 500 mg BD with meals; increase by 500 mg/week; max 2000 mg/day (IAP/ADA)",
    ageMin: 120,
    withFood: true,
    formulations: [
      { conc: "500 mg/5mL oral solution (extemporaneous / Glucophage liquid)", mgPerMl: 100, brands: ["Glycomet-500 (tablet)", "Glucophage-500 (UK liquid — not India)"] },
      { conc: "500 mg tablet", mgPerMl: null, brands: ["Glycomet-500", "Glucophage-500", "Metlong-500"] },
    ],
    notes: "Start low, go slow to minimise GI effects. Take with meals. Hold 48 hr before contrast dye. Monitor renal function (stop if GFR <30). Lactic acidosis rare but serious.",
    route: "PO with meals",
  },

  // ══════════════════════════════════════════════════════════════════
  // ORS / REHYDRATION
  // ══════════════════════════════════════════════════════════════════
  {
    id: "ors-who",
    name: "WHO-ORS (Oral Rehydration Salts)",
    category: "fluid",
    indication: "Diarrhoea / dehydration / acute gastroenteritis",
    dosePerKg: null,
    frequency: "ad lib",
    frequencyHours: null,
    unit: "mL",
    fixedDose: "Mild dehydration: 50 mL/kg over 4 hr | Moderate: 100 mL/kg over 4 hr | Maintenance: 10 mL/kg per loose stool",
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "WHO low-osmolarity ORS sachet (75 mEq Na, 75 mmol glucose)", mgPerMl: null, brands: ["Electral sachet", "Pedialyte", "Nualyte", "WaterFirst ORS", "WHO-ORS"] },
      { conc: "WHO ORS ready-to-use 200 mL", mgPerMl: null, brands: ["Pedialyte RTD", "Enfalyte"] },
    ],
    notes: "Dissolve 1 sachet in 1 L clean water. Give small sips frequently (5 mL q1–2 min if vomiting). Never add sugar or salt extra. Continue breastfeeding. Rice-based ORS not superior to standard ORS. IAP: zinc + ORS for diarrhoea.",
    route: "PO frequent small sips",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SYRUP DOSE CALCULATOR UTILITY
// ═══════════════════════════════════════════════════════════════════════════════

export function computeSyrupDose(drug, weight) {
  if (drug.fixedDose) {
    return {
      mgDose: null,
      mlDoses: [],
      fixedDose: drug.fixedDose,
    };
  }

  let mgDose = weight * drug.dosePerKg;
  if (drug.max != null) mgDose = Math.min(mgDose, drug.max);
  if (drug.min != null) mgDose = Math.max(mgDose, drug.min);
  mgDose = +mgDose.toFixed(2);

  const mlDoses = drug.formulations
    .filter(f => f.mgPerMl != null)
    .map(f => ({
      conc: f.conc,
      brands: f.brands,
      ml: +(mgDose / f.mgPerMl).toFixed(1),
    }));

  return { mgDose, mlDoses, fixedDose: null };
}

export const ORAL_CATEGORIES = [
  { id: "all",            label: "All",              matches: null },
  { id: "analgesia",      label: "Analgesics",        matches: ["analgesia"] },
  { id: "anticonvulsant", label: "Anticonvulsants",   matches: ["anticonvulsant"] },
  { id: "sedation",       label: "Sedation",          matches: ["sedation"] },
  { id: "other",          label: "Other",             matches: ["other"] },
  { id: "fluid",          label: "Fluids / ORS",      matches: ["fluid"] },
];
