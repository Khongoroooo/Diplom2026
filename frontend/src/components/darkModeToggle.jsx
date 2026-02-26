import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function DarkMode() {
  const [darkMode, setDark] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDark(!darkMode)}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:scale-110 shadow-lg transition-all duration-300"
    >
      {darkMode ? (
        <Sun size={24} className="text-amber-400" />
      ) : (
        <Moon size={24} className="text-indigo-600" />
      )}
    </button>
  );
}
