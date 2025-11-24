'use client';

export default function Home() {
  return (
    <section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-[#373572] dark:text-white min-h-screen flex items-center justify-center">
    <div className="container px-4 mx-auto flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center">Account created!</h2>
        <p className="mb-8 text-lg text-gray-500 dark:text-gray-300 text-center max-w-xl">
        Check your email inbox and verify your account before logging in.
        </p>
    </div>
    </section>
  );
};