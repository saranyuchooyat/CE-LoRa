import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/api";
import ApiDelete from "../apiDelete";
import { showConfirm, showPopup } from "../../components/modalForm/popup";

function UserTable({ data, onEdit, onSetting, showActions = true }) {

    console.log("table data", data);
    const location = useLocation();

    const userQueries = useQueries({
        queries: [
        { queryKey: ['zone'], queryFn: () => api.get('/zones').then(res => res.data) },
        ],
    });

    const isSystemLoading = userQueries.some(query => query.isLoading);
    const isSystemError = userQueries.some(query => query.isError);

    useEffect(() => {
        const tokenInStorage = sessionStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            sessionStorage.setItem('token', location.state.token);
        }
    }, [location.state]);

    const zoneData = userQueries[0].data || [];

    const getZoneName = (userZoneId, zoneData) => {
        if (!userZoneId) return "N/A"; 

        let zoneArray = [];

        if (Array.isArray(userZoneId)) {
            zoneArray = userZoneId;
        } 
        else if (typeof userZoneId === 'string' && userZoneId.includes(',')) {
            zoneArray = userZoneId.split(',').map(z => z.trim());
        } 
        else if (typeof userZoneId === 'string') {
            zoneArray = [userZoneId];
        } else {
            return "N/A";
        }

        const matchedZones = zoneData.filter(zone => zoneArray.includes(zone.zone_id));
        
        if(matchedZones.length > 0){
            return matchedZones.map(zone => zone.zone_name).join(', ');
        } 
        return "N/A";
    };

    const statusCheck = (status) => {
        if (!status) return 'text-gray-700 bg-gray-200';
        
        const lowerStatus = status.toLowerCase();
        switch (lowerStatus) {
            case 'online':
            case 'active':
                return 'text-green-700 bg-green-100 border border-green-400 font-semibold';
            case 'offline':
            case 'inactive':
                return 'text-gray-600 bg-gray-200 border border-gray-400 font-semibold';
            default:
                return 'text-gray-700 bg-gray-200';
        } 
    };

    const { mutate: deleteUser, isPending } = ApiDelete('user'); 

    const handleDeleteClick = (userId, event) => {
        event.stopPropagation(); 
        showConfirm("ยืนยันลบข้อมูล", `คุณแน่ใจหรือไม่ว่าต้องการลบ User ID: ${userId}?`).then(isConfirmed => {
            if (isConfirmed) {
                deleteUser(userId); 
                showPopup("สำเร็จ", "ลบข้อมูลผู้ใช้งานเรียบร้อยแล้ว", "success");
            }
        });
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
                            <th className="table-header w-16 text-center">ลำดับ</th>
                            <th className="table-header">ชื่อ</th>
                            <th className="table-header">ตำแหน่ง</th>
                            <th className="table-header">พื้นที่ดูแล</th>
                            <th className="table-header">เบอร์โทรศัพท์</th>
                            <th className="table-header text-center">สถานะ</th>
                            {showActions && <th className="table-header">เมนู</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100"> 
                        {data.map((card, index) => {
                            const isOddRow = (index % 2 === 0);
                            const rowBgClass = isOddRow ? 'bg-gray-100' : 'bg-gray-50';
                            
                            const currentStatus = card.is_online ? 'online' : 'offline';
                            const statusClass = statusCheck(currentStatus);                            
                            
                            return(
                                <tr key={card.user_id || index} className={rowBgClass}>
                                    
                                    <td className="table-data whitespace-nowrap text-center text-gray-600 font-medium">{index + 1}</td>
                                    <td className="table-data whitespace-nowrap">
                                        {card.first_name ? `${card.first_name} ${card.last_name || ''}`.trim() : (card.username || card.name || "ไม่ระบุชื่อ")}
                                    </td>
                                    <td className="table-data whitespace-nowrap">
                                        {card.role || card.position}
                                        {card.is_caregiver && (
                                            <span className="ml-1 text-green-600 font-medium text-sm">(Caregiver)</span>
                                        )}
                                    </td>
                                    
                                    <td className="table-data whitespace-wrap w-[200px]">
                                        {getZoneName(card.zone_id || card.zoneids || card.zoneIds, zoneData)}
                                    </td>
                                    
                                    <td className="table-data whitespace-nowrap">{card.phone || "-"}</td>

                                    <td className="table-data whitespace-nowrap text-center">
                                        <span className={`table-status ${statusClass}`}>{currentStatus.toUpperCase()}</span>
                                    </td>
                                    
                                    {showActions && (
                                    <td className="p-3 text-sm text-left whitespace-nowrap w-fit">
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