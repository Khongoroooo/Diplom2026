import React, { useEffect, useState } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowLeft } from "lucide-react";
import HeaderSection from "./headerSection";
import AttendanceFilters from "./attendanceFilters"; // Шинэ компонентоо импортлох

const TimesheetPage = ({ employee, onClose }) => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  const API_BASE_URL = "http://192.168.1.10:8000/api/attendance";
  const employeeId = employee?.id || employee;
  const fullName = employee?.full_name || "Ажилтан";

  useEffect(() => {
    fetchEmployeeAttendance();
  }, [employeeId, currentMonth, currentYear, selectedDate]);

  const fetchEmployeeAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const params = {
        user_id: employeeId,
        year: currentYear,
        month: currentMonth,
      };

      if (selectedDate) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        params.date = `${year}-${month}-${day}`;
      }

      const response = await axios.get(`${API_BASE_URL}/history/`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendances(response.data);
    } catch (error) {
      console.error("Дата татахад алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-50 text-green-600 border-green-100 ring-green-500/10";
      case "LATE":
        return "bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/10";
      case "ABSENT":
        return "bg-red-50 text-red-600 border-red-100 ring-red-500/10";
      case "LEAVE":
        return "bg-blue-50 text-blue-600 border-blue-100 ring-blue-500/10";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100 ring-slate-500/10";
    }
  };

  const stats = {
    workDays: attendances.filter(
      (a) => a.status === "PRESENT" || a.status === "LATE",
    ).length,
    lateDays: attendances.filter((a) => a.status === "LATE").length,
    absentDays: attendances.filter((a) => a.status === "ABSENT").length,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 font-sans transition-colors duration-300">
      <style>{`
        .react-datepicker { border-radius: 24px !important; border: none !important; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important; background-color: #ffffff !important; padding: 10px; }
        .dark .react-datepicker { background-color: #1e293b !important; border: 1px solid #334155 !important; }
        .dark .react-datepicker__header { background-color: #1e293b !important; border-bottom: 1px solid #334155 !important; }
        .dark .react-datepicker__current-month, .dark .react-datepicker__day-name, .dark .react-datepicker__day { color: #f1f5f9 !important; }
        .dark .react-datepicker__day:hover { background-color: #334155 !important; border-radius: 12px; }
        .react-datepicker__day--selected { background-color: #4f46e5 !important; border-radius: 12px !important; }
        .react-datepicker__navigation { top: 15px; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-500"
          >
            <ArrowLeft size={24} />
          </button>
          <HeaderSection paths={[{ name: "Дэлгэрэнгүй" }]} />
        </div>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none uppercase">
              {fullName.includes(".") ? fullName.split(".")[1][0] : fullName[0]}
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                Ажилтны нэр
              </p>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic">
                {fullName}
              </h1>
            </div>
          </div>
          <div className="px-5 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm min-w-[120px] text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Нийт бүртгэл
            </p>
            <p className="text-xl font-black text-indigo-600 dark:text-white">
              {attendances.length}
            </p>
          </div>
        </div>

        {/* Filters & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <AttendanceFilters
            currentYear={currentYear}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            setCurrentYear={setCurrentYear}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />

          <div className="lg:col-span-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[32px] p-6 text-white shadow-xl flex justify-around items-center">
            <div className="text-center">
              <p className="text-indigo-100 text-[10px] font-bold uppercase mb-2">
                Ажилласан
              </p>
              <p className="text-3xl font-black">
                {stats.workDays}{" "}
                <span className="text-xs font-normal">өдөр</span>
              </p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <p className="text-indigo-100 text-[10px] font-bold uppercase mb-2">
                Хоцорсон
              </p>
              <p className="text-3xl font-black">{stats.lateDays}</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <p className="text-indigo-100 text-[10px] font-bold uppercase mb-2">
                Тасалсан
              </p>
              <p className="text-3xl font-black">{stats.absentDays}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Огноо
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-500 text-center">
                    Ирсэн
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-500 text-center">
                    Явсан
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-500 text-center">
                    Хоцролт
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-500 text-center">
                    Илүү цаг
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-500 text-right">
                    Төлөв
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-slate-400 animate-pulse font-black text-xs uppercase"
                    >
                      Уншиж байна...
                    </td>
                  </tr>
                ) : attendances.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-slate-400 font-black text-xs uppercase"
                    >
                      Мэдээлэл олдсонгүй
                    </td>
                  </tr>
                ) : (
                  attendances.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors dark:text-white"
                    >
                      <td className="px-6 py-4 font-bold text-sm">
                        {new Date(item.date).toLocaleDateString("mn-MN", {
                          weekday: "short",
                          month: "numeric",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-mono">
                        {item.check_in
                          ? item.check_in.split("T")[1]?.substring(0, 5)
                          : "--:--"}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-mono">
                        {item.check_out
                          ? item.check_out.split("T")[1]?.substring(0, 5)
                          : "--:--"}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold">
                        {item.late_time && item.late_time !== "-" ? (
                          <span className="text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg">
                            -{item.late_time}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold">
                        {item.overtime && item.overtime !== "-" ? (
                          <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                            +{item.overtime}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black border uppercase ${getStatusStyle(item.status)}`}
                        >
                          {item.status === "PRESENT"
                            ? "Ирсэн"
                            : item.status === "LATE"
                              ? "Хоцорсон"
                              : item.status === "LEAVE"
                                ? "Чөлөөтэй"
                                : "Тасалсан"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetPage;
