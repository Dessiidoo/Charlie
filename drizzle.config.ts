import { defineConfig } from "drizzle-kit";

const FALLBACK_DATABASE_URL =
  "postgres://postgres:postgres@127.0.0.1:1/placeholder";

const databaseUrl = process.env.DATABASE_URL ?? FALLBACK_DATABASE_URL;

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Using a placeholder connection string; commands that talk to the database will fail until it is configured.",
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
