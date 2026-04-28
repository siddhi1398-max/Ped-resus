import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Suppress non-critical Emergent/PerformanceServerTiming errors
window.addEventListener("error", function (e) {
  if (
    e.error instanceof DOMException &&
    e.error.name === "DataCloneError" &&
    e.message &&
    e.message.includes("PerformanceServerTiming")
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
