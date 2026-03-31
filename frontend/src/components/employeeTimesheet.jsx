import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  AlertCircle,
  User as UserIcon,
  ArrowLeft, // Буцах сумыг илүү тохиромжтойгоор солив
} from "lucide-react";
import HeaderSection from "./headerSection";

const TimesheetPage = ({ employee, onClose }) => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear] = useState(new Date().getFullYear());

  const API_BASE_URL = "http://192.168.1.10:8000/api/attendance";

  // Хэрэв employee объект биш зөвхөн ID ирж байгаа бол employeeId-г ашиглана
  const employeeId = employee?.id || employee;
  const fullName = employee?.full_name || "Ажилтан";

  useEffect(() => {
    fetchEmployeeAttendance();
  }, [employeeId, currentMonth, currentYear]);

  const fetchEmployeeAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/history/`, {
        params: {
          user_id: employeeId,
          month: currentMonth,
          year: currentYear,
        },
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
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 font-sans animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-500"
          >
            <ArrowLeft size={24} />
          </button>
          <HeaderSection paths={[{ name: "Дэлгэрэнгүй" }]} />
        </div>

        {/* --- ШИНЭ ХЭСЭГ: Ажилтны мэдээлэл (Profile Header) --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none uppercase">
              {fullName.includes(".") ? fullName.split(".")[1][0] : fullName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
                {fullName}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-slate-500"></div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Нийт бүртгэл
              </p>
              <p className="text-lg font-bold text-slate-700 dark:text-white">
                {attendances.length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-sm">
            <button
              onClick={() => setCurrentMonth((m) => (m === 1 ? 12 : m - 1))}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <ChevronLeft size={20} className="text-slate-400" />
            </button>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Хугацаа
              </p>
              <h3 className="text-lg font-bold dark:text-white">
                {currentYear} он / {currentMonth} сар
              </h3>
            </div>
            <button
              onClick={() => setCurrentMonth((m) => (m === 12 ? 1 : m + 1))}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <ChevronRight size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none flex justify-around items-center">
            <div className="text-center">
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mb-1 text-center">
                Ажилласан
              </p>
              <p className="text-2xl font-bold">{stats.workDays} өдөр</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mb-1 text-center">
                Хоцорсон
              </p>
              <p className="text-2xl font-bold">{stats.lateDays}</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mb-1 text-center">
                Тасалсан
              </p>
              <p className="text-2xl font-bold">{stats.absentDays}</p>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Огноо
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Ирсэн
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Явсан
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Төлөв
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-400 animate-pulse uppercase text-xs font-bold"
                    >
                      Уншиж байна...
                    </td>
                  </tr>
                ) : attendances.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-400 uppercase text-xs font-bold"
                    >
                      Мэдээлэл олдсонгүй
                    </td>
                  </tr>
                ) : (
                  attendances.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:text-white dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-sm">
                        {new Date(item.date).toLocaleDateString("mn-MN", {
                          weekday: "short",
                          month: "numeric",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-mono tracking-tighter">
                        {item.check_in
                          ? item.check_in.split("T")[1]?.substring(0, 5)
                          : "--:--"}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-mono tracking-tighter">
                        {item.check_out
                          ? item.check_out.split("T")[1]?.substring(0, 5)
                          : "--:--"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-bold border ${getStatusStyle(item.status)} uppercase`}
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
