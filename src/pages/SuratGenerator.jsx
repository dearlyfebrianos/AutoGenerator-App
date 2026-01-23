import React, { useState, useRef } from "react";
import { FileText, Download, Plus, Trash2, X } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import html2pdf from "html2pdf.js";

const SuratGenerator = () => {
  const [jenisSurat, setJenisSurat] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    tujuan: "",
    keperluan: "",
    tanggal: new Date().toISOString().split("T")[0],
  });
  const [generatedSurat, setGeneratedSurat] = useState("");
  const [signature, setSignature] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const sigCanvas = useRef(null);
  const suratRef = useRef(null); // 🔥 untuk PDF

  const jenisSuratOptions = [
    { value: "izin", label: "Surat Izin" },
    { value: "lamaran", label: "Surat Lamaran Kerja" },
    { value: "pernyataan", label: "Surat Pernyataan" },
    { value: "undangan", label: "Surat Undangan" },
  ];

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const saveSignature = () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Silakan tanda tangan terlebih dahulu!");
      return;
    }

    // Buat canvas sementara dengan latar PUTIH
    const tempCanvas = sigCanvas.current.getCanvas();
    const ctx = tempCanvas.getContext("2d");
    const imageData = ctx.getImageData(
      0,
      0,
      tempCanvas.width,
      tempCanvas.height,
    );

    // Buat canvas baru dengan latar putih
    const whiteBgCanvas = document.createElement("canvas");
    whiteBgCanvas.width = tempCanvas.width;
    whiteBgCanvas.height = tempCanvas.height;
    const whiteCtx = whiteBgCanvas.getContext("2d");

    // Isi dengan warna putih
    whiteCtx.fillStyle = "#ffffff";
    whiteCtx.fillRect(0, 0, whiteBgCanvas.width, whiteBgCanvas.height);

    // Gambar tanda tangan di atasnya
    whiteCtx.putImageData(imageData, 0, 0);

    // Simpan sebagai data URL
    setSignature(whiteBgCanvas.toDataURL("image/png"));
    setShowSignatureModal(false);
  };

  const handleGenerate = () => {
    let surat = "";
    const tanggal = new Date(formData.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (jenisSurat === "izin") {
      surat = `${formData.alamat}
${tanggal}
Kepada Yth.
${formData.tujuan}
Dengan hormat,
Saya yang bertanda tangan di bawah ini:
Nama: ${formData.nama}
Alamat: ${formData.alamat}
Dengan ini mengajukan permohonan izin ${formData.keperluan}.
Demikian surat izin ini saya buat dengan sebenarnya. Atas perhatian dan kebijaksanaannya, saya ucapkan terima kasih.
Hormat saya,
${formData.nama}`;
    } else if (jenisSurat === "lamaran") {
      surat = `${formData.alamat}
${tanggal}
Kepada Yth.
${formData.tujuan}
Dengan hormat,
Saya yang bertanda tangan di bawah ini:
Nama: ${formData.nama}
Alamat: ${formData.alamat}
Dengan surat ini saya mengajukan lamaran pekerjaan sebagai ${formData.keperluan} di perusahaan yang Bapak/Ibu pimpin.
Sebagai bahan pertimbangan, bersama ini saya lampirkan:
1. Daftar Riwayat Hidup
2. Fotocopy Ijazah
3. Fotocopy KTP
4. Pas Foto terbaru
Besar harapan saya untuk dapat diterima dan bergabung di perusahaan yang Bapak/Ibu pimpin. Atas perhatian dan kebijaksanaannya, saya ucapkan terima kasih.
Hormat saya,
${formData.nama}`;
    } else if (jenisSurat === "pernyataan") {
      surat = `SURAT PERNYATAAN
Yang bertanda tangan di bawah ini:
Nama: ${formData.nama}
Alamat: ${formData.alamat}
Dengan ini menyatakan bahwa ${formData.keperluan}.
Demikian surat pernyataan ini saya buat dengan sebenar-benarnya dan penuh tanggung jawab.
${formData.alamat}, ${tanggal}
Yang membuat pernyataan,
${formData.nama}`;
    } else if (jenisSurat === "undangan") {
      surat = `SURAT UNDANGAN
Kepada Yth.
${formData.tujuan}
Dengan hormat,
Dengan ini kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri ${formData.keperluan}.
Waktu: ${tanggal}
Tempat: ${formData.alamat}
Demikian undangan ini kami sampaikan. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.
Hormat kami,
${formData.nama}`;
    }

    setGeneratedSurat(surat);
  };

  const handleDownloadPDF = () => {
    if (!suratRef.current) return;

    const opt = {
      margin: [15, 10, 10, 10], // top, right, bottom, left (mm)
      filename: `surat_${jenisSurat}_${Date.now()}.pdf`,
      image: { type: "png", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(opt).from(suratRef.current).save();
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <FileText
            className="mr-3 text-blue-600 dark:text-blue-400"
            size={32}
          />
          Generator Surat Otomatis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Jenis Surat
              </label>
              <select
                value={jenisSurat}
                onChange={(e) => setJenisSurat(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Pilih Jenis Surat</option>
                {jenisSuratOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Alamat
              </label>
              <textarea
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows="3"
                placeholder="Masukkan alamat lengkap"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ditujukan Kepada
              </label>
              <input
                type="text"
                value={formData.tujuan}
                onChange={(e) =>
                  setFormData({ ...formData, tujuan: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nama penerima atau instansi"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Keperluan / Posisi
              </label>
              <textarea
                value={formData.keperluan}
                onChange={(e) =>
                  setFormData({ ...formData, keperluan: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows="3"
                placeholder="Jelaskan keperluan surat"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tanda Tangan Digital
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSignatureModal(true)}
                  className="flex-1 px-4 py-3 bg-blue-50 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-all font-medium"
                >
                  {signature ? "✓ Tanda Tangan Tersimpan" : "Buat Tanda Tangan"}
                </button>
                {signature && (
                  <button
                    type="button"
                    onClick={() => setSignature(null)}
                    className="px-4 py-3 bg-red-50 dark:bg-red-900 border-2 border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              {signature && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <img
                    src={signature}
                    alt="Tanda tangan"
                    className="h-20 mx-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!jenisSurat || !formData.nama}
          className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Surat
        </button>
      </div>

      {/* Modal Tanda Tangan */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                Buat Tanda Tangan
              </h3>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white">
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  className: "w-full h-64 rounded-lg",
                  style: { touchAction: "none" },
                }}
                backgroundColor="transparent"
                penColor="#000000"
                penWidth={2}
              />
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={clearSignature}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium"
              >
                Hapus
              </button>
              <button
                onClick={saveSignature}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Simpan Tanda Tangan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hasil Surat (untuk PDF) */}
      {generatedSurat && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Hasil Surat
            </h3>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all"
            >
              <Download size={20} />
              <span>Download PDF</span>
            </button>
          </div>

          {/* 👇 Elemen yang akan dijadikan PDF */}
          <div
            ref={suratRef}
            className="p-8 bg-white"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: "14pt",
              lineHeight: 1.6,
              maxWidth: "210mm", // A4 width
              minHeight: "297mm", // A4 height
              margin: "0 auto",
              padding: "20mm",
              boxSizing: "border-box",
            }}
          >
            {generatedSurat.split("\n").map((paragraph, index) => {
              if (
                paragraph.includes("Hormat saya,") ||
                paragraph.includes("Hormat kami,")
              ) {
                const parts = paragraph.split("\n");
                return (
                  <div key={index} style={{ marginBottom: "24pt" }}>
                    {parts.map((line, lineIndex) => {
                      if (
                        line.includes("Hormat saya,") ||
                        line.includes("Hormat kami,")
                      ) {
                        return (
                          <div key={lineIndex} style={{ marginTop: "48pt" }}>
                            <div>{line}</div>
                            {signature && (
                              <div
                                style={{ marginTop: "12pt", height: "40px" }}
                              >
                                <img
                                  src={signature}
                                  alt="Tanda tangan"
                                  style={{
                                    height: "40px",
                                    background: "transparent",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      }
                      return <div key={lineIndex}>{line}</div>;
                    })}
                  </div>
                );
              }
              return (
                <div key={index} style={{ marginBottom: "12pt" }}>
                  {paragraph}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuratGenerator;
