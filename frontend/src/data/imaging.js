// frontend/src/components/tabs/ImagingTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Renders the Imaging tab — categorized X-Ray, CT, MRI, POCUS findings
// with images, key findings, pearls, DDx and Radiopaedia links.
// Images sourced from Wikimedia Commons (open access).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  IMAGING_CATEGORIES,
  IMAGING_FINDINGS,
} from "../../data/imagingData";
import {
  ArrowSquareOut,
  CaretDown,
  Image,
  Warning,
  Lightbulb,
  ArrowsLeftRight,
} from "@phosphor-icons/react";

// ── Colour scheme per category ────────────────────────────────────────────────
const CATEGORY_STYLE = {
  xray:  { active: "bg-slate-900 text-white",         badge: "bg-slate-100 text-slate-600 border-slate-200"   },
  ct:    { active: "bg-blue-700 text-white",           badge: "bg-blue-50 text-blue-700 border-blue-200"       },
  mri:   { active: "bg-violet-700 text-white",         badge: "bg-violet-50 text-violet-700 border-violet-200" },
  pocus: { active: "bg-emerald-700 text-white",        badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

// ── Fallback if image fails to load ───────────────────────────────────────────
function ImageWithFallback({ src, alt, className }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`${className} bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400`}>
        <Image size={28} weight="thin" />
        <span className="text-[10px] font-mono text-center px-2">
          Image unavailable
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

// ── Single finding card ───────────────────────────────────────────────────────
function FindingCard({ finding, categoryId }) {
  const [expanded, setExpanded] = useState(false);
  const style = CATEGORY_STYLE[categoryId] || CATEGORY_STYLE.xray;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

      {/* ── Image ── */}
      {finding.imgUrl ? (
        <div className="relative">
          <ImageWithFallback
            src={finding.imgUrl}
            alt={finding.imgAlt || finding.title}
            className="w-full h-48 object-cover object-center bg-slate-100 dark:bg-slate-800"
          />
          {/* Attribution overlay */}
          {finding.imgCredit && (
            <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] font-mono px-2 py-0.5 rounded-tl">
              {finding.imgCredit}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <Image size={32} weight="thin" />
        </div>
      )}

      {/* ── Card body ── */}
      <div className="p-4">
        {/* Title + view */}
        <div className="mb-3">
          <h3
            className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1"
            style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
          >
            {finding.title}
          </h3>
          <span className={`inline-block text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${style.badge}`}>
            {finding.view}
          </span>
        </div>

        {/* Key findings — always visible */}
        <div className="mb-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">
            Key Findings
          </p>
          <ul className="space-y-1">
            {finding.keyFindings.map((kf, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0 mt-1.5" />
                {kf}
              </li>
            ))}
          </ul>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors py-1 border-t border-slate-100 dark:border-slate-800 mt-2"
        >
          {expanded ? "Hide details" : "Show pearls & DDx"}
          <CaretDown
            size={12}
            weight="bold"
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-3 space-y-3 animate-in slide-in-from-top-1 duration-150">
            {/* Clinical Pearl */}
            {finding.pearls && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Lightbulb size={12} weight="fill" className="text-amber-500" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                    Clinical Pearl
                  </span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  {finding.pearls}
                </p>
              </div>
            )}

            {/* DDx */}
            {finding.ddx && finding.ddx !== "—" && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowsLeftRight size={12} weight="bold" className="text-red-500" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-red-600 dark:text-red-400 font-bold">
                    Differential Diagnosis
                  </span>
                </div>
                <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed">
                  {finding.ddx}
                </p>
              </div>
            )}

            {/* Radiopaedia link */}
            {finding.refUrl && (
              <a
                href={finding.refUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-mono text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ArrowSquareOut size={11} weight="bold" />
                View cases on Radiopaedia
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ImagingTab component ─────────────────────────────────────────────────
export default function ImagingTab() {
  const [activeCategory, setActiveCategory] = useState("xray");
  const [search, setSearch] = useState("");

  const findings = IMAGING_FINDINGS[activeCategory] || [];

  // Filter by search query
  const filtered = search.trim()
    ? findings.filter(f =>
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        f.keyFindings.some(kf => kf.toLowerCase().includes(search.toLowerCase())) ||
        (f.ddx && f.ddx.toLowerCase().includes(search.toLowerCase())) ||
        (f.pearls && f.pearls.toLowerCase().includes(search.toLowerCase()))
      )
    : findings;

  const style = CATEGORY_STYLE[activeCategory] || CATEGORY_STYLE.xray;

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-5">
        <h2
          className="text-lg font-black text-slate-900 dark:text-white mb-1"
          style={{ fontFamily: '"Chivo", system-ui, sans-serif' }}
        >
          Pediatric Imaging Reference
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          X-Ray · CT · MRI · POCUS — high-yield ED findings · Images: Wikimedia Commons (open access)
        </p>
      </div>

      {/* ── Category tabs ── */}
      <div className="flex gap-2 flex-wrap mb-5">
        {IMAGING_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setSearch(""); }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
              activeCategory === cat.id
                ? `${CATEGORY_STYLE[cat.id].active} border-transparent shadow-sm`
                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400"
            }`}
          >
            {cat.label}
            <span className="ml-1.5 opacity-60">
              ({IMAGING_FINDINGS[cat.id]?.length || 0})
            </span>
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${IMAGING_CATEGORIES.find(c => c.id === activeCategory)?.label} findings...`}
          className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-slate-400 dark:focus:border-slate-500"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── No results ── */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Warning size={32} weight="thin" className="mx-auto mb-3" />
          <p className="text-sm font-mono">No findings match "{search}"</p>
          <button
            onClick={() => setSearch("")}
            className="text-xs text-slate-400 underline mt-2"
          >
            Clear search
          </button>
        </div>
      )}

      {/* ── Cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(finding => (
          <FindingCard
            key={finding.id}
            finding={finding}
            categoryId={activeCategory}
          />
        ))}
      </div>

      {/* ── Footer disclaimer ── */}
      <div className="mt-8 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] text-slate-400 font-mono text-center leading-relaxed">
        Images sourced from Wikimedia Commons under CC BY-SA / Public Domain licences. 
        Attribution shown on each image. All findings reference Radiopaedia for extended case libraries.
        <br />
        ⚠️ Clinical reference only — always confirm with formal radiology reporting.
      </div>
    </div>
  );
}
