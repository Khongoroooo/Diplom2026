import { useEffect, useState } from "react";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import HeaderSection from "../components/headerSection";
import AttendanceFilters from "../components/attendanceFilters"; // Шинэ компонентоо импортлох
import { LogOut, LogIn, Plus, KeyRound, X, Send, QrCode } from "lucide-react";

export default function MyAttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalMode, setModalMode] = useState("check-in");
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // --- Шүүлтүүрийн төлөвүүд ---
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null); // Компонент Date объект авдаг болсон

  const pageName = [{ name: "Миний ирц" }];
  const API_BASE_URL = "http://192.168.1.10:8000/api/attendance";

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const params = {
        year: currentYear,
        month: currentMonth,
      };

      if (selectedDate) {
        // Компонентоос ирсэн Date объектыг YYYY-MM-DD формат руу хөрвүүлэх
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        params.date = `${year}-${month}-${day}`;
      }

      const response = await axios.get(`${API_BASE_URL}/my-history/`, {
        params: params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendances(response.data);
    } catch (error) {
      console.error("Дата татахад алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, [currentMonth, currentYear, selectedDate]);

  // --- QR/PIN Logic ---
  const handleVerify = async (value, type = "pin") => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const endpoint =
        modalMode === "check-in" ? "/qr-check-in/" : "/check-out/";
      const payload =
        type === "pin" ? { pin_code: value } : { qr_token: value };

      await axios.post(`${API_BASE_URL}${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(
        modalMode === "check-in"
          ? "Ирсэн цаг амжилттай!"
          : "Явсан цаг амжилттай!",
      );
      closeAllModals();
      fetchMyAttendance();
    } catch (error) {
      alert(error.response?.data?.error || "Алдаа гарлаа.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAllModals = () => {
    setIsCodeModalOpen(false);
    setIsScanning(false);
    setAttendanceCode("");
  };

  useEffect(() => {
    let scanner = null;
    if (isCodeModalOpen && isScanning) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });
      scanner.render((text) => {
        scanner.clear();
        handleVerify(text, "qr");
      });
    }
    return () => {
      if (scanner) scanner.clear();
    };
  }, [isCodeModalOpen, isScanning]);

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
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 md:p-6 font-sans">
      <style>{`
        .react-datepicker { border-radius: 24px !important; border: none !important; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important; background-color: #ffffff !important; padding: 10px; }
        .dark .react-datepicker { background-color: #1e293b !important; border: 1px solid #334155 !important; }
        .dark .react-datepicker__header { background-color: #1e293b !important; border-bottom: 1px solid #334155 !important; }
        .dark .react-datepicker__current-month, .dark .react-datepicker__day-name, .dark .react-datepicker__day { color: #f1f5f9 !important; }
        .dark .react-datepicker__day:hover { background-color: #334155 !important; border-radius: 12px; }
        .react-datepicker__day--selected { background-color: #4f46e5 !important; border-radius: 12px !important; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <HeaderSection paths={pageName} />
        </div>

        {/* ШҮҮЛТҮҮР БОЛОН СТАТИСТИК */}
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
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mb-1">
                Ажилласан
              </p>
              <p className="text-2xl font-bold">{stats.workDays} өдөр</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mb-1">
                Хоцорсон
              </p>
              <p className="text-2xl font-bold">{stats.lateDays}</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mb-1">
                Тасалсан
              </p>
              <p className="text-2xl font-bold">{stats.absentDays}</p>
            </div>
          </div>
        </div>

        {/* ХҮСНЭГТ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm mb-24">
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
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Хоцролт
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Илүү цаг
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
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-400 animate-pulse font-bold"
                    >
                      Уншиж байна...
                    </td>
                  </tr>
                ) : attendances.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-xs"
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
                      <td className="px-6 py-4 text-center text-sm font-bold">
                        {item.late_time && item.late_time !== "-" ? (
                          <span className="text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg">
                            -{item.late_time}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold">
                        {item.overtime && item.overtime !== "-" ? (
                          <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                            +{item.overtime}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
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

      {/* Floating Button */}
      <div className="fixed bottom-20 right-6 flex flex-col items-end gap-4 z-50">
        {isMenuOpen && (
          <>
            <div className="flex items-center gap-3 animate-in slide-in-from-bottom-5">
              <span className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase">
                Гарах
              </span>
              <button
                onClick={() => {
                  setModalMode("check-out");
                  setIsCodeModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-12 h-12 rounded-2xl bg-white shadow-xl text-red-500 flex items-center justify-center border border-slate-100"
              >
                <LogOut size={22} />
              </button>
            </div>
            <div className="flex items-center gap-3 animate-in slide-in-from-bottom-5">
              <span className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase">
                Ирэх
              </span>
              <button
                onClick={() => {
                  setModalMode("check-in");
                  setIsCodeModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-12 h-12 rounded-2xl bg-white shadow-xl text-blue-500 flex items-center justify-center border border-slate-100"
              >
                <LogIn size={22} />
              </button>
            </div>
          </>
        )}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-12 h-12 rounded-4xl shadow-lg flex items-center justify-center transition-all duration-500 bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 text-white ${isMenuOpen ? "rotate-[135deg]" : ""}`}
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Popup Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={closeAllModals}
          />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <KeyRound size={24} />
              </div>
              <button
                onClick={closeAllModals}
                className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <h2 className="text-xl font-bold dark:text-white mb-6 uppercase">
              {modalMode === "check-in" ? "Ирсэн бүртгэл" : "Явсан бүртгэл"}
            </h2>
            <button
              onClick={() => setIsScanning(!isScanning)}
              className={`w-full py-3 mb-4 rounded-2xl text-[10px] font-bold uppercase flex items-center justify-center gap-2 border ${isScanning ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-500 border-slate-200"}`}
            >
              <QrCode size={16} />{" "}
              {isScanning ? "Код оруулах" : "QR Сканнердах"}
            </button>
            {isScanning ? (
              <div
                id="reader"
                className="overflow-hidden rounded-2xl bg-slate-50"
              ></div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerify(attendanceCode, "pin");
                }}
                className="space-y-4"
              >
                <input
                  autoFocus
                  type="text"
                  maxLength={6}
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-2xl font-mono text-center tracking-[0.3em] focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting || attendanceCode.length < 6}
                  className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 uppercase text-xs tracking-widest ${modalMode === "check-in" ? "bg-indigo-600" : "bg-red-500"}`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} /> Илгээх
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
