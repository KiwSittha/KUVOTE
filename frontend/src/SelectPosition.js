import { useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import { User } from "lucide-react";

export const POSITION_LABELS = {
  OBK: "นายกองค์การบริหารนิสิต",
  REPRESENTATIVE: "สมาชิกผู้แทนนิสิต",
  CLUB: "ประธานสโมสรนิสิต"
};

function SelectPosition() {
  const navigate = useNavigate();

  const handleSelect = (position) => {
    navigate("/add-candidates", {
      state: { position },
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 px-10 py-12">

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-800">
            สมัครรับเลือกตั้ง
          </h1>

          <p className="text-slate-500 text-lg mt-2">
            กรุณาเลือกตำแหน่งที่ต้องการลงสมัคร
          </p>
        </div>

        {/* POSITION CARD */}
        <div className="w-full">

          <button
            onClick={() => handleSelect("CLUB")}
            className="
              group
              w-full
              bg-white
              border border-slate-200
              rounded-3xl
              p-12
              flex items-center gap-8
              shadow-md
              hover:shadow-xl
              hover:-translate-y-1
              transition-all duration-300
            "
          >

            {/* ICON */}
            <div className="
              w-20 h-20
              flex items-center justify-center
              rounded-2xl
              bg-emerald-100
              group-hover:bg-emerald-600
              transition
            ">
              <User
                size={36}
                className="text-emerald-600 group-hover:text-white"
              />
            </div>

            {/* TEXT */}
            <div className="text-left flex-1">
              <h2 className="
                text-2xl font-bold text-slate-800
                group-hover:text-emerald-600
              ">
                {POSITION_LABELS.CLUB}
              </h2>

              <p className="text-slate-500 mt-2">
                ลงสมัครเพื่อเป็นตัวแทนนิสิตในการพัฒนากิจกรรมและสโมสรของคณะ
              </p>
            </div>

            {/* ACTION */}
            <div className="
              text-emerald-600
              font-semibold
              group-hover:translate-x-2
              transition
            ">
              สมัคร →
            </div>

          </button>

        </div>

      </div>
    </Layout>
  );
}

export default SelectPosition;