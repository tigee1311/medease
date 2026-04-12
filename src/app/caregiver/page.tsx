import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { requireUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function CaregiverPage() {
  await requireUser();

  return (
    <SectionPlaceholder
      description="Alerts, check-ins, and reassurance summaries will appear here so caregivers can see what needs attention quickly."
      eyebrow="Caregiver Feed"
      title="Shared visibility without extra phone calls"
    />
  );
}
