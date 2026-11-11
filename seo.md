\# MASTER SEO DEVELOPMENT PROMPT

\# KAYAN LAND — COMPLETE SEO OPTIMIZATION SYSTEM

\## Next.js + TypeScript + MySQL + Prisma + Admin SEO Dashboard



Act as a Senior Technical SEO Engineer, Next.js SEO Architect, Local SEO Specialist, Structured Data Engineer, and Full-Stack Developer.



Your task is to audit, implement, optimize, and continuously maintain the SEO of the complete Kayan Land Architecture \& Construction Company website.



\*\*Company:\*\* Kayan Land Architecture \& Construction Company



\*\*Tagline:\*\* Where Beauty and Functionality Unite in Design.



\*\*Website:\*\* Use the actual configured production domain from the project environment.



\*\*Instagram:\*\* https://www.instagram.com/kayanland.acc/



\*\*Technology stack:\*\*

\- Next.js App Router

\- TypeScript

\- React

\- MySQL

\- Prisma ORM

\- Tailwind CSS

\- shadcn/ui

\- Next.js Server Components

\- Next.js Server Actions

\- Next.js Route Handlers



IMPORTANT: SEO must be implemented throughout the existing website and CMS. Do not create a separate disconnected SEO application.



The system must automatically optimize public pages and provide a comprehensive SEO management dashboard where administrators can monitor and manage SEO.



\# PART 1 — FIRST AUDIT THE ENTIRE PROJECT



Before changing anything, inspect the complete repository.



Audit:



1\. All public pages.

2\. All dynamic routes.

3\. All project detail pages.

4\. All service detail pages.

5\. All blog pages.

6\. Homepage sections.

7\. Image components.

8\. Existing metadata.

9\. Existing sitemap.

10\. robots.txt.

11\. Canonical URLs.

12\. Structured data.

13\. Internal links.

14\. Heading hierarchy.

15\. Image optimization.

16\. Rendering strategies.

17\. Database schema.

18\. Admin dashboard.

19\. Existing SEO implementation.

20\. Performance and Core Web Vitals.



Create a complete SEO audit report.



Classify every issue:



\- Critical.

\- High.

\- Medium.

\- Low.

\- Passed.



For each issue provide:

\- Affected URL.

\- Problem.

\- Why it matters.

\- Recommended solution.

\- Implementation status.



Do not assume an SEO feature is implemented simply because a configuration file exists. Verify its actual output.



Save the audit report at:



docs/SEO\_AUDIT\_REPORT.md



\# PART 2 — COMPLETE SEO ARCHITECTURE



Implement these SEO categories:



1\. Technical SEO.

2\. On-Page SEO.

3\. Content SEO.

4\. Local SEO.

5\. Image SEO.

6\. International SEO readiness.

7\. Structured Data SEO.

8\. Internal Linking SEO.

9\. Performance SEO.

10\. Mobile SEO.

11\. Indexing and Crawling.

12\. SEO Analytics.

13\. SEO Administration.

14\. Search Engine Monitoring.



Every category must be integrated into the existing Next.js application.



\# PART 3 — TECHNICAL SEO



\## A. Metadata API



Use Next.js Metadata API.



Implement dynamic metadata for:



\- Homepage.

\- About page.

\- Services listing.

\- Individual service pages.

\- Projects listing.

\- Individual project pages.

\- Team listing.

\- Team member profiles.

\- Gallery.

\- Blog listing.

\- Blog articles.

\- Contact.

\- FAQ.

\- Other indexable public pages.



Every indexable page must have:



\- Unique title.

\- Unique meta description.

\- Canonical URL.

\- Open Graph title.

\- Open Graph description.

\- Open Graph image.

\- Twitter card metadata.

\- Appropriate robots directives.



Use generateMetadata() for dynamic pages.



Generate metadata from MySQL through Prisma.



Use sensible defaults when individual metadata is missing.



Do not generate duplicate titles and descriptions across all projects or services.



\## B. Canonical URLs



Implement canonical URLs using the configured production domain.



Requirements:



\- HTTPS.

\- One preferred hostname.

\- Consistent trailing slash policy.

\- No duplicate URLs.

