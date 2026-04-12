import "server-only";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { getSessionUser } from "./session";

export async function getCurrentUser() {
  const session = await getSessionUser();

  if (!session) {
    return null;
  }

  return db.user.findUnique({
    where: { id: session.sub },
    include: {
      careRelationshipsAsSenior: {
        include: {
          caregiver: true,
        },
      },
      careRelationshipsAsCaregiver: {
        include: {
          senior: true,
        },
      },
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
