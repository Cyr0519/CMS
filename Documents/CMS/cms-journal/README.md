This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Grace Info — CMS Journal

CMS de gestion de contenu pour petite rédaction (5 journalistes max).

## Stack
- Next.js 15 (App Router)
- TypeScript
- Prisma + PostgreSQL
- TailwindCSS
- JWT (jose)

## Prérequis
- Node.js 20+
- Compte [Neon](https://neon.tech) (gratuit) ou PostgreSQL local

## Installation

```bash
# 1. Copier les variables d'environnement
cp .env.example .env

# 2. Remplir .env avec ta DATABASE_URL et JWT_SECRET

# 3. Installer les dépendances
npm install

# 4. Créer les tables
npx prisma migrate dev

# 5. Injecter les données de test
npx prisma db seed

# 6. Lancer
npm run dev
