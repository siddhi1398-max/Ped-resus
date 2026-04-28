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

// Firebase
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
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

// ─── RAZORPAY CONFIG ──────────────────────────────────────────────────────────
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY;
const PRICE_INR = 30;

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
    const ref = doc(db, "paid_users", uid);
    const snap = await getDoc(ref);
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
    console.error("Failed to save payment record:", e);
  }
}

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
          Loading...
        </p>
      </div>
    </div>
  );
}

// ─── SIGN IN PAGE ─────────────────────────────────────────────────────────────
function SignInPage({ onSignIn }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged in parent will handle the rest
    } catch (e) {
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-white dark:bg-black flex flex-col"
      style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}
    >
      {/* Topbar */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-slate-900 dark:text-white">
          PED.RESUS
        </span>
        <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
          Emergency Reference
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🏥
            </div>
            <h1
              className="text-3xl font-black text-slate-900 dark:text-white mb-2"
              style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
            >
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in with Google to access PedResus on any device
            </p>
          </div>

          {/* Sign in card */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            {error && (
              <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
              )}
              {loading ? "Signing in..." : "Continue with Google"}
            </button>

            <p className="text-center text-[10px] text-slate-400 mt-4 font-mono">
              Your access is tied to your Google account — works on all devices
            </p>
          </div>

          <p className="text-center text-[10px] text-slate-400 mt-6 leading-relaxed">
            New user? Sign in first, then complete the ₹30 one-time payment to unlock access.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── PAYWALL PAGE ─────────────────────────────────────────────────────────────
function PaywallPage({ user, onSuccess }) {
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
      amount: PRICE_INR * 100,
      currency: "INR",
      name: "PedResus — Pediatric Emergency Reference",
      description: "Lifetime Access · One-time Payment",
      prefill: {
        name: user.displayName || "",
        email: user.email || "",
      },
      notes: { uid: user.uid, product: "PedResus Lifetime Access" },
      theme: { color: "#0f172a" },
      handler: async function (response) {
        await markUserPaid(user.uid, user.email, response.razorpay_payment_id);
        onSuccess();
      },
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

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const features = [
    "Weight-based drug dose calculator",
    "Resuscitation drugs (PALS 2020)",
    "Sedation & analgesia protocols",
    "Status epilepticus stepwise protocol",
    "India-specific empirical antibiotics",
    "Fluids, vitals, severity scores",
    "PALS algorithms & clinical pathways",
    "Neonatal NRP reference",
    "Broselow tape + ETT sizing",
    "Based on Fleischer & Ludwig, Harriet Lane & IAP 2024",
  ];

  return (
    <div
      className="min-h-screen bg-white dark:bg-black flex flex-col"
      style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}
    >
      {/* Topbar */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-slate-900 dark:text-white">
          PED.RESUS
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {user.photoURL && (
              <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
            )}
            <span className="text-xs text-slate-500 hidden sm:block">{user.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-slate-400 hover:text-slate-600 font-mono underline"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Signed in as {user.displayName?.split(" ")[0] || "Doctor"}
          </div>

          <h1
            className="text-4xl sm:text-5xl font-black leading-tight mb-4 text-slate-900 dark:text-white"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
          >
            One payment.
            <br />
            <span className="text-slate-400">Every device.</span>
            <br />
            Forever.
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
            Your access is linked to your Google account — pay once and sign in from your phone, tablet, or laptop anytime.
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {["Fleischer & Ludwig 7th ed", "Harriet Lane 22nd ed", "IAP Guidelines 2024", "PALS 2020"].map((r) => (
              <span key={r} className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-500">
                {r}
              </span>
            ))}
          </div>

          <div className="space-y-2.5">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black text-[9px] flex items-center justify-center font-bold flex-shrink-0">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Payment card */}
        <div>
          <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-8 text-white border border-slate-800">
            <div className="text-center pb-7 mb-7 border-b border-slate-700">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400 mb-3">
                One-time Access
              </p>
              <div className="flex items-start justify-center gap-1">
                <span className="text-2xl font-light text-slate-400 mt-2">₹</span>
                <span className="text-7xl font-black leading-none" style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                  {PRICE_INR}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-mono">Lifetime · All devices · No subscription</p>
            </div>

            <div className="space-y-3 mb-7">
              {[
                "Linked to your Google account",
                "Works on phone, tablet & laptop",
                "All 12 clinical tabs unlocked",
                "UPI · Cards · NetBanking",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0">✓</span>
                  {f}
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 text-xs text-red-400 bg-red-950 border border-red-800 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-4 rounded-xl text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                  Opening payment...
                </>
              ) : (
                <>🔒 Pay ₹{PRICE_INR} & Unlock Access</>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-600 mt-4 font-mono">
              Secured by Razorpay · India's trusted payment gateway
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROTECTED HOME ───────────────────────────────────────────────────────────
function ProtectedHome() {
  const [authState, setAuthState] = useState("loading"); // loading | signed-out | unpaid | paid
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setAuthState("signed-out");
        return;
      }
      setUser(firebaseUser);
      const paid = await checkUserPaid(firebaseUser.uid);
      setAuthState(paid ? "paid" : "unpaid");
    });
    return () => unsub();
  }, []);

  if (authState === "loading") return <LoadingScreen />;
  if (authState === "signed-out") return <SignInPage />;
  if (authState === "unpaid") return <PaywallPage user={user} onSuccess={() => setAuthState("paid")} />;
  return <Home user={user} />;
}

// ─── MAIN HOME APP ────────────────────────────────────────────────────────────
function Home({ user }) {
  const [tab, setTab] = useState("calculator");

  const TABS = [
    { id: "calculator",    label: "Calculator",          icon: Calculator,    Comp: CalculatorTab },
    { id: "equipment",     label: "Equipment & Tubes",   icon: Wrench,        Comp: EquipmentTab },
    { id: "resuscitation", label: "Resuscitation",       icon: Syringe,       Comp: ResuscitationTab },
    { id: "drugs",         label: "Drug Doses",          icon: Pill,          Comp: DrugsTab },
    { id: "fluids",        label: "Fluids",              icon: Drop,          Comp: FluidsTab },
    { id: "vitals",        label: "Vitals by Age",       icon: Heartbeat,     Comp: VitalsTab },
    { id: "scores",        label: "Severity Scores",     icon: ClipboardText, Comp: ScoresTab },
    { id: "sedation",      label: "Sedation & Analgesia",icon: FirstAid,      Comp: SedationAnalgesiaTab },
    { id: "neonatal",      label: "Neonatal (NRP)",      icon: Baby,          Comp: NeonatalTab },
    { id: "algorithms",    label: "PALS Algorithms",     icon: TreeStructure, Comp: AlgorithmsTab },
    { id: "pathways",      label: "Clinical Pathways",   icon: Stethoscope,   Comp: ClinicalPathwaysTab },
    { id: "imaging",       label: "Imaging",             icon: ImageIcon,     Comp: ImagingTab },
  ];

  const handleSignOut = async () => {
    await signOut(auth);
  };

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
          <div className="flex items-center gap-4">
            <span>Reference only. Verify against local formularies before administration.</span>
            {user && (
              <button onClick={handleSignOut} className="underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Sign out
              </button>
            )}
          </div>
        </footer>
      </main>
      <Toaster position="top-center" richColors />
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
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
