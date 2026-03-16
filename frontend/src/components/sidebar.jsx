import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { MENU_ITEMS } from "../constants/menuItems";
import {
  LogOut,
  User,
  ChevronUp,
  ChevronRight,
  Users,
  Kanban,
  Clock,
  Settings as SettingsIcon,
} from "lucide-react";

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  ;
  // Refs
  const profileRef = useRef(null);
  const settingsRef = useRef(null);

  const user = {
    name: localStorage.getItem("user_name") || "Хэрэглэгч",
    role: localStorage.getItem("user_role") || "employee",
    avatar: `https://ui-avatars.com/api/?name=${localStorage.getItem("user_name")}&background=random`,
  };

  const handleLogout = () => {
    localStorage.clear();
    onLogout();
    navigate("/");
  };

  // Гадна талд дарахад цонхнуудыг хаах логик
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-64 dark:bg-slate-950 flex flex-col border-r border-slate-200/10 z-50 transition-transform duration-300 
  ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      {/* Logo Section */}
      <div className="px-6 py-4 text-xl font-bold">
        <span className="text-3xl bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 bg-clip-text text-transparent font-sans">
          Smart Flow
        </span>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6 overflow-y-visible scrollbar-hide relative">
        {MENU_ITEMS.filter((item) => item.roles.includes(user.role)).map(
          (item, index) => {
            // 1. Гарчиг хэсэг (Header)
            if (item.isHeader) {
              return (
                <p
                  key={index}
                  className="mt-6 mb-2 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold px-4 tracking-wider"
                >
                  {item.title}
                </p>
              );
            }

            // 2. Settings цэс (Pop-over-той)
            // Таны menuItems дотор path нь "/settings" эсвэл title нь "Тохиргоо" байвал:
            if (item.path === "/settings" || item.title === "Тохиргоо") {
              return (
                <div key={index} className="relative mb-1" ref={settingsRef}>
                  {/* Pop-over Menu */}
                  {isSettingsOpen && (
                    <div className="absolute left-full ml-2 top-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 z-[70]">
                      <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Админ удирдлага
                      </p>

                      <Link
                        to="/settings"
                        onClick={() => setIsSettingsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm dark:text-slate-200 hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-all"
                      >
                        <Users size={16} className="text-blue-500" />
                        <span>Хэрэглэгчийн тохиргоо</span>
                      </Link>

                      <Link
                        to="/settings/projects"
                        onClick={() => setIsSettingsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm dark:text-slate-200 hover:bg-purple-500/10 hover:text-purple-500 rounded-xl transition-all"
                      >
                        <Kanban size={16} className="text-purple-500" />
                        <span>Төсөл & Даалгавар</span>
                      </Link>

                      <Link
                        to="/settings/attendance"
                        onClick={() => setIsSettingsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm dark:text-slate-200 hover:bg-pink-500/10 hover:text-pink-500 rounded-xl transition-all"
                      >
                        <Clock size={16} className="text-pink-500" />
                        <span>Ирцийн дүрэм</span>
                      </Link>
                    </div>
                  )}

                  {/* Settings Button */}
                  <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-200
                    ${
                      isSettingsOpen
                        ? "bg-blue-600/10 text-blue-500"
                        : "dark:text-slate-300 text-slate-700 hover:bg-slate-800/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isSettingsOpen ? "text-blue-500" : ""}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-200 ${isSettingsOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                </div>
              );
            }

            // 3. Бусад энгийн цэснүүд
            return (
              <MenuItem
                key={index}
                icon={item.icon}
                label={item.title}
                to={item.path}
                isActive={location.pathname === item.path}
              />
            );
          },
        )}
      </nav>

      {/* Profile Section */}
      <div className="relative p-4 " ref={profileRef}>
        {isProfileOpen && (
          <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200 z-[60]">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
              <p className="text-sm dark:text-white font-bold truncate">
                Мэнд хүргэе, {user.name}!
              </p>
              <p className="text-xs text-slate-500 truncate uppercase tracking-tighter">
                {user.role}
              </p>
            </div>
            <Link
              to="/profile"
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <User size={16} /> Профайл засах
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <LogOut size={16} /> Гарах
            </button>
          </div>
        )}

        <div
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 group
            ${
              isProfileOpen
                ? "bg-slate-100 dark:bg-slate-800 shadow-inner"
                : "bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 shadow-lg shadow-purple-500/20 hover:scale-[1.02]"
            }`}
        >
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-10 h-10 rounded-full border-2 border-white/20 object-cover flex-shrink-0"
          />
          <div className="flex-1 overflow-hidden">
            <p
              className={`text-sm font-semibold truncate ${isProfileOpen ? "dark:text-white text-slate-900" : "text-white"}`}
            >
              {user.name}
            </p>
            <p
              className={`text-[10px] uppercase truncate font-medium ${isProfileOpen ? "text-slate-500" : "text-white/70"}`}
            >
              {user.role}
            </p>
          </div>
          <ChevronUp
            size={16}
            className={`transition-transform duration-300 ${isProfileOpen ? "rotate-180 text-slate-500" : "text-white"}`}
          />
        </div>
      </div>
      <nav onClick={() => setIsOpen(false)}> 
         {/* MENU_ITEMS ... */}
      </nav>
    </aside>
  );
}

// MenuItem Component
function MenuItem({ icon, label, to, isActive }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 mb-1 group
        ${
          isActive
            ? "bg-gradient-to-r from-blue-700/80 via-purple-500/80 to-pink-400/80 text-white shadow-md border-r-4 border-white/40"
            : "dark:text-slate-300 text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-500 dark:hover:text-white"
        }`}
    >
      <span
        className={`transition-colors duration-200 ${isActive ? "text-white" : "group-hover:text-blue-500"}`}
      >
        {icon}
      </span>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}
