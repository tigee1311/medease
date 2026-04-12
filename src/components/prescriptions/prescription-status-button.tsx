"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PrescriptionStatusButton({
  id,
  nextStatus,
  label,
}: {
  id: string;
  nextStatus: "ACTIVE" | "ON_HOLD" | "COMPLETED";
  label: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    await fetch(`/api/prescriptions/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    router.refresh();
    setPending(false);
  }

  return (
    <button
      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
      disabled={pending}
      onClick={handleClick}
      type="button"
    >
      {pending ? "Updating..." : label}
    </button>
  );
}
