import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import HeaderSection from "../components/headerSection";

export default function EditUser() {
  const { id } = useParams(); // URL-аас ID-г авна
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "EMPLOYEE",
    is_active: true,
  });

  const pageName = [{ name: "Хэрэглэгч засах" }];

  // 1. Тухайн хэрэглэгчийн мэдээллийг татаж ирэх
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          `http://127.0.0.1:8000/api/users/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setFormData(response.data);
      } catch (error) {
        console.log(`Мэдээлэл татахад алдаа гарлаа ${error}`);
      }
    };
    fetchUserData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 2. Өөрчлөлтийг хадгалах
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.patch(
        `http://127.0.0.1:8000/api/users/${id}/update/`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert("Мэдээлэл амжилттай шинэчлэгдлээ!");
      navigate("/settings");
    } catch (error) {
      console.error(`Хадгалахад алдаа гарлаа ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-slate-500"
        >
          <ArrowLeft size={20} /> <HeaderSection paths={pageName} />
        </button>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6"
        >
          <div>
            <label className="block text-sm font-bold mb-2 dark:text-white">
              Хэрэглэгчийн нэр
            </label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 dark:text-white">
              И-мэйл
            </label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 dark:text-white">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              <option value="ADMIN">Admin</option>
              <option value="HR">HR</option>
              <option value="MANAGER">Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-5 h-5"
            />
            <label className="text-sm font-bold dark:text-white">
              Идэвхтэй төлөв
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Save size={20} /> Хадгалах
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
