import { useEffect, useRef, useState, useCallback } from "react";
import { ChartLine, Person, Gear, PuzzlePiece } from "@phosphor-icons/react";

const SAMPLE_RATE = 200;
const WINDOW_S = 6;
const HISTORY = SAMPLE_RATE * WINDOW_S;

const PATIENT_SCENARIOS = [
  {
    id: "healthy-child", label: "Healthy 10kg Child",
    description: "Post-intubation for airway protection. Good lung compliance.",
    weight: 10, age: "1yr",
    settings: { pip: 20, peep: 5, rr: 28, vt: 80, fio2: 40, ie: 0.33, flow: 8 },
    physiology: { compliance: 1.0, resistance: 1.0, autopeep: 0, leak: 0, dyssynch: false, starvation: false },
    alarm: null, badge: "emerald",
  },
  {
    id: "ards-15kg", label: "ARDS — 15kg",
    description: "Severe ARDS. Stiff lungs. Needs lung-protective ventilation.",
    weight: 15, age: "3yr",
    settings: { pip: 32, peep: 12, rr: 35, vt: 75, fio2: 80, ie: 0.33, flow: 10 },
    physiology: { compliance: 0.3, resistance: 1.0, autopeep: 0, leak: 0, dyssynch: false, starvation: false },
    alarm: "HIGH PIP + HIGH PLATEAU → LOW COMPLIANCE", badge: "red",
  },
  {
    id: "asthma-25kg", label: "Asthma — 25kg",
    description: "Severe bronchospasm. Auto-PEEP developing. High airway resistance.",
    weight: 25, age: "7yr",
    settings: { pip: 38, peep: 5, rr: 28, vt: 175, fio2: 50, ie: 0.25, flow: 12 },
    physiology: { compliance: 1.0, resistance: 3.5, autopeep: 8, leak: 0, dyssynch: false, starvation: false },
    alarm: "HIGH PIP (RESISTANCE) + AUTO-PEEP", badge: "amber",
  },
  {
    id: "cuff-leak", label: "Cuff Leak — 20kg",
    description: "ETT cuff deflated. Audible gurgling. Low exhaled Vt.",
    weight: 20, age: "5yr",
    settings: { pip: 22, peep: 5, rr: 22, vt: 140, fio2: 45, ie: 0.33, flow: 9 },
    physiology: { compliance: 1.0, resistance: 1.0, autopeep: 0, leak: 0.5, dyssynch: false, starvation: false },
    alarm: "LOW Vt — CIRCUIT LEAK", badge: "orange",
  },
  {
    id: "flow-starvation", label: "Flow Starvation — 30kg",
    description: "VC mode with peak flow too low. Patient fighting for breath.",
    weight: 30, age: "10yr",
    settings: { pip: 24, peep: 5, rr: 20, vt: 210, fio2: 40, ie: 0.33, flow: 6 },
    physiology: { compliance: 1.0, resistance: 1.0, autopeep: 0, leak: 0, dyssynch: false, starvation: true },
    alarm: "FLOW STARVATION — VC MODE", badge: "yellow",
  },
  {
    id: "dyssynch", label: "Dyssynchrony — 18kg",
    description: "Inadequate sedation. Patient fighting vent. Irregular waveforms.",
    weight: 18, age: "4yr",
    settings: { pip: 26, peep: 6, rr: 24, vt: 126, fio2: 45, ie: 0.33, flow: 10 },
    physiology: { compliance: 1.0, resistance: 1.0, autopeep: 0, leak: 0, dyssynch: true, starvation: false },
    alarm: "PATIENT–VENTILATOR DYSSYNCHRONY", badge: "violet",
  },
  {
    id: "pneumothorax", label: "Tension PTX — 12kg",
    description: "Sudden ↑PIP, ↓Vt, haemodynamic compromise. Right-sided PTX.",
    weight: 12, age: "18mo",
    settings: { pip: 42, peep: 5, rr: 30, vt: 50, fio2: 100, ie: 0.33, flow: 8 },
    physiology: { compliance: 0.2, resistance: 1.8, autopeep: 0, leak: 0, dyssynch: false, starvation: false },
    alarm: "HIGH PIP + LOW Vt → CONSIDER PTX", badge: "red",
  },
];

