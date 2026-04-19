import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../components/api";
import ApiDelete from "../apiDelete";
import { showConfirm, showPopup } from "../../components/modalForm/popup";


function ElderlyRow({ card, index, onRowClick, handleEditClick, handleSettingClick, handleDeleteClick, isPending, showActions, getStatusStyle, calculateStatus, userRole }) {
    const isOddRow = (index % 2 === 0);
    const rowBgClass = isOddRow ? 'bg-gray-100' : 'bg-gray-50';
    const { data: deviceResponse } = useQuery({
        queryKey: ['deviceData', card.device_id],
        queryFn: () => api.get(`/device_data/${card.device_id}`).then(res => res.data),
        enabled: !!card.device_id,
        refetchInterval: 10000
    });

    const liveVitals = deviceResponse?.data?.smartwatch_data || card.vitals;
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 10000); 
        return () => clearInterval(timer);
    }, []);

    const rawTime = deviceResponse?.data?.timestamp || card.last_updated;
    let lastUpdatedTime = "-";
    if (rawTime) {
        const then = new Date(rawTime);
        if (!isNaN(then.getTime())) {
            const diffMs = now - then;
            const diffSecs = Math.floor(diffMs / 1000);
            const diffMins = Math.floor(diffSecs / 60);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMs < 0 || diffSecs < 60) {
                lastUpdatedTime = "เพิ่งอัปเดต";
            } else if (diffMins < 60) {
                lastUpdatedTime = `${diffMins} นาทีที่แล้ว`;
            } else if (diffHours < 24) {
                lastUpdatedTime = `${diffHours} ชั่วโมงที่แล้ว`;
            } else {
                lastUpdatedTime = `${diffDays} วันที่แล้ว`;
            }
        }
    }
    
    const currentStatus = calculateStatus(liveVitals, card.health_status);
    const statusClass = getStatusStyle(currentStatus);                             
    
    return(
        <tr 
            className={`${rowBgClass} cursor-pointer hover:bg-[#ccfccb] transition-colors duration-200`}
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

                {userRole !== "Zone Staff" && (
                    <button className="table-btn hover:bg-green-500 hover:text-white"
                            onClick={(event) => handleSettingClick(card.elder_id, event)}>
                        ตั้งค่า</button>
                )}

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
    const queryClient = useQueryClient();
    const [userRole, setUserRole] = useState(null);
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [selectedElderForDevice, setSelectedElderForDevice] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUserRole(userData.role);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);
    
    const calculateStatus = (vitals, dbStatus) => {
        if (!vitals) return dbStatus || 'NORMAL';

        const hr = vitals.heart_rate || 0;
        const spo2 = vitals.spo2 || 100;
        const isFallen = vitals.is_fallen === true;
        const isSos = vitals.is_sos_called === true;

        if (isFallen || isSos || (hr > 0 && hr < 40)) {
            return 'CRITICAL';
        }

        if (hr > 120 || (hr < 50 && hr > 0) || (spo2 < 95 && spo2 > 0)) {
            return 'WARNING';
        }

        return 'NORMAL';
    };

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

    const handleSettingClickInternal = (elderId, event) => {
        event.stopPropagation();
        const elder = data.find(e => e.elder_id === elderId);
        if (elder) {
            setSelectedElderForDevice(elder);
            setIsDeviceModalOpen(true);
        }
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
                                handleSettingClick={handleSettingClickInternal}
                                handleDeleteClick={handleDeleteClick}
                                isPending={isPending}
                                showActions={showActions}
                                getStatusStyle={getStatusStyle}   
                                calculateStatus={calculateStatus} 
                                userRole={userRole}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default ElderlyDataTable;