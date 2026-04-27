// Purchase / unlock state management
// Stored in localStorage for freemium trial model (PDF export gated)

const UNLOCK_KEY = "pedResusUnlocked";
const SESSION_KEY = "pedResusSessionId";
const EMAIL_KEY = "pedResusEmail";

export function isUnlocked() {
  try {
    return localStorage.getItem(UNLOCK_KEY) === "true";
  } catch {
    return false;
  }
}

export function setUnlocked(sessionId, email) {
  try {
    localStorage.setItem(UNLOCK_KEY, "true");
    if (sessionId) localStorage.setItem(SESSION_KEY, sessionId);
    if (email) localStorage.setItem(EMAIL_KEY, email);
  } catch {
    /* ignore */
  }
}

export function getSavedEmail() {
  try {
    return localStorage.getItem(EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

export function clearUnlock() {
  try {
    localStorage.removeItem(UNLOCK_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

const API = process.env.REACT_APP_BACKEND_URL;

export async function createCheckoutSession(email) {
  const origin = window.location.origin;
  const res = await fetch(`${API}/api/payments/create-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ origin_url: origin, email }),
  });
  if (!res.ok) throw new Error("Failed to create checkout session");
  return res.json();
}

export async function pollCheckoutStatus(sessionId) {
  const res = await fetch(`${API}/api/payments/checkout-status/${sessionId}`);
  if (!res.ok) throw new Error("Failed to check status");
  return res.json();
}

export async function restoreByEmail(email) {
  const res = await fetch(`${API}/api/payments/restore-by-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to restore");
  return res.json();
}
