function Cardno8Info({data}){
    console.log("device",data)
    return(
        <>
            <div className="card w-fit self-center">
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-[18px] font-bold">สถานะอุปกรณ์</p>

                        <div className="bg-gray-200 text-center p-4 rounded-[10px] w-full">
                            <p className="">{data?.online || 0}</p>
                            <p className="">Online</p>
                        </div>

                        <div className="bg-gray-200 text-center p-4 rounded-[10px] w-full">
                            <p className="">{data?.offline || 0}</p>
                            <p className="">Offline</p>
                        </div>

                        <div className="bg-gray-200 text-center p-4 rounded-[10px] w-full">
                            <p className="">{data?.repair || 0}</p>
                            <p className="">Repair</p>
                        </div>
                        
                        <div className="bg-gray-200 text-center p-4 rounded-[10px] w-full">
                            <p className="">{data?.total || 0}</p>
                            <p className="">Total</p>
                        </div>
                    </div>
                </div>
        </>
    )
}

export default Cardno8Info;