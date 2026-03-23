import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../components/API";
import ApiDelete from "../API-Delete";
import { showConfirm, showPopup } from "../../components/Popup";

function ElderlyRow({ card, index, onRowClick, handleEditClick, handleSettingClick, handleDeleteClick, isPending, showActions, getStatusStyle, calculateStatus }) {
    const isOddRow = (index % 2 === 0);
    const rowBgClass = isOddRow ? 'bg-gray-100' : 'bg-gray-50';
    
    // ดึงข้อมูล Realtime 
    const { data: deviceResponse } = useQuery({
        queryKey: ['deviceData', card.device_id],
        queryFn: () => api.get(`/device_data/${card.device_id}`).then(res => res.data),
        enabled: !!card.device_id,
        refetchInterval: 10000 // Refresh ทุกๆ 10 วิ
    });

    const liveVitals = deviceResponse?.data?.smartwatch_data || card.vitals;
    const lastUpdatedTime = deviceResponse?.data?.updated_at || card.last_updated || "-";
    
    // ✅ 1. คำนวณสถานะสดๆ จากข้อมูล Vitals ปัจจุบัน (ฉลาดกว่ารอค่าจาก DB)
    const currentStatus = calculateStatus(liveVitals, card.health_status);
    
    // ✅ 2. ดึงสไตล์สีมาใส่ให้ตรงกับสถานะ
    const statusClass = getStatusStyle(currentStatus);                             
    
    return(
        <tr 
            className={`${rowBgClass} cursor-pointer hover:bg-green-100 transition-colors duration-200`}
            onClick={() => {
                if (onRowClick) onRowClick(card);
            }}
        >
            <td className="table-data whitespace-nowrap text-center text-gray-600 font-medium">{index + 1}</td>
            <td className="table-data whitespace-nowrap">{card.elder_id}</td>
            <td className="table-data whitespace-nowrap">{card.first_name} {card.last_name}</td>
            <td className="table-data whitespace-nowrap">{card.age}</td>
            <td className="table-data whitespace-nowrap">
                <div className="flex flex-col items-start gap-1">
                    <span>อัตราการเต้นหัวใจ: <b>{liveVitals?.heart_rate ?? "-"}</b></span>
                    <span>ความดันโลหิต: <b>{liveVitals?.blood_pressure_systolic ? `${liveVitals.blood_pressure_systolic}/${liveVitals.blood_pressure_diastolic}` : (card.vitals?.blood_pressure ?? "-")}</b></span>
                    <span>SpO₂: <b>{liveVitals?.spo2 ?? "-"}</b></span>
                    <span>อุณหภูมิ: <b>{liveVitals?.body_temperature ?? card.vitals?.temperature ?? "-"}</b></span>
                </div>
            </td>
            <td className="table-data whitespace-nowrap">
                {/* ✅ 3. แสดงชื่อสถานะที่คำนวณมาแล้วแบบเป็นตัวพิมพ์ใหญ่ให้ดูสวยๆ */}
                <span className={`table-status ${statusClass}`}>
                    {currentStatus.toUpperCase()}
                </span>
            </td>
            <td className="table-data whitespace-nowrap">{liveVitals?.device_battery ?? card.vitals?.device_battery ?? "-"}</td>
            <td className="table-data whitespace-nowrap">{lastUpdatedTime}</td>

            {showActions && (
            <td className="p-3 text-sm text-left whitespace-nowrap w-fit">
                <button className="table-btn hover:bg-main-yellow hover:text-white"
                        onClick={(event) => handleEditClick(card, event)}>
                    แก้ไข</button>
                <button className="table-btn hover:bg-green-500 hover:text-white"
                        onClick={(event) => handleSettingClick(card.elder_id, event)}>
                    ตั้งค่า</button>
                <button className="table-btn hover:bg-main-red hover:text-white"
                        onClick={(event) => handleDeleteClick(card.elder_id, event)}
                        disabled={isPending} >
                    {isPending ? 'ลบ...' : 'ลบ'}</button>
            </td>
            )}
        </tr>
    );
}

