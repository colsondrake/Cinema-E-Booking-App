"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useAccount } from "@/context/AccountContext";

export default function AdminHomePage() {

  const router = useRouter();
	const { account } = useAccount();
	if (account?.role != "ADMIN") {
		redirect("/");
	}
	const items = [
		{ href: "/admin/manage-movies", label: "Manage Movies" },
		{ href: "/admin/manage-promotions", label: "Manage Promotions" },
		{ href: "/admin/manage-users", label: "Manage Users" },
		{ href: "/admin/manage-showtimes", label: "Manage Showtimes" },
	];

  return (
    <>
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
		<main className="flex min-h-[90vh] items-center justify-center px-4">
			<div className="w-full max-w-3xl">
				<h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{items.map((item) => (
						<Link key={item.href} href={item.href} className="group block">
							<div className="border border-blue-600 bg-blue-600 text-white hover:bg-blue-500 rounded py-6 px-4 text-center text-lg font-semibold transition-colors">
								{item.label}
							</div>
						</Link>
					))}
				</div>
			</div>
		</main>
    </>
  );
}