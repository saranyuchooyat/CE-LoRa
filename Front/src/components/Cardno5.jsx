import CardNotification from "./NotificationCard";

function Cardno5({ data }){
    return(
        <>
            <div className="h-[420px] mb-4">
                <div className="card flex flex-col justify-start items-center">
                    <p className="m-3 font-bold text-[18px]"> System Alerts & Notifications</p>
                    <div className="overflow-y-scroll pr-2 w-full">
                        <CardNotification notidata={data}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Cardno5;