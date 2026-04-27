import { useState } from "react";
import { ALGORITHMS, AHA_2025_UPDATES } from "../../data/algorithms";
import { ArrowDown, Diamond, CaretRight, ArrowSquareOut, Lightning, Metronome, Pulse, Gauge, ChartLineUp, Flask, Brain } from "@phosphor-icons/react";

const COLORS = {
  resuscitation: {
    bar: "bg-red-500 dark:bg-red-400",
    accent: "text-red-600 dark:text-red-400",
    border: "border-red-500/40",
    chip: "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900",
  },
  fluid: {
    bar: "bg-cyan-500 dark:bg-cyan-400",
    accent: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/40",
    chip: "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-900",
  },
  anticonvulsant: {
    bar: "bg-fuchsia-500 dark:bg-fuchsia-400",
    accent: "text-fuchsia-600 dark:text-fuchsia-400",
    border: "border-fuchsia-500/40",
    chip: "bg-fuchsia-50 dark:bg-fuchsia-950/60 border-fuchsia-200 dark:border-fuchsia-900",
  },
};

const ICON_MAP = {
  metronome: Metronome,
  pulse: Pulse,
  gauge: Gauge,
  chart: ChartLineUp,
  beaker: Flask,
  brain: Brain,
};

export default function AlgorithmsTab() {
  const [activeId, setActiveId] = useState(ALGORITHMS[0].id);
  const [showUpdates, setShowUpdates] = useState(true);
  const active = ALGORITHMS.find((a) => a.id === activeId);
  const c = COLORS[active.color] || COLORS.resuscitation;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">PALS Algorithms</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Step-by-step pathways. Updated with <strong>2025 AHA</strong> PALS guideline changes.
          </p>
        </div>
        <button
          data-testid="toggle-updates"
          onClick={() => setShowUpdates((s) => !s)}
          className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          {showUpdates ? "Hide" : "Show"} 2025 updates
        </button>
      </div>

      {showUpdates && <AHAUpdatesPanel />}

      <VisualRefChart />

      <div className="flex gap-2 flex-wrap">
        {ALGORITHMS.map((a) => (
          <button
            key={a.id}
            data-testid={`algo-${a.id}`}
            onClick={() => setActiveId(a.id)}
            className={`px-3 py-2 rounded-md border font-mono text-[11px] uppercase tracking-widest transition-all ${
              activeId === a.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            {a.title}
          </button>
        ))}
      </div>

      <div className={`rounded-md border ${c.border} p-5 sm:p-6 bg-white dark:bg-slate-900/40`}>
        <div className={`flex items-center gap-2 ${c.accent} mb-1 flex-wrap`}>
          <div className={`h-1 w-8 rounded-full ${c.bar}`} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Algorithm</span>
          {active.badge && (
            <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${c.chip}`}>
              {active.badge}
            </span>
          )}
        </div>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-sans font-bold text-xl sm:text-2xl tracking-tight">{active.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{active.subtitle}</p>
          </div>
          {active.officialPdf && (
            <a
              href={active.officialPdf}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`algo-pdf-${active.id}`}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowSquareOut size={14} weight="bold" /> Official AHA 2025 chart
            </a>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {active.steps.map((step, i) => (
            <div key={step.title}>
              <div
                className={`rounded-md border p-4 flex gap-4 ${
                  step.type === "decision"
                    ? `${c.chip} border-dashed`
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex-shrink-0 flex flex-col items-center gap-1 w-14">
                  {step.type === "decision" ? (
                    <Diamond size={22} weight="bold" className={c.accent} />
                  ) : (
                    <CaretRight size={22} weight="bold" className={c.accent} />
                  )}
                  <span className={`font-mono text-[9px] uppercase tracking-widest ${c.accent}`}>
                    {step.type === "decision" ? "Decide" : `Step ${i + 1}`}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-sans font-bold text-base leading-tight">{step.title}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                    {step.body}
                  </div>
                </div>
              </div>
              {i < active.steps.length - 1 && (
                <div className="flex justify-start pl-5 py-1">
                  <ArrowDown size={18} weight="bold" className="text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 italic">
        References: 2025 American Heart Association PALS guidelines · NRP 2020 · Fleischer &amp; Ludwig · Harriet
        Lane Handbook 23rd ed.
      </div>
    </div>
  );
}

function AHAUpdatesPanel() {
  return (
    <div
      data-testid="aha-2025-updates"
      className="rounded-md border-2 border-red-500/40 dark:border-red-400/40 bg-red-50/60 dark:bg-red-950/30 p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-3 text-red-700 dark:text-red-300">
        <Lightning size={18} weight="fill" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">2025 AHA · key updates at a glance</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {AHA_2025_UPDATES.map((u) => {
          const Icon = ICON_MAP[u.icon] || Lightning;
          return (
            <div
              key={u.title}
              data-testid={`update-${u.icon}`}
              className="rounded-md bg-white dark:bg-slate-900/70 border border-red-200 dark:border-red-900 p-3"
            >
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-1">
                <Icon size={16} weight="bold" />
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold">{u.title}</span>
              </div>
              <div className="font-mono font-black text-xl sm:text-2xl text-red-700 dark:text-red-300 leading-none">
                {u.value}
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-200 mt-1.5 font-medium">{u.sub}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{u.note}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// SVG visual reference: compression rate + ventilation rate timeline
function VisualRefChart() {
  return (
    <div data-testid="visual-ref-chart" className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 sm:p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3">
        2025 AHA · CPR cadence reference (1-minute timeline)
      </div>
      <div className="space-y-3">
        {/* Compressions */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-red-600 dark:text-red-400">Compressions · 100–120/min</span>
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">depth ≥ ⅓ AP</span>
          </div>
          <svg viewBox="0 0 600 30" className="w-full h-6" preserveAspectRatio="none">
            {Array.from({ length: 110 }, (_, i) => (
              <rect key={i} x={i * (600 / 110)} y="2" width={(600 / 110) - 1} height="26" rx="1" className="fill-red-500/70 dark:fill-red-400/80" />
            ))}
          </svg>
        </div>
        {/* Ventilation with advanced airway */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">Ventilation · advanced airway · 1 breath / 2–3 s (20–30/min)</span>
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">2025 AHA</span>
          </div>
          <svg viewBox="0 0 600 30" className="w-full h-6" preserveAspectRatio="none">
            {Array.from({ length: 24 }, (_, i) => {
              const x = i * (600 / 24);
              return (
                <g key={i}>
                  <rect x={x} y="2" width={(600 / 24) - 2} height="26" rx="2" className="fill-blue-500/70 dark:fill-blue-400/80" />
                </g>
              );
            })}
          </svg>
        </div>
        {/* No advanced airway ratio */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200">No advanced airway · 15:2 (2-rescuer) or 30:2 (single)</span>
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">minimise interruptions &lt; 10 s</span>
          </div>
          <svg viewBox="0 0 600 20" className="w-full h-5" preserveAspectRatio="none">
            {/* 15:2 ratio visualization */}
            {Array.from({ length: 8 }, (_, cycle) => {
              const cw = 600 / 8;
              const x0 = cycle * cw;
              return (
                <g key={cycle}>
                  {/* compressions block */}
                  <rect x={x0 + 2} y="2" width={cw * 0.85} height="16" rx="2" className="fill-red-500/50 dark:fill-red-400/60" />
                  {/* breaths block */}
                  <rect x={x0 + cw * 0.87} y="2" width={cw * 0.11} height="16" rx="2" className="fill-blue-500/70 dark:fill-blue-400/80" />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
        Chest compression fraction target <strong>&gt; 80%</strong>. Pre- and post-shock pauses <strong>&lt; 10 s</strong>.
        If arterial monitoring: target DBP <strong>≥ 25 mmHg (infant)</strong> / <strong>≥ 30 mmHg (child)</strong>.
      </div>
    </div>
  );
}
