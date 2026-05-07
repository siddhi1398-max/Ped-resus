// frontend/src/components/tabs/ImmunisationTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Two sections in one tab:
//   1. National Immunisation Schedule — UIP (GoI / NHM) + IAP-ACVIP 2023
//   2. Other Indian National Guidelines relevant to Paediatric Emergency
//
// References:
//   • NHM / GoI Universal Immunisation Programme — nhm.gov.in
//   • IAP-ACVIP Recommended Immunisation Schedule 2023 — Indian Pediatrics 2024
//   • National Neonatology Forum (NNF) Clinical Practice Guidelines
//   • RNTCP / National TB Elimination Programme (NTEP) 2022
//   • NVBDCP National Malaria Guidelines 2023
//   • NCDC Integrated Disease Surveillance Programme (IDSP)
//   • WHO AWaRe 2022 — Antimicrobial Stewardship
//   • National Programme for Control of Blindness (NPCB) — ROP Guidelines
//   • Rashtriya Bal Swasthya Karyakram (RBSK) — Developmental Screening
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  Warning, Lightbulb, CaretDown, CaretRight,
  Syringe, Baby, BookOpen, Bug, Wind,
  Brain, Drop, Shield, Heartbeat, FirstAid,
  MagnifyingGlass, X, CheckCircle, Info,
  ArrowSquareOut,
} from "@phosphor-icons/react";

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 DATA — IMMUNISATION SCHEDULES
// ══════════════════════════════════════════════════════════════════════════════

// ─── UIP (GoI / NHM) Schedule ─────────────────────────────────────────────────
// Source: NHM Universal Immunisation Programme, MoHFW India (latest revision 2023)
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

// ─── IAP-ACVIP 2023 Schedule ──────────────────────────────────────────────────
// Source: IAP-ACVIP Recommended Immunisation Schedule 2023, Indian Pediatrics 2024;61:113-125
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
      { name: "Td", mandatory: false, dose: "0.5 mL", route: "IM", notes: "ACVIP 2023 NEW: Final Td booster at 16–18 yr to ensure diphtheria-tetanus protection for next decade. Aligns with NIP Td at 16 yr." },
    ],
  },
];

// ─── SPECIAL SITUATIONS ───────────────────────────────────────────────────────
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
    schedule: "Purified chick embryo cell (PCEC) or PVRV: IM day 0, 3, 7, 14, 28 (5-dose Essen) OR 2-site ID: 0.1 mL ×2 sites on days 0, 3, 7, 28 (4-visit Thai Red Cross).",
    notes: "Rabies immunoglobulin (RIG): 20 IU/kg infiltrated at wound site on Day 0 for WHO Category III bites. Wound wash with soap + water for 15 min — most important first aid.",
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
    schedule: "IIV (inactivated): 0.25 mL <3 yr / 0.5 mL ≥3 yr IM. 2 doses 4 wk apart if first-time vaccination. Annually before monsoon season.",
    notes: "LAIV (nasal) not widely available in India. IIV preferred. Egg allergy no longer a contraindication (IAP 2023).",
  },
  {
    category: "Varicella (Chickenpox)",
    color: "violet",
    when: "12 months–12 years (susceptible). All adolescents without prior disease or vaccine.",
    schedule: "2 doses: 12–15 months and 15–18 months (min 3 months apart). IAP 2023 endorses 2-dose schedule universally.",
    notes: "Do not give to immunocompromised. Avoid salicylates for 6 weeks after vaccination (Reye's syndrome risk). Indian brands: Varilrix, Varivax.",
  },
  {
    category: "Meningococcal",
    color: "rose",
    when: "High-risk: asplenia, complement deficiency, travellers to meningitis belt/Hajj, hostel entry, freshers.",
    schedule: "MenACWY (Menactra/Menveo): single dose from 2 years. Booster every 5 years if ongoing risk. MenB: Bexsero 0.5 mL IM × 2 doses.",
    notes: "Mandatory for Saudi Arabia Hajj/Umrah visa. Not in routine UIP.",
  },
  {
    category: "Hepatitis A",
    color: "teal",
    when: "All children from 12 months",
    schedule: "Killed (HA Vaqta/Havrix/Twinrix): 2 doses 6–12 months apart from 12 months. Live attenuated (Biovac-A/HAVpur): single dose from 12 months — IAP 2023 accepts single-dose live attenuated.",
    notes: "India transitioning from intermediate to high endemicity in adults. Single-dose live vaccine increasingly preferred for simplicity. ACVIP 2024 — live attenuated single dose endorsed based on Indian long-term follow-up data.",
  },
  {
    category: "Typhoid Conjugate Vaccine (TCV)",
    color: "orange",
    when: "All children from 9 months",
    schedule: "Typbar-TCV or Typhibev: single dose IM from 9 months. Booster optional at 2 years if given early. Re-vaccination every 3–5 years if ongoing risk.",
    notes: "TCV (conjugated to tetanus toxoid) superior immunogenicity to plain polysaccharide (Vi-PS) vaccine. Vi-PS not recommended <2 yr (no T-cell response). TCV has replaced Vi-PS in IAP recommendations.",
  },
  {
    category: "BCG at Birth — Delayed/Missed",
    color: "slate",
    when: "BCG can be given up to 1 year of age without tuberculin test. After 1 year — tuberculin test first.",
    schedule: "Single ID dose 0.05 mL neonates / 0.1 mL ≥1 month. Left deltoid insertion.",
    notes: "Low-birth-weight infants (<2 kg): delay BCG until weight ≥2 kg. HIV-exposed: give BCG at birth if asymptomatic (WHO recommendation for India — high TB burden).",
  },
];

