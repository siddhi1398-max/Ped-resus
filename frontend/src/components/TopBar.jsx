import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useWeight } from "../context/WeightContext";
import { estimateAge } from "../lib/calc";
import { zoneForWeight } from "../data/broselow";
import { exportPatientCasePDF } from "../lib/exportPdf";
import { Sun, Moon, FilePdf, Heartbeat } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useMemo, useState, useEffect } from "react";

export default function TopBar() {
  const { weight, setWeight } = useWeight();
  const { theme, setTheme } = useTheme();
  const zone = zoneForWeight(weight);
  const sliderValue = useMemo(() => [weight], [weight]);

  // Local string state so user can type freely without interference
  const [inputVal, setInputVal] = useState(String(weight));

  // Keep input in sync when slider moves
  useEffect(() => {
    setInputVal(String(weight));
  }, [weight]);

  const handleSlider = (v) => setWeight(v[0]);

  const commitInput = () => {
    const v = parseFloat(inputVal);
    if (!isNaN(v) && v >= 0.5 && v <= 100) {
      setWeight(v);
    } else {
      // Revert to last valid weight if invalid
      setInputVal(String(weight));
    }
  };

  const handleExport = () => {
    try {
      exportPatientCasePDF(weight);
      toast.success(`Dose sheet exported for ${weight} kg`);
    } catch {
      toast.error("PDF export failed");
    }
  };

  return (
    <header
      data-testid="top-bar"
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 dark:bg-black/85 border-b border-slate-200 dark:border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6">

        {/* ── Logo + buttons row ── */}
        <div className="flex items-center justify-between gap-3 pt-2.5 pb-1.5">
          <div className="flex items-center gap-2">
            <Heartbeat size={22} weight="fill" className="text-red-600 dark:text-red-400" />
            <div>
              <h1 className="font-sans font-black tracking-tighter text-base leading-none">
                PED<span className="text-red-600 dark:text-red-400">.</span>RESUS
              </h1>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mt-0.5">
                Pediatric Emergency Reference
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              data-testid="theme-toggle"
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full w-8 h-8"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} weight="bold" /> : <Moon size={14} weight="bold" />}
            </Button>
            <Button
              data-testid="export-pdf-button"
              onClick={handleExport}
              size="sm"
              className="h-8 px-2 sm:px-3 gap-1 bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600"
            >
              <FilePdf size={14} weight="bold" />
              <span className="hidden sm:inline text-xs">Export PDF</span>
            </Button>
          </div>
        </div>

        {/* ── Weight bar ── */}
        <div className="flex items-center gap-2 pb-2">

          <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 whitespace-nowrap flex-shrink-0">
            Weight
          </span>

          <Slider
            data-testid="weight-slider"
            value={sliderValue}
            min={0.5}
            max={60}
            step={0.5}
            onValueChange={handleSlider}
            className="flex-1 min-w-0"
          />
{/* Weight input — no age below anymore */}
<div className="flex items-center gap-1 flex-shrink-0">
  <Input
    data-testid="weight-input"
    type="number"
    min="0.5"
    max="100"
    step="0.5"
    value={inputVal}
    onChange={(e) => setInputVal(e.target.value)}
    onBlur={commitInput}
    onKeyDown={(e) => e.key === "Enter" && commitInput()}
    className="w-12 h-7 font-mono text-center text-sm font-bold px-1"
  />
  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">kg</span>
</div>
         {/* Broselow zone */}
<div
  data-testid="broselow-zone-indicator"
  className="flex flex-col items-center justify-center rounded px-2 py-1 border-2 flex-shrink-0 min-w-[64px] sm:min-w-[80px]"
  style={{ backgroundColor: zone.hex, borderColor: zone.hex }}
>
  <span className={`font-mono text-[9px] font-bold leading-tight ${zone.textClass}`}>
    {estimateAge(weight)}
  </span>
  <span className={`font-mono text-[9px] leading-tight ${zone.textClass}`}>
    {zone.weightLabel}
  </span>
</div>

        </div>
      </div>
    </header>
  );
}
