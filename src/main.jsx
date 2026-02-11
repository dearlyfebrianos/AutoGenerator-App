import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

const clearOldCaches = async () => {
  if ("caches" in window) {
    try {
      const cacheNames = await caches.keys();
      const currentCache = "autogen-v2";

      for (const cacheName of cacheNames) {
        if (cacheName !== currentCache && cacheName.startsWith("autogen-")) {
          await caches.delete(cacheName);
          console.log("Cache lama dihapus:", cacheName);
        }
      }
    } catch (error) {
      console.warn("Gagal clear cache lama:", error);
    }
  }
};

const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        await clearOldCaches();

        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered:", registration.scope);

        registration.update();

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", async () => {
              if (newWorker.state === "activated") {
                if (window.location.pathname !== "/") {
                  window.location.reload();
                }
              }
            });
          }
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    });
  }
};

const handleBlankScreen = () => {
  if (window.location.search.includes("clear_cache=1")) {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
    }
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    localStorage.clear();
    window.location.href = "/";
    return;
  }

  setTimeout(() => {
    const root = document.getElementById("root");
    if (root && root.children.length === 0) {
      root.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb; font-family: Arial, sans-serif;">
          <div style="text-align: center; max-width: 500px; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #dc2626; margin: 0 0 1rem 0;">🛠️ Aplikasi Diperbarui</h2>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">
              Halaman ini telah diperbarui. Silakan refresh untuk melihat versi terbaru.
            </p>
            <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: background 0.2s;">
              🔄 Refresh Sekarang
            </button>
            <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #9ca3af;">
              Draft Anda tetap aman dan tidak akan hilang.
            </p>
          </div>
        </div>
      `;
    }
  }, 3000);
};

const initializeApp = () => {
  handleBlankScreen();
  registerServiceWorker();
};

initializeApp();

if (
  window.location.search.includes("reload=1") ||
  window.location.search.includes("clear_cache=1")
) {
  localStorage.clear();
  caches
    .keys()
    .then((names) => Promise.all(names.map((name) => caches.delete(name))));
  window.location.href = "/";
}

if (window.location.search.includes("force=reload")) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
  }
  localStorage.clear();
  caches
    .keys()
    .then((names) => Promise.all(names.map((name) => caches.delete(name))));
  window.location.href = "/";
}
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: "#ffffff",
          color: "#000000",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "12px 16px",
        },
      }}
    />
  </React.StrictMode>,
);