const PUZZLE_CASES = [
  {
    id: "puzzle-ards", title: "Case 1 — The Stiff Chest", badge: "red",
    scenario: "3yr, 15kg. Post-viral pneumonia. SpO₂ 88% on 60% O₂. CXR: bilateral infiltrates. You've been handed this vent — something's wrong.",
    initSettings: { pip: 40, peep: 5, rr: 30, vt: 200, fio2: 60, ie: 0.33, flow: 10 },
    initPhysiology: { compliance: 0.3, resistance: 1.0, autopeep: 0, leak: 0, dyssynch: false, starvation: false },
    goals: [
      { id: "g1", label: "Reduce Vt to lung-protective range (60–90 mL = 4–6 mL/kg)", check: (s) => s.vt >= 60 && s.vt <= 90, hint: "Target 4–6 mL/kg PBW. For 15kg: 60–90 mL." },
      { id: "g2", label: "Lower PIP below 35 cmH₂O", check: (s) => s.pip <= 35, hint: "High PIP worsens VILI. Reduce Vt → PIP follows." },
      { id: "g3", label: "Increase PEEP to ≥8 cmH₂O (ARDS recruitment)", check: (s) => s.peep >= 8, hint: "Higher PEEP recruits alveoli in diffuse lung disease." },
      { id: "g4", label: "Raise FiO₂ to ≥80% given SpO₂ 88%", check: (s) => s.fio2 >= 80, hint: "SpO₂ 88% is dangerous. Accept higher FiO₂ in severe ARDS." },
    ],
    diagnosis: "Severe ARDS — low compliance",
    teaching: "ARDSnet protocol: Vt 4–6 mL/kg, plateau ≤30, driving pressure ≤15 cmH₂O. Permissive hypercapnia is acceptable. PEEP titration improves oxygenation. High Vt causes VILI — the leading iatrogenic harm in PICU ventilation.",
    suggestedHold: "insp",
  },
  {
    id: "puzzle-asthma", title: "Case 2 — The Wheezy Trap", badge: "amber",
    scenario: "7yr, 25kg. Severe asthma, now intubated. Vent alarming HIGH PIP. Abdomen distending visibly. Sats adequate but chest barely moving.",
    initSettings: { pip: 45, peep: 5, rr: 35, vt: 200, fio2: 50, ie: 0.4, flow: 12 },
    initPhysiology: { compliance: 1.0, resistance: 3.5, autopeep: 10, leak: 0, dyssynch: false, starvation: false },
    goals: [
      { id: "g1", label: "Reduce RR to ≤20/min (extend expiratory time)", check: (s) => s.rr <= 20, hint: "Air trapping occurs when Te is too short. Slow the rate." },
      { id: "g2", label: "Extend I:E — set ie fraction ≤0.25 (ratio ≥1:3)", check: (s) => s.ie <= 0.25, hint: "Longer expiratory time lets trapped air escape. Target 1:3 to 1:4." },
      { id: "g3", label: "Lower PIP to <38 cmH₂O", check: (s) => s.pip < 38, hint: "Reducing RR and Vt slightly will drop PIP. Avoid high peak pressures." },
      { id: "g4", label: "Keep PEEP low (≤5 cmH₂O) in auto-PEEP state", check: (s) => s.peep <= 5, hint: "External PEEP competes with intrinsic PEEP → worsens hyperinflation." },
    ],
    diagnosis: "Severe bronchospasm with air trapping (auto-PEEP)",
    teaching: "In asthma: the enemy is air trapping. Reduce RR (18–22), extend I:E to 1:3 or 1:4, allow permissive hypercapnia. Avoid high external PEEP. Use expiratory hold to quantify auto-PEEP. Bronchodilators via ETT. Consider ketamine infusion.",
    suggestedHold: "exp",
  },
  {
    id: "puzzle-leak", title: "Case 3 — The Disappearing Volume", badge: "orange",
    scenario: "5yr, 20kg. Intubated post-op. Low exhaled Vt alarm. Patient looks comfortable but you hear gurgling with each breath.",
    initSettings: { pip: 22, peep: 5, rr: 22, vt: 140, fio2: 45, ie: 0.33, flow: 9 },
    initPhysiology: { compliance: 1.0, resistance: 1.0, autopeep: 0, leak: 0.5, dyssynch: false, starvation: false },
    goals: [
      { id: "g1", label: "Use Expiratory Hold to identify leak (volume won't return to zero)", check: (_s, holdResult) => holdResult?.type === "exp", hint: "Expiratory hold + volume scalar shows circuit leak — volume limb doesn't return to baseline." },
      { id: "g2", label: "Increase PIP slightly to compensate (>24 cmH₂O)", check: (s) => s.pip >= 24, hint: "With a cuff leak, you need higher driving pressure to deliver target Vt." },
      { id: "g3", label: "Increase Vt to compensate (>150 mL) while cuff is fixed", check: (s) => s.vt >= 150, hint: "Temporarily increase Vt set point. Goal is adequate chest rise while cuff is re-inflated." },
    ],
    diagnosis: "ETT cuff leak — low exhaled tidal volume",
    teaching: "Cuff leak: inflate cuff to 20–25 cmH₂O. ETT size may be wrong. In children <8yr, uncuffed tubes are sometimes used; if leak is excessive, upsize by 0.5mm. Inspect circuit for disconnection/cracks. Volume scalar expiratory limb not returning to zero = pathognomonic of leak.",
    suggestedHold: "exp",
  },
  {
    id: "puzzle-ptx", title: "Case 4 — The Sudden Crash", badge: "red",
    scenario: "18mo, 12kg. Was stable — suddenly vent alarming HIGH PIP, SpO₂ dropping. HR 180. No chest movement on right. You have 60 seconds.",
    initSettings: { pip: 42, peep: 5, rr: 30, vt: 50, fio2: 100, ie: 0.33, flow: 8 },
    initPhysiology: { compliance: 0.2, resistance: 1.8, autopeep: 0, leak: 0, dyssynch: false, starvation: false },
    goals: [
      { id: "g1", label: "Maximise FiO₂ to 100%", check: (s) => s.fio2 >= 100, hint: "Any sudden deterioration: go to 100% FiO₂ immediately — DOPE mnemonic." },
      { id: "g2", label: "Perform Inspiratory Hold to check plateau vs PIP", check: (_s, holdResult) => holdResult?.type === "insp", hint: "High PIP + low plateau gap → compliance problem (not resistance) — think PTX." },
      { id: "g3", label: "Reduce RR to ≤25 to reduce mean airway pressure", check: (s) => s.rr <= 25, hint: "Tension PTX worsens with high mean airway pressure. Buy time while needle decompression is prepared." },
    ],
    diagnosis: "Tension pneumothorax — obstructive shock",
    teaching: "DOPE: Displacement (ETT), Obstruction (secretions), Pneumothorax, Equipment failure. Tension PTX = needle decompression 2nd ICS mid-clavicular line → chest drain. Bedside USS: absent lung sliding. Don't wait for CXR if haemodynamically compromised.",
    suggestedHold: "insp",
  },
  {
    id: "puzzle-dyssynch", title: "Case 5 — The Fighter", badge: "violet",
    scenario: "4yr, 18kg. Post-op day 1. Vent waveforms look chaotic. COMFORT-B score 22. Nurse asking about sedation.",
    initSettings: { pip: 32, peep: 6, rr: 24, vt: 126, fio2: 45, ie: 0.33, flow: 8 },
    initPhysiology: { compliance: 1.0, resistance: 1.0, autopeep: 0, leak: 0, dyssynch: true, starvation: false },
    goals: [
      { id: "g1", label: "Switch to decelerating flow mode (PC-AC or PRVC)", check: (_s, _h, mode) => mode === "pc-ac" || mode === "prvc", hint: "VC square flow is uncomfortable when patient has high drive. PC/PRVC provides flow on demand." },
      { id: "g2", label: "Reduce mandatory RR (≤18/min)", check: (s) => s.rr <= 18, hint: "If patient is triggering above set rate, reduce mandatory RR. Let patient control more." },
      { id: "g3", label: "Increase peak flow to ≥12 L/min", check: (s) => s.flow >= 12, hint: "Higher peak flow reduces flow starvation and patient effort against the machine." },
    ],
    diagnosis: "Patient–ventilator dyssynchrony",
    teaching: "Dyssynchrony types: double-trigger, reverse trigger, flow starvation, auto-triggering. Use COMFORT-B score target 11–17. Optimise fentanyl (1–4 mcg/kg/hr) + midazolam. Switch to PRVC or PSV. Avoid NMB unless refractory ARDS.",
    suggestedHold: null,
  },
  {
    id: "puzzle-bronchiolitis", title: "Case 6 — The Tiny Wheeze", badge: "amber",
    scenario: "6mo, 7kg. RSV bronchiolitis, intubated for apnoea. SpO₂ 91%. Vent alarming high PIP. Chest hyperinflated on exam. RR was set at 40.",
    initSettings: { pip: 36, peep: 6, rr: 40, vt: 56, fio2: 55, ie: 0.4, flow: 8 },
    initPhysiology: { compliance: 0.8, resistance: 2.8, autopeep: 6, leak: 0, dyssynch: false, starvation: false },
    goals: [
      { id: "g1", label: "Reduce RR to ≤30/min", check: (s) => s.rr <= 30, hint: "Infants with bronchiolitis trap air easily. Slow rate = more time to exhale." },
      { id: "g2", label: "Extend I:E ≤0.25 (ratio ≥1:3)", check: (s) => s.ie <= 0.25, hint: "Obstructive physiology needs long expiratory time. Target 1:3 or 1:4." },
      { id: "g3", label: "Keep PEEP ≤5 cmH₂O", check: (s) => s.peep <= 5, hint: "External PEEP worsens air trapping when auto-PEEP is already present." },
      { id: "g4", label: "Confirm auto-PEEP with expiratory hold", check: (_s, h) => h?.type === "exp", hint: "Expiratory hold quantifies intrinsic PEEP — essential before adjusting PEEP." },
    ],
    diagnosis: "Bronchiolitis with air trapping",
    teaching: "RSV bronchiolitis: small airways + mucus = high resistance + air trapping. Gentle ventilation: Vt 5–6 mL/kg, low RR 25–30, long expiry 1:3–1:4. Avoid high PEEP. Heated humidification essential. Nebulised hypertonic saline may help. NMB rarely needed.",
    suggestedHold: "exp",
  },
  {
    id: "puzzle-mainbronchus", title: "Case 7 — One Side Silent", badge: "red",
    scenario: "2yr, 12kg. Post-intubation for epiglottitis. Right chest not moving. SpO₂ 84%. ETT was advanced during securing.",
    initSettings: { pip: 38, peep: 5, rr: 28, vt: 48, fio2: 100, ie: 0.33, flow: 8 },
    initPhysiology: { compliance: 0.4, resistance: 1.2, autopeep: 0, leak: 0, dyssynch: false, starvation: false },
    goals: [
      { id: "g1", label: "FiO₂ to 100% immediately", check: (s) => s.fio2 >= 100, hint: "Any sudden desaturation post-intubation: 100% FiO₂ first while you diagnose." },
      { id: "g2", label: "Reduce Vt to ≤72 mL (6 mL/kg) for single lung", check: (s) => s.vt <= 72, hint: "Right mainstem = only left lung ventilated. Halve the Vt to avoid barotrauma." },
      { id: "g3", label: "Perform inspiratory hold — check plateau", check: (_s, h) => h?.type === "insp", hint: "High PIP with low plateau gap = compliance issue (left lung alone doing all the work)." },
      { id: "g4", label: "Reduce RR to ≤22 to lower mean airway pressure", check: (s) => s.rr <= 22, hint: "Single-lung ventilation: lower MAP reduces risk to remaining lung." },
    ],
    diagnosis: "Right mainstem intubation",
    teaching: "Right mainstem intubation: most common ETT malposition (right bronchus is more vertical). Confirm depth: lip mark at 3× ETT size (e.g. 3.5mm → 10.5cm at lip). Auscultate bilateral axillae not just chest. Pull back 1–2cm and re-check. CXR: ETT tip should be 1–2cm above carina.",
    suggestedHold: "insp",
  },
  {
    id: "puzzle-weaning", title: "Case 8 — Ready to Fly?", badge: "emerald",
    scenario: "5yr, 18kg. Day 4 post-ARDS. FiO₂ has been weaned to 40%. Waking up. Team asks: is this child ready to extubate?",
    initSettings: { pip: 20, peep: 6, rr: 18, vt: 126, fio2: 40, ie: 0.33, flow: 9 },
    initPhysiology: { compliance: 0.9, resistance: 1.1, autopeep: 0, leak: 0, dyssynch: false, starvation: false },
    goals: [
      { id: "g1", label: "Confirm FiO₂ ≤40%", check: (s) => s.fio2 <= 40, hint: "Extubation readiness: FiO₂ ≤40% is a standard threshold." },
      { id: "g2", label: "PEEP ≤6 cmH₂O", check: (s) => s.peep <= 6, hint: "Weaning PEEP to 5–6 before extubation reduces post-extubation atelectasis risk." },
      { id: "g3", label: "PIP ≤22 cmH₂O with normal Vt", check: (s) => s.pip <= 22 && s.vt >= 100, hint: "Low driving pressure with adequate Vt = good compliance recovery." },
      { id: "g4", label: "RR ≤20/min on minimal support", check: (s) => s.rr <= 20, hint: "Low set RR means patient is breathing spontaneously above the rate — a good sign." },
      { id: "g5", label: "Perform inspiratory hold — driving pressure ≤12", check: (_s, h) => h?.type === "insp", hint: "Driving pressure = plateau − PEEP. ≤12 cmH₂O suggests lung recovery sufficient for extubation." },
    ],
    diagnosis: "Extubation readiness assessment",
    teaching: "Extubation criteria: FiO₂ ≤40%, PEEP ≤6, adequate cough/gag, minimal secretions, haemodynamically stable, alert. Consider SBT (spontaneous breathing trial) on CPAP/PS for 30–120 mins. Cuff leak test in children >5yr. Post-extubation high-flow or NIV reduces re-intubation risk in high-risk patients.",
    suggestedHold: "insp",
  },
  {
    id: "puzzle-overventilation", title: "Case 9 — Too Much of a Good Thing", badge: "yellow",
    scenario: "8yr, 28kg. TBI, GCS 6, intubated for airway protection. ICP monitor in. Nurse notes ICP 28 mmHg, CO₂ 28 mmHg on last gas. RR was set high by the previous team.",
    initSettings: { pip: 24, peep: 5, rr: 38, vt: 196, fio2: 40, ie: 0.33, flow: 11 },
    initPhysiology: { compliance: 1.0, resistance: 1.0, autopeep: 2, leak: 0, dyssynch: false, starvation: false },
    goals: [
      { id: "g1", label: "Reduce RR to 18–22/min (target PaCO₂ 35–40)", check: (s) => s.rr >= 18 && s.rr <= 22, hint: "Hyperventilation causes cerebral vasoconstriction → ischaemia. Target normocapnia in TBI unless herniation." },
      { id: "g2", label: "Reduce Vt to ≤168 mL (6 mL/kg)", check: (s) => s.vt <= 168, hint: "High Vt drives down CO₂ too fast. Lung-protective Vt even in TBI." },
      { id: "g3", label: "Keep PEEP ≤6 (avoid raising ICP)", check: (s) => s.peep <= 6, hint: "High PEEP raises intrathoracic pressure → impairs cerebral venous drainage → raises ICP." },
      { id: "g4", label: "Confirm auto-PEEP resolved with exp hold", check: (_s, h) => h?.type === "exp", hint: "High RR caused auto-PEEP. After reducing rate, confirm it has cleared." },
    ],
    diagnosis: "Iatrogenic hyperventilation in TBI",
    teaching: "TBI ventilation: target PaCO₂ 35–40 mmHg (normocapnia). Hyperventilation (PaCO₂ <35) causes cerebral vasoconstriction — use ONLY as a bridge during herniation while arranging definitive treatment. High PEEP impairs cerebral venous drainage. Head 30° up, midline. Target SpO₂ ≥95%.",
    suggestedHold: "exp",
  },
  {
    id: "puzzle-neonatal-rds", title: "Case 10 — The Blue Newborn", badge: "violet",
    scenario: "Day 1 neonate, 1.8kg, 30 weeks gestation. RDS on CXR. Surfactant given. Now on vent — SpO₂ 88%, ground-glass bilateral infiltrates, stiff chest.",
    initSettings: { pip: 28, peep: 4, rr: 50, vt: 11, fio2: 70, ie: 0.4, flow: 6 },
    initPhysiology: { compliance: 0.25, resistance: 1.2, autopeep: 0, leak: 0, dyssynch: false, starvation: false },
    goals: [
      { id: "g1", label: "Increase PEEP to 5–7 cmH₂O (RDS recruitment)", check: (s) => s.peep >= 5 && s.peep <= 7, hint: "PEEP prevents alveolar collapse at end-expiration in surfactant-deficient lungs." },
      { id: "g2", label: "Reduce Vt to 4–6 mL/kg (7–11 mL for 1.8kg)", check: (s) => s.vt >= 7 && s.vt <= 11, hint: "Neonatal lungs are extremely vulnerable to volutrauma. Keep Vt 4–6 mL/kg strictly." },
      { id: "g3", label: "Increase FiO₂ to ≥70% given SpO₂ 88%", check: (s) => s.fio2 >= 70, hint: "SpO₂ 88% is below target in a preterm. Increase FiO₂ while optimising PEEP." },
      { id: "g4", label: "Reduce RR to ≤55 (avoid auto-PEEP in preterm)", check: (s) => s.rr <= 55, hint: "Very high RR in neonates can cause air trapping. Target 40–60 with adequate expiratory time." },
      { id: "g5", label: "Lower PIP to ≤26 cmH₂O", check: (s) => s.pip <= 26, hint: "Post-surfactant compliance improves rapidly. Reduce PIP to avoid over-distension." },
    ],
    diagnosis: "Neonatal RDS — surfactant deficiency",
    teaching: "Neonatal RDS: surfactant deficiency → alveolar collapse → V/Q mismatch. PEEP 5–7 prevents collapse. Vt 4–6 mL/kg avoids volutrauma. After surfactant: compliance improves rapidly — wean PIP quickly or risk pneumothorax. Target SpO₂ 91–95% in preterms (avoid hyperoxia → ROP). Consider HFOV if MAP >12.",
    suggestedHold: "insp",
  },
];

