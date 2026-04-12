import { requireUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_20px_80px_rgba(87,68,48,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Authenticated</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900">
          Hello, {user.name.split(" ")[0]}.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
          Your account is active. Next, this space will become the senior-friendly medication dashboard with prescriptions, dose verification, and caregiver visibility.
        </p>
      </div>
    </main>
  );
}
