import { BROSELOW_ZONES } from "../data/broselow";
import { useWeight } from "../context/WeightContext";

export default function BroselowTape({ onZoneClick }) {
  const { weight, setWeight } = useWeight();

  const handleClick = (z) => {
    setWeight(z.medianKg);
    if (onZoneClick) onZoneClick(z);
  };

  return (
    <div data-testid="broselow-tape" className="w-full">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">
        Broselow-Luten Tape · click a zone to set weight
      </div>
      <div className="flex w-full rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        {BROSELOW_ZONES.map((z) => {
          const active = weight >= z.minKg && weight <= z.maxKg;
          return (
            <button
              key={z.code}
              data-testid={`broselow-zone-${z.code}`}
              onClick={() => handleClick(z)}
              className={`relative flex-1 px-1 py-3 sm:py-4 flex flex-col items-center justify-center gap-0.5 transition-all hover:brightness-110 active:scale-[0.98] ${
                z.code === "white" ? "border-r border-slate-300 last:border-r-0" : ""
              } ${active ? "ring-2 ring-offset-2 ring-black dark:ring-white ring-offset-white dark:ring-offset-black z-10" : ""}`}
              style={{ backgroundColor: z.hex }}
              aria-label={`${z.label} ${z.weightLabel}`}
            >
              <span className={`font-mono text-[9px] sm:text-[10px] font-black tracking-widest ${z.textClass}`}>
                {z.label}
              </span>
              <span className={`font-mono text-[9px] sm:text-[10px] ${z.textClass}`}>{z.weightLabel}</span>
              <span className={`hidden sm:block font-mono text-[9px] opacity-80 ${z.textClass}`}>
                {z.heightLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
