import "server-only";

import type { User } from "@prisma/client";

type RelatedUser = User & {
  careRelationshipsAsSenior: Array<{
    caregiver: User;
  }>;
  careRelationshipsAsCaregiver: Array<{
    senior: User;
  }>;
};

export function resolveSeniorContext(user: RelatedUser) {
  if (user.role === "SENIOR") {
    return {
      seniorId: user.id,
      seniorName: user.name,
      caregiverName: user.careRelationshipsAsSenior[0]?.caregiver.name ?? null,
    };
  }

  const linkedSenior = user.careRelationshipsAsCaregiver[0]?.senior;

  return {
    seniorId: linkedSenior?.id ?? user.id,
    seniorName: linkedSenior?.name ?? "Linked senior",
    caregiverName: user.name,
  };
}
