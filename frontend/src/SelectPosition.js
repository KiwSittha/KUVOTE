
import { useNavigate } from "react-router-dom";
import { User, Users, Crown } from "lucide-react";
import Layout from "./components/Layout";
import React, { useEffect, useState } from "react";
function SelectPosition() {
  const navigate = useNavigate();

  // ✅ ดึง user จาก localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const [showAlreadyModal, setShowAlreadyModal] = useState(false);
  const handleSelect = (position) => {
    navigate("/add-candidates", {
      state: { position },
    });
  };

  // ✅ เช็คว่าผู้ใช้นี้เคยสมัครหรือยัง
  useEffect(() => {
  const checkAlreadyApplied = async () => {
    if (!user) return;

    try {
      const res = await fetch("http://localhost:8000/candidates");
      const data = await res.json();

      const already = data.find(c => c.email === user.email);

      if (already) {
        setShowAlreadyModal(true); // 🔥 แสดง modal แทน navigate
      }

    } catch (err) {
      console.error("ตรวจสอบการสมัครล้มเหลว:", err);
    }
  };

  checkAlreadyApplied();
}, [user]);

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

          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-slate-800">
              สมัครรับเลือกตั้ง
            </h1>
            <p className="text-slate-500 text-lg">
              กรุณาเลือกตำแหน่งที่ต้องการลงสมัคร
            </p>
          </div>

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
      {showAlreadyModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
    <div className="bg-white rounded-2xl shadow-2xl p-10 text-center w-[450px]">

      <h1 className="text-2xl font-bold text-red-600">
        ไม่สามารถดำเนินการได้
      </h1>

      <p className="mt-4 text-gray-700">
        เนื่องจากคุณได้ยื่นใบสมัครไว้แล้ว
        ระบบไม่อนุญาตให้สมัครซ้ำ
      </p>

      <button
  onClick={() => navigate("/")}
  className="mt-6 bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition"
>
  กลับหน้าแรก
</button>

    </div>
  </div>
)}
    </Layout>
  );
}

export default SelectPosition;