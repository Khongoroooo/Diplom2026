import React from "react";
import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";

/* ─── Stat Card ──────────────────────────────────────────── */
export const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  gradient,
  trend,
}) => {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor =
    trend > 0
      ? "text-emerald-400"
      : trend < 0
        ? "text-red-400"
        : "text-slate-400";

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
      {/* Background glow */}
      <div
        className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-xl bg-gradient-to-br ${gradient}`}
      />

      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}
        >
          <Icon size={20} className="text-white" />
        </div>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-[10px] font-bold ${trendColor}`}
          >
            <TrendIcon size={12} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums leading-none">
        {value}
      </p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
        {label}
      </p>
      {sub && (
        <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">
          {sub}
        </p>
      )}
    </div>
  );
};

/* ─── Mini Bar (horizontal progress) ────────────────────── */
export const MiniBar = ({
  label,
  value,
  max,
  color = "#6366f1",
  suffix = "",
}) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-[11px] text-slate-500 dark:text-slate-400 w-28 truncate shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-[11px] font-black tabular-nums w-10 text-right"
        style={{ color }}
      >
        {value}
        {suffix}
      </span>
    </div>
  );
};

/* ─── Ring Chart (SVG donut) ─────────────────────────────── */
export const RingChart = ({
  segments,
  size = 100,
  strokeWidth = 14,
  label,
  value,
}) => {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
        />
        {segments.map((seg, i) => {
          const segLen = (seg.value / 100) * circumference;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segLen} ${circumference - segLen}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.7s ease" }}
            />
          );
          offset += segLen;
          return el;
        })}
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-800 dark:text-white tabular-nums leading-none">
          {value}
        </span>
        <span className="text-[9px] text-slate-400 font-medium mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
};

/* ─── Section Header ─────────────────────────────────────── */
export const SectionHeader = ({ icon: Icon, title, subtitle, gradient }) => (
  <div className="flex items-center gap-3 mb-4">
    <div
      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm shrink-0`}
    >
      <Icon size={16} className="text-white" />
    </div>
    <div>
      <h2 className="text-[13px] font-extrabold text-slate-700 dark:text-white uppercase tracking-wider">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
      )}
    </div>
    <ChevronRight
      size={16}
      className="text-slate-300 dark:text-slate-600 ml-auto"
    />
  </div>
);

/* ─── Card wrapper ───────────────────────────────────────── */
export const ReportCard = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 ${className}`}
  >
    {children}
  </div>
);

/* ─── Status pill ────────────────────────────────────────── */
export const StatusPill = ({ label, color, count }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
    <span className="text-[11px] font-black tabular-nums" style={{ color }}>
      {count}
    </span>
  </div>
);

/* ─── Table shared styles ────────────────────────────────── */
export const TableTh = ({ children }) => (
  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">
    {children}
  </th>
);

export const TableTd = ({ children, className = "" }) => (
  <td
    className={`py-3 px-3 text-[12px] text-slate-600 dark:text-slate-300 ${className}`}
  >
    {children}
  </td>
);

/* ─── Progress bar inline ────────────────────────────────── */
export const InlineProgress = ({ value, color = "#6366f1" }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
    <span
      className="text-[10px] font-bold tabular-nums w-8 text-right"
      style={{ color }}
    >
      {value}%
    </span>
  </div>
);
