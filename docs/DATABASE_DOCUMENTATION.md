# Database Documentation

Kayan Land uses **MySQL 8** as the only data store, accessed exclusively through Prisma. This document describes the data model, operational commands, and backup expectations.

---

## 1. Connection

`prisma/schema.prisma` declares:

```prisma
datasource db {
  provider          = "mysql"
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

`DATABASE_URL` is the application connection. `SHADOW_DATABASE_URL` is used only by `prisma migrate dev` to detect schema drift; it must point to a separate, empty MySQL database.

Example (replace with your own credentials):

```env
DATABASE_URL="mysql://kayan:password@localhost:3306/kayan_land"
SHADOW_DATABASE_URL="mysql://kayan:password@localhost:3306/kayan_land_shadow"
```

The application must use a MySQL user with `SELECT, INSERT, UPDATE, DELETE` on the schema. Migration commands need `CREATE, ALTER, DROP, INDEX, REFERENCES` on both databases.

---

## 2. Model groups

### Administration and security

| Model | Purpose |
| --- | --- |
| `AdminUser` | Administrator accounts, Argon2id password hashes, role, active flag, soft delete |
| `Role` | Role name, unique slug, system flag |
| `Permission` | Permission key, label, group |
| `RolePermission` | Many-to-many join between roles and permissions |
| `AdminSession` | SHA-256 hash of the session token, expiry, IP, user agent |
| `PasswordResetToken` | Hashed, single-use reset tokens with expiry |
| `AdminNotification` | Per-administrator in-app notification: type, title, message, optional link, `readAt`, timestamp |
| `AuditLog` | Actor, action, entity, entity id, metadata, IP, user agent, timestamp |

### Company settings and content blocks

| Model | Purpose |
| --- | --- |
| `CompanySetting` | Single-row company identity (name, tagline, logo, contact details, hours, copyright) |
| `SocialLink` | Social profiles with platform, URL, label, sort order; capped at 20 records by the admin actions |
| `NavigationItem` | Menu entries for header or footer, nested via `parentId` |
| `FooterSetting` | Newsletter heading/note and footer note |
| `HomepageSection` | Copy for each home page section and the `privacy` / `terms` legal pages |
| `CompanyMilestone` | Timeline entries |
| `CompanyStatistic` | Statistics strip; value may be blank until verified |
| `CoreValue` | About page values |
| `ProcessStep` | Numbered process stages |
| `WhyChooseItem` | “Why Kayan Land” items |
| `Testimonial` | Client quotes, publication flag |

`HomepageSection.key` is unique. The public home page reads sections in `sortOrder`; sections with `isEnabled = false` are skipped.

### Services

| Model | Purpose |
| --- | --- |
| `ServiceCategory` | Service grouping and slug |
| `Service` | Core service record, Markdown description, publication, SEO fields, soft delete |
| `ServiceImage` | Gallery images with caption and order |
| `ServiceFeature` | Bullet features |
| `ServiceFAQ` | Service-specific questions |

### Projects

| Model | Purpose |
| --- | --- |
| `ProjectCategory` | Residential, commercial, and other groupings |
| `Project` | Case study: location, year, status, budget, narratives, cover and before/after images, publication, SEO |
| `ProjectImage` | Gallery images |
| `ProjectVideo` | External video URLs and captions |
| `ProjectSpecification` | Label/value specification rows |
| `ProjectFeature` | Feature bullets |
| `ProjectTag` | Reusable tag names |
| `ProjectTagRelation` | Many-to-many join between projects and tags |

`Project.status` uses `PLANNING`, `IN_PROGRESS`, `COMPLETED`, or `ON_HOLD`. Before/after comparison is shown only when `showBeforeAfter = true` and both images exist.

### Team

| Model | Purpose |
| --- | --- |
| `Department` | Team grouping |
| `TeamMember` | Profile, role, bio, skills, education, experience, contact and social links, publication |

### Gallery

| Model | Purpose |
| --- | --- |
| `GalleryCategory` | Gallery grouping |
| `GalleryMedia` | Image or video records with caption, alt text, and order |

### Journal

| Model | Purpose |
| --- | --- |
| `BlogAuthor` | Byline, bio, avatar |
| `BlogCategory` | Article category |
| `BlogTag` | Reusable tag |
| `BlogPost` | Article content (Markdown), excerpt, featured image, status, publish date, reading time, SEO |
| `BlogPostTag` | Many-to-many join between posts and tags |

`BlogPost.status` uses `DRAFT`, `SCHEDULED`, or `PUBLISHED`. The public site only serves posts that are `PUBLISHED`, have `publishedAt <= now`, and are not soft-deleted.

### Inquiries and audience

| Model | Purpose |
| --- | --- |
| `ContactInquiry` | Contact form submissions, status, assignment, follow-up date |
| `QuoteRequest` | Project briefs, including project type, location, budget, preferred start |
| `InquiryAttachment` | Private file metadata linked to either inquiry type |
| `InquiryNote` | Private administrator notes |
| `NewsletterSubscriber` | Unique email, active flag, source |

`InquiryStatus` uses `NEW`, `CONTACTED`, `IN_PROGRESS`, `QUOTATION_SENT`, `APPROVED`, `REJECTED`, or `COMPLETED`.

Deleting an inquiry cascades to its notes and attachment metadata. Delete the corresponding files under `storage/private` at the same time.

### Media

| Model | Purpose |
| --- | --- |
| `MediaFolder` | Folder tree |
| `Media` | File metadata: filename, URL, thumbnail URL, MIME type, dimensions, size, alt text |

Binary files are **not** stored in MySQL. See section 5.

### SEO, redirects, analytics

| Model | Purpose |
| --- | --- |
| `SEOSetting` | Single-row global SEO configuration, including `robotsPolicy` |
| `Redirect` | URL redirects managed in the console (`fromPath` unique, `toPath`, `statusCode` 301/302/307/308, `isActive`); enforced by `proxy.ts` with a short-lived cache |
| `PageView` | First-party page/route view: `path`, `title`, `pageType`, `visitorId`, `sessionId`, `userId`/`userName` (signed-in administrators), `ipHash`, `referrer`, `device`, `country`, `createdAt` |
| `CardEvent` | Card and section engagement: `eventType` (`VIEW`/`CLICK`), `entityType` (`PROJECT`, `PROJECT_PART`, `SERVICE`, `ARTICLE`), `entityId`, `entityTitle`, `path`, visitor/session/user identity, `ipHash`, `createdAt` |

---

## 3. Conventions

- Primary keys are UUID strings, except singleton settings rows that use a fixed id (`global`).
- Records that users may “delete” usually use `deletedAt` (soft delete). Public queries filter `deletedAt: null`.
- Publishing flags (`isPublished`, `isActive`, `status`) decide public visibility. Nothing is public merely because it exists.
- Timestamps use `createdAt` and `updatedAt`; `updatedAt` is maintained by Prisma.
- Ordering is controlled by `sortOrder` where editors can reorder content.
- Foreign keys generally restrict deletion of referenced parents; joins that represent ownership (gallery images, notes, attachments) cascade.
- Text fields that hold long copy use `@db.Text` or `@db.LongText`.

---

## 4. Migrations

Development:

```bash
npm run db:migrate      # prisma migrate dev
npm run db:seed         # apply baseline roles and sample content
```

Production:

```bash
npm run db:deploy       # prisma migrate deploy
npm run db:seed         # safe to re-run; content upserts do not overwrite edits
```

Rules:

- Never edit an already-applied migration; create a new one.
- Back up the database before deploying migrations.
- `npm run db:reset` is destructive (drops and recreates the schema) and must never be used against production.
- The seed is idempotent: role permissions are synchronised to defaults, and content records are inserted only when their unique key is missing.

---

## 5. Binary storage

| Content | Location | Access |
| --- | --- | --- |
| Admin-uploaded public images | `storage/uploads/YYYY/MM` (or `STORAGE_DIR`) | `/api/media/[...path]` |
| Inquiry attachments | `storage/private/YYYY/MM` | Authenticated `/api/admin/inquiries/attachments/[id]` |

The database stores relative paths and metadata only. A database restore without the matching `storage/` directory will produce broken media links; always back up both together.

---

## 6. Backup and restore

Recommended schedule: daily database dump plus a daily snapshot or sync of `storage/`.

```bash
# Database
mysqldump --single-transaction --routines --triggers \
  -u kayan -p kayan_land > backup/kayan_land_$(date +%F).sql

