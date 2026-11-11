# Deployment Guide

Production deployment of the Kayan Land website and CMS. The application is a single Next.js 16 process backed by MySQL 8; there is no separate API service.

Stack reference: [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md) · Schema reference: [`DATABASE_DOCUMENTATION.md`](./DATABASE_DOCUMENTATION.md) · Editorial usage: [`ADMIN_GUIDE.md`](./ADMIN_GUIDE.md)

---

## 1. Prerequisites

| Requirement | Notes |
| --- | --- |
| Node.js 20+ | Node 24 LTS is what the project is developed against. |
| MySQL 8.0+ | `utf8mb4` and `utf8mb4_0900_ai_ci` (Prisma default). MariaDB is untested. |
| Two databases | One runtime database plus one empty **shadow** database for development migrations. |
| Reverse proxy | nginx, Caddy, or a managed platform that terminates TLS. |
| Persistent disk | `storage/` must survive restarts and deploys. |

`@node-rs/argon2` and `sharp` ship prebuilt native binaries. On a minimal Linux image, no build toolchain is normally required; if a platform cannot install prebuilts, add `python3 make g++` to the image.

---

## 2. Create the databases

```sql
CREATE DATABASE kayan_land CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE kayan_land_shadow CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE USER 'kayan_user'@'%' IDENTIFIED BY '<strong-password>';
GRANT ALL PRIVILEGES ON kayan_land.* TO 'kayan_user'@'%';
GRANT ALL PRIVILEGES ON kayan_land_shadow.* TO 'kayan_user'@'%';
FLUSH PRIVILEGES;
```

The shadow database is only required for `prisma migrate dev`. Production runs `prisma migrate deploy`, which does not touch it, but keeping the variable set avoids a missing-env error when Prisma loads the schema.

---

## 3. Configure environment

Copy the template and fill in real values:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Runtime MySQL connection string. |
| `SHADOW_DATABASE_URL` | dev | Empty database for migration diffs. |
| `APP_URL` | yes | Public origin, no trailing slash. Drives canonicals, sitemap, JSON-LD, and password-reset links. |
| `RESEND_API_KEY` | no | Enables outbound email. Without it, notifications and reset mail are skipped. |
| `EMAIL_FROM` | no | Verified sender identity for Resend. |
| `INQUIRY_NOTIFICATION_EMAIL` | no | Recipient for contact/quote notifications. |
| `STORAGE_DIR` | no | Public upload directory, default `storage/uploads`. |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | seed | First super admin, only used when that email does not exist. |
| `ADMIN_EMAIL` / `ADMIN_NAME` / `ADMIN_PASSWORD` | script | Inputs for `npm run admin:create`. |

`.env` is git-ignored. `.env.example` contains placeholders only; never place real credentials in it.

If e-mail is enabled, the sender domain must be verified in Resend and `APP_URL` must be the deployed HTTPS origin, otherwise reset links point at localhost.

---

## 4. Install, migrate, seed

```bash
npm ci
npx prisma generate
npm run db:deploy      # prisma migrate deploy
npm run db:seed        # idempotent: roles, permissions, settings, demo content
```

`db:seed` creates the RBAC roles and permissions every admin account depends on, plus starter site settings. It is safe to re-run; existing records are upserted, and an existing administrator with the seeded email keeps its password.

The seed also creates one staff account per role (`manager@kayanland.local`, `content@kayanland.local`, `editor@kayanland.local`). They use `SEED_STAFF_PASSWORD` when set, then `SEED_ADMIN_PASSWORD`, then the development default. On a production database either set a strong `SEED_STAFF_PASSWORD`, or deactivate the accounts you do not need after seeding.

The seed falls back to a known development administrator (`admin.2025@gmail.com` / `admin@123`). Always override `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` before seeding a production database, or seed first and then create the real account explicitly:

```bash
npm run admin:create -- --email you@studio.com --name "Your Name"
```

When no password is supplied the script generates one and writes it to `.admin-credentials.txt` in the project root. Move it to a password manager and delete the file. The file is git-ignored but still readable on the server.

---

## 5. Build and run

