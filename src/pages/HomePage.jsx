import React from "react";
import { FileText, Calculator, Briefcase, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

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
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
          Selamat Datang di{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AutoGen
          </span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
              onClick={() => navigate(`/${feature.id}`)}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer p-8 border border-gray-100 dark:border-gray-700 hover:scale-105"
            >
              <div
                className={`bg-gradient-to-r ${feature.color} p-4 rounded-xl w-fit mb-4`}
              >
                <Icon className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
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

export default HomePage;