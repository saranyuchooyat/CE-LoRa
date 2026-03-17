import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";

function ElderlyProfileView({ elderData, onBack }) {
  const [liveVitals, setLiveVitals] = useState(null);
  const reportRef = useRef(null);

  const fetchLiveVitals = async () => {
    if (!elderData?.device_id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:8080/device_data/${elderData.device_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // โครงสร้างข้อมูลที่ Go ส่งมาคือ { info: ..., data: { smartwatch_data: ... } }
      setLiveVitals(res.data.data?.smartwatch_data);
    } catch (err) {
      console.error("Error fetching live vitals:", err);
    }
  };

  // 2. ตั้งเวลาดึงข้อมูลทุก 1 วินาที
  useEffect(() => {
    if (elderData?.device_id) {
      fetchLiveVitals();
      const interval = setInterval(fetchLiveVitals, 1000);
      return () => clearInterval(interval);
    }
  }, [elderData?.device_id]);

  const handleExportPDF = async () => {
    window.print();
  };
  if (!elderData) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-main-green font-bold bg-white px-4 py-2 rounded-lg shadow-sm border transition-all"
            >
              ← ย้อนกลับ
            </button>
          )}
        </div>

        {/* ✨ ปุ่ม Export PDF ✨ */}
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-main-green text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-green-600 transition-all"
        >
          📥 Export เป็น PDF
        </button>
      </div>
      {/* ปุ่มกดย้อนกลับ */}
      <div
        ref={reportRef}
        className="bg-white rounded-xl shadow p-8 border-t-8 border-main-green"
      >
        {/* Header ส่วนชื่อและรหัส */}
        <div className="flex items-center justify-between mb-8 border-b pb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-green-100 text-main-green flex items-center justify-center rounded-full text-4xl font-bold">
              {elderData.first_name?.charAt(0) || "?"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {elderData.first_name} {elderData.last_name}
              </h1>
              <p className="text-lg text-gray-500 mt-2">
                รหัส:{" "}
                <span className="font-semibold text-main-green">
                  {elderData.elder_id}
                </span>{" "}
                | อายุ {elderData.age || "-"} ปี | อุปกรณ์:{" "}
                <span className="font-semibold text-blue-500">
                  {elderData.device_id || "ยังไม่ได้ติดตั้ง"}
                </span>
              </p>
            </div>
          </div>
          {/* สถานะสวมใส่ */}
          {liveVitals && (
            <div
              className={`px-4 py-2 rounded-full font-bold ${liveVitals.is_wearing ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
            >
              {liveVitals.is_wearing ? "⌚ สวมใส่อยู่" : "⭕ ไม่ได้สวมใส่"}
            </div>
          )}
        </div>

        {/* ข้อมูลสุขภาพล่าสุด (ดึงจาก liveVitals ถ้ามี) */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">
              ข้อมูลสุขภาพ Real-time
            </h2>
            <span className="text-xs text-gray-400 animate-pulse">
              ● กำลังดึงข้อมูลสด...
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Heart Rate */}
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-bold">
                Heart Rate
              </p>
              <p className="text-3xl font-black text-red-500 mt-1">
                {liveVitals?.heart_rate || "-"}{" "}
                <span className="text-sm font-normal">bpm</span>
              </p>
            </div>

            {/* SpO2 */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-bold">
                ออกซิเจน (SpO₂)
              </p>
              <p className="text-3xl font-black text-blue-500 mt-1">
                {liveVitals?.spo2 || "-"}{" "}
                <span className="text-sm font-normal">%</span>
              </p>
            </div>

            {/* Temperature */}
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-bold">
                อุณหภูมิร่างกาย
              </p>
              <p className="text-3xl font-black text-orange-500 mt-1">
                {liveVitals?.body_temperature || "-"}{" "}
                <span className="text-sm font-normal">°C</span>
              </p>
            </div>

            {/* Blood Pressure */}
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-bold">
                ความดันโลหิต
              </p>
              <p className="text-2xl font-black text-purple-500 mt-2">
                {liveVitals?.blood_pressure_systolic || "-"}/
                {liveVitals?.blood_pressure_diastolic || "-"}
              </p>
            </div>
          </div>

          {/* ข้อมูลเพิ่มเติม: แบตเตอรี่และการเดิน */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
              <span className="text-gray-600 font-bold">
                🔋 แบตเตอรี่นาฬิกา
              </span>
              <div className="flex items-center gap-3 w-1/2">
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full"
                    style={{ width: `${liveVitals?.device_battery || 0}%` }}
                  ></div>
                </div>
                <span className="font-bold text-sm">
                  {liveVitals?.device_battery || 0}%
                </span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
              <span className="text-gray-600 font-bold">
                👣 จำนวนก้าววันนี้
              </span>
              <span className="font-bold text-lg text-main-green">
                {liveVitals?.steps?.toLocaleString() || 0} ก้าว
              </span>
            </div>
          </div>
        </div>

        {/* ข้อมูลส่วนตัวอื่นๆ */}
        <div>
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            ข้อมูลส่วนตัวและประวัติการรักษา
          </h2>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-gray-500 text-sm">โรคประจำตัว</p>
              <p className="font-semibold bg-gray-50 p-2 rounded">
                {elderData.congenital_disease || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">ยาประจำตัว</p>
              <p className="font-semibold bg-gray-50 p-2 rounded">
                {elderData.personal_medicine || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">ชื่อผู้ติดต่อฉุกเฉิน</p>
              <p className="font-semibold text-red-700 bg-red-50 p-2 rounded">
                {elderData.emergency_contact_name || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">เบอร์โทรติดต่อฉุกเฉิน</p>
              <p className="font-semibold text-red-500 bg-red-50 p-2 rounded">
                {elderData.emergency_contacts || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">ที่อยู่</p>
              <p className="font-semibold bg-gray-50 p-2 rounded">
                {elderData.address || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ElderlyProfileView;
