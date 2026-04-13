import React from "react";
import DatePicker from "react-datepicker";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from "lucide-react";

const AttendanceFilters = ({ 
  currentYear, 
  currentMonth, 
  setCurrentMonth, 
  setCurrentYear, 
  selectedDate, 
  setSelectedDate 
}) => {
  return (
    <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => {
            setSelectedDate(null);
            setCurrentMonth((m) => (m === 1 ? 12 : m - 1));
            if (currentMonth === 1) setCurrentYear((y) => y - 1);
          }}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-400" />
        </button>
        <div className="text-center font-black dark:text-white text-sm">
          {currentYear} / {currentMonth}
        </div>
        <button
          onClick={() => {
            setSelectedDate(null);
            setCurrentMonth((m) => (m === 12 ? 1 : m + 1));
            if (currentMonth === 12) setCurrentYear((y) => y + 1);
          }}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ChevronRight size={20} className="text-slate-400" />
        </button>
      </div>

      <div className="relative pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <div className="flex-1 relative">
          <CalendarIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 z-10 pointer-events-none"
          />
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Өдөр сонгох"
            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[12px] font-bold focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer"
          />
        </div>
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AttendanceFilters;