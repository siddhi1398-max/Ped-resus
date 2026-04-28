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
import { useState, useEffect, useCallback } from "react";
import { WeightProvider } from "./context/WeightContext";
import TopBar from "./components/TopBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
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
import IAPGuidelinesTab from "./components/tabs/IAPGuidelinesTab";
import {
  Calculator, Wrench, Pill, Heartbeat, TreeStructure, Drop, Baby,
  ClipboardText, Syringe, Stethoscope, FirstAid, Image as ImageIcon,
  Lock, X, CheckCircle, BookOpen, Warning,
} from "@phosphor-icons/react";

import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithPopup, GoogleAuthProvider,
  onAuthStateChanged, signOut,
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc, onSnapshot,
} from "firebase/firestore";

// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyC794KlXXWDOANEEtq2-s4cU8J9cD_9Qgs",
  authDomain:        "pedresus-3fb27.firebaseapp.com",
  projectId:         "pedresus-3fb27",
  storageBucket:     "pedresus-3fb27.firebasestorage.app",
  messagingSenderId: "70799823874",
  appId:             "1:70799823874:web:b5d4801bf42a0f8c5d431b",
  measurementId:     "G-B8JL4THBDL",
};

const firebaseApp    = initializeApp(firebaseConfig);
const auth           = getAuth(firebaseApp);
const db             = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// ─── APP CONFIG ───────────────────────────────────────────────────────────────
const PRICE_INR = 30;
const DEV_NAME  = "Dr. Siddhi Naik";
const DEV_TITLE = "Emergency Physician";
const DEV_EMAIL = "siddhi1398@gmail.com";

// ─── TABS ─────────────────────────────────────────────────────────────────────
const ALL_TABS = [
  { id: "calculator",    label: "Calculator",           icon: Calculator,    Comp: CalculatorTab,        free: true  },
  { id: "equipment",     label: "Equipment & Tubes",    icon: Wrench,        Comp: EquipmentTab,         free: false },
  { id: "resuscitation", label: "Resuscitation",        icon: Syringe,       Comp: ResuscitationTab,     free: false },
  { id: "drugs",         label: "Drug Doses",           icon: Pill,          Comp: DrugsTab,             free: false },
  { id: "fluids",        label: "Fluids",               icon: Drop,          Comp: FluidsTab,            free: false },
  { id: "vitals",        label: "Vitals by Age",        icon: Heartbeat,     Comp: VitalsTab,            free: false },
  { id: "scores",        label: "Severity Scores",      icon: ClipboardText, Comp: ScoresTab,            free: false },
  { id: "sedation",      label: "Sedation & Analgesia", icon: FirstAid,      Comp: SedationAnalgesiaTab, free: false },
  { id: "neonatal",      label: "Neonatal (NRP)",       icon: Baby,          Comp: NeonatalTab,          free: false },
  { id: "algorithms",    label: "PALS Algorithms",      icon: TreeStructure, Comp: AlgorithmsTab,        free: false },
  { id: "pathways",      label: "Clinical Pathways",    icon: Stethoscope,   Comp: ClinicalPathwaysTab,  free: false },
  { id: "iap",           label: "IAP Guidelines",       icon: BookOpen,      Comp: IAPGuidelinesTab,     free: false },
  { id: "imaging",       label: "Imaging",              icon: ImageIcon,     Comp: ImagingTab,           free: false },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const s   = document.createElement("script");
    s.id      = "razorpay-script";
    s.src     = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// Check Firestore if user has paid
async function checkUserPaid(uid) {
  try {
    const snap = await getDoc(doc(db, "paid_users", uid));
    return snap.exists() && snap.data().paid === true;
  } catch (e) {
    console.error("checkUserPaid error:", e);
    return false;
  }
}

// ── STEP 1: Create Razorpay order via backend ─────────────────────────────────
// This calls your Netlify function which creates the order server-side.
// Without this, there is no order_id → no signature → no webhook verification.
async function createRazorpayOrder(uid, email) {
  try {
    const res = await fetch("/.netlify/functions/create-order", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ uid, email, amount: PRICE_INR * 100 }),
    });
    if (!res.ok) throw new Error("Order creation failed");
    return await res.json(); // { orderId, amount, currency }
  } catch (e) {
    console.error("createRazorpayOrder error:", e);
    return null;
  }
}

