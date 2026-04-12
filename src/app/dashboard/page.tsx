import { requireUser } from "@/lib/auth/user";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [prescriptionCount, careEventCount, doseCount] = await Promise.all([
    db.prescription.count({ where: { seniorId: user.id } }),
    db.caregiverEvent.count({ where: { seniorId: user.id } }),
    db.medicationEvent.count({ where: { seniorId: user.id } }),
  ]);

  return (
    <main className="space-y-6 pb-6">
      <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(245,238,229,0.96))] p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Today&apos;s medication view</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
              Hello, {user.name.split(" ")[0]}.
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">
              This dashboard keeps the next medication step obvious, readable, and calm. Every action is designed to work well on mobile and for older adults with lower visual tolerance.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white px-5 py-4 text-sm leading-6 text-stone-600">
            <p className="font-semibold text-stone-900">Account posture</p>
            <p>{user.demoMode ? "Demo mode is ready for instant verification walkthroughs." : "Live mode will favor camera verification."}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Active prescriptions",
            value: prescriptionCount,
            accent: "from-emerald-100 to-white",
            copy: "Medications currently being tracked for this senior account.",
          },
          {
            label: "Medication events",
            value: doseCount,
            accent: "from-sky-100 to-white",
            copy: "Dose records will appear here as the timeline fills in.",
          },
          {
            label: "Caregiver updates",
            value: careEventCount,
            accent: "from-amber-100 to-white",
            copy: "Shared events, alerts, and reassurance notes for the care team.",
          },
        ].map((card) => (
          <article
            key={card.label}
            className={`rounded-[1.75rem] border border-stone-200 bg-gradient-to-br ${card.accent} p-6 shadow-[0_16px_50px_rgba(87,68,48,0.08)]`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">{card.label}</p>
            <p className="mt-5 text-5xl font-semibold tracking-tight text-stone-900">{card.value}</p>
            <p className="mt-4 text-sm leading-7 text-stone-600">{card.copy}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Next step</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">Keep one obvious action visible</h3>
            </div>
            <span className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
              Senior-first layout
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Large medication cards",
                copy: "Medication names, dose, and timing use oversized hierarchy so users do not hunt for the next action.",
              },
              {
                title: "One-tap confirmation path",
                copy: "Camera capture and demo verification will sit directly inside the daily workflow without extra navigation.",
              },
              {
                title: "Low-friction caregiver visibility",
                copy: "Important changes will create updates for caregivers automatically instead of requiring manual status calls.",
              },
              {
                title: "Refill awareness",
                copy: "Upcoming refill timing will sit beside the medication routine so shortages are visible earlier.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] bg-stone-50 p-5">
                <h4 className="text-xl font-semibold text-stone-900">{item.title}</h4>
                <p className="mt-3 text-sm leading-7 text-stone-600">{item.copy}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-stone-200 bg-stone-900 p-8 text-stone-50 shadow-[0_18px_60px_rgba(87,68,48,0.16)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-300">Care summary</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight">Designed to reduce anxiety, not add more steps.</h3>
          <div className="mt-6 space-y-4">
            {[
              `Account type: ${user.role === "SENIOR" ? "Senior using the app directly" : "Caregiver supporting a senior"}`,
              `Demo mode: ${user.demoMode ? "Enabled for instant judge-friendly walkthroughs" : "Disabled for camera-first verification"}`,
              `Connected relationships: ${user.role === "SENIOR" ? user.careRelationshipsAsSenior.length : user.careRelationshipsAsCaregiver.length}`,
            ].map((item) => (
              <div key={item} className="rounded-[1.5rem] bg-white/10 p-4 text-sm leading-7 text-stone-100">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
