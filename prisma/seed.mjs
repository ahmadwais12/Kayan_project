import { PrismaClient } from "@prisma/client";
import { hash, Algorithm } from "@node-rs/argon2";
import { seedTranslations } from "./seed-translations.mjs";

try {
  process.loadEnvFile();
} catch {
  // .env is optional when variables are already exported.
}

const prisma = new PrismaClient();

const PERMISSIONS = [
  ["dashboard.view", "View dashboard", "Administration"],
  ["content.manage", "Manage website content", "Content"],
  ["projects.manage", "Manage projects", "Content"],
  ["services.manage", "Manage services", "Content"],
  ["team.manage", "Manage team", "Content"],
  ["blog.manage", "Manage blog", "Content"],
  ["gallery.manage", "Manage gallery", "Content"],
  ["media.manage", "Manage media library", "Content"],
  ["inquiries.manage", "Manage inquiries", "Customers"],
  ["settings.manage", "Manage settings", "Administration"],
  ["users.manage", "Manage administrators and roles", "Administration"],
  ["audit.view", "View audit log", "Administration"],
  ["analytics.view", "View analytics", "Administration"],
];

const ROLE_PERMISSIONS = {
  "super-admin": PERMISSIONS.map(([key]) => key),
  admin: [
    "dashboard.view",
    "content.manage",
    "projects.manage",
    "services.manage",
    "team.manage",
    "blog.manage",
    "gallery.manage",
    "media.manage",
    "inquiries.manage",
    "analytics.view",
  ],
  "content-manager": [
    "dashboard.view",
    "content.manage",
    "projects.manage",
    "services.manage",
    "team.manage",
    "blog.manage",
    "gallery.manage",
    "media.manage",
  ],
  editor: ["dashboard.view", "blog.manage", "projects.manage"],
};

// Staff accounts added alongside the super admin so every seeded role can sign in.
// Existing accounts keep their password; only the role and active flag are aligned.
const STAFF_USERS = [
  { name: "Kayan Admin", email: "manager@kayanland.local", role: "admin" },
  { name: "Kayan Content Manager", email: "content@kayanland.local", role: "content-manager" },
  { name: "Kayan Editor", email: "editor@kayanland.local", role: "editor" },
];

const SETTINGS = {
  siteName: "Kayan Land",
  siteLegalName: "Kayan Land Architecture & Construction Company",
  tagline: "Where Beauty and Functionality Unite in Design.",
  siteDescription:
    "Kayan Land is an architecture and construction company creating considered spaces where beauty and functionality meet.",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  workingHours: "",
  mapEmbedUrl: "",
  footerAbout:
    "Architecture and construction studio creating enduring spaces through thoughtful design and disciplined delivery.",
  copyright: "Kayan Land Architecture & Construction Company. All rights reserved.",
  logoUrl: "/brand/kayan-mark.png",
  faviconUrl: "/brand/kayan-favicon.png",
  instagramUrl: "https://www.instagram.com/kayanland.acc/",
  facebookUrl: "",
  linkedinUrl: "",
  whatsappUrl: "",
  primaryColor: "#172B35",
  secondaryColor: "#343B3D",
  accentColor: "#C49A68",
  backgroundColor: "#F3F0E9",
  mutedColor: "#E7E3DA",
  whiteColor: "#FFFFFF",
};

