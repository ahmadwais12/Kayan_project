# MASTER DEVELOPMENT PROMPT
# KAYAN LAND — Architecture & Construction Company
## Full-Stack Dynamic Website + Admin Dashboard + MySQL CMS

Act as a Senior Full-Stack Software Architect, UI/UX Designer, Next.js Developer, MySQL Database Architect, and SEO Specialist.

Your task is to design and develop a complete, production-ready website for:

**Company:** Kayan Land Architecture & Construction Company

**Tagline:** Where Beauty and Functionality Unite in Design.

**Instagram:** https://www.instagram.com/kayanland.acc/

**UI references:**
- https://uiverse.io/design/
- https://ui.shadcn.com/
- https://ui.shadcn.com/blocks
- Other premium architecture, construction, and interior design websites.

The website must have two major systems:

1. Public-facing corporate website.
2. Complete private Admin Dashboard / Content Management System (CMS).

Every dynamic section on the public website must be manageable through the admin dashboard and stored in MySQL.

Do not create a static website with hardcoded content.

---

# PART 1 — IMPORTANT DEVELOPMENT RULES

Before writing code:

1. Inspect the complete existing project structure.
2. Identify the current Next.js version and installed dependencies.
3. Check whether MySQL is already configured.
4. Review existing components and reusable layouts.
5. Check whether authentication or database models already exist.
6. Create a development plan.
7. Implement the application using the existing architecture where possible.

If the project is empty, establish a clean production-ready architecture.

Important rules:

- Use Next.js App Router.
- Use TypeScript throughout the application.
- Use MySQL as the primary database.
- Use Prisma ORM for database management.
- Use Next.js Server Actions and Route Handlers for backend operations.
- Do not create a separate Laravel, PHP, or Express backend.
- Use Server Components wherever possible.
- Use Client Components only when interactivity requires them.
- Never expose database credentials or private environment variables.
- Do not hardcode content that should be managed through the CMS.
- Do not use mock data as the final production data source.
- Do not leave buttons, forms, links, or dashboard actions nonfunctional.

# PART 2 — TECHNOLOGY STACK

Use the following technologies:

### Core
- Next.js (App Router)
- React
- TypeScript
- Node.js runtime
- MySQL
- Prisma ORM

### Frontend and UI
- Tailwind CSS
- shadcn/ui
- Radix UI / Base UI as appropriate for installed shadcn components
- Lucide React
- Framer Motion
- React Hook Form
- Zod

### Visual components
- Recharts for dashboard analytics.
- Embla Carousel or an appropriate carousel library.
- Uiverse for selected CSS hover effects and animations.
- next-themes if light/dark mode is needed in the admin panel.

### Backend
- Next.js Server Actions
- Next.js Route Handlers
- Prisma
- Secure authentication
- Zod server-side validation

### Image and file management
- Next.js Image
- Sharp for image optimization where appropriate.
- Configurable local or S3-compatible object storage.
- Image metadata and file references stored in MySQL.

### Additional
- SEO metadata API
- Dynamic sitemap
- robots.txt
- Structured data / JSON-LD
- Email notifications for inquiries
- Rate limiting
- Audit logging

Do not install unnecessary packages.

# PART 3 — BRAND IDENTITY AND DESIGN SYSTEM

Create a professional architectural design system.

The website should look like a premium international architecture and construction company.

Design characteristics:

- Minimalist.
- Modern.
- Luxury architectural appearance.
- Editorial typography.
- Large architectural photographs.
- Elegant layouts.
- Premium project galleries.
- Smooth animations.
- Consistent spacing.
- Professional typography hierarchy.
- Carefully designed mobile layouts.

### Initial color palette

Primary: #172B35

Secondary: #343B3D

Accent: #C49A68

Background: #F3F0E9

White: #FFFFFF

Muted: #E7E3DA

These colors must be configurable through the admin dashboard.

### Typography

Use premium readable typography.

Suggested:
- Headings: Playfair Display or a suitable architectural editorial font.
- Body: Inter or Manrope.
- Navigation: Manrope.

Support responsive typography.

### UI/UX requirements

Use shadcn/ui for:
- Buttons.
- Forms.
- Dropdown menus.
- Dialogs.
- Tables.
- Tabs.
- Sidebars.
- Pagination.
- Date pickers.
- Notifications.
- Admin dashboard components.

