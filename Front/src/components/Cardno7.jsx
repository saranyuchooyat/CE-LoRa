import Cardno6Info from "./Cardno6Info";
function Cardno7({data}){

    return(
        <>
            <div className="flex justify-between h-fit text-center gap-4">
                {data.map((card, index) => (

                    <div key={index} className="card">
                        <div className="mb-2">
                            <p className="text-start font-bold text-[18px]">{card.name}</p>  
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="text-start">
                                <div className="flex justify-between">
                                    <p className="">CPU Usage</p>
                                    <p className="">{card.cpu}</p>
                                </div>
                                <div className="bg-gray-200 rounded-full w-full h-3">
                                    <div className="w-[100px] h-3 bg-red-500 rounded-[10px]"></div>
                                </div>
                            </div>

                            <div className="text-start">
                                <div className="flex justify-between">
                                    <p className="">Memory Usage</p>
                                    <p className="">{card.mem}</p>
                                </div>
                                <div className="bg-gray-200 rounded-full w-full h-3">
                                    <div className="w-[100px] h-3 bg-red-500 rounded-[10px]"></div>
                                </div>
                            </div>

                            <div className="text-start">
                                <div className="flex justify-between">
                                    <p className="">Disk Space</p>
                                    <p className="">{card.disk}</p>
                                </div>
                                <div className="bg-gray-200 rounded-full w-full h-3">
                                    <div className="w-[100px] h-3 bg-red-500 rounded-[10px]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        
        </>
    )
}

export default Cardno7;