const HOMEPAGE_SECTIONS = [
  {
    key: "hero",
    title: "Where Beauty and Functionality Unite in Design.",
    subtitle: "Kayan Land — Architecture & Construction",
    description:
      "We shape architecture and construction around the way people live and work — balancing composition, material, and the everyday performance of a building.",
    imageUrl: "/images/hero.jpg",
    buttonLabel: "Explore Projects",
    buttonUrl: "/projects",
    secondaryLabel: "Start Your Project",
    secondaryUrl: "/quote",
    sortOrder: 1,
  },
  {
    key: "about",
    title: "Designing with intention. Building with clarity.",
    subtitle: "About Kayan Land",
    description:
      "Our practice brings architecture, engineering, and construction into one continuous conversation, so that the idea on paper survives every decision made on site.",
    imageUrl: "/images/about-studio.jpg",
    buttonLabel: "About the Studio",
    buttonUrl: "/about",
    sortOrder: 2,
  },
  {
    key: "mission",
    title: "Design that serves the everyday.",
    subtitle: "Our mission",
    description:
      "To design and build spaces that balance beauty, function, and long-term performance — and to make every stage of the process clear for the people we work with.",
    sortOrder: 21,
  },
  {
    key: "vision",
    title: "A practice known for thoughtful delivery.",
    subtitle: "Our vision",
    description:
      "To be recognised for architecture that responds to its place, and for construction that carries the design intent through to handover without compromise.",
    sortOrder: 22,
  },
  {
    key: "services",
    title: "From the first sketch to the final handover.",
    subtitle: "What We Do",
    description:
      "A coordinated set of design, engineering, and construction services for residential, commercial, and interior projects.",
    sortOrder: 3,
  },
  {
    key: "projects",
    title: "Selected work and design studies.",
    subtitle: "Portfolio",
    description:
      "A growing collection of spaces defined by restraint, natural material, and a careful relationship to context.",
    sortOrder: 4,
  },
  {
    key: "why",
    title: "One team, from concept to completion.",
    subtitle: "Why Kayan Land",
    description:
      "We keep design intent and construction reality in the same room — reducing gaps, surprises, and compromises along the way.",
    sortOrder: 5,
  },
  {
    key: "stats",
    title: "Built on care, measured in detail.",
    subtitle: "By the Numbers",
    description:
      "Verified company figures will appear here once confirmed by the administration team.",
    sortOrder: 6,
  },
  {
    key: "process",
    title: "A clear process, at every stage.",
    subtitle: "How We Work",
    description:
      "Six considered stages take a project from the first conversation to the moment the keys change hands.",
    sortOrder: 7,
  },
  {
    key: "testimonials",
    title: "In the words of our clients.",
    subtitle: "Testimonials",
    description: "Client feedback will be published here as projects are completed.",
    sortOrder: 8,
  },
  {
    key: "blog",
    title: "Notes on design, material, and building.",
    subtitle: "Journal",
    description: "Ideas from the studio on how thoughtful spaces come together.",
    buttonLabel: "Read the Journal",
    buttonUrl: "/blog",
    sortOrder: 9,
  },
  {
    key: "cta",
    title: "Let's build something extraordinary.",
    subtitle: "Start a Conversation",
    description:
      "Tell us about your site, your ambitions, and how you want the space to feel. We will take it from there.",
    imageUrl: "/images/project-courtyard.jpg",
    buttonLabel: "Start Your Project",
    buttonUrl: "/quote",
    secondaryLabel: "Contact Our Team",
    secondaryUrl: "/contact",
    sortOrder: 10,
  },
  {
    key: "faq",
    title: "Frequently asked questions",
    subtitle: "Help",
    description: "Common questions about the studio, the process, and working together.",
    sortOrder: 11,
  },
  {
    key: "team",
    title: "Team",
    subtitle: "The people",
    description: "The profiles published by the studio, organised by department.",
    sortOrder: 12,
  },
  {
    key: "gallery",
    title: "Gallery",
    subtitle: "Visual record",
    description: "Spaces, materials, and details recorded by the studio.",
    sortOrder: 13,
  },
  {
    key: "contact",
    title: "Contact the studio",
    subtitle: "Get in touch",
    description:
      "Tell us about your site, your project, or the question you have. We will respond using the details you provide.",
    sortOrder: 14,
  },
  {
    key: "quote",
    title: "Request a quote",
    subtitle: "Start a project",
    description:
      "Tell us about the site, the spaces you need, and how you want them to work. The more detail you share, the more useful our response can be.",
    sortOrder: 15,
  },
  {
    key: "privacy",
    title: "Privacy Policy",
    subtitle: "How this website handles information",
    description: `This policy explains what information is collected through this website and how it is used.

## Information you provide

When you send a contact message, submit a project brief, or subscribe to studio notes, the website stores the details you enter — such as your name, email address, phone number, project information, and any files you attach. This information is used only to respond to your enquiry, evaluate a potential project, or send the updates you asked for.

## Information collected automatically

The website records page views using a first-party analytics cookie. The cookie contains a random identifier and is used to count visits and understand which pages are useful. It is not used for advertising and is not shared with third-party analytics networks. Server logs and administrator sessions may record technical details such as IP address and browser type for security and troubleshooting.

## How information is stored

Enquiry details and attachments are stored in the studio's own database and file storage. Access is limited to authorised administrators. Uploaded reference files are kept private and are only available to signed-in administrators.

## Sharing

Information is not sold. It may be shared with service providers who help operate the website or email delivery, strictly for those purposes. Information may also be disclosed where required by law.

## Retention and your choices

Enquiries are retained while they are relevant to studio work and administration. You can ask for your enquiry or subscription to be removed by contacting the studio using the details on the Contact page. Newsletter messages include an unsubscribe route.

## Contact

Questions about this policy can be sent through the Contact page. This policy should be reviewed by the company's legal adviser before publication.`,
    sortOrder: 90,
  },
  {
    key: "terms",
    title: "Terms & Conditions",
    subtitle: "Using this website",
    description: `These terms apply to the use of this website.

## Website content

The content on this website is provided for general information about the studio, its services, and its work. Project descriptions, images, and timelines are illustrative and may change. Nothing on this website constitutes a professional appointment, a binding quotation, or a contract.

## Enquiries and quotations

Submitting a contact message or project brief does not create a contract. Any engagement begins only through a separate written agreement signed by the studio and the client. Fees, scope, programme, and deliverables are defined in that agreement.

## Intellectual property

Text, drawings, photographs, and other material on this website belong to the studio or are used with permission. They may not be copied, reproduced, or used commercially without written consent.

## Accuracy and availability

The studio aims to keep information accurate and the website available, but does not guarantee uninterrupted access or that every item is free of error. External links are provided for convenience and are not endorsements.

## Limitation

To the extent permitted by law, the studio is not liable for loss arising from reliance on general website content or from interruptions to the website. Nothing in these terms limits liability that cannot lawfully be limited.

## Governing terms

These terms should be read together with any project agreement. They should be reviewed by the company's legal adviser before publication. Questions can be sent through the Contact page.`,
    sortOrder: 91,
  },
];

