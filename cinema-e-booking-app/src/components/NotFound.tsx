'use client'

// NotFound.tsx
// Basic 404 Not Found page styled to match Movies.tsx

import React from "react";

const NotFound = () => {
  return (
    <section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-[#373572] dark:text-white min-h-screen flex items-center justify-center">
      <div className="container px-4 mx-auto flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-center">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center">Page Not Found</h2>
        <p className="mb-8 text-lg text-gray-500 dark:text-gray-300 text-center max-w-xl">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-gray-200 dark:bg-[#17233a] text-[#373572] dark:text-white rounded-md border border-gray-300 dark:border-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-200 cursor-pointer font-semibold"
        >
          Back to Home
        </a>
      </div>
    </section>
  );
};

export default NotFound;
