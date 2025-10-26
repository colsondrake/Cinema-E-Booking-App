'use client';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  ro?: string; // optional additional classes
  id?: string;
}

export default function ReadOnlyField({ label, value, id, ro = '' }: ReadOnlyFieldProps) {
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
        type="text"
        value={value}
        readOnly
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg 
                    bg-gray-100 text-gray-700 
                    dark:bg-[#0b1727] dark:border-gray-700 dark:text-gray-400 
                    focus:outline-none transition-colors ${ro}`}
      />
    </div>
  );
}
