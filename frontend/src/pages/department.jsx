import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HeaderSection from "../components/headerSection";
import SearchInput from "../components/searchButton"; // Компонентоо импортлох
import { ArrowLeft, Plus, Building2, MoreVertical, Hash } from "lucide-react";
import { BASE_URL } from "../constants/url";

export default function Department() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [filteredDepts, setFilteredDepts] = useState([]); // Хайлтын үр дүнг хадгалах state
  const [newDeptName, setNewDeptName] = useState("");
  const pageName = [{ name: "Хэлтсүүд" }];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${BASE_URL}/api/hr/departments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(response.data);
      setFilteredDepts(response.data); // Анх ачаалахад бүх датаг харуулна
    } catch (error) {
      console.error("Алдаа:", error.response);
    } finally {
      setLoading(false);
    }
  };

  // Хайлт хийх функц
  const handleSearch = (value) => {
    const filtered = departments.filter((dept) =>
      dept.name.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredDepts(filtered);
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${BASE_URL}/api/hr/departments/`,
        { name: newDeptName },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewDeptName("");
      fetchDepartments();
    } catch (error) {
      alert("Нэмэхэд алдаа гарлаа", error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Top Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm transition-all active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <HeaderSection paths={pageName} />
          </div>

          <div className="flex items-center gap-3">
            {/* SearchInput компонентыг энд ашиглав */}
            <SearchInput
              placeholder="Хэлтэс хайх..."
              onChange={handleSearch}
              className="hidden md:block"
            />

          
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600">
              <Hash size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Нийт хэлтэс</p>
              <h3 className="text-2xl font-bold dark:text-white">
                {departments.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Жагсаалтын хэсэг */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm overflow-hidden border border-white dark:border-slate-800">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  Хэлтсийн бүртгэл
                </h2>
                <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-bold">
                  Идэвхтэй
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-[11px] uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="px-8 py-4 font-semibold">Хэлтсийн нэр</th>
                      <th className="px-6 py-4 font-semibold text-center">
                        Статус
                      </th>
                      <th className="px-8 py-4 font-semibold text-right">
                        Үйлдэл
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {loading
                      ? [1, 2, 3].map((i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan="3" className="px-8 py-6">
                              <div className="h-4 bg-slate-100 rounded w-full"></div>
                            </td>
                          </tr>
                        ))
                      : filteredDepts.map((dept) => (
                          <tr
                            key={dept.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                                  {dept.name.charAt(0)}
                                </div>
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                  {dept.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-medium">
                                Ажиллаж байгаа
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button className="text-slate-400 hover:text-slate-600 p-2">
                                <MoreVertical size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Нэмэх хэсэг */}
          <div className="lg:col-span-4">
            <div className="bg-[#7224f3] rounded-[32px] p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />

              <div className="relative z-10">
                <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <Building2 size={28} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Шинэ нэгж</h2>
                <p className="text-indigo-100 text-sm mb-8">
                  Системд шинэ хэлтэс эсвэл салбар нэмэх бол доорх талбарыг
                  бөглөнө үү.
                </p>

                <form onSubmit={handleAddDepartment} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-indigo-100 ml-1 uppercase tracking-wider">
                      Хэлтсийн нэр
                    </label>
                    <input
                      type="text"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition-all"
                      placeholder="Жишээ: IT Хэлтэс"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white text-[#7224f3] font-bold py-4 rounded-2xl hover:bg-indigo-50 transition-all active:scale-[0.98] shadow-lg"
                  >
                    Хадгалах
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
