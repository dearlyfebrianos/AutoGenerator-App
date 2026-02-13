import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, Plus, Trash2 } from "lucide-react";

export default function DraftDropdown({
  savedDrafts = [],
  selectedDraftId,
  setSelectedDraftId,
  setDraftName,
  loadDraft,
  applyDraftData,
  clearDraft,
  resetEditor,
  refreshDrafts,
  formatDraftTimestamp,
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const wrapperRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close when click outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open && !isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, isMobile]);

  // Lock body scroll on mobile
  useEffect(() => {
    if (open && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open, isMobile]);

  const handleLoad = (draft) => {
    const data = loadDraft?.(draft.id);
    if (data) {
      applyDraftData?.(data);
      setSelectedDraftId?.(draft.id);
      setDraftName?.(draft.name);
    }
    setOpen(false);
  };

  const handleNewDraft = () => {
    setSelectedDraftId?.("");
    setDraftName?.("");
    resetEditor?.();
    setOpen(false);
  };

  const handleDelete = (id) => {
    clearDraft?.(id);
    refreshDrafts?.();
  };

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1f2a44] hover:bg-[#263357] text-gray-200 text-sm transition"
      >
        <Folder size={16} />
        Draft {savedDrafts.length > 0 && `(${savedDrafts.length})`}
      </button>

      {/* ================= DESKTOP DROPDOWN ================= */}
      <AnimatePresence>
        {!isMobile && open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-full right-0 mt-2 w-80 bg-[#0f172a] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <Header handleNewDraft={handleNewDraft} isMobile={false} />

            <DraftList
              savedDrafts={savedDrafts}
              selectedDraftId={selectedDraftId}
              handleLoad={handleLoad}
              handleDelete={handleDelete}
              formatDraftTimestamp={formatDraftTimestamp}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MOBILE BOTTOM SHEET ================= */}
      <AnimatePresence>
        {isMobile && open && (
          <>
            {/* OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />

            {/* SHEET */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y > 120) {
                  setOpen(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 bg-[#0f172a] rounded-t-2xl shadow-2xl z-50"
              style={{ maxHeight: "85vh", touchAction: "none" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>

              <Header handleNewDraft={handleNewDraft} isMobile />

              <div className="pb-6 max-h-[60vh] overflow-y-auto">
                <DraftList
                  savedDrafts={savedDrafts}
                  selectedDraftId={selectedDraftId}
                  handleLoad={handleLoad}
                  handleDelete={handleDelete}
                  formatDraftTimestamp={formatDraftTimestamp}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= SUB COMPONENT ================= */

function Header({ handleNewDraft, isMobile }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 border-b border-gray-700 ${
        isMobile ? "mt-2" : ""
      }`}
    >
      <h3 className="text-white font-semibold text-sm">Saved Drafts</h3>
      <button
        onClick={handleNewDraft}
        className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-md text-white transition"
      >
        <Plus size={14} />
        New
      </button>
    </div>
  );
}

function DraftList({
  savedDrafts,
  selectedDraftId,
  handleLoad,
  handleDelete,
  formatDraftTimestamp,
}) {
  if (!savedDrafts.length) {
    return (
      <div className="p-4 text-sm text-gray-400 text-center">
        No drafts saved.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-800">
      {savedDrafts.map((draft) => (
        <div
          key={draft.id}
          className={`flex items-center justify-between px-4 py-3 hover:bg-[#1e293b] transition cursor-pointer ${
            selectedDraftId === draft.id ? "bg-[#1e293b]" : ""
          }`}
        >
          <div onClick={() => handleLoad(draft)} className="flex-1">
            <p className="text-sm text-white font-medium truncate">
              {draft.name}
            </p>
            {formatDraftTimestamp && (
              <p className="text-xs text-gray-400">
                {formatDraftTimestamp(draft.updatedAt)}
              </p>
            )}
          </div>

          <button
            onClick={() => handleDelete(draft.id)}
            className="ml-3 text-gray-400 hover:text-red-500 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}