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
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";
import { WeightProvider } from "./context/WeightContext";
import TopBar from "./components/TopBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Toaster } from "./components/ui/sonner";
import CalculatorTab from "./components/tabs/CalculatorTab";
import EquipmentTab from "./components/tabs/EquipmentTab";
import ResuscitationTab from "./components/tabs/ResuscitationTab";
import DrugsTab from "./components/tabs/DrugsTab";
import FluidsTab from "./components/tabs/FluidsTab";
import VitalsTab from "./components/tabs/VitalsTab";
import ScoresTab from "./components/tabs/ScoresTab";
import SedationAnalgesiaTab from "./components/tabs/SedationAnalgesiaTab";
import NeonatalTab from "./components/tabs/NeonatalTab";
import AlgorithmsTab from "./components/tabs/AlgorithmsTab";
import ClinicalPathwaysTab from "./components/tabs/ClinicalPathwaysTab";
import ImagingTab from "./components/tabs/ImagingTab";
import {
  Calculator, Wrench, Pill, Heartbeat, TreeStructure, Drop, Baby,
  ClipboardText, Syringe, Stethoscope, FirstAid, Image as ImageIcon,
} from "@phosphor-icons/react";

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// Replace with your actual Razorpay Key ID from razorpay.com → Settings → API Keys
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY;
const PRICE_INR = 30;           // Change price here if needed
const ACCESS_KEY = "ped_resus_access"; // localStorage key
// ──────────────────────────────────────────────────────────────────────────────

