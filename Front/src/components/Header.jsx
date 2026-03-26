import { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import api from "./API";

function Header() {

    const [currentUser, setCurrentUser] = useState(null); 
    const location = useLocation(); 
    const navigate = useNavigate();

    // 🟢 ฟังก์ชัน Log out (กดออกเอง)
    const handleLogoutClick = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (token) {
                // ยิง API ไปหา Go เพื่อบอกว่าขอออกจากระบบ
                await api.post('/logout', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error("Logout API Error:", error);
        } finally {
            // ลบ Token และเด้งกลับไปหน้าแรก (Login)
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            navigate(`/`); 
        }
    };

    // 👤 จัดการดึงชื่อ User มาแสดงที่มุมขวาบน
    useEffect(() => {
        console.log("header", location.state)
        if (location.state?.user) {
            setCurrentUser(location.state.user);
        } else {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    if (parsedUser && parsedUser.username) {
                        setCurrentUser(parsedUser.username);
                    }
                } catch (error) {
                    console.error("Failed to parse user from sessionStorage", error);
                }
            }
        }
    }, [location.state]);

    // 💓 ระบบ Heartbeat: ตัวส่งชีพจรไปบอกหลังบ้านทุกๆ 1 นาที
    useEffect(() => {
        const sendHeartbeat = async () => {
            const token = sessionStorage.getItem('token');
            if (token) {
                try {
                    // ยิง API ไปบอก Go ว่า "ฉันยังอยู่นะ!"
                    await api.post('/heartbeat', {}, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    // จารย์สามารถเอาคอมเมนต์บรรทัดล่างออก เพื่อดูใน Console ได้ครับว่ามันยิงจริงมั้ย
                    // console.log("💓 Heartbeat sent!"); 
                } catch (error) {
                    console.error("Heartbeat failed:", error);
                }
            }
        };

        // 1. หน้า Header โหลดปุ๊บ ยิงบอก Go ทันที 1 รอบ
        sendHeartbeat();

        // 2. ตั้งเวลาให้ยิงซ้ำอัตโนมัติ ทุกๆ 1 นาที (60000 มิลลิวินาที)
        const intervalId = setInterval(sendHeartbeat, 60000);

        // 3. Cleanup Function: ถ้า Header โดนทำลาย (เช่น Log out) ให้หยุดส่งชีพจร
        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            <div className="flex items-center justify-between h-[64px] mt-3 mx-5">
                <div className="gap-[8px]">
                    <p className="text-[24px] font-bold text-gray-800">Smart Healthcare System</p>
                </div>
            
                <div className="relative group cursor-pointer inline-block">
                    {/* User Profile Trigger */}
                    <div className="flex items-center gap-2 text-zinc-500 hover:text-black transition-colors py-2">
                        <div className="bg-gray-100 p-2 rounded-full group-hover:bg-gray-200 transition-colors">
                            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                        <span className="text-[18px] font-medium">{currentUser || "User"}</span>
                        
                        <svg className="w-4 h-4 ml-1 text-gray-400 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 origin-top-right transform group-hover:translate-y-0 translate-y-2">
                        <div className="p-2">
                            {/* 🎯 ปุ่มกดเรียก handleLogoutClick */}
                            <button 
                                onClick={handleLogoutClick}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg flex items-center gap-3 transition-colors"
                            >
                                <svg className="w-5 h-5 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2" stroke="currentColor"/>
                                </svg>
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Header;