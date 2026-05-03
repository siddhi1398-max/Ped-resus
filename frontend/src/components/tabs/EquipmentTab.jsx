// EquipmentTab.jsx — Interactive Airway Equipment & Monitoring
// Sub-tabs: Equipment Calculator · Difficult Airway · Monitoring Equipment · Reference Table
// Sources: Harriet Lane 23e · Fleischer & Ludwig 7e · APLS · AIDAA 2022
//          Vortex Approach (Chrimes 2016) · Morgan & Mikhail 7e · Motoyama
//          Bhavani-Shankar Kodali Capnography · AHA PALS 2020 · AAP Neonatology

import { useState, useMemo } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Warning, Lightbulb, ArrowRight, CheckCircle, Circle,
  Wind, Drop, Heartbeat, ClipboardText, Pulse, Stethoscope, Syringe, ArrowsOut,
} from "@phosphor-icons/react";

// ── All data, formulas, and SVG diagrams live in equipmentData.js ──────────────
import {
  calcEquipment,
  getFOBSize,
  getBPCuff,
  FOB_ROWS,
  BP_CUFF_ROWS,
  FORMULA_ROWS,
  DA_PREDICTORS,
  DA_MNEMONICS,
  RESCUE_DEVICES,
  CTM_NOTES,
  SPO2_PROBE_ROWS,
  SPO2_LIMITATIONS,
  SPO2_TARGETS,
  ETCO2_PATTERNS,
  BVM_SIZES,
  BVM_TECHNIQUES,
  BVM_FAILURES,
  BP_METHODS,
  FOB_STEPS,
  FOB_AWAKE_STEPS,
  FOB_LMA_STEPS,
  VortexSVG,
  CICOAlgorithmSVG,
  FOBSizingSVG,
  BVMDiagramSVG,
  SpO2ProbeSVG,
} from "../../data/equipment";


// ─── COLOUR HELPERS ────────────────────────────────────────────────────────────
const TONE = {
  red:     { text: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-950/30",       border: "border-red-200 dark:border-red-800"       },
  emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  amber:   { text: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-amber-200 dark:border-amber-800"   },
  blue:    { text: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200 dark:border-blue-800"     },
  violet:  { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800" },
  sky:     { text: "text-sky-600 dark:text-sky-400",       bg: "bg-sky-50 dark:bg-sky-950/30",       border: "border-sky-200 dark:border-sky-800"       },
  orange:  { text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" },
  slate:   { text: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-50 dark:bg-slate-900/50",   border: "border-slate-200 dark:border-slate-700"   },
};

// ─── SHARED WIDGETS ────────────────────────────────────────────────────────────
function EquipCard({ label, value, sub, tone = "slate", Icon, highlighted }) {
  const t = TONE[tone];
  return (
    <div className={`rounded-xl border p-3 bg-white dark:bg-slate-900 transition-all ${
      highlighted
        ? `${t.border} ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-950 ${t.border.replace("border-", "ring-")}`
        : "border-slate-200 dark:border-slate-700"
    }`}>
      {Icon && <Icon size={13} weight="fill" className={`${t.text} mb-1.5`} />}
      <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      <div
        className={`font-black text-lg leading-none mb-0.5 ${highlighted ? t.text : "text-slate-900 dark:text-white"}`}
        style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
      >{value}</div>
      {sub && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sub}</div>}
    </div>
  );
}

function NumInput({ label, value, onChange, unit, min = 0, max = 999, step = 1 }) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{label}</label>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(1))))}
          className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-100 text-base"
        >−</button>
        <input
          type="number" value={value} min={min} max={max} step={step}
          onChange={e => onChange(Math.max(min, Math.min(max, parseFloat(e.target.value) || min)))}
          className="w-20 text-center font-mono font-bold text-lg border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-400 py-1"
        />
        <button
          onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(1))))}
          className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-100 text-base"
        >+</button>
        <span className="text-xs text-slate-400 font-mono ml-1">{unit}</span>
      </div>
    </div>
  );
}

