import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  Mail,
  Lock,
  User,
  ShieldCheck,
} from "lucide-react";
import HeaderSection from "../components/headerSection";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AddUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const pageName = [{ name: "Хэрэглэгч нэмэх" }];

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });

  // AOS-ийг ажиллуулах
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post("http://127.0.0.1:8000/api/users/register/", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Хэрэглэгч амжилттай бүртгэгдлээ!");
      navigate("/settings");
    } catch (error) {
      console.error("Алдаа:", error.response?.data || error.message);
      alert("Бүртгэхэд алдаа гарлаа. Мэдээллээ шалгана уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 md:p-8 font-sans overflow-x-hidden">
      <div className=" mx-auto">
        {/* Буцах товч болон Header - Зүүн талдаа */}
        <div className="flex items-center gap-3 mb-10" data-aos="fade-right">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:shadow-lg transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <HeaderSection paths={pageName} />
        </div>

        {/* Форм Контейнер */}
        <div
          data-aos="fade-up"
          className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none"
        >
          <div
            className="flex items-center gap-4 mb-10"
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
              <UserPlus size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                Шинэ хэрэглэгч
              </h2>
              <p className="text-slate-500 text-sm">Бүх талбарыг бөглөнө үү</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Username Input */}
            <div data-aos="fade-up" data-aos-delay="300">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Нэр
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </span>
                <input
                  name="username"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white"
                  placeholder="Нэвтрэх нэр"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Input */}
            <div data-aos="fade-up" data-aos-delay="400">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                И-мэйл хаяг
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white"
                  placeholder="example@mail.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Input */}
            <div data-aos="fade-up" data-aos-delay="500">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Нууц үг
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Role Select */}
            <div data-aos="fade-up" data-aos-delay="600">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Эрх (Role)
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <ShieldCheck size={18} />
                </span>
                <select
                  name="role"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-blue-500 outline-none dark:text-white appearance-none cursor-pointer transition-all"
                  onChange={handleChange}
                >
                  <option value="EMPLOYEE">Ажилтан (Employee)</option>
                  <option value="MANAGER">Менежер (Manager)</option>
                  <option value="HR">Хүний нөөц (HR)</option>
                  <option value="ADMIN">Админ (Admin)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              data-aos="zoom-in"
              data-aos-delay="200"
              className="w-full py-5 bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-[1.2rem] hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-lg mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <UserPlus size={22} />
                  <span>Хэрэглэгчийг бүртгэх</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
