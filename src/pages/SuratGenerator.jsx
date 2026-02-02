import React, { useState, useRef } from "react";
import { FileText, Download, Trash2, X } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { Document, Paragraph, TextRun, AlignmentType, Packer } from "docx";

const SuratGenerator = () => {
  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    tujuan: "",
    keperluan: "",
    tempatLahir: "",
    tanggalLahir: "",
    pendidikan: "SMA",
  });
  const [generatedSurat, setGeneratedSurat] = useState("");
  const [signature, setSignature] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const sigCanvas = useRef(null);
  const suratRef = useRef(null);

  const getFormattedDate = () => {
    const today = new Date();
    return today.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleGenerate = () => {
    const tanggalFormatted = getFormattedDate();
    const kota = formData.alamat.split(",")[0].trim() || "Surabaya";

    const surat = `${kota}, ${tanggalFormatted}

Hal     : Lamaran Pekerjaan
Lampiran   : Tiga berkas
Yth. ${formData.tujuan}
${formData.alamat}

Dengan hormat,
Berdasarkan postingan akun instagram @lokerserang.top pada 15 Januari 2026 bahwa PT. Rahadhyan Integrasi Nusantara memerlukan karyawan ${formData.keperluan}. Oleh karena itu, saya bermaksud mengajukan permohonan untuk mengisi lowongan kerja tersebut.

Adapun identitas saya sebagai berikut
nama        : ${formData.nama}
tempat, tanggal lahir   : ${formData.tempatLahir}, ${formData.tanggalLahir}
alamat      : ${formData.alamat}
Pendidikan Terakhir   : ${formData.pendidikan}

Sebagai bahan pertimbangan Bapak/Ibu, saya sertakan lampiran sebagai berikut:
1. pasfoto,
2. fotokopi kartu pelajar,
3. fotokopi lowongan kerja, dan
4. fotokopi riwayat hidup

Demikian surat lamaran kerja ini saya buat. Besar harapan saya agar bisa diterima bekerja di perusahaan yang Bapak/Ibu pimpin. Atas perhatian Bapak/Ibu saya ucapkan terima kasih.

Hormat saya,
          ${formData.nama}`;

    setGeneratedSurat(surat);
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const saveSignature = () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Silakan tanda tangan terlebih dahulu!");
      return;
    }

    const tempCanvas = sigCanvas.current.getCanvas();
    const ctx = tempCanvas.getContext("2d");
    const imageData = ctx.getImageData(
      0,
      0,
      tempCanvas.width,
      tempCanvas.height,
    );

    const whiteBgCanvas = document.createElement("canvas");
    whiteBgCanvas.width = tempCanvas.width;
    whiteBgCanvas.height = tempCanvas.height;
    const whiteCtx = whiteBgCanvas.getContext("2d");

    whiteCtx.fillStyle = "#ffffff";
    whiteCtx.fillRect(0, 0, whiteBgCanvas.width, whiteBgCanvas.height);
    whiteCtx.putImageData(imageData, 0, 0);

    setSignature(whiteBgCanvas.toDataURL("image/png"));
    setShowSignatureModal(false);
  };

  const handleDownloadDOCX = async () => {
    if (!generatedSurat || !formData.nama) return;

    const lines = generatedSurat.split("\n");
    const children = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("Hormat saya,")) {
        children.push(
          new Paragraph({
            text: line,
            alignment: AlignmentType.LEFT,
          }),
        );

        if (i + 1 < lines.length && lines[i + 1].trim()) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: lines[i + 1].trim(),
                  bold: true,
                }),
              ],
              alignment: AlignmentType.RIGHT,
              indent: { left: 4000 },
            }),
          );
        }
        break;
      } else {
        children.push(
          new Paragraph({
            text: line,
            alignment: AlignmentType.LEFT,
          }),
        );
      }
    }

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });

    try {
      const blob = await Packer.toBlob(doc);
      const link = document.createElement("a");
      const fileName = `SURAT LAMARAN PEKERJAAN (${formData.nama}).docx`;
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    } catch (err) {
      console.error("Error generating DOCX:", err);
      alert("Gagal membuat file DOCX. Coba lagi.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <FileText
            className="mr-3 text-blue-600 dark:text-blue-400"
            size={32}
          />
          Generator Surat Lamaran Kerja
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Dearly Febriano Irwansyah"
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Contoh: Surabaya, Jalan Kejawan Putih Tambak No. 123"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tempat, Tanggal Lahir
              </label>
              <input
                type="text"
                value={formData.tempatLahir}
                onChange={(e) =>
                  setFormData({ ...formData, tempatLahir: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Sidoarjo, 9 Februari 2008"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Pendidikan Terakhir
              </label>
              <input
                type="text"
                value={formData.pendidikan}
                onChange={(e) =>
                  setFormData({ ...formData, pendidikan: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: SMA"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ditujukan Kepada
              </label>
              <textarea
                value={formData.tujuan}
                onChange={(e) =>
                  setFormData({ ...formData, tujuan: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Contoh: HRD PT. Rahadyan Integrasi Nusantara"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Posisi yang Dilamar
              </label>
              <input
                type="text"
                value={formData.keperluan}
                onChange={(e) =>
                  setFormData({ ...formData, keperluan: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Staff Pendataan"
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
          disabled={!formData.nama || !formData.alamat}
          className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Surat
        </button>
      </div>

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
                  className: "w-full h-64",
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

      {generatedSurat && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Hasil Surat
            </h3>
            <button
              onClick={handleDownloadDOCX}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
            >
              <Download size={20} />
              <span>Download Word</span>
            </button>
          </div>

          <div
            ref={suratRef}
            className="p-8 bg-white"
            style={{
              fontFamily: "'Arial', sans-serif",
              fontSize: "12pt",
              lineHeight: 1.5,
              maxWidth: "210mm",
              minHeight: "297mm",
              margin: "0 auto",
              padding: "20mm",
              boxSizing: "border-box",
            }}
          >
            {generatedSurat.split("\n").map((line, index) => {
              if (line.includes("Hormat saya,")) {
                return (
                  <React.Fragment key={index}>
                    <div style={{ marginBottom: "24pt" }}>{line}</div>
                    {index + 1 < generatedSurat.split("\n").length && (
                      <div
                        style={{
                          marginTop: "36pt",
                          textAlign: "right",
                          fontWeight: "bold",
                          marginLeft: "auto",
                          width: "100%",
                        }}
                      >
                        {generatedSurat.split("\n")[index + 1].trim()}
                      </div>
                    )}
                  </React.Fragment>
                );
              }
              return (
                <div key={index} style={{ marginBottom: "12pt" }}>
                  {line}
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