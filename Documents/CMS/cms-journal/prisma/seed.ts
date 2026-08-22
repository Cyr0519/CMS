import { randomBytes } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

const SALT_ROUNDS = 12;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const generated: Array<[string, string]> = [];

/**
 * Mot de passe d'amorçage : fourni par l'environnement, sinon la valeur de
 * démonstration en développement, sinon une valeur aléatoire affichée une fois.
 * Aucun compte de production ne peut ainsi hériter d'un mot de passe connu.
 */
function seedPassword(variable: string, devFallback: string): string {
  const fromEnv = process.env[variable];
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return devFallback;

  const value = randomBytes(14).toString("base64url");
  generated.push([variable, value]);
  return value;
}

async function main(): Promise<void> {
  const [administrateur, editeur, journaliste] = await Promise.all([
    prisma.role.upsert({
      where: { nomRole: "administrateur" },
      update: {},
      create: { nomRole: "administrateur" },
    }),
    prisma.role.upsert({
      where: { nomRole: "editeur" },
      update: {},
      create: { nomRole: "editeur" },
    }),
    prisma.role.upsert({
      where: { nomRole: "journaliste" },
      update: {},
      create: { nomRole: "journaliste" },
    }),
  ]);

  const [adminPassword, editeurPassword, journalistePassword] = await Promise.all([
    hash(seedPassword("SEED_ADMIN_PASSWORD", "admin123"), SALT_ROUNDS),
    hash(seedPassword("SEED_EDITEUR_PASSWORD", "editeur123"), SALT_ROUNDS),
    hash(seedPassword("SEED_JOURNALISTE_PASSWORD", "journaliste123"), SALT_ROUNDS),
  ]);

  await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@cms.fr" },
      update: {},
      create: {
        roleId: administrateur.id,
        nom: "Admin",
        prenom: "Super",
        email: "admin@cms.fr",
        password: adminPassword,
      },
    }),
    prisma.user.upsert({
      where: { email: "editeur@cms.fr" },
      update: {},
      create: {
        roleId: editeur.id,
        nom: "Dupont",
        prenom: "Editeur",
        email: "editeur@cms.fr",
        password: editeurPassword,
      },
    }),
    prisma.user.upsert({
      where: { email: "journaliste@cms.fr" },
      update: {},
      create: {
        roleId: journaliste.id,
        nom: "Martin",
        prenom: "Journaliste",
        email: "journaliste@cms.fr",
        password: journalistePassword,
      },
    }),
  ]);

  await Promise.all([
    prisma.category.upsert({
      where: { nom: "Politique" },
      update: {},
      create: { nom: "Politique" },
    }),
    prisma.category.upsert({
      where: { nom: "Economie" },
      update: {},
      create: { nom: "Economie" },
    }),
  ]);
}

main()
  .then(() => {
    if (generated.length === 0) return;
    console.log("");
    console.log("Mots de passe générés pour cette installation (notez-les, ils ne seront plus affichés) :");
    for (const [variable, value] of generated) {
      console.log(`  ${variable.replace("SEED_", "").replace("_PASSWORD", "").toLowerCase()} : ${value}`);
    }
    console.log("");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
