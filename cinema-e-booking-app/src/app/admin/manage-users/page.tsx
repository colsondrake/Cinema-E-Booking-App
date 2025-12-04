"use client";

import React, { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { useAccount } from "@/context/AccountContext";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  subscribedToPromotions?: boolean;
  createdAt?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function AdminUsersPage() {
  const { account } = useAccount();
  if (account?.role !== "ADMIN") {
    redirect("/");
  }

  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/admin/users`);
        if (!res.ok) {
          throw new Error(`Failed to load users (status ${res.status})`);
        }

        const data: User[] = await res.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <main className="flex min-h-screen bg-[#0b1727] items-center justify-center text-white py-10">
      <div className="w-full max-w-5xl bg-[#17233a] border border-[#1f2d49] rounded-2xl p-8 shadow-lg">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
          <p className="text-zinc-400">
            View and manage all registered users.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-zinc-300 text-sm">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="text-zinc-400 text-sm">No users found.</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col md:flex-row justify-between gap-4 bg-[#0b1727] border border-gray-700 rounded-xl p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-lg font-semibold">
                      {user.firstName} {user.lastName}
                    </h2>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        user.role === "ADMIN"
                          ? "bg-amber-600/30 text-amber-300"
                          : "bg-gray-600/30 text-gray-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-300 mt-1">
                    <span className="text-zinc-400">Email:</span> {user.email}
                  </p>

                  {user.phone && (
                    <p className="text-sm text-zinc-300 mt-1">
                      <span className="text-zinc-400">Phone:</span>{" "}
                      {user.phone}
                    </p>
                  )}

                  <div className="text-[11px] text-gray-500 mt-3">
                    User ID: {user.id}
                  </div>
                </div>

                <div className="flex items-start">
                  <button
                    onClick={() =>
                      router.push(
                        `/admin/manage-users/edit-user?userId=${user.id}`
                      )
                    }
                    className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 border border-gray-700 rounded-md text-sm"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
