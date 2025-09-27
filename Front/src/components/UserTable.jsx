function UserTable({ data }){

    console.log("table data:", data);

    const getZoneName = (zoneData) => {
        if (!zoneData) {
            return "N/A"; 
        }
        // ถ้าข้อมูล Zone เป็น Object/Array, อาจจะต้องเขียน Logic เพื่อดึงชื่อ Zone ออกมา
        // แต่ถ้า card.zone คือชื่อ Zone อยู่แล้ว ให้ return ค่าเดิม
        return zoneData; 
    };

    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                No User data available.
            </div>
        );
    }

    return(
        <>
            <div className="overflow-auto rounded-lg shadow">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-400">
                        <tr>
                            {/* Thead ใช้ Role และ Zone เป็น Header */}
                            <th className="table-header">User Name</th>
                            <th className="table-header">Role</th>
                            <th className="table-header">Zone</th>
                            <th className="table-header">Menu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100"> 
                        {data.map((card, index) => {
                            const isOddRow = (index % 2 === 0);
                            const rowBgClass = isOddRow ? 'bg-gray-100' : 'bg-gray-200';                             
                            return(
                                <tr key={index} className={rowBgClass}>
                                    <td className="table-data whitespace-nowrap">{card.username}</td>
                                    <td className="table-data whitespace-nowrap">{card.role}</td>
                                    {/* **สำคัญ:** ใช้ card.ZoneName หรือ card.Zone ถ้ามี Key นี้ในข้อมูล */}
                                    <td className="table-data whitespace-wrap w-[200px]">{getZoneName(card.Zone)}</td>
                                    
                                    {/* Un-commented และแก้ไขส่วนของปุ่ม Menu */}
                                    <td className="p-3 text-sm text-left whitespace-nowrap w-fit">
                                        <button className="table-btn hover:bg-main-yellow hover:text-white">Edit</button>
                                        <button className="table-btn hover:bg-green-500 hover:text-white">Setting</button>
                                        <button className="table-btn hover:bg-main-red hover:text-white">Delete</button>
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