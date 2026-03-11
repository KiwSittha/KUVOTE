export default function StepBar({ step, maxSteps = 3 }) {
  const getStepLabels = () => {
    if (maxSteps === 2) {
      return ["ข้อมูลผู้สมัคร", "แนวคิด"];
    }
    if (maxSteps === 3) {
      return ["ข้อมูลผู้สมัคร", "รายละเอียด", "ตรวจสอบ"];
    }
    if (maxSteps === 4) {
      return ["ข้อมูล", "นโยบาย", "เอกสาร", "ตรวจสอบ"];
    }
    if (maxSteps === 5) {
      return ["ทีม", "หัวหน้า", "สมาชิก", "นโยบาย", "ตรวจสอบ"];
    }
    return [];
  };

  const steps = getStepLabels();

  return (
    <div className="relative flex justify-between items-start w-full px-6">
      <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 rounded-full"></div>

      <div
        className="absolute top-5 left-6 h-1 bg-emerald-500 rounded-full transition-all"
        style={{
          width: `${((step - 1) / (maxSteps - 1)) * 100}%`
        }}
      />

      {steps.map((label, i) => {
        const current = i + 1;
        const active = step >= current;

        return (
          <div key={i} className="flex flex-col items-center flex-1 z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
              ${active ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"}`}>
              {current}
            </div>
            <span className={`mt-3 text-sm text-center
              ${active ? "text-emerald-600" : "text-slate-400"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}