import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  createCheckoutSession,
  pollCheckoutStatus,
  setUnlocked,
  getSavedEmail,
  restoreByEmail,
  isUnlocked as checkUnlocked,
} from "../lib/purchase";
import { Lock, CheckCircle, CurrencyInr, EnvelopeSimple, Heartbeat, ShieldCheck, FileArrowDown, Path, Pill } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const FEATURES = [
  { icon: Path, label: "Interactive clinical pathways (medical + surgical)" },
  { icon: Pill, label: "50+ drug doses with live weight-based calculation" },
  { icon: Heartbeat, label: "RSI / Sedation · Rule of 6s · Infusion calculator" },
  { icon: FileArrowDown, label: "Unlimited PDF exports — dose sheets + care plans" },
  { icon: ShieldCheck, label: "References: 2025 AHA · Tintinalli · F&L · Harriet Lane · IAP" },
];

export default function AppPaywall({ onUnlock }) {
  const [mode, setMode] = useState("buy");
  const [email, setEmail] = useState(getSavedEmail());
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("session_id");
    if (!sessionId) return;
    setStatus("polling");
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const data = await pollCheckoutStatus(sessionId);
        if (data.payment_status === "paid") {
          setUnlocked(sessionId, data.email);
          setStatus("success");
          toast.success("Unlock successful!");
          url.searchParams.delete("session_id");
          window.history.replaceState({}, "", url.toString());
          onUnlock?.();
          return;
        }
        if (data.status === "expired") {
          setStatus("error");
          setErrMsg("Checkout session expired. Please try again.");
          return;
        }
        if (attempts < 8) setTimeout(poll, 2000);
        else {
          setStatus("error");
          setErrMsg("Could not verify payment. If paid, use Restore by email.");
        }
      } catch {
        if (attempts < 8) setTimeout(poll, 2000);
        else {
          setStatus("error");
          setErrMsg("Network error verifying payment.");
        }
      }
    };
    poll();
  }, [onUnlock]);

  const handleBuy = async () => {
    if (!email || !email.includes("@")) {
      setErrMsg("Please enter a valid email.");
      return;
    }
    setErrMsg("");
    setStatus("creating");
    try {
      const { url } = await createCheckoutSession(email);
      setStatus("redirecting");
      window.location.href = url;
    } catch (e) {
      setStatus("error");
      setErrMsg(e.message || "Failed to start checkout");
    }
  };

  const handleRestore = async () => {
    if (!email || !email.includes("@")) {
      setErrMsg("Enter the email used at purchase.");
      return;
    }
    setErrMsg("");
    setStatus("polling");
    try {
      const { unlocked, session_id } = await restoreByEmail(email);
      if (unlocked) {
        setUnlocked(session_id, email);
        toast.success("Access restored!");
        onUnlock?.();
      } else {
        setStatus("error");
        setErrMsg("No paid purchase found for that email.");
      }
    } catch {
      setStatus("error");
      setErrMsg("Could not restore. Try again later.");
    }
  };

  return (
    <div
      data-testid="app-paywall"
      className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6"
      style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}
    >
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* LEFT — Brand + features */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-center gap-3">
            <Heartbeat size={36} weight="fill" className="text-red-600 dark:text-red-400" />
            <div>
              <div className="font-sans font-black tracking-tighter text-2xl sm:text-3xl">
                PED<span className="text-red-600 dark:text-red-400">.</span>RESUS
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mt-0.5">
                Pediatric Emergency Reference
              </div>
            </div>
          </div>

          <div>
            <h1 className="font-sans font-black tracking-tight text-3xl sm:text-5xl leading-[0.95]">
              Complete clinical reference for the pediatric ED.
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-4 text-base max-w-prose leading-relaxed">
              Weight-adjusted doses, interactive decision pathways, 2025 AHA algorithms, RSI quickstart,
              differentials, and exportable care plans — all at your fingertips.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.label} className="flex items-center gap-3">
                  <span className="rounded-md bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 p-2">
                    <Icon size={18} weight="bold" className="text-red-600 dark:text-red-400" />
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-200">{f.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* RIGHT — Checkout card */}
        <div className="md:col-span-2">
          <div className="rounded-lg border-2 border-slate-900 dark:border-white bg-white dark:bg-slate-950 p-5 sm:p-6 sticky top-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
              <Lock size={16} weight="fill" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Unlock — lifetime</span>
            </div>
            <div className="flex items-baseline gap-0.5 mb-1">
              <CurrencyInr size={32} weight="bold" />
              <span className="font-mono font-black text-5xl">50</span>
              <span className="text-slate-500 dark:text-slate-400 ml-2 text-sm">one-time</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              No subscription. Access this app forever on any device linked to your email.
            </div>

            <div className="flex rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden mb-4">
              <button
                data-testid="paywall-buy-tab"
                onClick={() => setMode("buy")}
                className={`flex-1 py-2 font-mono text-[10px] uppercase tracking-widest ${
                  mode === "buy" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "text-slate-500"
                }`}
              >
                Buy
              </button>
              <button
                data-testid="paywall-restore-tab"
                onClick={() => setMode("restore")}
                className={`flex-1 py-2 font-mono text-[10px] uppercase tracking-widest ${
                  mode === "restore" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "text-slate-500"
                }`}
              >
                Restore
              </button>
            </div>

            <label className="block mb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                <EnvelopeSimple size={12} weight="bold" /> Email
              </span>
              <Input
                data-testid="paywall-email"
                type="email"
                placeholder="you@clinic.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            {errMsg && <div className="text-xs text-red-600 dark:text-red-400 mb-2">{errMsg}</div>}

            {mode === "buy" ? (
              <Button
                data-testid="paywall-buy-button"
                onClick={handleBuy}
                disabled={status === "creating" || status === "redirecting" || status === "polling"}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {status === "redirecting" && "Redirecting to Stripe..."}
                {status === "polling" && "Verifying..."}
                {status === "creating" && "Starting..."}
                {(status === "idle" || status === "error") && "Pay ₹50 · Continue to Stripe"}
                {status === "success" && (
                  <span className="flex items-center gap-2">
                    <CheckCircle size={18} weight="fill" /> Unlocked!
                  </span>
                )}
              </Button>
            ) : (
              <Button
                data-testid="paywall-restore-button"
                onClick={handleRestore}
                disabled={status === "polling"}
                className="w-full"
              >
                {status === "polling" ? "Checking..." : "Restore access"}
              </Button>
            )}

            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 text-center">
              Secure payment via Stripe · No card details stored
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper: shows paywall or children based on unlock state
export function AppGate({ children }) {
  const [unlocked, setState] = useState(checkUnlocked());

  useEffect(() => {
    // Re-check on load in case localStorage changed
    setState(checkUnlocked());
  }, []);

  if (!unlocked) return <AppPaywall onUnlock={() => setState(true)} />;
  return children;
}
