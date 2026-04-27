import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { createCheckoutSession, pollCheckoutStatus, setUnlocked, getSavedEmail, restoreByEmail } from "../lib/purchase";
import { Lock, CheckCircle, Spinner, EnvelopeSimple, CurrencyInr } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function PaywallDialog({ open, onOpenChange, onUnlock }) {
  const [mode, setMode] = useState("buy"); // "buy" | "restore"
  const [email, setEmail] = useState(getSavedEmail());
  const [status, setStatus] = useState("idle"); // idle | creating | redirecting | polling | success | error
  const [errMsg, setErrMsg] = useState("");

  // If redirected back from Stripe with ?session_id=..., poll for status
  useEffect(() => {
    if (!open) return;
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("session_id");
    if (!sessionId) return;
    setStatus("polling");
    let attempts = 0;
    const maxAttempts = 6;
    const poll = async () => {
      attempts += 1;
      try {
        const data = await pollCheckoutStatus(sessionId);
        if (data.payment_status === "paid") {
          setUnlocked(sessionId, data.email);
          setStatus("success");
          toast.success("Unlock successful! PDF exports enabled.");
          onUnlock?.();
          url.searchParams.delete("session_id");
          window.history.replaceState({}, "", url.toString());
          return;
        }
        if (data.status === "expired") {
          setStatus("error");
          setErrMsg("Checkout session expired.");
          return;
        }
        if (attempts < maxAttempts) setTimeout(poll, 2000);
        else {
          setStatus("error");
          setErrMsg("Status check timed out. If paid, use 'Restore by email'.");
        }
      } catch (e) {
        if (attempts < maxAttempts) setTimeout(poll, 2000);
        else {
          setStatus("error");
          setErrMsg("Could not verify payment.");
        }
      }
    };
    poll();
  }, [open, onUnlock]);

  const handleBuy = async () => {
    if (!email || !email.includes("@")) {
      setErrMsg("Please enter a valid email for receipt and restore.");
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
      setErrMsg(e.message || "Failed to create checkout session");
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
        setStatus("success");
        toast.success("Access restored!");
        onUnlock?.();
      } else {
        setStatus("error");
        setErrMsg("No paid purchase found for that email.");
      }
    } catch {
      setStatus("error");
      setErrMsg("Could not restore. Try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="paywall-dialog">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
            <Lock size={18} weight="fill" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">PDF export · locked</span>
          </div>
          <DialogTitle className="text-2xl">Unlock PDF Exports</DialogTitle>
          <DialogDescription>
            One-time purchase. Lifetime access to PDF export of patient dose sheets, care plans, and pathway
            outcomes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
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
            Restore by email
          </button>
        </div>

        <div className="flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <div className="font-sans font-bold text-base">Lifetime PDF unlock</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">All current &amp; future PDF exports</div>
          </div>
          <div className="flex items-baseline gap-0.5">
            <CurrencyInr size={24} weight="bold" className="text-slate-700 dark:text-slate-200" />
            <span className="font-mono font-black text-3xl">50</span>
          </div>
        </div>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
            <EnvelopeSimple size={12} weight="bold" /> Email for receipt / restore
          </span>
          <Input
            data-testid="paywall-email"
            type="email"
            placeholder="you@clinic.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {errMsg && <div className="text-xs text-red-600 dark:text-red-400">{errMsg}</div>}

        {status === "success" ? (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={18} weight="fill" />
            <span className="font-bold">Unlocked!</span>
          </div>
        ) : mode === "buy" ? (
          <Button
            data-testid="paywall-buy-button"
            onClick={handleBuy}
            disabled={status === "creating" || status === "redirecting" || status === "polling"}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {status === "creating" && <Spinner className="animate-spin" />}
            {status === "redirecting" && "Redirecting to Stripe..."}
            {status === "polling" && "Verifying payment..."}
            {(status === "idle" || status === "error") && "Pay ₹50 · Continue to Stripe"}
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

        <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
          Secure payment via Stripe. No card details stored by this app.
        </div>
      </DialogContent>
    </Dialog>
  );
}
