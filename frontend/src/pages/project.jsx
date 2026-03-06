import React, { useState } from "react";
import HeaderSection from "../components/headerSection";
import { Search, Calendar, Folder, Plus } from "lucide-react";

export default function ProjectPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const projectsPage = [{ name: "Төслүүд", link: "/" }];

  // Жишээ дата
  const projects = [
    {
      id: 1,
      name: "Mobile App",
      status: "New Project",
      date: "Oct 15, 2023 - Dec 18, 2023",
      initial: "M",
      bgColor: "bg-green-500",
    },
    {
      id: 2,
      name: "Digital marketing",
      status: "In Maintenance",
      date: "Oct 17, 2023 - Jan 20, 2024",
      initial: "D",
      bgColor: "bg-pink-500",
    },
    {
      id: 3,
      name: "Intranet",
      status: "New Project",
      date: "Oct 19, 2023 - Mar 27, 2024",
      initial: "I",
      bgColor: "bg-blue-500",
    },
    {
      id: 4,
      name: "Finance",
      status: "Half Balance",
      date: "Oct 20, 2023 - Oct 30, 2023",
      initial: "F",
      bgColor: "bg-purple-500",
    },
    {
      id: 5,
      name: "test20231024",
      status: "New Project",
      date: "Oct 24, 2023 - Nov 08, 2023",
      initial: "T",
      bgColor: "bg-orange-500",
    },
  ];

  // Хайлтаар шүүх хэсэг
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-slate-950 space-y-6 p-6 font-sans text-slate-900 dark:text-slate-100">
      {/* Дээд хэсэг: Гарчиг болон Хайлт */}
      <div className=" flex flex-col md:flex-row md:items-center justify-between gap-4">
        <HeaderSection paths={projectsPage} title="Төслүүд" />

        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Төсөл хайх..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Жагсаалтын хэсэг */}
      <div className="space-y-3">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            {/* Зүүн талын лого/үсэг */}
            <div
              className={`w-12 h-12 rounded-xl ${project.bgColor} flex items-center justify-center text-white font-bold text-lg shadow-inner`}
            >
              {project.initial}
            </div>

            {/* Төслийн мэдээлэл */}
            <div className="ml-4 flex-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                {project.name}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md">
                  {project.status}
                </span>

                <div className="flex items-center text-xs text-slate-400">
                  <Calendar size={12} className="mr-1" />
                  {project.date}
                </div>

                <div className="flex items-center text-xs text-slate-400">
                  <Folder size={12} className="mr-1" />
                  View Project
                </div>
              </div>
            </div>

            {/* Баруун талын нэмэлт цэг эсвэл сум */}
            <div className="text-slate-300 dark:text-slate-400 font-bold text-xl px-2">
              ⋮
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            Илэрц олдсонгүй.
          </div>
        )}
      </div>

      <button className="fixed bottom-20 right-6 bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 hover:bg-indigo-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110">
        <Plus size={26} strokeWidth={2} />
      </button>
    </div>
  );
}
