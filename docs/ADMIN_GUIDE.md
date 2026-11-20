# Administrator Guide

This guide is for everyone who edits or operates the Kayan Land website. No coding knowledge is required for day-to-day work.

---

## 1. Signing in

1. Go to `/admin` on the website domain.
2. Enter your administrator email and password.
3. You are taken to the Overview.

- Use **Forgot password** on the login screen if you cannot sign in. Reset emails require the site's email service to be configured; if no email arrives, ask another Super Admin to set a new password from **Admin Users**, or use the server command described in the deployment guide.
- Sessions last seven days. **Sign out** is in the account menu.
- Five failed attempts from the same address trigger a temporary cooldown.

Passwords must be at least 12 characters. Do not share accounts; create a separate account for each person.

---

## 2. The console at a glance

The sidebar is grouped by purpose and floats independently from the page area:

| Group | Modules |
| --- | --- |
| Dashboard | Overview, Notifications |
| Site Presence | Social Links |
| Visitor Insights | Analytics, Recent Activity |
| User Management | User Management, Add New User, Roles & Permissions |
| Website Content | Home Page, About Page, Services, Service Categories, Projects, Project Categories, Team Members, Departments, Gallery, Blog Posts, Blog Categories, Blog Tags, Testimonials, FAQs, Company Timeline, Process & Values |
| Customer Management | Contact Inquiries, Quote Requests, Newsletter |
| Media | Media Library, Upload Media |
| Website Configuration | General Settings, Branding & Logo, Navigation Menu, Footer Settings, Social Media, Contact Information, SEO Settings, Redirects, Theme Settings |
| Administration | Profile |

Use the collapse icon in the sidebar header to switch between the full menu and an icon-only rail. The choice is remembered in a cookie for the next visit. Your role determines which entries appear; if a module is missing, you do not have its permission.

---

## 3. Publishing basics

Most content follows the same pattern:

1. Create or edit the record.
2. Fill the required fields (marked with an asterisk).
3. Choose a **slug** (the URL segment). Slugs must be unique.
4. Set the publication switch, or for articles choose **Published**.
5. Save.

Rules that apply across modules:

- Nothing appears publicly until it is published. Drafts and unpublished records stay in the console.
- **Preview a draft:** when editing a project, service, or article, use **Preview page** / **Preview article**. You must be signed in; the preview is marked with a banner and is hidden from search engines.
- Cover images and galleries are selected from the Media Library or uploaded directly.
- Use **Alt text** for images that carry meaning; screen readers and search engines rely on it.
- **Delete** usually performs a soft delete, so the record can be restored from the database if needed. Deleting a record can also remove its child images and links.
- Ordering is controlled by a sort-order field where available; lower numbers appear first.
- Changes are logged in **Recent Activity** with the administrator, action, record, date, and IP address.

### Home page sections

**Home Page** lists the sections that build the home screen: hero, about, services, projects, why choose us, statistics, process, testimonials, journal, and the closing call to action. Each section has a heading, supporting copy, optional image, and buttons. Disable a section to remove it from the public page.

Two additional sections, **Mission** and **Vision**, appear on the About page as a pair of cards. Each uses the section heading as the statement and the supporting copy as the label above it.

### What visitors see

The public site adds presentation that needs no configuration:

- Statistics animate up to their stored value when scrolled into view. If a statistic is stored as a placeholder dash, it stays a dash until you enter a real value.
- Testimonials published in **Testimonials** become an autoplaying carousel on the home page. The optional client photo is used as the avatar.
- **Projects** can be viewed as a table or a grid; the visitor's choice is remembered in their browser, with Table selected by default.
- Gallery images open in a lightbox with zoom (click the image, or use `+`, `-`, and `0`).
- The About page shows **mission** and **vision**, the active values and process, the timeline, the first four team members, and up to four **Why Choose Us** items. Keep those records current to control the page.

Autoplay and animation are disabled automatically for visitors who turn on reduced motion in their operating system.

The **privacy** and **terms** entries in the same module provide the legal page content. They are written in Markdown and appear at `/privacy` and `/terms`.

### Markdown

Long descriptions (services, projects, articles, legal pages) accept Markdown:

```markdown
## Heading
**Bold**, *italic*, [link](https://example.com)
- bullet
1. numbered item

> quote
```

Raw HTML is not rendered. Blank lines separate paragraphs.

---

## 4. Module notes

### Services

