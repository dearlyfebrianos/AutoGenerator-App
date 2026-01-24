import React from "react";
import "./LoadingSplash.css";

const LoadingSplash = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-blue-500 rounded-full loading-pulse"></div>
        <div className="absolute inset-4 flex items-center justify-center bg-white dark:bg-black rounded-full border border-gray-300 dark:border-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4F46E5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LoadingSplash;