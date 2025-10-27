'use client';
export default function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="col-span-2 mt-4">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">{title}</h2>
      {children}
    </div>
  );
}
