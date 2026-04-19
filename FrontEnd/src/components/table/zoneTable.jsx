import { useLocation } from "react-router-dom";
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import ApiDelete from '../apiDelete';
import { showConfirm, showPopup } from "../modalForm/popup";

function ZoneTable({ data, onEdit, onSetting, showActions=true }) {

    const location = useLocation();
    const navigate = useNavigate();
    const handleRowClick = (zoneId) => {
        navigate(`/zone-details/${zoneId}`); 
    };

    const activeUserCheck = (data) =>{
        if(data === 0 || !data){
            return '0' 
        }
        return data
    }

    const statusCheck = (status) =>{
        const lowerStatus = status?.toLowerCase();
        switch (lowerStatus) {
            case 'active':
                return 'text-main-blue bg-complete-bg';
            case 'inactive':
                return 'text-gray-800 bg-gray-300';
            default:
                return 'text-gray-700 bg-gray-200';
        }
    };

    const { mutate: deleteZone, isPending } = ApiDelete('zone'); 

    const handleDeleteClick = (zoneId, event) => {
        event.stopPropagation(); 
        showConfirm("ยืนยันลบข้อมูล", `คุณแน่ใจหรือไม่ว่าต้องการลบ Zone ID: ${zoneId}?`).then(isConfirmed => {
            if (isConfirmed) {
                deleteZone(zoneId); 
                showPopup("สำเร็จ", "ลบข้อมูลโซนเรียบร้อยแล้ว", "success");
            }
        });
    };

    const handleEditClick = (zone, event) => {
        event.stopPropagation();
        if(onEdit){
            onEdit(zone);
        }
    };

    const handleSettingClick = (zone, event) => {
        event.stopPropagation();
        if(onSetting){
            onSetting(zone);
        }
    };

    if (!Array.isArray(data) || data.length === 0) {
        return <p className="p-4 text-center text-gray-500">No Zone data available.</p>;
    }

    return(
        <>
            <div className="overflow-auto rounded-lg shadow">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-400">
                        <tr>
                            <th className="table-header w-16 text-center">ลำดับ</th>
                            <th className="table-header">รหัส Zone</th>
                            <th className="table-header">ชื่อ Zone</th>
                            <th className="table-header">ที่อยู่</th>
                            <th className="table-header">คำอธิบาย</th>
                            <th className="table-header">สถานะ</th>
                            <th className="table-header">Active User</th>
                            {showActions && <th className="table-header">เมนู</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100"> 
                        {data.map((card, index) => {
                            const isOddRow = (index % 2 === 0);
                            const rowBgClass = isOddRow ? 'bg-gray-100' : 'bg-gray-200'; 
                            
                            const statusClass = statusCheck(card.status);

                            return(
                                <tr 
                                    key={card.zone_id || index} 
                                     className={`${rowBgClass} cursor-pointer hover:bg-[#ccfccb] transition-colors duration-200`}
                                    onClick={() => handleRowClick(card.zone_id)}
                                >
                                    <td className="table-data whitespace-nowrap text-center text-gray-600 font-medium">{index + 1}</td>
                                    <td className="table-data whitespace-nowrap">{card.zone_id}</td>
                                    <td className="table-data whitespace-nowrap">{card.zone_name}</td>
                                    <td className="table-data whitespace-wrap w-[200px]">{card.zone_address}</td>
                                    <td className="table-data whitespace-wrap w-[500px]">{card.description}</td>
                                    <td className="table-data whitespace-nowrap">
                                        <span className={`table-status ${statusClass}`}>{card.status}</span>
                                    </td>
                                    <td className="table-data whitespace-nowrap">{activeUserCheck(card.active_user)}</td>
                                    
                                    {showActions && (
                                    <td className="p-3 text-sm text-left whitespace-nowrap w-fit">
                                        <button className="table-btn hover:bg-main-yellow hover:text-white"
                                                onClick={(event) => handleEditClick(card, event)}>
                                            แก้ไข</button>
                                        <button className="table-btn hover:bg-green-500 hover:text-white"
                                                onClick={(event) => handleSettingClick(card, event)}>
                                            ตั้งค่า</button>
                                        <button className="table-btn hover:bg-main-red hover:text-white"
                                                onClick={(event) => handleDeleteClick(card.zone_id, event)}
                                                disabled={isPending} >{isPending ? 'ลบ...' : 'ลบ'}</button>
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

export default ZoneTable;