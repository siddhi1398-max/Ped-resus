import { useState } from "react";
import { IMAGING_CATEGORIES, IMAGING_FINDINGS } from "../../data/imaging";
import { ArrowSquareOut, ImageSquare, Warning } from "@phosphor-icons/react";

export default function ImagingTab() {
  const [cat, setCat] = useState("xray");
  const [activeId, setActiveId] = useState(IMAGING_FINDINGS.xray[0].id);

  const findings = IMAGING_FINDINGS[cat];
  const active = findings.find((f) => f.id === activeId) || findings[0];

  const switchCat = (id) => {
    setCat(id);
    setActiveId(IMAGING_FINDINGS[id][0].id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">Critical Pediatric Imaging</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          High-yield findings for the ED — radiograph, CT, MRI and POCUS. Inline images from public-domain / Wikimedia
          Commons; full case galleries link to <strong>Radiopaedia</strong>.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {IMAGING_CATEGORIES.map((c) => (
          <button
            key={c.id}
            data-testid={`imaging-cat-${c.id}`}
            onClick={() => switchCat(c.id)}
            className={`px-4 py-2 rounded-md border font-mono text-[11px] uppercase tracking-widest transition-all ${
              cat === c.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
        <aside className="md:max-h-[640px] md:overflow-y-auto pr-2">
          <ul className="space-y-1">
            {findings.map((f) => (
              <li key={f.id}>
                <button
                  data-testid={`imaging-${cat}-${f.id}`}
                  onClick={() => setActiveId(f.id)}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeId === f.id
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  {f.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <article className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 sm:p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-600 dark:text-red-400 mb-1">{active.view}</div>
          <h3 className="font-sans font-bold text-xl sm:text-2xl tracking-tight">{active.title}</h3>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 mt-4">
            <div className="space-y-4 order-2 lg:order-1">
              <Block label="Key findings" items={active.keyFindings} />
              {active.pearls && <Pearl text={active.pearls} />}
              {active.ddx && active.ddx !== "—" && (
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-1">Differential / mimics</div>
                  <div className="text-sm text-slate-700 dark:text-slate-200">{active.ddx}</div>
                </div>
              )}
              <a
                href={active.refUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400 hover:underline"
                data-testid={`imaging-ref-${active.id}`}
              >
                Open Radiopaedia case <ArrowSquareOut size={12} weight="bold" />
              </a>
            </div>

            <div className="order-1 lg:order-2">
              <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
                {active.imgUrl ? (
                  <img
                    src={active.imgUrl}
                    alt={active.imgAlt}
                    className="w-full rounded bg-white"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-video rounded bg-slate-200 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-2">
                    <ImageSquare size={32} weight="duotone" />
                    <div className="text-[10px] font-mono uppercase tracking-widest">View case on Radiopaedia</div>
                  </div>
                )}
                {active.imgAlt && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-snug">{active.imgAlt}</div>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function Block({ label, items }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-2">{label}</div>
      <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
        {items.map((i) => (
          <li key={i} className="flex gap-2"><span className="opacity-60">·</span><span className="leading-relaxed">{i}</span></li>
        ))}
      </ul>
    </div>
  );
}

function Pearl({ text }) {
  return (
    <div className="rounded-md border-2 border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 mb-1">
        <Warning size={14} weight="fill" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Clinical pearl</span>
      </div>
      <div className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{text}</div>
    </div>
  );
}
