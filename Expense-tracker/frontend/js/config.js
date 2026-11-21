// config.js — loaded first (plain script) so window.__API_BASE__ is set
// before api.js evaluates.
window.__API_BASE__ = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:4200/api"
  : `${window.location.origin}/api`;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // Offline shell unavailable (e.g. file:// protocol) — non-fatal
    });
  });
}
