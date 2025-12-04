"use client";

import React, { useEffect, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "@/context/AccountContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  subscribedToPromotions: boolean;
};

export default function EditUsersPage() {
  const { account } = useAccount();
  if (account?.role !== "ADMIN") {
    redirect("/");
  }

  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subscribedToPromotions, setSubscribedToPromotions] =
    useState<boolean>(false);
  const [role, setRole] = useState<string>("USER");
  const [isActive, setIsActive] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load user
  useEffect(() => {
    if (!userId) {
      setError("Missing userId in URL");
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/admin/users/${userId}`);
        if (!res.ok) {
          throw new Error(`Failed to load user (status ${res.status})`);
        }

        const data: any = await res.json();

        const promoFlag =
          data.subscribedToPromotions ??
          data.isSubscribedToPromotions ??
          false;

        const loadedUser: User = {
          id: data.id,
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          role: data.role ?? "USER",
          isActive: data.isActive ?? data.active ?? false,
          subscribedToPromotions: promoFlag,
        };

        setUser(loadedUser);
        setFirstName(loadedUser.firstName);
        setLastName(loadedUser.lastName);
        setEmail(loadedUser.email);
        setPhone(loadedUser.phone || "");
        setRole(loadedUser.role);
        setIsActive(loadedUser.isActive);
        setSubscribedToPromotions(loadedUser.subscribedToPromotions);
      } catch (err: any) {
        setError(err.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // Save basic info
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setError(null);
    setSuccessMsg(null);
    setSaving(true);

    try {
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        subscribedToPromotions,
        isActive,
      };

      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update user");
      }

      const updated: any = await res.json();
      const promoFlag =
        updated.subscribedToPromotions ??
        updated.isSubscribedToPromotions ??
        subscribedToPromotions;

      setUser((prev) =>
        prev
          ? {
              ...prev,
              firstName: updated.firstName ?? firstName,
              lastName: updated.lastName ?? lastName,
              email: updated.email ?? email,
              phone: updated.phone ?? phone,
              subscribedToPromotions: promoFlag,
            }
          : prev
      );

      setSuccessMsg("User information updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  // Make Admin
  const handleMakeAdmin = async () => {
    if (!userId) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/users/${userId}/role?role=ADMIN`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update role");
      }

      const updated = await res.json();
      setRole(updated.role ?? "ADMIN");
      setUser((prev) => (prev ? { ...prev, role: updated.role } : prev));
      setSuccessMsg("User is now an admin.");
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    }
  };

  // Suspend / Activate
  const handleToggleActive = async () => {
    if (!userId) return;
    setError(null);
    setSuccessMsg(null);

    const endpoint = isActive ? "suspend" : "activate";

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/users/${userId}/${endpoint}`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update status");
      }

      const updated = await res.json();
      const newActive = updated.isActive ?? !isActive;

      setIsActive(newActive);
      setUser((prev) => (prev ? { ...prev, isActive: newActive } : prev));
      setSuccessMsg(
        newActive ? "User account activated." : "User account suspended."
      );
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-[#0b1727] text-white py-10 md:py-12">
      <div className="w-full max-w-3xl bg-[#17233a] border border-[#1f2d49] rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Edit User</h1>
          <p className="text-gray-300 mt-2">
            Update user details, manage role, and account status.
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

        {loading || !user ? (
          <p className="text-gray-300 text-sm">Loading user…</p>
        ) : (
          <form onSubmit={handleSave}>
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-1">First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                  placeholder="First name"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                  placeholder="Optional phone"
                />
              </div>
            </div>

            {/* Role & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-1">Current Role</label>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                      role === "ADMIN"
                        ? "bg-amber-600/30 text-amber-300"
                        : "bg-gray-600/30 text-gray-300"
                    }`}
                  >
                    {role}
                  </span>
                </div>
              </div>
              <div>
                <label className="block mb-1">Account Status</label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                    isActive
                      ? "bg-green-600/30 text-green-300"
                      : "bg-red-600/30 text-red-300"
                  }`}
                >
                  {isActive ? "Active" : "Suspended"}
                </span>
              </div>
            </div>

            {/* Promotions */}
            <div className="mb-6">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscribedToPromotions}
                  onChange={(e) =>
                    setSubscribedToPromotions(e.target.checked)
                  }
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-200">
                  Subscribed to promotions
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-between mt-6">
              <button
                type="button"
                onClick={() => router.push("/admin/manage-users")}
                className="px-5 py-2 rounded-md bg-[#0b1727] border border-gray-700 hover:bg-[#0f1c30] text-sm"
              >
                Back
              </button>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleMakeAdmin}
                  className="px-5 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-sm"
                >
                  Make Admin
                </button>

                <button
                  type="button"
                  onClick={handleToggleActive}
                  className={`px-5 py-2 rounded-md text-sm ${
                    isActive
                      ? "bg-red-600 hover:bg-red-500"
                      : "bg-green-600 hover:bg-green-500"
                  }`}
                >
                  {isActive ? "Suspend Account" : "Activate Account"}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-sm"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
