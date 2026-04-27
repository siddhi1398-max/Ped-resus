import { useState } from "react";
import { DIFFERENTIALS } from "../../data/differentials";
import { Warning, BookOpen } from "@phosphor-icons/react";

export default function DifferentialsTab() {
  const [activeId, setActiveId] = useState(DIFFERENTIALS[0].id);
  const active = DIFFERENTIALS.find((d) => d.id === activeId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight mb-1">Differential Diagnosis</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Diagnostic algorithms by chief complaint. Reference: <strong>Fleischer &amp; Ludwig — Textbook of
          Pediatric Emergency Medicine 7th ed.</strong> (cross-referenced with Tintinalli &amp; Harriet Lane).
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {DIFFERENTIALS.map((d) => (
          <button
            key={d.id}
            data-testid={`ddx-${d.id}`}
            onClick={() => setActiveId(d.id)}
            className={`px-3 py-2 rounded-md border font-mono text-[11px] uppercase tracking-widest transition-all ${
              activeId === d.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            {d.title}
          </button>
        ))}
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
          <BookOpen size={18} weight="bold" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Chief complaint</span>
        </div>
        <h3 className="font-sans font-bold text-xl sm:text-2xl tracking-tight">{active.title}</h3>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{active.source}</div>
        {active.mnemonic && (
          <div className="mt-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-1">
              Mnemonic
            </div>
            <div className="font-mono font-bold text-sm">{active.mnemonic}</div>
            {active.mnemonicExpand && (
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {active.mnemonicExpand}
              </div>
            )}
          </div>
        )}

        <div className="mt-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">
            Differentials
          </div>
          <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Diagnosis</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Typical age</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Clues</th>
                  <th className="p-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]">Workup / Mgmt</th>
                </tr>
              </thead>
              <tbody>
                {active.differentials.map((d) => (
                  <tr key={d.dx} className="border-t border-slate-200 dark:border-slate-800 odd:bg-slate-50 dark:odd:bg-slate-900/40 align-top">
                    <td className="p-3 font-bold">{d.dx}</td>
                    <td className="p-3 font-mono text-xs text-slate-600 dark:text-slate-300">{d.age}</td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-300 max-w-sm">{d.clues}</td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-300 max-w-sm">{d.workup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {active.redFlags?.length > 0 && (
          <div className="mt-5 rounded-md border-2 border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
              <Warning size={16} weight="fill" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Red flags</span>
            </div>
            <ul className="space-y-1 text-sm text-red-900 dark:text-red-200">
              {active.redFlags.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="opacity-60">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