- Title, slug, short description, long description, main image, category, and icon value.
- Add gallery images, feature bullets, and service-specific FAQs.
- Mark a service **Featured** to include it in featured layouts. Publish to make it visible.

### Projects

- Required: title, category, location, description.
- Optional: client name, year, status, duration, budget, challenge/approach/architectural/construction narratives.
- Gallery, videos (external URLs), specifications, features, and tags are separate lists inside the project editor.
- **Before/after:** enable the comparison and upload both images. The slider appears only when both are present.
- Every project page includes a **Scan this project** card with a QR code for the canonical project URL and a download link for the SVG. Draft previews show the card only to signed-in staff.
- Placeholders inherited from the seed are explicitly labelled. Replace them with verified projects; do not present concept studies as completed work.

### Team

- Create departments first, then team members.
- Order the team with sort order. Publish a profile to show it on `/team` and link it from the home page preview.
- Skills, education, and experience accept comma-separated or line-separated entries, depending on the field hint.

### Journal

- Write or paste the article, set the excerpt, category, author, featured image, and reading time.
- `Published` posts appear only when their publish date has arrived.
- Tags help readers filter; categories drive the archive chips.

### Gallery

- Create categories, then add image or video items.
- The public gallery groups media and opens images in a lightbox.
- Provide captions and alt text.

### Testimonials and FAQs

- Testimonials require a client name and quote. Add a title, company, and photo where available. Publish only quotes you have permission to use.
- FAQs are grouped by FAQ category. Inactive items are hidden. FAQs also feed the FAQ structured data on `/faq`, where visitors can search questions and answers and filter by category.

### Media Library

- **Upload Media** accepts JPG, PNG, WebP, and AVIF up to 8 MB. Images are converted to WebP and given a thumbnail automatically.
- Keep filenames descriptive, but remember the alt text is what visitors and search engines read.
- Organise files in folders. Deleting a media item removes the stored files; check where it is used first.
- Site images should depict your own work or properly licensed material.

---

## 5. Handling inquiries

### Notifications

The bell in the top bar shows unread in-app notifications. A new contact inquiry or quote request creates one notification for every active administrator, with a link to the matching record.

- Open the bell to read the latest items, or choose **View all notifications** for the full inbox.
- **Mark all read** clears the unread badge for every item.
- **Open** marks a notification read and goes to the linked inquiry or quote page.
- Individual notifications can be marked read or deleted; **Clear read notifications** removes old items in bulk.

Notifications are stored inside the CMS only. They are separate from the optional email notification sent to the studio inbox.

### Contact inquiries and quote requests

1. Open **Contact Inquiries** or **Quote Requests**.
2. Filter by status, search by name, email, or subject, or narrow by **received date** (`from` / `to`). Quote requests can also be filtered by **project type**.
3. Open a record with **View**.

Inside an inquiry you can:

- Read the message and project brief.
- Reply by email using the linked address.
- Add **private notes** for the team. Visitors never see these.
- Change the status, assign the inquiry to an administrator, and set a follow-up date.
- Download attachments. Attachments are private and are served only to signed-in administrators.

Suggested status flow:

```text
NEW → CONTACTED → IN_PROGRESS → QUOTATION_SENT → APPROVED → COMPLETED
                                   ↘ REJECTED
```

Use **Export CSV** for a spreadsheet of the current list. CSVs respect the active filter where applicable.

Inquiries cannot be deleted from the console; mark them **Completed** or **Rejected** to close them. This keeps an auditable record.

### Newsletter

- Subscribers arrive from the footer form. The same email is never duplicated.
- You can deactivate a subscriber or delete the record.
- **Export CSV** provides the current mailing list.
- The site does not send campaigns; use your email provider with the exported list. Always include an unsubscribe route.

---

## 6. Users, roles, and profile

### Admin Users

- Create an account with name, email, role, and initial password (minimum 12 characters).
- Editing an account can change its role, name, email, and active state, and can set a new password.
- Deactivating an account or changing its password signs that person out of existing sessions.
- Safety rules: you cannot deactivate yourself, cannot change your own role, and the last active Super Admin cannot be deactivated or removed.

### Roles & Permissions

- Permission ticks decide what a role can open and change.
- Built-in roles keep their slugs. Super Admin always has every permission.
- You can create additional roles for specific teams (for example a writer who only manages the journal).
- A role that still has users cannot be deleted.

