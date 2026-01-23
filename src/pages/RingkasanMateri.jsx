import React, { useState } from "react";
import { BookOpen, Download } from "lucide-react";

const RingkasanMateri = () => {
  const [judulMateri, setJudulMateri] = useState("");
  const [isiMateri, setIsiMateri] = useState("");
  const [jumlahPoin, setJumlahPoin] = useState("5");
  const [ringkasan, setRingkasan] = useState("");

  const handleGenerate = () => {
    const poin = parseInt(jumlahPoin) || 5;
    const kata = isiMateri.trim() ? isiMateri.split(/\s+/) : [];
    if (kata.length === 0) return;

    const kataPerPoin = Math.ceil(kata.length / poin);
    let hasil = `RINGKASAN MATERI: ${judulMateri}\n`;
    hasil += `${"=".repeat(70)}\n`;

    for (let i = 0; i < poin && i * kataPerPoin < kata.length; i++) {
      const bagian = kata
        .slice(i * kataPerPoin, (i + 1) * kataPerPoin)
        .join(" ");
      hasil += `${i + 1}. ${bagian.substring(0, 100)}${bagian.length > 100 ? "..." : ""}\n`;
    }

    hasil += `\nKesimpulan:\n`;
    hasil += `Materi "${judulMateri}" membahas tentang konsep-konsep penting yang telah dirangkum dalam ${poin} poin utama di atas.\n`;
    hasil += `Total kata dalam materi: ${kata.length} kata\n`;
    hasil += `Diringkas menjadi: ${poin} poin utama\n`;

    setRingkasan(hasil);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([ringkasan], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `ringkasan_${judulMateri.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <BookOpen
            className="mr-3 text-orange-600 dark:text-orange-400"
            size={32}
          />
          Generator Ringkasan Materi
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Judul Materi
            </label>
            <input
              type="text"
              value={judulMateri}
              onChange={(e) => setJudulMateri(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Mis. Fotosintesis pada Tumbuhan"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Isi Materi Lengkap
            </label>
            <textarea
              value={isiMateri}
              onChange={(e) => setIsiMateri(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              rows="12"
              placeholder="Paste atau ketik materi yang ingin diringkas di sini..."
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Jumlah kata:{" "}
              {isiMateri.trim()
                ? isiMateri.split(/\s+/).filter(Boolean).length
                : 0}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Jumlah Poin Ringkasan
            </label>
            <select
              value={jumlahPoin}
              onChange={(e) => setJumlahPoin(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="3">3 Poin</option>
              <option value="5">5 Poin</option>
              <option value="7">7 Poin</option>
              <option value="10">10 Poin</option>
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!judulMateri || !isiMateri.trim()}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Ringkasan
          </button>
        </div>
      </div>

      {ringkasan && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Hasil Ringkasan
            </h3>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all"
            >
              <Download size={20} />
              <span>Download</span>
            </button>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-800/20 p-6 rounded-lg border-2 border-orange-200 dark:border-orange-700">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed">
              {ringkasan}
            </pre>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold">
                Kata Asli
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {isiMateri.trim()
                  ? isiMateri.split(/\s+/).filter(Boolean).length
                  : 0}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <p className="text-sm text-purple-600 dark:text-purple-300 font-semibold">
                Poin Ringkasan
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {jumlahPoin}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <p className="text-sm text-green-600 dark:text-green-300 font-semibold">
                Efisiensi
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {isiMateri.trim()
                  ? Math.round(
                      (parseInt(jumlahPoin) /
                        isiMateri.split(/\s+/).filter(Boolean).length) *
                        100,
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RingkasanMateri;
