import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  FolderPlus,
  Loader2,
  Type,
  AlignLeft,
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
} from "lucide-react";
import HeaderSection from "../components/headerSection";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AddProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const pageName = [{ name: "Төсөл нэмэх" }];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    status: "new",
    members: [], // Энд сонгосон ажилчдын ID-нууд хадгалагдана
  });

  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-in-out", once: true });
    fetchUsers();
  }, []);

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
      console.error("Хэрэглэгчдийг татахад алдаа гарлаа", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleMemberToggle = (userId) => {
    setFormData((prev) => {
      const isSelected = prev.members.includes(userId);
      const newMembers = isSelected
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId];
      return { ...prev, members: newMembers };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem("access_token");
      await axios.post("http://127.0.0.1:8000/api/tasks/projects/", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/projects"); // Төслүүдийн жагсаалт руу буцах
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ non_field_errors: "Сүлжээний алдаа гарлаа." });
      }
    } finally {
      setLoading(false);
    }
  };

  const ErrorMsg = ({ name }) =>
    errors[name] ? (
      <p className="text-red-500 text-xs mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1">
        {Array.isArray(errors[name]) ? errors[name][0] : errors[name]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 md:p-8 font-sans overflow-x-hidden">
      <div className="mx-auto">
        <div className="flex items-center gap-3 mb-10" data-aos="fade-right">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <HeaderSection paths={pageName} />
        </div>

        <div
          data-aos="fade-up"
          className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none mx-auto"
        >
          <div
            className="flex items-center gap-4 mb-10"
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
              <FolderPlus size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                Шинэ төсөл үүсгэх
              </h2>
              <p className="text-slate-500 text-sm">
                Төслийн мэдээлэл болон багийг оноох
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Төслийн нэр */}
            <div data-aos="fade-up" data-aos-delay="300">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Төслийн нэр
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Type size={18} />
                </span>
                <input
                  name="title"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white"
                  placeholder="Төслийн нэр бичих..."
                  onChange={handleChange}
                />
              </div>
              <ErrorMsg name="title" />
            </div>

            {/* Төслийн тайлбар */}
            <div data-aos="fade-up" data-aos-delay="350">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Төслийн тайлбар
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <AlignLeft size={18} />
                </span>
                <textarea
                  name="description"
                  rows="4"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white"
                  placeholder="Дэлгэрэнгүй тайлбар..."
                  onChange={handleChange}
                />
              </div>
              <ErrorMsg name="description" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Эхлэх огноо */}
              <div data-aos="fade-up" data-aos-delay="400">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  Эхлэх огноо
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500">
                    <CalendarIcon size={18} />
                  </span>
                  <input
                    type="date"
                    name="start_date"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-indigo-500 outline-none dark:text-white transition-all"
                    onChange={handleChange}
                  />
                </div>
                <ErrorMsg name="start_date" />
              </div>

              {/* Статус */}
              <div data-aos="fade-up" data-aos-delay="400">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  Төслийн статус
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 pointer-events-none">
                    <CheckCircle2 size={18} />
                  </span>
                  <select
                    name="status"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-indigo-500 outline-none dark:text-white appearance-none cursor-pointer transition-all"
                    onChange={handleChange}
                  >
                    <option value="new">Шинэ төсөл</option>
                    <option value="in_progress">Хийгдэж буй</option>
                    <option value="maintenance">Арчилгаа</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Гишүүд сонгох (Multi-select) */}
            <div data-aos="fade-up" data-aos-delay="450">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 ml-1 flex items-center gap-2">
                <Users size={16} /> Багийн гишүүд оноох
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-2xl custom-scrollbar">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleMemberToggle(user.id)}
                    className={`flex items-center p-3 rounded-xl cursor-pointer border-2 transition-all ${
                      formData.members.includes(user.id)
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-transparent bg-slate-50/50 dark:bg-slate-800 hover:border-slate-200"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold mr-3">
                      {user.first_name?.charAt(0)}
                    </div>
                    <span className="text-sm dark:text-slate-200">
                      {user.last_name} {user.first_name}
                    </span>
                  </div>
                ))}
              </div>
              <ErrorMsg name="members" />
            </div>

            {/* Илгээх товч */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-[1.2rem] hover:shadow-xl hover:shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-lg mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <FolderPlus size={22} />
                  <span>Төсөл үүсгэх</span>
                </>
              )}
            </button>

            {errors.non_field_errors && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {errors.non_field_errors}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
