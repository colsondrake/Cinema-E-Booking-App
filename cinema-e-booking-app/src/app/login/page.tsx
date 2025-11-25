"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../context/AccountContext";

const LoginPage = () => {
  const router = useRouter();
  const { account, login } = useAccount();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateEmailFormat = (e: string) => /^\S+@\S+\.\S+$/.test(e);

  const emailExists = async (e: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/exists?email=${encodeURIComponent(e)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking if email exists:", error);
      return false;
    }
  };

  const emailVerified = async (e: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/verify-email?email=${encodeURIComponent(e)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      return data.emailVerified;
    } catch (error) {
      setError("Error checking email verification:");
      return false;
    }
  };


  const handleLogin = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    setError(null);
    if (!validateEmailFormat(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    const doesEmailExist = await emailExists(email);
    if (!doesEmailExist) {
      setError("No account found with this email address.");
      return;
    }
    const isEmailVerified = await emailVerified(email);
    if (!isEmailVerified) {
      setError("Please verify your email address.");
      return;
    }

    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <>
      <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-12 justify-center mb-6 md:mb-12">
            <div className="col-span-12 lg:col-span-6 lg:col-start-4 text-center">
              <p className="mb-2">Welcome Back</p>
              <h2 className="text-3xl md:text-[45px] font-bold mb-6">Login</h2>
            </div>
          </div>

          <div className="max-w-md mx-auto bg-[#17233a] p-6 rounded-xl border border-[#17233a]">
            {error && <div className="text-red-400 mb-4">{error}</div>}
            <form onSubmit={handleLogin}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white mb-4" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white mb-4" />

              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={() => router.push('/forgot-password')} className="text-sm text-blue-300 underline cursor-pointer">Forgot password?</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-md cursor-pointer">Login</button>
                <button type="button" onClick={() => router.push('/create-account')} className="text-sm text-blue-300 underline cursor-pointer">Create an account</button>
              </div>

              <div className="text-center">
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginPage;
