import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// The site used hash routing (/#/miner/x) before path routing was introduced.
// Redirect old bookmarked/shared hash URLs to their clean path equivalents.
if (window.location.hash.startsWith("#/")) {
  const path = window.location.hash.slice(1) || "/";
  window.history.replaceState(null, "", path);
}

createRoot(document.getElementById("root")!).render(<App />);
