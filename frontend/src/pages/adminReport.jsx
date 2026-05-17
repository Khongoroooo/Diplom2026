// pages/AdminReportPage.jsx
import React, { useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  FileDown,
  RefreshCw,
  Download,
  Loader2,
  AlertCircle,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { useReportData } from "../hooks/userReportData";
import {
  OverviewPanel,
  TaskPanel,
  AttendancePanel,
  ProjectStatusPanel,
  UserRolePanel,
  TopPerformersPanel,
  DepartmentPanel,
  ProjectProgressPanel,
} from "../components/report/reportPanels";
import { exportExcel, exportPDF, exportWord } from "../utils/reportExport";

/* ─── Export button ──────────────────────────────────────── */
const ExportButton = ({ icon: Icon, label, color, onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[12px] font-bold shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
  >
    {loading ? (
      <Loader2 size={14} className="animate-spin" />
    ) : (
      <Icon size={14} />
    )}
    {label}
  </button>
);

/* ─── Tab ────────────────────────────────────────────────── */
const Tab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all uppercase tracking-wider ${
      active
        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`}
  >
    {children}
  </button>
);

/* ─── Main Page ──────────────────────────────────────────── */
export default function AdminReportPage() {
  const {
    loading,
    error,
    endpointErrors,
    stats,
    users,
    projects,
    tasks,
    attendance,
    refetch,
  } = useReportData();
  const [exporting, setExporting] = useState(null); // 'excel' | 'pdf' | 'word'
  const [activeTab, setActiveTab] = useState("overview");

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const projWithProgress = stats?.projectProgress || projects;
      if (type === "excel")
        await exportExcel(stats, users, tasks, attendance, projWithProgress);
      if (type === "pdf")
        await exportPDF(stats, users, projWithProgress, tasks);
      if (type === "word")
        await exportWord(stats, users, projWithProgress, tasks);
    } catch (e) {
      alert(`Export алдаа: ${e.message}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#080e1a] font-sans transition-colors">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BarChart3 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 dark:text-white leading-tight">
                Удирдлагын тайлан
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {new Date().toLocaleDateString("mn-MN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Refresh */}
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Шинэчлэх
            </button>

            {/* Export buttons */}
            <ExportButton
              icon={FileSpreadsheet}
              label="Excel"
              color="bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20"
              onClick={() => handleExport("excel")}
              loading={exporting === "excel"}
            />
            <ExportButton
              icon={FileText}
              label="PDF"
              color="bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-500/20"
              onClick={() => handleExport("pdf")}
              loading={exporting === "pdf"}
            />
            <ExportButton
              icon={FileDown}
              label="Word"
              color="bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-500/20"
              onClick={() => handleExport("word")}
              loading={exporting === "word"}
            />
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-500 text-sm rounded-2xl px-5 py-4 mb-4">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-[11px] text-red-400 mt-1">
                Browser Console (F12) дотор дэлгэрэнгүй алдааг харна уу.
              </p>
            </div>
          </div>
        )}

        {/* ── Partial endpoint warnings ── */}
        {/* {!error && endpointErrors?.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 mb-4">
            <p className="text-[12px] font-bold text-amber-600 dark:text-amber-400 mb-2">
              ⚠️ Зарим API холболт амжилтгүй — хэсэгчилсэн мэдээлэл харуулж
              байна:
            </p>
            <ul className="space-y-1">
              {endpointErrors.map((e, i) => (
                <li
                  key={i}
                  className="text-[11px] text-amber-500 font-mono bg-amber-100 dark:bg-amber-900/20 px-3 py-1 rounded-lg"
                >
                  {e}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-amber-400 mt-2">
              Endpoint URL болон Django urls.py-г шалгана уу.
            </p>
          </div>
        )} */}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {!loading && stats && (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm mb-6 overflow-x-auto">
              {[
                { key: "overview", label: "Нийт тойм" },
                { key: "tasks", label: "Даалгавар" },
                { key: "attendance", label: "Ирц" },
                { key: "projects", label: "Төслүүд" },
                { key: "users", label: "Ажилтнууд" },
              ].map((tab) => (
                <Tab
                  key={tab.key}
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </Tab>
              ))}
            </div>

            {/* ── Overview tab ── */}
            {activeTab === "overview" && (
              <>
                <OverviewPanel stats={stats} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <TaskPanel stats={stats} />
                  <AttendancePanel stats={stats} />
                  <ProjectStatusPanel stats={stats} />
                  <UserRolePanel stats={stats} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <DepartmentPanel stats={stats} />
                  <TopPerformersPanel stats={stats} />
                </div>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <ProjectProgressPanel stats={stats} />
                </div>
              </>
            )}

            {/* ── Tasks tab ── */}
            {activeTab === "tasks" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TaskPanel stats={stats} />
                <TopPerformersPanel stats={stats} />
                <div className="md:col-span-2">
                  <ProjectProgressPanel stats={stats} />
                </div>
              </div>
            )}

            {/* ── Attendance tab ── */}
            {activeTab === "attendance" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AttendancePanel stats={stats} />
                <DepartmentPanel stats={stats} />
              </div>
            )}

            {/* ── Projects tab ── */}
            {activeTab === "projects" && (
              <div className="grid grid-cols-1 gap-4">
                <ProjectStatusPanel stats={stats} />
                <ProjectProgressPanel stats={stats} />
              </div>
            )}

            {/* ── Users tab ── */}
            {activeTab === "users" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UserRolePanel stats={stats} />
                <TopPerformersPanel stats={stats} />
                <DepartmentPanel stats={stats} />
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