```bash
npm run build
npm run start          # serves on :3333
```

Set `PORT` and `HOSTNAME` to bind differently, e.g. `PORT=3333 HOSTNAME=127.0.0.1 npm run start` when a local proxy fronts the app.

The build performs type checking and linting; a failing check fails the deploy, which is intentional.

### systemd example

```ini
[Unit]
Description=Kayan Land website
After=network.target mysql.service

[Service]
Type=simple
User=kayan
WorkingDirectory=/srv/kayan
EnvironmentFile=/srv/kayan/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
# Uploads and env must persist here
ReadWritePaths=/srv/kayan/storage

[Install]
WantedBy=multi-user.target
```

Run `npm run build` as part of the release step, not on every restart.

---

## 6. Reverse proxy and TLS

The app expects to be reached over HTTPS at `APP_URL`. Forward the original host and protocol so redirects and canonical URLs are correct.

```nginx
server {
    listen 443 ssl http2;
    server_name kayanland.example.com;

    ssl_certificate     /etc/letsencrypt/live/kayanland.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kayanland.example.com/privkey.pem;

    client_max_body_size 20m;   # must exceed the 15 MB server-action limit

    location / {
        proxy_pass         http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
    }
}

server {
    listen 80;
    server_name kayanland.example.com;
    return 301 https://$host$request_uri;
}
```

Redirect HTTP to HTTPS at the proxy. Session cookies are `httpOnly` and marked `Secure` when `NODE_ENV=production`, so plain HTTP logins will not persist.

`proxy.ts` runs on the Node.js runtime (the default for Next.js 16 proxies), so it can query MySQL. It reads active redirect rules from the `Redirect` table and caches them for 15 seconds; a database outage degrades to serving the page without a redirect rather than failing the request.

If you want the country breakdown in Analytics, have your edge or CDN send a country header. The tracker accepts `x-vercel-ip-country`, `cf-ipcountry`, or `x-country-code`; without one, views are recorded with no country.

### Upload limits

Three layers must agree:

1. Proxy body limit — `client_max_body_size` above 20 MB.
2. Server-action limit — `experimental.serverActions.bodySizeLimit` in [next.config.ts](../next.config.ts), currently `15mb`.
3. Application limits — images 8 MB, inquiry attachments 10 MB ([lib/storage.ts](../lib/storage.ts)). Requests beyond these are rejected with a user-facing error.

---

## 7. Storage permissions

```
/srv/kayan/storage/
├── uploads/    # public media; served by /api/media/<yyyy>/<mm>/<file>
└── private/    # inquiry attachments; served only to authenticated admins
```

```bash
mkdir -p storage/uploads storage/private
chown -R kayan:kayan storage
chmod 750 storage storage/uploads storage/private
```

- Both directories are created on demand, so a missing folder is not fatal, but the parent must be writable.
- Public files are content-addressed by date and immutable; uploads are converted to WebP (max 2400 px) with a 640 px thumbnail.
- Private attachments are never exposed by URL. They stream through `/api/admin/inquiries/attachments/[id]`, which checks the session and permission.
- `storage/` is git-ignored. Include it in server backups — files live outside MySQL.

On multi-instance or serverless platforms, mount shared storage (NFS, EFS, a volume) and point `STORAGE_DIR` at it. Local container disks are lost on redeploy.

---

## 8. Backups

Nightly example:

```bash
mysqldump --single-transaction --routines --triggers \
  --default-character-set=utf8mb4 \
  -u kayan_user -p kayan_land \
  | gzip > /backups/kayan-$(date +%F).sql.gz

tar -czf /backups/kayan-storage-$(date +%F).tar.gz -C /srv/kayan storage
```

Restore:

```bash
gunzip -c /backups/kayan-2026-01-01.sql.gz | mysql -u kayan_user -p kayan_land
tar -xzf /backups/kayan-storage-2026-01-01.tar.gz -C /srv/kayan
```

Keep the database and storage snapshots from the same point in time; a media row without its file renders a broken image, and a file without its row is orphaned.

Test a restore into a scratch database at least once per quarter.

---

## 9. Upgrades

