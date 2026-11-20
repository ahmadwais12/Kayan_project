# Kayan Land — Project Documentation

Production website and content management system for **Kayan Land Architecture & Construction Company**.
Tagline: *Where Beauty and Functionality Unite in Design.*

- Public website: marketing pages, portfolio, journal, gallery, team, FAQs, contact and quote forms.
- Admin console: full content management, inquiries, media library, users and roles, SEO, analytics, audit log.
- Database: **MySQL only**, accessed through Prisma. No external CMS or BaaS.

---

## 1. Technology stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Server Components, Server Actions) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + custom design tokens in `app/globals.css` |
| UI primitives | Radix UI (dialog, dropdown, tabs, select, checkbox, accordion) and local shadcn-style components |
| Icons | Lucide (brand glyphs are custom SVGs in `components/public/social-icon.tsx`) |
| Animation | Framer Motion (`Reveal` respects reduced-motion) |
| Charts | Recharts |
| Forms | Native form actions + `useActionState`, Zod validation on the server |
| Auth | Custom sessions with Argon2id hashing (`@node-rs/argon2`), opaque cookie tokens |
| ORM | Prisma 6 |
| Database | MySQL 8 |
| Images | `sharp` (WebP conversion + thumbnails) and `next/image` for local media |
| Markdown | `react-markdown` + `remark-gfm` (raw HTML disabled) |
| Email | Resend HTTP API, optional |

---

## 2. Repository layout

```text
app/
  (public)/            Public website (route group owns the site chrome)
    page.tsx           Home page, section by section from the database
    about/             Studio, values, process, timeline, team preview
    services/          List + [slug] detail
    projects/          List (search, category, pagination) + [slug] detail
      [slug]/qr/       Server-generated SVG QR code for the project URL
    team/              List + [slug] profile
    gallery/           Media grid with lightbox
    blog/              List + [slug] article
    contact/           Contact form with attachments
    quote/             Project brief form
    faq/               Grouped FAQ page
    privacy/ terms/    CMS-managed legal pages
    layout.tsx         Header, footer, Organization JSON-LD
  admin/
    login/ forgot-password/ reset-password/
    (dashboard)/       Authenticated console (all modules), including notifications and social-link management
  api/
    admin/…            Authenticated exports, uploads, private attachments
    analytics/view     First-party page-view endpoint
    media/[...path]    Serves public uploads from storage
  sitemap.ts robots.ts Metadata routes driven by site settings
actions/               Server actions (auth, content, users, public forms)
components/
  public/              Site components
  admin/               Console components
  ui/                  Base UI kit
lib/
  auth/                Password hashing, sessions, guards, permissions
  prisma.ts storage.ts mail.ts rate-limit.ts seo.tsx settings.ts …
prisma/
  schema.prisma        Data model
  migrations/          SQL migrations
  seed.mjs             Idempotent baseline content and roles
scripts/
  create-admin.mjs     Create or reset a super admin
storage/
  uploads/             Public media (served through /api/media)
  private/             Inquiry attachments (admin-only download route)
docs/                  This documentation set
proxy.ts               Node-runtime proxy: /admin cookie gate and database redirects
```

---

## 3. Rendering model

- Every public page is `dynamic = "force-dynamic"` because content is database-driven and must reflect CMS edits immediately.
- Admin pages are authenticated on the server with `requireAdmin()` / `requirePermission()`.
- `proxy.ts` performs a fast cookie-presence check for `/admin/*` and redirects anonymous visitors to the login page. It also looks up active `Redirect` rows from MySQL (cached in memory for 15 seconds) and answers matching GET/HEAD requests with the configured status code. It is a routing convenience only; real authorization always happens in the page, action, or route handler.
- Server Actions validate input with Zod, write audit entries for administrative changes, and redirect with a flash message.
- Draft previews: a signed-in administrator with the relevant `*.manage` permission can append `?preview=1` to a project, service, or article URL (the editors link to it as **Preview page**). The page then includes unpublished records, renders a preview banner, and emits `noindex`. Anonymous visitors still receive a 404.
- Route-level states: `app/not-found.tsx` and `app/(public)/not-found.tsx` render a styled 404, `app/error.tsx` is the client error boundary, and `loading.tsx` files provide skeletons for the public site and console.

