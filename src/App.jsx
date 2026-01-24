import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import LoadingSplash from "./components/layout/LoadingSplash";
import HomePage from "./pages/HomePage";
import SuratGenerator from "./pages/SuratGenerator";
import KalkulatorUsaha from "./pages/KalkulatorUsaha";
import CVGenerator from "./pages/CVGenerator";
import RingkasanMateri from "./pages/RingkasanMateri";
import NotFound from "./pages/404";

const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return typeof window !== "undefined"
      ? localStorage.getItem("theme") || "auto"
      : "auto";
  });

  useEffect(() => {
    const applyTheme = () => {
      let effectiveTheme = theme;
      if (theme === "auto") {
        effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
      }
      if (effectiveTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", theme);
    };

    applyTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => theme === "auto" && applyTheme();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return [theme, setTheme];
};

const AppContent = () => {
  const [theme, setTheme] = useTheme();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowSplash(true);
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("hasVisited", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (showSplash) {
    return <LoadingSplash onDismiss={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header theme={theme} setTheme={setTheme} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/surat" element={<SuratGenerator />} />
          <Route path="/keuangan" element={<KalkulatorUsaha />} />
          <Route path="/cv" element={<CVGenerator />} />
          <Route path="/materi" element={<RingkasanMateri />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;