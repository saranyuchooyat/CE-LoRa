import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import ApiDelete from "../API-Delete";

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
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้สูงอายุรหัส: ${elderId}?`)) {
            // Because ApiDelete takes an ID directly and prefixes the base table name internally, we just pass ID.
            deleteElder(elderId); 
        }
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
                        {data.map((card, index) => {
                            const isOddRow = (index % 2 === 0);
                            const rowBgClass = isOddRow ? 'bg-gray-100' : 'bg-gray-50';
                            const statusClass = statusCheck(card.health_status);                             
                            return(
                                // ✅ แก้ไขตรงบรรทัด tr นี้ครับ ให้กดได้และมีเอฟเฟกต์
                                <tr 
                                    key={index} 
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
                                            <span>อัตราการเต้นหัวใจ: <b>{card.vitals?.heart_rate ?? "-"}</b></span>
                                            <span>ความดันโลหิต: <b>{card.vitals?.blood_pressure ?? "-"}</b></span>
                                            <span>SpO₂: <b>{card.vitals?.spo2 ?? "-"}</b></span>
                                            <span>อุณหภูมิ: <b>{card.vitals?.temperature ?? "-"}</b></span>
                                        </div>
                                    </td>
                                    <td className="table-data whitespace-nowrap">
                                        <span className={`table-status ${statusClass}`}>{card.health_status}</span>
                                    </td>
                                    <td className="table-data whitespace-nowrap">{card.battery || "-"}</td>
                                    <td className="table-data whitespace-nowrap">{card.last_updated || "-"}</td>

                                    
                                    {/* Un-commented และแก้ไขส่วนของปุ่ม Menu */}
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
                                    )}</tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default ElderlyDataTable;