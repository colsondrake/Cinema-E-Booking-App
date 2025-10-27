'use client';

import { useState } from 'react';

type EditableKey = 'firstName' | 'lastName' | 'address';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export default function useEditableForm(initialData: ProfileFormData) {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [isEditing, setIsEditing] = useState<Record<EditableKey, boolean>>({
    firstName: false,
    lastName: false,
    address: false,
  });
  const [drafts, setDrafts] = useState<Record<EditableKey, string>>({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    address: initialData.address,
  });

  const startEdit = (key: EditableKey) => {
    setDrafts((prev) => ({ ...prev, [key]: formData[key] }));
    setIsEditing((prev) => ({ ...prev, [key]: true }));
  };

  const saveEdit = (key: EditableKey) => {
    const clean = drafts[key].trim();
    setFormData((prev: ProfileFormData) => ({
      ...prev,
      [key]: clean || prev[key],
    }));
    setIsEditing((prev) => ({ ...prev, [key]: false }));
  };

  const cancelEdit = (key: EditableKey) => {
    setDrafts((prev) => ({ ...prev, [key]: formData[key] }));
    setIsEditing((prev) => ({ ...prev, [key]: false }));
  };

  return {
    formData,
    setFormData,
    isEditing,
    drafts,
    setDrafts,
    startEdit,
    saveEdit,
    cancelEdit,
  };
}
