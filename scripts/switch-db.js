/**
 * Database Switcher Script
 * Allows seamless switching between local SQLite (for offline/local dev)
 * and PostgreSQL (for Neon / Production on Vercel).
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const mode = process.argv[2]?.toLowerCase() || "postgres";

const prismaDir = path.join(__dirname, "..", "prisma");
const targetSchema = path.join(prismaDir, "schema.prisma");

if (mode === "sqlite") {
  console.log("🔄 Switching Prisma to SQLite (local file: dev.db)...");
  const sqliteSchema = path.join(prismaDir, "schema.sqlite.prisma");
  if (!fs.existsSync(sqliteSchema)) {
    console.error("❌ schema.sqlite.prisma not found!");
    process.exit(1);
  }
  fs.copyFileSync(sqliteSchema, targetSchema);
  console.log("✅ Copied schema.sqlite.prisma -> schema.prisma");

  try {
    console.log("📦 Pushing schema to local SQLite dev.db...");
    execSync("npx prisma db push", { stdio: "inherit" });
    console.log("✨ Successfully switched to SQLite for local testing!");
    console.log("👉 Run 'npm run dev' to test with local SQLite.");
  } catch (e) {
    console.warn("⚠️ Prisma db push warning:", e.message);
  }
} else {
  console.log("🔄 Ensuring Prisma is set to PostgreSQL (Production / Neon)...");
  const postgresSchema = path.join(prismaDir, "schema.postgresql.prisma");
  if (!fs.existsSync(postgresSchema)) {
    console.error("❌ schema.postgresql.prisma not found!");
    process.exit(1);
  }
  fs.copyFileSync(postgresSchema, targetSchema);
  console.log("✅ Set schema.prisma to PostgreSQL.");
}
