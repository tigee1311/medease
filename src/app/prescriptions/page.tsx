import { format } from "date-fns";

import { PrescriptionForm } from "@/components/prescriptions/prescription-form";
import { PrescriptionStatusButton } from "@/components/prescriptions/prescription-status-button";
import { requireUser } from "@/lib/auth/user";
import { resolveSeniorContext } from "@/lib/care-context";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PrescriptionsPage() {
  const user = await requireUser();
  const context = resolveSeniorContext(user);
  const prescriptions = await db.prescription.findMany({
    where: { seniorId: context.seniorId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="space-y-6 pb-6">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Prescription management</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900">Keep medication plans accurate and readable.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">
          Add medications, define the schedule, and keep refill timing visible. {context.seniorName} is the active senior profile for this workspace.
        </p>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900">Add a prescription</h2>
          <p className="mt-2 text-base leading-7 text-stone-600">
            Keep the schedule simple. Times can be entered as comma-separated values.
          </p>
        </div>
        <PrescriptionForm />
      </section>

      <section className="grid gap-4">
        {prescriptions.length === 0 ? (
          <article className="rounded-[2rem] border border-dashed border-stone-300 bg-white p-8 text-stone-600 shadow-[0_18px_60px_rgba(87,68,48,0.06)]">
            No prescriptions yet. Add the first medication plan above to activate the daily schedule.
          </article>
        ) : (
          prescriptions.map((prescription) => {
            const scheduleTimes = Array.isArray(prescription.scheduleTimes) ? prescription.scheduleTimes : [];
            const daysOfWeek = Array.isArray(prescription.daysOfWeek) ? prescription.daysOfWeek : [];

            return (
              <article key={prescription.id} className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-3xl font-semibold tracking-tight text-stone-900">{prescription.medicationName}</h3>
                      <span className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
                        {prescription.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-3 text-lg text-stone-700">{prescription.dosage}</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.24em] text-stone-500">{prescription.purpose}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <PrescriptionStatusButton id={prescription.id} label="Mark active" nextStatus="ACTIVE" />
                    <PrescriptionStatusButton id={prescription.id} label="Place on hold" nextStatus="ON_HOLD" />
                    <PrescriptionStatusButton id={prescription.id} label="Complete" nextStatus="COMPLETED" />
                  </div>
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                  <div className="rounded-[1.5rem] bg-stone-50 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Instructions</p>
                    <p className="mt-3 text-base leading-8 text-stone-700">{prescription.instructions}</p>
                    {prescription.notes ? (
                      <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-stone-600">{prescription.notes}</p>
                    ) : null}
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] border border-stone-200 p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Schedule</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {scheduleTimes.map((time) => (
                          <span key={`${prescription.id}-${String(time)}`} className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                            {String(time)}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                          <span key={`${prescription.id}-${String(day)}`} className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700">
                            {String(day)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] border border-stone-200 p-5 text-sm leading-7 text-stone-600">
                      <p>
                        <span className="font-semibold text-stone-900">Start:</span>{" "}
                        {format(prescription.startDate, "MMMM d, yyyy")}
                      </p>
                      <p>
                        <span className="font-semibold text-stone-900">Refill:</span>{" "}
                        {prescription.refillDate ? format(prescription.refillDate, "MMMM d, yyyy") : "Not set"}
                      </p>
                      <p>
                        <span className="font-semibold text-stone-900">Verification mode:</span>{" "}
                        {prescription.verificationMode.replaceAll("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
