import ServerUsage from "./ServerUsageStatus";

function Cardno4(){
    return(
        <>
            <div className="h-fit">

                <div className="card">
                    <div className="flex flex-rows justify-between mx-3 mb-3">
                        <div className="mt-3 text-start">
                            <p className="font-bold text-[18px]" >Server name</p>
                            <p className="text-[16px]" >xxx.xxx.xxx.xxx</p>
                        </div>

                        <div className="flex flex-cols  items-center mt-3 w-[120px] bg-gray-200 rounded-[10px] h-10">
                            <div className="w-[30px] h-[30px] bg-zinc-400 rounded-full ml-1"></div>
                            <p className="ml-2">Status</p>
                        </div>                                                
                    </div>
                    
                    <ServerUsage/>
                </div>

            </div>
        </>
    )
}

export default Cardno4;