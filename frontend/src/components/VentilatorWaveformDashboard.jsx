import React, { useMemo } from "react";

const WAVEFORMS = [
  {
    key: "pressure",
    title: "Pressure",
    unit: "cmH2O",
    color: "#21d4fd",
    min: 0,
    max: 40,
    baseline: 5,
  },
  {
    key: "flow",
    title: "Flow",
    unit: "L/min",
    color: "#7cff6b",
    min: -60,
    max: 80,
    baseline: 0,
  },
  {
    key: "volume",
    title: "Volume",
    unit: "mL",
    color: "#ffca3a",
    min: 0,
    max: 600,
    baseline: 0,
  },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function waveformValue(type, t, breathLength) {
  const phase = (t % breathLength) / breathLength;
  const smallRipple = Math.sin(t * Math.PI * 5.5) * 0.018;

  if (type === "pressure") {
    const rise = smoothstep(0.02, 0.14, phase);
    const release = 1 - smoothstep(0.36, 0.46, phase);
    const plateau = rise * release;
    return 5 + plateau * 23 + smallRipple * 12;
  }

  if (type === "flow") {
    if (phase < 0.32) {
      return 62 * (1 - phase / 0.32) + smallRipple * 70;
    }

    const exhalePhase = (phase - 0.32) / 0.68;
    return -52 * Math.exp(-exhalePhase * 4.2) + smallRipple * 45;
  }

  if (phase < 0.34) {
    return 520 * smoothstep(0.02, 0.34, phase);
  }

  const exhalePhase = (phase - 0.34) / 0.66;
  return 520 * Math.exp(-exhalePhase * 3.35);
}

function makePath({ type, min, max, width, height, seconds, breathLength }) {
  const samples = 260;
  const points = [];

  for (let i = 0; i <= samples; i += 1) {
    const x = (i / samples) * width;
    const t = (i / samples) * seconds;
    const value = waveformValue(type, t, breathLength);
    const normalized = (value - min) / (max - min);
    const y = height - normalized * height;
    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return points.join(" ");
}

function WaveformPanel({
  waveform,
  width,
  height,
  seconds,
  breathLength,
  animated,
}) {
  const plotX = 72;
  const plotY = 30;
  const plotWidth = width - 96;
  const plotHeight = height - 52;

  const path = useMemo(
    () =>
      makePath({
        type: waveform.key,
        min: waveform.min,
        max: waveform.max,
        width: plotWidth,
        height: plotHeight,
        seconds,
        breathLength,
      }),
    [waveform, plotWidth, plotHeight, seconds, breathLength]
  );

  const baselineY =
    plotY +
    plotHeight -
    ((waveform.baseline - waveform.min) / (waveform.max - waveform.min)) *
      plotHeight;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${waveform.title} ventilator waveform`}
      className="vent-wave-panel"
    >
      <defs>
        <linearGradient id={`${waveform.key}-fade`} x1="0" x2="1">
          <stop offset="0%" stopColor={waveform.color} stopOpacity="0.18" />
          <stop offset="14%" stopColor={waveform.color} stopOpacity="1" />
          <stop offset="100%" stopColor={waveform.color} stopOpacity="1" />
        </linearGradient>

        <filter
          id={`${waveform.key}-glow`}
          x="-20%"
          y="-80%"
          width="140%"
          height="260%"
        >
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={width} height={height} rx="8" fill="#071015" />
      <rect
        x={plotX}
        y={plotY}
        width={plotWidth}
        height={plotHeight}
        fill="#091b20"
        stroke="#17333a"
      />

      {Array.from({ length: 9 }).map((_, i) => {
        const x = plotX + (i / 8) * plotWidth;
        return (
          <line
            key={`vertical-${i}`}
            x1={x}
            x2={x}
            y1={plotY}
            y2={plotY + plotHeight}
            stroke={i % 2 === 0 ? "#22464f" : "#17333a"}
            strokeWidth="1"
          />
        );
      })}

      {Array.from({ length: 5 }).map((_, i) => {
        const y = plotY + (i / 4) * plotHeight;
        const value = waveform.max - (i / 4) * (waveform.max - waveform.min);

        return (
          <g key={`horizontal-${i}`}>
            <line
              x1={plotX}
              x2={plotX + plotWidth}
              y1={y}
              y2={y}
              stroke={i === 2 ? "#315965" : "#17333a"}
              strokeWidth="1"
            />
            <text
              x={plotX - 12}
              y={y + 4}
              textAnchor="end"
              fill="#82a6ad"
              fontSize="12"
            >
              {Math.round(value)}
            </text>
          </g>
        );
      })}

      <line
        x1={plotX}
        x2={plotX + plotWidth}
        y1={baselineY}
        y2={baselineY}
        stroke="#4d7a83"
        strokeDasharray="5 7"
        strokeWidth="1"
      />

      <text x="18" y="22" fill="#d8f6f6" fontSize="15" fontWeight="700">
        {waveform.title}
      </text>
      <text x="18" y="42" fill="#7fa2aa" fontSize="12">
        {waveform.unit}
      </text>

      <g transform={`translate(${plotX} ${plotY})`}>
        <path
          d={path}
          fill="none"
          stroke={`url(#${waveform.key}-fade)`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${waveform.key}-glow)`}
          pathLength="1000"
          className={animated ? "vent-wave-trace" : undefined}
        />
      </g>

      <text
        x={width - 18}
        y={height - 14}
        textAnchor="end"
        fill="#6d929a"
        fontSize="11"
      >
        {seconds}s window
      </text>
    </svg>
  );
}

export default function VentilatorWaveformDashboard({
  seconds = 12,
  respiratoryRate = 18,
  animated = true,
}) {
  const breathLength = 60 / respiratoryRate;

  return (
    <section className="vent-dashboard">
      <style>{`
        .vent-dashboard {
          width: min(1120px, 100%);
          background: #03080b;
          border: 1px solid #163039;
          border-radius: 8px;
          padding: 16px;
          color: #d8f6f6;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .vent-dashboard-header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 16px;
          padding: 0 2px 14px;
          border-bottom: 1px solid #122a31;
          margin-bottom: 14px;
        }

        .vent-dashboard-title {
          margin: 0;
          font-size: 18px;
          line-height: 1.2;
          letter-spacing: 0;
        }

        .vent-dashboard-meta {
          display: flex;
          gap: 14px;
          color: #8eb2ba;
          font-size: 12px;
          white-space: nowrap;
        }

        .vent-wave-stack {
          display: grid;
          gap: 12px;
        }

        .vent-wave-panel {
          display: block;
          width: 100%;
          height: auto;
          min-height: 156px;
        }

        .vent-wave-trace {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: ventTrace 3.4s linear infinite;
        }

        @keyframes ventTrace {
          0% { stroke-dashoffset: 1000; }
          48% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1000; }
        }

        @media (max-width: 640px) {
          .vent-dashboard {
            padding: 10px;
          }

          .vent-dashboard-header {
            align-items: start;
            flex-direction: column;
          }

          .vent-dashboard-meta {
            flex-wrap: wrap;
            white-space: normal;
          }
        }
      `}</style>

      <header className="vent-dashboard-header">
        <h2 className="vent-dashboard-title">Ventilator Waveforms</h2>
        <div className="vent-dashboard-meta" aria-label="Ventilator settings">
          <span>RR {respiratoryRate}/min</span>
          <span>PEEP 5</span>
          <span>PC 23</span>
          <span>FiO2 40%</span>
        </div>
      </header>

      <div className="vent-wave-stack">
        {WAVEFORMS.map((waveform) => (
          <WaveformPanel
            key={waveform.key}
            waveform={waveform}
            width={1040}
            height={178}
            seconds={seconds}
            breathLength={breathLength}
            animated={animated}
          />
        ))}
      </div>
    </section>
  );
}