### Public UI and motion

Motion is CSS-first so that above-the-fold content is painted without waiting for JavaScript; interactive extras are small client islands.

| Element | Component / class | Behavior |
| --- | --- | --- |
| Page transitions | `app/(public)/template.tsx` | Each public navigation fades up the new route content. |
| Scroll progress | `components/public/scroll-progress.tsx` | 2px bar fixed under the header, updated with a rAF-throttled scroll listener. |
| Back to top | `components/public/back-to-top.tsx` | Appears after 640px of scroll, smooth-scrolls to the top. |
| Animated statistics | `components/public/count-up.tsx` | Counts numeric values once in view via `IntersectionObserver`; non-numeric values render unchanged. |
| Hero and scroll cue | `app/globals.css`, `components/public/scroll-cue.tsx` | Slow image zoom, staggered text reveal, animated scroll indicator, discipline marquee band. |
| Testimonials | `components/public/testimonial-carousel.tsx` | Embla carousel with autoplay (paused on hover/focus), arrows and dots, optional client photo. |
| Project layout | `components/public/project-browser.tsx` | Table/grid switch persisted in `localStorage`, with Table as the default; renders the same server-fetched projects. |
| Gallery lightbox | `components/public/gallery-lightbox.tsx` | Keyboard navigation plus zoom (`+`/`-`/`0` or click), with zoom reset per slide. |

All motion respects `prefers-reduced-motion`: `CountUp` jumps to the target value, the carousel stops autoplaying, and smooth scrolling falls back to an instant jump.

---

## 4. Content model overview

All visible content is managed in the console:

| Area | Managed through |
| --- | --- |
| Company identity, logo, contact details, social links | Settings → General / Branding / Contact / Social |
| Header and footer menus | Settings → Navigation / Footer |
| Home page sections (hero, about, services, projects, why, stats, process, testimonials, blog, CTA) | Home Page |
| About page supporting content (mission, vision, values, process, timeline, statistics, why choose us) | Home Page → `mission` / `vision`, About Page, Process & Values, Company Timeline |
| Services, categories, features, FAQs, galleries | Services |
| Projects, categories, galleries, videos, specifications, features, tags, before/after | Projects |
| Team members and departments | Team Members, Departments |
| Journal posts, authors, categories, tags | Blog Posts |
| Gallery categories and media | Gallery |
| Testimonials | Testimonials |
| FAQs and FAQ categories | FAQs |
| Privacy policy and terms | Home Page → `privacy` / `terms` sections (Markdown) |
| SEO title, description, social image, canonical base, robots policy, verification codes | Settings → SEO |
| Contact and quote submissions, notes, attachments, statuses | Contact Inquiries, Quote Requests |
| Newsletter subscribers and CSV export | Newsletter |
| Media library | Media Library |

Home page section keys used by the layout and legal pages: `hero`, `about`, `services`, `projects`, `why`, `stats`, `process`, `testimonials`, `blog`, `cta`, `privacy`, `terms`. The About page additionally reads the `mission` and `vision` sections when both are enabled.

If an optional section has no data, the public site omits it or shows an explicit empty state. Placeholder records in the seed are labelled as samples — replace them with verified company content before launch.

---

## 5. Authentication and roles

- Passwords are hashed with **Argon2id** (`lib/auth/password.ts`).
- On login a random 32-byte token is issued. Only its SHA-256 hash is stored in `AdminSession`; the raw token lives in the httpOnly, sameSite=lax `kayan_session` cookie (`secure` in production).
- Sessions last 7 days. Password changes and account deactivation revoke stored sessions.
- Failed logins and public form submissions are rate-limited in memory per IP.
- Password reset uses single-use, hashed, expiring tokens. Delivery requires email configuration (see below).
- Every administrative mutation is written to `AuditLog` with actor, action, entity, IP address, and user agent.

