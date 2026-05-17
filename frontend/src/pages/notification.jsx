import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Bell,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  AtSign,
  Check,
  ChevronRight,
  Clock,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { BASE_URL } from "../constants/url";

/* ── Notification type config ───────────────────────────── */
const NOTI_TYPES = {
  mention: {
    icon: AtSign,
    label: "Дурдалт",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/25",
    badge:
      "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  task_assign: {
    icon: UserPlus,
    label: "Таск хариуцуулсан",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/25",
    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  comment: {
    icon: MessageSquare,
    label: "Сэтгэгдэл",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/25",
    badge:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  status_change: {
    icon: CheckCircle2,
    label: "Статус өөрчлөлт",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/25",
    badge:
      "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  default: {
    icon: Bell,
    label: "Мэдэгдэл",
    color: "text-slate-500",
    bg: "bg-slate-50 dark:bg-slate-800",
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
    dot: "bg-slate-400",
  },
};

const getNotiConfig = (type) => NOTI_TYPES[type] || NOTI_TYPES.default;

/* ── Filter tabs ─────────────────────────────────────────── */
const TABS = [
  { key: "all", label: "Бүгд" },
  { key: "mention", label: "Дурдалт" },
  { key: "task_assign", label: "Таск" },
  { key: "comment", label: "Сэтгэгдэл" },
  { key: "status_change", label: "Статус" },
];

/* ── Relative time ───────────────────────────────────────── */
const relativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Яг одоо";
  if (mins < 60) return `${mins} минутын өмнө`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} цагийн өмнө`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} өдрийн өмнө`;
  return new Date(dateStr).toLocaleDateString("mn-MN");
};

/* ── Main Component ──────────────────────────────────────── */
export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);
  const token = localStorage.getItem("access_token");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Мэдэгдэл татахад алдаа:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* ── Mark single as read ── */
  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/notifications/${id}/read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Mark all as read ── */
  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await axios.patch(
        `${BASE_URL}/api/notifications/read-all/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  /* ── Filtered list ── */
  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.notification_type === activeTab);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              Мэдэгдэл
              {unreadCount > 0 && (
                <span className="text-sm bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-2.5 py-0.5 rounded-full font-black">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Таны сүүлийн үеийн мэдэгдлүүд
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors text-slate-500"
              title="Шинэчлэх"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md disabled:opacity-60"
              >
                <Check size={13} />
                {markingAll ? "..." : "Бүгдийг уншсанаар"}
              </button>
            )}
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-1.5 mb-5 flex-wrap">
          {TABS.map((tab) => {
            const count =
              tab.key === "all"
                ? notifications.length
                : notifications.filter((n) => n.notification_type === tab.key)
                    .length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? "bg-indigo-500 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900"
                    : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-500"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      activeTab === tab.key
                        ? "bg-white/25 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── List ── */}
        <div className="space-y-2">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800"
              />
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                <Bell size={28} />
              </div>
              <p className="text-slate-500 font-semibold text-sm">
                Мэдэгдэл алга
              </p>
              <p className="text-slate-400 text-xs mt-1">
                {activeTab !== "all"
                  ? "Энэ ангилалд мэдэгдэл алга"
                  : "Одоогоор мэдэгдэл ирээгүй байна"}
              </p>
            </div>
          ) : (
            filtered.map((noti) => {
              const cfg = getNotiConfig(noti.notification_type);
              const Icon = cfg.icon;
              return (
                <div
                  key={noti.id}
                  onClick={() => !noti.is_read && markAsRead(noti.id)}
                  className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    noti.is_read
                      ? "bg-white/70 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/60"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-[1px]"
                  }`}
                >
                  {/* Unread left bar */}
                  {!noti.is_read && (
                    <div
                      className={`absolute left-0 top-3 bottom-3 w-[3px] ${cfg.dot} rounded-full`}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-2xl ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.badge}`}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={9} />
                        {relativeTime(noti.created_at)}
                      </span>
                      {!noti.is_read && (
                        <span
                          className={`ml-auto w-2 h-2 ${cfg.dot} rounded-full animate-pulse shrink-0`}
                        />
                      )}
                    </div>
                    <p
                      className={`text-[13px] leading-relaxed ${
                        noti.is_read
                          ? "text-slate-400 dark:text-slate-500"
                          : "text-slate-700 dark:text-slate-200 font-medium"
                      }`}
                    >
                      {noti.message}
                    </p>
                    {noti.task_title && (
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <ArrowUpRight size={10} />
                        {noti.task_title}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="self-center text-slate-200 dark:text-slate-700 group-hover:text-indigo-400 transition-colors shrink-0">
                    <ChevronRight size={17} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer summary ── */}
        {!loading && notifications.length > 0 && (
          <p className="text-center text-xs text-slate-400 mt-6">
            Нийт {notifications.length} мэдэгдлээс {unreadCount} уншаагүй байна
          </p>
        )}
      </div>
    </div>
  );
}
