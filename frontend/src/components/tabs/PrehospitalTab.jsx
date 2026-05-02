// frontend/src/components/tabs/PrehospitalTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Prehospital Pediatric Emergency Management
// Based on:
//   • PREM Trauma Training Module — NHM Tamil Nadu / TAEI / ICH Madras Medical College
//   • WHO Standard Treatment Manual for Children, 4th Ed 2017
//   • PALS 2020 · Tintinalli · IAP Guidelines
//   • IAPPEM 2026 — Regional Poison Information Centres (India)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Warning,
  Lightbulb,
  CaretDown,
  CheckCircle,
  XCircle,
  Siren,
  FirstAid,
  Heartbeat,
  Wind,
  Brain,
  Fire,
  Bug,
  Skull,
  Ambulance,
  ShieldWarning,
  HandFist,
  Phone,
  MapPin,
  Copy,
} from "@phosphor-icons/react";

// ─── COLOUR MAP ───────────────────────────────────────────────────────────────
const CMAP = {
  red:     { bg: "bg-red-50 dark:bg-red-950/30",     border: "border-red-300 dark:border-red-700",     text: "text-red-700 dark:text-red-300",     badge: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-300 dark:border-amber-700", text: "text-amber-700 dark:text-amber-300", badge: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-300 dark:border-emerald-700", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" },
  sky:     { bg: "bg-sky-50 dark:bg-sky-950/30",     border: "border-sky-300 dark:border-sky-700",     text: "text-sky-700 dark:text-sky-300",     badge: "bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300" },
  violet:  { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-300 dark:border-violet-700", text: "text-violet-700 dark:text-violet-300", badge: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300" },
  orange:  { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-300 dark:border-orange-700", text: "text-orange-700 dark:text-orange-300", badge: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300" },
  slate:   { bg: "bg-slate-50 dark:bg-slate-900/40", border: "border-slate-200 dark:border-slate-700",  text: "text-slate-700 dark:text-slate-300",  badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" },
  teal:    { bg: "bg-teal-50 dark:bg-teal-950/30",   border: "border-teal-300 dark:border-teal-700",   text: "text-teal-700 dark:text-teal-300",   badge: "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300" },
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function DoList({ items, color = "emerald" }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
          <CheckCircle size={12} weight="fill" className={`flex-shrink-0 mt-0.5 ${
            color === "emerald" ? "text-emerald-500" : color === "sky" ? "text-sky-500" : "text-amber-500"
          }`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DontList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
          <XCircle size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-red-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Pearl({ text }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2.5 mt-3">
      <Lightbulb size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
      <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{text}</p>
    </div>
  );
}

function StepCard({ number, title, body, urgent }) {
  return (
    <div className={`flex gap-3 rounded-xl border p-3.5 ${urgent ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50"}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5 ${urgent ? "bg-red-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100"}`}
        style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{number}</div>
      <div>
        {title && <div className={`font-bold text-xs mb-0.5 ${urgent ? "text-red-700 dark:text-red-300" : "text-slate-900 dark:text-white"}`}>{title}</div>}
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

// ─── POISON INFORMATION CENTRES DATA ─────────────────────────────────────────
const POISON_CENTRES = [
  {
    name: "AIIMS New Delhi",
    fullName: "All India Institute of Medical Sciences",
    city: "New Delhi",
    region: "North India",
    numbers: ["011-26850691", "011-26159391", "011-265936772"],
    available: "24 hours",
    color: "red",
  },
  {
    name: "Amrita Institute — Kochi",
    fullName: "Amrita Institute of Medical Sciences",
    city: "Kochi, Kerala",
    region: "South India",
    numbers: ["+91-484-2858056", "+91-484-2851234 (Ext: 8056, 6034, 8096)", "09895282388"],
    available: "24 hours",
    color: "sky",
  },
  {
    name: "CMC Vellore",
    fullName: "Christian Medical College",
    city: "Vellore, Tamil Nadu",
    region: "South India",
    numbers: ["1800-425-1213"],
    available: "Toll-free",
    color: "emerald",
  },
  {
    name: "Egmore Poison Control",
    fullName: "Egmore Poison Control Centre",
    city: "Chennai, Tamil Nadu",
    region: "South India",
    numbers: ["044-281-92922"],
    available: "24 hours",
    color: "violet",
  },
  // Additional well-known centres
  {
    name: "NIMHANS Bangalore",
    fullName: "National Institute of Mental Health and Neurosciences",
    city: "Bengaluru, Karnataka",
    region: "South India",
    numbers: ["080-46110007"],
    available: "24 hours",
    color: "amber",
  },
  {
    name: "KEM Hospital Mumbai",
    fullName: "KEM Hospital Poison Information Centre",
    city: "Mumbai, Maharashtra",
    region: "West India",
    numbers: ["022-24136000", "022-24152121"],
    available: "24 hours",
    color: "orange",
  },
];

// ─── SECTION: POISON INFORMATION CENTRES ─────────────────────────────────────
function PoisonCentresSection() {
  const [copied, setCopied] = useState(null);

  const handleCopy = (number, id) => {
    // Strip formatting for dialing
    const clean = number.replace(/[^0-9+]/g, "");
    navigator.clipboard?.writeText(clean).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="flex items-start gap-2 rounded-xl border-2 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/40 px-4 py-3">
        <Phone size={16} weight="fill" className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-sm text-red-700 dark:text-red-300" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            National Poison Information Centres — India
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 font-mono mt-0.5">
            Available 24 hrs · Call immediately for suspected poisoning · Expert guidance on antidotes and management
          </div>
        </div>
      </div>

      {/* Quick-call cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {POISON_CENTRES.map((centre, ci) => {
          const c = CMAP[centre.color] || CMAP.slate;
          return (
            <div key={ci} className={`rounded-xl border-2 overflow-hidden ${c.border}`}>
              {/* Header */}
              <div className={`px-4 py-2.5 flex items-start justify-between gap-2 ${c.bg}`}>
                <div>
                  <div className={`font-bold text-sm ${c.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                    {centre.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin size={10} weight="fill" className={c.text} />
                    <span className={`text-[10px] font-mono ${c.text} opacity-80`}>{centre.city}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${c.badge} ml-1`}>{centre.region}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-mono px-2 py-1 rounded-full ${c.badge} flex-shrink-0`}>
                  {centre.available}
                </span>
              </div>

              {/* Phone numbers */}
              <div className="px-4 py-3 bg-white dark:bg-slate-900/50 space-y-2">
                {centre.numbers.map((num, ni) => {
                  const copyId = `${ci}-${ni}`;
                  const isCopied = copied === copyId;
                  return (
                    <div key={ni} className="flex items-center justify-between gap-2">
                      <a
                        href={`tel:${num.replace(/[^0-9+]/g, "")}`}
                        className={`flex items-center gap-2 font-mono font-bold text-sm ${c.text} hover:underline`}
                      >
                        <Phone size={11} weight="fill" className="flex-shrink-0" />
                        {num}
                      </a>
                      <button
                        onClick={() => handleCopy(num, copyId)}
                        className="flex items-center gap-1 text-[9px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Copy number"
                      >
                        <Copy size={10} weight="bold" />
                        {isCopied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Full name footer */}
              <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[9px] text-slate-400 font-mono">{centre.fullName}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* When to call */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
        <div className="font-bold text-xs text-amber-800 dark:text-amber-200 mb-2">
          When to call a Poison Centre
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <DoList items={[
            "Unknown substance ingested — identify toxidrome",
            "Known overdose — confirm safe dose vs toxic dose",
            "Antidote dose or availability guidance",
            "Rare or industrial chemical exposure",
            "Child asymptomatic after ingestion — risk stratification",
            "Snake or scorpion envenomation — ASV dosing guidance",
          ]} color="amber" />
          <DoList items={[
            "Drug-drug interactions in polypharmacy overdose",
            "Paracetamol overdose — timing and NAC protocol",
            "Organophosphate — atropine titration advice",
            "Methanol / ethylene glycol ingestion",
            "Plant or mushroom ingestion — toxicity identification",
            "CO poisoning with delayed presentation",
          ]} color="amber" />
        </div>
      </div>

      {/* Source note */}
      <div className="text-[10px] text-slate-400 font-mono text-center">
        Source: IAPPEM 2026 · Additional centres from IAP / national directories · Numbers verified May 2026
      </div>
    </div>
  );
}

// ─── SECTION: TRIAGE ──────────────────────────────────────────────────────────
function TriageSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 px-3 py-2.5 text-xs text-sky-800 dark:text-sky-200">
        <Siren size={12} weight="fill" className="flex-shrink-0 mt-0.5 text-sky-500" />
        <span>The PREM approach: assess ABCDE within <strong>1 minute</strong>, initiate life-saving intervention simultaneously. Do not delay treatment for investigations.</span>
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">Consciousness — AVPU Scale</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { letter: "A", label: "Alert",       detail: "Child is 'as usual' per mother. Interacting, playful, consolable.", color: "emerald" },
            { letter: "V", label: "Voice",        detail: "Responds only to voice. 'More sleepy than usual', 'not as usual'.", color: "amber" },
            { letter: "P", label: "Pain",         detail: "Responds only to pain. Posturing may mimic seizure — rule out shock first.", color: "orange" },
            { letter: "U", label: "Unresponsive", detail: "No response. If no precipitating event, consider non-convulsive status epilepticus.", color: "red" },
          ].map(d => {
            const c = CMAP[d.color];
            return (
              <div key={d.letter} className={`rounded-xl border p-3 ${c.border} ${c.bg}`}>
                <div className={`text-3xl font-black ${c.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{d.letter}</div>
                <div className={`font-bold text-xs mb-1 ${c.text}`}>{d.label}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">{d.detail}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">Modified Rapid Cardiopulmonary Cerebral Assessment (PREM Triangle)</div>
        <div className="space-y-2">
          {[
            {
              letter: "A", label: "Airway", color: "sky",
              assess: ["Crying / talking / coughing → maintainable airway", "Stridor in alert child → structural obstruction", "Unresponsive / posturing → airway likely lost (tongue falls back)"],
              act: ["Head tilt–chin lift manoeuvre", "Suction oropharynx with Yankauer", "Insert age-appropriate NGT to decompress stomach", "Avoid separating mother and child if airway is maintainable"],
            },
            {
              letter: "B", label: "Breathing", color: "emerald",
              assess: ["Count RR for 6 s × 10", "Classify: Normal / Effortless tachypnea / Respiratory distress / Impending failure / Apnoea", "Note retractions, grunt, abdominal breathing (sign of impending failure)", "Auscultate infra-axillary (all 3 lobes represented)"],
              act: ["Apnoea → BVM ventilation immediately", "Effortless tachypnoea → Non-rebreathing mask at 10–15 L/min", "Respiratory distress / impending failure → Jackson-Rees (CPAP) circuit at 10–15 L/min", "Ensure air-tight EC clamp; insert NGT if BVM ventilating"],
            },
            {
              letter: "C", label: "Circulation", color: "red",
              assess: ["Count HR for 6 s × 10 — tachycardia is earliest sign of shock", "Compare core–peripheral temperature (dorsum hand: abdomen vs ankle)", "Femoral vs dorsalis pedis pulse strength comparison", "CRT — elevate limb above heart, blanch skin: normal ≤2 s", "Liver span — large span suggests cardiac dysfunction", "BP — lower normal for age is dangerous in drowsy child"],
              act: ["Bradycardia → CPR (15:2)", "Tachycardia + shock → secure IV/IO access", "20 mL/kg NS or RL over 20 min by gravity", "In hypotensive shock: pull-push technique, 5–10 mL/kg aliquots", "Mark target volume on bottle to avoid excess"],
            },
            {
              letter: "D", label: "Disability", color: "violet",
              assess: ["AVPU and pupillary response", "Posturing / abnormal eye movements (may be NCSE not seizure)", "Agitation / combativeness in fever/diarrhoea → cerebral hypoperfusion"],
              act: ["Check glucose (CBG) in ALL seriously ill children", "Hypoglycaemia (CBG <60 mg/dL): 2 mL/kg of 25% dextrose IV", "Correct temperature — tepid sponge, rectal paracetamol", "Do not give anti-seizure medication without ruling out shock"],
            },
            {
              letter: "E", label: "Exposure / Environment", color: "amber",
              assess: ["Remove clothing — look for rash, petechiae, burns, bite marks, trauma"],
              act: ["Estimate weight using Broselow tape if scales unavailable", "Document all findings within 30 seconds with time stamp"],
            },
          ].map(sec => {
            const c = CMAP[sec.color];
            return (
              <div key={sec.letter} className={`rounded-xl border ${c.border} overflow-hidden`}>
                <div className={`flex items-center gap-3 px-4 py-2.5 ${c.bg}`}>
                  <span className={`text-2xl font-black ${c.text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{sec.letter}</span>
                  <span className={`font-bold text-sm ${c.text}`}>{sec.label}</span>
                </div>
                <div className="px-4 py-3 grid sm:grid-cols-2 gap-4 bg-white dark:bg-slate-900/40">
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Assess</div>
                    <DoList items={sec.assess} color="sky" />
                  </div>
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Intervene</div>
                    <DoList items={sec.act} color="emerald" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Pearl text="If in doubt about shock: give oxygen AND one 10 mL/kg bolus, then reassess using PREM triangle. The mother's history of altered behaviour is always significant — treat it seriously." />
    </div>
  );
}

// ─── SECTION: BLS & CPR ───────────────────────────────────────────────────────
function BLSSection({ weight }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400">Check Responsiveness</div>
          <DoList items={[
            "Child: tap shoulder, shout 'Are you OK?'",
            "Infant: flick sole of foot",
            "If responsive: open airway, call 108, rapid head-to-toe exam",
            "If not responsive: shout for help immediately, start ABCDE",
          ]} color="sky" />
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400">Rescue Breathing</div>
          <DoList items={[
            "Head tilt–chin lift (neutral in infant, sniffing in child ≥1 yr)",
            "Child: pinch nose, seal over mouth",
            "Infant: seal over mouth AND nose",
            "Give 2 rescue breaths — chest must visibly rise",
            "Rate ≥20 breaths/min during ventilation",
            "If chest does not rise: re-tilt head, retry once, then start CPR",
          ]} color="sky" />
        </div>
      </div>

      <div className="rounded-xl border-2 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Heartbeat size={16} weight="fill" className="text-red-600 dark:text-red-400" />
          <span className="font-black text-sm text-red-700 dark:text-red-300" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            High-Quality CPR — {weight} kg Patient
          </span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-3">
          {[
            { label: "Ratio", val: "15 : 2",   sub: "compressions : breaths" },
            { label: "Rate",  val: "≥100/min", sub: "push fast, count aloud" },
            { label: "Depth", val: "⅓ chest AP", sub: "~4 cm infant, 5 cm child" },
          ].map(p => (
            <div key={p.label} className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-red-200 dark:border-red-800 text-center">
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">{p.label}</div>
              <div className="text-xl font-black text-red-700 dark:text-red-300" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{p.val}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{p.sub}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 p-3">
          <div className="text-[9px] font-mono uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">Adrenaline — Cardiac Arrest · {weight} kg</div>
          <div className="grid sm:grid-cols-3 gap-2 text-xs">
            <div><span className="text-slate-500 dark:text-slate-400">Dose: </span><span className="font-bold text-red-700 dark:text-red-300">0.01 mg/kg = 0.1 mL/kg of 1:10 000</span></div>
            <div><span className="text-slate-500 dark:text-slate-400">Volume ({weight} kg): </span><span className="font-bold text-red-700 dark:text-red-300">{(weight * 0.1).toFixed(1)} mL IV/IO</span></div>
            <div><span className="text-slate-500 dark:text-slate-400">Repeat: </span><span className="font-bold text-red-700 dark:text-red-300">every 3–5 minutes</span></div>
          </div>
          <div className="text-[10px] text-red-700 dark:text-red-300 mt-1.5">
            If only 1:1000 available: draw 1 mL + 9 mL NS = 1:10 000 solution. Give {(weight * 0.1).toFixed(1)} mL of this dilution.
          </div>
        </div>
      </div>

      <Pearl text="In cardiac arrest in children, the most common cause is respiratory failure. Excellent BVM ventilation before and during CPR is the single most important prehospital intervention." />
    </div>
  );
}

// ─── SECTION: CHOKING ─────────────────────────────────────────────────────────
function ChokingSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200">
        <strong>Choking recognition:</strong> child cannot cough, speak, or breathe. May have cyanosis, silent effort.
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="font-bold text-sm text-slate-900 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Conscious Child (&gt;1 year)</div>
          <DoList items={["Stand or kneel behind the child", "Make a fist with thumb side above umbilicus", "Cover with other hand", "Give 5 rapid upward abdominal thrusts (Heimlich)", "Repeat until object expelled or child loses consciousness"]} />
        </div>
        <div className="space-y-3">
          <div className="font-bold text-sm text-slate-900 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Conscious Infant (&lt;1 year)</div>
          <DoList items={["Sit at edge of chair, knee below hip", "Support infant face-down on your forearm, head lower than trunk", "5 firm back blows between shoulder blades (heel of hand)", "Turn face-up on other arm", "5 chest thrusts — 2 fingers on lower sternum (below nipple line)", "Check mouth after each cycle — remove object only if visible", "Repeat until object expelled or infant unresponsive"]} />
          <DontList items={["Blind finger sweeps — push object deeper", "Abdominal thrusts in infants — risk of organ injury"]} />
        </div>
      </div>
      <Pearl text="Heimlich manoeuvre works by lifting the diaphragm, expelling air from the lungs — creating an artificial cough. Back blows are equally effective in infants. NEVER perform blind finger sweep." />
    </div>
  );
}

// ─── SECTION: SEIZURES ────────────────────────────────────────────────────────
function SeizureSection({ weight }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-800 dark:text-red-200">
        <strong>Status epilepticus:</strong> Seizure &gt;5 min OR 2 consecutive seizures without full recovery. GTCSs are dangerous because intercostal muscles convulse, preventing breathing.
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-amber-600 dark:text-amber-400 mb-2">Prehospital First Aid</div>
          <DoList items={["Place child on their side (recovery position)", "Open airway: head tilt–chin lift", "Suction airway — avoid posterior pharynx (vagal bradycardia risk)", "Oxygen: non-rebreathing mask 10–15 L/min", "If apnoeic: BVM ventilation", "Midazolam 0.2 mg/kg IM / buccal / intranasal", "Tepid sponge + rectal paracetamol for fever", "Check blood glucose — correct if <60 mg/dL"]} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-red-600 dark:text-red-400 mb-2">Critical Pitfalls</div>
          <DontList items={["Do NOT give anti-epileptics if posturing is due to hypoxia or shock — can be lethal", "Do NOT forcibly restrain convulsing limbs", "Do NOT put objects in mouth", "Do NOT leave child unattended", "Agitation / combativeness in febrile child = cerebral hypoperfusion"]} />
          <div className="mt-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">Midazolam dose ({weight} kg)</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { route: "IM / Buccal", val: `${(weight * 0.2).toFixed(1)} mg` },
                { route: "Intranasal",  val: `${(weight * 0.2).toFixed(1)} mg` },
                { route: "IV / IO",     val: `${(weight * 0.1).toFixed(1)} mg` },
              ].map(d => (
                <div key={d.route} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-[8px] font-mono uppercase tracking-widest text-slate-400">{d.route}</div>
                  <div className="text-sm font-bold text-violet-700 dark:text-violet-300">{d.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Pearl text="PREM key question: Ask mom — 'Did fever, diarrhoea, or breathlessness come BEFORE the abnormal movements?' If yes, suspect posturing from hypoxia/shock, not primary seizure. Confirm this before giving anti-epileptics." />
    </div>
  );
}

// ─── SECTION: BURNS ───────────────────────────────────────────────────────────
function BurnsSection({ weight }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-orange-600 dark:text-orange-400 mb-2">Immediate Prehospital Actions</div>
          <DoList items={["Remove from burning environment — ensure scene safety first", "Do NOT remove burned clothing — causes further skin injury", "Cool burn area within 30 min with cool running water for 20 minutes", "Cover with cool moist sterile bandage or clean moist cloth", "Elevate burned limbs above heart level if possible", "Oxygen if inhalation injury suspected", "If not breathing: BVM ventilation + early intubation planning"]} />
          <DontList items={["Ice directly on burn — causes hypothermia and shock", "Immerse large burns in ice water", "Burst blisters at scene", "Apply toothpaste, oil, or traditional remedies"]} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-red-600 dark:text-red-400 mb-2">Inhalation Injury — Intubate Early If:</div>
          <DoList items={["Singed nasal hairs or eyebrows", "Carbonaceous deposits in oropharynx or on face", "Oropharyngeal oedema", "Hoarseness, persistent cough, stridor", "Burns to face, neck, or upper torso", "Aspiration of hot liquids"]} color="sky" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400">TBSA Estimation — Paediatric (Lund-Browder adapted)</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest">Area</th>
                {["<1 yr","1 yr","5 yr","10 yr","Adult"].map(a => (
                  <th key={a} className="p-2.5 text-center font-mono text-[9px] uppercase tracking-widest">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Head","19%","17%","13%","11%","7%"],
                ["Trunk (ant+post)","26%","26%","26%","26%","26%"],
                ["Each arm","4%","4%","4%","4%","4%"],
                ["Each thigh","3%","4%","4%","4%","4%"],
                ["Each lower leg","2%","3%","3%","3%","3%"],
                ["Each foot","3%","3%","3.5%","3.5%","3.5%"],
              ].map(([area,...vals],i) => (
                <tr key={area} className={`border-t border-slate-100 dark:border-slate-800 ${i%2===0?"bg-white dark:bg-slate-900/20":"bg-slate-50/50 dark:bg-slate-900/40"}`}>
                  <td className="p-2.5 font-semibold">{area}</td>
                  {vals.map((v,j) => <td key={j} className="p-2.5 text-center font-mono">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 text-[10px] text-slate-400 font-mono">Child's palm ≈ 1% TBSA. Exclude first-degree burns.</div>
      </div>
      <Pearl text="First aid cooling within 30 minutes with cool running water reduces depth and pain — still beneficial up to 3 hours post-burn. Do NOT use ice. (WHO STM 2017)" />
    </div>
  );
}

// ─── SECTION: TRAUMA ──────────────────────────────────────────────────────────
function TraumaSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-800 dark:text-red-200">
        <strong>Golden rule:</strong> Stabilise ABCs BEFORE rushing to evaluate obvious injuries. Do not transfer trauma victim for imaging without stabilisation.
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">Primary Survey</div>
          <div className="space-y-2">
            {[
              { title: "Airway + C-spine", body: "Manually immobilise cervical spine. Apply collar. Head tilt–chin lift. Suction. BVM if apnoeic." },
              { title: "Breathing", body: "Look for tension pneumothorax (absent breath sounds + shock). Seal open chest wounds with 3-sided occlusive dressing." },
              { title: "Circulation", body: "Direct pressure on all open wounds. Realign and splint injured limbs. Secure IV/IO for boluses." },
              { title: "Disability", body: "AVPU. Pupils. Glucose. Intact tone/sensation in all 4 limbs." },
              { title: "Exposure", body: "Remove clothes. Logroll with spinal precautions. Check for hidden injuries. Prevent hypothermia." },
            ].map((s, i) => <StepCard key={i} number={i + 1} title={s.title} body={s.body} urgent={i === 0} />)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">Spinal Immobilisation</div>
          <DoList items={["Manually immobilise C-spine immediately — before applying collar", "Apply cervical collar (paediatric size)", "Logroll with 4 people — maintain spinal alignment", "Inspect and palpate spine during logroll", "Apply spinal board with head immobiliser and full-body straps"]} />
          <DontList items={["Examine unstable pelvis more than once — disrupts clot", "Attempt to reduce open fractures at scene", "Transfer for imaging before stabilisation"]} />
          <Pearl text="Binding a suspected pelvic fracture circumferentially with a sheet reduces pelvic volume and controls haemorrhage until surgical stabilisation." />
        </div>
      </div>
    </div>
  );
}

// ─── SECTION: POISONING ───────────────────────────────────────────────────────
function PoisoningSection({ weight }) {
  const charcoalDose = weight < 6 ? 20 : weight < 10 ? 40 : weight < 15 ? 60 : weight < 20 ? 80 : weight < 30 ? 100 : 130;
  return (
    <div className="space-y-4">
      {/* Poison centre quick-access banner */}
      <div className="rounded-xl border-2 border-teal-400 dark:border-teal-600 bg-teal-50 dark:bg-teal-950/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Phone size={14} weight="fill" className="text-teal-600 dark:text-teal-400" />
          <span className="font-bold text-sm text-teal-700 dark:text-teal-300" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            Call a Poison Information Centre First
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { name: "AIIMS Delhi", number: "011-26850691" },
            { name: "Amrita Kochi", number: "+91-484-2858056" },
            { name: "CMC Vellore", number: "1800-425-1213" },
            { name: "Egmore Chennai", number: "044-281-92922" },
          ].map((c, i) => (
            <a key={i} href={`tel:${c.number.replace(/[^0-9+]/g, "")}`}
              className="flex flex-col items-center bg-white dark:bg-slate-900 rounded-lg p-2 border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors">
              <span className="text-[9px] font-mono text-teal-600 dark:text-teal-400 text-center">{c.name}</span>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300 font-mono mt-0.5 text-center">{c.number}</span>
            </a>
          ))}
        </div>
        <div className="text-[10px] text-teal-600 dark:text-teal-400 font-mono mt-2 text-center">
          See "Poison Centres" tab for full list with all contact numbers
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200">
        <strong>History first:</strong> What was taken? How much? What time? Child's weight? Other children involved? Bring bottle/container.
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 mb-2">Immediate Actions</div>
          <DoList items={["Airway, Breathing, Circulation — ABCDE first", "Remove from exposure (gas, corrosive environment)", "Oxygen for suspected CO poisoning or hypoxia", "20 mL/kg NS if hypotension/shock", "Activated charcoal if within 2 hours and able to swallow", "Corrosive ingestion: glass of milk to dilute (do not induce vomiting)", "Refer urgently if drowsy, unconscious, or oral/throat burns"]} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-red-600 dark:text-red-400 mb-2">NEVER Do</div>
          <DontList items={["Induce vomiting — risk of aspiration, laryngospasm", "Induce vomiting for corrosives (kerosene, petrol, bleach, acid)", "Give anything by mouth if drowsy or unconscious", "Electric shock or cryotherapy to snake/scorpion bite site", "Give one vial of ASV in IV fluids before referral — inadequate dose"]} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400">Key Antidotes — {weight} kg</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-slate-500">Poison</th>
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-slate-500">Antidote / Treatment</th>
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-blue-500">Dose ({weight} kg)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { poison: "Opioid (morphine, codeine)", rx: "Naloxone IV", dose: `${(weight * 0.01 * 100).toFixed(0)} mcg (0.01 mg/kg, max 400 mcg)` },
                { poison: "Benzodiazepine", rx: "Flumazenil IV (caution)", dose: `${(weight * 0.01).toFixed(2)} mg (0.01 mg/kg)` },
                { poison: "CO poisoning", rx: "100% O₂ via NRM", dose: "10–15 L/min until asymptomatic" },
                { poison: "Organophosphate", rx: "Atropine IV until secretions dry", dose: "0.02 mg/kg IV, repeat q5–10 min" },
                { poison: "Chloroquine overdose", rx: "Diazepam IV (resp. monitor)", dose: `${(weight * 0.2).toFixed(1)} mg (0.2 mg/kg, max 15 mg)` },
                { poison: "Any poison (≤2 hr)", rx: "Activated charcoal (if conscious)", dose: `${charcoalDose} mL of 5g/100mL solution` },
              ].map((r, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 odd:bg-white dark:odd:bg-slate-900/30">
                  <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{r.poison}</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-300">{r.rx}</td>
                  <td className="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{r.dose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pearl text="Activated charcoal works best within the first 2 hours. Never give to an unconscious child or one with bowel obstruction. Avoid inducing vomiting in ALL cases. (WHO STM 2017)" />
    </div>
  );
}

// ─── SECTION: ENVENOMATION ────────────────────────────────────────────────────
function EnvenomationSection({ weight }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="font-bold text-sm text-slate-900 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Snake Bite — "Do It RIGHT"</div>
          {[
            { letter: "R", label: "Reassure", body: "70% of bites are non-poisonous. Only 50% of venomous bites cause envenomation." },
            { letter: "I", label: "Immobilise", body: "Splint affected limb like a fracture. Avoid tight ligatures." },
            { letter: "G", label: "Get to hospital", body: "Immediately. Traditional remedies have no proven benefit." },
            { letter: "H", label: "Tell the doctor", body: "Report any systemic symptoms (ptosis, weakness) on the way." },
          ].map(s => (
            <div key={s.letter} className="flex gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{s.letter}</span>
              <div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white">{s.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{s.body}</div>
              </div>
            </div>
          ))}
          <DontList items={["Wash the wound — spreads venom", "Apply tourniquet — ischaemia/necrosis risk", "Incise the wound", "Suction the wound", "Electric shock or cryotherapy", "Add one vial ASV to IV fluids — causes sensitisation"]} />
        </div>
        <div className="space-y-3">
          <div className="font-bold text-sm text-slate-900 dark:text-white" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Scorpion Envenomation</div>
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200">
            Symptoms peak at 3–5 hours. Autonomic storm → cardiogenic shock → pulmonary oedema.
          </div>
          <DoList items={["Apply ice cubes to bite site — local vasoconstriction", "Paracetamol for pain", "Anti-emetics if severe vomiting", "Seek emergency care — monitor for autonomic storm"]} />
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3">
            <div className="text-[9px] font-mono uppercase tracking-widest text-red-600 dark:text-red-400 mb-2">Prazosin — Autonomic Storm Only</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-2 border border-red-200 dark:border-red-700 text-center">
                <div className="text-[8px] font-mono text-slate-400">Dose</div>
                <div className="text-sm font-bold text-red-700 dark:text-red-300">30 mcg/kg</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-2 border border-red-200 dark:border-red-700 text-center">
                <div className="text-[8px] font-mono text-slate-400">{weight} kg</div>
                <div className="text-sm font-bold text-red-700 dark:text-red-300">{(weight * 0.03).toFixed(2)} mg</div>
              </div>
            </div>
            <div className="text-[10px] text-red-700 dark:text-red-300 mt-1.5">Repeat every 3–4 hours until extremities warm and dry. Avoid if hypotensive.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION: ANAPHYLAXIS ────────────────────────────────────────────────────
function AnaphylaxisSection({ weight }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/40 p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldWarning size={15} weight="fill" className="text-red-600 dark:text-red-400" />
          <span className="font-black text-sm text-red-700 dark:text-red-300" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            Adrenaline — First Drug, Every Time · {weight} kg
          </span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          {[
            { group: ">12 yr",        dose: "500 mcg (0.5 mL) IM of 1:1000" },
            { group: "6–12 yr",       dose: "300 mcg (0.3 mL) IM of 1:1000" },
            { group: "<6 yr / small", dose: "150 mcg (0.15 mL) IM of 1:1000" },
          ].map(d => (
            <div key={d.group} className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-red-200 dark:border-red-800 text-center">
              <div className="text-[9px] font-mono text-slate-400">{d.group}</div>
              <div className="text-xs font-bold text-red-700 dark:text-red-300">{d.dose}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-red-700 dark:text-red-300">
          Weight-based: <strong>0.1 mg/kg of 1:1000 deep IM</strong> = <strong>{(weight * 0.1).toFixed(2)} mg = {(weight * 0.1).toFixed(2)} mL</strong> · Repeat every 5 min PRN.
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-amber-600 dark:text-amber-400 mb-2">Prehospital Steps</div>
          <DoList items={["Remove allergen if possible", "Stridor/distress: upright sitting position", "Faint or unable to stand: lie flat", "Unresponsive and breathing: recovery position", "Hypotensive: adrenaline IM + fluid bolus"]} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-2">Adjunct Drugs (after adrenaline)</div>
          <div className="space-y-2 text-xs">
            {[
              { drug: "Chlorpheniramine (H1)", doses: [">12 yr: 10 mg IM/IV","6–12 yr: 5 mg","6 mo–6 yr: 2.5 mg","<6 mo: 250 mcg/kg"] },
              { drug: "Hydrocortisone", doses: [">12 yr: 200 mg IM/IV","6–12 yr: 100 mg","<6 mo: 25 mg"] },
              { drug: "Fluid bolus (shock)", doses: ["20 mL/kg NS IV/IO","Repeat up to 60–200 mL/kg total"] },
            ].map(d => (
              <div key={d.drug} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <div className="font-semibold text-slate-900 dark:text-white mb-1">{d.drug}</div>
                {d.doses.map((dose, i) => <div key={i} className="text-slate-500 dark:text-slate-400 text-[11px]">• {dose}</div>)}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Pearl text="Adrenaline is the only life-saving drug in anaphylaxis — give early, IM, deep. Antihistamines and steroids are adjuncts only. Hypotensive patients who sit or stand can rapidly progress to cardiac arrest." />
    </div>
  );
}

// ─── SECTION: TRANSPORT ───────────────────────────────────────────────────────
function TransportSection() {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 mb-2">Before Transport — Stabilise First</div>
          <DoList items={["Airway secured (BVM running / LMA / ETT if skilled)", "Oxygen flowing — monitor SpO₂", "IV or IO access established, bolus given if shocked", "Active haemorrhage controlled", "Fractures splinted", "Glucose checked and corrected", "NGT decompressed if BVM ventilating", "Anticonvulsant given if seizing", "Temperature control (prevent hypothermia)"]} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-amber-600 dark:text-amber-400 mb-2">During Transport</div>
          <DoList items={["Continuous monitoring: SpO₂, HR, RR, colour, AVPU", "Document time of all interventions", "Reassess ABCDE after each intervention and every 15 min", "Call ahead to receiving facility — ATMIST handover", "Recovery position for unresponsive breathing patient", "Spinal precautions maintained for trauma"]} color="sky" />
          <div className="mt-3 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 p-3">
            <div className="text-[9px] font-mono uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">ATMIST Handover</div>
            <div className="space-y-1 text-xs text-violet-800 dark:text-violet-200">
              {["A — Age and weight","T — Time of onset / incident","M — Mechanism / Medical history","I — Injuries / Illness found","S — Signs and vitals (HR, RR, SpO₂, GCS, BP)","T — Treatment given + response"].map((item,i)=>(
                <div key={i}>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400">Inotrope Preparation — PREM Ready Reckoner</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-slate-500">Drug</th>
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-slate-500">Add ___ mg to 50 mL NS</th>
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-slate-500">1 mL/hr delivers</th>
                <th className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-slate-500">Usual dose</th>
              </tr>
            </thead>
            <tbody>
              {[
                { drug: "Dopamine",      formula: "3 × body weight (mg)",   rate: "1 mcg/kg/min",   dose: "5–10 mcg/kg/min" },
                { drug: "Dobutamine",    formula: "3 × body weight (mg)",   rate: "1 mcg/kg/min",   dose: "5–10 mcg/kg/min" },
                { drug: "Adrenaline",    formula: "0.3 × body weight (mg)", rate: "0.1 mcg/kg/min", dose: "0.1–1 mcg/kg/min" },
                { drug: "Noradrenaline", formula: "0.3 × body weight (mg)", rate: "0.1 mcg/kg/min", dose: "0.1–1 mcg/kg/min" },
              ].map((r,i)=>(
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 odd:bg-white dark:odd:bg-slate-900/30">
                  <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{r.drug}</td>
                  <td className="p-2.5 font-mono text-amber-700 dark:text-amber-300">{r.formula}</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-300">{r.rate}</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-300">{r.dose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pearl text="PREM principle: Failure to stabilise before inter-facility transfer and delays in transportation increase fatality risk." />
    </div>
  );
}

// ─── SECTION: EQUIPMENT ───────────────────────────────────────────────────────
function EquipmentSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400">Airway Equipment by Age — PREM Ready Reckoner</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                {["Age (Weight)","Laryngoscope","ETT size","ETT depth (lip)","Suction","NG tube","Foley's","Chest tube"].map(h=>(
                  <th key={h} className="p-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Newborn (3.5 kg)","1","3–3.5","8–9.5","6","8","5","8–10"],
                ["6 mo (7 kg)","1","3.5–4","9.5–11","8","8","5","12–16"],
                ["1 yr (10 kg)","2","4–4.5","11–12.5","8","10","8","14–20"],
                ["3 yr (15 kg)","2","4.5–5","12.5–14","8","10","10","18–22"],
                ["6 yr (20 kg)","2","5–5.5","14–15.5","10","12","10","20–28"],
                ["8 yr (25 kg)","2","6–6.5 (cuff)","17–18.5","10","12","10","28–32"],
                ["10 yr (30 kg)","3","6.5–7 (cuff)","18.5–20","12","14","12","28–32"],
                ["12 yr (40 kg)","3","7 (cuff)","20","12","14","12","28–32"],
              ].map((row,i)=>(
                <tr key={i} className={`border-t border-slate-100 dark:border-slate-800 ${i%2===0?"bg-white dark:bg-slate-900/20":"bg-slate-50/50 dark:bg-slate-900/40"}`}>
                  {row.map((cell,j)=>(
                    <td key={j} className={`p-2.5 font-mono ${j===0?"font-semibold text-slate-900 dark:text-white":"text-slate-600 dark:text-slate-300"}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-sky-600 dark:text-sky-400 mb-2">BVM Ventilation — PREM Key Points</div>
          <DoList items={["Use the LARGEST available bag (1–1.5 L) for any child beyond newborn period", "Reservoir bag mandatory for 100% oxygen delivery", "EC clamp: C = thumb + index encircle mask; E = middle/ring/little finger lift jaw", "Sit at head end — never stand over the child (causes neck flexion)", "Pop-off valve: occlude in children >1 month"]} />
        </div>
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 mb-2">LMA — Prehospital Airway Bridge</div>
          <DoList items={["Deflate cuff fully before insertion; lubricate posterior surface", "Pencil grip at mask-tube junction; sniffing position", "Advance firmly along hard palate in midline until resistance felt", "Inflate pilot balloon until firm; confirm chest rise", "Bridge between intubation and BVM — not definitive airway"]} />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PrehospitalTab() {
  const { weight } = useWeight();
  const [sec, setSec] = useState("triage");

  const SECTIONS = [
    { id: "triage",       label: "Triage & ABCDE", icon: Siren,         color: "sky"     },
    { id: "bls",          label: "BLS & CPR",      icon: Heartbeat,     color: "red"     },
    { id: "choking",      label: "Choking",         icon: HandFist,      color: "amber"   },
    { id: "seizure",      label: "Seizures",        icon: Brain,         color: "violet"  },
    { id: "burns",        label: "Burns",           icon: Fire,          color: "orange"  },
    { id: "trauma",       label: "Trauma",          icon: FirstAid,      color: "red"     },
    { id: "poisoning",    label: "Poisoning",       icon: Skull,         color: "amber"   },
    { id: "envenomation", label: "Envenomation",    icon: Bug,           color: "emerald" },
    { id: "anaphylaxis",  label: "Anaphylaxis",     icon: ShieldWarning, color: "red"     },
    { id: "transport",    label: "Transport",       icon: Ambulance,     color: "sky"     },
    { id: "equipment",    label: "Equipment",       icon: Wind,          color: "slate"   },
    // ── NEW ──
    { id: "poison-centres", label: "Poison Centres", icon: Phone,        color: "teal"    },
  ];

  const active = SECTIONS.find(s => s.id === sec);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Prehospital Emergency Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Weight-based calculations for{" "}
          <span className="font-bold text-slate-900 dark:text-white">{weight} kg</span> ·
          PREM (NHM Tamil Nadu / ICH MMC) · WHO STM 4th Ed 2017 · PALS 2020 · IAPPEM 2026
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
        <Warning size={13} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>
          Prehospital reference only. Local protocols, available resources, and clinical context must guide all decisions.
          Do not delay transport for interventions beyond your skill level — stabilise and transfer.
        </span>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex flex-wrap gap-1.5">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          const c = CMAP[s.color];
          return (
            <button key={s.id} onClick={() => setSec(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-mono text-[11px] uppercase tracking-widest transition-all ${
                sec === s.id
                  ? `${c.badge} border-transparent shadow-sm`
                  : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              } ${s.id === "poison-centres" ? "ring-1 ring-teal-400 dark:ring-teal-600" : ""}`}>
              <Icon size={12} weight={sec === s.id ? "fill" : "regular"} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Active section header */}
      {active && (
        <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${CMAP[active.color].border} ${CMAP[active.color].bg}`}>
          <active.icon size={16} weight="fill" className={CMAP[active.color].text} />
          <span className={`font-bold text-sm ${CMAP[active.color].text}`} style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            {active.label}
          </span>
          <span className={`text-[10px] font-mono ml-auto ${CMAP[active.color].text} opacity-60`}>
            Prehospital · {weight} kg
          </span>
        </div>
      )}

      {/* Content routing */}
      {sec === "triage"         && <TriageSection />}
      {sec === "bls"            && <BLSSection weight={weight} />}
      {sec === "choking"        && <ChokingSection />}
      {sec === "seizure"        && <SeizureSection weight={weight} />}
      {sec === "burns"          && <BurnsSection weight={weight} />}
      {sec === "trauma"         && <TraumaSection />}
      {sec === "poisoning"      && <PoisoningSection weight={weight} />}
      {sec === "envenomation"   && <EnvenomationSection weight={weight} />}
      {sec === "anaphylaxis"    && <AnaphylaxisSection weight={weight} />}
      {sec === "transport"      && <TransportSection />}
      {sec === "equipment"      && <EquipmentSection />}
      {sec === "poison-centres" && <PoisonCentresSection />}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        PREM Trauma Training Module (NHM TN / ICH MMC) · WHO STM 4th Ed 2017 · PALS 2020 · IAPPEM 2026
      </div>
    </div>
  );
}