const WHY_ITEMS = [
  ["Architectural excellence", "Design decisions are tested against proportion, light, material, and the experience of the people who will use the space."],
  ["Construction discipline", "Detailed documentation and coordinated site management keep the built result aligned with the design intent."],
  ["Integrated engineering", "Structure, services, and architecture are resolved together rather than layered on at the end."],
  ["Material intelligence", "We select durable, honest materials that age well and reduce long-term maintenance."],
  ["Clear communication", "One point of coordination, transparent stages, and decisions documented as the project moves forward."],
  ["Client-centred delivery", "The brief is the starting point. Every recommendation is measured against how you want the space to work."],
];

const PROCESS_STEPS = [
  ["Consultation", "We listen first — understanding the site, the brief, the budget, and the way you want to use the space."],
  ["Planning", "Feasibility, regulations, and programme are mapped into a clear project roadmap before design develops."],
  ["Architectural design", "Concept, spatial planning, and material direction are developed into a coherent architectural language."],
  ["Engineering", "Structural and technical coordination turns the design into a buildable, resolved set of documents."],
  ["Construction", "Site supervision and quality control keep the work aligned with drawings, specifications, and programme."],
  ["Final delivery", "Snagging, handover, and post-completion support close the project with the same care it began."],
];

const CORE_VALUES = [
  ["Clarity", "Simple, legible decisions that make the project easier to build and easier to live in."],
  ["Craft", "Care in the junctions, the materials, and the details that are felt more than seen."],
  ["Context", "Architecture that responds to climate, culture, and the specific character of its site."],
  ["Collaboration", "Design, engineering, and construction working as one team with the client."],
  ["Integrity", "Honest budgets, honest programmes, and honest conversations."],
  ["Longevity", "Spaces designed to remain relevant, useful, and beautiful over time."],
];

const PROJECT_CATEGORIES = [
  ["Residential", "residential"],
  ["Commercial", "commercial"],
  ["Interior", "interior"],
  ["Institutional", "institutional"],
  ["Landscape", "landscape"],
  ["Renovation", "renovation"],
];

const SERVICE_CATEGORIES = [
  ["Design", "design"],
  ["Construction", "construction"],
  ["Engineering", "engineering"],
  ["Consulting", "consulting"],
];