Use Uiverse for selected:
- Animated buttons.
- Hover effects.
- Image interactions.
- Loading animations.
- Creative transitions.
- Small interactive visual details.

Do not make the entire website look like a collection of unrelated UI components.

Maintain one consistent design language.

# PART 4 — PUBLIC WEBSITE STRUCTURE

Create the following public-facing pages.

## 1. Home Page

Route: /

Create a visually impressive homepage.

Sections:

### A. Header and Navigation
- Company logo.
- Home.
- About Us.
- Services.
- Projects.
- Our Team.
- Blog.
- Contact.
- Get a Quote button.

Requirements:
- Transparent header over the hero image.
- Header changes appearance when scrolling.
- Mobile navigation drawer.
- Dropdown navigation where needed.
- Sticky navigation.
- Logo and navigation editable through CMS.

### B. Hero Section

Create a full-screen architectural hero.

Features:
- Full-screen background image or video.
- Premium architectural photography.
- Main heading.
- Company tagline.
- Short company description.
- Explore Projects button.
- Contact Us button.
- Animated scroll indicator.
- Elegant text entrance animations.
- Optional image/video slider.

All content and media must be configurable through the dashboard.

### C. About Preview

Display:
- Company introduction.
- Company image.
- Mission.
- Vision.
- Years of experience.
- Learn More button.

### D. Services Overview

Display the company's services using professional image cards.

Each card contains:
- Service image.
- Service title.
- Short description.
- Learn More link.

Load services dynamically from MySQL.

### E. Featured Projects

Display selected projects.

Each project card:
- Cover image.
- Project name.
- Project category.
- Location.
- Completion year.
- View Project button.

Admin can select which projects appear on the homepage.

### F. Why Choose Kayan Land?

Create a professional section showing:
- Architectural excellence.
- Quality construction.
- Innovative designs.
- Professional engineering.
- Client satisfaction.
- Project management.

Content must be editable.

### G. Statistics Section

Examples:
- Completed Projects.
- Happy Clients.
- Years of Experience.
- Professional Team Members.

Allow administrators to manage the numbers and labels.

Do not fabricate company statistics. Use configurable placeholders until verified information is entered.

### H. Our Process

Create a visual process section:

1. Consultation.
2. Planning.
3. Architectural Design.
4. Engineering.
5. Construction.
6. Final Delivery.

Allow admin to change steps, images, titles, and descriptions.

### I. Testimonials

Display client testimonials with:
- Client name.
- Client photo.
- Position or company.
- Review.
- Rating.
- Display status.

### J. Latest News and Articles

Display the latest published blog articles.

### K. Call to Action

Create a premium contact section.

Example:

"Let's Build Something Extraordinary."

Buttons:
- Start Your Project.
- Contact Our Team.

### L. Footer

Include:
- Company logo.
- Company introduction.
- Navigation links.
- Services.
- Contact details.
- Social media links.
- Instagram.
- Facebook.
- LinkedIn.
- WhatsApp.
- Newsletter subscription.
- Copyright information.
- Privacy Policy.
- Terms and Conditions.

All footer information must be manageable through CMS.

---

# PART 5 — ABOUT US MODULE

Route: /about

Create a complete company profile page.

Sections:

1. Company Introduction.
2. Company History.
3. Mission.
4. Vision.
5. Core Values.
6. Our Philosophy.
7. Our Approach.
8. Company Achievements.
9. Company Statistics.
10. Our Team.
11. Why Choose Us.
12. Call to Action.

Create a professional company timeline.

Admin must be able to:
- Add history milestones.
- Edit milestones.
- Upload images.
- Change the order.
- Publish or hide individual sections.

---

# PART 6 — SERVICES MODULE

Routes:

/services

/services/[slug]

Create a dynamic service management system.

Possible initial service categories:

1. Architectural Design.
2. Interior Design.
3. Exterior Design.
4. Residential Construction.
5. Commercial Construction.
6. Structural Engineering.
7. Civil Engineering.
8. Renovation and Remodeling.
9. Landscape Design.
10. Project Management.
11. Construction Consultation.
12. 3D Visualization and Rendering.

These are proposed categories, not confirmed company offerings. The administrator must be able to create, edit, and remove services.

### Services listing page

