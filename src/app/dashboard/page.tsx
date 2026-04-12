import { differenceInMinutes, format, isSameDay, parse, set } from "date-fns";

import { DemoFlowPanel } from "@/components/dashboard/demo-flow-panel";
import { requireUser } from "@/lib/auth/user";
import { resolveSeniorContext } from "@/lib/care-context";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseUpcomingDoseLabel(scheduleTimes: unknown, now: Date) {
  if (!Array.isArray(scheduleTimes)) {
    return null;
  }

  const upcomingTimes = scheduleTimes
    .map((time) => {
      if (typeof time !== "string") {
        return null;
      }

      const parsed = parse(time, "h:mm a", now);

      if (Number.isNaN(parsed.getTime())) {
        return null;
      }

      const candidate = set(now, {
        hours: parsed.getHours(),
        minutes: parsed.getMinutes(),
        seconds: 0,
        milliseconds: 0,
      });

      return candidate > now ? candidate : null;
    })
    .filter((candidate): candidate is Date => Boolean(candidate))
    .sort((a, b) => a.getTime() - b.getTime());

  const next = upcomingTimes[0];

  if (!next) {
    return "tomorrow morning";
  }

  const minutes = differenceInMinutes(next, now);

  if (minutes <= 1) {
    return "now";
  }

  if (minutes < 60) {
    return `in ${minutes} minutes`;
  }

  return `at ${format(next, "h:mm a")}`;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const context = resolveSeniorContext(user);
  const [
    activePrescriptions,
    recentEvents,
    latestCaregiverEvent,
    prescriptionCount,
    careEventCount,
    doseCount,
  ] = await Promise.all([
    db.prescription.findMany({
      where: { seniorId: context.seniorId, status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      take: 4,
    }),
    db.medicationEvent.findMany({
      where: { seniorId: context.seniorId },
      include: {
        prescription: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.caregiverEvent.findFirst({
      where: { seniorId: context.seniorId },
      orderBy: { createdAt: "desc" },
    }),
    db.prescription.count({ where: { seniorId: context.seniorId } }),
    db.caregiverEvent.count({ where: { seniorId: context.seniorId } }),
    db.medicationEvent.count({ where: { seniorId: context.seniorId } }),
  ]);

  const now = new Date();
  const primaryPrescription = activePrescriptions[0] ?? null;
  const latestTakenEvent = recentEvents.find((event) => event.status === "TAKEN") ?? null;
  const latestMissedEvent = recentEvents.find(
    (event) =>
      event.status === "MISSED" ||
      event.status === "NEEDS_REVIEW" ||
      event.verificationLabel?.toLowerCase().includes("mismatch")
  );
  const nextDoseLabel = primaryPrescription
    ? parseUpcomingDoseLabel(primaryPrescription.scheduleTimes, now)
    : "after you add a prescription";
  const lastTakenLabel = latestTakenEvent
    ? isSameDay(latestTakenEvent.createdAt, now)
      ? format(latestTakenEvent.createdAt, "h:mm a")
      : format(latestTakenEvent.createdAt, "MMM d • h:mm a")
    : "Not logged yet";
  const caregiverEmail =
    user.role === "SENIOR"
      ? user.careRelationshipsAsSenior[0]?.caregiver?.email ?? null
      : user.email;

  return (
    <main className="space-y-6 pb-8">
      <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(245,238,229,0.96))] p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
        <p className="text-base font-semibold uppercase tracking-[0.28em] text-emerald-700">
          Senior medication command center
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-5xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
              Hello, {user.name.split(" ")[0]}.
            </h2>
            <p className="mt-4 max-w-4xl text-2xl leading-10 text-stone-600">
              The dashboard now leads with one clear action, instant demo outcomes, and visible caregiver awareness.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-5 text-base leading-8 text-stone-700">
            <p className="font-semibold text-stone-900">Demo posture</p>
            <p>{user.demoMode ? "Demo mode is ON and ready for a 30-second walkthrough." : "Demo mode is OFF. Turn it on in the sidebar for instant results."}</p>
          </div>
        </div>
      </section>

      <DemoFlowPanel
        caregiverEmail={caregiverEmail}
        demoModeEnabled={user.demoMode}
        medicationName={
          primaryPrescription
            ? `${primaryPrescription.medicationName} • ${primaryPrescription.dosage}`
            : "No active prescription loaded"
        }
        nextDoseLabel={nextDoseLabel ?? "after you add a prescription"}
        prescriptionId={primaryPrescription?.id ?? ""}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Next dose",
            value: nextDoseLabel ?? "Set schedule",
            accent: "from-emerald-100 to-white",
            copy: primaryPrescription
              ? `${primaryPrescription.medicationName} is the next medication in the workflow.`
              : "Add a prescription to start the guided medication flow.",
          },
          {
            label: "Last taken",
            value: lastTakenLabel,
            accent: "from-sky-100 to-white",
            copy: latestTakenEvent
              ? `${latestTakenEvent.prescription.medicationName} was the most recent completed dose.`
              : "No completed medication event has been logged yet.",
          },
          {
            label: "Caregiver status",
            value: latestCaregiverEvent ? "Monitoring live" : "Standing by",
            accent: "from-amber-100 to-white",
            copy: latestCaregiverEvent
              ? `Last alert or note was sent ${format(latestCaregiverEvent.createdAt, "MMM d • h:mm a")}.`
              : "No caregiver notifications have been sent yet.",
          },
        ].map((card) => (
          <article
            key={card.label}
            className={`rounded-[1.75rem] border border-stone-200 bg-gradient-to-br ${card.accent} p-6 shadow-[0_16px_50px_rgba(87,68,48,0.08)]`}
          >
            <p className="text-base font-semibold uppercase tracking-[0.24em] text-stone-500">{card.label}</p>
            <p className="mt-5 text-4xl font-semibold tracking-tight text-stone-900">{card.value}</p>
            <p className="mt-4 text-base leading-8 text-stone-600">{card.copy}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold uppercase tracking-[0.24em] text-amber-700">
                System intelligence
              </p>
              <h3 className="mt-2 text-4xl font-semibold tracking-tight text-stone-900">
                Calm signals for the next important action
              </h3>
            </div>
            <span className="rounded-full bg-stone-900 px-5 py-3 text-base font-semibold text-white">
              Senior-friendly mode
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
              <p className="text-base font-semibold uppercase tracking-[0.22em]">Next dose in focus</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {primaryPrescription
                  ? `${primaryPrescription.medicationName} is due ${nextDoseLabel}.`
                  : "Add a medication plan to begin guided reminders."}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-5 text-sky-900">
              <p className="text-base font-semibold uppercase tracking-[0.22em]">Last taken at</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{lastTakenLabel}</p>
            </div>

            {latestMissedEvent ? (
              <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-rose-900">
                <p className="text-base font-semibold uppercase tracking-[0.22em]">Missed dose alert</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  ⚠️ {latestMissedEvent.prescription.medicationName} needs follow-up.
                </p>
                <p className="mt-3 text-lg leading-8">
                  The latest medication issue is already visible in the caregiver feed.
                </p>
              </div>
            ) : null}

            {latestMissedEvent?.status === "MISSED" || latestMissedEvent?.verificationLabel?.toLowerCase().includes("mismatch") ? (
              <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-rose-900">
                <p className="text-base font-semibold uppercase tracking-[0.22em]">Active alert banner</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  🚨 Caregiver has been notified
                </p>
              </div>
            ) : null}
          </div>
        </article>

        <article className="rounded-[2rem] border border-stone-200 bg-stone-900 p-8 text-stone-50 shadow-[0_18px_60px_rgba(87,68,48,0.16)]">
          <p className="text-base font-semibold uppercase tracking-[0.24em] text-stone-300">Caregiver visibility panel</p>
          <h3 className="mt-3 text-4xl font-semibold tracking-tight">A live window into the safety loop.</h3>
          <div className="mt-6 space-y-4">
            {[
              {
                label: "Caregiver email",
                value: caregiverEmail ?? "Not linked yet",
              },
              {
                label: "Last alert sent",
                value: latestCaregiverEvent ? format(latestCaregiverEvent.createdAt, "MMM d, yyyy • h:mm a") : "No alerts sent yet",
              },
              {
                label: "Monitoring status",
                value: caregiverEmail ? "Active monitoring" : "Awaiting caregiver connection",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] bg-white/10 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-300">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Prescriptions", value: prescriptionCount },
              { label: "Events", value: doseCount },
              { label: "Alerts", value: careEventCount },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.25rem] bg-white/10 p-4 text-center">
                <p className="text-sm uppercase tracking-[0.22em] text-stone-300">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