const SERVICES = [
  {
    title: "Architectural Design",
    slug: "architectural-design",
    category: "design",
    shortDescription:
      "Concept development, spatial planning, and detailed architectural documentation shaped around your brief and site.",
    mainImage: "/images/project-villa.jpg",
    description:
      "Architectural design at Kayan Land begins with the site and the brief. We test massing, orientation, light, and circulation before developing a material language that belongs to the place.\n\nOur scope can run from a single concept study to a complete construction documentation package, coordinated with engineering and specialist consultants.",
    features: ["Site and brief analysis", "Concept and massing studies", "Material and facade direction", "Construction documentation"],
  },
  {
    title: "Interior Design",
    slug: "interior-design",
    category: "design",
    shortDescription:
      "Interiors that extend the architecture — considered layouts, natural materials, and lighting that supports daily life.",
    mainImage: "/images/project-interior.jpg",
    description:
      "We treat interiors as part of the architecture, not a later layer. Layout, joinery, lighting, and material selections are resolved together so that the finished space feels calm and coherent.\n\nServices include space planning, material palettes, custom joinery design, and coordination with specialist suppliers.",
    features: ["Space planning", "Material and finish palettes", "Custom joinery", "Lighting coordination"],
  },
  {
    title: "Construction",
    slug: "construction",
    category: "construction",
    shortDescription:
      "Disciplined construction delivery with coordinated trades, quality control, and transparent progress reporting.",
    mainImage: "/images/construction-site.jpg",
    description:
      "Our construction approach centres on coordination. Trades are sequenced early, drawings are kept current, and quality is checked at each stage rather than corrected at the end.\n\nWe work with a documented programme and clear reporting so clients always understand where the project stands.",
    features: ["Programme and cost coordination", "Site supervision", "Quality control", "Progress reporting"],
  },
  {
    title: "Structural Engineering",
    slug: "structural-engineering",
    category: "engineering",
    shortDescription:
      "Structural solutions developed alongside the architecture to preserve space, light, and design intent.",
    mainImage: "/images/project-office.jpg",
    description:
      "Structure should enable architecture, not fight it. Early engineering input allows longer spans, cleaner ceilings, and more efficient material use.\n\nWe coordinate structural design with architectural documentation and site execution.",
    features: ["Structural concept design", "Coordination with architecture", "Construction-stage review", "Material efficiency studies"],
  },
  {
    title: "Renovation & Remodeling",
    slug: "renovation-remodeling",
    category: "construction",
    shortDescription:
      "Sensitive transformations of existing spaces, balancing what should be kept with what must change.",
    mainImage: "/images/renovation-after.jpg",
    description:
      "Renovation is an exercise in judgement: understanding what gives an existing building value and what holds it back.\n\nWe survey the existing condition, identify opportunities, and develop a phased scope that respects the structure while delivering a clearly improved space.",
    features: ["Existing condition survey", "Feasibility and scope planning", "Interior transformation", "Phased delivery"],
  },
  {
    title: "Project Management",
    slug: "project-management",
    category: "consulting",
    shortDescription:
      "A single coordination point for consultants, contractors, programme, budget, and quality.",
    mainImage: "/images/about-studio.jpg",
    description:
      "Project management connects every party around one plan. We coordinate consultants, track programme and budget, manage procurement, and keep decisions documented.\n\nThe aim is simple: fewer surprises, clearer accountability, and a smoother route from brief to handover.",
    features: ["Consultant coordination", "Budget tracking", "Procurement support", "Risk and issue management"],
  },
];

const SAMPLE_PROJECTS = [
  {
    title: "Concept Study 01 — Cliffside House",
    slug: "concept-study-01-cliffside-house",
    category: "residential",
    location: "Location to be confirmed",
    cover: "/images/project-villa.jpg",
    gallery: ["/images/project-villa.jpg", "/images/project-interior.jpg"],
    description:
      "Placeholder portfolio entry. This concept study is included to demonstrate the project template and should be replaced with a verified Kayan Land project.\n\nA low horizontal volume steps with the slope, sheltering a shaded courtyard and opening the living spaces toward the view.",
    before: "/images/renovation-before.jpg",
    after: "/images/renovation-after.jpg",
  },
  {
    title: "Concept Study 02 — Office Facade",
    slug: "concept-study-02-office-facade",
    category: "commercial",
    location: "Location to be confirmed",
    cover: "/images/project-office.jpg",
    gallery: ["/images/project-office.jpg", "/images/construction-site.jpg"],
    description:
      "Placeholder portfolio entry demonstrating the commercial project template. Replace with verified project information.\n\nThe facade uses a rhythm of vertical fins to control solar gain while giving the building a precise, identifiable character.",
  },
  {
    title: "Concept Study 03 — Courtyard Institute",
    slug: "concept-study-03-courtyard-institute",
    category: "institutional",
    location: "Location to be confirmed",
    cover: "/images/project-courtyard.jpg",
    gallery: ["/images/project-courtyard.jpg", "/images/hero.jpg"],
    description:
      "Placeholder portfolio entry demonstrating the institutional project template. Replace with verified project information.\n\nA sequence of shaded courtyards gives the building a calm internal world and a clear social heart.",
  },
  {
    title: "Concept Study 04 — Urban Apartment",
    slug: "concept-study-04-urban-apartment",
    category: "interior",
    location: "Location to be confirmed",
    cover: "/images/project-interior.jpg",
    gallery: ["/images/project-interior.jpg", "/images/renovation-after.jpg"],
    description:
      "Placeholder portfolio entry demonstrating the interior project template. Replace with verified project information.\n\nA restrained material palette and reworked plan bring light deeper into the apartment.",
    before: "/images/renovation-before.jpg",
    after: "/images/renovation-after.jpg",
    showBeforeAfter: true,
  },
];

