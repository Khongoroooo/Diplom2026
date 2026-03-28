import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Briefcase,
  Phone,
} from "lucide-react";
import HeaderSection from "../components/headerSection";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AddUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState([]);
  const [errors, setErrors] = useState({});
  const pageName = [{ name: "Хэрэглэгч нэмэх" }];

  // 1. Талбарын нэрсийг Django-ийн моделтой ижил болгосон
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    role: "EMPLOYEE",
    position: "", // Энд Position-ийн ID (integer) хадгалагдана
  });

  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-in-out", once: true });
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/hr/positions/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPositions(response.data);
    } catch (error) {
      console.error("Албан тушаал татахад алдаа гарлаа", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem("access_token");
      // formData доторх position утга нь select-ээс string-ээр ирдэг тул
      // шаардлагатай бол Number(formData.position) болгож болно.
      await axios.post("http://127.0.0.1:8000/api/users/register/", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/employees");
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
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:shadow-lg transition-all active:scale-90"
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
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
              <UserPlus size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                Шинэ хэрэглэгч
              </h2>
              <p className="text-slate-500 text-sm">
                Хувийн мэдээллийг бүртгэх
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  Овог
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <UserIcon size={18} />
                  </span>
                  <input
                    name="last_name"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white"
                    placeholder="Овог"
                    onChange={handleChange}
                  />
                </div>
                <ErrorMsg name="last_name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  Нэр
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <UserIcon size={18} />
                  </span>
                  <input
                    name="first_name"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white"
                    placeholder="Нэр"
                    onChange={handleChange}
                  />
                </div>
                <ErrorMsg name="first_name" />
              </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="350">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Нэвтрэх нэр
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <UserIcon size={18} />
                </span>
                <input
                  name="username"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-blue-500 transition-all outline-none dark:text-white"
                  placeholder="Username"
                  onChange={handleChange}
                />
              </div>
              <ErrorMsg name="username" />
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  И-мэйл
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-blue-500 outline-none dark:text-white transition-all"
                    placeholder="example@mail.com"
                    onChange={handleChange}
                  />
                </div>
                <ErrorMsg name="email" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  Утас
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">
                    <Phone size={18} />
                  </span>
                  <input
                    type="text"
                    name="phone_number"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-blue-500 outline-none dark:text-white transition-all"
                    placeholder="99xxxxxx"
                    onChange={handleChange}
                  />
                </div>
                <ErrorMsg name="phone_number" />
              </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="450">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Нууц үг
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-blue-500 outline-none dark:text-white transition-all"
                  onChange={handleChange}
                />
              </div>
              <ErrorMsg name="password" />
            </div>

            <div data-aos="fade-up" data-aos-delay="500">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Албан тушаал
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 pointer-events-none">
                  <Briefcase size={18} />
                </span>
                <select
                  name="position"
                  required
                  value={formData.position}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 focus:border-blue-500 outline-none dark:text-white appearance-none cursor-pointer transition-all"
                  onChange={handleChange}
                >
                  <option value="">Албан тушаал сонгох</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.title} ({pos.department_name})
                    </option>
                  ))}
                </select>
              </div>
              <ErrorMsg name="position" />
            </div>

            <div data-aos="fade-up" data-aos-delay="550">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Хэрэглэгчийн эрх
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 pointer-events-none">
                  <ShieldCheck size={18} />
                </span>
                <select
                  name="role"
                  value={formData.role}
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

            <button
              type="submit"
              disabled={loading}
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