Include:
- Page introduction.
- Service categories.
- Service cards.
- Images.
- Short descriptions.
- Details buttons.
- Contact CTA.

### Individual service detail page

Each service should support:

- Title.
- Slug.
- Short description.
- Full description.
- Main image.
- Image gallery.
- Service features.
- Benefits.
- Process.
- Related projects.
- FAQ.
- SEO title.
- SEO description.
- Open Graph image.
- Published/draft status.

Every service detail page must be generated dynamically from MySQL.

---

# PART 7 — PROJECT PORTFOLIO MODULE

Routes:

/projects

/projects/[slug]

This is one of the most important modules.

Create a premium architectural portfolio.

### Project categories

Allow admin to create categories such as:

- Residential.
- Commercial.
- Interior.
- Exterior.
- Institutional.
- Industrial.
- Landscape.
- Renovation.

### Projects listing page

Features:
- Grid and masonry layouts.
- Category filters.
- Search.
- Pagination.
- Featured projects.
- Responsive gallery.
- Smooth filtering animations.

### Individual project page

Each project must support:

1. Project title.
2. Unique slug.
3. Project category.
4. Client name (optional).
5. Project location.
6. Project year.
7. Project status.
8. Project duration.
9. Project budget (optional and private by default).
10. Project description.
11. Project challenges.
12. Design solutions.
13. Architectural details.
14. Construction details.
15. Project specifications.
16. Cover image.
17. Before/after images.
18. Multiple gallery images.
19. Project videos.
20. Floor plans.
21. 3D renders.
22. Related projects.
23. SEO information.

### Project gallery

Implement:
- Full-screen lightbox.
- Image zoom.
- Next/previous navigation.
- Keyboard navigation.
- Image captions.
- Video support.
- Responsive gallery layouts.

### Before and After Comparison

Create an interactive before/after slider.

The administrator should be able to upload two images and enable the comparison component.

### Project Management

Admin must be able to:
- Create projects.
- Edit projects.
- Delete projects.
- Upload multiple images.
- Reorder images.
- Select cover images.
- Create categories.
- Add project specifications.
- Feature projects.
- Publish/unpublish projects.
- Preview projects before publishing.

---

# PART 8 — OUR TEAM MODULE

Routes:

/team

/team/[slug]

Create a dynamic team management system.

Each team member supports:

- Full name.
- Profile image.
- Job title.
- Department.
- Professional biography.
- Skills.
- Experience.
- Education (optional).
- Social media links.
- Display order.
- Published status.

Dashboard features:
- Add team member.
- Edit team member.
- Delete team member.
- Manage departments.
- Upload profile photographs.
- Change display order.

Do not display fabricated employees.

---

# PART 9 — GALLERY MODULE

Route: /gallery

Create a centralized gallery system.

Gallery categories:
- Architecture.
- Construction.
- Interior.
- Exterior.
- Site Work.
- 3D Designs.
- Completed Projects.
- Company Activities.

Features:
- Masonry grid.
- Category filters.
- Image lightbox.
- Video gallery.
- Captions.
- Responsive layout.

Admin can upload, categorize, reorder, publish, and delete media.

---

# PART 10 — BLOG AND NEWS MODULE

Routes:

/blog

/blog/[slug]

Create a complete CMS-powered blog.

Each article should support:

- Title.
- Slug.
- Featured image.
- Short description.
- Rich-text content.
- Author.
- Category.
- Tags.
- Publication date.
- Reading time.
- SEO title.
- SEO description.
- Open Graph image.
- Draft/published status.

Features:
- Search articles.
- Category filters.
- Related articles.
- Latest posts.
- Pagination.
- Social sharing.
- Article reading progress indicator.

Dashboard:
- Create article.
- Edit article.
- Delete article.
- Manage categories.
- Manage tags.
- Upload images.
- Preview article.
- Publish immediately.
- Schedule publication if supported.

---

# PART 11 — CONTACT AND INQUIRY MANAGEMENT

Routes:

/contact

/quote

Create professional contact and project inquiry forms.

### Contact Form

Fields:
- Full Name.
- Email.
- Phone Number.
- Subject.
- Message.

### Project Quotation Form

Fields:
- Full Name.
- Email.
- Phone.
- Project Type.
- Project Location.
- Estimated Budget (optional).
- Expected Start Date (optional).
- Project Description.
- File Attachments.

