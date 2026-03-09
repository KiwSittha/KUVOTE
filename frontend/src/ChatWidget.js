import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// ✅ เชื่อมต่อไปที่ Backend Port 8000
const socket = io('http://localhost:8000'); 

function ChatWidget({ userEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  
  // ใช้สำหรับเลื่อนหน้าจอแชทลงมาล่างสุดอัตโนมัติ
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // ถ้ายังไม่ได้ล็อกอิน (ไม่มีอีเมล) ให้หยุดทำงาน
    if (!userEmail) return;

    // ✅ 1. ดึงประวัติแชทเก่าจากฐานข้อมูลมาแสดง
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`http://localhost:8000/chat/history/${userEmail}`);
        if (response.ok) {
          const history = await response.json();
          setMessageList(history); // เอาประวัติเก่าใส่ลงไปใน state
        }
      } catch (error) {
        console.error("Fetch chat history error:", error);
      }
    };
    
    fetchChatHistory();

    // ✅ 2. เข้าห้องแชทส่วนตัวด้วยอีเมลตัวเอง
    socket.emit('join_room', userEmail);

    // ✅ 3. ดักรอรับข้อความใหม่แบบ Real-time
    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on('receive_message', handleReceiveMessage);

    // ล้างค่า Socket เมื่อ Component ถูกทำลาย
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [userEmail]);

  // ✅ 4. เลื่อนแชทลงล่างสุดอัตโนมัติเวลามีข้อความใหม่ หรือตอนเปิดหน้าต่างแชท
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList, isOpen]);

  const sendMessage = async () => {
    if (currentMessage.trim() !== '' && userEmail) {
      const messageData = {
        room: userEmail,
        author: 'Voter', // ระบุว่าเป็นผู้ใช้งาน (Voter)
        message: currentMessage,
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      
      await socket.emit('send_message', messageData);
      setCurrentMessage(''); // เคลียร์ช่องพิมพ์
    }
  };

  // ถ้าไม่มี userEmail (ไม่ได้ล็อกอิน) จะไม่แสดงปุ่มแชทเลย
  if (!userEmail) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* ปุ่มเปิด/ปิดแชท */}
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-blue-600 text-white px-5 py-4 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-medium hover:scale-105"
        >
          <span className="text-xl">💬</span> 
          <span>ติดต่อเจ้าหน้าที่</span>
        </button>
      ) : (
        /* หน้าต่างแชท */
        <div className="w-80 sm:w-96 h-[450px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md z-10">
            <div>
              <h3 className="font-bold text-lg">ศูนย์ช่วยเหลือ</h3>
              <p className="text-xs text-blue-200">ยินดีให้คำปรึกษาปัญหาการใช้งาน</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* พื้นที่แสดงข้อความ */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
            {messageList.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-center text-slate-400 text-sm bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  👋 สวัสดีครับ มีอะไรให้เราช่วยเหลือ<br/>พิมพ์ข้อความสอบถามได้เลยครับ
                </p>
              </div>
            ) : (
              messageList.map((msg, index) => (
                <div key={index} className={`flex ${msg.author === 'Voter' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] shadow-sm ${
                    msg.author === 'Voter' 
                      ? 'bg-blue-600 text-white rounded-br-sm' // สีฝั่งผู้ใช้
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm' // สีฝั่งแอดมิน
                  }`}>
                    <p className="text-sm break-words leading-relaxed">{msg.message}</p>
                    <span className={`text-[10px] mt-1 block ${msg.author === 'Voter' ? 'text-blue-200 text-right' : 'text-gray-400 text-left'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))
            )}
            {/* จุดอ้างอิงสำหรับเลื่อนจอลงมาล่างสุด */}
            <div ref={messagesEndRef} />
          </div>

          {/* ช่องพิมพ์ข้อความ */}
          <div className="p-3 border-t bg-white flex items-center gap-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="พิมพ์ข้อความของคุณ..."
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:border-blue-500"
            />
            <button 
              onClick={sendMessage} 
              disabled={!currentMessage.trim()}
              className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;