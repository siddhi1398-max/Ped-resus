// STOPS neonatal mortality prognostic score
// Mathur NB et al. — Sensorium · Temperature · Oxygenation · Perfusion · Sugar
// Each parameter scored 0–2; total 0–10. Score > 2 predicts mortality.

export const STOPS_SCORE = {
  id: "stops",
  name: "STOPS Score",
  source: "Mathur NB et al. — Sensorium · Temperature · Oxygenation · Perfusion · Sugar (low-resource neonatal prognostic score)",
  items: [
    {
      key: "sensorium",
      label: "Sensorium",
      options: [
        { v: 0, l: "Active · normal cry" },
        { v: 1, l: "Lethargic · responds to stimulation" },
        { v: 2, l: "Comatose · no response" },
      ],
    },
    {
      key: "temperature",
      label: "Temperature (axillary)",
      options: [
        { v: 0, l: "36.5–37.5 °C — normal" },
        { v: 1, l: "32–36.4 °C mild hypothermia (or 37.6–38.5 °C)" },
        { v: 2, l: "< 32 °C severe hypothermia (or > 38.5 °C)" },
      ],
    },
    {
      key: "oxygenation",
      label: "Oxygenation",
      options: [
        { v: 0, l: "Pink in room air" },
        { v: 1, l: "Central cyanosis on air → pinks with O₂" },
        { v: 2, l: "Central cyanosis despite O₂ / requires PPV" },
      ],
    },
    {
      key: "perfusion",
      label: "Perfusion",
      options: [
        { v: 0, l: "CRT < 3 s · good peripheral pulse" },
        { v: 1, l: "CRT 3–5 s · weak pulse" },
        { v: 2, l: "CRT > 5 s · shock / bradycardia" },
      ],
    },
    {
      key: "sugar",
      label: "Sugar (blood glucose)",
      options: [
        { v: 0, l: "≥ 45 mg/dL (≥ 2.6 mmol/L) — normal" },
        { v: 1, l: "25–44 mg/dL (1.4–2.5 mmol/L) — hypoglycaemia" },
        { v: 2, l: "< 25 mg/dL · or > 150 mg/dL — severe dysglycaemia" },
      ],
    },
  ],
  interpret(total) {
    if (total <= 2) return { band: "emerald", label: `Score ${total} — low mortality risk`, total };
    if (total <= 4) return { band: "amber", label: `Score ${total} — high mortality risk (~ 60–70%)`, total };
    return { band: "red", label: `Score ${total} — extreme mortality risk (> 80%)`, total };
  },
};
