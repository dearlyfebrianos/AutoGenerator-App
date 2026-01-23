import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 shadow-lg mt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">
            © {currentYear} AutoGen - Platform Generator Otomatis. Diciptakan oleh LuminarxDear
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Memudahkan pekerjaan administratif Anda
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;