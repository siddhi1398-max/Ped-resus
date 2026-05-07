// useSearchNavigate.js
// Tabs call this hook to receive deep-link navigation from the search bar.
//
// Usage inside any tab:
//
//   import { useSearchNavigate } from "../../hooks/useSearchNavigate";
//
//   // In DrugsTab — auto-open a drug row by drugId
//   useSearchNavigate("drugs", ({ drugId, section }) => {
//     if (drugId) {
//       setExpandedDrugId(drugId);
//       // optionally scroll to element
//       setTimeout(() => {
//         document.getElementById(`drug-row-${drugId}`)?.scrollIntoView({
//           behavior: "smooth", block: "center"
//         });
//       }, 200);
//     }
//     // switch sub-tab based on section
//     if (section === "Nebulised Drugs") setActiveTab("nebs");
//     else setActiveTab("drugs");
//   });
//
//   // In SyrupCalculatorTab — auto-open a drug by drugId
//   useSearchNavigate("syrup", ({ drugId }) => {
//     if (drugId) setExpandedDrugId(drugId);
//   });

import { useEffect } from "react";

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
