function CardServerData({ data }){

    console.log("usesage", data);
    const calculatePercentage = (used, total) => {
        const UNIT_FACTORS = {
            'TB': 1024,   // 1 TB = 1024 GB
            'GB': 1,      // 1 GB = 1 GB (หน่วยพื้นฐาน)
            'MB': 1 / 1024 // 1 MB = 1/1024 GB
        };

        const VALUE_REGEX = /([0-9\.]+)([a-zA-Z]+)/; 

        const convertToGB = (valueString) => {
            const match = valueString.trim().match(VALUE_REGEX);
            
            if (!match) return 0;

            const value = parseFloat(match[1]);
            const unit = match[2].toUpperCase();

            if (UNIT_FACTORS[unit]) {
                return value * UNIT_FACTORS[unit];
            }
            return 0;
        };

        const usedInGB = convertToGB(used);
        const totalInGB = convertToGB(total);

        if (totalInGB === 0) return 0;

        return Math.round((usedInGB / totalInGB) * 100);
    };

    return(
        <>
            <div className="flex justify-between h-fit text-center gap-4">
                {data.map((card, index) => {
                    const cpuPercent = parseFloat(card.cpuUsage);

                    const memoryPercent = calculatePercentage(card.memoryUsed, card.memoryTotal);
                    const diskPercent = calculatePercentage(card.diskUsed, card.diskTotal);

                    return (
                        <div key={index} className="card">
                            <div className="mb-2">
                                <p className="text-start font-bold text-[18px]">{card.name}</p>  
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="text-start">
                                    <div className="flex justify-between">
                                        <p className="">CPU Usage</p>
                                        <p className="">{card.cpuUsage}</p>
                                    </div>
                                    <div className="bg-gray-200 rounded-full w-full h-3">
                                        <div 
                                            style={{ width: `${cpuPercent}%` }} 
                                            className="h-3 bg-red-500 rounded-[10px]"
                                        ></div>
                                    </div>
                                </div>

                                <div className="text-start">
                                    <div className="flex justify-between">
                                        <p className="">Memory Usage</p>
                                        <p className="">{card.memoryUsed} / {card.memoryTotal}</p> 
                                    </div>
                                    <div className="bg-gray-200 rounded-full w-full h-3">
                                        <div 
                                            style={{ width: `${memoryPercent}%` }} 
                                            className="h-3 bg-red-500 rounded-[10px]"
                                        ></div>
                                    </div>
                                </div>

                                <div className="text-start">
                                    <div className="flex justify-between">
                                        <p className="">Disk Space</p>
                                        <p className="">{card.diskUsed} / {card.diskTotal}</p>
                                    </div>
                                    <div className="bg-gray-200 rounded-full w-full h-3">
                                        <div 
                                            style={{ width: `${diskPercent}%` }}
                                            className="h-3 bg-red-500 rounded-[10px]"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    )
}

export default CardServerData;