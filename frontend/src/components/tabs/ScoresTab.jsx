import { useState, useMemo } from "react";
import { useWeight } from "../../context/WeightContext";
import Scorer, { TONE } from "../Scorer";
import { FilePdf } from "@phosphor-icons/react";
import { toast } from "sonner";
import { exportCarePlanPDF } from "../../lib/exportCarePlan";
import {
  FLACC,
  FACES,
  NRS,
  recommendPainTool,
  PAIN_PATHWAY,
  calcDrug,
  GCS_VERBAL,
  GCS_INFANT,
  gcsInterpret,
  PEWS,
  WESTLEY,
  DEHYDRATION,
  PRAM,
} from "../../data/scores";

const SUB_SECTIONS = [
  { id: "pain", label: "Pain" },
  { id: "gcs", label: "Pediatric GCS" },
  { id: "pews", label: "PEWS" },
  { id: "croup", label: "Westley Croup" },
  { id: "dehydration", label: "Dehydration" },
  { id: "asthma", label: "PRAM Asthma" },
];

export default function ScoresTab() {
  const { weight } = useWeight();
  const [section, setSection] = useState("pain");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">Pain & Severity Scores</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Interactive scorers with weight-adjusted treatment pathways. Current weight{" "}
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{weight} kg</span>. References:
          IAP guidelines, Fleischer &amp; Ludwig, Harriet Lane Handbook.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SUB_SECTIONS.map((s) => (
          <button
            key={s.id}
            data-testid={`scores-sub-${s.id}`}
            onClick={() => setSection(s.id)}
            className={`px-3 py-2 rounded-md border font-mono text-[11px] uppercase tracking-widest transition-all ${
              section === s.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "pain" && <PainSection />}
      {section === "gcs" && <GcsSection />}
      {section === "pews" && <SingleScorer def={PEWS} />}
      {section === "croup" && <SingleScorer def={WESTLEY} footer={<CroupFooter />} />}
      {section === "dehydration" && <SingleScorer def={DEHYDRATION} footer={<DehydrationFooter />} />}
      {section === "asthma" && <SingleScorer def={PRAM} footer={<AsthmaFooter />} />}
    </div>
  );
}

// ═══════════════════════════ Pain Section ═══════════════════════════
function PainSection() {
  const { weight } = useWeight();
  const recommended = recommendPainTool(weight);
  const [tool, setTool] = useState(recommended);
  const [result, setResult] = useState(null);
  const [facesScore, setFacesScore] = useState(null);
  const [nrsScore, setNrsScore] = useState(null);

  // Determine which band result to drive the pathway from
  const activeBand = useMemo(() => {
    if (tool === "flacc") return result?.band;
    if (tool === "faces") {
      if (facesScore == null) return null;
      return FACES.interpret(facesScore).band;
    }
    if (tool === "nrs") {
      if (nrsScore == null) return null;
      return NRS.interpret(nrsScore).band;
    }
    return null;
  }, [tool, result, facesScore, nrsScore]);

  const tools = [
    { id: "flacc", name: "FLACC", hint: FLACC.ageRange },
    { id: "faces", name: "Wong-Baker FACES", hint: FACES.ageRange },
    { id: "nrs", name: "NRS (0–10)", hint: NRS.ageRange },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Recommended tool for {weight} kg</div>
            <div className="font-sans font-bold text-base mt-0.5">
              {tools.find((t) => t.id === recommended).name}{" "}
              <span className="font-normal text-slate-500 dark:text-slate-400 text-sm">· {tools.find((t) => t.id === recommended).hint}</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {tools.map((t) => (
              <button
                key={t.id}
                data-testid={`pain-tool-${t.id}`}
                onClick={() => {
                  setTool(t.id);
                  setResult(null);
                  setFacesScore(null);
                  setNrsScore(null);
                }}
                className={`px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-widest border transition-all ${
                  tool === t.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                    : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tool === "flacc" && <Scorer definition={FLACC} onResult={setResult} />}
      {tool === "faces" && <FacesPicker onChange={setFacesScore} score={facesScore} />}
      {tool === "nrs" && <NrsPicker onChange={setNrsScore} score={nrsScore} />}

      {activeBand && <AnalgesiaPathway band={activeBand} />}
    </div>
  );
}

function FacesPicker({ score, onChange }) {
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5">
      <div className="font-sans font-bold text-base">Wong-Baker FACES</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mt-0.5 mb-4">
        Ask the child to point to the face that matches how they feel
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {FACES.faces.map((f) => {
          const selected = score === f.score;
          return (
            <button
              key={f.score}
              data-testid={`faces-${f.score}`}
              onClick={() => onChange(f.score)}
              className={`flex flex-col items-center gap-1 rounded-md border-2 p-3 transition-all ${
                selected
                  ? "border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              <span className="text-3xl sm:text-4xl">{f.face}</span>
              <span className="font-mono font-bold text-lg">{f.score}</span>
              <span className="text-[10px] text-center text-slate-500 dark:text-slate-400 leading-tight">{f.label}</span>
            </button>
          );
        })}
      </div>
      {score != null && (
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Total</span>
          <span className={`font-mono text-sm font-bold rounded-md border px-3 py-2 ${TONE[FACES.interpret(score).band]}`}>
            {FACES.interpret(score).label}
          </span>
        </div>
      )}
    </div>
  );
}

function NrsPicker({ score, onChange }) {
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5">
      <div className="font-sans font-bold text-base">Numeric Rating Scale (0–10)</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mt-0.5 mb-4">
        Ask: "On a scale of 0 (no pain) to 10 (worst pain), how bad is your pain now?"
      </div>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }, (_, i) => {
          const selected = score === i;
          return (
            <button
              key={i}
              data-testid={`nrs-${i}`}
              onClick={() => onChange(i)}
              className={`font-mono font-bold rounded py-3 border-2 transition-all ${
                selected
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {i}
            </button>
          );
        })}
      </div>
      {score != null && (
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Score</span>
          <span className={`font-mono text-sm font-bold rounded-md border px-3 py-2 ${TONE[NRS.interpret(score).band]}`}>
            {NRS.interpret(score).label}
          </span>
        </div>
      )}
    </div>
  );
}

function AnalgesiaPathway({ band }) {
  const { weight } = useWeight();
  const pw = PAIN_PATHWAY[band];
  if (!pw) return null;

  return (
    <div data-testid="analgesia-pathway" className={`rounded-md border-2 p-5 ${TONE[pw.tone]}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-75">Decision pathway</span>
      </div>
      <h4 className="font-sans font-bold text-lg">{pw.title}</h4>

      <div className="mt-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-75 mb-1.5">Non-pharmacological</div>
        <ul className="text-sm space-y-1">
          {pw.nonPharm.map((n) => (
            <li key={n} className="flex gap-2">
              <span className="opacity-60">·</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-75 mb-1.5">
          Recommended drugs · live dose for {weight} kg
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {pw.drugs.map((d) => (
            <div
              key={d.name}
              data-testid={`pathway-drug-${d.name}`}
              className="rounded-md bg-white/70 dark:bg-black/40 border border-current/30 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-sm">{d.name}</div>
                <div className="font-mono font-bold text-sm whitespace-nowrap">{calcDrug(d, weight)}</div>
              </div>
              <div className="font-mono text-[10px] opacity-70 mt-0.5">{d.route}</div>
              {d.note && <div className="text-xs opacity-80 mt-1">{d.note}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════ GCS Section ═══════════════════════════
function GcsSection() {
  const { weight } = useWeight();
  const autoInfant = weight <= 10;
  const [version, setVersion] = useState(autoInfant ? "infant" : "verbal");
  const def = version === "infant" ? GCS_INFANT : GCS_VERBAL;

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        <button
          data-testid="gcs-infant"
          onClick={() => setVersion("infant")}
          className={`px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-widest border ${
            version === "infant"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
              : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Infant / pre-verbal
        </button>
        <button
          data-testid="gcs-verbal"
          onClick={() => setVersion("verbal")}
          className={`px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-widest border ${
            version === "verbal"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
              : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Verbal child (&gt; 2 yr)
        </button>
        {autoInfant && version === "verbal" && (
          <div className="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 py-1.5">
            Weight suggests infant version
          </div>
        )}
      </div>

      <GcsScorer def={def} />
    </div>
  );
}

function GcsScorer({ def }) {
  return (
    <Scorer
      key={def.id}
      definition={{
        ...def,
        interpret(total) {
          const i = gcsInterpret(total);
          return { band: i.band, label: `Total ${total} — ${i.label}`, total };
        },
      }}
    />
  );
}

// ═══════════════════════════ Helpers ═══════════════════════════
function SingleScorer({ def, footer }) {
  return <Scorer definition={def} extraFooter={footer} />;
}

function CroupFooter() {
  const { weight } = useWeight();
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/50 text-sm">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-2">
        Weight-specific doses ({weight} kg)
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
        <div>Dexamethasone 0.6 mg/kg: <span className="font-bold text-red-600 dark:text-red-400">{Math.min(weight * 0.6, 10).toFixed(2)} mg PO/IM</span></div>
        <div>Neb adrenaline 0.5 mg/kg: <span className="font-bold text-red-600 dark:text-red-400">{Math.min(weight * 0.5, 5).toFixed(2)} mg neb (1:1000)</span></div>
      </div>
    </div>
  );
}

function DehydrationFooter() {
  const { weight } = useWeight();
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/50 text-sm">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-2">
        Weight-specific volumes ({weight} kg)
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
        <div>ORS (mild–mod) 50 mL/kg over 4 h: <span className="font-bold text-red-600 dark:text-red-400">{(weight * 50).toFixed(0)} mL</span></div>
        <div>ORS replacement 75 mL/kg: <span className="font-bold text-red-600 dark:text-red-400">{(weight * 75).toFixed(0)} mL</span></div>
        <div>IV bolus 20 mL/kg NS: <span className="font-bold text-red-600 dark:text-red-400">{(weight * 20).toFixed(0)} mL</span></div>
      </div>
    </div>
  );
}

function AsthmaFooter() {
  const { weight } = useWeight();
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/50 text-sm">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-2">
        Weight-specific doses ({weight} kg)
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
        <div>Prednisolone 1 mg/kg PO: <span className="font-bold text-red-600 dark:text-red-400">{Math.min(weight * 1, 40).toFixed(1)} mg</span></div>
        <div>Hydrocortisone 4 mg/kg IV: <span className="font-bold text-red-600 dark:text-red-400">{Math.min(weight * 4, 200).toFixed(0)} mg</span></div>
        <div>MgSO₄ 50 mg/kg IV: <span className="font-bold text-red-600 dark:text-red-400">{Math.min(weight * 50, 2000).toFixed(0)} mg over 20 min</span></div>
        <div>Salbutamol neb: <span className="font-bold text-red-600 dark:text-red-400">{weight < 20 ? "2.5 mg" : "5 mg"} neb</span></div>
      </div>
    </div>
  );
}
