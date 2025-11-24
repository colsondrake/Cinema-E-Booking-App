"use client";

import { useRouter } from "next/navigation";

export default function AdminHomePage() {
  const router = useRouter();

  return (
    <section className="min-h-screen bg-[#0b1727] text-white flex items-center justify-center">
      <div className="bg-[#17233a] p-10 rounded-2xl shadow-lg border border-[#1f2d49] w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Admin Panel</h1>

        <div className="flex flex-col gap-4">
          <button
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
            onClick={() => router.push("/admin/manage-movies")}
          >
            Manage Movies
          </button>

          <button
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
            onClick={() => router.push("/admin/movies/new")}
          >
            Add New Movie
          </button>

          <button
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
            onClick={() => router.push("/promotion")}
          >
            Promotions
          </button>
        </div>
      </div>
    </section>
  );
}
