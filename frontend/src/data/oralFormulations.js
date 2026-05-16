// ═══════════════════════════════════════════════════════════════════════════════
// ORAL / SYRUP FORMULATIONS — COMPLETE INDIAN PEDIATRIC DRUG REFERENCE
// References: IAP Guidelines 2024 · Piyush Gupta Pediatric Drug Doses 18th Ed
//             Harriet Lane Handbook 22nd Ed · WHO AWaRe 2022
//             CDSCO India · NVBDCP · RNTCP · NCDC India
// ═══════════════════════════════════════════════════════════════════════════════

export const ORAL_DRUGS = [

  // ══════════════════════════════════════════════════════════════════
  // ANTIBIOTICS — PENICILLINS
  // ══════════════════════════════════════════════════════════════════
  {
    id: "amoxicillin-oral",
    name: "Amoxicillin",
    category: "antibiotic",
    indication: "Pneumonia / AOM / pharyngitis / UTI / skin infections",
    dosePerKg: 30,
    frequency: "TDS",
    frequencyHours: 8,
    unit: "mg",
    max: 500,
    maxDaily: 1500,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "125 mg/5mL", mgPerMl: 25, brands: ["Mox-125", "Novamox-125", "Amoxil-125", "Wymox-125"] },
      { conc: "250 mg/5mL", mgPerMl: 50, brands: ["Mox-250", "Novamox-250", "Amoxil-250"] },
      { conc: "500 mg DT (dispersible)", mgPerMl: null, brands: ["Mox-500 DT", "Novamox-500 DT"] },
    ],
    notes: "40–50 mg/kg/day ÷ TDS (IAP/WHO). High-dose (DRSP/AOM failure): 80–90 mg/kg/day ÷ BD. Duration: 5–7 days RTI, 7–10 days AOM. Give on empty stomach (better absorption) but food acceptable.",
    route: "PO",
  },

  {
    id: "amoxiclav-oral",
    name: "Amoxicillin-Clavulanate (Co-amoxiclav)",
    category: "antibiotic",
    indication: "AOM / sinusitis / LRTI / UTI / skin / animal bite",
    dosePerKg: 45,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 875,
    maxDaily: 1750,
    ageMin: 0,
    withFood: true,
    formulations: [
      { conc: "228.5 mg/5mL (amox 200 + clav 28.5)", mgPerMl: 40, brands: ["Augmentin-228 DS", "Moxclav-228", "Clavam-228", "Amoxyclav-228"] },
      { conc: "457 mg/5mL (amox 400 + clav 57)", mgPerMl: 80, brands: ["Augmentin-457 ES", "Moxclav-457", "Clavam-457"] },
      { conc: "625 mg tablet (amox 500 + clav 125)", mgPerMl: null, brands: ["Augmentin-625 DUO", "Moxclav-625"] },
    ],
    notes: "45 mg/kg/day ÷ BD (amoxicillin component). High-dose: 80–90 mg/kg/day for DRSP. Give with food (reduces GI effects). Add probiotic for prolonged courses. IV: Augmentin 1.2 g vial 30 mg/kg q8h.",
    route: "PO with food",
  },

  {
    id: "cloxacillin-oral",
    name: "Cloxacillin",
    category: "antibiotic",
    indication: "MSSA / impetigo / cellulitis / osteomyelitis step-down",
    dosePerKg: 25,
    frequency: "QID",
    frequencyHours: 6,
    unit: "mg",
    max: 500,
    maxDaily: 2000,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "125 mg/5mL", mgPerMl: 25, brands: ["Klox-125 DS", "Bioclox-125", "Cloxin-125"] },
      { conc: "250 mg/5mL", mgPerMl: 50, brands: ["Klox-250", "Bioclox-250"] },
      { conc: "500 mg capsule", mgPerMl: null, brands: ["Klox-500", "Bioclox-500"] },
    ],
    notes: "MUST give on empty stomach — food reduces absorption by 50%. IAP first-line for MSSA SSTIs. IV: 50 mg/kg/dose q6h (max 2 g/dose). QID dosing essential for full effect.",
    route: "PO — EMPTY STOMACH (30 min before food)",
  },

  {
    id: "ampicillin-cloxacillin-oral",
    name: "Ampicillin + Cloxacillin (Combination)",
    category: "antibiotic",
    indication: "Mixed strep + staph respiratory / skin / soft tissue infections",
    dosePerKg: 25,
    frequency: "TDS",
    frequencyHours: 8,
    unit: "mg",
    max: 500,
    maxDaily: 1500,
    ageMin: 1,
    withFood: false,
    formulations: [
      { conc: "250 mg/5mL (combination)", mgPerMl: 50, brands: ["Ampicloxa-250 suspension", "Clampicil DS", "Biocilin-CX syrup"] },
      { conc: "500 mg capsule", mgPerMl: null, brands: ["Ampicloxa-500", "Clampicil-500"] },
    ],
    notes: "25 mg/kg/dose TDS (each component). Give on empty stomach. Widely used in India for mixed coverage. Limited evidence over monotherapy but commonly prescribed.",
    route: "PO on empty stomach",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIBIOTICS — CEPHALOSPORINS (ORAL)
  // ══════════════════════════════════════════════════════════════════
  {
    id: "cefixime-oral",
    name: "Cefixime",
    category: "antibiotic",
    indication: "UTI / typhoid / AOM / LRTI / shigellosis",
    dosePerKg: 8,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 200,
    maxDaily: 400,
    ageMin: 6,
    withFood: false,
    formulations: [
      { conc: "50 mg/5mL", mgPerMl: 10, brands: ["Taxim-O 50", "Zifi-50", "Cefix-50", "Mahacef-50", "Topcef-50"] },
      { conc: "100 mg/5mL", mgPerMl: 20, brands: ["Taxim-O 100", "Zifi-100", "Cefix-100", "Mahacef-100"] },
      { conc: "200 mg tablet", mgPerMl: null, brands: ["Taxim-O 200", "Zifi-200"] },
    ],
    notes: "8 mg/kg/day OD or ÷ BD (max 400 mg/day). Typhoid (IAP): 10–15 mg/kg/day × 14 days. UTI: 8 mg/kg/day × 7 days. Shake well before use. Pineapple/mango flavour (Taxim-O). AMR note: Shigella — cefixime or azithromycin (fluoroquinolone resistance high in India).",
    route: "PO",
  },

  {
    id: "cefpodoxime-oral",
    name: "Cefpodoxime",
    category: "antibiotic",
    indication: "AOM / sinusitis / pharyngitis / UTI / mild pneumonia",
    dosePerKg: 5,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 200,
    maxDaily: 400,
    ageMin: 2,
    withFood: true,
    formulations: [
      { conc: "50 mg/5mL", mgPerMl: 10, brands: ["Cepodem-50", "Cefoprox-50", "Topcef-50 DT", "Vantin-50", "Pedocef-50"] },
      { conc: "100 mg/5mL", mgPerMl: 20, brands: ["Cepodem-100", "Cefoprox-100"] },
      { conc: "200 mg tablet", mgPerMl: null, brands: ["Cepodem-200", "Cefoprox-200"] },
    ],
    notes: "5 mg/kg/dose BD (max 200 mg/dose). Take WITH food (↑absorption 30%). Better S. pneumoniae cover than cefixime. AOM: 5 days. Good palatability.",
    route: "PO with food",
  },

  {
    id: "cefuroxime-oral",
    name: "Cefuroxime Axetil",
    category: "antibiotic",
    indication: "AOM / sinusitis / pneumonia / UTI / skin / animal bite",
    dosePerKg: 15,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 500,
    maxDaily: 1000,
    ageMin: 3,
    withFood: true,
    formulations: [
      { conc: "125 mg/5mL", mgPerMl: 25, brands: ["Ceftin-125 DS", "Supacef-125", "Zocef-125", "Altacef-125"] },
      { conc: "250 mg/5mL", mgPerMl: 50, brands: ["Ceftin-250 DS", "Supacef-250"] },
      { conc: "500 mg tablet", mgPerMl: null, brands: ["Ceftin-500", "Zocef-500"] },
    ],
    notes: "15 mg/kg/dose BD (max 500 mg/dose). MUST give with food (bioavailability doubles). 2nd gen; good H. influenzae and Moraxella cover. Bitter aftertaste — give with juice. Animal bites: 15 mg/kg BD × 5 days (IAP). IV step-down drug for pneumonia.",
    route: "PO with food",
  },

  {
    id: "cefdinir-oral",
    name: "Cefdinir",
    category: "antibiotic",
    indication: "AOM / sinusitis / pharyngitis / skin / mild pneumonia",
    dosePerKg: 7,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 300,
    maxDaily: 600,
    ageMin: 6,
    withFood: false,
    formulations: [
      { conc: "125 mg/5mL", mgPerMl: 25, brands: ["Adcef-125", "Cednir-125", "Omnicef-125"] },
      { conc: "300 mg capsule", mgPerMl: null, brands: ["Adcef-300", "Cednir-300"] },
    ],
    notes: "7 mg/kg BD or 14 mg/kg OD (max 300 mg BD or 600 mg OD). Excellent palatability (cherry/strawberry). Avoid within 2 hr of iron/antacids. Stools may turn red — harmless, warn parents. OD dosing acceptable for AOM.",
    route: "PO",
  },

  {
    id: "cefadroxil-oral",
    name: "Cefadroxil",
    category: "antibiotic",
    indication: "Strep pharyngitis / skin / UTI / osteomyelitis step-down",
    dosePerKg: 15,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 500,
    maxDaily: 1000,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "125 mg/5mL", mgPerMl: 25, brands: ["Droxyl-125 DS", "Cefastar-125", "Bioxyl-125"] },
      { conc: "250 mg/5mL", mgPerMl: 50, brands: ["Droxyl-250 DS", "Cefastar-250"] },
      { conc: "500 mg capsule", mgPerMl: null, brands: ["Droxyl-500", "Bioxyl-500"] },
    ],
    notes: "15 mg/kg BD (max 500 mg/dose) or 30 mg/kg OD for GAS pharyngitis. OD × 10 days for strep throat — improves compliance. Good palatability. Can be given with or without food. 1st gen oral cephalosporin.",
    route: "PO with or without food",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIBIOTICS — MACROLIDES
  // ══════════════════════════════════════════════════════════════════
  {
    id: "azithromycin-oral",
    name: "Azithromycin",
    category: "antibiotic",
    indication: "Atypical pneumonia / pertussis / typhoid / scrub typhus (<8yr) / pharyngitis",
    dosePerKg: 10,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 500,
    maxDaily: 500,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "100 mg/5mL", mgPerMl: 20, brands: ["Azithral-100", "Azee-100", "Zithromax-100", "Zady-100"] },
      { conc: "200 mg/5mL", mgPerMl: 40, brands: ["Azithral-200", "Azee-200", "Zithromax-200"] },
      { conc: "500 mg tablet", mgPerMl: null, brands: ["Azithral-500", "Azee-500"] },
    ],
    notes: "Standard: 10 mg/kg day 1 (max 500 mg), then 5 mg/kg days 2–5 (max 250 mg). Typhoid (IAP): 20 mg/kg OD × 7 days (max 1 g/day). Pertussis: 10 mg/kg OD × 5 days. Scrub typhus <8 yr: 10 mg/kg OD × 5 days. Give 1 hr before or 2 hr after food. QT prolongation — check ECG in neonates.",
    route: "PO — 1 hr before food",
  },

  {
    id: "clarithromycin-oral",
    name: "Clarithromycin",
    category: "antibiotic",
    indication: "Atypical pneumonia / H. pylori / pertussis / sinusitis",
    dosePerKg: 7.5,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 500,
    maxDaily: 1000,
    ageMin: 6,
    withFood: true,
    formulations: [
      { conc: "125 mg/5mL", mgPerMl: 25, brands: ["Claribid-125", "Klaricid-125", "Crixan-125", "Biaxin-125"] },
      { conc: "250 mg/5mL", mgPerMl: 50, brands: ["Claribid-250", "Klaricid-250"] },
      { conc: "500 mg tablet", mgPerMl: null, brands: ["Claribid-500", "Klaricid-500"] },
    ],
    notes: "7.5 mg/kg BD (max 500 mg/dose). H. pylori triple therapy: 7.5 mg/kg BD × 14 days. Bitter taste — mix with juice or give with food. Refrigerate suspension. Strong CYP3A4 inhibitor — check interactions (carbamazepine, statins).",
    route: "PO with food",
  },

  {
    id: "erythromycin-oral",
    name: "Erythromycin",
    category: "antibiotic",
    indication: "Pertussis / atypical pneumonia / chlamydia / GAS (penicillin allergy) / prokinetic",
    dosePerKg: 12.5,
    frequency: "QID",
    frequencyHours: 6,
    unit: "mg",
    max: 500,
    maxDaily: 2000,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "125 mg/5mL", mgPerMl: 25, brands: ["Erythrocin-125", "Eryped-125", "E-Mycin-125"] },
      { conc: "200 mg/5mL (EES)", mgPerMl: 40, brands: ["Erythrocin-200 EES", "Eryped-200"] },
      { conc: "250 mg/5mL", mgPerMl: 50, brands: ["Erythrocin-250"] },
    ],
    notes: "12.5 mg/kg QID (max 500 mg/dose). Pertussis: 10 mg/kg TDS × 14 days (IAP). Prokinetic (low-dose for gastroparesis): 3 mg/kg TDS before feeds. QT prolongation — avoid in cardiac patients, neonates. Give before food for better absorption.",
    route: "PO 30 min before food",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIBIOTICS — COTRIMOXAZOLE
  // ══════════════════════════════════════════════════════════════════
  {
    id: "cotrimoxazole-oral",
    name: "Co-trimoxazole (TMP-SMX)",
    category: "antibiotic",
    indication: "UTI / PCP prophylaxis / shigellosis / nocardia",
    dosePerKg: 4,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 160,
    maxDaily: 320,
    ageMin: 6,
    withFood: true,
    formulations: [
      { conc: "40 mg TMP + 200 mg SMX per 5mL (paed susp)", mgPerMl: 8, brands: ["Bactrim Paed suspension", "Septran Paed suspension", "Oriprim-DS susp"] },
      { conc: "80 mg TMP + 400 mg SMX tablet", mgPerMl: null, brands: ["Bactrim DS", "Septran DS", "Oriprim"] },
    ],
    notes: "Dose as TMP component: 4–6 mg/kg TMP/dose BD. PCP treatment: 5 mg/kg TMP q6–8h. PCP prophylaxis: 5 mg/kg TMP OD 3×/week. Give (TMP dose ÷ 8) mL per dose of paed suspension. Example: 10 kg child → 40 mg TMP → 5 mL BD. High resistance in India for Shigella and E. coli UTIs — culture first. Avoid in G6PD deficiency, <6 weeks age.",
    route: "PO with food",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIBIOTICS — FLUOROQUINOLONES
  // ══════════════════════════════════════════════════════════════════
  {
    id: "ciprofloxacin-oral",
    name: "Ciprofloxacin",
    category: "antibiotic",
    indication: "Typhoid (resistant) / complicated UTI / cholera / Pseudomonas (>5 yr)",
    dosePerKg: 10,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 500,
    maxDaily: 1000,
    ageMin: 60,
    withFood: false,
    formulations: [
      { conc: "250 mg/5mL", mgPerMl: 50, brands: ["Cifran-250 suspension", "Ciplox-250 susp", "Zoxan-250"] },
      { conc: "500 mg tablet", mgPerMl: null, brands: ["Cifran-500", "Ciplox-500"] },
    ],
    notes: "10–15 mg/kg BD (max 500 mg). Typhoid (resistant): 15 mg/kg BD × 7–10 days. Reserve for specific indications (resistance rising). Avoid antacids/dairy within 2 hr. Use only when no alternative in children.",
    route: "PO — avoid antacids/milk",
  },

  {
    id: "ofloxacin-oral",
    name: "Ofloxacin",
    category: "antibiotic",
    indication: "Typhoid (resistant) / complicated UTI (>5 yr)",
    dosePerKg: 7.5,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 400,
    maxDaily: 800,
    ageMin: 60,
    withFood: false,
    formulations: [
      { conc: "50 mg/5mL", mgPerMl: 10, brands: ["Zanocin-50 susp", "Oflox-50 susp", "Zenflox-50"] },
      { conc: "200 mg tablet", mgPerMl: null, brands: ["Zanocin-200", "Oflox-200"] },
    ],
    notes: "7.5 mg/kg BD (max 400 mg/dose). Typhoid (resistant): 10 mg/kg BD × 7 days. Also available as ofloxacin + metronidazole combination (Oflomac-M, Norflox-M) — widely used in India for GI infections.",
    route: "PO",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIBIOTICS — ANTI-ANAEROBIC / ANTI-PROTOZOAL
  // ══════════════════════════════════════════════════════════════════
  {
    id: "metronidazole-oral",
    name: "Metronidazole",
    category: "antibiotic",
    indication: "Amoebiasis / giardiasis / anaerobic infections / C. difficile",
    dosePerKg: 7.5,
    frequency: "TDS",
    frequencyHours: 8,
    unit: "mg",
    max: 400,
    maxDaily: 1200,
    ageMin: 0,
    withFood: true,
    formulations: [
      { conc: "200 mg/5mL", mgPerMl: 40, brands: ["Flagyl-200 susp", "Metrogyl-200 susp", "Aldezole susp", "Metronid susp"] },
      { conc: "400 mg tablet", mgPerMl: null, brands: ["Flagyl-400", "Metrogyl-400"] },
    ],
    notes: "7.5 mg/kg TDS (max 400 mg/dose). Amoebiasis (IAP): 10 mg/kg TDS × 10 days. Giardia: 5 mg/kg TDS × 5 days. Give after food to reduce nausea. PR: Metronidazole suppositories 500 mg (Flagyl suppositories) for vomiting. Avoid alcohol. Metallic taste common.",
    route: "PO with food / PR if vomiting",
  },

  {
    id: "tinidazole-oral",
    name: "Tinidazole",
    category: "antibiotic",
    indication: "Amoebiasis / giardiasis (OD dosing — better compliance)",
    dosePerKg: 50,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 2000,
    maxDaily: 2000,
    ageMin: 36,
    withFood: true,
    formulations: [
      { conc: "300 mg tablet (crushable)", mgPerMl: null, brands: ["Tiniba-300", "Fasigyn-300", "Tinvista-300"] },
      { conc: "500 mg tablet", mgPerMl: null, brands: ["Tiniba-500", "Fasigyn-500"] },
    ],
    notes: "Amoebiasis: 50 mg/kg OD × 3 days (max 2 g). Giardia: 50 mg/kg single dose (max 2 g). No standard syrup — crush 300 mg tablet, mix with jam/food. OD dosing improves compliance vs metronidazole TDS. Give with food.",
    route: "PO with food — crush tablet if needed",
  },

  {
    id: "secnidazole-oral",
    name: "Secnidazole",
    category: "antibiotic",
    indication: "Amoebiasis / giardiasis (single dose convenience — IAP recommended)",
    dosePerKg: 30,
    frequency: "single",
    frequencyHours: null,
    unit: "mg",
    max: 2000,
    ageMin: 12,
    withFood: true,
    formulations: [
      { conc: "1 g granule sachet (mix in water)", mgPerMl: null, brands: ["Secnil-1g sachet", "Flagentyl-1g", "Seczole sachet"] },
      { conc: "1.5 g tablet", mgPerMl: null, brands: ["Secnil Forte-1.5g", "Seczole-1.5g"] },
    ],
    notes: "30 mg/kg single dose (max 2 g). IAP-recommended for amoebiasis. Granule sachet: dissolve in 2–3 mL water or applesauce — give immediately. Single-dose compliance advantage ideal for outpatient management.",
    route: "PO with food",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIBIOTICS — ANTI-TYPHOIDAL
  // ══════════════════════════════════════════════════════════════════
  {
    id: "azithromycin-typhoid",
    name: "Azithromycin (Typhoid — high dose)",
    category: "antibiotic",
    indication: "Uncomplicated enteric fever — IAP 2024 first-line",
    dosePerKg: 20,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 1000,
    maxDaily: 1000,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "200 mg/5mL", mgPerMl: 40, brands: ["Azithral-200", "Azee-200", "Zithromax-200"] },
      { conc: "500 mg tablet", mgPerMl: null, brands: ["Azithral-500", "Azee-500"] },
    ],
    notes: "20 mg/kg OD × 7 days (max 1 g/day). IAP 2024 first-line for uncomplicated enteric fever. Effective against ESBL Salmonella. Outpatient treatment possible for uncomplicated cases. Switch to ceftriaxone 100 mg/kg IV if complicated (perforation/toxic/fever >5 days unresponsive).",
    route: "PO — 1 hr before food",
  },

  {
    id: "chloramphenicol-oral",
    name: "Chloramphenicol",
    category: "antibiotic",
    indication: "Typhoid (susceptible) / meningitis (penicillin allergy) — resource-limited settings",
    dosePerKg: 25,
    frequency: "QID",
    frequencyHours: 6,
    unit: "mg",
    max: 1000,
    maxDaily: 4000,
    ageMin: 1,
    withFood: false,
    formulations: [
      { conc: "125 mg/5mL", mgPerMl: 25, brands: ["Paraxin-125 suspension", "Kemicetine palmitate susp"] },
      { conc: "250 mg capsule", mgPerMl: null, brands: ["Paraxin-250", "Kemicetine-250"] },
    ],
    notes: "50–75 mg/kg/day ÷ QID (max 3–4 g/day). Typhoid: 75 mg/kg/day × 14 days. Still used in resource-limited India — cheap and widely available. AVOID in neonates (Grey Baby Syndrome). Monitor CBC weekly (aplastic anaemia risk). Confirm sensitivity — most Indian strains now resistant.",
    route: "PO on empty stomach",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIBIOTICS — ANTI-RICKETTSIAL
  // ══════════════════════════════════════════════════════════════════
  {
    id: "doxycycline-oral",
    name: "Doxycycline",
    category: "antibiotic",
    indication: "Scrub typhus / rickettsial / brucellosis / atypical pneumonia (>8 yr)",
    dosePerKg: 2.2,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 100,
    maxDaily: 200,
    ageMin: 96,
    withFood: true,
    formulations: [
      { conc: "100 mg capsule (open for children)", mgPerMl: null, brands: ["Doxybid-100", "Tetradox-100", "Biodoxi-100", "Doxt-100"] },
      { conc: "100 mg tablet (scored)", mgPerMl: null, brands: ["Doxy-1 100mg", "Doxt-SL 100mg"] },
    ],
    notes: "Only >8 years (permanent teeth staining in younger). Scrub typhus (IAP): 2.2 mg/kg OD × 7–14 days. No paediatric syrup in India — open capsule, mix with food. Take with full glass of water, remain upright 30 min (oesophageal ulcer risk). Avoid dairy/antacids within 2 hr. For <8 yr: use azithromycin 10 mg/kg OD × 5 days (IAP).",
    route: "PO with food and full glass of water",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIBIOTICS — ANTI-TB
  // ══════════════════════════════════════════════════════════════════
  {
    id: "isoniazid-oral",
    name: "Isoniazid (INH)",
    category: "antibiotic",
    indication: "TB treatment / LTBI prophylaxis",
    dosePerKg: 10,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 300,
    maxDaily: 300,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "50 mg/5mL syrup", mgPerMl: 10, brands: ["Isokin-50 syrup", "INH suspension"] },
      { conc: "100 mg/5mL syrup", mgPerMl: 20, brands: ["Isokin-100 syrup"] },
      { conc: "100 mg tablet", mgPerMl: null, brands: ["Isokin-100", "INH-100"] },
      { conc: "Combination (RNTCP FDC)", mgPerMl: null, brands: ["Rimactazid (H+R)", "Akurit-4 (H+R+E+Z)"] },
    ],
    notes: "Treatment: 10 mg/kg OD (max 300 mg). LTBI: 10 mg/kg OD × 6 months. Give pyridoxine (Vit B6) 5–10 mg/day to prevent neuropathy. Monitor LFTs monthly. Give 30 min before food for best absorption. RNTCP uses fixed-dose combinations (Akurit-4, Rimactazid).",
    route: "PO 30 min before food",
  },

  {
    id: "rifampicin-oral",
    name: "Rifampicin",
    category: "antibiotic",
    indication: "TB treatment / meningococcal prophylaxis / H. influenzae prophylaxis",
    dosePerKg: 15,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 600,
    maxDaily: 600,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "Extemporaneous 20 mg/mL syrup (pharmacy-prepared)", mgPerMl: 20, brands: ["Hospital pharmacy preparation"] },
      { conc: "150 mg capsule (open for children)", mgPerMl: null, brands: ["Rimactane-150", "R-Cin-150", "Rifadin-150"] },
      { conc: "300 mg capsule", mgPerMl: null, brands: ["Rimactane-300", "R-Cin-300"] },
      { conc: "Combination FDC", mgPerMl: null, brands: ["Rimactazid (R+H)", "Akurit-4 (R+H+E+Z)"] },
    ],
    notes: "TB: 15 mg/kg OD (max 600 mg). Meningococcal prophylaxis: 10 mg/kg q12h × 2 days (max 600 mg/dose). Open capsule, mix with jam/honey for young children. Orange-red urine/sweat/tears — warn parents (harmless). Strong enzyme inducer — check interactions. NEVER give alone (rapid resistance).",
    route: "PO 30 min before food on empty stomach",
  },

  {
    id: "pyrazinamide-oral",
    name: "Pyrazinamide (PZA)",
    category: "antibiotic",
    indication: "TB treatment intensive phase (first 2 months)",
    dosePerKg: 35,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 2000,
    maxDaily: 2000,
    ageMin: 0,
    withFood: true,
    formulations: [
      { conc: "Extemporaneous 100 mg/mL syrup", mgPerMl: 100, brands: ["Hospital pharmacy preparation"] },
      { conc: "500 mg tablet (crush for children)", mgPerMl: null, brands: ["Pyrafat-500", "PZA-Ciba-500", "Pyzina-500"] },
      { conc: "FDC combination", mgPerMl: null, brands: ["Akurit-4", "Rimstar-4"] },
    ],
    notes: "35 mg/kg OD (max 2 g). First 2 months of standard TB regimen (2HRZE/4HR). Crush tablet, mix with water/jam. Monitor uric acid (gout risk — less common in children). Monitor LFTs. Arthralgia common — treatable with NSAIDs.",
    route: "PO with food",
  },

  {
    id: "ethambutol-oral",
    name: "Ethambutol (EMB)",
    category: "antibiotic",
    indication: "TB treatment intensive phase (>5 yr only — visual monitoring needed)",
    dosePerKg: 20,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 1000,
    maxDaily: 1000,
    ageMin: 60,
    withFood: true,
    formulations: [
      { conc: "400 mg tablet (crush for children)", mgPerMl: null, brands: ["Myambutol-400", "Combutol-400"] },
      { conc: "800 mg tablet", mgPerMl: null, brands: ["Myambutol-800", "Combutol-800"] },
    ],
    notes: "20 mg/kg OD (max 1 g). CAUTION <5 yr — cannot reliably report visual changes (colour vision loss). Monitor colour vision and visual acuity monthly — refer ophthalmology if any complaint. Crush for young children. Part of 4-drug intensive phase (HRZE).",
    route: "PO with food",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIBIOTICS — ANTI-MALARIALS
  // ══════════════════════════════════════════════════════════════════
  {
    id: "artemether-lumefantrine-oral",
    name: "Artemether-Lumefantrine (AL / Coartem)",
    category: "antibiotic",
    indication: "Uncomplicated P. falciparum malaria — NVBDCP/IAP first-line oral",
    dosePerKg: null,
    frequency: "BD",
    frequencyHours: 12,
    unit: "tabs",
    fixedDose: "5–14 kg: 1 tab BD × 3 days | 15–24 kg: 2 tabs BD | 25–34 kg: 3 tabs BD | >34 kg: 4 tabs BD",
    ageMin: 0,
    withFood: true,
    formulations: [
      { conc: "20 mg artemether + 120 mg lumefantrine per tablet", mgPerMl: null, brands: ["Coartem", "Lumether", "ALU", "Artemether-L"] },
      { conc: "Dispersible paed tablet (dissolve in water)", mgPerMl: null, brands: ["Coartem Dispersible"] },
    ],
    notes: "6 doses over 3 days (0, 8, 24, 36, 48, 60 hr). MUST give with fatty food (milk, biscuit, coconut water) — lumefantrine absorption increases 16-fold. Dispersible tablet dissolves in water for infants. Avoid in first trimester. QT prolongation risk.",
    route: "PO with fatty food",
  },

  {
    id: "chloroquine-oral",
    name: "Chloroquine",
    category: "antibiotic",
    indication: "Uncomplicated P. vivax / P. malariae — NVBDCP",
    dosePerKg: 10,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 600,
    ageMin: 0,
    withFood: true,
    formulations: [
      { conc: "50 mg base/5mL syrup", mgPerMl: 10, brands: ["Lariago syrup", "Malarex syrup", "Resochin syrup"] },
      { conc: "250 mg tablet (= 150 mg base)", mgPerMl: null, brands: ["Lariago-250", "Malarex-250"] },
    ],
    notes: "10 mg base/kg day 1 & 2, then 5 mg base/kg day 3 (max 600 mg days 1–2, 300 mg day 3). P. vivax largely chloroquine-sensitive in India (NVBDCP 2023). MANDATORY: follow with primaquine for radical cure (check G6PD first). Bitter taste — mix with juice. Give after food.",
    route: "PO after food",
  },

  {
    id: "primaquine-oral",
    name: "Primaquine",
    category: "antibiotic",
    indication: "P. vivax radical cure / P. falciparum transmission blocking",
    dosePerKg: 0.25,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 15,
    maxDaily: 15,
    ageMin: 6,
    withFood: true,
    formulations: [
      { conc: "2.5 mg tablet (quarter for small children)", mgPerMl: null, brands: ["Primaquine-2.5 mg", "Malanil-2.5"] },
      { conc: "7.5 mg tablet", mgPerMl: null, brands: ["Primaquine-7.5", "Malanil-7.5"] },
    ],
    notes: "P. vivax radical cure: 0.25 mg/kg/day × 14 days (max 15 mg/day). MANDATORY G6PD screening before use — causes severe haemolysis in G6PD deficiency. Avoid <6 months, pregnancy. Give with food. Monitor Hb and urine colour (dark urine = haemolysis — STOP immediately).",
    route: "PO with food — G6PD screen MANDATORY before starting",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIBIOTICS — ANTI-FUNGAL (ORAL)
  // ══════════════════════════════════════════════════════════════════
  {
    id: "fluconazole-oral",
    name: "Fluconazole",
    category: "antibiotic",
    indication: "Candidiasis / oropharyngeal thrush / tinea / prophylaxis",
    dosePerKg: 6,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 400,
    maxDaily: 400,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "50 mg/5mL", mgPerMl: 10, brands: ["Forcan-50 susp", "Syscan-50 susp", "Zocon-50 susp", "Flucos-50"] },
      { conc: "150 mg capsule", mgPerMl: null, brands: ["Forcan-150", "Syscan-150"] },
    ],
    notes: "Invasive candida: 6–12 mg/kg/day OD (loading 12 mg/kg day 1). Oropharyngeal thrush: 3 mg/kg OD × 7 days. Prophylaxis (immunocompromised): 3–6 mg/kg OD. CYP3A4 inhibitor — check interactions (cyclosporine, tacrolimus, warfarin).",
    route: "PO with or without food",
  },

  {
    id: "nystatin-oral",
    name: "Nystatin (oral suspension)",
    category: "antibiotic",
    indication: "Oral candidiasis (thrush) / GI candida prophylaxis in neonates",
    dosePerKg: null,
    frequency: "QID",
    frequencyHours: 6,
    unit: "mL",
    fixedDose: "Neonates: 1 mL (100,000 u) QID | Infants: 2 mL (200,000 u) QID | Children: 5 mL (500,000 u) QID",
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "100,000 units/mL oral drops/suspension", mgPerMl: null, brands: ["Candid oral drops", "Nystatin suspension", "Mycostatin oral"] },
      { conc: "Clotrimazole 1% oral gel (alternative)", mgPerMl: null, brands: ["Clotrimox gel", "Canesten oral gel"] },
    ],
    notes: "Apply half dose to each side of mouth. Swish then swallow. Not absorbed systemically — acts locally. Continue 48 hr after symptoms resolve. Give after feeds, not before. Alternative: Clotrimazole 1% oral gel 4–5 times daily for older children.",
    route: "PO — swish and swallow after feeds",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIBIOTICS — ANTIPARASITIC
  // ══════════════════════════════════════════════════════════════════
  {
    id: "albendazole-oral",
    name: "Albendazole",
    category: "antibiotic",
    indication: "Intestinal helminths / neurocysticercosis / giardia / hydatid",
    dosePerKg: 7.5,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 400,
    ageMin: 12,
    withFood: true,
    formulations: [
      { conc: "200 mg/5mL", mgPerMl: 40, brands: ["Zentel-200 suspension", "Bandy-Plus susp", "Noworm susp"] },
      { conc: "400 mg tablet (chewable)", mgPerMl: null, brands: ["Zentel-400", "Bandy-400", "Noworm-400"] },
    ],
    notes: "Helminths (>2 yr): 400 mg single dose (>10 kg), 200 mg (<10 kg). NCC: 15 mg/kg/day BD × 4 weeks + dexamethasone (IAP). Giardia: 400 mg OD × 5 days. Take with fatty food (↑absorption for tissue infections). MDA programme drug.",
    route: "PO with fatty food",
  },

  {
    id: "mebendazole-oral",
    name: "Mebendazole",
    category: "antibiotic",
    indication: "Intestinal worms / pinworm / hookworm (alternative to albendazole)",
    dosePerKg: null,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    fixedDose: "Pinworm: 100 mg single dose (repeat in 2 weeks) | Others: 100 mg BD × 3 days | All ages >2 yr",
    ageMin: 24,
    withFood: false,
    formulations: [
      { conc: "100 mg/5mL suspension", mgPerMl: 20, brands: ["Mebex-100 suspension", "Vermox-100", "Wormin suspension"] },
      { conc: "100 mg chewable tablet", mgPerMl: null, brands: ["Mebex-100 chewable", "Vermox-100 CT"] },
    ],
    notes: "Pinworm: 100 mg single dose regardless of weight, repeat after 2 weeks — treat whole family. Other helminths: 100 mg BD × 3 days or 500 mg single dose. Poorly absorbed — acts locally. Safe from >2 yr. Can be chewed, swallowed, or mixed with food.",
    route: "PO with or without food",
  },

  {
    id: "ivermectin-oral",
    name: "Ivermectin",
    category: "antibiotic",
    indication: "Scabies / strongyloidiasis / filariasis (>15 kg / >5 yr)",
    dosePerKg: 0.2,
    frequency: "single",
    frequencyHours: null,
    unit: "mg",
    max: 12,
    ageMin: 60,
    withFood: false,
    formulations: [
      { conc: "3 mg tablet", mgPerMl: null, brands: ["Ivecop-3", "Scabo-3"] },
      { conc: "6 mg tablet", mgPerMl: null, brands: ["Ivecop-6", "Scabo-6"] },
      { conc: "12 mg tablet", mgPerMl: null, brands: ["Ivecop-12", "Ivermectol-12"] },
    ],
    notes: "200 mcg/kg single dose (>15 kg ONLY). Scabies: repeat day 14. Strongyloides: 200 mcg/kg OD × 2 days. No syrup in India — crush and mix with water for young children. Give fasting. Avoid <15 kg. Crusted scabies: days 1, 2, 8, 9, 15 + topical permethrin.",
    route: "PO on empty stomach",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIBIOTICS — ANTIVIRAL
  // ══════════════════════════════════════════════════════════════════
  {
    id: "acyclovir-oral",
    name: "Acyclovir",
    category: "antibiotic",
    indication: "Varicella / herpes labialis / HSV (oral maintenance after IV)",
    dosePerKg: 20,
    frequency: "QID",
    frequencyHours: 6,
    unit: "mg",
    max: 800,
    maxDaily: 3200,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "200 mg/5mL", mgPerMl: 40, brands: ["Zovirax-200 suspension", "Acivir-200 susp", "Herpex-200 susp"] },
      { conc: "400 mg tablet", mgPerMl: null, brands: ["Zovirax-400", "Acivir-400"] },
      { conc: "800 mg tablet", mgPerMl: null, brands: ["Zovirax-800", "Acivir-800"] },
    ],
    notes: "Oral varicella: 20 mg/kg QID × 5 days (max 800 mg/dose). HSV oral: 15–20 mg/kg 5× daily. IV (severe): 10–20 mg/kg q8h. Ensure adequate hydration during IV therapy (nephrotoxic if dehydrated). IV: infuse over 1 hr.",
    route: "PO — maintain adequate hydration",
  },

  // ══════════════════════════════════════════════════════════════════
  // LINEZOLID — ORAL (MRSA step-down)
  // ══════════════════════════════════════════════════════════════════
  {
    id: "linezolid-oral",
    name: "Linezolid",
    category: "antibiotic",
    indication: "MRSA / VRE / MDR-TB adjunct / bone & joint MRSA (oral step-down)",
    dosePerKg: 10,
    frequency: "TDS",
    frequencyHours: 8,
    unit: "mg",
    max: 600,
    maxDaily: 1800,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "100 mg/5mL", mgPerMl: 20, brands: ["Lizolid-100 susp", "Linox-100 susp", "Linospan-100 susp", "Zyvox-100"] },
      { conc: "600 mg tablet", mgPerMl: null, brands: ["Lizolid-600", "Linox-600"] },
    ],
    notes: "<12 yr: 10 mg/kg TDS (max 600 mg/dose). ≥12 yr: 600 mg BD. 100% oral bioavailability — switch IV to PO early (same efficacy). Monitor CBC weekly: thrombocytopenia, anaemia common >2 weeks. Avoid tyramine-rich foods (mild MAOI activity).",
    route: "PO with or without food",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANALGESICS / ANTIPYRETICS
  // ══════════════════════════════════════════════════════════════════
  {
    id: "paracetamol-oral",
    name: "Paracetamol (Acetaminophen)",
    category: "analgesia",
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
      { conc: "120 mg/5mL (infant drops)", mgPerMl: 24, brands: ["Calpol-120", "Metacin-120", "Dolo-120"] },
      { conc: "125 mg/5mL", mgPerMl: 25, brands: ["Calpol-125", "Metacin Syrup", "Febrinil-125"] },
      { conc: "250 mg/5mL", mgPerMl: 50, brands: ["Calpol-250", "Metacin Forte", "Dolo-250"] },
      { conc: "500 mg DT (dispersible tablet)", mgPerMl: null, brands: ["Calpol-500 DT", "Dolo-500 DT"] },
    ],
    notes: "15 mg/kg q4–6h (max 1 g/dose, 60 mg/kg/day). Safest analgesic for all ages including neonates. PR suppository: 125 mg/250 mg/500 mg (Calpol suppositories) for vomiting children. Avoid in hepatic disease.",
    route: "PO / PR (suppository if vomiting)",
  },

  {
    id: "ibuprofen-oral",
    name: "Ibuprofen",
    category: "analgesia",
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
      { conc: "200 mg/5mL Forte", mgPerMl: 40, brands: ["Ibugesic-200 Forte", "Brufen-200", "Nurofen-200"] },
      { conc: "400 mg tablet", mgPerMl: null, brands: ["Brufen-400", "Ibugesic-400"] },
    ],
    notes: "Avoid if dehydrated, GFR reduced, active GI bleed, <3 months, dengue suspected. Max 40 mg/kg/day. Give with food/milk to reduce GI upset.",
    route: "PO with food",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIEMETICS / GI
  // ══════════════════════════════════════════════════════════════════
  {
    id: "ondansetron-oral",
    name: "Ondansetron",
    category: "other",
    indication: "Nausea / vomiting / chemotherapy-induced emesis",
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
    notes: "Max 4 mg/dose if <15 kg; 8 mg/dose if ≥15 kg. ODT dissolves on tongue — no water needed (ideal for vomiting). Avoid in long QT syndrome. IV: 0.15 mg/kg over 15 min.",
    route: "PO / ODT (dissolves on tongue)",
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
      { conc: "1 mg/mL drops (10 mg/10mL)", mgPerMl: 1, brands: ["Domstal drops", "Motilium-1mg/mL", "Vomistop drops"] },
      { conc: "5 mg/5mL syrup", mgPerMl: 1, brands: ["Domstal-5 syrup", "Motilium-5", "Vomistop-5"] },
      { conc: "10 mg tablet", mgPerMl: null, brands: ["Domstal-10", "Motilium-10"] },
    ],
    notes: "0.25–0.5 mg/kg TDS before meals (max 10 mg/dose). Avoid >12 weeks or cardiac patients (QT risk). Give 15–30 min before feeds. EMA restricted — use shortest duration.",
    route: "PO 15–30 min before meals",
  },

  {
    id: "zinc-oral",
    name: "Zinc (ORS adjunct / diarrhoea)",
    category: "other",
    indication: "Acute diarrhoea — WHO-UNICEF / IAP mandatory protocol",
    dosePerKg: null,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    fixedDose: "<6 mo: 10 mg OD × 14 days | ≥6 mo: 20 mg OD × 14 days",
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "20 mg/5mL syrup", mgPerMl: 4, brands: ["Zincovit syrup", "Pedizinc DS", "Ziconil-20", "Zinconia syrup"] },
      { conc: "10 mg dispersible tablet", mgPerMl: null, brands: ["ZinCo-10 DT", "Zincovit DT", "Numzinc-10 DT"] },
      { conc: "20 mg dispersible tablet", mgPerMl: null, brands: ["ZinCo-20 DT", "Zincovit-20 DT"] },
    ],
    notes: "IAP/WHO mandatory for diarrhoea. Give for full 14 days even after diarrhoea stops. Dispersible tablet dissolves in 5 mL ORS/water. Reduces duration and severity of diarrhoea. Combine with ORS.",
    route: "PO with ORS",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTIHISTAMINES
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
    notes: "Minimal sedation (2nd gen). Give at bedtime if drowsiness occurs. Safe from 2 years.",
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
    notes: "R-enantiomer of cetirizine, slightly more potent at half the dose. Less sedating. From 2 years.",
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
      { conc: "2 mg/5mL", mgPerMl: 0.4, brands: ["Piriton-2 syrup", "Avil-2 syrup", "CPM syrup"] },
      { conc: "4 mg tablet", mgPerMl: null, brands: ["Piriton-4", "Avil-4"] },
    ],
    notes: "0.1 mg/kg TDS (max 4 mg/dose). Sedating (1st gen) — avoid in infants <2 yr, avoid if driving/school. Widely available and affordable.",
    route: "PO",
  },

  // ══════════════════════════════════════════════════════════════════
  // STEROIDS (ORAL)
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
      { conc: "5 mg DT (dispersible)", mgPerMl: null, brands: ["Omnacortil-5 DT", "Wysolone-5 DT"] },
    ],
    notes: "Asthma: 1–2 mg/kg OD × 3–5 days (max 40–60 mg). Nephrotic: 2 mg/kg OD × 6 weeks (max 60 mg). Give in morning with food to mimic cortisol rhythm. Taper if >7 days. Monitor BP, glucose.",
    route: "PO with food in morning",
  },

  {
    id: "dexamethasone-oral",
    name: "Dexamethasone",
    category: "other",
    indication: "Croup / cerebral oedema / anti-emetic",
    dosePerKg: 0.6,
    frequency: "single",
    frequencyHours: null,
    unit: "mg",
    max: 10,
    ageMin: 0,
    withFood: true,
    formulations: [
      { conc: "0.5 mg/5mL", mgPerMl: 0.1, brands: ["Dexona-0.5 syrup", "Wymesone syrup", "Decadron syrup"] },
      { conc: "0.5 mg tablet", mgPerMl: null, brands: ["Dexona-0.5", "Wymesone-0.5"] },
      { conc: "Injection solution used orally (4 mg/mL)", mgPerMl: 4, brands: ["Dexamethasone injection used PO"] },
    ],
    notes: "Croup: 0.6 mg/kg single dose (max 10 mg) — PO as effective as IM/IV (Piyush Gupta). Injection solution can be given orally. 25× more potent than hydrocortisone.",
    route: "PO / oral solution from injection vial",
  },

  // ══════════════════════════════════════════════════════════════════
  // ANTICONVULSANTS (ORAL)
  // ══════════════════════════════════════════════════════════════════
  {
    id: "levetiracetam-oral",
    name: "Levetiracetam",
    category: "anticonvulsant",
    indication: "Focal / generalised epilepsy / oral maintenance after status",
    dosePerKg: 10,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 1500,
    maxDaily: 3000,
    ageMin: 1,
    withFood: false,
    formulations: [
      { conc: "100 mg/mL oral solution", mgPerMl: 100, brands: ["Levepsy-100 oral solution", "Keppra-100 mg/mL", "Levroxa oral solution"] },
      { conc: "250 mg tablet", mgPerMl: null, brands: ["Levipil-250", "Keppra-250", "Levroxa-250"] },
    ],
    notes: "Start 10 mg/kg BD, increase by 10 mg/kg q2 weeks to max 30 mg/kg BD. Minimal drug interactions. Side effects: irritability, behavioural issues. IV and PO same bioavailability — oral preferred when possible.",
    route: "PO with or without food",
  },

  {
    id: "valproate-oral",
    name: "Sodium Valproate",
    category: "anticonvulsant",
    indication: "Generalised epilepsy / absence / myoclonic / maintenance",
    dosePerKg: 10,
    frequency: "BD",
    frequencyHours: 12,
    unit: "mg",
    max: 1000,
    maxDaily: 2500,
    ageMin: 24,
    withFood: true,
    formulations: [
      { conc: "200 mg/5mL (40 mg/mL)", mgPerMl: 40, brands: ["Valparin-200 syrup", "Encorate-200 syrup", "Epilex-200 syrup"] },
      { conc: "200 mg tablet", mgPerMl: null, brands: ["Valparin-200", "Encorate-200"] },
      { conc: "500 mg CR tablet (swallow whole)", mgPerMl: null, brands: ["Valparin CR-500", "Encorate CR-500"] },
    ],
    notes: "10–15 mg/kg BD, increase to 20–40 mg/kg/day. AVOID <2 yr (hepatotoxicity risk). Monitor LFTs, ammonia. Teratogenic — counsel adolescent girls. CR tablet: swallow whole, do NOT crush.",
    route: "PO with food",
  },

  {
    id: "carbamazepine-oral",
    name: "Carbamazepine",
    category: "anticonvulsant",
    indication: "Focal epilepsy / trigeminal neuralgia",
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
      { conc: "200 mg CR tablet", mgPerMl: null, brands: ["Tegretol CR-200", "Carbatol CR-200"] },
    ],
    notes: "Start 5 mg/kg BD, titrate to 10–20 mg/kg/day. Autoinduction — dose may need increase after 2–4 weeks. Check HLA-B*1502 (South Asian population) before use — SJS/TEN risk. Strong enzyme inducer.",
    route: "PO with food",
  },

  {
    id: "phenobarbitone-oral",
    name: "Phenobarbitone (Phenobarbital)",
    category: "anticonvulsant",
    indication: "Neonatal seizures / epilepsy (resource-limited 1st line)",
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
    notes: "Maintenance: 3–5 mg/kg OD. Sedation common initially. First-line for neonatal seizures in India (Piyush Gupta). Therapeutic range 15–40 mcg/mL. Give at bedtime.",
    route: "PO at bedtime",
  },

  {
    id: "clobazam-oral",
    name: "Clobazam",
    category: "anticonvulsant",
    indication: "Adjunct epilepsy / Lennox-Gastaut / refractory epilepsy",
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
      { conc: "5 mg/mL injection (used orally)", mgPerMl: 5, brands: ["Mezolam 5 mg/mL inj", "Versed (dilute in juice)"] },
      { conc: "2 mg/mL in sweet syrup (extemporaneous)", mgPerMl: 2, brands: ["Dilute injection in ORS/juice 1:1.5"] },
    ],
    notes: "0.5 mg/kg oral 20–30 min before procedure (max 15 mg). Mix injection solution with sweet juice to mask bitter taste. Onset 15–30 min, duration 60–90 min. Monitor SpO₂. Widely used for pre-medication in Indian hospitals (Piyush Gupta).",
    route: "PO mixed in sweet juice 20–30 min pre-procedure",
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
    notes: "Pre-op/procedural: 0.5–1 mg/kg oral 1 hr before (max 50 mg). Antihistamine with anxiolytic, antiemetic, antipruritic effects. Safe from 6 months.",
    route: "PO",
  },
{
    id: "Triclofos Sodium",
    name: "Triclofos (Pedicloryl)",
    category: "sedation",
    indication: "procedural sedation",
    dosePerKg: 50,
    frequency: "5mg/kg every 5 mins, upto 60 mins",
    frequencyHours: null,
    unit: "mg",
    max: null,
    maxDaily: null,
    ageMin: 1,
    withFood: false,
    formulations: [
      { conc: "500 mg/5mL", mgPerMl: 100, brands: ["Pedicloryl syrup",  "Mitflos-kid suspension", "Silence", "PediClix", "Clofris" ] },
    ],
    notes: "Initial dose: 80 mg/kg orally is the established starting dose for children undergoing non-painful diagnostic procedures.Supplemental dosing: 5 mg/kg every 5 minutes can be given starting at 30 minutes post-administration if the child remains inadequately sedated, continuing up to 60 minutes after the initial dose. Effective dose range: 25–75 mg/kg",
    route: "PO",
  },
  {
    id: "melatonin-oral",
    name: "Melatonin",
    category: "sedation",
    indication: "Sleep disorder / ASD sleep issues / pre-MRI sedation adjunct",
    dosePerKg: null,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    fixedDose: "Start 0.5–1 mg at bedtime; usual 1–5 mg; max 10 mg",
    ageMin: 24,
    withFood: false,
    formulations: [
      { conc: "1 mg tablet", mgPerMl: null, brands: ["Meloset-1", "Melzap-1", "Slenyto-1"] },
      { conc: "3 mg tablet", mgPerMl: null, brands: ["Meloset-3", "Melzap-3", "Circadin-3"] },
    ],
    notes: "Give 30–60 min before desired sleep time. Start low (0.5–1 mg), titrate slowly. Useful for ASD/ADHD sleep problems. Not a sedative — works on circadian rhythm. Well tolerated.",
    route: "PO 30–60 min before bedtime",
  },

  // ══════════════════════════════════════════════════════════════════
  // RESPIRATORY (ORAL)
  // ══════════════════════════════════════════════════════════════════
  {
    id: "montelukast-oral",
    name: "Montelukast",
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
      { conc: "4 mg granule sachet", mgPerMl: null, brands: ["Montek-4 granules", "Romilast-4 sachet", "Singulair-4 granules"] },
      { conc: "4 mg chewable tablet", mgPerMl: null, brands: ["Montek-4 LC chewable", "Romilast-4 CT"] },
      { conc: "5 mg chewable tablet", mgPerMl: null, brands: ["Montek-5 LC", "Romilast-5"] },
      { conc: "10 mg tablet", mgPerMl: null, brands: ["Montek-10 LC", "Singulair-10"] },
    ],
    notes: "Give in evening. Granules: mix in 5 mL cool water/applesauce — give immediately. FDA warning: neuropsychiatric events (mood changes, nightmares) — stop if occurs. Not for acute attacks.",
    route: "PO in evening",
  },

  // ══════════════════════════════════════════════════════════════════
  // HAEMATINICS / VITAMINS
  // ══════════════════════════════════════════════════════════════════
  {
    id: "iron-oral",
    name: "Elemental Iron",
    category: "other",
    indication: "Iron deficiency anaemia / iron supplementation",
    dosePerKg: 3,
    frequency: "OD",
    frequencyHours: 24,
    unit: "mg",
    max: 200,
    ageMin: 0,
    withFood: false,
    formulations: [
      { conc: "15 mg elemental Fe/mL drops", mgPerMl: 15, brands: ["Pediron drops", "Fer-In-Sol drops", "Tonoferon drops"] },
      { conc: "Ferrous ascorbate 30 mg elem Fe/5mL", mgPerMl: 6, brands: ["Orofer-XT syrup", "Feronia syrup", "Autrin syrup"] },
      { conc: "Ferrous gluconate 35 mg elem Fe/5mL", mgPerMl: 7, brands: ["Fersolate syrup", "Iberet syrup"] },
    ],
    notes: "Therapeutic: 3–6 mg/kg elemental iron OD (max 200 mg/day). Prophylaxis (IAP): 1 mg/kg OD from 6 months. Take between meals (↑absorption). Avoid milk/antacids within 2 hr. Dark stools normal. Pediron drops: 15 mg/mL → 1 mL = 15 mg elemental iron. Orange juice enhances absorption.",
    route: "PO between meals — orange juice enhances absorption",
  },

  {
    id: "vitamin-d-oral",
    name: "Vitamin D3 (Cholecalciferol)",
    category: "other",
    indication: "Vitamin D deficiency / rickets / prevention",
    dosePerKg: null,
    frequency: "OD",
    frequencyHours: 24,
    unit: "IU",
    fixedDose: "Prevention: 400 IU/day (all infants) | Deficiency: 2000–4000 IU/day × 12 weeks | Rickets: 2000–6000 IU/day × 12 weeks (IAP 2022)",
    ageMin: 0,
    withFood: true,
    formulations: [
      { conc: "400 IU/drop oral drops", mgPerMl: null, brands: ["D-Vit drops", "Aquasol-D drops", "Calciol drops"] },
      { conc: "1000 IU/mL oral drops", mgPerMl: null, brands: ["D-Rise 1000 drops", "Calcirol D3 drops", "Uprise-D3 drops"] },
      { conc: "60,000 IU sachet (weekly)", mgPerMl: null, brands: ["D-Rise 60K sachet", "Uprise-60K", "Caldikind-60K"] },
    ],
    notes: "IAP 2022: universal 400 IU/day from birth × 1 year. 60K sachets dissolved in 2–3 mL water for weekly dosing in older children. Give with fatty meal (fat-soluble). Stoss therapy (600,000 IU IM) not recommended by IAP.",
    route: "PO with fatty meal",
  },

  // ══════════════════════════════════════════════════════════════════
  // ORS
  // ══════════════════════════════════════════════════════════════════
  {
    id: "ors-oral",
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
      { conc: "WHO low-osmolarity ORS sachet (75 mEq Na, 75 mmol glucose) / 1 L water", mgPerMl: null, brands: ["Electral sachet", "Pedialyte", "Nualyte", "WaterFirst ORS"] },
      { conc: "Ready-to-use ORS 200 mL", mgPerMl: null, brands: ["Pedialyte RTD", "Enfalyte"] },
    ],
    notes: "Dissolve 1 sachet in 1 L clean water — do NOT add extra sugar or salt. Give small sips frequently (5 mL q1–2 min if vomiting). Continue breastfeeding. IAP: mandatory zinc + ORS for diarrhoea.",
    route: "PO — frequent small sips",
  },
];
// 1. Tramadol oral — widely used
{
  id: "tramadol-oral",
  name: "Tramadol",
  category: "analgesia",
  indication: "Moderate pain (>12 yr) / cancer pain / post-op",
  dosePerKg: 1,
  frequency: "TDS",
  frequencyHours: 8,
  unit: "mg",
  max: 100,
  maxDaily: 400,
  ageMin: 144,
  withFood: true,
  formulations: [
    { conc: "50 mg capsule", mgPerMl: null, brands: ["Tramazac-50", "Ultracet (37.5 mg tramadol + 325 mg paracetamol)", "Tramatas-50"] },
    { conc: "100 mg SR tablet", mgPerMl: null, brands: ["Tramazac-100 SR", "Dolozam-100 SR"] },
  ],
  notes: "FDA 2017: CONTRAINDICATED <12 yr. 1–2 mg/kg TDS (max 100 mg/dose). Avoid in adenotonsillectomy (ultra-rapid metabolisers). Nausea common. Lowers seizure threshold.",
  route: "PO with food",
},