\- No accidental localhost canonical URLs.

\- No duplicate query-parameter URLs.

\- Correct canonical URLs for paginated or filtered content.



Ensure canonical URLs are self-referencing where appropriate.



Do not canonicalize unrelated project pages to the homepage.



\## C. Sitemap.xml



Create dynamic sitemap generation using Next.js.



Include published:



\- Static pages.

\- Services.

\- Projects.

\- Blog posts.

\- Other important public content.



Exclude:



\- Admin pages.

\- Login pages.

\- Draft content.

\- Private pages.

\- Deleted content.

\- Noindex pages.

\- Internal API endpoints.



Requirements:



\- Valid XML.

\- Absolute canonical URLs.

\- Accurate lastModified dates.

\- Appropriate sitemap splitting for large websites.

\- Sitemap index when required.



Do not include unpublished content.



\## D. Robots.txt



Create dynamic or static robots.txt with correct crawling instructions.



Requirements:



\- Allow public pages.

\- Disallow private admin routes.

\- Disallow sensitive internal routes.

\- Include the production sitemap URL.



Important: robots.txt is not a replacement for authentication or noindex directives.



Do not block CSS, JavaScript, or images needed for rendering.



\## E. Redirect Management



Create a redirect management system.



Support:



\- 301 redirects.

\- 302 redirects.

\- Old URL to new URL mapping.

\- Redirect validation.

\- Redirect loop prevention.

\- Redirect chain detection.



Admin can manage redirects from the SEO dashboard.



Do not redirect all missing URLs to the homepage.



\# PART 4 — DYNAMIC ON-PAGE SEO



Create a reusable SEO system for all CMS content.



\## Projects



Each project needs:



\- SEO title.

\- Meta description.

\- Focus keyword.

\- Secondary keywords.

\- Canonical URL.

\- Open Graph title.

\- Open Graph description.

\- Open Graph image.

\- Image alt text.

\- Index/follow controls.



\## Services



Each service needs:



\- SEO title.

\- Meta description.

\- Focus keyword.

\- Related keywords.

\- Canonical URL.

\- Open Graph image.

\- Structured data.

\- Indexing controls.



\## Blog



Each article needs:



\- SEO title.

\- Meta description.

\- Focus keyword.

\- Secondary keywords.

\- URL slug.

\- Canonical URL.

\- Article schema.

\- Open Graph image.

\- Social metadata.

\- Author information.

\- Publication date.

\- Updated date.



\## Static Pages



Administrators must be able to configure SEO for:



\- Home.

\- About.

\- Contact.

\- Services.

\- Projects.

\- Gallery.

\- Team.

\- Blog.

\- FAQ.



All SEO data must be saved in MySQL.



\# PART 5 — KEYWORD RESEARCH AND CONTENT SEO



Create a keyword management module.



IMPORTANT: Do not invent keyword search volumes, ranking positions, competition levels, or search trends.



Use real keyword research data when connected to an authoritative source.



Start with a keyword research framework.



Potential keyword themes:



\- Architecture company.

\- Architecture and construction company.

\- Architectural design services.

\- Residential construction.

\- Commercial construction.

\- Interior design.

\- Exterior design.

\- Building design.

\- Structural engineering.

\- Construction project management.

\- House design.

\- Modern architectural design.



These are seed keyword ideas, not verified search-volume opportunities.



If the company operates in Afghanistan or another specific market, research the actual target location before finalizing local keywords.



\### Keyword Management Dashboard



Create:



\- Keyword.

\- Target URL.

\- Search intent.

\- Keyword category.

\- Language.

\- Target location.

\- Priority.

\- Content status.

\- Ranking position (only when supported by real ranking data).

\- Search volume (only when sourced).

\- Competition (only when sourced).



Support keyword mapping to prevent multiple pages competing for the same primary search intent.



\### Content Optimization



Provide recommendations for:



\- Missing content.

\- Thin content.

\- Duplicate content.

\- Missing headings.

\- Missing descriptions.

\- Missing internal links.

\- Unclear search intent.

\- Missing location relevance.



Do not keyword-stuff content.



Do not generate repetitive AI content just to increase the number of pages.



