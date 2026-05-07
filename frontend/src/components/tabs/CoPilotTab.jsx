// CockpitTab.jsx — Resus Cockpit / Co-Pilot
// Active resuscitation decision-support: CPR timer, adrenaline intervals,
// drug log with timestamps, quick-dose strip, event log
// AHA PALS 2020/2025 · APLS 6e · ERC 2021

import { useState, useEffect, useRef, useCallback } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Play, Pause, ArrowCounterClockwise, CheckCircle, Siren,
  Drop, Pill, Lightning, Timer, ClipboardText, X, Bell,
  BellSlash, ArrowRight, Circle, SpeakerHigh, SpeakerSlash,
  Warning,
} from "@phosphor-icons/react";

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const CPR_CYCLE_SEC    = 120;  // 2 min
const ADR_INTERVAL_SEC = 210;  // 3 min 30 sec
const SHOCK_INTERVAL_SEC = 120;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmt(sec) {
  const m = Math.floor(Math.abs(sec) / 60);
  const s = Math.abs(sec) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function now() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function calcDoses(weight) {
  const w = weight;
  return {
    // ── Standard IV/IO adrenaline ──────────────────────────────────────────
    adrCardiac: {
      label:    "Adrenaline — Cardiac Arrest (IV/IO)",
      dose:     `${(w * 0.01).toFixed(2)} mg`,
      vol:      `${(w * 0.1).toFixed(1)} mL of 1:10,000`,
      route:    "IV/IO",
      interval: "Every 3–5 min",
      highlight: false,
    },

    // ── ETT adrenaline — LAST RESORT (AHA PALS 2020/2025) ─────────────────
    // Use ONLY when IV/IO cannot be established. 10× the IV dose.
    // Concentration: 1:1,000 (NOT 1:10,000). Flush 5 mL NS, 5 PPV after.
    adrETT: {
      label:    "Adrenaline — ETT Route ⚠ (last resort)",
      dose:     `${(w * 0.1).toFixed(2)} mg`,
      vol:      `${(w * 0.1).toFixed(1)} mL of 1:1,000  +  5 mL NS flush`,
      route:    "ETT",
      interval: "Every 3–5 min · then 5 PPV · stop compressions during delivery",
      highlight: true,   // rendered differently — red warning styling
      warning:  "Use 1:1,000 concentration (NOT 1:10,000). Dose is 10× IV dose. Poor absorption — establish IV/IO ASAP. AHA 2025: IV/IO always preferred.",
    },

    // ── Anaphylaxis ────────────────────────────────────────────────────────
    adrAnaphylax: {
      label:    "Adrenaline — Anaphylaxis",
      dose:     `${Math.min((w * 0.01).toFixed(2), 0.5)} mg`,
      vol:      `${Math.min((w * 0.01).toFixed(2), 0.5)} mL of 1:1,000`,
      route:    "IM",
      interval: "Repeat at 5 min PRN",
    },

    // ── Others ────────────────────────────────────────────────────────────
    atropine: {
      label:    "Atropine",
      dose:     `${Math.max((w * 0.02).toFixed(2), 0.1)} mg (min 0.1)`,
      vol:      `${Math.max((w * 0.02).toFixed(2), 0.1)} mL of 1 mg/mL`,
      route:    "IV/IO",
      interval: "Once; repeat × 1",
    },
    bicarb: {
      label:    "Sodium Bicarbonate 8.4%",
      dose:     `${(w * 1).toFixed(0)} mL`,
      vol:      `${(w * 1).toFixed(0)} mL neat`,
      route:    "IV/IO slow",
      interval: "After 2nd adrenaline",
    },
    calcium: {
      label:    "Calcium Chloride 10%",
      dose:     `${(w * 0.2).toFixed(1)} mL`,
      vol:      `${(w * 0.2).toFixed(1)} mL`,
      route:    "IV/IO slow",
      interval: "PRN (hypoCa, CCB OD)",
    },
    glucose10: {
      label:    "Glucose 10%",
      dose:     `${(w * 2).toFixed(0)} mL`,
      vol:      `${(w * 2).toFixed(0)} mL`,
      route:    "IV/IO",
      interval: "For hypoglycaemia",
    },
    adenosine: {
      label:    "Adenosine (SVT)",
      dose:     `${Math.min((w * 0.1).toFixed(1), 6)} mg`,
      vol:      `${Math.min((w * 0.1).toFixed(1), 6)} mL of 3 mg/mL`,
      route:    "IV rapid",
      interval: "Repeat 0.2 mg/kg (max 12 mg)",
    },
    defib: {
      label:    "Defibrillation",
      dose:     `${(w * 4).toFixed(0)} J`,
      vol:      `Max ${Math.min(w * 10, 360).toFixed(0)} J`,
      route:    "Non-sync",
      interval: "After every 2 min CPR",
    },
    cardioversion: {
      label:    "Cardioversion (Sync)",
      dose:     `${(w * 1).toFixed(0)} J`,
      vol:      `Escalate to ${(w * 2).toFixed(0)} J`,
      route:    "Sync",
      interval: "Conscious sedation first",
    },
    midazolam: {
      label:    "Midazolam (Seizure)",
      dose:     `${(w * 0.2).toFixed(2)} mg`,
      vol:      `${(w * 0.2).toFixed(2)} mL buccal/IN`,
      route:    "IN/buccal/IV",
      interval: "Phase 1 (0–5 min)",
    },
  };
}

// ─── AUDIO ALERT HOOK ─────────────────────────────────────────────────────────
function useAudioAlert(alertsEnabled, voiceEnabled) {
  const ctxRef = useRef(null);

  const unlockAudio = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
  }, []);

  const beep = useCallback((freq = 880, dur = 0.2, vol = 0.4, type = "sine") => {
    if (!alertsEnabled) return;
    try {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);
    } catch (e) { console.warn("Audio error:", e); }
  }, [alertsEnabled]);

  const speak = useCallback((text) => {
    if (!alertsEnabled || !voiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05; u.pitch = 1; u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (e) { console.warn("Speech error:", e); }
  }, [alertsEnabled, voiceEnabled]);

  const alertCpr = useCallback(() => {
    beep(660, 0.15, 0.5, "sine");
    setTimeout(() => beep(660, 0.15, 0.5, "sine"), 220);
    setTimeout(() => beep(880, 0.35, 0.5, "sine"), 460);
    setTimeout(() => speak("Check rhythm and pulse"), 500);
  }, [beep, speak]);

  const alertAdrenaline = useCallback(() => {
    [0, 160, 320, 480].forEach(t => setTimeout(() => beep(1100, 0.12, 0.45, "square"), t));
    setTimeout(() => speak("Adrenaline due now"), 700);
  }, [beep, speak]);

  const alertAdrenalineSoon = useCallback(() => {
    beep(880, 0.15, 0.3, "sine");
    setTimeout(() => beep(880, 0.15, 0.3, "sine"), 250);
    setTimeout(() => speak("Adrenaline in one minute"), 400);
  }, [beep, speak]);

  const alertShock = useCallback(() => {
    beep(440, 0.12, 0.4, "triangle");
    setTimeout(() => beep(550, 0.12, 0.4, "triangle"), 140);
    setTimeout(() => beep(660, 0.4,  0.4, "triangle"), 280);
    setTimeout(() => speak("Shock delivered. Resume CPR immediately."), 500);
  }, [beep, speak]);

  const alertStart = useCallback(() => {
    beep(660, 0.1, 0.3, "sine");
    setTimeout(() => beep(880, 0.25, 0.35, "sine"), 150);
    setTimeout(() => speak("Resuscitation started"), 300);
  }, [beep, speak]);

  return { unlockAudio, alertCpr, alertAdrenaline, alertAdrenalineSoon, alertShock, alertStart };
}

