const CATEGORY_STYLES = {
  resuscitation: "border-l-red-500 dark:border-l-red-400",
  sedation: "border-l-purple-500 dark:border-l-purple-400",
  antibiotic: "border-l-blue-500 dark:border-l-blue-400",
  fluid: "border-l-cyan-500 dark:border-l-cyan-400",
  airway: "border-l-emerald-500 dark:border-l-emerald-400",
  analgesia: "border-l-amber-500 dark:border-l-amber-400",
  anticonvulsant: "border-l-fuchsia-500 dark:border-l-fuchsia-400",
  other: "border-l-slate-400 dark:border-l-slate-500",
};

const CATEGORY_TEXT = {
  resuscitation: "text-red-600 dark:text-red-400",
  sedation: "text-purple-600 dark:text-purple-400",
  antibiotic: "text-blue-600 dark:text-blue-400",
  fluid: "text-cyan-600 dark:text-cyan-400",
  airway: "text-emerald-600 dark:text-emerald-400",
  analgesia: "text-amber-600 dark:text-amber-400",
  anticonvulsant: "text-fuchsia-600 dark:text-fuchsia-400",
  other: "text-slate-600 dark:text-slate-300",
};

export default function DoseCard({ testid, category = "other", title, value, unit, subtitle, note }) {
  return (
    <div
      data-testid={testid}
      className={`group border border-slate-200 dark:border-slate-800 border-l-4 ${CATEGORY_STYLES[category]} rounded-md bg-white dark:bg-slate-900/50 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 leading-tight min-h-[26px]">
        {title}
      </div>
      <div className={`font-mono font-black text-2xl sm:text-3xl mt-2 ${CATEGORY_TEXT[category]} tracking-tight leading-none`}>
        {value}
      </div>
      {unit && (
        <div className="font-mono text-xs text-slate-600 dark:text-slate-400 mt-1">{unit}</div>
      )}
      {subtitle && (
        <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2">
          {subtitle}
        </div>
      )}
      {note && (
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-snug">{note}</div>
      )}
    </div>
  );
}
