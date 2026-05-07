import { useWeight } from "../../context/WeightContext";
import { RSI_PRE_MEDICATION, RSI_INDUCTION, RSI_PARALYSIS, RSI_POST, RSI_CHECKLIST } from "../../data/infusions";
import { ICD_INSERTION } from "../../data/criticalCare";
import InfusionCalculator from "../InfusionCalculator";
import RuleOfSixs from "../RuleOfSixs";
import { useState, useEffect } from "react";
import { Warning } from "@phosphor-icons/react";

const TONE_CARD = {
  emerald: "border-l-emerald-500 dark:border-l-emerald-400",
  amber:   "border-l-amber-500 dark:border-l-amber-400",
  red:     "border-l-red-500 dark:border-l-red-400",
  sedation:"border-l-purple-500 dark:border-l-purple-400",
};

const SECTIONS = [
  { id: "quickstart", label: "RSI Quickstart" },
  { id: "infusions",  label: "Infusions (mL/hr)" },
  { id: "rule6",      label: "Rule of 6s" },
  { id: "checklist",  label: "7 Ps Checklist" },
  { id: "icd",        label: "ICD Insertion" },
];

export default function ResuscitationTab({ searchEntry }) {
  const { weight } = useWeight();
  const [sec, setSec] = useState("quickstart");

  useEffect(() => {
    if (!searchEntry?.section) return;
    const sectionMap = {
      "RSI Quickstart": "quickstart",
      "Infusions (mL/hr)": "infusions",
      "Rule of 6s": "rule6",
      "7 Ps Checklist": "checklist",
      "ICD Insertion": "icd",
    };
    const s = sectionMap[searchEntry.section];
    if (s) setSec(s);
  }, [searchEntry]);;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">Resuscitation</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          RSI quickstart, post-intubation infusions, Rule of 6s & 7-Ps checklist for{" "}
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{weight} kg</span>.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            data-testid={`rsi-sub-${s.id}`}
            onClick={() => setSec(s.id)}
            className={`px-3 py-2 rounded-md border font-mono text-[11px] uppercase tracking-widest transition-all ${
              sec === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {sec === "quickstart" && <Quickstart weight={weight} />}
      {sec === "infusions"  && <InfusionCalculator />}
      {sec === "rule6"      && <RuleOfSixs />}
      {sec === "checklist"  && <Checklist />}
      {sec === "icd"        && <IcdSection weight={weight} />}
    </div>
  );
}

function calcRange(drug, weight) {
  let d = weight * drug.dosePerKg;
  if (drug.max) d = Math.min(d, drug.max);
  if (drug.min) d = Math.max(d, drug.min);
  return +d.toFixed(2);
}

function RsiCard({ drug, weight, testid }) {
  const dose = calcRange(drug, weight);
  return (
    <div
      data-testid={testid}
      className={`rounded-md border border-l-4 ${TONE_CARD[drug.tone] || "border-l-slate-400"} border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/50`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-sans font-bold text-base">{drug.name}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mt-0.5">
            {drug.dosePerKg} {drug.unit}/kg · {drug.route}
          </div>
        </div>
        <div className="font-mono font-black text-xl text-red-600 dark:text-red-400">
          {dose} <span className="font-normal text-xs text-slate-500">{drug.unit}</span>
        </div>
      </div>
      {drug.note && <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{drug.note}</div>}
    </div>
  );
}

function Quickstart({ weight }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-sans font-bold text-lg mb-2">Pre-medication (optional, case-based)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {RSI_PRE_MEDICATION.map((d) => (
            <RsiCard key={d.name} drug={{ ...d, tone: "amber" }} weight={weight} testid={`rsi-pre-${d.name}`} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-sans font-bold text-lg mb-2">Induction agents</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {RSI_INDUCTION.map((d) => (
            <RsiCard key={d.name} drug={d} weight={weight} testid={`rsi-ind-${d.name}`} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-sans font-bold text-lg mb-2">Paralysis (muscle relaxant)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {RSI_PARALYSIS.map((d) => (
            <RsiCard key={d.name} drug={d} weight={weight} testid={`rsi-par-${d.name}`} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-sans font-bold text-lg mb-2">Post-intubation sedation/analgesia (starting rates)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {RSI_POST.map((d) => (
            <RsiCard key={d.name} drug={d} weight={weight} testid={`rsi-post-${d.name}`} />
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          For exact mL/hr given your stock concentration, use the <strong>Infusions</strong> sub-tab above.
        </p>
      </section>

      <div className="rounded-md border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-600 dark:text-slate-300">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1">Reversal</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>Sugammadex (rocuronium) — 16 mg/kg IV: <span className="font-mono font-bold">{Math.min(weight * 16, 1200).toFixed(0)} mg</span></div>
          <div>Naloxone (opioid) 0.1 mg/kg — <span className="font-mono font-bold">{Math.min(weight * 0.1, 2).toFixed(2)} mg IV/IM/IN</span></div>
          <div>Flumazenil (BZD) 0.01 mg/kg — <span className="font-mono font-bold">{Math.min(weight * 0.01, 0.2).toFixed(2)} mg IV</span></div>
        </div>
      </div>
    </div>
  );
}

function Checklist() {
  return (
    <div className="space-y-3">
      {RSI_CHECKLIST.map((step, i) => (
        <div key={step.p} className="rounded-md border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/50">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-mono text-red-600 dark:text-red-400 font-black text-xl">{i + 1}</span>
            <h4 className="font-sans font-bold text-base">{step.p}</h4>
          </div>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {step.items.map((it) => (
              <li key={it} className="flex gap-2">
                <span className="opacity-60">☐</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════ ICD Insertion ═══════════════════════════
function IcdSection({ weight }) {
  return (
    <div className="space-y-5" data-testid="icd-section">
      <div className="rounded-md border-2 border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-950/40 p-4">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-1">
          <Warning size={16} weight="fill" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Tension pneumothorax</span>
        </div>
        <p className="text-sm text-red-900 dark:text-red-100">
          Clinical diagnosis. Needle decompress at 4–5th ICS mid-axillary line (or 2nd ICS MCL) BEFORE ICD insertion.
          Do NOT wait for imaging.
        </p>
      </div>

      <BulletBlock title="Indications" items={ICD_INSERTION.indications} />
      <BulletBlock title="Contraindications" items={ICD_INSERTION.contraindications} tone="amber" />

      <div>
        <h4 className="font-sans font-bold text-base mb-2">Tube size by weight ({weight} kg)</h4>
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Patient</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">General range</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Pneumothorax</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Fluid / blood</th>
              </tr>
            </thead>
            <tbody>
              {ICD_INSERTION.sizingTable.map((s) => (
                <tr key={s.weight} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                  <td className="p-3 font-bold">{s.weight}</td>
                  <td className="p-3 font-mono">{s.french}</td>
                  <td className="p-3 font-mono text-emerald-700 dark:text-emerald-400">{s.pneumo}</td>
                  <td className="p-3 font-mono text-red-700 dark:text-red-400">{s.fluid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BulletBlock title="Equipment" items={ICD_INSERTION.equipment} />
      <NumberedSteps title="Technique (open / blunt-dissection — preferred)" items={ICD_INSERTION.technique} />
      <BulletBlock title="Post-procedure care" items={ICD_INSERTION.postProcedure} />
      <BulletBlock title="Removal criteria & technique" items={ICD_INSERTION.removal} tone="emerald" />
      <BulletBlock title="Complications" items={ICD_INSERTION.complications} tone="amber" />

      <div className="text-xs text-slate-500 dark:text-slate-400 italic">
        References: Tintinalli ch. 30 · BTS Pleural Disease Guideline · APLS · Open Pediatrics chest tube module.
      </div>
    </div>
  );
}

function BulletBlock({ title, items, tone }) {
  const toneClass = tone === "amber"
    ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30"
    : tone === "emerald"
      ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30"
      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50";
  return (
    <div>
      <h4 className="font-sans font-bold text-base mb-2">{title}</h4>
      <ul className={`space-y-1.5 rounded-md border p-4 text-sm ${toneClass}`}>
        {items.map((i) => (
          <li key={i} className="flex gap-2 leading-relaxed">
            <span className="opacity-60">·</span>
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NumberedSteps({ title, items }) {
  return (
    <div>
      <h4 className="font-sans font-bold text-base mb-2">{title}</h4>
      <ol className="space-y-2 rounded-md border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/50 text-sm">
        {items.map((item, i) => (
          <li key={item} className="flex gap-3">
            <span className="font-mono text-red-600 dark:text-red-400 font-black text-sm w-7 shrink-0 pt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
