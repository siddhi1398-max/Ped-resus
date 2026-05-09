import { useWeight } from "../../context/WeightContext";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  APGAR_CRITERIA,
  APGAR_INTERPRETATION,
  NEONATAL_VITALS,
  SPO2_TARGETS_NRP,
  NRP_EQUIPMENT,
  NRP_PEARLS,
  nrpETTDepth,
  uvcDepth,
} from "../../data/neonatal";
import Scorer from "../Scorer";
import { STOPS_SCORE } from "../../data/stops";
import { Baby, Warning, CheckCircle, Circle, Clock, ArrowCounterClockwise, Play, Pause, Syringe, Drop, Airplay, Pill, Info } from "@phosphor-icons/react";

// ─── constants ───────────────────────────────────────────────────────────────

const TONE_MAP = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900",
  amber:   "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900",
  red:     "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-900",
};

const CATEGORY_STYLES = {
  resuscitation: {
    border: "border-red-300 dark:border-red-800",
    badge:  "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    icon:   <Syringe size={14} weight="fill" />,
    label:  "Resus",
  },
  fluid: {
    border: "border-blue-300 dark:border-blue-800",
    badge:  "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    icon:   <Drop size={14} weight="fill" />,
    label:  "Fluid",
  },
  airway: {
    border: "border-purple-300 dark:border-purple-800",
    badge:  "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    icon:   <Airplay size={14} weight="fill" />,
    label:  "Airway",
  },
  anticonvulsant: {
    border: "border-orange-300 dark:border-orange-800",
    badge:  "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    icon:   <Pill size={14} weight="fill" />,
    label:  "Anticonvulsant",
  },
  other: {
    border: "border-slate-300 dark:border-slate-700",
    badge:  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon:   <Info size={14} weight="fill" />,
    label:  "Other",
  },
};

const GOLDEN_MINUTE_STEPS = [
  {
    phase: "Immediate (0–20 s)",
    items: [
      { label: "Warm and dry", sub: "Pre-warm radiant warmer · use warm dry towels", cue: 0 },
      { label: "Position airway", sub: "Sniffing position · slight neck extension · shoulder roll if needed", cue: 5 },
      { label: "Clear secretions if needed", sub: "Bulb suction mouth then nose · avoid deep suction", cue: 10 },
      { label: "Stimulate", sub: "Rub back or flick soles", cue: 15 },
    ],
  },
  {
    phase: "Assess (20–30 s)",
    items: [
      { label: "Assess respirations", sub: "Apnoea, gasping, or laboured breathing?", cue: 20 },
      { label: "Assess heart rate", sub: "Auscultate or feel umbilical cord · target HR > 100 bpm", cue: 25 },
      { label: "Assess tone and colour", sub: "Central cyanosis vs acrocyanosis · preductal SpO₂", cue: 30 },
    ],
  },
  {
    phase: "Intervene if needed (30–60 s)",
    items: [
      { label: "Begin PPV if HR < 100 or apnoeic", sub: "21% O₂ term · 21–30% preterm · 40–60 breaths/min", cue: 30 },
      { label: "Apply pulse oximeter", sub: "Right hand (preductal) · confirm SpO₂ target per NRP table", cue: 40 },
      { label: "Escalate if no improvement", sub: "Consider ETT / LMA · chest compressions if HR < 60 · call for help", cue: 60 },
    ],
  },
];

const TOTAL_STEPS = GOLDEN_MINUTE_STEPS.reduce((a, p) => a + p.items.length, 0);

// ─── InteractiveDoseCard ──────────────────────────────────────────────────────

