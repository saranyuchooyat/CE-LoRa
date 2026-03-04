import CardNotification from "./NotificationCard";
import ZoneTable from "../Table/ZoneTable";
import ZoneAdminTable from "../Table/ZoneAdminTable";
import UserTable from "../Table/UserTable";
import ElderlyDataTable from "../Table/ElderlyDataTable";


function CardFull({ data, onEdit, onSetting, showActions=true }) {

    console.log("dataCardFull",data)

    let displayContent = null
    let displayHeader = null

    const isNotiData = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) {
            return false;
        }
        console.log("arr1",'id' in arr[0] && 'title' in arr[0])
        return 'id' in arr[0] && 'title' in arr[0];
    };

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
        // ตรวจสอบว่ามีฟิลด์ที่เฉพาะกับ elderly เช่น id, name, age, device_id
        return 'id' in arr[0] && 'name' in arr[0] && 'age' in arr[0] && 'device_id' in arr[0];
    }


    if(isNotiData(data)){
        console.log("NotiPass")
        displayHeader = "System Alerts & Notifications";
        displayContent = <div className="h-[250px]"><CardNotification data={data}/></div>;
    }
    else if(isZoneData(data)){
        console.log("ZonePass")
        displayContent = <ZoneTable data={data} onEdit={onEdit} showActions={showActions}/>;
    }
    else if(isStaffData(data)){
        console.log("StaffPass")
        displayContent = <UserTable data={data} onEdit={onEdit} onSetting={onSetting} showActions={showActions}/>;
    }
    else if(isZoneStaffData(data)){
        console.log("ZoneStaffPass")
        displayContent = <UserTable data={data} showActions={showActions}/>;
    }
    else if(isElderlyData(data)){
        console.log("ElderlyPass")
        displayContent = <ElderlyDataTable data={data} showActions={null}/>
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

export default CardFull;