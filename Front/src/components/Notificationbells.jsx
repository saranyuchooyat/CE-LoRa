import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "./API";

function NotificationBell() {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      console.log("User Data:", storedUser);

      let endpoint = "/alerts";
      if (
        storedUser?.role === "Zone Staff" &&
        storedUser?.is_caregiver === true
      ) {
        endpoint = "/alerts/my";
      }

      const res = await api.get(endpoint);
      if (Array.isArray(res.data)) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // 2. กรองเฉพาะอันที่ "ยังไม่อ่าน" เพื่อโชว์เลข Badge และใน Popover
  const unreadList = alerts.filter((a) => a.status === "unread");
  const unreadCount = unreadList.length;

  // 3. ปิด Popover เมื่อคลิกที่อื่น
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleMarkAsRead = async (id, alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.alert_id === alertId ? { ...a, status: "read" } : a)),
    );

    try {
      await api.put(`/alerts/${id}/read`);
      fetchData();
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };
  return (
    <div className="relative ml-4" ref={dropdownRef}>
      {/* 🔔 ปุ่มกระดิ่ง */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all border-none outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-600"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {/* 🔴 ตัวเลข Badge (ถ้ามี unread จะโชว์) */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-red-600 rounded-full border-2 border-white shadow-sm transform translate-x-1 -translate-y-0.5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* 📋 Popover รายการด่วน (สไตล์ Facebook) */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <span className="font-bold text-xs text-gray-700">
              แจ้งเหตุใหม่
            </span>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                {unreadCount} รายการ
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {unreadCount > 0 ? (
              unreadList.map((item) => (
                <div
                  key={item._id}
                  onClick={async () => {
                    await handleMarkAsRead(item._id, item.alert_id);
                    navigate(`/eldery-monitoring/${item.elder_id}`);
                    setIsOpen(false);
                  }}
                  className="p-3 border-b border-gray-50 hover:bg-red-50 cursor-pointer transition-colors flex gap-3 group"
                >
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate group-hover:text-red-600 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-gray-500 line-clamp-1">
                      {item.description}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">
                      {new Date(item.created_at).toLocaleTimeString("th-TH")} น.
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-400 text-xs font-medium">
                ไม่มีเคสใหม่ที่ยังค้างอยู่
              </div>
            )}
          </div>

          <button
            onClick={() => {
              navigate("/my-alerts");
              setIsOpen(false);
            }}
            className="w-full py-3 text-xs font-bold text-blue-600 hover:bg-gray-50 transition-colors border-t border-gray-50"
          >
            จัดการรายการทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