\# PART 6 — LOCAL SEO



Local SEO is especially important for an architecture and construction company.



First, determine the company's actual operating locations using verified information supplied by the administrator.



Never invent a business address, phone number, or service area.



Implement:



\## Business Information



Dashboard fields:



\- Official company name.

\- Business description.

\- Address.

\- City.

\- Region.

\- Country.

\- Postal code.

\- Phone.

\- Email.

\- Website.

\- Business opening hours.

\- Latitude.

\- Longitude.

\- Service areas.

\- Social profiles.



\## Local SEO Optimization



Implement:



\- Consistent company information across pages.

\- Location-specific landing pages where justified.

\- Local business schema when eligible.

\- Contact page location information.

\- Location-specific service descriptions.

\- Google Business Profile integration guidance.

\- Map embedding when verified coordinates are provided.



\## LocalBusiness Structured Data



Generate appropriate structured data.



Do not publish incomplete or false information.



Do not invent ratings, reviews, opening hours, or business registration information.



\# PART 7 — IMAGE SEO



Architecture websites rely heavily on images, so image optimization is essential.



Audit every public image.



Implement:



1\. Descriptive filenames where practical.

2\. Accurate alt text.

3\. Image title and caption where useful.

4\. Responsive image sizes.

5\. WebP/AVIF where supported.

6\. Lazy loading below the fold.

7\. Appropriate priority loading for the main hero image.

8\. Explicit width and height.

9\. Image compression.

10\. Correct image dimensions.

11\. Image sitemap support if useful.

12\. Optimized Open Graph images.



\### Media Library SEO Fields



Add these fields to the media management system:



\- Alt Text.

\- Image Title.

\- Caption.

\- Description.

\- Original Filename.

\- Optimized Filename.

\- Image Width.

\- Image Height.

\- File Size.

\- MIME Type.

\- Image URL.



Admin must be able to update image SEO information.



Generate missing-alt-text reports.



Do not automatically generate inaccurate alt text.



Avoid stuffing keywords into every image description.



\# PART 8 — STRUCTURED DATA / SCHEMA.ORG



Implement JSON-LD structured data using valid Schema.org types.



Use the appropriate schema for each page.



\### Homepage

\- Organization.

\- WebSite.



\### About Page

\- Organization or relevant company information.



\### Service Pages

\- Service.

\- BreadcrumbList.



\### Project Pages

\- CreativeWork or another accurate applicable type.

\- BreadcrumbList.



Do not label ordinary portfolio projects as products for sale.



\### Blog Articles

\- Article or BlogPosting.

\- BreadcrumbList.



\### Contact Page

\- LocalBusiness only when verified information supports it.



\### FAQ

\- FAQPage only when content meets applicable search engine guidelines.



Important:

\- Use actual MySQL data.

\- Validate JSON-LD.

\- Prevent duplicate schema.

\- Escape data safely.

\- Do not create fake ratings.

\- Do not create fake reviews.

\- Do not add unsupported claims.



Validate structured data with Google's Rich Results Test and Schema.org Validator.



\# PART 9 — INTERNAL LINKING



Implement an internal linking strategy.



Create relevant links between:



\- Homepage and services.

\- Homepage and featured projects.

\- Services and related projects.

\- Projects and related services.

\- Projects and other related projects.

\- Blog articles and related services.

\- Blog articles and relevant projects.

\- About and team pages.

\- Contact and service pages.



Implement:



\- Breadcrumb navigation.

\- Related projects.

\- Related services.

\- Related articles.

\- Contextual links.

\- Descriptive anchor text.



Create an internal-link audit.



Detect:



\- Broken internal links.

\- Orphan pages.

\- Pages with insufficient internal links.

\- Excessive repeated links.

\- Broken breadcrumbs.



Do not automatically create irrelevant links.



\# PART 10 — INTERNATIONAL SEO READINESS



The company may target multiple language audiences.



Design the database and routing architecture to support:



\- English.

\- Dari.

\- Pashto.



Do not force all languages into a single page without proper localization.



Requirements:



\- Localized URLs where appropriate.

\- Language-specific metadata.

\- Language-specific slugs.

