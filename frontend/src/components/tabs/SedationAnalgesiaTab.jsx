import { useState } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  LOCAL_ANAESTHETICS,
  PSA_PRINCIPLES,
  PSA_REGIMENS,
  NERVE_BLOCKS,
  LAST_PROTOCOL,
} from "../../data/sedationAnalgesia";
import { Warning, ArrowSquareOut, Drop, ListChecks, Syringe, FirstAid } from "@phosphor-icons/react";

const SECTIONS = [
  { id: "local", label: "Local Anaesthetics", icon: Drop },
  { id: "psa", label: "PSA Reference", icon: ListChecks },
  { id: "blocks", label: "Nerve Blocks", icon: Syringe },
  { id: "last", label: "LAST Rescue", icon: FirstAid },
];

export default function SedationAnalgesiaTab() {
  const [section, setSection] = useState("local");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">Sedation & Analgesia</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Local anaesthetics, procedural sedation principles, and pediatric ED nerve blocks. References:{" "}
          <strong>Tintinalli ch. 38 · ACEP PSA · NYSORA · baby-blocks.com</strong>.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              data-testid={`sed-sub-${s.id}`}
              onClick={() => setSection(s.id)}
              className={`px-3 py-2 rounded-md border font-mono text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                section === s.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                  : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              <Icon size={12} weight="bold" />
              {s.label}
            </button>
          );
        })}
      </div>

      {section === "local" && <LocalAnaestheticsSection />}
      {section === "psa" && <PsaSection />}
      {section === "blocks" && <NerveBlocksSection />}
      {section === "last" && <LastSection />}
    </div>
  );
}

function LocalAnaestheticsSection() {
  const { weight } = useWeight();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-sans font-bold text-lg mb-2">Local Anaesthetic — Max Safe Dose</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Doses calculated for <span className="font-mono font-bold">{weight} kg</span>. Total includes all infiltrations
          during the case. Aspirate before injecting — intravascular injection is the primary cause of LAST.
        </p>
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Agent</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">mg/kg</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Max mg</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Max for {weight} kg</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Concentration</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Onset</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Duration</th>
              </tr>
            </thead>
            <tbody>
              {LOCAL_ANAESTHETICS.map((la) => {
                const maxMg = la.mgPerKg ? Math.min(weight * la.mgPerKg, la.max) : null;
                return (
                  <tr key={la.name} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40 align-top">
                    <td className="p-3 font-bold">{la.name}</td>
                    <td className="p-3 font-mono">{la.mgPerKg ?? "—"}</td>
                    <td className="p-3 font-mono">{la.max ?? "—"}</td>
                    <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">
                      {maxMg !== null ? `${maxMg.toFixed(1)} mg` : "Topical"}
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-500 dark:text-slate-400">{la.concentration}</td>
                    <td className="p-3 font-mono text-xs">{la.onset}</td>
                    <td className="p-3 font-mono text-xs">{la.duration}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-md border-2 border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-4">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 mb-2">
          <Warning size={16} weight="fill" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Safety pearls</span>
        </div>
        <ul className="text-sm space-y-1 text-amber-900 dark:text-amber-100">
          <li className="flex gap-2"><span className="opacity-60">•</span><span>Always aspirate before injection. Stop if blood returns or patient reports peri-oral numbness / metallic taste.</span></li>
          <li className="flex gap-2"><span className="opacity-60">•</span><span>NEVER use adrenaline-containing solutions for digital, penile, or pinna blocks (end-artery zones).</span></li>
          <li className="flex gap-2"><span className="opacity-60">•</span><span>Bupivacaine is the most cardiotoxic — keep 20% Intralipid available for any block ≥ 0.25%.</span></li>
          <li className="flex gap-2"><span className="opacity-60">•</span><span>Topical anaesthetics (EMLA / Ametop) require dwell time and occlusion — apply 30–60 min before procedure.</span></li>
          <li className="flex gap-2"><span className="opacity-60">•</span><span>Convert mL to mg: 1% = 10 mg/mL · 0.25% = 2.5 mg/mL · 2% = 20 mg/mL.</span></li>
        </ul>
      </div>
    </div>
  );
}

function PsaSection() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Phase title="Pre-procedure" items={PSA_PRINCIPLES.preProcedure} accent="emerald" />
        <Phase title="During procedure" items={PSA_PRINCIPLES.duringProcedure} accent="amber" />
        <Phase title="Recovery / discharge" items={PSA_PRINCIPLES.postProcedure} accent="cyan" />
      </div>

      <div>
        <h3 className="font-sans font-bold text-lg mb-3">PSA Regimens — Pediatric ED</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {PSA_REGIMENS.map((r) => (
            <div key={r.name} data-testid={`psa-${r.name}`} className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4">
              <h4 className="font-sans font-bold text-base">{r.name}</h4>
              <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-red-600 dark:text-red-400 mt-1 mb-2">{r.dosing}</div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div><span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Onset</span><div className="font-mono">{r.onset}</div></div>
                <div><span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Duration</span><div className="font-mono">{r.duration}</div></div>
              </div>
              <div className="text-sm space-y-1.5">
                <div><span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Indication</span><div>{r.indication}</div></div>
                <div className="text-emerald-700 dark:text-emerald-300"><span className="font-mono text-[10px] uppercase tracking-widest opacity-75">Pros</span><div className="text-sm">{r.pros}</div></div>
                <div className="text-amber-700 dark:text-amber-300"><span className="font-mono text-[10px] uppercase tracking-widest opacity-75">Cons</span><div className="text-sm">{r.cons}</div></div>
                <div className="text-red-700 dark:text-red-300"><span className="font-mono text-[10px] uppercase tracking-widest opacity-75">Cautions</span><div className="text-sm">{r.cautions}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Phase({ title, items, accent }) {
  const accentMap = {
    emerald: "border-l-emerald-500 dark:border-l-emerald-400",
    amber: "border-l-amber-500 dark:border-l-amber-400",
    cyan: "border-l-cyan-500 dark:border-l-cyan-400",
  };
  return (
    <div className={`rounded-md border border-l-4 ${accentMap[accent]} border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4`}>
      <h4 className="font-sans font-bold text-base mb-2">{title}</h4>
      <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
        {items.map((it) => (
          <li key={it} className="flex gap-2"><span className="opacity-60">·</span><span>{it}</span></li>
        ))}
      </ul>
    </div>
  );
}

function NerveBlocksSection() {
  const [activeId, setActiveId] = useState(NERVE_BLOCKS[0].id);
  const active = NERVE_BLOCKS.find((b) => b.id === activeId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {NERVE_BLOCKS.map((b) => (
          <button
            key={b.id}
            data-testid={`block-${b.id}`}
            onClick={() => setActiveId(b.id)}
            className={`px-3 py-1.5 rounded-md border font-mono text-[10px] uppercase tracking-widest transition-all ${
              activeId === b.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            {b.name.split(" (")[0]}
          </button>
        ))}
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="font-sans font-bold text-xl tracking-tight">{active.name}</h3>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-red-600 dark:text-red-400 mt-1">{active.indication}</div>
            </div>

            <Field label="Landmarks" value={active.landmarks} />
            <Field label="Technique" value={active.technique} />
            <Field label="Drug & Volume" value={active.drug} highlight />
            <Field label="Nerves blocked" value={active.nerves} />
            <Field label="Cautions" value={active.cautions} tone="amber" />
            <Field label="Duration" value={active.duration} />
          </div>

          <div className="md:col-span-1">
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
              {active.imgUrl ? (
                <img
                  src={active.imgUrl}
                  alt={active.imgAlt}
                  className="w-full rounded mb-2 bg-white"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextSibling?.style && (e.currentTarget.nextSibling.style.display = "flex");
                  }}
                />
              ) : null}
              <div
                className="aspect-video rounded bg-slate-200 dark:bg-slate-800 flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-mono uppercase tracking-widest mb-2 gap-2 p-3 text-center"
                style={{ display: active.imgUrl ? "none" : "flex" }}
              >
                <span>Reference diagram</span>
                <span className="text-[9px] normal-case tracking-normal opacity-75">See linked source for ultrasound clips & step-by-step</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 leading-snug">{active.imgAlt}</div>
              <a
                href={active.refUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400 hover:underline"
                data-testid={`block-ref-${active.id}`}
              >
                Open full reference <ArrowSquareOut size={12} weight="bold" />
              </a>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
              For step-by-step procedural guides with annotated ultrasound clips, refer to{" "}
              <a href="https://www.baby-blocks.com/" target="_blank" rel="noopener noreferrer" className="underline">baby-blocks.com</a> and NYSORA pediatric block library.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, highlight, tone }) {
  const toneClass = tone === "amber"
    ? "text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60"
    : highlight
      ? "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 font-mono"
      : "text-slate-700 dark:text-slate-200";
  const wrap = highlight || tone
    ? `rounded-md border p-3 ${toneClass}`
    : "";
  return (
    <div className={wrap}>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-1">{label}</div>
      <div className={`text-sm leading-relaxed ${highlight ? "font-mono font-bold" : ""}`}>{value}</div>
    </div>
  );
}

function LastSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-950/40 p-5">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
          <Warning size={20} weight="fill" />
          <span className="font-sans font-bold text-lg">LAST — Local Anaesthetic Systemic Toxicity</span>
        </div>
        <p className="text-sm text-red-900 dark:text-red-100 leading-relaxed">
          Time-critical emergency. Bupivacaine cardiotoxicity may persist; CPR alone often insufficient.
          Lipid rescue (20% Intralipid) is the antidote.
        </p>
      </div>

      <div>
        <h3 className="font-sans font-bold text-lg mb-2">Recognise — signs of LAST</h3>
        <ul className="space-y-1.5 text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4">
          {LAST_PROTOCOL.signs.map((s) => (
            <li key={s} className="flex gap-2"><span className="opacity-60">•</span><span>{s}</span></li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-sans font-bold text-lg mb-2">Manage — step-by-step</h3>
        <ol className="space-y-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4">
          {LAST_PROTOCOL.management.map((m, i) => (
            <li key={m} className="flex gap-3">
              <span className="font-mono text-red-600 dark:text-red-400 font-black text-sm w-6 shrink-0 pt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm leading-relaxed">{m}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