// 2. Diclofenac oral
{
  id: "diclofenac-oral",
  name: "Diclofenac",
  category: "analgesia",
  indication: "Moderate pain / dysmenorrhoea / musculoskeletal / renal colic",
  dosePerKg: 1,
  frequency: "TDS",
  frequencyHours: 8,
  unit: "mg",
  max: 50,
  maxDaily: 150,
  ageMin: 12,
  withFood: true,
  formulations: [
    { conc: "25 mg/5mL syrup", mgPerMl: 5, brands: ["Voveran-25 syrup", "Reactin-D syrup", "Diclomol syrup"] },
    { conc: "50 mg tablet", mgPerMl: null, brands: ["Voveran-50", "Reactin-50", "Diclofenac (Cipla)"] },
  ],
  notes: "1 mg/kg TDS (max 50 mg/dose). Avoid dengue, dehydration, renal impairment, <12 months. Give with food. GI protection with PPI for >7 days.",
  route: "PO with food",
},

// 3. Oseltamivir — exists in drugs.js but NOT in oralFormulations.js with Indian brands
{
  id: "oseltamivir-oral",
  name: "Oseltamivir (Tamiflu)",
  category: "antibiotic",
  indication: "Influenza A/B treatment and prophylaxis",
  dosePerKg: null,
  frequency: "BD",
  frequencyHours: 12,
  unit: "mg",
  fixedDose: "<1 yr: 3 mg/kg BD | ≤15 kg: 30 mg BD | >15–23 kg: 45 mg BD | >23–40 kg: 60 mg BD | >40 kg: 75 mg BD — all × 5 days",
  ageMin: 0,
  withFood: true,
  formulations: [
    { conc: "12 mg/mL oral suspension", mgPerMl: 12, brands: ["Tamiflu suspension (Roche)", "Fluvir suspension (Glenmark)", "Osiflu suspension (Cipla)"] },
    { conc: "75 mg capsule", mgPerMl: null, brands: ["Tamiflu-75 (Roche)", "Fluvir-75", "Osiflu-75"] },
  ],
  notes: "Start within 48 hr of symptoms. ICU/severe: 150 mg BD considered. Prophylaxis: half treatment dose OD × 10 days. Give with food (reduces nausea). Suspension: shake well before use.",
  route: "PO with food",
},