\- hreflang tags.

\- x-default where appropriate.

\- Correct language attributes.

\- Localized sitemap entries.

\- Canonical URLs for each language version.



Only generate hreflang references for real, available translations.



Do not create hreflang links to nonexistent pages.



\# PART 11 — SEO-FRIENDLY NEXT.JS IMPLEMENTATION



Use Next.js features correctly.



Implement:



\- generateMetadata().

\- generateStaticParams() where appropriate.

\- sitemap.ts.

\- robots.ts.

\- Dynamic Open Graph images where appropriate.

\- Server Components.

\- Static rendering where appropriate.

\- ISR for frequently updated CMS content.

\- Revalidation after content updates.



Use a reusable SEO utility.



Example architecture:



lib/seo/

&#x20; metadata.ts

&#x20; canonical.ts

&#x20; schema.ts

&#x20; sitemap.ts

&#x20; robots.ts

&#x20; keywords.ts

&#x20; internal-links.ts

&#x20; seo-audit.ts



Do not duplicate metadata logic across every page.



Avoid unnecessary client-side rendering for SEO-critical content.



Ensure search engine crawlers can access the main page content.



\# PART 12 — MYSQL SEO DATABASE



Extend the existing Prisma schema carefully.



Do not destroy existing database models.



Add suitable SEO models and relations.



Recommended models:



1\. SEOSetting

2\. PageSEO

3\. Keyword

4\. KeywordMapping

5\. Redirect

6\. SEOAudit

7\. SEOIssue

8\. SEOAuditHistory

9\. SearchPerformanceSnapshot (only for real imported data)

10\. SitemapConfiguration



\### SEOSetting



Fields:

\- id.

\- siteName.

\- defaultTitle.

\- defaultDescription.

\- defaultOgImage.

\- canonicalBaseUrl.

\- defaultRobots.

\- defaultLanguage.

\- createdAt.

\- updatedAt.



\### PageSEO



Fields:

\- id.

\- pageType.

\- pageId (nullable for static pages).

\- route.

\- seoTitle.

\- metaDescription.

\- focusKeyword.

\- canonicalUrl.

\- ogTitle.

\- ogDescription.

\- ogImage.

\- robotsIndex.

\- robotsFollow.

\- createdAt.

\- updatedAt.



\### Keyword



Fields:

\- id.

\- keyword.

\- language.

\- location.

\- searchIntent.

\- category.

\- searchVolume (nullable).

\- competition (nullable).

\- source.

\- priority.

\- createdAt.

\- updatedAt.



\### Redirect



Fields:

\- id.

\- sourcePath.

\- destinationPath.

\- redirectType.

\- active.

\- createdAt.

\- updatedAt.



\### SEOAudit



Fields:

\- id.

\- auditDate.

\- totalPages.

\- passedIssues.

\- criticalIssues.

\- highIssues.

\- mediumIssues.

\- lowIssues.

\- auditStatus.



\### SEOIssue



Fields:

\- id.

\- auditId.

\- pageUrl.

\- issueType.

\- severity.

\- description.

\- recommendation.

\- status.

\- detectedAt.

\- resolvedAt.



\### SEOAuditHistory



Store historical audit results so the administrator can track improvement over time.



Add suitable indexes, foreign keys, and unique constraints.



Where polymorphic relationships are used, validate entity existence and ownership in application logic.



Use database migrations and preserve existing production data.



\# PART 13 — ADVANCED SEO ADMIN DASHBOARD



Route:



/admin/seo



Create a complete SEO management dashboard.



Use shadcn/ui, Tailwind CSS, Lucide React, and Recharts.



The design must match the existing admin dashboard.



\## A. SEO Overview



Display:



\- Total indexable pages.

\- Pages with SEO metadata.

\- Pages missing SEO metadata.

\- Pages with missing descriptions.

\- Pages with missing alt text.

\- Pages with duplicate titles.

\- Pages with duplicate descriptions.

\- Broken internal links.

\- Redirect errors.

\- Critical SEO issues.



Create a historical SEO health chart.



IMPORTANT:

Do not invent an SEO score.



If displaying an SEO health score, document the scoring methodology and calculate it from actual audited issues.