function ElderlyDataTable({ data, onEdit, onSetting, onDeleteSuccess, onRowClick, showActions = true }) {
    
    // ✅ 4. ฟังก์ชันหมอจำลอง: วิเคราะห์อาการจากตัวเลข
    const calculateStatus = (vitals, dbStatus) => {
        if (!vitals) return dbStatus || 'NORMAL'; // ถ้าไม่มีข้อมูลสุขภาพ ให้ยึดจาก DB หรือเซ็ต Normal 

        const hr = vitals.heart_rate || 0;
        const spo2 = vitals.spo2 || 100;
        const isFallen = vitals.is_fallen === true;
        const isSos = vitals.is_sos_called === true;

        // ถ้าล้ม หรือกด SOS หรือหัวใจหยุดเต้น (แต่นาฬิกายังใส่ยู่) = CRITICAL ทันที
        if (isFallen || isSos || (hr > 0 && hr < 40)) {
            return 'CRITICAL';
        }
        
        // ถ้าหัวใจเต้นเร็ว/ช้าผิดปกติ หรือออกซิเจนตก = WARNING
        if (hr > 120 || (hr < 50 && hr > 0) || (spo2 < 95 && spo2 > 0)) {
            return 'WARNING';
        }

        // ถ้าค่าปกติทั้งหมด
        return 'NORMAL';
    };

    // ✅ 5. ปรับปรุงฟังก์ชันคืนค่าสี ให้รองรับทั้งตัวพิมพ์เล็ก/ใหญ่
    const getStatusStyle = (status) => {
        const safeStatus = (status || "").toLowerCase();
        
        switch (safeStatus) {
            case 'critical':
                return 'bg-red-100 text-red-700 border border-red-400 font-bold';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-400 font-bold';
            case 'normal':
            case 'stable':
                return 'bg-green-100 text-green-700 border border-green-400 font-bold';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-300';
        } 
    };

    // Delete Button
    const { mutate: deleteElder, isPending } = ApiDelete('elder', onDeleteSuccess); 

    const handleDeleteClick = (elderId, event) => {
        event.stopPropagation(); 
        showConfirm("ยืนยันลบข้อมูล", `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้สูงอายุรหัส: ${elderId}?`).then((isConfirmed) => {
            if (isConfirmed) {
                deleteElder(elderId); 
                showPopup("สำเร็จ", "ลบข้อมูลเรียบร้อยแล้ว", "success");
            }
        });
    };

    const handleEditClick = (cardData, event) => {
        event.stopPropagation();
        onEdit(cardData); 
    };

    const handleSettingClick = (elderId, event) => {
        event.stopPropagation();
        if (onSetting) onSetting(elderId); 
    };

    return(
        <>
            <div className="overflow-auto rounded-lg shadow">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-400">
                        <tr>
                            <th className="table-header w-16 text-center">ลำดับ</th>
                            <th className="table-header">รหัส</th>
                            <th className="table-header">ชื่อ</th>
                            <th className="table-header">อายุ</th>
                            <th className="table-header">ข้อมูลสุขภาพ</th>
                            <th className="table-header text-center">สถานะ</th>
                            <th className="table-header">แบตเตอรี่</th>
                            <th className="table-header">อัพดตข้อมูลล่าสุด</th>
                            {showActions && <th className="table-header">เมนู</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100"> 
                        {data.map((card, index) => (
                            <ElderlyRow 
                                key={card.elder_id || index}
                                card={card}
                                index={index}
                                onRowClick={onRowClick}
                                handleEditClick={handleEditClick}
                                handleSettingClick={handleSettingClick}
                                handleDeleteClick={handleDeleteClick}
                                isPending={isPending}
                                showActions={showActions}
                                getStatusStyle={getStatusStyle}   // ส่งฟังก์ชันสีลงไป
                                calculateStatus={calculateStatus} // ส่งฟังก์ชันหมอจำลองลงไป
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default ElderlyDataTable;