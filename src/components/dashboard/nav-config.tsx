/**
 * Navigation configuration shared by Server and Client Components.
 *
 * IMPORTANT:
 * Do not put React components/functions in this file.
 * Server Components can safely pass these plain strings across the
 * Server -> Client boundary.
 */

export type DashboardIconName =
  | "LayoutDashboard"
  | "User"
  | "Briefcase"
  | "GitCompare"
  | "GraduationCap"
  | "BarChart3"
  | "Activity"
  | "Share2"
  | "Brain"
  | "Users"
  | "Settings"
  | "FileText"
  | "ScrollText"
  | "MessageCircle"
  | "Sparkles"
  | "BookOpen";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: DashboardIconName;
};

export const studentNav: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: "LayoutDashboard",
  },
  {
    href: "/dashboard/documentation",
    label: "Documentation",
    icon: "BookOpen",
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: "User",
  },
  {
    href: "/dashboard/careers",
    label: "Careers",
    icon: "Briefcase",
  },
  {
    href: "/dashboard/careers/compare",
    label: "Compare careers",
    icon: "GitCompare",
  },
  {
    href: "/dashboard/academic",
    label: "Academic",
    icon: "GraduationCap",
  },
  {
    href: "/dashboard/assessment",
    label: "Assessment",
    icon: "BarChart3",
  },
  {
    href: "/dashboard/progress",
    label: "Progress",
    icon: "Activity",
  },
  {
    href: "/dashboard/share",
    label: "Share assessment",
    icon: "Share2",
  },
  {
    href: "/dashboard/ask-counselor",
    label: "Ask counselor",
    icon: "MessageCircle",
  },
  {
    href: "/dashboard/ask-ai",
    label: "Ask AI",
    icon: "Sparkles",
  },
];


export const adminNav: DashboardNavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: "LayoutDashboard",
  },
  {
    href: "/admin/careers",
    label: "Careers",
    icon: "Briefcase",
  },
  {
    href: "/admin/competencies",
    label: "Competencies",
    icon: "Brain",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: "Users",
  },
  {
    href: "/admin/rules",
    label: "Rules",
    icon: "Settings",
  },
  {
    href: "/admin/assessments",
    label: "Assessments",
    icon: "FileText",
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: "BarChart3",
  },
  {
    href: "/admin/audit",
    label: "Audit log",
    icon: "ScrollText",
  },
];