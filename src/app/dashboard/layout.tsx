import type { ReactNode } from "react";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DemoModeToggle } from "@/components/dashboard/demo-mode-toggle";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { requireUser } from "@/lib/auth/user";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/prescriptions", label: "Prescriptions" },
  { href: "/timeline", label: "Dose log" },
  { href: "/caregiver", label: "Caregiver feed" },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const companion =
    user.role === "SENIOR"
      ? user.careRelationshipsAsSenior[0]?.caregiver?.name ?? "No caregiver linked yet"
      : user.careRelationshipsAsCaregiver[0]?.senior?.name ?? "No senior linked yet";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f4efe7_0%,_#f7f4ef_35%,_#efe7db_100%)] text-stone-900">
      <div className="mx-auto flex max-w-[95rem] flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:px-8">
        <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-[22rem]">
          <div className="flex h-full flex-col rounded-[2rem] border border-stone-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,243,236,0.98))] p-7 shadow-[0_18px_60px_rgba(87,68,48,0.12)]">
            <div>
              <p className="text-base font-semibold uppercase tracking-[0.24em] text-amber-700">MedEase</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">Daily medication clarity</h1>
              <p className="mt-4 text-base leading-8 text-stone-600">
                Designed for seniors first, with caregiver awareness built in.
              </p>
            </div>
            <div className="mt-8 rounded-[1.75rem] bg-stone-900 p-5 text-stone-50">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-300">Signed in as</p>
              <p className="mt-3 text-3xl font-semibold">{user.name}</p>
              <p className="mt-1 text-base text-stone-300">{user.role === "SENIOR" ? "Senior account" : "Caregiver account"}</p>
              <div className="mt-4 rounded-2xl bg-white/10 p-4 text-base leading-7 text-stone-200">
                <p className="font-semibold text-white">Care partner</p>
                <p>{companion}</p>
              </div>
            </div>
            <DashboardNav items={navItems} />
            <div className="mt-auto pt-8">
              <div className="mb-4">
                <DemoModeToggle enabled={user.demoMode} />
              </div>
              <LogoutButton />
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
