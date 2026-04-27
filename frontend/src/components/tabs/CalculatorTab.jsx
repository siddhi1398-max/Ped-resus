import { useWeight } from "../../context/WeightContext";
import DoseCard from "../DoseCard";
import BroselowTape from "../BroselowTape";
import { estimateAge, estimateETT, estimateDepth, minSBP, fmt } from "../../lib/calc";
import { maintenanceFluid, estimatedBloodVolume, ebvPerKgForWeight } from "../../data/fluids";

export default function CalculatorTab() {
  const { weight: w } = useWeight();

  const items = [
    { cat: "other", title: "Estimated Age", val: estimateAge(w), unit: "clinical estimate" },
    { cat: "resuscitation", title: "Adrenaline arrest 0.01 mg/kg", val: fmt(Math.min(w * 0.01, 1)), unit: "mg IV/IO" },
    { cat: "resuscitation", title: "Adrenaline vol (1:10,000)", val: fmt(Math.min(w * 0.1, 10)), unit: "mL" },
    { cat: "resuscitation", title: "Adrenaline IM anaphylaxis", val: fmt(Math.min(w * 0.01, 0.5)), unit: "mg IM (1:1000)" },
    { cat: "resuscitation", title: "Atropine 0.02 mg/kg", val: fmt(Math.max(0.1, Math.min(w * 0.02, 0.5))), unit: "mg (min 0.1)" },
    { cat: "resuscitation", title: "Adenosine 1st 0.1 mg/kg", val: fmt(Math.min(w * 0.1, 6)), unit: "mg rapid IV" },
    { cat: "resuscitation", title: "Amiodarone 5 mg/kg", val: fmt(Math.min(w * 5, 300)), unit: "mg IV/IO" },
    { cat: "resuscitation", title: "Naloxone 0.1 mg/kg", val: fmt(Math.min(w * 0.1, 2)), unit: "mg IV/IM/IN" },
    { cat: "anticonvulsant", title: "Midazolam IV 0.1 mg/kg", val: fmt(Math.min(w * 0.1, 5)), unit: "mg IV" },
    { cat: "anticonvulsant", title: "Midazolam IN 0.2 mg/kg", val: fmt(Math.min(w * 0.2, 10)), unit: "mg IN/buccal" },
    { cat: "anticonvulsant", title: "Lorazepam 0.1 mg/kg", val: fmt(Math.min(w * 0.1, 4)), unit: "mg IV" },
    { cat: "anticonvulsant", title: "Levetiracetam 40 mg/kg", val: fmt(Math.min(w * 40, 3000)), unit: "mg IV" },
    { cat: "anticonvulsant", title: "Phenytoin 20 mg/kg", val: fmt(Math.min(w * 20, 1500)), unit: "mg PE IV" },
    { cat: "sedation", title: "Ketamine sedation 1.5 mg/kg", val: fmt(w * 1.5), unit: "mg IV" },
    { cat: "sedation", title: "Ketamine RSI 2 mg/kg", val: fmt(w * 2), unit: "mg IV" },
    { cat: "sedation", title: "Propofol RSI 2 mg/kg", val: fmt(w * 2), unit: "mg IV" },
    { cat: "airway", title: "Suxamethonium 2 mg/kg", val: fmt(w * 2), unit: "mg IV" },
    { cat: "airway", title: "Rocuronium 1.2 mg/kg", val: fmt(w * 1.2), unit: "mg IV" },
    { cat: "analgesia", title: "Morphine 0.1 mg/kg", val: fmt(Math.min(w * 0.1, 5)), unit: "mg IV/IM" },
    { cat: "analgesia", title: "Fentanyl IN 1.5 mcg/kg", val: fmt(Math.min(w * 1.5, 100)), unit: "mcg IN" },
    { cat: "analgesia", title: "Paracetamol 15 mg/kg", val: fmt(Math.min(w * 15, 1000)), unit: "mg PO/IV" },
    { cat: "analgesia", title: "Ibuprofen 10 mg/kg", val: fmt(Math.min(w * 10, 400)), unit: "mg PO" },
    { cat: "other", title: "Dexamethasone 0.6 mg/kg", val: fmt(Math.min(w * 0.6, 10)), unit: "mg PO/IM" },
    { cat: "other", title: "Prednisolone 1 mg/kg", val: fmt(Math.min(w * 1, 40)), unit: "mg PO" },
    { cat: "antibiotic", title: "Ceftriaxone 50 mg/kg", val: fmt(Math.min(w * 50, 2000)), unit: "mg IV/IM" },
    { cat: "antibiotic", title: "Ceftriaxone meningitis 100 mg/kg", val: fmt(Math.min(w * 100, 4000)), unit: "mg IV" },
    { cat: "antibiotic", title: "Gentamicin 7.5 mg/kg", val: fmt(Math.min(w * 7.5, 400)), unit: "mg IV" },
    { cat: "fluid", title: "Fluid bolus 20 mL/kg", val: fmt(w * 20), unit: "mL NS/LR" },
    { cat: "fluid", title: "Maintenance (4-2-1)", val: fmt(maintenanceFluid(w)), unit: "mL/hr" },
    { cat: "fluid", title: "Blood pRBC 10 mL/kg", val: fmt(w * 10), unit: "mL" },
    { cat: "fluid", title: "Dextrose 10% 2 mL/kg", val: fmt(w * 2), unit: "mL D10W" },
    { cat: "fluid", title: "Hypertonic 3% NaCl 4 mL/kg", val: fmt(w * 4), unit: "mL IV" },
    { cat: "other", title: "Mannitol 0.5 g/kg", val: fmt(Math.min(w * 0.5, 50)), unit: "g IV (20%)" },
    { cat: "resuscitation", title: "Defibrillation 4 J/kg", val: fmt(Math.min(w * 4, 200)), unit: "J" },
    { cat: "airway", title: "ETT Size (est.)", val: estimateETT(w), unit: "mm ID" },
    { cat: "airway", title: "ETT Depth (oral)", val: estimateDepth(w), unit: "cm" },
    { cat: "other", title: "Blood Volume (age-adjusted)", val: fmt(estimatedBloodVolume(w)), unit: `mL (${ebvPerKgForWeight(w)} mL/kg)` },
    { cat: "other", title: "Min Systolic BP", val: minSBP(w), unit: "mmHg" },
  ];

  return (
    <div className="space-y-6">
      <BroselowTape />
      <div>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">Live Weight-Based Calculator</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          All values reactive to current weight{" "}
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{w} kg</span>. Max caps applied where relevant.
        </p>
      </div>
      <div data-testid="calc-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {items.map((it) => (
          <DoseCard
            key={it.title}
            testid={`dose-card-${it.title}`}
            category={it.cat}
            title={it.title}
            value={it.val}
            unit={it.unit}
          />
        ))}
      </div>
    </div>
  );
}