### Dashboard Inquiry Management

Admin must be able to:

- View all inquiries.
- View inquiry details.
- Search inquiries.
- Filter by date.
- Filter by project type.
- Update inquiry status.
- Assign inquiries to staff.
- Add internal notes.
- Record follow-up dates.
- Mark as contacted.
- Mark as approved or rejected.
- Export inquiries to CSV.

Inquiry statuses:

- New.
- Contacted.
- In Progress.
- Quotation Sent.
- Approved.
- Rejected.
- Completed.

### Security

- Validate every form on the server.
- Implement rate limiting.
- Prevent spam submissions.
- Use honeypot or CAPTCHA where appropriate.
- Validate uploaded files.
- Restrict attachment size and type.
- Never expose private customer information publicly.

---

# PART 12 — FAQ MODULE

Create a dynamic FAQ system.

Features:
- FAQ categories.
- Question.
- Answer.
- Display order.
- Active/inactive status.
- Search.

Admin can manage all FAQs.

Display FAQs on relevant service pages and a dedicated FAQ page if needed.

---

# PART 13 — ADMIN DASHBOARD

Route: /admin

Create a completely separate and secure administration panel.

The dashboard must have a premium professional SaaS-style design.

Use:
- shadcn/ui.
- Tailwind CSS.
- Recharts.
- Lucide icons.
- Responsive sidebar.
- Data tables.
- Charts.
- Dialogs.
- Toast notifications.

### A. Dashboard Overview

Display:

- Total Projects.
- Published Projects.
- Draft Projects.
- Total Services.
- Team Members.
- Blog Articles.
- Total Inquiries.
- New Inquiries.
- Monthly Inquiries.
- Website Views (only when analytics tracking is implemented).

Charts:
- Monthly website visitors.
- Inquiry trends.
- Project category distribution.
- Recent inquiries.
- Recent activities.

Quick actions:
- Add Project.
- Add Service.
- Add Blog.
- Add Team Member.
- View Inquiries.

All statistics must come from actual database records.

### B. Content Management Sidebar

Create the following navigation:

**Dashboard**
- Overview
- Analytics
- Recent Activity

**Website Content**
- Home Page
- About Us
- Services
- Projects
- Project Categories
- Team Members
- Departments
- Gallery
- Blog Posts
- Blog Categories
- Blog Tags
- Testimonials
- FAQs
- Company Timeline

**Customer Management**
- Contact Inquiries
- Quote Requests
- Newsletter Subscribers

**Media Management**
- Media Library
- Upload Media
- Media Categories

**Website Configuration**
- General Settings
- Branding and Logo
- Navigation Menu
- Footer Settings
- Social Media
- Contact Information
- SEO Settings
- Homepage Settings
- Theme Settings

**Administration**
- Admin Users
- Roles and Permissions
- Audit Logs
- Profile
- Change Password
- Logout

---

# PART 14 — INDIVIDUAL DASHBOARD PAGES

Do not build only one dashboard page.

Each module must have its own complete management interface.

### Projects Dashboard

Route: /admin/projects

Pages:
- Projects List.
- Create Project.
- Edit Project.
- Project Details.
- Project Categories.

### Services Dashboard

Route: /admin/services

Pages:
- Services List.
- Create Service.
- Edit Service.
- Service Categories.

### Team Dashboard

Route: /admin/team

Pages:
- Team Members.
- Add Member.
- Edit Member.
- Departments.

### Blog Dashboard

Route: /admin/blog

Pages:
- All Posts.
- Create Post.
- Edit Post.
- Categories.
- Tags.

### Media Dashboard

Route: /admin/media

Pages:
- All Media.
- Upload Media.
- Image Details.
- Media Categories.

### Inquiry Dashboard

Route: /admin/inquiries

Pages:
- All Inquiries.
- New Inquiries.
- Contacted.
- In Progress.
- Quotation Sent.
- Approved.
- Rejected.
- Inquiry Details.

### Website Settings

Route: /admin/settings

Pages:
- General.
- Branding.
- Navigation.
- Homepage.
- Footer.
- Social Links.
- Contact Information.
- SEO.
- Theme.

Every dashboard page must have functional create, read, update, and delete operations where appropriate.

