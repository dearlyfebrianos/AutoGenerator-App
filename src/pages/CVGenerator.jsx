import React, { useState, useEffect, useRef } from "react";
import {
  Briefcase,
  Download,
  Plus,
  Trash2,
  Save,
  FolderOpen,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Palette,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  User,
  Check,
  Clock,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { toast } from "react-hot-toast";
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
} from "docx";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  saveDraft,
  loadDraft,
  listDrafts,
  clearDraft,
  unlockAchievement,
} from "../utils/draftManager";
import { showBadgeNotification } from "../components/ui/BadgeNotification";
import DraftDropdown from "../components/ui/DraftDropdown";
import SessionRecoveryModal from "../components/ui/SessionRecoveryModal";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";

const COUNTRY_CODES = {
  7: "RU",
  1: "US",
  44: "GB",
  33: "FR",
  49: "DE",
  39: "IT",
  34: "ES",
  61: "AU",
  81: "JP",
  82: "KR",
  86: "CN",
  91: "IN",
  62: "ID",
};

const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const digitsOnly = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) {
    try {
      const phoneNumber = parsePhoneNumberFromString(phone);
      if (phoneNumber && phoneNumber.isValid()) {
        return phoneNumber.formatInternational();
      }
    } catch (error) {
      console.warn("Error parsing international number:", error);
    }
    return phone;
  }
  if (
    digitsOnly.length >= 10 &&
    digitsOnly.length <= 13 &&
    digitsOnly.startsWith("0") &&
    (digitsOnly.startsWith("08") ||
      digitsOnly.startsWith("021") ||
      digitsOnly.startsWith("022") ||
      digitsOnly.startsWith("031") ||
      digitsOnly.startsWith("0411") ||
      digitsOnly.startsWith("061") ||
      digitsOnly.startsWith("0711") ||
      digitsOnly.startsWith("0911"))
  ) {
    try {
      const localNumber = digitsOnly.substring(1);
      const phoneNumber = parsePhoneNumberFromString(`+62${localNumber}`);
      if (phoneNumber && phoneNumber.isValid()) {
        return phoneNumber.formatInternational();
      }
    } catch (error) {
      console.warn("Error formatting Indonesian number:", error);
    }
  }
  if (digitsOnly.length >= 8) {
    const countryPrefixes = [
      "1",
      "44",
      "33",
      "49",
      "39",
      "34",
      "61",
      "81",
      "82",
      "86",
      "91",
      "62",
    ];
    for (let prefix of countryPrefixes) {
      if (digitsOnly.startsWith(prefix)) {
        try {
          const phoneNumber = parsePhoneNumberFromString(`+${digitsOnly}`);
          if (phoneNumber && phoneNumber.isValid()) {
            return phoneNumber.formatInternational();
          }
        } catch {
          const countryMap = {
            1: "US",
            44: "GB",
            33: "FR",
            49: "DE",
            39: "IT",
            34: "ES",
            61: "AU",
            81: "JP",
            82: "KR",
            86: "CN",
            91: "IN",
            62: "ID",
          };
          try {
            const phoneNumber = parsePhoneNumberFromString(
              `+${digitsOnly}`,
              countryMap[prefix],
            );
            if (phoneNumber && phoneNumber.isValid()) {
              return phoneNumber.formatInternational();
            }
          } catch (fallbackError) {
            console.warn("Error formatting fallback number:", fallbackError);
          }
        }
      }
    }
  }
  return phone;
};

const DEFAULT_PERSONAL_INFO = {
  nama: "",
  email: "",
  telepon: "",
  alamat: "",
  kota: "",
  link: "",
};

const createDefaultSections = () => [
  {
    id: 1,
    type: "custom",
    title: "PENDIDIKAN",
    items: [{ id: 1, judul: "", subjudul: "", tahun: "", deskripsi: "" }],
  },
  {
    id: 2,
    type: "custom",
    title: "PENGALAMAN KERJA",
    items: [{ id: 1, judul: "", subjudul: "", tahun: "", deskripsi: "" }],
  },
];

const AutoSaveIndicator = ({ status }) => {
  const icons = {
    saved: <Check size={14} className="text-green-500" />,
    saving: <Clock size={14} className="text-blue-500 animate-pulse" />,
    idle: null,
  };

  const messages = {
    saved: "Tersimpan",
    saving: "Menyimpan...",
    idle: "",
  };

  if (status === "idle") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-1 text-xs font-medium"
    >
      {icons[status]}
      <span className={status === "saved" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}>
        {messages[status]}
      </span>
    </motion.div>
  );
};

