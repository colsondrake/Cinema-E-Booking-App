// AuthLayout.tsx
'use client';

import React from 'react';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1727] px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-[#373572] dark:text-white">
        {title}
      </h1>

      <div className="flex items-center justify-center">
        <div className="border-2 border-gray-300 dark:border-gray-600 p-8 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-lg max-w-md w-full">
          {children}
        </div>
      </div>
    </div>
  );
}