import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../API"; 
import MenuNameCard from "../MainCardOption/MenuNameCard";
import SummaryCard from "./SummaryCard";

// ✅ 1. อย่าลืมรับ props `eldersData` ที่ส่งมาจากหน้าหลักด้วยนะครับ
function ZoneSummaryReportView({ zoneId, zoneName, eldersData, onBack }) {
    const [timeFilter, setTimeFilter] = useState("1m");
    
    // ✅ 2. State สำหรับจำว่าผู้ใช้ติ๊กเลือกแนบรายชื่อผู้สูงอายุหรือเปล่า
    const [includeElders, setIncludeElders] = useState(false);

    const { data: reportData, isLoading, isError, error } = useQuery({
        queryKey: ["zoneSummaryReport", zoneId, timeFilter],
        queryFn: async () => {
            const token = sessionStorage.getItem('token');
            const res = await api.get(`/zones/${zoneId}/summary?filter=${timeFilter}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            return res.data;
        },
        retry: false, 
    });

    if (isError) {
        console.error("Report Fetch Error:", error);
    }

    const handleExportCSV = () => {
        if (!reportData) return;

        // เตรียมหัวตาราง
        const headers = ["หมวดหมู่", "รายการ", "จำนวน/รายละเอียด"];

        // ข้อมูลส่วนที่ 1: สรุปตัวเลข
        const rows = [
            ["การแจ้งเตือน (Alerts)", "Critical (ฉุกเฉิน)", reportData.alerts_summary.critical],
            ["การแจ้งเตือน (Alerts)", "Warning (เตือนภัย)", reportData.alerts_summary.warning],
            ["การแจ้งเตือน (Alerts)", "Normal (ปกติ)", reportData.alerts_summary.normal],
            ["จำนวนคน (People)", "ผู้สูงอายุทั้งหมด", reportData.total_elders],
            ["จำนวนคน (People)", "ผู้ดูแล Zone Staff", reportData.total_staff],
            ["อุปกรณ์ (Devices)", "ออนไลน์ (Online)", reportData.device_status.online],
            ["อุปกรณ์ (Devices)", "ออฟไลน์ (Offline)", reportData.device_status.offline]
        ];

        // ✅ ข้อมูลส่วนที่ 2: ถ้ายืนยันจะเอาผู้สูงอายุด้วย ให้จับยัดต่อท้ายเลย
        if (includeElders && eldersData && eldersData.length > 0) {
            rows.push(["", "", ""]); // เว้นบรรทัดให้ดูสวยงาม
            rows.push(["--- รายละเอียด ---", "รหัส (ID)", "ชื่อ-นามสกุล"]); // หัวตารางย่อย
            eldersData.forEach(elder => {
                rows.push(["ผู้สูงอายุในพื้นที่", elder.elder_id, `${elder.first_name} ${elder.last_name}`]);
            });
        }

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const bom = "\uFEFF"; // กันภาษาไทยเพี้ยนใน Excel
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Report_Zone_${zoneId}_${timeFilter}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
             <div className="mx-5">
            {/* ปุ่ม Back แยกออกมาด้านบนสุด */}
            <div className="mt-2 mb-4">
                <button 
                    onClick={onBack} 
                    className="return-btn"
                >
                    ← กลับไปหน้า Dashboard
                </button>
            </div>

            {/* MenuNameCard ครอบคลุม Section หัวข้อและกลุ่มปุ่มกรอง/Export */}
            <div className="mb-6">
                <MenuNameCard
                    title="Zone Summary Report"
                    description={
                        <span>
                            รายงานสรุปภาพรวมพื้นที่: <span>{zoneName || zoneId}</span>
                        </span>
                    }
                    detail={false}
                >
                    <div className="flex flex-wrap items-center gap-4">
                        {/* กรอบรวมตัวกรองและตั้งค่ารายชื่อให้เป็นหมวดหมู่เดียวกันและเล็กลง */}
                        <div className="flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 gap-3">
                            {/* เลือกช่วงเวลา */}
                            <div className="flex items-center">
                                <label className="text-xs font-bold text-gray-700 mr-2">ช่วงเวลา:</label>
                                <select 
                                    value={timeFilter}
                                    onChange={(e) => setTimeFilter(e.target.value)}
                                    className="border-none bg-gray-50 text-gray-700 text-xs font-semibold py-1 px-2 rounded focus:ring-0 cursor-pointer"
                                >
                                    <option value="1m">1 เดือน (30 Days)</option>
                                    <option value="3m">3 เดือน (90 Days)</option>
                                    <option value="6m">6 เดือน (180 Days)</option>
                                    <option value="all">ทั้งหมด (All Time)</option>
                                </select>
                            </div>

                            <div className="w-px h-5 bg-gray-200"></div>

                            {/* Checkbox เลือกแนบรายชื่อ */}
                            <label className="flex items-center text-xs text-gray-600 cursor-pointer hover:text-teal-700 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={includeElders} 
                                    onChange={(e) => setIncludeElders(e.target.checked)} 
                                    className="mr-1.5 w-3.5 h-3.5 cursor-pointer accent-green-600"
                                />
                                <span className="pt-0.5">แนบรายชื่อผู้สูงอายุ</span>
                            </label>
                        </div>

                        {/* ✅ ปุ่ม Export ให้เป็นปุ่มหลักเด่นๆ */}
                        <button 
                            onClick={handleExportCSV}
                            disabled={isLoading || isError || !reportData}
                            className="add-btn py-2.5 px-6 rounded-lg shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                            
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export CSV
                        </button>
                    </div>
                </MenuNameCard>
            </div>

            {isLoading && <div className="text-center py-20 text-xl font-bold text-teal-600">กำลังประมวลผลข้อมูล...</div>}
            
            {isError && (
                <div className="text-center py-20">
                    <div className="text-2xl font-bold text-red-500 mb-2">เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน</div>
                    <div className="text-gray-500">{error?.response?.data?.error || error?.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้"}</div>
                </div>
            )}

            {!isLoading && !isError && reportData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* (โค้ด Card ส่วนตัวเลขสรุปเดิมยังคงอยู่ครบถ้วน) */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4">
                        <SummaryCard 
                            data={[
                                { name: "Critical (ฉุกเฉิน)", value: reportData.alerts_summary.critical },
                                { name: "Warning (เตือนภัย)", value: reportData.alerts_summary.warning },
                                { name: "Normal (ปกติ)", value: reportData.alerts_summary.normal }
                            ]}
                        />
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center border border-gray-100">
                        <div className="text-gray-500 font-bold mb-2">จำนวนผู้สูงอายุ</div>
                        <div className="text-5xl font-black text-teal-700">{reportData.total_elders}</div>
                        <div className="text-sm text-gray-400 mt-2">คนในโซนนี้</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center border border-gray-100">
                        <div className="text-gray-500 font-bold mb-2">จำนวน Zone Staff</div>
                        <div className="text-5xl font-black text-blue-600">{reportData.total_staff}</div>
                        <div className="text-sm text-gray-400 mt-2">ผู้ดูแลในโซนนี้</div>
                    </div>

                    <div className="col-span-1 md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">สถานะอุปกรณ์ (Smartwatch)</h2>
                        <div className="flex justify-around items-center h-full pb-4">
                            <div className="text-center">
                                <div className="w-4 h-4 rounded-full bg-green-500 mx-auto mb-2 shadow-sm"></div>
                                <div className="text-3xl font-black text-gray-700">{reportData.device_status.online}</div>
                                <div className="text-sm font-bold text-green-600">Online</div>
                            </div>
                            <div className="w-px h-16 bg-gray-200"></div>
                            <div className="text-center">
                                <div className="w-4 h-4 rounded-full bg-gray-300 mx-auto mb-2 shadow-sm"></div>
                                <div className="text-3xl font-black text-gray-700">{reportData.device_status.offline}</div>
                                <div className="text-sm font-bold text-gray-500">Offline</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
       
    );
}

export default ZoneSummaryReportView;