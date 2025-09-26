import CardNotification from "./NotificationCard";
import ZoneTable from "./ZoneTable";

function Cardno5({ data }){
    console.log("data",data)

    let displayContent = null
    let displayHeader = null

    const isNotiData = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) {
            return false;
        }
        return 'id' in arr[0] && 'title' in arr[0];
    };

    const isZoneData = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) {
            return false;
        }
        return 'zoneid' in arr[0] && 'zonename' in arr[0];
    };

    if(isNotiData(data)){
        console.log("NotiPass")
        displayHeader = "System Alerts & Notifications";
        displayContent = <CardNotification data={data}/>;
    }
    else if(isZoneData(data)){
        console.log("ZonePass")
        displayContent = <ZoneTable data={data}/>;
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

export default Cardno5;