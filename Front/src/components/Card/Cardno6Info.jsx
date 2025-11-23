function Cardno6Info(){
    return(
        <>
            <div className="card">
                    <div className="mb-2">
                        <p className="text-start font-bold text-[18px]">Internet Connection</p>
                        <p className="text-start text-[14px]">Primary ISP: AIS Fiber</p>    
                    </div>

                    <div className="grid grid-cols-2 justify-center items-center gap-4">
                        <div className="bg-gray-200 text-center p-4 rounded-[10px]">
                            <p className="">156</p>
                            <p className="">Mbps Down</p>
                        </div>

                        <div className="bg-gray-200 text-center p-4 rounded-[10px]">
                            <p className="">45</p>
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

export default Cardno6Info;