// 4. Rifaximin — hepatic encephalopathy / traveller's diarrhoea
{
  id: "rifaximin-oral",
  name: "Rifaximin",
  category: "antibiotic",
  indication: "Hepatic encephalopathy / traveller's diarrhoea / IBS-D",
  dosePerKg: null,
  frequency: "TDS",
  frequencyHours: 8,
  unit: "mg",
  fixedDose: "Hepatic encephalopathy: 550 mg BD (adult) | Traveller's diarrhoea: 200 mg TDS × 3 days",
  ageMin: 144,
  withFood: false,
  formulations: [
    { conc: "200 mg tablet", mgPerMl: null, brands: ["Rcifax-200", "Xifaxan-200", "Rifagut-200"] },
    { conc: "550 mg tablet", mgPerMl: null, brands: ["Rcifax-550", "Xifaxan-550"] },
  ],
  notes: "Non-absorbable antibiotic — acts locally in GI. No significant systemic effects. Preferred over neomycin for hepatic encephalopathy (better tolerated). Limited paediatric data <12 yr.",
  route: "PO with or without food",
},

// 5. Acetazolamide oral — glaucoma, alkalinisation, AMS
{
  id: "acetazolamide-oral",
  name: "Acetazolamide",
  category: "other",
  indication: "Acute angle-closure glaucoma / altitude sickness / metabolic alkalosis / pseudotumour cerebri",
  dosePerKg: 5,
  frequency: "BD",
  frequencyHours: 12,
  unit: "mg",
  max: 250,
  maxDaily: 1000,
  ageMin: 12,
  withFood: true,
  formulations: [
    { conc: "250 mg tablet", mgPerMl: null, brands: ["Iopar-SR-250", "Diamox-250", "Acetamox-250"] },
  ],
  notes: "Glaucoma: 5–10 mg/kg BD (max 250 mg BD). Altitude sickness prophylaxis: 5 mg/kg BD starting 24 hr before ascent. Sulfonamide — avoid in sulfa allergy, renal stones. Causes diuresis + tingling in extremities.",
  route: "PO with food",
},

