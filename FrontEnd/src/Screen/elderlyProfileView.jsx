import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../components/api.jsx";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

function ElderlyProfileView({ elderData: propsElderData, onBack }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [elderData, setElderData] = useState(propsElderData || null);
  const [liveVitals, setLiveVitals] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 🟢 เพิ่มสถานะ Loading
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchElderInfo = async () => {
      // ถ้าไม่มี props หรือ id เปลี่ยน ให้โหลดใหม่
      if (id) {
        try {
          setIsLoading(true);
          const res = await api.get(`/elders/${id}`);

          if (res.data) {
            setElderData(res.data);
          }
        } catch (err) {
          console.error("Error fetching elder info:", err);
        } finally {
          setIsLoading(false); // โหลดเสร็จแล้ว (ไม่ว่าจะเจอหรือไม่เจอ)
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchElderInfo();
  }, [id]);

  const fetchLiveVitals = async () => {
    if (!elderData?.device_id) return;
    try {
      const res = await api.get(`/device_data/${elderData.device_id}`);
      const vitals = res.data.data?.smartwatch_data;
      setLiveVitals(vitals);

      console.log("vitals", vitals);

      if (vitals) {
        setHistoryData((prev) => {
          const rawTime = res.data.data?.timestamp;
          const dateObj = rawTime ? new Date(rawTime) : new Date();
          const timeStr = `${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}:${dateObj.getSeconds().toString().padStart(2, "0")}`;

          // ป้องกันการแอดข้อมูลเดิมซ้ำ ถ้ารับข้อมูลที่เวลาเดิมมา
          const uniqueKey = rawTime || timeStr;
          if (
            prev.length > 0 &&
            prev[prev.length - 1].uniqueKey === uniqueKey
          ) {
            return prev;
          }

          const newPoint = {
            uniqueKey,
            time: timeStr,
            hr: vitals.heart_rate || null,
            spo2: vitals.spo2 || null,
            temp: vitals.body_temperature || null,
            sys: vitals.blood_pressure_systolic || null,
            dia: vitals.blood_pressure_diastolic || null,
          };

          const newData = [...prev, newPoint];
          return newData.length > 20
            ? newData.slice(newData.length - 20)
            : newData;
        });
      }
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

  // const handleExportPDF = async () => {
  //   window.print();
  // };

  const chartOptions = {
    chart: { type: "spline", height: 400, animation: Highcharts.svg },
    title: { text: null },
    xAxis: {
      categories: historyData.map((d) => d.time),
    },
    yAxis: [
      {
        title: {
          text: "หัวใจ (BPM), ออกซิเจน (%), ความดัน (mmHg)",
          style: { color: "#4B5563" },
        },
        min: 40,
        max: 200,
        labels: { style: { color: "#4B5563", fontWeight: "bold" } },
      },
      {
        title: { text: "อุณหภูมิ (°C)", style: { color: "#F97316" } },
        min: 30,
        max: 45,
        opposite: true,
        labels: { style: { color: "#F97316", fontWeight: "bold" } },
      },
    ],
    series: [
      {
        name: "อัตราการเต้นหัวใจ",
        data: historyData.map((d) => d.hr),
        yAxis: 0,
        color: "#EF4444",
        tooltip: { valueSuffix: " bpm" },
      },
      {
        name: "ออกซิเจนในเลือด",
        data: historyData.map((d) => d.spo2),
        yAxis: 0,
        color: "#3B82F6",
        tooltip: { valueSuffix: " %" },
      },
      {
        name: "ความดันโลหิต (ตัวบน)",
        data: historyData.map((d) => d.sys),
        yAxis: 0,
        color: "#8B5CF6",
        tooltip: { valueSuffix: " mmHg" },
      },
      {
        name: "ความดันโลหิต (ตัวล่าง)",
        data: historyData.map((d) => d.dia),
        yAxis: 0,
        color: "#A78BFA",
        tooltip: { valueSuffix: " mmHg" },
        dashStyle: "ShortDash",
      },
      {
        name: "อุณหภูมิร่างกาย",
        data: historyData.map((d) => d.temp),
        yAxis: 1,
        color: "#F97316",
        tooltip: { valueSuffix: " °C" },
      },
    ],
    credits: { enabled: false },
    legend: { layout: "horizontal", align: "center", verticalAlign: "bottom" },
    plotOptions: {
      spline: { marker: { radius: 4, enabled: true } },
    },
  };

  // 🟢 1. เช็คสถานะ Loading ก่อน
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <div className="w-12 h-12 border-4 border-main-green border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-widest">กำลังดึงข้อมูลผู้สูงอายุ...</p>
      </div>
    );
  }

  // 🟢 2. ถ้าโหลดเสร็จแล้วแต่ไม่เจอข้อมูล
  if (!elderData) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold text-gray-300">
          ไม่พบข้อมูลผู้สูงอายุรหัส {id}
        </h2>
        {(onBack || id) && (
          <button
            onClick={onBack ? onBack : () => navigate(-1)}
            className="mt-4 text-main-green font-bold underline"
          >
            ย้อนกลับ
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          {(onBack || id) && (
            <button
              onClick={onBack ? onBack : () => navigate(-1)}
              className="return-btn"
            >
              ← ย้อนกลับ
            </button>
          )}
        </div>

        {/* ✨ ปุ่ม Export PDF ✨ */}
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
              {/* {liveVitals.is_wearing ? "⌚ สวมใส่อยู่" : "⭕ ไม่ได้สวมใส่"} */}
              {liveVitals.is_wearing ? "สวมใส่อยู่" : "ไม่ได้สวมใส่"}
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

          {/* ข้อมูลเพิ่มเติม: แบตเตอรี่ การเดิน และการล้ม */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
              <span className="text-gray-600 font-bold">แบตเตอรี่นาฬิกา</span>
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
              <span className="text-gray-600 font-bold">จำนวนก้าววันนี้</span>
              <span className="font-bold text-lg text-main-green">
                {liveVitals?.steps?.toLocaleString() || 0} ก้าว
              </span>
            </div>

            {/* ตรวจจับการล้ม */}
            <div
              className={`p-4 rounded-xl border flex justify-between items-center transition-colors ${liveVitals?.is_fallen ? "bg-red-50 border-red-300 shadow-sm" : "bg-gray-50 border-gray-200"}`}
            >
              <span
                className={`font-bold ${liveVitals?.is_fallen ? "text-red-700" : "text-gray-600"}`}
              >
                การตรวจจับการล้ม
              </span>
              <span
                className={`font-bold text-lg ${liveVitals?.is_fallen ? "text-red-600 animate-pulse" : "text-main-green"}`}
              >
                {/* {liveVitals?.is_fallen ? "⚠️ ตรวจพบการล้ม!" : "ปกติ"} */}
                {liveVitals?.is_fallen ? "ตรวจพบการล้ม!" : "ปกติ"}
              </span>
            </div>
          </div>

          {/* ✅ ส่วนการแสดงผลกราฟแนวโน้มสุขภาพ */}
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-gray-700">
                กราฟแนวโน้มสุขภาพทั้ง 4 ค่า (คลิกที่ป้ายชื่อด้านล่างเพื่อ
                ปิด/เปิด กราฟ)
              </h3>
            </div>
            {historyData.length > 0 ? (
              <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="animate-pulse">
                  กำลังรอรับสัญญาณข้อมูลจาก Smartwatch...
                </p>
              </div>
            )}
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
