import CardNotification from "./NotificationCard";
import ZoneTable from "../Table/ZoneTable";
import ZoneAdminTable from "../Table/ZoneAdminTable";
import UserTable from "../Table/UserTable";


function CardFull({ data, onEdit, showActions=true }) {

    console.log("data",data)

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
        console.log("arr3",'userId' in arr[0] && 'name' in arr[0])
        return 'userId' in arr[0] && 'name' in arr[0];
    }

    const isZoneStaffData = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) {
            return false;
        }
        console.log("arr4",'name' in arr[0] && 'position' in arr[0])
        return 'name' in arr[0] && 'position' in arr[0];
    }

    if(isNotiData(data)){
        console.log("NotiPass")
        displayHeader = "System Alerts & Notifications";
        displayContent = <CardNotification data={data}/>;
    }
    else if(isZoneData(data)){
        console.log("ZonePass")
        displayContent = <ZoneTable data={data} onEdit={onEdit} showActions={showActions}/>;
    }
    else if(isStaffData(data)){
        console.log("StaffPass")
        displayContent = <UserTable data={data} onEdit={onEdit} />;
    }
    else if(isZoneStaffData(data)){
        console.log("ZoneStaffPass")
        displayContent = <ZoneAdminTable data={data}/>;
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