// 6. Prazosin oral — scorpion sting (very common India)
{
  id: "prazosin-oral",
  name: "Prazosin",
  category: "other",
  indication: "Scorpion envenomation — autonomic storm / hypertensive urgency",
  dosePerKg: 0.03,
  frequency: "q3h",
  frequencyHours: 3,
  unit: "mg",
  max: 0.5,
  ageMin: 12,
  withFood: false,
  formulations: [
    { conc: "0.5 mg tablet", mgPerMl: null, brands: ["Minipress-0.5", "Prazopress-0.5", "Sympress-0.5"] },
    { conc: "1 mg tablet", mgPerMl: null, brands: ["Minipress-1", "Prazopress-1"] },
  ],
  notes: "Scorpion: 30 mcg/kg (0.03 mg/kg) q3h PO until clinical improvement (IAP). Max 0.5 mg/dose. First dose supine (first-dose hypotension). α1-blocker reverses catecholamine surge. Continue until cool extremities/salivation resolve. Indian protocol (Bawaskar).",
  route: "PO supine for first dose",
},

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY FILTER CONFIG
// ─────────────────────────────────────────────────────────────────────────────
export const ORAL_CATEGORIES = [
  { id: "all",            label: "All",              matches: null },
  { id: "antibiotic",    label: "Antibiotics",       matches: ["antibiotic"] },
  { id: "analgesia",     label: "Analgesics",        matches: ["analgesia"] },
  { id: "anticonvulsant",label: "Anticonvulsants",   matches: ["anticonvulsant"] },
  { id: "sedation",      label: "Sedation",          matches: ["sedation"] },
  { id: "other",         label: "Other",             matches: ["other"] },
  { id: "fluid",         label: "Fluids / ORS",      matches: ["fluid"] },
];

// ─────────────────────────────────────────────────────────────────────────────
// DOSE CALCULATOR UTILITY
// ─────────────────────────────────────────────────────────────────────────────
export function computeSyrupDose(drug, weight) {
  if (drug.fixedDose) {
    return { mgDose: null, mlDoses: [], fixedDose: drug.fixedDose };
  }
  let mgDose = weight * drug.dosePerKg;
  if (drug.max  != null) mgDose = Math.min(mgDose, drug.max);
  if (drug.min  != null) mgDose = Math.max(mgDose, drug.min);
  mgDose = +mgDose.toFixed(2);

  const mlDoses = drug.formulations
    .filter(f => f.mgPerMl != null)
    .map(f => ({
      conc:   f.conc,
      brands: f.brands,
      ml:     +(mgDose / f.mgPerMl).toFixed(1),
    }));

  return { mgDose, mlDoses, fixedDose: null };
}
