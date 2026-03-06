import { Search } from "lucide-react";

const SearchInput = ({ onChange, placeholder, className }) => {
  return (
    <div className={`relative w-full md:w-80 ${className}`}>
      <Search
        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
        size={18}
      />
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
      ></input>
    </div>
  );
};
export default SearchInput;
