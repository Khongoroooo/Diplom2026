import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderSection from "../components/headerSection";
import SearchInput from "../components/searchButton"; // Хайлтын компонент
import { ArrowLeft, Briefcase, Plus, Building2, Filter } from "lucide-react";
import { BASE_URL } from "../constants/url";

export default function Positions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]); // Хайлтад зориулсан state
  const [departments, setDepartments] = useState([]);
  const [newPosTitle, setNewPosTitle] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  const pageName = [{ name: "Албан тушаал" }];

  // Хэлтсийн ID-аас хамаарч өнгө оноох
  const getDeptColor = (deptId) => {
    const colors = [
      "bg-blue-50 text-blue-600 border-blue-100",
      "bg-purple-50 text-purple-600 border-purple-100",
      "bg-emerald-50 text-emerald-600 border-emerald-100",
      "bg-orange-50 text-orange-600 border-orange-100",
      "bg-pink-50 text-pink-600 border-pink-100",
      "bg-indigo-50 text-indigo-600 border-indigo-100",
    ];
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
        axios.get(`${BASE_URL}/api/hr/positions/`, { headers }),
        axios.get(`${BASE_URL}/api/hr/departments/`, { headers }),
      ]);
      setPositions(posRes.data);
      setFilteredPositions(posRes.data); // Анх бүх өгөгдлийг харуулна
      setDepartments(deptRes.data);
    } catch (error) {
      console.error("Алдаа:", error);
    } finally {
      setLoading(false);
    }
  };

  // Хайлт хийх функц
  const handleSearch = (value) => {
    const filtered = positions.filter(
      (pos) =>
        pos.title.toLowerCase().includes(value.toLowerCase()) ||
        pos.department_name.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredPositions(filtered);
  };

  const handleAddPosition = async (e) => {
    e.preventDefault();
    if (!selectedDept) return alert("Хэлтэс сонгоно уу!");
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${BASE_URL}/api/hr/positions/`,
        { title: newPosTitle, department: selectedDept },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewPosTitle("");
      setSelectedDept("");
      fetchInitialData();
    } catch (error) {
      alert("Алдаа гарлаа.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header хэсэг */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 dark:border-slate-800 active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <HeaderSection paths={pageName} />
          </div>

          <div className="flex items-center gap-3">
            {/* SearchInput компонент ашигласан хэсэг */}
            <SearchInput
              placeholder="Албан тушаал хайх..."
              onChange={handleSearch}
              className="hidden md:block"
            />
        
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Зүүн тал: Хүснэгт */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-white dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="text-indigo-600" size={20} />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    Албан тушаалын жагсаалт
                  </h2>
                </div>
                <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-bold">
                  Нийт {filteredPositions.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 text-[11px] uppercase tracking-[0.1em]">
                      <th className="px-8 py-4 font-semibold">
                        Албан тушаалын нэр
                      </th>
                      <th className="px-8 py-4 font-semibold text-right">
                        Харьяалагдах хэлтэс
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {loading ? (
                      [1, 2, 3, 4].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan="2" className="px-8 py-6">
                            <div className="h-5 bg-slate-100 rounded-lg w-full"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredPositions.length > 0 ? (
                      filteredPositions.map((pos) => (
                        <tr
                          key={pos.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                              <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {pos.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${getDeptColor(pos.department)}`}
                            >
                              {pos.department_name}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="2"
                          className="px-8 py-16 text-center text-slate-400 italic"
                        >
                          Хайлт илэрцгүй байна.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Баруун тал: Форм */}
          <div className="lg:col-span-4 sticky top-8">
            <div className="bg-[#6366F1] dark:bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden group">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                  <Plus size={28} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Шинэ албан тушаал</h2>
                <p className="text-indigo-100 text-sm mb-8 opacity-80 leading-relaxed">
                  Системд шинэ албан тушаалын нэршил болон хэлтсийг бүртгэнэ.
                </p>

                <form onSubmit={handleAddPosition} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 ml-1">
                      Албан тушаалын нэр
                    </label>
                    <input
                      type="text"
                      value={newPosTitle}
                      onChange={(e) => setNewPosTitle(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 outline-none focus:bg-white/20 focus:border-white/40 transition-all backdrop-blur-sm"
                      placeholder="Жишээ: Ахлах дизайнер"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 ml-1">
                      Хэлтэс сонгох
                    </label>
                    <div className="relative">
                      <Building2
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40"
                        size={18}
                      />
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-5 py-4 text-white outline-none focus:bg-white/20 appearance-none transition-all backdrop-blur-sm select-custom"
                        required
                      >
                        <option value="" className="text-slate-800">
                          Сонгоно уу...
                        </option>
                        {departments.map((dept) => (
                          <option
                            key={dept.id}
                            value={dept.id}
                            className="text-slate-800"
                          >
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-white text-indigo-600 font-bold py-4 rounded-2xl hover:bg-indigo-50 transition-all active:scale-[0.98] shadow-lg shadow-black/10 mt-2"
                  >
                    Бүртгэх
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
