import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function Task() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // LocalStorage-д хадгалвал хуудас дахин ачаалахад арилахгүй
    const savedTheme = localStorage.getItem("theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedTheme === "dark") setIsDark(true);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-8 transition-colors duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Smart Flow Overview</h1>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
        >
          {isDark ? (
            <>
              <Sun size={18} className="text-amber-400" />{" "}
              <span className="text-sm font-medium">Гэрэлтэй</span>
            </>
          ) : (
            <>
              <Moon size={18} className="text-indigo-600" />{" "}
              <span className="text-sm font-medium">Харанхуй</span>
            </>
          )}
        </button>
      </div>

      {/* Жишээ карт */}
      <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
        <p className="text-slate-500 dark:text-slate-400">
          Tailwind v4.0 дээр Dark Mode амжилттай ажиллаж байна.
        </p>
      </div>
    </div>
  );
}
