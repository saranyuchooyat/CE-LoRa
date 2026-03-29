import ZoneTable from "../table/zoneTable";
import UserTable from "../table/userTable";
import ElderlyDataTable from "../table/elderlyDataTable";

// ✅ 1. เพิ่ม onRowClick มารับค่าตรงนี้ (นอกนั้นโค้ดเดิมจารย์ทั้งหมดครับ ไม่แตะเลย)
function DataTableCard({ data, onEdit, onSetting, onDeleteSuccess, onRowClick, showActions=true }) {

    console.log("dataDataTableCard",data)

    let displayContent = null
    let displayHeader = null

    const isZoneData = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) {
            return false;
        }
        console.log("arr2",'zone_id' in arr[0] && 'zone_name' in arr[0])
        return 'zone_id' in arr[0] && 'zone_name' in arr[0];
    };

    const isStaffData = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) {
        return false;
    }
    console.log("arr3 check:", 'user_id' in arr[0] && 'username' in arr[0]);
    return 'user_id' in arr[0] && 'username' in arr[0];
}

    const isZoneStaffData = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) {
            return false;
        }
        console.log(arr[0])
        console.log("arr4",'name' in arr[0] && 'position' in arr[0])
        return 'name' in arr[0] && 'position' in arr[0];
    }

    const isElderlyData = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) {
            return false;
        }
        // ตรวจสอบว่ามีฟิลด์ที่เฉพาะกับ elderly เช่น elder_id, first_name, age, device_id
        return 'elder_id' in arr[0] && 'first_name' in arr[0] && 'age' in arr[0] && 'device_id' in arr[0];
    }



    if(isZoneData(data)){
        console.log("ZonePass")
        displayContent = <ZoneTable data={data} onEdit={onEdit} onSetting={onSetting} showActions={showActions}/>;
    }
    else if(isStaffData(data)){
        console.log("StaffPass")
        displayContent = <UserTable data={data} onEdit={onEdit} onSetting={onSetting} showActions={showActions}/>;
    }
    else if(isZoneStaffData(data)){
        console.log("ZoneStaffPass")
        displayContent = <UserTable data={data} onEdit={onEdit} onSetting={onSetting} showActions={showActions}/>;
    }
    else if(isElderlyData(data)){
        console.log("ElderlyPass")
        displayContent = <ElderlyDataTable data={data} showActions={showActions} onEdit={onEdit} onSetting={onSetting} onDeleteSuccess={onDeleteSuccess} onRowClick={onRowClick} />
    }

    return(
        <>
            <div className="h-fit mb-4">
                <div className="card flex flex-col justify-start items-center mt-0 pt-0">
                    <p className="m-3 font-bold text-[18px]">{displayHeader}</p>
                    <div className="overflow-y-scroll pr-2 w-full">
                        {displayContent}
                    </div>
                </div>
            </div>
        </>
    )
}

export default DataTableCard;