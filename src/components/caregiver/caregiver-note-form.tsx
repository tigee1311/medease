"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CaregiverNoteForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/caregiver-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: formData.get("type"),
        severity: formData.get("severity"),
        title: formData.get("title"),
        message: formData.get("message"),
      }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Unable to save the caregiver update.");
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
        <label className="text-sm font-semibold text-stone-700" htmlFor="title">
          Title
        </label>
        <input className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4" id="title" name="title" placeholder="Checked in after breakfast" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700" htmlFor="type">
            Type
          </label>
          <select className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4" defaultValue="CHECK_IN" id="type" name="type">
            <option value="CHECK_IN">Check-in</option>
            <option value="REMINDER">Reminder</option>
            <option value="NOTE">Note</option>
            <option value="ALERT">Alert</option>
            <option value="ESCALATION">Escalation</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700" htmlFor="severity">
            Severity
          </label>
          <select className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4" defaultValue="LOW" id="severity" name="severity">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>
      <div className="space-y-2 lg:col-span-2">
        <label className="text-sm font-semibold text-stone-700" htmlFor="message">
          Message
        </label>
        <textarea className="min-h-28 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3" id="message" name="message" placeholder="Left a reminder to take the evening dose after dinner." required />
      </div>
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 lg:col-span-2">{error}</p> : null}
      <div className="lg:col-span-2">
        <button className="h-14 rounded-2xl bg-stone-900 px-5 text-base font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400" disabled={pending} type="submit">
          {pending ? "Saving..." : "Add caregiver update"}
        </button>
      </div>
    </form>
  );
}
