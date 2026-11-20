import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bell,
  Building2,
  Globe,
  HelpCircle,
  Home,
  Image,
  Inbox,
  LayoutDashboard,
  Layers,
  Mail,
  MessageSquare,
  Milestone,
  Newspaper,
  Palette,
  Phone,
  Route,
  ScrollText,
  Search,
  Settings,
  Share2,
  Shield,
  Tag,
  Trophy,
  UserPlus,
  Users,
  Video,
} from "lucide-react";
import type { PermissionKey } from "@/lib/auth/permissions";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: PermissionKey;
  exact?: boolean;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Dashboard",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
    ],
  },
  {
    label: "Site Presence",
    items: [
      { label: "Social Links", href: "/admin/social", icon: Share2, permission: "settings.manage" },
    ],
  },
  {
    label: "Visitor Insights",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: Activity, permission: "analytics.view" },
      { label: "Recent Activity", href: "/admin/audit", icon: ScrollText, permission: "audit.view" },
    ],
  },
  {
    label: "Website Content",
    items: [
      { label: "Home Page", href: "/admin/homepage", icon: Home, permission: "content.manage" },
      { label: "About Page", href: "/admin/about", icon: Building2, permission: "content.manage" },
      { label: "Services", href: "/admin/services", icon: Layers, permission: "services.manage" },
      { label: "Service Categories", href: "/admin/services/categories", icon: Tag, permission: "services.manage" },
      { label: "Projects", href: "/admin/projects", icon: Building2, permission: "projects.manage" },
      { label: "Project Categories", href: "/admin/projects/categories", icon: Tag, permission: "projects.manage" },
      { label: "Team Members", href: "/admin/team", icon: Users, permission: "team.manage" },
      { label: "Departments", href: "/admin/team/departments", icon: Users, permission: "team.manage" },
      { label: "Gallery", href: "/admin/gallery", icon: Image, permission: "gallery.manage" },
      { label: "Blog Posts", href: "/admin/blog", icon: Newspaper, permission: "blog.manage" },
      { label: "Blog Categories", href: "/admin/blog/categories", icon: Tag, permission: "blog.manage" },
      { label: "Blog Tags", href: "/admin/blog/tags", icon: Tag, permission: "blog.manage" },
      { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquare, permission: "content.manage" },
      { label: "Awards & Recognition", href: "/admin/awards", icon: Trophy, permission: "content.manage" },
      { label: "Project Videos", href: "/admin/videos", icon: Video, permission: "content.manage" },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle, permission: "content.manage" },
      { label: "Company Timeline", href: "/admin/timeline", icon: Milestone, permission: "content.manage" },
      { label: "Process & Values", href: "/admin/content", icon: Layers, permission: "content.manage" },
    ],
  },
  {
    label: "Customer Management",
    items: [
      { label: "Contact Inquiries", href: "/admin/inquiries", icon: Inbox, permission: "inquiries.manage" },
      { label: "Quote Requests", href: "/admin/inquiries/quotes", icon: Inbox, permission: "inquiries.manage" },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail, permission: "inquiries.manage" },
    ],
  },
  {
    label: "Website Configuration",
    items: [
      { label: "General Settings", href: "/admin/settings", icon: Settings, permission: "settings.manage" },
      { label: "Branding & Logo", href: "/admin/settings/branding", icon: Palette, permission: "settings.manage" },
      { label: "Navigation Menu", href: "/admin/settings/navigation", icon: Layers, permission: "settings.manage" },
      { label: "Footer Settings", href: "/admin/settings/footer", icon: Layers, permission: "settings.manage" },
      { label: "Social Media", href: "/admin/settings/social", icon: Globe, permission: "settings.manage" },
      { label: "Contact Information", href: "/admin/settings/contact", icon: Phone, permission: "settings.manage" },
      { label: "SEO Settings", href: "/admin/settings/seo", icon: Search, permission: "settings.manage" },
      { label: "Redirects", href: "/admin/settings/redirects", icon: Route, permission: "settings.manage" },
    ],
  },
  {
    label: "User Management",
    items: [
      { label: "User Management", href: "/admin/users", icon: Users, permission: "users.manage" },
      { label: "Add New User", href: "/admin/users/new", icon: UserPlus, permission: "users.manage" },
      { label: "Roles & Permissions", href: "/admin/users/roles", icon: Shield, permission: "users.manage" },
    ],
  },
];
