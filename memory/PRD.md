# PED.RESUS — Pediatric Emergency Reference

## Original Problem Statement
Public, offline-style, weight-driven pediatric emergency reference for ED clinicians.
Hard-coded medical constants (doses, equipment sizes, algorithms) plus interactive
calculations, decision pathways, severity scores, neonatal resuscitation, imaging
reference, and exportable patient case PDFs. **No authentication. No paywall.**

## Architecture
- **Frontend** — React + Tailwind + shadcn/ui + Phosphor icons
  - Hardcoded medical constants in `/app/frontend/src/data/`
  - Tab-based UI in `/app/frontend/src/components/tabs/`
- **Backend** — FastAPI + MongoDB (minimal — only `/api/` and `/api/status` for
  health check / log)
- No auth, no payments, no third-party integrations.

## Tab Structure (final, 12 tabs)
1. Calculator
2. Equipment & Tubes
3. Resuscitation (RSI quickstart, infusions, rule of 6s, 7-Ps checklist)
4. Drug Doses
5. Fluids
6. Vitals by Age
7. Severity Scores (Pain, GCS, PEWS, Croup, Dehydration, PRAM)
8. Sedation & Analgesia (Local Anaesthetics, PSA, Nerve Blocks, LAST)
9. Neonatal (NRP)
10. PALS Algorithms
11. Clinical Pathways (Interactive runner + Differential lookup)
12. Imaging (X-Ray, CT, MRI, POCUS)

## What's Implemented
**Feb 2026 — restructure & deployment prep**
- Removed app paywall and all Stripe backend/frontend code
- Renamed RSI/Sedation tab → Resuscitation
- Created Sedation & Analgesia tab with: local-anaesthetic max-dose table, PSA
  principles + 6 ED regimens, 8 pediatric nerve blocks (FICB, digital, auricular,
  supraorbital, infraorbital, femoral, haematoma, penile), LAST rescue protocol
- Created Imaging tab with 4 modalities × 8/4/4/7 high-yield findings, inline CC
  images with `onError` fallback, Radiopaedia deep links
- Merged Pathways + Differentials into single Clinical Pathways tab (toggle modes)
- Removed orphan files: AppPaywall.jsx, purchase.js, PathwaysTab.jsx,
  DifferentialsTab.jsx; cleared dead `LOCAL_ANAESTHETICS` export from fluids.js
- Backend simplified to `/api/` and `/api/status` only

**Earlier work (carried over)**
- Broselow tape + zone indicator
- 70+ drugs in `data/drugs.js` with weight-reactive dose calculator
- 2025 AHA PALS algorithms, NRP flow
- Care plan PDF export from pathway results; patient case PDF from TopBar
- 10 differential algorithms, 7 interactive pathways

## Testing Status
- `iteration_1.json`: backend 100%, frontend 100% (50/52 assertions, 2 false positives)
- Pytest backend suite at `/app/backend/tests/backend_test.py`

## Backlog / Future
- P2: dose-check safety feature comparing requested vs given doses (session memory)
- P2: Service-worker for fully offline PWA install
- P3: Migrate FastAPI shutdown handler to lifespan API
- P3: Print-friendly view for individual nerve-block / imaging cards

## Key Files
- `/app/backend/server.py` — minimal FastAPI
- `/app/frontend/src/App.js` — 12-tab router
- `/app/frontend/src/data/{drugs,fluids,vitals,scores,pathways,differentials,sedationAnalgesia,imaging,...}.js`
- `/app/frontend/src/components/tabs/*` — one component per tab
