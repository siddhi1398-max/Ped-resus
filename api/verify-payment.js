// api/verify-payment.js
const crypto = require("crypto");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, firebase_uid, email } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !firebase_uid) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: "Invalid payment signature" });
  }

  try {
    const db = getDb();
    await db.collection("paid_users").doc(firebase_uid).set({
      paid:      true,
      email:     email || "",
      paymentId: razorpay_payment_id,
      orderId:   razorpay_order_id,
      paidAt:    new Date().toISOString(),
      verifiedBy: "razorpay-webhook",
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("verify-payment error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
