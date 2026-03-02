import {
  LayoutDashboard,
  Users,
  Clock,
  FolderKanban,
  CheckSquare,
  Settings,
} from "lucide-react";

export const MENU_ITEMS = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={18} />,
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
  },
  {
    title: "HR Management",
    isHeader: true,
    roles: ["ADMIN", "HR"],
  },
  {
    title: "Ажилчид",
    path: "/employees",
    icon: <Users size={18} />,
    roles: ["ADMIN", "HR"],
  },
  {
    title: "Ирц & Цаг",
    path: "/time",
    icon: <Clock size={18} />,
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
  },
  {
    title: "Project Management",
    isHeader: true,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  },
  {
    title: "Төслүүд",
    path: "/projects",
    icon: <FolderKanban size={18} />,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  },
  {
    title: "Даалгавар",
    path: "/task",
    icon: <CheckSquare size={18} />,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  },
  {
    title: "System",
    isHeader: true,
    roles: ["ADMIN"],
  },
  {
    title: "Тохиргоо",
    path: "/settings",
    icon: <Settings size={18} />,
    roles: ["ADMIN"],
  },
];