function InteractiveDoseCard({ testid, category, title, value, unit, note }) {
  const [given, setGiven] = useState(false);
  const [givenAt, setGivenAt] = useState(null);

  const styles = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.other;

  function toggle() {
    if (!given) {
      setGiven(true);
      setGivenAt(new Date());
    } else {
      setGiven(false);
      setGivenAt(null);
    }
  }

  return (
    <div
      data-testid={testid}
      onClick={toggle}
      className={[
        "relative rounded-lg border p-4 cursor-pointer select-none transition-all duration-150",
        "bg-white dark:bg-slate-900/60",
        given
          ? "border-emerald-400 dark:border-emerald-700 ring-1 ring-emerald-300 dark:ring-emerald-800"
          : styles.border,
        given ? "opacity-60" : "hover:shadow-sm",
      ].join(" ")}
      role="button"
      aria-pressed={given}
    >
      {/* category badge */}
      <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded mb-2 ${styles.badge}`}>
        {styles.icon}
        {styles.label}
      </span>

      {/* given overlay */}
      {given && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <CheckCircle size={18} weight="fill" />
          {givenAt && (
            <span className="text-[10px] font-mono">
              {givenAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
      )}

      <p className="font-sans font-semibold text-sm text-slate-800 dark:text-slate-100 leading-tight mb-1 pr-6">
        {title}
      </p>
      <p className="font-mono text-xl font-bold text-slate-900 dark:text-white">
        {value}
        <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">{unit}</span>
      </p>
      {note && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{note}</p>
      )}

      {/* tap hint */}
      {!given && (
        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2">Tap to mark as given</p>
      )}
    </div>
  );
}

// ─── GoldenMinuteChecklist ────────────────────────────────────────────────────

function GoldenMinuteChecklist() {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [checked, setChecked] = useState(new Set());
  const [timestamps, setTimestamps] = useState({});
  const intervalRef = useRef(null);
  const elapsedRef = useRef(0);

  const pct = (secondsLeft / 60) * 100;

  const barColor =
    secondsLeft <= 10 ? "bg-red-500" :
    secondsLeft <= 20 ? "bg-amber-500" :
    "bg-emerald-500";

  const timerColor =
    secondsLeft <= 10 ? "text-red-600 dark:text-red-400" :
    secondsLeft <= 20 ? "text-amber-600 dark:text-amber-400" :
    "text-slate-900 dark:text-white";

  const start = useCallback(() => {
    if (running || finished) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [running, finished]);

  const pause = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setFinished(false);
    setSecondsLeft(60);
    setChecked(new Set());
    setTimestamps({});
    elapsedRef.current = 0;
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function toggleStep(key) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setTimestamps(t => { const n = { ...t }; delete n[key]; return n; });
      } else {
        next.add(key);
        const elapsed = 60 - secondsLeft;
        setTimestamps(t => ({ ...t, [key]: elapsed }));
      }
      return next;
    });
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  const done = checked.size;
  const completePct = Math.round((done / TOTAL_STEPS) * 100);

  let stepIdx = 0;

  return (
    <div className="space-y-4">
      {/* timer bar */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
        <div className="flex items-center gap-4">
          {/* time display */}
          <div className="flex-shrink-0 text-center w-16">
            <span className={`font-mono text-3xl font-bold tabular-nums transition-colors ${timerColor}`}>
              {formatTime(secondsLeft)}
            </span>
          </div>

          {/* progress bar */}
          <div className="flex-1">
            <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>0s</span><span>30s</span><span>60s</span>
            </div>
          </div>

          {/* controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!running && !finished && (
              <button
                onClick={start}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
              >
                <Play size={14} weight="fill" /> Start
              </button>
            )}
            {running && (
              <button
                onClick={pause}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
              >
                <Pause size={14} weight="fill" /> Pause
              </button>
            )}
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Reset"
            >
              <ArrowCounterClockwise size={14} />
            </button>
          </div>
        </div>

        {/* stat pills */}
        <div className="flex gap-3 mt-3 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {done}/{TOTAL_STEPS} steps
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {completePct}% complete
          </span>
          {finished && (
            <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold">
              Golden minute elapsed — escalate if HR &lt; 60
            </span>
          )}
          {secondsLeft === 30 && running && (
            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              30 s — assess and intervene
            </span>
          )}
        </div>
      </div>

      {/* checklist */}
      <div className="space-y-4">
        {GOLDEN_MINUTE_STEPS.map((phase) => (
          <div key={phase.phase}>
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 mb-2">
              {phase.phase}
            </p>
            <div className="space-y-1.5">
              {phase.items.map((item) => {
                const key = stepIdx;
                stepIdx++;
                const isDone = checked.has(key);
                const ts = timestamps[key];
                return (
                  <div
                    key={key}
                    onClick={() => toggleStep(key)}
                    className={[
                      "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all duration-100 select-none",
                      isDone
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 opacity-60"
                        : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
                    ].join(" ")}
                    role="checkbox"
                    aria-checked={isDone}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isDone
                        ? <CheckCircle size={18} weight="fill" className="text-emerald-500" />
                        : <Circle size={18} className="text-slate-300 dark:text-slate-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-snug ${isDone ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-100"}`}>
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{item.sub}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                      <span className="text-[10px] font-mono text-slate-400">cue {item.cue}s</span>
                      {isDone && ts !== undefined && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          done @{ts}s
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 italic">
        NRP 2020. Timer is a guide only — resuscitation decisions based on real-time HR, tone, and respirations.
      </p>
    </div>
  );
}

// ─── QuickRefHeader ───────────────────────────────────────────────────────────

