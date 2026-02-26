import HeaderSection from "../components/headerSection";

export default function Settings() {
  const pageName = [{ name: "Тохиргоо" }];
  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-slate-950 space-y-8 p-6 font-sans">
      <div className="p-4">
        <HeaderSection
          paths={pageName}
          title="Тохиргоо"
          subtitle={undefined}
        ></HeaderSection>
      </div>
    </div>
  );
}
