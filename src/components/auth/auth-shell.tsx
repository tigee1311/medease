import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_rgba(243,238,232,1)_42%,_rgba(223,212,199,1)_100%)] px-4 py-8 text-stone-900 sm:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-[2rem] border border-stone-200/80 bg-white/75 p-8 shadow-[0_24px_80px_rgba(87,68,48,0.14)] backdrop-blur">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-bold text-stone-50">
                ME
              </span>
              MedEase
            </Link>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">{eyebrow}</p>
              <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-600">{description}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Large type", "Designed for seniors with clearer spacing and labels."],
              ["Fast logging", "Record a dose in seconds with camera or demo mode."],
              ["Shared updates", "Keep caregivers informed without extra phone calls."],
            ].map(([label, copy]) => (
              <article key={label} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                <h2 className="text-base font-semibold">{label}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="flex items-center">
          <div className="w-full rounded-[2rem] border border-stone-200/80 bg-white p-8 shadow-[0_24px_80px_rgba(87,68,48,0.12)]">
            {children}
            <div className="mt-6 border-t border-stone-200 pt-6 text-sm text-stone-600">{footer}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