Use confirmation dialogs before destructive actions.

---

# PART 15 — USER AUTHENTICATION AND AUTHORIZATION

Create secure authentication for administrators.

Requirements:

1. Admin login.
2. Logout.
3. Password hashing using Argon2id or an appropriate secure password hashing implementation.
4. Secure session management.
5. HTTP-only cookies.
6. CSRF protections where applicable.
7. Login rate limiting.
8. Password reset workflow.
9. Session expiration.
10. Login activity tracking.

### Roles

Create role-based access control (RBAC).

Initial roles:

**Super Admin**
- Complete system access.
- Manage administrators.
- Manage roles.
- Manage all website content.
- Manage settings.

**Admin**
- Manage website content.
- Manage projects.
- Manage services.
- Manage media.
- Manage inquiries.

**Content Manager**
- Manage projects.
- Manage services.
- Manage blogs.
- Manage gallery.
- Manage team content.

**Editor**
- Create and edit assigned content.
- Cannot manage administrators or security settings.

Permissions must be configurable.

Never trust frontend permission checks alone. Validate permissions on the server for every protected operation.

---

# PART 16 — MYSQL DATABASE ARCHITECTURE

Use MySQL as the only primary relational database.

Use Prisma ORM.

Create a properly normalized relational database.

Do not store all website content inside one generic JSON column.

Create dedicated models and relations.

### Required database models

**Authentication**
- AdminUser
- Role
- Permission
- RolePermission
- AdminSession
- PasswordResetToken
- AuditLog

**Company**
- CompanySetting
- SocialLink
- NavigationItem
- FooterSetting
- HomepageSection
- CompanyMilestone
- CompanyStatistic

**Services**
- Service
- ServiceCategory
- ServiceFeature
- ServiceFAQ

**Projects**
- Project
- ProjectCategory
- ProjectImage
- ProjectVideo
- ProjectSpecification
- ProjectFeature
- ProjectTag
- ProjectTagRelation

**Team**
- TeamMember
- Department

**Gallery**
- GalleryCategory
- GalleryMedia

**Blog**
- BlogPost
- BlogCategory
- BlogTag
- BlogPostTag
- BlogAuthor

**Customer Communication**
- ContactInquiry
- QuoteRequest
- InquiryAttachment
- InquiryNote
- NewsletterSubscriber
- Testimonial

**Website**
- FAQ
- Media
- MediaFolder
- SEOSetting
- Redirect
- PageView

### Database requirements

- Use UUID or suitable stable primary identifiers.
- Use unique slugs.
- Create appropriate foreign keys.
- Create indexes for frequently queried columns.
- Use timestamps.
- Use soft deletion where appropriate.
- Use database transactions for related operations.
- Use pagination for large data sets.
- Use appropriate cascade and restrict rules.
- Avoid N+1 queries.
- Validate uniqueness before database writes.
- Ensure project and service relationships are consistent.

### Important relationships

- One project belongs to one primary category.
- One project can have multiple images.
- One project can have multiple videos.
- One project can have multiple specifications.
- One service can have multiple features.
- One service can have multiple FAQs.
- One blog post can have multiple tags.
- One department can have multiple team members.
- One inquiry can have multiple internal notes.
- One media record can be reused in multiple website sections.

Create a complete Prisma schema and migrations.

Also create:
- Database setup documentation.
- Migration commands.
- Seed scripts.
- Initial Super Admin creation script.
- Database backup and restore instructions.

Do not hardcode database credentials.

Use environment variables.

Example:

DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/kayan_land"

Never commit real credentials to Git.

---

# PART 17 — MEDIA MANAGEMENT AND STORAGE

Create a centralized media library.

Admin should be able to upload:

- JPG.
- JPEG.
- PNG.
- WebP.
- AVIF where supported.
- SVG with sanitization.
- MP4 and other explicitly supported video formats.
- PDF documents.

Features:

- Drag-and-drop upload.
- Multiple uploads.
- Image preview.
- File size information.
- Image dimensions.
- Alternative text.
- Captions.
- Folder organization.
- Search.
- Media replacement.
- Reuse existing media.
- Delete unused media.

### Image optimization

- Generate responsive image variants.
- Use Next.js Image.
- Preserve original files where necessary.
- Avoid excessively large images.
- Generate thumbnails.
- Support lazy loading.
- Prevent layout shifts.

