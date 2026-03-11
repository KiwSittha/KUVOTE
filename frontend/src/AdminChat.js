import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Layout from './components/Layout'; 

const socket = io('http://localhost:8000');

export default function AdminChat() {
  const [userList, setUserList] = useState([]); 
  const [activeUser, setActiveUser] = useState(null); 
  const [messageList, setMessageList] = useState([]); 
  const [currentMessage, setCurrentMessage] = useState('');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8000/chat/users');
        if (response.ok) {
          const users = await response.json();
          setUserList(users);
        }
      } catch (error) {
        console.error("Fetch users error:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!activeUser) return;

    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:8000/chat/history/${activeUser}`);
        if (response.ok) {
          const history = await response.json();
          setMessageList(history);
        }
      } catch (error) {
        console.error("Fetch history error:", error);
      }
    };
    fetchHistory();

    socket.emit('join_room', activeUser);

    const handleReceiveMessage = (data) => {
      if (data.room === activeUser) {
        setMessageList((list) => [...list, data]);
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const sendMessage = async () => {
    if (currentMessage.trim() !== '' && activeUser) {
      const messageData = {
        room: activeUser,     
        author: 'Admin',      
        message: currentMessage,
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      
      await socket.emit('send_message', messageData);
      setCurrentMessage('');
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-80px)] w-full p-2 md:p-6 bg-slate-100 flex items-center justify-center">
        
        <div className="flex h-full w-full  bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
          
          {/* ================= ฝั่งซ้าย: รายชื่อคนแชท ================= */}
          <div className="w-1/3 max-w-sm border-r border-slate-200 bg-white flex flex-col z-10">
            <div className="p-5 bg-white border-b border-slate-100 flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                  <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                {/* ✅ ปรับขนาด Header ฝั่งซ้ายให้ใหญ่ขึ้น */}
                <h2 className="font-bold text-slate-800 text-xl">กล่องข้อความ</h2>
                <p className="text-sm text-slate-500">จัดการคำถามจากผู้ใช้งาน</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {userList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <p className="text-base">ยังไม่มีข้อความเข้า</p>
                </div>
              ) : (
                userList.map((email, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveUser(email)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all border ${
                      activeUser === email 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-10 before:bg-emerald-500 before:rounded-r-md" 
                        : "bg-transparent border-transparent hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${activeUser === email ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {email.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left overflow-hidden">
                      {/* ✅ ปรับขนาดชื่ออีเมลในลิสต์ให้ใหญ่ขึ้น */}
                      <div className="font-bold text-base truncate">{email}</div>
                      <div className="text-sm text-slate-500 mt-1 truncate">แตะเพื่อดูข้อความสนทนา</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ================= ฝั่งขวา: หน้าต่างแชท ================= */}
          <div className="flex-1 flex flex-col bg-slate-50 relative">
            {!activeUser ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                <div className="w-28 h-28 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                  <span className="text-5xl">👋</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-600">ยินดีต้อนรับสู่ระบบตอบแชท</h3>
                <p className="text-base mt-2">เลือกลูกค้าจากรายชื่อด้านซ้ายเพื่อเริ่มสนทนา</p>
              </div>
            ) : (
              <>
                {/* Header ของแชท */}
                <div className="h-[80px] bg-white border-b border-slate-200 flex items-center px-8 shadow-sm z-10 shrink-0">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl mr-4">
                    {activeUser.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    {/* ✅ ปรับขนาดชื่อคนคุยด้านบนให้ใหญ่ขึ้น */}
                    <div className="font-bold text-lg text-slate-800">{activeUser}</div>
                    <div className="text-sm text-emerald-500 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      กำลังสนทนา
                    </div>
                  </div>
                </div>

                {/* พื้นที่ข้อความ */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col gap-6">
                  {messageList.length === 0 ? (
                    <div className="text-center text-slate-400 text-base mt-10">
                      เริ่มต้นการสนทนากับ {activeUser}
                    </div>
                  ) : null}

                  {messageList.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.author === 'Admin' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-6 py-4 max-w-[75%] shadow-sm ${
                        msg.author === 'Admin' 
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl rounded-tr-sm' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'
                      }`}>
                        {/* ✅ ปรับขนาดข้อความแชทให้เป็น text-lg (ใหญ่ขึ้นชัดเจน) */}
                        <p className="text-lg leading-relaxed break-words">{msg.message}</p>
                      </div>
                      {/* ✅ ปรับขนาดเวลาใต้ข้อความให้ใหญ่ขึ้น (text-xs หรือ text-sm) */}
                      <span className="text-sm text-slate-400 mt-1.5 mx-2">
                        {msg.time} • {msg.author === 'Admin' ? 'คุณ (แอดมิน)' : 'ผู้ใช้งาน'}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* ช่องพิมพ์ข้อความฝั่ง Admin */}
                <div className="p-5 bg-white border-t border-slate-200">
                  <div className="flex items-center gap-4 max-w-4xl mx-auto bg-slate-100 p-2 rounded-full border border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                    {/* ✅ ปรับขนาดตัวหนังสือในช่องพิมพ์ข้อความ (text-base md:text-lg) */}
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={`พิมพ์ข้อความถึง ${activeUser}...`}
                      className="flex-1 bg-transparent px-5 py-3 text-base md:text-lg outline-none text-slate-700 placeholder-slate-400"
                    />
                    {/* ✅ ปรับขนาดปุ่มส่งให้ใหญ่ขึ้นรับกับช่องแชท */}
                    <button 
                      onClick={sendMessage} 
                      disabled={!currentMessage.trim()}
                      className="bg-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-emerald-700 disabled:bg-slate-300 transition-all shadow-md shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-0.5">
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}