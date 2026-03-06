import { Users, Moon, Sun, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";
import HeaderSection from "../components/headerSection";

export default function Dashboard() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- MOCK DATA ---
  const stats = [
    {
      type: "chart",
      title: "Company Overview",
      total: 63,
      items: [
        { label: "Male", percentage: 61.9, count: 39 },
        { label: "Female", percentage: 38.1, count: 24 },
        { label: "Other", percentage: 0, count: 0 },
      ],
    },
    {
      type: "simple",
      title: "Employee Growth",
      label: "Нийт ажилчид",
      value: "124",
      trend: "+3 энэ сард",
    },
  ];

  const nextStat = () => {
    setCurrentIndex((prev) => (prev === stats.length - 1 ? 0 : prev + 1));
  };

  const prevStat = () => {
    setCurrentIndex((prev) => (prev === 0 ? stats.length - 1 : prev - 1));
  };

  const User = { name: "Хонгороо" };
  const dashboardPaths = [{ name: "Dashboard", link: "/" }];

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-slate-950 space-y-8 p-6 font-sans">
      {/* Header хэсэг */}
      <div className="flex items-center justify-between">
        <div className="">
          <HeaderSection
            paths={dashboardPaths}
            title="Сайн байна уу"
            subtitle="Өнөөдрийн тойм"
          ></HeaderSection>
        </div>
        {/* <div className="flex flex-col w-fit">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-500 uppercase tracking-[0.2em]">
            {pageName}
          </span>
          <div className="h-1 w-full mt-2 bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 rounded-full"></div>
        </div> */}
      </div>

      <header>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Сайн байна уу, {User.name} 👋
        </h1>
      </header>

      {/* Шинэчлэгдсэн StatCard */}
      <div className="max-w-md">
        <StatCard
          currentStat={stats[currentIndex]}
          onNext={nextStat}
          onPrev={prevStat}
        />
      </div>
    </div>
  );
}

// --- ШИНЭЧЛЭГДСЭН STATCARD КОМПОНЕНТ ---
function StatCard({ currentStat, onNext, onPrev }) {
  const isChart = currentStat.type === "chart";

  return (
    <div className="relative bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm min-h-[220px] transition-all duration-500">
      {/* Header: Title & Navigation */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {currentStat.title}
        </span>
        <div className="flex gap-2">
          <button
            onClick={onPrev}
            className="p-1 hover:text-indigo-600 dark:text-slate-500"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={onNext}
            className="p-1 hover:text-indigo-600 dark:text-slate-500"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {isChart ? (
        <div className="flex items-center justify-between gap-10">
          {/* Зүүн тал: Progress Bars */}
          <div className="flex-1 space-y-5">
            {currentStat.items.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>{item.label}</span>
                  <span>
                    {item.percentage}% ({item.count})
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-700 dark:bg-indigo-500 transition-all duration-1000"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Баруун тал: Total Count */}
          <div className="text-right border-l border-slate-100 dark:border-slate-800 pl-10 h-full flex flex-col justify-center">
            <p className="text-slate-400 text-lg">Total</p>
            <h2 className="text-6xl font-bold text-slate-800 dark:text-white tracking-tighter leading-none">
              {currentStat.total}
            </h2>
          </div>
        </div>
      ) : (
        /* Энгийн карт (Өмнөх хувилбар) */
        <div className="mt-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {currentStat.label}
          </p>
          <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mt-2">
            {currentStat.value}
          </h2>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-4 uppercase tracking-widest">
            {currentStat.trend}
          </p>
        </div>
      )}
    </div>
  );
}
