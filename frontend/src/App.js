import "@fontsource/chivo/400.css";
import "@fontsource/chivo/700.css";
import "@fontsource/chivo/900.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";

import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { WeightProvider } from "./context/WeightContext";
import TopBar from "./components/TopBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Toaster } from "./components/ui/sonner";
import CalculatorTab from "./components/tabs/CalculatorTab";
import EquipmentTab from "./components/tabs/EquipmentTab";
import DrugsTab from "./components/tabs/DrugsTab";
import VitalsTab from "./components/tabs/VitalsTab";
import NeonatalTab from "./components/tabs/NeonatalTab";
import AlgorithmsTab from "./components/tabs/AlgorithmsTab";
import FluidsTab from "./components/tabs/FluidsTab";
import ScoresTab from "./components/tabs/ScoresTab";
import { Calculator, Wrench, Pill, Heartbeat, TreeStructure, Drop, Baby, ClipboardText } from "@phosphor-icons/react";

const TABS = [
  { id: "calculator", label: "Calculator", icon: Calculator, Comp: CalculatorTab },
  { id: "equipment", label: "Equipment & Tubes", icon: Wrench, Comp: EquipmentTab },
  { id: "drugs", label: "Drug Doses", icon: Pill, Comp: DrugsTab },
  { id: "vitals", label: "Vitals by Age", icon: Heartbeat, Comp: VitalsTab },
  { id: "scores", label: "Pain & Scores", icon: ClipboardText, Comp: ScoresTab },
  { id: "neonatal", label: "Neonatal (NRP)", icon: Baby, Comp: NeonatalTab },
  { id: "algorithms", label: "PALS Algorithms", icon: TreeStructure, Comp: AlgorithmsTab },
  { id: "fluids", label: "Fluids", icon: Drop, Comp: FluidsTab },
];

function Home() {
  const [tab, setTab] = useState("calculator");

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100" style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
      <TopBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={tab} onValueChange={setTab} data-testid="main-tabs">
          <TabsList className="w-full justify-start flex-wrap h-auto p-1.5 bg-slate-100 dark:bg-slate-900 gap-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  data-testid={`tab-${t.id}`}
                  className="gap-2 font-mono text-[11px] uppercase tracking-[0.15em] data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900"
                >
                  <Icon size={14} weight="bold" />
                  {t.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {TABS.map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-6 sm:mt-8 focus-visible:outline-none">
              <t.Comp />
            </TabsContent>
          ))}
        </Tabs>

        <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
          <div>
            <span className="font-mono uppercase tracking-[0.15em]">PED.RESUS</span> — Pediatric Emergency Reference
          </div>
          <div>
            Reference only. Verify against local formularies before administration.
          </div>
        </footer>
      </main>
      <Toaster position="top-center" richColors />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <WeightProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </WeightProvider>
    </ThemeProvider>
  );
}

export default App;