const FAQS = [
  ["How does a project begin?", "Most projects begin with a short consultation to understand your site, brief, budget, and timeline. From there we propose a scope and a clear first phase.", "Process"],
  ["Can you work with our existing drawings or contractor?", "Yes. We can review existing documentation, coordinate with your team, and either continue the design or provide the missing technical scope.", "Process"],
  ["Do you handle both design and construction?", "The studio is set up to coordinate architecture, engineering, and construction under one team, which keeps design intent and site delivery aligned.", "Services"],
  ["How long does a typical project take?", "Duration depends on scale, approvals, and scope. A clear programme is prepared after the initial consultation and refined as the design develops.", "Process"],
  ["Where can I see completed work?", "Verified completed projects will be published in the portfolio section. You can also contact the studio directly to discuss relevant experience.", "Portfolio"],
];

const BLOG_POSTS = [
  {
    title: "Why material selection belongs at the start of design",
    slug: "material-selection-belongs-at-the-start",
    excerpt:
      "Choosing materials late turns them into decoration. Choosing them early turns them into architecture.",
    image: "/images/blog-materials.jpg",
    tags: ["Materials", "Design Process"],
    content:
      "Material decisions are often treated as finishes — something selected after the plan is fixed. In practice, material is one of the first architectural decisions.\n\n## Material shapes the plan\n\nThe weight of a wall, the depth of a window reveal, the way a floor meets a threshold: these are spatial consequences of material choice. When they are decided early, the drawing and the building stay close together.\n\n## A palette, not a list\n\nA useful palette is small and deliberate. It sets a family of tones, textures, and performance characteristics that can guide every later selection, from joinery to lighting.\n\n## Build a sample library\n\nPhysical samples matter. Seeing how stone, timber, and plaster behave in the actual light of the site prevents costly surprises later. We build sample sets early and revisit them as the design develops.",
  },
  {
    title: "The quiet value of a well-considered plan",
    slug: "the-quiet-value-of-a-well-considered-plan",
    excerpt:
      "Good planning is rarely visible in photographs, but it is the reason a space feels effortless every day.",
    image: "/images/blog-sketches.jpg",
    tags: ["Design Process", "Architecture"],
    content:
      "A strong image can sell a project, but a strong plan is what makes it work. Planning is the discipline of arranging movement, light, storage, and privacy so that daily life requires less effort.\n\n## Start with routines\n\nWe map a typical day: where people wake, gather, work, cook, and retreat. The plan is tested against those routines rather than against a preferred shape.\n\n## Make circulation do more\n\nCorridors can carry storage and light. Thresholds can signal a change of pace. Small moves reduce wasted area and make the whole plan feel larger.\n\n## Protect the important rooms\n\nNot every space needs to be dramatic. Investing proportion and light in the rooms used every day often matters more than a single feature space.",
  },
];

