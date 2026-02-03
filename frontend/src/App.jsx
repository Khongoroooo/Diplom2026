import React from "react";
import Sidebar from "./components/sidebar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/dashboard";
import EmployeePage from "./pages/employee";
import ProjectPage from "./pages/project";
import ProfilPage from "./pages/profile";

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <main className="ml-64 p-8 w-full">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />}></Route>
            <Route path="/employees" element={<EmployeePage />}></Route>
            <Route path="/projects" element={<ProjectPage />}></Route>
            <Route path="/profile" element={<ProfilPage />}></Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
