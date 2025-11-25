"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AccountNavbar from "@/components/AccountNavbar";
import { useAccount } from "@/context/AccountContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { account, logout } = useAccount();

  // Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // UX state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // User lookup (by email → id)
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // If no account, show simple message
  if (!account) {
    return (
      <>
        <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">
          <div className="container px-4 mx-auto text-center">
            <p className="mb-4">No account signed in.</p>
          </div>
        </section>
      </>
    );
  }

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    /*
    if (!userId) {
      setError("User not loaded yet. Please wait a moment and try again.");
      return;
    }
    */
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/change-password-by-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: account.email,
          currentPassword,
          newPassword,
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Failed to change password");
        
      console.log(userId)
      setMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setError(err?.message || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>  
      <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">
      <div className="container px-4 mx-auto">
      {/* Center the entire content block */}
      <div className="grid grid-cols-12 justify-center mb-6 md:mb-12">
      <div className="col-span-12 flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-[45px] font-bold mb-6">
          Change Password
        </h2>

        {/* Centered, fixed-width Account sub-nav */}
        <div className="mx-auto mb-6 w-[770px] flex justify-center">
          <AccountNavbar />
        </div>
      </div>
      </div>

      <div className="max-w-3xl mx-auto bg-[#17233a] p-6 rounded-xl border border-[#17233a]">
        {error && <div className="text-red-400 mb-4">{error}</div>}
        {message && <div className="text-green-400 mb-4">{message}</div>}
        {loadingUser && (
          <div className="text-gray-300 mb-4">Loading your account…</div>
        )}

  
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white"
                minLength={8}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white"
                minLength={8}
              />
  
              <div className="mt-3 flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded cursor-pointer disabled:opacity-60"
                >
                  {submitting ? "Saving…" : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setError(null);
                    setMessage(null);
                  }}
                  className="px-6 py-2 bg-[#17233a] hover:bg-blue-600 rounded border border-gray-700 cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="ml-auto px-6 py-2 bg-red-600 hover:bg-red-500 rounded cursor-pointer"
                >
                  Logout
                </button>
              </div>
  
              <div className="text-sm text-gray-300 mt-2">
                Signed in as <span className="font-medium">{account.email}</span>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
  
}
