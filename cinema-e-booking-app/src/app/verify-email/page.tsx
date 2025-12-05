"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [status, setStatus] = useState<"verifying"|"success"|"error">("verifying");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    const verify = async () => {
      setStatus("verifying");
      try {
        const res = await fetch("http://localhost:8080/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.error || "Verification failed");

        setStatus("success");
        setMessage("Email verified! Redirecting...");
        setTimeout(() => router.push("/booking/checkout"), 1500);
      } catch (e: any) {
        setStatus("error");
        setMessage(e?.message || "Verification failed");
      }
    };

    verify();
  }, [token, router]);

  return (
    <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">
      <div className="container px-4 mx-auto max-w-xl text-center">
        <h2 className="text-3xl md:text-[45px] font-bold mb-4">Verify Email</h2>
        {status === "verifying" ? (
          <p className="text-gray-300">Verifying your email…</p>
        ) : status === "success" ? (
          <div className="px-4 py-3 rounded-md bg-green-100 text-green-800">{message}</div>
        ) : (
          <div className="px-4 py-3 rounded-md bg-red-100 text-red-800">{message}</div>
        )}
      </div>
    </section>
  );
}
