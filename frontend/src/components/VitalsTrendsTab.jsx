// VitalsTrendTab.jsx — Live Vitals Trending + Patient Record
// Manual vitals entry with sparkline trending, age-specific normal ranges,
// patient details form, and exportable PDF-ready summary
// Uses recharts (already in app dependencies)

import { useState, useMemo } from "react";
import { useWeight } from "../../context/WeightContext";
import {
  Warning, ArrowRight, Download, Plus, Trash, User,
  Heartbeat, Pulse, Thermometer, Drop,
} from "@phosphor-icons/react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

// ─── NORMAL RANGES BY AGE ──────────────────────────────────────────────────────
function getNormals(ageYears) {
  if (ageYears < 0.08)  return { hr: [100,160], rr: [30,60], sbp: [60,90],  dbp: [30,60],  spo2: [94,100], temp: [36.5,37.5] };
  if (ageYears < 1)     return { hr: [100,160], rr: [25,50], sbp: [70,100], dbp: [40,65],  spo2: [94,100], temp: [36.5,37.5] };
  if (ageYears < 3)     return { hr: [90,150],  rr: [20,40], sbp: [80,110], dbp: [45,70],  spo2: [95,100], temp: [36.5,37.5] };
  if (ageYears < 6)     return { hr: [80,140],  rr: [20,30], sbp: [80,112], dbp: [45,72],  spo2: [95,100], temp: [36.5,37.5] };
  if (ageYears < 12)    return { hr: [70,120],  rr: [18,25], sbp: [90,120], dbp: [55,80],  spo2: [95,100], temp: [36.5,37.5] };
  return                       { hr: [60,100],  rr: [12,20], sbp: [100,130],dbp: [60,85],  spo2: [95,100], temp: [36.5,37.5] };
}

function isAbnormal(val, range) {
  if (val === null || val === "" || isNaN(Number(val))) return false;
  return Number(val) < range[0] || Number(val) > range[1];
}

