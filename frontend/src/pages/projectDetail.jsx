import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MoreHorizontal,
  UserPlus,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import HeaderSection from "../components/headerSection";

const BASE_URL = "http://192.168.1.10:8000";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    // AOS-ийг зөвхөн нэг удаа ачаална
    AOS.init({ duration: 600, once: true });
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
      console.error("Дата татахад алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    if (e.key === "Enter" && newTaskTitle.trim()) {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.post(
          `${BASE_URL}/api/tasks/tasks/`,
          {
            title: newTaskTitle,
            project: id,
            status: "todo",
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setTasks([...tasks, response.data]);
        setNewTaskTitle("");
      } catch (error) {
        alert("Task нэмэхэд алдаа гарлаа", error);
      }
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500";
      case "review":
        return "bg-blue-400";
      case "stuck":
        return "bg-red-500";
      case "working":
        return "bg-orange-400";
      default:
        return "bg-slate-400";
    }
  };

  const pageName = [{ name: "Даалгаврууд", link: "/projects" }];

  const totalNumberTest = tasks.reduce(
    (sum, task) => sum + (Number(task.number_test) || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 md:p-8 font-sans transition-colors">
      {/* Header Section - Анимаци энд л байна */}
      <div className="flex items-center gap-3 mb-10" data-aos="fade-right">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:shadow-lg transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <HeaderSection paths={pageName} />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 animate-pulse font-medium">
            Төслийг уншиж байна...
          </p>
        </div>
      ) : !project ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500">Төсөл олдсонгүй (ID: {id})</p>
        </div>
      ) : (
        /* Эндээс доош ямар ч AOS анимаци байхгүй тул "хальт үзэгдээд алга болохгүй" */
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                ⭐ {project.title}
              </h1>
              <div className="flex gap-4 mt-2 text-sm text-slate-500">
                <button className="border-b-2 border-indigo-500 text-indigo-600 pb-1 px-2 font-medium">
                  Main Table
                </button>
                <button className="pb-1 px-2 hover:text-slate-800 transition-colors">
                  Project Info
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {project.member_details?.map((member, index) => (
                  <div
                    key={index}
                    title={member.full_name}
                    className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {member.full_name?.charAt(0)}
                  </div>
                ))}
                <button className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:border-indigo-500 transition-all">
                  <UserPlus size={16} />
                </button>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all">
                INVITE
              </button>
              <button className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <MoreHorizontal size={22} />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
              <ChevronDown size={18} className="text-indigo-500" />
              <h2 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-xs tracking-widest">
                Tasks
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="w-12 p-4 text-center">#</th>
                    <th className="p-4 font-semibold">Task Title</th>
                    <th className="p-4 font-semibold w-48 text-center">
                      Status
                    </th>
                    <th className="p-4 font-semibold w-32 text-center">
                      Person
                    </th>
                    <th className="p-4 font-semibold w-32 text-center">
                      Num Test
                    </th>
                    <th className="p-4 font-semibold w-40">Note</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all"
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {task.title}
                      </td>
                      <td className="p-1">
                        <div
                          className={`${getStatusStyle(task.status)} py-2 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider`}
                        >
                          {task.status === "todo" ? "Review" : task.status}
                        </div>
                      </td>
                      <td className="p-4">
                        <div
                          className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] text-indigo-600 font-bold mx-auto border border-indigo-200 dark:border-indigo-800"
                          title={task.assigned_to_name}
                        >
                          {task.assigned_to_name?.charAt(0) || "👤"}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-center text-slate-600 dark:text-slate-400">
                        {task.number_test || "-"}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        <input
                          type="text"
                          defaultValue={task.note || ""}
                          placeholder="Тэмдэглэл..."
                          className="bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 w-full outline-none hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all"
                          onBlur={async (e) => {
                            // Input-аас гарахад (Focus алдахад) автоматаар хадгална
                            const newNote = e.target.value;
                            if (newNote !== task.note) {
                              try {
                                const token =
                                  localStorage.getItem("access_token");
                                await axios.patch(
                                  `${BASE_URL}/api/tasks/tasks/${task.id}/`,
                                  { note: newNote },
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  },
                                );
                                console.log("Note хадгалагдлаа");
                              } catch (error) {
                                console.error(
                                  "Note хадгалахад алдаа гарлаа",
                                  error,
                                );
                              }
                            }
                          }}
                        />
                      </td>
                      <td className="p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical
                          size={16}
                          className="text-slate-400 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/30 dark:bg-slate-900/30">
                    <td className="p-4 text-center text-slate-300">+</td>
                    <td colSpan="6" className="p-2">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={handleAddTask}
                        placeholder="+ Add Task"
                        className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 outline-none dark:text-white placeholder:text-slate-400"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-12 pr-28">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase mb-1">
                  Status Mix
                </span>
                <div className="flex h-4 w-32 rounded-full overflow-hidden border border-white dark:border-slate-700 shadow-sm">
                  <div className="bg-emerald-500 w-[60%]"></div>
                  <div className="bg-blue-400 w-[30%]"></div>
                  <div className="bg-slate-300 w-[10%]"></div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase mb-1 font-semibold">
                  Total Sum
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {totalNumberTest}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
