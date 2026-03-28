import axios from "axios";
import { useState, useEffect } from "react"; // useEffect нэмсэн
import HeaderSection from "../components/headerSection";

export default function Department() {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState(""); // Шинэ хэлтсийн нэр хадгалах
  const pageName = [{ name: "Хэлтсүүд" }];

  // Анх хуудас ачаалагдахад датаг татах
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/hr/departments/",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setDepartments(response.data);
    } catch (error) {
      console.error("Дата татахад алдаа гарлаа:", error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "http://127.0.0.1:8000/api/hr/departments/",
        { name: newDeptName }, // API-ийн хүлээж авах талбарын нэрийг (name) шалгаарай
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewDeptName(""); // Input-ийг цэвэрлэх
      fetchDepartments(); // Жагсаалтыг шинэчлэх
    } catch (error) {
      alert("Нэмэхэд алдаа гарлаа", error.response);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-slate-950 space-y-8 p-8 font-sans">
      <HeaderSection paths={pageName} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Зүүн тал: Хэлтсүүдийн жагсаалт */}
        <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900 p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
            Хэлтсийн жагсаалт
          </h2>
          {loading ? (
            <p className="text-slate-500">Уншиж байна...</p>
          ) : (
            <ul className="space-y-2">
              {departments.map((dept) => (
                <li
                  key={dept.id}
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-700 dark:text-slate-200"
                >
                  {dept.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Баруун тал: Шинээр нэмэх хэсэг */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg h-fit">
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
            Шинэ хэлтэс нэмэх
          </h2>
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Хэлтсийн нэр
              </label>
              <input
                type="text"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Нэрээ оруулна уу"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200"
            >
              Хадгалах
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
