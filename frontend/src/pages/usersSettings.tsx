import { SetStateAction, useEffect, useState } from "react";
import HeaderSection from "../components/headerSection";
import SearchInput from "../components/searchButton";
import axios from "axios";
import { Plus, Edit2, Trash2, UserCheck, User } from "lucide-react";
import { data, useNavigate } from "react-router-dom";
import AddUser from "./addUser";

// Role-уудын төрөл
type Role = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";

interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | "All">("All");

  const pageName = [{ name: "Хэрэглэгчийн удирдлага" }];
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/users/list/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Дата татахад алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Энэ хэрэглэгчийг устгах уу?")) {
      try {
        const token = localStorage.getItem("access_token");
        await axios.delete(`http://127.0.0.1:8000/api/users/${id}/delete/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((u) => u.id !== id)); // List-ээс хасах
      } catch (error) {
        alert("Устгах эрх байхгүй эсвэл алдаа гарлаа.");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Role-д зориулсан өнгөний тохиргоо
  const roleStyles: Record<string, string> = {
    ADMIN: "bg-red-200 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    HR: "bg-purple-200 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    MANAGER: "bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    EMPLOYEE:
      "bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-400",
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-slate-950 space-y-8 p-6 font-sans">
      {/* Толгой хэсэг */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <HeaderSection paths={pageName} />
        <div className="flex gap-2">
          <SearchInput
            placeholder="Хэрэглэгч хайх..."
            onChange={(e: SetStateAction<string>) => setSearchTerm(e)}
            className="rounded-2xl"
          />
        </div>
      </div>

      {/* Role Filter Tabs */}
      {/* <div className="flex gap-2 overflow-x-auto pb-2">
        {["All", "Admin", "HR", "Manager", "Employee"].map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role as any)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedRole === role
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            {role}
          </button>
        ))}
      </div> */}

      {/* Хэрэглэгчдийн хүснэгт */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                Нэр
              </th>
              <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                И-мэйл
              </th>
              <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                Role
              </th>
              <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                Төлөв
              </th>
              <th className="p-4 font-semibold text-right text-slate-700 dark:text-slate-300">
                Үйлдэл
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-500">
                  Ачааллаж байна...
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-4 font-medium text-slate-900 dark:text-white">
                    {user.username}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {user.email}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        roleStyles[user.role] || roleStyles["EMPLOYEE"]
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`flex items-center gap-1.5 text-sm ${
                        user.is_active ? "text-green-500" : "text-slate-400"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          user.is_active ? "bg-green-500" : "bg-slate-400"
                        }`}
                      />
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/editUser/${user.id}`)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Шинэ хэрэглэгч нэмэх товч */}
      <button
        onClick={() => navigate("/addUser")}
        className="fixed bottom-20 right-6 bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 hover:bg-indigo-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
      >
        <Plus size={26} strokeWidth={2} />
      </button>
    </div>
  );
}