// ── Helper: load Razorpay script dynamically ──────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── PAYWALL PAGE ──────────────────────────────────────────────────────────────
function PaywallPage({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setLoading(true);
    setError("");

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Failed to load payment gateway. Check your internet connection.");
      setLoading(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: PRICE_INR * 100, // paise
      currency: "INR",
      name: "PedResus — Pediatric Emergency Reference",
      description: "Lifetime Access · One-time Payment",
      handler: function (response) {
        // Store access locally
        localStorage.setItem(ACCESS_KEY, "granted");
        localStorage.setItem("ped_resus_payment_id", response.razorpay_payment_id);
        localStorage.setItem("ped_resus_paid_at", new Date().toISOString());
        onSuccess();
      },
      prefill: { name: "", email: "", contact: "" },
      notes: { product: "PedResus Lifetime Access" },
      theme: { color: "#0f172a" },
      modal: {
        ondismiss: () => setLoading(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      setError("Payment failed: " + response.error.description);
      setLoading(false);
    });
    rzp.open();
  };

  const features = [
    "Weight-based drug dose calculator",
    "Resuscitation drugs with PALS 2020 doses",
    "Sedation & analgesia protocols",
    "Fluids, vitals, severity scores",
    "PALS algorithms & clinical pathways",
    "Neonatal NRP reference",
    "Equipment & tube sizing",
    "Based on Fleischer & Ludwig, Harriet Lane & IAP guidelines",
  ];

  return (
    <div
      className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col"
      style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}
    >
      {/* Top bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <span
          className="font-mono text-xs uppercase tracking-[0.2em] font-bold"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          PED.RESUS
        </span>
        <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
          Emergency Reference
        </span>
      </div>

      {/* Hero */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

        {/* Left: Info */}
        <div>
          {/* Live pill */}
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Clinical Reference Tool
          </div>

          <h1
            className="text-4xl sm:text-5xl font-black leading-tight mb-4 text-slate-900 dark:text-white"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
          >
            Pediatric
            <br />
            <span className="text-slate-400">Emergency</span>
            <br />
            Reference
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
            A weight-based, interactive clinical tool for emergency physicians managing pediatric cases. Built on evidence-based guidelines for the Indian ED context.
          </p>

          {/* Reference badges */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["Fleischer & Ludwig 7th ed", "Harriet Lane 22nd ed", "IAP Guidelines 2024", "PALS 2020"].map((r) => (
              <span
                key={r}
                className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-500 dark:text-slate-400"
              >
                {r}
              </span>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-2.5">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black text-[9px] flex items-center justify-center font-bold flex-shrink-0">
                  ✓
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Payment card */}
        <div>
          <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-8 text-white border border-slate-800">

            {/* Price */}
            <div className="text-center pb-7 mb-7 border-b border-slate-700">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400 mb-3">
                One-time Access
              </p>
              <div className="flex items-start justify-center gap-1">
                <span className="text-2xl font-light text-slate-400 mt-2">₹</span>
                <span
                  className="text-7xl font-black leading-none"
                  style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
                >
                  {PRICE_INR}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-mono">Lifetime access · No subscription</p>
            </div>

            {/* Card features */}
            <div className="space-y-3 mb-7">
              {[
                "Full interactive reference tool",
                "All 12 clinical tabs unlocked",
                "Works on mobile & desktop",
                "UPI · Cards · NetBanking",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0">
                    ✓
                  </span>
                  {f}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 text-xs text-red-400 bg-red-950 border border-red-800 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold py-4 rounded-xl text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                  Opening payment...
                </>
              ) : (
                <>🔒 Pay ₹{PRICE_INR} & Get Access</>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-600 mt-4 font-mono">
              Secured by Razorpay · India's trusted payment gateway
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-slate-400 mt-4 leading-relaxed text-center px-2">
            ⚠️ Clinical reference only. Always verify doses against institutional protocols before administration.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 dark:border-slate-900 py-4 text-center text-[10px] text-slate-400 font-mono uppercase tracking-widest">
        PED.RESUS · Built for Emergency Physicians
      </div>
    </div>
  );
}

// ── PROTECTED HOME (requires payment) ────────────────────────────────────────
function ProtectedHome() {
  const [paid, setPaid] = useState(() => localStorage.getItem(ACCESS_KEY) === "granted");

  if (!paid) {
    return <PaywallPage onSuccess={() => setPaid(true)} />;
  }

  return <Home />;
}

// ── MAIN HOME APP ─────────────────────────────────────────────────────────────
function Home() {
  const [tab, setTab] = useState("calculator");

  const TABS = [
    { id: "calculator",   label: "Calculator",         icon: Calculator,     Comp: CalculatorTab },
    { id: "equipment",    label: "Equipment & Tubes",  icon: Wrench,         Comp: EquipmentTab },
    { id: "resuscitation",label: "Resuscitation",      icon: Syringe,        Comp: ResuscitationTab },
    { id: "drugs",        label: "Drug Doses",         icon: Pill,           Comp: DrugsTab },
    { id: "fluids",       label: "Fluids",             icon: Drop,           Comp: FluidsTab },
    { id: "vitals",       label: "Vitals by Age",      icon: Heartbeat,      Comp: VitalsTab },
    { id: "scores",       label: "Severity Scores",    icon: ClipboardText,  Comp: ScoresTab },
    { id: "sedation",     label: "Sedation & Analgesia",icon: FirstAid,      Comp: SedationAnalgesiaTab },
    { id: "neonatal",     label: "Neonatal (NRP)",     icon: Baby,           Comp: NeonatalTab },
    { id: "algorithms",   label: "PALS Algorithms",    icon: TreeStructure,  Comp: AlgorithmsTab },
    { id: "pathways",     label: "Clinical Pathways",  icon: Stethoscope,    Comp: ClinicalPathwaysTab },
    { id: "imaging",      label: "Imaging",            icon: ImageIcon,      Comp: ImagingTab },
  ];

  return (
    <div
      className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100"
      style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}
    >
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
          <div>Reference only. Verify against local formularies before administration.</div>
        </footer>
      </main>
      <Toaster position="top-center" richColors />
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <WeightProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedHome />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WeightProvider>
    </ThemeProvider>
  );
}

export default App;
