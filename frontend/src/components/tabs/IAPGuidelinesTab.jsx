import { useState } from "react";
import { BookOpen, ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";

const IAP_GUIDELINES = [
  {
    category: "Emergency & Critical Care",
    color: "red",
    guidelines: [
      {
        title: "IAP PALS / Septic Shock Guidelines 2020",
        summary: "Norepinephrine first-line vasopressor. Early antibiotics within 1 hour. 20 mL/kg isotonic crystalloid bolus. Lactate-guided resuscitation.",
        year: "2020",
        keyPoints: ["Norepi first-line over dopamine", "Antibiotics within 1hr of recognition", "20 mL/kg NS bolus × 3 if needed", "Target MAP ≥ 65 mmHg"],
      },
      {
        title: "IAP Anaphylaxis Guidelines 2023",
        summary: "IM epinephrine 0.01 mg/kg anterolateral thigh is first and only life-saving intervention. Antihistamines and steroids are adjuncts only.",
        year: "2023",
        keyPoints: ["Epi IM 0.01 mg/kg (max 0.5mg) immediately", "Repeat every 5–15 min PRN", "Observe minimum 4–6 hours post reaction", "Antihistamines NOT first-line"],
      },
      {
        title: "IAP DKA Management Guidelines 2020",
        summary: "Fluid deficit replaced over 48 hours. Avoid rapid rehydration — cerebral edema risk. Insulin infusion after 1 hour of fluids.",
        year: "2020",
        keyPoints: ["0.9% NS for initial resuscitation", "Deficit over 48hr not 24hr", "Insulin 0.05–0.1 units/kg/hr after 1hr fluids", "Cerebral edema: mannitol 0.5–1 g/kg OR 3% NaCl 3–5 mL/kg"],
      },
    ],
  },
  {
    category: "Infectious Disease",
    color: "emerald",
    guidelines: [
      {
        title: "IAP Antimicrobial Stewardship Guidelines 2023",
        summary: "ESBL-aware empirical antibiotic selection for Indian EDs. High rates of CRKP and MRSA. Meropenem-sparing strategies strongly recommended.",
        year: "2023",
        keyPoints: ["ESBL UTI: nitrofurantoin or fosfomycin oral", "Community sepsis: pip-tazo + amikacin", "Hospital sepsis: meropenem + vancomycin (AUC-guided)", "De-escalate within 48–72h based on culture"],
      },
      {
        title: "IAP Dengue Management Guidelines 2021",
        summary: "Supportive care only. No NSAIDs, no aspirin, no empirical antibiotics. Fluid management guided by hematocrit and clinical signs.",
        year: "2021",
        keyPoints: ["Paracetamol only for fever", "Platelets transfuse only <10,000 or active bleeding", "Watch for plasma leakage in critical phase (day 3–7)", "No corticosteroids"],
      },
      {
        title: "IAP Malaria Guidelines 2022",
        summary: "Artemether-lumefantrine for uncomplicated falciparum. IV artesunate for severe disease. Primaquine for P. vivax radical cure (check G6PD).",
        year: "2022",
        keyPoints: ["AL: weight-based BD × 3 days with food", "Severe: IV artesunate 2.4 mg/kg at 0, 12, 24hr", "Vivax: primaquine 0.25 mg/kg × 14d after G6PD test", "Quinine if artesunate unavailable"],
      },
      {
        title: "IAP Community Pneumonia Guidelines 2022",
        summary: "High-dose amoxicillin for mild-moderate CAP in Indian children. Azithromycin if atypical (Mycoplasma) suspected. Hospital admission criteria clearly defined.",
        year: "2022",
        keyPoints: ["Mild-mod: amoxicillin 80–90 mg/kg/day PO", "Severe: IV ampicillin-sulbactam or ceftriaxone", "Add azithromycin if age >5 yr (atypical cover)", "O₂ if SpO₂ <92%"],
      },
      {
        title: "IAP Meningitis Guidelines 2019",
        summary: "Ceftriaxone 100 mg/kg/day IV. Dexamethasone 0.15 mg/kg q6h × 4 days — give 15–30 min before or with first antibiotic dose.",
        year: "2019",
        keyPoints: ["Ceftriaxone preferred over cefotaxime (once daily)", "Dexamethasone reduces hearing loss in H. influenzae meningitis", "Neonates: add ampicillin (Listeria) + cefotaxime not ceftriaxone", "LP before antibiotics if no signs of raised ICP"],
      },
    ],
  },
  {
    category: "Respiratory",
    color: "sky",
    guidelines: [
      {
        title: "IAP Asthma Management Guidelines 2022",
        summary: "Dexamethasone 0.6 mg/kg × 2 doses (24hr apart) equivalent to prednisolone 5-day course. MDI + spacer preferred over nebulizer for all severities.",
        year: "2022",
        keyPoints: ["Salbutamol MDI 4–8 puffs q20min × 3 (mild-mod)", "Dexamethasone 0.6 mg/kg PO/IM × 2 doses", "Magnesium sulfate 25–50 mg/kg IV for severe", "Heliox if available for near-fatal asthma"],
      },
      {
        title: "IAP Bronchiolitis Guidelines 2020",
        summary: "Supportive care only in uncomplicated viral bronchiolitis. No salbutamol, no steroids, no antibiotics, no nebulized saline routinely.",
        year: "2020",
        keyPoints: ["Oxygen if SpO₂ <92%", "High-flow nasal cannula if work of breathing high", "No salbutamol (no proven benefit)", "No corticosteroids", "No routine chest physiotherapy"],
      },
      {
        title: "IAP Croup (LTB) Guidelines 2019",
        summary: "Single dose dexamethasone 0.6 mg/kg PO effective for all grades. Nebulized epinephrine for stridor at rest. Observe ≥2 hours after epinephrine.",
        year: "2019",
        keyPoints: ["Dexamethasone 0.6 mg/kg PO single dose (max 10 mg)", "Neb epinephrine: 0.5 mL/kg of 1:1000 (max 5 mL)", "Observe 2–4 hr post-neb epinephrine for rebound", "Westley score guides severity"],
      },
    ],
  },
  {
    category: "Neurology",
    color: "violet",
    guidelines: [
      {
        title: "IAP Status Epilepticus Guidelines 2021",
        summary: "Midazolam IN/buccal/IM first-line (equal to IV lorazepam). Levetiracetam preferred second-line over phenytoin/valproate for safety profile.",
        year: "2021",
        keyPoints: ["0–5 min: midazolam IN 0.2 mg/kg or buccal 0.3 mg/kg", "5–20 min: lorazepam IV 0.1 mg/kg if access", "20–40 min: levetiracetam 40–60 mg/kg IV preferred", "40+ min: midazolam infusion or phenobarbital"],
      },
      {
        title: "IAP Febrile Seizure Guidelines 2017",
        summary: "No anticonvulsant prophylaxis recommended. Reassurance and parental education are cornerstones. Simple febrile seizures do not require neuroimaging.",
        year: "2017",
        keyPoints: ["No long-term antiepileptic drugs for simple FS", "No EEG or neuroimaging for typical simple FS", "Fever control with paracetamol/ibuprofen", "Risk of recurrence: 30% overall"],
      },
    ],
  },
  {
    category: "Neonatal",
    color: "rose",
    guidelines: [
      {
        title: "IAP NRP / Neonatal Resuscitation 2021",
        summary: "Delayed cord clamping ≥60 seconds for non-asphyxiated newborns. Thermoregulation critical. T-piece resuscitator preferred. Targeted SpO₂ in first minutes.",
        year: "2021",
        keyPoints: ["Delayed cord clamping ≥60s (unless depressed)", "Initial FiO₂: term 0.21, preterm 0.21–0.30", "HR <60 after PPV: start chest compressions", "Epinephrine 0.01–0.03 mg/kg IV/IO if no response"],
      },
      {
        title: "IAP Neonatal Sepsis Guidelines 2022",
        summary: "Ampicillin + gentamicin first-line for early-onset sepsis (EOS). Culture before antibiotics. Differentiate EOS (<72hr) vs LONS (>72hr) for antibiotic choice.",
        year: "2022",
        keyPoints: ["EOS: ampicillin + gentamicin (once-daily dosing)", "LONS: pip-tazo or cloxacillin + amikacin", "Blood culture before first dose", "Minimum 7–10 day course for confirmed sepsis"],
      },
      {
        title: "IAP Neonatal Hypoglycemia Guidelines 2020",
        summary: "Target glucose >2.6 mmol/L (47 mg/dL). D10% 2 mL/kg IV bolus for symptomatic hypoglycemia. Maintain GIR 6–8 mg/kg/min.",
        year: "2020",
        keyPoints: ["Symptomatic: D10% 2 mL/kg IV bolus", "Asymptomatic: early breastfeeding + monitor", "GIR 6–8 mg/kg/min maintenance infusion", "Recheck glucose 30 min after intervention"],
      },
    ],
  },
  {
    category: "Fluid & Electrolytes",
    color: "amber",
    guidelines: [
      {
        title: "IAP Fluid Therapy in Children 2020",
        summary: "20 mL/kg isotonic crystalloid bolus for septic shock. FEAST trial awareness — restrict bolus fluids in severe malnutrition and malaria.",
        year: "2020",
        keyPoints: ["Isotonic NS or RL for bolus", "Max 60 mL/kg in first hour then reassess", "Avoid bolus in SAM — use cautious ORS + WHO SAM protocol", "Hypertonic 3% NaCl for symptomatic hyponatremia"],
      },
      {
        title: "IAP Diarrhea & ORT Guidelines 2021",
        summary: "Oral rehydration therapy for all grades except severe dehydration with shock. Zinc supplementation 10–20 mg/day × 14 days reduces duration and recurrence.",
        year: "2021",
        keyPoints: ["Mild: ORS 50 mL/kg over 4 hr", "Moderate: ORS 100 mL/kg over 4 hr", "Severe + shock: IV NS 20 mL/kg then ORS", "Zinc: <6 mo 10 mg/day, >6 mo 20 mg/day × 14 days"],
      },
    ],
  },
  {
    category: "Growth & Development",
    color: "teal",
    guidelines: [
      {
        title: "IAP Growth Charts & Anthropometry 2015",
        summary: "IAP growth charts for Indian children recommended over WHO charts for children >5 years. Weight-for-age, height-for-age, BMI-for-age percentiles defined.",
        year: "2015",
        keyPoints: ["Use WHO charts for 0–5 years", "Use IAP charts for 5–18 years", "Underweight: weight-for-age <3rd percentile", "Obesity: BMI >95th percentile for age/sex"],
      },
    ],
  },
];

const COLOR_MAP = {
  red:     { bg: "bg-red-50 dark:bg-red-950/40",       border: "border-red-200 dark:border-red-800",       text: "text-red-700 dark:text-red-400",       dot: "bg-red-500",     header: "bg-red-50 dark:bg-red-950/60"     },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", header: "bg-emerald-50 dark:bg-emerald-950/60" },
  sky:     { bg: "bg-sky-50 dark:bg-sky-950/40",       border: "border-sky-200 dark:border-sky-800",       text: "text-sky-700 dark:text-sky-400",       dot: "bg-sky-500",     header: "bg-sky-50 dark:bg-sky-950/60"     },
  violet:  { bg: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-400", dot: "bg-violet-500",  header: "bg-violet-50 dark:bg-violet-950/60" },
  rose:    { bg: "bg-rose-50 dark:bg-rose-950/40",     border: "border-rose-200 dark:border-rose-800",     text: "text-rose-700 dark:text-rose-400",     dot: "bg-rose-500",    header: "bg-rose-50 dark:bg-rose-950/60"   },
  amber:   { bg: "bg-amber-50 dark:bg-amber-950/40",   border: "border-amber-200 dark:border-amber-800",   text: "text-amber-700 dark:text-amber-400",   dot: "bg-amber-500",   header: "bg-amber-50 dark:bg-amber-950/60" },
  teal:    { bg: "bg-teal-50 dark:bg-teal-950/40",     border: "border-teal-200 dark:border-teal-800",     text: "text-teal-700 dark:text-teal-400",     dot: "bg-teal-500",    header: "bg-teal-50 dark:bg-teal-950/60"   },
};

export default function IAPGuidelinesTab() {
  const [openCategory, setOpenCategory] = useState("Emergency & Critical Care");
  const [openGuideline, setOpenGuideline] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = IAP_GUIDELINES.map(cat => ({
    ...cat,
    guidelines: cat.guidelines.filter(g =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.summary.toLowerCase().includes(search.toLowerCase()) ||
      g.keyPoints.some(k => k.toLowerCase().includes(search.toLowerCase()))
    ),
  })).filter(cat => cat.guidelines.length > 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} weight="bold" className="text-slate-700 dark:text-slate-300" />
            <h2
              className="text-lg font-black text-slate-900 dark:text-white"
              style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
            >
              IAP Clinical Guidelines
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Indian Academy of Pediatrics · Evidence-based management for Indian ED context · 2019–2023
          </p>
        </div>
        <a
          href="https://iapindia.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline flex-shrink-0"
        >
          iapindia.org →
        </a>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <MagnifyingGlass
          size={14}
          weight="bold"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search guidelines, drugs, conditions..."
          className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-slate-400 dark:focus:border-slate-500"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
          >✕</button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        {filtered.map((cat) => {
          const c = COLOR_MAP[cat.color] || COLOR_MAP.emerald;
          const isOpen = openCategory === cat.category;

          return (
            <div key={cat.category} className={`border rounded-xl overflow-hidden ${c.border}`}>
              {/* Category header */}
              <button
                onClick={() => setOpenCategory(isOpen ? null : cat.category)}
                className={`w-full flex items-center justify-between px-4 py-3 ${c.header} transition-colors`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                  <span
                    className={`text-sm font-bold ${c.text}`}
                    style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
                  >
                    {cat.category}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${c.text} ${c.border} bg-white/50 dark:bg-black/20`}>
                    {cat.guidelines.length} guideline{cat.guidelines.length > 1 ? "s" : ""}
                  </span>
                </div>
                <ArrowRight
                  size={13}
                  weight="bold"
                  className={`${c.text} transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-90" : ""}`}
                />
              </button>

              {/* Guidelines */}
              {isOpen && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cat.guidelines.map((g) => {
                    const gKey = cat.category + g.title;
                    const gOpen = openGuideline === gKey;
                    return (
                      <div key={g.title} className="bg-white dark:bg-slate-900">
                        {/* Guideline row */}
                        <button
                          onClick={() => setOpenGuideline(gOpen ? null : gKey)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                                  {g.title}
                                </p>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                  {g.year}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                {g.summary}
                              </p>
                            </div>
                            <ArrowRight
                              size={12}
                              weight="bold"
                              className={`text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 ${gOpen ? "rotate-90" : ""}`}
                            />
                          </div>
                        </button>

                        {/* Key points — expanded */}
                        {gOpen && (
                          <div className={`px-4 pb-4 pt-1 ${c.bg}`}>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                              Key clinical points
                            </p>
                            <div className="space-y-1.5">
                              {g.keyPoints.map((kp, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className={`w-4 h-4 rounded-full ${c.dot} text-white text-[8px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5`}>
                                    {i + 1}
                                  </span>
                                  <span className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                                    {kp}
                                  </span>
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
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400 font-mono text-sm">
          No guidelines match "{search}"
        </div>
      )}

      <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] text-slate-400 font-mono text-center leading-relaxed">
        Source: Indian Academy of Pediatrics · iapindia.org<br />
        All guidelines subject to local institutional protocols · Last reviewed 2024<br />
        ⚠️ Clinical reference only — always verify before administration
      </div>
    </div>
  );
}
