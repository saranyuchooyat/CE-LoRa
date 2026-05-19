import { useState, useEffect } from "react";
import api from "../api";

function EmergencyPopup() {
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) return;

    const userData = JSON.parse(storedUser);

    // 💡 ฟังก์ชันดึงข้อมูล Alert
    const fetchHighAlerts = async () => {
      try {
        // 🚨 1. เลือก Endpoint ตามสิทธิ์ (Role)
        // ถ้าเป็น Caregiver ใช้เส้น /my (กรองโซนมาแล้วจากหลังบ้าน)
        // ถ้าเป็นคนอื่น (Admin/Staff) ใช้เส้นรวม /alerts
        let endpoint = "/alerts?status=unread";
        const isCaregiver =
          userData.role === "Zone Staff" && userData.is_caregiver === true;

        if (isCaregiver) {
          endpoint = "/alerts/my?status=unread";
        }

        const response = await api.get(endpoint);

        if (response.data && response.data.length > 0) {
          const validHighAlerts = response.data.filter((alert) => {
            const isHighSeverity = alert.severity?.toLowerCase() === "high";
            const isUnread = alert.status === "unread";
            const notDismissed = !dismissedAlerts.includes(alert._id);

            // 🚨 2. เงื่อนไขการกรองโซน (เฉพาะกรณีที่ไม่ได้ใช้เส้น /my)
            // ถ้าเป็น Caregiver ไม่ต้องกรองโซนหน้าบ้านซ้ำ เพราะ /my กรองมาให้แล้ว
            let isCorrectZone = true;
            if (!isCaregiver && userData.role !== "System Admin") {
              // ถ้าไม่ใช่ Admin และไม่ใช่ Caregiver (เป็น Staff ทั่วไป) อาจจะต้องเช็คโซน
              isCorrectZone = alert.zone === userData.zone;
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
    const intervalId = setInterval(fetchHighAlerts, 5000); // เช็คทุก 5 วินาที

    return () => clearInterval(intervalId);
  }, [dismissedAlerts]);

  const handleAcknowledge = async () => {
    if (!emergencyAlert) return;

    const targetMongoId = emergencyAlert._id;

    // จำไว้ว่าปิดอันนี้ไปแล้วใน session นี้
    setDismissedAlerts((prev) => [...prev, targetMongoId]);
    setEmergencyAlert(null);

    try {
      // ยิงไปเปลี่ยนสถานะเป็นอ่านแล้ว/รับทราบแล้ว
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
            รับทราบและดำเนินการ
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmergencyPopup;
