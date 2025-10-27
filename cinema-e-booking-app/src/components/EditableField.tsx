'use client';

import { Pencil, Check, X } from 'lucide-react';

export default function EditableField({
  label,
  field,
  formData,
  drafts,
  isEditing,
  startEdit,
  saveEdit,
  cancelEdit,
  setDrafts,
  fullWidth = false,
}: any) {
  const isActive = isEditing[field];
  const classes = `w-full px-4 py-3 border border-gray-300 rounded-lg 
  bg-gray-100 text-gray-700 dark:bg-[#0b1727] dark:border-gray-700 dark:text-gray-400`;

  return (
    <div className={`${fullWidth ? 'col-span-2' : ''} mb-6`}>
      <label className="block text-sm font-medium text-white-700 mb-1">{label}</label>
      {!isActive ? (
        <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
          <span className="text-white-900 font-medium">{formData[field]}</span>
          <button
            type="button"
            onClick={() => startEdit(field)}
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={drafts[field]}
            onChange={(e) => setDrafts((d: any) => ({ ...d, [field]: e.target.value }))}
            className={classes}
            autoFocus
          />
          <button
            type="button"
            onClick={() => saveEdit(field)}
            className="rounded-md border border-green-200 bg-green-600 text-white px-3 py-2 hover:bg-green-700"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => cancelEdit(field)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