\## B. Technical SEO



Route: /admin/seo/technical



Display:

\- Sitemap status.

\- Robots.txt status.

\- Canonical issues.

\- Indexing issues.

\- Redirect issues.

\- Broken links.

\- Duplicate URLs.

\- HTTP errors.

\- Mobile usability issues where supported.



\## C. On-Page SEO



Route: /admin/seo/on-page



Create a searchable table:



\- Page URL.

\- Page type.

\- SEO title.

\- Meta description.

\- Focus keyword.

\- Canonical URL.

\- Index status.

\- SEO audit status.

\- Edit action.



Filters:

\- All pages.

\- Missing metadata.

\- Duplicate metadata.

\- Noindex.

\- Draft.

\- Published.



\## D. Keyword Management



Route: /admin/seo/keywords



Features:

\- Add keywords.

\- Edit keywords.

\- Delete keywords.

\- Map keywords to pages.

\- Filter by language.

\- Filter by location.

\- Filter by intent.

\- Track verified ranking data when available.



\## E. Image SEO



Route: /admin/seo/images



Display:

\- Images missing alt text.

\- Images with oversized file sizes.

\- Images missing dimensions.

\- Images with generic filenames.

\- Images missing captions where appropriate.



Provide links to the related media record.



\## F. Content SEO



Route: /admin/seo/content



Analyze:

\- Missing content.

\- Thin content.

\- Duplicate content.

\- Heading hierarchy.

\- Keyword targeting.

\- Internal linking.

\- Content readability.



Do not make rigid word-count rules for all pages. A project portfolio page and a service page have different content requirements.



\## G. Local SEO



Route: /admin/seo/local



Manage:

\- Business information.

\- Service areas.

\- Business schema.

\- Contact details.

\- Social profiles.

\- Map coordinates.

\- Location-specific content.



\## H. Redirect Management



Route: /admin/seo/redirects



Allow administrators to create, edit, disable, and delete redirects.



\## I. SEO Audit History



Route: /admin/seo/history



Display:

\- Audit date.

\- Number of scanned pages.

\- Issues detected.

\- Issues resolved.

\- New issues.

\- Historical SEO health.



Provide comparison between audit runs.



\# PART 14 — AUTOMATED SEO AUDIT ENGINE



Create a real automated audit engine.



The system must crawl the public website and analyze accessible pages.



Audit:



1\. Missing page titles.

2\. Duplicate titles.

3\. Long or empty titles.

4\. Missing descriptions.

5\. Duplicate descriptions.

6\. Missing canonical tags.

7\. Incorrect canonical URLs.

8\. Missing H1.

9\. Multiple inappropriate H1 headings.

10\. Broken internal links.

11\. Missing image alt text.

12\. Large image files.

13\. Missing structured data.

14\. Invalid structured data where detectable.

15\. Noindex pages.

16\. Missing sitemap URLs.

17\. Broken redirects.

18\. Redirect chains.

19\. Orphan pages where detectable.

20\. Missing Open Graph metadata.

21\. Incorrect robots directives.

22\. Pages with HTTP errors.

23\. Missing language metadata.

24\. Missing hreflang references where applicable.



\### Audit execution



Provide:

\- Run SEO Audit button.

\- Audit progress.

\- Scanned page count.

\- Successful page count.

\- Failed page count.

\- Issues by severity.

\- Audit completion time.



Implement:

\- Queue or background processing for large sites.

\- Crawl limits.

\- Crawl delay.

\- Same-domain restrictions.

\- Timeouts.

\- Retry handling.

\- Duplicate URL detection.



Important:

Never allow the crawler to request arbitrary internal network addresses or private infrastructure. Validate URLs to prevent SSRF.



Respect robots.txt for external crawling policies and use reasonable crawl rates.



Do not crawl private admin routes.



\### Fix management



Each issue must include:

\- Explanation.

\- Affected URL.

\- Severity.

\- Recommended solution.

\- Fix status.

\- Link to the relevant CMS editor.



Only implement automatic fixes where safe.



Never silently change important SEO content without administrator approval.



\# PART 15 — GOOGLE SEARCH CONSOLE INTEGRATION



