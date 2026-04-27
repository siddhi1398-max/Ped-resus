# PED.RESUS — Pediatric Emergency Reference

## Original Problem Statement
Pediatric emergency reference app. Expanded from an initial HTML prototype into a comprehensive PALS/pediatric reference with interactive clinical pathways, scores, and one-time-purchase PDF export.

## User Choices
- Design: Design agent (Swiss/high-contrast, no-gradients)
- Auth: None (public tool)
- PDF export: One-time Stripe purchase (lifetime)
- Price: ₹50 INR (minimum Stripe allows; user requested ₹20 but Stripe requires ≥ $0.50 USD ≈ ₹42)
- Paywall model: Trial — all tabs free, PDF export gated
- Restore: Email-based restore via backend

## Architecture
- Frontend: React 19 + CRA + Tailwind + shadcn/ui + next-themes + jspdf + jspdf-autotable + @phosphor-icons/react + fontsource (Chivo / IBM Plex Sans / JetBrains Mono)
- Backend: FastAPI + MongoDB + motor + emergentintegrations (Stripe checkout)
- State: React context (`WeightContext`) shared across tabs; localStorage for unlock state

## Implemented (as of Feb 2026)

### 11 Tabs
1. **Calculator** — 38 reactive dose cards for current weight
2. **Equipment & Tubes** — Broselow tape + full tube/airway table + formulas
3. **RSI / Sedation** — merged airway + sedation tab with 4 sub-sections:
   - RSI Quickstart (pre-med, induction, paralysis, post-intubation) + reversal calculations
   - Infusions (mL/hr) — interactive calculator for 13 continuous infusions
   - Rule of 6s — Tintinalli 109-1/2 (mL/hr ≡ mcg/kg/min); 8 drugs with live mixture + pump-rate calc
   - 7 Ps Checklist (Walls)
4. **Drug Doses** — 50+ drugs (incl. diclofenac, ketorolac, hydromorphone, oxycodone, tramadol, IN ketamine, nitrous oxide, local anaesthetics, sucrose 24%, PGE1, caffeine citrate, surfactant, vit K, etc.) with category filter, search, live-calc
5. **Fluids** — maintenance, Parkland burns, DKA protocol, age-adjusted EBV, ABL, NPO deficit, local anaesthetic max-dose, transfusion quick-ref
6. **Vitals by Age** — HR/RR/SBP/DBP + temp + SpO₂ notes
7. **Pain & Scores** — 6 interactive scorers (FLACC, FACES, NRS, Peds GCS, PEWS, Westley Croup, Gorelick Dehydration, PRAM Asthma) with auto-tool selection, decision pathways, and weight-specific footer doses
8. **Pathways** — interactive decision trees (fever in infant, PECARN head injury, respiratory distress differential, acute abdomen with 10 surgical branches, trauma primary survey ABCDE). Each result includes care plan + PDF export
9. **Neonatal (NRP)** — NRP 2020 content: dose cards, APGAR, SpO₂ targets, equipment by weight, UVC depth, pearls
10. **PALS Algorithms** — 7 algorithms updated to **2025 AHA**: NRP, Cardiac Arrest (with official AHA PDF link + physiology-directed CPR + ECPR), Bradycardia, Tachycardia, Shock, Anaphylaxis, Status Epilepticus. Includes 2025 key-updates panel (6 big-number callouts) + SVG CPR-cadence visual
11. **Differentials** — 7 F&L-style diagnostic algorithms (altered mental status, acute limp, vomiting, fever-rash, apnoea/BRUE, syncope, first seizure) each with mnemonic, structured DDx table, and red-flag panel

### Payments (Stripe one-time)
- Backend: `/api/payments/create-checkout`, `/checkout-status/{id}`, `/restore-by-email`, `/webhook/stripe`
- Server-defined price (₹50); no client price manipulation
- `payment_transactions` MongoDB collection (email, session_id, status, idempotent updates)
- Webhook with event signature verification via emergentintegrations
- Frontend: `PaywallDialog` with Buy/Restore modes, Stripe redirect, polling on return, restore-by-email
- Gated exports: TopBar "Export PDF" + Pathways result "Download Care Plan PDF" (shows Lock icon when locked)

### Reference citations throughout
- 2025 AHA PALS · NRP 2020 · Tintinalli Emergency Medicine · Fleischer & Ludwig · Harriet Lane Handbook 23rd ed · IAP guidelines

## Next Tasks / Backlog
- P1: Care-plan "bundle" button on score results (extend beyond pathways)
- P2: Infusion dose-check (prevent re-dose within safe window)
- P2: Apgar / GCS quick-scorer add to Neonatal tab
- P2: Offline PWA with service worker
- P2: i18n (es/fr/hi) for international use
