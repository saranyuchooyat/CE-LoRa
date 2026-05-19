import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function DeviceDetail() {
  const { device_id } = useParams();
  console.log("device ID:", device_id);
  const [deviceData, setDeviceData] = useState(null);
  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:8080/device_data/${device_id}`,
        {
          headers: { Authorization: `Bearer ${token}` }, // แนบไปด้วย!
        },
      );
      setDeviceData(res.data); // ข้อมูลประกอบด้วย { info: {...}, data: {...} }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000); // ดึงข้อมูลใหม่ทุก 3 วินาที
    return () => clearInterval(interval); // ล้างหน่วยความจำเมื่อออกจากหน้า
  }, [device_id]);

  if (!deviceData)
    return <div className="p-10 text-center">กำลังเชื่อมต่อฐานข้อมูล...</div>;

  const { info, data } = deviceData;
  const sw = data?.smartwatch_data; // ตัวแปรย่อสำหรับเรียกง่ายๆ

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header ส่วนเดิมของพี่ */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {info.device_name}
          </h1>
          <p className="text-slate-500 text-lg">
            รหัสอุปกรณ์: {device_id} | รุ่น: {info.model}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`px-4 py-1 rounded-full text-sm font-medium ${sw?.is_wearing == true ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
          >
            {/* {sw?.is_wearing === "Worn" ? "⌚ สวมใส่อยู่" : "⭕ ไม่ได้สวมใส่"} */}
            {sw?.is_wearing == true ? "สวมใส่อยู่" : "ไม่ได้สวมใส่"}
          </span>
        </div>
      </div>

      {!data ? (
        <div className="bg-amber-50 p-6 rounded-2xl text-amber-700">
          {/* ⚠️ ยังไม่มีสัญญาณข้อมูล */}
          ยังไม่มีสัญญาณข้อมูล
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: ข้อมูลวิกฤต (Critical Stats) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Heart Rate */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-red-500">
              <p className="text-slate-400 font-medium">Heart Rate</p>
              <div className="flex items-baseline gap-2 mt-2 text-red-500">
                <span className="text-5xl font-black">
                  {sw?.heart_rate || 0}
                </span>
                <span className="text-lg">bpm</span>
              </div>
            </div>

            {/* SpO2 - ออกซิเจนในเลือด */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-blue-500">
              <p className="text-slate-400 font-medium">
                SpO2 (ออกซิเจนในเลือด)
              </p>
              <div className="flex items-baseline gap-2 mt-2 text-blue-600">
                <span className="text-5xl font-black">{sw?.spo2 || 0}</span>
                <span className="text-lg">%</span>
              </div>
            </div>

            {/* แจ้งเตือนการล้ม / SOS */}
            <div
              className={`p-6 rounded-3xl shadow-sm border-t-4 transition-all duration-500 ${
                sw?.is_fallen || sw?.is_sos_called === 1
                  ? "bg-red-50 border-red-600"
                  : "bg-white border-emerald-500"
              }`}
            >
              <p className="text-slate-400 font-medium text-sm uppercase tracking-wider">
                สถานะความปลอดภัย
              </p>
              <div className="mt-4">
                {/* 1. เช็คเคส SOS ก่อน (สำคัญสุด) */}
                {sw?.is_sos_called === 1 ? (
                  <div className="flex items-center gap-2 text-red-600 animate-pulse">
                    {/* <span className="text-3xl font-black">🆘 SOS!</span> */}
                    <span className="text-3xl font-black">SOS!</span>
                  </div>
                ) : /* 2. เช็คเคสล้ม */
                sw?.is_fallen ? (
                  <div className="flex items-center gap-2 text-red-600 animate-bounce">
                    {/* <span className="text-3xl font-black">🚨 ล้ม!</span> */}
                    <span className="text-3xl font-black">ล้ม!</span>
                  </div>
                ) : (
                  /* 3. ถ้าไม่เข้าทั้งสองอย่าง คือปกติ */
                  <div className="flex items-center gap-2 text-emerald-500">
                    {/* <span className="text-2xl font-bold">✅ ปกติ</span> */}
                    <span className="text-2xl font-bold">ปกติ</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: ดัชนีสุขภาพรอง (Medical Info) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Blood Pressure */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <p className="text-slate-400 text-sm font-medium">ความดันโลหิต</p>
              <p className="text-2xl font-bold text-slate-700 mt-1">
                {sw?.blood_pressure_systolic}/{sw?.blood_pressure_diastolic}{" "}
                <span className="text-sm font-normal text-slate-400">mmHg</span>
              </p>
            </div>

            {/* Body Temp */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <p className="text-slate-400 text-sm font-medium">
                อุณหภูมิร่างกาย
              </p>
              <p className="text-2xl font-bold text-slate-700 mt-1">
                {sw?.body_temperature}°C
              </p>
            </div>

            {/* HRV */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <p className="text-slate-400 text-sm font-medium">
                HRV (การแปรผันหัวใจ)
              </p>
              <p className="text-2xl font-bold text-slate-700 mt-1">
                {sw?.heart_rate_variability}{" "}
                <span className="text-sm font-normal text-slate-400">ms</span>
              </p>
            </div>

            {/* Stress Level */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <p className="text-slate-400 text-sm font-medium">ความเครียด</p>
              <p className="text-2xl font-bold text-orange-500 mt-1">
                {sw?.stress_level}{" "}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </p>
            </div>
          </div>

          {/* Row 3: Activity & Battery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm flex justify-between items-center">
              <div>
                <p className="text-slate-400 font-medium">การเดินวันนี้</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {sw?.steps.toLocaleString()} ก้าว
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm font-medium">
                  ระดับกิจกรรม
                </p>
                <p className="text-lg font-semibold text-slate-700">
                  Level {sw?.activity_level}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm">
              <div className="flex justify-between mb-2">
                <p className="text-slate-400 font-medium">แบตเตอรี่</p>
                <p className="font-bold">{sw?.device_battery}%</p>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${sw?.device_battery < 20 ? "bg-red-500" : "bg-emerald-400"}`}
                  style={{ width: `${sw?.device_battery}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Location & Time Footer */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm mb-2 uppercase">
                พิกัดล่าสุด
              </h3>
              <p className="text-slate-500 font-mono text-sm">
                Lat: {data.location?.latitude} , Long:{" "}
                {data.location?.longitude}
              </p>
            </div>
            <div className="bg-slate-800 text-white p-5 rounded-2xl shadow-sm flex items-center">
              <p className="text-xs uppercase opacity-60 mr-4">Last Sync</p>
              <p className="text-lg font-mono tracking-tighter">
                {new Date(data.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeviceDetail;
