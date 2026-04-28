import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();

exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  const webhookSecret = "resuscitation"; // from Razorpay dashboard

  try {
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    // ❌ Reject if signature invalid
    if (signature !== expectedSignature) {
      return res.status(400).send("Invalid signature");
    }

    const event = req.body.event;

    // ✅ Handle successful payment
    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;

      const paymentId = payment.id;
      const amount = payment.amount;

      // 🔑 Identify user (you must pass this during payment)
      const userId = payment.notes?.userId;

      if (userId) {
        await admin.firestore().collection("users").doc(userId).set({
          paid: true,
          paymentId: paymentId,
          amount: amount,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    }
    return res.status(200).send("OK");

  } catch (err) {
    console.error(err);
    return res.status(500).send("Webhook error");
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
}