### Storage architecture

Use a configurable storage adapter.

Development:
- Local filesystem.

Production:
- S3-compatible object storage or another persistent storage provider.

Important:
Do not store binary image data directly inside MySQL.

Store media metadata and file paths in MySQL.

Do not assume that local filesystem storage is persistent on every hosting provider.

---

# PART 18 — DYNAMIC HOMEPAGE CMS

The administrator must be able to control the homepage without modifying code.

Create a homepage section manager.

Admin can:

- Enable/disable sections.
- Change section order.
- Edit titles.
- Edit descriptions.
- Upload section images.
- Change button text.
- Change button URLs.
- Select featured projects.
- Select featured services.
- Change statistics.
- Select testimonials.
- Change section backgrounds.

Use predefined section types and controlled layouts.

Do not allow arbitrary unsafe HTML execution.

All homepage sections must render from database configuration.

---

# PART 19 — SEO MANAGEMENT

Create a complete SEO management system.

### Global SEO
- Website title.
- Default meta description.
- Default Open Graph image.
- Canonical URL.
- Robots configuration.
- Site verification codes.

### Per-page SEO
- SEO title.
- Meta description.
- Canonical URL.
- Open Graph title.
- Open Graph description.
- Open Graph image.
- Index/noindex controls.

### Technical SEO
- Dynamic sitemap.xml.
- robots.txt.
- Canonical URLs.
- Clean URLs.
- 301 redirects.
- Structured data.
- Breadcrumbs.
- Image alt text.
- Proper heading hierarchy.
- Semantic HTML.

### Structured data

Implement appropriate Schema.org data:

- Organization.
- LocalBusiness where applicable.
- WebSite.
- WebPage.
- Service.
- Article.
- BreadcrumbList.

Do not invent:
- Business addresses.
- Telephone numbers.
- Ratings.
- Certifications.
- Registration details.

Only publish verified information.

### SEO dashboard

Display:
- Pages missing titles.
- Pages missing descriptions.
- Images missing alt text.
- Broken internal links where detectable.
- Duplicate metadata.
- Missing canonical URLs.
- Indexing configuration.
- Sitemap status.

---

# PART 20 — WEBSITE ANALYTICS

Create a privacy-conscious first-party analytics module.

Track:

- Total page views.
- Unique visitors using privacy-conscious identifiers.
- Daily visitors.
- Monthly visitors.
- Most visited pages.
- Project page views.
- Service page views.
- Traffic sources where available.
- Device categories.
- Country-level traffic where legally and technically appropriate.

Dashboard charts:
- Daily traffic.
- Monthly traffic.
- Top pages.
- Top projects.
- Inquiry conversion trends.

Prevent obvious duplicate and automated bot counting.

Do not claim that analytics data is accurate when tracking has not been implemented.

Respect applicable privacy and cookie requirements.

---

# PART 21 — RESPONSIVE DESIGN

The complete website must support:

- Desktop.
- Laptop.
- Tablet.
- Mobile.
- Large monitors.

Test at:
- 360px.
- 390px.
- 768px.
- 1024px.
- 1440px.
- 1920px.

Requirements:

- Responsive navigation.
- Responsive galleries.
- Responsive cards.
- Responsive dashboard tables.
- Mobile-friendly forms.
- No horizontal overflow.
- Accessible touch targets.
- Optimized images.

The admin dashboard must also work on mobile devices.

---

# PART 22 — ANIMATIONS AND INTERACTIONS

Use Framer Motion for meaningful animations.

Implement:

- Hero entrance animation.
- Scroll reveal.
- Section transitions.
- Image hover zoom.
- Project card interactions.
- Animated counters.
- Navigation transitions.
- Page transitions where appropriate.
- Gallery transitions.
- Smooth scrolling.
- Subtle parallax where appropriate.

Use Uiverse for selected interactive components.

Important:
- Keep animations elegant.
- Do not overload the website with animations.
- Respect prefers-reduced-motion.
- Avoid unnecessary JavaScript animation loops.
- Ensure animations do not damage performance or SEO.

---

# PART 23 — PERFORMANCE AND ACCESSIBILITY

Target strong Core Web Vitals.

Requirements:

