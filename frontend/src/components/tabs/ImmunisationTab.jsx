// frontend/src/components/tabs/ImmunisationTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Three sections in one tab:
//   1. National Immunisation Schedule — UIP (GoI / NHM) + IAP-ACVIP 2023
//   2. Other Indian National Guidelines relevant to Paediatric Emergency
//   3. Growth & Anthropometry — BMI, Height/Weight Centiles, SAM/MAM
//
// References (Growth section):
//   • WHO Child Growth Standards 2006 (0–5 yr) — who.int/tools/child-growth-standards
//   • WHO Growth Reference 2007 (5–19 yr) — who.int/tools/growth-reference-data-for-5to19-years
//   • MoHFW India / IMNCI / CPGJ — SAM management protocols
//   • IAP Growth Charts 2015 — Indian Pediatrics 2015;52:47–55
//   • NHM SAM Guidelines 2011 (updated 2023) — mohfw.gov.in
//   • MUAC thresholds: WHO / UNICEF 2009 joint statement
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import {
  Warning, Lightbulb, CaretDown, CaretRight,
  Syringe, Baby, BookOpen, Bug, Wind,
  Brain, Drop, Shield, Heartbeat, FirstAid,
  MagnifyingGlass, X, CheckCircle, Info,
  ArrowSquareOut, Ruler, ChartBar,
} from "@phosphor-icons/react";

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 DATA — IMMUNISATION SCHEDULES (unchanged)
// ══════════════════════════════════════════════════════════════════════════════

const UIP_SCHEDULE = [
  {
    age: "Birth",
    vaccines: [
      { name: "BCG",   dose: "0.05 mL ID (neonates) / 0.1 mL (>1 mo)", route: "ID", site: "Left upper arm",   notes: "Single dose. Scar confirms successful vaccination." },
      { name: "OPV-0", dose: "2 drops",                                  route: "PO", site: "Oral",             notes: "Zero dose — before discharge from facility." },
      { name: "HBV-1", dose: "0.5 mL",                                   route: "IM", site: "Anterolateral thigh", notes: "Birth dose must be given within 24 hours." },
    ],
  },
  {
    age: "6 weeks",
    vaccines: [
      { name: "OPV-1",          dose: "2 drops", route: "PO", site: "Oral",               notes: "bivalent OPV." },
      { name: "Pentavalent-1",  dose: "0.5 mL",  route: "IM", site: "Anterolateral thigh", notes: "DTP-HBV-Hib combination." },
      { name: "fIPV-1",         dose: "0.1 mL",  route: "ID", site: "Right upper arm",    notes: "Fractional-dose IPV (intradermal)." },
      { name: "Rotavirus-1",    dose: "5 drops",  route: "PO", site: "Oral",               notes: "In states where introduced — RVV (Rotarix or Rotavac)." },
      { name: "PCV-1",          dose: "0.5 mL",  route: "IM", site: "Anterolateral thigh", notes: "In states where introduced." },
    ],
  },
  {
    age: "10 weeks",
    vaccines: [
      { name: "OPV-2",         dose: "2 drops", route: "PO", site: "Oral",                notes: "" },
      { name: "Pentavalent-2", dose: "0.5 mL",  route: "IM", site: "Anterolateral thigh", notes: "" },
      { name: "Rotavirus-2",   dose: "5 drops",  route: "PO", site: "Oral",               notes: "" },
      { name: "PCV-2",         dose: "0.5 mL",  route: "IM", site: "Anterolateral thigh", notes: "In states where introduced." },
    ],
  },
  {
    age: "14 weeks",
    vaccines: [
      { name: "OPV-3",         dose: "2 drops", route: "PO", site: "Oral",                notes: "" },
      { name: "Pentavalent-3", dose: "0.5 mL",  route: "IM", site: "Anterolateral thigh", notes: "" },
      { name: "fIPV-2",        dose: "0.1 mL",  route: "ID", site: "Right upper arm",    notes: "Second fractional IPV dose." },
      { name: "Rotavirus-3",   dose: "5 drops",  route: "PO", site: "Oral",               notes: "" },
      { name: "PCV-3",         dose: "0.5 mL",  route: "IM", site: "Anterolateral thigh", notes: "" },
    ],
  },
  {
    age: "9 months",
    vaccines: [
      { name: "MR-1",   dose: "0.5 mL", route: "SC", site: "Right upper arm",   notes: "Measles-Rubella. Minimum age 9 completed months." },
      { name: "fIPV-3", dose: "0.1 mL", route: "ID", site: "Right upper arm",   notes: "Third fractional IPV — introduced January 2023." },
      { name: "JE-1",   dose: "0.5 mL", route: "SC", site: "Right upper arm",   notes: "JE-endemic districts only (SA 14-14-2 live vaccine)." },
      { name: "VitA-1", dose: "100,000 IU", route: "PO", site: "Oral",         notes: "Vitamin A supplementation." },
    ],
  },
  {
    age: "16–24 months",
    vaccines: [
      { name: "DPT booster-1", dose: "0.5 mL", route: "IM", site: "Anterolateral thigh", notes: "Whole-cell pertussis booster." },
      { name: "OPV booster",   dose: "2 drops", route: "PO", site: "Oral",                notes: "" },
      { name: "MR-2",          dose: "0.5 mL", route: "SC", site: "Right upper arm",      notes: "Measles-Rubella second dose." },
      { name: "JE-2",          dose: "0.5 mL", route: "SC", site: "Right upper arm",      notes: "JE-endemic districts — 4 weeks after JE-1." },
      { name: "VitA-2",        dose: "200,000 IU", route: "PO", site: "Oral",             notes: "Every 6 months until 5 years." },
    ],
  },
  {
    age: "5–6 years",
    vaccines: [
      { name: "DPT booster-2", dose: "0.5 mL", route: "IM", site: "Anterolateral thigh", notes: "School entry booster." },
    ],
  },
  {
    age: "10 years",
    vaccines: [
      { name: "Td", dose: "0.5 mL", route: "IM", site: "Deltoid", notes: "Tetanus + Diphtheria. Replaces TT at adolescence." },
    ],
  },
  {
    age: "16 years",
    vaccines: [
      { name: "Td", dose: "0.5 mL", route: "IM", site: "Deltoid", notes: "Final Td booster in UIP schedule." },
    ],
  },
  {
    age: "Pregnant women",
    vaccines: [
      { name: "Td-1", dose: "0.5 mL", route: "IM", site: "Upper arm", notes: "Early pregnancy (before 12 weeks if possible). If previously immunised, give one booster dose." },
      { name: "Td-2", dose: "0.5 mL", route: "IM", site: "Upper arm", notes: "At least 4 weeks after Td-1." },
    ],
  },
];

const IAP_SCHEDULE = [
  {
    age: "Birth",
    vaccines: [
      { name: "BCG",    mandatory: true,  dose: "0.05–0.1 mL",  route: "ID",  notes: "Single dose at birth." },
      { name: "OPV-0",  mandatory: true,  dose: "2 drops",       route: "PO",  notes: "Before discharge." },
      { name: "HBV-1",  mandatory: true,  dose: "0.5 mL",        route: "IM",  notes: "Within 24 hr of birth." },
    ],
  },
  {
    age: "6 weeks",
    vaccines: [
      { name: "DTwP-1 or DTaP-1",  mandatory: true,  dose: "0.5 mL", route: "IM", notes: "IAP permits both DTwP and DTaP. DTaP preferred if affordable." },
      { name: "IPV-1",              mandatory: true,  dose: "0.5 mL", route: "IM", notes: "Full-dose IM IPV (differs from NIP fractional dose)." },
      { name: "Hib-1",              mandatory: true,  dose: "0.5 mL", route: "IM", notes: "Part of pentavalent or hexavalent combination." },
      { name: "HBV-2",              mandatory: true,  dose: "0.5 mL", route: "IM", notes: "" },
      { name: "Rotavirus-1",        mandatory: true,  dose: "5 drops (RV1) or 1.5 mL (RV5)", route: "PO", notes: "Rotarix (2 doses) or Rotavac/RotaSiil (3 doses). Start by 15 weeks." },
      { name: "PCV-1",              mandatory: true,  dose: "0.5 mL", route: "IM", notes: "PCV10 or PCV13 or PCV15." },
    ],
  },
  {
    age: "10 weeks",
    vaccines: [
      { name: "DTwP-2 or DTaP-2",  mandatory: true, dose: "0.5 mL", route: "IM", notes: "" },
      { name: "IPV-2",             mandatory: true, dose: "0.5 mL", route: "IM", notes: "" },
      { name: "Hib-2",             mandatory: true, dose: "0.5 mL", route: "IM", notes: "" },
      { name: "HBV-3",             mandatory: true, dose: "0.5 mL", route: "IM", notes: "" },
      { name: "Rotavirus-2",       mandatory: true, dose: "5 drops (RV1) or 1.5 mL (RV5)", route: "PO", notes: "" },
      { name: "PCV-2",             mandatory: true, dose: "0.5 mL", route: "IM", notes: "" },
    ],
  },
  {
    age: "14 weeks",
    vaccines: [
      { name: "DTwP-3 or DTaP-3",  mandatory: true, dose: "0.5 mL", route: "IM", notes: "" },
      { name: "IPV-3",             mandatory: true, dose: "0.5 mL", route: "IM", notes: "" },
      { name: "Hib-3",             mandatory: true, dose: "0.5 mL", route: "IM", notes: "" },
      { name: "Rotavirus-3",       mandatory: true, dose: "1.5 mL (RV5 only — 3rd dose not needed for RV1)", route: "PO", notes: "Rotarix only needs 2 doses." },
      { name: "PCV-3",             mandatory: true, dose: "0.5 mL", route: "IM", notes: "" },
    ],
  },
  {
    age: "6 months",
    vaccines: [
      { name: "Influenza-1",  mandatory: false, dose: "0.25 mL (<3 yr) / 0.5 mL (≥3 yr)", route: "IM", notes: "2 doses 4 weeks apart if first-time. Annually thereafter. IIV preferred." },
    ],
  },
  {
    age: "9 months",
    vaccines: [
      { name: "MR / MMR-1",  mandatory: true, dose: "0.5 mL", route: "SC", notes: "IAP recommends MMR over MR if affordable. Min 9 completed months." },
      { name: "Typhoid CV-1",mandatory: false, dose: "0.5 mL", route: "IM", notes: "TCV (Typbar-TCV or Typhibev) from 9 months. Single dose." },
    ],
  },
  {
    age: "12 months",
    vaccines: [
      { name: "HBV-4 (if needed)", mandatory: false, dose: "0.5 mL", route: "IM", notes: "Only if birth dose was missed (high-risk). Otherwise 3 doses sufficient." },
      { name: "Hepatitis A-1",     mandatory: false, dose: "0.5 mL", route: "IM", notes: "2 doses 6 months apart OR single live attenuated dose (Biovac-A / HAVpur) from 12 months." },
    ],
  },
  {
    age: "12–15 months",
    vaccines: [
      { name: "MMR-1",      mandatory: true,  dose: "0.5 mL", route: "SC", notes: "If MR given at 9 months, MMR at 15 months." },
      { name: "Varicella-1",mandatory: false, dose: "0.5 mL", route: "SC", notes: "From 12 months. Give if not already immune." },
      { name: "PCV booster",mandatory: true,  dose: "0.5 mL", route: "IM", notes: "" },
    ],
  },
  {
    age: "16–18 months",
    vaccines: [
      { name: "DTwP B1 or DTaP B1", mandatory: true, dose: "0.5 mL", route: "IM", notes: "First DTP booster." },
      { name: "IPV B1",              mandatory: true, dose: "0.5 mL", route: "IM", notes: "" },
      { name: "Hib booster",         mandatory: true, dose: "0.5 mL", route: "IM", notes: "" },
      { name: "MMR-2",               mandatory: true, dose: "0.5 mL", route: "SC", notes: "Or MR-2 if MMR not used earlier." },
    ],
  },
  {
    age: "18 months",
    vaccines: [
      { name: "Hepatitis A-2", mandatory: false, dose: "0.5 mL", route: "IM", notes: "Second dose of HA (killed vaccine schedule) 6 months after first." },
      { name: "Varicella-2",   mandatory: false, dose: "0.5 mL", route: "SC", notes: "IAP-ACVIP 2023: 2nd dose 3–6 months after 1st dose (min interval 3 months)." },
    ],
  },
  {
    age: "2 years",
    vaccines: [
      { name: "Typhoid CV booster", mandatory: false, dose: "0.5 mL", route: "IM", notes: "If TCV given at 9 months — booster at 2 years optional (IAP 2023)." },
    ],
  },
  {
    age: "4–6 years",
    vaccines: [
      { name: "DTwP B2 or DTaP B2", mandatory: true,  dose: "0.5 mL", route: "IM", notes: "Second booster." },
      { name: "IPV B2",              mandatory: true,  dose: "0.5 mL", route: "IM", notes: "IAP recommends IPV booster at 4–6 yr. Can be combined with DTP." },
      { name: "MMR-3",               mandatory: false, dose: "0.5 mL", route: "SC", notes: "Optional third MMR dose at school entry." },
      { name: "Varicella-3",         mandatory: false, dose: "0.5 mL", route: "SC", notes: "Optional catch-up / third dose at school entry." },
    ],
  },
  {
    age: "9–14 years (Girls)",
    vaccines: [
      { name: "HPV-1", mandatory: false, dose: "0.5 mL", route: "IM", notes: "2-dose schedule if 9–14 yr: 0 and 6 months. 9vHPV (Gardasil-9) preferred by ACVIP 2023." },
      { name: "HPV-2", mandatory: false, dose: "0.5 mL", route: "IM", notes: "6 months after dose 1. 3-dose schedule if ≥15 yr or immunocompromised (0, 1–2, 6 months)." },
    ],
  },
  {
    age: "9–14 years (Boys) — NEW 2023",
    vaccines: [
      { name: "HPV-1 (Boys)", mandatory: false, dose: "0.5 mL", route: "IM", notes: "ACVIP 2023 NEW: HPV vaccine now recommended for boys. 2-dose schedule for 9–14 yr." },
      { name: "HPV-2 (Boys)", mandatory: false, dose: "0.5 mL", route: "IM", notes: "6 months after dose 1. Prevents HPV-related cancers and genital warts in males." },
    ],
  },
  {
    age: "10–12 years",
    vaccines: [
      { name: "Tdap",         mandatory: false, dose: "0.5 mL", route: "IM", notes: "Single booster replacing DTP. Preferred over Td at this age if pertussis cover desired." },
      { name: "Meningococcal",mandatory: false, dose: "0.5 mL", route: "IM", notes: "MenACWY — hostel students, Hajj pilgrims, asplenia, travel to endemic zones." },
    ],
  },
  {
    age: "16–18 years — NEW 2023",
    vaccines: [
      { name: "Td", mandatory: false, dose: "0.5 mL", route: "IM", notes: "ACVIP 2023 NEW: Final Td booster at 16–18 yr. Aligns with NIP Td at 16 yr." },
    ],
  },
];