// ─── KEY DIFFERENCES: NIP vs IAP ─────────────────────────────────────────────
const NIP_VS_IAP = [
  { topic: "Pertussis component", nip: "DTwP (whole-cell) — free", iap: "DTaP (acellular) preferred if affordable; DTwP acceptable" },
  { topic: "IPV route/dose",      nip: "0.1 mL ID fractional (3 doses at 6, 14 wk, 9 mo)", iap: "0.5 mL IM full dose (3 primary + 2 boosters at 6–18 mo and 4–6 yr)" },
  { topic: "Rotavirus",           nip: "Free in select states (Rotarix or Rotavac)", iap: "Mandatory — all children. Rotarix (2 doses) or Rotavac/RotaSiil (3 doses)" },
  { topic: "PCV",                 nip: "Free in select states", iap: "Mandatory — PCV10/13/15 (3 doses + booster)" },
  { topic: "MMR vs MR",           nip: "MR (Measles-Rubella) at 9–12 months and 16–24 months", iap: "MMR preferred; 2 doses at 12 and 15–18 months" },
  { topic: "Hepatitis A",         nip: "Not included", iap: "Mandatory from 12 months (2-dose killed or 1-dose live)" },
  { topic: "Typhoid",             nip: "Not in national schedule", iap: "TCV from 9 months (mandatory)" },
  { topic: "Varicella",           nip: "Not included", iap: "2 doses (12–15 months, 15–18 months)" },
  { topic: "HPV",                 nip: "Girls 9–14 yr in select states (school programme)", iap: "Girls AND boys 9–14 yr — 9vHPV preferred (ACVIP 2023 NEW)" },
  { topic: "Influenza",           nip: "Not included", iap: "Annual from 6 months" },
  { topic: "Td booster 16–18 yr",nip: "Td at 10 and 16 yr", iap: "NEW 2023: additional Td at 16–18 yr to ensure coverage" },
];

