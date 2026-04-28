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

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };

  // Verify webhook signature from Razorpay
  const signature = event.headers["x-razorpay-signature"];
  const expected  = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(event.body)
    .digest("hex");

  if (signature !== expected) {
    return { statusCode: 400, body: "Invalid webhook signature" };
  }

  const payload = JSON.parse(event.body);
  if (payload.event !== "payment.captured") {
    return { statusCode: 200, body: "Event ignored" };
  }

  const payment = payload.payload.payment.entity;
  const uid     = payment.notes?.firebase_uid;

  if (!uid) {
    console.error("No firebase_uid in payment notes");
    return { statusCode: 400, body: "Missing firebase_uid" };
  }

  const db = getDb();
  await db.collection("paid_users").doc(uid).set({
    paid:       true,
    email:      payment.email || "",
    paymentId:  payment.id,
    paidAt:     new Date().toISOString(),
    verifiedBy: "razorpay-webhook",
  });

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
