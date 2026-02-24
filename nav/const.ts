import {
  CalendarCheck,
  Church,
  HandCoins,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

export const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Branches",
    href: "/dashboard/branches",
    icon: Church,
  },
  {
    title: "Members",
    href: "/dashboard/members",
    icon: Users,
  },
  {
    title: "Attendance",
    href: "/dashboard/attendance",
    icon: CalendarCheck,
  },
  {
    title: "Giving",
    href: "/dashboard/giving",
    icon: HandCoins,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];