function QuickRefHeader({ weight }) {
  const ettSize =
    weight < 1 ? "2.5" :
    weight < 2 ? "3.0" :
    weight < 3 ? "3.0–3.5" : "3.5";

  const adrenalineIV = (weight * 0.02).toFixed(2);
  const ettDepth = nrpETTDepth(weight);
  const uvc = uvcDepth(weight);

  const items = [
    { label: "Adrenaline IV", value: `${adrenalineIV} mg`, sub: "0.01–0.03 mg/kg · 1:10,000" },
    { label: "ETT size", value: `${ettSize} mm`, sub: "uncuffed" },
    { label: "ETT depth", value: `${ettDepth} cm`, sub: "from upper lip" },
    { label: "UVC depth", value: `${uvc} cm`, sub: "emergency low" },
    { label: "Volume expander", value: `${(weight * 10).toFixed(0)} mL`, sub: "10 mL/kg NS" },
    { label: "HR target", value: "> 100", sub: "bpm" },
  ];

  return (
    <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-700 dark:text-red-400">
          Quick ref — {weight} kg
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {items.map((item) => (
          <div key={item.label} className="bg-white dark:bg-slate-900/60 rounded-md border border-red-100 dark:border-red-900/50 px-2.5 py-2">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{item.label}</p>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white leading-tight">{item.value}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NeonatalTab ──────────────────────────────────────────────────────────────

export default function NeonatalTab() {
  const { weight } = useWeight();
  const isNeonatal = weight <= 5;

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex items-start gap-3">
        <Baby size={36} weight="fill" className="text-red-600 dark:text-red-400 flex-shrink-0" />
        <div>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight">Neonatal Resuscitation</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            NRP 2020 / Harriet Lane reference. Delivery-room flow in{" "}
            <span className="font-mono font-bold">Algorithms → Neonatal Resuscitation</span>.
          </p>
        </div>
      </div>

      {/* out-of-range warning */}
      {!isNeonatal && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-3">
          <Warning size={18} weight="fill" className="text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-800 dark:text-amber-200">
            Current weight <span className="font-mono font-bold">{weight} kg</span> is outside typical neonatal
            range (≤ 5 kg). Calculations below still use it.
          </span>
        </div>
      )}

      {/* quick-ref header bar */}
      <QuickRefHeader weight={weight} />

      {/* golden minute checklist */}
      <section>
        <h3 className="font-sans font-bold text-lg mb-1">Golden minute checklist</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Start the timer at birth. Tap each step to mark done and log the elapsed time.
        </p>
        <GoldenMinuteChecklist />
      </section>

      {/* interactive dose cards */}
      <section>
        <h3 className="font-sans font-bold text-lg mb-1">Neonate-specific calculations</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Tap a card to mark as given — a timestamp is logged automatically.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <InteractiveDoseCard testid="neo-adren-iv" category="resuscitation" title="Adrenaline IV (NRP)" value={(weight * 0.02).toFixed(2)} unit="mg (0.01–0.03 mg/kg)" note="1:10,000 · 0.1–0.3 mL/kg" />
          <InteractiveDoseCard testid="neo-adren-ett" category="resuscitation" title="Adrenaline ETT (NRP)" value={(weight * 0.075).toFixed(2)} unit="mg (0.05–0.1 mg/kg)" note="Only if no IV. 1:10,000 0.5–1 mL/kg" />
          <InteractiveDoseCard testid="neo-volume" category="fluid" title="Volume expander" value={(weight * 10).toFixed(0)} unit="mL (10 mL/kg NS)" note="Over 5–10 min IV/UVC" />
          <InteractiveDoseCard testid="neo-d10" category="fluid" title="D10W hypoglycaemia" value={(weight * 2).toFixed(0)} unit="mL (2 mL/kg)" note="Treat if glucose < 40 mg/dL" />
          <InteractiveDoseCard testid="neo-ett" category="airway" title="ETT size" value={weight < 1 ? "2.5" : weight < 2 ? "3.0" : weight < 3 ? "3.0–3.5" : "3.5"} unit="mm ID (uncuffed)" />
          <InteractiveDoseCard testid="neo-ett-depth" category="airway" title="ETT depth (6 + wt)" value={nrpETTDepth(weight)} unit="cm from upper lip" />
          <InteractiveDoseCard testid="neo-uvc" category="airway" title="UVC depth" value={uvcDepth(weight)} unit="cm (1.5×wt + 5.5)" note="Emergency low placement: 3–5 cm" />
          <InteractiveDoseCard testid="neo-phenobarb" category="anticonvulsant" title="Phenobarbital load" value={(weight * 20).toFixed(0)} unit="mg IV (20 mg/kg)" note="Neonatal seizure 1st line" />
          <InteractiveDoseCard testid="neo-caffeine" category="other" title="Caffeine citrate load" value={(weight * 20).toFixed(0)} unit="mg IV/PO (20 mg/kg)" note="Apnoea of prematurity" />
          <InteractiveDoseCard testid="neo-vitk" category="other" title="Vitamin K IM" value={weight < 1.5 ? "0.5" : "1.0"} unit="mg IM at birth" note="VKDB prophylaxis" />
        </div>
      </section>

      {/* APGAR */}
      <section>
        <h3 className="font-sans font-bold text-lg mb-3">APGAR score</h3>
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Criterion</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">0 points</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">1 point</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">2 points</th>
              </tr>
            </thead>
            <tbody>
              {APGAR_CRITERIA.map((r) => (
                <tr key={r.criterion} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                  <td className="p-3 font-bold">{r.criterion}</td>
                  <td className="p-3">{r.s0}</td>
                  <td className="p-3">{r.s1}</td>
                  <td className="p-3">{r.s2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
          {APGAR_INTERPRETATION.map((i) => (
            <div key={i.score} className={`rounded-md border px-3 py-2 ${TONE_MAP[i.tone]}`}>
              <div className="font-mono text-xs uppercase tracking-widest">Score {i.score}</div>
              <div className="font-bold text-sm mt-0.5">{i.label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Assess at 1 and 5 min. If 5-min score &lt; 7, reassess every 5 min up to 20 min. APGAR does NOT guide
          resuscitation decisions — those are based on HR, tone, respirations in real time.
        </p>
      </section>

      {/* STOPS */}
      <section data-testid="stops-section">
        <h3 className="font-sans font-bold text-lg mb-1">STOPS — Neonatal Mortality Score</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
          Bedside prognostic score on NICU admission. <strong>S</strong>ensorium · <strong>T</strong>emperature ·{" "}
          <strong>O</strong>xygenation · <strong>P</strong>erfusion · <strong>S</strong>ugar. Each scored 0–2 (total 0–10).
          Score &gt; 2 predicts mortality with ~83% accuracy. Validated for low-resource settings.
        </p>
        <Scorer definition={STOPS_SCORE} />
      </section>

      {/* neonatal vitals */}
      <section>
        <h3 className="font-sans font-bold text-lg mb-3">Neonatal normal vitals</h3>
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Parameter</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Normal</th>
                <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Red flags</th>
              </tr>
            </thead>
            <tbody>
              {NEONATAL_VITALS.map((r) => (
                <tr key={r.param} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                  <td className="p-3 font-bold">{r.param}</td>
                  <td className="p-3 font-mono">{r.awake}</td>
                  <td className="p-3 text-red-600 dark:text-red-400 text-xs">{r.alert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SpO2 targets + equipment */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-sans font-bold text-lg mb-3">Preductal SpO₂ targets (NRP)</h3>
          <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Time after birth</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Target SpO₂</th>
                </tr>
              </thead>
              <tbody>
                {SPO2_TARGETS_NRP.map((s) => (
                  <tr key={s.time} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                    <td className="p-3 font-mono">{s.time}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{s.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Right-hand pulse oximetry. Titrate FiO₂ to target.
          </p>
        </div>
        <div>
          <h3 className="font-sans font-bold text-lg mb-3">NRP equipment by weight</h3>
          <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Weight</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">ETT</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Depth</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Mask</th>
                </tr>
              </thead>
              <tbody>
                {NRP_EQUIPMENT.map((e) => (
                  <tr key={e.weight} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                    <td className="p-3 font-bold">{e.weight}</td>
                    <td className="p-3 font-mono text-emerald-700 dark:text-emerald-400">{e.ett}</td>
                    <td className="p-3 font-mono">{e.depth}</td>
                    <td className="p-3">{e.mask}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* pearls */}
      <section>
        <h3 className="font-sans font-bold text-lg mb-3">Key NRP pearls</h3>
        <ul className="space-y-2">
          {NRP_PEARLS.map((p) => (
            <li key={p} className="flex gap-3 rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/50">
              <span className="font-mono text-red-600 dark:text-red-400 text-sm font-bold">·</span>
              <span className="text-sm text-slate-700 dark:text-slate-200">{p}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="text-xs text-slate-500 dark:text-slate-400 italic">
        Source: NRP 2020 guidelines · Harriet Lane Handbook 23rd ed. · Reference only — verify with local protocols.
      </div>
    </div>
  );
}
