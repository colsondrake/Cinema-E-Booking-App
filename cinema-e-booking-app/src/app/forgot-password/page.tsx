"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:8080/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.success === false) {
        throw new Error(j.error || "Failed to send reset email");
      }
      setMsg("If that email exists, a reset link has been sent.");
    } catch (e: any) {
      setErr(e.message || "Failed to send reset email");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">
      <div className="container px-4 mx-auto max-w-xl">
        <h2 className="text-3xl md:text-[45px] font-bold mb-4 text-center">Forgot Password</h2>
        <p className="text-gray-300 mb-6 text-center">Enter your email to receive a reset link.</p>

        {err && <div className="mb-4 px-4 py-3 rounded-md bg-red-100 text-red-800">{err}</div>}
        {msg && <div className="mb-4 px-4 py-3 rounded-md bg-green-100 text-green-800">{msg}</div>}

        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 px-4 py-2 rounded-md bg-[#17233a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 rounded-md disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send link"}
          </button>
        </form>
      </div>
    </section>
  );
}