- Server-side rendering where useful.
- Static generation for appropriate public pages.
- Incremental Static Regeneration where suitable.
- Revalidation after CMS updates.
- Optimized database queries.
- Lazy loading.
- Image optimization.
- Font optimization.
- Dynamic imports for heavy components.
- Proper caching.
- Loading skeletons.
- Error boundaries.

Accessibility:
- Semantic HTML.
- Keyboard navigation.
- Proper focus management.
- Form labels.
- Accessible dialogs.
- Image alt text.
- Sufficient color contrast.
- Screen-reader-friendly controls.

Aim for excellent Lighthouse scores, without sacrificing functionality or design.

---

# PART 24 — SECURITY REQUIREMENTS

Implement:

- Server-side validation.
- Authentication.
- Authorization.
- Secure password hashing.
- Rate limiting.
- SQL injection protection through Prisma's safe query APIs.
- XSS protection.
- CSRF protection where applicable.
- Secure file uploads.
- MIME type validation.
- File size limits.
- Secure cookies.
- Environment variable protection.
- Audit logs.
- Input sanitization.
- Error handling without leaking sensitive information.

Never expose:
- Database credentials.
- Authentication secrets.
- Password hashes.
- Private environment variables.
- Internal stack traces.

Use secure production configuration.

---

# PART 25 — PROJECT FOLDER STRUCTURE

Use a clean and maintainable structure similar to:

app/
  (public)/
    page.tsx
    about/
    services/
    projects/
    team/
    gallery/
    blog/
    contact/
    quote/
    faq/

  admin/
    login/
    dashboard/
    projects/
    services/
    team/
    gallery/
    blog/
    inquiries/
    media/
    analytics/
    settings/
    users/

  api/
    auth/
    contact/
    inquiries/
    upload/
    analytics/

  sitemap.ts
  robots.ts

components/
  ui/
  layout/
  public/
  admin/
  forms/
  gallery/
  projects/
  animations/

lib/
  auth/
  prisma/
  validations/
  permissions/
  storage/
  seo/
  analytics/
  utils/

actions/
  projects/
  services/
  blog/
  team/
  inquiries/
  settings/

prisma/
  schema.prisma
  migrations/
  seed.ts

types/
hooks/
public/
docs/

You may adjust the structure if there is a better architectural reason, but maintain clear separation of concerns.

---

# PART 26 — FUNCTIONAL REQUIREMENTS

Every feature must actually work.

Examples:

1. When an admin creates a project, it must be saved in MySQL.
2. When a project is published, it must appear on the public projects page.
3. When an admin changes a project image, the public page must show the updated image.
4. When an admin creates a service, it must appear in the services section.
5. When an admin changes the homepage content, the homepage must update.
6. When a visitor submits a contact form, the inquiry must be stored in MySQL.
7. When an admin updates an inquiry status, the database must be updated.
8. When an admin creates a blog post, the published article must have its own SEO-friendly URL.
9. When an admin uploads media, the media must appear in the media library.
10. When an admin changes company contact information, the footer and contact page must reflect those changes.

Use Next.js revalidation or an appropriate cache invalidation strategy after CMS updates.

Do not create fake functionality.

---

# PART 27 — INITIAL WEBSITE CONTENT

Create a seed process for initial data.

Use the following company information:

Company Name:
Kayan Land Architecture & Construction Company

Tagline:
Where Beauty and Functionality Unite in Design.

Instagram:
https://www.instagram.com/kayanland.acc/

Do not invent:
- Company address.
- Phone number.
- Email.
- Founding year.
- Number of employees.
- Completed projects.
- Certifications.
- Client names.
- Awards.

Use clearly identified placeholders for missing information.

The administrator must be able to enter verified information through the dashboard.

For images, use legitimate architectural placeholder images during development and provide an easy way to replace them through the media library.

Do not use images that falsely imply a particular project belongs to Kayan Land.

---

# PART 28 — DEVELOPMENT PHASES

Implement the system in controlled phases.

Do not attempt to generate the entire application in one uncontrolled code-generation step.

## Phase 1 — Project Foundation

- Inspect repository.
- Configure Next.js.
- Configure TypeScript.
- Configure Tailwind.
- Install shadcn/ui.
- Configure Prisma.
- Connect MySQL.
- Establish folder structure.
- Create shared design system.

Deliverable: Running application with successful MySQL connection.

