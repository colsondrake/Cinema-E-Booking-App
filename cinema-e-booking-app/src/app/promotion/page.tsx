"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// --- Types & Constants ---
export type PromotionStatus = "Active" | "Inactive";
const STATUSES: ReadonlyArray<PromotionStatus> = ["Active", "Inactive"];

// Match your Java model
export type Promotion = {
  promotionId: string;
  promotionCode: string;
  discountPercent: number;
  startDate: string; // "yyyy-mm-dd" from LocalDate
  endDate: string;   // "yyyy-mm-dd"
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// --- Helpers ---
const todayISO = () => new Date().toISOString().slice(0, 10); // yyyy-mm-dd

export default function NewPromotionPage() {
  const router = useRouter();

  // List state
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingPromos, setLoadingPromos] = useState<boolean>(false);

  // Which promotion (if any) we’re editing
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [promotionCode, setPromotionCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<string>(""); // numeric string
  const [startDate, setStartDate] = useState<string>(todayISO());
  const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<PromotionStatus>("Active"); // UI-only for now

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Saved promo (for emailing step)
  const [savedPromotionId, setSavedPromotionId] = useState<string | null>(null);

  // NEW: controls whether the form + email section is visible
  const [showForm, setShowForm] = useState(false);

  // ---- Load existing promotions on mount ----
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoadingPromos(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/admin/promotions`);
        if (!res.ok) {
          throw new Error(
            `Failed to load promotions (status ${res.status})`
          );
        }
        const data: Promotion[] = await res.json();
        setPromotions(data);
      } catch (err: any) {
        setError(err.message || "Failed to load promotions");
      } finally {
        setLoadingPromos(false);
      }
    };

    fetchPromotions();
  }, []);

  // Client-side validation
  const validationError = useMemo(() => {
    if (!promotionCode.trim()) return "Promotion code is required.";
    const d = Number(discountPercent);
    if (Number.isNaN(d)) return "Discount must be a number.";
    if (d <= 0 || d > 100) return "Discount must be between 0 and 100.";
    if (!startDate) return "Start date is required.";
    if (!endDate) return "End date is required.";
    if (new Date(endDate) < new Date(startDate))
      return "End date cannot be before start date.";
    return null;
  }, [promotionCode, discountPercent, startDate, endDate]);

  // ---- Helpers to reset form for "new" mode ----
  const resetFormToNew = () => {
    setEditingId(null);
    setPromotionCode("");
    setDiscountPercent("");
    setStartDate(todayISO());
    setEndDate("");
    setStatus("Active");
    setSavedPromotionId(null);
    setSuccessMsg(null);
    setError(null);
    setShowForm(true); // show empty form when clicking "+ New Promotion"
  };

  // ---- Load a promotion into the form to edit ----
  const handleEditClick = (promo: Promotion) => {
    setEditingId(promo.promotionId);
    setPromotionCode(promo.promotionCode);
    setDiscountPercent(promo.discountPercent.toString());
    setStartDate(promo.startDate);
    setEndDate(promo.endDate);
    setSavedPromotionId(promo.promotionId);
    setSuccessMsg(null);
    setError(null);
    setShowForm(true); // show pre-filled form when editing
  };

  // ---- Create / Update submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const vErr = validationError;
    if (vErr) {
      setError(vErr);
      return;
    }

    setSubmitting(true);
    try {
      const isEditing = !!editingId;

      const payload = {
        promotionCode: promotionCode.trim(),
        discountPercent: Number(discountPercent),
        startDate,
        endDate,
      };

      const url = isEditing
        ? `${API_BASE}/api/admin/promotions/${editingId}`
        : `${API_BASE}/api/admin/promotions`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          text || `Failed to ${isEditing ? "update" : "create"} promotion`
        );
      }

      const saved: Promotion = await res.json();
      setSavedPromotionId(saved.promotionId);
      setSuccessMsg(
        `Promotion ${isEditing ? "updated" : "created"} successfully.`
      );

      setPromotions((prev) => {
        if (isEditing) {
          return prev.map((p) =>
            p.promotionId === saved.promotionId ? saved : p
          );
        }
        return [...prev, saved];
      });

      if (!isEditing) {
        // After creating, keep the form open and switch into editing this promo
        setEditingId(saved.promotionId);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save promotion");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Email subscribed users ----
  const handleEmailSubscribed = async () => {
    setError(null);
    setSuccessMsg(null);

    const promotionIdToUse =
      savedPromotionId || editingId || null;

    if (!promotionIdToUse) {
      setError("Please save or select a promotion first.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/promotions/${promotionIdToUse}/send`,
        {
          method: "POST",
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to send promotion emails");
      }
      setSuccessMsg("Promotion emails sent successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to send promotion emails");
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-[#0b1727] text-white py-10 md:py-12">
      <div className="w-full max-w-4xl bg-[#17233a] border border-[#1f2d49] rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            Promotions Admin
          </h1>
          <p className="text-gray-300 mt-2">
            View, edit, and create promotions. You can email subscribed users after saving.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-2 text-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 px-4 py-2 text-sm">
            {successMsg}
          </div>
        )}

        {/* Existing Promotions List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Existing Promotions</h2>
            <button
              type="button"
              onClick={resetFormToNew}
              className="text-sm px-3 py-1 rounded-md bg-[#0b1727] border border-gray-700 hover:bg-[#0f1c30]"
            >
              + New Promotion
            </button>
          </div>

          {loadingPromos ? (
            <p className="text-gray-300 text-sm">Loading promotions…</p>
          ) : promotions.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No promotions have been created yet.
            </p>
          ) : (
            <div className="space-y-3">
              {promotions.map((promo) => (
                <div
                  key={promo.promotionId}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0b1727] border rounded-lg px-4 py-3 ${
                    editingId === promo.promotionId
                      ? "border-blue-500"
                      : "border-gray-700"
                  }`}
                >
                  <div>
                    <div className="font-semibold">
                      {promo.promotionCode}{" "}
                      <span className="text-sm text-gray-300">
                        ({promo.discountPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {promo.startDate} → {promo.endDate}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      ID: {promo.promotionId}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(promo)}
                      className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-500"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create / Edit Promotion Form + Email section (only when showForm is true) */}
        {showForm && (
          <div className="border-t border-gray-700 pt-6 mt-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold">
                {editingId ? "Edit Promotion" : "Create Promotion"}
              </h2>
              <p className="text-gray-300 text-sm mt-1">
                {editingId
                  ? "Update the selected promotion details and save."
                  : "Set code, dates, and discount, then save to create a promotion."}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block mb-1">
                    Promotion Code
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={promotionCode}
                    onChange={(e) => setPromotionCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                    placeholder="e.g., SUMMER25"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">
                    Discount %
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step={0.01}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                    placeholder="e.g., 15"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block mb-1">
                    Start Date
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">
                    End Date
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                    required
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block mb-2">Status (UI only)</label>
                <div className="flex justify-center gap-3 flex-wrap">
                  {STATUSES.map((s) => (
                    <label
                      key={s}
                      className={`cursor-pointer border rounded-lg px-3 py-2 bg-[#0b1727] ${
                        status === s ? "border-blue-500" : "border-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        className="mr-2"
                        checked={status === s}
                        onChange={() => setStatus(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  (If you want to persist status, add a field to your Java <code>Promotion</code> model.)
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
                >
                  {submitting
                    ? editingId
                      ? "Updating…"
                      : "Saving…"
                    : editingId
                    ? "Update Promotion"
                    : "Save Promotion"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setSavedPromotionId(null);
                  }}
                  className="px-6 py-2 rounded-md bg-[#0b1727] border border-gray-700 hover:bg-[#0f1c30]"
                >
                  Close
                </button>
              </div>
            </form>

            {/* Email to subscribed users */}
            <div className="mt-8 border-t border-gray-700 pt-6">
              <div className="text-center mb-3">
                <h3 className="text-lg font-semibold">Email Promotion</h3>
                <p className="text-gray-400 text-sm">
                  Send only to users who opted in to promotions.
                </p>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleEmailSubscribed}
                  disabled={!editingId && !savedPromotionId}
                  className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
                >
                  Email Subscribed Users
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