Prepare integration with Google Search Console API.



Allow administrators to connect the verified website property through secure OAuth.



Where authorized data is available, display:



\- Total clicks.

\- Total impressions.

\- Average CTR.

\- Average position.

\- Top search queries.

\- Top landing pages.

\- Country performance.

\- Device performance.

\- Search appearance.



Create charts:



\- Clicks over time.

\- Impressions over time.

\- CTR over time.

\- Average position over time.



Allow date filtering:



\- Last 7 days.

\- Last 28 days.

\- Last 3 months.

\- Last 6 months.

\- Custom date range.



Important:



\- Do not fake Google Search Console data.

\- Clearly distinguish imported search performance data from local website analytics.

\- Handle API quotas.

\- Secure OAuth credentials.

\- Provide a clear connection status.

\- If integration is not configured, show setup instructions instead of fake charts.



\# PART 16 — GOOGLE ANALYTICS INTEGRATION



Prepare Google Analytics 4 integration.



Track:



\- Page views.

\- Landing pages.

\- Traffic acquisition.

\- Device categories.

\- Engagement.

\- Contact form submissions.

\- Quote requests.

\- Project page engagement.

\- Service page engagement.



Create conversion events:



\- contact\_form\_submit.

\- quote\_request\_submit.

\- phone\_click.

\- email\_click.

\- whatsapp\_click.

\- project\_inquiry.



Use consent-aware tracking and applicable privacy requirements.



Clearly separate first-party analytics from Google Analytics data.



\# PART 17 — CORE WEB VITALS AND PERFORMANCE SEO



Audit and optimize:



\### LCP

\- Optimize hero images.

\- Avoid lazy loading the main LCP image.

\- Preload important resources where appropriate.

\- Optimize server response time.



\### INP

\- Reduce unnecessary client-side JavaScript.

\- Optimize event handlers.

\- Avoid expensive interactions.



\### CLS

\- Define image dimensions.

\- Reserve space for dynamic content.

\- Avoid unexpected layout shifts.

\- Load fonts correctly.



Also analyze:

\- Page weight.

\- JavaScript bundle size.

\- CSS delivery.

\- Image delivery.

\- Font loading.

\- Server response.

\- Caching.

\- Database query performance.



Use Lighthouse and PageSpeed Insights as verification tools.



Do not claim that a website passes Core Web Vitals without actual measurements.



\# PART 18 — SEO CONTENT EDITOR INTEGRATION



Integrate an SEO panel into existing CMS forms.



For Projects, Services, Blog Posts, and Pages, provide an SEO tab.



Display:



\- SEO title editor.

\- Meta description editor.

\- Focus keyword.

\- Secondary keywords.

\- URL slug.

\- Canonical URL.

\- Open Graph image.

\- Index/noindex controls.

\- Follow/nofollow controls.

\- Search result preview.

\- Social sharing preview.



\### SEO recommendations



Provide useful feedback:



\- Title is missing.

\- Description is missing.

\- Title is duplicated.

\- Description is duplicated.

\- Main keyword is not naturally represented.

\- Image alt text is missing.

\- Canonical URL is invalid.

\- Heading structure needs improvement.



Use contextual guidance rather than arbitrary SEO rules.



Do not guarantee search ranking based on a checklist.



\# PART 19 — CONTENT AND INDEXING RULES



Define indexing rules carefully.



Index:

\- Published projects.

\- Published services.

\- Published blog posts.

\- Public company pages.



Do not index:

\- Admin dashboard.

\- Login.

\- Private pages.

\- Draft content.

\- Internal search result pages where inappropriate.

\- Duplicate filter URLs.

\- Development URLs.



Do not automatically noindex useful category pages without evaluating their search value.



Ensure all published pages are reachable through appropriate internal links.



\# PART 20 — SEO PERFORMANCE REPORTS



Create downloadable reports.



Formats:

\- PDF.

\- CSV.



Reports should include:



1\. SEO overview.

2\. Technical SEO findings.

3\. On-page SEO findings.

4\. Image SEO findings.

5\. Local SEO findings.

6\. Broken links.

7\. Duplicate metadata.

8\. Keyword mapping.

