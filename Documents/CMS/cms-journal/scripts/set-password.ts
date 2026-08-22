/**
 * Change le mot de passe d'un compte, ou liste les comptes existants.
 *
 *   npm run users                                   → liste les comptes
 *   npm run user:password -- admin@cms.fr           → génère un mot de passe fort
 *   npm run user:password -- admin@cms.fr 'MonMdp!' → applique celui fourni
 *
 * Le mot de passe n'est jamais écrit dans le dépôt : il s'affiche une seule
 * fois dans le terminal, puis seul son empreinte bcrypt est stockée.
 */
import { randomBytes } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

const SALT_ROUNDS = 12;
const MIN_LENGTH = 8;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function generatePassword(): string {
  // 18 caractères base64url : suffisant sans être impossible à recopier.
  return randomBytes(14).toString("base64url");
}

async function list(): Promise<void> {
  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { id: "asc" },
  });

  if (users.length === 0) {
    console.log("Aucun compte en base.");
    return;
  }

  console.log("\nComptes existants :\n");
  for (const user of users) {
    const state = user.isActive ? "actif" : "désactivé";
    console.log(`  ${String(user.id).padStart(3)}  ${user.email.padEnd(28)} ${user.role.nomRole.padEnd(15)} ${state}`);
  }
  console.log("\nChanger un mot de passe :  npm run user:password -- <email> [motdepasse]\n");
}

async function setPassword(email: string, provided?: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });

  if (!user) {
    console.error(`Aucun compte avec l'adresse « ${email} ».`);
    console.error("Lister les comptes :  npm run users");
    process.exitCode = 1;
    return;
  }

  if (provided && provided.length < MIN_LENGTH) {
    console.error(`Mot de passe trop court : ${MIN_LENGTH} caractères minimum.`);
    process.exitCode = 1;
    return;
  }

  const password = provided ?? generatePassword();
  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hash(password, SALT_ROUNDS) },
  });

  console.log(`\nMot de passe mis à jour — ${user.prenom} ${user.nom} (${user.role.nomRole})`);
  console.log(`  Identifiant : ${user.email}`);
  if (!provided) {
    console.log(`  Mot de passe : ${password}`);
    console.log("\n  Notez-le maintenant : il ne sera plus affiché.\n");
  } else {
    console.log("");
  }
}

async function main(): Promise<void> {
  const [email, password] = process.argv.slice(2);
  if (!email) {
    await list();
    return;
  }
  await setPassword(email, password);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