### Roles and permissions

| Role | Default access |
| --- | --- |
| Super Admin | All permissions, including users and roles |
| Admin | All content, media, inquiries, settings; no user administration by default |
| Content Manager | Content modules and media |
| Editor | Content editing modules |

Permissions are stored in the database and can be re-assigned per role. System roles keep their slugs. The last active Super Admin cannot be deactivated or deleted, and administrators cannot deactivate themselves or change their own role.

---

## 6. Public forms

| Form | Server action | Safeguards |
| --- | --- | --- |
| Contact | `actions/public.ts` → `submitContact` | Zod validation, honeypot `company`, per-IP rate limit, up to 3 attachments |
| Quote | `actions/public.ts` → `submitQuote` | Same safeguards; project types come from published services |
| Newsletter | `actions/public.ts` → `subscribeNewsletter` | Email validation, honeypot, hourly rate limit, duplicate-safe upsert |

Attachments accept PDF, JPG, PNG, and WebP up to 10 MB. File type is verified by magic bytes (`%PDF-` signature or `sharp` metadata), not only by the browser-provided MIME type. Attachments are stored under `storage/private` and downloaded through an authenticated route, so they are never publicly addressable.

Every new contact inquiry and quote request also creates an in-app notification for each active administrator (`AdminNotification`); the console bell and Notifications page read and clear them. When `RESEND_API_KEY` is configured, new inquiries additionally trigger an email. Without it, submissions are still stored and shown in the console.

---

## 7. Media and storage

- Admin image uploads are validated with `sharp`, resized to a maximum width of 2400 px, converted to WebP, and given a 640 px thumbnail. Limit: 8 MB.
- Public uploads live in `storage/uploads` (override the base directory with `STORAGE_DIR`) and are served through `/api/media/[...path]`.
- Inquiry attachments live in `storage/private` and are only reachable through `/api/admin/inquiries/attachments/[id]`.
- Media metadata (URL, thumbnail, dimensions, size, MIME type, folder, alt text) is stored in MySQL; binaries are stored on disk, not in the database.

---

## 8. SEO

- `lib/seo.tsx` builds canonical URLs, Open Graph and Twitter metadata, and JSON-LD scripts.
- Structured data is emitted for Organization (site layout), WebSite (home), Service, CreativeWork/project, Article, BreadcrumbList, and FAQPage.
- `app/sitemap.ts` lists static pages plus published services, projects, team profiles, blog posts, and legal pages that have content.
- `app/robots.ts` respects the `robotsPolicy` saved in SEO settings. If the policy contains `noindex` or `none`, crawling is disallowed entirely; otherwise `/admin` and `/api` are excluded.
- Site title, default description, social image, canonical base, and verification codes are editable in Settings → SEO. Set the canonical base to the production origin before launch.
- Settings → SEO includes an **SEO health** panel (`lib/seo-audit.ts`) that reports the current robots policy, canonical base, sitemap URL, indexable page count, missing image alt text, missing titles/descriptions, duplicate titles, and broken internal links. It is advisory: it never blocks saving.
- Settings → **Redirects** manages `Redirect` records. Each rule has a source path, destination (internal path or absolute URL), status code (301/302/307/308), and an active switch. Sources must be unique, start with `/`, and cannot target `/admin`, `/api`, or `_next`. Rules are enforced by `proxy.ts`; changes take effect within about 15 seconds because of the cache.

---

## 9. Analytics

First-party only, two ingestion endpoints:

