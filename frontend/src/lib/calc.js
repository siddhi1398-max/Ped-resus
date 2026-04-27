import { minSBP } from "../data/vitals";
import { maintenanceFluid } from "../data/fluids";

export function estimateAge(w) {
  if (w <= 4) return "Neonate / Premature";
  if (w <= 7) return "~3–6 months";
  if (w <= 10) return "~6–12 months";
  if (w <= 14) return "~1–2 yr";
  if (w <= 18) return "~2–4 yr";
  if (w <= 22) return "~4–5 yr";
  if (w <= 26) return "~5–7 yr";
  if (w <= 32) return "~7–9 yr";
  if (w <= 40) return "~10–12 yr";
  return "Adolescent / Adult";
}

export function estimateETT(w) {
  if (w < 3) return "2.5";
  if (w < 5) return "3.0";
  if (w < 8) return "3.5";
  if (w < 11) return "4.0";
  if (w < 14) return "4.5";
  if (w < 19) return "5.0";
  if (w < 24) return "5.5";
  if (w < 32) return "6.0";
  if (w < 40) return "6.5";
  return "7.0+";
}

export function estimateDepth(w) {
  if (w < 3) return "6–7";
  if (w < 5) return "9–10";
  if (w < 8) return "10–12";
  if (w < 11) return "12–13";
  if (w < 14) return "13–14";
  if (w < 19) return "14–16";
  if (w < 24) return "15–17";
  if (w < 32) return "17–19";
  if (w < 40) return "19–21";
  return "21–23";
}

export function fmt(v, dp = 2) {
  if (typeof v !== "number") return v;
  return +v.toFixed(dp);
}

export { minSBP, maintenanceFluid };

export function quickSnapshot(w) {
  return {
    weight: w,
    age: estimateAge(w),
    ett: estimateETT(w),
    depth: estimateDepth(w),
    minSBP: minSBP(w),
    maintenance: maintenanceFluid(w),
    bloodVolume: Math.round(w * 80),
    fluidBolus: w * 20,
    adrenalineArrest: +Math.min(w * 0.01, 1).toFixed(2),
    defib: Math.min(w * 4, 200),
  };
}
