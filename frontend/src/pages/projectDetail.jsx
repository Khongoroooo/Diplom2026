import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ChevronDown,
  User,
  Plus,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import HeaderSection from "../components/headerSection";
import CommentSection from "../components/commentSection";
import { BASE_URL } from "../constants/url";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);

  const userRole = localStorage.getItem("user_role");
  const isManager = userRole === "MANAGER" || userRole === "ADMIN";

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const [projRes, taskRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/tasks/projects/${id}/`, { headers }),
        axios.get(`${BASE_URL}/api/tasks/tasks/?project=${id}`, { headers }),
      ]);
      setProject(projRes.data);
      setTasks(
        Array.isArray(taskRes.data) ? taskRes.data : taskRes.data.results || [],
      );
    } catch (error) {
      console.error("Fetch data error", error);
    } finally {
      setLoading(false);
    }
  };

  // Хэрэглэгчдийг татах функц (Modal нээгдэхэд дуудагдана)
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");

      // Чиний urls.py дээр 'list/' гэж байгаа учраас:
      const res = await axios.get(`${BASE_URL}/api/users/list/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];
      setAllUsers(userData);

      if (project) {
        setSelectedMembers(project.members || []);
      }
    } catch (error) {
      // Хэрэв алдаа гарсаар байвал консол дээрх URL-ийг сайн хар
      console.error("Users fetch error:", error);
      console.log("Хандаж буй хаяг:", `${BASE_URL}/api/users/list/`);
    }
  };

  const handleInvite = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.patch(
        `${BASE_URL}/api/tasks/projects/${id}/`,
        { members: selectedMembers },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowInviteModal(false);
      fetchProjectData();
      alert("Амжилттай шинэчлэгдлээ!");
    } catch (error) {
      alert("Алдаа гарлаа");
    }
  };

  const updateTask = async (taskId, data) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.patch(
        `${BASE_URL}/api/tasks/tasks/${taskId}/`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...response.data } : t)),
      );
    } catch (error) {
      alert("Хадгалж чадсангүй.");
    }
  };

  const handleAddTask = async (e) => {
    if (e.key === "Enter" && newTaskTitle.trim()) {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.post(
          `${BASE_URL}/api/tasks/tasks/`,
          { title: newTaskTitle, project: id, status: "todo" },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setTasks([...tasks, response.data]);
        setNewTaskTitle("");
      } catch (error) {
        alert("Task нэмэхэд алдаа гарлаа");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#00ca72";
      case "review":
        return "#579bfc";
      case "working":
        return "#fdab3d";
      case "stuck":
        return "#e2445c";
      default:
        return "#c4c4c4";
    }
  };

  const renderTable = (
    title,
    taskList,
    headerColor,
    titleColor,
    showAddRow = false,
  ) => (
    <div className="mb-10 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div
        className={`p-3 flex items-center gap-2 border-l-[10px] rounded-t-2xl ${headerColor}`}
      >
        <ChevronDown size={18} className="text-slate-400" />
        <h2
          className={`font-bold text-sm uppercase tracking-tight ${titleColor}`}
        >
          {title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3">TASK TITLE</th>
              <th className="p-3 w-44 text-center">STATUS</th>
              <th className="p-3 w-40 text-center">PERSON</th>
              <th className="p-3 w-48 text-center">NOTE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
            {taskList.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group"
              >
                <td className="p-3 text-center">
                  <input type="checkbox" className="rounded border-slate-300" />
                </td>
                <td className="p-3 text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  <span className="truncate mr-2 flex-1">{task.title}</span>
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="relative flex items-center gap-2 text-[10px] font-bold bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition-all ml-2"
                  >
                    <div className="relative">
                      <MessageSquare size={14} />
                      <span className="absolute -top-2.5 -right-2.5 bg-blue-600 text-white text-[9px] min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 shadow-sm font-extrabold ring-2 ring-white dark:ring-slate-950">
                        {task.comment_count || 0}
                      </span>
                    </div>
                    <span>Updates</span>
                  </button>
                </td>
                <td className="p-1 px-2">
                  <select
                    value={task.status}
                    onChange={(e) => {
                      if (e.target.value === "completed" && !isManager) {
                        alert("Зөвхөн менежер Done болгох эрхтэй.");
                        return;
                      }
                      updateTask(task.id, { status: e.target.value });
                    }}
                    style={{ backgroundColor: getStatusColor(task.status) }}
                    className="w-full py-2 px-1 text-center text-[11px] font-bold text-white uppercase outline-none border-none rounded-2xl appearance-none shadow-sm"
                  >
                    <option value="todo">To Do</option>
                    <option value="working">Working</option>
                    <option value="stuck">Stuck</option>
                    <option value="review">Review</option>
                    {isManager && <option value="completed">Done</option>}
                  </select>
                </td>
                <td className="p-1 px-4 text-center">
                  {isManager ? (
                    <div className="relative inline-flex items-center gap-2 p-1.5 rounded-full border border-transparent hover:border-slate-200 cursor-pointer">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-600 font-bold">
                        {task.assigned_to_name?.charAt(0) || <User size={12} />}
                      </div>
                      <select
                        value={task.assigned_to || ""}
                        onChange={(e) =>
                          updateTask(task.id, {
                            assigned_to: e.target.value || null,
                          })
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      >
                        <option value="">👤 Unassigned</option>
                        {project?.member_details?.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.full_name}
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400">
                        {task.assigned_to_name || "Assign"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 opacity-80">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase">
                        {task.assigned_to_name?.charAt(0) || "-"}
                      </div>
                      <span className="text-[11px] dark:text-slate-400">
                        {task.assigned_to_name || "---"}
                      </span>
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    defaultValue={task.note || ""}
                    onBlur={(e) =>
                      updateTask(task.id, { note: e.target.value })
                    }
                    placeholder="Add note..."
                    className="w-full bg-transparent text-xs border-none focus:ring-0 outline-none placeholder:opacity-0 group-hover:placeholder:opacity-100 transition-opacity dark:text-slate-300"
                  />
                </td>
              </tr>
            ))}
            {showAddRow && (
              <tr className="bg-slate-50/30 dark:bg-slate-900/20">
                <td className="p-3 text-center text-slate-300">
                  <Plus size={14} className="mx-auto" />
                </td>
                <td colSpan="4" className="p-1">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={handleAddTask}
                    placeholder="+ Add Task"
                    className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 px-2 outline-none dark:text-white"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse text-slate-400 font-bold">
        ТӨСЛИЙГ АЧААЛЖ БАЙНА...
      </div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 md:p-8 font-sans transition-colors relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 hover:text-blue-600 active:scale-90 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <HeaderSection paths={[{ name: "Даалгавар" }]} />
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="text-yellow-400">★</span> {project?.title}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2 overflow-hidden">
              {project?.member_details?.map((m, i) => (
                <div
                  key={i}
                  title={m.full_name}
                  className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-950 bg-indigo-500 flex items-center justify-center text-[11px] text-white font-bold transition-transform hover:scale-110 shadow-sm"
                >
                  {m.full_name?.charAt(0)}
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setShowInviteModal(true);
                fetchAllUsers();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              INVITE
            </button>
          </div>
        </div>

        {renderTable(
          "Active Tasks",
          tasks.filter((t) => ["todo", "working", "stuck"].includes(t.status)),
          "border-blue-400",
          "text-blue-400",
          true,
        )}
        {renderTable(
          "Review",
          tasks.filter((t) => t.status === "review"),
          "border-orange-400",
          "text-orange-400",
        )}
        {renderTable(
          "Done",
          tasks.filter((t) => t.status === "completed"),
          "border-green-500",
          "text-green-500",
        )}
      </div>

      {/* --- Task Updates Section --- */}
      {selectedTask && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all"
            onClick={() => setSelectedTask(null)}
          />
          <CommentSection
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onCommentAdded={fetchProjectData}
          />
        </>
      )}

      {/* --- Invite Members Modal --- */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          />
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] overflow-hidden relative z-10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold dark:text-white">
                  Гишүүн нэмэх
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Хэрэглэгч хайх..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 text-sm dark:text-white transition-all"
                />
              </div>

              {/* User List */}
              <div className="max-h-72 overflow-y-auto mb-8 pr-2 custom-scrollbar">
                {allUsers
                  .filter((u) =>
                    `${u.last_name} ${u.first_name} ${u.username}`
                      .toLowerCase()
                      .includes(userSearch.toLowerCase()),
                  )
                  .map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800 mb-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-slate-600">
                          {u.first_name?.charAt(0) || u.username?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
                            {u.last_name} {u.first_name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            @{u.username}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedMembers([...selectedMembers, u.id]);
                          else
                            setSelectedMembers(
                              selectedMembers.filter((mid) => mid !== u.id),
                            );
                        }}
                        className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                      />
                    </label>
                  ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Цуцлах
                </button>
                <button
                  onClick={handleInvite}
                  className="flex-1 py-4 rounded-2xl bg-blue-600 font-bold text-sm text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Хадгалах
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
