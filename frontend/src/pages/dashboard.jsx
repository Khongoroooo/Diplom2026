import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, Briefcase, CheckCircle, Clock, 
  TrendingUp, Layers, PieChart, Activity,
  ChevronRight, Calendar
} from "lucide-react";
import HeaderSection from "../components/headerSection";
import { BASE_URL } from "../constants/url";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = localStorage.getItem("user_name") || "Хэрэглэгч";
  const dashboardPaths = [{ name: "Dashboard", link: "/" }];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = { Authorization: `Bearer ${token}` };

        const [projRes, userRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/tasks/projects/`, { headers }),
          axios.get(`${BASE_URL}/api/users/list/`, { headers })
        ]);

        const allProjects = Array.isArray(projRes.data) ? projRes.data : projRes.data.results || [];
        setProjects(allProjects);

        const completed = allProjects.filter(p => p.status === 'completed').length;
        const inProgress = allProjects.filter(p => p.status === 'in_progress').length;
        
        setStats({
          totalUsers: Array.isArray(userRes.data) ? userRes.data.length : userRes.data.count || 0,
          totalProjects: allProjects.length,
          completedProjects: completed,
          activeProjects: inProgress,
          recentActivity: allProjects.slice(0, 5)
        });

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchData();
  }, []);

  // Зөөлөн саарал Skeleton
  const Skeleton = ({ className }) => (
    <div className={`bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-xl ${className}`} />
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 md:p-8 font-sans text-slate-900">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header - Энгийн, цэвэрхэн */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <HeaderSection paths={dashboardPaths} />
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-white tracking-tight">
              Сайн байна уу, {userName}
            </h1>
            <p className="text-sm text-slate-500 font-normal">Системийн өнөөдрийн тойм мэдээлэл.</p>
          </div>
          
          <div className="hidden md:flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Систем хэвийн ажиллаж байна</span>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)
          ) : (
            <>
              <QuickStat icon={<Users size={20}/>} label="Нийт ажилчид" value={stats?.totalUsers} color="blue" />
              <QuickStat icon={<Briefcase size={20}/>} label="Нийт төсөл" value={stats?.totalProjects} color="indigo" />
              <QuickStat icon={<CheckCircle size={20}/>} label="Дууссан төсөл" value={stats?.completedProjects} color="emerald" />
              <QuickStat icon={<Clock size={20}/>} label="Хийгдэж буй" value={stats?.activeProjects} color="orange" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-500" /> Төслийн гүйцэтгэл
                </h3>
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : (
                <div className="grid gap-5">
                  {projects.slice(0, 4).map((project) => (
                    <div key={project.id} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {project.title}
                        </span>
                        <span className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {project.member_details?.length || 0} гишүүн
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${project.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                          style={{ width: project.status === 'completed' ? '100%' : '45%' }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 dark:shadow-none overflow-hidden relative">
                  <Activity className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
                  <h2 className="text-xl font-semibold mb-2 leading-tight">Мэдээллийн тойм</h2>
                  <p className="text-indigo-100 text-sm font-light">Бүх идэвхтэй төслүүдийн явцыг эндээс нэг дороос хянах боломжтой.</p>
                  <button className="mt-6 text-xs bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">Дэлгэрэнгүй</button>
               </div>
               
               <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex items-center gap-5 shadow-sm">
                  <div className="w-14 h-14 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Багийн гишүүд</p>
                    <p className="text-2xl font-semibold text-slate-800 dark:text-white leading-none">{stats?.totalUsers}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 ml-1">Сүүлийн төслүүд</h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading ? (
                  [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 m-3 rounded-lg" />)
                ) : (
                  stats?.recentActivity.map((proj) => (
                    <div key={proj.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Layers size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{proj.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-medium text-indigo-500 uppercase">{proj.status}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar size={10} /> {proj.start_date}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Stats Card - Цэвэрхэн загвар
function QuickStat({ icon, label, value, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50/50 dark:bg-blue-500/10",
    indigo: "text-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10",
    emerald: "text-emerald-600 bg-emerald-50/50 dark:bg-emerald-500/10",
    orange: "text-orange-600 bg-orange-50/50 dark:bg-orange-500/10",
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-semibold text-slate-800 dark:text-white leading-none">
        {value || 0}
      </p>
    </div>
  );
}