// ─── CATCH-UP GUIDE ───────────────────────────────────────────────────────────
const CATCH_UP_PRINCIPLES = [
  "Never restart a vaccine series — continue from where left off regardless of gap between doses.",
  "Give all due vaccines at the same visit (different sites) — no need to space out unless specifically contraindicated.",
  "Minimum age and minimum intervals must be respected — cannot accelerate beyond these.",
  "OPV: any child <5 years who has never received OPV should get 2 doses 4 weeks apart.",
  "IPV: switch from NIP fIPV to IAP full-dose IM IPV — give full-dose IM IPV at next visit, then complete as per IAP schedule.",
  "MR/MMR: if MR was given at 9 months under NIP, give MMR at 15 months and again at 4–6 years.",
  "PCV: 2–11 months with no prior PCV — 2 doses 8 weeks apart + booster at 12–15 months. 12–23 months with no prior — 2 doses 8 weeks apart. >2 years unvaccinated — single dose.",
  "Typhoid: if TCV given between 9–23 months — optional booster at 2 years. Otherwise no booster until school age.",
  "Varicella: if given only 1 dose historically — add second dose at next visit (min 3 months after first).",
  "HPV: if started late (≥15 yr) — 3-dose schedule at 0, 1–2, and 6 months regardless of sex.",
];

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 DATA — OTHER NATIONAL GUIDELINES
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
        title: "NNF Clinical Practice Guidelines — Neonatal Resuscitation (NRP-India)",
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
          "Lumbar puncture: mandatory in confirmed bacteraemia, any unwell neonate regardless of other findings",
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
          "Examinations by trained ophthalmologist; dilate pupil with 0.5% tropicamide + 2.5% phenylephrine",
          "Laser photocoagulation or anti-VEGF for Type 1 ROP (Zone I any stage, Zone II Stage 3+ or 2 with plus)",
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
    relevance: "India has the world's highest TB burden. NTEP guidelines govern paediatric TB diagnosis and treatment in the public sector. Private practitioners must report under NIKSHAY.",
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
          "P. falciparum (uncomplicated): Artemether-Lumefantrine (AL/Coartem) BD × 3 days weight-based + single-dose Primaquine 0.25 mg/kg D1",
          "P. falciparum (severe): IV Artesunate 2.4 mg/kg at 0, 12, 24 hr then OD until oral tolerated — minimum 3 doses IV",
          "Mixed infection (P.f + P.v): treat as falciparum + add primaquine for 14 days",
          "Quinine + Doxycycline (>8 yr) only if artesunate unavailable for severe malaria",
          "G6PD testing mandatory before primaquine — single qualitative test sufficient for standard dose",
          "Kala-azar (Visceral Leishmaniasis): Liposomal Amphotericin B 10 mg/kg single dose — first-line (NVBDCP free of cost in endemic districts Bihar, UP, Jharkhand, WB)",
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
          "SA 14-14-2 live attenuated JE vaccine in UIP for endemic districts (2 doses at 9 months and 16–24 months)",
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
          "High ESBL rates in India: >60% E. coli UTI in community. Nitrofurantoin or fosfomycin for uncomplicated UTI (not cephalosporins)",
          "De-escalate within 48–72 hr on culture sensitivity report",
          "Duration targets: simple pneumonia 5 days, AOM 5 days (<2 yr: 7–10 days), UTI 7 days",
          "Mandatory to report carbapenase-resistant organisms (CRO) to IDSP outbreak cell",
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
          "Vector: Leptotrombidium mite (chigger). Inspect for eschar (painless black necrotic crust) in skin folds",
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
    relevance: "RBSK screens all government school and Anganwadi children (0–18 yr) for 4Ds — Defects, Deficiencies, Diseases, Developmental delays. Relevant for identifying referral needs in ED settings.",
    guidelines: [
      {
        title: "RBSK Developmental Screening Guidelines",
        year: "2022",
        keyPoints: [
          "4D framework: Birth Defects, Deficiencies, Diseases, Developmental Delays — universal screening",
          "Screening age: neonates (at birth), 0–6 weeks, 6 weeks–6 months, 6 months–5 years (Anganwadi), 5–18 years (schools)",
          "Developmental tools: DASII (Developmental Assessment Scale for Indian Infants) or Trivandrum Developmental Screening Chart (TDSC) for <2 yr",
          "NMH (0–6 yr): hearing, vision, speech, motor milestones — all screened",
          "Referral to District Early Intervention Centres (DEIC) for confirmed delays",
          "Conditions prioritised: cleft lip/palate, CHD, neural tube defects, Down syndrome, developmental delay, hearing/vision impairment, sickle cell disease",
          "G6PD deficiency: NNF recommends neonatal G6PD screening in high-prevalence populations (Gujarat, Maharashtra, Odisha, MP)",
        ],
        tags: ["Development", "Screening", "Policy"],
      },
    ],
  },
  {
    id: "npcb",
    org: "NPCB",
    fullName: "National Programme for Control of Blindness and Visual Impairment",
    icon: MagnifyingGlass,
    color: "teal",
    url: "https://npcbvi.gov.in",
    relevance: "Governs vision screening in children, ROP management, and school vision programmes. Important for neonatal ICU teams and paediatricians.",
    guidelines: [
      {
        title: "NPCB School Vision Screening Programme",
        year: "2022",
        keyPoints: [
          "Annual vision screening for all school children classes 1–12",
          "Snellen chart at 6 metres — refer if <6/12 in either eye or fails cover-uncover test",
          "Refractive error: most common cause of childhood visual impairment in India",
          "Spectacle provision through NPCB district programme",
          "Amblyopia: treat before 8 years (sensitive period) with patching ± glasses",
          "Squint (strabismus): refer to ophthalmologist — surgical correction before amblyopia sets in",
          "Corneal blindness (Vit A deficiency): ensure Vitamin A supplementation under UIP (9, 16, 24 months then every 6 months to 5 yr)",
        ],
        tags: ["Vision", "Screening", "Policy"],
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
    relevance: "Severe Acute Malnutrition (SAM) is common in Indian emergency settings. WHO/IAP protocols differ substantially from standard paediatric management and must not be mixed.",
    guidelines: [
      {
        title: "IAP / WHO SAM Management Guidelines",
        year: "2022",
        keyPoints: [
          "SAM criteria: weight-for-height <-3 SD OR MUAC <11.5 cm OR bilateral pitting oedema",
          "Inpatient (facility-based) care for complicated SAM: anorexia, severe oedema, medical complications",
          "Outpatient (CMAM/RUTF) for uncomplicated SAM without medical complication — Plumpy'Nut or local RUTF",
          "AVOID routine IV fluids in SAM — risk of fluid overload and cardiac failure (impaired homeostasis)",
          "If shock in SAM: 10 mL/kg NS ONCE over 30–60 min; reassess carefully — no repeat bolus protocol",
          "Hypoglycaemia (very common on admission): 50 mL 10% glucose (5 g) orally/NGT; then feed q2–3h including overnight",
          "Hypothermia (SAM sign): kangaroo care, warm environment; check and correct glucose simultaneously",
          "Treat infections: amoxicillin PO × 7 days (even if no obvious infection — prophylactic). Gentamicin if no improvement",
          "F-75 (starter formula) then F-100 (catch-up) — therapeutic milk formulas; not regular formula or cow's milk",
          "Micronutrient supplementation: folate, zinc, vit A, multivitamin — from day 1",
        ],
        tags: ["Nutrition", "Emergency", "Growth"],
      },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

const CMAP = {
  red:     { bg: "bg-red-50 dark:bg-red-950/30",     border: "border-red-200 dark:border-red-800",     text: "text-red-700 dark:text-red-300",     badge: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",     dot: "bg-red-500"     },
  amber:   { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700", dot: "bg-amber-500" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700", dot: "bg-emerald-500" },
  sky:     { bg: "bg-sky-50 dark:bg-sky-950/30",     border: "border-sky-200 dark:border-sky-800",     text: "text-sky-700 dark:text-sky-300",     badge: "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700",     dot: "bg-sky-500"     },
  violet:  { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-300", badge: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700", dot: "bg-violet-500" },
  teal:    { bg: "bg-teal-50 dark:bg-teal-950/30",   border: "border-teal-200 dark:border-teal-800",   text: "text-teal-700 dark:text-teal-300",   badge: "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700",   dot: "bg-teal-500"   },
  rose:    { bg: "bg-rose-50 dark:bg-rose-950/30",   border: "border-rose-200 dark:border-rose-800",   text: "text-rose-700 dark:text-rose-300",   badge: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700",   dot: "bg-rose-500"   },
  orange:  { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", text: "text-orange-700 dark:text-orange-300", badge: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700", dot: "bg-orange-500" },
  slate:   { bg: "bg-slate-50 dark:bg-slate-800/40", border: "border-slate-200 dark:border-slate-700", text: "text-slate-700 dark:text-slate-300",  badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600",  dot: "bg-slate-500"  },
};

function SectionBlock({ title, icon: Icon, color = "slate", children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const c = CMAP[color];
  return (
    <div className={`border rounded-xl overflow-hidden ${c.border}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${c.bg} hover:brightness-95`}
      >
        <div className="flex items-center gap-2.5">
          <Icon size={15} weight="bold" className={`flex-shrink-0 ${c.text}`} />
          <span className={`font-bold text-sm ${c.text}`}
                style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{title}</span>
        </div>
        <CaretDown size={13} weight="bold"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""} ${c.text}`} />
      </button>
      {open && <div className="px-5 py-4 bg-white dark:bg-slate-900/50">{children}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// IMMUNISATION SECTION
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
    { id: "iap",   label: "IAP-ACVIP 2023",         desc: "Complete private-sector schedule" },
    { id: "uip",   label: "NIP / UIP (GoI)",         desc: "Free government schedule" },
    { id: "diff",  label: "NIP vs IAP — Key Differences", desc: "" },
    { id: "special",label: "Special Vaccines",       desc: "Risk-based, regional, travel" },
    { id: "catchup",label: "Catch-Up Principles",   desc: "" },
  ];

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSchedule(t.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
              activeSchedule === t.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search bar — only for schedule tabs */}
      {(activeSchedule === "iap" || activeSchedule === "uip") && (
        <div className="relative">
          <MagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vaccine, age, route..."
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-slate-400 font-mono"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={12} weight="bold" />
            </button>
          )}
        </div>
      )}

      {/* IAP schedule */}
      {activeSchedule === "iap" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-3 py-2.5 text-xs text-blue-800 dark:text-blue-200">
            <Info size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-blue-500" />
            <span>IAP-ACVIP Recommended Immunisation Schedule 2023 — Indian Pediatrics 2024;61:113–125. Click any vaccine row to see notes.</span>
          </div>
          <ScheduleTable schedule={filterSchedule(IAP_SCHEDULE)} />
        </div>
      )}

      {/* UIP schedule */}
      {activeSchedule === "uip" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2.5 text-xs text-emerald-800 dark:text-emerald-200">
            <Info size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-emerald-500" />
            <span>NHM Universal Immunisation Programme — free at government health facilities. Rotavirus and PCV availability varies by state.</span>
          </div>
          <ScheduleTable schedule={filterSchedule(UIP_SCHEDULE)} />
        </div>
      )}

      {/* NIP vs IAP comparison */}
      {activeSchedule === "diff" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
            <Warning size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
            <span>Families switching from government (NIP/UIP) to private (IAP) schedule are common in ED. Key practical differences are listed below to guide catch-up decisions.</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="text-left px-4 py-3 font-mono text-[9px] uppercase tracking-widest w-40">Topic</th>
                  <th className="text-left px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-emerald-300">NIP / UIP (Govt — Free)</th>
                  <th className="text-left px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-blue-300">IAP-ACVIP 2023 (Private)</th>
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

      {/* Special vaccines */}
      {activeSchedule === "special" && (
        <div className="space-y-3">
          {SPECIAL_VACCINES.map((sv, i) => {
            const c = CMAP[sv.color] || CMAP.slate;
            return (
              <div key={i} className={`rounded-xl border overflow-hidden ${c.border}`}>
                <div className={`px-4 py-3 ${c.bg}`}>
                  <div className={`font-bold text-sm ${c.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                    {sv.category}
                  </div>
                </div>
                <div className="px-4 py-3 bg-white dark:bg-slate-900/50 space-y-2">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">When: </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300">{sv.when}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Schedule: </span>
                    <span className="text-xs text-slate-700 dark:text-slate-200 font-mono">{sv.schedule}</span>
                  </div>
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

      {/* Catch-up */}
      {activeSchedule === "catchup" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 px-3 py-2.5 text-xs text-violet-800 dark:text-violet-200">
            <Info size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-violet-500" />
            <span>Catch-up vaccination principles — apply when a child presents to the ED unvaccinated or incompletely vaccinated.</span>
          </div>
          <div className="space-y-2">
            {CATCH_UP_PRINCIPLES.map((p, i) => (
              <div key={i} className="flex items-start gap-3 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{p}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 text-xs text-red-800 dark:text-red-200">
            <Warning size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-red-500" />
            <span>OPV contraindicated in immunocompromised — use IPV only. Live vaccines (MMR, varicella, BCG) contraindicated in immunocompromised and during steroid therapy >2 mg/kg/day for >14 days.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NATIONAL GUIDELINES SECTION
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
        <span>Beyond IAP, multiple national bodies produce guidelines critical to paediatric emergency practice in India. These are summarised below with key clinical points for ED use.</span>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search guidelines, organisms, drugs..."
          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-slate-400 font-mono"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <X size={12} weight="bold" />
          </button>
        )}
      </div>

      {/* Organisation groups */}
      {filtered.map(org => {
        const c = CMAP[org.color] || CMAP.slate;
        const Icon = org.icon;
        const isOpen = openOrg === org.id;
        return (
          <div key={org.id} className={`border rounded-xl overflow-hidden ${c.border}`}>
            {/* Org header */}
            <button
              onClick={() => setOpenOrg(isOpen ? null : org.id)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${c.bg}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon size={15} weight="bold" className={`flex-shrink-0 ${c.text}`} />
                <div className="text-left min-w-0">
                  <div className={`font-bold text-sm ${c.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                    {org.org}
                  </div>
                  <div className={`text-[10px] font-mono truncate ${c.text} opacity-70`}>{org.fullName}</div>
                </div>
              </div>
              <CaretRight size={12} weight="bold" className={`${c.text} flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
            </button>

            {/* Org expanded */}
            {isOpen && (
              <div className="bg-white dark:bg-slate-900/50">
                {/* Relevance strip */}
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-2">
                    <Lightbulb size={11} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{org.relevance}</p>
                  </div>
                  {org.url && (
                    <a href={org.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-600 dark:text-blue-400 hover:underline mt-1">
                      <ArrowSquareOut size={10} weight="bold" />
                      {org.url}
                    </a>
                  )}
                </div>

                {/* Guidelines within org */}
                {org.guidelines.map((g, gi) => {
                  const gKey = `${org.id}-${gi}`;
                  const gOpen = openGuideline === gKey;
                  return (
                    <div key={gi} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <button
                        onClick={() => setOpenGuideline(gOpen ? null : gKey)}
                        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                              {g.title}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 flex-shrink-0">
                              {g.year}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {g.tags.map(tag => (
                              <span key={tag} className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${c.badge}`}>
                                {tag}
                              </span>
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
                                <span className={`w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border ${c.badge}`}>
                                  {ki + 1}
                                </span>
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

  // ADD this useEffect:
  useEffect(() => {
    if (!searchEntry?.section) return;
    const sectionMap = {
      "IAP Schedule":        "immunisation",
      "NIP/UIP Schedule":    "immunisation",
      "Special Vaccines":    "immunisation",
      "Catch-up":            "immunisation",
      "National Guidelines": "guidelines",
    };
    const view = sectionMap[searchEntry.section];
    if (view) setActiveView(view);
  }, [searchEntry]);

  const views = [
    { id: "immunisation", label: "Immunisation Schedules", icon: Syringe },
    { id: "guidelines",   label: "National Guidelines",    icon: BookOpen },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Immunisation &amp; National Guidelines
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          UIP / NIP (GoI · NHM) · IAP-ACVIP 2023 · NNF · NTEP · NVBDCP · NCDC · RBSK · WHO
        </p>
      </div>

      {/* View toggle */}
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

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
        <Warning size={13} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>
          Reference only. Always verify with current national programme circulars. State-level variations in vaccine availability apply.
          Last reviewed against IAP-ACVIP 2023 (Indian Pediatrics 2024) and NHM UIP 2024 schedules.
        </span>
      </div>

      {activeView === "immunisation" && <ImmunisationView />}
      {activeView === "guidelines"   && <GuidelinesView />}

      {/* Footer */}
      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        IAP-ACVIP 2023 · NHM UIP India · NNF CPG 2022 · NTEP 2022 · NVBDCP 2023 · NCDC/IDSP · RBSK · NPCB · WHO AWaRe 2022
      </div>
    </div>
  );
}
