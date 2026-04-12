import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE, verifySessionToken } from "./token";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
