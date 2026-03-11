import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './components/Layout';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ State สำหรับค้นหาอีเมล
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ faculty: '', role: '' });
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch('http://localhost:8000/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        alert(`ปฏิเสธการเข้าถึง: ${data.message}`);
        setUsers([]);
        if (response.status === 401 || response.status === 403) {
           navigate('/login');
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      setUsers([]); 
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user) => {
    setEditingUser(user);
    // ✅ เซ็ตแค่ faculty และ role เพื่อเตรียมส่งไปให้ Backend
    setFormData({
      faculty: user.faculty || '',
      role: user.role || 'user'
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:8000/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData) // ส่งไปแค่ { faculty, role }
      });
      
      const data = await response.json();

      if (response.ok) {
        alert("บันทึกข้อมูลสำเร็จ");
        setEditingUser(null);
        fetchUsers(); 
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  // ✅ ฟังก์ชันกรองข้อมูลตามอีเมลที่ค้นหา
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="py-8 px-4 md:px-8 max-w-6xl mx-auto w-full font-sans text-gray-800 animate-fade-in">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-extrabold text-emerald-700">จัดการข้อมูลผู้ใช้ 👥</h1>
          
          {/* ✅ ช่องค้นหาอีเมล */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg aria-hidden="true" className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="search" 
              className="block w-full p-3 pl-10 text-sm text-slate-900 border border-slate-300 rounded-xl bg-white focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm transition-all" 
              placeholder="ค้นหาด้วยอีเมล..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ตารางแสดงผู้ใช้ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 font-bold">อีเมล</th>
                  <th className="p-4 font-bold">คณะ</th>
                  <th className="p-4 font-bold">บทบาท (Role)</th>
                  <th className="p-4 font-bold">สถานะยืนยัน</th>
                  <th className="p-4 font-bold">การโหวต</th>
                  <th className="p-4 font-bold text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="text-center p-8 text-slate-500 font-medium">กำลังตรวจสอบสิทธิ์และโหลดข้อมูล...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="6" className="text-center p-8 text-slate-500 font-medium">ไม่พบข้อมูลผู้ใช้ที่ค้นหา</td></tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-700">{user.email}</td>
                      <td className="p-4 text-slate-600">{user.faculty || '-'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                          {user.role === 'admin' ? 'ADMIN' : 'USER'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isVerified ? 'ยืนยันแล้ว' : 'รอการยืนยัน'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.hasVoted ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {user.hasVoted ? 'โหวตแล้ว' : 'ยังไม่โหวต'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg text-sm font-bold transition-all"
                        >
                          แก้ไข
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal สำหรับแก้ไขข้อมูล */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">แก้ไขผู้ใช้</h2>
              <p className="text-sm font-medium text-slate-500 bg-slate-100 p-3 rounded-xl mb-4 break-all">
                ✉️ {editingUser.email}
              </p>
              
              <div className="space-y-4">
                {/* ✅ ของใหม่: แบบ Dropdown เลือกคณะ */}
                <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">คณะสังกัด</label>
                <select 
                    value={formData.faculty} 
                    onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer bg-white text-slate-800"
                >
                    <option value="">-- กรุณาเลือกคณะ --</option>
                    <option value="เศรษฐศาสตร์">คณะเศรษฐศาสตร์</option>
                    <option value="พาณิชยนาวีนานาชาติ">คณะพาณิชยนาวีนานาชาติ</option>
                    <option value="วิทยาการจัดการ">คณะวิทยาการจัดการ</option>
                    <option value="วิทยาศาสตร์">คณะวิทยาศาสตร์</option>
                    <option value="วิศวกรรมศาสตร์">คณะวิศวกรรมศาสตร์</option>
                </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">บทบาท (Role)</label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="user">User ทั่วไป</option>
                    <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                  </select>
                </div>

                {/* ✅ ส่วนของ Status (ทำเป็น Read-only ทึบๆ ไม่ให้กดแก้) */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-600 mb-2">สถานะระบบ (ดูได้อย่างเดียว)</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 bg-slate-100/70 p-3 rounded-xl border border-slate-200 opacity-70">
                      <input 
                        type="checkbox" 
                        checked={editingUser.isVerified}
                        readOnly
                        className="w-5 h-5 text-emerald-600 rounded cursor-not-allowed"
                      />
                      <label className="font-medium text-slate-500 cursor-not-allowed text-sm">ยืนยันอีเมลแล้ว (Verified)</label>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-100/70 p-3 rounded-xl border border-slate-200 opacity-70">
                      <input 
                        type="checkbox" 
                        checked={editingUser.hasVoted}
                        readOnly
                        className="w-5 h-5 text-emerald-600 rounded cursor-not-allowed"
                      />
                      <label className="font-medium text-slate-500 cursor-not-allowed text-sm">ใช้สิทธิ์โหวตแล้ว (Has Voted)</label>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}