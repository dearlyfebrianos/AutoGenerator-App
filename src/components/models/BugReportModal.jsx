import React, { useState } from "react";
import { X, Send, Image, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

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
      const formData = new FormData();

      const payload = {
        embeds: [
          {
            title: `🐛 ${title.trim()}`,
            description: description.trim(),
            color: 15548997,
            fields: [
              { name: "URL", value: window.location.href, inline: true },
              {
                name: "Waktu",
                value: new Date().toLocaleString("id-ID"),
                inline: true,
              },
            ],
            footer: { text: "AutoGen Bug Report" },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      formData.append("payload_json", JSON.stringify(payload));

      if (file) {
        formData.append("file", file);
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Gagal mengirim laporan");

      toast.success("Laporan bug berhasil dikirim! 🙏");
      setTitle("");
      setDescription("");
      setFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal mengirim laporan. Coba lagi nanti.");
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
                <AlertCircle className="text-red-500" />
                Laporkan Bug
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={24} />
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
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Image className="text-gray-400" size={20} />
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
                  <Send size={18} />
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

export default BugReportModal;
