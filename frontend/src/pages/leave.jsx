import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Send,
  ShieldCheck,
  User as UserIcon,
  CalendarClock,
  Briefcase,
  ChevronRight,
  ListChecks,
  History,
} from "lucide-react";
import { BASE_URL } from "../constants/url";
import HeaderSection from "../components/headerSection";

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState("my_requests"); // my_requests, pending_actions, resolved
  const [leaves, setLeaves] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: "sick",
    manager: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const userRole = localStorage.getItem("user_role");
  const token = localStorage.getItem("access_token");
  const currentUserId = parseInt(localStorage.getItem("user_id"));

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesRes, managersRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/tasks/leave-requests/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/tasks/leave-requests/available-approvers/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setLeaves(leavesRes.data.results || leavesRes.data);
      setManagers(managersRes.data);
    } catch (err) {
      console.error("Дата татахад алдаа гарлаа:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.manager) return alert("Та зөвшөөрөл авах хүнээ сонгоно уу!");

    try {
      await axios.post(`${BASE_URL}/api/tasks/leave-requests/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowModal(false);
      setFormData({
        leave_type: "sick",
        manager: "",
        start_date: "",
        end_date: "",
        reason: "",
      });
      fetchData();
      alert("Хүсэлт амжилттай илгээгдлээ.");
    } catch (err) {
      alert("Хүсэлт илгээхэд алдаа гарлаа.",err);
    }
  };

  const handleAction = async (id, actionType) => {
    const note = prompt("Тайлбар бичнэ үү (заавал биш):");
    const urlMap = {
      approve_manager: `/api/tasks/leave-requests/${id}/manager-approve/`,
      approve_hr: `/api/tasks/leave-requests/${id}/hr-process/`,
      reject: `/api/tasks/leave-requests/${id}/reject/`,
    };

    try {
      await axios.post(
        `${BASE_URL}${urlMap[actionType]}`,
        { note },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchData();
    } catch (err) {
      alert("Үйлдэл амжилтгүй боллоо.",err);
    }
  };

  // Шүүлтүүр логик
  const filteredLeaves = leaves.filter((item) => {
    if (activeTab === "my_requests") return item.user === currentUserId;
    if (activeTab === "pending_actions")
      return (
        (item.status === "pending" || item.status === "manager_approved") &&
        item.user !== currentUserId
      );
    if (activeTab === "resolved")
      return item.status === "hr_processed" || item.status === "rejected";
    return true;
  });

  const pageName = [{ name: "Чөлөөний хүсэлтүүд" }];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 md:p-8 font-sans text-slate-700 dark:text-slate-300 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 1. Header Section */}
        <div className="flex flex-col  text-center space-y-2 mb-4">
          <HeaderSection paths={pageName} />
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarClock
              className="text-indigo-600 dark:text-indigo-500"
              size={28}
              strokeWidth={1.5}
            />
            Чөлөөний удирдлага
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Хүсэлт илгээх болон хянах хэсэг
          </p>
        </div>

        {/* 2. Tabs - Голд байрласан, зөөлөн загвартай */}
        <div className="flex justify-center">
          <div className="flex bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-sm p-1 rounded-2xl w-fit border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setActiveTab("my_requests")}
              className={`px-6 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${activeTab === "my_requests" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
            >
              Миний хүсэлт
            </button>
            {(userRole === "MANAGER" || userRole === "HR") && (
              <button
                onClick={() => setActiveTab("pending_actions")}
                className={`px-6 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${activeTab === "pending_actions" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
              >
                Батлах
              </button>
            )}
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-6 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${activeTab === "resolved" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
            >
              Шийдвэрлэгдсэн
            </button>
          </div>
        </div>

        {/* 3. Button Action */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-sm text-sm font-medium"
          >
            <Plus size={18} /> Шинэ хүсэлт
          </button>
        </div>

        {/* 4. List Content */}
        <div className="grid gap-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <CalendarClock
                size={40}
                className="mx-auto text-slate-200 dark:text-slate-700 mb-3"
              />
              <p className="text-slate-400 dark:text-slate-500 text-sm">
                Одоогоор хүсэлт бүртгэгдээгүй байна.
              </p>
            </div>
          ) : (
            filteredLeaves.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                      <UserIcon size={20} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-800 dark:text-slate-100">
                          {item.user_name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                          {item.leave_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {item.start_date} -{" "}
                          {item.end_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase size={12} /> {item.manager_name}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm italic mt-2 line-clamp-1">
                        "{item.reason}"
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between gap-3 min-w-[180px]">
                    <StatusBadge status={item.status} />

                    <div className="flex gap-2">
                      {userRole === "MANAGER" &&
                        item.status === "pending" &&
                        activeTab === "pending_actions" && (
                          <>
                            <button
                              onClick={() =>
                                handleAction(item.id, "approve_manager")
                              }
                              className="p-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-colors shadow-sm"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button
                              onClick={() => handleAction(item.id, "reject")}
                              className="p-2 bg-white dark:bg-slate-800 text-rose-500 border border-rose-100 dark:border-rose-900 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/50 transition-colors"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      {userRole === "HR" &&
                        item.status === "manager_approved" &&
                        activeTab === "pending_actions" && (
                          <>
                            <button
                              onClick={() =>
                                handleAction(item.id, "approve_hr")
                              }
                              className="p-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-colors shadow-sm"
                            >
                              <ShieldCheck size={18} />
                            </button>
                            <button
                              onClick={() => handleAction(item.id, "reject")}
                              className="p-2 bg-white dark:bg-slate-800 text-rose-500 border border-rose-100 dark:border-rose-900 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/50 transition-colors"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Шинэ хүсэлт Модал */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-white dark:border-slate-800">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">
              Чөлөө авах хүсэлт
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  Зөвшөөрөл авах хүн
                </label>
                <select
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-800 outline-none transition-all dark:text-slate-200"
                  value={formData.manager}
                  onChange={(e) =>
                    setFormData({ ...formData, manager: e.target.value })
                  }
                  required
                >
                  <option value="">Сонгох...</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                    Эхлэх
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-slate-200 outline-none"
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                    Дуусах
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-slate-200 outline-none"
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  Шалтгаан
                </label>
                <textarea
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:bg-white dark:focus:bg-slate-800 dark:text-slate-200"
                  placeholder="Тайлбар..."
                  rows="3"
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-slate-400 dark:text-slate-500 font-medium"
                >
                  Цуцлах
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-slate-900 dark:bg-indigo-600 text-white py-3 rounded-2xl font-medium shadow-lg shadow-slate-200 dark:shadow-none flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <Send size={18} /> Илгээх
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Туслах Badge Component
const StatusBadge = ({ status }) => {
  const configs = {
    pending: {
      label: "Хүлээгдэж буй",
      color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
    },
    manager_approved: {
      label: "Батлагдсан",
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
    },
    hr_processed: {
      label: "Зөвшөөрөгдсөн",
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    },
    rejected: {
      label: "Татгалзсан",
      color: "text-rose-500 bg-rose-50 dark:bg-rose-900/20",
    },
  };
  const config = configs[status] || {
    label: status,
    color: "text-slate-400 bg-slate-50 dark:bg-slate-800",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${config.color}`}
    >
      {config.label}
    </span>
  );
};