## Phase 2 — Database and Authentication

- Design database schema.
- Implement Prisma models.
- Run migrations.
- Create seed scripts.
- Implement login.
- Implement RBAC.
- Implement secure sessions.
- Implement protected admin routes.

Deliverable: Secure administrator system.

## Phase 3 — Admin Dashboard

- Dashboard overview.
- Sidebar.
- Navigation.
- Admin profile.
- Settings.
- Analytics foundation.
- Audit logs.

Deliverable: Functional administration interface.

## Phase 4 — CMS Modules

Implement:

1. Projects.
2. Services.
3. Categories.
4. Team.
5. Gallery.
6. Blog.
7. Testimonials.
8. FAQs.
9. Media Library.
10. Homepage Manager.

Deliverable: Fully functional CMS with database integration.

## Phase 5 — Public Website

Build all public pages and connect them to MySQL.

Deliverable: Fully dynamic company website.

## Phase 6 — Inquiries

- Contact forms.
- Quote requests.
- Inquiry management.
- Attachments.
- Notifications.

Deliverable: Working customer communication system.

## Phase 7 — SEO and Analytics

- Metadata.
- Sitemap.
- Robots.
- Structured data.
- Analytics.
- SEO dashboard.

Deliverable: Search-engine-ready website.

## Phase 8 — Testing and Optimization

- Test all CRUD operations.
- Test all forms.
- Test authentication.
- Test permissions.
- Test responsive layouts.
- Test image uploads.
- Test SEO.
- Test database relationships.
- Test performance.
- Fix all errors.

Deliverable: Production-ready application.

---

# PART 29 — TESTING REQUIREMENTS

Use appropriate testing tools such as:

- Vitest or Jest.
- React Testing Library.
- Playwright.
- Prisma validation.
- TypeScript checks.
- ESLint.

Test these workflows:

1. Admin login.
2. Unauthorized dashboard access.
3. Create a project.
4. Edit a project.
5. Delete a project.
6. Publish a project.
7. Create a service.
8. Upload multiple images.
9. Create a blog post.
10. Submit a contact form.
11. Submit a quote request.
12. Update inquiry status.
13. Change homepage content.
14. Update SEO metadata.
15. Test mobile navigation.
16. Test role-based permissions.

Ensure there are no broken links, missing images, runtime errors, or nonfunctional buttons.

---

# PART 30 — FINAL DELIVERY REQUIREMENTS

When implementation is complete, provide:

1. Complete working source code.
2. Complete Prisma schema.
3. MySQL migration files.
4. Database seed scripts.
5. Admin login instructions.
6. Environment variable example file.
7. Installation guide.
8. Development commands.
9. Production build instructions.
10. Deployment guide.
11. Database backup instructions.
12. Media storage configuration.
13. Testing results.
14. List of implemented features.
15. List of any remaining limitations.

Create documentation in:

docs/PROJECT_DOCUMENTATION.md

docs/DATABASE_DOCUMENTATION.md

docs/ADMIN_GUIDE.md

docs/DEPLOYMENT_GUIDE.md

Create a safe initial Super Admin creation command. Never publish default production credentials.

---

# FINAL INSTRUCTION TO CURSOR

Your priority is to build a real, fully functional architecture and construction company website with a complete content management system.

Do not focus only on visual appearance.

The most important requirements are:

1. Premium architectural design.
2. Fully dynamic public website.
3. Complete admin dashboard.
4. MySQL database integration.
5. Proper backend architecture.
6. Secure authentication and permissions.
7. Functional media management.
8. Complete project portfolio management.
9. Dynamic homepage.
10. Professional SEO implementation.
11. Responsive user experience.
12. Production-ready code quality.

Before finishing each development phase:

- Run the application.
- Check the browser.
- Inspect the UI.
- Test the functionality.
- Check database operations.
- Fix errors.
- Report completed work.

Do not claim a feature is complete until it has been implemented and tested.

If information is missing, do not invent company facts. Create editable CMS fields and clearly marked placeholders.

Start by inspecting the existing repository and producing a detailed implementation plan. Then proceed phase by phase, implementing actual functionality rather than just generating design mockups.

**Final goal: Kayan Land must have a premium architectural website where the entire public-facing content is controlled through a secure, professional admin dashboard backed by MySQL.**