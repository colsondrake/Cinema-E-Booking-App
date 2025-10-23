"use client";

import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export default function InputField({ label, id, ...props }: InputFieldProps) {
  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-[#373572] dark:text-gray-200"
      >
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                    dark:bg-[#0b1727] dark:border-gray-700 dark:text-white 
                    transition-colors`}
      />
    </div>
  );
}