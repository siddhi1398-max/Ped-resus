# PED.RESUS — Pediatric Emergency Reference

## Original Problem Statement
Build a comprehensive PALS/pediatric emergency reference app based on the provided HTML prototype. Key tabs: Equipment & Tubes (Broselow-Luten tape + tube/airway table), Live Weight-Based Calculator (reactive dose cards). Expand into fuller reference: Drug Doses, Vitals by age, PALS Algorithms, Fluids.

## User Choices (Feb 2026)
- Scope: Full PALS reference (multi-tab)
- Features: Dark mode toggle + PDF export of patient case
- Auth: None (public tool)
- Design: Design agent decided (Archetype 4 — Swiss & High-Contrast)
- Data: Hardcoded constants

## Architecture
- Frontend: React 19 + CRA + Tailwind + shadcn/ui + next-themes (theme) + jspdf + jspdf-autotable (PDF) + @phosphor-icons/react
- Fonts: Chivo (headings), IBM Plex Sans (body), JetBrains Mono (data/numbers)
- Backend: FastAPI (existing hello-world; no new endpoints required — app is 100% client-side for this MVP)
- State: React context (`WeightContext`) for weight shared across tabs.

## Persona
- Pediatric ED clinicians (doctors, nurses, paramedics)
- Use under pressure — must be fast, legible, high-contrast
- No login needed; reference tool

## What's Implemented (Feb 2026)
- Sticky TopBar with weight slider (0.5–60 kg, 0.5 step), numeric input, estimated age, Broselow zone indicator, dark/light toggle, Export PDF button
- 6 Tabs: Calculator (38 reactive dose cards), Equipment & Tubes (tape + table + formulas), Drug Doses (30+ drugs, searchable, category filter), Vitals by Age (HR/RR/SBP/DBP table + notes), PALS Algorithms (6 flows: arrest, bradycardia, tachycardia, shock, anaphylaxis, status epilepticus), Fluids (maintenance 4-2-1, Holliday-Segar, Parkland burns calculator with BSA input, DKA protocol, fluid types)
- Clickable Broselow tape (9 zones) — sets weight to zone median
- PDF export: patient snapshot + full drug dose sheet (jspdf-autotable)
- Dark/light theme (next-themes, class-based) with high-contrast surfaces
- All interactive elements have `data-testid` attributes

## Prioritized Backlog
- P1: Save cases to backend (persisted) with shareable link
- P1: Offline mode (PWA / service worker) for low-connectivity settings
- P2: Infusion calculator (mcg/kg/min → mL/hr)
- P2: APGAR scorer, GCS pediatric
- P2: Multi-language (es/fr) for international use
- P2: "Code timer" mode with audit log

## Next Tasks
- (Optional) Backend `/api/cases` POST/GET to save patient snapshots by shortcode
- Run testing_agent_v3 to validate all UI flows, slider reactivity, tabs, PDF export, theme toggle
