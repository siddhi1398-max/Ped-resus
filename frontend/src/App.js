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
  Lock,
} from "@phosphor-icons/react";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: "AIzaSyC794KlXXWDOANEEtq2-s4cU8J9cD_9Qgs",
  authDomain: "pedresus-3fb27.firebaseapp.com",
  projectId: "pedresus-3fb27",
  storageBucket: "pedresus-3fb27.firebasestorage.app",
  messagingSenderId: "70799823874",
  appId: "1:70799823874:web:b5d4801bf42a0f8c5d431b",
  measurementId: "G-B8JL4THBDL",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY;
const PRICE_INR = 30;

// ── UPDATE YOUR NAME HERE ─────────────────────────────────────────────────────
const DEV_NAME = "Dr. Siddhi";
const DEV_TITLE = "Emergency Physician & Developer";
const DEV_EMAIL = "siddhi1398@gmail.com";

// ─── TABS — set free: true to allow without payment ──────────────────────────

const ALL_TABS = [
  { id: "calculator",    label: "Calculator",          icon: Calculator,    Comp: CalculatorTab,        free: true  },
  { id: "equipment",     label: "Equipment & Tubes",   icon: Wrench,        Comp: EquipmentTab,         free: false },
  { id: "resuscitation", label: "Resuscitation",       icon: Syringe,       Comp: ResuscitationTab,     free: false },
  { id: "drugs",         label: "Drug Doses",          icon: Pill,          Comp: DrugsTab,             free: false },
  { id: "fluids",        label: "Fluids",              icon: Drop,          Comp: FluidsTab,            free: false },
  { id: "vitals",        label: "Vitals by Age",       icon: Heartbeat,     Comp: VitalsTab,            free: false },
  { id: "scores",        label: "Severity Scores",     icon: ClipboardText, Comp: ScoresTab,            free: false },
  { id: "sedation",      label: "Sedation & Analgesia",icon: FirstAid,      Comp: SedationAnalgesiaTab, free: false },
  { id: "neonatal",      label: "Neonatal (NRP)",      icon: Baby,          Comp: NeonatalTab,          free: false },
  { id: "algorithms",    label: "PALS Algorithms",     icon: TreeStructure, Comp: AlgorithmsTab,        free: false },
  { id: "pathways",      label: "Clinical Pathways",   icon: Stethoscope,   Comp: ClinicalPathwaysTab,  free: false },
  { id: "imaging",       label: "Imaging",             icon: ImageIcon,     Comp: ImagingTab,           free: false },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const s = document.createElement("script");
    s.id = "razorpay-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

async function checkUserPaid(uid) {
  try {
    const snap = await getDoc(doc(db, "paid_users", uid));
    return snap.exists() && snap.data().paid === true;
  } catch {
    return false;
  }
}

async function markUserPaid(uid, email, paymentId) {
  try {
    await setDoc(doc(db, "paid_users", uid), {
      paid: true,
      email,
      paymentId,
      paidAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Failed to save payment:", e);
  }
}

// ─── LOADING ──────────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

// ─── PAYWALL MODAL ────────────────────────────────────────────────────────────

function PaywallModal({ user, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      setError("Sign-in failed. Please try again.");
      setSigningIn(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    setError("");
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Failed to load payment gateway. Check your connection.");
      setLoading(false);
      return;
    }
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: PRICE_INR * 100,
      currency: "INR",
      name: "PedResus — Pediatric Emergency Reference",
      description: "Lifetime Access · All Features Unlocked",
      prefill: { name: user?.displayName || "", email: user?.email || "" },
      theme: { color: "#0f172a" },
      handler: async (response) => {
        await markUserPaid(user.uid, user.email, response.razorpay_payment_id);
        onSuccess();
      },
      modal: { ondismiss: () => setLoading(false) },
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (r) => {
      setError("Payment failed: " + r.error.description);
      setLoading(false);
    });
    rzp.open();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-light"
        >✕</button>

        <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-5">
          <Lock size={22} weight="bold" className="text-white dark:text-slate-900" />
        </div>

        <h2
          className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2"
          style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
        >
          Unlock Full Access
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          All 11 clinical tabs · ₹{PRICE_INR} one-time · Works on all devices
        </p>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-5">
          <div className="grid grid-cols-2 gap-2">
            {ALL_TABS.filter(t => !t.free).map(t => (
              <div key={t.id} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[8px] flex items-center justify-center font-bold flex-shrink-0">✓</span>
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
        )}

        {!user ? (
          <>
            <button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all mb-3 disabled:opacity-50 shadow-sm"
            >
              {signingIn ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )}
              {signingIn ? "Signing in..." : "Sign in with Google to continue"}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-mono">
              Sign in first, then pay ₹{PRICE_INR} to unlock all features
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
              {user.photoURL && <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />}
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono truncate">{user.email}</span>
            </div>
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-white hover:bg-slate-700 text-white dark:text-slate-900 font-bold py-4 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
            >
              {loading ? (
                <><span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />Opening payment...</>
              ) : (
                <>🔒 Pay ₹{PRICE_INR} — Unlock All Features</>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-500 mt-3 font-mono">
              Secured by Razorpay · UPI · Cards · NetBanking
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

function Home() {
  const [tab, setTab] = useState("calculator");
  const [user, setUser] = useState(null);
  const [paid, setPaid] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const hasPaid = await checkUserPaid(firebaseUser.uid);
        setPaid(hasPaid);
      } else {
        setPaid(false);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleTabClick = (tabId) => {
    const tabDef = ALL_TABS.find(t => t.id === tabId);
    if (!tabDef.free && !paid) {
      setShowPaywall(true);
      return;
    }
    setTab(tabId);
  };

  const handlePaywallSuccess = () => {
    setPaid(true);
    setShowPaywall(false);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setPaid(false);
    setUser(null);
  };

  if (authLoading) return <LoadingScreen />;

  return (
    <div
      className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100"
      style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}
    >
      {showPaywall && (
        <PaywallModal
          user={user}
          onSuccess={handlePaywallSuccess}
          onClose={() => setShowPaywall(false)}
        />
      )}

      <TopBar />

      {/* Status bar */}
      <div className="border-b border-slate-100 dark:border-slate-900 px-4 sm:px-6 py-2 flex items-center justify-between max-w-7xl mx-auto">
        <div>
          {paid ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Full Access Unlocked
            </span>
          ) : (
            <button
              onClick={() => setShowPaywall(true)}
              className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2 py-1 rounded-full hover:bg-amber-100 transition-colors"
            >
              <Lock size={10} weight="bold" />
              Free Plan · Unlock All for ₹{PRICE_INR}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {user.photoURL && <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />}
              <span className="text-[10px] text-slate-400 font-mono hidden sm:block">{user.email}</span>
              <button onClick={handleSignOut} className="text-[10px] text-slate-400 hover:text-slate-600 font-mono underline">Sign out</button>
            </div>
          ) : (
            <button onClick={() => setShowPaywall(true)} className="text-[10px] text-slate-400 hover:text-slate-600 font-mono underline">
              Sign in
            </button>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={tab} onValueChange={() => {}} data-testid="main-tabs">
          <TabsList className="w-full justify-start flex-wrap h-auto p-1.5 bg-slate-100 dark:bg-slate-900 gap-1">
            {ALL_TABS.map((t) => {
              const Icon = t.icon;
              const isLocked = !t.free && !paid;
              return (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  data-testid={`tab-${t.id}`}
                  onClick={() => handleTabClick(t.id)}
                  className="gap-2 font-mono text-[11px] uppercase tracking-[0.15em] data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900"
                >
                  <Icon size={14} weight="bold" />
                  {t.label}
                  {isLocked && <Lock size={9} weight="bold" className="text-amber-500 ml-0.5" />}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {ALL_TABS.map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-6 sm:mt-8 focus-visible:outline-none">
              <t.Comp />
            </TabsContent>
          ))}
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <span className="font-mono uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300">PED.RESUS</span>
              <span className="mx-2 text-slate-300 dark:text-slate-600">·</span>
              Pediatric Emergency Reference
              <div className="mt-1 text-[10px] text-slate-400">
                Fleischer & Ludwig 7th ed · Harriet Lane 22nd ed · IAP Guidelines 2024 · PALS 2020
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 mb-0.5">Designed & Developed by</div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{DEV_NAME}</div>
              <div className="text-[10px] text-slate-400">{DEV_TITLE}</div>
              <a href={`mailto:${DEV_EMAIL}`} className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors underline">
                {DEV_EMAIL}
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-900 text-[10px] text-slate-400 text-center">
            ⚠️ Clinical reference only. Always verify doses against institutional protocols before administration.
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WeightProvider>
    </ThemeProvider>
  );
}

export default App;
