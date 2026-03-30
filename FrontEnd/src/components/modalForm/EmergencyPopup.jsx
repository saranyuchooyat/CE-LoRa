import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // 👈 1. เพิ่มตัวจับการเปลี่ยนหน้า
import api from "../api";

function EmergencyPopup() {
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  
  const location = useLocation(); // 👈 2. เรียกใช้งานตัวจับการเปลี่ยนหน้า

  useEffect(() => {
    // 1. ดึงข้อมูล User และเช็คสิทธิ์ก่อนเริ่มงาน
    const storedUser = sessionStorage.getItem("user");
    
    // 💡 ถ้ายืนอยู่หน้า Login มันจะ return ออกไป แต่พอ Login สำเร็จและย้ายหน้า โค้ดชุดนี้จะถูกรันใหม่ทันที!
    if (!storedUser) return;

    const userData = JSON.parse(storedUser);

    if (userData.role === "System Admin") {
      if (emergencyAlert) setEmergencyAlert(null); 
      return; 
    }

    const fetchHighAlerts = async () => {
      try {
        let endpoint = "/alerts?status=unread";
        const isCaregiver = userData.role === "Zone Staff" && userData.is_caregiver === true;

        if (isCaregiver) {
          endpoint = "/alerts/my?status=unread";
        }

        const response = await api.get(endpoint);

        if (response.data && response.data.length > 0) {
          const validHighAlerts = response.data.filter((alert) => {
            const alertSeverity = String(alert.severity || alert.Severity || "").toLowerCase();
            const isHighSeverity = alertSeverity === "high";
            
            const alertStatus = String(alert.status || alert.Status || "").toLowerCase();
            const isUnread = alertStatus === "unread";
            
            const notDismissed = !dismissedAlerts.includes(alert._id);

            let isCorrectZone = true;
            if (!isCaregiver) {
              const alertZone = alert.zone || alert.Zone;
              if (alertZone && userData.zone) {
                isCorrectZone = String(alertZone) === String(userData.zone);
              }
            }

            return isHighSeverity && isUnread && notDismissed && isCorrectZone;
          });

          if (validHighAlerts.length > 0) {
            setEmergencyAlert(validHighAlerts[0]);
          } else {
            setEmergencyAlert(null);
          }
        } else {
          setEmergencyAlert(null);
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      }
    };

    // เริ่มทำงานทันที และตั้งเวลาเช็คทุก 5 วินาที
    fetchHighAlerts();
    const intervalId = setInterval(fetchHighAlerts, 5000);

    // Cleanup
    return () => clearInterval(intervalId);
    
  // 👈 3. จุดสำคัญ! เพิ่ม location.pathname เข้าไปในวงเล็บนี้
  // เพื่อสั่งว่า "ถ้า URL เปลี่ยน (ล็อกอินเสร็จ) ให้รัน useEffect นี้ใหม่นะเว้ย!"
  }, [dismissedAlerts, location.pathname]); 

  // 🚨 ฟังก์ชันกดรับทราบ (Snooze 5 นาที)
  const handleAcknowledge = () => {
    if (!emergencyAlert) return;

    const targetMongoId = emergencyAlert._id;

    setDismissedAlerts((prev) => [...prev, targetMongoId]);
    setEmergencyAlert(null);

    setTimeout(() => {
      setDismissedAlerts((prev) => prev.filter(id => id !== targetMongoId));
    }, 5 * 60 * 1000); 
  };

  if (!emergencyAlert) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 transform scale-100 animate-pulse-fast border-t-8 border-red-600">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-red-600 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {emergencyAlert.title || "แจ้งเตือนฉุกเฉิน!"}
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            {emergencyAlert.description ||
              emergencyAlert.message ||
              "พบเหตุผิดปกติระดับ HIGH กรุณาตรวจสอบทันที"}
          </p>
          <button
            onClick={handleAcknowledge}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/30 text-lg cursor-pointer"
          >
            รับทราบ (ปิดชั่วคราว)
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmergencyPopup;