import { useState, useRef, useEffect } from "react";
import { SEARCH_INDEX } from "../searchIndex";

// ─── Search Logic ─────────────────────────────────────────────────────────────

function runSearch(query) {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  const terms = q.split(/\s+/);

  const scored = SEARCH_INDEX.map((entry) => {
    const haystack = [entry.label, entry.description, ...(entry.keywords ?? []), entry.section, entry.tabLabel]
      .join(" ").toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (entry.label.toLowerCase().startsWith(term)) score += 15;
      else if (entry.label.toLowerCase().includes(term)) score += 10;
      if (entry.keywords?.some((k) => k.toLowerCase().startsWith(term))) score += 8;
      else if (entry.keywords?.some((k) => k.toLowerCase().includes(term))) score += 6;
      if (entry.description.toLowerCase().includes(term)) score += 3;
      if (entry.section.toLowerCase().includes(term)) score += 2;
      if (entry.tabLabel.toLowerCase().includes(term)) score += 1;
    }
    if (terms.length > 1 && terms.every((t) => haystack.includes(t))) score += 5;
    return { entry, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ entry }) => entry);
}

// ─── Highlight matching text ──────────────────────────────────────────────────

function Highlight({ text, query }) {
  if (!text || !query.trim()) return <>{text}</>;
  const q   = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span style={s.highlight}>{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}

// ─── Tab colours ──────────────────────────────────────────────────────────────

const TAB_COLORS = {
  calculator:    "#e53e3e",
  equipment:     "#805ad5",
  vitals:        "#38a169",
  resuscitation: "#e53e3e",
  ventilator:    "#d69e2e",
  fluids:        "#3182ce",
  abg:           "#6366f1",
  drugs:         "#e53e3e",
  syrup:         "#2b9e8e",
  sedation:      "#dd6b20",
  neonatal:      "#38a169",
  trauma:        "#e53e3e",
  algorithms:    "#805ad5",
  prehospital:   "#3182ce",
  immunisation:  "#38a169",
  copilot:       "#805ad5",
};

const MONO = "'JetBrains Mono', 'Courier New', monospace";
const BODY = "'IBM Plex Sans', system-ui, sans-serif";

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchBar({ onResultSelect }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [active,  setActive]  = useState(-1);

  const inputRef   = useRef(null);
  const listRef    = useRef(null);
  const wrapperRef = useRef(null);

  // ── Live search — fires on every character typed ──────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      setActive(-1);
      return;
    }
    const hits = runSearch(query);
    setResults(hits);
    setOpen(true);          // open even if 0 results (shows "no results" msg)
    setActive(-1);
  }, [query]);

  // ── Close when clicking outside ───────────────────────────────────────────
  useEffect(() => {
    function handler(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Scroll active item into view ──────────────────────────────────────────
  useEffect(() => {
    if (active >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-idx="${active}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [active]);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActive((p) => Math.min(p + 1, results.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((p) => Math.max(p - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const idx = active >= 0 ? active : 0;
      if (results[idx]) selectResult(results[idx]);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      inputRef.current?.blur();
    }
  }

  // ── Select and navigate ───────────────────────────────────────────────────
  function selectResult(entry) {
    setQuery("");
    setOpen(false);
    setActive(-1);
    onResultSelect?.(entry);
    window._pendingSearchNav = {
      tab:     entry.tab,
      id:      entry.id,
      drugId:  entry.drugId  ?? null,
      section: entry.section ?? null,
    };
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  }

  const showDropdown  = open && query.trim().length > 0;
  const showNoResults = showDropdown && results.length === 0 && query.trim().length > 1;

  return (
    <div ref={wrapperRef} style={s.wrapper}>

      {/* ── Input pill ─────────────────────────────────────────────────────── */}
      <div style={s.pill}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search drugs, equipment, algorithms..."
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          style={s.input}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search PedResus"
          aria-expanded={open}
          aria-haspopup="listbox"
        />

        {query && (
          <button onClick={clearSearch} style={s.clearBtn} aria-label="Clear search">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Dropdown ───────────────────────────────────────────────────────── */}
      {showDropdown && (
        <ul ref={listRef} style={s.dropdown} role="listbox">

          {/* Header row */}
          {results.length > 0 && (
            <li style={s.header} aria-hidden>
              <span>{results.length} result{results.length !== 1 ? "s" : ""}</span>
              <span style={s.keyHint}>↑↓ · ↵ select · esc</span>
            </li>
          )}

          {/* No results */}
          {showNoResults && (
            <li style={s.noResults}>
              No results for <strong style={{ color: "#0f172a" }}>"{query}"</strong>
              <span style={{ display: "block", marginTop: 3, fontSize: 9, color: "#cbd5e0" }}>
                Try a generic name, indication, or drug class
              </span>
            </li>
          )}

          {/* Result rows */}
          {results.map((entry, i) => {
            const color    = TAB_COLORS[entry.tab] ?? "#64748b";
            const isActive = active === i;
            return (
              <li
                key={entry.id}
                data-idx={i}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(-1)}
                onMouseDown={(e) => { e.preventDefault(); selectResult(entry); }}
                style={{
                  ...s.resultItem,
                  background:  isActive ? "#f8fafc" : "#fff",
                  borderLeft:  `3px solid ${isActive ? color : "transparent"}`,
                }}
              >
                {/* Coloured abbreviation badge */}
                <span style={{
                  ...s.iconBadge,
                  background: color + "18",
                  color,
                }}>
                  {entry.tabLabel.slice(0, 2).toUpperCase()}
                </span>

                {/* Text content */}
                <span style={s.resultBody}>
                  {/* Tab + section meta */}
                  <span style={s.metaRow}>
                    <span style={{
                      ...s.tabBadge,
                      color,
                      borderColor: color + "44",
                      background:  color + "12",
                    }}>
                      {entry.tabLabel.toUpperCase()}
                    </span>
                    {entry.section && (
                      <>
                        <span style={s.dot}>·</span>
                        <span style={s.section}>{entry.section.toUpperCase()}</span>
                      </>
                    )}
                  </span>

                  {/* Label */}
                  <span style={s.label}>
                    <Highlight text={entry.label} query={query} />
                  </span>

                  {/* Description */}
                  {entry.description && (
                    <span style={s.desc}>
                      <Highlight text={entry.description} query={query} />
                    </span>
                  )}
                </span>

                {/* Arrow indicator */}
                <span style={{ ...s.arrow, color: isActive ? color : "#e2e8f0" }}>›</span>
              </li>
            );
          })}

          {/* Footer */}
          {results.length > 0 && (
            <li style={s.footer} aria-hidden>
              Tap a result to jump directly to that item
            </li>
          )}

        </ul>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  wrapper: {
    position: "relative",
    width:    "100%",
    maxWidth: 340,
    margin:   "0 auto",
  },

  pill: {
    display:       "inline-flex",
    alignItems:    "center",
    gap:           6,
    width:         "100%",
    fontFamily:    MONO,
    fontSize:      10,
    fontWeight:    600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color:         "#475569",
    background:    "transparent",
    border:        "1px solid #cbd5e0",
    borderRadius:  9999,
    padding:       "3px 10px",
    boxSizing:     "border-box",
  },

  input: {
    flex:          1,
    border:        "none",
    outline:       "none",
    fontFamily:    MONO,
    fontSize:      10,
    fontWeight:    500,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    background:    "transparent",
    color:         "#1e293b",
    minWidth:      0,
    padding:       0,
  },

  clearBtn: {
    background:   "none",
    border:       "none",
    cursor:       "pointer",
    color:        "#94a3b8",
    display:      "flex",
    alignItems:   "center",
    padding:      "2px",
    borderRadius: 999,
    flexShrink:   0,
  },

  dropdown: {
    position:     "absolute",
    top:          "calc(100% + 6px)",
    left:         "50%",
    transform:    "translateX(-50%)",
    width:        "max(100%, 420px)",
    background:   "#ffffff",
    border:       "1px solid #e2e8f0",
    borderRadius: 12,
    boxShadow:    "0 8px 28px rgba(0,0,0,0.12)",
    zIndex:       1000,
    listStyle:    "none",
    margin:       0,
    padding:      "4px 0",
    maxHeight:    460,
    overflowY:    "auto",
  },

  header: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "6px 14px 5px",
    borderBottom:   "1px solid #f1f5f9",
    fontFamily:     MONO,
    fontSize:       9,
    letterSpacing:  "0.12em",
    textTransform:  "uppercase",
    color:          "#94a3b8",
  },

  keyHint: {
    fontFamily:    MONO,
    fontSize:      8,
    letterSpacing: "0.04em",
    color:         "#cbd5e0",
  },

  noResults: {
    padding:       "12px 16px",
    fontFamily:    MONO,
    fontSize:      10,
    letterSpacing: "0.06em",
    color:         "#94a3b8",
  },

  resultItem: {
    display:      "flex",
    alignItems:   "center",
    gap:          10,
    padding:      "9px 12px 9px 10px",
    cursor:       "pointer",
    transition:   "background 0.08s, border-left-color 0.08s",
    borderBottom: "1px solid #f8fafc",
    borderLeft:   "3px solid transparent",
  },

  iconBadge: {
    flexShrink:     0,
    width:          28,
    height:         28,
    borderRadius:   8,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    fontFamily:     MONO,
    fontSize:       9,
    fontWeight:     700,
    letterSpacing:  "0.05em",
  },

  resultBody: {
    flex:          1,
    display:       "flex",
    flexDirection: "column",
    gap:           2,
    minWidth:      0,
  },

  metaRow: {
    display:    "flex",
    alignItems: "center",
    gap:        5,
    flexWrap:   "wrap",
  },

  tabBadge: {
    fontFamily:    MONO,
    fontSize:      9,
    fontWeight:    600,
    letterSpacing: "0.08em",
    padding:       "1px 5px",
    borderRadius:  20,
    border:        "1px solid",
    whiteSpace:    "nowrap",
  },

  dot: {
    color:    "#cbd5e0",
    fontSize: 10,
  },

  section: {
    fontFamily:    MONO,
    fontSize:      9,
    letterSpacing: "0.07em",
    color:         "#94a3b8",
    overflow:      "hidden",
    textOverflow:  "ellipsis",
    whiteSpace:    "nowrap",
    maxWidth:      140,
  },

  label: {
    fontFamily:  BODY,
    fontSize:    13,
    fontWeight:  600,
    color:       "#0f172a",
    lineHeight:  1.3,
  },

  desc: {
    fontFamily:        MONO,
    fontSize:          10,
    letterSpacing:     "0.02em",
    color:             "#64748b",
    lineHeight:        1.5,
    overflow:          "hidden",
    display:           "-webkit-box",
    WebkitLineClamp:   2,
    WebkitBoxOrient:   "vertical",
  },

  arrow: {
    fontSize:     18,
    alignSelf:    "center",
    flexShrink:   0,
    paddingRight: 2,
    transition:   "color 0.1s",
  },

  footer: {
    padding:       "6px 14px",
    borderTop:     "1px solid #f1f5f9",
    fontFamily:    MONO,
    fontSize:      9,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color:         "#cbd5e0",
    textAlign:     "center",
  },

  highlight: {
    background:   "#fef08a",
    borderRadius: 2,
    padding:      "0 1px",
    color:        "inherit",
  },
};