function now() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function nowFull() {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const VITALS = [
  { key: "hr",   label: "Heart Rate",   unit: "bpm",   color: "#ef4444", icon: Heartbeat },
  { key: "rr",   label: "Resp Rate",    unit: "/min",  color: "#3b82f6", icon: Pulse     },
  { key: "sbp",  label: "SBP",          unit: "mmHg",  color: "#8b5cf6", icon: Pulse     },
  { key: "dbp",  label: "DBP",          unit: "mmHg",  color: "#a78bfa", icon: Pulse     },
  { key: "spo2", label: "SpO₂",         unit: "%",     color: "#10b981", icon: Drop      },
  { key: "temp", label: "Temperature",  unit: "°C",    color: "#f59e0b", icon: Thermometer},
];

// ─── CUSTOM TOOLTIP ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs shadow-lg">
      <div className="font-mono text-slate-400 mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function VitalsTrendTab() {
  const { weight } = useWeight();

  // ── Patient details ──
  const [patient, setPatient] = useState({
    name: "", age: "", ageUnit: "years", weight: weight, diagnosis: "", mrn: "", ward: "",
  });

  // Sync weight from context when it changes
  useMemo(() => {
    setPatient(p => ({ ...p, weight }));
  }, [weight]);

  // ── Vitals entries ──
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ hr: "", rr: "", sbp: "", dbp: "", spo2: "", temp: "", notes: "" });
  const [activeChart, setActiveChart] = useState("hr");
  const [activeSection, setActiveSection] = useState("chart");

  const ageYears = useMemo(() => {
    const n = parseFloat(patient.age);
    if (isNaN(n)) return 5;
    return patient.ageUnit === "months" ? n / 12 : n;
  }, [patient.age, patient.ageUnit]);

  const normals = useMemo(() => getNormals(ageYears), [ageYears]);

  function addEntry() {
    const entry = {
      id:   Date.now(),
      time: now(),
      timestamp: Date.now(),
      ...Object.fromEntries(
        Object.keys(form).map(k => [k, form[k] === "" ? null : (k === "notes" ? form[k] : parseFloat(form[k]) || null)])
      ),
    };
    setEntries(p => [...p, entry]);
    setForm({ hr: "", rr: "", sbp: "", dbp: "", spo2: "", temp: "", notes: "" });
  }

  function deleteEntry(id) {
    setEntries(p => p.filter(e => e.id !== id));
  }

  // Check if any field has a value
  const hasData = Object.values(form).some(v => v !== "");

  // Latest entry
  const latest = entries[entries.length - 1];

  function exportCSV() {
    const header = [
      `PedResus Vitals Export`,
      `Patient: ${patient.name || "Unknown"}  |  Age: ${patient.age} ${patient.ageUnit}  |  Weight: ${patient.weight} kg`,
      `Diagnosis: ${patient.diagnosis || "—"}  |  MRN: ${patient.mrn || "—"}  |  Ward: ${patient.ward || "—"}`,
      `Exported: ${nowFull()}`,
      ``,
      `Time,HR (bpm),RR (/min),SBP (mmHg),DBP (mmHg),SpO₂ (%),Temp (°C),Notes`,
    ].join("\n");
    const rows = entries.map(e =>
      [e.time, e.hr??'', e.rr??'', e.sbp??'', e.dbp??'', e.spo2??'', e.temp??'', e.notes??''].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `vitals-${(patient.name || "patient").replace(/\s+/g,"-")}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportText() {
    const lines = [
      "═══════════════════════════════════════════════",
      "        VITALS TREND — PedResus",
      "═══════════════════════════════════════════════",
      `Patient : ${patient.name || "Unknown"}`,
      `Age     : ${patient.age} ${patient.ageUnit}`,
      `Weight  : ${patient.weight} kg`,
      `MRN     : ${patient.mrn || "—"}`,
      `Ward    : ${patient.ward || "—"}`,
      `Dx      : ${patient.diagnosis || "—"}`,
      `Printed : ${nowFull()}`,
      "───────────────────────────────────────────────",
      "Time   | HR  | RR  | SBP | DBP | SpO₂| Temp | Notes",
      "───────────────────────────────────────────────",
      ...entries.map(e =>
        `${e.time.padEnd(6)} | ${String(e.hr??'—').padEnd(3)} | ${String(e.rr??'—').padEnd(3)} | ${String(e.sbp??'—').padEnd(3)} | ${String(e.dbp??'—').padEnd(3)} | ${String(e.spo2??'—').padEnd(4)}| ${String(e.temp??'—').padEnd(5)}| ${e.notes||''}`
      ),
      "═══════════════════════════════════════════════",
      "Clinical reference only. Verify against institutional protocols.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `vitals-${(patient.name || "patient").replace(/\s+/g,"-")}-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeVital = VITALS.find(v => v.key === activeChart);
  const chartData = entries.map(e => ({ time: e.time, [activeChart]: e[activeChart] })).filter(e => e[activeChart] !== null);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-2xl text-slate-900 dark:text-white mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
          Vitals Trending
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Serial vitals with age-appropriate ranges · exportable patient record
        </p>
      </div>

      {/* SUB-NAV */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "chart",   label: "Chart & Entry" },
          { id: "patient", label: "Patient Details" },
          { id: "table",   label: `All Readings (${entries.length})` },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`px-3 py-2 rounded-lg border font-mono text-[11px] uppercase tracking-wider transition-all ${
              activeSection === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}>{s.label}</button>
        ))}
        {entries.length > 0 && (
          <div className="flex gap-1.5 ml-auto">
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-mono text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all">
              <Download size={11} weight="bold" /> CSV
            </button>
            <button onClick={exportText}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 font-mono text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
              <Download size={11} weight="bold" /> Text
            </button>
          </div>
        )}
      </div>

      {/* ── PATIENT DETAILS ── */}
      {activeSection === "patient" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={14} className="text-slate-400" />
            <span className="font-bold text-sm text-slate-900 dark:text-white"
                  style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>Patient Details</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: "name",      label: "Patient Name",  placeholder: "Full name",           type: "text" },
              { key: "mrn",       label: "MRN / UR No.",  placeholder: "Hospital ID",          type: "text" },
              { key: "diagnosis", label: "Diagnosis",     placeholder: "Working diagnosis",    type: "text" },
              { key: "ward",      label: "Ward / Location",placeholder: "ED / PICU / Ward 4", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={patient[f.key]}
                  onChange={e => setPatient(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                />
              </div>
            ))}
            {/* Age with unit selector */}
            <div>
              <label className="block font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">Age</label>
              <div className="flex gap-2">
                <input
                  type="number" min="0" placeholder="0"
                  value={patient.age}
                  onChange={e => setPatient(p => ({ ...p, age: e.target.value }))}
                  className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <select
                  value={patient.ageUnit}
                  onChange={e => setPatient(p => ({ ...p, ageUnit: e.target.value }))}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none">
                  <option value="years">years</option>
                  <option value="months">months</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">Weight (kg)</label>
              <input
                type="number" min="0" step="0.1"
                value={patient.weight}
                onChange={e => setPatient(p => ({ ...p, weight: e.target.value }))}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── CHART + ENTRY ── */}
      {activeSection === "chart" && (
        <div className="space-y-4">
          {/* Current vitals strip */}
          {latest && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {VITALS.map(v => {
                const val  = latest[v.key];
                const abnl = val !== null && isAbnormal(val, normals[v.key]);
                return (
                  <div key={v.key}
                    onClick={() => setActiveChart(v.key)}
                    className={`rounded-xl border p-2.5 cursor-pointer transition-all ${
                      activeChart === v.key
                        ? "border-2 bg-slate-50 dark:bg-slate-800"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    } ${abnl ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20" : ""}`}
                    style={{ borderColor: activeChart === v.key ? v.color : undefined }}>
                    <div className="font-mono text-[8px] uppercase tracking-widest text-slate-400 mb-0.5">{v.label}</div>
                    <div className={`font-black text-lg leading-none ${abnl ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}
                         style={{ fontFamily: '"Chivo", system-ui, sans-serif', color: abnl ? undefined : v.color }}>
                      {val ?? "—"}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">{v.unit}</div>
                    {abnl && <div className="text-[8px] text-red-500 font-bold mt-0.5">↑↓ ABNL</div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Chart selector */}
          <div className="flex flex-wrap gap-1.5">
            {VITALS.map(v => (
              <button key={v.key} onClick={() => setActiveChart(v.key)}
                className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all ${
                  activeChart === v.key
                    ? "text-white border-transparent"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                }`}
                style={{ backgroundColor: activeChart === v.key ? activeVital.color : undefined }}>
                {v.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white"
                      style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                  {activeVital.label}
                </span>
                <span className="ml-2 font-mono text-[10px] text-slate-400">{activeVital.unit}</span>
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                Normal: {normals[activeChart][0]}–{normals[activeChart][1]} {activeVital.unit}
              </div>
            </div>
            {chartData.length < 2 ? (
              <div className="h-40 flex items-center justify-center text-slate-300 dark:text-slate-700 text-sm font-mono">
                Add ≥2 readings to see trend
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fontFamily: "monospace", fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: "monospace", fill: "#94a3b8" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={normals[activeChart][0]} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.5} />
                  <ReferenceLine y={normals[activeChart][1]} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.5} />
                  <Line
                    type="monotone"
                    dataKey={activeChart}
                    stroke={activeVital.color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: activeVital.color }}
                    activeDot={{ r: 5 }}
                    name={activeVital.label}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            <div className="mt-2 flex items-center gap-2 text-[9px] font-mono text-slate-400">
              <span className="inline-block w-4 border-t border-dashed border-red-400" />
              Normal range limits
            </div>
          </div>

          {/* Entry form */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-3">
              Record new vitals — {now()}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
              {VITALS.map(v => {
                const abnl = form[v.key] !== "" && isAbnormal(form[v.key], normals[v.key]);
                return (
                  <div key={v.key}>
                    <label className={`block font-mono text-[8px] uppercase tracking-widest mb-1 ${abnl ? "text-red-500" : "text-slate-400"}`}>
                      {v.label}
                    </label>
                    <input
                      type="number" placeholder="—"
                      value={form[v.key]}
                      onChange={e => setForm(p => ({ ...p, [v.key]: e.target.value }))}
                      className={`w-full border rounded-lg px-2 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-center font-mono tabular-nums ${
                        abnl
                          ? "border-red-300 dark:border-red-700 focus:ring-red-200"
                          : "border-slate-200 dark:border-slate-700 focus:ring-blue-200"
                      }`}
                    />
                    {abnl && (
                      <div className="text-[8px] text-red-500 font-bold text-center mt-0.5">
                        Normal: {normals[v.key][0]}–{normals[v.key][1]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text" placeholder="Notes (optional)"
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button onClick={addEntry} disabled={!hasData}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs disabled:opacity-40 hover:bg-slate-700 dark:hover:bg-slate-100 transition-all"
                style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                <Plus size={12} weight="bold" /> Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ALL READINGS TABLE ── */}
      {activeSection === "table" && (
        <div className="space-y-3">
          {/* Patient summary header */}
          {(patient.name || patient.diagnosis) && (
            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
              <div className="flex flex-wrap gap-4 text-xs">
                {[
                  { l: "Patient", v: patient.name },
                  { l: "Age", v: `${patient.age} ${patient.ageUnit}` },
                  { l: "Weight", v: `${patient.weight} kg` },
                  { l: "MRN", v: patient.mrn },
                  { l: "Ward", v: patient.ward },
                  { l: "Diagnosis", v: patient.diagnosis },
                ].filter(f => f.v).map(f => (
                  <div key={f.l}>
                    <div className="font-mono text-[8px] uppercase tracking-widest text-blue-400 mb-0.5">{f.l}</div>
                    <div className="font-semibold text-blue-800 dark:text-blue-200">{f.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entries.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center text-slate-400 text-sm font-mono">
              No readings recorded yet
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                    {["Time", "HR", "RR", "SBP", "DBP", "SpO₂", "Temp", "Notes", ""].map(h => (
                      <th key={h} className="p-2.5 text-left font-mono text-[8px] uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...entries].reverse().map((e, i) => (
                    <tr key={e.id} className={`border-t border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? "bg-white dark:bg-slate-900/20" : "bg-slate-50/50 dark:bg-slate-900/40"}`}>
                      <td className="p-2.5 font-mono text-slate-500 whitespace-nowrap">{e.time}</td>
                      {["hr","rr","sbp","dbp","spo2","temp"].map(k => {
                        const abnl = e[k] !== null && isAbnormal(e[k], normals[k]);
                        return (
                          <td key={k} className={`p-2.5 font-mono font-bold tabular-nums ${
                            abnl ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"
                          }`}>
                            {e[k] ?? "—"}{abnl && " ↑↓"}
                          </td>
                        );
                      })}
                      <td className="p-2.5 text-slate-500 max-w-[120px] truncate">{e.notes}</td>
                      <td className="p-2.5">
                        <button onClick={() => deleteEntry(e.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                          <Trash size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {entries.length > 0 && (
            <div className="flex gap-2 justify-end">
              <button onClick={exportCSV}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-mono text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all">
                <Download size={11} weight="bold" /> Download CSV
              </button>
              <button onClick={exportText}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 font-mono text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                <Download size={11} weight="bold" /> Download Text
              </button>
            </div>
          )}
        </div>
      )}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
        Normal ranges: PALS 2020 · Values auto-flagged against age-specific ranges · Always verify clinically
      </div>
    </div>
  );
}
