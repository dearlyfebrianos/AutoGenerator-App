import React, { useState } from "react";
import {
  Home,
  FileText,
  Calculator,
  Briefcase,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Bug,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ theme, setTheme, onBugReportClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const location = useLocation();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setShowThemeMenu(false);
  };

  const menuItems = [
    { id: "/", label: "Beranda", icon: Home },
    { id: "/surat", label: "Generator Surat", icon: FileText },
    { id: "/keuangan", label: "Kalkulator Usaha", icon: Calculator },
    { id: "/cv", label: "CV Generator", icon: Briefcase },
    { id: "/materi", label: "Ringkasan Materi", icon: BookOpen },
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
          <Link to="/" className="flex items-center space-x-3">
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
          </Link>

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

        <nav className="hidden md:flex space-x-1 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.id}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  location.pathname === item.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={onBugReportClick}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              location.pathname === "/laporan-bug"
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Bug size={18} />
            <span className="text-sm font-medium">Laporkan Bug</span>
          </button>
        </nav>

        {isMobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.id}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                    location.pathname === item.id
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onBugReportClick();
              }}
              className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bug size={18} className="text-red-500" />
              <span className="text-sm font-medium">Laporkan Bug</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
