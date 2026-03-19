import { useLocation } from "react-router-dom";
import { Link, useNavigate } from 'react-router-dom';
import api from '../API';
import ApiDelete from '../API-Delete';

function ZoneTable({ data, onEdit, showActions=true }) {

    const location = useLocation();
    const navigate = useNavigate();

    // ✅ แก้ไข: ใช้ zone_id ให้ตรงกับ Backend
    const handleRowClick = (zoneId) => {
        navigate(`/zone-details/${zoneId}`); 
    };

    const activeUserCheck = (data) =>{
        if(data === 0 || !data){
            return '0' // หรือ 'N/A' ตามความชอบครับ
        }
        return data
    }

    const statusCheck = (status) =>{
        // ✅ ปรับให้รองรับ "active" (ตัวเล็ก) ที่ส่งมาจาก Go
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

    // ✅ แก้ไข: ใช้ zone_id สำหรับการลบ
    const handleDeleteClick = (zoneId, event) => {
        event.stopPropagation(); 
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ Zone ID: ${zoneId}?`)) {
            deleteZone(zoneId); 
        }
    };

    const handleEditClick = (zone, event) => {
        event.stopPropagation();
        if(onEdit){
            onEdit(zone);
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
                                    className={`${rowBgClass} hover:bg-main-blue/10 cursor-pointer transition-colors duration-150`} 
                                    // ✅ แก้ไข: ใช้ card.zone_id
                                    onClick={() => handleRowClick(card.zone_id)}
                                >
                                    <td className="table-data whitespace-nowrap text-center text-gray-600 font-medium">{index + 1}</td>
                                    {/* ✅ เปลี่ยนทุกช่องให้ใช้ Key ที่มี Underscore (_) ตาม Backend */}
                                    <td className="table-data whitespace-nowrap">{card.zone_id}</td>
                                    <td className="table-data whitespace-nowrap">{card.zone_name}</td>
                                    <td className="table-data whitespace-wrap w-[200px]">{card.zone_address}</td>
                                    <td className="table-data whitespace-wrap w-[500px]">{card.description}</td>
                                    <td className="table-data whitespace-nowrap">
                                        <span className={`table-status ${statusClass}`}>{card.status}</span>
                                    </td>
                                    {/* ✅ แก้ไข: ใช้ active_user */}
                                    <td className="table-data whitespace-nowrap">{activeUserCheck(card.active_user)}</td>
                                    
                                    {showActions && (
                                    <td className="p-3 text-sm text-left whitespace-nowrap w-fit">
                                        <button className="table-btn hover:bg-main-yellow hover:text-white"
                                                onClick={(event) => handleEditClick(card, event)}>
                                            แก้ไข</button>
                                        <button className="table-btn hover:bg-green-500 hover:text-white">ตั้งค่า</button>
                                        <button className="table-btn hover:bg-main-red hover:text-white"
                                                // ✅ แก้ไข: ใช้ card.zone_id
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