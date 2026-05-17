import React, { useState, useEffect } from "react";
import axios from "axios";
import TimesheetPage from "../components/employeeTimesheet";
import HeaderSection from "../components/headerSection";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../constants/url";
import {
  Users,
  Clock,
  UserX,
  FileText,
  QrCode,
  ChevronRight,
} from "lucide-react";

// ── Backend-аас "PRESENT" | "LATE" | "ABSENT" | "LEAVE" гэж ирдэг ──
const STATUS_MAP = {
  PRESENT: {
    label: "Ирсэн",
    style:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  },
  LATE: {
    label: "Хоцорсон",
    style:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  },
  ABSENT: {
    label: "Тасалсан",
    style:
      "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  },
  LEAVE: {
    label: "Чөлөөтэй",
    style:
      "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  },
};

// Хэлтэсийн өнгийг тогтмол байлгах
const DEPT_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400",
  "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400",
  "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
];

// Хэлтэсийн нэрэнд тогтмол өнгө оноох (hash)
const deptColorCache = {};
const getDeptColor = (name) => {
  if (!name)
    return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
  if (!deptColorCache[name]) {
    let hash = 0;
    for (let i = 0; i < name.length; i++)
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    deptColorCache[name] = DEPT_COLORS[Math.abs(hash) % DEPT_COLORS.length];
  }
  return deptColorCache[name];
};

// Avatar өнгө
const AVATAR_GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
  "from-violet-500 to-fuchsia-600",
];
const getAvatarGradient = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
};

// ── Цагийн алдааг засах: backend "-" буцаана ──
const isValidTime = (val) => val && val !== "-" && val !== "--:--";