function InfoBox({ tone = "amber", icon: Icon, title, children }) {
  const t = TONE[tone];
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${t.bg} ${t.border} ${t.text}`}>
      {Icon && <Icon size={13} weight="fill" className="flex-shrink-0 mt-0.5" />}
      <div>
        <strong>{title}</strong>{title ? " — " : ""}{children}
      </div>
    </div>
  );
}

// ─── SUB-TAB 1: EQUIPMENT CALCULATOR ─────────────────────────────────────────
function LiveEquipmentCalculator() {
  const { weight: ctxWeight } = useWeight();
  const [weight,   setWeight]   = useState(ctxWeight || 10);
  const [ageYears, setAgeYears] = useState(2);
  const [useAge,   setUseAge]   = useState(true);
  const [cuffed,   setCuffed]   = useState(true);
  const [checkedItems, setCheckedItems] = useState({});

  const eq      = useMemo(() => calcEquipment(weight, useAge ? ageYears : null), [weight, ageYears, useAge]);
  const ettSize = cuffed ? eq.ettCuffed : eq.ettUncuffed;

  const maintenance =
    weight < 10  ? weight * 100
    : weight < 20 ? 1000 + (weight - 10) * 50
    : 1500 + (weight - 20) * 20;

  const checklistItems = [
    { id: "suction",  label: "Suction working + Yankauer attached" },
    { id: "bvm",      label: `BVM + correct mask (${eq.maskSize})` },
    { id: "o2",       label: "O₂ flow confirmed + reservoir bag" },
    { id: "ett",      label: `ETT ${ettSize} mm ${cuffed ? "(cuffed)" : "(uncuffed)"} ready + one size above/below` },
    { id: "syringe",  label: "10 mL syringe for cuff inflation" },
    { id: "stylet",   label: "Stylet shaped + lubricated inside ETT" },
    { id: "laryngo",  label: `Laryngoscope ${eq.blade} — light working` },
    { id: "capno",    label: "Colorimetric ETCO₂ or capnography attached" },
    { id: "tape",     label: `ETT tape/holder prepared for ${eq.ettDepthOral} cm at lip` },
    { id: "iv",       label: `IV/IO access confirmed (${eq.iv} or IO)` },
    { id: "drugs",    label: "RSI drugs drawn up and labelled (see Resuscitation tab)" },
    { id: "desat",    label: "Monitoring: SpO₂, ECG, ETCO₂ in place" },
    { id: "backup",   label: `Difficult airway backup: LMA ${eq.lma}, scalpel kit` },
  ];

  const toggleCheck  = (id) => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  const checkedCount = checklistItems.filter(item => checkedItems[item.id]).length;
  const allChecked   = checkedCount === checklistItems.length;

  return (
    <div className="space-y-5">

      {/* Inputs */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-4">Patient Parameters</div>
        <div className="flex flex-wrap gap-6 items-end">
          <NumInput label="Weight"  value={weight}   onChange={setWeight}   unit="kg" min={0.5} max={120} step={0.5} />
          <NumInput label="Age"     value={ageYears} onChange={setAgeYears} unit="yr" min={0}   max={18}  step={0.5} />
          <div className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Size by</div>
            <div className="flex gap-2">
              {[{ v: false, l: "Weight" }, { v: true, l: "Age" }].map(opt => (
                <button key={opt.l} onClick={() => setUseAge(opt.v)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                    useAge === opt.v
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                  }`}>{opt.l}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">ETT Type</div>
            <div className="flex gap-2">
              {[{ v: false, l: "Uncuffed" }, { v: true, l: "Cuffed" }].map(opt => (
                <button key={opt.l} onClick={() => setCuffed(opt.v)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                    cuffed === opt.v
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                  }`}>{opt.l}</button>
              ))}
            </div>
          </div>
        </div>
        {eq.preferCuffed && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle size={12} weight="fill" className="text-emerald-500" />
            Cuffed ETT preferred (≥2 yr or ≥8 kg) — reduces reintubation, allows PEEP, safer in transport
          </div>
        )}
      </div>

      {/* Hero ETT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
            ETT Size — {cuffed ? "Cuffed" : "Uncuffed"}
          </div>
          <div className="font-black text-5xl text-emerald-700 dark:text-emerald-300 leading-none mb-1"
               style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            {ettSize}<span className="text-lg font-normal ml-1">mm ID</span>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-2 space-y-0.5">
            <div>Also prepare: {+(ettSize - 0.5).toFixed(1)} mm and {+(ettSize + 0.5).toFixed(1)} mm</div>
            <div>{cuffed ? `Uncuffed equivalent: ${eq.ettUncuffed} mm` : `Cuffed equivalent: ${eq.ettCuffed} mm`}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">Depth — Oral</div>
            <div className="font-black text-3xl text-blue-600 dark:text-blue-400"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              {eq.ettDepthOral}<span className="text-sm font-normal ml-1">cm</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">at lips</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">Depth — Nasal</div>
            <div className="font-black text-3xl text-violet-600 dark:text-violet-400"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              {eq.ettDepthNasal}<span className="text-sm font-normal ml-1">cm</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">at nares</div>
          </div>
        </div>
      </div>

      {/* Equipment grid */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3">All Equipment — {weight} kg</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <EquipCard label="LMA Size"         value={eq.lma}               sub="Laryngeal mask airway"    tone="blue"   Icon={Wind}      highlighted />
          <EquipCard label="Suction Catheter" value={`${eq.suction} Fr`}   sub="≈ 3 × ETT size"           tone="slate"  Icon={ArrowsOut}            />
          <EquipCard label="Laryngoscope"     value={eq.blade}             sub="Blade size/type"           tone="amber"  Icon={Stethoscope}          />
          <EquipCard label="BVM Mask"         value={eq.maskSize}          sub="Bag-valve-mask size"       tone="sky"    Icon={Wind}                 />
          <EquipCard label="NGT / OGT"        value={eq.ngt}               sub="Nasogastric tube"          tone="slate"                              />
          <EquipCard label="IV Cannula"       value={eq.iv}                sub="Peripheral IV"             tone="blue"   Icon={Drop}      highlighted />
          <EquipCard label="IO Access"        value={eq.io}                sub="Intraosseous needle"       tone="red"    Icon={Syringe}              />
          <EquipCard label="Urinary Catheter" value={eq.ucath}             sub="Foley catheter"            tone="slate"                              />
          <EquipCard label="Chest Drain"      value={eq.chestDrain}        sub="Intercostal drain"         tone="violet" Icon={Wind}                 />
          <EquipCard label="Defibrillation"   value={`${eq.defib} J`}      sub={`4 J/kg · max ${eq.defibMax} J`} tone="red" Icon={Heartbeat} highlighted />
          <EquipCard label="Cardioversion"    value={`${eq.cardiovert} J`} sub="0.5–1 J/kg sync"           tone="amber"  Icon={Pulse}                />
          <EquipCard label="Maintenance"      value={`${maintenance} mL/24hr`} sub="Holliday-Segar"        tone="slate"  Icon={Drop}                 />
        </div>
      </div>

      {/* Pre-intubation checklist */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          allChecked
            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
        }`}>
          <div className="flex items-center gap-2">
            <ClipboardText size={14} weight="fill" className={allChecked ? "text-emerald-500" : "text-slate-400"} />
            <span className="font-bold text-sm text-slate-900 dark:text-white"
                  style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Pre-intubation Checklist</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">{checkedCount}/{checklistItems.length}</span>
            {allChecked
              ? <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle size={10} weight="fill" />Ready</span>
              : <button onClick={() => setCheckedItems({})} className="text-[10px] font-mono text-slate-400 hover:text-slate-600 underline">Reset</button>
            }
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900/50 grid sm:grid-cols-2 gap-1.5">
          {checklistItems.map(item => (
            <button key={item.id} onClick={() => toggleCheck(item.id)}
              className={`flex items-start gap-2.5 text-left rounded-lg px-3 py-2 transition-all text-xs ${
                checkedItems[item.id]
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                  : "bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-200"
              }`}>
              {checkedItems[item.id]
                ? <CheckCircle size={13} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />
                : <Circle      size={13} weight="regular" className="text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />}
              {item.label}
            </button>
          ))}
        </div>

        {!allChecked && checkedCount > 0 && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900">
            <div className="flex items-center gap-1.5">
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div className="bg-amber-500 rounded-full h-1.5 transition-all"
                     style={{ width: `${(checkedCount / checklistItems.length) * 100}%` }} />
              </div>
              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                {Math.round((checkedCount / checklistItems.length) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUB-TAB 2: DIFFICULT AIRWAY ──────────────────────────────────────────────
function DifficultAirwayView() {
  const { weight } = useWeight();
  const [section, setSection] = useState("predict");

  const lmaSize  = weight < 5 ? "1" : weight < 10 ? "1.5" : weight < 20 ? "2" : weight < 30 ? "2.5" : weight < 50 ? "3" : "4";
  const fob      = getFOBSize(weight);

  const sectionBtns = [
    { id: "predict", label: "Prediction"    },
    { id: "vortex",  label: "Vortex Approach" },
    { id: "aidaa",   label: "AIDAA / CICO"  },
    { id: "fob",     label: "Fibreoptic"    },
    { id: "devices", label: "Rescue Devices"},
  ];

  return (
    <div className="space-y-4">
      <InfoBox tone="red" icon={Warning}>
        Difficult airway in children is life-threatening. Senior clinician and anaesthesia backup MUST be called early. Never allow SpO₂ to fall below 90% before escalating.
      </InfoBox>

      <div className="flex flex-wrap gap-1.5">
        {sectionBtns.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
              section === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{s.label}</button>
        ))}
      </div>

      {/* ── PREDICTION ── */}
      {section === "predict" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-3" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Difficult Airway Predictors — Paediatric (AIDAA 2022)
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {DA_PREDICTORS.map(g => (
                <div key={g.label} className="space-y-1.5">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">{g.label}</div>
                  {g.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <ArrowRight size={10} weight="bold" className="text-amber-500 flex-shrink-0 mt-0.5" />{item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
            <div className="font-bold text-sm mb-2 text-amber-700 dark:text-amber-300"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Paediatric LEMON / MOANS / RODS</div>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              {DA_MNEMONICS.map(g => (
                <div key={g.mnemonic} className="space-y-1">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">{g.mnemonic}</div>
                  {g.items.map((item, i) => (
                    <div key={i} className="text-amber-800 dark:text-amber-200 text-[11px]">{item}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── VORTEX ── */}
      {section === "vortex" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              The Vortex Approach (Chrimes 2016)
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-3">
              Three lifelines (mask, SGD, tracheal) — each optimised once, then escalate. Green zone = oxygenation maintained.
            </p>
            <VortexSVG />
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {[
                { color: "blue",    lifeline: "Mask Ventilation",       steps: ["2-person EC grip", "OPA size (age/4 + 4) cm or NPA", "Jaw thrust — not head tilt if cervical concern", "Esmarch manoeuvre if still poor"] },
                { color: "violet",  lifeline: "Supraglottic Device",    steps: [`LMA size ${lmaSize} for ${weight} kg`, "2nd gen preferred (iGel, LMA Supreme)", "Deflate cuff fully before insert", "Max 2 insertion attempts per operator"] },
                { color: "emerald", lifeline: "Tracheal Intubation",    steps: ["Optimise position (BURP, bougie)", "Video laryngoscopy preferred in DA", "Max 3 laryngoscopy attempts total", "Confirm with waveform ETCO₂"] },
              ].map(l => (
                <div key={l.lifeline} className={`rounded-lg border p-3 ${TONE[l.color].border} ${TONE[l.color].bg}`}>
                  <div className={`font-bold text-xs mb-2 ${TONE[l.color].text}`}
                       style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{l.lifeline}</div>
                  {l.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-200 mb-1">
                      <span className={`font-bold ${TONE[l.color].text} flex-shrink-0`}>{i + 1}.</span> {s}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className={`mt-3 rounded-lg border p-3 ${TONE.red.border} ${TONE.red.bg}`}>
              <div className={`font-bold text-xs mb-1.5 ${TONE.red.text}`}>When Green Zone Is NOT Achievable → eFONA</div>
              <p className="text-xs text-red-800 dark:text-red-200">
                If all three lifelines fail and SpO₂ cannot be maintained → Emergency Front of Neck Access.
                Call this EARLY — do not wait until cardiac arrest.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── AIDAA / CICO ── */}
      {section === "aidaa" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              AIDAA Difficult Airway Algorithm 2022
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Oxygenation is the priority, not intubation.
            </p>
            <CICOAlgorithmSVG />
            <div className="mt-4 space-y-3">
              <InfoBox tone="red" icon={Warning} title="Paediatric eFONA Notes">
                Children &lt;8 yr: CTM is small. Cannula cricothyrotomy (16G IV + jet ventilation) is the bridge in infants.
                Limit to 3–5 min — CO₂ retention and barotrauma risk are significant.
              </InfoBox>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
                <div className="font-bold text-xs mb-2" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                  CTM Identification — Paediatric
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {CTM_NOTES.map(n => (
                    <div key={n.label} className="bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-[10px] text-slate-700 dark:text-slate-200 mb-1">{n.label}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">{n.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FIBREOPTIC ── */}
      {section === "fob" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Fibreoptic Bronchoscope (FOB) — Paediatric
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Gold standard for anticipated difficult airway. ETT must be loaded onto scope BEFORE insertion.
            </p>
            <FOBSizingSVG />
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">For {weight} kg patient</div>
                <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-3 text-xs text-sky-800 dark:text-sky-200 space-y-1">
                  <div className="font-bold">Scope OD: {fob.scope}</div>
                  <div>Min ETT ID: {fob.ett} mm (load before inserting)</div>
                  <div>ETT must be ≥ scope OD + 0.8 mm</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1">Technique</div>
                  {FOB_STEPS.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-sky-500 flex-shrink-0">{i + 1}.</span> {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">Awake FOB — Older Children</div>
                  {FOB_AWAKE_STEPS.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <ArrowRight size={9} weight="bold" className="text-amber-500 flex-shrink-0 mt-0.5" />{s}
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-200 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">LMA-Guided FOB</div>
                  {FOB_LMA_STEPS.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <ArrowRight size={9} weight="bold" className="text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESCUE DEVICES ── */}
      {section === "devices" && (
        <div className="space-y-3">
          {RESCUE_DEVICES.map(d => (
            <div key={d.name} className={`rounded-xl border p-4 bg-white dark:bg-slate-900/50 ${TONE[d.tone].border}`}>
              <div className={`font-bold text-sm mb-0.5 ${TONE[d.tone].text}`}
                   style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{d.name}</div>
              <div className="text-[10px] font-mono text-slate-400 mb-2">{d.sub}</div>
              <div className="space-y-1">
                {d.details.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <ArrowRight size={10} weight="bold" className={`${TONE[d.tone].text} flex-shrink-0 mt-0.5`} />{s}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SUB-TAB 3: MONITORING EQUIPMENT ─────────────────────────────────────────
function MonitoringEquipmentView() {
  const { weight } = useWeight();
  const [section, setSection] = useState("spo2");

  const bpCuff    = getBPCuff(weight);
  const bpCuffRule = "Width = 40% of arm circumference · Length = 80–100% of arm circumference";

  const sectionBtns = [
    { id: "spo2",  label: "Pulse Oximetry" },
    { id: "bp",    label: "BP Measurement" },
    { id: "bvm",   label: "BVM Details"    },
    { id: "etco2", label: "ETCO₂"          },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {sectionBtns.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
              section === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{s.label}</button>
        ))}
      </div>

      {/* ── SPO2 ── */}
      {section === "spo2" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-4">
          <div>
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Pulse Oximetry — Paediatric Principles</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Standard of care for all sedated or critically ill children. 2 wavelengths (660 nm / 940 nm) — Beer-Lambert law.
            </p>
          </div>
          <SpO2ProbeSVG />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2">Probe Selection by Age</div>
              <div className="space-y-2">
                {SPO2_PROBE_ROWS.map(r => (
                  <div key={r.age} className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2.5 text-xs">
                    <div className="font-bold text-slate-800 dark:text-white mb-0.5">{r.age}</div>
                    <div className="text-slate-600 dark:text-slate-300">{r.site}</div>
                    <div className="text-amber-600 dark:text-amber-400 text-[10px] mt-0.5">{r.warn}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className={`rounded-lg border p-3 ${TONE.red.border} ${TONE.red.bg}`}>
                <div className={`font-bold text-xs mb-1.5 ${TONE.red.text}`}>Limitations — Know Before You Trust</div>
                {SPO2_LIMITATIONS.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-800 dark:text-red-200">
                    <ArrowRight size={9} weight="bold" className="text-red-500 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
              <div className={`rounded-lg border p-3 ${TONE.emerald.border} ${TONE.emerald.bg}`}>
                <div className={`font-bold text-xs mb-1.5 ${TONE.emerald.text}`}>SpO₂ Targets by Age</div>
                {SPO2_TARGETS.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-200">
                    <ArrowRight size={9} weight="bold" className="text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BP ── */}
      {section === "bp" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-4">
          <div>
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Blood Pressure Measurement — Paediatric</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Wrong cuff = wrong BP. Oscillometric (NIBP) is standard; Doppler preferred in shock.</p>
          </div>
          <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
            <div className="text-[9px] font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Recommended cuff for {weight} kg</div>
            <div className="font-black text-2xl text-blue-700 dark:text-blue-300"
                 style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{bpCuff}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{bpCuffRule}</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2">Cuff Size Reference</div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                      <th className="p-2 text-left font-mono text-[8px] uppercase tracking-widest">Age / Weight</th>
                      <th className="p-2 text-left font-mono text-[8px] uppercase tracking-widest">Cuff</th>
                      <th className="p-2 text-left font-mono text-[8px] uppercase tracking-widest">Width</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BP_CUFF_ROWS.map((r, i) => (
                      <tr key={r.aw} className={`border-t border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? "bg-white dark:bg-slate-900/30" : "bg-slate-50/50 dark:bg-slate-900/50"}`}>
                        <td className="p-2 text-slate-700 dark:text-slate-200">{r.aw}</td>
                        <td className="p-2 font-mono font-bold text-blue-600 dark:text-blue-400">{r.cuff}</td>
                        <td className="p-2 font-mono text-slate-500">{r.width}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3">
                <div className="font-bold text-xs mb-2 text-slate-700 dark:text-slate-200">Methods — When to Use</div>
                {BP_METHODS.map(m => (
                  <div key={m.method} className="mb-2">
                    <div className="font-bold text-[10px] text-slate-700 dark:text-slate-200">{m.method}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{m.use}</div>
                  </div>
                ))}
              </div>
              <InfoBox tone="amber" icon={Warning} title="Cuff errors">
                Too small → falsely HIGH BP. Too large → falsely LOW. In shocked child NIBP is unreliable — use arterial line or Doppler.
              </InfoBox>
            </div>
          </div>
        </div>
      )}

      {/* ── BVM ── */}
      {section === "bvm" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-4">
          <div>
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Bag-Valve-Mask — Paediatric Details</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Seal failure is the #1 reason for BVM failure.</p>
          </div>
          <BVMDiagramSVG />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs">
                <div className="font-bold text-slate-800 dark:text-white mb-2">Bag Sizes</div>
                {BVM_SIZES.map(b => (
                  <div key={b.size} className="mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{b.size}</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">{b.vol}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[10px]">{b.use}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-3 text-xs text-sky-800 dark:text-sky-200 space-y-1.5">
                <div className="font-bold text-[10px] uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">Ventilation Targets</div>
                <div>Tidal volume: <strong>6–8 mL/kg</strong> = {Math.round(weight * 6)}–{Math.round(weight * 8)} mL for {weight} kg</div>
                <div>Rate: infants 20–40/min · children 15–25/min · adolescents 12–20/min</div>
                <div>FiO₂ without reservoir: ~0.4 · With reservoir at 10–15 L/min: ~0.85–0.95</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-200 space-y-1.5">
                <div className="font-bold text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Technique</div>
                {BVM_TECHNIQUES.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckCircle size={9} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
              <div className={`rounded-lg border p-3 ${TONE.red.border} ${TONE.red.bg}`}>
                <div className={`font-bold text-xs mb-1.5 ${TONE.red.text}`}>Common BVM Failures</div>
                {BVM_FAILURES.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-800 dark:text-red-200">
                    <ArrowRight size={9} weight="bold" className="text-red-500 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ETCO2 ── */}
      {section === "etco2" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-4">
          <div>
            <div className="font-bold text-sm mb-1" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Capnography / ETCO₂ — Paediatric</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mandatory for all intubated patients. Most reliable ETT confirmation — colorimetric is backup only.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              {/* Mini waveform SVG — illustrative only, not data-derived */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs">
                <div className="font-bold text-slate-800 dark:text-white mb-2">Normal Capnography Waveform</div>
                <svg viewBox="0 0 200 60" className="w-full h-14 bg-slate-950 rounded mb-2">
                  <path d="M5,50 L35,50 L38,10 L55,10 L58,50 L100,50 L103,10 L120,10 L123,50 L165,50 L168,10 L185,10 L188,50 L200,50"
                    fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinejoin="round" />
                  <line x1="0" y1="35" x2="200" y2="35" stroke="#1e3a5f" strokeWidth="0.5" strokeDasharray="3,3" />
                  <text x="2" y="33" fill="#475569" fontSize="5" fontFamily="monospace">35–45 mmHg</text>
                </svg>
                {[
                  { phase: "Phase I",   desc: "Inspiratory baseline — dead space washout (CO₂ ~0 mmHg)" },
                  { phase: "Phase II",  desc: "Expiratory upstroke — mixing of dead space + alveolar gas" },
                  { phase: "Phase III", desc: "Alveolar plateau — normal 35–45 mmHg" },
                  { phase: "Phase 0",   desc: "Inspiratory downstroke — fresh gas inhalation" },
                ].map(p => (
                  <div key={p.phase} className="mb-1.5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.phase}: </span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200 space-y-2">
                <div className="font-bold text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">ETCO₂ Pattern Interpretation</div>
                {ETCO2_PATTERNS.map(p => (
                  <div key={p.pat} className="border-b border-amber-200 dark:border-amber-800 pb-1.5 mb-1">
                    <div className="font-bold text-[10px]">{p.pat}</div>
                    <div className="text-[10px] opacity-80">{p.cause}</div>
                  </div>
                ))}
              </div>
              <InfoBox tone="emerald" icon={CheckCircle} title="Paediatric tip">
                In neonates, ETCO₂ underestimates PaCO₂ due to high rates and larger dead space.
                Correlate with ABG in ventilated neonates. Any waveform confirms tracheal placement — regardless of absolute value.
              </InfoBox>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SUB-TAB 4: REFERENCE TABLE ───────────────────────────────────────────────
function ReferenceTableView() {
  const { weight } = useWeight();
  const [highlightAge, setHighlightAge] = useState(null);

  const suggestedIdx = useMemo(() => {
    if (!EQUIPMENT_ROWS) return 0;
    const idx = EQUIPMENT_ROWS.findIndex(r => parseFloat(r.weight) >= weight);
    return idx >= 0 ? idx : EQUIPMENT_ROWS.length - 1;
  }, [weight]);

  const cols = [
    { k: "age",     label: "Age"          },
    { k: "weight",  label: "Weight (kg)"  },
    { k: "ett",     label: "ETT (mm ID)"  },
    { k: "depth",   label: "Depth (cm)"   },
    { k: "suction", label: "Suction (Fr)" },
    { k: "blade",   label: "Laryngoscope" },
    { k: "lma",     label: "LMA"          },
    { k: "ngt",     label: "NGT (Fr)"     },
    { k: "iv",      label: "IV"           },
    { k: "defib",   label: "Defib (J)"    },
  ];

  return (
    <div className="space-y-4">
      <InfoBox tone="sky" icon={Lightbulb}>
        Row matching current weight ({weight} kg) highlighted in blue. Click any row to lock selection.
      </InfoBox>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 dark:bg-slate-950 text-white">
              {cols.map(c => (
                <th key={c.k} className="p-3 text-left font-mono text-[9px] uppercase tracking-widest whitespace-nowrap">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(EQUIPMENT_ROWS || []).map((r, i) => {
              const isSuggested   = i === suggestedIdx;
              const isHighlighted = highlightAge === r.age;
              let rowCls = "border-t border-slate-200 dark:border-slate-800 cursor-pointer transition-colors ";
              if      (isHighlighted) rowCls += "bg-violet-100 dark:bg-violet-950/50 ";
              else if (isSuggested)   rowCls += "bg-blue-50 dark:bg-blue-950/30 ";
              else                    rowCls += "odd:bg-white dark:odd:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/30 ";
              return (
                <tr key={r.age} className={rowCls} onClick={() => setHighlightAge(isHighlighted ? null : r.age)}>
                  <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {r.age}
                    {isSuggested && !isHighlighted && (
                      <span className="ml-1.5 text-[8px] font-mono uppercase tracking-widest text-blue-500 border border-blue-200 dark:border-blue-800 rounded px-1 py-0.5">wt</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{r.weight}</td>
                  <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{r.ett}</td>
                  <td className="p-3 font-mono text-blue-600 dark:text-blue-400">{r.depth}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{r.suction}</td>
                  <td className="p-3 font-mono text-amber-700 dark:text-amber-400">{r.blade}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{r.lma}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{r.ngt}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{r.iv}</td>
                  <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">{r.defib}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800" />Weight match</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800" />Selected</span>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3">Formula Reference</div>
        <div className="grid sm:grid-cols-2 gap-2 font-mono text-xs">
          {FORMULA_ROWS.map(f => (
            <div key={f.label} className="flex justify-between gap-2 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{f.label}</span>
              <span className="font-bold text-slate-800 dark:text-white whitespace-nowrap">{f.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "calculator", label: "Equipment Calculator", Icon: Wind          },
  { id: "difficult",  label: "Difficult Airway",     Icon: Warning       },
  { id: "monitoring", label: "Monitoring Equipment", Icon: Pulse         },
  { id: "table",      label: "Reference Table",      Icon: ClipboardText },
];

export default function EquipmentTab() {
  const { weight }   = useWeight();
  const [activeTab, setActiveTab] = useState("calculator");

  return (
    <div className="space-y-5">

      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Airway Equipment &amp; Monitoring
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Weight/age-based equipment for{" "}
          <span className="font-bold text-slate-900 dark:text-white">{weight} kg</span> ·
          Harriet Lane 23e · Fleischer &amp; Ludwig 7e · APLS · AIDAA 2022 · Morgan &amp; Mikhail 7e
        </p>
      </div>

      <InfoBox tone="amber" icon={Warning}>
        Always prepare one size above and below. Cuffed ETTs preferred ≥2 yr or ≥8 kg.
        Confirm ETT position with ETCO₂ waveform — not colorimetric alone.
        For RSI drug doses see the Resuscitation tab.
      </InfoBox>

      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-mono text-[11px] uppercase tracking-wider transition-all ${
              activeTab === t.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>
            <t.Icon size={13} weight={activeTab === t.id ? "fill" : "regular"} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "calculator" && <LiveEquipmentCalculator />}
      {activeTab === "difficult"  && <DifficultAirwayView />}
      {activeTab === "monitoring" && <MonitoringEquipmentView />}
      {activeTab === "table"      && <ReferenceTableView />}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        Harriet Lane 23e · Fleischer &amp; Ludwig 7e · APLS · AIDAA 2022 ·
        Vortex Approach (Chrimes 2016) · Morgan &amp; Mikhail 7e · Motoyama Paediatric Anaesthesia · AHA PALS 2020
      </div>
    </div>
  );
}
