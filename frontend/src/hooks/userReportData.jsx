// hooks/useReportData.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../constants/url"; // ← таны төслийн замаар тохируулна уу

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

// Endpoint тус бүрийг тусад нь татаж, алдаа гарсан бол хоосон массив буцаана
const safeFetch = async (url, headers) => {
  try {
    const res = await axios.get(url, { headers });
    const data = res.data;
    return Array.isArray(data) ? data : data?.results || [];
  } catch (err) {
    const status = err?.response?.status;
    const msg = err?.response?.data?.detail || err.message;
    console.warn(`[Report] fetch failed: ${url} → ${status} ${msg}`);
    return []; // алдаатай endpoint хоосон массив буцаана, бусад нь үргэлжилнэ
  }
};

export function useReportData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [endpointErrors, setEndpointErrors] = useState([]); // аль endpoint алдаатай болохыг харуулна

  // Raw data
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Derived stats
  const [stats, setStats] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    setEndpointErrors([]);

    const h = getAuthHeaders();

    // Token шалгах
    if (!localStorage.getItem("access_token")) {
      setError("Нэвтрэх токен олдсонгүй. Дахин нэвтэрнэ үү.");
      setLoading(false);
      return;
    }

    // Endpoint тус бүрийг тусад нь tatна — нэг алдаа бусдыг зогсоохгүй
    const ENDPOINTS = [
      { key: "users",       url: `${BASE_URL}/api/users/list/` },
      { key: "projects",    url: `${BASE_URL}/api/tasks/projects/` },
      { key: "tasks",       url: `${BASE_URL}/api/tasks/tasks/` },
      { key: "attendance",  url: `${BASE_URL}/api/attendance/` },
      { key: "departments", url: `${BASE_URL}/api/hr/departments/` },
    ];

    const results = await Promise.all(
      ENDPOINTS.map(async ({ key, url }) => {
        try {
          const res = await axios.get(url, { headers: h });
          const data = res.data;
          return { key, data: Array.isArray(data) ? data : data?.results || [], ok: true };
        } catch (err) {
          const status = err?.response?.status;
          const detail = err?.response?.data?.detail || err.message;
          console.warn(`[Report] ${key} → ${status}: ${detail}`);
          return { key, data: [], ok: false, status, detail };
        }
      })
    );

    // Алдаатай endpoint-уудыг тодруулна
    const failed = results.filter(r => !r.ok);
    if (failed.length > 0) {
      setEndpointErrors(failed.map(f => `${f.key}: ${f.status || "network error"} — ${f.detail || ""}`));
    }

    // Бүгд амжилтгүй болвол ерөнхий алдаа харуулна
    if (failed.length === ENDPOINTS.length) {
      setError("Бүх API холболт амжилтгүй боллоо. Сервер ажиллаж байгаа эсэх болон токеноо шалгана уу.");
      setLoading(false);
      return;
    }

    const byKey = Object.fromEntries(results.map(r => [r.key, r.data]));
    const u = byKey.users;
    const p = byKey.projects;
    const t = byKey.tasks;
    const a = byKey.attendance;
    const d = byKey.departments;

    setUsers(u);
    setProjects(p);
    setTasks(t);
    setAttendance(a);
    setDepartments(d);

    try {
      // Derived statistics
      const totalUsers = u.length;
      const totalProjects = p.length;
      const totalTasks = t.length;

      const projectsByStatus = {
        new: p.filter(x => x.status === "new").length,
        in_progress: p.filter(x => x.status === "in_progress").length,
        maintenance: p.filter(x => x.status === "maintenance").length,
        half_balance: p.filter(x => x.status === "half_balance").length,
        completed: p.filter(x => x.status === "completed").length,
      };

      const tasksByStatus = {
        todo: t.filter(x => x.status === "todo").length,
        working: t.filter(x => x.status === "working").length,
        review: t.filter(x => x.status === "review").length,
        stuck: t.filter(x => x.status === "stuck").length,
        completed: t.filter(x => x.status === "completed").length,
      };

      const usersByRole = {
        ADMIN: u.filter(x => x.role === "ADMIN").length,
        HR: u.filter(x => x.role === "HR").length,
        MANAGER: u.filter(x => x.role === "MANAGER").length,
        EMPLOYEE: u.filter(x => x.role === "EMPLOYEE").length,
      };

      const attendanceStats = {
        present: a.filter(x => x.status === "PRESENT").length,
        late: a.filter(x => x.status === "LATE").length,
        absent: a.filter(x => x.status === "ABSENT").length,
        leave: a.filter(x => x.status === "LEAVE").length,
      };

      // Per-department task completion
      const deptStats = d.map(dept => {
        const deptUsers = u.filter(x => x.department_name === dept.name);
        const deptUserIds = deptUsers.map(x => x.id);
        const deptTasks = t.filter(x => deptUserIds.includes(x.assigned_to));
        const deptDone = deptTasks.filter(x => x.status === "completed").length;
        return {
          name: dept.name,
          total: deptTasks.length,
          done: deptDone,
          rate: deptTasks.length ? Math.round((deptDone / deptTasks.length) * 100) : 0,
        };
      });

      // Top performers — users with most completed tasks
      const topPerformers = u
        .map(user => ({
          ...user,
          completedTasks: t.filter(x => x.assigned_to === user.id && x.status === "completed").length,
          totalTasks: t.filter(x => x.assigned_to === user.id).length,
        }))
        .sort((a, b) => b.completedTasks - a.completedTasks)
        .slice(0, 5);

      // Project progress list
      const projectProgress = p.map(proj => {
        const projTasks = t.filter(x => x.project === proj.id);
        const done = projTasks.filter(x => x.status === "completed").length;
        return {
          ...proj,
          taskCount: projTasks.length,
          doneCount: done,
          progress: projTasks.length ? Math.round((done / projTasks.length) * 100) : 0,
        };
      });

      setStats({
        totalUsers,
        totalProjects,
        totalTasks,
        projectsByStatus,
        tasksByStatus,
        usersByRole,
        attendanceStats,
        deptStats,
        topPerformers,
        projectProgress,
      });
    } catch (e) {
      console.error("[Report] stats calculation error:", e);
      setError("Статистик тооцоолоход алдаа гарлаа: " + e.message);
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return {
    loading,
    error,
    endpointErrors, // аль API алдаатайг харуулна
    stats,
    users,
    projects,
    tasks,
    attendance,
    departments,
    refetch: fetchAll,
  };
}