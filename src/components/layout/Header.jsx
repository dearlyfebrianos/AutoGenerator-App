import React, { useState, useEffect } from "react";
import {
  FileText,
  Menu,
  X,
  Home,
  FileText as FileTextIcon,
  Calculator,
  Briefcase,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

const Header = ({ activeMenu, setActiveMenu }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    return savedTheme || "auto";
  });
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Apply theme
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

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setShowThemeMenu(false);
  };

  const menuItems = [
    { id: "home", label: "Beranda", icon: Home },
    { id: "surat", label: "Generator Surat", icon: FileTextIcon },
    { id: "keuangan", label: "Kalkulator Usaha", icon: Calculator },
    { id: "cv", label: "CV Generator", icon: Briefcase },
    { id: "materi", label: "Ringkasan Materi", icon: BookOpen },
  ];

  const themeOptions = [
    { value: "light", label: "Terang", icon: Sun },
    { value: "dark", label: "Gelap", icon: Moon },
    { value: "auto", label: "Otomatis", icon: Monitor },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <FileText className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AutoGen
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Platform Generator Otomatis
              </p>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Pengaturan Tema"
              >
                <Settings
                  className="text-gray-500 dark:text-gray-400"
                  size={24}
                />
              </button>
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleThemeChange(option.value)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          theme === option.value
                            ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                        {theme === option.value && (
                          <span className="ml-auto text-blue-600 dark:text-blue-300">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="dark:text-gray-300" size={24} />
              ) : (
                <Menu className="dark:text-gray-300" size={24} />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeMenu === item.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                    activeMenu === item.id
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
