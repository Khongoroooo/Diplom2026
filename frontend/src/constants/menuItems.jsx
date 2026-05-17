import {
  LayoutDashboard,
  Users,
  Clock,
  FolderKanban,
  CheckSquare,
  Settings,
  FileBarChart,
  CalendarClock,
} from "lucide-react";

export const MENU_ITEMS = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={18} />,
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
  },
  {
    title: "Миний ирц",
    path: "/emptime",
    icon: <Clock size={18} />,
    roles: ["HR", "EMPLOYEE", "MANAGER"],
  },
  {
    title: "Чөлөөний хүсэлт",
    path: "/leave",
    icon: <CalendarClock size={18} />,
    roles: ["HR", "EMPLOYEE", "MANAGER"],
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
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
  },
  {
    title: "Ирц & Цаг",
    path: "/time",
    icon: <Clock size={18} />,
    roles: ["ADMIN", "HR", "MANAGER"],
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
  // {
  //   title: "Даалгавар",
  //   path: "/task",
  //   icon: <CheckSquare size={18} />,
  //   roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  // },
  {
    title: "System",
    isHeader: true,
    roles: ["ADMIN"],
  },
  {
    title: "Хяналтын самбар",
    path: "/reports",
    icon: <FileBarChart size={18} />,
    roles: ["ADMIN"],
  },
];