Changing your own role may remove your access to this screen. Ask another Super Admin to make role changes that affect you.

### Profile

The profile screen opens with a signed-in summary of your avatar, role, email, permissions and device count.

- Update your name, email, and avatar in **Personal details**.
- Change your password in **Password & security** by entering the current one. Every other session is signed out.
- Review **Signed-in devices** with the last activity and IP address, and choose **Sign out others** if you suspect misuse.
- **Access** lists your role, granted permission keys, last sign-in and join date.
- **Recent activity** shows the latest entries from the audit log for your account.

---

## 7. Settings

| Screen | What it controls |
| --- | --- |
| General Settings | Company name, tagline, description, logo text, copyright, working hours |
| Branding & Logo | Logo image and visual identity used in the header and footer |
| Contact Information | Address, email, phone, WhatsApp, map settings shown on the contact page |
| Social Links | Visual manager for up to 20 social media or app icons. Choose an icon, paste the link, hide it, and move items up or down to set the footer order. The same records power the Settings → Social Media table. |
| Social Media | Table view of the same social profile links shown in the header, footer, and contact page |
| Navigation Menu | Header and footer links, their order, nesting, and whether they open in a new tab |
| Footer Settings | Newsletter heading and note, footer note |
| SEO Settings | Site title, default description, social sharing image, canonical base URL, robots policy, Google/Bing verification, and an SEO health review |
| Redirects | Permanent or temporary URL redirects. Enter a source path such as `/old-page`, a destination, and a status code. Changes apply within about 15 seconds. |
| Theme Settings | Brand colours and typography tokens used by the public site |

Only enter company details you can verify. Empty contact fields are hidden on the public site rather than replaced with invented information.

---

## 8. Analytics and audit

**Analytics** shows first-party activity for the last 7, 30, or 90 days:

- overview cards: website visits, unique visitors, most viewed page, card engagement;
- page and project-section breakdown with share of traffic;
- top viewed cards (projects, services, articles, project sections) ranked by views with clicks and click-through rate;
- recent visitor log: guest cookie id or administrator name, page title/path, short IP hash, device, country and time;
- daily traffic chart, with a range filter for all time, today, this week, this month or a specific date; the chart compares page views, unique visitors, card views and card clicks as separate lines;
- device breakdown, top countries (only when the hosting platform supplies a geo header such as `cf-ipcountry`) and referrer hosts.

Tracking ignores bots and excludes `/admin` and `/api`. Card and project-section impressions are recorded once per browser session when the card enters the viewport; clicks are recorded separately. There are no third-party analytics scripts; signed-in administrators are identified by name, while anonymous visitors are represented by a random cookie and a salted IP hash — raw IP addresses are never stored.

**Recent Activity** records administrative changes. Filter by administrator, entity, or action to trace who changed what and when.

---

## 9. Common tasks

### Publish a new project

1. Projects → **New project**.
2. Fill required fields and the description.
3. Upload a cover image and gallery images.
4. Add specifications and features if available.
5. Set status, mark featured if appropriate, and publish.
6. Check the public listing and detail page.

### Publish an article

1. Blog Posts → **New post**.
2. Add title, slug, excerpt, content, category, author, and featured image.
3. Set status to Published and choose the publish date.
4. Add tags, then save.

### Change the home headline

Home Page → open the **hero** section → edit heading and supporting text → save. The change is live immediately.

### Update contact details

Settings → Contact Information (and Social Media for profile links). Empty fields are hidden automatically.

### Replace a placeholder image

Media Library → upload the real image → edit the relevant record (project, service, team member, or home section) → choose the new image → save.

### Reset a password for someone else

Admin Users → open the account → set a new password → save. The person is signed out everywhere and must use the new password. Communicate it through a secure channel.

---

## 10. Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| “Access denied” after opening a module | Your role lacks the permission. Ask a Super Admin. |
| A saved item is not on the website | It is unpublished, scheduled for the future, inactive, or softly deleted. |
| Images do not appear | The media file was removed, or the storage directory is missing or not readable by the application. |
| Password reset email never arrives | Email delivery is not configured. Use the account screen or server command instead. |
| Changes appear only after a refresh | Expected for cached images; the text content is dynamic. Try a hard refresh. |
| A new redirect is not active yet | Redirect rules are cached for about 15 seconds. Retry shortly and confirm the rule is enabled. |
| An inquiry has no notification email | Email delivery is not configured; the inquiry is still stored in the console. |
