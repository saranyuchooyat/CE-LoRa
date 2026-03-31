import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";

function EmergencyPopup() {
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  
  const location = useLocation();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    
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

            // 🚨 [อัปเกรดใหม่!] ระบบคัดกรองโซนแยกตาม Role อย่างเด็ดขาด!
            let isCorrectZone = false;

            if (userData.role === "Zone Admin") {
              // ✅ Zone Admin คุมหลายโซน ให้ผ่านไปเลย 
              isCorrectZone = true;
            } else if (isCaregiver) {
              // ✅ Caregiver ใช้ API /my ให้ผ่านไปเลย
              isCorrectZone = true;
            } else if (userData.role === "Zone Staff") {
              // ❌ Zone Staff ทั่วไป ต้องตรวจโซนเท่านั้น!
              const extractZoneId = (z) => {
                if (!z) return "";
                return typeof z === "object" ? String(z._id || z.id || "") : String(z);
              };

              const alertZoneId = extractZoneId(alert.zone || alert.Zone);
              const userZoneId = extractZoneId(userData.zone || userData.Zone);

              if (alertZoneId && userZoneId && alertZoneId === userZoneId) {
                isCorrectZone = true;
              } else {
                isCorrectZone = false; // โซนชาวบ้าน เตะทิ้ง!
              }
            } else {
              // เผื่อ Role อื่นๆ
              isCorrectZone = true; 
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

    fetchHighAlerts();
    const intervalId = setInterval(fetchHighAlerts, 5000);

    return () => clearInterval(intervalId);
    
  }, [dismissedAlerts, location.pathname]); 

  const handleAcknowledge = () => {
    if (!emergencyAlert) return;

    const targetMongoId = emergencyAlert._id;

    setDismissedAlerts((prev) => [...prev, targetMongoId]);
    setEmergencyAlert(null);

    setTimeout(() => {
      setDismissedAlerts((prev) => prev.filter(id => id !== targetMongoId));
    }, 2 * 60 * 1000); 
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