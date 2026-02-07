import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import ApiDelete from "../API-Delete";

function UserTable({ data, onEdit }){

    console.log("table data", data);
    const location = useLocation();

    //ดึงข้อมูลหลังบ้าน
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
            // 💡 เมื่อบันทึก Token ใหม่แล้ว React Query จะทำการ Refetch ให้อัตโนมัติ
            // เนื่องจากทุก Query จะถูก Trigger เมื่อ Token ถูกบันทึกและ Component Rerender
        }
    }, [location.state]);

    const zoneData = userQueries[0].data || [];
    //ดึงข้อมูลหลังบ้าน

    

    const getZoneName = (userZone,zoneData) => {
        if (!userZone) {
            return "N/A"; 
        }

        const matchedZones = zoneData.filter(zone => userZone.includes(zone.zoneid));

        if(matchedZones.length > 0){
            return matchedZones.map(zone => zone.zonename).join(', ');
        } 
        return "N/A";
    };

    const statusCheck = (status) => {
        console.log("user",status)
        switch (status) {
            case 'Online':
                return 'text-main-blue bg-complete-bg';
            case 'offline':
                return 'text-gray-800 bg-gray-300';
            default:
                return 'text-gray-700 bg-gray-200';
        } 
    };

    // Delete Button
    const { mutate: deleteUser, isPending } = ApiDelete('user'); 

    const handleDeleteClick = (userId, event) => {
        event.stopPropagation(); 
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ User ID: ${userId}?`)) {
            deleteUser(userId); 
        }
    };
    // Delete Button

    // Edit Button (กำลังพัฒนา)
    const handleEditClick = (userId, event) => {
        event.stopPropagation();
        onEdit(userId); // 💡 ส่ง ID กลับไปที่ Component แม่
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
                            {/* Thead ใช้ Role และ Zone เป็น Header */}
                            <th className="table-header">ชื่อ</th>
                            <th className="table-header">ตำแหน่ง</th>
                            <th className="table-header">พื้นที่ดูแล</th>
                            <th className="table-header">เบอร์โทรศัพท์</th>
                            <th className="table-header">สถานะ</th>
                            <th className="table-header">เมนู</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100"> 
                        {data.map((card, index) => {
                            const isOddRow = (index % 2 === 0);
                            const rowBgClass = isOddRow ? 'bg-gray-100' : 'bg-gray-50';
                            const statusClass = statusCheck(card.status);                             
                            return(
                                <tr key={index} className={rowBgClass}>
                                    <td className="table-data whitespace-nowrap">{card.name}</td>
                                    <td className="table-data whitespace-nowrap">{card.role}</td>
                                    {/* **สำคัญ:** ใช้ card.ZoneName หรือ card.Zone ถ้ามี Key นี้ในข้อมูล */}
                                    <td className="table-data whitespace-wrap w-[200px]">{getZoneName(card.zoneids,zoneData)}</td>
                                    <td className="table-data whitespace-nowrap">{card.phone}</td>
                                    <td className="table-data whitespace-nowrap">
                                        <span className={`table-status ${statusClass}`}>{card.status}</span>
                                    </td>
                                    
                                    {/* Un-commented และแก้ไขส่วนของปุ่ม Menu */}
                                    <td className="p-3 text-sm text-left whitespace-nowrap w-fit">
                                        <button className="table-btn hover:bg-main-yellow hover:text-white"
                                                onClick={(event) => handleEditClick(card.userId, event)}>
                                            แก้ไข</button>
                                        <button className="table-btn hover:bg-green-500 hover:text-white">ตั้งค่า</button>
                                        <button className="table-btn hover:bg-main-red hover:text-white"
                                                onClick={(event) => handleDeleteClick(card.userId, event)}
                                                disabled={isPending} >{isPending ? 'ลบ...' : 'ลบ'}</button>
                                    </td>
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