import React from "react";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Animasi angka 404 */}
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse">
            404
          </h1>
        </div>

        {/* Judul & Deskripsi */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Oops! Halaman Tidak Ditemukan
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Sepertinya kamu tersesat di dunia digital. Halaman yang kamu cari
          tidak ada di sini.
        </p>

        {/* Tombol Kembali ke Beranda */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          <Home size={20} />
          <span>Kembali ke Beranda</span>
        </button>

        {/* Ilustrasi mini (opsional) */}
        <div className="mt-12 opacity-70">
          <div className="w-24 h-24 mx-auto border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center">
            <span className="text-4xl">🧭</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Jangan khawatir — AutoGen selalu siap membantumu!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