const SPECIAL_VACCINES = [
  {
    category: "JE (Japanese Encephalitis)",
    color: "emerald",
    when: "Endemic districts only (Kerala, Karnataka, TN, UP, Bihar, WB, Assam, Odisha, Goa, Haryana)",
    schedule: "2 doses SC at 9 months and 16–24 months (SA 14-14-2 live attenuated). JE-MB killed vaccine phased out.",
    notes: "Single dose live attenuated provides long-lasting immunity. Check NVBDCP for current endemic district list.",
  },
  {
    category: "Rabies Post-Exposure Prophylaxis (PEP)",
    color: "red",
    when: "ANY animal bite or scratch — do not delay",
    schedule: "PCEC or PVRV: IM day 0, 3, 7, 14, 28 (5-dose Essen) OR 2-site ID: 0.1 mL ×2 sites on days 0, 3, 7, 28 (4-visit Thai Red Cross).",
    notes: "RIG: 20 IU/kg infiltrated at wound site on Day 0 for WHO Category III bites. Wound wash with soap + water 15 min — most important first aid.",
  },
  {
    category: "Cholera (Oral Cholera Vaccine — OCV)",
    color: "sky",
    when: "Outbreak control, travel to endemic area, refugee camps",
    schedule: "Shanchol (killed bivalent OCV): 2 doses ≥2 weeks apart. From 1 year. Single dose may be used in outbreak response.",
    notes: "Not in routine UIP. Available under emergency outbreak response by NCDC/IDSP.",
  },
  {
    category: "Influenza (Annual)",
    color: "amber",
    when: "All children >6 months annually. High-risk: asthma, CHD, immunocompromised, diabetes, obesity.",
    schedule: "IIV: 0.25 mL <3 yr / 0.5 mL ≥3 yr IM. 2 doses 4 wk apart if first-time. Annually before monsoon season.",
    notes: "LAIV not widely available in India. IIV preferred. Egg allergy no longer a contraindication (IAP 2023).",
  },
  {
    category: "Varicella (Chickenpox)",
    color: "violet",
    when: "12 months–12 years (susceptible). All adolescents without prior disease or vaccine.",
    schedule: "2 doses: 12–15 months and 15–18 months (min 3 months apart). IAP 2023 endorses 2-dose schedule universally.",
    notes: "Do not give to immunocompromised. Avoid salicylates 6 weeks after vaccination. Indian brands: Varilrix, Varivax.",
  },
  {
    category: "Meningococcal",
    color: "rose",
    when: "High-risk: asplenia, complement deficiency, travellers to meningitis belt/Hajj, hostel entry, freshers.",
    schedule: "MenACWY: single dose from 2 years. Booster every 5 years if ongoing risk. MenB: Bexsero 0.5 mL IM × 2 doses.",
    notes: "Mandatory for Saudi Arabia Hajj/Umrah visa. Not in routine UIP.",
  },
  {
    category: "Hepatitis A",
    color: "teal",
    when: "All children from 12 months",
    schedule: "Killed (2 doses 6–12 months apart from 12 months). Live attenuated (Biovac-A/HAVpur): single dose from 12 months — IAP 2023 accepts single-dose live attenuated.",
    notes: "Single-dose live vaccine increasingly preferred for simplicity. ACVIP 2024 — live attenuated single dose endorsed.",
  },
  {
    category: "Typhoid Conjugate Vaccine (TCV)",
    color: "orange",
    when: "All children from 9 months",
    schedule: "Typbar-TCV or Typhibev: single dose IM from 9 months. Booster optional at 2 years if given early. Re-vaccination every 3–5 years if ongoing risk.",
    notes: "TCV superior immunogenicity to plain polysaccharide (Vi-PS) vaccine. Vi-PS not recommended <2 yr.",
  },
  {
    category: "BCG at Birth — Delayed/Missed",
    color: "slate",
    when: "BCG can be given up to 1 year of age without tuberculin test. After 1 year — tuberculin test first.",
    schedule: "Single ID dose 0.05 mL neonates / 0.1 mL ≥1 month. Left deltoid insertion.",
    notes: "Low-birth-weight infants (<2 kg): delay BCG until weight ≥2 kg. HIV-exposed: give BCG at birth if asymptomatic.",
  },
];

const NIP_VS_IAP = [
  { topic: "Pertussis component", nip: "DTwP (whole-cell) — free", iap: "DTaP (acellular) preferred if affordable; DTwP acceptable" },
  { topic: "IPV route/dose",      nip: "0.1 mL ID fractional (3 doses at 6, 14 wk, 9 mo)", iap: "0.5 mL IM full dose (3 primary + 2 boosters)" },
  { topic: "Rotavirus",           nip: "Free in select states (Rotarix or Rotavac)", iap: "Mandatory — all children" },
  { topic: "PCV",                 nip: "Free in select states", iap: "Mandatory — PCV10/13/15 (3 doses + booster)" },
  { topic: "MMR vs MR",           nip: "MR at 9–12 months and 16–24 months", iap: "MMR preferred; 2 doses at 12 and 15–18 months" },
  { topic: "Hepatitis A",         nip: "Not included", iap: "Mandatory from 12 months" },
  { topic: "Typhoid",             nip: "Not in national schedule", iap: "TCV from 9 months (mandatory)" },
  { topic: "Varicella",           nip: "Not included", iap: "2 doses (12–15 months, 15–18 months)" },
  { topic: "HPV",                 nip: "Girls 9–14 yr in select states", iap: "Girls AND boys 9–14 yr — 9vHPV preferred (ACVIP 2023 NEW)" },
  { topic: "Influenza",           nip: "Not included", iap: "Annual from 6 months" },
  { topic: "Td booster 16–18 yr",nip: "Td at 10 and 16 yr", iap: "NEW 2023: additional Td at 16–18 yr" },
];

const CATCH_UP_PRINCIPLES = [
  "Never restart a vaccine series — continue from where left off regardless of gap between doses.",
  "Give all due vaccines at the same visit (different sites) — no need to space out unless specifically contraindicated.",
  "Minimum age and minimum intervals must be respected — cannot accelerate beyond these.",
  "OPV: any child <5 years who has never received OPV should get 2 doses 4 weeks apart.",
  "IPV: switch from NIP fIPV to IAP full-dose IM IPV — give full-dose IM IPV at next visit, then complete as per IAP schedule.",
  "MR/MMR: if MR was given at 9 months under NIP, give MMR at 15 months and again at 4–6 years.",
  "PCV: 2–11 months with no prior PCV — 2 doses 8 weeks apart + booster at 12–15 months. 12–23 months — 2 doses 8 weeks apart. >2 years — single dose.",
  "Typhoid: if TCV given between 9–23 months — optional booster at 2 years.",
  "Varicella: if given only 1 dose historically — add second dose at next visit (min 3 months after first).",
  "HPV: if started late (≥15 yr) — 3-dose schedule at 0, 1–2, and 6 months regardless of sex.",
];

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 DATA — NATIONAL GUIDELINES (unchanged)
// ══════════════════════════════════════════════════════════════════════════════

