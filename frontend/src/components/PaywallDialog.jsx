// frontend/src/components/PaywallDialog.jsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Lock, CheckCircle, EnvelopeSimple, CurrencyInr } from "@phosphor-icons/react";
import { toast } from "sonner";
import { auth } from "../lib/firebase"; // adjust path if needed

export default function PaywallDialog({ open, onOpenChange, onUnlock }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    // Pre-fill email from Firebase auth if logged in
    const user = auth.currentUser;
    if (user?.email) setEmail(user.email);
  }, [open]);

  const handlePay = async () => {
    if (!email || !email.includes("@")) {
      setErrMsg("Please enter a valid email.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setErrMsg("Please log in first.");
      return;
    }

    setErrMsg("");
    setStatus("creating");

    try {
      // 1. Create order on your backend
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid:    user.uid,
          email:  email,
          amount: 5000, // ₹50 in paise
        }),
      });

      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "Failed to create order");

      setStatus("redirecting");

      // 2. Open Razorpay popup
      const options = {
        key:      process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount:   order.amount,
        currency: order.currency,
        name:     "Ped Resus",
        description: "Lifetime PDF Unlock",
        order_id: order.orderId,
        prefill:  { email },
        theme:    { color: "#dc2626" },

        handler: async function (response) {
          // 3. Verify payment on your backend
          setStatus("polling");
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                firebase_uid:        user.uid,
                email,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error);

            setStatus("success");
            toast.success("Payment successful! Access unlocked.");
            onUnlock?.();
          } catch (e) {
            setStatus("error");
            setErrMsg("Payment done but verification failed. Contact support.");
          }
        },

        modal: {
          ondismiss: () => {
            setStatus("idle");
            setErrMsg("Payment cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (e) {
      setStatus("error");
      setErrMsg(e.message || "Something went wrong.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
            <Lock size={18} weight="fill" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">PDF export · locked</span>
          </div>
          <DialogTitle className="text-2xl">Unlock PDF Exports</DialogTitle>
          <DialogDescription>
            One-time purchase of ₹50. Lifetime access to PDF exports.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <div className="font-sans font-bold text-base">Lifetime PDF unlock</div>
            <div className="text-xs text-slate-500">All current &amp; future PDF exports</div>
          </div>
          <div className="flex items-baseline gap-0.5">
            <CurrencyInr size={24} weight="bold" className="text-slate-700 dark:text-slate-200" />
            <span className="font-mono font-black text-3xl">50</span>
          </div>
        </div>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500 flex items-center gap-1 mb-1">
            <EnvelopeSimple size={12} weight="bold" /> Email for receipt
          </span>
          <Input
            type="email"
            placeholder="you@clinic.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {errMsg && <div className="text-xs text-red-600 dark:text-red-400">{errMsg}</div>}

        {status === "success" ? (
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle size={18} weight="fill" />
            <span className="font-bold">Unlocked!</span>
          </div>
        ) : (
          <Button
            onClick={handlePay}
            disabled={["creating","redirecting","polling"].includes(status)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {status === "creating"   && "Creating order..."}
            {status === "redirecting" && "Opening payment..."}
            {status === "polling"    && "Verifying payment..."}
            {(status === "idle" || status === "error") && "Pay ₹50 · Razorpay"}
          </Button>
        )}

        <div className="text-[10px] text-slate-400 text-center">
          Secure payment via Razorpay. UPI, cards, netbanking accepted.
        </div>
      </DialogContent>
    </Dialog>
  );
}
