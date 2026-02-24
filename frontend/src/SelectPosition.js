import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Users, Crown } from "lucide-react";
import Layout from "./components/Layout";

function SelectPosition() {
  const navigate = useNavigate();

  const handleSelect = (position) => {
    navigate("/add-candidates", {
      state: { position },
    });
  };

  const Card = ({ title, icon, onClick }) => (
    <button
      onClick={onClick}
      className="
        group relative overflow-hidden
        bg-white border border-slate-200
        rounded-2xl p-10
        shadow-sm hover:shadow-xl
        transition-all duration-300
        hover:-translate-y-2
      "
    >
      {/* Gradient Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 opacity-0 group-hover:opacity-100 transition duration-300"></div>

      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="
          w-16 h-16 flex items-center justify-center
          rounded-full bg-emerald-100
          group-hover:bg-white
          transition
        ">
          {icon}
        </div>

        <h2 className="
          text-lg font-semibold text-slate-700
          group-hover:text-white transition
        ">
          {title}
        </h2>
      </div>
    </button>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 px-6 py-12">

        <div className="w-full max-w-6xl mx-auto space-y-12">

          {/* ===== HEADER ===== */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-slate-800">
              สมัครรับเลือกตั้ง
            </h1>
            <p className="text-slate-500 text-lg">
              กรุณาเลือกตำแหน่งที่ต้องการลงสมัคร
            </p>
          </div>

          {/* ===== CARD SECTION ===== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <Card
              title="นายกองค์กรบริหาร (อบ.ก)"
              icon={<Crown size={28} className="text-emerald-600 group-hover:text-emerald-600" />}
              onClick={() => handleSelect("OBK")}
            />

            <Card
              title="สมาชิกผู้แทนนิสิต"
              icon={<Users size={28} className="text-emerald-600 group-hover:text-emerald-600" />}
              onClick={() => handleSelect("REPRESENTATIVE")}
            />

            <Card
              title="นายกสโมสรนิสิต"
              icon={<User size={28} className="text-emerald-600 group-hover:text-emerald-600" />}
              onClick={() => handleSelect("CLUB")}
            />

          </div>

        </div>
      </div>
    </Layout>
  );
}

export default SelectPosition;
