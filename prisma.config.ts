import path from "node:path";

import { defineConfig } from "prisma/config";

import { loadEnvFiles } from "./prisma/load-env";

loadEnvFiles();

const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  // `prisma generate` runs on install, before `.env` exists on a fresh clone, so
  // the datasource is only declared once DATABASE_URL is available. Migration
  // and introspection commands still require it and report it when it is unset.
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
