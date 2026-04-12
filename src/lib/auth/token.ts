import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "medease_session";

export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  role: "SENIOR" | "CAREGIVER";
};

const encoder = new TextEncoder();

function getSecret() {
  return encoder.encode(process.env.AUTH_SECRET ?? "medease-dev-secret-change-me");
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionUser;
  } catch {
    return null;
  }
}
