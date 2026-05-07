import { useState, useRef, useEffect, useCallback } from "react";
import { SEARCH_INDEX } from "../searchIndex";

// ─── Search Logic ─────────────────────────────────────────────────────────────

function runSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);

  const scored = SEARCH_INDEX.map((entry) => {
    const haystack = [entry.label, entry.description, ...(entry.keywords ?? []), entry.section, entry.tabLabel]
      .join(" ").toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (entry.label.toLowerCase().includes(term)) score += 10;
      if (entry.keywords?.some((k) => k.toLowerCase().includes(term))) score += 6;
      if (entry.description.toLowerCase().includes(term)) score += 3;
      if (entry.section.toLowerCase().includes(term)) score += 2;
      if (entry.tabLabel.toLowerCase().includes(term)) score += 1;
    }
    if (terms.every((t) => haystack.includes(t)) && terms.length > 1) score += 5;
    return { entry, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ entry }) => entry);
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

// ─── Fonts — matching PedResus exactly ────────────────────────────────────────

const MONO = "'JetBrains Mono', 'Courier New', monospace";
const BODY = "'IBM Plex Sans', system-ui, sans-serif";

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchBar({ onResultSelect }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [active,  setActive]  = useState(-1);

  const inputRef    = useRef(null);
  const dropdownRef = useRef(null);

  const handleSearch = useCallback(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const hits = runSearch(query);
    setResults(hits);
    setOpen(hits.length > 0);
    setActive(-1);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current    && !inputRef.current.contains(e.target)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      if (active >= 0 && results[active]) selectResult(results[active]);
      else handleSearch();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((p) => Math.min(p + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((p) => Math.max(p - 1, -1)); }
    else if (e.key === "Escape") { setOpen(false); setActive(-1); }
  }

 function selectResult(entry) {
  setQuery("");
  setOpen(false);
  setActive(-1);
  onResultSelect?.(entry);
  // Dispatch deep-link event — App.jsx will switch tab, then fire this after delay
  // We store entry on window so App can re-dispatch after tab mounts
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
    inputRef.current?.focus();
  }

  return (
    <div style={s.wrapper}>

      {/* ── Input pill — styled like FULL ACCESS badge but bigger ── */}
      <div style={s.pill} ref={inputRef}>

        {/* Search icon */}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>

        <input
          type="text"
          value={query}
          placeholder="Search drugs, equipment, algorithms..."
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length) setOpen(true); }}
          style={s.input}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search PedResus"
        />

        {/* Clear button */}
        {query && (
          <button onClick={clearSearch} style={s.clearBtn} aria-label="Clear">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}

        {/* Divider */}
        <div style={s.divider} />

        {/* Search trigger */}
        <button onClick={handleSearch} style={s.searchBtn} aria-label="Search">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>

      </div>

      {/* ── Dropdown ── */}
      {open && (
        <ul ref={dropdownRef} style={s.dropdown} role="listbox">
          {results.length === 0 ? (
            <li style={s.noResults}>No results found</li>
          ) : (
            results.map((entry, i) => {
              const color    = TAB_COLORS[entry.tab] ?? "#64748b";
              const isActive = active === i;
              return (
                <li
                  key={entry.id}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(-1)}
                  onClick={() => selectResult(entry)}
                  style={{ ...s.resultItem, background: isActive ? "#f8fafc" : "#fff" }}
                >
                  {/* Left accent bar */}
                  <span style={{ ...s.accentBar, background: color }} />

                  {/* Content */}
                  <span style={s.resultBody}>
                    <span style={s.metaRow}>
                      <span style={{
                        ...s.tabBadge,
                        color,
                        borderColor: color + "44",
                        background:  color + "10",
                      }}>
                        {entry.tabLabel.toUpperCase()}
                      </span>
                      <span style={s.dot}>·</span>
                      <span style={s.section}>{entry.section.toUpperCase()}</span>
                    </span>
                    <span style={s.label}>{entry.label}</span>
                    <span style={s.desc}>{entry.description}</span>
                  </span>

                  <span style={{ ...s.arrow, color: isActive ? color : "#e2e8f0" }}>›</span>
                </li>
              );
            })
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
    // Let parent (flex-1) control width — just cap it
    width: "100%",
    maxWidth: 340,
    margin: "0 auto",
  },

  // Pill matches FULL ACCESS badge exactly:
  // text-[10px] font-mono uppercase tracking-widest border rounded-full px-2 py-0.5
  // We scale it up slightly for usability
  pill: {
    display:        "inline-flex",
    alignItems:     "center",
    gap:            6,
    width:          "100%",
    fontFamily:     MONO,
    fontSize:       10,
    fontWeight:     600,
    letterSpacing:  "0.12em",
    textTransform:  "uppercase",
    color:          "#475569",
    background:     "transparent",
    border:         "1px solid #cbd5e0",
    borderRadius:   9999,
    padding:        "3px 8px 3px 10px",
    boxSizing:      "border-box",
  },

  input: {
    flex:           1,
    border:         "none",
    outline:        "none",
    fontFamily:     MONO,
    fontSize:       10,
    fontWeight:     500,
    letterSpacing:  "0.08em",
    textTransform:  "uppercase",
    background:     "transparent",
    color:          "#1e293b",
    minWidth:       0,
    padding:        0,
  },

  clearBtn: {
    background:  "none",
    border:      "none",
    cursor:      "pointer",
    color:       "#94a3b8",
    display:     "flex",
    alignItems:  "center",
    padding:     "2px",
    borderRadius: 999,
    flexShrink:  0,
  },

  divider: {
    width:      1,
    height:     12,
    background: "#e2e8f0",
    flexShrink: 0,
  },

  // Icon-only search button — subtle, no colour
  searchBtn: {
    background:  "none",
    border:      "none",
    cursor:      "pointer",
    color:       "#94a3b8",
    display:     "flex",
    alignItems:  "center",
    padding:     "2px 2px",
    borderRadius: 999,
    flexShrink:  0,
  },

  // Dropdown — clean card
  dropdown: {
    position:   "absolute",
    top:        "calc(100% + 6px)",
    left:       "50%",
    transform:  "translateX(-50%)",
    width:      "max(100%, 420px)",
    background: "#ffffff",
    border:     "1px solid #e2e8f0",
    borderRadius: 12,
    boxShadow:  "0 8px 24px rgba(0,0,0,0.10)",
    zIndex:     1000,
    listStyle:  "none",
    margin:     0,
    padding:    "4px 0",
    maxHeight:  440,
    overflowY:  "auto",
  },

  noResults: {
    padding:    "12px 16px",
    fontFamily: MONO,
    fontSize:   10,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color:      "#94a3b8",
  },

  resultItem: {
    display:     "flex",
    alignItems:  "stretch",
    gap:         10,
    padding:     "9px 12px 9px 0",
    cursor:      "pointer",
    transition:  "background 0.1s",
    borderBottom: "1px solid #f1f5f9",
  },

  accentBar: {
    width:    3,
    minWidth: 3,
    borderRadius: "0 2px 2px 0",
    flexShrink: 0,
  },

  resultBody: {
    flex:          1,
    display:       "flex",
    flexDirection: "column",
    gap:           3,
    minWidth:      0,
  },

  metaRow: {
    display:    "flex",
    alignItems: "center",
    gap:        5,
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
    fontSize: 11,
  },

  section: {
    fontFamily:    MONO,
    fontSize:      9,
    letterSpacing: "0.07em",
    color:         "#94a3b8",
    whiteSpace:    "nowrap",
    overflow:      "hidden",
    textOverflow:  "ellipsis",
  },

  label: {
    fontFamily:  BODY,
    fontSize:    13,
    fontWeight:  600,
    color:       "#0f172a",
    lineHeight:  1.3,
  },

  desc: {
    fontFamily:    MONO,
    fontSize:      10,
    letterSpacing: "0.02em",
    color:         "#64748b",
    lineHeight:    1.5,
    overflow:      "hidden",
    display:       "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },

  arrow: {
    fontSize:    18,
    alignSelf:   "center",
    flexShrink:  0,
    paddingRight: 2,
    transition:  "color 0.1s",
  },
};
