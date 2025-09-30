function Cardno8Info(){
    return(
        <>
            <div className="card w-fit self-center">
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-[18px] font-bold">สถานะอุปกรณ์</p>

                        <div className="bg-gray-200 text-center p-4 rounded-[10px]">
                            <p className="">156</p>
                            <p className="">Mbps Down</p>
                        </div>

                        <div className="bg-gray-200 text-center p-4 rounded-[10px]">
                            <p className="">4</p>
                            <p className="">Mbps Up</p>
                        </div>

                        <div className="bg-gray-200 text-center p-4 rounded-[10px]">
                            <p className="">12ms</p>
                            <p className="">Latency</p>
                        </div>
                        
                        <div className="bg-gray-200 text-center p-4 rounded-[10px]">
                            <p className="">3.3%</p>
                            <p className="">Packet Loss</p>
                        </div>
                    </div>
                </div>
        </>
    )
}

export default Cardno8Info;