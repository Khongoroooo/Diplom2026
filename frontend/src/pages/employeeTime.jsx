import { useEffect, useState } from "react";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode"; // QR сан
import HeaderSection from "../components/headerSection";
import {
  Calendar,
  LogOut,
  LogIn,
  Plus,
  KeyRound,
  X,
  Send,
  QrCode,
} from "lucide-react";

export default function MyAttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalMode, setModalMode] = useState("check-in");
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QR-д зориулсан шинэ төлөв
  const [isScanning, setIsScanning] = useState(false);

  const pageName = [{ name: "Миний ирц" }];
  const API_BASE_URL = "http://192.168.1.10:8000/api/attendance";

  const fetchMyAttendance = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/my-history/`, {
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
  }, []);

  // Баталгаажуулах үндсэн функц (PIN болон QR алинд нь ч ажиллана)
  const handleVerify = async (value, type = "pin") => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const endpoint =
        modalMode === "check-in" ? "/qr-check-in/" : "/check-out/";

      // Хэрэв QR бол qr_token, PIN бол pin_code гэж илгээнэ
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
      alert(error.response?.data?.error || "Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAllModals = () => {
    setIsCodeModalOpen(false);
    setIsScanning(false);
    setAttendanceCode("");
  };

  // QR Сканнерын логик
  useEffect(() => {
    let scanner = null;
    if (isCodeModalOpen && isScanning) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scanner.render(
        (decodedText) => {
          scanner.clear();
          handleVerify(decodedText, "qr");
        },
        (err) => {
          err;
        },
      );
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
      default:
        return "bg-slate-50 text-slate-600 border-slate-100 ring-slate-500/10";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 font-sans relative">
      <HeaderSection paths={pageName} />

      {/* Ирцийн хүснэгт (Өөрчлөгдөөгүй) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm mb-20 mt-8">
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
              ) : (
                attendances.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:text-white dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-sm">
                      {new Date(item.date).toLocaleDateString("mn-MN")}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      {item.check_in?.split("T")[1]?.substring(0, 5) || "--:--"}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      {item.check_out?.split("T")[1]?.substring(0, 5) ||
                        "--:--"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-bold border ${getStatusStyle(item.status)}`}
                      >
                        {item.status === "PRESENT"
                          ? "ИРСЭН"
                          : item.status === "LATE"
                            ? "ХОЦОРСОН"
                            : "ТАСАЛСАН"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Floating Action Button Menu --- */}
      <div className="fixed bottom-20 right-6 flex flex-col items-end gap-4 z-50">
        <div
          className={`flex items-center gap-3 transition-all duration-300 transform ${isMenuOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-50 pointer-events-none"}`}
        >
          <span className="bg-slate-800/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider">
            Явах бүртгэх
          </span>
          <button
            onClick={() => {
              setModalMode("check-out");
              setIsCodeModalOpen(true);
              setIsMenuOpen(false);
            }}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 text-red-500 flex items-center justify-center"
          >
            <LogOut size={22} />
          </button>
        </div>

        <div
          className={`flex items-center gap-3 transition-all duration-300 delay-[50ms] transform ${isMenuOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-50 pointer-events-none"}`}
        >
          <span className="bg-slate-800/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider">
            Ирэх бүртгэх
          </span>
          <button
            onClick={() => {
              setModalMode("check-in");
              setIsCodeModalOpen(true);
              setIsMenuOpen(false);
            }}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 text-blue-500 flex items-center justify-center"
          >
            <LogIn size={22} />
          </button>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-12 h-12 rounded-4xl shadow-lg flex items-center justify-center transition-all duration-500 bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 text-white ${isMenuOpen ? "rotate-[135deg]" : ""}`}
        >
          <Plus size={26} />
        </button>
      </div>

      {/* --- Popup Modal (Загвар хэвээрээ) --- */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={closeAllModals}
          />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] shadow-2xl border border-slate-200 p-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                <KeyRound size={24} />
              </div>
              <button
                onClick={closeAllModals}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="text-xl font-bold dark:text-white mb-2 uppercase tracking-tight">
              {modalMode === "check-in" ? "Ирсэн цаг" : "Явсан цаг"}
            </h2>

            {/* QR болон PIN сонгох хэсэг (Дизайнд нийцүүлсэн) */}
            <div className="flex gap-2 mb-6 mt-4">
              <button
                onClick={() => setIsScanning(!isScanning)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${isScanning ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-500 border-slate-200"}`}
              >
                <QrCode size={14} /> {isScanning ? "Код оруулах" : "QR Сканнер"}
              </button>
            </div>

            {isScanning ? (
              <div
                id="reader"
                className="overflow-hidden rounded-2xl border-0 bg-slate-50"
              ></div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerify(attendanceCode, "pin");
                }}
                className="space-y-6"
              >
                <input
                  autoFocus
                  type="text"
                  maxLength={6}
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 rounded-2xl px-6 py-4 text-2xl font-mono tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white uppercase"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting || attendanceCode.length < 6}
                  className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 uppercase text-xs tracking-widest transition-all ${modalMode === "check-in" ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-gradient-to-r from-red-500 to-orange-600"}`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />{" "}
                      {modalMode === "check-in" ? "Бүртгэх" : "Гарах"}
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
