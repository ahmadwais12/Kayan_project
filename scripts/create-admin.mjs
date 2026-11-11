import { PrismaClient } from "@prisma/client";
import { hash, Algorithm } from "@node-rs/argon2";
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

try {
  process.loadEnvFile();
} catch {
  // Environment may already be exported.
}

const prisma = new PrismaClient();

const args = process.argv.slice(2);
function arg(name) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}

async function main() {
  const email = (arg("email") || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const name = (arg("name") || process.env.ADMIN_NAME || "Kayan Administrator").trim();
  let password = arg("password") || process.env.ADMIN_PASSWORD || "";

  if (!email) throw new Error("Provide --email or ADMIN_EMAIL.");
  if (password && password.length < 12) throw new Error("Password must be at least 12 characters.");

  let generated = false;
  if (!password) {
    password = `Kl-${randomBytes(12).toString("base64url")}Aa1!`;
    generated = true;
  }

  const role = await prisma.role.findUnique({ where: { slug: "super-admin" } });
  if (!role) throw new Error("Run `npm run db:seed` first to create roles.");

  const passwordHash = await hash(password, {
    algorithm: Algorithm.Argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    throw new Error(`An administrator with ${email} already exists.`);
  }

  await prisma.adminUser.create({
    data: { email, name, passwordHash, roleId: role.id },
  });

  if (generated) {
    const file = ".admin-credentials.txt";
    writeFileSync(file, `email: ${email}\npassword: ${password}\ncreated: ${new Date().toISOString()}\n`);
    console.log(`Super admin created. Generated password written to ${file} (move it to a password manager and delete the file).`);
  } else {
    console.log("Super admin created with the supplied password.");
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