const NATIONAL_GUIDELINES = [
  {
    id: "nnf",
    org: "National Neonatology Forum (NNF)",
    fullName: "NNF — National Neonatology Forum of India",
    icon: Baby,
    color: "rose",
    url: "https://www.nnfi.org",
    relevance: "NNF guidelines are the primary reference for neonatal care in India and complement IAP recommendations for neonatal emergencies.",
    guidelines: [
      {
        title: "NNF CPG — Neonatal Resuscitation (NRP-India)",
        year: "2021",
        keyPoints: [
          "Delayed cord clamping ≥60 seconds for non-depressed term and preterm infants",
          "T-piece resuscitator recommended over self-inflating bag for preterm (better PEEP, sustained inflations)",
          "Initial FiO₂: term = 0.21 (room air); preterm <35 wk = 0.21–0.30; titrate by SpO₂",
          "HR check: auscultation or ECG preferred over pulse oximetry (more accurate in first minutes)",
          "SpO₂ targets: 1 min 60–65%, 3 min 70–75%, 5 min 80–85%, 10 min 85–95%",
          "Adrenaline IV/IO: 0.01–0.03 mg/kg (0.1–0.3 mL/kg of 1:10,000) — IV preferred over ETT",
          "Volume expansion: 10 mL/kg NS over 5–10 min for suspected hypovolaemia",
        ],
        tags: ["Neonatal", "Resuscitation"],
      },
      {
        title: "NNF CPG — Neonatal Sepsis",
        year: "2022",
        keyPoints: [
          "Early-onset sepsis (EOS, <72 hr): Ampicillin + Gentamicin (once-daily dosing) first-line",
          "Late-onset sepsis (LONS, >72 hr): Pip-Tazo or Cloxacillin + Amikacin; adjust based on local antibiogram",
          "Blood culture before first antibiotic dose — mandatory",
          "Minimum 7–10 days for confirmed sepsis; 5 days if culture-negative and clinically well",
          "Lumbar puncture: mandatory in confirmed bacteraemia, any unwell neonate",
          "CRP not sufficient alone — use in conjunction with clinical assessment and cultures",
          "Procalcitonin: rises physiologically in first 48 hr in neonates — interpret cautiously",
        ],
        tags: ["Neonatal", "Infection"],
      },
      {
        title: "NNF CPG — ROP (Retinopathy of Prematurity) Screening",
        year: "2010 (updated 2022)",
        keyPoints: [
          "Screen all infants ≤1750 g birth weight OR ≤34 weeks gestation",
          "Also screen 1750–2000 g or 34–36 wk if risk factors: oxygen therapy, ventilation, haemodynamic instability",
          "First examination: 4 weeks after birth OR at 32 weeks PMA — whichever is later",
          "Laser photocoagulation or anti-VEGF for Type 1 ROP",
          "NICU oxygen saturation target: 91–95% for preterm <36 wk to reduce ROP risk",
        ],
        tags: ["Neonatal", "Ophthalmology"],
      },
      {
        title: "NNF CPG — Hyperbilirubinaemia in Neonates",
        year: "2022",
        keyPoints: [
          "Transcutaneous bilirubin (TcB) screening recommended for all neonates before discharge",
          "Use Bhutani nomogram or AAP phototherapy thresholds (hour-specific bilirubin levels)",
          "Phototherapy: irradiance ≥10 µW/cm²/nm at skin surface. Intensive: ≥30 µW/cm²/nm",
          "Exchange transfusion threshold: TSB 5 mg/dL above phototherapy level OR clinical signs of bilirubin encephalopathy",
          "G6PD deficiency: common in India — screen at-risk populations; these neonates need earlier intervention",
          "Rebound bilirubin check 12–24 hr after stopping phototherapy in infants with haemolytic disease",
        ],
        tags: ["Neonatal", "Jaundice"],
      },
    ],
  },
  {
    id: "ntep",
    org: "NTEP / RNTCP",
    fullName: "National TB Elimination Programme (formerly RNTCP) — MoHFW India",
    icon: Wind,
    color: "amber",
    url: "https://tbcindia.gov.in",
    relevance: "India has the world's highest TB burden. NTEP guidelines govern paediatric TB diagnosis and treatment in the public sector.",
    guidelines: [
      {
        title: "NTEP Paediatric TB Guidelines 2022",
        year: "2022",
        keyPoints: [
          "Diagnosis: clinical + microbiological (GeneXpert preferred over smear). Chest X-ray, Mantoux, IGRA as supportive",
          "Mantoux: ≥10 mm induration in immunocompetent, ≥5 mm in immunocompromised/malnourished = positive",
          "Treatment: 2HRZE/4HR for new cases. Piyush Gupta doses — H 10, R 15, Z 35, E 20 mg/kg/day",
          "FDC paediatric tablets (Akurit-4, Rimstar-4) — weight-based using NTEP bands",
          "LTBI (latent TB) treatment: INH 10 mg/kg OD × 6 months for contacts of smear-positive index case",
          "MDR-TB in children: refer to designated drug-resistant TB centre. Bedaquiline approved ≥6 yr",
          "BCG vaccination remains in UIP — protects against disseminated TB and TB meningitis in children",
          "NIKSHAY registration mandatory for all TB patients — private sector also",
        ],
        tags: ["Infection", "Respiratory", "Chronic"],
      },
    ],
  },
  {
    id: "nvbdcp",
    org: "NVBDCP",
    fullName: "National Vector-Borne Disease Control Programme — MoHFW India",
    icon: Bug,
    color: "emerald",
    url: "https://nvbdcp.gov.in",
    relevance: "Governs malaria, dengue, chikungunya, JE, kala-azar, and filariasis. India-specific treatment protocols differ from WHO in some areas.",
    guidelines: [
      {
        title: "NVBDCP National Malaria Guidelines 2023",
        year: "2023",
        keyPoints: [
          "P. vivax: Chloroquine 10 mg base/kg D1–2, then 5 mg base/kg D3 + Primaquine 0.25 mg/kg OD × 14 days (after G6PD testing)",
          "P. falciparum (uncomplicated): Artemether-Lumefantrine BD × 3 days weight-based + single-dose Primaquine 0.25 mg/kg D1",
          "P. falciparum (severe): IV Artesunate 2.4 mg/kg at 0, 12, 24 hr then OD — minimum 3 doses IV",
          "Mixed infection (P.f + P.v): treat as falciparum + add primaquine for 14 days",
          "G6PD testing mandatory before primaquine — single qualitative test sufficient",
          "Kala-azar: Liposomal Amphotericin B 10 mg/kg single dose — first-line (NVBDCP free in endemic districts)",
        ],
        tags: ["Infection", "Tropical"],
      },
      {
        title: "NVBDCP National Dengue Guidelines 2021",
        year: "2021",
        keyPoints: [
          "Group A (no warning signs): oral fluids, paracetamol only — outpatient management",
          "Group B (warning signs or comorbidities): IV NS/RL 5–7 mL/kg/hr; taper stepwise; monitor HCT q4–6h",
          "Group C (severe/shock): 10–20 mL/kg crystalloid over 15–30 min → reassess → colloid if persistent shock",
          "No NSAIDs, no aspirin, no steroids, no empirical antibiotics",
          "Platelets: transfuse ONLY if <10,000 OR active significant bleeding — not prophylactically",
          "NS1 antigen: positive D1–5; IgM: positive from D5; both together for acute phase diagnosis",
          "Dengue haemorrhagic fever/DSS: watch for critical phase D3–7 (fever defervescence = highest risk)",
        ],
        tags: ["Infection", "Tropical", "Emergency"],
      },
      {
        title: "JE (Japanese Encephalitis) Management Guidelines",
        year: "2019",
        keyPoints: [
          "No specific antiviral — supportive care only",
          "JE endemic in >90 districts across 20 states — highest incidence Bihar, UP, Assam",
          "Suspect JE: acute encephalitis + fever in endemic area. Confirm: IgM ELISA CSF or serum",
          "Manage raised ICP: head elevation 30°, mannitol 0.5 g/kg, avoid hypotonic fluids",
          "Convulsions: levetiracetam or valproate preferred over phenytoin in encephalitis",
        ],
        tags: ["Infection", "Neurology", "Endemic"],
      },
    ],
  },
  {
    id: "ncdc",
    org: "NCDC / IDSP",
    fullName: "National Centre for Disease Control / Integrated Disease Surveillance Programme",
    icon: Shield,
    color: "sky",
    url: "https://ncdc.gov.in",
    relevance: "IDSP governs outbreak response and notifiable disease reporting. Key for infectious disease management and antimicrobial stewardship in India.",
    guidelines: [
      {
        title: "NCDC Antimicrobial Stewardship Guidelines 2023 (AWaRe India)",
        year: "2023",
        keyPoints: [
          "WHO AWaRe classification: Access / Watch / Reserve — applied to Indian empirical prescribing",
          "Access group first-line for community infections: amoxicillin, co-amoxiclav, cefixime, cotrimoxazole, metronidazole",
          "Watch group (restricted): ceftriaxone, ciprofloxacin, meropenem, vancomycin — only with clinical justification",
          "Reserve (last resort): colistin, tigecycline — culture-confirmed XDR/PDR only",
          "High ESBL rates in India: >60% E. coli UTI in community. Nitrofurantoin or fosfomycin for uncomplicated UTI",
          "De-escalate within 48–72 hr on culture sensitivity report",
          "Duration targets: simple pneumonia 5 days, AOM 5 days (<2 yr: 7–10 days), UTI 7 days",
          "Mandatory to report carbapenem-resistant organisms (CRO) to IDSP outbreak cell",
        ],
        tags: ["Infection", "AMS", "Policy"],
      },
      {
        title: "NCDC Scrub Typhus Management Protocol",
        year: "2022",
        keyPoints: [
          "Endemic in foothills of Himalayas, Eastern India, South India (especially Kerala, Tamil Nadu)",
          "Doxycycline (>8 yr): 2.2 mg/kg BD × 7–14 days — drug of choice",
          "Children <8 yr: Azithromycin 10 mg/kg OD × 5 days — IAP endorsed alternative",
          "Confirm: Weil-Felix (OXK), IgM ELISA, or immunofluorescence assay",
          "Fever defervescence within 48 hr of doxycycline = confirmatory (therapeutic test)",
          "Severe disease: multi-organ failure, ARDS, meningitis — escalate to ICU",
          "Vector: Leptotrombidium mite (chigger). Inspect for eschar in skin folds",
        ],
        tags: ["Infection", "Tropical", "Rickettsial"],
      },
    ],
  },
  {
    id: "rbsk",
    org: "RBSK / NPCDCS",
    fullName: "Rashtriya Bal Swasthya Karyakram — National Programme for Child Development and Child Screening",
    icon: Brain,
    color: "violet",
    url: "https://rbsk.gov.in",
    relevance: "RBSK screens all government school and Anganwadi children (0–18 yr) for 4Ds — Defects, Deficiencies, Diseases, Developmental delays.",
    guidelines: [
      {
        title: "RBSK Developmental Screening Guidelines",
        year: "2022",
        keyPoints: [
          "4D framework: Birth Defects, Deficiencies, Diseases, Developmental Delays — universal screening",
          "Screening age: neonates (at birth), 0–6 weeks, 6 weeks–6 months, 6 months–5 years, 5–18 years (schools)",
          "Developmental tools: DASII or Trivandrum Developmental Screening Chart (TDSC) for <2 yr",
          "Referral to District Early Intervention Centres (DEIC) for confirmed delays",
          "Conditions prioritised: cleft lip/palate, CHD, neural tube defects, Down syndrome, hearing/vision impairment, sickle cell disease",
          "G6PD deficiency: NNF recommends neonatal G6PD screening in high-prevalence populations",
        ],
        tags: ["Development", "Screening", "Policy"],
      },
    ],
  },
  {
    id: "aman",
    org: "AMAN / IAP Nutrition",
    fullName: "IAP Guidelines — Malnutrition & SAM Management (aligned with WHO/MoHFW)",
    icon: Drop,
    color: "orange",
    url: "https://iapindia.org",
    relevance: "Severe Acute Malnutrition (SAM) is common in Indian emergency settings. WHO/IAP protocols differ substantially from standard paediatric management.",
    guidelines: [
      {
        title: "IAP / WHO SAM Management Guidelines",
        year: "2022",
        keyPoints: [
          "SAM criteria: weight-for-height <-3 SD OR MUAC <11.5 cm OR bilateral pitting oedema",
          "Inpatient (facility-based) care for complicated SAM: anorexia, severe oedema, medical complications",
          "Outpatient (CMAM/RUTF) for uncomplicated SAM without medical complication",
          "AVOID routine IV fluids in SAM — risk of fluid overload and cardiac failure",
          "If shock in SAM: 10 mL/kg NS ONCE over 30–60 min; reassess carefully — no repeat bolus protocol",
          "Hypoglycaemia: 50 mL 10% glucose (5 g) orally/NGT; then feed q2–3h including overnight",
          "Hypothermia: kangaroo care, warm environment; check and correct glucose simultaneously",
          "Treat infections: amoxicillin PO × 7 days (even if no obvious infection — prophylactic)",
          "F-75 (starter formula) then F-100 (catch-up) — therapeutic milk formulas; not regular formula",
          "Micronutrient supplementation: folate, zinc, vit A, multivitamin — from day 1",
        ],
        tags: ["Nutrition", "Emergency", "Growth"],
      },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 3 DATA — GROWTH & ANTHROPOMETRY
// ══════════════════════════════════════════════════════════════════════════════

// ─── WHO Weight-for-Age reference data (median & ±2SD) ───────────────────────
// Source: WHO Child Growth Standards 2006 (0–5 yr), WHO 2007 Reference (5–10 yr)
// Boys median values at key ages (kg). Used for centile band labelling only.
// Full LMS tables would be used in production; these are representative bands.
const WHO_WFA_BOYS = [
  { ageM: 0,  p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.3 },
  { ageM: 3,  p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.2, p97: 7.9 },
  { ageM: 6,  p3: 6.4, p15: 7.3, p50: 8.2, p85: 9.2, p97: 10.1 },
  { ageM: 9,  p3: 7.5, p15: 8.5, p50: 9.5, p85: 10.6, p97: 11.6 },
  { ageM: 12, p3: 8.1, p15: 9.2, p50: 10.3, p85: 11.5, p97: 12.6 },
  { ageM: 18, p3: 9.1, p15: 10.4, p50: 11.7, p85: 13.1, p97: 14.3 },
  { ageM: 24, p3: 10.2, p15: 11.6, p50: 13.0, p85: 14.6, p97: 16.0 },
  { ageM: 36, p3: 11.7, p15: 13.2, p50: 14.8, p85: 16.7, p97: 18.3 },
  { ageM: 48, p3: 13.1, p15: 14.8, p50: 16.6, p85: 18.8, p97: 20.7 },
  { ageM: 60, p3: 14.4, p15: 16.3, p50: 18.4, p85: 20.9, p97: 23.1 },
];
const WHO_WFA_GIRLS = [
  { ageM: 0,  p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
  { ageM: 3,  p3: 4.6, p15: 5.3, p50: 6.0, p85: 6.9, p97: 7.6 },
  { ageM: 6,  p3: 5.9, p15: 6.8, p50: 7.7, p85: 8.8, p97: 9.7 },
  { ageM: 9,  p3: 7.0, p15: 8.0, p50: 9.1, p85: 10.4, p97: 11.5 },
  { ageM: 12, p3: 7.5, p15: 8.7, p50: 9.9, p85: 11.4, p97: 12.6 },
  { ageM: 18, p3: 8.5, p15: 9.9, p50: 11.3, p85: 13.0, p97: 14.4 },
  { ageM: 24, p3: 9.5, p15: 11.1, p50: 12.7, p85: 14.6, p97: 16.2 },
  { ageM: 36, p3: 11.0, p15: 12.8, p50: 14.7, p85: 17.0, p97: 18.9 },
  { ageM: 48, p3: 12.2, p15: 14.3, p50: 16.5, p85: 19.3, p97: 21.5 },
  { ageM: 60, p3: 13.3, p15: 15.6, p50: 18.2, p85: 21.5, p97: 24.1 },
];

// ─── WHO Height-for-Age (length/height) median values ────────────────────────
const WHO_HFA_BOYS = [
  { ageM: 0,  p3: 46.3, p15: 48.0, p50: 49.9, p85: 51.8, p97: 53.4 },
  { ageM: 3,  p3: 57.6, p15: 59.6, p50: 61.7, p85: 63.8, p97: 65.6 },
  { ageM: 6,  p3: 63.6, p15: 65.7, p50: 67.9, p85: 70.1, p97: 72.0 },
  { ageM: 9,  p3: 68.0, p15: 70.2, p50: 72.5, p85: 74.8, p97: 76.9 },
  { ageM: 12, p3: 71.7, p15: 74.0, p50: 76.4, p85: 78.9, p97: 81.1 },
  { ageM: 18, p3: 77.5, p15: 80.0, p50: 82.7, p85: 85.4, p97: 87.8 },
  { ageM: 24, p3: 82.5, p15: 85.2, p50: 88.1, p85: 91.0, p97: 93.6 },
  { ageM: 36, p3: 89.7, p15: 92.7, p50: 96.0, p85: 99.3, p97: 102.3 },
  { ageM: 48, p3: 96.0, p15: 99.3, p50: 102.9, p85: 106.6, p97: 109.8 },
  { ageM: 60, p3: 101.8, p15: 105.5, p50: 109.4, p85: 113.3, p97: 116.7 },
];
const WHO_HFA_GIRLS = [
  { ageM: 0,  p3: 45.6, p15: 47.3, p50: 49.2, p85: 51.0, p97: 52.7 },
  { ageM: 3,  p3: 56.2, p15: 58.2, p50: 60.2, p85: 62.3, p97: 64.1 },
  { ageM: 6,  p3: 62.1, p15: 64.2, p50: 66.4, p85: 68.7, p97: 70.7 },
  { ageM: 9,  p3: 66.5, p15: 68.7, p50: 71.0, p85: 73.4, p97: 75.5 },
  { ageM: 12, p3: 70.1, p15: 72.5, p50: 74.9, p85: 77.4, p97: 79.7 },
  { ageM: 18, p3: 76.1, p15: 78.7, p50: 81.4, p85: 84.2, p97: 86.7 },
  { ageM: 24, p3: 81.2, p15: 84.0, p50: 87.1, p85: 90.1, p97: 92.9 },
  { ageM: 36, p3: 88.6, p15: 91.9, p50: 95.3, p85: 98.7, p97: 101.8 },
  { ageM: 48, p3: 95.1, p15: 98.7, p50: 102.5, p85: 106.3, p97: 109.8 },
  { ageM: 60, p3: 101.0, p15: 105.0, p50: 109.1, p85: 113.3, p97: 117.1 },
];

// ─── BMI-for-Age WHO cut-offs (5–19 yr) — WHO 2007 Reference ─────────────────
// Thinness Grade 3 (<-3SD), Grade 2 (-3 to -2SD), Grade 1 (-2 to -1SD)
// Normal (-1 to +1SD), Overweight (+1 to +2SD), Obese (>+2SD)
// IAP 2015 uses BMI percentile cut-offs for Indian children — equivalent categories
const BMI_CATEGORIES_PAEDS = [
  { label: "Severe Thinness (Grade 3)", bmiFor: "< -3 SD (approx <13 kg/m² at 10 yr)", color: "red",     action: "SAM — refer for inpatient management" },
  { label: "Moderate Thinness (Grade 2)", bmiFor: "-3 to -2 SD",                        color: "orange",  action: "MAM — nutritional rehabilitation, close follow-up" },
  { label: "Mild Thinness (Grade 1)",   bmiFor: "-2 to -1 SD",                          color: "amber",   action: "At risk — nutritional counselling, monitor" },
  { label: "Normal",                    bmiFor: "-1 to +1 SD (P15–P85)",                color: "emerald", action: "No intervention — continue routine care" },
  { label: "Overweight",                bmiFor: "+1 to +2 SD (P85–P97)",                color: "amber",   action: "Lifestyle counselling, monitor for comorbidities" },
  { label: "Obese",                     bmiFor: "> +2 SD (>P97)",                       color: "red",     action: "Detailed evaluation — metabolic syndrome, NAFLD, BP, lipids" },
];

// ─── SAM Diagnostic Criteria (WHO / MoHFW NHM 2023) ─────────────────────────
const SAM_CRITERIA = [
  {
    criterion: "MUAC",
    values: {
      sam: "< 11.5 cm (6–59 months)",
      mam: "11.5–12.5 cm (6–59 months)",
      normal: "≥ 12.5 cm",
    },
    note: "Measure mid-upper arm circumference (midpoint between olecranon and acromion) on left arm. Child must be relaxed, arm hanging loose.",
  },
  {
    criterion: "Weight-for-Height (WHZ)",
    values: {
      sam: "< -3 SD (WHO 2006 standards)",
      mam: "-3 SD to -2 SD",
      normal: "≥ -2 SD",
    },
    note: "Use WHO Anthro software or growth chart. WHZ is preferred diagnostic tool in MoHFW SAM protocol over weight-for-age.",
  },
  {
    criterion: "Bilateral Pitting Oedema",
    values: {
      sam: "Present (any grade = SAM — regardless of weight)",
      mam: "—",
      normal: "Absent",
    },
    note: "Test: press both dorsal feet with thumb for 3 seconds. Indent that persists = pitting oedema. Any bilateral pedal oedema in child = SAM (kwashiorkor).",
  },
  {
    criterion: "Weight-for-Age (WAZ)",
    values: {
      sam: "< -3 SD",
      mam: "-3 SD to -2 SD",
      normal: "≥ -2 SD",
    },
    note: "Note: WAZ is used for underweight classification (IMNCI), NOT preferred for SAM diagnosis. WHZ or MUAC is more accurate.",
  },
  {
    criterion: "BMI-for-Age (5–19 yr)",
    values: {
      sam: "< -3 SD (WHO 2007 reference)",
      mam: "-3 SD to -2 SD",
      normal: "≥ -2 SD",
    },
    note: "For school-age children and adolescents where length/height is more reliable than weight. IAP 2015 charts use same cut-offs.",
  },
];

// ─── Complicated SAM criteria (MoHFW / WHO) ──────────────────────────────────
const COMPLICATED_SAM = [
  "Poor appetite (failed appetite test — unable to eat ≥ ¼ RUTF sachet in 30 min)",
  "Bilateral pitting oedema (+++ / severe grade)",
  "Medical complications: persistent vomiting, high fever (>38.5°C), severe anaemia (Hb <6 g/dL), altered consciousness, hypoglycaemia (<3 mmol/L or <54 mg/dL), hypothermia (<35.5°C)",
  "Severe wasting with any acute illness requiring hospitalisation",
  "Failure to respond after 4 weeks of outpatient CMAM",
  "Failure to gain weight for 2 consecutive weeks on outpatient management",
  "Child under 6 months (or <3 kg) — always inpatient",
  "Caregiver unable to manage at home — no support system",
];

// ─── F-75 / F-100 therapeutic feeding ────────────────────────────────────────
const THERAPEUTIC_FEEDING = [
  { phase: "Phase 1 — Stabilisation (Days 1–7)", formula: "F-75", energy: "75 kcal/100 mL", protein: "0.9 g/100 mL", volume: "100–130 mL/kg/day in 8–12 feeds", detail: "Correct hypoglycaemia, hypothermia, dehydration. Do NOT give F-100 yet — risk of re-feeding syndrome and cardiac failure." },
  { phase: "Phase 2 — Transition (Days 7–14)", formula: "F-100", energy: "100 kcal/100 mL", protein: "2.9 g/100 mL", volume: "Increase gradually over 2–3 days", detail: "Switch when: oedema resolving, appetite returning, no IV fluids or NG feeding." },
  { phase: "Phase 3 — Rehabilitation (Weeks 2–6)", formula: "F-100 or RUTF", energy: "500 kcal/day extra (RUTF 85 kcal/sachet)", protein: "5.0 g/100 mL", volume: "RUTF 3–4 sachets/day depending on weight", detail: "Target weight gain: >10 g/kg/day. Breastfeeding continues. Stimulation and play therapy." },
];

// ══════════════════════════════════════════════════════════════════════════════
// GROWTH CALCULATOR HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function interpolate(table, ageMonths) {
  if (ageMonths <= table[0].ageM) return table[0];
  if (ageMonths >= table[table.length - 1].ageM) return table[table.length - 1];
  for (let i = 0; i < table.length - 1; i++) {
    if (ageMonths >= table[i].ageM && ageMonths <= table[i + 1].ageM) {
      const frac = (ageMonths - table[i].ageM) / (table[i + 1].ageM - table[i].ageM);
      return {
        p3:  table[i].p3  + frac * (table[i + 1].p3  - table[i].p3),
        p15: table[i].p15 + frac * (table[i + 1].p15 - table[i].p15),
        p50: table[i].p50 + frac * (table[i + 1].p50 - table[i].p50),
        p85: table[i].p85 + frac * (table[i + 1].p85 - table[i].p85),
        p97: table[i].p97 + frac * (table[i + 1].p97 - table[i].p97),
      };
    }
  }
  return table[table.length - 1];
}

function getCentileLabel(value, ref) {
  if (value === null || value === undefined || isNaN(value)) return { label: "—", color: "slate" };
  if (value < ref.p3)  return { label: "< 3rd centile", color: "red",     sdApprox: "< -2 SD" };
  if (value < ref.p15) return { label: "3rd–15th",      color: "orange",  sdApprox: "-2 to -1 SD" };
  if (value < ref.p50) return { label: "15th–50th",     color: "emerald", sdApprox: "-1 to 0 SD" };
  if (value < ref.p85) return { label: "50th–85th",     color: "emerald", sdApprox: "0 to +1 SD" };
  if (value < ref.p97) return { label: "85th–97th",     color: "amber",   sdApprox: "+1 to +2 SD" };
  return                       { label: "> 97th centile", color: "red",   sdApprox: "> +2 SD" };
}

function getMUACInterpretation(muac) {
  if (!muac || isNaN(muac)) return null;
  if (muac < 11.5) return { label: "SAM", color: "red",    desc: "Severe Acute Malnutrition — MUAC < 11.5 cm" };
  if (muac < 12.5) return { label: "MAM", color: "orange", desc: "Moderate Acute Malnutrition — MUAC 11.5–12.5 cm" };
  return                   { label: "Normal", color: "emerald", desc: "Normal — MUAC ≥ 12.5 cm" };
}

function getBMIInterpretation(bmi, ageYears) {
  if (!bmi || isNaN(bmi)) return null;
  // Simplified WHO SD scoring using approximate population medians
  // For a production app, use full LMS z-score calculation
  if (ageYears < 5) {
    if (bmi < 14.0) return { label: "Severe Thinness", color: "red",     desc: "BMI < -3 SD — SAM if confirmed by WHZ or MUAC" };
    if (bmi < 15.5) return { label: "Moderate Thinness", color: "orange", desc: "BMI < -2 SD — MAM range" };
    if (bmi < 17.5) return { label: "Mild Thinness", color: "amber",    desc: "BMI mildly below average" };
    if (bmi < 19.5) return { label: "Normal", color: "emerald",          desc: "BMI within normal range" };
    if (bmi < 21.0) return { label: "Overweight", color: "amber",        desc: "BMI > +1 SD" };
    return                  { label: "Obese", color: "red",               desc: "BMI > +2 SD" };
  } else {
    // 5–18 yr: use approximate age-adjusted thresholds
    const medianBMI = 13.5 + ageYears * 0.5; // rough linear approximation of median
    const sd = 1.8;
    const z = (bmi - medianBMI) / sd;
    if (z < -3)  return { label: "Severe Thinness (Gr 3)", color: "red",     desc: "BMI < -3 SD — correlates with SAM" };
    if (z < -2)  return { label: "Moderate Thinness (Gr 2)", color: "orange", desc: "BMI -3 to -2 SD — MAM range" };
    if (z < -1)  return { label: "Mild Thinness (Gr 1)",    color: "amber",  desc: "BMI -2 to -1 SD" };
    if (z < 1)   return { label: "Normal",                  color: "emerald", desc: "BMI within normal range" };
    if (z < 2)   return { label: "Overweight",              color: "amber",   desc: "BMI +1 to +2 SD" };
    return               { label: "Obese",                  color: "red",     desc: "BMI > +2 SD" };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

const CMAP = {
  red:     { bg: "bg-red-50 dark:bg-red-950/30",     border: "border-red-200 dark:border-red-800",     text: "text-red-700 dark:text-red-300",     badge: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",     dot: "bg-red-500"     },
  amber:   { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700", dot: "bg-amber-500" },
  orange:  { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", text: "text-orange-700 dark:text-orange-300", badge: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700", dot: "bg-orange-500" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700", dot: "bg-emerald-500" },
  sky:     { bg: "bg-sky-50 dark:bg-sky-950/30",     border: "border-sky-200 dark:border-sky-800",     text: "text-sky-700 dark:text-sky-300",     badge: "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700",     dot: "bg-sky-500"     },
  violet:  { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-300", badge: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700", dot: "bg-violet-500" },
  teal:    { bg: "bg-teal-50 dark:bg-teal-950/30",   border: "border-teal-200 dark:border-teal-800",   text: "text-teal-700 dark:text-teal-300",   badge: "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700",   dot: "bg-teal-500"   },
  rose:    { bg: "bg-rose-50 dark:bg-rose-950/30",   border: "border-rose-200 dark:border-rose-800",   text: "text-rose-700 dark:text-rose-300",   badge: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700",   dot: "bg-rose-500"   },
  slate:   { bg: "bg-slate-50 dark:bg-slate-800/40", border: "border-slate-200 dark:border-slate-700", text: "text-slate-700 dark:text-slate-300",  badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600",  dot: "bg-slate-500"  },
};

function InfoBox({ tone = "amber", icon: Icon, title, children }) {
  const c = CMAP[tone] || CMAP.amber;
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${c.bg} ${c.border} ${c.text}`}>
      {Icon && <Icon size={13} weight="fill" className="flex-shrink-0 mt-0.5" />}
      <div><strong>{title}</strong>{title ? " — " : ""}{children}</div>
    </div>
  );
}

function CentileBar({ value, ref: refData, unit, label }) {
  if (!refData || value === null || isNaN(value)) return null;
  const min = refData.p3 * 0.9;
  const max = refData.p97 * 1.05;
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const p3pct  = ((refData.p3  - min) / (max - min)) * 100;
  const p15pct = ((refData.p15 - min) / (max - min)) * 100;
  const p50pct = ((refData.p50 - min) / (max - min)) * 100;
  const p85pct = ((refData.p85 - min) / (max - min)) * 100;
  const p97pct = ((refData.p97 - min) / (max - min)) * 100;

  return (
    <div className="mt-2">
      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">{label} centile band</div>
      <div className="relative h-5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <div className="absolute inset-0 flex">
          <div style={{ width: `${p3pct}%` }}  className="bg-red-200 dark:bg-red-900/60" />
          <div style={{ width: `${p15pct - p3pct}%` }}  className="bg-orange-200 dark:bg-orange-900/60" />
          <div style={{ width: `${p50pct - p15pct}%` }} className="bg-emerald-200 dark:bg-emerald-900/60" />
          <div style={{ width: `${p85pct - p50pct}%` }} className="bg-emerald-200 dark:bg-emerald-900/60" />
          <div style={{ width: `${p97pct - p85pct}%` }} className="bg-amber-200 dark:bg-amber-900/60" />
          <div className="flex-1 bg-red-200 dark:bg-red-900/60" />
        </div>
        {/* Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[8px] font-mono text-slate-400 mt-0.5">
        <span>P3</span><span>P15</span><span>P50</span><span>P85</span><span>P97</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GROWTH VIEW
// ══════════════════════════════════════════════════════════════════════════════

function GrowthView() {
  const [section, setSection] = useState("calculator");

  // Calculator state
  const [sex, setSex]       = useState("male");
  const [ageYears, setAgeYears]   = useState("");
  const [ageMonths, setAgeMonths] = useState("");
  const [weight, setWeight]       = useState("");
  const [height, setHeight]       = useState("");
  const [muac, setMuac]           = useState("");
  const [oedema, setOedema]       = useState(false);

  const totalMonths = useMemo(() => {
    const y = parseFloat(ageYears) || 0;
    const m = parseFloat(ageMonths) || 0;
    return y * 12 + m;
  }, [ageYears, ageMonths]);

  const bmi = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h || h <= 0) return null;
    return w / (h * h);
  }, [weight, height]);

  const wRef = useMemo(() => {
    if (totalMonths < 1 || totalMonths > 60) return null;
    return interpolate(sex === "male" ? WHO_WFA_BOYS : WHO_WFA_GIRLS, totalMonths);
  }, [totalMonths, sex]);

  const hRef = useMemo(() => {
    if (totalMonths < 1 || totalMonths > 60) return null;
    return interpolate(sex === "male" ? WHO_HFA_BOYS : WHO_HFA_GIRLS, totalMonths);
  }, [totalMonths, sex]);

  const wCentile = useMemo(() => getCentileLabel(parseFloat(weight), wRef), [weight, wRef]);
  const hCentile = useMemo(() => getCentileLabel(parseFloat(height), hRef), [height, hRef]);
  const muacResult = useMemo(() => getMUACInterpretation(parseFloat(muac)), [muac]);
  const bmiResult  = useMemo(() => getBMIInterpretation(bmi, parseFloat(ageYears) || totalMonths / 12), [bmi, ageYears, totalMonths]);

  // Overall SAM determination
  const isSAM = useMemo(() => {
    if (oedema) return true;
    if (muacResult?.label === "SAM") return true;
    if (wCentile?.label === "< 3rd centile") return true; // WHZ proxy
    return false;
  }, [oedema, muacResult, wCentile]);

  const isMAM = useMemo(() => {
    if (isSAM) return false;
    if (muacResult?.label === "MAM") return true;
    if (wCentile?.label === "3rd–15th") return true;
    return false;
  }, [isSAM, muacResult, wCentile]);

  const hasResults = weight || height || muac;

  const inputCls = "w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-slate-400 font-mono";
  const labelCls = "text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1 block";

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: "calculator", label: "Calculator" },
          { id: "sam",        label: "SAM / MAM Criteria" },
          { id: "feeding",    label: "Therapeutic Feeding" },
          { id: "bmi_table",  label: "BMI Categories" },
          { id: "centiles",   label: "Reference Tables" },
        ].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
              section === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{s.label}</button>
        ))}
      </div>

      {/* ── CALCULATOR ── */}
      {section === "calculator" && (
        <div className="space-y-4">
          <InfoBox tone="sky" icon={Info}>
            WHO Child Growth Standards 2006 (0–5 yr) · WHO 2007 Reference (5–19 yr) · MoHFW/NHM SAM thresholds.
            Centile bands are interpolated from tabulated WHO reference data.
          </InfoBox>

          {/* Input grid */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-3">Patient details</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Sex */}
              <div className="col-span-2">
                <label className={labelCls}>Sex</label>
                <div className="flex gap-2">
                  {["male", "female"].map(s => (
                    <button key={s} onClick={() => setSex(s)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-mono font-bold uppercase transition-all ${
                        sex === s
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
              {/* Age */}
              <div>
                <label className={labelCls}>Age — Years</label>
                <input type="number" min="0" max="18" value={ageYears} onChange={e => setAgeYears(e.target.value)}
                  placeholder="e.g. 2" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Age — Extra Months</label>
                <input type="number" min="0" max="11" value={ageMonths} onChange={e => setAgeMonths(e.target.value)}
                  placeholder="0–11" className={inputCls} />
              </div>
              {/* Weight */}
              <div>
                <label className={labelCls}>Weight (kg)</label>
                <input type="number" min="0" max="150" step="0.1" value={weight} onChange={e => setWeight(e.target.value)}
                  placeholder="e.g. 12.5" className={inputCls} />
              </div>
              {/* Height */}
              <div>
                <label className={labelCls}>Height / Length (cm)</label>
                <input type="number" min="0" max="220" step="0.1" value={height} onChange={e => setHeight(e.target.value)}
                  placeholder="e.g. 85.0" className={inputCls} />
              </div>
              {/* MUAC */}
              <div>
                <label className={labelCls}>MUAC (cm) — 6–59 months</label>
                <input type="number" min="0" max="30" step="0.1" value={muac} onChange={e => setMuac(e.target.value)}
                  placeholder="e.g. 12.0" className={inputCls} />
              </div>
              {/* Oedema */}
              <div className="flex flex-col justify-end">
                <label className={labelCls}>Bilateral pitting oedema</label>
                <button onClick={() => setOedema(o => !o)}
                  className={`w-full py-2 rounded-lg border text-xs font-mono font-bold uppercase transition-all ${
                    oedema
                      ? "bg-red-600 text-white border-transparent"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                  }`}>
                  {oedema ? "⚠ Present (= SAM)" : "Absent"}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {hasResults && (
            <div className="space-y-3">
              {/* Summary banner */}
              {(isSAM || isMAM) && (
                <div className={`rounded-xl border-2 p-4 ${isSAM ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/40" : "border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-950/40"}`}>
                  <div className={`font-black text-xl mb-1 ${isSAM ? "text-red-700 dark:text-red-300" : "text-orange-700 dark:text-orange-300"}`}
                       style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                    {isSAM ? "⚠ SEVERE ACUTE MALNUTRITION (SAM)" : "⚠ MODERATE ACUTE MALNUTRITION (MAM)"}
                  </div>
                  <div className={`text-xs font-mono ${isSAM ? "text-red-700 dark:text-red-300" : "text-orange-700 dark:text-orange-300"}`}>
                    {isSAM
                      ? "Refer for inpatient assessment. Check for complicated SAM criteria. Do NOT start F-100 immediately."
                      : "Nutritional rehabilitation. RUTF (CMAM) if uncomplicated. Close follow-up every 2 weeks."}
                  </div>
                </div>
              )}

              {/* Individual result cards */}
              <div className="grid sm:grid-cols-2 gap-3">
                {/* BMI card */}
                {bmi !== null && (
                  <div className={`rounded-xl border p-3 ${CMAP[bmiResult?.color || "slate"].border} ${CMAP[bmiResult?.color || "slate"].bg}`}>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">BMI</div>
                    <div className={`font-black text-2xl ${CMAP[bmiResult?.color || "slate"].text}`}
                         style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                      {bmi.toFixed(1)} <span className="text-sm font-mono font-normal">kg/m²</span>
                    </div>
                    {bmiResult && (
                      <>
                        <div className={`text-xs font-bold mt-1 ${CMAP[bmiResult.color].text}`}>{bmiResult.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{bmiResult.desc}</div>
                      </>
                    )}
                  </div>
                )}

                {/* MUAC card */}
                {muac && muacResult && (
                  <div className={`rounded-xl border p-3 ${CMAP[muacResult.color].border} ${CMAP[muacResult.color].bg}`}>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">MUAC</div>
                    <div className={`font-black text-2xl ${CMAP[muacResult.color].text}`}
                         style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                      {parseFloat(muac).toFixed(1)} <span className="text-sm font-mono font-normal">cm</span>
                    </div>
                    <div className={`text-xs font-bold mt-1 ${CMAP[muacResult.color].text}`}>{muacResult.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{muacResult.desc}</div>
                    {/* MUAC colour band */}
                    <div className="mt-2 h-3 rounded-full overflow-hidden flex">
                      <div className="flex-1 bg-red-400" style={{ maxWidth: `${Math.min(100, ((11.5 / 16) * 100))}%` }} />
                      <div className="bg-orange-400" style={{ width: "6.25%" }} />
                      <div className="flex-1 bg-emerald-400" />
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-slate-400 mt-0.5">
                      <span>11.5</span><span>12.5</span><span>cm</span>
                    </div>
                  </div>
                )}

                {/* Weight centile */}
                {weight && wRef && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-3">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Weight-for-Age</div>
                    <div className="font-black text-2xl text-slate-900 dark:text-white"
                         style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                      {parseFloat(weight).toFixed(1)} <span className="text-sm font-mono font-normal">kg</span>
                    </div>
                    <div className={`text-xs font-bold mt-1 ${CMAP[wCentile.color]?.text || "text-slate-700 dark:text-slate-200"}`}>
                      {wCentile.label}
                    </div>
                    {wCentile.sdApprox && (
                      <div className="text-[10px] text-slate-400 font-mono">{wCentile.sdApprox}</div>
                    )}
                    <CentileBar value={parseFloat(weight)} ref={wRef} label="Weight" />
                  </div>
                )}

                {/* Height centile */}
                {height && hRef && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-3">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Height-for-Age</div>
                    <div className="font-black text-2xl text-slate-900 dark:text-white"
                         style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                      {parseFloat(height).toFixed(1)} <span className="text-sm font-mono font-normal">cm</span>
                    </div>
                    <div className={`text-xs font-bold mt-1 ${CMAP[hCentile.color]?.text || "text-slate-700 dark:text-slate-200"}`}>
                      {hCentile.label}
                    </div>
                    {hCentile.sdApprox && (
                      <div className="text-[10px] text-slate-400 font-mono">{hCentile.sdApprox}</div>
                    )}
                    <CentileBar value={parseFloat(height)} ref={hRef} label="Height" />
                  </div>
                )}
              </div>

              {/* Reference band legend */}
              {(wRef || hRef) && totalMonths > 0 && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                    WHO {sex === "male" ? "Boys" : "Girls"} reference — {Math.floor(totalMonths / 12)} yr {totalMonths % 12} mo
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    {wRef && (
                      <div>
                        <div className="text-slate-500 mb-1">Weight (kg)</div>
                        {[["P3 (−2SD)", wRef.p3], ["P15 (−1SD)", wRef.p15], ["P50 (median)", wRef.p50], ["P85 (+1SD)", wRef.p85], ["P97 (+2SD)", wRef.p97]].map(([l, v]) => (
                          <div key={l} className="flex justify-between">
                            <span className="text-slate-400">{l}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{v.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {hRef && (
                      <div>
                        <div className="text-slate-500 mb-1">Height (cm)</div>
                        {[["P3 (−2SD)", hRef.p3], ["P15 (−1SD)", hRef.p15], ["P50 (median)", hRef.p50], ["P85 (+1SD)", hRef.p85], ["P97 (+2SD)", hRef.p97]].map(([l, v]) => (
                          <div key={l} className="flex justify-between">
                            <span className="text-slate-400">{l}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{v.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {totalMonths > 60 && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-mono">
                      Note: WHO 0–5 yr tables used (reference data available up to 60 months). For 5–19 yr, use WHO 2007 Reference or IAP 2015 charts.
                    </div>
                  )}
                </div>
              )}

              <InfoBox tone="amber" icon={Warning} title="Clinical note">
                This calculator uses WHO 2006/2007 reference values. For definitive SAM diagnosis, use WHO Anthro
                software or printed WHO growth charts. WHZ (weight-for-height Z-score) is the preferred index
                — not WAZ (weight-for-age). Always confirm SAM with MUAC AND/OR WHZ AND/OR bilateral oedema.
              </InfoBox>
            </div>
          )}

          {!hasResults && (
            <div className="text-center py-8 text-slate-400 font-mono text-sm">
              Enter weight, height, and/or MUAC above to see results
            </div>
          )}
        </div>
      )}

      {/* ── SAM / MAM CRITERIA ── */}
      {section === "sam" && (
        <div className="space-y-4">
          <InfoBox tone="red" icon={Warning} title="MoHFW / WHO SAM definition">
            Any ONE of the following = SAM: MUAC &lt; 11.5 cm · WHZ &lt; −3 SD · Bilateral pitting oedema.
            SAM diagnosis does NOT require all three criteria to be met simultaneously.
          </InfoBox>

          {/* Diagnostic criteria table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest">Criterion</th>
                  <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-red-300">SAM</th>
                  <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-orange-300">MAM</th>
                  <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-emerald-300">Normal</th>
                </tr>
              </thead>
              <tbody>
                {SAM_CRITERIA.map((r, i) => (
                  <>
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-800 odd:bg-white dark:odd:bg-slate-900/30">
                      <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{r.criterion}</td>
                      <td className="px-4 py-2.5 font-mono text-red-700 dark:text-red-400 font-bold">{r.values.sam}</td>
                      <td className="px-4 py-2.5 font-mono text-orange-700 dark:text-orange-400">{r.values.mam}</td>
                      <td className="px-4 py-2.5 font-mono text-emerald-700 dark:text-emerald-400">{r.values.normal}</td>
                    </tr>
                    <tr key={`${i}-note`} className="border-t border-slate-50 dark:border-slate-900">
                      <td colSpan={4} className="px-4 py-1.5 bg-amber-50 dark:bg-amber-950/20">
                        <div className="flex items-start gap-1.5">
                          <Lightbulb size={9} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />
                          <span className="text-[10px] text-amber-800 dark:text-amber-300">{r.note}</span>
                        </div>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Complicated SAM */}
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
            <div className="font-bold text-sm text-red-700 dark:text-red-300 mb-2"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Complicated SAM — Criteria for Inpatient Admission (MoHFW / WHO)
            </div>
            <div className="space-y-1.5">
              {COMPLICATED_SAM.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-red-800 dark:text-red-200">
                  <span className="w-4 h-4 rounded-full bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300 text-[8px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* MUAC colour tape guide */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-3" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              MUAC Colour Tape (WHO / UNICEF 2009)
            </div>
            <div className="space-y-2">
              {[
                { color: "bg-red-500",    range: "< 11.5 cm",  label: "RED — SAM",    action: "Admit or CMAM with medical assessment" },
                { color: "bg-yellow-400", range: "11.5–12.5 cm", label: "YELLOW — MAM", action: "Enrol in supplementary feeding (TSFP)" },
                { color: "bg-green-500",  range: "≥ 12.5 cm",  label: "GREEN — Normal", action: "Routine care, growth monitoring" },
              ].map(m => (
                <div key={m.range} className="flex items-center gap-3">
                  <div className={`w-10 h-6 rounded flex-shrink-0 ${m.color}`} />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{m.label} ({m.range})</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{m.action}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[10px] text-slate-400 font-mono">
              Measure on left arm · mid-point between olecranon and acromion · arm relaxed at side · apply to 6–59 months only
            </div>
          </div>
        </div>
      )}

      {/* ── THERAPEUTIC FEEDING ── */}
      {section === "feeding" && (
        <div className="space-y-4">
          <InfoBox tone="red" icon={Warning} title="Critical">
            Never start F-100 or high-energy feeds in the stabilisation phase — risk of re-feeding syndrome
            and cardiac failure. F-75 first until appetite returns and oedema is resolving.
          </InfoBox>

          {THERAPEUTIC_FEEDING.map((f, i) => (
            <div key={i} className={`rounded-xl border overflow-hidden ${i === 0 ? "border-amber-200 dark:border-amber-800" : i === 1 ? "border-blue-200 dark:border-blue-800" : "border-emerald-200 dark:border-emerald-800"}`}>
              <div className={`px-4 py-3 font-bold text-sm ${i === 0 ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300" : i === 1 ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"}`}
                   style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                {f.phase}
              </div>
              <div className="px-4 py-3 bg-white dark:bg-slate-900/50 grid sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="text-slate-400 font-mono">Formula</span>
                    <span className="font-bold text-slate-900 dark:text-white">{f.formula}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="text-slate-400 font-mono">Energy</span>
                    <span className="font-bold text-slate-900 dark:text-white">{f.energy}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="text-slate-400 font-mono">Protein</span>
                    <span className="font-bold text-slate-900 dark:text-white">{f.protein}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono">Volume</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right max-w-[55%]">{f.volume}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                  <Lightbulb size={10} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">{f.detail}</span>
                </div>
              </div>
            </div>
          ))}

          {/* 10 Steps */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-3" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              WHO 10 Steps for SAM Management (MoHFW / NHM)
            </div>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {[
                "Treat / prevent hypoglycaemia",
                "Treat / prevent hypothermia",
                "Treat / prevent dehydration",
                "Correct electrolyte imbalance (K⁺, Mg²⁺)",
                "Treat / prevent infection (empirical amoxicillin)",
                "Correct micronutrient deficiencies (no iron in phase 1)",
                "Start cautious feeding (F-75)",
                "Achieve catch-up growth (F-100 / RUTF)",
                "Provide sensory stimulation and emotional support",
                "Prepare for follow-up after recovery",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-xs text-slate-700 dark:text-slate-200">{step}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[10px] font-mono text-amber-600 dark:text-amber-400">
              Iron supplements: DO NOT give in stabilisation phase — worsen infection. Start in rehabilitation phase (Step 8) only.
            </div>
          </div>
        </div>
      )}

      {/* ── BMI CATEGORIES ── */}
      {section === "bmi_table" && (
        <div className="space-y-4">
          <InfoBox tone="sky" icon={Info}>
            WHO 2007 Reference for 5–19 yr · WHO 2006 Standards for &lt;5 yr · IAP 2015 Growth Charts for Indian children
            (Indian Pediatrics 2015;52:47–55). BMI-for-age is the preferred screening tool in children ≥2 yr.
          </InfoBox>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest">Category</th>
                  <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest">WHO SD / Centile</th>
                  <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {BMI_CATEGORIES_PAEDS.map((r, i) => {
                  const colors = { red: "text-red-700 dark:text-red-400", orange: "text-orange-700 dark:text-orange-400", amber: "text-amber-700 dark:text-amber-400", emerald: "text-emerald-700 dark:text-emerald-400" };
                  return (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-800 odd:bg-white dark:odd:bg-slate-900/30">
                      <td className={`px-4 py-2.5 font-bold ${colors[r.color] || "text-slate-900 dark:text-white"}`}>{r.label}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-300">{r.bmiFor}</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{r.action}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 p-4">
            <div className="font-bold text-sm mb-2 text-violet-700 dark:text-violet-300"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              IAP 2015 Growth Charts — Key Points for Indian Children
            </div>
            <div className="space-y-1.5">
              {[
                "IAP 2015 charts are based on affluent Indian children (closer to WHO standards than ICMR 2012)",
                "Use WHO 2006 standards for <5 yr and IAP 2015 for 5–18 yr in routine practice",
                "Overweight cut-off: BMI >23 kg/m² equivalent at 18 yr (lower than WHO +1SD for Indian adults)",
                "Obesity cut-off: BMI >27 kg/m² equivalent at 18 yr (aligns with Indian adult obesity threshold)",
                "Stunting (HAZ < -2SD) is the most prevalent form of malnutrition in India — affects 35.5% children under 5 (NFHS-5)",
                "Wasting (WHZ < -2SD): 19.3% in India. SAM (WHZ < -3SD): ~7.7% (NFHS-5 2021)",
                "NFHS-5 (2019–21): significant improvement from NFHS-4 but India still carries ~30% of world's wasted children",
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-violet-800 dark:text-violet-200">
                  <CheckCircle size={10} weight="fill" className="text-violet-500 flex-shrink-0 mt-0.5" />{p}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── REFERENCE TABLES ── */}
      {section === "centiles" && (
        <div className="space-y-4">
          <InfoBox tone="sky" icon={Info}>
            WHO Child Growth Standards 2006 (0–5 yr). Values are medians at key ages — full LMS tables available at
            who.int/tools/child-growth-standards
          </InfoBox>

          {[
            { title: "Weight-for-Age — Boys (kg)", boys: WHO_WFA_BOYS, girls: WHO_WFA_GIRLS, isBoys: true },
            { title: "Weight-for-Age — Girls (kg)", boys: WHO_WFA_BOYS, girls: WHO_WFA_GIRLS, isBoys: false },
            { title: "Height-for-Age — Boys (cm)", boys: WHO_HFA_BOYS, girls: WHO_HFA_GIRLS, isBoys: true },
            { title: "Height-for-Age — Girls (cm)", boys: WHO_HFA_BOYS, girls: WHO_HFA_GIRLS, isBoys: false },
          ].map((tbl, ti) => {
            const data = tbl.isBoys ? tbl.boys : tbl.girls;
            return (
              <div key={ti} className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="px-4 py-2.5 bg-slate-800 text-white text-sm font-bold" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                  {tbl.title}
                </div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <th className="px-3 py-2 text-left font-mono text-[9px] uppercase tracking-widest text-slate-500">Age</th>
                      <th className="px-3 py-2 text-center font-mono text-[9px] uppercase tracking-widest text-red-600">P3 (−2SD)</th>
                      <th className="px-3 py-2 text-center font-mono text-[9px] uppercase tracking-widest text-orange-600">P15 (−1SD)</th>
                      <th className="px-3 py-2 text-center font-mono text-[9px] uppercase tracking-widest text-emerald-600">P50 (med)</th>
                      <th className="px-3 py-2 text-center font-mono text-[9px] uppercase tracking-widest text-amber-600">P85 (+1SD)</th>
                      <th className="px-3 py-2 text-center font-mono text-[9px] uppercase tracking-widest text-red-600">P97 (+2SD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r, i) => {
                      const ageLabel = r.ageM === 0 ? "Birth" : r.ageM < 12 ? `${r.ageM} mo` : `${r.ageM / 12} yr`;
                      return (
                        <tr key={i} className="border-t border-slate-100 dark:border-slate-800 odd:bg-white dark:odd:bg-slate-900/30">
                          <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200">{ageLabel}</td>
                          <td className="px-3 py-2 text-center font-mono text-red-700 dark:text-red-400">{r.p3.toFixed(1)}</td>
                          <td className="px-3 py-2 text-center font-mono text-orange-700 dark:text-orange-400">{r.p15.toFixed(1)}</td>
                          <td className="px-3 py-2 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">{r.p50.toFixed(1)}</td>
                          <td className="px-3 py-2 text-center font-mono text-amber-700 dark:text-amber-400">{r.p85.toFixed(1)}</td>
                          <td className="px-3 py-2 text-center font-mono text-red-700 dark:text-red-400">{r.p97.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// IMMUNISATION SECTION (unchanged internals)
// ══════════════════════════════════════════════════════════════════════════════

function VaccineRow({ v, isLast }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr
        onClick={() => setOpen(o => !o)}
        className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${!isLast ? "border-b border-slate-100 dark:border-slate-800" : ""}`}
      >
        <td className="px-3 py-2 font-semibold text-xs text-slate-900 dark:text-white">{v.name}</td>
        <td className="px-3 py-2 text-xs font-mono text-blue-700 dark:text-blue-400">{v.dose}</td>
        <td className="px-3 py-2">
          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
            v.route === "IM" ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800" :
            v.route === "SC" ? "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800" :
            v.route === "ID" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" :
            v.route === "PO" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" :
            "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          }`}>{v.route}</span>
        </td>
        <td className="px-3 py-2 text-[10px] text-slate-400 hidden sm:table-cell">{v.site || "—"}</td>
        <td className="px-3 py-2 text-center">
          {v.notes
            ? <Info size={12} weight="fill" className="text-amber-400 mx-auto" />
            : <span className="text-slate-200 dark:text-slate-700">—</span>
          }
        </td>
      </tr>
      {open && v.notes && (
        <tr>
          <td colSpan={5} className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/40">
            <div className="flex items-start gap-2">
              <Lightbulb size={11} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{v.notes}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ScheduleTable({ schedule }) {
  return (
    <div className="space-y-4">
      {schedule.map((row, i) => (
        <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-800 dark:bg-slate-950 flex items-center gap-2">
            <Syringe size={12} weight="fill" className="text-blue-400" />
            <span className="font-bold text-sm text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              {row.age}
            </span>
            <span className="ml-auto text-[9px] font-mono text-slate-400">{row.vaccines.length} vaccine{row.vaccines.length > 1 ? "s" : ""}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="text-left px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-slate-500 w-40">Vaccine</th>
                  <th className="text-left px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-slate-500">Dose</th>
                  <th className="text-left px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-slate-500 w-16">Route</th>
                  <th className="text-left px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-slate-500 hidden sm:table-cell">Site</th>
                  <th className="text-center px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-slate-500 w-12">Info</th>
                </tr>
              </thead>
              <tbody>
                {row.vaccines.map((v, j) => (
                  <VaccineRow key={j} v={v} isLast={j === row.vaccines.length - 1} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function ImmunisationView() {
  const [activeSchedule, setActiveSchedule] = useState("iap");
  const [search, setSearch] = useState("");

  const filterSchedule = (schedule) => {
    if (!search) return schedule;
    const q = search.toLowerCase();
    return schedule
      .map(row => ({
        ...row,
        vaccines: row.vaccines.filter(v =>
          v.name.toLowerCase().includes(q) ||
          row.age.toLowerCase().includes(q) ||
          (v.notes && v.notes.toLowerCase().includes(q))
        ),
      }))
      .filter(row => row.vaccines.length > 0);
  };

  const tabs = [
    { id: "iap",    label: "IAP-ACVIP 2023" },
    { id: "uip",    label: "NIP / UIP (GoI)" },
    { id: "diff",   label: "NIP vs IAP" },
    { id: "special",label: "Special Vaccines" },
    { id: "catchup",label: "Catch-Up" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveSchedule(t.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
              activeSchedule === t.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{t.label}</button>
        ))}
      </div>

      {(activeSchedule === "iap" || activeSchedule === "uip") && (
        <div className="relative">
          <MagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vaccine, age, route..."
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-slate-400 font-mono"
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={12} weight="bold" /></button>}
        </div>
      )}

      {activeSchedule === "iap" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-3 py-2.5 text-xs text-blue-800 dark:text-blue-200">
            <Info size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-blue-500" />
            <span>IAP-ACVIP Recommended Immunisation Schedule 2023 — Indian Pediatrics 2024;61:113–125. Click any vaccine row to see notes.</span>
          </div>
          <ScheduleTable schedule={filterSchedule(IAP_SCHEDULE)} />
        </div>
      )}

      {activeSchedule === "uip" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2.5 text-xs text-emerald-800 dark:text-emerald-200">
            <Info size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-emerald-500" />
            <span>NHM Universal Immunisation Programme — free at government health facilities. Rotavirus and PCV availability varies by state.</span>
          </div>
          <ScheduleTable schedule={filterSchedule(UIP_SCHEDULE)} />
        </div>
      )}

      {activeSchedule === "diff" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
            <Warning size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
            <span>Families switching from government (NIP/UIP) to private (IAP) schedule are common in ED. Key practical differences listed below.</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="text-left px-4 py-3 font-mono text-[9px] uppercase tracking-widest w-40">Topic</th>
                  <th className="text-left px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-emerald-300">NIP / UIP (Govt)</th>
                  <th className="text-left px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-blue-300">IAP-ACVIP 2023</th>
                </tr>
              </thead>
              <tbody>
                {NIP_VS_IAP.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800 odd:bg-white dark:odd:bg-slate-900/30 even:bg-slate-50/50 dark:even:bg-slate-900/10">
                    <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">{row.topic}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 font-mono text-[10px]">{row.nip}</td>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200 font-mono text-[10px]">{row.iap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSchedule === "special" && (
        <div className="space-y-3">
          {SPECIAL_VACCINES.map((sv, i) => {
            const c = CMAP[sv.color] || CMAP.slate;
            return (
              <div key={i} className={`rounded-xl border overflow-hidden ${c.border}`}>
                <div className={`px-4 py-3 ${c.bg}`}>
                  <div className={`font-bold text-sm ${c.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{sv.category}</div>
                </div>
                <div className="px-4 py-3 bg-white dark:bg-slate-900/50 space-y-2">
                  <div><span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">When: </span><span className="text-xs text-slate-600 dark:text-slate-300">{sv.when}</span></div>
                  <div><span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Schedule: </span><span className="text-xs text-slate-700 dark:text-slate-200 font-mono">{sv.schedule}</span></div>
                  <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800">
                    <Lightbulb size={10} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-amber-800 dark:text-amber-200">{sv.notes}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeSchedule === "catchup" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 px-3 py-2.5 text-xs text-violet-800 dark:text-violet-200">
            <Info size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-violet-500" />
            <span>Catch-up vaccination principles — apply when a child presents to the ED unvaccinated or incompletely vaccinated.</span>
          </div>
          <div className="space-y-2">
            {CATCH_UP_PRINCIPLES.map((p, i) => (
              <div key={i} className="flex items-start gap-3 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{p}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 text-xs text-red-800 dark:text-red-200">
            <Warning size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-red-500" />
            <span>OPV contraindicated in immunocompromised — use IPV only. Live vaccines (MMR, varicella, BCG) contraindicated in immunocompromised and during steroid therapy &gt;2 mg/kg/day for &gt;14 days.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NATIONAL GUIDELINES SECTION (unchanged)
// ══════════════════════════════════════════════════════════════════════════════

function GuidelinesView() {
  const [openOrg, setOpenOrg] = useState("nnf");
  const [openGuideline, setOpenGuideline] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = NATIONAL_GUIDELINES.map(org => ({
    ...org,
    guidelines: org.guidelines.filter(g =>
      !search ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.keyPoints.some(k => k.toLowerCase().includes(search.toLowerCase()))
    ),
  })).filter(org => org.guidelines.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-3 py-2.5 text-xs text-blue-800 dark:text-blue-200">
        <Info size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-blue-500" />
        <span>Multiple national bodies produce guidelines critical to paediatric emergency practice in India. Key clinical points for ED use.</span>
      </div>
      <div className="relative">
        <MagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search guidelines, organisms, drugs..."
          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-slate-400 font-mono"
        />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={12} weight="bold" /></button>}
      </div>
      {filtered.map(org => {
        const c = CMAP[org.color] || CMAP.slate;
        const Icon = org.icon;
        const isOpen = openOrg === org.id;
        return (
          <div key={org.id} className={`border rounded-xl overflow-hidden ${c.border}`}>
            <button onClick={() => setOpenOrg(isOpen ? null : org.id)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${c.bg}`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon size={15} weight="bold" className={`flex-shrink-0 ${c.text}`} />
                <div className="text-left min-w-0">
                  <div className={`font-bold text-sm ${c.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{org.org}</div>
                  <div className={`text-[10px] font-mono truncate ${c.text} opacity-70`}>{org.fullName}</div>
                </div>
              </div>
              <CaretRight size={12} weight="bold" className={`${c.text} flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
            </button>
            {isOpen && (
              <div className="bg-white dark:bg-slate-900/50">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-2">
                    <Lightbulb size={11} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{org.relevance}</p>
                  </div>
                  {org.url && (
                    <a href={org.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-600 dark:text-blue-400 hover:underline mt-1">
                      <ArrowSquareOut size={10} weight="bold" />{org.url}
                    </a>
                  )}
                </div>
                {org.guidelines.map((g, gi) => {
                  const gKey = `${org.id}-${gi}`;
                  const gOpen = openGuideline === gKey;
                  return (
                    <div key={gi} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <button onClick={() => setOpenGuideline(gOpen ? null : gKey)}
                        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{g.title}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 flex-shrink-0">{g.year}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {g.tags.map(tag => (
                              <span key={tag} className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${c.badge}`}>{tag}</span>
                            ))}
                          </div>
                        </div>
                        <CaretRight size={11} weight="bold" className={`text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 ${gOpen ? "rotate-90" : ""}`} />
                      </button>
                      {gOpen && (
                        <div className={`px-4 pb-4 pt-1 ${c.bg}`}>
                          <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2">Key Clinical Points</div>
                          <div className="space-y-1.5">
                            {g.keyPoints.map((kp, ki) => (
                              <div key={ki} className="flex items-start gap-2">
                                <span className={`w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border ${c.badge}`}>{ki + 1}</span>
                                <span className="text-xs text-slate-700 dark:text-slate-200 leading-snug font-mono">{kp}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div className="text-center py-10 text-slate-400 font-mono text-sm">No guidelines match "{search}"</div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════

export default function ImmunisationTab({ searchEntry }) {
  const [activeView, setActiveView] = useState("immunisation");

  useEffect(() => {
    if (!searchEntry?.section) return;
    const sectionMap = {
      "IAP Schedule":        "immunisation",
      "NIP/UIP Schedule":    "immunisation",
      "Special Vaccines":    "immunisation",
      "Catch-up":            "immunisation",
      "National Guidelines": "guidelines",
      "Growth":              "growth",
      "SAM":                 "growth",
      "BMI":                 "growth",
      "Centiles":            "growth",
    };
    const view = sectionMap[searchEntry.section];
    if (view) setActiveView(view);
  }, [searchEntry]);

  const views = [
    { id: "immunisation", label: "Immunisation Schedules", icon: Syringe },
    { id: "guidelines",   label: "National Guidelines",    icon: BookOpen },
    { id: "growth",       label: "Growth & Anthropometry", icon: Ruler    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Immunisation, Guidelines &amp; Growth
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          UIP / NIP (GoI · NHM) · IAP-ACVIP 2023 · NNF · NTEP · NVBDCP · NCDC · WHO Growth Standards · MoHFW SAM
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {views.map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
              activeView === v.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>
            <v.icon size={13} weight="bold" />
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
        <Warning size={13} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>
          Reference only. Verify with current national programme circulars. Growth calculator uses interpolated WHO reference tables —
          for definitive Z-scores use WHO Anthro software or printed charts.
          Last reviewed against IAP-ACVIP 2023, NHM UIP 2024, and MoHFW SAM guidelines 2023.
        </span>
      </div>

      {activeView === "immunisation" && <ImmunisationView />}
      {activeView === "guidelines"   && <GuidelinesView />}
      {activeView === "growth"       && <GrowthView />}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        IAP-ACVIP 2023 · NHM UIP India · NNF CPG 2022 · NTEP 2022 · NVBDCP 2023 · NCDC/IDSP ·
        WHO Child Growth Standards 2006 · WHO 2007 Reference · MoHFW SAM Guidelines 2023 · IAP Growth Charts 2015
      </div>
    </div>
  );
}