async function seedAuth() {
  for (const [key, label, group] of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: { label, group },
      create: { key, label, group },
    });
  }

  const roles = [
    ["Super Admin", "super-admin", "Complete access to the CMS, settings, and administrators.", true],
    ["Admin", "admin", "Manage website content and customer inquiries.", true],
    ["Content Manager", "content-manager", "Manage projects, services, blog, gallery, and team content.", true],
    ["Editor", "editor", "Create and edit assigned content.", true],
  ];

  for (const [name, slug, description, isSystem] of roles) {
    const role = await prisma.role.upsert({
      where: { slug },
      update: { name, description, isSystem },
      create: { name, slug, description, isSystem },
    });
    const keys = ROLE_PERMISSIONS[slug] || [];
    const permissions = await prisma.permission.findMany({ where: { key: { in: keys } } });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  const superRole = await prisma.role.findUniqueOrThrow({ where: { slug: "super-admin" } });
  const email = process.env.SEED_ADMIN_EMAIL || "admin.2025@gmail.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin@123";
  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (!existing) {
    await prisma.adminUser.create({
      data: {
        name: "Kayan Super Admin",
        email,
        passwordHash: await hash(password, {
          algorithm: Algorithm.Argon2id,
          memoryCost: 19456,
          timeCost: 2,
          parallelism: 1,
        }),
        roleId: superRole.id,
      },
    });
    console.log(`Super admin created for ${email}.`);
  } else {
    await prisma.adminUser.update({
      where: { id: existing.id },
      data: { roleId: superRole.id, isActive: true },
    });
    console.log(`Super admin ${email} already exists; password left unchanged.`);
  }

  const staffPassword = process.env.SEED_STAFF_PASSWORD || password;
  let staffCreated = 0;
  for (const staff of STAFF_USERS) {
    if (staff.email === email) continue;
    const role = await prisma.role.findUniqueOrThrow({ where: { slug: staff.role } });
    const account = await prisma.adminUser.findUnique({ where: { email: staff.email } });
    if (account) {
      await prisma.adminUser.update({
        where: { id: account.id },
        data: { roleId: role.id, isActive: true, deletedAt: null },
      });
      continue;
    }
    await prisma.adminUser.create({
      data: {
        name: staff.name,
        email: staff.email,
        passwordHash: await hash(staffPassword, {
          algorithm: Algorithm.Argon2id,
          memoryCost: 19456,
          timeCost: 2,
          parallelism: 1,
        }),
        roleId: role.id,
      },
    });
    staffCreated += 1;
  }
  const staffTotal = await prisma.adminUser.count({ where: { deletedAt: null } });
  console.log(`Staff accounts ready: ${staffCreated} created, ${staffTotal} active accounts total.`);
}

async function seedSettings() {
  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.companySetting.upsert({
      where: { key },
      update: {},
      create: { key, value, group: "general" },
    });
  }

  await prisma.sEOSetting.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      siteTitle: "Kayan Land — Architecture & Construction",
      defaultDescription:
        "Kayan Land Architecture & Construction Company. Where beauty and functionality unite in design.",
      ogImage: "/images/hero.jpg",
      canonicalBase: process.env.APP_URL || "http://localhost:3333",
      robotsPolicy: "index, follow",
    },
  });

  await prisma.footerSetting.upsert({
    where: { key: "newsletterHeading" },
    update: {},
    create: { key: "newsletterHeading", value: "Studio notes, occasionally." },
  });

  if ((await prisma.socialLink.count()) === 0) {
    await prisma.socialLink.createMany({
      data: [
        { platform: "Instagram", url: "https://www.instagram.com/kayanland.acc/", sortOrder: 1 },
      ],
    });
  }

  for (const section of HOMEPAGE_SECTIONS) {
    const existing = await prisma.homepageSection.findUnique({ where: { key: section.key } });
    if (!existing) {
      await prisma.homepageSection.create({ data: section });
      continue;
    }
    const missing = Object.fromEntries(
      Object.entries(section).filter(([field]) => existing[field] === null || existing[field] === undefined),
    );
    if (Object.keys(missing).length > 0) {
      await prisma.homepageSection.update({ where: { key: section.key }, data: missing });
    }
  }

  if ((await prisma.whyChooseItem.count()) === 0) {
    await prisma.whyChooseItem.createMany({
      data: WHY_ITEMS.map(([title, description], index) => ({
        title,
        description,
        icon: "sparkles",
        sortOrder: index + 1,
      })),
    });
  }

  if ((await prisma.processStep.count()) === 0) {
    await prisma.processStep.createMany({
      data: PROCESS_STEPS.map(([title, description], index) => ({
        title,
        description,
        sortOrder: index + 1,
      })),
    });
  }

  if ((await prisma.coreValue.count()) === 0) {
    await prisma.coreValue.createMany({
      data: CORE_VALUES.map(([title, description], index) => ({
        title,
        description,
        sortOrder: index + 1,
      })),
    });
  }

  if ((await prisma.companyStatistic.count()) === 0) {
    await prisma.companyStatistic.createMany({
      data: [
        { label: "Completed Projects", value: "—", sortOrder: 1 },
        { label: "Happy Clients", value: "—", sortOrder: 2 },
        { label: "Years of Experience", value: "—", sortOrder: 3 },
        { label: "Professional Team Members", value: "—", sortOrder: 4 },
      ],
    });
  }

  if ((await prisma.navigationItem.count()) === 0) {
    const header = [
      ["Home", "/"],
      ["About Us", "/about"],
      ["Services", "/services"],
      ["Projects", "/projects"],
      ["Our Team", "/team"],
      ["Blog", "/blog"],
      ["Testimonials", "/testimonials"],
      ["Contact", "/contact"],
    ];
    await prisma.navigationItem.createMany({
      data: header.map(([label, url], index) => ({
        label,
        url,
        location: "header",
        sortOrder: index + 1,
      })),
    });

    const footer = [
      ["About Us", "/about"],
      ["Services", "/services"],
      ["Projects", "/projects"],
      ["Our Team", "/team"],
      ["Gallery", "/gallery"],
      ["Journal", "/blog"],
      ["FAQ", "/faq"],
      ["Contact", "/contact"],
      ["Privacy Policy", "/privacy"],
      ["Terms & Conditions", "/terms"],
    ];
    await prisma.navigationItem.createMany({
      data: footer.map(([label, url], index) => ({
        label,
        url,
        location: "footer",
        sortOrder: index + 1,
      })),
    });
  }
}