const AttendancePage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const currentRole = localStorage.getItem("user_role");
  const isAdminOrHR = currentRole === "ADMIN" || currentRole === "HR";

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${BASE_URL}/api/attendance/daily/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceData(response.data);
    } catch (error) {
      console.error("Дата татахад алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (selectedEmployee) {
    return (
      <TimesheetPage
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />
    );
  }

  const dashboardPaths = [{ name: "Ирц & Цаг" }];

  // Тоолох: PRESENT + LATE хоёулаа "ирсэн" тул тоолно
  const totalCount = attendanceData.length;
  const presentCount = attendanceData.filter(
    (a) => a.status === "PRESENT",
  ).length;
  const lateCount = attendanceData.filter((a) => a.status === "LATE").length;
  const absentCount = attendanceData.filter(
    (a) => a.status === "ABSENT",
  ).length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-5">
        {/* ── Header ── */}
        <div
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4
                        bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm
                        border border-slate-100 dark:border-slate-800"
        >
          <div>
            <HeaderSection paths={dashboardPaths} />
            <div className="mt-1 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <p className="text-slate-400 text-sm">
                Өнөөдөр: {new Date().toLocaleDateString("mn-MN")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            {isAdminOrHR && (
              <button
                onClick={() => navigate("/adminqr")}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5
                           bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300
                           border border-slate-200 dark:border-slate-700 rounded-xl
                           hover:bg-slate-50 transition-all text-sm font-medium shadow-sm"
              >
                <QrCode size={16} />
                QR Дэлгэц
              </button>
            )}
            <button
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5
                         bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl
                         shadow-md shadow-indigo-100 dark:shadow-none text-sm font-medium transition-all"
            >
              <FileText size={16} />
              Тайлан татах
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <Users size={20} />,
              label: "Бүртгэлтэй ажилчид",
              badge: "НИЙТ",
              count: totalCount,
              iconBg: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
              badgeBg: "bg-blue-50 text-blue-600",
              countColor: "text-slate-800 dark:text-white",
            },
            {
              icon: <Clock size={20} />,
              label: "Цагтаа ирсэн",
              badge: "ИРСЭН",
              count: presentCount,
              iconBg: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
              badgeBg: "bg-emerald-50 text-emerald-600",
              countColor: "text-emerald-600 dark:text-emerald-400",
            },
            {
              icon: <Clock size={20} />,
              label: "Хоцролттой ирсэн",
              badge: "ХОЦОРСОН",
              count: lateCount,
              iconBg: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
              badgeBg: "bg-amber-50 text-amber-600",
              countColor: "text-amber-600 dark:text-amber-400",
            },
            {
              icon: <UserX size={20} />,
              label: "Өнөөдрийн таслалт",
              badge: "ТАСАЛСАН",
              count: absentCount,
              iconBg: "bg-rose-50 dark:bg-rose-900/20 text-rose-600",
              badgeBg: "bg-rose-50 text-rose-600",
              countColor: "text-rose-600 dark:text-rose-400",
            },
          ].map((s) => (
            <div
              key={s.badge}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm
                         border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-start">
                <div
                  className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center`}
                >
                  {s.icon}
                </div>
                <span
                  className={`text-[10px] font-semibold ${s.badgeBg} px-2 py-1 rounded-lg`}
                >
                  {s.badge}
                </span>
              </div>
              <div className="mt-3">
                <h3 className={`text-2xl font-bold ${s.countColor}`}>
                  {s.count}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm
                        border border-slate-100 dark:border-slate-800 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                  {[
                    "Ажилтан",
                    "Хэлтэс",
                    "Ирсэн цаг",
                    "Явсан цаг",
                    "Хоцролт",
                    "Илүү цаг",
                    "Төлөв",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                {loading
                  ? [1, 2, 3, 4].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={8} className="px-5 py-4">
                          <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
                        </td>
                      </tr>
                    ))
                  : attendanceData.map((emp) => {
                      const statusInfo = STATUS_MAP[emp.status] || {
                        label: emp.status,
                        style:
                          "bg-slate-100 text-slate-500 border border-slate-200",
                      };

                      // Хоцролт: "-" бол харуулахгүй
                      const hasLate =
                        isValidTime(emp.late_time) && emp.late_time !== "-";
                      const hasOvertime =
                        isValidTime(emp.overtime) && emp.overtime !== "-";
                      const hasCheckIn = isValidTime(emp.check_in);
                      const hasCheckOut = isValidTime(emp.check_out);

                      return (
                        <tr
                          key={emp.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* Ажилтан */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient(emp.full_name)}
                                            flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}
                              >
                                {emp.full_name?.charAt(0)}
                              </div>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                {emp.full_name}
                              </p>
                            </div>
                          </td>

                          {/* Хэлтэс */}
                          <td className="px-5 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap
                                          ${getDeptColor(emp.department_name)}`}
                            >
                              {emp.department_name || "—"}
                            </span>
                          </td>

                          {/* Ирсэн цаг */}
                          <td className="px-5 py-4">
                            <span
                              className={`font-mono text-sm ${
                                hasCheckIn
                                  ? "text-slate-700 dark:text-slate-200 font-medium"
                                  : "text-slate-300 dark:text-slate-600"
                              }`}
                            >
                              {hasCheckIn ? emp.check_in : "—"}
                            </span>
                          </td>

                          {/* Явсан цаг */}
                          <td className="px-5 py-4">
                            <span
                              className={`font-mono text-sm ${
                                hasCheckOut
                                  ? "text-slate-700 dark:text-slate-200 font-medium"
                                  : "text-slate-300 dark:text-slate-600"
                              }`}
                            >
                              {hasCheckOut ? emp.check_out : "—"}
                            </span>
                          </td>

                          {/* Хоцролт */}
                          <td className="px-5 py-4">
                            {hasLate ? (
                              <span
                                className="text-xs font-medium text-rose-500 dark:text-rose-400
                                               bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-lg"
                              >
                                -{emp.late_time}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 text-xs">
                                —
                              </span>
                            )}
                          </td>

                          {/* Илүү цаг */}
                          <td className="px-5 py-4">
                            {hasOvertime ? (
                              <span
                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400
                                               bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg"
                              >
                                +{emp.overtime}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 text-xs">
                                —
                              </span>
                            )}
                          </td>

                          {/* Төлөв */}
                          <td className="px-5 py-4">
                            <span
                              className={`px-3 py-1 rounded-lg text-[11px] font-medium ${statusInfo.style}`}
                            >
                              {statusInfo.label}
                            </span>
                          </td>

                          {/* Үйлдэл */}
                          <td className="px-5 py-4">
                            <button
                              onClick={() => setSelectedEmployee(emp)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium
                                         text-indigo-600 dark:text-indigo-400
                                         bg-indigo-50 dark:bg-indigo-500/10
                                         hover:bg-indigo-600 hover:text-white
                                         dark:hover:bg-indigo-600 dark:hover:text-white
                                         transition-all ml-auto"
                            >
                              Дэлгэрэнгүй
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30
                          border-t border-slate-100 dark:border-slate-800
                          flex items-center justify-between"
          >
            <p className="text-[11px] text-slate-400 font-medium">
              Нийт{" "}
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {totalCount}
              </span>{" "}
              ажилтан
            </p>
            <p className="text-[11px] text-slate-400">
              Шинэчлэгдсэн: {new Date().toLocaleTimeString("mn-MN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
