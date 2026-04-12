import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { requireUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  await requireUser();

  return (
    <SectionPlaceholder
      description="This view will become the daily dose log with taken, missed, and needs-review states plus verification context."
      eyebrow="Dose Log"
      title="A simple timeline for every medication event"
    />
  );
}
