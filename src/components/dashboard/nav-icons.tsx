"use client";

import {
  Activity,
  BarChart3,
  Brain,
  Briefcase,
  FileText,
  GitCompare,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  ScrollText,
  Settings,
  Share2,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { DashboardIconName } from "./nav-config";

export const dashboardIconMap: Record<DashboardIconName, LucideIcon> = {
  LayoutDashboard,
  User,
  Briefcase,
  GitCompare,
  GraduationCap,
  BarChart3,
  Activity,
  Share2,
  Brain,
  Users,
  Settings,
  FileText,
  ScrollText,
  MessageCircle,
  Sparkles,
};

export function getDashboardIcon(name: DashboardIconName): LucideIcon {
  return dashboardIconMap[name] ?? LayoutDashboard;
}