const MODES = {
  "vc-ac":  { label: "VC–AC",    note: "Square flow → ramp pressure. Vt guaranteed." },
  "pc-ac":  { label: "PC–AC",    note: "Pressure constant → decelerating flow. Vt varies with compliance." },
  "prvc":   { label: "PRVC",     note: "Decelerating flow. Pressure auto-adjusts to hit Vt target." },
  "simv":   { label: "SIMV+PS",  note: "Mandatory + spontaneous PS breaths." },
  "ps":     { label: "PSV",      note: "Fully patient-triggered, flow-cycled." },
};

const BADGE = {
  emerald:"#10b981", red:"#ef4444", amber:"#f59e0b",
  orange:"#f97316", yellow:"#eab308", violet:"#8b5cf6", slate:"#64748b",
};

const ALARM_DATA = {
  "HIGH PIP + HIGH PLATEAU → LOW COMPLIANCE": {
    color:"#ef4444",
    causes:["ARDS / diffuse alveolar damage","Pulmonary oedema","Pneumothorax","Over-distension"],
    action:"Lung-protective: reduce Vt to 4–6 mL/kg PBW. Check plateau (insp hold). Target plateau ≤30, driving pressure ≤15 cmH₂O.",
    pearl:"Peak–Plateau gap SMALL (<5 cmH₂O) = compliance problem. Both elevated = stiff lung, not airway resistance.",
  },
  "HIGH PIP (RESISTANCE) + AUTO-PEEP": {
    color:"#f59e0b",
    causes:["Bronchospasm — asthma, bronchiolitis","Secretions / mucus plugging","ETT kink","Inadequate expiratory time"],
    action:"DOPE check. Suction ETT. Bronchodilators. Reduce RR, extend I:E to 1:3–1:4. Expiratory hold to quantify auto-PEEP.",
    pearl:"Peak–Plateau gap >10 cmH₂O = RESISTANCE problem. Plateau should be near-normal.",
  },
  "LOW Vt — CIRCUIT LEAK": {
    color:"#f97316",
    causes:["ETT cuff deflated (audible gurgling)","Circuit disconnection or crack","ETT dislodgement","Large bronchopleural fistula"],
    action:"Check ETT depth. Inflate cuff to 20–25 cmH₂O. Inspect all circuit connections. Observe bilateral chest rise.",
    pearl:"Volume scalar: expiratory limb not returning to zero = circuit leak.",
  },
  "FLOW STARVATION — VC MODE": {
    color:"#eab308",
    causes:["Peak flow set too low for patient demand","High respiratory drive","Inadequate analgosedation"],
    action:"Increase peak flow rate. Switch to decelerating flow (PC/PRVC). Optimise sedation + analgesia.",
    pearl:"Pressure scalar shows characteristic 'scooped' concave dip mid-inspiration.",
  },
  "PATIENT–VENTILATOR DYSSYNCHRONY": {
    color:"#8b5cf6",
    causes:["Inadequate sedation/analgesia","Inappropriate trigger sensitivity","Auto-PEEP → missed triggers","Wrong inspiratory time"],
    action:"Optimise fentanyl + midazolam. Adjust flow trigger. Check for auto-PEEP. Switch to PRVC or PS.",
    pearl:"Look for: double triggers, reverse triggering, premature cycling. COMFORT-B target 11–17.",
  },
  "HIGH PIP + LOW Vt → CONSIDER PTX": {
    color:"#ef4444",
    causes:["Tension pneumothorax","Main-stem intubation","Massive atelectasis","Mucus plugging with collapse"],
    action:"DOPE + immediate auscultation. Bedside lung US. If tension: needle decompression 2nd ICS MCL → chest drain.",
    pearl:"Tension PTX = obstructive shock. Don't wait for CXR if haemodynamically compromised.",
  },
};

// ─── WEB AUDIO VENTILATOR ENGINE ───────────────────────────────────────────
function createVentAudio(audioCtx, settings, physiology) {
  const { rr, pip, peep, ie } = settings;
  const { resistance, leak, dyssynch } = physiology;
  const period = 60 / rr;
  const ti = period * ie / (1 + ie);
  const te = period - ti;
  const now = audioCtx.currentTime;

  // Master gain
  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0.18, now);
  master.connect(audioCtx.destination);

  // ── Inspiratory breath: filtered noise burst (high-pass = air rushing in) ──
  const inspBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * ti * 0.9, audioCtx.sampleRate);
  const inspData = inspBuf.getChannelData(0);
  for (let i = 0; i < inspData.length; i++) {
    // Shaped noise: ramp up then ramp down
    const env = Math.sin((i / inspData.length) * Math.PI);
    inspData[i] = (Math.random() * 2 - 1) * env;
  }
  const inspSrc = audioCtx.createBufferSource();
  inspSrc.buffer = inspBuf;
  const inspFilter = audioCtx.createBiquadFilter();
  inspFilter.type = "bandpass";
  // Higher PIP / resistance = higher pitched turbulence
  inspFilter.frequency.value = 600 + resistance * 300 + pip * 8;
  inspFilter.Q.value = 0.8;
  const inspGain = audioCtx.createGain();
  inspGain.gain.value = 0.5 + (pip / 50) * 0.5;
  inspSrc.connect(inspFilter);
  inspFilter.connect(inspGain);
  inspGain.connect(master);
  inspSrc.start(now);
  inspSrc.stop(now + ti * 0.9);

  // ── Ventilator click / valve click at breath start ──
  const clickBuf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.008), audioCtx.sampleRate);
  const clickData = clickBuf.getChannelData(0);
  for (let i = 0; i < clickData.length; i++) {
    const env = 1 - i / clickData.length;
    clickData[i] = (Math.random() * 2 - 1) * env * env;
  }
  const clickSrc = audioCtx.createBufferSource();
  clickSrc.buffer = clickBuf;
  const clickFilter = audioCtx.createBiquadFilter();
  clickFilter.type = "highpass";
  clickFilter.frequency.value = 1800;
  const clickGain = audioCtx.createGain();
  clickGain.gain.value = 0.7;
  clickSrc.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(master);
  clickSrc.start(now);
  clickSrc.stop(now + 0.01);

  // ── Expiratory whoosh (low-pass exhalation) ──
  const expBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * te * 0.8, audioCtx.sampleRate);
  const expData = expBuf.getChannelData(0);
  for (let i = 0; i < expData.length; i++) {
    const env = Math.exp(-i / (expData.length * 0.3)) * (1 - i / expData.length);
    expData[i] = (Math.random() * 2 - 1) * env;
  }
  const expSrc = audioCtx.createBufferSource();
  expSrc.buffer = expBuf;
  const expFilter = audioCtx.createBiquadFilter();
  expFilter.type = "bandpass";
  expFilter.frequency.value = 300 + resistance * 120;
  expFilter.Q.value = 1.2;
  const expGain = audioCtx.createGain();
  expGain.gain.value = 0.35;
  expSrc.connect(expFilter);
  expFilter.connect(expGain);
  expGain.connect(master);
  expSrc.start(now + ti);
  expSrc.stop(now + ti + te * 0.8);

  // ── Expiratory valve click ──
  const expClickSrc = audioCtx.createBufferSource();
  expClickSrc.buffer = clickBuf; // reuse
  const expClickGain = audioCtx.createGain();
  expClickGain.gain.value = 0.4;
  expClickSrc.connect(clickFilter);
  expClickGain.connect(master);
  expClickSrc.start(now + ti);
  expClickSrc.stop(now + ti + 0.01);

  // ── Leak: gurgling turbulent noise overlaid ──
  if (leak > 0.2) {
    const leakBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * ti, audioCtx.sampleRate);
    const ld = leakBuf.getChannelData(0);
    for (let i = 0; i < ld.length; i++) {
      const env = Math.sin((i / ld.length) * Math.PI * 3) * 0.5 + 0.5;
      ld[i] = (Math.random() * 2 - 1) * env;
    }
    const leakSrc = audioCtx.createBufferSource();
    leakSrc.buffer = leakBuf;
    const leakFilter = audioCtx.createBiquadFilter();
    leakFilter.type = "bandpass";
    leakFilter.frequency.value = 180 + Math.random() * 80;
    leakFilter.Q.value = 3;
    const leakGain = audioCtx.createGain();
    leakGain.gain.value = leak * 1.2;
    leakSrc.connect(leakFilter);
    leakFilter.connect(leakGain);
    leakGain.connect(master);
    leakSrc.start(now + 0.05);
    leakSrc.stop(now + ti);
  }

  // ── Dyssynchrony: extra irregular burst mid-expiry ──
  if (dyssynch && Math.random() < 0.4) {
    const dBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.12, audioCtx.sampleRate);
    const dd = dBuf.getChannelData(0);
    for (let i = 0; i < dd.length; i++) {
      const env = Math.sin((i / dd.length) * Math.PI);
      dd[i] = (Math.random() * 2 - 1) * env;
    }
    const dSrc = audioCtx.createBufferSource();
    dSrc.buffer = dBuf;
    const dFilter = audioCtx.createBiquadFilter();
    dFilter.type = "bandpass";
    dFilter.frequency.value = 900;
    dFilter.Q.value = 2;
    const dGain = audioCtx.createGain();
    dGain.gain.value = 0.5;
    dSrc.connect(dFilter);
    dFilter.connect(dGain);
    dGain.connect(master);
    const offset = ti + te * (0.3 + Math.random() * 0.3);
    dSrc.start(now + offset);
    dSrc.stop(now + offset + 0.12);
  }

  return period; // return period so scheduler knows when to fire next
}

