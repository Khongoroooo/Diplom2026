import React from "react";
import { ChevronRight } from "lucide-react";

const HeaderSection = ({ paths, title, subtitle }) => {
  const safePaths = Array.isArray(paths) ? paths : [];
  // Хамгийн сүүлийн нэрийг авах
  const lastName =
    safePaths.length > 0 ? safePaths[safePaths.length - 1].name : "";

  return (
    <div className="flex flex-col gap-4">
      {" "}
      {/* Container-ийг flex-col болгож өргөнийг чөлөөлөв */}
      {/* 1. Замын нэрс (Breadcrumbs) - Хэрэв зам 1-ээс олон байвал харуулна */}
      {safePaths.length > 1 && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          {safePaths.slice(0, -1).map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-rose-500 font-medium cursor-pointer hover:underline">
                {item.name}
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </div>
          ))}
          <span className="text-slate-400">{lastName}</span>
        </div>
      )}
      {/* 2. Солонгон зураастай хэсэг */}
      <div className="flex flex-col w-fit">
        <span className="text-[10px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-[0.3em] leading-none">
          {lastName}
        </span>
        {/* h-1 байсныг h-[3px] болгож арай нарийсгаж, min-w өгснөөр зураас харагдана */}
        <div className="h-[3px] w-full min-w-[80px] mt-2 bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 rounded-full shadow-sm"></div>
      </div>
      {/* 3. Гарчиг */}
      <div className="mt-2">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
export default HeaderSection;
