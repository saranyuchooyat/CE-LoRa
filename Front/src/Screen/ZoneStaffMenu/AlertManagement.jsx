import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard2 from "../../components/MainCardOption/MenuNameCard2";
import Cardno2 from "../../components/Card/Cardno2";

function AlertManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  // 1. ดึงข้อมูล Zone
  const zoneQueries = useQueries({
    queries: [
      {
        queryKey: ["zoneData"],
        queryFn: () => api.get(`/zones/my-zones`).then((res) => res.data),
      },
    ],
  });

  const zoneData = zoneQueries[0].data || [];
  const currentZoneId = zoneData[0]?.zone_id || null;

  // 2. ดึงข้อมูล Dashboard (Alerts อยู่ในนี้)
  const dashboardQueries = useQueries({
    queries: [
      {
        queryKey: ["zoneDashboardData", currentZoneId],
        queryFn: () =>
          api.get(`/zones/${currentZoneId}/dashboard`).then((res) => res.data),
        enabled: !!currentZoneId,
      },
    ],
  });

  const zoneDashboardData = dashboardQueries[0].data || {};
  const isDashLoading = dashboardQueries[0].isLoading;
  const alerts = zoneDashboardData.alerts || [];

  // 3. กรองข้อมูล Alert
  const filteredAlerts = useMemo(() => {
    if (!Array.isArray(alerts)) return [];
    return showCriticalOnly
      ? alerts.filter((a) => a.type === "critical" || a.severity === "high")
      : alerts;
  }, [alerts, showCriticalOnly]);

  // 4. เตรียมข้อมูล Card สรุป (นับจำนวน)
  const summaryCards = [
    {
      name: "ฉุกเฉิน (Critical)",
      value: isDashLoading
        ? "..."
        : `${alerts.filter((a) => a.type === "critical" || a.severity === "high").length} รายการ`,
      color: "text-red-600",
    },
    {
      name: "เฝ้าระวัง (Warning)",
      value: isDashLoading
        ? "..."
        : `${alerts.filter((a) => a.type === "warning" || a.severity === "medium").length} รายการ`,
      color: "text-orange-500",
    },
    {
      name: "ปกติ/ข้อมูล",
      value: isDashLoading
        ? "..."
        : `${alerts.filter((a) => a.type === "data" || a.severity === "low").length} รายการ`,
      color: "text-blue-500",
    },
  ];

  // ฟังก์ชันเมื่อกดที่ Alert
  const handleAlertClick = (alert) => {
    // วาร์ปไปหน้าผู้สูงอายุทันที
    if (alert.elder_id) {
      navigate(`/eldery-monitoring/${alert.elder_id}`);
    }
  };

  if (zoneQueries[0].isLoading)
    return (
      <div className="p-10 text-center font-bold">กำลังโหลดข้อมูลโซน...</div>
    );

  return (
    <div className="mx-5 mb-10">
      {/* Header ส่วนหัว */}
      <MenuNameCard2
        title="จัดการการแจ้งเตือน"
        description={
          zoneData[0]
            ? `${zoneData[0].zone_name} : ${zoneData[0].address}`
            : "ไม่พบข้อมูลพื้นที่"
        }
        buttonText={showCriticalOnly ? "แสดงทั้งหมด" : "ดูเฉพาะรายการฉุกเฉิน"}
        onButtonClick={() => setShowCriticalOnly((v) => !v)}
      />

      {/* ส่วน Card สรุปจำนวน */}
      <div className="mt-4">
        <Cardno2 data={summaryCards} />
      </div>

      {/* รายการ Alert (แบบแจ่มๆ) */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          📋 รายการแจ้งเตือน
          {showCriticalOnly && (
            <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
              เฉพาะฉุกเฉิน
            </span>
          )}
        </h2>

        <div className="grid gap-4">
          {isDashLoading ? (
            <div className="text-center p-10 bg-gray-50 rounded-xl">
              กำลังโหลดรายการ...
            </div>
          ) : filteredAlerts.length > 0 ? (
            filteredAlerts.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => handleAlertClick(item)}
                className={`flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border-l-[6px] cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md ${
                  item.type === "critical" || item.severity === "high"
                    ? "border-l-red-500"
                    : item.type === "warning" || item.severity === "medium"
                      ? "border-l-orange-400"
                      : "border-l-blue-400"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {item.alert_id || `A${index + 1}`}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        item.type === "critical" || item.severity === "high"
                          ? "bg-red-100 text-red-600"
                          : "text-gray-500 bg-gray-100"
                      }`}
                    >
                      {item.type || "Alert"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-400 font-medium">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString("th-TH")
                      : "ไม่ระบุเวลา"}
                  </span>
                  <button className="text-main-green font-bold text-sm hover:underline">
                    ไปที่หน้าข้อมูลคนไข้ →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">
                ไม่พบรายการแจ้งเตือนในขณะนี้
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertManagement;
