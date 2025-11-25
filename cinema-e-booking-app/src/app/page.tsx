'use client';

import Movies from "@/components/Movies";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Movies />
    </>
  );
}
