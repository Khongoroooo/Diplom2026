// components/report/ReportPanels.jsx
import React from "react";
import {
  Users,
  FolderKanban,
  CheckSquare,
  Clock,
  UserCheck,
  Star,
  Building2,
} from "lucide-react";
import {
  StatCard,
  MiniBar,
  RingChart,
  SectionHeader,
  ReportCard,
  StatusPill,
  TableTh,
  TableTd,
  InlineProgress,
} from "./ReportWidgets";

/* ─── 1. Overview / KPI row ─────────────────────────────── */
export const OverviewPanel = ({ stats }) => {
  if (!stats) return null;
  const taskDoneRate = stats.totalTasks
    ? Math.round((stats.tasksByStatus.completed / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <StatCard
        label="Нийт хэрэглэгч"
        value={stats.totalUsers}
        sub={`${stats.usersByRole.EMPLOYEE} ажилтан`}
        icon={Users}
        gradient="from-indigo-500 to-violet-500"
      />
      <StatCard
        label="Нийт төсөл"
        value={stats.totalProjects}
        sub={`${stats.projectsByStatus.completed} дууссан`}
        icon={FolderKanban}
        gradient="from-emerald-400 to-teal-500"
      />
      <StatCard
        label="Нийт даалгавар"
        value={stats.totalTasks}
        sub={`${taskDoneRate}% биелэлт`}
        icon={CheckSquare}
        gradient="from-amber-400 to-orange-400"
      />
      <StatCard
        label="Ирцийн бүртгэл"
        value={stats.attendanceStats.present + stats.attendanceStats.late}
        sub={`${stats.attendanceStats.absent} тасалсан`}
        icon={Clock}
        gradient="from-rose-400 to-pink-500"
      />
    </div>
  );
};

/* ─── 2. Task Status Panel ───────────────────────────────── */
export const TaskPanel = ({ stats }) => {
  if (!stats) return null;
  const { tasksByStatus, totalTasks } = stats;

  const segments = [
    {
      color: "#00ca72",
      value: totalTasks ? (tasksByStatus.completed / totalTasks) * 100 : 0,
    },
    {
      color: "#fdab3d",
      value: totalTasks ? (tasksByStatus.working / totalTasks) * 100 : 0,
    },
    {
      color: "#e2445c",
      value: totalTasks ? (tasksByStatus.stuck / totalTasks) * 100 : 0,
    },
    {
      color: "#579bfc",
      value: totalTasks ? (tasksByStatus.review / totalTasks) * 100 : 0,
    },
    {
      color: "#94a3b8",
      value: totalTasks ? (tasksByStatus.todo / totalTasks) * 100 : 0,
    },
  ];

  return (
    <ReportCard>
      <SectionHeader
        icon={CheckSquare}
        title="Даалгаврын статус"
        subtitle={`Нийт ${totalTasks} даалгавар`}
        gradient="from-amber-400 to-orange-400"
      />
      <div className="flex items-center gap-6">
        <RingChart
          segments={segments}
          size={100}
          value={totalTasks}
          label="нийт"
        />
        <div className="flex-1 space-y-2.5">
          <StatusPill
            label="Дууссан"
            color="#00ca72"
            count={tasksByStatus.completed}
          />
          <StatusPill
            label="Working"
            color="#fdab3d"
            count={tasksByStatus.working}
          />
          <StatusPill
            label="Stuck"
            color="#e2445c"
            count={tasksByStatus.stuck}
          />
          <StatusPill
            label="Review"
            color="#579bfc"
            count={tasksByStatus.review}
          />
          <StatusPill
            label="To Do"
            color="#94a3b8"
            count={tasksByStatus.todo}
          />
        </div>
      </div>
    </ReportCard>
  );
};

/* ─── 3. Attendance Panel ────────────────────────────────── */
export const AttendancePanel = ({ stats }) => {
  if (!stats) return null;
  const { attendanceStats } = stats;
  const total = Object.values(attendanceStats).reduce((a, b) => a + b, 0);

  const segments = [
    {
      color: "#00ca72",
      value: total ? (attendanceStats.present / total) * 100 : 0,
    },
    {
      color: "#fdab3d",
      value: total ? (attendanceStats.late / total) * 100 : 0,
    },
    {
      color: "#e2445c",
      value: total ? (attendanceStats.absent / total) * 100 : 0,
    },
    {
      color: "#579bfc",
      value: total ? (attendanceStats.leave / total) * 100 : 0,
    },
  ];

  return (
    <ReportCard>
      <SectionHeader
        icon={UserCheck}
        title="Ирцийн тайлан"
        subtitle={`Нийт ${total} бүртгэл`}
        gradient="from-emerald-400 to-teal-500"
      />
      <div className="flex items-center gap-6">
        <RingChart
          segments={segments}
          size={100}
          value={total}
          label="бүртгэл"
        />
        <div className="flex-1 space-y-2.5">
          <StatusPill
            label="Ирсэн"
            color="#00ca72"
            count={attendanceStats.present}
          />
          <StatusPill
            label="Хоцорсон"
            color="#fdab3d"
            count={attendanceStats.late}
          />
          <StatusPill
            label="Тасалсан"
            color="#e2445c"
            count={attendanceStats.absent}
          />
          <StatusPill
            label="Чөлөөтэй"
            color="#579bfc"
            count={attendanceStats.leave}
          />
        </div>
      </div>
    </ReportCard>
  );
};

/* ─── 4. Project Status Panel ────────────────────────────── */
export const ProjectStatusPanel = ({ stats }) => {
  if (!stats) return null;
  const { projectsByStatus, totalProjects } = stats;

  const items = [
    { label: "Шинэ төсөл", key: "new", color: "#94a3b8" },
    { label: "Хийгдэж буй", key: "in_progress", color: "#579bfc" },
    { label: "Арчилгаа", key: "maintenance", color: "#fdab3d" },
    { label: "Хагас гүйц.", key: "half_balance", color: "#a78bfa" },
    { label: "Дууссан", key: "completed", color: "#00ca72" },
  ];

  return (
    <ReportCard>
      <SectionHeader
        icon={FolderKanban}
        title="Төслийн статус"
        subtitle={`Нийт ${totalProjects} төсөл`}
        gradient="from-indigo-500 to-violet-500"
      />
      <div className="space-y-3 mt-1">
        {items.map((item) => (
          <MiniBar
            key={item.key}
            label={item.label}
            value={projectsByStatus[item.key]}
            max={totalProjects}
            color={item.color}
          />
        ))}
      </div>
    </ReportCard>
  );
};

/* ─── 5. User Role Panel ─────────────────────────────────── */
export const UserRolePanel = ({ stats }) => {
  if (!stats) return null;
  const { usersByRole, totalUsers } = stats;

  const roles = [
    { label: "Admin", key: "ADMIN", color: "#e2445c" },
    { label: "HR", key: "HR", color: "#a78bfa" },
    { label: "Менежер", key: "MANAGER", color: "#fdab3d" },
    { label: "Ажилтан", key: "EMPLOYEE", color: "#579bfc" },
  ];

  return (
    <ReportCard>
      <SectionHeader
        icon={Users}
        title="Хэрэглэгчдийн дүр"
        subtitle={`Нийт ${totalUsers} хэрэглэгч`}
        gradient="from-rose-400 to-pink-500"
      />
      <div className="space-y-3 mt-1">
        {roles.map((r) => (
          <MiniBar
            key={r.key}
            label={r.label}
            value={usersByRole[r.key]}
            max={totalUsers}
            color={r.color}
          />
        ))}
      </div>
    </ReportCard>
  );
};

/* ─── 6. Top Performers Table ────────────────────────────── */
export const TopPerformersPanel = ({ stats }) => {
  if (!stats?.topPerformers?.length) return null;

  return (
    <ReportCard>
      <SectionHeader
        icon={Star}
        title="Шилдэг ажилтнууд"
        subtitle="Дууссан даалгаврын тоогоор"
        gradient="from-amber-400 to-yellow-400"
      />
      <div className="overflow-x-auto -mx-5">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800">
              <TableTh>#</TableTh>
              <TableTh>Нэр</TableTh>
              <TableTh>Алба</TableTh>
              <TableTh>Дууссан</TableTh>
              <TableTh>Биелэлт</TableTh>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {stats.topPerformers.map((u, i) => {
              const rate = u.totalTasks
                ? Math.round((u.completedTasks / u.totalTasks) * 100)
                : 0;
              return (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <TableTd>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                        i === 0
                          ? "bg-amber-400 text-white"
                          : i === 1
                            ? "bg-slate-300 text-slate-600"
                            : i === 2
                              ? "bg-orange-300 text-white"
                              : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                  </TableTd>
                  <TableTd>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                        {(u.first_name || u.username)?.charAt(0)}
                      </div>
                      <span className="font-semibold">
                        {`${u.last_name || ""} ${u.first_name || ""}`.trim() ||
                          u.username}
                      </span>
                    </div>
                  </TableTd>
                  <TableTd className="text-slate-400">
                    {u.department_name || "-"}
                  </TableTd>
                  <TableTd>
                    <span className="font-black text-emerald-500">
                      {u.completedTasks}
                    </span>
                    <span className="text-slate-300 text-[10px]">
                      {" "}
                      / {u.totalTasks}
                    </span>
                  </TableTd>
                  <TableTd>
                    <InlineProgress value={rate} color="#00ca72" />
                  </TableTd>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ReportCard>
  );
};

/* ─── 7. Department Performance ──────────────────────────── */
export const DepartmentPanel = ({ stats }) => {
  if (!stats?.deptStats?.length) return null;

  return (
    <ReportCard>
      <SectionHeader
        icon={Building2}
        title="Тасгийн гүйцэтгэл"
        subtitle="Даалгаврын биелэлтийн хувиар"
        gradient="from-sky-400 to-blue-500"
      />
      <div className="space-y-3 mt-1">
        {stats.deptStats.map((dept) => (
          <div key={dept.name}>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {dept.name}
              </span>
              <span className="text-[10px] text-slate-400">
                {dept.done}/{dept.total} даалгавар
              </span>
            </div>
            <InlineProgress value={dept.rate} color="#0ea5e9" />
          </div>
        ))}
      </div>
    </ReportCard>
  );
};

/* ─── 8. Project Progress Table ──────────────────────────── */
export const ProjectProgressPanel = ({ stats }) => {
  if (!stats?.projectProgress?.length) return null;

  const STATUS_LABEL = {
    new: "Шинэ",
    in_progress: "Хийгдэж буй",
    maintenance: "Арчилгаа",
    half_balance: "Хагас",
    completed: "Дууссан",
  };
  const STATUS_COLOR = {
    new: "#94a3b8",
    in_progress: "#579bfc",
    maintenance: "#fdab3d",
    half_balance: "#a78bfa",
    completed: "#00ca72",
  };

  return (
    <ReportCard className="col-span-2">
      <SectionHeader
        icon={FolderKanban}
        title="Төслийн явц"
        subtitle="Бүх төслийн дэлгэрэнгүй"
        gradient="from-violet-500 to-purple-500"
      />
      <div className="overflow-x-auto -mx-5">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800">
              <TableTh>Төслийн нэр</TableTh>
              <TableTh>Статус</TableTh>
              <TableTh>Даалгавар</TableTh>
              <TableTh>Явц</TableTh>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {stats.projectProgress.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
              >
                <TableTd className="font-semibold max-w-[200px] truncate">
                  {p.title}
                </TableTd>
                <TableTd>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{
                      color: STATUS_COLOR[p.status],
                      backgroundColor: STATUS_COLOR[p.status] + "20",
                    }}
                  >
                    {STATUS_LABEL[p.status] || p.status}
                  </span>
                </TableTd>
                <TableTd>
                  <span className="font-bold text-indigo-500">
                    {p.doneCount}
                  </span>
                  <span className="text-slate-300 text-[10px]">
                    {" "}
                    / {p.taskCount}
                  </span>
                </TableTd>
                <TableTd>
                  <InlineProgress value={p.progress} color="#6366f1" />
                </TableTd>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportCard>
  );
};
