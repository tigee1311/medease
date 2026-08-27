import { existsSync } from "node:fs";
import path from "node:path";

const envFiles = [".env", ".env.local"];

/**
 * Loads `.env` and then `.env.local` for tooling that runs outside Next.js
 * (the Prisma CLI and the seed script). Values that are already present in the
 * real environment always win, which matches how Next.js resolves env files.
 */
export function loadEnvFiles(cwd: string = process.cwd()) {
  const inherited = { ...process.env };

  for (const file of envFiles) {
    const fullPath = path.join(cwd, file);

    if (existsSync(fullPath)) {
      process.loadEnvFile(fullPath);
    }
  }

  Object.assign(process.env, inherited);
}