// ─── CIRCLE TIMER SVG ─────────────────────────────────────────────────────────
function CircleTimer({ elapsed, total, color = "#3b82f6", label, size = 120 }) {
  const r    = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(elapsed / total, 1);
  const dash = circ * (1 - pct);
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor"
        className="text-slate-100 dark:text-slate-800" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={dash}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset 1s linear" }} />
      <text x={size/2} y={size/2 - 6} textAnchor="middle" fontSize="18"
        fontFamily="monospace" fontWeight="700" fill="currentColor"
        className="text-slate-900 dark:text-white">{fmt(total - elapsed)}</text>
      <text x={size/2} y={size/2 + 12} textAnchor="middle" fontSize="9"
        fontFamily="monospace" fill="#64748b">{label}</text>
    </svg>
  );
}

// ─── LOG ENTRY ─────────────────────────────────────────────────────────────────
function LogEntry({ entry, onDelete }) {
  return (
    <div className="flex items-start gap-2 text-xs border-b border-slate-100 dark:border-slate-800 py-1.5">
      <span className="font-mono text-slate-400 flex-shrink-0 tabular-nums">{entry.time}</span>
      <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1 ${
        entry.type === "drug"  ? "bg-blue-500"
        : entry.type === "ett" ? "bg-orange-500"
        : entry.type === "shock" ? "bg-red-500"
        : entry.type === "cpr"   ? "bg-emerald-500"
        : "bg-slate-400"
      }`} />
      <span className="text-slate-700 dark:text-slate-200 flex-1">{entry.text}</span>
      <button onClick={() => onDelete(entry.id)}
        className="text-slate-300 dark:text-slate-600 hover:text-red-400 flex-shrink-0">
        <X size={10} weight="bold" />
      </button>
    </div>
  );
}

// ─── DOSE CARD ─────────────────────────────────────────────────────────────────
function DoseCard({ drug, onLog }) {
  // ETT adrenaline gets a distinct red-bordered warning card
  if (drug.highlight) {
    return (
      <div className="rounded-xl border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/20 p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="font-bold text-xs text-orange-800 dark:text-orange-200 leading-tight"
               style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
            {drug.label}
          </div>
          <span className="text-[9px] font-mono text-orange-600 dark:text-orange-400 flex-shrink-0 border border-orange-300 dark:border-orange-700 rounded px-1.5 py-0.5">
            {drug.route}
          </span>
        </div>
        <div className="font-black text-xl text-orange-600 dark:text-orange-400 leading-none mb-0.5"
             style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          {drug.dose}
        </div>
        <div className="text-[10px] font-mono text-orange-700 dark:text-orange-300 mb-1">{drug.vol}</div>
        <div className="text-[10px] text-orange-600 dark:text-orange-400 font-mono mb-2">{drug.interval}</div>
        {drug.warning && (
          <div className="flex items-start gap-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 px-2 py-1.5 mb-2">
            <Warning size={9} weight="fill" className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <span className="text-[9px] font-mono text-orange-700 dark:text-orange-300 leading-relaxed">
              {drug.warning}
            </span>
          </div>
        )}
        <button
          onClick={() => onLog(drug.label, drug.dose, drug.route, "ett")}
          className="w-full flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-widest py-1.5 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200 transition-all">
          <CheckCircle size={10} weight="fill" /> Log ETT dose
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="font-bold text-xs text-slate-800 dark:text-white leading-tight"
             style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          {drug.label}
        </div>
        <span className="text-[9px] font-mono text-slate-400 flex-shrink-0 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
          {drug.route}
        </span>
      </div>
      <div className="font-black text-xl text-blue-600 dark:text-blue-400 leading-none mb-0.5"
           style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
        {drug.dose}
      </div>
      <div className="text-[10px] font-mono text-slate-400 mb-1">{drug.vol}</div>
      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mb-2">{drug.interval}</div>
      <button
        onClick={() => onLog(drug.label, drug.dose, drug.route, "drug")}
        className="w-full flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-widest py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-all">
        <CheckCircle size={10} weight="fill" /> Log dose
      </button>
    </div>
  );
}

// ─── 5H5T PANEL ───────────────────────────────────────────────────────────────
// AHA PALS 2020/2025: 5H + 5T (not 4H4T — paediatric PALS uses this set)
function FiveHFiveTPanel() {
  const H5 = [
    { h: "Hypoxia",               action: "100% O₂, optimise airway, check ETT position + bilateral breath sounds, ETCO₂" },
    { h: "Hypovolaemia",          action: "10–20 mL/kg NS/blood IV/IO bolus — consider haemorrhage, fluid losses, sepsis" },
    { h: "Hydrogen ion (Acidosis)",action: "Blood gas — HCO₃⁻ 1 mEq/kg slow IV/IO if pH <7.1 and prolonged arrest" },
    { h: "Hypo/Hyperkalaemia",    action: "ECG, electrolytes — CaCl 20 mg/kg IV for hyperkalaemia; KCl if severe hypokalaemia" },
    { h: "Hypothermia",           action: "Core temp — active re-warming; continue CPR until temp ≥30°C" },
  ];
  const T5 = [
    { t: "Tension Pneumothorax",  action: "Needle decompression 2nd ICS MCL or 4–5th ICS AAL immediately — don't wait for CXR" },
    { t: "Tamponade (cardiac)",   action: "FAST exam — pericardiocentesis 18G subxiphoid approach under US guidance" },
    { t: "Toxins",                action: "History, tox screen — naloxone 0.01 mg/kg IV/IO for opioids; specific antidotes per agent" },
    { t: "Thrombosis (PE/CA)",    action: "Suspect if no response + risk factors — thrombolytics (alteplase 0.5–1 mg/kg); ECMO" },
    { t: "Trauma",                action: "Control haemorrhage, tension pneumo, pericardial tamponade; damage control resuscitation" },
  ];

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
        <Warning size={13} weight="fill" className="text-amber-600 dark:text-amber-400" />
        <span className="font-bold text-xs text-amber-700 dark:text-amber-300 uppercase tracking-widest font-mono">
          Reversible Causes — 5H &amp; 5T (AHA PALS 2020/2025)
        </span>
      </div>
      <div className="p-4 grid sm:grid-cols-2 gap-3">
        {/* 5H */}
        <div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">5H</div>
          <div className="space-y-2">
            {H5.map(({ h, action }) => (
              <div key={h} className="rounded-lg bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900 px-3 py-2">
                <div className="font-bold text-[11px] text-amber-800 dark:text-amber-200">{h}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono leading-relaxed">{action}</div>
              </div>
            ))}
          </div>
        </div>
        {/* 5T */}
        <div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">5T</div>
          <div className="space-y-2">
            {T5.map(({ t, action }) => (
              <div key={t} className="rounded-lg bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900 px-3 py-2">
                <div className="font-bold text-[11px] text-amber-800 dark:text-amber-200">{t}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono leading-relaxed">{action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 pb-3 text-[9px] font-mono text-amber-500 dark:text-amber-600">
        Check at every rhythm review. Treat simultaneously — do not interrupt high-quality CPR to investigate.
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function CockpitTab() {
  const { weight } = useWeight();
  const doses = calcDoses(weight);

  const [resusRunning, setResusRunning] = useState(false);
  const [resusElapsed, setResusElapsed] = useState(0);
  const [alerts, setAlerts]             = useState(true);
  const [voice,  setVoice]              = useState(true);

  const [cprElapsed, setCprElapsed] = useState(0);
  const [cprCycles,  setCprCycles]  = useState(0);

  const [adrSince, setAdrSince] = useState(null);
  const [adrCount, setAdrCount] = useState(0);
  const adrWarnedRef = useRef(false);

  const [shockCount,   setShockCount]   = useState(0);
  const [shockElapsed, setShockElapsed] = useState(0);

  const [log,           setLog]           = useState([]);
  const [activeSection, setActiveSection] = useState("cockpit");
  // Show 5H5T panel toggle
  const [show5H5T, setShow5H5T] = useState(false);

  const intervalRef     = useRef(null);
  const resusElapsedRef = useRef(resusElapsed);
  const adrSinceRef     = useRef(adrSince);
  useEffect(() => { resusElapsedRef.current = resusElapsed; }, [resusElapsed]);
  useEffect(() => { adrSinceRef.current     = adrSince;     }, [adrSince]);

  const { unlockAudio, alertCpr, alertAdrenaline, alertAdrenalineSoon, alertShock, alertStart } =
    useAudioAlert(alerts, voice);

  const adrDue     = adrSince !== null ? Math.max(0, ADR_INTERVAL_SEC - (resusElapsed - adrSince)) : null;
  const adrOverdue = adrDue === 0;

  const addEvent = useCallback((text, type = "event") => {
    setLog(p => [{ id: Date.now() + Math.random(), time: now(), text, type }, ...p]);
  }, []);

  const tick = useCallback(() => {
    setResusElapsed(p => p + 1);

    setCprElapsed(p => {
      const next = p + 1;
      if (next >= CPR_CYCLE_SEC) {
        setCprCycles(c => c + 1);
        addEvent("CPR cycle complete — check rhythm & pulse", "cpr");
        alertCpr();
        return 0;
      }
      return next;
    });

    setShockElapsed(p => p + 1);

    const elapsed = resusElapsedRef.current + 1;
    const since   = adrSinceRef.current;
    if (since !== null) {
      const timeSince = elapsed - since;
      if (timeSince === ADR_INTERVAL_SEC - 60 && !adrWarnedRef.current) {
        adrWarnedRef.current = true;
        alertAdrenalineSoon();
      }
      if (timeSince === ADR_INTERVAL_SEC) {
        adrWarnedRef.current = false;
        alertAdrenaline();
      }
    }
  }, [addEvent, alertCpr, alertAdrenaline, alertAdrenalineSoon]);

  useEffect(() => {
    if (resusRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [resusRunning, tick]);

  function startResus() {
    unlockAudio();
    setResusRunning(true);
    setResusElapsed(0);
    setCprElapsed(0);
    setCprCycles(0);
    setAdrSince(null);
    setAdrCount(0);
    setShockCount(0);
    setShockElapsed(0);
    setLog([]);
    adrWarnedRef.current = false;
    addEvent("Resuscitation started", "event");
    setTimeout(() => alertStart(), 200);
  }

  // Accept optional logType so ETT doses get orange dot
  function logDrug(label, dose, route, logType = "drug") {
    addEvent(`${label} — ${dose} ${route}`, logType);
    // Only IV/IO adrenaline resets the interval timer
    if (label.includes("Adrenaline") && label.includes("IV/IO")) {
      setAdrSince(resusElapsedRef.current);
      setAdrCount(c => c + 1);
      adrWarnedRef.current = false;
    }
  }

  function logShock(joules) {
    setShockCount(c => c + 1);
    setShockElapsed(0);
    addEvent(`Shock delivered — ${joules} J (shock #${shockCount + 1})`, "shock");
    alertShock();
  }

  function resetCpr() {
    setCprElapsed(0);
    addEvent("CPR rhythm check — cycle reset", "cpr");
  }

  function deleteLog(id) {
    setLog(p => p.filter(e => e.id !== id));
  }

  function exportLog() {
    const header  = `PedResus Resuscitation Log\nPatient weight: ${weight} kg\nExported: ${new Date().toLocaleString()}\n${"─".repeat(50)}\n`;
    const entries = [...log].reverse().map(e => `[${e.time}] ${e.text}`).join("\n");
    const blob    = new Blob([header + entries], { type: "text/plain" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href        = url;
    a.download    = `resus-log-${weight}kg-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const defibDose = Math.round(weight * 4);
  const defibMax  = Math.min(weight * 10, 360);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Resus Cockpit
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Active resuscitation co-pilot · {weight} kg · AHA PALS 2020/2025 · APLS 6e · ERC 2021
        </p>
      </div>

      {/* ── MASTER CONTROL BAR ─────────────────────────────────────────────── */}
      <div className={`rounded-xl border-2 p-4 ${
        resusRunning
          ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30"
          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {!resusRunning ? (
              <button onClick={startResus}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all"
                style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                <Siren size={16} weight="fill" /> Start Resuscitation
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setResusRunning(p => !p)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-mono text-xs hover:bg-slate-50 transition-all">
                  {resusRunning ? <Pause size={13} weight="fill" /> : <Play size={13} weight="fill" />}
                  {resusRunning ? "Pause" : "Resume"}
                </button>
                <button onClick={startResus}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-700 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 font-mono text-xs hover:bg-red-50 transition-all">
                  <ArrowCounterClockwise size={13} weight="bold" /> Reset
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {resusRunning && (
              <div className="font-mono text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                {fmt(resusElapsed)}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <button onClick={() => setAlerts(p => !p)}
                title={alerts ? "Mute beeps" : "Unmute beeps"}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-wider transition-all ${
                  alerts
                    ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400"
                }`}>
                {alerts ? <Bell size={11} weight="fill" /> : <BellSlash size={11} weight="fill" />}
                <span className="hidden sm:inline">{alerts ? "Beeps" : "Muted"}</span>
              </button>
              <button onClick={() => setVoice(p => !p)}
                title={voice ? "Mute voice" : "Unmute voice"}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-wider transition-all ${
                  voice
                    ? "border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400"
                }`}>
                {voice ? <SpeakerHigh size={11} weight="fill" /> : <SpeakerSlash size={11} weight="fill" />}
                <span className="hidden sm:inline">{voice ? "Voice" : "Silent"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Adrenaline alerts */}
        {resusRunning && adrOverdue && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-600 text-white px-3 py-2 text-xs font-bold animate-pulse">
            <Bell size={12} weight="fill" />
            ADRENALINE DUE —{" "}
            {adrCount === 0 ? "First dose not yet given" : `Last given ${fmt(resusElapsed - adrSince)} ago`}
          </div>
        )}
        {resusRunning && adrDue !== null && adrDue > 0 && adrDue <= 60 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500 text-white px-3 py-2 text-xs font-bold">
            <Bell size={12} weight="fill" /> Adrenaline due in {fmt(adrDue)}
          </div>
        )}

        {!resusRunning && (
          <div className="mt-3 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
            <Bell size={10} />
            Audio:{" "}
            <span className={alerts ? "text-blue-500" : "text-slate-400"}>{alerts ? "beeps on" : "beeps off"}</span>
            {" · "}
            <span className={voice ? "text-violet-500" : "text-slate-400"}>{voice ? "voice on" : "voice off"}</span>
            {" — toggle above before starting"}
          </div>
        )}
      </div>

      {/* ── SUB-NAV ────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "cockpit", label: "Timers"                    },
          { id: "drugs",   label: "Quick Drugs"               },
          { id: "log",     label: `Event Log (${log.length})` },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`px-3 py-2 rounded-lg border font-mono text-[11px] uppercase tracking-wider transition-all ${
              activeSection === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{s.label}</button>
        ))}
      </div>

      {/* ── TIMERS ─────────────────────────────────────────────────────────── */}
      {activeSection === "cockpit" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* CPR cycle */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col items-center gap-2">
              <CircleTimer elapsed={cprElapsed} total={CPR_CYCLE_SEC} color="#10b981" label="CPR cycle" size={110} />
              <div className="text-[9px] font-mono text-slate-400">Cycle #{cprCycles + 1}</div>
              <button onClick={resetCpr} disabled={!resusRunning}
                className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 disabled:opacity-40 transition-all">
                Check pulse
              </button>
            </div>

            {/* Adrenaline timer */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col items-center gap-2">
              <CircleTimer
                elapsed={adrSince !== null ? resusElapsed - adrSince : 0}
                total={ADR_INTERVAL_SEC}
                color={adrOverdue ? "#dc2626" : "#3b82f6"}
                label="Adrenaline" size={110} />
              <div className="text-[9px] font-mono text-slate-400">
                {adrCount === 0 ? "Not yet given" : `Given ×${adrCount}`}
              </div>
              <button
                onClick={() => logDrug("Adrenaline — Cardiac Arrest (IV/IO)", `${(weight * 0.01).toFixed(2)} mg`, "IV/IO", "drug")}
                disabled={!resusRunning}
                className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 disabled:opacity-40 transition-all">
                Log adrenaline
              </button>
            </div>

            {/* Post-shock timer */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col items-center gap-2">
              <CircleTimer elapsed={shockElapsed} total={SHOCK_INTERVAL_SEC} color="#8b5cf6" label="Post-shock" size={110} />
              <div className="text-[9px] font-mono text-slate-400">
                {shockCount === 0 ? "No shocks given" : `Shocks ×${shockCount}`}
              </div>
              <button onClick={() => logShock(defibDose)} disabled={!resusRunning}
                className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 disabled:opacity-40 transition-all">
                Log shock
              </button>
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
              <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Session</div>
              {[
                { label: "CPR cycles",    val: cprCycles,  color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Adrenaline ×",  val: adrCount,   color: "text-blue-600 dark:text-blue-400"       },
                { label: "Shocks ×",      val: shockCount, color: "text-violet-600 dark:text-violet-400"   },
                { label: "Events logged", val: log.length, color: "text-slate-600 dark:text-slate-300"     },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">{s.label}</span>
                  <span className={`font-black text-lg leading-none ${s.color}`}
                        style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Defib strip */}
          <div className="rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-violet-500 mb-1">
                  Defibrillation — {weight} kg
                </div>
                <div className="font-black text-3xl text-violet-700 dark:text-violet-300"
                     style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                  {defibDose} J{" "}
                  <span className="text-sm font-normal text-violet-400">/ max {Math.round(defibMax)} J</span>
                </div>
                <div className="text-xs text-violet-500 font-mono mt-0.5">
                  4 J/kg · Non-sync · After every 2 min CPR
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-mono text-violet-400 mb-1">Sync cardioversion</div>
                <div className="font-black text-xl text-violet-600 dark:text-violet-400"
                     style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                  {Math.round(weight * 1)} J → {Math.round(weight * 2)} J
                </div>
                <div className="text-[9px] font-mono text-violet-400">0.5–2 J/kg escalating</div>
              </div>
            </div>
          </div>

          {/* Post-ROSC */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-4">
            <div className="font-bold text-xs text-emerald-700 dark:text-emerald-300 mb-2 uppercase tracking-widest font-mono">
              Post-ROSC Targets
            </div>
            <div className="grid sm:grid-cols-2 gap-1 text-xs">
              {[
                "SpO₂ 94–99% — avoid hyperoxia",
                "ETCO₂ 35–40 mmHg — avoid hyperventilation",
                `SBP ≥${Math.round(70 + Math.max(0, (weight - 9) / 2) * 2)} mmHg (age-appropriate)`,
                "BGL 5–10 mmol/L — treat hypoglycaemia",
                "Temperature 36–37.5°C — avoid fever",
                "12-lead ECG + CXR immediately",
                "Vasopressors if SBP target not met",
                "ICU/PICU referral for post-resus care",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-1.5 text-emerald-800 dark:text-emerald-200">
                  <ArrowRight size={9} weight="bold" className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* 5H5T — collapsible */}
          <div>
            <button
              onClick={() => setShow5H5T(p => !p)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-all">
              <div className="flex items-center gap-2">
                <Warning size={13} weight="fill" className="text-amber-600 dark:text-amber-400" />
                <span className="font-bold text-xs text-amber-700 dark:text-amber-300 uppercase tracking-widest font-mono">
                  Reversible Causes — 5H &amp; 5T
                </span>
              </div>
              <span className="text-amber-500 text-[10px] font-mono">
                {show5H5T ? "▲ hide" : "▼ show"}
              </span>
            </button>
            {show5H5T && (
              <div className="mt-2">
                <FiveHFiveTPanel />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── QUICK DRUGS ────────────────────────────────────────────────────── */}
      {activeSection === "drugs" && (
        <div className="space-y-4">
          {/* ETT adrenaline warning banner */}
          <div className="flex items-start gap-2 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 px-3 py-2.5 text-xs text-orange-700 dark:text-orange-300">
            <Warning size={13} weight="fill" className="flex-shrink-0 mt-0.5 text-orange-500" />
            <div>
              <strong>ETT adrenaline</strong> — last resort only. Establish IV/IO within 90 seconds.
              ETT absorption is unreliable during CPR (limited pulmonary blood flow).
              IV/IO route is always preferred (AHA PALS 2025).
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            All doses calculated for {weight} kg — tap "Log dose" to add to event log
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(doses).map(drug => (
              <DoseCard key={drug.label} drug={drug} onLog={logDrug} />
            ))}
          </div>
        </div>
      )}

      {/* ── EVENT LOG ──────────────────────────────────────────────────────── */}
      {activeSection === "log" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              {log.length === 0 ? "No events yet — start resuscitation" : `${log.length} events`}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => addEvent("Manual note — edit as needed", "event")}
                className="text-[10px] font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 transition-all">
                + Note
              </button>
              {log.length > 0 && (
                <button onClick={exportLog}
                  className="text-[10px] font-mono px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition-all">
                  Export log
                </button>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 max-h-[500px] overflow-y-auto">
            {log.length === 0 ? (
              <div className="text-center text-slate-400 text-xs font-mono py-8">
                Events appear here as the resus progresses
              </div>
            ) : (
              log.map(entry => <LogEntry key={entry.id} entry={entry} onDelete={deleteLog} />)
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] font-mono text-slate-400">
            {[
              { color: "bg-blue-500",    label: "Drug (IV/IO)"     },
              { color: "bg-orange-500",  label: "ETT drug"         },
              { color: "bg-red-500",     label: "Shock / Defib"    },
              { color: "bg-emerald-500", label: "CPR event"        },
              { color: "bg-slate-400",   label: "Clinical event"   },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${l.color}`} /> {l.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        AHA PALS 2020/2025 · APLS 6e · ERC 2021 ·
        ETT epinephrine: 0.1 mg/kg 1:1,000 · 5H5T reversible causes ·
        Always verify against local protocols
      </div>
    </div>
  );
}
