import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import HeaderSection from "../components/headerSection";
import { BASE_URL } from "../constants/url";

export default function TaskPage() {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTaskName, setNewTaskName] = useState("");

  const token = localStorage.getItem("access_token");

  const fetchData = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [projRes, taskRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/tasks/projects/${id}/`, config),
        axios.get(`${BASE_URL}/api/tasks/tasks/?project=${id}`, config),
      ]);
      console.log("Төслийн дата:", projRes.data);
      console.log("Гишүүд:", projRes.data.member_details);
      setProject(projRes.data);
      setTasks(taskRes.data.results || taskRes.data);
    } catch (error) {
      console.error("Алдаа:", error);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const updateTask = async (taskId, data) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.patch(
        `${BASE_URL}/api/tasks/tasks/${taskId}/`,
        data,
        config,
      );

      // UI-г шууд шинэчлэх
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...response.data } : t)),
      );
      console.log("Амжилттай шинэчлэгдлээ:", response.data);
    } catch (error) {
      // Backend-ээс ирсэн алдааг дэлгэрэнгүй харах
      console.error("Серверийн алдаа:", error.response?.data);
      alert(
        `Алдаа гарлаа: ${JSON.stringify(error.response?.data || error.message)}`,
      );
    }
  };

  const handleAddTask = async (e) => {
    if (e.key === "Enter" && newTaskName.trim()) {
      try {
        const res = await axios.post(
          `${BASE_URL}/api/tasks/tasks/`,
          { title: newTaskName, project: id, status: "new" },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setTasks([...tasks, res.data]);
        setNewTaskName("");
      } catch (error) {
        alert("Нэмэхэд алдаа гарлаа", error);
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Уншиж байна...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 font-sans">
      <HeaderSection
        paths={[
          { name: "Төслүүд", link: "/projects" },
          { name: project?.title },
        ]}
        title="Tasks"
      />

      <div className="mt-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-400 uppercase text-[11px] font-bold">
              <th className="p-4 w-12 text-center">#</th>
              <th className="p-4">Task gfuhigjfdkjl</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Person</th>
              <th className="p-4 text-center">Num Test</th>
              <th className="p-4">Note</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr
                key={task.id}
                className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50/50 transition-colors"
              >
                <td className="p-4 text-center text-gray-300">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="p-4 font-medium text-slate-700 dark:text-slate-200">
                  {task.title}
                </td>

                {/* Status Column */}
                <td className="p-4 text-center relative">
                  <select
                    value={task.status}
                    onChange={(e) => {
                      console.log("Шинэ статус сонголоо:", e.target.value);
                      updateTask(task.id, { status: e.target.value });
                    }}
                    // style={{ appearance: 'auto' }} -> Хэрэв Tailwind дарахад саад болоод байвал үүнийг нэмнэ
                    className={`
      cursor-pointer outline-none border-none
      px-4 py-2 rounded text-[10px] font-bold uppercase
      transition-all duration-200 hover:opacity-80
      ${
        task.status === "new"
          ? "bg-blue-500 text-white"
          : task.status === "in_progress"
            ? "bg-orange-400 text-white"
            : "bg-emerald-500 text-white"
      }
    `}
                  >
                    <option value="new" className="bg-white text-gray-900">
                      New
                    </option>
                    <option
                      value="in_progress"
                      className="bg-white text-gray-900"
                    >
                      Review
                    </option>
                    <option
                      value="completed"
                      className="bg-white text-gray-900"
                    >
                      Done
                    </option>
                  </select>
                </td>
                {/* Person Column (Зураг дээрх шиг Avatar Dropdown) */}
                {/* Person Column */}
                <td className="p-4 text-center border-r dark:border-slate-800">
                  <select
                    value={task.assigned_to || ""}
                    onChange={(e) =>
                      updateTask(task.id, { assigned_to: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-[11px] text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="">👤 Сонгох</option>
                    {project?.member_details &&
                    project.member_details.length > 0 ? (
                      project.member_details.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Гишүүн байхгүй</option>
                    )}
                  </select>
                </td>

                <td className="p-4 text-center text-gray-400">
                  {task.number_test || "-"}
                </td>

                {/* Note Column */}
                <td className="p-4">
                  <input
                    type="text"
                    defaultValue={task.note || ""}
                    onBlur={(e) =>
                      updateTask(task.id, { note: e.target.value })
                    }
                    placeholder="Тэмдэглэл..."
                    className="bg-transparent border-none outline-none text-gray-400 italic w-full text-xs"
                  />
                </td>
              </tr>
            ))}
            {/* Add Task Input */}
            <tr>
              <td className="p-4 text-center text-gray-300">+</td>
              <td className="p-4" colSpan="5">
                <input
                  type="text"
                  placeholder="Add Task"
                  className="w-full bg-transparent outline-none text-gray-400 text-sm"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyDown={handleAddTask}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
