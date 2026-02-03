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
    roles: ["admin", "hr", "manager", "employee"],
  },
  {
    title: "HR Management",
    isHeader: true,
    roles: ["admin", "hr"],
  },
  {
    title: "Ажилчид",
    path: "/employees",
    icon: <Users size={18} />,
    roles: ["admin", "hr"],
  },
  {
    title: "Ирц & Цаг",
    path: "/attendance",
    icon: <Clock size={18} />,
    roles: ["admin", "hr", "manager", "employee"],
  },
  {
    title: "Project Management",
    isHeader: true,
    roles: ["admin", "manager", "employee"],
  },
  {
    title: "Төслүүд",
    path: "/projects",
    icon: <FolderKanban size={18} />,
    roles: ["admin", "manager", "employee"],
  },
  {
    title: "Даалгавар",
    path: "/tasks",
    icon: <CheckSquare size={18} />,
    roles: ["admin", "manager", "employee"],
  },
  {
    title: "System",
    isHeader: true,
    roles: ["admin"],
  },
  {
    title: "Тохиргоо",
    path: "/settings",
    icon: <Settings size={18} />,
    roles: ["admin"],
  },
];
