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
import { useMemo } from "react";

export default function TopBar() {
  const { weight, setWeight } = useWeight();
  const { theme, setTheme } = useTheme();
  const zone = zoneForWeight(weight);
  const sliderValue = useMemo(() => [weight], [weight]);

  const handleSlider = (v) => setWeight(v[0]);
  const handleInput = (e) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v >= 0.5 && v <= 100) setWeight(v);
  };

  const handleExport = () => {
    try {
      exportPatientCasePDF(weight);
      toast.success(`Dose sheet exported for ${weight} kg`);
    } catch (e) {
      toast.error("PDF export failed");
    }
  };

  return (
    <header
      data-testid="top-bar"
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 dark:bg-black/85 border-b border-slate-200 dark:border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Heartbeat size={28} weight="fill" className="text-red-600 dark:text-red-400" />
            <div>
              <h1 className="font-sans font-black tracking-tighter text-lg sm:text-xl leading-none">
                PED<span className="text-red-600 dark:text-red-400">.</span>RESUS
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mt-0.5">
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
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
            </Button>
            <Button
              data-testid="export-pdf-button"
              onClick={handleExport}
              className="gap-2 bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600"
            >
              <FilePdf size={18} weight="bold" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 md:gap-6 items-center">
          <div className="flex items-center gap-3">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 whitespace-nowrap">
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
          </div>
          <div className="flex items-center gap-2">
            <Input
              data-testid="weight-input"
              type="number"
              min="0.5"
              max="100"
              step="0.5"
              value={weight}
              onChange={handleInput}
              className="w-24 font-mono text-right text-lg font-bold"
            />
            <span className="font-mono text-sm text-slate-500 dark:text-slate-400">kg</span>
          </div>
          <div className="flex items-center gap-3 justify-between md:justify-end">
            <div className="text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Age</div>
              <div data-testid="age-display" className="font-sans font-bold text-sm">{estimateAge(weight)}</div>
            </div>
            <div
              data-testid="broselow-zone-indicator"
              className="flex flex-col items-center justify-center rounded-md px-3 py-1.5 min-w-[90px] border-2"
              style={{ backgroundColor: zone.hex, borderColor: zone.hex }}
            >
              <span className={`font-mono text-[10px] font-bold tracking-widest ${zone.textClass}`}>{zone.label}</span>
              <span className={`font-mono text-[10px] ${zone.textClass}`}>{zone.weightLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
