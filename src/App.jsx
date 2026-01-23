import React, { useState, useRef } from "react";
import {
  FileText,
  Calculator,
  Briefcase,
  BookOpen,
  Download,
  Plus,
  Trash2,
  Menu,
  X,
  Home,
} from "lucide-react";
import html2pdf from "html2pdf.js";

const App = () => {
  const [activeMenu, setActiveMenu] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Beranda", icon: Home },
    { id: "surat", label: "Generator Surat", icon: FileText },
    { id: "keuangan", label: "Kalkulator Usaha", icon: Calculator },
    { id: "cv", label: "CV Generator", icon: Briefcase },
    { id: "materi", label: "Ringkasan Materi", icon: BookOpen },
  ];

  let currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AutoGen
                </h1>
                <p className="text-xs text-gray-500">
                  Platform Generator Otomatis
                </p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      activeMenu === item.id
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Mobile navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveMenu(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                      activeMenu === item.id
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeMenu === "home" && <HomePage setActiveMenu={setActiveMenu} />}
        {activeMenu === "surat" && <SuratGenerator />}
        {activeMenu === "keuangan" && <KalkulatorUsaha />}
        {activeMenu === "cv" && <CVGenerator />}
        {activeMenu === "materi" && <RingkasanMateri />}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-lg mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © {currentYear} AutoGen - Platform Generator Otomatis untuk Masyarakat Diciptakan oleh LuminarxDear
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Memudahkan pekerjaan administratif Anda
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const HomePage = ({ setActiveMenu }) => {
  const features = [
    {
      id: "surat",
      icon: FileText,
      title: "Generator Surat",
      description:
        "Buat surat resmi seperti surat izin, lamaran, dan pernyataan secara otomatis",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "keuangan",
      icon: Calculator,
      title: "Kalkulator Usaha",
      description: "Hitung modal, laba rugi, dan proyeksi keuangan usaha Anda",
      color: "from-green-500 to-green-600",
    },
    {
      id: "cv",
      icon: Briefcase,
      title: "CV Generator",
      description: "Buat CV profesional dengan template yang menarik",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "materi",
      icon: BookOpen,
      title: "Ringkasan Materi",
      description: "Generate ringkasan materi pelajaran dengan cepat",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
          Selamat Datang di{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AutoGen
          </span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Platform generator otomatis yang memudahkan pekerjaan administratif
          Anda. Pilih fitur di bawah untuk memulai.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              onClick={() => setActiveMenu(feature.id)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer p-8 border border-gray-100 hover:scale-105"
            >
              <div
                className={`bg-gradient-to-r ${feature.color} p-4 rounded-xl w-fit mb-4`}
              >
                <Icon className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Kenapa Menggunakan AutoGen?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h4 className="font-bold text-lg">⚡ Cepat & Efisien</h4>
              <p className="text-sm text-blue-100">
                Generate dokumen dalam hitungan detik
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h4 className="font-bold text-lg">🎯 Mudah Digunakan</h4>
              <p className="text-sm text-blue-100">
                Interface intuitif untuk semua kalangan
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h4 className="font-bold text-lg">💯 Gratis</h4>
              <p className="text-sm text-blue-100">
                Semua fitur dapat diakses secara gratis
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  const jenisSuratOptions = [
    { value: "izin", label: "Surat Izin" },
    { value: "lamaran", label: "Surat Lamaran Kerja" },
    { value: "pernyataan", label: "Surat Pernyataan" },
    { value: "undangan", label: "Surat Undangan" },
  ];

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

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedSurat], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `surat_${jenisSurat}_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FileText className="mr-3 text-blue-600" size={32} />
          Generator Surat Otomatis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jenis Surat
              </label>
              <select
                value={jenisSurat}
                onChange={(e) => setJenisSurat(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alamat
              </label>
              <textarea
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows="3"
                placeholder="Masukkan alamat lengkap"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ditujukan Kepada
              </label>
              <input
                type="text"
                value={formData.tujuan}
                onChange={(e) =>
                  setFormData({ ...formData, tujuan: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nama penerima atau instansi"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Keperluan / Posisi
              </label>
              <textarea
                value={formData.keperluan}
                onChange={(e) =>
                  setFormData({ ...formData, keperluan: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows="3"
                placeholder="Jelaskan keperluan surat"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
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

      {generatedSurat && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">Hasil Surat</h3>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all"
            >
              <Download size={20} />
              <span>Download</span>
            </button>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed">
              {generatedSurat}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

const KalkulatorUsaha = () => {
  const [modalAwal, setModalAwal] = useState("");
  const [biayaOperasional, setBiayaOperasional] = useState("");
  const [pendapatan, setPendapatan] = useState("");
  const [periode, setPeriode] = useState("bulan");
  const [hasil, setHasil] = useState(null);

  const handleHitung = () => {
    const modal = parseFloat(modalAwal) || 0;
    const biaya = parseFloat(biayaOperasional) || 0;
    const revenue = parseFloat(pendapatan) || 0;

    const labaKotor = revenue - biaya;
    const labaBersih = labaKotor;
    const roi = modal > 0 ? (labaBersih / modal) * 100 : 0;
    const breakEven = biaya > 0 ? modal / biaya : 0;

    setHasil({
      labaKotor,
      labaBersih,
      roi,
      breakEven,
      modal,
      biaya,
      revenue,
    });
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <Calculator className="mr-3 text-green-600" size={32} />
          Kalkulator Usaha
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Modal Awal (Rp)
              </label>
              <input
                type="number"
                value={modalAwal}
                onChange={(e) => setModalAwal(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="10000000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Biaya Operasional per {periode} (Rp)
              </label>
              <input
                type="number"
                value={biayaOperasional}
                onChange={(e) => setBiayaOperasional(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="5000000"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pendapatan per {periode} (Rp)
              </label>
              <input
                type="number"
                value={pendapatan}
                onChange={(e) => setPendapatan(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="8000000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Periode Perhitungan
              </label>
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="hari">Per Hari</option>
                <option value="minggu">Per Minggu</option>
                <option value="bulan">Per Bulan</option>
                <option value="tahun">Per Tahun</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleHitung}
          className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Hitung Proyeksi
        </button>
      </div>

      {hasil && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Hasil Perhitungan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
              <p className="text-sm font-semibold text-blue-600 mb-2">
                Modal Awal
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {formatRupiah(hasil.modal)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
              <p className="text-sm font-semibold text-orange-600 mb-2">
                Biaya Operasional
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {formatRupiah(hasil.biaya)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
              <p className="text-sm font-semibold text-purple-600 mb-2">
                Pendapatan
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {formatRupiah(hasil.revenue)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
              <p className="text-sm font-semibold text-green-600 mb-2">
                Laba Kotor
              </p>
              <p className="text-2xl font-bold text-green-900">
                {formatRupiah(hasil.labaKotor)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border-2 border-emerald-200">
              <p className="text-sm font-semibold text-emerald-600 mb-2">
                Laba Bersih
              </p>
              <p className="text-2xl font-bold text-emerald-900">
                {formatRupiah(hasil.labaBersih)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border-2 border-indigo-200">
              <p className="text-sm font-semibold text-indigo-600 mb-2">
                ROI (Return on Investment)
              </p>
              <p className="text-2xl font-bold text-indigo-900">
                {hasil.roi.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200">
            <p className="text-sm font-semibold text-yellow-800 mb-2">
              Estimasi Break Even Point
            </p>
            <p className="text-lg text-yellow-900">
              Usaha Anda akan balik modal dalam waktu sekitar{" "}
              <span className="font-bold text-2xl">
                {hasil.breakEven.toFixed(1)}
              </span>{" "}
              {periode}
            </p>
          </div>

          {hasil.labaBersih > 0 ? (
            <div className="mt-4 bg-green-50 border-l-4 border-green-600 p-4 rounded">
              <p className="text-green-800 font-semibold">
                ✅ Usaha Anda menguntungkan!
              </p>
            </div>
          ) : (
            <div className="mt-4 bg-red-50 border-l-4 border-red-600 p-4 rounded">
              <p className="text-red-800 font-semibold">
                ⚠️ Usaha Anda masih merugi. Pertimbangkan untuk mengurangi biaya
                atau meningkatkan pendapatan.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CVGenerator = () => {
  const [personalInfo, setPersonalInfo] = useState({
    nama: "",
    email: "",
    telepon: "",
    alamat: "",
    kota: "",
  });

  const [profileSummary, setProfileSummary] = useState("");

  const [sections, setSections] = useState([
    {
      id: 1,
      type: "custom",
      title: "PENDIDIKAN",
      items: [
        {
          id: 1,
          judul: "",
          subjudul: "",
          tahun: "",
          deskripsi: "",
        },
      ],
    },
    {
      id: 2,
      type: "custom",
      title: "PENGALAMAN KERJA",
      items: [
        {
          id: 1,
          judul: "",
          subjudul: "",
          tahun: "",
          deskripsi: "",
        },
      ],
    },
  ]);

  const cvRef = useRef(null);

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      type: "custom",
      title: "",
      items: [
        {
          id: 1,
          judul: "",
          subjudul: "",
          tahun: "",
          deskripsi: "",
        },
      ],
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

  const handleDownloadCV = () => {
    if (!cvRef.current) return;

    const element = cvRef.current;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `CV ATS ${personalInfo.nama.replace(/\s+/g, "_") || 'SAYA'}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };
    html2pdf().set(opt).from(element).save();

    // Create a simple text version for download
    let cvText = `${personalInfo.nama}\n`;
    cvText += `${personalInfo.email} | ${personalInfo.telepon}\n`;
    cvText += `${personalInfo.alamat}, ${personalInfo.kota}\n\n`;

    sections.forEach((section) => {
      cvText += `${"=".repeat(70)}\n`;
      cvText += `${section.title}\n`;
      cvText += `${"=".repeat(70)}\n\n`;

      section.items.forEach((item) => {
        if (item.judul) cvText += `${item.judul}\n`;
        if (item.subjudul) cvText += `${item.subjudul}\n`;
        if (item.tahun) cvText += `${item.tahun}\n`;
        if (item.deskripsi) cvText += `${item.deskripsi}\n`;
        cvText += "\n";
      });
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Section */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <Briefcase className="mr-3 text-purple-600" size={32} />
            CV Generator
          </h2>

          {/* Personal Info */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-600">
              Informasi Pribadi
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={personalInfo.nama}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, nama: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Nama Lengkap"
              />
              <input
                type="email"
                value={personalInfo.email}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Email"
              />
              <input
                type="tel"
                value={personalInfo.telepon}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, telepon: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Nomor Telepon"
              />
              <input
                type="text"
                value={personalInfo.alamat}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, alamat: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Alamat"
              />
              <input
                type="text"
                value={personalInfo.kota}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, kota: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Kota, Provinsi"
              />
            </div>
          </div>

          {/* Deskripsi Diri / Profile Summary */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-600">
              Deskripsi Diri (Ringkasan Profil)
            </h3>
            <textarea
              value={profileSummary}
              onChange={(e) => setProfileSummary(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 min-h-[120px]"
              placeholder="Contoh: Lulusan S1 Pendidikan Bahasa Indonesia dengan pengalaman mengajar 3 tahun. Memiliki kemampuan menulis kreatif, adaptasi cepat, dan komunikasi yang baik."
            />
          </div>

          {/* Dynamic Sections */}
          {sections.map((section, sectionIndex) => (
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
                  className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-purple-600 bg-transparent focus:outline-none flex-1"
                  placeholder="JUDUL SECTION"
                />
                <button
                  onClick={() => removeSection(section.id)}
                  className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {section.items.map((item, itemIndex) => (
                <div
                  key={item.id}
                  className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-semibold text-gray-600">
                      Item {itemIndex + 1}
                    </h4>
                    {section.items.length > 1 && (
                      <button
                        onClick={() => removeItem(section.id, item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
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
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
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
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                      placeholder="Sub-judul (mis. Jurusan / Perusahaan)"
                    />
                    <input
                      type="text"
                      value={item.tahun}
                      onChange={(e) =>
                        updateItem(section.id, item.id, "tahun", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
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
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                      rows="3"
                      placeholder="Deskripsi / Detail"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => addItem(section.id)}
                className="w-full py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-all flex items-center justify-center space-x-2"
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

      {/* CV Preview */}
      <div className="lg:sticky lg:top-24 h-fit">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Preview CV</h3>
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
            className="bg-white border-2 border-gray-200 p-8 min-h-[800px]"
            style={{ fontFamily: "'Times New Roman', Times, serif !important" }}
          >
            {/* Header */}
            <div className="text-center mb-6 pb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {personalInfo.nama || "NAMA LENGKAP"}
              </h1>
              <p className="text-sm text-gray-600">
                {personalInfo.email || "email@example.com"} |{" "}
                {personalInfo.telepon || "+62XXXXXXXXXX"}
              </p>
              <p className="text-sm text-gray-600">
                {personalInfo.alamat || "Alamat"}
                {personalInfo.kota && `, ${personalInfo.kota}`}
              </p>
            </div>

            {/* Deskripsi Diri (tanpa judul section) */}
            {profileSummary && (
              <div className="mb-2 text-justify">
                <p className="leading-6">{profileSummary}</p>
              </div>
            )}

            {/* Sections */}
            {sections.map((section) => (
              <div key={section.id} className="mb-6">
                <div className="border-t-2 border-gray-800 pt-3 mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {section.title || "SECTION TITLE"}
                  </h2>
                </div>

                {section.items.map((item) => (
                  <div key={item.id} className="mb-4">
                    {item.judul && (
                      <h3 className="font-bold text-gray-900">{item.judul}</h3>
                    )}
                    {item.subjudul && (
                      <p className="text-sm text-gray-700">{item.subjudul}</p>
                    )}
                    {item.tahun && (
                      <p className="text-sm text-gray-600 italic">
                        {item.tahun}
                      </p>
                    )}
                    {item.deskripsi && (
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
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

const RingkasanMateri = () => {
  const [judulMateri, setJudulMateri] = useState("");
  const [isiMateri, setIsiMateri] = useState("");
  const [jumlahPoin, setJumlahPoin] = useState("5");
  const [ringkasan, setRingkasan] = useState("");

  const handleGenerate = () => {
    const poin = parseInt(jumlahPoin) || 5;
    const kata = isiMateri.split(" ");
    const kataPerPoin = Math.ceil(kata.length / poin);

    let hasil = `RINGKASAN MATERI: ${judulMateri}\n`;
    hasil += `${"=".repeat(70)}\n\n`;

    for (let i = 0; i < poin && i * kataPerPoin < kata.length; i++) {
      const bagian = kata
        .slice(i * kataPerPoin, (i + 1) * kataPerPoin)
        .join(" ");
      hasil += `${i + 1}. ${bagian.substring(0, 100)}${bagian.length > 100 ? "..." : ""}\n\n`;
    }

    hasil += `\nKesimpulan:\n`;
    hasil += `Materi "${judulMateri}" membahas tentang konsep-konsep penting yang telah dirangkum dalam ${poin} poin utama di atas.\n\n`;
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
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <BookOpen className="mr-3 text-orange-600" size={32} />
          Generator Ringkasan Materi
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Judul Materi
            </label>
            <input
              type="text"
              value={judulMateri}
              onChange={(e) => setJudulMateri(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Mis. Fotosintesis pada Tumbuhan"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Isi Materi Lengkap
            </label>
            <textarea
              value={isiMateri}
              onChange={(e) => setIsiMateri(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              rows="12"
              placeholder="Paste atau ketik materi yang ingin diringkas di sini..."
            />
            <p className="text-sm text-gray-500 mt-2">
              Jumlah kata: {isiMateri.split(" ").filter((k) => k).length}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jumlah Poin Ringkasan
            </label>
            <select
              value={jumlahPoin}
              onChange={(e) => setJumlahPoin(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="3">3 Poin</option>
              <option value="5">5 Poin</option>
              <option value="7">7 Poin</option>
              <option value="10">10 Poin</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!judulMateri || !isiMateri}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Ringkasan
          </button>
        </div>
      </div>

      {ringkasan && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">
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
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-lg border-2 border-orange-200">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
              {ringkasan}
            </pre>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-semibold">Kata Asli</p>
              <p className="text-2xl font-bold text-blue-900">
                {isiMateri.split(" ").filter((k) => k).length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 font-semibold">
                Poin Ringkasan
              </p>
              <p className="text-2xl font-bold text-purple-900">{jumlahPoin}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-semibold">Efisiensi</p>
              <p className="text-2xl font-bold text-green-900">
                {Math.round(
                  (parseInt(jumlahPoin) /
                    isiMateri.split(" ").filter((k) => k).length) *
                    100,
                )}
                %
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
