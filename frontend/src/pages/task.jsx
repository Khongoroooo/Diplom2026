import HeaderSection from "../components/headerSection";

export default function Task() {
  const pageName = [{ name: "Даалгавар" }];
  const groups = [
    {
      title: "To do",
      color: "blue",
      tasks: [
        {
          id: 1,
          name: "Test",
          status: "Review",
          statusColor: "bg-blue-200 text-blue-800",
          person: "😊",
          number: 887,
        },
        {
          id: 2,
          name: "Task",
          status: "Completed",
          statusColor: "bg-green-500 text-white",
          person: "B",
          number: "",
        },
      ],
      footerProgress: "bg-green-500 w-1/2",
      footerSecondary: "bg-blue-200 w-1/2",
      totalNumber: 887,
    },
    {
      title: "In progress",
      color: "green",
      tasks: [
        {
          id: 3,
          name: "Release",
          status: "Stuck",
          statusColor: "bg-red-200 text-red-800",
          person: "",
          number: "",
        },
      ],
      footerProgress: "bg-red-200 w-full",
      totalNumber: 0,
    },
  ];
  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-slate-950 space-y-8 p-6 font-sans">
      <div className="">
        <HeaderSection paths={pageName} title="Даалгавар"></HeaderSection>
      </div>
      <div className="p-8 bg-gray-50 min-h-screen font-sans">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-yellow-500">⭐</span> Test board (Copy)
          </h1>
          <div className="flex items-center gap-2">
            <button className="bg-indigo-600 text-white px-4 py-1 rounded text-sm font-medium">
              INVITE
            </button>
            <span className="p-2 hover:bg-gray-200 rounded-full cursor-pointer">
              🗑️
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button className="border-b-2 border-indigo-500 px-4 py-2 text-sm font-medium text-indigo-600">
            List
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Report
          </button>
        </div>

        {/* Board Content */}
        <div className="space-y-12">
          {groups.map((group, idx) => (
            <div
              key={idx}
              className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-200"
            >
              <h3
                className={`p-3 font-semibold flex items-center gap-2 ${group.title === "To do" ? "text-blue-600" : "text-green-600"}`}
              >
                ▼ {group.title}
              </h3>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase border-y border-gray-100">
                    <th className="w-10 p-3"></th>
                    <th className="p-3 font-normal border-r border-gray-100">
                      Task
                    </th>
                    <th className="p-3 font-normal border-r border-gray-100 text-center">
                      Status
                    </th>
                    <th className="p-3 font-normal border-r border-gray-100 text-center">
                      Person
                    </th>
                    <th className="p-3 font-normal border-r border-gray-100 text-center">
                      Number test
                    </th>
                    <th className="p-3 font-normal text-center">Text</th>
                  </tr>
                </thead>
                <tbody>
                  {group.tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-b border-gray-100 hover:bg-gray-50 group"
                    >
                      <td className="p-3 text-center">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="p-3 border-r border-gray-100 relative">
                        {task.name}
                        <span className="absolute right-2 opacity-0 group-hover:opacity-100 text-gray-400">
                          💬
                        </span>
                      </td>
                      <td
                        className={`p-3 border-r border-gray-100 text-center text-sm font-medium ${task.statusColor}`}
                      >
                        {task.status}
                      </td>
                      <td className="p-3 border-r border-gray-100 text-center">
                        {task.person && (
                          <span className="bg-gray-200 rounded-full px-2 py-1 text-xs">
                            {task.person}
                          </span>
                        )}
                      </td>
                      <td className="p-3 border-r border-gray-100 text-center">
                        {task.number}
                      </td>
                      <td className="p-3"></td>
                    </tr>
                  ))}
                  {/* Add Task Row */}
                  <tr className="text-gray-400 text-sm">
                    <td className="p-3"></td>
                    <td className="p-3">+ Add task</td>
                    <td colSpan="4"></td>
                  </tr>
                </tbody>
                {/* Footer Row */}
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td colSpan="2"></td>
                    <td className="p-2 flex gap-1 h-10">
                      <div
                        className={`${group.footerProgress} rounded-sm`}
                      ></div>
                      {group.footerSecondary && (
                        <div
                          className={`${group.footerSecondary} rounded-sm`}
                        ></div>
                      )}
                    </td>
                    <td className="border-x border-gray-200"></td>
                    <td className="p-2 text-center text-sm border-r border-gray-200">
                      {group.totalNumber}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        </div>

        <button className="mt-6 border border-gray-300 px-4 py-1 rounded text-xs font-semibold text-gray-600 hover:bg-gray-100">
          + ADD GROUP
        </button>
      </div>
    </div>
  );
}
