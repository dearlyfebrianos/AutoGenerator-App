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

const CVGenerator = () => {
  const [personalInfo, setPersonalInfo] = useState(DEFAULT_PERSONAL_INFO);
  const [profileSummary, setProfileSummary] = useState("");
  const [sections, setSections] = useState(() => createDefaultSections());
  const [foto, setFoto] = useState(null);
  const [template, setTemplate] = useState("minimal");
  const [draftName, setDraftName] = useState("");
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [selectedDraftId, setSelectedDraftId] = useState("");
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const fileInputRef = useRef(null);
  const cvRef = useRef(null);

  const toggleTemplate = () => {
    setIsTemplateOpen((prev) => !prev);
  };

  const toggleDraft = () => {
    setIsDraftOpen((prev) => !prev);
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

  useEffect(() => {
    const drafts = listDrafts();
    setSavedDrafts(drafts);

    setSelectedDraftId("");
    setDraftName("");
  }, []);

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      type: "custom",
      title: "",
      items: [{ id: 1, judul: "", subjudul: "", tahun: "", deskripsi: "" }],
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId) => {
    setSections(sections.filter((section) => section.id !== sectionId));
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

  const handleDraftSelection = (event) => {
    const draftId = event.target.value;

    setSelectedDraftId(draftId);

    if (!draftId) {
      setDraftName("Draft 1");
      resetEditor();
      return;
    }

    const selectedDraft = savedDrafts.find((draft) => draft.id === draftId);

    if (selectedDraft) {
      const draftData = loadDraft(draftId);

      if (draftData) {
        applyDraftData(draftData);
        setDraftName(selectedDraft.name);
        toast.success("Draft berhasil dimuat!", { duration: 2000 });
      }
    }
  };

  const handleSaveDraft = () => {
    const trimmedDraftName = draftName.trim();
    if (!trimmedDraftName) {
      toast.error("Nama draft wajib diisi!", { duration: 3000 });
      return;
    }

    const selectedDraft = savedDrafts.find(
      (draft) => draft.id === selectedDraftId,
    );
    const sameNameDraft = savedDrafts.find(
      (draft) => draft.name.toLowerCase() === trimmedDraftName.toLowerCase(),
    );

    const shouldUpdateSelected =
      selectedDraft &&
      selectedDraft.name.toLowerCase() === trimmedDraftName.toLowerCase();
    const draftIdToUpdate = shouldUpdateSelected
      ? selectedDraftId
      : (sameNameDraft?.id ?? undefined);

    const saved = saveDraft(getCurrentDraftData(), {
      id: draftIdToUpdate,
      name: trimmedDraftName,
    });

    if (!saved) {
      toast.error("Draft gagal disimpan!", { duration: 3000 });
      return;
    }

    refreshDrafts();
    setSelectedDraftId(saved.id);
    setDraftName(saved.name);
    toast.success(
      draftIdToUpdate
        ? "Draft berhasil diperbarui!"
        : "Draft baru berhasil disimpan!",
      { duration: 3000 },
    );
  };

  const handleLoadDraft = () => {
    if (!selectedDraftId) {
      toast.error("Pilih draft yang ingin dimuat!", { duration: 3000 });
      return;
    }

    const draft = loadDraft(selectedDraftId);
    if (draft) {
      applyDraftData(draft);
      const metadata = savedDrafts.find((item) => item.id === selectedDraftId);
      if (metadata) {
        setDraftName(metadata.name);
      }
      toast.success("Draft berhasil dimuat!", { duration: 3000 });
    } else {
      toast.error("Tidak ada draft tersimpan!", { duration: 3000 });
    }
  };

  const handleClearDraft = () => {
    if (!selectedDraftId) {
      toast.error("Pilih draft yang ingin dihapus!", { duration: 3000 });
      return;
    }

    clearDraft(selectedDraftId);
    const draftsAfterDelete = refreshDrafts();

    if (draftsAfterDelete.length > 0) {
      const latestDraft = draftsAfterDelete[0];
      setSelectedDraftId(latestDraft.id);
      setDraftName(latestDraft.name);

      const latestDraftData = loadDraft(latestDraft.id);
      if (latestDraftData) {
        applyDraftData(latestDraftData);
      }
    } else {
      setSelectedDraftId("");
      setDraftName("Draft 1");
      resetEditor();
    }

    toast.success("Draft dihapus!", { duration: 3000 });
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
      filename: `CV ATS ${personalInfo.nama.replace(/\s+/g, " ").toUpperCase() || "SAYA"}.pdf`,
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 relative">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Briefcase
              className="mr-3 text-purple-600 dark:text-purple-400"
              size={32}
            />
            CV Generator
          </h2>

          {/* Template Selection - Collapsible */}
          <div className="mb-6 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden relative z-10">
            <button
              onClick={toggleTemplate}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <div className="flex items-center space-x-2">
                <Palette
                  className="text-purple-600 dark:text-purple-400"
                  size={20}
                />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
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
                  size={20}
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
              <div className="p-4 grid grid-cols-1 gap-3">
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
                    <div className="font-bold text-gray-800 dark:text-white">
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

          {/* Draft Section - Collapsible */}
          <div className="mb-6 border border-gray-200 dark:border-gray-600 rounded-xl relative z-[9999]">
            <button
              onClick={toggleDraft}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 rounded-xl"
            >
              <div className="flex items-center space-x-2">
                <FolderOpen
                  className="text-blue-600 dark:text-blue-400"
                  size={20}
                />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
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
                  size={20}
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
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nama Draft
                  </label>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Contoh: CV Marketing 2026"
                  />
                </div>

                <div className="flex items-center gap-2 mt-4 relative z-[99999]">
                  <DraftDropdown
                    savedDrafts={savedDrafts}
                    selectedDraftId={selectedDraftId}
                    setSelectedDraftId={setSelectedDraftId}
                    setDraftName={setDraftName}
                    loadDraft={loadDraft}
                    applyDraftData={applyDraftData}
                    clearDraft={clearDraft}
                    resetEditor={resetEditor}
                    refreshDrafts={refreshDrafts}
                    formatDraftTimestamp={formatDraftTimestamp}
                  />

                  <button
                    onClick={handleSaveDraft}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
                  >
                    <Save size={16} />
                    <span>Simpan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b-2 border-purple-600 dark:border-purple-500">
              Informasi Pribadi
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Foto Profil (Opsional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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

              <input
                type="text"
                value={personalInfo.nama}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, nama: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-lg border ${
                  !personalInfo.nama.trim()
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                placeholder="Nama Lengkap"
                style={{ textTransform: "uppercase" }}
              />
              {!personalInfo.nama.trim() && (
                <p className="text-sm text-red-600">Wajib diisi</p>
              )}

              <input
                type="email"
                value={personalInfo.email}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, email: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-lg border ${
                  !personalInfo.email.trim()
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                placeholder="Email"
              />
              {!personalInfo.email.trim() && (
                <p className="text-sm text-red-600">Wajib diisi</p>
              )}

              <input
                type="url"
                value={personalInfo.link}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, link: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Link Portfolio / LinkedIn / GitHub"
              />

              <input
                type="tel"
                value={personalInfo.telepon}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, telepon: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-lg border ${
                  !personalInfo.telepon.trim()
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                placeholder="Nomor Telepon"
              />
              {!personalInfo.telepon.trim() && (
                <p className="text-sm text-red-600">Wajib diisi</p>
              )}

              <input
                type="text"
                value={personalInfo.alamat}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, alamat: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-lg border ${
                  !personalInfo.alamat.trim()
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                placeholder="Alamat"
              />
              {!personalInfo.alamat.trim() && (
                <p className="text-sm text-red-600">Wajib diisi</p>
              )}

              <input
                type="text"
                value={personalInfo.kota}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, kota: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-lg border ${
                  !personalInfo.kota.trim()
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                placeholder="Kota, Provinsi"
              />
              {!personalInfo.kota.trim() && (
                <p className="text-sm text-red-600">Wajib diisi</p>
              )}
            </div>
          </div>
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b-2 border-purple-600 dark:border-purple-500">
              Deskripsi Diri (Ringkasan Profil)
            </h3>
            <textarea
              value={profileSummary}
              onChange={(e) => setProfileSummary(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 min-h-[120px]"
              placeholder="Contoh: Lulusan S1..."
            />
          </div>
          {sections.map((section) => (
            <div key={section.id} className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) =>
                    updateSection(section.id, "title", e.target.value)
                  }
                  className="text-xl font-bold text-gray-800 dark:text-white pb-2 border-b-2 border-purple-600 dark:border-purple-500 bg-transparent focus:outline-none flex-1"
                  placeholder="JUDUL SECTION"
                  style={{ textTransform: "uppercase" }}
                />
                <button
                  onClick={() => removeSection(section.id)}
                  className="ml-4 text-red-600 dark:text-red-400 hover:text-red-800 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Item
                    </h4>
                    {section.items.length > 1 && (
                      <button
                        onClick={() => removeItem(section.id, item.id)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 transition-colors"
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
                        updateItem(section.id, item.id, "judul", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                      placeholder="Judul (mis. Nama Institusi / Posisi)"
                    />
                    <input
                      type="text"
                      value={item.subjudul}
                      onChange={(e) =>
                        updateItem(
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
                        updateItem(section.id, item.id, "tahun", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                      placeholder="Tahun / Periode"
                    />
                    <textarea
                      value={item.deskripsi}
                      onChange={(e) =>
                        updateItem(
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
                onClick={() => addItem(section.id)}
                className="w-full py-2 border-2 border-dashed border-purple-300 dark:border-purple-500 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all flex items-center justify-center space-x-2"
              >
                <Plus size={18} />
                <span>Tambah Item</span>
              </button>
            </div>
          ))}
          <button
            onClick={addSection}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 transform hover:scale-[1.02]"
          >
            <Plus size={20} />
            <span>Tambah Section Baru</span>
          </button>
        </div>
      </div>
      <div className="lg:sticky lg:top-24 h-fit">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Preview CV
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={handleDownloadCV}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"
              >
                <Download size={18} />
                <span>PDF</span>
              </button>
              <button
                onClick={handleDownloadDOCX}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
              >
                <FileText size={18} />
                <span>Word</span>
              </button>
            </div>
          </div>
          <div
            ref={cvRef}
            className={
              template === "elegant"
                ? ""
                : `p-8 min-h-[800px] ${getTemplateClass()}`
            }
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            <div className="text-center mb-6 pb-6">
              {foto ? (
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 relative">
                    <img
                      src={foto}
                      alt="Foto Profil"
                      className="w-24 h-24 object-cover rounded border-2 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {personalInfo.nama.toUpperCase() || "NAMA LENGKAP"}
                    </h1>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap justify-center gap-1">
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
                              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {personalInfo.alamat || "Alamat"}
                      {personalInfo.kota && `, ${personalInfo.kota}`}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {personalInfo.nama.toUpperCase() || "NAMA LENGKAP"}
                  </h1>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap justify-center gap-1">
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
                            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {personalInfo.alamat || "Alamat"}
                    {personalInfo.kota && `, ${personalInfo.kota}`}
                  </p>
                </>
              )}
            </div>
            {profileSummary && (
              <div className="mb-2 text-justify">
                <p className="leading-6 text-gray-800 dark:text-gray-300">
                  {profileSummary}
                </p>
              </div>
            )}
            {sections.map((section) => (
              <div key={section.id} className="mb-6">
                <div className="border-t-2 border-gray-800 dark:border-gray-400 pt-3 mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {section.title.toUpperCase() || "SECTION TITLE"}
                  </h2>
                </div>
                {section.items.map((item) => (
                  <div key={item.id} className="mb-4">
                    {item.judul && (
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {item.judul}
                      </h3>
                    )}
                    {item.subjudul && (
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        {item.subjudul}
                      </p>
                    )}
                    {item.tahun && (
                      <p className="text-sm text-gray-600 dark:text-gray-500 italic">
                        {item.tahun}
                      </p>
                    )}
                    {item.deskripsi && (
                      <p className="text-sm text-gray-700 dark:text-gray-400 mt-1 whitespace-pre-wrap">
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
  );
};

export default CVGenerator;
