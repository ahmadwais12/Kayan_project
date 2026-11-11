# Kayan Land Architecture & Construction

Website and admin CMS for Kayan Land Architecture & Construction — *Where Beauty and Functionality Unite in Design.*

A single Next.js application serving the public site and a protected content console. All site content (pages, projects, services, team, blog, gallery, homepage sections, SEO, navigation, and settings) is managed in the CMS; there is no hardcoded marketing copy.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 6 · MySQL 8 · Server Actions · Argon2id sessions

## Getting started

```bash
cp .env.example .env      # set DATABASE_URL and SHADOW_DATABASE_URL
npm ci
npx prisma generate
npm run db:migrate        # or db:deploy in an existing environment
npm run db:seed
npm run dev
```

Open <http://localhost:3333>. The admin console is at `/admin`. The seeded super admin signs in with **admin.2025@gmail.com** / **admin@123** — change the password after the first sign-in, or set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` before seeding to use your own. The same seed also creates one account per role: `manager@kayanland.local` (Admin), `content@kayanland.local` (Content Manager), and `editor@kayanland.local` (Editor). They use `SEED_STAFF_PASSWORD` when set, otherwise `SEED_ADMIN_PASSWORD`, otherwise the development default. Existing accounts are never given a new password by the seed. Alternatively create a separate account with `npm run admin:create -- --email you@example.com --name "Your Name"`; its password is written once to `.admin-credentials.txt`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server with Turbopack. |
| `npm run build` / `npm run start` | Production build and serve. |
| `npm run typecheck` | TypeScript check without emitting. |
| `npm run lint` | ESLint. |
| `npm test` | Unit tests (Vitest). |
| `npm run db:migrate` | Create and apply a migration (development). |
| `npm run db:deploy` | Apply committed migrations (production). |
| `npm run db:seed` | Roles, admin accounts, settings, starter content, and Dari/Pashto translations. |
| `npm run db:seed:i18n` | Refresh only the Dari/Pashto translations for existing content. |
| `npm run db:studio` | Prisma Studio. |
| `npm run admin:create` | Add an administrator with a chosen or generated password. |

## Documentation

- [Project documentation](docs/PROJECT_DOCUMENTATION.md) — architecture, rendering model, content model, functionality.
- [Database documentation](docs/DATABASE_DOCUMENTATION.md) — tables, relations, enums, migrations, backups.
- [Admin guide](docs/ADMIN_GUIDE.md) — day-to-day editing, publishing, inquiries, roles, settings.
- [Deployment guide](docs/DEPLOYMENT_GUIDE.md) — MySQL setup, environment, storage, proxy, backups, troubleshooting.

## Notes

- Uploaded media is stored on disk (`storage/`), not in MySQL, with only file metadata in the database.
- Content requiring verified company facts (address, phone, founding year, project counts, certifications) ships as clearly marked placeholders. Replace them through the admin before launch.
- Outbound email requires `RESEND_API_KEY`; without it forms still store submissions and skip notifications.
