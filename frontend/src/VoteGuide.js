import React from "react";
import Layout from "./components/Layout";
import { Link } from "react-router-dom";

export default function VoteGuide() {
  const steps = [
    {
      title: "STEP 1 : เข้าสู่ระบบ",
      icon: "🔐",
      bullets: ["ล็อกอินด้วยบัญชีนิสิต", "1 คน ลงคะแนนได้ 1 ครั้ง"],
      badge: "LOGIN",
    },
    {
      title: "STEP 2 : เลือกผู้สมัคร",
      icon: "🗳️",
      bullets: ["ตรวจสอบข้อมูลผู้สมัคร", "เลือกได้เพียง 1 คน"],
      badge: "SELECT",
    },
    {
      title: "STEP 3 : ตรวจสอบก่อนยืนยัน",
      icon: "📄",
      bullets: ["เช็กชื่อ/เบอร์ผู้สมัครอีกครั้ง", "เมื่อยืนยันแล้ว ไม่สามารถแก้ไขได้"],
      badge: "REVIEW",
    },
    {
      title: "STEP 4 : ยืนยันการลงคะแนน",
      icon: "✅",
      bullets: ["กดปุ่ม “ยืนยัน” เพื่อส่งคะแนน", "ระบบแจ้งว่า “ลงคะแนนสำเร็จ”"],
      badge: "CONFIRM",
    },
  ];

  return (
    <Layout>
      <div className="min-h-[85vh] px-4 md:px-10 py-10">
        <div className="max-w-6xl mx-auto">

          {/* ===== Header ===== */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                วิธีการลงคะแนนเลือกตั้งประธานนิสิต
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                โปรดทำตามขั้นตอนด้านล่าง เพื่อความถูกต้องและความปลอดภัยของระบบ
              </p>
              <div className="mt-3 h-1 w-24 rounded-full bg-emerald-600" />
            </div>

            {/* ปุ่มเหลือแค่ด้านบน */}
            <div className="flex gap-3">
              <Link
                to="/vote"
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm"
              >
                ไปหน้าโหวต
              </Link>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
              >
                กลับหน้าหลัก
              </Link>
            </div>
          </div>

          {/* ===== Steps Grid ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl">
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-emerald-700 font-extrabold tracking-wide">
                        {s.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        ขั้นตอนที่ {idx + 1} จาก {steps.length}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-black tracking-[0.22em] px-3 py-1 rounded-full bg-slate-900 text-white">
                    {s.badge}
                  </span>
                </div>

                <ul className="mt-5 space-y-2 text-slate-700">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
                      <span className="text-sm">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ===== Warning Section ===== */}
          <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-xl">
                ⚠️
              </div>

              <div className="flex-1">
                <div className="font-extrabold text-amber-900 text-lg">
                  ข้อควรระวัง
                </div>

                <ul className="mt-3 space-y-1 text-sm text-amber-900/90">
                  <li>• ลงคะแนนได้เพียง 1 ครั้งต่อบัญชีผู้ใช้</li>
                  <li>• เมื่อกดยืนยันแล้ว ระบบจะไม่อนุญาตให้เปลี่ยนแปลง</li>
                  <li>• หากพบปัญหา ให้ติดต่อผู้ดูแลระบบ/กรรมการหน่วยเลือกตั้ง</li>
                </ul>

                <div className="mt-4 text-xs text-amber-900/70">
                  * ระบบเลือกตั้งมหาวิทยาลัย — โปรดใช้งานอย่างสุจริต
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
