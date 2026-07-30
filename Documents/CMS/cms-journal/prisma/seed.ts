import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

const SALT_ROUNDS = 12;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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
    hash("admin123", SALT_ROUNDS),
    hash("editeur123", SALT_ROUNDS),
    hash("journaliste123", SALT_ROUNDS),
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
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