# Files
tar -czf backup/kayan_storage_$(date +%F).tar.gz storage/
```

Restore into an empty database and restore the storage archive to the same relative location:

```bash
mysql -u kayan -p kayan_land < backup/kayan_land_2026-01-01.sql
tar -xzf backup/kayan_storage_2026-01-01.tar.gz
```

After restoring, verify:

1. The site loads and images resolve.
2. An administrator can sign in.
3. Inquiries and their attachments open.
4. `npx prisma migrate status` reports no pending migrations.

Test a restore on a staging copy at least once before relying on the procedure.

---

## 7. Useful queries

```sql
-- Published content counts
SELECT 'projects' AS kind, COUNT(*) FROM Project WHERE isPublished = 1 AND deletedAt IS NULL
UNION ALL SELECT 'services', COUNT(*) FROM Service WHERE isPublished = 1 AND deletedAt IS NULL
UNION ALL SELECT 'posts', COUNT(*) FROM BlogPost WHERE status = 'PUBLISHED' AND deletedAt IS NULL;

-- Inquiry workload
SELECT status, COUNT(*) FROM ContactInquiry GROUP BY status;
SELECT status, COUNT(*) FROM QuoteRequest GROUP BY status;

-- Recent administrative activity
SELECT createdAt, action, entity, entityId FROM AuditLog ORDER BY createdAt DESC LIMIT 50;

-- Traffic, last 7 days
SELECT DATE(createdAt) AS day, COUNT(*) FROM PageView
WHERE createdAt >= NOW() - INTERVAL 7 DAY GROUP BY day ORDER BY day;

-- Top viewed cards, last 30 days
SELECT entityType, entityTitle, eventType, COUNT(*) AS total FROM CardEvent
WHERE createdAt >= NOW() - INTERVAL 30 DAY
GROUP BY entityType, entityTitle, eventType ORDER BY total DESC;
```
