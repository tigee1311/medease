import { format } from "date-fns";

import { CameraCaptureCard } from "@/components/camera/camera-capture-card";
import { requireUser } from "@/lib/auth/user";
import { resolveSeniorContext } from "@/lib/care-context";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const user = await requireUser();
  const context = resolveSeniorContext(user);
  const prescriptions = await db.prescription.findMany({
    where: { seniorId: context.seniorId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  const recentEvents = await db.medicationEvent.findMany({
    where: { seniorId: context.seniorId },
    include: {
      prescription: true,
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <main className="space-y-6 pb-6">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Capture workflow</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900">Use the camera or a photo upload to confirm the next dose.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">
          This flow is intentionally forgiving: users can use the rear camera when available, or fall back to an uploaded photo when permissions or device support are limited.
        </p>
      </section>

      {prescriptions.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-stone-300 bg-white p-8 text-stone-600 shadow-[0_18px_60px_rgba(87,68,48,0.06)]">
          Add at least one active prescription to unlock the camera workflow.
        </section>
      ) : (
        <section className="grid gap-4">
          {prescriptions.map((prescription) => (
            <CameraCaptureCard
              demoModeEnabled={user.demoMode}
              instructions={prescription.instructions}
              key={prescription.id}
              medicationName={`${prescription.medicationName} • ${prescription.dosage}`}
              prescriptionId={prescription.id}
            />
          ))}
        </section>
      )}

      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Medication timeline</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">Recent dose events</h2>
          </div>
          <p className="text-sm text-stone-500">Newest events appear first.</p>
        </div>
        <div className="mt-6 grid gap-4">
          {recentEvents.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-5 text-sm leading-7 text-stone-600">
              No medication events logged yet. Verify or manually mark a dose to populate the timeline.
            </div>
          ) : (
            recentEvents.map((event) => (
              <article key={event.id} className="rounded-[1.5rem] bg-stone-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-stone-900">{event.prescription.medicationName}</h3>
                    <p className="mt-1 text-sm text-stone-600">{event.prescription.dosage}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${
                        event.status === "TAKEN"
                          ? "bg-emerald-600"
                          : event.status === "MISSED"
                            ? "bg-rose-600"
                            : "bg-amber-500"
                      }`}
                    >
                      {event.status.replace("_", " ")}
                    </span>
                    <span className="text-sm text-stone-500">{format(event.createdAt, "MMM d, yyyy • h:mm a")}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  Source: {event.source.toLowerCase()} {event.verificationLabel ? `• ${event.verificationLabel}` : ""}
                </p>
                {event.note ? <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-stone-600">{event.note}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
