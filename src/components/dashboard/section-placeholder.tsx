export function SectionPlaceholder({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">{eyebrow}</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900">{title}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">{description}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          "Large buttons and short paths keep each task quick to complete.",
          "The next commit will connect this area to real medication data.",
          "Caregiver-friendly summaries will mirror the senior experience.",
        ].map((copy) => (
          <div key={copy} className="rounded-3xl bg-stone-50 p-5 text-sm leading-7 text-stone-600">
            {copy}
          </div>
        ))}
      </div>
    </section>
  );
}
