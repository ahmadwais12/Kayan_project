import { PrismaClient } from "@prisma/client";
import { seedTranslations } from "./seed-translations.mjs";

try {
  process.loadEnvFile();
} catch {
  // .env is optional when variables are already exported.
}

const prisma = new PrismaClient();

async function main() {
  const result = await seedTranslations(prisma);
  console.log(
    `Translations seeded: ${result.rows} rows across ${result.entities} entities (fa + ps).`,
  );
  if (result.rows === 0) {
    console.log("Nothing translated — run `npm run db:seed` first so content exists.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
