"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { useAccount } from "@/context/AccountContext";

export default function AdminPage() {

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
	);
}