9\. Search Console performance, if connected.

10\. Historical comparison.



Allow date filtering and report generation.



Do not mix estimated or missing data with verified metrics.



\# PART 21 — TESTING AND VALIDATION



Use:



\- Google Search Console.

\- Google Rich Results Test.

\- Schema.org Validator.

\- Google PageSpeed Insights.

\- Lighthouse.

\- Playwright.

\- TypeScript checks.

\- ESLint.



Test:



1\. Homepage metadata.

2\. Project metadata.

3\. Service metadata.

4\. Blog metadata.

5\. Canonical URLs.

6\. Sitemap XML.

7\. robots.txt.

8\. Structured data.

9\. Image alt text.

10\. Internal links.

11\. Redirects.

12\. Admin SEO editor.

13\. Dynamic metadata after database updates.

14\. Noindex behavior.

15\. Multilingual metadata where implemented.



Test actual production-like HTML output.



Do not rely exclusively on development mode.



\# PART 22 — IMPLEMENTATION PHASES



Implement in this order.



\## Phase 1: SEO Audit



Inspect the website and create the complete audit report.



Do not modify content unnecessarily.



\## Phase 2: Technical SEO Foundation



Implement:

\- Metadata API.

\- Canonical URLs.

\- Sitemap.

\- Robots.

\- Redirects.

\- Structured data foundation.



\## Phase 3: Dynamic CMS SEO



Integrate SEO fields into:

\- Projects.

\- Services.

\- Blog.

\- Static pages.

\- Media library.



\## Phase 4: Image and Content SEO



Implement image optimization, alt-text management, content analysis, and internal linking.



\## Phase 5: Local and International SEO



Implement verified business information, local structured data, localization readiness, and hreflang.



\## Phase 6: SEO Dashboard



Build all dashboard pages, issue tracking, audit history, keyword management, and reporting.



\## Phase 7: Automated SEO Auditing



Implement the crawler, audit engine, issue classification, and safe fix workflow.



\## Phase 8: Search Console and Analytics



Implement external integrations when credentials and authorization are available.



\## Phase 9: Performance and Validation



Run all technical, performance, accessibility, and SEO tests.



Fix identified issues.



\# PART 23 — FINAL DOCUMENTATION



Create:



docs/SEO\_ARCHITECTURE.md



docs/SEO\_AUDIT\_REPORT.md



docs/SEO\_IMPLEMENTATION\_REPORT.md



docs/GOOGLE\_SEARCH\_CONSOLE\_SETUP.md



docs/GOOGLE\_ANALYTICS\_SETUP.md



docs/LOCAL\_SEO\_GUIDE.md



docs/SEO\_ADMIN\_GUIDE.md



Document:

\- Implemented features.

\- Database changes.

\- Environment variables.

\- External API requirements.

\- Audit methodology.

\- Scoring methodology.

\- Testing results.

\- Known limitations.



\# FINAL INSTRUCTIONS



Build an actual SEO system, not a visual SEO dashboard with fake statistics.



The final implementation must:



1\. Automatically generate SEO metadata from MySQL.

2\. Optimize every public page.

3\. Generate valid sitemaps.

4\. Configure robots.txt.

5\. Implement canonical URLs.

6\. Generate appropriate structured data.

7\. Optimize images.

8\. Support local SEO.

9\. Support multilingual SEO architecture.

10\. Analyze internal links.

11\. Provide automated technical SEO audits.

12\. Track and manage SEO issues.

13\. Integrate Google Search Console when authorized.

14\. Integrate Google Analytics when configured.

15\. Provide an advanced SEO dashboard.

16\. Allow administrators to manage SEO without editing source code.

17\. Maintain strong Next.js performance and security.



Never fabricate ranking positions, impressions, clicks, traffic, keyword volumes, ratings, or SEO scores.



Never guarantee first-page rankings.



Use verified data and clearly identify unavailable integrations.



Start by inspecting the entire existing Kayan Land project. Produce the audit report, then implement each phase without breaking existing functionality.



The final goal is to make Kayan Land technically search-engine-ready, locally discoverable in its verified target markets, and manageable through a professional SEO dashboard.

