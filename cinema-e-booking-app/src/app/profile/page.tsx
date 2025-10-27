'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileNavigation from '@/components/ProfileNavigation';
import Modal from '@/components/Modal';
import AddCardForm, { type CardPayload } from '@/components/AddCardForm';
import EditableField from '@/components/EditableField';
import ReadOnlyField from '@/components/ReadOnlyField';
import Section from '@/components/Section';
import useEditableForm from '@/hooks/useEditableForm';
import { Pencil, Trash2, Plus } from 'lucide-react';

export type StoredCard = CardPayload & {
  id: string; 
};

function maskCard(num: string) {
  const last4 = (num || '').replace(/\s+/g, '').slice(-4);
  return `•••• •••• •••• ${last4 || '____'}`;
}

export default function ProfilePage() {
  const router = useRouter();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalInitial, setModalInitial] = useState<Partial<CardPayload> | undefined>(undefined);

  /**
   *  PROFILE FORM STATE (Personal + Address info)
   *  Managed through custom hook useEditableForm()
   *  */
  const { formData, drafts, isEditing, setDrafts, startEdit, saveEdit, cancelEdit } = useEditableForm({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '123-456-7890',
    address: '123 Main St',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30332',
  });

  // NEW: cards state (max 3)
  const [cards, setCards] = useState<StoredCard[]>([
    {
      id: 'c_1',
      cardNumber: '4242 4242 4242 1234',
      expiryDate: '12/25',
      cvv: '***',
      firstName: 'John',
      lastName: 'Doe'
    },
  ]);

  const anyEditing = Object.values(isEditing).some(Boolean);
  const ro = 'bg-gray-50 text-gray-700 cursor-not-allowed focus:ring-0 focus:outline-none pointer-events-none';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

   /**
   *  MODAL HANDLERS
   *  openAddCard → open empty modal for new card
   *  openEditCard → open modal prefilled with selected card data
   **/
  const openAddCard = () => {
    setModalMode('add');
    setEditingId(null);
    setModalInitial(undefined);
    setIsModalOpen(true);
  };

  const openEditCard = (card: StoredCard) => {
    setModalMode('edit');
    setEditingId(card.id);
    setModalInitial({
      cardNumber: card.cardNumber,
      expiryDate: card.expiryDate,
      cvv: card.cvv,
      firstName: card.firstName,
      lastName: card.lastName
    });
    setIsModalOpen(true);
  };

  /** 
   *  CARD CRUD FUNCTIONS (Client-side state)
   *  These currently update local state only.
   *  Need backend integration
   **/
  const addCard = (payload: CardPayload) => {
    if (cards.length >= 3) return; // guard
    const id = `c_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
    setCards((prev) => [...prev, { id, ...payload }]);
  };

  const updateCard = (id: string, payload: CardPayload) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...payload } : c)));
  };

  const removeCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };


   /**
   *  FORM SUBMIT HANDLER (Profile Info)
   *  Need backend integration
   **/
  const handleCardSubmit = (data: CardPayload) => {
    if (modalMode === 'add') {
      addCard(data);
      alert('Card added successfully!');
    } else if (modalMode === 'edit' && editingId) {
      updateCard(editingId, data);
      alert('Card updated successfully!');
    }
    setIsModalOpen(false);
  };


  /*
   * Render UI
   **/
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1727] px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-[#373572] dark:text-white">Edit Profile</h1>
      <div className="max-w-2xl mx-auto">
        <ProfileNavigation width="670px" />
        <div className="border-2 border-gray-300 dark:border-gray-600 p-8 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-lg w-full">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Section title="Personal Information">
              <EditableField {...{ label: 'First Name', field: 'firstName', formData, drafts, isEditing, startEdit, saveEdit, cancelEdit, setDrafts }} />
              <EditableField {...{ label: 'Last Name', field: 'lastName', formData, drafts, isEditing, startEdit, saveEdit, cancelEdit, setDrafts }} />
              <ReadOnlyField label="Email" value={formData.email ?? ''} ro={ro} />
              <ReadOnlyField label="Phone Number" value={formData.phoneNumber ?? ''} ro={ro} />
            </Section>

            <Section title="Address">
              <EditableField {...{ label: 'Street Address', field: 'address', formData, drafts, isEditing, startEdit, saveEdit, cancelEdit, setDrafts, fullWidth: true }} />
              <EditableField {...{ label: 'City', field: 'city', formData, drafts, isEditing, startEdit, saveEdit, cancelEdit, setDrafts }} />
              <EditableField {...{ label: 'State', field: 'state', formData, drafts, isEditing, startEdit, saveEdit, cancelEdit, setDrafts }} />
              <EditableField {...{ label: 'ZIP Code', field: 'zipCode', formData, drafts, isEditing, startEdit, saveEdit, cancelEdit, setDrafts }} />
            </Section>

            {/* PAYMENT SECTION */}
            <Section title="Payment Information">
              <div className="space-y-3">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{card.firstName || '—'}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {maskCard(card.cardNumber)} • Expires {card.expiryDate || '—'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditCard(card)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        title="Edit card"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCard(card.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-700"
                        title="Remove card"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={openAddCard}
                  disabled={cards.length >= 3}
                  title={cards.length >= 3 ? 'Maximum 3 cards' : 'Add a card'}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-400 text-center rounded-md cursor-pointer hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  {cards.length >= 3 ? 'Maximum 3 cards saved' : 'Add a card'}
                </button>
              </div>
            </Section>

            <div className="flex justify-between col-span-2 mt-8">
              <Link href="/" className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">Cancel</Link>
              <button
                type="submit"
                disabled={anyEditing}
                title={anyEditing ? 'Finish editing before saving' : 'Save Changes'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'edit' ? 'Edit Card' : 'Add a Card'}
      >
        <AddCardForm
          mode={modalMode}
          initialValues={modalInitial}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleCardSubmit}
        />
      </Modal>
    </div>
  );
}
