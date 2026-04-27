import { VITALS_ROWS, TEMP_NOTES, SPO2_NOTES, minSBP } from "../../data/vitals";
import { useWeight } from "../../context/WeightContext";
import { Thermometer, Wind, Heartbeat, Waveform } from "@phosphor-icons/react";

export default function VitalsTab() {
  const { weight } = useWeight();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">Vital Signs by Age</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Normal ranges. Awake / asleep values for heart rate where applicable.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <VitalStat icon={<Heartbeat size={20} weight="fill" />} label="Min SBP (current wt)" value={`${minSBP(weight)}`} unit="mmHg" tone="red" />
        <VitalStat icon={<Waveform size={20} weight="bold" />} label="HR alert (late sign)" value="< 60 bpm" unit="with poor perfusion → CPR" tone="red" />
        <VitalStat icon={<Wind size={20} weight="bold" />} label="SpO₂ target" value="≥ 94%" unit="on room air" tone="emerald" />
        <VitalStat icon={<Thermometer size={20} weight="fill" />} label="Fever" value="≥ 38.0 °C" unit="rectal" tone="amber" />
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 dark:bg-slate-950 text-white">
              <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Age Band</th>
              <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Heart Rate (bpm)</th>
              <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Resp. Rate (/min)</th>
              <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Systolic BP (mmHg)</th>
              <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Diastolic BP (mmHg)</th>
            </tr>
          </thead>
          <tbody>
            {VITALS_ROWS.map((r) => (
              <tr key={r.age} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                <td className="p-3 font-bold">{r.age}</td>
                <td className="p-3 font-mono text-red-600 dark:text-red-400">{r.hr}</td>
                <td className="p-3 font-mono text-emerald-700 dark:text-emerald-400">{r.rr}</td>
                <td className="p-3 font-mono text-blue-700 dark:text-blue-400">{r.sbp}</td>
                <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{r.dbp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBlock icon={<Thermometer size={18} weight="fill" />} title="Temperature" items={TEMP_NOTES} />
        <InfoBlock icon={<Wind size={18} weight="bold" />} title="Oxygenation" items={SPO2_NOTES} />
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">
          Min Systolic BP Formula (1–10 yr)
        </div>
        <div className="font-mono">70 + (2 × age in years) mmHg — below this = hypotension</div>
      </div>
    </div>
  );
}

function VitalStat({ icon, label, value, unit, tone }) {
  const toneMap = {
    red: "text-red-600 dark:text-red-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/50">
      <div className={`flex items-center gap-2 ${toneMap[tone]}`}>
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <div className={`font-mono font-black text-2xl mt-2 ${toneMap[tone]}`}>{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{unit}</div>
    </div>
  );
}

function InfoBlock({ icon, title, items }) {
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/50">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-sans font-bold text-base">{title}</h3>
      </div>
      <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="text-slate-400">·</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