// ── STEP 2: Verify payment via backend after Razorpay success callback ─────────
// Sends payment details to your Netlify function which:
// 1. Verifies the Razorpay signature (prevents fraud)
// 2. Writes paid: true to Firestore for this Firebase UID
async function verifyPaymentBackend(uid, email, orderId, paymentId, signature) {
  try {
    const res = await fetch("/.netlify/functions/verify-payment", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        firebase_uid:        uid,
        email,
        razorpay_order_id:   orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature:  signature,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Verification failed");
    return true;
  } catch (e) {
    console.error("verifyPaymentBackend error:", e);
    return false;
  }
}

// ─── PAYWALL DRAWER ───────────────────────────────────────────────────────────

function PaywallDrawer({ user, onSuccess, onClose }) {
  const [step,       setStep]      = useState(user ? "pay" : "signin");
  const [signingIn,  setSigningIn] = useState(false);
  const [paying,     setPaying]    = useState(false);
  const [verifying,  setVerifying] = useState(false);
  const [error,      setError]     = useState("");

  // Escape key closes drawer
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Advance to pay step when user signs in
  useEffect(() => {
    if (user && step === "signin") setStep("pay");
  }, [user, step]);

  // Listen for Firestore payment confirmation in real-time
  // This catches both webhook writes AND direct writes (belt & suspenders)
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      doc(db, "paid_users", user.uid),
      (snap) => {
        if (snap.exists() && snap.data().paid === true) {
          toast.success("Payment confirmed! All tabs unlocked 🎉");
          onSuccess();
        }
      }
    );
    return () => unsubscribe();
  }, [user, onSuccess]);

  const handleSignIn = async () => {
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
    if (!user) return;
    setPaying(true);
    setError("");

    // Step 1: Load Razorpay JS
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Failed to load Razorpay. Check your internet connection.");
      setPaying(false);
      return;
    }

    // Step 2: Create order via backend (gets orderId for signature)
    const order = await createRazorpayOrder(user.uid, user.email);
    if (!order) {
      setError("Could not create payment order. Please try again.");
      setPaying(false);
      return;
    }

    // Step 3: Open Razorpay checkout with orderId
    const options = {
      key:      process.env.REACT_APP_RAZORPAY_KEY,
      amount:   order.amount,
      currency: order.currency || "INR",
      order_id: order.orderId,  // ← critical: needed for signature verification
      name:     "PedResus — Pediatric Emergency Reference",
      description: "Lifetime Access · All Features",
      prefill:  { name: user.displayName || "", email: user.email || "" },
      theme:    { color: "#0f172a" },

      handler: async (response) => {
        // Step 4: Verify payment signature on backend → writes to Firestore
        setPaying(false);
        setVerifying(true);
        setError("");

        const verified = await verifyPaymentBackend(
          user.uid,
          user.email,
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature,
        );

        if (verified) {
          // Firestore onSnapshot listener above will fire and call onSuccess()
          // But also call directly as backup
          toast.success("Payment verified! Unlocking access...");
          onSuccess();
        } else {
          setError("Payment verification failed. Contact support with payment ID: " + response.razorpay_payment_id);
        }
        setVerifying(false);
      },

      modal: {
        ondismiss: () => {
          setPaying(false);
          setVerifying(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (r) => {
      setError("Payment failed: " + r.error.description);
      setPaying(false);
    });
    rzp.open();
  };

  const btnLabel = () => {
    if (verifying) return "Verifying payment...";
    if (paying)    return "Opening Razorpay...";
    return `🔒 Pay ₹${PRICE_INR} — Unlock Everything`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl border-t border-slate-200 dark:border-slate-700"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        role="dialog"
        aria-modal="false"
        aria-label="Unlock full access"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <div>
            <h2
              className="text-lg font-black text-slate-900 dark:text-white"
              style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
            >
              Unlock Full Access
            </h2>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              ₹{PRICE_INR} one-time · All devices · Lifetime · Esc or ✕ to close
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex-shrink-0"
            aria-label="Close"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="px-5 pb-8">
          {/* Free tab reminder */}
          <div className="flex items-center gap-2 mb-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
            <CheckCircle size={14} weight="fill" className="text-emerald-500 flex-shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              <strong>Calculator tab is always free.</strong> Close anytime — no obligation.
            </p>
          </div>

          {/* What's unlocked */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-4">
            {ALL_TABS.filter(t => !t.free).map(t => {
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700"
                >
                  <Icon size={11} weight="bold" className="text-slate-400 flex-shrink-0" />
                  {t.label}
                </div>
              );
            })}
          </div>

          {/* Step indicator */}
          {!user && (
            <div className="flex items-center gap-2 mb-4">
              <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider ${step === "signin" ? "text-slate-900 dark:text-white font-bold" : "text-slate-400"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${step === "signin" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-emerald-500 text-white"}`}>
                  {step === "signin" ? "1" : "✓"}
                </span>
                Sign in
              </div>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider ${step === "pay" ? "text-slate-900 dark:text-white font-bold" : "text-slate-400"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${step === "pay" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-slate-200 dark:bg-slate-700 text-slate-400"}`}>
                  2
                </span>
                Pay ₹{PRICE_INR}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <Warning size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Verifying state */}
          {verifying && (
            <div className="mb-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-amber-700 rounded-full animate-spin flex-shrink-0" />
              Verifying payment with Razorpay... please wait.
            </div>
          )}

          {/* STEP 1: Sign in */}
          {step === "signin" && (
            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 shadow-sm"
            >
              {signingIn ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )}
              {signingIn ? "Signing in..." : "Continue with Google"}
            </button>
          )}

          {/* STEP 2: Pay */}
          {step === "pay" && user && (
            <>
              <div className="flex items-center gap-2 mb-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
                {user.photoURL && (
                  <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full flex-shrink-0" />
                )}
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono truncate">
                  {user.email}
                </span>
                <button
                  onClick={() => signOut(auth)}
                  className="ml-auto text-[10px] text-emerald-600 underline flex-shrink-0"
                >
                  Switch
                </button>
              </div>

              <button
                onClick={handlePay}
                disabled={paying || verifying}
                className="w-full bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
              >
                {(paying || verifying) && (
                  <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                )}
                {btnLabel()}
              </button>

              <p className="text-center text-[10px] text-slate-400 mt-2 font-mono">
                Razorpay · UPI · Cards · NetBanking · Wallets
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── MAIN HOME ────────────────────────────────────────────────────────────────

function Home() {
  const [tab,        setTab]        = useState("calculator");
  const [user,       setUser]       = useState(null);
  const [paid,       setPaid]       = useState(false);
  const [authReady,  setAuthReady]  = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const hasPaid = await checkUserPaid(firebaseUser.uid);
        setPaid(hasPaid);
      } else {
        setPaid(false);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Real-time Firestore listener — catches webhook writes on any device
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      doc(db, "paid_users", user.uid),
      (snap) => {
        if (snap.exists() && snap.data().paid === true) {
          setPaid(true);
          setShowDrawer(false);
        }
      }
    );
    return () => unsubscribe();
  }, [user]);

  const handleTabClick = useCallback((tabId) => {
    const tabDef = ALL_TABS.find(t => t.id === tabId);
    if (!tabDef) return;
    if (tabDef.free || paid) {
      setTab(tabId);
      setShowDrawer(false);
    } else {
      setShowDrawer(true);
    }
  }, [paid]);

  const handlePaywallSuccess = useCallback(() => {
    setPaid(true);
    setShowDrawer(false);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    setPaid(false);
    setUser(null);
    setTab("calculator");
  };

  return (
    <div
      className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100"
      style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}
    >
      {showDrawer && (
        <PaywallDrawer
          user={user}
          onSuccess={handlePaywallSuccess}
          onClose={() => setShowDrawer(false)}
        />
      )}

      <TopBar />

      {/* Status bar */}
      <div className="border-b border-slate-100 dark:border-slate-900 px-4 sm:px-6 py-1.5 flex items-center justify-between max-w-7xl mx-auto">
        <div>
          {paid ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Full Access
            </span>
          ) : authReady ? (
            <button
              onClick={() => setShowDrawer(true)}
              className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full hover:bg-amber-100 transition-colors"
            >
              <Lock size={9} weight="bold" />
              Unlock all tabs — ₹{PRICE_INR}
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {user.photoURL && (
                <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />
              )}
              <span className="text-[10px] text-slate-400 font-mono hidden sm:block truncate max-w-[160px]">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-mono underline"
              >
                Sign out
              </button>
            </div>
          ) : authReady ? (
            <button
              onClick={() => setShowDrawer(true)}
              className="text-[10px] text-slate-400 hover:text-slate-600 font-mono underline"
            >
              Sign in
            </button>
          ) : null}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={tab} onValueChange={() => {}} data-testid="main-tabs">
          <TabsList className="w-full justify-start flex-wrap h-auto p-1.5 bg-slate-100 dark:bg-slate-900 gap-1">
            {ALL_TABS.map((t) => {
              const Icon     = t.icon;
              const isLocked = !t.free && !paid;
              return (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  data-testid={`tab-${t.id}`}
                  onClick={() => handleTabClick(t.id)}
                  title={isLocked ? `Unlock for ₹${PRICE_INR}` : t.label}
                  className="gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900"
                >
                  <Icon size={13} weight="bold" />
                  {t.label}
                  {isLocked && (
                    <Lock size={9} weight="bold" className="text-amber-400 ml-0.5 opacity-75" />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {ALL_TABS.map((t) => (
            <TabsContent
              key={t.id}
              value={t.id}
              className="mt-6 sm:mt-8 focus-visible:outline-none"
            >
              <t.Comp />
            </TabsContent>
          ))}
        </Tabs>

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
              <a href={`mailto:${DEV_EMAIL}`} className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors underline">
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
