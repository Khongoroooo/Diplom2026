import axios from "axios";
import { useState, useEffect } from "react";
import HeaderSection from "../components/headerSection";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Positions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [newPosTitle, setNewPosTitle] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  const pageName = [{ name: "Албан тушаал" }];

  // Хэлтсийн ID-аас хамаарч өнгө оноох функц
  const getDeptColor = (deptId) => {
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
      "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400",
      "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400",
      "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400",
    ];
    // ID-г өнгөний массивын уртад хувааж үлдэгдлээр нь сонгоно
    return colors[deptId % colors.length];
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const [posRes, deptRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/hr/positions/", { headers }),
        axios.get("http://127.0.0.1:8000/api/hr/departments/", { headers }),
      ]);
      setPositions(posRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      console.error("Дата татахад алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPosition = async (e) => {
    e.preventDefault();
    if (!selectedDept) return alert("Хэлтэс сонгоно уу!");
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "http://127.0.0.1:8000/api/hr/positions/",
        { title: newPosTitle, department: selectedDept },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewPosTitle("");
      setSelectedDept("");
      fetchInitialData();
    } catch (error) {
      alert("Алдаа гарлаа.", error);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-slate-950 space-y-8 p-8 font-sans text-slate-900 dark:text-white">
      <div className="flex items-center gap-3 mb-10" data-aos="fade-right">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:shadow-lg transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <HeaderSection paths={pageName} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Жагсаалт хэсэг */}
        <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold mb-6">Албан тушаалын жагсаалт</h2>

          <div className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200 dark:border-slate-800 text-sm uppercase tracking-wider">
                  <th className="py-4 px-2">Албан тушаал</th>
                  <th className="py-4 px-2 text-right">Хэлтэс</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  /* Loading үед хүснэгтийн бүтцийг эвдэхгүй байх */
                  <tr>
                    <td
                      colSpan="2"
                      className="py-10 text-center text-slate-500 italic"
                    >
                      Мэдээлэл шинэчилж байна...
                    </td>
                  </tr>
                ) : positions.length > 0 ? (
                  positions.map((pos) => (
                    <tr
                      key={pos.id}
                      className="group hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <td className="py-4 px-2 font-medium">{pos.title}</td>
                      <td className="py-4 px-2 text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDeptColor(pos.department)}`}
                        >
                          {pos.department_name}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* Дата байхгүй үед харагдах хэсэг */
                  <tr>
                    <td
                      colSpan="2"
                      className="py-10 text-center text-slate-500"
                    >
                      Одоогоор албан тушаал бүртгэгдээгүй байна.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Форм хэсэг */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl h-fit">
          <h2 className="text-xl font-bold mb-6">Шинэ албан тушаал</h2>
          <form onSubmit={handleAddPosition} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">
                Албан тушаалын нэр
              </label>
              <input
                type="text"
                value={newPosTitle}
                onChange={(e) => setNewPosTitle(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Маркетинг менежер..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">
                Хэлтэс
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Сонгоно уу</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
            >
              Хадгалах
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
