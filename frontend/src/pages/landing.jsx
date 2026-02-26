import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage({ onLogin }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    onLogin(); 
    navigate("/dashboard"); 
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 bg-clip-text text-transparent">
            Smart Flow
          </span>

          <div className="flex items-center space-x-8">
            <ul className="hidden md:flex space-x-6 font-medium text-slate-600 dark:text-slate-300">
              <li className="hover:text-blue-600 cursor-pointer">
                Бидний тухай
              </li>
              <li className="hover:text-blue-600 cursor-pointer">Үйлчилгээ</li>
            </ul>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 text-white font-semibold rounded-full transition-all shadow-md shadow-blue-500/20"
            >
              Нэвтрэх
            </button>
          </div>
        </div>
      </nav>

      {/* LOGIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-2xl shadow-2xl relative border dark:border-slate-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
              Системд нэвтрэх
            </h2>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Имэйл
                </label>
                <input
                  type="email"
                  required
                  className="w-full p-3 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="example@mail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Нууц үг
                </label>
                <input
                  type="password"
                  required
                  className="w-full p-3 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors mt-2"
              >
                Нэвтрэх
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <header className="pt-40 pb-20 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
          Ажлын урсгалаа <br />
          <span className="text-blue-600">Ухаалгаар</span> удирд
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          Smart Flow систем нь танай багийн бүтээмжийг шинэ түвшинд гаргана.
        </p>
        <button className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform">
          Үнэгүй эхлэх
        </button>
      </header>
    </div>
  );
}
