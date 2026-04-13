import { useEffect, useState } from "react";
import HeaderSection from "../components/headerSection";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmployeePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const pageName = [{ name: "Ажилчид" }];

  // localStorage-аас role-ийг авах
  const currentRole = localStorage.getItem("user_role");
  const isAdminOrHR = currentRole === "ADMIN" || currentRole === "HR";
  const API_BASE_URL = "http://192.168.1.10:8000/api/users";

  // Хэрэглэгчдийн жагсаалт татах
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/list/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Дата татахад алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  };

  // Устгах функц
  const handleDelete = async (id) => {
    if (window.confirm("Энэ хэрэглэгчийг системээс бүрмөсөн устгах уу?")) {
      try {
        const token = localStorage.getItem("access_token");
        await axios.delete(`${API_BASE_URL}/${id}/delete/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Амжилттай устгавал state-ээс хасаж жагсаалтыг шинэчлэх
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== id));
        alert("Хэрэглэгчийг амжилттай устгалаа.");
      } catch (error) {
        console.error("Устгахад алдаа гарлаа:", error);
        alert("Устгах эрх байхгүй эсвэл серверт алдаа гарлаа.");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 font-sans">
      {/* Header & Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <HeaderSection paths={pageName} />

        {isAdminOrHR && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/departments")}
              className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-sm font-medium transition-all"
            >
              <Network size={18} />
              <span className="hidden sm:inline">Хэлтэс</span>
            </button>

            <button
              onClick={() => navigate("/positions")}
              className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-sm font-medium transition-all"
            >
              <Briefcase size={18} />
              <span className="hidden sm:inline">Албан тушаал</span>
            </button>

            <button
              onClick={() => navigate("/addUser")}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 text-sm font-semibold transition-all"
            >
              <Plus size={18} />
              <span>Ажилтан нэмэх</span>
            </button>
          </div>
        )}
      </div>

      {/* Employee Table */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 dark:text-slate-200 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider ">
                  Ажилтан
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider ">
                  Хэлтэс
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider ">
                  Албан тушаал
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider ">
                  Холбоо барих
                </th>
                {isAdminOrHR && (
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider  text-right">
                    Үйлдэл
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={isAdminOrHR ? 5 : 4}
                    className="px-6 py-12 text-center text-slate-400 animate-pulse"
                  >
                    Мэдээлэл уншиж байна...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdminOrHR ? 5 : 4}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Бүртгэлтэй ажилтан олдсонгүй.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-500 border border-slate-200/50 dark:border-slate-700">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                            {user.last_name || user.first_name
                              ? `${user.last_name} ${user.first_name}`
                              : user.username}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                            <Mail size={12} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {user.department_name || "---"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Briefcase size={14} className="text-blue-500" />
                        {user.position_name || "---"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.phone_number ? (
                        <a
                          href={`tel:${user.phone_number}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-green-500 dark:text-green-500 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                        >
                          <Phone size={14} />
                          {user.phone_number}
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs italic">
                          Дугааргүй
                        </span>
                      )}
                    </td>
                    {isAdminOrHR && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/editUser/${user.id}`)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
                            title="Засах"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-500"
                            title="Устгах"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Нийт {users.length} ажилтан байна
          </p>
        </div>
      </div>
    </div>
  );
}
