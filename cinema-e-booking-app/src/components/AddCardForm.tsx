/* Form instead of the modal pop up which stores the card details */

'use client';

import { useEffect, useState } from "react";
import InputField from "@/components/InputField";

export type CardPayload = {
  firstName: string;
  lastName: string;
  cardNumber: string;
  expiryDate: string; // MM/YY
  cvv: string;
};

/**
 * Props accepted by AddCardForm.
 * - onCancel: closes the modal or cancels the edit flow
 * - onSubmit: callback to parent to handle form submission (add/update)
 * - initialValues: prefilled data when editing an existing card
 * - mode: determines whether we're adding or editing a card
 */
interface AddCardFormProps {
  onCancel: () => void;
  onSubmit: (data: CardPayload) => void;
  initialValues?: Partial<CardPayload>;
  mode?: 'add' | 'edit';
}

export default function AddCardForm({
  onCancel,
  onSubmit,
  initialValues,
  mode = 'add',
}: AddCardFormProps) {
  const [form, setForm] = useState<CardPayload>({
    firstName: '',
    lastName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  
  useEffect(() => {
    if (initialValues) {
      setForm(prev => ({
        ...prev,
        ...initialValues,
        // ensure keys exist
        firstName: initialValues.firstName ?? prev.firstName,
        lastName: initialValues.lastName ?? prev.lastName,
        cardNumber: initialValues.cardNumber ?? prev.cardNumber,
        expiryDate: initialValues.expiryDate ?? prev.expiryDate,
        cvv: initialValues.cvv ?? prev.cvv,
      }));
    }
  }, [initialValues]);


  /**
   * Input change handler for all form fields.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      const cleaned = value.replace(/[^\d\s]/g, '');
      setForm(prev => ({ ...prev, cardNumber: cleaned }));
      return;
    }
    if (name === 'cvv') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setForm(prev => ({ ...prev, cvv: cleaned }));
      return;
    }
    if (name === 'expiryDate') {
      
      const digits = value.replace(/\D/g, '').slice(0, 4);
      const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      setForm(prev => ({ ...prev, expiryDate: formatted }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles the form submission (Add / Edit).
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    
    if (!form.firstName || !form.lastName || !form.cardNumber || !form.expiryDate || !form.cvv) {
      alert('Please complete all required fields.');
      return;
    }

    /**
     * Backend integration:
     */

    
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="First Name"
        id="firstName"
        name="firstName"
        type="text"
        placeholder="Cardholder First Name"
        value={form.firstName}
        onChange={handleChange}
        className="w-full border rounded-md px-3 py-2"
        required
      />

      <InputField
        label="Last Name"
        id="lastName"
        name="lastName"
        type="text"
        placeholder="Cardholder Last Name"
        value={form.lastName}
        onChange={handleChange}
        className="w-full border rounded-md px-3 py-2"
        required
      />

      <InputField
        label="Card Number"
        id="cardNumber"
        name="cardNumber"
        type="text"
        placeholder="Card Number"
        value={form.cardNumber}
        onChange={handleChange}
        className="w-full border rounded-md px-3 py-2"
        inputMode="numeric"
        required
      />

      <InputField
        label="CVV"
        id="cvv"
        name="cvv"
        type="password"
        placeholder="CVV"
        value={form.cvv}
        onChange={handleChange}
        className="w-full border rounded-md px-3 py-2"
        inputMode="numeric"
        required
      />

      <InputField
        label="Expiry Date"
        id="expiryDate"
        name="expiryDate"
        type="text"
        placeholder="MM/YY"
        value={form.expiryDate}
        onChange={handleChange}
        className="w-full border rounded-md px-3 py-2"
        required
      />

      
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          {mode === 'edit' ? 'Save Card' : 'Add Card'}
        </button>
      </div>
    </form>
  );
}
