"use client"
import Link from 'next/link'

const NotFound = () => {
  return (
    <section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-[#373572] dark:text-white min-h-screen flex items-center justify-center">
      <div className="container px-4 mx-auto flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-center">Thank You</h1>
        <p className="mb-8 text-lg text-gray-500 dark:text-gray-300 text-center max-w-xl">
          Thank you for your booking! 
        </p>
        <Link
          href="/account"
          className="px-6 py-3 bg-gray-200 dark:bg-[#17233a] text-[#373572] dark:text-white rounded-md border border-gray-300 dark:border-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-200 cursor-pointer font-semibold"
        >
          Go to Account
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
