import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import ApiDelete from "../API-Delete";

function UserTable({ data, onEdit, onSetting, showActions = true }) {

    console.log("table data", data);
    const location = useLocation();

    // ดึงข้อมูลโซนจากหลังบ้านเพื่อเอามาจับคู่ชื่อ
    const userQueries = useQueries({
        queries: [
        { queryKey: ['zone'], queryFn: () => api.get('/zones').then(res => res.data) },
        ],
    });

    const isSystemLoading = userQueries.some(query => query.isLoading);
    const isSystemError = userQueries.some(query => query.isError);

    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            localStorage.setItem('token', location.state.token);
        }
    }, [location.state]);

    const zoneData = userQueries[0].data || [];

    // ✅ แก้ไข 1: ปรับฟังก์ชันดึงชื่อโซนให้รองรับ zone_id และ zone_name แบบใหม่
    const getZoneName = (userZoneId, zoneData) => {
        if (!userZoneId) return "N/A"; 

        // กรณีที่ Backend ส่ง zone_id เป็น Array (เช่น [ "Z001", "Z002" ])
        if (Array.isArray(userZoneId)) {
            const matchedZones = zoneData.filter(zone => userZoneId.includes(zone.zone_id));
            if(matchedZones.length > 0){
                return matchedZones.map(zone => zone.zone_name).join(', ');
            }
            return "N/A";
        }

        // กรณีที่ Backend ส่ง zone_id มาเป็น String เดี่ยวๆ (เช่น "Z001")
        const matchedZone = zoneData.find(zone => zone.zone_id === userZoneId);
        return matchedZone ? matchedZone.zone_name : "N/A";
    };

    // ✅ แก้ไข 2: ปรับ Status ให้รองรับตัวพิมพ์เล็ก-ใหญ่ และ active/inactive
    const statusCheck = (status) => {
        if (!status) return 'text-gray-700 bg-gray-200';
        
        const lowerStatus = status.toLowerCase();
        switch (lowerStatus) {
            case 'online':
            case 'active':
                return 'text-main-blue bg-complete-bg';
            case 'offline':
            case 'inactive':
                return 'text-gray-800 bg-gray-300';
            default:
                return 'text-gray-700 bg-gray-200';
        } 
    };

    const { mutate: deleteUser, isPending } = ApiDelete('user'); 

    const handleDeleteClick = (userId, event) => {
        event.stopPropagation(); 
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ User ID: ${userId}?`)) {
            deleteUser(userId); 
        }
    };

    const handleEditClick = (userId, event) => {
        event.stopPropagation();
        onEdit(userId); 
    };

    const handleSettingClick = (userId, event) => {
        event.stopPropagation();
        onSetting(userId); 
    };

    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                No User data available.
            </div>
        );
    }

    if (isSystemLoading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
    }
        
    if (isSystemError) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data!</div>;
    }

    return(
        <>
            <div className="overflow-auto rounded-lg shadow">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-400">
                        <tr>
                            <th className="table-header">ชื่อ</th>
                            <th className="table-header">ตำแหน่ง</th>
                            <th className="table-header">พื้นที่ดูแล</th>
                            <th className="table-header">เบอร์โทรศัพท์</th>
                            <th className="table-header">สถานะ</th>
                            {showActions && <th className="table-header">เมนู</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100"> 
                        {data.map((card, index) => {
                            const isOddRow = (index % 2 === 0);
                            const rowBgClass = isOddRow ? 'bg-gray-100' : 'bg-gray-50';
                            const statusClass = statusCheck(card.account_status || card.status);                            
                            return(
                                // ใช้ card.user_id เป็น Key เพื่อความเสถียร
                                <tr key={card.user_id || index} className={rowBgClass}>
                                    
                                    {/* ✅ แก้ไข 3: เปลี่ยนชื่อ Key เป็นแบบมี Underscore ให้ตรงกับ Backend */}
                                    <td className="table-data whitespace-nowrap">
                                        {card.first_name ? `${card.first_name} ${card.last_name || ''}`.trim() : (card.username || card.name || "ไม่ระบุชื่อ")}
                                    </td>
                                    <td className="table-data whitespace-nowrap">{card.role || card.position}</td>
                                    
                                    {/* ส่ง zone_id ไปหาชื่อโซน */}
                                    <td className="table-data whitespace-wrap w-[200px]">{getZoneName(card.zone_id, zoneData)}</td>
                                    
                                    <td className="table-data whitespace-nowrap">{card.phone || "-"}</td>
                                    <td className="table-data whitespace-nowrap">
                                        <span className={`table-status ${statusClass}`}>{card.account_status || card.status || "-"}</span>
                                    </td>
                                    
                                    {showActions && (
                                    <td className="p-3 text-sm text-left whitespace-nowrap w-fit">
                                        {/* ✅ แก้ไข 4: เปลี่ยน card.userId เป็น card.user_id ในปุ่มกด */}
                                        <button className="table-btn hover:bg-main-yellow hover:text-white"
                                                onClick={(event) => handleEditClick(card.user_id, event)}>
                                            แก้ไข</button>
                                        <button className="table-btn hover:bg-green-500 hover:text-white"
                                                onClick={(event) => handleSettingClick(card.user_id, event)}>
                                            ตั้งค่า</button>
                                        <button className="table-btn hover:bg-main-red hover:text-white"
                                                onClick={(event) => handleDeleteClick(card.user_id, event)}
                                                disabled={isPending} >
                                            {isPending ? 'ลบ...' : 'ลบ'}</button>
                                    </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default UserTable;