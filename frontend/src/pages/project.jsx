import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderSection from "../components/headerSection";
import { Search, Calendar, Folder, Plus } from "lucide-react"; // lucide-center -> lucide-react болгож засав
import { useNavigate } from "react-router-dom";

// Тогтмол URL ашиглах
const BASE_URL = "http://192.168.1.10:8000";

export default function ProjectPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const currentRole = localStorage.getItem("user_role");
  const isManagerOrAdmin = currentRole === "MANAGER" || currentRole === "ADMIN";

  const projectsPage = [{ name: "Төслүүд", link: "/projects" }];

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setErrorMsg("Нэвтрэх токен олдсонгүй. Та дахин нэвтэрнэ үү.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${BASE_URL}/api/tasks/projects/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // DRF Pagination-тай үед .results дотор ирдэг, үгүй бол шууд Array ирдэг
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setProjects(data);
      } catch (error) {
        console.error("Төсөл татахад алдаа гарлаа:", error);
        if (error.response?.status === 401) {
          setErrorMsg("Таны нэвтрэх хугацаа дууссан байна. (401)");
        } else {
          setErrorMsg("Сервертэй холбогдоход алдаа гарлаа.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "new":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "completed":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      case "maintenance":
        return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
      case "in_progress":
        return "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20";
      case "half_balance":
        return "text-amber-600 bg-amber-50 dark:bg-amber-900/20";
      default:
        return "text-slate-600 bg-slate-50 dark:bg-slate-900/20";
    }
  };

  const getStatusName = (status) => {
    const statusMap = {
      new: "Шинэ",
      in_progress: "Хийгдэж буй",
      maintenance: "Арчилгаа",
      half_balance: "Хагас гүйцэтгэл",
      completed: "Дууссан",
    };
    return statusMap[status] || status;
  };

  const filteredProjects = projects.filter((project) =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-slate-950 space-y-6 p-6 font-sans text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <HeaderSection paths={projectsPage} title="Төслүүд" />
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Төсөл хайх..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2"></div>
             <p>Уншиж байна...</p>
          </div>
        ) : errorMsg ? (
          <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
            {errorMsg}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            {searchTerm ? `"${searchTerm}" нэртэй төсөл олдсонгүй.` : "Төсөл олдсонгүй."}
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {project.title?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4 flex-1 overflow-hidden">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors truncate">
                  {project.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${getStatusStyle(project.status)}`}
                  >
                    {getStatusName(project.status)}
                  </span>
                  <div className="flex items-center text-xs text-slate-400">
                    <Calendar size={12} className="mr-1" /> {project.start_date}
                  </div>
                  <div className="flex items-center text-xs text-slate-400">
                    <Folder size={12} className="mr-1" />{" "}
                    {project.members?.length || 0} гишүүн
                  </div>
                </div>
              </div>
              <div className="text-slate-300 dark:text-slate-400 text-xl px-2">
                ⋮
              </div>
            </div>
          ))
        )}
      </div>

      {isManagerOrAdmin && (
        <div className="fixed bottom-20 right-6 flex flex-col items-end gap-4 z-50">
          <button
            onClick={() => navigate("/addproject")} 
            className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-500 text-white hover:scale-110 active:scale-95 shadow-indigo-500/20"
          >
            <Plus size={32} />
          </button>
        </div>
      )}
    </div>
  );
}