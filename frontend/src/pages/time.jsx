import React, { useState, useEffect } from "react";
import axios from "axios";
import TimesheetPage from "../components/employeeTimesheet";
import HeaderSection from "../components/headerSection";
import { useNavigate } from "react-router-dom";

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
      const response = await axios.get(
        "http://192.168.1.10:8000/api/attendance/daily/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
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

  const getStatusStyle = (status) => {
    switch (status) {
      case "Ирсэн":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
      case "Хоцорсон":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
      case "Тасалсан":
      case "Ирээгүй":
      case "Бүртгэлгүй": // Backend-ээс ирж буй "Бүртгэлгүй" төлөвт
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const dashboardPaths = [{ name: "Ирц & Цаг", link: "/attendance" }];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 md:p-8">
      <HeaderSection paths={dashboardPaths} />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Ажилчдын ирц
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Өнөөдөр: {new Date().toLocaleDateString("mn-MN")}
            </p>
          </div>

          <div className="flex gap-3">
            {isAdminOrHR && (
              <button
                onClick={() => navigate("/adminqr")}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all"
              >
                Ирц бүртгэлийн дэлгэц
              </button>
            )}
            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all">
              Тайлан татах
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 dark:text-slate-200 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold uppercase ">
                    Ажилтан
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase ">
                    Хэлтэс
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase  text-center">
                    Ирсэн
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase  text-center">
                    Явсан
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase  text-center">
                    Хоцорсон
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase  text-center">
                    Илүү цаг
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase  text-center">
                    Төлөв
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase  text-center">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500 animate-pulse"
                    >
                      Уншиж байна...
                    </td>
                  </tr>
                ) : attendanceData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Мэдээлэл олдсонгүй.
                    </td>
                  </tr>
                ) : (
                  attendanceData.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {employee.full_name?.charAt(0)}
                          </div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {employee.full_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {employee.department_name || "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-sm text-slate-700 dark:text-slate-300">
                        {employee.check_in}
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-sm text-slate-700 dark:text-slate-300">
                        {employee.check_out}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-rose-500 font-medium">
                        {employee.late_time}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-indigo-500 font-medium">
                        {employee.overtime}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(employee.status)}`}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedEmployee(employee)}
                          className="text-indigo-500 hover:text-indigo-700 text-sm font-medium"
                        >
                          Дэлгэрэнгүй
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Нийт {attendanceData.length} ажилтан байна
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
