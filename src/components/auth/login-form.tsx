"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Unable to sign in.");
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
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
        <label className="text-sm font-semibold text-stone-700" htmlFor="password">
          Password
        </label>
        <input
          className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 text-base outline-none transition focus:border-stone-500 focus:bg-white"
          id="password"
          name="password"
          placeholder="••••••••"
          required
          type="password"
        />
      </div>
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      <button
        className="h-14 w-full rounded-2xl bg-stone-900 px-5 text-base font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
