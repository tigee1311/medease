"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNav({
  items,
}: {
  items: Array<{ href: string; label: string }>;
}) {
  const pathname = usePathname();

  return (
    <nav className="mt-8 grid gap-2">
      {items.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            className={`rounded-2xl px-4 py-3 text-base font-semibold transition ${
              active
                ? "bg-stone-900 text-white shadow-[0_12px_24px_rgba(31,26,23,0.16)]"
                : "text-stone-700 hover:bg-stone-100 hover:text-stone-950"
            }`}
            href={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
