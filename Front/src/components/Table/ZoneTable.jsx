import { Link, useNavigate } from 'react-router-dom';
import ApiDelete from '../API-Delete';

function ZoneTable({ data }){

    // console.log("table",data);

    const navigate = useNavigate();

    const handleRowClick = (zoneId) => {
        navigate(`/zone-details/${zoneId}`); 
    };

    const activeUserCheck = (data) =>{
        if(data == 0){
            return 'N/A'
        }
        else
            return data
    }

    const statusCheck = (status) =>{
        console.log("status",status)
        switch (status) {
            case 'Active':
                return 'text-main-blue bg-complete-bg';
            case 'Inactive':
                return 'text-gray-800 bg-gray-300';
            default:
                return 'text-gray-700 bg-gray-200';
        }
    };


    // Delete Button
    const { mutate: deleteZone, isPending } = ApiDelete('zone'); 

    const handleDeleteClick = (zoneId, event) => {
        event.stopPropagation(); 
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ Zone ID: ${zoneId}?`)) {
            deleteZone(zoneId); 
        }
    };
    // Delete Button

    // ตรวจสอบว่า data เป็น Array และมีข้อมูลอยู่หรือไม่
    if (!Array.isArray(data) || data.length === 0) {
        return <p className="p-4 text-center text-gray-500">No Zone data available.</p>;
    }

    return(
        <>
            <div className="overflow-auto rounded-lg shadow">
                <table className="w-full">
                    {/* ... Thead code ... */}
                    <thead className="bg-gray-50 border-b-2 border-gray-400">
                        <tr>
                            {/* ... Table Headers ... */}
                            <th className="table-header">Zone ID</th>
                            <th className="table-header">Zone Name</th>
                            <th className="table-header">Address</th>
                            <th className="table-header">Description</th>
                            <th className="table-header">Status</th>
                            <th className="table-header">Active User</th>
                            <th className="table-header">Menu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100"> 
                        {data.map((card, index) => {
                            // สลับสีแถว: แถวแรก (index 0) จะเป็น bg-white, แถวที่สอง (index 1) เป็น bg-gray-100
                            const isOddRow = (index % 2 === 0);
                            const rowBgClass = isOddRow ? 'bg-gray-100' : 'bg-gray-200'; 
                            
                            const statusClass = statusCheck(card.status);

                            return(
                                <tr 
                                    key={index} 
                                    className={`${rowBgClass} hover:bg-main-blue/10 cursor-pointer transition-colors duration-150`} 
                                    onClick={() => handleRowClick(card.zoneid)}
                                >
                                    {console.log(card)}
                                    <td className="table-data whitespace-nowrap">{card.zoneid}</td>
                                    <td className="table-data whitespace-nowrap">{card.zonename}</td>
                                    <td className="table-data whitespace-wrap w-[200px]">{card.address}</td>
                                    <td className="table-data whitespace-wrap w-[500px]">{card.description}</td>
                                    <td className="table-data whitespace-nowrap">
                                        <span className={`table-status ${statusClass}`}>{card.status}</span>
                                    </td>
                                    <td className="table-data whitespace-nowrap">{activeUserCheck(card.activeuser)}</td>
                                    {/* ... Menu Buttons ... */}
                                    <td className="p-3 text-sm text-left hitespace-nowrap w-fit">
                                        <button className="table-btn hover:bg-main-yellow hover:text-white">Edit</button>
                                        <button className="table-btn hover:bg-green-500 hover:text-white">Setting</button>
                                        <button className="table-btn hover:bg-main-red hover:text-white"
                                                onClick={(event) => handleDeleteClick(card.zoneid, event)}
                                                disabled={isPending} >{isPending ? 'ลบ...' : 'Delete'}</button>
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

export default ZoneTable;