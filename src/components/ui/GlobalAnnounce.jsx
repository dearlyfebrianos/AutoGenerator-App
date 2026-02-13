import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GlobalAnnounce = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [announceData, setAnnounceData] = useState(null);

  useEffect(() => {
    const announceStr = localStorage.getItem("globalAnnounce");
    const hasShown = localStorage.getItem("announceShown");

    if (announceStr && !hasShown) {
      try {
        const data = JSON.parse(announceStr);
        setAnnounceData(data);

        setTimeout(() => {
          setIsVisible(true);
        }, 1000);
      } catch (e) {
        console.warn("Invalid announcement JSON", e);
      }
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("announceShown", "true");
  };

  if (!announceData) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Announcement Modal - Centered Responsively */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              duration: 0.5,
            }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      📢 Pengumuman!
                    </h2>
                  </div>

                  <button
                    onClick={handleClose}
                    className="text-white/80 hover:text-white transition-colors"
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
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* ✅ Media di atas teks */}
                {announceData.media && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-4"
                  >
                    {announceData.mediaType === "image" ? (
                      <img
                        src={announceData.media}
                        alt="Announcement"
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                    ) : (
                      <video
                        src={announceData.media}
                        controls
                        loop // ✅ Auto repeat
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                    )}
                  </motion.div>
                )}

                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-lg text-gray-800 dark:text-white leading-relaxed whitespace-pre-wrap"
                >
                  {announceData.text}
                </motion.p>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-right">
                  {new Date(announceData.publishedAt).toLocaleString("id-ID")}
                </p>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
                <button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Mengerti, Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GlobalAnnounce;