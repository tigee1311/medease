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
              instructions={prescription.instructions}
              key={prescription.id}
              medicationName={`${prescription.medicationName} • ${prescription.dosage}`}
            />
          ))}
        </section>
      )}
    </main>
  );
}
