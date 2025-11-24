'use client';

import Movies from "@/components/Movies";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Movies />
      <div className="flex justify-center mt-6">
        <button
          onClick={() => router.push("/admin")}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md"
        >
          Admin
        </button>
      </div>
    </>
  );
}
