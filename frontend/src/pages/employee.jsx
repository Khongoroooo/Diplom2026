import { useLocation } from "react-router-dom";

export default function EmployeePage() {
  const location = useLocation();
  const pageName = location.pathname.split("/").filter(Boolean).pop();
  return (
    <div className="uppercase text-xs">
      <p>{pageName}</p>
    </div>
  );
}
