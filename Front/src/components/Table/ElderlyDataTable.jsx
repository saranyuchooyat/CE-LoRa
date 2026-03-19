import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../components/API";
import ApiDelete from "../API-Delete";
import { showConfirm, showPopup } from "../../components/Popup";

function ElderlyRow({ card, index, onRowClick, handleEditClick, handleSettingClick, handleDeleteClick, isPending, showActions, statusCheck }) {
    const isOddRow = (index % 2 === 0);
    const rowBgClass = isOddRow ? 'bg-gray-100' : 'bg-gray-50';
    const statusClass = statusCheck(card.health_status);                             
    
    // ดึงข้อมูล Realtime 
    const { data: deviceResponse } = useQuery({
        queryKey: ['deviceData', card.device_id],
        queryFn: () => api.get(`/device_data/${card.device_id}`).then(res => res.data),
        enabled: !!card.device_id,
        refetchInterval: 10000 // Refresh ทุกๆ 10 วิ
    });

    const liveVitals = deviceResponse?.data?.smartwatch_data || card.vitals;
    console.log("liveVitals", liveVitals);

    const lastUpdatedTime = deviceResponse?.data?.updated_at || card.last_updated || "-";
    
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
                <span className={`table-status ${statusClass}`}>{card.health_status}</span>
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

    console.log("table data", data);
    
    const statusCheck = (status) => {
        switch (status) {
                case 'critical':
                    return 'bg-red-100 text-red-700 border border-red-400';
                case 'warning':
                    return 'bg-yellow-100 text-yellow-800 border border-yellow-400';
                case 'stable':
                    return 'bg-green-100 text-green-700 border border-green-400';
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
                // Because ApiDelete takes an ID directly and prefixes the base table name internally, we just pass ID.
                deleteElder(elderId); 
                showPopup("สำเร็จ", "ลบข้อมูลเรียบร้อยแล้ว", "success");
            }
        });
    };
    // Delete Button

    // Edit Button
    const handleEditClick = (cardData, event) => {
        event.stopPropagation();
        onEdit(cardData); // ส่ง data โยนไปให้ modal
    };

    //Setting Button (กำลังพัฒนา)
    const handleSettingClick = (elderId, event) => {
        event.stopPropagation();
        if (onSetting) onSetting(elderId); // ป้องกัน Error หาก onSetting ไม่มีค่า
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
                            <th className="table-header">สถานะ</th>
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
                                statusCheck={statusCheck}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default ElderlyDataTable;