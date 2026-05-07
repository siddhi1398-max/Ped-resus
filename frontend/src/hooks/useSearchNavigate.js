// useSearchNavigate.js
// Tabs call this hook to receive deep-link navigation from the search bar.
//


import { useEffect, useCallback } from "react";

/**
 * @param {string}   tabId    - The tab this component lives in (e.g. "drugs")
 * @param {Function} callback - Called with the event detail when navigation targets this tab
 */
export function useSearchNavigate(tabId, callback) {
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.tab === tabId) {
        callback(e.detail);
      }
    };
    window.addEventListener("pedresus:search-navigate", handler);
    return () => window.removeEventListener("pedresus:search-navigate", handler);
  }, [tabId, callback]);
}
