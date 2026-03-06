import React, { useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import DashboardPage from "./pages/dashboard";
import EmployeePage from "./pages/employee";
import ProjectPage from "./pages/project";
import ProfilPage from "./pages/profile";
import AttendancePage from "./pages/time";
import Task from "./pages/task";
import DarkMode from "./components/darkModeToggle";
import Settings from "./pages/usersSettings";
import LandingPage from "./pages/landing";
import AddUser from "./pages/addUser";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <div className="fixed top-5 right-5 z-[120]">
        <DarkMode />
      </div>

      <Routes>
        <Route
          path="/"
          element={<LandingPage onLogin={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/landing"
          element={<LandingPage onLogin={() => setIsAuthenticated(true)} />}
        />

        {isAuthenticated ? (
          <Route
            path="/*"
            element={
              <div className="dark:bg-slate-950 flex min-h-screen">
                <Sidebar onLogout={() => setIsAuthenticated(false)} />
                <main className="ml-64 p-8 w-full transition-all">
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/employees" element={<EmployeePage />} />
                    <Route path="/projects" element={<ProjectPage />} />
                    <Route path="/profile" element={<ProfilPage />} />
                    <Route path="/task" element={<Task />} />
                    <Route path="/time" element={<AttendancePage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                    <Route path="/addUser" element={<AddUser />} />
                  </Routes>
                </main>
              </div>
            }
          />
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