function generateSample(t, modeKey, settings, physiology, holdState) {
  const { pip, peep, rr, vt } = settings;
  const { compliance:C, resistance:R, autopeep, leak, dyssynch, starvation } = physiology;
  const period = 60 / rr;
  const tInPeriod = ((t % period) + period) % period;
  const ieRatio = settings.ie || 0.33;
  const ti = period * ieRatio / (1 + ieRatio);
  const inInsp = tInPeriod < ti;
  const inspPhase = inInsp ? tInPeriod / ti : 0;
  const expPhase = !inInsp ? (tInPeriod - ti) / (period - ti) : 0;

  if (holdState === "insp") {
    const plateau = peep + (vt / 50) * (1 / C);
    return { pressure: Math.min(plateau, pip) + (Math.random()-.5)*.15, flow:(Math.random()-.5)*.3, volume:vt*.98, isHold:true };
  }
  if (holdState === "exp") {
    return { pressure: peep + autopeep + (Math.random()-.5)*.15, flow:(Math.random()-.5)*.2, volume:autopeep>0?vt*.08:0, isHold:true };
  }

  let pressure=peep, flow=0, volume=0;
  const isVC = modeKey==="vc-ac"||modeKey==="simv";
  if (isVC) {
    if (inInsp) {
      flow=40;
      const elasticP = peep+(vt*inspPhase)/(50*C);
      const resistiveP = flow*R*0.18;
      pressure = starvation ? elasticP+resistiveP-8*Math.sin(Math.PI*inspPhase) : elasticP+resistiveP;
      volume = vt*inspPhase;
    } else {
      const tau=R*C*0.55;
      flow = -(vt/(50*Math.max(tau,.3)))*Math.exp(-expPhase/Math.max(tau,.3))*28;
      if (autopeep>0&&expPhase>.7) flow*=1-((expPhase-.7)/.3)*.85;
      pressure = peep+autopeep*Math.exp(-expPhase*3)+(pip-peep)*Math.exp(-expPhase*6);
      volume = vt*Math.max(0,1-(1-Math.exp(-expPhase/Math.max(tau,.3)))*(1+leak));
    }
  } else {
    if (inInsp) {
      const driveP=pip-peep;
      pressure = peep+driveP*(1-Math.exp(-inspPhase*8/(R*C)));
      flow = (driveP/(R*C))*Math.exp(-inspPhase*4)*14*C;
      volume = vt*(1-Math.exp(-inspPhase*6/(R*C)))/(1-Math.exp(-6/(R*C)));
    } else {
      const tau=R*C*0.55;
      pressure = peep+autopeep*Math.exp(-expPhase*3)+(pip-peep)*Math.exp(-expPhase*8);
      flow = -28*C*Math.exp(-expPhase/Math.max(tau,.3));
      if (autopeep>0&&expPhase>.75) flow*=1-((expPhase-.75)/.25)*.9;
      volume = vt*Math.max(0,1-expPhase*(1+leak));
    }
  }
  if (dyssynch) {
    const dPhase=(t*1.3)%1;
    if (dPhase>.85&&dPhase<.95){const dp=Math.sin(((dPhase-.85)/.1)*Math.PI);flow+=12*dp;pressure+=4*dp;}
    if (Math.random()<.003) flow+=(Math.random()-.5)*18;
  }
  return {
    pressure: Math.max(peep-.5,pressure)+(Math.random()-.5)*.25,
    flow: (flow||0)+(Math.random()-.5)*.6,
    volume: Math.max(0,volume||0),
    isHold:false,
  };
}

function drawTrace(ctx, buf, headIdx, color, yMin, yMax, showZero, holdActive) {
  const W=ctx.canvas.width, H=ctx.canvas.height, LEN=buf.length;
  ctx.fillStyle="#060d14"; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#0d1f30"; ctx.lineWidth=0.5;
  for(let g=0;g<5;g++){const gy=H*.1+H*.8*(g/4);ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}
  if(showZero){
    const zy=H*.9-(H*.8)*(0-yMin)/(yMax-yMin);
    ctx.strokeStyle="#1e3a52";ctx.lineWidth=.8;ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.moveTo(0,zy);ctx.lineTo(W,zy);ctx.stroke();ctx.setLineDash([]);
  }
  if(holdActive){
    ctx.fillStyle="rgba(251,191,36,0.05)";ctx.fillRect(W*.65,0,W*.35,H);
    ctx.strokeStyle="#fbbf24";ctx.lineWidth=.5;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(W*.65,0);ctx.lineTo(W*.65,H);ctx.stroke();ctx.setLineDash([]);
  }
  ctx.strokeStyle=holdActive?"#fbbf24":color;ctx.lineWidth=1.8;ctx.lineJoin="round";ctx.beginPath();
  let first=true;
  for(let i=0;i<LEN;i++){
    const di=(headIdx-LEN+i+LEN*2)%LEN;
    const x=W*i/(LEN-1);
    const rawY=H*.9-(H*.8)*(buf[di]-yMin)/(yMax-yMin);
    const y=Math.max(2,Math.min(H-2,rawY));
    if(first){ctx.moveTo(x,y);first=false;}else ctx.lineTo(x,y);
  }
  ctx.stroke();
  const lastVal=buf[(headIdx-1+LEN)%LEN];
  const lx=W-3,rawLy=H*.9-(H*.8)*(lastVal-yMin)/(yMax-yMin),ly=Math.max(4,Math.min(H-4,rawLy));
  ctx.fillStyle=holdActive?"#fbbf24":color;ctx.beginPath();ctx.arc(lx,ly,3,0,Math.PI*2);ctx.fill();
}

