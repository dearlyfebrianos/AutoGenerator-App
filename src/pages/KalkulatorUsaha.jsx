import React, { useState } from "react";
import { Calculator } from "lucide-react";

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <Calculator
            className="mr-3 text-green-600 dark:text-green-400"
            size={32}
          />
          Kalkulator Usaha
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Modal Awal (Rp)
              </label>
              <input
                type="number"
                value={modalAwal}
                onChange={(e) => setModalAwal(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="10000000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Biaya Operasional per {periode} (Rp)
              </label>
              <input
                type="number"
                value={biayaOperasional}
                onChange={(e) => setBiayaOperasional(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="5000000"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Pendapatan per {periode} (Rp)
              </label>
              <input
                type="number"
                value={pendapatan}
                onChange={(e) => setPendapatan(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="8000000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Periode Perhitungan
              </label>
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Hasil Perhitungan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-700">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-300 mb-2">
                Modal Awal
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatRupiah(hasil.modal)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-700">
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-300 mb-2">
                Biaya Operasional
              </p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {formatRupiah(hasil.biaya)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-700">
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-300 mb-2">
                Pendapatan
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatRupiah(hasil.revenue)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-xl border-2 border-green-200 dark:border-green-700">
              <p className="text-sm font-semibold text-green-600 dark:text-green-300 mb-2">
                Laba Kotor
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatRupiah(hasil.labaKotor)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 p-6 rounded-xl border-2 border-emerald-200 dark:border-emerald-700">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300 mb-2">
                Laba Bersih
              </p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {formatRupiah(hasil.labaBersih)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-6 rounded-xl border-2 border-indigo-200 dark:border-indigo-700">
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
                ROI (Return on Investment)
              </p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                {hasil.roi.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-800/20 p-6 rounded-xl border-2 border-yellow-200 dark:border-yellow-700">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Estimasi Break Even Point
            </p>
            <p className="text-lg text-yellow-900 dark:text-yellow-100">
              Usaha Anda akan balik modal dalam waktu sekitar{" "}
              <span className="font-bold text-2xl">
                {hasil.breakEven.toFixed(1)}
              </span>{" "}
              {periode}
            </p>
          </div>
          {hasil.labaBersih > 0 ? (
            <div className="mt-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 dark:border-green-500 p-4 rounded">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                ✅ Usaha Anda menguntungkan!
              </p>
            </div>
          ) : (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 dark:border-red-500 p-4 rounded">
              <p className="text-red-800 dark:text-red-200 font-semibold">
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

export default KalkulatorUsaha;
