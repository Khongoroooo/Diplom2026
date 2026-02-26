import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Wifi,
  Building2,
} from "lucide-react"; // Icon-уудыг ашиглахын тулд lucide-react суулгаарай
import HeaderSection from "./headerSection";

const TimesheetPage = () => {
  // Жишээ дата
  const timesheetData = [
    { date: "09/16 (Mon)", start: "08:28", end: "18:40", type: "remote" },
    {
      date: "09/17 (Tue)",
      start: "09:31",
      end: "18:40",
      type: "mixed",
      endRemote: true,
    },
    { date: "09/18 (Wed)", start: "09:25", end: "18:49", type: "remote" },
    { date: "09/19 (Thu)", start: "07:00", end: "16:12", type: "office" },
    { date: "09/20 (Fri)", start: "09:06", end: "18:45", type: "remote" },
    { date: "09/21 (Sat)", isWeekend: true },
    { date: "09/22 (Sun)", isWeekend: true },
    {
      date: "09/23 (Mon)",
      start: "07:48",
      end: "18:40",
      type: "remote",
      endRemote: true,
    },
    {
      date: "09/24 (Tue)",
      start: "09:14",
      end: "21:11",
      type: "remote",
      endRemote: true,
    },
    {
      date: "09/25 (Wed)",
      start: "09:19",
      end: "21:43",
      type: "remote",
      endRemote: true,
    },
    {
      date: "09/26 (Thu)",
      start: "08:32",
      end: "19:12",
      type: "office",
      endRemote: true,
    },
    {
      date: "09/27 (Fri)",
      start: "09:14",
      end: "-",
      type: "remote",
      isWarning: true,
    },
  ];
  const timepaths = [
    { name: "Ирц & Цаг", link: "/attendance" },
    { name: "Timesheet", link: "/timesheet" },
  ];
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-300 p-4 md:p-8">
      <div className="p-6">
        <HeaderSection paths={timepaths}></HeaderSection>
      </div>

      {/* Filters & Stats */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white rounded-md overflow-hidden">
            <button className="p-2 border-r hover:bg-slate-100 text-black">
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center px-4 py-1 gap-10 border-r text-black">
              <span>2024</span>
              <Calendar size={16} className="text-slate-400" />
            </div>
            <div className="flex items-center px-4 py-1 gap-10 border-r text-black">
              <span>10</span>
              <Calendar size={16} className="text-slate-400" />
            </div>
            <button className="p-2 hover:bg-slate-100 text-black">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-6 text-sm font-medium">
          <p>
            Work days: <span className="text-white">21 days</span>
          </p>
          <p>
            Deduction days: <span className="text-white">1 days</span>
          </p>
          <p>
            Weekend working days: <span className="text-white">0 days</span>
          </p>
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="bg-white rounded-sm overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-700">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-4 py-3 font-bold border-r w-32">Date</th>
                <th className="px-4 py-3 font-bold border-r text-center">
                  Start time
                </th>
                <th className="px-4 py-3 font-bold border-r text-center">
                  Break start
                </th>
                <th className="px-4 py-3 font-bold border-r text-center">
                  Break end
                </th>
                <th className="px-4 py-3 font-bold text-center">End time</th>
              </tr>
            </thead>
            <tbody>
              {timesheetData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b hover:bg-blue-50/30 transition-colors ${row.isWeekend ? "bg-slate-100" : ""} ${row.isWarning ? "bg-rose-50" : ""}`}
                >
                  <td className="px-4 py-2 border-r font-medium">{row.date}</td>
                  <td className="px-4 py-2 border-r text-center">
                    <div className="flex items-center justify-center gap-2">
                      {row.type === "remote" && (
                        <Wifi size={14} className="text-slate-400" />
                      )}
                      {row.type === "office" && (
                        <Building2 size={14} className="text-slate-400" />
                      )}
                      {row.start || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-2 border-r text-center text-slate-400">
                    -
                  </td>
                  <td className="px-4 py-2 border-r text-center text-slate-400">
                    -
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {row.endRemote && (
                        <Wifi size={14} className="text-slate-400" />
                      )}
                      {row.type === "office" && row.end !== "-" && (
                        <Building2 size={14} className="text-slate-400" />
                      )}
                      {row.end || "-"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimesheetPage;