async function seedContent() {
  for (const [name, slug] of PROJECT_CATEGORIES) {
    await prisma.projectCategory.upsert({
      where: { slug },
      update: {},
      create: { name, slug, sortOrder: PROJECT_CATEGORIES.findIndex(([, s]) => s === slug) + 1 },
    });
  }

  for (const [name, slug] of SERVICE_CATEGORIES) {
    await prisma.serviceCategory.upsert({
      where: { slug },
      update: {},
      create: { name, slug, sortOrder: SERVICE_CATEGORIES.findIndex(([, s]) => s === slug) + 1 },
    });
  }

  for (const [name, slug] of [
    ["Design", "design"],
    ["Engineering", "engineering"],
    ["Construction", "construction"],
    ["Management", "management"],
  ]) {
    await prisma.department.upsert({
      where: { slug },
      update: {},
      create: { name, slug, sortOrder: 1 },
    });
  }

  if ((await prisma.service.count()) === 0) {
    const categories = await prisma.serviceCategory.findMany();
    for (const [index, service] of SERVICES.entries()) {
      const category = categories.find((item) => item.slug === service.category);
      await prisma.service.create({
        data: {
          title: service.title,
          slug: service.slug,
          shortDescription: service.shortDescription,
          description: service.description,
          mainImage: service.mainImage,
          categoryId: category?.id,
          isPublished: true,
          isFeatured: index < 4,
          sortOrder: index + 1,
          features: {
            create: service.features.map((title, featureIndex) => ({
              title,
              sortOrder: featureIndex + 1,
            })),
          },
          images: {
            create: [{ url: service.mainImage, alt: service.title, sortOrder: 1 }],
          },
        },
      });
    }
  }

  if ((await prisma.project.count()) === 0) {
    const categories = await prisma.projectCategory.findMany();
    for (const [index, project] of SAMPLE_PROJECTS.entries()) {
      const category = categories.find((item) => item.slug === project.category);
      if (!category) continue;
      await prisma.project.create({
        data: {
          title: project.title,
          slug: project.slug,
          categoryId: category.id,
          location: project.location,
          year: "",
          status: "COMPLETED",
          description: project.description,
          coverImage: project.cover,
          beforeImage: project.before || null,
          afterImage: project.after || null,
          showBeforeAfter: Boolean(project.showBeforeAfter),
          isFeatured: true,
          isPublished: true,
          sortOrder: index + 1,
          specifications: {
            create: [
              { label: "Scope", value: "Placeholder — update in dashboard", sortOrder: 1 },
              { label: "Status", value: "Concept / sample entry", sortOrder: 2 },
            ],
          },
          images: {
            create: project.gallery.map((url, galleryIndex) => ({
              url,
              alt: `${project.title} placeholder image`,
              sortOrder: galleryIndex + 1,
            })),
          },
        },
      });
    }
  }

  if ((await prisma.fAQ.count()) === 0) {
    for (const [index, [question, answer, categoryName]] of FAQS.entries()) {
      const slug = categoryName.toLowerCase();
      const category = await prisma.faqCategory.upsert({
        where: { slug },
        update: {},
        create: { name: categoryName, slug, sortOrder: index + 1 },
      });
      await prisma.fAQ.create({
        data: {
          question,
          answer,
          categoryId: category.id,
          sortOrder: index + 1,
          showOnService: true,
        },
      });
    }
  }

  if ((await prisma.galleryCategory.count()) === 0) {
    for (const [index, name] of [
      "Architecture",
      "Interiors",
      "Construction",
      "3D Design",
      "Completed Projects",
      "Company Activities",
    ].entries()) {
      await prisma.galleryCategory.create({
        data: { name, slug: name.toLowerCase().replace(/\s+/g, "-"), sortOrder: index + 1 },
      });
    }
  }

  if ((await prisma.galleryMedia.count()) === 0) {
    const categories = await prisma.galleryCategory.findMany();
    const architecture = categories.find((item) => item.slug === "architecture");
    const interiors = categories.find((item) => item.slug === "interiors");
    const construction = categories.find((item) => item.slug === "construction");
    const gallery = [
      ["/images/hero.jpg", "Modern villa at dusk", architecture?.id],
      ["/images/project-villa.jpg", "Courtyard residence", architecture?.id],
      ["/images/project-office.jpg", "Office facade study", architecture?.id],
      ["/images/project-interior.jpg", "Living room composition", interiors?.id],
      ["/images/renovation-after.jpg", "Renovated apartment", interiors?.id],
      ["/images/construction-site.jpg", "Construction at golden hour", construction?.id],
      ["/images/project-courtyard.jpg", "Institutional courtyard", architecture?.id],
      ["/images/about-studio.jpg", "Studio material library", construction?.id],
    ];
    await prisma.galleryMedia.createMany({
      data: gallery.map(([url, title, categoryId], index) => ({
        url: String(url),
        title: String(title),
        categoryId: categoryId || null,
        type: "IMAGE",
        sortOrder: index + 1,
      })),
    });
  }

  if ((await prisma.blogCategory.count()) === 0) {
    for (const [index, name] of ["Insights", "Process", "Materials"].entries()) {
      await prisma.blogCategory.create({
        data: { name, slug: name.toLowerCase(), sortOrder: index + 1 },
      });
    }
  }

  if ((await prisma.blogAuthor.count()) === 0) {
    await prisma.blogAuthor.create({
      data: {
        name: "Kayan Land Editorial",
        slug: "kayan-land-editorial",
        bio: "Notes from the Kayan Land design and construction team.",
      },
    });
  }

  if ((await prisma.blogPost.count()) === 0) {
    const category = await prisma.blogCategory.findFirst({ where: { slug: "insights" } });
    const author = await prisma.blogAuthor.findFirst();
    for (const [index, post] of BLOG_POSTS.entries()) {
      const tagLinks = [];
      for (const tagName of post.tags) {
        const tag = await prisma.blogTag.upsert({
          where: { slug: tagName.toLowerCase().replace(/\s+/g, "-") },
          update: {},
          create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, "-") },
        });
        tagLinks.push(tag.id);
      }
      await prisma.blogPost.create({
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          featuredImage: post.image,
          categoryId: category?.id,
          authorId: author?.id,
          status: "PUBLISHED",
          publishedAt: new Date(Date.now() - index * 86400000),
          readingTime: 4,
          isFeatured: index === 0,
          tags: { create: tagLinks.map((tagId) => ({ tagId })) },
        },
      });
    }
  }

  if ((await prisma.media.count()) === 0) {
    const files = [
      "hero.jpg", "about-studio.jpg", "project-villa.jpg", "project-office.jpg",
      "project-interior.jpg", "project-courtyard.jpg", "blog-sketches.jpg",
      "blog-materials.jpg", "renovation-before.jpg", "renovation-after.jpg",
      "construction-site.jpg",
    ];
    await prisma.media.createMany({
      data: files.map((file) => ({
        fileName: file,
        url: `/images/${file}`,
        thumbnailUrl: `/images/${file}`,
        mimeType: "image/jpeg",
        size: 0,
        alt: file.replace(/-/g, " ").replace(".jpg", ""),
      })),
    });
  }
}

async function main() {
  await seedAuth();
  await seedSettings();
  await seedContent();
  const translations = await seedTranslations(prisma);
  console.log(
    `Translations seeded: ${translations.rows} rows across ${translations.entities} entities (fa + ps).`,
  );
  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
