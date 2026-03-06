import HeaderSection from "../components/headerSection";

export default function EmployeePage() {
  const pageName = [{ name: "Ажилчид" }];
  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-slate-950 space-y-8 p-6 font-sans">
      <div className="">
        <HeaderSection paths={pageName} title="Ажилчид"></HeaderSection>
      </div>
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className=" bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ажилтан
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Албан тушаал
                </th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
}
