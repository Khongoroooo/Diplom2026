import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderSection from "../components/headerSection";
import SearchInput from "../components/searchButton";
import {
  Calendar,
  Folder,
  Plus,
  ChevronRight,
  Trash2,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../constants/url";

const API_BASE_URL = BASE_URL;

export default function ProjectPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const currentRole = localStorage.getItem("user_role");
  const isManagerOrAdmin = currentRole === "MANAGER" || currentRole === "ADMIN";
  const projectsPage = [{ name: "Төслүүд", link: "/projects" }];

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

      const response = await axios.get(`${API_BASE_URL}/api/tasks/projects/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setProjects(data);
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMsg("Таны нэвтрэх хугацаа дууссан байна. (401)");
      } else {
        setErrorMsg("Сервертэй холбогдоход алдаа гарлаа.");
      }
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm("Та энэ төслийг устгахдаа итгэлтэй байна уу?")) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_BASE_URL}/api/tasks/projects/${projectId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      alert("Төслийг устгахад алдаа гарлаа.", error);
    }
  };

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

  const ProjectSkeleton = () => (
    <div className="flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
      <div className="ml-4 flex-1 space-y-2">
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
        <div className="flex gap-2">
          <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-16" />
          <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-16" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <HeaderSection paths={projectsPage} title="Төслүүд" />
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Төсөл хайх..."
          />
        </div>

        <div className="space-y-4">
          {loading ? (
            [...Array(5)].map((_, i) => <ProjectSkeleton key={i} />)
          ) : errorMsg ? (
            <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
              {errorMsg}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              {searchTerm
                ? `"${searchTerm}" нэртэй төсөл олдсонгүй.`
                : "Төсөл олдсонгүй."}
            </div>
          ) : (
            filteredProjects.map((project) => {
              // Backend-ээс ирж буй progress_percentage-ийг ашиглана
              const progress = project.progress_percentage || 0;

              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="flex flex-col md:flex-row md:items-center p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group gap-4"
                >
                  {/* Хэсэг 1: Икон болон Гарчиг */}
                  <div className="flex items-center flex-1 min-w-0">
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
                          <Calendar size={12} className="mr-1" />
                          {project.start_date}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Хэсэг 2: Progress Bar болон Дуусах хугацаа */}
                  <div className="flex flex-col w-full md:w-64 gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Гүйцэтгэл
                      </span>
                      <span className="text-[10px] font-black text-indigo-500">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center text-[11px] text-slate-400">
                      <Clock size={12} className="mr-1 text-orange-500" />
                      <span className="font-medium text-slate-500">
                        Дуусах: {project.end_date || "Заагаагүй"}
                      </span>
                    </div>
                  </div>

                  {/* Хэсэг 3: Бусад мэдээлэл болон Үйлдэл */}
                  <div className="flex items-center justify-between md:justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="flex items-center text-xs text-slate-400 md:mr-4">
                      <Folder size={12} className="mr-1" />
                      {project.members?.length || 0} гишүүн
                    </div>

                    <div className="flex items-center gap-1">
                      {isManagerOrAdmin && (
                        <button
                          onClick={(e) => handleDelete(e, project.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <div className="text-slate-300 dark:text-slate-500 group-hover:text-indigo-500 transition-colors px-2">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isManagerOrAdmin && (
        <div className="fixed bottom-20 right-6 flex flex-col items-end gap-4 z-50">
          <button
            onClick={() => navigate("/addproject")}
            className="w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 text-white hover:scale-110 active:scale-95 shadow-indigo-500/20"
          >
            <Plus size={32} />
          </button>
        </div>
      )}
    </div>
  );
}
