import React, { useState, useRef } from "react";
import { Briefcase, Download, Plus, Trash2, X } from "lucide-react";
import html2pdf from "html2pdf.js";
import { toast } from "react-hot-toast";

const CVGenerator = () => {
  const [personalInfo, setPersonalInfo] = useState({
    nama: "",
    email: "",
    telepon: "",
    alamat: "",
    kota: "",
    link: "",
  });
  const [profileSummary, setProfileSummary] = useState("");
  const [sections, setSections] = useState([
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
  ]);

  const [foto, setFoto] = useState(null);
  const fileInputRef = useRef(null);

  const cvRef = useRef(null);

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
      .finally(() => {
        document.body.removeChild(tempContainer);
      });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Briefcase
              className="mr-3 text-purple-600 dark:text-purple-400"
              size={32}
            />
            CV Generator
          </h2>
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
                value={personalInfo.nama.toUpperCase()}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, nama: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-lg border ${
                  !personalInfo.nama.trim()
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                placeholder="Nama Lengkap"
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
                    updateSection(
                      section.id,
                      "title",
                      e.target.value.toUpperCase(),
                    )
                  }
                  className="text-xl font-bold text-gray-800 dark:text-white pb-2 border-b-2 border-purple-600 dark:border-purple-500 bg-transparent focus:outline-none flex-1"
                  placeholder="JUDUL SECTION"
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
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
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
            <button
              onClick={handleDownloadCV}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all"
            >
              <Download size={20} />
              <span>Download</span>
            </button>
          </div>
          <div
            ref={cvRef}
            className="p-8 min-h-[800px]"
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
                        if (personalInfo.telepon)
                          contactItems.push(personalInfo.telepon);

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
                      if (personalInfo.telepon)
                        contactItems.push(personalInfo.telepon);

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
                    {section.title || "SECTION TITLE"}
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