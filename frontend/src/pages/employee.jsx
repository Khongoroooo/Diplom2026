import { useEffect, useState } from "react";
import HeaderSection from "../components/headerSection";
import SearchInput from "../components/searchButton";
import axios from "axios";
import {
  Plus,
  Briefcase,
  Network,
  Phone,
  User,
  Mail,
  Trash2,
  Edit2,
  Users,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../constants/url";

export default function EmployeePage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const pageName = [{ name: "Ажилчид" }];

  const currentRole = localStorage.getItem("user_role");
  const isAdminOrHR = currentRole === "ADMIN" || currentRole === "HR";
  const API_BASE_URL = `${BASE_URL}/api/users`;

  // Хэлтсийн нэрээс хамаарч өөр өөр өнгө оноох функц
  const getDeptColor = (deptName) => {
    if (!deptName) return "bg-slate-100 text-slate-500 border-slate-200";

    // Хэлтсийн нэрийг ашиглан индекс үүсгэх
    const colors = [
      "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400",
      "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400",
      "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400",
      "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400",
      "bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400",
      "bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400",
    ];

    let hash = 0;
    for (let i = 0; i < deptName.length; i++) {
      hash = deptName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/list/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Дата татахад алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    const filtered = users.filter(
      (u) =>
        `${u.last_name} ${u.first_name} ${u.username}`
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        (u.position_name &&
          u.position_name.toLowerCase().includes(value.toLowerCase())) ||
        (u.department_name &&
          u.department_name.toLowerCase().includes(value.toLowerCase())),
    );
    setFilteredUsers(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Энэ хэрэглэгчийг системээс бүрмөсөн устгах уу?")) {
      try {
        const token = localStorage.getItem("access_token");
        await axios.delete(`${API_BASE_URL}/${id}/delete/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setFilteredUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (error) {
        alert("Устгахад алдаа гарлаа.", error);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Top Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <HeaderSection paths={pageName} />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <SearchInput
              placeholder="Ажилтан хайх..."
              onChange={handleSearch}
              className="w-full sm:w-72"
            />

            {isAdminOrHR && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/departments")}
                  className="p-3 bg-white dark:bg-slate-900 text-slate-500 rounded-2xl shadow-sm hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                  title="Хэлтэс"
                >
                  <Network size={20} />
                </button>
                <button
                  onClick={() => navigate("/positions")}
                  className="p-3 bg-white dark:bg-slate-900 text-slate-500 rounded-2xl shadow-sm hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                  title="Албан тушаал"
                >
                  <Briefcase size={20} />
                </button>
                <button
                  onClick={() => navigate("/addUser")}
                  className="flex items-center gap-2 px-6 py-3 bg-[#7224f3] hover:bg-[#611ed1] text-white rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 font-bold transition-all"
                >
                  <Plus size={20} />
                  <span>Шинэ ажилтан</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Нийт ажилчид</p>
              <h3 className="text-2xl font-bold dark:text-white">
                {users.length}
              </h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Хэлтэсүүд</p>
              <h3 className="text-2xl font-bold dark:text-white">
                {
                  new Set(
                    users
                      .filter((u) => u.department_name)
                      .map((u) => u.department_name),
                  ).size
                }
              </h3>
            </div>
          </div>
        </div>

        {/* Employee Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-white dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Ажилчдын бүртгэл
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[11px] font-bold uppercase tracking-[0.1em]">
                  <th className="px-8 py-5">Ажилтан</th>
                  <th className="px-6 py-5">Хэлтэс</th>
                  <th className="px-6 py-5">Албан тушаал</th>
                  <th className="px-6 py-5">Холбоо барих</th>
                  {isAdminOrHR && (
                    <th className="px-8 py-5 text-right">Үйлдэл</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading
                  ? [1, 2, 3].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-8 py-6">
                          <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
                        </td>
                      </tr>
                    ))
                  : filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100/50">
                              {user.first_name ? (
                                user.first_name.charAt(0)
                              ) : (
                                <User size={18} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                                {user.last_name} {user.first_name}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                <Mail size={12} className="text-slate-300" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-4 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${getDeptColor(user.department_name)}`}
                          >
                            {user.department_name || "Тодорхойгүй"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-semibold">
                            <Briefcase size={14} className="text-slate-300" />
                            {user.position_name || "---"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.phone_number ? (
                            <a
                              href={`tel:${user.phone_number}`}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-black hover:bg-emerald-100 transition-colors border border-emerald-100 dark:border-emerald-800/50"
                            >
                              <Phone size={14} />
                              {user.phone_number}
                            </a>
                          ) : (
                            <span className="text-slate-300 text-xs">---</span>
                          )}
                        </td>
                        {isAdminOrHR && (
                          <td className="px-8 py-4 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button
                                onClick={() => navigate(`/editUser/${user.id}`)}
                                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-4 bg-slate-50/30 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Системийн нийт ажилчид: {filteredUsers.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