function Slider({label,unit,value,min,max,step,onChange,color="#4a9eff",alert}){
  const pct=((value-min)/(max-min))*100;
  return(
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
        <span style={{fontSize:9,color:"#475569",letterSpacing:1.5,textTransform:"uppercase"}}>{label}</span>
        <span style={{fontSize:16,fontWeight:700,lineHeight:1,color:alert?"#ef4444":color,fontFamily:'"JetBrains Mono",monospace'}}>
          {value}<span style={{fontSize:9,color:"#475569",marginLeft:3,fontWeight:400}}>{unit}</span>
        </span>
      </div>
      <div style={{position:"relative",height:4,background:"#1e2d3d",borderRadius:2}}>
        <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${pct}%`,background:alert?"#ef4444":color,borderRadius:2,transition:"width 0.1s"}}/>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e=>onChange(parseFloat(e.target.value))}
          style={{position:"absolute",top:"50%",left:0,width:"100%",height:24,transform:"translateY(-50%)",opacity:0,cursor:"pointer",margin:0}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
        <span style={{fontSize:8,color:"#1e3a52"}}>{min}</span>
        <span style={{fontSize:8,color:"#1e3a52"}}>{max}</span>
      </div>
    </div>
  );
}

function Toggle({label,value,onChange,color="#4a9eff"}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0"}}>
      <span style={{fontSize:10,color:"#64748b"}}>{label}</span>
      <div onClick={()=>onChange(!value)} style={{width:36,height:20,borderRadius:10,background:value?color:"#1e2d3d",position:"relative",cursor:"pointer",transition:"background 0.2s",flexShrink:0}}>
        <div style={{position:"absolute",top:3,left:value?17:3,width:14,height:14,borderRadius:7,background:"#fff",transition:"left 0.2s"}}/>
      </div>
    </div>
  );
}

export default function VentSim() {
  const [tab, setTab] = useState("scenarios");
  const [selectedScenario, setSelectedScenario] = useState("healthy-child");
  const [mode, setMode] = useState("vc-ac");
  const [settings, setSettings] = useState(PATIENT_SCENARIOS[0].settings);
  const [physiology, setPhysiology] = useState(PATIENT_SCENARIOS[0].physiology);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [alarmDismissed, setAlarmDismissed] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [holdState, setHoldState] = useState(null);
  const [holdResult, setHoldResult] = useState(null);
  const [live, setLive] = useState({pip:0,flow:0,vol:0});

  // Sound
  const [soundOn, setSoundOn] = useState(false);
  const audioCtxRef = useRef(null);
  const soundTimerRef = useRef(null);
  const settingsRef = useRef(settings);
  const physiologyRef = useRef(physiology);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { physiologyRef.current = physiology; }, [physiology]);

  // Puzzle
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [openHintId, setOpenHintId] = useState(null);
  const [showTeaching, setShowTeaching] = useState(false);
  const [goalsExpanded, setGoalsExpanded] = useState(false);

  const canvPRef = useRef(null);
  const canvFRef = useRef(null);
  const canvVRef = useRef(null);
  const stateRef = useRef({t:0,bufIdx:0,mode,settings,physiology,hold:null});
  const holdResultRef = useRef(null);
  const holdSamplesRef = useRef(0);
  const animRef = useRef(null);
  const tickRef = useRef(0);
  const pressBuf = useRef(new Float32Array(HISTORY).fill(5));
  const flowBuf  = useRef(new Float32Array(HISTORY).fill(0));
  const volBuf   = useRef(new Float32Array(HISTORY).fill(0));

  useEffect(()=>{stateRef.current.mode=mode;},[mode]);
  useEffect(()=>{stateRef.current.settings=settings;},[settings]);
  useEffect(()=>{stateRef.current.physiology=physiology;},[physiology]);
  useEffect(()=>{stateRef.current.hold=holdState;},[holdState]);

  // ── Sound engine ──────────────────────────────────────────────────────────
  const scheduleSounds = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    const period = createVentAudio(ctx, settingsRef.current, physiologyRef.current);
    soundTimerRef.current = setTimeout(scheduleSounds, period * 1000 - 30);
  }, []);

  const toggleSound = useCallback(() => {
    if (soundOn) {
      setSoundOn(false);
      clearTimeout(soundTimerRef.current);
      if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    } else {
      setSoundOn(true);
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      scheduleSounds();
    }
  }, [soundOn, scheduleSounds]);

  // Stop sound on unmount
  useEffect(() => () => {
    clearTimeout(soundTimerRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
  }, []);

  const currentPuzzle = PUZZLE_CASES[puzzleIdx];
  useEffect(()=>{
    if(tab!=="puzzle"||puzzleSolved) return;
    if(currentPuzzle.goals.every(g=>g.check(settings,holdResult,mode))) setPuzzleSolved(true);
  },[settings,holdResult,mode,tab,puzzleIdx,puzzleSolved,currentPuzzle]);

  const loadScenario = useCallback((id)=>{
    const sc=PATIENT_SCENARIOS.find(s=>s.id===id);
    if(!sc) return;
    setSelectedScenario(id);
    setSettings({...sc.settings});
    setPhysiology({...sc.physiology});
    setActiveAlarm(sc.alarm);
    setAlarmDismissed(false);
    setHoldResult(null); setHoldState(null); setShowTroubleshoot(false);
    setTab("monitor");
  },[]);

  const loadPuzzle = useCallback((idx)=>{
    const p=PUZZLE_CASES[idx];
    setPuzzleIdx(idx); setPuzzleSolved(false); setOpenHintId(null); setShowTeaching(false);
    setGoalsExpanded(false);
    setSettings({...p.initSettings}); setPhysiology({...p.initPhysiology});
    setActiveAlarm(null); setAlarmDismissed(false);
    setHoldResult(null); setHoldState(null); setMode("vc-ac");
  },[]);

  const triggerHold = useCallback((type)=>{
    if(holdState){
      setHoldState(null);
      if(holdResultRef.current) setHoldResult(holdResultRef.current);
      holdResultRef.current=null; holdSamplesRef.current=0;
      return;
    }
    setHoldState(type); setHoldResult(null);
    holdResultRef.current=null; holdSamplesRef.current=0;
    setTimeout(()=>{
      setHoldState(prev=>{
        if(prev===type){
          if(holdResultRef.current) setHoldResult(holdResultRef.current);
          holdResultRef.current=null; holdSamplesRef.current=0;
          return null;
        }
        return prev;
      });
    },4000);
  },[holdState]);

  useEffect(()=>{
    const cP=canvPRef.current, cF=canvFRef.current, cV=canvVRef.current;
    if(!cP||!cF||!cV) return;
    const resize=()=>{
      [cP,cF,cV].forEach(c=>{c.width=c.offsetWidth||360;c.height=c.offsetHeight||70;});
    };
    resize();
    const ro=new ResizeObserver(resize);
    [cP,cF,cV].forEach(c=>ro.observe(c));
    const ctxP=cP.getContext("2d"), ctxF=cF.getContext("2d"), ctxV=cV.getContext("2d");
    const DT=1/SAMPLE_RATE;
    let last=performance.now();
    function loop(now){
      const elapsed=Math.min((now-last)/1000,.05); last=now;
      const steps=Math.round(elapsed/DT);
      const ch=stateRef.current.hold;
      for(let i=0;i<steps;i++){
        stateRef.current.t+=DT;
        const s=generateSample(stateRef.current.t,stateRef.current.mode,stateRef.current.settings,stateRef.current.physiology,ch);
        const bi=stateRef.current.bufIdx;
        pressBuf.current[bi]=s.pressure; flowBuf.current[bi]=s.flow; volBuf.current[bi]=s.volume;
        stateRef.current.bufIdx=(bi+1)%HISTORY;
        if(ch){
          holdSamplesRef.current++;
          if(holdSamplesRef.current>60) holdResultRef.current={type:ch,pressure:Math.round(s.pressure*10)/10};
        }
      }
      const bi=stateRef.current.bufIdx;
      const pipMax=stateRef.current.settings.pip*1.5;
      const vtMax=Math.max(stateRef.current.settings.vt*1.5,200);
      drawTrace(ctxP,pressBuf.current,bi,"#4ade80",0,Math.max(pipMax,40),false,!!ch);
      drawTrace(ctxF,flowBuf.current,bi,"#60a5fa",-60,60,true,!!ch);
      drawTrace(ctxV,volBuf.current,bi,"#f472b6",0,vtMax,false,!!ch);
      tickRef.current++;
      if(tickRef.current%12===0){
        setLive({
          pip:Math.round(pressBuf.current[(bi-1+HISTORY)%HISTORY]),
          flow:Math.round(flowBuf.current[(bi-1+HISTORY)%HISTORY]),
          vol:Math.round(volBuf.current[(bi-1+HISTORY)%HISTORY]),
        });
      }
      animRef.current=requestAnimationFrame(loop);
    }
    animRef.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(animRef.current);ro.disconnect();};
  },[]);

  const getHoldResult=()=>{
    if(!holdResult) return null;
    const {type,pressure}=holdResult;
    const {pip,peep}=settings;
    if(type==="insp"){
      const gap=Math.round((pip-pressure)*10)/10;
      const driv=Math.round((pressure-peep)*10)/10;
      return{
        title:"Inspiratory Hold",
        items:[
          {label:"Plateau",val:`${pressure}`,unit:"cmH₂O",color:"#4ade80"},
          {label:"PIP",val:`${Math.round(pip)}`,unit:"cmH₂O",color:"#94a3b8"},
          {label:"Pk–Plat gap",val:`${gap}`,unit:"cmH₂O",color:gap>10?"#ef4444":"#4ade80"},
          {label:"Driving P",val:`${driv}`,unit:"cmH₂O",color:driv>15?"#ef4444":"#4ade80"},
        ],
        interp:gap>10?`Gap ${gap} cmH₂O → RESISTANCE`:driv>15?`Driving P ${driv} → Reduce Vt`:`Normal mechanics. Plat ${pressure}, DP ${driv} cmH₂O.`,
        color:(gap>10||driv>15)?"#ef4444":"#4ade80",
      };
    } else {
      const auto=Math.round((pressure-peep)*10)/10;
      return{
        title:"Expiratory Hold",
        items:[
          {label:"Total PEEP",val:`${pressure}`,unit:"cmH₂O",color:"#60a5fa"},
          {label:"Set PEEP",val:`${peep}`,unit:"cmH₂O",color:"#94a3b8"},
          {label:"Auto-PEEP",val:`${auto}`,unit:"cmH₂O",color:auto>=3?"#f59e0b":"#4ade80"},
        ],
        interp:auto>=3?`Auto-PEEP ${auto} cmH₂O → Air trapping. Reduce RR, extend I:E.`:`Minimal PEEPi (${auto} cmH₂O).`,
        color:auto>=3?"#f59e0b":"#4ade80",
      };
    }
  };

  const result=getHoldResult();
  const alarmInfo=activeAlarm&&ALARM_DATA[activeAlarm]?ALARM_DATA[activeAlarm]:null;
  const puzzleGoalsDone=tab==="puzzle"?currentPuzzle.goals.filter(g=>g.check(settings,holdResult,mode)).length:0;
  const updateSetting=(k,v)=>setSettings(p=>({...p,[k]:v}));
  const updatePhysiology=(k,v)=>setPhysiology(p=>({...p,[k]:v}));

  const waveformVisible = tab==="monitor"||tab==="puzzle";

  return(
    <div style={{padding:"16px 0"}}>
    <div style={{background:"#060d14",color:"#e2e8f0",borderRadius:12,fontFamily:'"JetBrains Mono",monospace',border:"1px solid #1e2d3d",overflow:"hidden",maxWidth:560,margin:"0 auto",display:"flex",flexDirection:"column",minHeight:500}}>
      <style>{`
        @keyframes vpulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes alarmblink{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes slidein{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        @keyframes goalSlide{from{opacity:0;max-height:0;transform:translateY(-4px)}to{opacity:1;max-height:600px;transform:translateY(0)}}
        input[type=range]{-webkit-appearance:none;appearance:none;background:transparent;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#4a9eff;cursor:pointer;}
        .shide::-webkit-scrollbar{display:none;}
      `}</style>

      {/* HEADER */}
      <div style={{borderBottom:"1px solid #1e2d3d",padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0a0f14",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:holdState?"#fbbf24":activeAlarm&&!alarmDismissed?"#ef4444":"#22c55e",animation:"vpulse 1.2s infinite"}}/>
          <span style={{fontSize:9,letterSpacing:2.5,color:"#4a9eff",textTransform:"uppercase"}}>Vent Sim</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:8,color:"#334155"}}>{MODES[mode]?.label}</span>
          {holdState&&<span style={{fontSize:8,color:"#fbbf24",animation:"vpulse 0.8s infinite"}}>● {holdState==="insp"?"INSP":"EXP"} HOLD</span>}
          {tab==="puzzle"&&<span style={{fontSize:8,color:puzzleGoalsDone===currentPuzzle.goals.length?"#22c55e":"#4a9eff"}}>{puzzleGoalsDone}/{currentPuzzle.goals.length} goals</span>}
          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? "Mute vent sounds" : "Enable vent sounds"}
            style={{
              display:"flex",alignItems:"center",gap:4,
              padding:"3px 8px",borderRadius:4,cursor:"pointer",
              border:`1px solid ${soundOn?"#4a9eff44":"#1e3a52"}`,
              background:soundOn?"#0d2137":"transparent",
              color:soundOn?"#4a9eff":"#334155",
              fontSize:8,letterSpacing:1,textTransform:"uppercase",
              fontFamily:"inherit",transition:"all 0.2s",
            }}>
            {soundOn ? "🔊" : "🔇"}
            <span style={{fontSize:7}}>{soundOn?"ON":"OFF"}</span>
          </button>
        </div>
      </div>

      {/* ALARM BANNER */}
      {activeAlarm&&!alarmDismissed&&tab!=="puzzle"&&(
        <div style={{background:`${alarmInfo?.color||"#ef4444"}15`,borderBottom:`1px solid ${alarmInfo?.color||"#ef4444"}44`,padding:"7px 12px",flexShrink:0,animation:"alarmblink 1.5s infinite"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
            <span style={{fontSize:9,color:alarmInfo?.color||"#ef4444",letterSpacing:1.5,textTransform:"uppercase",fontWeight:700}}>⚠ {activeAlarm}</span>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button onClick={()=>setShowTroubleshoot(t=>!t)} style={{padding:"3px 8px",borderRadius:3,cursor:"pointer",border:`1px solid ${alarmInfo?.color||"#ef4444"}`,background:"transparent",color:alarmInfo?.color||"#ef4444",fontSize:8,letterSpacing:1,textTransform:"uppercase",fontFamily:"inherit"}}>{showTroubleshoot?"Hide":"Guide"}</button>
              <button onClick={()=>setAlarmDismissed(true)} style={{padding:"3px 8px",borderRadius:3,cursor:"pointer",border:"1px solid #1e3a52",background:"transparent",color:"#475569",fontSize:8,fontFamily:"inherit"}}>✕</button>
            </div>
          </div>
        </div>
      )}
      {showTroubleshoot&&alarmInfo&&tab!=="puzzle"&&(
        <div style={{background:"#0a0f14",borderBottom:"1px solid #1e2d3d",padding:"10px 12px",animation:"slidein 0.2s ease",flexShrink:0}}>
          <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:7}}>
            {alarmInfo.causes.map((c,i)=><div key={i} style={{fontSize:9,color:"#64748b"}}><span style={{color:alarmInfo.color}}>{i+1}.</span> {c}</div>)}
          </div>
          <div style={{fontSize:9,color:"#94a3b8",lineHeight:1.6,borderLeft:`2px solid ${alarmInfo.color}`,paddingLeft:8,marginBottom:7}}>{alarmInfo.action}</div>
          <div style={{display:"flex",gap:6,background:"#1a1000",borderRadius:5,padding:"6px 8px",fontSize:9,color:"#fbbf24"}}>
            <span style={{flexShrink:0}}>💡</span>{alarmInfo.pearl}
          </div>
        </div>
      )}

      {/* WAVEFORM BLOCK */}
      <div style={{display:waveformVisible?"block":"none",flexShrink:0}}>
        <div style={{display:"flex",borderBottom:"1px solid #1e2d3d",overflowX:"auto"}} className="shide">
          {[
            {label:"PIP",val:live.pip,unit:"cmH₂O",color:"#4ade80",alert:live.pip>35},
            {label:"PEEP",val:settings.peep,unit:"cmH₂O",color:"#4ade80"},
            {label:"Vt",val:settings.vt,unit:"mL",color:"#f472b6"},
            {label:"RR",val:settings.rr,unit:"/min",color:"#e2e8f0"},
            {label:"FiO₂",val:`${settings.fio2}%`,unit:"",color:settings.fio2>60?"#ef4444":"#fb923c"},
            {label:"MV",val:((settings.vt*settings.rr)/1000).toFixed(1),unit:"L/min",color:"#94a3b8"},
          ].map(p=>(
            <div key={p.label} style={{padding:"6px 8px",borderRight:"1px solid #1e2d3d",textAlign:"center",minWidth:52,flexShrink:0}}>
              <div style={{fontSize:7,color:"#334155",letterSpacing:1.5,textTransform:"uppercase",marginBottom:1}}>{p.label}</div>
              <div style={{fontSize:17,fontWeight:700,color:p.alert?"#ef4444":p.color,lineHeight:1,fontFamily:'"JetBrains Mono",monospace'}}>{p.val}</div>
              <div style={{fontSize:7,color:"#334155"}}>{p.unit}</div>
            </div>
          ))}
        </div>

        <div style={{padding:"6px 10px",display:"flex",flexDirection:"column",gap:4,background:"#060d14"}}>
          {[
            {ref:canvPRef,label:"Paw",unit:"cmH₂O",val:live.pip,color:"#4ade80"},
            {ref:canvFRef,label:"Flow",unit:"L/min",val:live.flow,color:"#60a5fa"},
            {ref:canvVRef,label:"Vol",unit:"mL",val:live.vol,color:"#f472b6"},
          ].map(row=>(
            <div key={row.label} style={{display:"flex",gap:6,alignItems:"center"}}>
              <div style={{width:40,flexShrink:0}}>
                <div style={{fontSize:8,color:row.color,letterSpacing:1,textTransform:"uppercase"}}>{row.label}</div>
                <div style={{fontSize:7,color:"#1e3a52"}}>{row.unit}</div>
                <div style={{fontSize:13,fontWeight:600,color:holdState?"#fbbf24":row.color,marginTop:1}}>{row.val}</div>
              </div>
              <canvas ref={row.ref} style={{flex:1,height:70,borderRadius:4,border:"1px solid #0e1f2e",display:"block"}}/>
            </div>
          ))}
        </div>

        <div style={{borderTop:"1px solid #1e2d3d",padding:"8px 10px",background:"#0a0f14"}}>
          <div style={{fontSize:8,color:"#334155",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Hold Manoeuvres</div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <button onClick={()=>triggerHold("insp")} style={{background:holdState==="insp"?"#1a3a00":"#0e1922",border:`1px solid ${holdState==="insp"?"#fbbf24":"#1e3a52"}`,color:holdState==="insp"?"#fbbf24":"#4ade80",padding:"6px 12px",borderRadius:4,cursor:"pointer",fontSize:9,letterSpacing:1,textTransform:"uppercase",fontFamily:"inherit"}}>{holdState==="insp"?"⏹ Release":"⏸ Insp Hold"}</button>
            <button onClick={()=>triggerHold("exp")} style={{background:holdState==="exp"?"#1a0a00":"#0e1922",border:`1px solid ${holdState==="exp"?"#fbbf24":"#1e3a52"}`,color:holdState==="exp"?"#fbbf24":"#60a5fa",padding:"6px 12px",borderRadius:4,cursor:"pointer",fontSize:9,letterSpacing:1,textTransform:"uppercase",fontFamily:"inherit"}}>{holdState==="exp"?"⏹ Release":"⏸ Exp Hold"}</button>
            {holdState&&<span style={{fontSize:9,color:"#fbbf24",animation:"vpulse 0.8s infinite"}}>Measuring…</span>}
            {!holdState&&<span style={{fontSize:8,color:"#1e3a52"}}>4s auto-release</span>}
          </div>
          {result&&(
            <div style={{marginTop:8,background:"#060d14",borderRadius:6,padding:"8px 10px",border:`1px solid ${result.color}33`,animation:"slidein 0.2s ease"}}>
              <div style={{fontSize:8,color:result.color,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>{result.title} Result</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                {result.items.map((item,i)=>(
                  <div key={i} style={{background:"#0a0f14",borderRadius:5,padding:"4px 8px",border:"1px solid #1e2d3d"}}>
                    <div style={{fontSize:7,color:"#334155",letterSpacing:1,textTransform:"uppercase"}}>{item.label}</div>
                    <div style={{fontSize:14,fontWeight:700,color:item.color,lineHeight:1.1}}>{item.val} <span style={{fontSize:8,fontWeight:400,color:"#475569"}}>{item.unit}</span></div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:9,color:result.color,borderLeft:`2px solid ${result.color}`,paddingLeft:8,lineHeight:1.6}}>→ {result.interp}</div>
            </div>
          )}
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div style={{flex:1,overflowY:"auto",background:"#060d14"}} className="shide">

        {/* SCENARIOS TAB */}
        {tab==="scenarios"&&(
          <div style={{padding:"10px 12px"}}>
            <div style={{fontSize:8,color:"#334155",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Patient Presets — tap to load</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {PATIENT_SCENARIOS.map(sc=>(
                <button key={sc.id} onClick={()=>loadScenario(sc.id)} style={{width:"100%",textAlign:"left",padding:"10px 12px",borderRadius:7,cursor:"pointer",border:`1px solid ${selectedScenario===sc.id?BADGE[sc.badge]||"#4a9eff":"#1e2d3d"}`,background:selectedScenario===sc.id?`${BADGE[sc.badge]||"#4a9eff"}12`:"#0a0f14",fontFamily:'"JetBrains Mono",monospace',transition:"all 0.15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                    <span style={{fontSize:11,color:selectedScenario===sc.id?BADGE[sc.badge]:"#94a3b8",fontWeight:600}}>{sc.label}</span>
                    {sc.alarm&&<span style={{fontSize:7,color:"#ef4444",letterSpacing:1,background:"#ef444415",padding:"2px 5px",borderRadius:2}}>ALARM</span>}
                  </div>
                  <div style={{fontSize:9,color:"#475569",lineHeight:1.4,marginBottom:3}}>{sc.description}</div>
                  {sc.weight>0&&<div style={{fontSize:8,color:"#334155"}}>{sc.weight}kg · RR {sc.settings.rr} · PIP {sc.settings.pip} · PEEP {sc.settings.peep}</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CONTROLS TAB */}
        {tab==="controls"&&(
          <div style={{padding:"10px 12px"}}>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:8,color:"#334155",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Ventilator Mode</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                {Object.entries(MODES).map(([id,m])=>(
                  <button key={id} onClick={()=>setMode(id)} style={{padding:"5px 10px",borderRadius:4,cursor:"pointer",border:`1px solid ${mode===id?"#4a9eff":"#1e3a52"}`,background:mode===id?"#0d2137":"#0a0f14",color:mode===id?"#4a9eff":"#475569",fontSize:9,letterSpacing:1,fontFamily:"inherit"}}>{m.label}</button>
                ))}
              </div>
              <div style={{fontSize:9,color:"#334155",lineHeight:1.5,borderLeft:"2px solid #1e3a52",paddingLeft:8}}>{MODES[mode]?.note}</div>
            </div>
            <div style={{borderTop:"1px solid #1e2d3d",paddingTop:12,marginBottom:14}}>
              <div style={{fontSize:8,color:"#334155",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Vent Parameters</div>
              <Slider label="Peak Insp Pressure" unit="cmH₂O" value={settings.pip} min={10} max={60} step={1} onChange={v=>updateSetting("pip",v)} color="#4ade80" alert={settings.pip>35}/>
              <Slider label="PEEP" unit="cmH₂O" value={settings.peep} min={3} max={20} step={1} onChange={v=>updateSetting("peep",v)} color="#4ade80"/>
              <Slider label="Tidal Volume" unit="mL" value={settings.vt} min={20} max={500} step={5} onChange={v=>updateSetting("vt",v)} color="#f472b6"/>
              <Slider label="Respiratory Rate" unit="/min" value={settings.rr} min={8} max={60} step={1} onChange={v=>updateSetting("rr",v)} color="#60a5fa"/>
              <Slider label="FiO₂" unit="%" value={settings.fio2} min={21} max={100} step={1} onChange={v=>updateSetting("fio2",v)} color="#fb923c" alert={settings.fio2>60}/>
              <Slider label="I:E (insp fraction)" unit="" value={settings.ie} min={0.15} max={0.6} step={0.01} onChange={v=>updateSetting("ie",v)} color="#a78bfa"/>
              <Slider label="Peak Flow" unit="L/min" value={settings.flow} min={3} max={30} step={1} onChange={v=>updateSetting("flow",v)} color="#60a5fa"/>
              <div style={{background:"#0a0f14",borderRadius:5,padding:"8px 10px",border:"1px solid #1e2d3d",fontSize:9,color:"#475569",marginTop:6}}>
                <div style={{color:"#334155",marginBottom:4,fontSize:8,letterSpacing:1,textTransform:"uppercase"}}>Derived</div>
                <div>MV: {((settings.vt*settings.rr)/1000).toFixed(2)} L/min · I:E = 1:{(1/settings.ie-1).toFixed(1)} · Ti = {((60/settings.rr)*settings.ie/(1+settings.ie)).toFixed(2)}s</div>
              </div>
            </div>
            <div style={{borderTop:"1px solid #1e2d3d",paddingTop:12}}>
              <div style={{fontSize:8,color:"#334155",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Lung Physiology</div>
              <Slider label="Compliance" unit="×normal" value={physiology.compliance} min={0.1} max={1.5} step={0.05}
                onChange={v=>{updatePhysiology("compliance",v);setActiveAlarm(v<0.5?"HIGH PIP + HIGH PLATEAU → LOW COMPLIANCE":null);setAlarmDismissed(false);}}
                color="#4ade80" alert={physiology.compliance<0.4}/>
              <div style={{fontSize:8,color:"#334155",marginTop:-6,marginBottom:10}}>&lt;0.4 = stiff (ARDS) · 1.0 = normal</div>
              <Slider label="Airway Resistance" unit="×normal" value={physiology.resistance} min={0.5} max={5} step={0.1}
                onChange={v=>{updatePhysiology("resistance",v);setActiveAlarm(v>2?"HIGH PIP (RESISTANCE) + AUTO-PEEP":null);setAlarmDismissed(false);}}
                color="#f59e0b" alert={physiology.resistance>2.5}/>
              <div style={{fontSize:8,color:"#334155",marginTop:-6,marginBottom:10}}>&gt;2 = obstructive · &gt;3 = severe</div>
              <Slider label="Auto-PEEP" unit="cmH₂O" value={physiology.autopeep} min={0} max={15} step={0.5} onChange={v=>updatePhysiology("autopeep",v)} color="#f59e0b" alert={physiology.autopeep>5}/>
              <Slider label="Circuit Leak" unit="fraction" value={physiology.leak} min={0} max={0.8} step={0.05}
                onChange={v=>{updatePhysiology("leak",v);setActiveAlarm(v>0.3?"LOW Vt — CIRCUIT LEAK":null);setAlarmDismissed(false);}}
                color="#f97316" alert={physiology.leak>0.3}/>
              <Toggle label="Flow Starvation (VC mode)" value={physiology.starvation}
                onChange={v=>{updatePhysiology("starvation",v);setActiveAlarm(v?"FLOW STARVATION — VC MODE":null);setAlarmDismissed(false);}} color="#eab308"/>
              <Toggle label="Dyssynchrony / Agitation" value={physiology.dyssynch}
                onChange={v=>{updatePhysiology("dyssynch",v);setActiveAlarm(v?"PATIENT–VENTILATOR DYSSYNCHRONY":null);setAlarmDismissed(false);}} color="#8b5cf6"/>
              <button onClick={()=>{
                updatePhysiology("compliance",1.0);updatePhysiology("resistance",1.0);
                updatePhysiology("autopeep",0);updatePhysiology("leak",0);
                updatePhysiology("starvation",false);updatePhysiology("dyssynch",false);
                setActiveAlarm(null);
              }} style={{width:"100%",padding:"7px",borderRadius:4,cursor:"pointer",marginTop:10,border:"1px solid #1e3a52",background:"#0a0f14",color:"#475569",fontSize:9,letterSpacing:1,textTransform:"uppercase",fontFamily:"inherit"}}>Reset Physiology</button>
            </div>
          </div>
        )}

        {/* PUZZLE TAB */}
        {tab==="puzzle"&&(
          <div style={{padding:"10px 12px"}}>
            {/* Case tabs */}
            <div style={{display:"flex",gap:0,marginBottom:12,overflowX:"auto",borderBottom:"1px solid #1e2d3d",marginLeft:-12,marginRight:-12,paddingLeft:12}} className="shide">
              {PUZZLE_CASES.map((p,i)=>(
                <button key={p.id} onClick={()=>loadPuzzle(i)} style={{padding:"7px 12px",borderRight:"1px solid #1e2d3d",cursor:"pointer",flexShrink:0,background:puzzleIdx===i?`${BADGE[p.badge]||"#4a9eff"}15`:"#0a0f14",border:"none",borderBottom:`2px solid ${puzzleIdx===i?BADGE[p.badge]||"#4a9eff":"transparent"}`,color:puzzleIdx===i?BADGE[p.badge]||"#4a9eff":"#334155",fontSize:8,letterSpacing:1,fontFamily:"inherit",textTransform:"uppercase",transition:"all 0.15s"}}>Case {i+1}</button>
              ))}
            </div>

            {/* Case header */}
            <div style={{marginBottom:12,animation:"slidein 0.2s ease"}}>
              <div style={{fontSize:11,color:BADGE[currentPuzzle.badge],fontWeight:700,marginBottom:6}}>{currentPuzzle.title}</div>
              <div style={{fontSize:10,color:"#94a3b8",lineHeight:1.6,background:"#0a0f14",borderRadius:6,padding:"10px 12px",border:"1px solid #1e2d3d",marginBottom:6}}>{currentPuzzle.scenario}</div>
              {currentPuzzle.suggestedHold&&(
                <div style={{fontSize:8,color:"#4a9eff",letterSpacing:1}}>→ Use {currentPuzzle.suggestedHold==="insp"?"Inspiratory":"Expiratory"} Hold to gather data (buttons above)</div>
              )}
            </div>

            {/* Mode selector */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:8,color:"#334155",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Mode</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {Object.entries(MODES).map(([id,m])=>(
                  <button key={id} onClick={()=>setMode(id)} style={{padding:"5px 10px",borderRadius:4,cursor:"pointer",border:`1px solid ${mode===id?"#4a9eff":"#1e3a52"}`,background:mode===id?"#0d2137":"#0a0f14",color:mode===id?"#4a9eff":"#475569",fontSize:9,letterSpacing:1,fontFamily:"inherit"}}>{m.label}</button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:8,color:"#334155",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Adjust Settings</div>
              <Slider label="PIP" unit="cmH₂O" value={settings.pip} min={10} max={60} step={1} onChange={v=>updateSetting("pip",v)} color="#4ade80" alert={settings.pip>35}/>
              <Slider label="PEEP" unit="cmH₂O" value={settings.peep} min={3} max={20} step={1} onChange={v=>updateSetting("peep",v)} color="#4ade80"/>
              <Slider label="Tidal Volume" unit="mL" value={settings.vt} min={20} max={500} step={5} onChange={v=>updateSetting("vt",v)} color="#f472b6"/>
              <Slider label="RR" unit="/min" value={settings.rr} min={8} max={60} step={1} onChange={v=>updateSetting("rr",v)} color="#60a5fa"/>
              <Slider label="FiO₂" unit="%" value={settings.fio2} min={21} max={100} step={1} onChange={v=>updateSetting("fio2",v)} color="#fb923c" alert={settings.fio2>60}/>
              <Slider label="I:E (insp fraction)" unit="" value={settings.ie} min={0.15} max={0.6} step={0.01} onChange={v=>updateSetting("ie",v)} color="#a78bfa"/>
              <Slider label="Peak Flow" unit="L/min" value={settings.flow} min={3} max={30} step={1} onChange={v=>updateSetting("flow",v)} color="#60a5fa"/>
            </div>

            {/* ── COLLAPSIBLE GOALS SECTION ── */}
            <div style={{marginBottom:12}}>
              {/* Goals header — always visible, acts as toggle */}
              <button
                onClick={()=>setGoalsExpanded(e=>!e)}
                style={{
                  width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"9px 12px",borderRadius:goalsExpanded?"6px 6px 0 0":"6px",
                  cursor:"pointer",border:"1px solid #1e3a52",
                  background:goalsExpanded?"#0d1a0d":"#0a0f14",
                  fontFamily:"inherit",transition:"all 0.15s",
                }}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:8,color:"#334155",letterSpacing:2,textTransform:"uppercase"}}>Goals & Hints</span>
                  <span style={{
                    fontSize:8,fontWeight:700,
                    color:puzzleGoalsDone===currentPuzzle.goals.length?"#22c55e":"#4a9eff",
                    background:puzzleGoalsDone===currentPuzzle.goals.length?"#22c55e18":"#4a9eff18",
                    padding:"2px 7px",borderRadius:10,
                  }}>{puzzleGoalsDone}/{currentPuzzle.goals.length}</span>
                  {puzzleGoalsDone > 0 && puzzleGoalsDone < currentPuzzle.goals.length && (
                    <span style={{fontSize:7,color:"#4ade80",letterSpacing:1}}>
                      {currentPuzzle.goals.filter(g=>g.check(settings,holdResult,mode)).map(()=>"▪").join("")}
                      {currentPuzzle.goals.filter(g=>!g.check(settings,holdResult,mode)).map(()=>"▫").join("")}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize:10,color:"#334155",
                  transform:goalsExpanded?"rotate(180deg)":"rotate(0deg)",
                  transition:"transform 0.2s",display:"inline-block",
                }}>▼</span>
              </button>

              {/* Collapsed hint strip — shows mini progress without revealing goals */}
              {!goalsExpanded && (
                <div style={{
                  padding:"6px 12px",borderRadius:"0 0 6px 6px",
                  background:"#070c0a",border:"1px solid #1e3a52",borderTop:"none",
                  fontSize:8,color:"#334155",lineHeight:1.5,
                }}>
                  {puzzleGoalsDone === 0
                    ? "Examine the waveforms and adjust settings to fix this patient."
                    : puzzleGoalsDone === currentPuzzle.goals.length
                    ? "✓ All goals met — expand to review."
                    : `${puzzleGoalsDone} goal${puzzleGoalsDone>1?"s":""} met — keep going. Expand to see targets.`}
                </div>
              )}

              {/* Expanded goals list */}
              {goalsExpanded && (
                <div style={{
                  border:"1px solid #1e3a52",borderTop:"none",
                  borderRadius:"0 0 6px 6px",overflow:"hidden",
                  animation:"goalSlide 0.2s ease",
                }}>
                  {currentPuzzle.goals.map((g,i)=>{
                    const done=g.check(settings,holdResult,mode);
                    const hintOpen = openHintId === g.id;
                    return(
                      <div key={g.id} style={{borderTop:i>0?"1px solid #1a2530":"none"}}>
                        <div style={{
                          display:"flex",gap:8,alignItems:"flex-start",
                          padding:"8px 10px",
                          background:done?"#0a1f0a":"#080e14",
                          transition:"background 0.3s",
                        }}>
                          <div style={{
                            width:18,height:18,borderRadius:"50%",flexShrink:0,marginTop:1,
                            background:done?"#22c55e":"#1e2d3d",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:10,color:done?"#fff":"#334155",transition:"all 0.3s",
                          }}>{done?"✓":i+1}</div>
                          <div style={{flex:1,fontSize:10,color:done?"#4ade80":"#64748b",lineHeight:1.4}}>{g.label}</div>
                          {!done&&(
                            <button
                              onClick={()=>setOpenHintId(prev => prev===g.id ? null : g.id)}
                              style={{
                                padding:"2px 7px",borderRadius:3,cursor:"pointer",
                                border:`1px solid ${hintOpen?"#4ade8066":"#1e3a52"}`,
                                background:hintOpen?"#0f1a00":"transparent",
                                color:hintOpen?"#4ade80":"#334155",
                                fontSize:8,letterSpacing:1,fontFamily:"inherit",flexShrink:0,
                                transition:"all 0.15s",
                              }}>
                              {hintOpen?"HIDE":"HINT"}
                            </button>
                          )}
                        </div>
                        {hintOpen&&!done&&(
                          <div style={{
                            fontSize:9,color:"#4ade80",background:"#0f1a00",
                            padding:"7px 10px 7px 36px",
                            borderTop:"1px solid #4ade8022",lineHeight:1.6,
                            animation:"slidein 0.15s ease",
                          }}>
                            💡 {g.hint}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Solved */}
            {puzzleSolved&&(
              <div style={{background:"#0a1f0a",borderRadius:8,padding:"14px",border:"2px solid #22c55e44",animation:"popIn 0.3s ease",marginBottom:12}}>
                <div style={{fontSize:12,color:"#22c55e",fontWeight:700,marginBottom:8,letterSpacing:1}}>✓ CASE SOLVED — {currentPuzzle.diagnosis}</div>
                <button onClick={()=>setShowTeaching(t=>!t)} style={{padding:"5px 12px",borderRadius:4,cursor:"pointer",border:"1px solid #22c55e",background:"transparent",color:"#22c55e",fontSize:9,letterSpacing:1,textTransform:"uppercase",fontFamily:"inherit",marginBottom:8}}>{showTeaching?"Hide Teaching":"Show Teaching Points"}</button>
                {showTeaching&&<div style={{fontSize:10,color:"#94a3b8",lineHeight:1.7,borderLeft:"2px solid #22c55e",paddingLeft:10,marginBottom:10}}>{currentPuzzle.teaching}</div>}
                {puzzleIdx<PUZZLE_CASES.length-1?(
                  <button onClick={()=>loadPuzzle(puzzleIdx+1)} style={{padding:"7px 14px",borderRadius:4,cursor:"pointer",border:"1px solid #4a9eff",background:"#0d2137",color:"#4a9eff",fontSize:9,letterSpacing:1,textTransform:"uppercase",fontFamily:"inherit"}}>Next Case →</button>
                ):(
                  <div style={{fontSize:9,color:"#4ade80"}}>🏆 All 10 cases complete!</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM TAB BAR */}
      <div style={{display:"flex",borderTop:"1px solid #1e2d3d",background:"#0a0f14",flexShrink:0}}>
        {[
          {id:"monitor",   label:"Monitor",   icon: <ChartLine   size={16} /> },
          {id:"scenarios", label:"Scenarios", icon: <Person      size={16} /> },
          {id:"controls",  label:"Controls",  icon: <Gear        size={16} /> },
          {id:"puzzle",    label:"Puzzle",    icon: <PuzzlePiece size={16} /> },
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px 8px",border:"none",cursor:"pointer",background:tab===t.id?"#0d2137":"transparent",borderTop:`2px solid ${tab===t.id?"#4a9eff":"transparent"}`,color:tab===t.id?"#4a9eff":"#334155",fontFamily:'"JetBrains Mono",monospace',fontSize:7,letterSpacing:1.5,textTransform:"uppercase",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all 0.15s"}}>
            <span style={{fontSize:16,lineHeight:1}}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{borderTop:"1px solid #1e2d3d",padding:"4px 12px",background:"#0a0f14",flexShrink:0}}>
        <span style={{fontSize:7,color:"#1e3a52",letterSpacing:1}}>Tintinalli · BTS/ATS · PEMVECC 2017 · ARDSnet · OpenPediatrics — Educational simulator only</span>
      </div>
    </div>
    </div>
  );
}
