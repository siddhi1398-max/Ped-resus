import { useState, useRef, useEffect, useCallback } from "react";
import { SEARCH_INDEX } from "./searchIndex";

// ─── Search Logic ─────────────────────────────────────────────────────────────

function searchIndex(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/);

  const scored = SEARCH_INDEX.map((entry) => {
    const haystack = [
      entry.label,
      entry.description,
      ...(entry.keywords ?? []),
      entry.section,
      entry.tabLabel,
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (entry.label.toLowerCase().includes(term)) score += 10;
      if (entry.keywords?.some((k) => k.toLowerCase().includes(term))) score += 6;
      if (entry.description.toLowerCase().includes(term)) score += 3;
      if (entry.section.toLowerCase().includes(term)) score += 2;
      if (entry.tabLabel.toLowerCase().includes(term)) score += 1;
    }
    const allMatch = terms.every((t) => haystack.includes(t));
    if (allMatch && terms.length > 1) score += 5;

    return { entry, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ entry }) => entry);
}

// ─── Tab accent colours (matching PedResus card border colours) ───────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchBar({ onResultSelect }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen]       = useState(false);
  const [active, setActive]   = useState(-1);

  const inputRef    = useRef(null);
  const dropdownRef = useRef(null);

  const runSearch = useCallback(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const hits = searchIndex(query);
    setResults(hits);
    setOpen(hits.length > 0);
    setActive(-1);
  }, [query]);

  useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current    && !inputRef.current.contains(e.target)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      if (active >= 0 && results[active]) selectResult(results[active]);
      else runSearch();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((p) => Math.min(p + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((p) => Math.max(p - 1, -1)); }
    else if (e.key === "Escape") { setOpen(false); setActive(-1); }
  }

  function selectResult(entry) {
    setQuery(entry.label);
    setOpen(false);
    setActive(-1);
    onResultSelect?.(entry);
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div style={s.wrapper}>
      {/* Input row */}
      <div style={s.inputRow}>
        <span style={s.icon}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="SEARCH DRUGS, EQUIPMENT, ALGORITHMS..."
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length) setOpen(true); }}
          style={s.input}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search PedResus"
        />

        {query && (
          <button onClick={clearSearch} style={s.clearBtn} aria-label="Clear">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}

        <button onClick={runSearch} style={s.searchBtn}>
          SEARCH
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <ul ref={dropdownRef} style={s.dropdown} role="listbox">
          {results.length === 0 ? (
            <li style={s.noResults}>NO RESULTS FOUND</li>
          ) : (
            results.map((entry, i) => {
              const color = TAB_COLORS[entry.tab] ?? "#e53e3e";
              const isActive = active === i;
              return (
                <li
                  key={entry.id}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(-1)}
                  onClick={() => selectResult(entry)}
                  style={{
                    ...s.resultItem,
                    background: isActive ? "#f7f8fa" : "#ffffff",
                  }}
                >
                  <span style={{ ...s.accentBar, background: color }} />

                  <span style={s.resultBody}>
                    <span style={s.metaRow}>
                      <span style={{
                        ...s.tabBadge,
                        color,
                        borderColor: color + "55",
                        background: color + "10",
                      }}>
                        {entry.tabLabel.toUpperCase()}
                      </span>
                      <span style={s.dot}>·</span>
                      <span style={s.section}>{entry.section.toUpperCase()}</span>
                    </span>

                    <span style={s.label}>{entry.label}</span>
                    <span style={s.desc}>{entry.description}</span>
                  </span>

                  <span style={{ ...s.arrow, color: isActive ? color : "#cbd5e0" }}>›</span>
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

const MONO = "'Courier New', Courier, monospace";
const BODY = "'Segoe UI', system-ui, sans-serif";

const s = {
  wrapper: {
    position: "relative",
    width: "100%",
    maxWidth: 560,
    fontFamily: BODY,
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 6,
    padding: "0 6px 0 12px",
    gap: 6,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  icon: {
    color: "#a0aec0",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: "0.08em",
    padding: "11px 4px",
    background: "transparent",
    color: "#2d3748",
    minWidth: 0,
  },
  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#a0aec0",
    display: "flex",
    alignItems: "center",
    padding: "4px",
    borderRadius: 3,
    flexShrink: 0,
  },
  searchBtn: {
    background: "#e53e3e",
    color: "#ffffff",
    border: "none",
    borderRadius: 5,
    padding: "7px 14px",
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    cursor: "pointer",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 6,
    boxShadow: "0 8px 20px rgba(0,0,0,0.09)",
    zIndex: 1000,
    listStyle: "none",
    margin: 0,
    padding: "4px 0",
    maxHeight: 440,
    overflowY: "auto",
  },
  noResults: {
    padding: "14px 16px",
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: "0.08em",
    color: "#a0aec0",
  },
  resultItem: {
    display: "flex",
    alignItems: "stretch",
    gap: 12,
    padding: "10px 14px 10px 0",
    cursor: "pointer",
    transition: "background 0.1s",
    borderBottom: "1px solid #f7f8fa",
  },
  accentBar: {
    width: 4,
    minWidth: 4,
    borderRadius: "0 2px 2px 0",
    flexShrink: 0,
  },
  resultBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  tabBadge: {
    fontFamily: MONO,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.07em",
    padding: "1px 6px",
    borderRadius: 20,
    border: "1px solid",
    whiteSpace: "nowrap",
  },
  dot: {
    color: "#cbd5e0",
    fontSize: 12,
  },
  section: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: "0.07em",
    color: "#a0aec0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  label: {
    fontFamily: BODY,
    fontSize: 13,
    fontWeight: 600,
    color: "#1a202c",
    lineHeight: 1.3,
  },
  desc: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: "0.03em",
    color: "#718096",
    lineHeight: 1.5,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  arrow: {
    fontSize: 20,
    alignSelf: "center",
    flexShrink: 0,
    transition: "color 0.1s",
    paddingRight: 4,
  },
};
