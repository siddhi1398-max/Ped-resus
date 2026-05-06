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
import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { WeightProvider } from "./context/WeightContext";
import TopBar from "./components/TopBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
const CalculatorTab           = lazy(() => import("./components/tabs/CalculatorTab"));
const EquipmentTab            = lazy(() => import("./components/tabs/EquipmentTab"));
const VitalsTab               = lazy(() => import("./components/tabs/VitalsTab"));
const ResuscitationTab        = lazy(() => import("./components/tabs/ResuscitationTab"));
const VentilatorTab           = lazy(() => import("./components/tabs/VentilatorTab"));
const FluidsTab               = lazy(() => import("./components/tabs/FluidsTab"));
const ABGTab                  = lazy(() => import("./components/tabs/ABGTab"));
const DrugsTab                = lazy(() => import("./components/tabs/DrugsTab"));
const SyrupCalculatorTab      = lazy(() => import("./components/tabs/SyrupCalculatorTab"));
const SedationAnalgesiaTab    = lazy(() => import("./components/tabs/SedationAnalgesiaTab"));
const NeonatalTab             = lazy(() => import("./components/tabs/NeonatalTab"));
const TraumaResuscitationTab  = lazy(() => import("./components/tabs/TraumaResuscitationTab"));
const ManagementAlgorithmsTab = lazy(() => import("./components/tabs/ManagementAlgorithmsTab"));
const PrehospitalTab          = lazy(() => import("./components/tabs/PrehospitalTab"));
const ImmunisationTab         = lazy(() => import("./components/tabs/ImmunisationTab"));
const CoPilotTab              = lazy(() => import("./components/tabs/CoPilotTab"));
import {
  Calculator, Wrench, Wind, Flask, Pill, Heartbeat, TreeStructure, Drop, Eyedropper,MoonStars, Baby,
  ClipboardText, Syringe, Stethoscope, FirstAid, Image as ImageIcon, Lightning,
  Lock, X, BookOpen, PersonSimpleBike, AirplaneInFlight,
} from "@phosphor-icons/react";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

// ─── FIREBASE ─────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};
const firebaseApp    = initializeApp(firebaseConfig);
const auth           = getAuth(firebaseApp);
const db             = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const PRICE_INR = 30;
const DEV_NAME  = "Dr. Siddhi Naik";
const DEV_TITLE = "Emergency Physician";
const DEV_EMAIL = "dr.siddhi.em@gmail.com";