1. `components/public/analytics-tracker.tsx` (mounted once in the root layout) posts the current public path, page title, page type and session id to `/api/analytics/view` on load and on client-side navigations.
2. The same tracker observes every element carrying `data-card-type` and `data-card-id` (project, service and article cards, plus the six sections of a project detail page labelled `PROJECT_PART`). An `IntersectionObserver` records one `VIEW` per card per browser session when at least half the card is visible; a delegated click listener records `CLICK` events.
3. Events are queued in memory and flushed in batches every 900 ms, and on `pagehide`/tab hide with `navigator.sendBeacon`, so tracking never blocks rendering or navigation.
4. `/api/analytics/view` and `/api/analytics/card` validate input, reject bots and private paths (`/admin`, `/api`, `_next`), rate-limit per visitor, and always answer `204`; a tracking failure never surfaces to the visitor.
5. Views are stored in `PageView`; card and section engagement in `CardEvent`. Identity is the signed-in administrator (`userId`/`userName`) when present, otherwise the random `kl_vid` cookie plus a session id and a salted SHA-256 hash of the IP address — raw IPs are never stored.
6. The console summarises 7/30/90-day ranges: overview cards (visits, unique visitors, most viewed page, card engagement), page and project-section breakdown, top cards with views/clicks/CTR, a recent visitor log, daily traffic, devices, countries and referrers.

Country is derived only from an edge/CDN header (`x-vercel-ip-country`, `cf-ipcountry`, or `x-country-code`) when present; otherwise it is stored as null. Configure your proxy or platform to send one of these headers if you want the country report.

The tracker does not collect names, emails, or precise location.

---

## 10. Scripts

```bash
npm run dev            # development server
npm run build          # production build
npm run start          # production server
npm run lint           # ESLint
npm run typecheck      # TypeScript (tsc --noEmit)
npm test               # Vitest unit suite
npm run db:migrate     # create/apply migrations in development
npm run db:deploy      # apply migrations in production
npm run db:seed        # seed roles, permissions, navigation, baseline content
npm run db:studio      # Prisma Studio
npm run db:reset       # drop, recreate, migrate, seed (destructive)
npm run admin:create   # create a new super admin (see below)
```

Create an administrator with a known password:

```bash
npm run admin:create -- --email you@example.com --name "Your Name" --password "a-long-password"
```

Omit `--password` to generate one and write it to `.admin-credentials.txt` in the project root. Move the password to a password manager and delete that file. The script refuses to overwrite an existing email; use the admin console to edit an account or change its password.

Unit tests use Vitest in a Node environment (`vitest.config.ts`, `lib/**/*.test.ts`). They cover validation schemas and honeypot logic, role presets and wildcard permissions, the in-memory rate limiter, string/date helpers, and Argon2 hashing. They do not touch the database, so they can run in CI without MySQL.

---

## 11. Known limitations and launch checklist

- **Placeholder content:** seeded projects, statistics, and company details are marked as samples. Replace them with verified information; the system deliberately does not invent facts.
- **Email:** notification and reset emails require `RESEND_API_KEY` and a verified `EMAIL_FROM`. Without them, inquiries are still stored but no email is sent.
- **Rate limiting:** counters are held in process memory. Behind multiple instances, use a shared store (for example Redis) for strict global limits.
- **Redirects:** rules are matched by exact path in `proxy.ts` after trailing-slash normalisation. They do not support wildcards, query strings, or per-language matching; use the web-server configuration for pattern-based rules.
- **Country analytics:** country is populated only when the deployment supplies a geo header; without one the report shows “Unavailable”.
- **Legal pages:** privacy and terms are editable drafts. Have them reviewed by a qualified adviser before publication.
- Set `APP_URL` and the SEO canonical base to the production origin.
- Serve the site over HTTPS so session cookies are marked `secure`.
- Back up both MySQL and the `storage/` directory; they form a single content set.

See `DEPLOYMENT_GUIDE.md` for setup, `ADMIN_GUIDE.md` for daily use, and `DATABASE_DOCUMENTATION.md` for the schema.
