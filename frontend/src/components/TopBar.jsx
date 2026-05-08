import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useWeight } from "../context/WeightContext";
import { estimateAge } from "../lib/calc";
import { zoneForWeight } from "../data/broselow";
import { exportPatientCasePDF } from "../lib/exportPdf";
import { Sun, Moon, FilePdf, Heartbeat, CaretDown } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useMemo, useState } from "react";

export default function TopBar() {
  const { weight, setWeight } = useWeight();
  const { theme, setTheme } = useTheme();
  const zone = zoneForWeight(weight);
  const sliderValue = useMemo(() => [weight], [weight]);
  const [expanded, setExpanded] = useState(true);

  const handleSlider = (v) => setWeight(v[0]);
  const handleInput = (e) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v >= 0.5 && v <= 100) setWeight(v);
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

        {/* ── Single compact row (always visible) ── */}
        <div className="flex items-center gap-2 h-12">

          {/* Logo */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Heartbeat size={22} weight="fill" className="text-red-600 dark:text-red-400" />
            <span className="font-sans font-black tracking-tighter text-base leading-none">
              PED<span className="text-red-600 dark:text-red-400">.</span>RESUS
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Weight input — always visible, compact */}
          <div className="flex items-center gap-1">
            <Input
              data-testid="weight-input"
              type="number"
              min="0.5"
              max="100"
              step="0.5"
              value={weight}
              onChange={handleInput}
              className="w-16 h-8 font-mono text-right text-sm font-bold px-2 py-0"
            />
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">kg</span>
          </div>

          {/* Broselow zone badge */}
          <div
            data-testid="broselow-zone-indicator"
            className="flex flex-col items-center justify-center rounded px-2 py-1 border-2 shrink-0"
            style={{ backgroundColor: zone.hex, borderColor: zone.hex }}
          >
            <span className={`font-mono text-[9px] font-bold tracking-widest leading-tight ${zone.textClass}`}>
              {zone.label}
            </span>
            <span className={`font-mono text-[9px] leading-tight ${zone.textClass}`}>
              {zone.weightLabel}
            </span>
          </div>

          {/* Expand slider toggle (mobile only) */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
            aria-label="Toggle weight slider"
          >
            <CaretDown
              size={14}
              weight="bold"
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </button>

          {/* Theme toggle */}
          <Button
            data-testid="theme-toggle"
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full w-8 h-8 shrink-0"
            aria-label="Toggle theme"
          >
            {theme === "dark"
              ? <Sun size={15} weight="bold" />
              : <Moon size={15} weight="bold" />}
          </Button>

          {/* Export — icon-only on mobile */}
          <Button
            data-testid="export-pdf-button"
            onClick={handleExport}
            size="sm"
            className="gap-1.5 bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 h-8 px-2 sm:px-3"
          >
            <FilePdf size={16} weight="bold" />
            <span className="hidden sm:inline text-xs">Export PDF</span>
          </Button>
        </div>

        {/* ── Slider row: always visible on md+, collapsible on mobile ── */}
        <div
          className={`
            overflow-hidden transition-all duration-200
            ${expanded ? "max-h-20 pb-2" : "max-h-0"}
            sm:max-h-20 sm:pb-2
          `}
        >
          <div className="flex items-center gap-3 pt-1">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
              Weight
            </label>
            <Slider
              data-testid="weight-slider"
              value={sliderValue}
              min={0.5}
              max={60}
              step={0.5}
              onValueChange={handleSlider}
              className="flex-1"
            />
            <div
              data-testid="age-display"
              className="font-sans font-bold text-xs whitespace-nowrap shrink-0 text-slate-700 dark:text-slate-300"
            >
              {estimateAge(weight)}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
