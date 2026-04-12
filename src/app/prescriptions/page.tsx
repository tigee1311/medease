import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { requireUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function PrescriptionsPage() {
  await requireUser();

  return (
    <SectionPlaceholder
      description="Medication cards, dosing instructions, and refill timing will live here with senior-friendly spacing and quick actions."
      eyebrow="Prescriptions"
      title="Medication plans at a glance"
    />
  );
}
