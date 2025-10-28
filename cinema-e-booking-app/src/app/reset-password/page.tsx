'use client';

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Missing reset token.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      const body = new URLSearchParams();
      body.set("token", token);
      body.set("newPassword", newPassword);

      const res = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (!res.ok) {
        let msg = `Reset failed (${res.status})`;
        try {
          const j = await res.json();
          msg = j.error || j.message || msg;
        } catch {}
        throw new Error(msg);
      }

      setMessage("Password updated successfully. You can now log in.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-12 justify-center mb-6 md:mb-12">
          <div className="col-span-12 lg:col-span-6 lg:col-start-4 text-center">
            <p className="mb-2">Account Support</p>
            <h2 className="text-3xl md:text-[45px] font-bold mb-2">Reset Password</h2>
            <p className="text-gray-300">Enter a new password for your account.</p>
          </div>
        </div>

        {!token && (
          <div className="col-span-12 lg:col-span-6 lg:col-start-4 mx-auto max-w-2xl mb-6">
            <div className="px-4 py-3 rounded-md bg-yellow-100 text-yellow-800">
              Missing or invalid token. Please use the link from your reset email.
            </div>
          </div>
        )}

        {error && (
          <div className="col-span-12 lg:col-span-6 lg:col-start-4 mx-auto max-w-2xl mb-6">
            <div className="px-4 py-3 rounded-md bg-red-100 text-red-800">{error}</div>
          </div>
        )}

        {message && (
          <div className="col-span-12 lg:col-span-6 lg:col-start-4 mx-auto max-w-2xl mb-6">
            <div className="px-4 py-3 rounded-md bg-green-100 text-green-800">{message}</div>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="col-span-12 text-center mt-6 flex flex-col items-center gap-4"
        >
          <div className="flex flex-row gap-2 w-full max-w-2xl justify-center items-center">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
              className="w-full max-w-xs px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#17233a] border-gray-700 text-white"
              aria-label="New password"
            />
            <button
              type="submit"
              disabled={submitting || !token}
              className="px-4 py-2 bg-[#17233a] text-white rounded-md border border-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-200 cursor-pointer disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save New Password"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}