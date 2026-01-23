import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-4xl font-semibold mt-4 mb-6">Halaman Tidak Ditemukan</h2>
        
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>

        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
        >
          Kembali ke Beranda
        </Link>
      </div>

      {/* Optional: tambah gambar lucu atau ilustrasi */}
      <div className="mt-12">
        <img 
          src="https://illustrations.popsy.co/white/astronaut-floating.svg" 
          alt="404 illustration" 
          className="w-64 opacity-80"
        />
      </div>
    </div>
  );
};

export default NotFound;