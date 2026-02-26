import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { MENU_ITEMS } from "../constants/menuItems";
import { Settings, LogOut, User, ChevronUp } from "lucide-react";

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const handleLogout = () => {
    onLogout(); // 1. isAuthenticated-ийг false болгоно
    navigate("/"); // 2. Landing page руу үсэрнэ
  };

  const user = {
    name: "Хонгороо",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Hongoroo&background=random", // Freepik-ийн холбоос зураг биш байсан тул placeholder ашиглав
  };

  // Гадна талд дарахад цонхыг хаах
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 dark:bg-slate-950 flex flex-col border-r border-slate-200/10 shadow-[4px_0_24px_-15px_rgba(0,0,0,0.3)] z-50">
      <div className="px-6 py-4 text-xl font-bold">
        <span className="text-3xl bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 bg-clip-text text-transparent">
          Smart Flow
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide">
        {MENU_ITEMS.filter((item) => item.roles.includes(user.role)).map(
          (item, index) => {
            if (item.isHeader) {
              return (
                <p
                  key={index}
                  className="mt-6 mb-2 text-xs uppercase text-slate-500 font-semibold px-4"
                >
                  {item.title}
                </p>
              );
            }
            const isActive = location.pathname === item.path;
            return (
              <MenuItem
                key={index}
                icon={item.icon}
                label={item.title}
                to={item.path}
                isActive={isActive}
              />
            );
          },
        )}
      </nav>

      {/* Profile Section with Modal/Dropdown */}
      <div className="relative p-4" ref={profileRef}>
        {/* Pop-up Modal (Дээшээ дэлгэгддэг) */}
        {isProfileOpen && (
          <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200 z-[60]">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
              <p className="text-sm dark:text-white font-bold truncate">
                Мэнд хүргэе, {user.name}!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.role}</p>
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 text-sm dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              onClick={() => setIsProfileOpen(false)}
            >
              <User size={16} className="text-slate-400" />
              Профайл засах
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <LogOut size={16} />
              Гарах
            </button>
          </div>
        )}

        {/* Үндсэн Profile товч */}
        <div
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 group
            ${isProfileOpen ? "bg-slate-100 dark:bg-slate-800" : "bg-gradient-to-r from-blue-700/90 via-purple-500/90 to-pink-400/90 shadow-lg hover:scale-[1.02] active:scale-95"}`}
        >
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-10 h-10 rounded-full border-2 border-white/20 object-cover"
          />
          <div className="flex-1 overflow-hidden">
            <p
              className={`text-sm font-semibold truncate ${isProfileOpen ? "text-slate-900 dark:text-white" : "text-white"}`}
            >
              {user.name}
            </p>
            <p
              className={`text-xs truncate ${isProfileOpen ? "text-slate-500" : "text-slate-200"}`}
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
    </aside>
  );
}

function MenuItem({ icon, label, to, isActive }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 mb-1
        ${
          isActive
            ? "dark:bg-blue-600/15 bg-blue-500/10 text-blue-500 border-r-4 border-blue-500"
            : "dark:text-slate-400 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-white"
        }`}
    >
      <span className={`${isActive ? "text-blue-500" : "text-slate-400"}`}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