const ALL_TABS = [
  { id: "calculator",    label: "Calculator",           icon: Calculator,       Comp: CalculatorTab,            free: true  },
  { id: "equipment",     label: "Equipments",           icon: Wrench,           Comp: EquipmentTab,             free: false },
  { id: "vitals",        label: "Vitals",               icon: Stethoscope,      Comp: VitalsTab,                free: false },
  { id: "resuscitation", label: "Resuscitation",        icon: Lightning,        Comp: ResuscitationTab,         free: false },
  { id: "ventilator",    label: "Ventilator",           icon: Wind,             Comp: VentilatorTab,            free: false },
  { id: "fluids",        label: "Fluids",               icon: Drop,             Comp: FluidsTab,                free: false },
  { id: "abg",           label: "ABG",                  icon: Flask,            Comp: ABGTab,                   free: false },
  { id: "drugs",         label: "Drugs",                icon: Pill,             Comp: DrugsTab,                 free: false },
  { id: "syrup",         label: "Syrup Calculator",     icon: Eyedropper,       Comp: SyrupCalculatorTab,       free: false },
  { id: "sedation",      label: "Sedation & Analgesia", icon: MoonStars,        Comp: SedationAnalgesiaTab,     free: false },
  { id: "neonatal",      label: "Neonatal",             icon: Baby,             Comp: NeonatalTab,              free: false },
  { id: "trauma",        label: "Trauma Resuscitation", icon: PersonSimpleBike, Comp: TraumaResuscitationTab,   free: false },
  { id: "algorithms",    label: "Management Algorithms",icon: TreeStructure,    Comp: ManagementAlgorithmsTab,  free: false },
  { id: "prehospital",   label: "Prehospital",          icon: ImageIcon,        Comp: PrehospitalTab,           free: false },
  { id: "immunisation",  label: "Immunisation",         icon: Syringe,          Comp: ImmunisationTab,          free: false },
  { id: "copilot",       label: "Co-Pilot",             icon: AirplaneInFlight, Comp: CoPilotTab,               free: true  },
];
const preloadAllTabs = () => {
  import("./components/tabs/EquipmentTab");
  import("./components/tabs/VitalsTab");
  import("./components/tabs/ResuscitationTab");
  import("./components/tabs/VentilatorTab");
  import("./components/tabs/FluidsTab");
  import("./components/tabs/ABGTab");
  import("./components/tabs/DrugsTab");
  import("./components/tabs/SyrupCalculatorTab");
  import("./components/tabs/SedationAnalgesiaTab");
  import("./components/tabs/NeonatalTab");
  import("./components/tabs/TraumaResuscitationTab");
  import("./components/tabs/ManagementAlgorithmsTab");
  import("./components/tabs/PrehospitalTab");
  import("./components/tabs/ImmunisationTab");
  import("./components/tabs/CoPilotTab");
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s   = document.createElement("script");
    s.src     = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

async function checkPaidByUid(uid) {
  try {
    const snap = await getDoc(doc(db, "paid_users", uid));
    return snap.exists() && snap.data().paid === true;
  } catch { return false; }
}

async function checkPaidByEmail(email) {
  try {
    const q    = query(collection(db, "paid_emails"), where("email", "==", email.toLowerCase()));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch { return false; }
}

async function checkAndLinkPaid(uid, email) {
  if (await checkPaidByUid(uid)) return true;
  if (email && await checkPaidByEmail(email)) {
    // Link email payment to uid for future logins
    await setDoc(doc(db, "paid_users", uid), {
      paid: true, email, linkedFromEmail: true, paidAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  }
  return false;
}

async function savePaidByUid(uid, email, paymentId) {
  await setDoc(doc(db, "paid_users", uid), {
    paid: true, email: email || "", paymentId, paidAt: new Date().toISOString(),
  }, { merge: true });
}

async function savePaidByEmail(email, paymentId) {
  const key = email.toLowerCase().replace(/[^a-z0-9]/g, "_");
  await setDoc(doc(db, "paid_emails", key), {
    email: email.toLowerCase(), paymentId, paidAt: new Date().toISOString(),
  });
}

// ─── RAZORPAY LAUNCHER ───────────────────────────────────────────────────────
// Standalone function — no React state, no hooks, no closures issues
// uid can be null for non-logged-in users
function openRazorpay({ email, uid, displayName, onSuccess, onError, onDismiss }) {
  const key = process.env.REACT_APP_RAZORPAY_KEY_ID;
  if (!key) { onError("Payment config missing. Contact " + DEV_EMAIL); return; }

  const frozenEmail = email;
  const frozenUid   = uid;

  const options = {
    key,
    amount:      PRICE_INR * 100,
    currency:    "INR",
    name:        "PedResus",
    description: "Lifetime Access — All Features",
    prefill:     { name: displayName || "", email: frozenEmail },
    theme:       { color: "#0f172a" },

    handler: async (response) => {
      try {
        await savePaidByEmail(frozenEmail, response.razorpay_payment_id);
        if (frozenUid) {
          await savePaidByUid(frozenUid, frozenEmail, response.razorpay_payment_id);
        }
        localStorage.setItem("paid_email", "true");
        onSuccess();
      } catch (e) {
        onError(
          `Payment done (ID: ${response.razorpay_payment_id}) but save failed. ` +
          `Email ${DEV_EMAIL} with this ID to unlock manually.`
        );
      }
    },

    modal: { ondismiss: onDismiss },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (r) => onError("Payment failed: " + r.error.description));
  rzp.open();
}
// ─── PAYWALL DIALOG ───────────────────────────────────────────────────────────
function PaywallDialog({ user, onSuccess, onClose }) {
  const [view,  setView]  = useState("choose"); // "choose" | "login" | "pay"
  const [email, setEmail] = useState("");
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState("");

  // If already logged in, skip choose screen
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setView("choose");
    }
  }, [user]);

  // ── Google Sign In ──
  const handleSignIn = async () => {
    setBusy(true); setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged in Home will detect login
      // checkAndLinkPaid will run and unlock if already paid
      onClose(); // close dialog — Home will handle unlock
    } catch {
      setError("Sign-in failed. Please try again.");
    }
    setBusy(false);
  };

  // ── Pay directly (no login needed) ──
  const handlePay = async () => {
    const payEmail = user?.email || email.trim();
    if (!payEmail || !payEmail.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    setBusy(true); setError("");

    const loaded = await loadRazorpay();
    if (!loaded) {
      setError("Could not load Razorpay. Check your internet.");
      setBusy(false);
      return;
    }

    openRazorpay({
      email:       payEmail,
      uid:         user?.uid || null,
      displayName: user?.displayName || "",
      onSuccess: () => {
        setBusy(false);
        toast.success("Payment successful! All tabs unlocked 🎉");
        onSuccess();
      },
      onError: (msg) => {
        setBusy(false);
        setError(msg);
      },
      onDismiss: () => {
        setBusy(false);
      },
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl border-t border-slate-200 dark:border-slate-700 px-5 pb-10 pt-4"
        style={{ maxHeight: "85vh", overflowY: "auto" }}>

        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
              Unlock Full Access
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              ₹{PRICE_INR} one-time · All devices · Lifetime
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">
            <X size={14} weight="bold" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 break-words">
            {error}
          </div>
        )}

        {/* ── CHOOSE VIEW: two big options side by side ── */}
        {view === "choose" && (
          <div className="space-y-3">

            {/* Already logged in — show user + pay button */}
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-xs mb-2">
                  {user.photoURL && <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />}
                  <span className="font-mono text-slate-600 dark:text-slate-300 truncate">{user.email}</span>
                  <button onClick={() => signOut(auth)} className="ml-auto text-[10px] text-slate-400 underline">Switch</button>
                </div>
                <button onClick={handlePay} disabled={busy}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl text-sm hover:bg-slate-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                  {busy && <span className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />}
                  {busy ? "Opening Razorpay..." : `🔒 Pay ₹${PRICE_INR} — Unlock All Tabs`}
                </button>
                <p className="text-center text-[10px] text-slate-400 font-mono">
                  Razorpay · UPI · Cards · NetBanking · Wallets
                </p>
              </>
            ) : (
              <>
                {/* NOT logged in — show two separate options */}
                <p className="text-xs text-slate-500 text-center mb-2">Choose how you'd like to continue</p>

                {/* Option A: Sign in with Google */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Sign in with Google
                  </div>
                  <div className="text-[10px] text-slate-400 mb-3">
                    Sign in first, then pay. Access syncs across all your devices automatically.
                  </div>
                  <button onClick={handleSignIn} disabled={busy}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50">
                    {busy
                      ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                      : <svg width="16" height="16" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                    }
                    Continue with Google
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  <span className="text-[10px] text-slate-400 font-mono">or</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                </div>

                {/* Option B: Pay directly with email */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Pay directly — no account needed
                  </div>
                  <div className="text-[10px] text-slate-400 mb-3">
                    Enter your email, pay with UPI/card. Sign in later with the same email to restore access.
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 mb-2"
                  />
                  <button onClick={handlePay} disabled={busy}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-2.5 rounded-lg text-sm hover:bg-slate-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}>
                    {busy && <span className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />}
                    {busy ? "Opening Razorpay..." : `🔒 Pay ₹${PRICE_INR}`}
                  </button>
                </div>

                <p className="text-center text-[10px] text-slate-400 font-mono pt-1">
                  Razorpay · UPI · Cards · NetBanking · Wallets
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function Home() {
  const [tab,        setTab]        = useState("calculator");
  const [user,       setUser]       = useState(null);
  const [paid,       setPaid]       = useState(false);
  const [authReady,  setAuthReady]  = useState(false);
  const [showDialog, setShowDialog] = useState(false);

 // useEffect 1 — auth check
useEffect(() => {
  return onAuthStateChanged(auth, async (u) => {
    setUser(u);
    if (u) {
      try {
        const hasPaid = await Promise.race([
          checkAndLinkPaid(u.uid, u.email),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 5000)
          )
        ]);
        setPaid(hasPaid);
        if (hasPaid) {
          localStorage.setItem(`paid_${u.uid}`, "true");
          setShowDialog(false);
        }
      } catch {
        const cachedPaid = localStorage.getItem(`paid_${u.uid}`) === "true";
        setPaid(cachedPaid);
        if (!cachedPaid) {
          toast.error("Couldn't verify access. Check your connection.");
        }
      }
    } else {
      const cachedPaid = localStorage.getItem("paid_email") === "true";
      setPaid(cachedPaid);
    }
    setAuthReady(true);
  });
}, []);

// useEffect 2 — preload all tabs after 5 seconds
useEffect(() => {
  const timer = setTimeout(preloadAllTabs, 5000);
  return () => clearTimeout(timer);
}, []);

  const handleTabClick = useCallback((tabId) => {
    const t = ALL_TABS.find(t => t.id === tabId);
    if (t?.free || paid) setTab(tabId);
    else setShowDialog(true);
  }, [paid]);

  const handleUnlock = useCallback(() => {
    setPaid(true);
    setShowDialog(false);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100"
      style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>

      {showDialog && (
        <PaywallDialog user={user} onSuccess={handleUnlock} onClose={() => setShowDialog(false)} />
      )}

      <TopBar />

      {/* Status bar */}
      <div className="border-b border-slate-100 dark:border-slate-900 px-4 sm:px-6 py-1.5 flex items-center justify-between max-w-7xl mx-auto">
        <div>
          {paid ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Full Access
            </span>
          ) : authReady ? (
            <button onClick={() => setShowDialog(true)}
              className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full hover:bg-amber-100 transition-colors">
              <Lock size={9} weight="bold" /> Unlock all tabs — ₹{PRICE_INR}
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.photoURL && <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />}
              <span className="text-[10px] text-slate-400 font-mono hidden sm:block truncate max-w-[160px]">{user.email}</span>
              <button onClick={() => { signOut(auth); setPaid(false); setUser(null); setTab("calculator"); }}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-mono underline">Sign out</button>
            </>
          ) : authReady ? (
            <button onClick={() => setShowDialog(true)} className="text-[10px] text-slate-400 hover:text-slate-600 font-mono underline">Sign in</button>
          ) : null}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={tab} onValueChange={(val) => handleTabClick(val)}>
          <TabsList className="w-full justify-start flex-wrap h-auto p-1.5 bg-slate-100 dark:bg-slate-900 gap-1">
            {ALL_TABS.map((t) => {
              const Icon = t.icon;
              const isLocked = !t.free && !paid;
              return (
                <TabsTrigger key={t.id} value={t.id} onClick={() => handleTabClick(t.id)}
                  title={isLocked ? `Unlock for ₹${PRICE_INR}` : t.label}
                  className="gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900">
                  <Icon size={13} weight="bold" />
                  {t.label}
                  {isLocked && <Lock size={9} weight="bold" className="text-amber-400 ml-0.5 opacity-75" />}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {ALL_TABS.map((t) => (
  <TabsContent key={t.id} value={t.id} className="mt-6 sm:mt-8 focus-visible:outline-none">
    <Suspense fallback={
      <div className="flex justify-center py-24">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      </div>
    }>
      <t.Comp />
    </Suspense>
  </TabsContent>
))}
        </Tabs>

        <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate.400">
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
              <a href={`mailto:${DEV_EMAIL}`} className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline">{DEV_EMAIL}</a>
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
