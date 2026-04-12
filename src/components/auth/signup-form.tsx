"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      age: formData.get("age") || undefined,
    };

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Unable to create your account.");
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-stone-700" htmlFor="name">
          Full name
        </label>
        <input
          className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 text-base outline-none transition focus:border-stone-500 focus:bg-white"
          id="name"
          name="name"
          placeholder="Margaret Jensen"
          required
          type="text"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700" htmlFor="email">
            Email
          </label>
          <input
            className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 text-base outline-none transition focus:border-stone-500 focus:bg-white"
            id="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700" htmlFor="age">
            Age
          </label>
          <input
            className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 text-base outline-none transition focus:border-stone-500 focus:bg-white"
            id="age"
            max={110}
            min={50}
            name="age"
            placeholder="74"
            type="number"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-stone-700" htmlFor="password">
          Password
        </label>
        <input
          className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 text-base outline-none transition focus:border-stone-500 focus:bg-white"
          id="password"
          name="password"
          placeholder="At least 8 characters"
          required
          type="password"
        />
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-stone-700">I am joining as</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              value: "SENIOR",
              title: "Senior",
              copy: "Track medication, refills, and daily confirmations.",
            },
            {
              value: "CAREGIVER",
              title: "Caregiver",
              copy: "Monitor adherence and receive issue alerts.",
            },
          ].map((option, index) => (
            <label
              key={option.value}
              className="flex cursor-pointer gap-3 rounded-3xl border border-stone-200 bg-stone-50 p-4 transition hover:border-stone-400"
            >
              <input defaultChecked={index === 0} name="role" type="radio" value={option.value} />
              <span>
                <span className="block text-base font-semibold text-stone-900">{option.title}</span>
                <span className="mt-1 block text-sm leading-6 text-stone-600">{option.copy}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      <button
        className="h-14 w-full rounded-2xl bg-stone-900 px-5 text-base font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
