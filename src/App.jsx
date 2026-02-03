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
import InstallPrompt from "./components/ui/InstallPrompt";
import { toast } from "react-hot-toast";
import useSeo from "./hooks/useSeo"

const BugReportModal = ({ isOpen, onClose, webhookUrl }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul bug wajib diisi!");
      return;
    }
    if (!description.trim()) {
      toast.error("Deskripsi bug wajib diisi!");
      return;
    }

    setIsSubmitting(true);

    try {
      const discordPayload = {
        content: null,
        embeds: [
          {
            title: `🐛 ${title.trim()}`,
            description: description.trim(),
            color: 15548997,
            fields: [
              {
                name: "URL",
                value: window.location.href,
                inline: true,
              },
              {
                name: "Waktu",
                value: new Date().toLocaleString("id-ID"),
                inline: true,
              },
              {
                name: "Browser",
                value: navigator.userAgent.substring(0, 100) + "...",
                inline: false,
              },
            ],
            footer: {
              text: "AutoGen Bug Report",
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(discordPayload),
      });

      if (!response.ok) throw new Error("Gagal mengirim laporan");

      if (file) {
        const fileFormData = new FormData();
        fileFormData.append("file", file);
        await fetch(webhookUrl, {
          method: "POST",
          body: fileFormData,
        });
      }

      toast.success("Laporan bug berhasil dikirim! 🙏", {
        duration: 5000,
        icon: "✅",
        style: {
          background: "#f0fdf4",
          color: "#166534",
          border: "1px solid #bbf7d0",
        },
      });

      setTitle("");
      setDescription("");
      setFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal mengirim laporan. Coba lagi nanti.", {
        duration: 5000,
        icon: "⚠️",
        style: {
          background: "#fef2f2",
          color: "#b91c1c",
          border: "1px solid #fecaca",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB!");
        return;
      }
      const validTypes = ["image/jpeg", "image/png", "video/mp4", "video/webm"];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Hanya JPEG, PNG, MP4, atau WebM yang diizinkan!");
        return;
      }
      setFile(selectedFile);

      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (document.getElementById("bug-file-input")) {
      document.getElementById("bug-file-input").value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Laporkan Bug
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">
                📝 Cara Melaporkan Bug:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>
                  • <strong>Judul Bug</strong>: Jelaskan masalah secara singkat
                  (contoh: "Tombol download tidak berfungsi")
                </li>
                <li>
                  • <strong>Deskripsi</strong>: Tulis langkah-langkah untuk
                  mereproduksi bug
                </li>
                <li>
                  • <strong>Lampiran</strong>: Upload screenshot/video jika
                  memungkinkan
                </li>
              </ul>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Judul Bug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Contoh: Tombol download tidak berfungsi"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maksimal 100 karakter
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Jelaskan langkah-langkah untuk mereproduksi bug..."
                    maxLength={1000}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maksimal 1000 karakter
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lampiran (Opsional)
                  </label>

                  {previewUrl && (
                    <div className="relative mb-3">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-64 w-full object-contain border border-gray-300 dark:border-gray-600 rounded-md"
                        />
                      ) : (
                        <video
                          src={previewUrl}
                          controls
                          className="max-h-64 w-full border border-gray-300 dark:border-gray-600 rounded-md"
                        />
                      )}
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        aria-label="Hapus lampiran"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  <label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {previewUrl ? "Ganti file" : "Pilih gambar/video"}
                      </span>
                    </div>
                    <input
                      id="bug-file-input"
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Format: JPG, PNG, MP4, WebM | Max: 10MB
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{isSubmitting ? "Mengirim..." : "Kirim Laporan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleUnhandleRejection = () => {
      console.error(`Unahndled promise rejected: ${event.reason}`);
      setHasError(true);
    };

    window.addEventListener("unhandledrejection", handleUnhandleRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandleRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Aplikasi Diperbarui
          </h2>
          <p className="text-gray-600 mb-6">
            Silakan refresh halaman untuk melihat versi terbaru.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Sekarang
          </button>
        </div>
      </div>
    );
  }

  const DISCORD_WEBHOOK_URL =
    "https://discord.com/api/webhooks/1464921346596405370/g_AFnbarh11cmDJ2V3UDeHSI_v5S3pSACzMG6vz5U9s8wgVwH9Md2zRv34jpDFl3_2DY";

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

  const seoData = {
    title: "AutoGen - Generator Surat Otomatis",
    description: "Buat surat resmi dengan mudah dan cepat menggunakan AutoGen",
    og: {
      title: "AutoGen - Generator Surat Otomatis",
      description: "Buat surat resmi dengan mudah dan cepat",
      image: "/images/og-image.jpg",
      url: "https://auto-generator-app.vercel.app/",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "AutoGen - Generator Surat Otomatis",
      description: "Buat surat resmi dengan mudah dan cepat",
      image: "/images/og-image.jpg",
    },
    canonicalUrl: "https://auto-generator-app.vercel.app/",
  };

  useSeo(seoData)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header
        theme={theme}
        setTheme={setTheme}
        onBugReportClick={() => setIsBugModalOpen(true)}
      />
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
      <InstallPrompt />

      <BugReportModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
        webhookUrl={DISCORD_WEBHOOK_URL}
      />
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
