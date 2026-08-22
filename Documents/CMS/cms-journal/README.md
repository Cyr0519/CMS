# Grace Info — CMS éditorial

CMS de gestion de contenu pour une petite rédaction : rédaction d'articles,
circuit de validation, modération des commentaires et site public de lecture.

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Prisma 7 + PostgreSQL
- Tailwind CSS 4
- Authentification par JWT (jose), cookie httpOnly

## Rôles et permissions

| Rôle | Peut faire |
| --- | --- |
| Journaliste | Rédiger ses articles, les envoyer à validation |
| Éditeur | Relire, publier ou refuser, modérer les commentaires |
| Administrateur | Tout, plus la gestion des utilisateurs et des catégories |

---

## Installation

```bash
# 1. Variables d'environnement
cp .env.example .env      # puis renseigner DATABASE_URL et JWT_SECRET

# 2. Dépendances
npm install

# 3. Schéma de base
npx prisma migrate dev

# 4. Jeu de données de démonstration
npx prisma db seed

# 5. Démarrage
npm run dev               # http://localhost:3000
```

Comptes créés par le seed en développement : `admin@cms.fr` / `admin123`,
`editeur@cms.fr` / `editeur123`, `journaliste@cms.fr` / `journaliste123`.
Ces valeurs ne servent qu'en local : voir « Comptes et mots de passe » plus bas.

---

## Déploiement

```bash
npm ci
npx prisma migrate deploy   # applique les migrations sans rien réinitialiser
npm run build
npm run start               # écoute sur $PORT (3000 par défaut)
```

Variables requises en production : `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.

### Comptes et mots de passe

Le site public **ne comporte aucun lien vers l'espace de rédaction** : on y accède
par l'URL directe `/login`.

```bash
npm run users                                    # lister les comptes et leurs rôles
npm run user:password -- admin@cms.fr            # génère un mot de passe fort et l'affiche
npm run user:password -- admin@cms.fr 'MonMdp!'  # ou en imposer un (8 caractères minimum)
```

Le mot de passe n'est affiché qu'une fois puis stocké haché (bcrypt, 12 tours).
**À faire avant la mise en ligne** : changer les trois mots de passe issus du
seed, et supprimer depuis l'interface les comptes de démonstration inutilisés.

Sur une nouvelle installation, `prisma db seed` lit `SEED_ADMIN_PASSWORD`,
`SEED_EDITEUR_PASSWORD` et `SEED_JOURNALISTE_PASSWORD`. Si elles sont absentes
avec `NODE_ENV=production`, des mots de passe aléatoires sont générés et affichés
une seule fois : aucun compte de production ne peut hériter de `admin123`.

### Stockage des images (VPS)

Les fichiers téléversés sont écrits sur le disque, dans `public/uploads/AAAA/MM/`,
et servis directement par le serveur Next. Sur un VPS c'est le fonctionnement
attendu — rien à configurer. Trois précautions :

- `public/uploads/` est exclu de Git : ce dossier fait partie des **données**,
  au même titre que la base. Il doit être inclus dans la sauvegarde.
- Un déploiement par `git pull` ne touche pas au dossier ; en revanche un
  déploiement qui reconstruit le projet ailleurs puis remplace le répertoire doit
  conserver ou remonter `public/uploads/`.
- Si vous passez un jour à `output: "standalone"`, il faut copier `public/` (donc
  les uploads) à côté du serveur autonome, sans quoi les images ne sont plus servies.

Limites appliquées à l'envoi : JPG, PNG ou WebP, 5 Mo par fichier.

### Base de données

Les lectures groupées sont exécutées en parallèle et non dans une transaction :
c'est ce qui évite les erreurs `P2028` quand la latence de la base est élevée.
Les écritures multi-tables restent transactionnelles.

---

## Design system

L'interface repose sur un jeu de jetons unique, déclaré dans
`src/app/globals.css` (`@theme`). Ne pas écrire de couleur, de rayon ou de
taille de texte en dur dans un composant : tout passe par ces jetons.

| Famille | Jetons |
| --- | --- |
| Surfaces | `canvas`, `surface`, `surface-soft`, `surface-sunken`, `surface-dark` |
| Lignes | `line`, `line-strong` |
| Texte | `ink`, `ink-soft`, `ink-muted`, `ink-inverse` |
| Marque | `brand`, `brand-hover`, `brand-soft`, `brand-ink` |
| Sémantique | `success`, `warning`, `error`, `info` (+ variantes `-soft`) |
| Engagement | `like`, `like-soft` — le rouge du cœur, distinct du rouge d'erreur |
| Typographie | `caption` 11 · `label` 12 · `body-sm` 13 · `body` 14 · `h3` 16 · `h2` 19 · `h1` 24 · `display` 32 |

Deux familles typographiques seulement : **Inter** (interface, chiffres) et
**Plus Jakarta Sans** (titres, via `font-display`).

### Composants

```text
src/components/
  ui/           Button, ButtonLink, IconButton, Input, Select, Textarea, Field,
                Badge, Card, Panel, Modal, Dropdown, Tooltip, Table, Pagination,
                Avatar, Skeleton, Toast, EmptyState, ErrorState, Icon
  dashboard/    StatStrip, PipelineChart, ActivityList
  <racine>      DashboardShell, Sidebar, Header, PageHeader, ArticleEditor, …
```

Règles de travail :

- **Icônes** : uniquement `<Icon name="…" />`. Toute nouvelle icône s'ajoute dans
  `src/components/ui/Icon.tsx`, jamais depuis une autre bibliothèque ni en emoji.
- **Tableaux** : `<Table>` se replie tout seul en liste de cartes sous `md`.
  Marquer `secondary: true` sur une colonne pour la masquer sous `lg`.
- **États** : tout écran qui charge des données doit couvrir `loading`
  (`Skeleton`), `empty` (`EmptyState`) et `error` (`ErrorState`).
- **Titre de page** : rendu par la barre supérieure à partir de l'URL
  (`src/lib/navigation.ts`). Une page n'affiche pas son propre `h1`.

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | ESLint |
| `npm run users` | Liste les comptes et leurs rôles |
| `npm run user:password -- <email> [mdp]` | Change un mot de passe |
