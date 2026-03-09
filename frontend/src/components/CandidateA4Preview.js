  import React from "react";

  function CandidateA4Preview({ form, policies, profilePreview }) {

    const today = new Date();
    const thaiDate = today.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    return (
      <div className="flex justify-center">
        <div className="bg-white shadow-lg w-[794px] min-h-[1123px] p-12 space-y-8 border">

          {/* HEADER */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold">ใบสมัครรับเลือกตั้ง</h1>
            <p className="text-slate-500">ระบบ KUVote</p>
          </div>

          {/* PROFILE */}
          <div className="grid grid-cols-3 gap-6">

            {profilePreview || form.profileImage ? (
    <img
      src={profilePreview || form.profileImage}
      className="w-40 h-52 object-cover border"
      alt="profile"
    />
  ) : (
    <div className="w-40 h-52 border flex items-center justify-center text-gray-400">
      ไม่มีรูป
    </div>
  )}


            <div className="col-span-2 space-y-2">
              <h2 className="font-semibold text-lg">ข้อมูลผู้สมัคร</h2>

              <p><b>ชื่อ:</b> {form.name}</p>
              <p><b>ชื่อเล่น:</b> {form.nickname}</p>
              <p><b>คณะ:</b> {form.faculty}</p>
              <p><b>สาขา:</b> {form.major}</p>
              <p><b>ชั้นปี:</b> {form.year}</p>
              <p><b>Email:</b> {form.email}</p>
              <p><b>เบอร์โทร:</b> {form.phone}</p>
            </div>
          </div>

          {/* ELECTION */}
          <div>
            <h2 className="font-semibold text-lg border-b pb-1">
              ข้อมูลการลงสมัคร
            </h2>

            <p><b>ตำแหน่ง:</b> {form.position}</p>
            <p><b>พรรค / ทีม:</b> {form.partyName}</p>
            <p><b>สโลแกน:</b> {form.slogan}</p>
          </div>

          {/* POSITION SPECIFIC */}
          {form.position === "นายกองค์การบริหารนิสิต (อบก.)" && (
            <>
              <p><b>วิสัยทัศน์:</b> {form.vision}</p>
              <p><b>จำนวนทีมงาน:</b> {form.teamSize}</p>
            </>
          )}

          {form.position === "สมาชิกผู้แทนนิสิต" && (
            <p><b>เขตที่ลงสมัคร:</b> {form.zone}</p>
          )}

          {form.position === "นายกสโมสรนิสิต" && (
            <p><b>ชื่อสโมสร:</b> {form.clubName}</p>
          )}

        
          {/* POLICIES */}
  <div>
    <h2 className="font-semibold text-lg border-b pb-1">
      นโยบาย
    </h2>

    {policies && policies.length > 0 ? (
      policies.map((p, i) => (
        <p key={i} className="mt-1">
          {i + 1}. {p}
        </p>
      ))
    ) : (
      <p>-</p>
    )}
  </div>
          {/* SIGN */}
          <div className="pt-10 flex justify-between">
            <div>
              ลงชื่อ ....................................
              <p className="text-sm text-slate-500">ผู้สมัคร</p>
            </div>

            <div>
              วันที่ {thaiDate}
            </div>
          </div>

        </div>
      </div>
    );
  }

  export default CandidateA4Preview;