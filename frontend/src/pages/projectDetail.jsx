import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  User,
  Plus,
  MessageSquare,
  Search,
  X,
  Paperclip,
  FileText,
  Download,
  Loader2,
  ZoomIn,
  Image as ImageIcon,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Eye,
  Users,
  BarChart2,
  Filter,
  Star,
} from "lucide-react";
import HeaderSection from "../components/headerSection";
import CommentSection from "../components/commentSection";
import { BASE_URL } from "../constants/url";

/* ─── Lightbox ──────────────────────────────────────────── */
const Lightbox = ({ src, onClose }) => {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/92 backdrop-blur-md flex items-center justify-center p-6"
      onClick={onClose}
      style={{ animation: "pdFadeIn .15s ease" }}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
      >
        <X size={18} />
      </button>
      <img
        src={src}
        alt="Preview"
        className="max-h-[88vh] max-w-[88vw] rounded-2xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "pdScaleIn .2s ease" }}
      />
    </div>
  );
};

/* ─── Status config ─────────────────────────────────────── */
const STATUS = {
  todo: {
    label: "To Do",
    color: "#94a3b8",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-500",
    icon: Circle,
  },
  working: {
    label: "Working",
    color: "#fdab3d",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-500",
    icon: Clock,
  },
  stuck: {
    label: "Stuck",
    color: "#e2445c",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-500",
    icon: AlertCircle,
  },
  review: {
    label: "Review",
    color: "#579bfc",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-500",
    icon: Eye,
  },
  completed: {
    label: "Done",
    color: "#00ca72",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-500",
    icon: CheckCircle2,
  },
};

/* ─── File cell ─────────────────────────────────────────── */
const FileCell = ({
  task,
  isManager,
  uploadingTaskId,
  onUpload,
  onDelete,
  onImageClick,
}) => {
  const isImage = (url = "") =>
    /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
  const shortName = (url = "") =>
    decodeURIComponent(url.split("/").pop().split("?")[0]).slice(0, 20) +
    (url.length > 20 ? "…" : "");

  if (uploadingTaskId === task.id) {
    return (
      <div className="flex items-center gap-1.5 text-slate-400 text-xs justify-center">
        <Loader2 size={13} className="animate-spin text-indigo-400" />
        <span>Хуулж байна...</span>
      </div>
    );
  }

  if (task.file_url) {
    const img = isImage(task.file_url);
    return (
      <div className="flex items-center gap-1.5 group/file">
        {img ? (
          <div
            className="relative w-10 h-10 rounded-lg overflow-hidden cursor-zoom-in shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
            onClick={() => onImageClick(task.file_url)}
          >
            <img
              src={task.file_url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-200 group-hover/file:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center transition-all">
              <ZoomIn
                size={12}
                className="text-white opacity-0 hover:opacity-100"
              />
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <FileText size={14} className="text-indigo-400" />
          </div>
        )}
        <span
          className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex-1 max-w-[80px]"
          title={task.file_url}
        >
          {shortName(task.file_url)}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover/file:opacity-100 transition-opacity">
          <a
            href={task.file_url}
            target="_blank"
            rel="noreferrer"
            className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <Download size={11} />
          </a>
          {isManager && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <label className="flex items-center justify-center gap-1.5 cursor-pointer w-full">
      <div className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-500 border border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-xl px-3 py-1.5 transition-all hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10">
        <Paperclip size={11} />
        <span>Хавсаргах</span>
      </div>
      <input
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files[0]) onUpload(task.id, e.target.files[0]);
          e.target.value = "";
        }}
      />
    </label>
  );
};

/* ─── Status badge ──────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.todo;
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${s.bg} ${s.text}`}
    >
      <Icon size={10} />
      {s.label}
    </span>
  );
};

/* ─── Stat card ─────────────────────────────────────────── */
const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-3 shadow-sm">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-xl font-black text-slate-800 dark:text-white leading-none">
        {value}
      </p>
      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

