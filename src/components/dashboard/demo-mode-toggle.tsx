"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DemoModeToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [isEnabled, setIsEnabled] = useState(enabled);

  async function handleToggle() {
    const nextEnabled = !isEnabled;
    setPending(true);
    setIsEnabled(nextEnabled);

    const response = await fetch("/api/preferences/demo-mode", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ demoMode: nextEnabled }),
    });

    if (!response.ok) {
      setIsEnabled(!nextEnabled);
    }

    setPending(false);
    router.refresh();
  }

  return (
    <button
      aria-pressed={isEnabled}
      className={`flex w-full items-center justify-between rounded-[1.4rem] border px-4 py-4 text-left transition ${
        isEnabled
          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
          : "border-stone-200 bg-stone-50 text-stone-700"
      }`}
      disabled={pending}
      onClick={handleToggle}
      type="button"
    >
      <span>
        <span className="block text-sm font-semibold uppercase tracking-[0.22em]">Demo mode</span>
        <span className="mt-1 block text-sm leading-6">
          {isEnabled ? "Instant mock verification for smooth judging." : "Prefer the camera-first verification experience."}
        </span>
      </span>
      <span
        className={`relative inline-flex h-8 w-[3.75rem] rounded-full transition ${
          isEnabled ? "bg-emerald-500" : "bg-stone-300"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
            isEnabled ? "left-8" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}
