import { useState, useEffect } from 'react';
import api from "../api";

function EmergencyPopup() {
    const [emergencyAlert, setEmergencyAlert] = useState(null);
    
    // 🛡️ State ความจำระยะสั้น: จำว่า _id (ObjectID) ไหนที่เราเพิ่งกดปิดไป
    const [dismissedAlerts, setDismissedAlerts] = useState([]);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) return;
        
        const user = JSON.parse(storedUser);
        if (user.role === 'System Admin') return; 

        const fetchHighAlerts = async () => {
            try {
                // 📡 ยิงไปขอข้อมูล Alert ทั้งหมดที่ยังไม่ได้อ่าน ของโซนนี้
                // (ถ้าเพื่อนมีเส้น /alerts/emergency ก็ใช้เส้นนั้นได้ แต่ถ้าไม่มีก็ใช้เส้น /alerts ปกติได้เลย)
                const response = await api.get(`/alerts?status=unread`);
                
                if (response.data && response.data.length > 0) {
                    
                    // 🚨 ไฮไลท์อยู่ตรงนี้ครับ! ตัวกรองขั้นเด็ดขาด (ดัก 3 ชั้น)
                    const validHighAlerts = response.data.filter(alert => {
                        // 1. ดัก severity ต้องเป็น "high" เท่านั้น (แปลงเป็นตัวเล็กเผื่อพิมพ์ใหญ่/เล็กมาไม่ตรง)
                        const isHighSeverity = alert.severity?.toLowerCase() === 'high';
                        
                        // 2. ดัก status ต้องเป็น "unread" เท่านั้น
                        const isUnread = alert.status === 'unread';
                        
                        // 3. เช็คว่า _id นี้ยังไม่เคยโดนกดยกเลิกในบัญชีดำ
                        const notDismissed = !dismissedAlerts.includes(alert._id);

                        return isHighSeverity && isUnread && notDismissed;
                    });

                    // ถ้ากรองแล้วเจอ High จริงๆ ค่อยเอามาโชว์ตัวแรก
                    if (validHighAlerts.length > 0) {
                        setEmergencyAlert(validHighAlerts[0]); 
                    } else {
                        // ถ้าเจอแต่ Medium, Low ก็จะไม่เกิดอะไรขึ้น Popup ไม่เด้ง
                        setEmergencyAlert(null);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch alerts:", error);
            }
        };

        fetchHighAlerts();
        const intervalId = setInterval(fetchHighAlerts, 5000);

        return () => clearInterval(intervalId);
    }, [dismissedAlerts]); 

    const handleAcknowledge = async () => {
        if (!emergencyAlert) return;
        
        // ใช้ _id จาก Database เป๊ะๆ
        const targetMongoId = emergencyAlert._id; 
        
        setDismissedAlerts(prev => [...prev, targetMongoId]);
        setEmergencyAlert(null); 
        
        try {
            // ยิงไปเปลี่ยนสถานะ
            await api.put(`/alerts/${targetMongoId}/acknowledge`);
        } catch (error) {
            console.error("Failed to acknowledge alert:", error);
        }
    };

    if (!emergencyAlert) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 transform scale-100 animate-pulse-fast border-t-8 border-red-600">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-red-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {emergencyAlert.title || "แจ้งเตือนฉุกเฉิน!"}
                    </h2>
                    <p className="text-gray-600 mb-6 text-lg">
                        {emergencyAlert.description || "พบเหตุผิดปกติระดับ HIGH กรุณาตรวจสอบทันที"}
                    </p>
                    <button 
                        onClick={handleAcknowledge}
                        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/30 text-lg cursor-pointer"
                    >
                        รับทราบและดำเนินการ
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EmergencyPopup;