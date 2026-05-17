import { Search } from "lucide-react";

const SearchInput = ({ onChange, placeholder, className }) => {
  return (
    <div className={`relative group transition-all duration-300 ${className}`}>
      {/* Search Icon - Focus үед өнгө нь хувирна */}
      <Search
        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors duration-300"
        size={18}
      />
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-6 py-3.5 rounded-[20px] border border-slate-200 bg-white dark:bg-slate-900 shadow-sm shadow-slate-200/50 dark:shadow-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
      />
    </div>
  );
};

export default SearchInput;