1. Back up the database and `storage/`.
2. Pull the release and run `npm ci`.
3. Apply migrations: `npm run db:deploy`.
4. Run `npm run build` (type check + lint gate) and `npm test`.
5. Restart the service.
6. Smoke test: home page, one project detail, `/admin/login`, sign in, open Inquiries, and open a configured redirect.

Never run `prisma migrate dev` against production — it can reset the database when drift is detected. Never run `npm run db:reset` anywhere but a local machine.

---

## 10. Post-deploy checks

| Check | Expected |
| --- | --- |
| `https://<host>/` | Home page renders with seeded or published content. |
| `https://<host>/sitemap.xml` | Valid XML; only published items listed. |
| `https://<host>/robots.txt` | References the sitemap; no `Disallow: /` unless intentionally set in Settings → SEO. |
| `https://<host>/admin` signed out | Redirects to `/admin/login?next=%2Fadmin`. |
| Sign-in | Lands on the dashboard; session cookie is `Secure`, `HttpOnly`. |
| Upload | Media Library accepts a JPG and serves `/api/media/...`. |
| Inquiry attachment | Uploads via the public quote form; downloads only while signed in. |
| Contact form | Submission appears in Inquiries and sends mail when Resend is configured. |
| Password reset | Link in the email points at `APP_URL`. |
| Redirect rule | A source path configured in Settings → Redirects answers with its status code and `Location` header (allow ~15 s for the cache). |

Review Settings → SEO before launch: site title, default description, canonical base, and social image are used across metadata, JSON-LD, and the sitemap.

---

## 11. Operational notes

- **Dynamic rendering.** Public pages are `force-dynamic`; content changes in the admin appear on the next request. No cache purge is needed. If a CDN is added, do not cache HTML without a purge strategy — admin edits would be invisible.
- **Analytics** are first party and write through two batched endpoints (`/api/analytics/view`, `/api/analytics/card`) using `sendBeacon` where available, so tracking never delays rendering. Bots are filtered and requests are rate-limited per visitor. Signed-in administrators are stored by name; anonymous visitors use a random `kl_vid` cookie and a salted IP hash (no raw IPs). There is no third-party script and no cookie consent banner requirement from this code. Country is only recorded when an edge geo header is forwarded.
- **Redirects** are stored in MySQL and enforced in `proxy.ts` with a 15-second in-memory cache. Each app instance keeps its own cache, so a change may take up to 15 seconds per instance. Use the reverse proxy for wildcard or regex rules.
- **Mail failures** never block a form submission; the inquiry is stored first, then the notification is attempted.
- **Audit log** records admin mutations with actor, action, entity, and IP. It is append-only in the UI.
- **Multiple instances** require shared MySQL and shared storage; sessions live in MySQL, so no sticky routing is needed.

---

## 12. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Can't reach database server` | Wrong host/port or MySQL down | Verify `DATABASE_URL`; `mysqladmin ping`. |
| `Environment variable not found: DATABASE_URL` | `.env` missing or service lacks `EnvironmentFile` | Supply env via the service or platform dashboard. |
| Sign-in succeeds, then bounces to login | Cookie `Secure` over plain HTTP, or `APP_URL` mismatched | Serve HTTPS; keep `NODE_ENV=production` only behind TLS. |
| `@node-rs/argon2` load error | Platform mismatch / no prebuilt | `npm ci` on the target platform; install build tools if needed. |
| Uploads return 404 after deploy | `storage/` was not persisted or `STORAGE_DIR` moved | Mount a volume; confirm the path exists and is readable. |
| Broken images after restore | Database restored without the matching files | Restore both snapshots together. |
| Reset e-mail links point to localhost | `APP_URL` unset | Set the public HTTPS origin and restart. |
| `413 Request Entity Too Large` | Proxy limit below upload size | Raise `client_max_body_size` above 20 MB. |
| Admin page blank with a stale type error | Old `.next` artifacts after moving routes | `rm -rf .next && npm run build`. |
| `prisma migrate deploy` finds no migrations | Schema was only pushed, never migrated | Generate a migration locally, commit it, redeploy. |
