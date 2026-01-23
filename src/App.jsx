import React, { useState } from "react";

import Header from "./components/layout/Header"
import Footer from "./components/layout/Footer"

import HomePage from "./pages/Homepage";
import SuratGenerator from "./pages/SuratGenerator";
import KalkulatorUsaha from "./pages/KalkulatorUsaha";
import CVGenerator from "./pages/CVGenerator";
import RingkasanMateri from "./pages/RingkasanMateri";

const App = () => {
  const [activeMenu, setActiveMenu] = useState("home");
  const o = ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeMenu === "home" && <HomePage setActiveMenu={setActiveMenu} />}
        {activeMenu === "surat" && <SuratGenerator />}
        {activeMenu === "keuangan" && <KalkulatorUsaha />}
        {activeMenu === "cv" && <CVGenerator />}
        {activeMenu === "materi" && <RingkasanMateri />}
      </main>
      <Footer />
    </div>
  );
};

export default App;