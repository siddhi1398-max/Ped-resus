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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Collapsible top section: logo + buttons ── */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${expanded ? "max-h-20 opacity-100 pt-3 pb-2" : "max-h-0 opacity-0 pt-0 pb-0"}
          `}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heartbeat size={24} weight="fill" className="text-red-600 dark:text-red-400" />
              <div>
                <h1 className="font-sans font-black tracking-tighter text-base sm:text-lg leading-none">
                  PED<span className="text-red-600 dark:text-red-400">.</span>RESUS
                </h1>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mt-0.5">
                  Pediatric Emergency Reference
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                data-testid="theme-toggle"
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full w-8 h-8"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={15} weight="bold" /> : <Moon size={15} weight="bold" />}
              </Button>
              <Button
                data-testid="export-pdf-button"
                onClick={handleExport}
                size="sm"
                className="gap-1.5 h-8 px-2 sm:px-3 bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600"
              >
                <FilePdf size={15} weight="bold" />
                <span className="hidden sm:inline text-xs">Export PDF</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Always-visible weight bar ── */}
        <div className="flex items-center gap-3 py-2">

          {/* Collapse toggle — only on mobile */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="sm:hidden flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
            aria-label={expanded ? "Collapse header" : "Expand header"}
          >
            <CaretDown
              size={12}
              weight="bold"
              className={`transition-transform duration-300 ${expanded ? "" : "rotate-180"}`}
            />
          </button>

          {/* Slider */}
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 whitespace-nowrap flex-shrink-0">
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

          {/* kg input */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Input
              data-testid="weight-input"
              type="number"
              min="0.5"
              max="100"
              step="0.5"
              value={weight}
              onChange={handleInput}
              className="w-16 h-8 font-mono text-right text-base font-bold px-2"
            />
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">kg</span>
          </div>

          {/* Age + Broselow zone — always visible, compact */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden xs:block text-right">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Age</div>
              <div data-testid="age-display" className="font-sans font-bold text-xs">{estimateAge(weight)}</div>
            </div>
            <div
              data-testid="broselow-zone-indicator"
              className="flex flex-col items-center justify-center rounded px-2 py-1 border-2 min-w-[72px]"
              style={{ backgroundColor: zone.hex, borderColor: zone.hex }}
            >
              <span className={`font-mono text-[9px] font-bold tracking-widest leading-tight ${zone.textClass}`}>{zone.label}</span>
              <span className={`font-mono text-[9px] leading-tight ${zone.textClass}`}>{zone.weightLabel}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
