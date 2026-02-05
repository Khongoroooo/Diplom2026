import { useLocation, Link } from "react-router-dom";
import { MENU_ITEMS } from "../constants/menuItems";
import { Settings, Settings2 } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const user = {
    name: "Хонгороо",
    role: "employee",
    avatar:
      "https://www.freepik.com/free-vector/woman-floral-traditional-costume_386984146.htm#fromView=keyword&page=1&position=1&uuid=247c09dd-dbf9-4781-9efa-beecd735bfbe&query=Woman+avatar",
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 dark:bg-slate-950  flex flex-col border-r border-slate-200/10 shadow-[4px_0_24px_-15px_rgba(0,0,0,0.3)]">
      <div className="px-6 py-4 text-xl font-bold">
        <span className="text-3xl bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 bg-clip-text text-transparent">
          Smart Flow
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto">
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
      {/* profile */}

      <div className="mt-auto bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 rounded-t-2xl p-2">
        <Link to="/profile">
          <div className="flex items-center gap-3 rounded-xl hover:bg-slate-700/200 cursor-pointer transition-all">
            <img
              src={user.avatar}
              className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-200 truncate">{user.role}</p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function MenuItem({ icon, label, to, isActive }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-4xl transition-all duration-200 mb-1
        ${
          isActive
            ? "dark:bg-blue-600/10 bg-blue-500/10 text-blue-500 border-r-2 border-blue-500"
            : "dark:text-slate-400 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-white"
        }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
