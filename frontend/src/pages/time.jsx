import React, { useState } from "react";

const AttendancePage = () => {
  // Жишээ өгөгдөл (Data)
  const [attendanceData] = useState([
    {
      id: 1,
      name: "Бат-Эрдэнэ Г.",
      role: "Ахлах дизайнер",
      time: "08:50",
      status: "Ирсэн",
      avatar: "БГ",
    },
    {
      id: 2,
      name: "Сарантуяа О.",
      role: "Frontend хөгжүүлэгч",
      time: "09:15",
      status: "Хоцорсон",
      avatar: "СО",
    },
    {
      id: 3,
      name: "Тэмүүлэн Б.",
      role: "Төслийн менежер",
      time: "08:58",
      status: "Ирсэн",
      avatar: "ТБ",
    },
    {
      id: 4,
      name: "Анужин П.",
      role: "Backend хөгжүүлэгч",
      time: "-",
      status: "Ирээгүй",
      avatar: "АП",
    },
    {
      id: 5,
      name: "Болдбаатар Ж.",
      role: "UI/UX дизайнер",
      time: "08:45",
      status: "Ирсэн",
      avatar: "БЖ",
    },
  ]);

  // Төлөвөөс хамаарч өнгө өөрчлөх функц
  const getStatusStyle = (status) => {
    switch (status) {
      case "Ирсэн":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
      case "Хоцорсон":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
      case "Ирээгүй":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      {/* Толгой хэсэг */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Ажилчдын ирц
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Өнөөдөр: 2024 оны 10-р сарын 24
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 transition-all">
              Шүүлтүүр
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all">
              Тайлан татах
            </button>
          </div>
        </div>

        {/* Хүснэгт */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Ажилтан
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Албан тушаал
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Бүртгүүлсэн цаг
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Төлөв
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {attendanceData.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {employee.avatar}
                        </div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {employee.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400 italic">
                        {employee.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-slate-700 dark:text-slate-300">
                        {employee.time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(employee.status)}`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition-colors">
                        Дэлгэрэнгүй
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Хүснэгтийн доод хэсэг (Pagination) */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Нийт {attendanceData.length} ажилтан байна
            </p>
            <div className="flex gap-2">
              <button
                className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                disabled
              >
                {" "}
                Өмнөх{" "}
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600">
                {" "}
                Дараах{" "}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