/* ─── Main ──────────────────────────────────────────────── */
export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadingTaskId, setUploadingTaskId] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTask, setSearchTask] = useState("");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [openStatusId, setOpenStatusId] = useState(null);
  const userRole = localStorage.getItem("user_role");
  const isManager = userRole === "MANAGER" || userRole === "ADMIN";

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  });

  /* ── Fetch ── */
  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const [projRes, taskRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/tasks/projects/${id}/`, { headers }),
        axios.get(`${BASE_URL}/api/tasks/tasks/?project=${id}`, { headers }),
      ]);
      setProject(projRes.data);
      setTasks(
        Array.isArray(taskRes.data) ? taskRes.data : taskRes.data.results || [],
      );
    } catch {
      setErrorMsg("Төслийн мэдээллийг татахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/list/`, {
        headers: getAuthHeaders(),
      });
      setAllUsers(Array.isArray(res.data) ? res.data : res.data.results || []);
      if (project) setSelectedMembers(project.members || []);
    } catch {}
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  /* ── Update task ── */
  const updateTask = async (taskId, data) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/tasks/tasks/${taskId}/`,
        data,
        { headers: getAuthHeaders() },
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...res.data } : t)),
      );
    } catch {
      alert("Хадгалж чадсангүй.");
    }
  };

  /* ── Upload file ── */
  const uploadTaskFile = async (taskId, file) => {
    setUploadingTaskId(taskId);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axios.patch(
        `${BASE_URL}/api/tasks/tasks/${taskId}/`,
        form,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...res.data } : t)),
      );
    } catch {
      alert("Файл хуулахад алдаа гарлаа.");
    } finally {
      setUploadingTaskId(null);
    }
  };

  /* ── Delete file ── */
  const deleteTaskFile = async (taskId) => {
    if (!window.confirm("Файлыг устгах уу?")) return;
    try {
      await axios.patch(
        `${BASE_URL}/api/tasks/tasks/${taskId}/`,
        { file: null },
        { headers: getAuthHeaders() },
      );
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, file: null, file_url: null } : t,
        ),
      );
    } catch {
      alert("Файл устгахад алдаа гарлаа.");
    }
  };

  /* ── Add task ── */
  const handleAddTask = async (e) => {
    if (e.key === "Enter" && newTaskTitle.trim()) {
      try {
        const res = await axios.post(
          `${BASE_URL}/api/tasks/tasks/`,
          { title: newTaskTitle, project: id, status: "todo" },
          { headers: getAuthHeaders() },
        );
        setTasks((prev) => [...prev, res.data]);
        setNewTaskTitle("");
      } catch {
        alert("Task нэмэхэд алдаа гарлаа.");
      }
    }
  };

  /* ── Invite ── */
  const handleInvite = async () => {
    try {
      await axios.patch(
        `${BASE_URL}/api/tasks/projects/${id}/`,
        { members: selectedMembers },
        { headers: getAuthHeaders() },
      );
      setShowInviteModal(false);
      fetchProjectData();
    } catch {
      alert("Алдаа гарлаа.");
    }
  };

  /* ── Export tasks CSV ── */
  const exportTasksCSV = () => {
    const header = "ID,Гарчиг,Статус,Хариуцагч,Тэмдэглэл\n";
    const rows = tasks
      .map(
        (t) =>
          `${t.id},"${t.title}",${t.status},"${t.assigned_to_name || ""}","${t.note || ""}"`,
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${project?.title || "tasks"}.csv`;
    a.click();
  };

  /* ── Toggle group ── */
  const toggleGroup = (key) =>
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ── Stats ── */
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "completed").length;
  const inprog = tasks.filter((t) => t.status === "working").length;
  const stuck = tasks.filter((t) => t.status === "stuck").length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  /* ── Filter / search ── */
  const visibleTasks = tasks.filter((t) => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSearch = t.title
      ?.toLowerCase()
      .includes(searchTask.toLowerCase());
    return matchStatus && matchSearch;
  });

  /* ── Groups ── */
  const groups = [
    {
      key: "active",
      title: "Идэвхтэй",
      accent: "from-indigo-500 to-blue-400",
      border: "border-indigo-400",
      filter: (t) => ["todo", "working", "stuck"].includes(t.status),
      showAdd: true,
    },
    {
      key: "review",
      title: "Хянаж байна",
      accent: "from-amber-400 to-orange-400",
      border: "border-amber-400",
      filter: (t) => t.status === "review",
    },
    {
      key: "done",
      title: "Дууссан",
      accent: "from-emerald-500 to-teal-400",
      border: "border-emerald-400",
      filter: (t) => t.status === "completed",
    },
  ];

  /* ─── Table ─── */
  const renderGroup = ({ key, title, accent, border, filter, showAdd }) => {
    const groupTasks = visibleTasks.filter(filter);
    const isCollapsed = collapsedGroups[key];

    return (
      <div key={key} className="mb-6">
        {/* Group header */}
        <button
          className="flex items-center gap-3 mb-3 w-full text-left group/gh"
          onClick={() => toggleGroup(key)}
        >
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${accent} shadow-sm`}
          >
            {isCollapsed ? (
              <ChevronRight size={14} className="text-white/80" />
            ) : (
              <ChevronDown size={14} className="text-white/80" />
            )}
            <span className="text-xs font-extrabold text-white uppercase tracking-widest">
              {title}
            </span>
            <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {groupTasks.length}
            </span>
          </div>
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
        </button>

        {!isCollapsed && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[820px]">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="py-2.5 px-3 w-8">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 w-3.5 h-3.5"
                      />
                    </th>
                    <th className="py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Даалгавар
                    </th>
                    <th className="py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32 text-center">
                      Статус
                    </th>
                    <th className="py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-36 text-center">
                      Хариуцагч
                    </th>
                    <th className="py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-44 text-center">
                      Файл
                    </th>
                    <th className="py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-36">
                      Тэмдэглэл
                    </th>
                    <th className="py-2.5 px-3 w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
                  {groupTasks.length === 0 && !showAdd ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-xs text-slate-300 dark:text-slate-600"
                      >
                        Даалгавар байхгүй
                      </td>
                    </tr>
                  ) : (
                    groupTasks.map((task, idx) => (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group/row"
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 w-3.5 h-3.5"
                          />
                        </td>

                        {/* Title + comments */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 flex-1 truncate max-w-[260px]">
                              {task.title}
                            </span>
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-indigo-200 dark:hover:border-indigo-700 transition-all relative"
                            >
                              <MessageSquare size={12} />
                              {task.comment_count > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white text-[8px] min-w-[14px] h-3.5 flex items-center justify-center rounded-full px-1 font-black">
                                  {task.comment_count}
                                </span>
                              )}
                              Updates
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          <div className="relative inline-block group">
                            <select
                              value={task.status}
                              onChange={(e) => {
                                if (
                                  e.target.value === "completed" &&
                                  !isManager
                                ) {
                                  alert("Зөвхөн менежер Done болгох эрхтэй.");
                                  return;
                                }
                                updateTask(task.id, { status: e.target.value });
                              }}
                              // Select-ийн ерөнхий загвар
                              className="appearance-none pr-7 pl-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border-0 outline-none cursor-pointer transition-all duration-200 hover:shadow-sm"
                              style={{
                                // Сонгогдсон үеийн арын бүдэг өнгө болон текстийн өнгө
                                backgroundColor:
                                  STATUS[task.status]?.color + "20",
                                color: STATUS[task.status]?.color,
                              }}
                            >
                              {/* Option-уудын текстийн өнгийг тус тусад нь өгөх */}
                              <option
                                value="todo"
                                style={{
                                  color: STATUS.todo.color,
                                  backgroundColor: "white",
                                }}
                              >
                                To Do
                              </option>
                              <option
                                value="working"
                                style={{
                                  color: STATUS.working.color,
                                  backgroundColor: "white",
                                }}
                              >
                                Working
                              </option>
                              <option
                                value="stuck"
                                style={{
                                  color: STATUS.stuck.color,
                                  backgroundColor: "white",
                                }}
                              >
                                Stuck
                              </option>
                              <option
                                value="review"
                                style={{
                                  color: STATUS.review.color,
                                  backgroundColor: "white",
                                }}
                              >
                                Review
                              </option>

                              {/* Менежер бол Done-ийг харуулна */}
                              {(isManager || task.status === "completed") && (
                                <option
                                  value="completed"
                                  style={{
                                    color: STATUS.completed.color,
                                    backgroundColor: "white",
                                  }}
                                >
                                  Done
                                </option>
                              )}
                            </select>

                            {/* Сумны дүрс (ChevronDown) - хөдөлгөөнгүй байлгах */}
                            <ChevronDown
                              size={10}
                              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70"
                              style={{ color: STATUS[task.status]?.color }}
                            />
                          </div>
                        </td>

                        {/* Assigned */}
                        <td className="py-3 px-3">
                          {isManager ? (
                            <div className="relative inline-flex items-center gap-1.5 cursor-pointer w-full justify-center">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-[9px] text-white font-bold shrink-0">
                                {task.assigned_to_name?.charAt(0) || (
                                  <User size={10} />
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {task.assigned_to_name || (
                                  <span className="text-slate-300">Assign</span>
                                )}
                              </span>
                              <select
                                value={task.assigned_to || ""}
                                onChange={(e) =>
                                  updateTask(task.id, {
                                    assigned_to: e.target.value || null,
                                  })
                                }
                                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                              >
                                <option value="">Unassigned</option>
                                {project?.member_details?.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.full_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300">
                                {task.assigned_to_name?.charAt(0) || "—"}
                              </div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {task.assigned_to_name || "—"}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* File */}
                        <td className="py-3 px-3">
                          <FileCell
                            task={task}
                            isManager={isManager}
                            uploadingTaskId={uploadingTaskId}
                            onUpload={uploadTaskFile}
                            onDelete={deleteTaskFile}
                            onImageClick={setLightboxSrc}
                          />
                        </td>

                        {/* Note */}
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            defaultValue={task.note || ""}
                            onBlur={(e) =>
                              updateTask(task.id, { note: e.target.value })
                            }
                            placeholder="Тэмдэглэл..."
                            className="w-full bg-transparent text-[11px] text-slate-500 dark:text-slate-400 border-none focus:ring-0 outline-none placeholder:text-slate-200 dark:placeholder:text-slate-700 focus:placeholder:text-slate-300 transition-all"
                          />
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-2">
                          <button className="opacity-0 group-hover/row:opacity-100 p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                            <MoreHorizontal size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}

                  {/* Add task row */}
                  {showAdd && (
                    <tr className="bg-slate-50/40 dark:bg-slate-800/20">
                      <td className="py-2 px-3">
                        <Plus size={13} className="text-slate-300" />
                      </td>
                      <td colSpan={6} className="py-1 px-3">
                        <input
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={handleAddTask}
                          placeholder="+ Шинэ даалгавар нэмэх (Enter дарах)"
                          className="w-full bg-transparent text-[12px] text-slate-500 dark:text-slate-400 border-none focus:ring-0 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 py-2"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-white dark:bg-[#080e1a] font-sans transition-colors">
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        {/* ── Top nav ── */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-700 active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <HeaderSection paths={[{ name: "Төслүүд", link: "/projects" }]} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3" />
            <p className="text-sm">Уншиж байна...</p>
          </div>
        ) : errorMsg ? (
          <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-sm">
            {errorMsg}
          </div>
        ) : (
          <>
            {/* ── Project hero ── */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/20">
                    {project?.title?.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-800 dark:text-white leading-tight">
                      {project?.title}
                    </h1>
                    {project?.description && (
                      <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge status={project?.status} />
                      {project?.start_date && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> {project.start_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Members */}
                  <div className="flex -space-x-2">
                    {project?.member_details?.slice(0, 5).map((m, i) => (
                      <div
                        key={i}
                        title={m.full_name}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm hover:scale-110 transition-transform cursor-default"
                      >
                        {m.full_name?.charAt(0)}
                      </div>
                    ))}
                    {(project?.member_details?.length || 0) > 5 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-500 dark:text-slate-300">
                        +{project.member_details.length - 5}
                      </div>
                    )}
                  </div>

                  {/* Export */}
                  <button
                    onClick={exportTasksCSV}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
                  >
                    <Download size={13} /> Экспорт
                  </button>

                  {/* Invite */}
                  {isManager && (
                    <button
                      onClick={() => {
                        setShowInviteModal(true);
                        fetchAllUsers();
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <Users size={13} /> Урих
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Явц
                  </span>
                  <span className="text-[10px] font-black text-indigo-500">
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard
                label="Нийт даалгавар"
                value={total}
                color="bg-gradient-to-br from-slate-400 to-slate-500"
                icon={BarChart2}
              />
              <StatCard
                label="Хийгдэж байна"
                value={inprog}
                color="bg-gradient-to-br from-amber-400 to-orange-400"
                icon={Clock}
              />
              <StatCard
                label="Хүндрэлтэй"
                value={stuck}
                color="bg-gradient-to-br from-red-400 to-rose-500"
                icon={AlertCircle}
              />
              <StatCard
                label="Дууссан"
                value={done}
                color="bg-gradient-to-br from-emerald-400 to-teal-500"
                icon={CheckCircle2}
              />
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
              {/* Search */}
              <div className="relative flex-1 max-w-72">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Даалгавар хайх..."
                  value={searchTask}
                  onChange={(e) => setSearchTask(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 ring-indigo-500/20 outline-none dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Filter size={14} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    Шүүлтүүр:
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                  {[
                    "all",
                    "todo",
                    "working",
                    "stuck",
                    "review",
                    "completed",
                  ].map((s) => {
                    const isActive = filterStatus === s;
                    const statusInfo = STATUS[s];

                    // 'all' дээр Filter эсвэл Layers ашиглавал алдаа заахгүй
                    const Icon = s === "all" ? Filter : statusInfo?.icon;

                    return (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200
            ${
              isActive
                ? s === "all"
                  ? "bg-indigo-500 text-white shadow-md scale-105"
                  : `${statusInfo?.bg} ${statusInfo?.text} ring-1 ring-inset ring-current/20 shadow-sm scale-105`
                : "text-slate-500 hover:bg-white dark:hover:bg-slate-800"
            }
          `}
                      >
                        {Icon && (
                          <Icon size={13} strokeWidth={isActive ? 3 : 2} />
                        )}
                        <span>{s === "all" ? "Бүгд" : statusInfo?.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Task groups ── */}
            {groups.map(renderGroup)}
          </>
        )}
      </div>

      {/* ── Comment panel ── */}
      {selectedTask && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all"
            onClick={() => setSelectedTask(null)}
          />
          <CommentSection
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onCommentAdded={fetchProjectData}
          />
        </>
      )}

      {/* ── Invite modal ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowInviteModal(false)}
          />
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800"
            style={{ animation: "pdScaleIn .2s ease" }}
          >
            <div className="p-7">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-extrabold dark:text-white">
                    Гишүүн нэмэх
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {project?.title}
                  </p>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Хэрэглэгч хайх..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-indigo-500/20 text-sm dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
              </div>

              {/* Selected count */}
              {selectedMembers.length > 0 && (
                <div className="mb-3 text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl">
                  {selectedMembers.length} гишүүн сонгогдсон
                </div>
              )}

              {/* User list */}
              <div
                className="max-h-64 overflow-y-auto mb-6 space-y-1 pr-1"
                style={{ scrollbarWidth: "thin" }}
              >
                {allUsers
                  .filter((u) =>
                    `${u.last_name} ${u.first_name} ${u.username}`
                      .toLowerCase()
                      .includes(userSearch.toLowerCase()),
                  )
                  .map((u) => {
                    const checked = selectedMembers.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                          checked
                            ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700"
                            : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-100 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-xs text-white font-bold shadow-sm">
                            {u.first_name?.charAt(0) || u.username?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
                              {u.last_name} {u.first_name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              @{u.username}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            checked
                              ? "bg-indigo-500 border-indigo-500"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {checked && (
                            <CheckCircle2 size={12} className="text-white" />
                          )}
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked)
                                setSelectedMembers((p) => [...p, u.id]);
                              else
                                setSelectedMembers((p) =>
                                  p.filter((x) => x !== u.id),
                                );
                            }}
                            className="opacity-0 absolute w-0 h-0"
                          />
                        </div>
                      </label>
                    );
                  })}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                >
                  Цуцлах
                </button>
                <button
                  onClick={handleInvite}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 font-bold text-sm text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.01] transition-all active:scale-95"
                >
                  Хадгалах
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pdFadeIn  { from{opacity:0}  to{opacity:1} }
        @keyframes pdScaleIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}
