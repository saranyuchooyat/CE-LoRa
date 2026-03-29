import { useState, useEffect } from 'react';
import api from "../api";

function EmergencyPopup() {
    const [emergencyAlert, setEmergencyAlert] = useState(null);
    
    // 🛡️ State ความจำระยะสั้น: จำว่า _id (ObjectID) ไหนที่เราเพิ่งกดปิดไป จะได้ไม่เด้งซ้ำ
    const [dismissedAlerts, setDismissedAlerts] = useState([]);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) return;
        
        const user = JSON.parse(storedUser);
        if (user.role === 'System Admin') return; 

        const fetchHighAlerts = async () => {
            try {
                // 🟢 1. เปลี่ยนมายิง API เส้นใหม่ที่เพื่อน Go ทำไว้ให้ (ดึงเฉพาะ high และ unread)
                const response = await api.get(`/alerts/emergency?severity=high&status=unread&zone_id=${user.zone_id}`);
                
                if (response.data && response.data.length > 0) {
                    // 🛡️ ดักควาย (เผื่อไว้): กรองเอาเฉพาะ Alert ที่ยังไม่เคยโดนกดปิด (ไม่อยู่ในบัญชีดำ)
                    // รอบนี้เราใช้ _id (ของ MongoDB) ในการเช็คชัวร์สุดครับ
                    const validHighAlerts = response.data.filter(alert => 
                        !dismissedAlerts.includes(alert._id)
                    );

                    // ถ้ากรองแล้วยังมีของเหลือ ค่อยเอามาโชว์ตัวแรก
                    if (validHighAlerts.length > 0) {
                        setEmergencyAlert(validHighAlerts[0]); 
                    }
                }
            } catch (error) {
                console.error("Failed to fetch emergency alerts:", error);
            }
        };

        fetchHighAlerts();
        const intervalId = setInterval(fetchHighAlerts, 5000);

        return () => clearInterval(intervalId);
    }, [dismissedAlerts]); 

    const handleAcknowledge = async () => {
        if (!emergencyAlert) return;
        
        // 🟢 2. ดึง _id (ObjectID ยาวๆ ของ MongoDB) มาใช้ เพราะฟังก์ชัน MarkAlertRead ของ Go ต้องการตัวนี้!
        const targetMongoId = emergencyAlert._id; 
        
        // 1. เอา ID นี้ใส่ใน "บัญชีดำ" เพื่อไม่ให้มันเด้งขึ้นมาอีกในเซสชั่นนี้
        setDismissedAlerts(prev => [...prev, targetMongoId]);
        
        // 2. ปิด Popup ทันที (ให้หน้าเว็บลื่นๆ)
        setEmergencyAlert(null); 
        
        try {
            // 3. แอบยิงไปบอก Go ให้เปลี่ยนสถานะเป็น read 
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