const SortableSection = ({
  section,
  index,
  sectionsLength,
  onRemove,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
  isCollapsed,
  toggleCollapse,
  onMoveUp,
  onMoveDown,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: section.id,
    activationConstraint: {
      distance: 8,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [showActions, setShowActions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };
    if (showActions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showActions]);

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        zIndex: showActions ? 999 : isDragging ? 1000 : "auto",
      }}
      className="mb-6 relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex justify-between items-center p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
          {!isMobile && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 transition-colors"
              style={{ touchAction: 'none' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
          )}
          
          <input
            type="text"
            value={section.title}
            onChange={(e) => {
              e.stopPropagation();
              onUpdateItem(section.id, null, "title", e.target.value);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onFocus={(e) => {
              setShowActions(false);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="text-lg md:text-xl font-bold text-gray-800 dark:text-white pb-1 border-b-2 border-purple-600 dark:border-purple-500 bg-transparent focus:outline-none focus:border-purple-700 dark:focus:border-purple-400 flex-1 min-w-0 transition-colors"
            placeholder="JUDUL SECTION"
            style={{ textTransform: "uppercase" }}
          />
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0 ml-2">
          <div className="relative" ref={actionsRef}>
            <button
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              aria-label="Aksi section"
            >
              <MoreVertical size={18} />
            </button>
            
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  style={{
                    zIndex: 9999,
                    pointerEvents: "auto",
                  }}
                >
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp(index);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ArrowUp size={16} />
                      <span>Pindah Ke Atas</span>
                    </button>
                  )}
                  
                  {index < sectionsLength - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown(index);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ArrowDown size={16} />
                      <span>Pindah Ke Bawah</span>
                    </button>
                  )}
                  
                  {(index > 0 || index < sectionsLength - 1) && (
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(section.id);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Hapus Section</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
            aria-label={isCollapsed ? "Buka section" : "Tutup section"}
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mt-2"
          >
            {section.items.map((item) => (
              <div
                key={item.id}
                className="mb-4 p-3 md:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Item
                  </h4>
                  {section.items.length > 1 && (
                    <button
                      onClick={() => onRemoveItem(section.id, item.id)}
                      className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                      aria-label="Hapus item"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={item.judul}
                    onChange={(e) =>
                      onUpdateItem(section.id, item.id, "judul", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                    placeholder="Judul (mis. Nama Institusi / Posisi)"
                  />
                  <input
                    type="text"
                    value={item.subjudul}
                    onChange={(e) =>
                      onUpdateItem(
                        section.id,
                        item.id,
                        "subjudul",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                    placeholder="Sub-judul (mis. Jurusan / Perusahaan)"
                  />
                  <input
                    type="text"
                    value={item.tahun}
                    onChange={(e) =>
                      onUpdateItem(section.id, item.id, "tahun", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                    placeholder="Tahun / Periode"
                  />
                  <textarea
                    value={item.deskripsi}
                    onChange={(e) =>
                      onUpdateItem(
                        section.id,
                        item.id,
                        "deskripsi",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                    rows="3"
                    placeholder="Deskripsi / Detail"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => onAddItem(section.id)}
              className="w-full py-2 border-2 border-dashed border-purple-300 dark:border-purple-500 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <Plus size={14} />
              <span>Tambah Item</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CVGenerator = () => {
  const [personalInfo, setPersonalInfo] = useState(DEFAULT_PERSONAL_INFO);
  const [profileSummary, setProfileSummary] = useState("");
  const [sections, setSections] = useState(() => createDefaultSections());
  const [foto, setFoto] = useState(null);
  const [template, setTemplate] = useState("minimal");
  const [draftName, setDraftName] = useState("");
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [selectedDraftId, setSelectedDraftId] = useState("");
  const [activeId, setActiveId] = useState(null);
  const fileInputRef = useRef(null);
  const cvRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);
  
  const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedDataRef = useRef(null);

  const [isPersonalInfoCollapsed, setIsPersonalInfoCollapsed] = useState(() => {
    const saved = localStorage.getItem("cv_personal_info_collapsed");
    return saved === "true";
  });

  const [collapsedSections, setCollapsedSections] = useState(() => {
    const saved = localStorage.getItem("cv_collapsed_sections");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Invalid collapsed sections in localStorage");
      }
    }
    return createDefaultSections().reduce((acc, sec) => {
      acc[sec.id] = false;
      return acc;
    }, {});
  });

  const toggleCollapse = (sectionId) => {
    setCollapsedSections((prev) => {
      const newState = {
        ...prev,
        [sectionId]: !prev[sectionId],
      };
      localStorage.setItem("cv_collapsed_sections", JSON.stringify(newState));
      return newState;
    });
  };

  const togglePersonalInfo = () => {
    const newState = !isPersonalInfoCollapsed;
    setIsPersonalInfoCollapsed(newState);
    localStorage.setItem("cv_personal_info_collapsed", String(newState));
  };

  const getCurrentDraftData = () => ({
    personalInfo,
    profileSummary,
    sections,
    template,
    foto,
  });

  const resetEditor = () => {
    setPersonalInfo(DEFAULT_PERSONAL_INFO);
    setProfileSummary("");
    setSections(createDefaultSections());
    setTemplate("minimal");
    setFoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    localStorage.removeItem("cv_session_recovery");
  };

  const applyDraftData = (draft) => {
    if (!draft) return;
    setPersonalInfo({
      ...DEFAULT_PERSONAL_INFO,
      ...(draft.personalInfo || {}),
    });
    setProfileSummary(draft.profileSummary || "");
    setSections(
      Array.isArray(draft.sections) && draft.sections.length > 0
        ? draft.sections
        : createDefaultSections(),
    );
    setTemplate(draft.template || "minimal");
    setFoto(draft.foto || null);
    if (!draft.foto && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const refreshDrafts = () => {
    const drafts = listDrafts();
    setSavedDrafts(drafts);
    return drafts;
  };

  const updateSelectedDraft = (draftId) => {
    setSelectedDraftId(draftId);
    if (draftId) {
      localStorage.setItem("cv_last_selected_draft", draftId);
      console.log("✅ Saved to localStorage:", draftId);
    } else {
      localStorage.removeItem("cv_last_selected_draft");
      console.log("❌ Removed from localStorage");
    }
  };

  const handleRestoreSession = () => {
    if (recoveryData) {
      applyDraftData(recoveryData);
      if (recoveryData.draftName) {
        setDraftName(recoveryData.draftName);
      }
      toast.success("Data berhasil dipulihkan!", { duration: 3000 });
      console.log("✅ Session recovered");
    }
    setShowRecoveryModal(false);
  };

  const handleDiscardSession = () => {
    localStorage.removeItem("cv_session_recovery");
    setShowRecoveryModal(false);
    setDraftName("Draft 1");
  };

  useEffect(() => {
    if (isInitialLoad) {
      return;
    }

    const sessionTimeout = setTimeout(() => {
      const sessionData = getCurrentDraftData();
      
      localStorage.setItem("cv_session_recovery", JSON.stringify({
        ...sessionData,
        timestamp: Date.now(),
        draftName: draftName,
        selectedDraftId: selectedDraftId,
      }));
      console.log("💾 Session recovery saved", { selectedDraftId });
    }, 1000);

    return () => clearTimeout(sessionTimeout);
  }, [personalInfo, profileSummary, sections, template, foto, draftName, selectedDraftId, isInitialLoad]);

useEffect(() => {
  if (isInitialLoad || !selectedDraftId) return;

  if (autoSaveTimeoutRef.current) {
    clearTimeout(autoSaveTimeoutRef.current);
  }

  setAutoSaveStatus("saving");

  autoSaveTimeoutRef.current = setTimeout(() => {
    const currentData = getCurrentDraftData();
    const currentDataString = JSON.stringify(currentData);

    if (lastSavedDataRef.current === currentDataString) {
      setAutoSaveStatus("saved");
      return;
    }

    const currentDraft = savedDrafts.find((d) => d.id === selectedDraftId);
    if (currentDraft) {
      const saved = saveDraft(currentData, {
        id: selectedDraftId,
        name: currentDraft.name,
      });

      if (saved) {
        lastSavedDataRef.current = currentDataString;
        setAutoSaveStatus("saved");
        console.log("💾 Auto-saved:", currentDraft.name);
        setTimeout(() => setAutoSaveStatus("idle"), 1000);
      } else {
        setAutoSaveStatus("idle");
        console.error("❌ Auto-save failed");
      }
    }
  }, 300);

  return () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  };
}, [personalInfo, profileSummary, sections, template, foto, selectedDraftId, isInitialLoad, savedDrafts]);

  useEffect(() => {
    const drafts = listDrafts();
    setSavedDrafts(drafts);

    const sessionRecovery = localStorage.getItem("cv_session_recovery");
    const lastSelectedDraftId = localStorage.getItem("cv_last_selected_draft");

    const checkSessionRecovery = (sessionRecovery) => {
      try {
        const recoveryDataParsed = JSON.parse(sessionRecovery);
        const recoveryAge = Date.now() - (recoveryDataParsed.timestamp || 0);

        if (recoveryAge < 86400000) {
          if (recoveryDataParsed.selectedDraftId) {
            const draftData = loadDraft(recoveryDataParsed.selectedDraftId);
            if (draftData) {
              applyDraftData(draftData);
              setSelectedDraftId(recoveryDataParsed.selectedDraftId);
              setDraftName(recoveryDataParsed.draftName || "Draft");
              console.log("✅ Auto-loaded from draft (via recovery):", recoveryDataParsed.draftName);
              localStorage.removeItem("cv_session_recovery");
              return;
            }
          }
          
          setRecoveryData(recoveryDataParsed);
          setShowRecoveryModal(true);
        } else {
          localStorage.removeItem("cv_session_recovery");
          setDraftName("Draft 1");
        }
      } catch (error) {
        console.error("Error loading session recovery:", error);
        localStorage.removeItem("cv_session_recovery");
        setDraftName("Draft 1");
      }
    };

    if (lastSelectedDraftId && drafts.length > 0) {
      const draftExists = drafts.find((d) => d.id === lastSelectedDraftId);
      
      if (draftExists) {
        const draftData = loadDraft(lastSelectedDraftId);
        if (draftData) {
          applyDraftData(draftData);
          setSelectedDraftId(lastSelectedDraftId);
          setDraftName(draftExists.name);
          console.log("✅ Auto-loaded draft (skip modal):", draftExists.name);
          
          localStorage.removeItem("cv_session_recovery");
        }
      } else {
        localStorage.removeItem("cv_last_selected_draft");
        
        checkSessionRecovery(sessionRecovery);
      }
    } 
    else if (sessionRecovery) {
      checkSessionRecovery(sessionRecovery);
    } 
    else {
      setDraftName("Draft 1");
    }

    setTimeout(() => setIsInitialLoad(false), 500);
    
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showRecoveryModal) {
        handleDiscardSession();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isDraftOpen, setIsDraftOpen] = useState(false);

  const toggleTemplate = () => {
    setIsTemplateOpen((prev) => !prev);
  };

  const toggleDraft = () => {
    setIsDraftOpen((prev) => !prev);
  };

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      type: "custom",
      title: "",
      items: [{ id: 1, judul: "", subjudul: "", tahun: "", deskripsi: "" }],
    };
    setSections([...sections, newSection]);
    setCollapsedSections((prev) => {
      const newState = {
        ...prev,
        [newSection.id]: false,
      };
      localStorage.setItem("cv_collapsed_sections", JSON.stringify(newState));
      return newState;
    });
  };

  const removeSection = (sectionId) => {
    setSections(sections.filter((section) => section.id !== sectionId));
    setCollapsedSections((prev) => {
      const newState = { ...prev };
      delete newState[sectionId];
      localStorage.setItem("cv_collapsed_sections", JSON.stringify(newState));
      return newState;
    });
  };

  const updateSection = (sectionId, field, value) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section,
      ),
    );
  };

  const addItem = (sectionId) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const newItem = {
            id: Date.now(),
            judul: "",
            subjudul: "",
            tahun: "",
            deskripsi: "",
          };
          return { ...section, items: [...section.items, newItem] };
        }
        return section;
      }),
    );
  };

  const removeItem = (sectionId, itemId) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.filter((item) => item.id !== itemId),
          };
        }
        return section;
      }),
    );
  };

  const updateItem = (sectionId, itemId, field, value) => {
    if (itemId === null) {
      updateSection(sectionId, field, value);
      return;
    }
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, [field]: value } : item,
            ),
          };
        }
        return section;
      }),
    );
  };

  const moveSectionUp = (index) => {
    if (index > 0) {
      const newSections = [...sections];
      [newSections[index - 1], newSections[index]] = [
        newSections[index],
        newSections[index - 1],
      ];
      setSections(newSections);
      toast.success("Section dipindahkan ke atas", { duration: 2000 });
    }
  };

  const moveSectionDown = (index) => {
    if (index < sections.length - 1) {
      const newSections = [...sections];
      [newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ];
      setSections(newSections);
      toast.success("Section dipindahkan ke bawah", { duration: 2000 });
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHapusFoto = () => {
    setFoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDraftTimestamp = (timestamp) => {
    if (!timestamp) return "-";
    try {
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(timestamp));
    } catch {
      return "-";
    }
  };

  const handleSaveDraft = () => {
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      toast.error("Nama draft wajib diisi!", { duration: 3000 });
      return;
    }

    const currentData = getCurrentDraftData();
    const existingDraft = savedDrafts.find(
      (draft) => draft.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    let draftIdToUse = null;
    if (existingDraft) {
      draftIdToUse = existingDraft.id;
    } else {
      draftIdToUse = `draft_${Date.now()}`;
    }

    const saved = saveDraft(currentData, {
      id: draftIdToUse,
      name: trimmedName,
    });

    if (!saved) {
      toast.error("Gagal menyimpan draft!", { duration: 3000 });
      return;
    }

    const updatedDrafts = listDrafts();
    setSavedDrafts(updatedDrafts);

    updateSelectedDraft(draftIdToUse);
    setDraftName(trimmedName);
    
    lastSavedDataRef.current = JSON.stringify(currentData);

    toast.success(
      existingDraft
        ? "Draft berhasil diperbarui!"
        : "Draft baru berhasil disimpan!",
      { duration: 3000 },
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDownloadDOCX = () => {
    const requiredFields = [
      { value: personalInfo.nama, label: "Nama Lengkap" },
      { value: personalInfo.email, label: "Email" },
      { value: personalInfo.telepon, label: "Nomor Telepon" },
      { value: personalInfo.alamat, label: "Alamat" },
      { value: personalInfo.kota, label: "Kota / Provinsi" },
    ];
    const missingFields = requiredFields.filter((field) => !field.value.trim());
    if (missingFields.length > 0) {
      toast.error(
        `Harap isi semua field wajib:\n${missingFields.map((f) => f.label).join(", ")}`,
        {
          duration: 5000,
          style: {
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "14px",
            lineHeight: "1.4",
          },
        },
      );
      return;
    }
    const formattedPhone = formatPhoneNumber(personalInfo.telepon);
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: personalInfo.nama.toUpperCase(),
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `${personalInfo.email} | ${formattedPhone}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `${personalInfo.alamat}${personalInfo.kota ? `, ${personalInfo.kota}` : ""}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({}),
            ...(profileSummary
              ? [
                  new Paragraph({
                    text: "RINGKASAN PROFIL",
                    heading: HeadingLevel.HEADING_1,
                  }),
                  new Paragraph(profileSummary),
                ]
              : []),
            ...sections.flatMap((section) => [
              new Paragraph({
                text: section.title,
                heading: HeadingLevel.HEADING_1,
              }),
              ...section.items.map((item) => {
                const children = [];
                if (item.judul)
                  children.push(new TextRun({ text: item.judul, bold: true }));
                if (item.subjudul) {
                  if (children.length > 0)
                    children.push(new TextRun({ text: " • ", bold: false }));
                  children.push(new TextRun(item.subjudul));
                }
                if (item.tahun) {
                  if (children.length > 0)
                    children.push(new TextRun({ text: " • ", bold: false }));
                  children.push(new TextRun(item.tahun));
                }
                if (item.deskripsi) {
                  if (children.length > 0)
                    children.push(new TextRun({ text: "\n", bold: false }));
                  children.push(new TextRun(item.deskripsi));
                }
                return new Paragraph({ children });
              }),
            ]),
          ],
        },
      ],
    });
    Packer.toBlob(doc).then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `CV ATS ${personalInfo.nama.replace(/\s+/g, " ").toUpperCase()}.docx`;
      link.click();
      const unlocked = unlockAchievement("word_export");
      if (unlocked) {
        showBadgeNotification(
          "Dokumen Master!",
          "Kamu telah mengekspor CV ke format Word!",
        );
      }
    });
  };

  const handleDownloadCV = () => {
    const requiredFields = [
      { value: personalInfo.nama, label: "Nama Lengkap" },
      { value: personalInfo.email, label: "Email" },
      { value: personalInfo.telepon, label: "Nomor Telepon" },
      { value: personalInfo.alamat, label: "Alamat" },
      { value: personalInfo.kota, label: "Kota / Provinsi" },
    ];
    const missingFields = requiredFields.filter((field) => !field.value.trim());
    if (missingFields.length > 0) {
      toast.error(
        `Harap isi semua field wajib:\n${missingFields.map((f) => f.label).join(", ")}`,
        {
          duration: 5000,
          style: {
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "14px",
            lineHeight: "1.4",
          },
        },
      );
      return;
    }
    if (!cvRef.current) return;
    const clone = cvRef.current.cloneNode(true);
    const allElements = clone.querySelectorAll("*");
    allElements.forEach((el) => {
      if (el.classList) {
        const classesToRemove = Array.from(el.classList).filter(
          (cls) => cls.startsWith("dark:") || cls.includes("dark"),
        );
        classesToRemove.forEach((cls) => el.classList.remove(cls));
      }
      const tagName = el.tagName.toLowerCase();
      if (
        ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "div"].includes(
          tagName,
        )
      ) {
        el.style.color = "#000000";
      }
      if (el.style.borderColor || el.className.includes("border")) {
        el.style.borderColor = "#000000";
      }
      if (tagName === "img") {
        el.style.backgroundColor = "#ffffff";
        el.style.border = "none";
      }
    });
    clone.style.backgroundColor = "#ffffff";
    clone.style.color = "#000000";
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.backgroundColor = "#ffffff";
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `CV ATS ${personalInfo.nama.replace(/\s+/g, "_").toUpperCase() || "SAYA"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };
    html2pdf()
      .set(opt)
      .from(clone)
      .save()
      .then(() => {
        toast.custom(
          (t) => (
            <div
              className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-green-500 text-white shadow-lg rounded-lg pointer-events-auto flex p-4`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    CV ATS{" "}
                    <span className="font-bold">
                      {personalInfo.nama.replace(/\s+/g, "_").toUpperCase()}.pdf
                    </span>{" "}
                    berhasil diunduh!
                  </p>
                </div>
              </div>
            </div>
          ),
          { duration: 5000 },
        );
        const unlocked = unlockAchievement("pdf_export");
        if (unlocked) {
          showBadgeNotification(
            "PDF Pro!",
            "Kamu telah mengunduh CV dalam format PDF!",
          );
        }
        const exports = JSON.parse(localStorage.getItem("cv_exports") || "0");
        localStorage.setItem("cv_exports", JSON.stringify(exports + 1));
        if (exports + 1 === 5) {
          unlockAchievement("cv_master") &&
            showBadgeNotification(
              "CV Master!",
              "Kamu telah membuat 5 CV! Luar biasa!",
            );
        }
      })
      .finally(() => {
        document.body.removeChild(tempContainer);
      });
  };

  const getTemplateClass = () => {
    switch (template) {
      case "corporate":
        return "border-l-4 border-blue-600 pl-4";
      default:
        return "";
    }
  };

  const formattedPhonePreview = formatPhoneNumber(personalInfo.telepon);

  return (
    <>
      <SessionRecoveryModal
        isOpen={showRecoveryModal}
        onRestore={handleRestoreSession}
        onDiscard={handleDiscardSession}
        timestamp={recoveryData?.timestamp}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-2 md:px-0">
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-8 relative">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                <Briefcase
                  className="mr-2 md:mr-3 text-purple-600 dark:text-purple-400"
                  size={28}
                />
                CV Generator
              </h2>
              {selectedDraftId && (
                <AutoSaveIndicator status={autoSaveStatus} />
              )}
            </div>

            <div className="mb-4 md:mb-6 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden relative z-10">
              <button
                onClick={toggleTemplate}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <Palette
                    className="text-purple-600 dark:text-purple-400"
                    size={18}
                  />
                  <span className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">
                    Pilih Template CV
                  </span>
                </div>
                <div
                  className="transition-transform duration-300"
                  style={{
                    transform: isTemplateOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ChevronDown
                    className="text-gray-600 dark:text-gray-400"
                    size={18}
                  />
                </div>
              </button>
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isTemplateOpen ? "500px" : "0px",
                  opacity: isTemplateOpen ? 1 : 0,
                }}
              >
                <div className="p-3 md:p-4 grid grid-cols-1 gap-2 md:gap-3">
                  {[
                    {
                      id: "minimal",
                      name: "Minimalis",
                      desc: "Bersih & profesional",
                    },
                    {
                      id: "corporate",
                      name: "Korporat",
                      desc: "Formal & terstruktur",
                    },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setTemplate(tpl.id);
                        toast.success(`Template ${tpl.name} dipilih!`, {
                          duration: 2000,
                        });
                      }}
                      className={`p-3 rounded-lg border-2 transition-all text-left transform hover:scale-[1.02] ${
                        template === tpl.id
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md"
                          : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="font-bold text-sm md:text-base text-gray-800 dark:text-white">
                        {tpl.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {tpl.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4 md:mb-6 border border-gray-200 dark:border-gray-600 rounded-xl relative z-[9999]">
              <button
                onClick={toggleDraft}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 rounded-xl"
              >
                <div className="flex items-center space-x-2">
                  <FolderOpen
                    className="text-blue-600 dark:text-blue-400"
                    size={18}
                  />
                  <span className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">
                    Kelola Draft
                  </span>
                </div>
                <div
                  className="transition-transform duration-300"
                  style={{
                    transform: isDraftOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ChevronDown
                    className="text-gray-600 dark:text-gray-400"
                    size={18}
                  />
                </div>
              </button>
              <div
                className="transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isDraftOpen ? "500px" : "0px",
                  opacity: isDraftOpen ? 1 : 0,
                  overflow: isDraftOpen ? "visible" : "hidden",
                }}
              >
                <div className="p-3 md:p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nama Draft
                    </label>
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 transition-all text-sm md:text-base"
                      placeholder="Contoh: CV Marketing 2026"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 relative z-[99999]">
                    <div className="flex-1">
                      <DraftDropdown
                        savedDrafts={savedDrafts}
                        selectedDraftId={selectedDraftId}
                        setSelectedDraftId={updateSelectedDraft}
                        setDraftName={setDraftName}
                        loadDraft={loadDraft}
                        applyDraftData={applyDraftData}
                        clearDraft={clearDraft}
                        resetEditor={resetEditor}
                        refreshDrafts={refreshDrafts}
                        formatDraftTimestamp={formatDraftTimestamp}
                      />
                    </div>
                    <button
                      onClick={handleSaveDraft}
                      className="flex items-center justify-center space-x-1 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 text-sm md:text-base whitespace-nowrap"
                    >
                      <Save size={16} />
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              <div
                className="flex justify-between items-center p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer"
                onClick={togglePersonalInfo}
              >
                <div className="flex items-center space-x-2">
                  <User
                    className="text-purple-600 dark:text-purple-400"
                    size={20}
                  />
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                    Informasi Pribadi
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePersonalInfo();
                    }}
                    aria-label={
                      isPersonalInfoCollapsed
                        ? "Buka informasi pribadi"
                        : "Tutup informasi pribadi"
                    }
                  >
                    {isPersonalInfoCollapsed ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronUp size={18} />
                    )}
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {!isPersonalInfoCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden pt-3 md:pt-4"
                  >
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Foto Profil (Opsional)
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base"
                      />
                      {foto && (
                        <div className="mt-3 relative inline-block">
                          <img
                            src={foto}
                            alt="Preview Foto"
                            className="w-20 h-20 object-cover rounded border-2 border-gray-300 dark:border-gray-600"
                          />
                          <button
                            onClick={handleHapusFoto}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                            aria-label="Hapus foto"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 md:space-y-4">
                      <input
                        type="text"
                        value={personalInfo.nama}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            nama: e.target.value,
                          })
                        }
                        className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border ${
                          !personalInfo.nama.trim()
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base`}
                        placeholder="Nama Lengkap"
                        style={{ textTransform: "uppercase" }}
                      />
                      {!personalInfo.nama.trim() && (
                        <p className="text-xs md:text-sm text-red-600">
                          Wajib diisi
                        </p>
                      )}
                      <input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            email: e.target.value,
                          })
                        }
                        className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border ${
                          !personalInfo.email.trim()
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base`}
                        placeholder="Email"
                      />
                      {!personalInfo.email.trim() && (
                        <p className="text-xs md:text-sm text-red-600">
                          Wajib diisi
                        </p>
                      )}
                      <input
                        type="url"
                        value={personalInfo.link}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            link: e.target.value,
                          })
                        }
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base"
                        placeholder="Link Portfolio / LinkedIn / GitHub"
                      />
                      <input
                        type="tel"
                        value={personalInfo.telepon}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            telepon: e.target.value,
                          })
                        }
                        className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border ${
                          !personalInfo.telepon.trim()
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base`}
                        placeholder="Nomor Telepon"
                      />
                      {!personalInfo.telepon.trim() && (
                        <p className="text-xs md:text-sm text-red-600">
                          Wajib diisi
                        </p>
                      )}
                      <input
                        type="text"
                        value={personalInfo.alamat}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            alamat: e.target.value,
                          })
                        }
                        className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border ${
                          !personalInfo.alamat.trim()
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base`}
                        placeholder="Alamat"
                      />
                      {!personalInfo.alamat.trim() && (
                        <p className="text-xs md:text-sm text-red-600">
                          Wajib diisi
                        </p>
                      )}
                      <input
                        type="text"
                        value={personalInfo.kota}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            kota: e.target.value,
                          })
                        }
                        className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border ${
                          !personalInfo.kota.trim()
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base`}
                        placeholder="Kota, Provinsi"
                      />
                      {!personalInfo.kota.trim() && (
                        <p className="text-xs md:text-sm text-red-600">
                          Wajib diisi
                        </p>
                      )}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h4 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-2">
                          Deskripsi Diri (Ringkasan Profil)
                        </h4>
                        <textarea
                          value={profileSummary}
                          onChange={(e) => setProfileSummary(e.target.value)}
                          className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 min-h-[100px] md:min-h-[120px] text-sm md:text-base"
                          placeholder="Contoh: Lulusan S1..."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            >
              <SortableContext
                items={sections.map((section) => section.id)}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((section, index) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    index={index}
                    sectionsLength={sections.length}
                    onRemove={removeSection}
                    onUpdateItem={updateItem}
                    onRemoveItem={removeItem}
                    onAddItem={addItem}
                    isCollapsed={collapsedSections[section.id] || false}
                    toggleCollapse={() => toggleCollapse(section.id)}
                    onMoveUp={moveSectionUp}
                    onMoveDown={moveSectionDown}
                  />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 w-full max-w-2xl">
                    <div className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                      Sedang Dipindahkan...
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            <button
              onClick={addSection}
              className="w-full py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 transform hover:scale-[1.02] text-sm md:text-base"
            >
              <Plus size={18} />
              <span>Tambah Section Baru</span>
            </button>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-8">
            <div className="flex justify-between items-center mb-4 md:mb-6 gap-2">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                Preview CV
              </h3>
              <div className="flex space-x-1.5 md:space-x-2">
                <button
                  onClick={handleDownloadCV}
                  className="flex items-center space-x-1 md:space-x-2 bg-green-600 text-white px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 text-xs md:text-base"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                  onClick={handleDownloadDOCX}
                  className="flex items-center space-x-1 md:space-x-2 bg-blue-600 text-white px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 text-xs md:text-base"
                >
                  <FileText size={16} />
                  <span className="hidden sm:inline">Word</span>
                </button>
              </div>
            </div>
            <div
              ref={cvRef}
              className={
                template === "elegant"
                  ? "p-4 md:p-8 min-h-[600px] md:min-h-[800px]"
                  : `p-4 md:p-8 min-h-[600px] md:min-h-[800px] ${getTemplateClass()}`
              }
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              <div className="text-center mb-4 md:mb-6 pb-4 md:pb-6">
                {foto ? (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 md:gap-6">
                    <div className="flex-shrink-0 relative">
                      <img
                        src={foto}
                        alt="Foto Profil"
                        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded border-2 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {personalInfo.nama.toUpperCase() || "NAMA LENGKAP"}
                      </h1>
                      <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex flex-wrap justify-center sm:justify-start gap-1">
                        {(() => {
                          const contactItems = [];
                          if (personalInfo.email)
                            contactItems.push(personalInfo.email);
                          if (personalInfo.link) {
                            contactItems.push(
                              <a
                                key="link"
                                href={personalInfo.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 break-all"
                              >
                                {personalInfo.link}
                              </a>,
                            );
                          }
                          if (formattedPhonePreview)
                            contactItems.push(formattedPhonePreview);
                          return contactItems.map((item, index) => (
                            <React.Fragment key={index}>
                              {item}
                              {index < contactItems.length - 1 && <span>|</span>}
                            </React.Fragment>
                          ));
                        })()}
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {personalInfo.alamat || "Alamat"}
                        {personalInfo.kota && `, ${personalInfo.kota}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {personalInfo.nama.toUpperCase() || "NAMA LENGKAP"}
                    </h1>
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex flex-wrap justify-center gap-1">
                      {(() => {
                        const contactItems = [];
                        if (personalInfo.email)
                          contactItems.push(personalInfo.email);
                        if (personalInfo.link) {
                          contactItems.push(
                            <a
                              key="link"
                              href={personalInfo.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 break-all"
                            >
                              {personalInfo.link}
                            </a>,
                          );
                        }
                        if (formattedPhonePreview)
                          contactItems.push(formattedPhonePreview);
                        return contactItems.map((item, index) => (
                          <React.Fragment key={index}>
                            {item}
                            {index < contactItems.length - 1 && <span>|</span>}
                          </React.Fragment>
                        ));
                      })()}
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {personalInfo.alamat || "Alamat"}
                      {personalInfo.kota && `, ${personalInfo.kota}`}
                    </p>
                  </>
                )}
              </div>
              {profileSummary && (
                <div className="mb-2 text-justify">
                  <p className="leading-5 md:leading-6 text-sm md:text-base text-gray-800 dark:text-gray-300">
                    {profileSummary}
                  </p>
                </div>
              )}
              {sections.map((section) => (
                <div key={section.id} className="mb-4 md:mb-6">
                  <div className="border-t-2 border-gray-800 dark:border-gray-400 pt-2 md:pt-3 mb-3 md:mb-4">
                    <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                      {section.title.toUpperCase() || "SECTION TITLE"}
                    </h2>
                  </div>
                  {section.items.map((item) => (
                    <div key={item.id} className="mb-3 md:mb-4">
                      {item.judul && (
                        <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white">
                          {item.judul}
                        </h3>
                      )}
                      {item.subjudul && (
                        <p className="text-xs md:text-sm text-gray-700 dark:text-gray-400">
                          {item.subjudul}
                        </p>
                      )}
                      {item.tahun && (
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-500 italic">
                          {item.tahun}
                        </p>
                      )}
                      {item.deskripsi && (
                        <p className="text-xs md:text-sm text-gray-700 dark:text-gray-400 mt-1 whitespace-pre-wrap">
                          {item.deskripsi}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CVGenerator;