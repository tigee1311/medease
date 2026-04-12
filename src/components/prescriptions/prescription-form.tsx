"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const prescriptionDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function PrescriptionForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      medicationName: formData.get("medicationName"),
      purpose: formData.get("purpose"),
      dosage: formData.get("dosage"),
      instructions: formData.get("instructions"),
      scheduleTimes: formData.get("scheduleTimes"),
      daysOfWeek: formData.getAll("daysOfWeek"),
      startDate: formData.get("startDate"),
      refillDate: formData.get("refillDate") || undefined,
      notes: formData.get("notes") || undefined,
    };

    const response = await fetch("/api/prescriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Unable to save this prescription.");
      setPending(false);
      return;
    }

    event.currentTarget.reset();
    router.refresh();
    setPending(false);
  }

  return (
    <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-stone-700" htmlFor="medicationName">
          Medication name
        </label>
        <input className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4" id="medicationName" name="medicationName" placeholder="Lisinopril" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-stone-700" htmlFor="purpose">
          Purpose
        </label>
        <input className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4" id="purpose" name="purpose" placeholder="Blood pressure support" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-stone-700" htmlFor="dosage">
          Dosage
        </label>
        <input className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4" id="dosage" name="dosage" placeholder="10 mg" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-stone-700" htmlFor="scheduleTimes">
          Schedule times
        </label>
        <input className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4" id="scheduleTimes" name="scheduleTimes" placeholder="8:00 AM, 8:00 PM" required />
      </div>
      <div className="space-y-2 lg:col-span-2">
        <label className="text-sm font-semibold text-stone-700" htmlFor="instructions">
          Instructions
        </label>
        <textarea className="min-h-28 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3" id="instructions" name="instructions" placeholder="Take after breakfast with a full glass of water." required />
      </div>
      <div className="space-y-2">
        <span className="text-sm font-semibold text-stone-700">Days of the week</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {prescriptionDays.map((day) => (
            <label key={day} className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-stone-700">
              <input defaultChecked={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(day)} name="daysOfWeek" type="checkbox" value={day} />
              {day}
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700" htmlFor="startDate">
            Start date
          </label>
          <input className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4" id="startDate" name="startDate" required type="date" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700" htmlFor="refillDate">
            Refill date
          </label>
          <input className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4" id="refillDate" name="refillDate" type="date" />
        </div>
      </div>
      <div className="space-y-2 lg:col-span-2">
        <label className="text-sm font-semibold text-stone-700" htmlFor="notes">
          Notes
        </label>
        <textarea className="min-h-24 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3" id="notes" name="notes" placeholder="Keep near the kitchen sink. Skip on surgery day if instructed." />
      </div>
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 lg:col-span-2">{error}</p> : null}
      <div className="lg:col-span-2">
        <button className="h-14 rounded-2xl bg-stone-900 px-5 text-base font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400" disabled={pending} type="submit">
          {pending ? "Saving..." : "Add prescription"}
        </button>
      </div>
    </form>
  );
}
