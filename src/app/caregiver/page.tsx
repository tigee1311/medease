import { format } from "date-fns";

import { CaregiverNoteForm } from "@/components/caregiver/caregiver-note-form";
import { requireUser } from "@/lib/auth/user";
import { resolveSeniorContext } from "@/lib/care-context";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CaregiverPage() {
  const user = await requireUser();
  const context = resolveSeniorContext(user);
  const events = await db.caregiverEvent.findMany({
    where: { seniorId: context.seniorId },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <main className="space-y-6 pb-6">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Caregiver event system</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900">Shared visibility without extra phone calls.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">
          Events are created automatically when a dose is missed or needs review, and caregivers can also leave manual notes and reminders.
        </p>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900">Add a caregiver update</h2>
          <p className="mt-2 text-base leading-7 text-stone-600">
            Useful for check-ins, reminders, or context that should stay attached to the medication record.
          </p>
        </div>
        <CaregiverNoteForm />
      </section>

      <section className="grid gap-4">
        {events.length === 0 ? (
          <article className="rounded-[2rem] border border-dashed border-stone-300 bg-white p-8 text-stone-600 shadow-[0_18px_60px_rgba(87,68,48,0.06)]">
            No caregiver events yet. Missed doses, review-required captures, and manual notes will appear here.
          </article>
        ) : (
          events.map((event) => (
            <article key={event.id} className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold tracking-tight text-stone-900">{event.title}</h2>
                    <span
                      className={`rounded-full px-4 py-2 text-xs font-semibold tracking-[0.2em] text-white ${
                        event.severity === "HIGH"
                          ? "bg-rose-600"
                          : event.severity === "MEDIUM"
                            ? "bg-amber-500"
                            : "bg-emerald-600"
                      }`}
                    >
                      {event.type}
                    </span>
                  </div>
                  <p className="mt-3 text-base leading-8 text-stone-600">{event.message}</p>
                </div>
                <div className="rounded-[1.25rem] bg-stone-50 px-4 py-3 text-sm leading-7 text-stone-600">
                  <p className="font-semibold text-stone-900">{event.severity} priority</p>
                  <p>{format(event.createdAt, "MMM d, yyyy • h:mm a")}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
